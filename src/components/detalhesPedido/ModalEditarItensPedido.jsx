import { useEffect, useMemo, useState } from "react";
import Modal from "../shared/modal/Modal";
import Tabela from "../shared/tabela/Tabela";
import ModalAdicionarProduto from "../novoPedido/ModalAdicionarProduto";
import { api } from "../../services/api";

function criarItemEdicao(item = {}) {
  const precoUnitario = Number(item.precoUnitario ?? 0);
  // O preço de catálogo é a referência disponível na resposta da API. Como o
  // pedido só persiste o preço final, não há como recuperar outra base histórica.
  const precoBase = Number(item.produto?.precoVenda ?? item.produto?.preco ?? precoUnitario);
  const diferenca = Number((precoUnitario - precoBase).toFixed(2));

  return {
    chave: item.id ?? `novo-${Date.now()}-${Math.random()}`,
    produtoId: item.produto?.id ?? item.produtoId ?? "",
    produtoNome: item.produto?.nome ?? "",
    produtoDescricao: item.produto?.descricao ?? "",
    quantidade: Number(item.quantidade ?? 1),
    precoBase,
    tipoAjuste: diferenca < 0 ? "DESCONTO" : "ACRESCIMO",
    unidadeAjuste: "R$",
    valorAjuste: Math.abs(diferenca),
    observacaoItem: item.observacaoItem ?? "",
  };
}

function ModalEditarItensPedido({ open, itens, onClose, onSalvar }) {
  const [itensEditados, setItensEditados] = useState([]);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [erroProdutos, setErroProdutos] = useState("");

  useEffect(() => {
    if (!open) {
      setModalAdicionarAberto(false);
      return;
    }
    setItensEditados((itens || []).map(criarItemEdicao));
    setBusca("");
    setErro("");
    setErroProdutos("");
    api.get("/produtos", { params: { ativos: true } })
      .then((response) => setProdutos(response.data || []))
      .catch((error) => {
        console.error("Erro ao carregar produtos para o pedido:", error);
        setErroProdutos("Não foi possível carregar os produtos.");
      });
  }, [open, itens]);

  function adicionarProdutos(produtosSelecionados) {
    const novosItens = produtosSelecionados.map(({ produto, quantidade, desconto }) => {
      const preco = Number(produto.precoVenda ?? produto.preco ?? 0);
      const qtd = Number(quantidade || 1);
      const valorDesconto = Number(desconto?.valor || 0);
      const descontoTotal = desconto?.tipo === "%"
        ? preco * qtd * valorDesconto / 100
        : valorDesconto;
      const valorDescontoUnitario = qtd > 0 ? Number((descontoTotal / qtd).toFixed(2)) : 0;

      return criarItemEdicao({
        produto,
        quantidade: qtd,
        precoUnitario: Math.max(0, Number((preco - valorDescontoUnitario).toFixed(2))),
        observacaoItem: "",
      });
    });
    setItensEditados((atuais) => [...atuais, ...novosItens]);
    setModalAdicionarAberto(false);
  }

  function alterarItem(chave, campo, valor) {
    setItensEditados((atuais) => atuais.map((item) => (
      item.chave === chave ? { ...item, [campo]: valor } : item
    )));
  }

  function valorAjusteEmReais(item) {
    const valor = Number(item.valorAjuste || 0);
    return item.unidadeAjuste === "%"
      ? Number((Number(item.precoBase || 0) * valor / 100).toFixed(2))
      : valor;
  }

  function precoFinal(item) {
    const base = Number(item.precoBase || 0);
    const ajuste = valorAjusteEmReais(item);
    const final = item.tipoAjuste === "DESCONTO" ? base - ajuste : base + ajuste;
    return Number(Math.max(0, final).toFixed(2));
  }

  function removerItem(chave) {
    setItensEditados((atuais) => atuais.filter((item) => item.chave !== chave));
  }

  async function submeter(event) {
    event.preventDefault();
    if (!itensEditados.length) {
      setErro("O pedido precisa ter pelo menos um item.");
      return;
    }
    const invalido = itensEditados.some((item) => (
      !item.produtoId || Number(item.quantidade) < 1 ||
      !Number.isFinite(Number(item.precoBase)) || Number(item.precoBase) < 0 ||
      !Number.isFinite(Number(item.valorAjuste)) || Number(item.valorAjuste) < 0 ||
      (item.tipoAjuste === "DESCONTO" && (
        valorAjusteEmReais(item) > Number(item.precoBase) ||
        (item.unidadeAjuste === "%" && Number(item.valorAjuste) > 100)
      ))
    ));
    if (invalido) {
      setErro("Confira o produto, a quantidade e o ajuste de cada item. O desconto não pode ultrapassar o preço base.");
      return;
    }

    setSalvando(true);
    setErro("");
    try {
      await onSalvar(itensEditados.map((item) => ({
        produtoId: Number(item.produtoId),
        quantidade: Number(item.quantidade),
        precoUnitario: precoFinal(item),
        observacaoItem: item.observacaoItem,
      })));
      onClose();
    } catch (error) {
      setErro(error.message || "Não foi possível salvar os itens do pedido.");
    } finally {
      setSalvando(false);
    }
  }

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return itensEditados;
    return itensEditados.filter((item) => (
      item.produtoNome.toLowerCase().includes(termo) ||
      item.produtoDescricao.toLowerCase().includes(termo) ||
      item.observacaoItem.toLowerCase().includes(termo)
    ));
  }, [busca, itensEditados]);

  const total = itensEditados.reduce(
    (soma, item) => soma + precoFinal(item) * Number(item.quantidade || 0),
    0
  );

  const linhas = itensFiltrados.map((item) => {
    const valorFinal = precoFinal(item);
    const subtotal = valorFinal * Number(item.quantidade || 0);

    return [
      <span className="produto-item-edicao">{item.produtoNome || "Produto não informado"}</span>,
      <span
        className="descricao-produto-item-edicao"
        title={item.produtoDescricao || "—"}
      >
        {item.produtoDescricao || "—"}
      </span>,
      <input
        className="campo-descricao-item-edicao"
        aria-label="Observação do item"
        type="text"
        value={item.observacaoItem}
        onChange={(event) => alterarItem(item.chave, "observacaoItem", event.target.value)}
        onMouseDown={(event) => event.stopPropagation()}
      />,
      <div className="ajuste-item-edicao">
        <span className="preco-base-item-edicao">
          Base: R$ {Number(item.precoBase || 0).toFixed(2).replace(".", ",")}
        </span>
        <div className="ajuste-item-controles">
          <div className="ajuste-item-tipo" role="group" aria-label="Tipo de ajuste">
            <button
              type="button"
              className={item.tipoAjuste === "DESCONTO" ? "ativo" : ""}
              aria-pressed={item.tipoAjuste === "DESCONTO"}
              onClick={() => alterarItem(item.chave, "tipoAjuste", "DESCONTO")}
            >
              − Desconto
            </button>
            <button
              type="button"
              className={item.tipoAjuste === "ACRESCIMO" ? "ativo" : ""}
              aria-pressed={item.tipoAjuste === "ACRESCIMO"}
              onClick={() => alterarItem(item.chave, "tipoAjuste", "ACRESCIMO")}
            >
              + Acréscimo
            </button>
          </div>
          <div className="ajuste-item-unidade" role="group" aria-label="Unidade do ajuste">
            {["R$", "%"].map((unidade) => (
              <button
                key={unidade}
                type="button"
                className={item.unidadeAjuste === unidade ? "ativo" : ""}
                aria-pressed={item.unidadeAjuste === unidade}
                onClick={() => alterarItem(item.chave, "unidadeAjuste", unidade)}
              >
                {unidade}
              </button>
            ))}
          </div>
        </div>
        <div className="valor-ajuste-item-edicao">
          <input
            aria-label={`Valor do ajuste por unidade em ${item.unidadeAjuste}`}
            type="number"
            min="0"
            max={item.tipoAjuste === "DESCONTO"
              ? (item.unidadeAjuste === "%" ? 100 : item.precoBase)
              : undefined}
            step={item.unidadeAjuste === "%" ? "0.1" : "0.01"}
            value={item.valorAjuste}
            onChange={(event) => alterarItem(item.chave, "valorAjuste", event.target.value)}
            onMouseDown={(event) => event.stopPropagation()}
            required
          />
          <span>{item.unidadeAjuste}</span>
        </div>
        <span className="preco-final-item-edicao">
          Final: R$ {valorFinal.toFixed(2).replace(".", ",")}
        </span>
      </div>,
      <div className="quantidade-input">
        <input
          aria-label="Quantidade"
          type="number"
          min="1"
          step="1"
          value={item.quantidade}
          onChange={(event) => alterarItem(item.chave, "quantidade", event.target.value)}
          onMouseDown={(event) => event.stopPropagation()}
          required
        />
      </div>,
      `R$ ${subtotal.toFixed(2).replace(".", ",")}`,
      <button
        type="button"
        className="btn-remover-item-pedido"
        onClick={() => removerItem(item.chave)}
        aria-label="Remover item"
        title="Remover item"
        disabled={itensEditados.length === 1}
      >
        <ion-icon name="trash-outline"></ion-icon>
      </button>,
    ];
  });

  return (
    <Modal open={open} onClose={onClose} title="Editar Itens do Pedido">
      <form onSubmit={submeter} className="adicionar-produto-modal modal-editar-itens-pedido">
        <p className="adicionar-produto-descricao">
          Ajuste quantidade, aplique acréscimo ou desconto por unidade e edite a observação. A base é o preço atual do produto; o pedido salva o valor final.
        </p>

        <div className="busca-produtos-modal">
          <ion-icon name="search-outline"></ion-icon>
          <input
            type="text"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Pesquisar item do pedido..."
            aria-label="Pesquisar item do pedido"
          />
        </div>

        <div className="itens-edicao-tabela-wrapper">
          <Tabela
            columns={["PRODUTO", "DESCRIÇÃO", "OBSERVAÇÃO", "AJUSTE", "QTD.", "SUBTOTAL", ""]}
            data={linhas}
          />
          {!itensFiltrados.length && (
            <p className="itens-edicao-vazio">Nenhum item corresponde à pesquisa.</p>
          )}
        </div>

        <button
          type="button"
          className="adicionar-item"
          onClick={() => setModalAdicionarAberto(true)}
        >
          <ion-icon name="add-outline"></ion-icon>
          Adicionar Produtos
        </button>
        {erroProdutos && <p role="alert" className="erro-edicao-pedido">{erroProdutos}</p>}

        <div className="produtos-selecao-info">
          {itensEditados.length} item(ns) no pedido
        </div>
        <p className="total-itens-edicao">Total dos itens: R$ {total.toFixed(2).replace(".", ",")}</p>
        {erro && <p role="alert" className="erro-edicao-pedido">{erro}</p>}

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={salvando}>
            Cancelar
          </button>
          <button type="submit" className="primary-button" disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </form>
      <ModalAdicionarProduto
        open={modalAdicionarAberto}
        produtos={produtos}
        itensSelecionados={[]}
        onClose={() => setModalAdicionarAberto(false)}
        onAdicionar={adicionarProdutos}
      />
    </Modal>
  );
}

export default ModalEditarItensPedido;
