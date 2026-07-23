import { useEffect, useState } from "react";
import { api } from "../../services/api";
import Tabela from "../shared/tabela/Tabela";
import Paginacao from "../shared/paginacao/Paginacao";

function ProximasRetiradas() {

  const [pedidos, setPedidos] = useState([]);
  const [dias, setDias] = useState(7);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const getStatus = (status) => {

    if (status === "NAO_INICIADO") {
      return (
        <span className="status naoIniciado">
          Não iniciado
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

    if (status === "PRONTO") {
      return (
        <span className="status pronto">
          Pronto
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

  function buscarProximasRetiradas() {

    api.get("/pedidos/proximas-retiradas", {
      params: {
        dias,
        page: paginaAtual - 1
      }
    })
      .then((response) => {

        setPedidos(response.data?.content ?? []);
        setTotalPaginas(response.data?.totalPages ?? 1);

      })
      .catch((erro) => {

        if (erro.response?.status === 204) {
          setPedidos([]);
          setTotalPaginas(1);
          return;
        }

        console.error("Erro ao buscar próximas retiradas:", erro);

        setPedidos([]);

      });

  }

  useEffect(() => {
    buscarProximasRetiradas();
  }, [dias, paginaAtual]);

  function alterarDias(e) {
    setDias(Number(e.target.value));
    setPaginaAtual(1);
  }

  function irParaPaginaAnterior() {
    setPaginaAtual((atual) => Math.max(1, atual - 1));
  }

  function irParaProximaPagina() {
    setPaginaAtual((atual) => Math.min(totalPaginas, atual + 1));
  }

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
      .map((item) => `${item.quantidade}x ${item.nomeProduto}`)
      .join(", ");

  }

  function tituloDaSecao(dataEntregaISO) {

    if (!dataEntregaISO) {
      return "Sem data";
    }

    const hoje = new Date();
    const dataEntrega = new Date(dataEntregaISO);

    const diffDias = Math.round(
      (dataEntrega.setHours(0, 0, 0, 0) - hoje.setHours(0, 0, 0, 0))
      / (1000 * 60 * 60 * 24)
    );

    if (diffDias === 0) return "Hoje";
    if (diffDias === 1) return "Amanhã";

    return new Date(dataEntregaISO).toLocaleDateString("pt-BR");

  }

  const LIMITE_PEDIDO = 10;
  const LIMITE_CLIENTE = 20;
  const LIMITE_ITENS = 30;

  const formattedSections = (pedidos ?? []).reduce((acc, pedido) => {

    const titulo = tituloDaSecao(pedido.dataEntrega);

    let secao = acc.find((s) => s.title === titulo);

    if (!secao) {
      secao = { title: titulo, rows: [] };
      acc.push(secao);
    }

    const numeroPedido = formatarNumeroPedido(pedido.id);
    const nomeCliente = pedido.cliente?.nome ?? "-";
    const itensTexto = formatarItens(pedido.itens);

    secao.rows.push([
      colunaComTooltip(
        numeroPedido,
        truncarTexto(numeroPedido, LIMITE_PEDIDO)
      ),
      colunaComTooltip(
        nomeCliente,
        truncarTexto(nomeCliente, LIMITE_CLIENTE)
      ),
      colunaComTooltip(
        itensTexto,
        truncarTexto(itensTexto, LIMITE_ITENS)
      ),
      getStatus(pedido.statusProducao?.nome),
      <ion-icon name="chevron-forward-outline"></ion-icon>
    ]);

    return acc;

  }, []);

  return (
    <div className="retiradas-card">

      <div className="retiradas-tempo">

        <h2>Próximas Retiradas</h2>

        <select value={dias} onChange={alterarDias}>
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