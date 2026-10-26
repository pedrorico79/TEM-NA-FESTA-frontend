import { useEffect, useMemo, useState } from "react";
import Modal from "../shared/modal/Modal";
import Tabela from "../shared/tabela/Tabela";
import FiltroDropdown from "../pedidos/FiltroDropdown";
import ModalAdicionarProduto from "../novoPedido/ModalAdicionarProduto";
import { api } from "../../services/api";

function valorAjusteVisivel(valor) {
  return Number(valor || 0) === 0 ? "" : valor;
}

function criarItemEdicao(item = {}) {
  const precoUnitario = Number(item.precoUnitario ?? 0);
  // Mantém o preço unitário gravado no pedido; o acréscimo fica em campo separado.
  const precoBase = precoUnitario;
  const acrescimoLinha = Number(item.acrescimo ?? 0);

  return {
    chave: item.id ?? `novo-${Date.now()}-${Math.random()}`,
    itemId: item.id ?? null,
    produtoId: item.produto?.id ?? item.produtoId ?? "",
    produtoNome: item.produto?.nome ?? "",
    produtoDescricao: item.produto?.descricao ?? "",
    quantidade: Number(item.quantidade ?? 1),
    precoBase,
    unidadeAjuste: "R$",
    valorAjuste: valorAjusteVisivel(acrescimoLinha > 0
      ? Number((acrescimoLinha / Math.max(1, Number(item.quantidade ?? 1))).toFixed(2))
      : ""),
    observacaoItem: item.observacaoItem ?? "",
    grupoObservacaoId: item.grupoObservacaoId ?? null,
    linhaObservacaoPrincipal: Boolean(item.linhaObservacaoPrincipal),
  };
}

function agruparVariacoesObservacao(itens) {
  const quantidades = new Map();
  itens.forEach((item) => {
    const id = String(item.produtoId);
    quantidades.set(id, (quantidades.get(id) || 0) + 1);
  });
  const principais = new Set();
  return itens.map((item) => {
    const id = String(item.produtoId);
    if ((quantidades.get(id) || 0) < 2) {
      const { grupoObservacaoId, linhaObservacaoPrincipal, ...semGrupo } = item;
      return semGrupo;
    }
    const principal = !principais.has(id);
    principais.add(id);
    return {
      ...item,
      grupoObservacaoId: `produto-${id}`,
      linhaObservacaoPrincipal: principal,
    };
  });
}

function ModalEditarItensPedido({ open, itens, descontoPedido = 0, taxaEntrega = 0, totalComprometido = 0, onClose, onSalvar, onErro }) {
  const [itensEditados, setItensEditados] = useState([]);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [descontoAjuste, setDescontoAjuste] = useState({ valor: "", tipo: "R$" });
  const [taxaAjuste, setTaxaAjuste] = useState("");

  useEffect(() => {
    if (!open) {
      setModalAdicionarAberto(false);
      return;
    }
    setItensEditados(agruparVariacoesObservacao((itens || []).map(criarItemEdicao)));
    setDescontoAjuste({
      valor: valorAjusteVisivel(Number(descontoPedido || 0)),
      tipo: "R$",
    });
    setTaxaAjuste(valorAjusteVisivel(Number(taxaEntrega || 0)));
    setBusca("");
    setErro("");
    api.get("/produtos", { params: { ativos: true } })
      .then((response) => setProdutos(response.data || []))
      .catch((error) => {
        console.error("Erro ao carregar produtos para o pedido:", error);
        onErro?.("Não foi possível carregar os produtos. Tente novamente mais tarde.");
      });
  }, [open, itens, descontoPedido, taxaEntrega]);

  function adicionarProdutos(produtosSelecionados) {
    const novosItens = produtosSelecionados.map(({ produto, quantidade, acrescimoAjuste, observacaoItem, chaveLocal, itemId }) => {
      const preco = Number(produto.precoVenda ?? produto.preco ?? 0);
      const qtd = Number(quantidade || 1);
      const valorAcrescimo = Number(acrescimoAjuste?.valor || 0);
      const acrescimoTotal = acrescimoAjuste?.tipo === "%"
        ? Number((preco * qtd * valorAcrescimo / 100).toFixed(2))
        : valorAcrescimo;

      return {
        ...criarItemEdicao({
          produto,
          id: itemId,
          quantidade: qtd,
          precoUnitario: preco,
          observacaoItem,
          acrescimo: acrescimoTotal,
        }),
        valorAjuste: valorAjusteVisivel(acrescimoAjuste?.tipo === "%" ? valorAcrescimo : Number((acrescimoTotal / Math.max(1, qtd)).toFixed(2))),
        unidadeAjuste: acrescimoAjuste?.tipo || "R$",
        chave: chaveLocal || undefined,
      };
    });
    setItensEditados(agruparVariacoesObservacao(novosItens));
    setModalAdicionarAberto(false);
  }

  const itensParaModalAdicionar = itensEditados.map((item) => ({
    chaveLocal: item.chave,
    itemId: item.itemId,
    produto: {
      id: item.produtoId,
      nome: item.produtoNome,
      descricao: item.produtoDescricao,
      precoVenda: item.precoBase,
    },
    quantidade: Number(item.quantidade || 1),
    descricao: item.produtoDescricao,
    observacaoItem: item.observacaoItem,
    acrescimoAjuste: {
      valor: item.unidadeAjuste === "%"
        ? item.valorAjuste
      : valorAjusteVisivel(Number((Number(item.valorAjuste || 0) * Number(item.quantidade || 1)).toFixed(2))),
      tipo: item.unidadeAjuste || "R$",
    },
    grupoObservacaoId: item.grupoObservacaoId,
    linhaObservacaoPrincipal: item.linhaObservacaoPrincipal,
  }));

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

  function valorDescontoEmReais(totalBruto) {
    const valor = Number(descontoAjuste.valor || 0);
    return descontoAjuste.tipo === "%"
      ? Number((totalBruto * valor / 100).toFixed(2))
      : valor;
  }

  function precoFinal(item) {
    const base = Number(item.precoBase || 0);
    return Number(base.toFixed(2));
  }

  function removerItem(chave) {
    setItensEditados((atuais) => agruparVariacoesObservacao(atuais.filter((item) => item.chave !== chave)));
  }

  function dividirItemParaObservacao(chave) {
    setItensEditados((atuais) => {
      const item = atuais.find((linha) => linha.chave === chave);
      const quantidade = Number(item?.quantidade);
      if (!item || !Number.isInteger(quantidade) || quantidade < 2) return atuais;
      const grupoObservacaoId = item.grupoObservacaoId || `variacao-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`}`;
      const principal = {
        ...item,
        quantidade: quantidade - 1,
        grupoObservacaoId,
        linhaObservacaoPrincipal: item.linhaObservacaoPrincipal !== false,
      };
      const variacao = {
        ...item,
        chave: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        itemId: null,
        quantidade: 1,
        observacaoItem: "",
        grupoObservacaoId,
        linhaObservacaoPrincipal: false,
      };
      const indice = atuais.findIndex((linha) => linha.chave === chave);
      const atualizados = [...atuais];
      atualizados.splice(indice, 1, principal, variacao);
      return atualizados;
    });
  }

  function juntarVariacaoObservacao(chave) {
    setItensEditados((atuais) => {
      const variacao = atuais.find((item) => item.chave === chave);
      if (!variacao?.grupoObservacaoId || variacao.linhaObservacaoPrincipal) return atuais;
      const grupo = atuais.filter((item) => item.grupoObservacaoId === variacao.grupoObservacaoId);
      const principal = grupo.find((item) => item.linhaObservacaoPrincipal);
      if (!principal || Math.abs(Number(principal.precoBase) - Number(variacao.precoBase)) > 0.001) return atuais;
      const ajustePrincipal = valorAjusteEmReais(principal);
      const ajusteVariacao = valorAjusteEmReais(variacao);
      if (Math.abs(ajustePrincipal - ajusteVariacao) > 0.001) return atuais;

      const juntados = atuais
        .filter((item) => item.chave !== chave)
        .map((item) => item.chave === principal.chave
          ? { ...item, quantidade: Number(item.quantidade) + Number(variacao.quantidade) }
          : item);
      return agruparVariacoesObservacao(juntados);
    });
  }

  async function submeter(event) {
    event.preventDefault();
    if (!itensEditados.length) {
      setErro("O pedido precisa ter pelo menos um item.");
      return;
    }
    const subtotalCalculado = itensEditados.reduce((soma, item) => soma + (precoFinal(item) + valorAjusteEmReais(item)) * Number(item.quantidade || 0), 0);
    const taxaFinal = Number(taxaAjuste || 0);
    if (!Number.isFinite(taxaFinal) || taxaFinal < 0) {
      setErro("A taxa de entrega não pode ser negativa.");
      return;
    }
    const totalBruto = subtotalCalculado + taxaFinal;
    const descontoFinal = valorDescontoEmReais(totalBruto);
    if (!Number.isFinite(descontoFinal) || descontoFinal < 0 || descontoFinal > totalBruto) {
      setErro("O desconto deve ficar entre R$ 0,00 e o total do pedido.");
      return;
    }
    if (descontoAjuste.tipo === "%" && Number(descontoAjuste.valor || 0) > 100) {
      setErro("O desconto percentual não pode ser maior que 100%.");
      return;
    }
    if (Number(totalComprometido) > totalBruto - descontoFinal) {
      setErro("O desconto deixaria o total abaixo dos pagamentos já registrados. Reduza o desconto ou revise os pagamentos.");
      return;
    }
    const invalido = itensEditados.some((item) => (
      !item.produtoId || Number(item.quantidade) < 1 ||
      !Number.isFinite(Number(item.precoBase)) || Number(item.precoBase) < 0 ||
      !Number.isFinite(Number(item.valorAjuste)) || Number(item.valorAjuste) < 0 ||
      (item.unidadeAjuste === "%" && Number(item.valorAjuste) > 100)
    ));
    if (invalido) {
      setErro("Confira o produto, a quantidade e o acréscimo de cada item.");
      return;
    }

    setSalvando(true);
    setErro("");
    try {
      await onSalvar({
        itens: itensEditados.map((item) => ({
          itemId: item.itemId,
          produtoId: Number(item.produtoId),
          quantidade: Number(item.quantidade),
          precoUnitario: precoFinal(item),
          acrescimo: Number((valorAjusteEmReais(item) * Number(item.quantidade)).toFixed(2)),
          observacaoItem: item.observacaoItem,
        })),
        descontoPedido: descontoFinal,
        taxaEntrega: taxaFinal,
      });
      onClose();
    } catch (error) {
      onErro?.(error.message || "Não foi possível salvar os itens do pedido.");
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
    (soma, item) => soma + (precoFinal(item) + valorAjusteEmReais(item)) * Number(item.quantidade || 0),
    0
  );
  const taxaFinal = Number(taxaAjuste || 0);
  const totalBruto = total + taxaFinal;
  const descontoCalculado = valorDescontoEmReais(totalBruto);
  const totalFinal = Math.max(0, totalBruto - descontoCalculado);

  const linhas = itensFiltrados.map((item) => {
    const valorFinal = precoFinal(item);
    const subtotal = (valorFinal + valorAjusteEmReais(item)) * Number(item.quantidade || 0);
    const principal = item.grupoObservacaoId
      ? itensEditados.find((linha) => linha.grupoObservacaoId === item.grupoObservacaoId && linha.linhaObservacaoPrincipal)
      : null;
    const podeJuntar = principal
      && Math.abs(Number(principal.precoBase) - Number(item.precoBase)) <= 0.001
      && Math.abs(valorAjusteEmReais(principal) - valorAjusteEmReais(item)) <= 0.001;

    return [
      <div className="produto-edicao-identificacao">
        <span className="produto-item-edicao">{item.produtoNome || "Produto não informado"}</span>
        {item.grupoObservacaoId && !item.linhaObservacaoPrincipal && (
          <span className="item-edicao-variacao-tag">Outra observação do mesmo produto</span>
        )}
        {item.produtoDescricao && <span className="descricao-produto-item-edicao" title={item.produtoDescricao}>{item.produtoDescricao}</span>}
      </div>,
      <div className="observacao-edicao-controles">
        <input
          className="campo-descricao-item-edicao"
          aria-label="Observação do item"
          type="text"
          value={item.observacaoItem}
          onChange={(event) => alterarItem(item.chave, "observacaoItem", event.target.value)}
          onMouseDown={(event) => event.stopPropagation()}
        />
        {Number.isInteger(Number(item.quantidade)) && Number(item.quantidade) > 1 && <button
          type="button"
          className="item-edicao-dividir-observacao"
          onClick={() => dividirItemParaObservacao(item.chave)}
          onMouseDown={(event) => event.stopPropagation()}
          title="Separe uma unidade para registrar outra observação"
        >
          + Outra observação
        </button>}
        {item.grupoObservacaoId && !item.linhaObservacaoPrincipal && <button
          type="button"
          className="item-edicao-juntar-observacao"
          onClick={() => juntarVariacaoObservacao(item.chave)}
          onMouseDown={(event) => event.stopPropagation()}
          disabled={!podeJuntar}
          title={podeJuntar ? "Juntar esta linha à principal" : "Só é possível juntar linhas com o mesmo preço e acréscimo por unidade"}
        >
          Juntar à linha principal
        </button>}
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
      `R$ ${valorFinal.toFixed(2).replace(".", ",")}`,
      <div className="ajuste-item-edicao">
        <div className="valor-ajuste-item-edicao">
          <input
            aria-label={`Valor do ajuste por unidade em ${item.unidadeAjuste}`}
            type="number"
            min="0"
            max={item.unidadeAjuste === "%" ? 100 : undefined}
            step={item.unidadeAjuste === "%" ? "0.1" : "0.01"}
            value={item.valorAjuste}
            placeholder={item.unidadeAjuste === "%" ? "0" : "0,00"}
            onChange={(event) => alterarItem(item.chave, "valorAjuste", event.target.value)}
            onBlur={(event) => alterarItem(item.chave, "valorAjuste", valorAjusteVisivel(event.target.value))}
            onMouseDown={(event) => event.stopPropagation()}
          />
          <FiltroDropdown
            label="Unidade do acréscimo"
            value={item.unidadeAjuste}
            options={[{ value: "R$", label: "R$" }, { value: "%", label: "%" }]}
            onChange={(valor) => alterarItem(item.chave, "unidadeAjuste", valor)}
            className="unidade-ajuste-dropdown"
            menuClassName="unidade-ajuste-dropdown-menu"
            menuMinWidth={76}
          />
        </div>
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
          Ajuste quantidade, acréscimo e observação de cada linha. O desconto é aplicado somente ao total do pedido.
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
            columns={["PRODUTO", "OBSERVAÇÃO", "QTD.", "PREÇO UNITÁRIO", "ACRÉSCIMO", "SUBTOTAL", ""]}
            data={linhas}
            rowClassName={(index) => {
              const item = itensFiltrados[index];
              if (!item?.grupoObservacaoId) return "";
              return item.linhaObservacaoPrincipal
                ? "itens-edicao-linha-grupo itens-edicao-linha-principal"
                : "itens-edicao-linha-grupo itens-edicao-linha-variacao";
            }}
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
        <div className="produtos-selecao-info">
          {itensEditados.length} item(ns) no pedido
        </div>
        <div className="edicao-resumo-valores">
          <div className="edicao-resumo-linha">
            <span>Total dos itens</span>
            <strong>R$ {total.toFixed(2).replace(".", ",")}</strong>
          </div>
          <div className="edicao-resumo-linha taxa-edicao-linha">
            <label htmlFor="taxa-entrega-edicao-pedido">Taxa de entrega</label>
            <div className="taxa-edicao-controle">
              <span aria-hidden="true">R$</span>
              <input
                id="taxa-entrega-edicao-pedido"
                type="number"
                min="0"
                step="0.01"
                value={taxaAjuste}
                placeholder="0,00"
                onChange={(event) => setTaxaAjuste(event.target.value)}
                onBlur={(event) => setTaxaAjuste(valorAjusteVisivel(event.target.value))}
              />
            </div>
          </div>
          <div className="edicao-resumo-linha desconto-edicao-linha">
            <label htmlFor="desconto-edicao-pedido">Desconto do pedido</label>
            <div className="desconto-edicao-controle">
              <input
                id="desconto-edicao-pedido"
                type="number"
                min="0"
                max={descontoAjuste.tipo === "%" ? 100 : undefined}
                step={descontoAjuste.tipo === "%" ? "0.1" : "0.01"}
                value={descontoAjuste.valor}
                placeholder={descontoAjuste.tipo === "%" ? "0" : "0,00"}
                onChange={(event) => setDescontoAjuste((atual) => ({ ...atual, valor: event.target.value }))}
                onBlur={(event) => setDescontoAjuste((atual) => ({ ...atual, valor: valorAjusteVisivel(event.target.value) }))}
              />
              <FiltroDropdown
                label="Unidade do desconto do pedido"
                value={descontoAjuste.tipo}
                options={[{ value: "R$", label: "R$" }, { value: "%", label: "%" }]}
                onChange={(valor) => setDescontoAjuste((atual) => ({ ...atual, tipo: valor }))}
                className="unidade-ajuste-dropdown"
                menuClassName="unidade-ajuste-dropdown-menu"
                menuMinWidth={76}
              />
            </div>
            <strong className="desconto-edicao-valor-final">
              {descontoAjuste.tipo === "%"
                ? `−${Number(descontoAjuste.valor || 0).toFixed(2).replace(".", ",")}% (R$ ${descontoCalculado.toFixed(2).replace(".", ",")})`
                : `−R$ ${descontoCalculado.toFixed(2).replace(".", ",")}`}
            </strong>
          </div>
          <div className="edicao-resumo-linha edicao-resumo-total-final">
            <span>Total final</span>
            <strong>R$ {totalFinal.toFixed(2).replace(".", ",")}</strong>
          </div>
        </div>
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
        itensExistentes={itensParaModalAdicionar}
        onClose={() => setModalAdicionarAberto(false)}
        onAdicionar={adicionarProdutos}
      />
    </Modal>
  );
}

export default ModalEditarItensPedido;
