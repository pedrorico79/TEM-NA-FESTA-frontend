import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Menu from "../shared/menu/Menu";
import BotaoAdicionar from "../shared/botaoAdicionar/BotaoAdicionar";
import HeaderPedidos from "../pedidos/HeaderPedidos";
import FiltrosPedidos from "../pedidos/FiltrosPedidos";
import ListaPedidos from "../pedidos/ListaPedidos";
import Paginacao from "../shared/paginacao/Paginacao";
import LoadingState from "../shared/LoadingState";

import { api } from "../../services/api";

import "../css/Pedidos.css";

function Pedidos() {
  const navigate = useNavigate();

  const [paginaAtual, setPaginaAtual] = useState(1);
  

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("TODOS");
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
  const [clientes, setClientes] = useState({});
  const [eventos, setEventos] = useState({});
  const [opcoesEventos, setOpcoesEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const handleNavigate = (path) => {
    navigate(path);
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

        const params = {};
        const buscaNormalizada = busca.trim().replace(/^#/, "");
        if (buscaNormalizada) params.busca = buscaNormalizada;
        if (statusFiltro !== "TODOS") params.status = statusFiltro;
        if (eventoFiltro !== "TODOS") params.evento = eventoFiltro;

        const response = await api.get("/pedidos", { params });
        const pedidosRecebidos = response.data ?? [];
        if (!ativa) return;

        setPedidos(pedidosRecebidos);

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
        }
      } finally {
        if (ativa) setCarregando(false);
      }
    }, busca.trim() ? 300 : 0);

    return () => {
      ativa = false;
      clearTimeout(timer);
    };
  }, [busca, statusFiltro, eventoFiltro]);

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

  const totalPaginas = Math.ceil(
    pedidosFiltrados.length / itensPorPagina
  );

  const indiceInicial = (paginaAtual - 1) * itensPorPagina;

  const indiceFinal = indiceInicial + itensPorPagina;

  const pedidosPaginados = pedidosFiltrados.slice(
    indiceInicial,
    indiceFinal
  );

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
              handleNavigate("/NovoPedido")
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
          setStatusFiltro={(valor) => {
            setStatusFiltro(valor);
            setPaginaAtual(1);
          }}
          eventoFiltro={eventoFiltro}
          setEventoFiltro={(valor) => {
            setEventoFiltro(valor);
            setPaginaAtual(1);
          }}
          limparFiltros={() => {
            setBusca("");
            setStatusFiltro("TODOS");
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
