import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Menu from "../shared/menu/Menu";
import BotaoAdicionar from "../shared/botaoAdicionar/BotaoAdicionar";
import HeaderPedidos from "../pedidos/HeaderPedidos";
import FiltrosPedidos from "../pedidos/FiltrosPedidos";
import ListaPedidos from "../pedidos/ListaPedidos";

import { api } from "../../services/api";

import "../css/Pedidos.css";

function Pedidos() {
  const navigate = useNavigate();

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("TODOS");
  const [eventoFiltro, setEventoFiltro] = useState("TODOS");
  const [ordem, setOrdem] = useState("PEDIDO");
  const [ordemCrescente, setOrdemCrescente] = useState(true);

  // Começa sempre na visualização em grade
  const [modoVisualizacao, setModoVisualizacao] = useState("grid");

  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState({});
  const [eventos, setEventos] = useState({});
  const [carregando, setCarregando] = useState(true);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const buscarPedidos = async () => {
    try {
      setCarregando(true);

      const response = await api.get("/pedidos");

      const pedidosRecebidos = response.data ?? [];

      setPedidos(pedidosRecebidos);

      // Pega apenas os IDs dos clientes
      const clienteIds = [
        ...new Set(
          pedidosRecebidos
            .map((pedido) => pedido.clienteId)
            .filter((id) => id != null)
        )
      ];

      // Pega apenas os IDs dos eventos
      const eventoIds = [
        ...new Set(
          pedidosRecebidos
            .map((pedido) => pedido.eventoId)
            .filter((id) => id != null)
        )
      ];

      // Busca os clientes
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

      // Busca os eventos
      const eventosMap = {};

      await Promise.all(
        eventoIds.map(async (eventoId) => {
          try {
            const eventoResponse = await api.get(
              `/eventos/${eventoId}`
            );

            eventosMap[eventoId] = eventoResponse.data;
          } catch (error) {
            console.error(
              `Erro ao buscar evento ${eventoId}:`,
              error
            );
          }
        })
      );

      setClientes(clientesMap);
      setEventos(eventosMap);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      setPedidos([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarPedidos();
  }, []);

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

  const pedidosFiltrados = [...pedidosFormatados]
    .filter((pedido) => {
      const textoBusca = busca
        .toLowerCase()
        .trim();

      const correspondeBusca =
        pedido.cliente
          .toLowerCase()
          .includes(textoBusca) ||
        pedido.id
          .toLowerCase()
          .includes(textoBusca);

      const correspondeStatus =
        statusFiltro === "TODOS" ||
        pedido.status === statusFiltro;

      const correspondeEvento =
        eventoFiltro === "TODOS" ||
        pedido.campanha === eventoFiltro;

      return (
        correspondeBusca &&
        correspondeStatus &&
        correspondeEvento
      );
    })
    .sort((a, b) => {
      if (ordem === "PEDIDO") {
        const numeroA = Number(
          a.id.replace("#", "")
        );

        const numeroB = Number(
          b.id.replace("#", "")
        );

        return ordemCrescente
          ? numeroA - numeroB
          : numeroB - numeroA;
      }

      if (ordem === "CLIENTE") {
        const resultado = a.cliente.localeCompare(
          b.cliente,
          "pt-BR"
        );

        return ordemCrescente
          ? resultado
          : -resultado;
      }

      if (ordem === "EVENTO") {
        const resultado = a.campanha.localeCompare(
          b.campanha,
          "pt-BR"
        );

        return ordemCrescente
          ? resultado
          : -resultado;
      }

      return 0;
    });

  return (
    <div className="pedidos-layout">
      <Menu active="pedidos" />

      <main className="pedidos-content">
        <div className="pedidos-top">
          <HeaderPedidos />

          <BotaoAdicionar
            text="Novo Pedido"
            size="small"
            style={{
              marginTop: "40px"
            }}
            onClick={() =>
              handleNavigate("/NovoPedido")
            }
          />
        </div>

        <FiltrosPedidos
          busca={busca}
          setBusca={setBusca}
          statusFiltro={statusFiltro}
          setStatusFiltro={setStatusFiltro}
          eventoFiltro={eventoFiltro}
          setEventoFiltro={setEventoFiltro}
          ordem={ordem}
          setOrdem={setOrdem}
          ordemCrescente={ordemCrescente}
          setOrdemCrescente={setOrdemCrescente}
          modoVisualizacao={modoVisualizacao}
          setModoVisualizacao={setModoVisualizacao}
          pedidos={pedidosFormatados}
        />

        {carregando ? (
          <p>Carregando pedidos...</p>
        ) : (
          <ListaPedidos
            pedidos={pedidosFiltrados}
            modoVisualizacao={modoVisualizacao}
          />
        )}
      </main>
    </div>
  );
}

export default Pedidos;

