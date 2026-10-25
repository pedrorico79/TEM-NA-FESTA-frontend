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

function Pedidos() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filtroDaUrl = searchParams.get("filtro");
  const filtrosDisponiveis = [
    "ATIVOS",
    "PAGAMENTOS_PENDENTES",
    "AGUARDANDO_SINAL",
    "CONFIRMADO",
    "EM_PRODUCAO",
    "PRONTO_PARA_ENTREGA",
    "ENTREGUE"
  ];

  const [paginaAtual, setPaginaAtual] = useState(1);
  

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState(
    filtrosDisponiveis.includes(filtroDaUrl) ? filtroDaUrl : "TODOS"
  );
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
  const [carregando, setCarregando] = useState(true);
  const [erroPedidos, setErroPedidos] = useState("");

  const handleNavigate = (path) => {
    navigate(path);
  };

  const alterarStatusFiltro = (valor) => {
    setStatusFiltro(valor);
    setPaginaAtual(1);
    const novosParametros = new URLSearchParams(searchParams);
    novosParametros.delete("filtro");
    if (valor !== "TODOS") novosParametros.set("filtro", valor);
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
    const timer = setTimeout(async () => {
      try {
        setCarregando(true);
        setErroPedidos("");

        const params = {};
        const buscaNormalizada = busca.trim().replace(/^#/, "");
        if (buscaNormalizada) params.busca = buscaNormalizada;
        if (statusFiltro === "PAGAMENTOS_PENDENTES") {
          params.pagamentoPendente = true;
        } else if (statusFiltro === "ATIVOS") {
          params.ativos = true;
        } else if (statusFiltro !== "TODOS") {
          params.status = statusFiltro;
        }
        if (eventoFiltro !== "TODOS") params.evento = eventoFiltro;
        params.page = paginaAtual - 1;
        params.size = itensPorPagina;

        const response = await api.get("/pedidos", { params });
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
  }, [busca, statusFiltro, eventoFiltro, paginaAtual, itensPorPagina]);

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

  const calcularRestante = (dataEntrega) => {
    if (!dataEntrega) return "";

    const hoje = new Date();
    const entrega = new Date(dataEntrega);

    hoje.setHours(0, 0, 0, 0);
    entrega.setHours(0, 0, 0, 0);

    const diferenca =
      Math.ceil(
        (entrega - hoje) / (1000 * 60 * 60 * 24)
      );

    if (diferenca < 0) {
      return `${Math.abs(diferenca)}d atrasado`;
    }

    if (diferenca === 0) {
      return "0d restante";
    }

    return `${diferenca}d restante`;
  };

  const pedidoEstaAtrasado = (pedido) => {
    if (!pedido.dataEntrega || ["ENTREGUE", "CANCELADO"].includes(pedido.statusProducao)) return false;
    const hoje = new Date();
    const entrega = new Date(pedido.dataEntrega);
    hoje.setHours(0, 0, 0, 0);
    entrega.setHours(0, 0, 0, 0);
    return entrega < hoje;
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

      restante: calcularRestante(pedido.dataEntrega),

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
          <HeaderPedidos />

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
          statusFiltro={statusFiltro}
          setStatusFiltro={alterarStatusFiltro}
          eventoFiltro={eventoFiltro}
          setEventoFiltro={(valor) => {
            setEventoFiltro(valor);
            setPaginaAtual(1);
          }}
          limparFiltros={() => {
            setBusca("");
            alterarStatusFiltro("TODOS");
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
