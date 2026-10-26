import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Menu from "../shared/menu/Menu";
import BotaoAdicionar from "../shared/botaoAdicionar/BotaoAdicionar";
import HeaderPedidos from "../pedidos/HeaderPedidos";
import FiltrosPedidos from "../pedidos/FiltrosPedidos";
import ListaPedidos from "../pedidos/ListaPedidos";
import Paginacao from "../shared/paginacao/Paginacao";
import LoadingState from "../shared/LoadingState";
import EstadoErro from "../shared/EstadoErro";

import { api } from "../../services/api";

import "../css/Pedidos.css";

const STATUS_PEDIDOS_OPERACIONAIS = [
  "AGUARDANDO_SINAL",
  "CONFIRMADO",
  "EM_PRODUCAO",
  "PRONTO_PARA_ENTREGA",
];

function pedidoEstaAtrasado(pedido) {
  if (!pedido?.dataEntrega || !STATUS_PEDIDOS_OPERACIONAIS.includes(pedido.statusProducao)) return false;
  const hoje = new Date();
  const hojeLocal = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
  const dataRetiradaLocal = String(pedido.dataEntrega).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(dataRetiradaLocal) && dataRetiradaLocal < hojeLocal;
}

function pedidoTemPagamentoPendente(pedido) {
  if (pedido?.statusProducao !== "ENTREGUE") return false;
  const total = Number(pedido.valorTotal ?? 0);
  const recebido = (Array.isArray(pedido.pagamentos) ? pedido.pagamentos : [])
    .filter((pagamento) => pagamento.statusPagamento === "CONFIRMADO")
    .reduce((soma, pagamento) => soma + Number(pagamento.valor ?? 0), 0);
  return total > recebido;
}

function calcularDiasAteEntrega(dataEntrega) {
  const data = String(dataEntrega ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return null;
  const [ano, mes, dia] = data.split("-").map(Number);
  const entregaUtc = Date.UTC(ano, mes - 1, dia);
  const hoje = new Date();
  const hojeUtc = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.round((entregaUtc - hojeUtc) / 86400000);
}

function Pedidos() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filtrosDisponiveis = [
    "ATIVOS",
    "PAGAMENTOS_PENDENTES",
    "ATRASADOS",
    "AGUARDANDO_SINAL",
    "CONFIRMADO",
    "EM_PRODUCAO",
    "PRONTO_PARA_ENTREGA",
    "ENTREGUE"
  ];

  const [paginaAtual, setPaginaAtual] = useState(1);
  

  const [busca, setBusca] = useState("");
  const [statusFiltros, setStatusFiltros] = useState(() => {
    const filtrosDaUrl = searchParams.getAll("filtro");
    return filtrosDaUrl.filter((filtro) => filtrosDisponiveis.includes(filtro));
  });
  const [eventoFiltro, setEventoFiltro] = useState("TODOS");
  const [ordem, setOrdem] = useState("PEDIDO");
  const [ordemCrescente, setOrdemCrescente] = useState(true);

  // Começa sempre na visualização em grade
  const [modoVisualizacao, setModoVisualizacao] = useState("grid");

  const itensPorPagina = modoVisualizacao === "list" ? 8 : 6;

  useEffect(() => {
  setPaginaAtual(1);
}, [modoVisualizacao]);

  const [pedidos, setPedidos] = useState([]);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [clientes, setClientes] = useState({});
  const [eventos, setEventos] = useState({});
  const [opcoesEventos, setOpcoesEventos] = useState([]);
  const [resumoPedidos, setResumoPedidos] = useState({ emProducao: null, atrasados: null, pagamentosPendentes: null, pagamentosPendentesEntregues: null });
  const [carregando, setCarregando] = useState(true);
  const [erroPedidos, setErroPedidos] = useState("");

  const handleNavigate = (path) => {
    navigate(path);
  };

  const alterarStatusFiltros = (valores) => {
    const filtrosValidos = [...new Set(valores)].filter((filtro) => filtrosDisponiveis.includes(filtro));
    setStatusFiltros(filtrosValidos);
    setPaginaAtual(1);
    const novosParametros = new URLSearchParams(searchParams);
    novosParametros.delete("filtro");
    filtrosValidos.forEach((filtro) => novosParametros.append("filtro", filtro));
    setSearchParams(novosParametros, { replace: true });
  };

  useEffect(() => {
    api.get("/eventos")
      .then((response) => {
        const listaEventos = response.data ?? [];
        setOpcoesEventos(listaEventos);
        setEventos(
          Object.fromEntries(
            listaEventos.map((evento) => [evento.id, evento])
          )
        );
      })
      .catch((error) => console.error("Erro ao buscar eventos:", error));
  }, []);

  useEffect(() => {
    let ativa = true;

    api.get("/pedidos/count-by-status")
      .then((response) => {
        const contagens = response.data;
        if (!ativa || !contagens || typeof contagens !== "object") return;
        setResumoPedidos((atual) => ({
          ...atual,
          emProducao: Number(contagens.EM_PRODUCAO ?? 0),
          pagamentosPendentes: Number(contagens.PAGAMENTOS_PENDENTES ?? 0),
        }));
      })
      .catch((error) => console.error("Erro ao carregar o resumo dos pedidos:", error));

    api.get("/pedidos", { params: { atrasados: true, page: 0, size: 1 } })
      .then((response) => {
        if (!ativa) return;
        setResumoPedidos((atual) => ({
          ...atual,
          atrasados: Number(response.data?.totalElements ?? 0),
        }));
      })
      .catch((error) => console.error("Erro ao carregar a contagem de pedidos atrasados:", error));

    api.get("/pedidos", { params: { status: "ENTREGUE", pagamentoPendente: true, page: 0, size: 1 } })
      .then((response) => {
        if (!ativa) return;
        setResumoPedidos((atual) => ({
          ...atual,
          pagamentosPendentesEntregues: Number(response.data?.totalElements ?? 0),
        }));
      })
      .catch((error) => console.error("Erro ao contar pedidos entregues com pagamento pendente:", error));

    return () => { ativa = false; };
  }, []);

  useEffect(() => {
    let ativa = true;
    const timer = setTimeout(async () => {
      try {
        setCarregando(true);
        setErroPedidos("");

        const params = {};
        const buscaNormalizada = busca.trim().replace(/^#/, "");
        if (buscaNormalizada) params.busca = buscaNormalizada;
        const filtrosEspeciais = new Set(["ATIVOS", "PAGAMENTOS_PENDENTES", "ATRASADOS"]);
        const statusSelecionados = statusFiltros.filter((filtro) => !filtrosEspeciais.has(filtro));
        // O endpoint recebe uma lista de enums. Parâmetros repetidos evitam
        // depender da conversão de uma string CSV pelo Spring.
        if (statusSelecionados.length) params.status = statusSelecionados;
        if (statusFiltros.includes("PAGAMENTOS_PENDENTES")) params.pagamentoPendente = true;
        if (statusFiltros.includes("ATIVOS")) params.ativos = true;
        if (statusFiltros.includes("ATRASADOS")) params.atrasados = true;
        if (eventoFiltro !== "TODOS") params.evento = eventoFiltro;
        params.page = paginaAtual - 1;
        params.size = itensPorPagina;

        const response = await api.get("/pedidos", {
          params,
          paramsSerializer: {
            serialize: (valores) => {
              const query = new URLSearchParams();
              Object.entries(valores).forEach(([chave, valor]) => {
                if (Array.isArray(valor)) {
                  valor.forEach((item) => query.append(chave, String(item)));
                } else if (valor != null) {
                  query.append(chave, String(valor));
                }
              });
              return query.toString();
            },
          },
        });
        const paginaResposta = response.data;
        const pedidosRecebidos = Array.isArray(paginaResposta?.content)
          ? paginaResposta.content
          : Array.isArray(paginaResposta) ? paginaResposta : [];
        if (!ativa) return;

        setPedidos(pedidosRecebidos);
        setTotalPaginas(Number.isFinite(paginaResposta?.totalPages)
          ? paginaResposta.totalPages
          : Math.ceil(pedidosRecebidos.length / itensPorPagina));

        const clienteIds = [
          ...new Set(
            pedidosRecebidos
              .map((pedido) => pedido.clienteId)
              .filter((id) => id != null)
          )
        ];

        const clientesMap = {};

        await Promise.all(
          clienteIds.map(async (clienteId) => {
            try {
              const clienteResponse = await api.get(
                `/clientes/${clienteId}`
              );

              clientesMap[clienteId] = clienteResponse.data;
            } catch (error) {
              console.error(
                `Erro ao buscar cliente ${clienteId}:`,
                error
              );
            }
          })
        );

        if (ativa) {
          setClientes(clientesMap);
        }
      } catch (error) {
        if (ativa) {
          console.error("Erro ao buscar pedidos:", error);
          setPedidos([]);
          setTotalPaginas(0);
          setErroPedidos(
            error.response?.data?.message ||
            (error.name === "ApiRespostaFormatoInvalidoError" || error.isApiUnavailable
              ? error.message
              : "") ||
            "Não foi possível carregar os pedidos."
          );
        }
      } finally {
        if (ativa) setCarregando(false);
      }
    }, busca.trim() ? 300 : 0);

    return () => {
      ativa = false;
      clearTimeout(timer);
    };
  }, [busca, statusFiltros, eventoFiltro, paginaAtual, itensPorPagina]);

  useEffect(() => {
    if (totalPaginas === 0 && paginaAtual !== 1) {
      setPaginaAtual(1);
    } else if (totalPaginas > 0 && paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [paginaAtual, totalPaginas]);

  const formatarData = (data) => {
    if (!data) return "";

    const dataObjeto = new Date(data);

    const dia = String(dataObjeto.getDate()).padStart(2, "0");
    const mes = String(dataObjeto.getMonth() + 1).padStart(2, "0");

    return `${dia}/${mes}`;
  };

  const calcularRestante = (pedido) => {
    if (["ENTREGUE", "CANCELADO"].includes(pedido.statusProducao)) return "";

    const dataEntrega = pedido.dataEntrega;
    const diferenca = calcularDiasAteEntrega(dataEntrega);
    if (diferenca == null) return "";

    if (diferenca < 0) {
      const dias = Math.abs(diferenca);
      return `Atrasado há ${dias} ${dias === 1 ? "dia" : "dias"}`;
    }

    if (diferenca === 0) {
      return "0d restante";
    }

    return `${diferenca}d restante`;
  };

  const formatarValor = (valor) => {
    return Number(valor ?? 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  /*
   * Adapta os dados da API para o formato
   * que a ListaPedidos já utiliza.
   */
  const pedidosFormatados = pedidos.map((pedido) => {
    const cliente = clientes[pedido.clienteId];
    const evento = eventos[pedido.eventoId];

    return {
      ...pedido,

      id: `#${pedido.id}`,

      campanha:
        evento?.nome ??
        evento?.descricao ??
        "",

      cliente:
        cliente?.nome ??
        "Cliente não encontrado",

      itens: pedido.itens?.reduce(
        (total, item) => total + item.quantidade,
        0
      ) ?? 0,

      retirada: formatarData(pedido.dataEntrega),

      atrasado: pedidoEstaAtrasado(pedido),

      diasAtraso: Math.max(0, -calcularDiasAteEntrega(pedido.dataEntrega)),

      restante: calcularRestante(pedido),

      pagamentoPendente: pedidoTemPagamentoPendente(pedido),

      total: formatarValor(pedido.valorTotal),

      status: pedido.statusProducao
    };
  });

  const pedidosFiltrados = [...pedidosFormatados].sort((a, b) => {
    if (ordem === "PEDIDO") {
      const numeroA = Number(a.id.replace("#", ""));
      const numeroB = Number(b.id.replace("#", ""));

      return ordemCrescente
        ? numeroA - numeroB
        : numeroB - numeroA;
    }

    if (ordem === "CLIENTE") {
      const resultado = a.cliente.localeCompare(b.cliente, "pt-BR");

      return ordemCrescente ? resultado : -resultado;
    }

    if (ordem === "EVENTO") {
      const resultado = a.campanha.localeCompare(b.campanha, "pt-BR");

      return ordemCrescente ? resultado : -resultado;
    }

    return 0;
  });

  const pedidosPaginados = pedidosFiltrados;

  return (
    <div className="pedidos-layout">
      <Menu active="pedidos" />

      <main className="pedidos-content">
        <div className="pedidos-top">
          <HeaderPedidos
            resumo={resumoPedidos}
            filtrosSelecionados={statusFiltros}
            onFiltrar={(filtro) => alterarStatusFiltros(
              statusFiltros.includes(filtro)
                ? statusFiltros.filter((atual) => atual !== filtro)
                : [...statusFiltros, filtro]
            )}
          />

          <BotaoAdicionar
            text="Novo Pedido"
            size="small"
            onClick={() =>
              handleNavigate("/novo-pedido")
            }
          />
        </div>

        <FiltrosPedidos
          busca={busca}
          setBusca={(valor) => {
            setBusca(valor);
            setPaginaAtual(1);
          }}
          statusFiltros={statusFiltros}
          setStatusFiltros={alterarStatusFiltros}
          eventoFiltro={eventoFiltro}
          setEventoFiltro={(valor) => {
            setEventoFiltro(valor);
            setPaginaAtual(1);
          }}
          limparFiltros={() => {
            setBusca("");
            alterarStatusFiltros([]);
            setEventoFiltro("TODOS");
            setOrdem("PEDIDO");
            setOrdemCrescente(true);
            setPaginaAtual(1);
          }}
          ordem={ordem}
          setOrdem={setOrdem}
          ordemCrescente={ordemCrescente}
          setOrdemCrescente={setOrdemCrescente}
          modoVisualizacao={modoVisualizacao}
          setModoVisualizacao={setModoVisualizacao}
          eventosDisponiveis={opcoesEventos}
        />

        {carregando ? (
          <LoadingState label="Carregando pedidos…" />
        ) : erroPedidos ? (
          <EstadoErro mensagem={erroPedidos} titulo="Não foi possível carregar os pedidos" />
        ) : pedidosFiltrados.length === 0 ? (
          <p className="pedidos-vazio">Nenhum pedido encontrado.</p>
        ) : (
          <>
            <ListaPedidos
              pedidos={pedidosPaginados}
              modoVisualizacao={modoVisualizacao}
            />

            <Paginacao
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas}
              onAnterior={() =>
                setPaginaAtual(paginaAtual - 1)
              }
              onProximo={() =>
                setPaginaAtual(paginaAtual + 1)
              }
            />
          </>
        )}
      </main>
    </div>
  );
}

export default Pedidos;
