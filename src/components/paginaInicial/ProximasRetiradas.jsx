import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../../services/api";

import Tabela from "../shared/tabela/Tabela";

import Paginacao from "../shared/paginacao/Paginacao";

function ProximasRetiradas() {
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState([]);
  const [dias, setDias] = useState(7);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [clientes, setClientes] = useState({});

  const ITENS_POR_PAGINA = 7;

  const getStatus = (status) => {

  if (status === "RASCUNHO") {
    return (
      <span className="status rascunho">
        Rascunho
      </span>
    );
  }

  if (status === "AGUARDANDO_SINAL") {
    return (
      <span className="status aguardandoSinal">
        Aguardando sinal
      </span>
    );
  }

  if (status === "CONFIRMADO") {
    return (
      <span className="status confirmado">
        Confirmado
      </span>
    );
  }

  if (status === "EM_PRODUCAO") {
    return (
      <span className="status emProducao">
        Em produção
      </span>
    );
  }

  if (status === "PRONTO_PARA_ENTREGA") {
    return (
      <span className="status pronto">
        Pronto para entrega
      </span>
    );
  }

  if (status === "ENTREGUE") {
    return (
      <span className="status entregue">
        Entregue
      </span>
    );
  }

  if (status === "CANCELADO") {
    return (
      <span className="status cancelado">
        Cancelado
      </span>
    );
  }

  return (
    <span className="status">
      {status}
    </span>
  );
};

  async function buscarProximasRetiradas() {
    try {
      const response = await api.get("/pedidos/proximas-retiradas", {
        params: {
          dias
        }
      });

      const pedidosRecebidos = response.data ?? [];

      setPedidos(pedidosRecebidos);
      setPaginaAtual(1);

      // Pega apenas os IDs dos clientes
      const clienteIds = [
        ...new Set(
          pedidosRecebidos
            .map((pedido) => pedido.clienteId)
            .filter((id) => id != null)
        )
      ];

      // Busca os clientes
      const respostasClientes = await Promise.all(
        clienteIds.map((id) =>
          api.get(`/clientes/${id}`)
        )
      );

      // Cria um mapa: { 1: cliente, 2: cliente, ... }
      const clientesMap = {};

      respostasClientes.forEach((resposta) => {
        const cliente = resposta.data;
        clientesMap[cliente.id] = cliente;
      });

      setClientes(clientesMap);
    } catch (erro) {
      if (erro.response?.status === 204) {
        setPedidos([]);
        setClientes({});
        return;
      }

      console.error(
        "Erro ao buscar próximas retiradas:",
        erro
      );

      setPedidos([]);
      setClientes({});
    }
  }

  useEffect(() => {
    buscarProximasRetiradas();
  }, [dias]);

  function alterarDias(e) {
    setDias(Number(e.target.value));
    setPaginaAtual(1);
  }

  function irParaPaginaAnterior() {
    setPaginaAtual((atual) => Math.max(1, atual - 1));
  }

  const totalPaginas = Math.max(
    1,
    Math.ceil(pedidos.length / ITENS_POR_PAGINA)
  );

  function irParaProximaPagina() {
    setPaginaAtual((atual) =>
      Math.min(totalPaginas, atual + 1)
    );
  }

  // Pega somente os pedidos da página atual
  const pedidosDaPagina = pedidos.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  );

  function truncarTexto(texto, limite) {
    if (!texto) {
      return "-";
    }

    if (texto.length <= limite) {
      return texto;
    }

    return `${texto.slice(0, limite)}...`;
  }

  function colunaComTooltip(textoCompleto, textoExibido) {
    return (
      <span title={textoCompleto}>
        {textoExibido}
      </span>
    );
  }

  function formatarNumeroPedido(id) {
    return `#${String(id).padStart(3, "0")}`;
  }

  function formatarItens(itens) {
    if (!itens || itens.length === 0) {
      return "-";
    }

    return itens
      .map(
        (item) =>
          `${item.quantidade}x ${item.produto?.nome ?? "-"}`
      )
      .join(", ");
  }

  function tituloDaSecao(dataEntregaISO) {
    if (!dataEntregaISO) {
      return "Sem data";
    }

    const hoje = new Date();
    const dataEntrega = new Date(dataEntregaISO);

    const diffDias = Math.round(
      (
        dataEntrega.setHours(0, 0, 0, 0) -
        hoje.setHours(0, 0, 0, 0)
      ) /
        (1000 * 60 * 60 * 24)
    );

    if (diffDias === 0) return "Hoje";

    if (diffDias === 1) return "Amanhã";

    return new Date(dataEntregaISO).toLocaleDateString(
      "pt-BR"
    );
  }

  const LIMITE_PEDIDO = 10;
  const LIMITE_CLIENTE = 20;
  const LIMITE_ITENS = 30;

  // A paginação acontece ANTES de montar as seções
  const formattedSections = (pedidosDaPagina ?? []).reduce(
    (acc, pedido) => {
      const titulo = tituloDaSecao(pedido.dataEntrega);

      let secao = acc.find(
        (s) => s.title === titulo
      );

      if (!secao) {
        secao = {
          title: titulo,
          rows: [],
          rowIds: []
        };

        acc.push(secao);
      }

      const numeroPedido = formatarNumeroPedido(pedido.id);

      const cliente = clientes[pedido.clienteId];

      const nomeCliente = cliente?.nome ?? "-";

      const itensTexto = formatarItens(pedido.itens);

      secao.rows.push([
        colunaComTooltip(
          numeroPedido,
          truncarTexto(
            numeroPedido,
            LIMITE_PEDIDO
          )
        ),

        colunaComTooltip(
          nomeCliente,
          truncarTexto(
            nomeCliente,
            LIMITE_CLIENTE
          )
        ),

        colunaComTooltip(
          itensTexto,
          truncarTexto(
            itensTexto,
            LIMITE_ITENS
          )
        ),

        getStatus(pedido.statusProducao),

        <ion-icon
          name="chevron-forward-outline"
        ></ion-icon>
      ]);

      // Guarda o ID correspondente à linha
      secao.rowIds.push(pedido.id);

      return acc;
    },
    []
  );

  function handleRowClick(rowIndex) {
    // Procura em qual seção está a linha clicada
    let contador = 0;

    for (const secao of formattedSections) {
      if (
        rowIndex >= contador &&
        rowIndex < contador + secao.rowIds.length
      ) {
        const indiceNaSecao = rowIndex - contador;

        const pedidoId =
          secao.rowIds[indiceNaSecao];

        navigate(
          `/DetalhesPedido/${encodeURIComponent(pedidoId)}`
        );

        return;
      }

      contador += secao.rowIds.length;
    }
  }

  return (
    <div className="retiradas-card">
      <div className="retiradas-tempo">
        <h2>Próximas Retiradas</h2>

        <select
          value={dias}
          onChange={alterarDias}
        >
          <option value={7}>7 dias</option>
          <option value={15}>15 dias</option>
          <option value={30}>30 dias</option>
        </select>
      </div>

      <div className="tabela-wrapper">
        <Tabela
          columns={[
            "#PEDIDO",
            "CLIENTE",
            "ITENS",
            "STATUS",
            ""
          ]}
          sections={formattedSections}
          onRowClick={handleRowClick}
        />
      </div>

      <Paginacao
        paginaAtual={paginaAtual}
        totalPaginas={totalPaginas}
        onAnterior={irParaPaginaAnterior}
        onProximo={irParaProximaPagina}
      />
    </div>
  );
}

export default ProximasRetiradas;