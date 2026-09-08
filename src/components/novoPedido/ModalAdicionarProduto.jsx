import { useEffect, useState } from "react";

import Tabela from "../shared/tabela/Tabela";

import Modal from "../shared/modal/Modal";

import ModalVisualizarProduto from "./ModalVisualizarProduto";

function truncarTexto(texto, limite) {

    if (!texto) {

        return "-";

    }

    if (texto.length <= limite) {

        return texto;

    }

    return `${texto.slice(0, limite)}...`;

}

function ModalAdicionarProduto({
    open,
    produtos,
    itensSelecionados,
    onClose,
    onAdicionar
}) {

    const [busca, setBusca] = useState("");

    const [selecionados, setSelecionados] = useState([]);

    const [produtoVisualizado, setProdutoVisualizado] = useState(null);


    // ==========================================
    // ABRIR / FECHAR MODAL
    // ==========================================

    useEffect(() => {

        if (open) {

            setBusca("");

            setProdutoVisualizado(null);

            // Carrega os produtos que já estão no pedido
            // com quantidade e desconto atuais
            setSelecionados(
                (itensSelecionados || []).map((item) => ({
                    produto: item.produto,

                    quantidade: item.quantidade ?? 1,

                    desconto: {
                        valor: item.desconto?.valor ?? 0,

                        tipo:
                            item.desconto?.tipo || "%",
                    },
                }))
            );

        } else {

            setBusca("");

            setSelecionados([]);

            setProdutoVisualizado(null);

        }

    }, [open, itensSelecionados]);


    if (!open) {

        return null;

    }


    // ==========================================
    // FILTRO DE PRODUTOS
    // ==========================================

    const produtosFiltrados = (produtos || []).filter((produto) => {

        const termo = busca.toLowerCase().trim();

        if (!termo) {

            return true;

        }

        return (
            produto.nome?.toLowerCase().includes(termo) ||
            produto.descricao?.toLowerCase().includes(termo)
        );

    });


    // ==========================================
    // ENCONTRAR PRODUTO SELECIONADO
    // ==========================================

    const encontrarSelecionado = (produtoId) => {

        return selecionados.find(
            (item) =>
                item.produto?.id === produtoId
        );

    };


    // ==========================================
    // SELECIONAR / DESELECIONAR PRODUTO
    // ==========================================

    const alternarProduto = (produto) => {

        const existe = encontrarSelecionado(produto.id);

        // Se já está selecionado, desmarca
        if (existe) {

            setSelecionados((anteriores) =>
                anteriores.filter(
                    (item) =>
                        item.produto?.id !== produto.id
                )
            );

            return;

        }


        // Verifica se o produto já existe no pedido
        const itemExistente = (itensSelecionados || []).find(
            (item) =>
                item.produto?.id === produto.id
        );


        // Se já existe no pedido, carrega
        // quantidade e desconto existentes
        if (itemExistente) {

            setSelecionados((anteriores) => [
                ...anteriores,

                {
                    produto,

                    quantidade:
                        itemExistente.quantidade ?? 1,

                    desconto: {
                        valor:
                            itemExistente.desconto?.valor ?? 0,

                        tipo:
                            itemExistente.desconto?.tipo || "%",
                    },
                },

            ]);

            return;

        }


        // Produto novo
        setSelecionados((anteriores) => [

            ...anteriores,

            {
                produto,

                quantidade: 1,

                desconto: {
                    valor: 0,
                    tipo: "%",
                },
            },

        ]);

    };


    // ==========================================
    // ALTERAR QUANTIDADE
    // ==========================================

    const alterarQuantidade = (produtoId, quantidade) => {

        setSelecionados((anteriores) =>
            anteriores.map((item) => {

                if (item.produto?.id !== produtoId) {

                    return item;

                }

                return {

                    ...item,

                    quantidade

                };

            })
        );

    };


    // ==========================================
    // ALTERAR DESCONTO
    // ==========================================

    const alterarDesconto = (produtoId, valor) => {

        setSelecionados((anteriores) =>
            anteriores.map((item) => {

                if (item.produto?.id !== produtoId) {

                    return item;

                }

                return {

                    ...item,

                    desconto: {

                        ...item.desconto,

                        valor

                    }

                };

            })
        );

    };


    // ==========================================
    // ALTERAR TIPO DO DESCONTO
    // ==========================================

    const alterarTipoDesconto = (produtoId, tipo) => {

        setSelecionados((anteriores) =>
            anteriores.map((item) => {

                if (item.produto?.id !== produtoId) {

                    return item;

                }

                return {

                    ...item,

                    desconto: {

                        ...item.desconto,

                        tipo

                    }

                };

            })
        );

    };


    // ==========================================
    // VALIDAR QUANTIDADE
    // ==========================================

    const validarQuantidadeAoSair = (
        produtoId,
        quantidade
    ) => {

        const valor = Number(quantidade);

        if (!valor || valor <= 0) {

            setSelecionados((anteriores) =>
                anteriores.filter(
                    (item) =>
                        item.produto?.id !== produtoId
                )
            );

        }

    };


    // ==========================================
    // ADICIONAR PRODUTOS
    // ==========================================

    const adicionarProdutos = () => {

        const itensValidos = selecionados.filter(
            (item) =>
                Number(item.quantidade) > 0
        );

        if (itensValidos.length === 0) {

            return;

        }

        onAdicionar(
            itensValidos.map((item) => ({

                ...item,

                quantidade:
                    Number(item.quantidade),

                desconto: {

                    valor:
                        Number(
                            item.desconto?.valor || 0
                        ),

                    tipo:
                        item.desconto?.tipo || "%",
                },

            }))
        );

    };


    // ==========================================
    // DADOS DA TABELA
    // ==========================================

    const data = produtosFiltrados.map((produto) => {

        const selecionado =
            encontrarSelecionado(produto.id);

        const preco = Number(
            produto.precoVenda ??
            produto.preco ??
            0
        );


        return [

            // ==========================================
            // SELEÇÃO
            // ==========================================

            <div
                className={`seletor-produto ${
                    selecionado
                        ? "selecionado"
                        : ""
                }`}
                onClick={(e) => {

                    e.stopPropagation();

                    alternarProduto(produto);

                }}
            >

                {selecionado && (

                    <ion-icon
                        name="checkmark-outline"
                    ></ion-icon>

                )}

            </div>,


            // ==========================================
            // PRODUTO
            // ==========================================

            truncarTexto(
                produto.nome,
                25
            ),


            // ==========================================
            // DESCRIÇÃO
            // ==========================================

            truncarTexto(
                produto.descricao,
                40
            ),


            // ==========================================
            // VALOR
            // ==========================================

            `R$ ${preco
                .toFixed(2)
                .replace(".", ",")}`,


            // ==========================================
            // QUANTIDADE
            // ==========================================

            selecionado ? (

                <div
                    className="quantidade-input"

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

                        value={
                            selecionado.quantidade ?? 1
                        }

                        onChange={(e) =>
                            alterarQuantidade(
                                produto.id,
                                e.target.value
                            )
                        }

                        onBlur={(e) =>
                            validarQuantidadeAoSair(
                                produto.id,
                                e.target.value
                            )
                        }

                        onClick={(e) =>
                            e.stopPropagation()
                        }

                        onMouseDown={(e) =>
                            e.stopPropagation()
                        }
                    />

                </div>

            ) : (

                "-"

            ),


            // ==========================================
            // DESCONTO
            // ==========================================

            selecionado ? (

                <div
                    className="desconto-input"

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
                            selecionado.desconto?.tipo === "%"
                                ? "100"
                                : undefined
                        }

                        step="0.01"

                        value={
                            selecionado.desconto?.valor ?? 0
                        }

                        onChange={(e) =>
                            alterarDesconto(
                                produto.id,
                                e.target.value
                            )
                        }

                        onClick={(e) =>
                            e.stopPropagation()
                        }

                        onMouseDown={(e) =>
                            e.stopPropagation()
                        }
                    />


                    <select
                        value={
                            selecionado.desconto?.tipo || "%"
                        }

                        onChange={(e) =>
                            alterarTipoDesconto(
                                produto.id,
                                e.target.value
                            )
                        }

                        onClick={(e) =>
                            e.stopPropagation()
                        }

                        onMouseDown={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <option value="%">
                            %
                        </option>

                        <option value="R$">
                            R$
                        </option>

                    </select>

                </div>

            ) : (

                "-"

            )

        ];

    });


    // ==========================================
    // QUANTIDADE DE PRODUTOS SELECIONADOS
    // ==========================================

    const quantidadeSelecionadosValidos =
        selecionados.filter(
            (item) =>
                Number(item.quantidade) > 0
        ).length;


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <>

            <Modal
                open={open}

                onClose={onClose}

                title="Adicionar Produtos"

                className="modal-adicionar-produto"
            >

                <div className="adicionar-produto-modal">

                    <p className="adicionar-produto-descricao">

                        Pesquise e selecione os produtos que deseja
                        adicionar ao pedido.

                    </p>


                    {/* BUSCA */}

                    <div className="busca-produtos-modal">

                        <ion-icon
                            name="search-outline"
                        ></ion-icon>

                        <input
                            type="text"

                            value={busca}

                            onChange={(e) =>
                                setBusca(
                                    e.target.value
                                )
                            }

                            placeholder="Pesquisar produto..."
                        />

                    </div>


                    {/* TABELA */}

                    <div className="produtos-selecao-wrapper">

                        <Tabela
                            columns={[
                                "",
                                "PRODUTO",
                                "DESCRIÇÃO",
                                "VALOR",
                                "QTD.",
                                "DESCONTO"
                            ]}

                            data={data}

                            onRowClick={(row, index) => {

                                const produto =
                                    produtosFiltrados[index];

                                setProdutoVisualizado(
                                    produto
                                );

                            }}
                        />

                    </div>


                    {/* INFORMAÇÃO */}

                    <div className="produtos-selecao-info">

                        <span>

                            {quantidadeSelecionadosValidos}
                            {" "}
                            produto(s) selecionado(s)

                        </span>

                    </div>


                    {/* BOTÕES */}

                    <div className="modal-actions">

                        <button
                            type="button"

                            className="secondary-button"

                            onClick={onClose}
                        >

                            Cancelar

                        </button>


                        <button
                            type="button"

                            className="primary-button"

                            disabled={
                                quantidadeSelecionadosValidos === 0
                            }

                            onClick={adicionarProdutos}
                        >

                            Adicionar Produtos

                        </button>

                    </div>

                </div>

            </Modal>


            {/* MODAL VISUALIZAR PRODUTO */}

            <ModalVisualizarProduto

                open={
                    !!produtoVisualizado
                }

                produto={
                    produtoVisualizado
                }

                quantidade={

                    encontrarSelecionado(
                        produtoVisualizado?.id
                    )?.quantidade || 1

                }

                descontoValor={

                    encontrarSelecionado(
                        produtoVisualizado?.id
                    )?.desconto?.valor || 0

                }

                descontoTipo={

                    encontrarSelecionado(
                        produtoVisualizado?.id
                    )?.desconto?.tipo || "%"

                }

                subtotal={

                    Number(
                        produtoVisualizado?.precoVenda ??
                        produtoVisualizado?.preco ??
                        0
                    )

                    *

                    Number(
                        encontrarSelecionado(
                            produtoVisualizado?.id
                        )?.quantidade || 1
                    )

                }

                onClose={() =>
                    setProdutoVisualizado(null)
                }

            />

        </>

    );

}

export default ModalAdicionarProduto;