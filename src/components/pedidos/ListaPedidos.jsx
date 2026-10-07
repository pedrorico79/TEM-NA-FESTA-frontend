import { useNavigate } from "react-router-dom";

import CardPedido from "./CardPedido";
import Tabela from "../shared/tabela/Tabela";

function ListaPedidos({ pedidos, modoVisualizacao }) {
  const navigate = useNavigate();

  const getStatusClass = (status) => {
    const statusNormalizado = status?.trim().toUpperCase();

    if (statusNormalizado === "RASCUNHO") return "rascunho";
    if (statusNormalizado === "AGUARDANDO_SINAL") return "aguardandoSinal";
    if (statusNormalizado === "CONFIRMADO") return "confirmado";
    if (statusNormalizado === "EM_PRODUCAO") return "producao";
    if (statusNormalizado === "PRONTO_PARA_ENTREGA") return "pronto";

    if (statusNormalizado === "ENTREGUE") {
      return "entregue";
    }

    if (statusNormalizado === "CANCELADO") {
      return "cancelado";
    }

    return "";
  };

  const getStatusText = (status) => {
    const statusNormalizado = status?.trim().toUpperCase();

    if (statusNormalizado === "RASCUNHO") return "Rascunho";
    if (statusNormalizado === "AGUARDANDO_SINAL") return "Aguardando Sinal";
    if (statusNormalizado === "CONFIRMADO") return "Confirmado";
    if (statusNormalizado === "EM_PRODUCAO") return "Em Produção";
    if (statusNormalizado === "PRONTO_PARA_ENTREGA") return "Pronto";

    if (statusNormalizado === "ENTREGUE") {
      return "Entregue";
    }

    if (statusNormalizado === "CANCELADO") {
      return "Cancelado";
    }

    return status;
  };

  const isDesativado = (status) => {
    const statusNormalizado = status?.trim().toUpperCase();

    return (
      statusNormalizado === "ENTREGUE" ||
      statusNormalizado === "CANCELADO"
    );
  };

  if (modoVisualizacao === "list") {
    const pedidosPagina = pedidos;

    const columns = [
      "PEDIDO",
      "CLIENTE",
      "EVENTO",
      "ITENS",
      "RETIRADA",
      "TOTAL",
      "STATUS",
      ""
    ];

    const data = pedidosPagina.map((pedido) => [
      pedido.id,

      <div className="pedido-cliente-tabela">
        <span className="pedido-cliente-tabela-nome">
          {pedido.cliente}
        </span>
        <div className="pedido-mobile-meta">
          <span className="pedido-mobile-retirada">
          <ion-icon name="calendar-outline"></ion-icon>
          {pedido.retirada}
          </span>
        </div>
      </div>,

      pedido.campanha,

      <div className="pedido-itens-tabela">
        <span>{pedido.itens} {pedido.itens === 1 ? "item" : "itens"}</span>
        <span className={`pedido-status pedido-status-mobile ${getStatusClass(pedido.status)}`}>
          {getStatusText(pedido.status)}
        </span>
      </div>,

      pedido.retirada,

      pedido.total,

      <span
        className={`pedido-status ${getStatusClass(
          pedido.status
        )}`}
      >
        {getStatusText(pedido.status)}
      </span>,

      <ion-icon
        name="chevron-forward-outline"
        className="pedido-tabela-seta"
      ></ion-icon>
    ]);

    return (
      <div className="lista-pedidos-lista">
        <div className="tabela-pedidos-wrapper">
          <Tabela
            columns={columns}
            data={data}
            onRowClick={(sectionIndex, rowIndex) => {
              const pedido = pedidosPagina[rowIndex];

              if (pedido) {
                navigate(
                  `/DetalhesPedido/${encodeURIComponent(
                    pedido.id
                  )}`
                );
              }
            }}
            rowClassName={(index) => {
              const pedido = pedidosPagina[index];

              return pedido && isDesativado(pedido.status)
                ? "pedido-tabela-desativado"
                : "";
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="lista-pedidos">
      {pedidos.map((pedido) => (
        <CardPedido
          key={pedido.id}
          pedido={pedido}
        />
      ))}
    </div>
  );
}

export default ListaPedidos;
