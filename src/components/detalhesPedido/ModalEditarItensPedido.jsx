import { useEffect, useMemo, useState } from "react";
import Modal from "../shared/modal/Modal";
import Tabela from "../shared/tabela/Tabela";
import ModalAdicionarProduto from "../novoPedido/ModalAdicionarProduto";
import { api } from "../../services/api";

function criarItemEdicao(item = {}) {
  return {
    chave: item.id ?? `novo-${Date.now()}-${Math.random()}`,
    produtoId: item.produto?.id ?? item.produtoId ?? "",
    produtoNome: item.produto?.nome ?? "",
    produtoDescricao: item.produto?.descricao ?? "",
    quantidade: Number(item.quantidade ?? 1),
    precoUnitario: Number(item.precoUnitario ?? 0),
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
    api.get("/produtos")
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
      const bruto = preco * qtd;
      const valorDesconto = Number(desconto?.valor || 0);
      const descontoTotal = desconto?.tipo === "%"
        ? bruto * valorDesconto / 100
        : valorDesconto;
      const precoUnitario = qtd > 0
        ? Number((Math.max(0, bruto - descontoTotal) / qtd).toFixed(2))
        : preco;

      return criarItemEdicao({
        produto,
        quantidade: qtd,
        precoUnitario,
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
      !item.produtoId || Number(item.quantidade) < 1 || Number(item.precoUnitario) < 0
    ));
    if (invalido) {
      setErro("Confira o produto, a quantidade e o preço de cada item.");
      return;
    }

    setSalvando(true);
    setErro("");
    try {
      await onSalvar(itensEditados.map((item) => ({
        produtoId: Number(item.produtoId),
        quantidade: Number(item.quantidade),
        precoUnitario: Number(item.precoUnitario),
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
    (soma, item) => soma + Number(item.precoUnitario || 0) * Number(item.quantidade || 0),
    0
  );

  const linhas = itensFiltrados.map((item) => {
    const subtotal = Number(item.precoUnitario || 0) * Number(item.quantidade || 0);

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
      <div className="preco-item-edicao">
        <span>R$</span>
        <input
          aria-label="Preço unitário"
          type="number"
          min="0"
          step="0.01"
          value={item.precoUnitario}
          onChange={(event) => alterarItem(item.chave, "precoUnitario", event.target.value)}
          onMouseDown={(event) => event.stopPropagation()}
          required
        />
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
          Ajuste quantidade, preço e observação dos itens ou adicione novos produtos ao pedido.
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
            columns={["PRODUTO", "DESCRIÇÃO", "OBSERVAÇÃO", "VALOR", "QTD.", "SUBTOTAL", ""]}
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
