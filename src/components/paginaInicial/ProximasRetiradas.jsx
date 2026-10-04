import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import { api } from "../../services/api";

import Tabela from "../shared/tabela/Tabela";

import Paginacao from "../shared/paginacao/Paginacao";

function pedidoEstaAtrasado(dataEntrega) {
  if (!dataEntrega) {
    return false;
  }

  const hoje = new Date();
  const data = new Date(dataEntrega);

  hoje.setHours(0, 0, 0, 0);
  data.setHours(0, 0, 0, 0);

  return data < hoje;
}

function ProximasRetiradas() {
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState([]);
  const [dias, setDias] = useState(7);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [clientes, setClientes] = useState({});
  const [diasMenuAberto, setDiasMenuAberto] = useState(false);
  const [posicaoMenuDias, setPosicaoMenuDias] = useState({ top: 0, left: 0, width: 0 });
  const seletorDiasRef = useRef(null);
  const menuDiasRef = useRef(null);

  const ITENS_POR_PAGINA = 4;

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

  useEffect(() => {
    if (!diasMenuAberto) return undefined;

    function fecharAoClicarFora(event) {
      if (
        !seletorDiasRef.current?.contains(event.target) &&
        !menuDiasRef.current?.contains(event.target)
      ) {
        setDiasMenuAberto(false);
      }
    }

    function fecharComEscape(event) {
      if (event.key === "Escape") setDiasMenuAberto(false);
    }

    function fecharAoMoverTela() {
      setDiasMenuAberto(false);
    }

    document.addEventListener("pointerdown", fecharAoClicarFora);
    document.addEventListener("keydown", fecharComEscape);
    document.addEventListener("scroll", fecharAoMoverTela, true);
    window.addEventListener("resize", fecharAoMoverTela);

    return () => {
      document.removeEventListener("pointerdown", fecharAoClicarFora);
      document.removeEventListener("keydown", fecharComEscape);
      document.removeEventListener("scroll", fecharAoMoverTela, true);
      window.removeEventListener("resize", fecharAoMoverTela);
    };
  }, [diasMenuAberto]);

  function abrirMenuDias() {
    if (diasMenuAberto) {
      setDiasMenuAberto(false);
      return;
    }

    const seletor = seletorDiasRef.current;
    if (!seletor) return;

    const retangulo = seletor.getBoundingClientRect();
    const alturaMenu = 3 * 44 + 12;
    const larguraMenu = Math.max(retangulo.width, 140);
    const left = Math.max(
      8,
      Math.min(retangulo.right - larguraMenu, window.innerWidth - larguraMenu - 8)
    );
    const top = retangulo.bottom + alturaMenu + 8 <= window.innerHeight
      ? retangulo.bottom + 6
      : Math.max(8, retangulo.top - alturaMenu - 6);

    setPosicaoMenuDias({ top, left, width: larguraMenu });
    setDiasMenuAberto(true);
  }

  function alterarDias(novosDias) {
    setDias(Number(novosDias));
    setPaginaAtual(1);
    setDiasMenuAberto(false);
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

  hoje.setHours(0, 0, 0, 0);
  dataEntrega.setHours(0, 0, 0, 0);

  const diffDias = Math.round(
    (dataEntrega - hoje) /
      (1000 * 60 * 60 * 24)
  );

  if (diffDias === 0) return "Hoje";
  if (diffDias === 1) return "Amanhã";

  return dataEntrega.toLocaleDateString("pt-BR");
}

  const LIMITE_PEDIDO = 10;
  const LIMITE_CLIENTE = 20;
  const LIMITE_ITENS = 30;

  // A paginação acontece ANTES de montar as seções
  const formattedSections = (pedidosDaPagina ?? []).reduce(
  (acc, pedido) => {
    const titulo = tituloDaSecao(pedido.dataEntrega);
    const atrasada = pedidoEstaAtrasado(pedido.dataEntrega);

    let secao = acc.find(
      (s) => s.sectionKey === titulo
    );

    if (!secao) {
      secao = {
        sectionKey: titulo,

        title: atrasada ? (
          <span className="data-atrasada">
            {titulo}
          </span>
        ) : (
          titulo
        ),

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
    truncarTexto(numeroPedido, LIMITE_PEDIDO)
  ),

  <div className="cliente-pedido">
    <span className="cliente-nome">
      {truncarTexto(nomeCliente, LIMITE_CLIENTE)}
    </span>

    <div className="status-mobile">
      {getStatus(pedido.statusProducao)}

      {pedidoEstaAtrasado(pedido.dataEntrega) && (
        <span
          className="aviso-atrasado"
          title="A retirada deste pedido está atrasada"
        >
          ⚠️ Atrasado
        </span>
      )}
    </div>
  </div>,

  colunaComTooltip(
    itensTexto,
    truncarTexto(itensTexto, LIMITE_ITENS)
  ),

  <div className="status-desktop">
    {getStatus(pedido.statusProducao)}

    {pedidoEstaAtrasado(pedido.dataEntrega) && (
      <span
        className="aviso-atrasado"
        title="A retirada deste pedido está atrasada"
      >
        ⚠️ Atrasado
      </span>
    )}
  </div>,

  <ion-icon name="chevron-forward-outline"></ion-icon>
]);

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

        <button
          ref={seletorDiasRef}
          type="button"
          className="retiradas-periodo"
          onClick={abrirMenuDias}
          aria-haspopup="listbox"
          aria-expanded={diasMenuAberto}
          aria-controls="retiradas-periodo-opcoes"
        >
          <span>{dias} dias</span>
          <ion-icon name="chevron-down-outline"></ion-icon>
        </button>

        {diasMenuAberto && createPortal(
          <div
            ref={menuDiasRef}
            id="retiradas-periodo-opcoes"
            className="retiradas-periodo-opcoes"
            role="listbox"
            aria-label="Período de retiradas"
            style={{
              top: `${posicaoMenuDias.top}px`,
              left: `${posicaoMenuDias.left}px`,
              width: `${posicaoMenuDias.width}px`
            }}
          >
            {[7, 15, 30].map((opcao) => (
              <button
                key={opcao}
                type="button"
                role="option"
                aria-selected={dias === opcao}
                className={dias === opcao ? "selecionado" : ""}
                onClick={() => alterarDias(opcao)}
              >
                {opcao} dias
              </button>
            ))}
          </div>,
          document.body
        )}
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
