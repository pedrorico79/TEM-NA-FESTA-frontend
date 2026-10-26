import { useState } from "react";

import Tabela from "../shared/tabela/Tabela";
import FiltroDropdown from "../pedidos/FiltroDropdown";

import ModalVisualizarProduto from "./ModalVisualizarProduto";

import ModalAdicionarProduto from "./ModalAdicionarProduto";

export function calcularPrecoUnitarioFinal(item = {}) {
  if (!item || typeof item !== "object") return 0;

  const precoBase = Number(item.produto?.precoVenda ?? item.produto?.preco ?? 0);
  const quantidade = Number(item.quantidade || 0);
  if (quantidade <= 0) return 0;
  return precoBase;
}

export function calcularAcrescimoItem(item = {}) {
  if (!item || typeof item !== "object") return 0;
  const quantidade = Number(item.quantidade || 0);
  const precoUnitario = calcularPrecoUnitarioFinal(item);
  const valor = Number(item.acrescimoAjuste?.valor ?? item.acrescimo ?? 0);
  if (item.acrescimoAjuste) {
    return item.acrescimoAjuste.tipo === "%"
      ? Number((precoUnitario * quantidade * valor / 100).toFixed(2))
      : valor;
  }
  return valor;
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

function ItensPedidoCard(props) {
  const [itemSelecionado, setItemSelecionado] = useState(null);

  const [modalProdutoAberto, setModalProdutoAberto] = useState(false);

  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);

  // ==========================================
  // ALTERAR QUANTIDADE
  // ==========================================

  const alterarQuantidade = (index, valor) => {
    props.alterarQuantidade(index, valor);
  };

  // ==========================================
  // VALIDAR QUANTIDADE AO SAIR DO INPUT
  // ==========================================

  const validarQuantidadeAoSair = (index, valor) => {
    const quantidade = Number(valor);

    if (!quantidade || quantidade <= 0) {
      props.removerItem(index);
    }
  };

  // ==========================================
  // TABELA DE ITENS
  // ==========================================

  const itensSeguros = (Array.isArray(props.itens) ? props.itens : [])
    .map((item, index) => ({ item, indexOriginal: index }))
    .filter(({ item }) => item && typeof item === "object");

  const data = itensSeguros.map(({ item, indexOriginal }) => {
    const quantidade = Number(
      item.quantidade || 0
    );

    const acrescimoTipo = item.acrescimoAjuste?.tipo || "R$";

    const precoUnitarioFinal = calcularPrecoUnitarioFinal(item);
    const acrescimo = calcularAcrescimoItem(item);
    const subtotal = precoUnitarioFinal * quantidade + acrescimo;

    return [
      // ==========================================
      // PRODUTO
      // ==========================================

      <div className="produto-info-item-novo-pedido">
        <strong title={item.produto?.nome || "Produto"}>
          {truncarTexto(item.produto?.nome, 35)}
        </strong>
        {item.grupoObservacaoId && !item.linhaObservacaoPrincipal && (
          <span className="item-observacao-variacao-tag">Outra observação do mesmo produto</span>
        )}
        <span title={item.descricao || "Sem descrição"}>
          {item.descricao || "Sem descrição"}
        </span>
      </div>,

      <div className="observacao-item-acoes-novo-pedido" key={`observacao-${indexOriginal}`}>
        <input
          className="observacao-item-novo-pedido"
          type="text"
          value={item.observacaoItem || ""}
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          onChange={(event) => props.alterarObservacaoItem(indexOriginal, event.target.value)}
          placeholder="Adicionar observação"
          aria-label={`Observação de ${item.produto?.nome || "item"}`}
        />
        {quantidade > 1 && <button
          type="button"
          className="produto-selecao-dividir"
          onClick={(event) => {
            event.stopPropagation();
            props.dividirItemParaObservacao(indexOriginal);
          }}
          onMouseDown={(event) => event.stopPropagation()}
          title="Separe uma unidade para adicionar outra observação"
        >
          + Outra observação
        </button>}
        {item.grupoObservacaoId && !item.linhaObservacaoPrincipal && <button
          type="button"
          className="item-juntar-variacao-observacao"
          onClick={(event) => {
            event.stopPropagation();
            props.juntarVariacaoObservacao(indexOriginal);
          }}
          onMouseDown={(event) => event.stopPropagation()}
          title="Juntar esta linha à principal e manter a observação principal"
        >
          Juntar à linha principal
        </button>}
      </div>,

      // ==========================================
      // QUANTIDADE
      // ==========================================

      <div
        className="quantidade-input"
        key={`quantidade-${indexOriginal}`}
        onClick={(e) =>
          e.stopPropagation()
        }
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >
        <input
          type="number"
          min="1"
          step="1"
          value={item.quantidade ?? ""}
          onClick={(e) =>
            e.stopPropagation()
          }
          onMouseDown={(e) =>
            e.stopPropagation()
          }
          onChange={(e) =>
            alterarQuantidade(
              indexOriginal,
              e.target.value
            )
          }
          onBlur={(e) =>
            validarQuantidadeAoSair(
              indexOriginal,
              e.target.value
            )
          }
          placeholder="0"
        />
      </div>,

      // ==========================================
      // PREÇO UNITÁRIO
      // ==========================================

      `R$${precoUnitarioFinal
        .toFixed(2)
        .replace(".", ",")}`,

      // ==========================================
      // AJUSTE
      // ==========================================

      <div
        className="acrescimo-input ajuste-produto-input"
        key={`acrescimo-${indexOriginal}`}
        onClick={(e) =>
          e.stopPropagation()
        }
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >
        <input
          type="number"
          min="0"
          max={acrescimoTipo === "%" ? "100" : undefined}
          step="0.01"
          value={item.acrescimoAjuste?.valor ?? ""}
          onClick={(e) =>
            e.stopPropagation()
          }
          onMouseDown={(e) =>
            e.stopPropagation()
          }
          onChange={(e) =>
            props.alterarAcrescimo(indexOriginal, e.target.value)
          }
          onBlur={(e) => {
            if (Number(e.target.value) === 0) {
              props.alterarAcrescimo(indexOriginal, "");
            }
          }}
          placeholder={acrescimoTipo === "%" ? "0" : "0,00"}
        />

        <FiltroDropdown
          value={acrescimoTipo}
          options={[{ value: "R$", label: "R$" }, { value: "%", label: "%" }]}
          onChange={(valor) => props.alterarUnidadeAcrescimo(indexOriginal, valor)}
          label="Unidade do acréscimo"
          className="unidade-ajuste-dropdown"
          menuClassName="unidade-ajuste-dropdown-menu"
          menuMinWidth={76}
        />
      </div>,

      // ==========================================
      // SUBTOTAL
      // ==========================================

      `R$${subtotal
        .toFixed(2)
        .replace(".", ",")}`,

      // ==========================================
      // REMOVER
      // ==========================================

      <button
        key={`remover-${indexOriginal}`}
        className="remover-item"
        onClick={(e) => {
          e.stopPropagation();

        props.removerItem(indexOriginal);
        }}
        onMouseDown={(e) =>
          e.stopPropagation()
        }
        type="button"
      >
        <ion-icon
          name="close-outline"
        ></ion-icon>
      </button>
    ];
  });

  // ==========================================
  // CALCULA O SUBTOTAL GERAL DOS ITENS
  // ==========================================

  const subtotal = itensSeguros.reduce(
    (total, { item }) => total + calcularPrecoUnitarioFinal(item) * Number(item.quantidade || 0) + calcularAcrescimoItem(item),
    0
  );

  // ==========================================
  // ENTRADA / SINAL
  // ==========================================

  const entrada = Number(
    props.entrada || 0
  );

  // ==========================================
  // TOTAL
  // ==========================================

  const taxaEntrega = Math.max(0, Number(props.taxaEntrega || 0));
  const descontoPedido = Math.min(subtotal + taxaEntrega, Math.max(0, Number(props.descontoPedido || 0)));
  const total = Math.max(0, subtotal + taxaEntrega - descontoPedido);
  const saldoRestante = Math.max(0, total - entrada);

  const formatarValor = (valor) => {
    return `R$${valor
      .toFixed(2)
      .replace(".", ",")}`;
  };

  return (
    <div className="card-padrao itens-pedido-card">

      {/* TÍTULO */}

      <div className="card-title">
        <ion-icon
          name="cube-outline"
        ></ion-icon>

        <h2>
          Itens do Pedido
        </h2>
      </div>

      {/* TABELA */}

      <div className="novo-pedido-tabela-itens-wrap">
        <Tabela
          columns={[
            "PRODUTO",
            "OBSERVAÇÃO",
            "QTD.",
            "PREÇO UNITÁRIO",
            "ACRÉSCIMO",
            "SUBTOTAL",
            ""
          ]}
          data={data}
          rowClassName={(index) => {
            const item = itensSeguros[index]?.item;
            if (!item?.grupoObservacaoId) return "";
            return item.linhaObservacaoPrincipal
              ? "item-observacao-grupo item-observacao-principal"
              : "item-observacao-grupo item-observacao-variacao";
          }}
          onRowClick={(row, index) => {
            setItemSelecionado(itensSeguros[index]?.item ?? null);
            setModalProdutoAberto(true);
          }}
        />
      </div>

      {/* MODAL VISUALIZAR PRODUTO */}

      <ModalVisualizarProduto
        open={modalProdutoAberto}
        produto={
          itemSelecionado?.produto
        }
        quantidade={
          itemSelecionado?.quantidade
        }
        acrescimoValor={Number(itemSelecionado?.acrescimoAjuste?.valor || 0)}
        acrescimoTipo={itemSelecionado?.acrescimoAjuste?.tipo || "R$"}
        subtotal={calcularPrecoUnitarioFinal(itemSelecionado) * Number(itemSelecionado?.quantidade || 0) + calcularAcrescimoItem(itemSelecionado)}
        onClose={() => {
          setModalProdutoAberto(false);

          setItemSelecionado(null);
        }}
      />

      {/* MODAL ADICIONAR PRODUTO */}

      <ModalAdicionarProduto
        open={modalAdicionarAberto}
        produtos={props.produtos}
        itensExistentes={props.itens}
        onCriarProduto={props.criarProduto}
        onCriarProdutoSucesso={props.onCriarProdutoSucesso}
        onClose={() =>
          setModalAdicionarAberto(false)
        }
        onAdicionar={(
          produtosSelecionados
        ) => {
          props.adicionarItens(
            produtosSelecionados
          );

          setModalAdicionarAberto(false);
        }}
      />

      {/* BOTÃO ADICIONAR ITEM */}

      <button
        className="adicionar-item"
        onClick={() =>
          setModalAdicionarAberto(true)
        }
        type="button"
      >
        <ion-icon
          name="add-circle-outline"
        ></ion-icon>

        Adicionar Item
      </button>

      {/* RESUMO DO PEDIDO */}

      <div className="resumo-pedido">

        {/* SUBTOTAL */}

        <div className="resumo-linha">
          <span className="fonte">
            Subtotal dos itens
          </span>

          <span className="subtotal">
            {formatarValor(subtotal)}
          </span>
        </div>

        <div className="resumo-linha">
          <span className="fonte">Taxa de entrega</span>
          <span className="subtotal">{formatarValor(taxaEntrega)}</span>
        </div>

        <div className="resumo-linha resumo-desconto-pedido">
          <label className="fonte" htmlFor="desconto-pedido-total">Desconto no pedido</label>
          <div className="entrada-input desconto-pedido-controles">
            <input
              id="desconto-pedido-total"
              type="number"
              min="0"
              max={props.descontoPedidoAjuste?.tipo === "%" ? "100" : (subtotal + taxaEntrega).toFixed(2)}
              step="0.01"
              inputMode="decimal"
              value={props.descontoPedidoAjuste?.valor ?? ""}
              onChange={(event) => props.onAlterarDescontoPedido(event.target.value)}
              placeholder={props.descontoPedidoAjuste?.tipo === "%" ? "0" : "0,00"}
              aria-label="Valor do desconto do pedido"
            />
            <FiltroDropdown
              value={props.descontoPedidoAjuste?.tipo || "R$"}
              options={[{ value: "R$", label: "R$" }, { value: "%", label: "%" }]}
              onChange={props.onAlterarTipoDescontoPedido}
              label="Unidade do desconto do pedido"
              className="unidade-ajuste-dropdown"
              menuClassName="unidade-ajuste-dropdown-menu"
              menuMinWidth={76}
            />
          </div>
        </div>

        {/* PAGAMENTO INICIAL */}

        <div className="resumo-linha">
          <span className="fonte">
            Sinal
          </span>

          <div className="pagamento-inicial-campos">
            <div className="entrada-input">
              <span>R$</span>
              <input
                type="number"
                min="0"
                max={total.toFixed(2)}
                step="0.01"
                inputMode="decimal"
                value={props.entrada ?? ""}
                onChange={(event) => props.alterarEntrada(event.target.value)}
                placeholder="0"
                aria-label="Valor do pagamento inicial"
              />
            </div>
          </div>
        </div>

        {entrada > 0 && (
          <div className="pagamento-inicial-opcoes">
            <label className="campo-pagamento-inicial">
              Forma de pagamento
              <FiltroDropdown
                className="campo-pagamento-inicial-dropdown"
                menuClassName="campo-pagamento-inicial-dropdown-menu"
                label="Método do pagamento inicial"
                value={props.metodoPagamentoId || ""}
                onChange={props.onAlterarMetodoPagamento}
                disabled={!props.metodosPagamento?.length}
                options={[
                  { value: "", label: "Selecione" },
                  ...(props.metodosPagamento || []).map((metodo) => ({
                    value: String(metodo.id),
                    label: metodo.nome,
                  })),
                ]}
              />
            </label>
            <label className="campo-pagamento-inicial">
              Situação
              <FiltroDropdown
                className="campo-pagamento-inicial-dropdown"
                menuClassName="campo-pagamento-inicial-dropdown-menu"
                label="Situação do pagamento inicial"
                value={props.statusEntrada || "CONFIRMADO"}
                onChange={props.onAlterarStatusEntrada}
                menuMinWidth={220}
                options={[
                  { value: "CONFIRMADO", label: "Recebido" },
                  { value: "PENDENTE", label: "Aguardando confirmação" },
                ]}
              />
            </label>
          </div>
        )}

        {Number(props.entrada || 0) > 0 && props.statusEntrada === "PENDENTE" }

        {props.erroMetodosPagamento && <p className="novo-pedido-ajuda-erro" role="alert">{props.erroMetodosPagamento}</p>}

        {/* DIVISOR */}

        <div className="resumo-divisor"></div>

        {/* TOTAL */}

        <div className="resumo-linha resumo-total">
          <span className="fonte">
            Total do pedido
          </span>

          <strong>
            {formatarValor(total)}
          </strong>
        </div>
        {descontoPedido > 0 && <div className="resumo-linha">
          <span>Desconto aplicado</span>
          <strong>− {formatarValor(descontoPedido)}</strong>
        </div>}
        <div className="resumo-linha resumo-saldo">
          <span>Saldo após sinal</span>
          <strong>{formatarValor(saldoRestante)}</strong>
        </div>
      </div>

      {/* BOTÕES */}

      <div className="acoes-pedido">

        <button
          type="button"
          className="botao-cancelar"
          onClick={
            props.voltarPedidos
          }
        >
          Cancelar
        </button>

        <button
          type="button"
          className="botao-salvar"
          onClick={
            props.salvarPedido
          }
          disabled={props.salvando || Boolean(props.pedidoIncompletoId)}
        >
          {props.salvando ? "Salvando…" : props.pedidoIncompletoId ? "Pedido já criado" : "Salvar Pedido"}
        </button>

      </div>

      {props.pedidoIncompletoId && (
        <div className="novo-pedido-criacao-parcial" role="alert">
          <span>{props.erroSalvamento}</span>
          <button type="button" onClick={() => props.abrirPedido(props.pedidoIncompletoId)}>
            Abrir pedido #{props.pedidoIncompletoId}
          </button>
        </div>
      )}
    </div>
  );
}

export default ItensPedidoCard;

