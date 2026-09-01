import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import CardPedido from "./CardPedido";
import Tabela from "../shared/tabela/Tabela";
import Paginacao from "../shared/paginacao/Paginacao";

function ListaPedidos({ pedidos, modoVisualizacao }) {
  const navigate = useNavigate();

  const [paginaAtual, setPaginaAtual] = useState(1);

  const itensPorPagina = 7;

  const totalPaginas = Math.max(
    1,
    Math.ceil(pedidos.length / itensPorPagina)
  );

  useEffect(() => {
    setPaginaAtual(1);
  }, [pedidos]);

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [paginaAtual, totalPaginas]);

  const getStatusClass = (status) => {
    const statusNormalizado = status
      ?.trim()
      .toUpperCase();

    if (statusNormalizado === "NAO_INICIADO") {
      return "naoIniciado";
    }

    if (statusNormalizado === "EM_PRODUCAO") {
      return "producao";
    }

    if (statusNormalizado === "PRONTO") {
      return "pronto";
    }

    if (statusNormalizado === "ENTREGUE") {
      return "entregue";
    }

    if (statusNormalizado === "CANCELADO") {
      return "cancelado";
    }

    return "";
  };

  const getStatusText = (status) => {
    const statusNormalizado = status
      ?.trim()
      .toUpperCase();

    if (statusNormalizado === "NAO_INICIADO") {
      return "Não iniciado";
    }

    if (statusNormalizado === "EM_PRODUCAO") {
      return "Em Produção";
    }

    if (statusNormalizado === "PRONTO") {
      return "Pronto";
    }

    if (statusNormalizado === "ENTREGUE") {
      return "Entregue";
    }

    if (statusNormalizado === "CANCELADO") {
      return "Cancelado";
    }

    return status;
  };

  const isDesativado = (status) => {
    const statusNormalizado = status
      ?.trim()
      .toUpperCase();

    return (
      statusNormalizado === "ENTREGUE" ||
      statusNormalizado === "CANCELADO"
    );
  };


  if (modoVisualizacao === "list") {
    const inicio = (paginaAtual - 1) * itensPorPagina;

    const pedidosPagina = pedidos.slice(
      inicio,
      inicio + itensPorPagina
    );

    console.log("ENTROU NA LISTA");
    console.log("PEDIDOS DA TABELA:", pedidosPagina);

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

      pedido.cliente,

      pedido.campanha,

      `${pedido.itens} itens`,

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

              console.log(
                "STATUS DA LINHA:",
                pedido?.id,
                pedido?.status,
                isDesativado(pedido?.status)
              );

              return pedido && isDesativado(pedido.status)
                ? "pedido-tabela-desativado"
                : "";
            }}
          />
        </div>

        <div className="paginacao-pedidos">
          <Paginacao
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
            onAnterior={() =>
              setPaginaAtual((atual) =>
                Math.max(1, atual - 1)
              )
            }
            onProximo={() =>
              setPaginaAtual((atual) =>
                Math.min(totalPaginas, atual + 1)
              )
            }
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