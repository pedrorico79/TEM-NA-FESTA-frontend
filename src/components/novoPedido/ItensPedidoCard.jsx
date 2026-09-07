import { useState } from "react";

import Tabela from "../shared/tabela/Tabela";

import ModalVisualizarProduto from "./ModalVisualizarProduto";

import ModalAdicionarProduto from "./ModalAdicionarProduto";

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

  const data = props.itens.map((item, index) => {
    const preco = Number(
      item.produto?.precoVenda ??
        item.produto?.preco ??
        0
    );

    const quantidade = Number(
      item.quantidade || 0
    );

    const subtotalBruto =
      preco * quantidade;

    const descontoValor = Number(
      item.desconto?.valor || 0
    );

    const descontoTipo =
      item.desconto?.tipo || "%";

    let desconto = 0;

    if (descontoTipo === "%") {
      desconto =
        subtotalBruto *
        (descontoValor / 100);
    } else {
      desconto = descontoValor;
    }

    // Impede o subtotal de ficar negativo
    const subtotal = Math.max(
      0,
      subtotalBruto - desconto
    );

    return [
      // ==========================================
      // PRODUTO
      // ==========================================

      truncarTexto(
        item.produto?.nome,
        25
      ),

      // ==========================================
      // DESCRIÇÃO
      // ==========================================

      truncarTexto(
        item.descricao,
        45
      ),

      // ==========================================
      // QUANTIDADE
      // ==========================================

      <div
        className="quantidade-input"
        key={`quantidade-${index}`}
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
              index,
              e.target.value
            )
          }
          onBlur={(e) =>
            validarQuantidadeAoSair(
              index,
              e.target.value
            )
          }
          placeholder="0"
        />
      </div>,

      // ==========================================
      // PREÇO UNITÁRIO
      // ==========================================

      `R$${preco
        .toFixed(2)
        .replace(".", ",")}`,

      // ==========================================
      // DESCONTO
      // ==========================================

      <div
        className="desconto-input"
        key={`desconto-${index}`}
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
          max={
            descontoTipo === "%"
              ? "100"
              : undefined
          }
          step="0.01"
          value={
            item.desconto?.valor ?? ""
          }
          onClick={(e) =>
            e.stopPropagation()
          }
          onMouseDown={(e) =>
            e.stopPropagation()
          }
          onChange={(e) =>
            props.alterarDesconto(
              index,
              e.target.value
            )
          }
          placeholder="0"
        />

        <select
          value={descontoTipo}
          onClick={(e) =>
            e.stopPropagation()
          }
          onMouseDown={(e) =>
            e.stopPropagation()
          }
          onChange={(e) =>
            props.alterarTipoDesconto(
              index,
              e.target.value
            )
          }
        >
          <option value="%">
            %
          </option>

          <option value="R$">
            R$
          </option>
        </select>
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
        key={`remover-${index}`}
        className="remover-item"
        onClick={(e) => {
          e.stopPropagation();

          props.removerItem(index);
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

  const subtotal = props.itens.reduce(
    (total, item) => {
      const preco = Number(
        item.produto?.precoVenda ??
          item.produto?.preco ??
          0
      );

      const quantidade = Number(
        item.quantidade || 0
      );

      const subtotalBruto =
        preco * quantidade;

      const descontoValor = Number(
        item.desconto?.valor || 0
      );

      const descontoTipo =
        item.desconto?.tipo || "%";

      let desconto = 0;

      if (descontoTipo === "%") {
        desconto =
          subtotalBruto *
          (descontoValor / 100);
      } else {
        desconto = descontoValor;
      }

      return (
        total +
        Math.max(
          0,
          subtotalBruto - desconto
        )
      );
    },
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

  const total = Math.max(
    0,
    subtotal - entrada
  );

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

      <Tabela
        columns={[
          "PRODUTO",
          "DESCRIÇÃO",
          "QTD.",
          "PREÇO UNITÁRIO",
          "DESCONTO",
          "SUBTOTAL",
          ""
        ]}
        data={data}
        onRowClick={(row, index) => {
          setItemSelecionado(
            props.itens[index]
          );

          setModalProdutoAberto(true);
        }}
      />

      {/* MODAL VISUALIZAR PRODUTO */}

      <ModalVisualizarProduto
        open={modalProdutoAberto}
        produto={
          itemSelecionado?.produto
        }
        quantidade={
          itemSelecionado?.quantidade
        }
        descontoValor={Number(
          itemSelecionado?.desconto?.valor ||
            0
        )}
        descontoTipo={
          itemSelecionado?.desconto?.tipo ||
          "%"
        }
        subtotal={(() => {
          const preco = Number(
            itemSelecionado?.produto
              ?.precoVenda ??
              itemSelecionado?.produto
                ?.preco ??
              0
          );

          const quantidade = Number(
            itemSelecionado?.quantidade ||
              0
          );

          const descontoValor = Number(
            itemSelecionado?.desconto
              ?.valor || 0
          );

          const descontoTipo =
            itemSelecionado?.desconto?.tipo ||
            "%";

          const bruto =
            preco * quantidade;

          const desconto =
            descontoTipo === "%"
              ? bruto *
                (descontoValor / 100)
              : descontoValor;

          return Math.max(
            0,
            bruto - desconto
          );
        })()}
        onClose={() => {
          setModalProdutoAberto(false);

          setItemSelecionado(null);
        }}
      />

      {/* MODAL ADICIONAR PRODUTO */}

      <ModalAdicionarProduto
        open={modalAdicionarAberto}
        produtos={props.produtos}
        itensSelecionados={
          props.itens
        }
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
            Subtotal
          </span>

          <span className="subtotal">
            {formatarValor(subtotal)}
          </span>
        </div>

        {/* SINAL / ENTRADA */}

        <div className="resumo-linha">
          <span className="fonte">
            Sinal / Entrada
          </span>

          <div className="entrada-input">
            <span>
              R$
            </span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                props.entrada ?? ""
              }
              onChange={(e) =>
                props.alterarEntrada(
                  e.target.value
                )
              }
              placeholder="0,00"
            />
          </div>
        </div>

        {/* DIVISOR */}

        <div className="resumo-divisor"></div>

        {/* TOTAL */}

        <div className="resumo-linha resumo-total">
          <span className="fonte">
            Total
          </span>

          <strong>
            {formatarValor(total)}
          </strong>
        </div>
      </div>

      {/* BOTÕES */}

      <div className="acoes-pedido">

        <button
          type="button"
          className="botao-cancelar"
          onClick={
            props.cancelarPedido
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
        >
          Salvar Pedido
        </button>

      </div>
    </div>
  );
}

export default ItensPedidoCard;

