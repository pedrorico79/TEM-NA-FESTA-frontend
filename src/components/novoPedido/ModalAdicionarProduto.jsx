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


    useEffect(() => {

        if (!open) {

            setBusca("");

            setSelecionados([]);

            setProdutoVisualizado(null);

        }

    }, [open]);


    if (!open) {

        return null;

    }


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


    const encontrarSelecionado = (produtoId) => {

        return selecionados.find(
            (item) => item.produto.id === produtoId
        );

    };


    const produtoJaNoPedido = (produtoId) => {

        return (itensSelecionados || []).some(
            (item) => item.produto?.id === produtoId
        );

    };


    const alternarProduto = (produto) => {

        const existe = encontrarSelecionado(produto.id);

        if (existe) {

            setSelecionados((anteriores) =>
                anteriores.filter(
                    (item) => item.produto.id !== produto.id
                )
            );

            return;

        }

        setSelecionados((anteriores) => [
            ...anteriores,
            {
                produto,
                quantidade: 1
            }
        ]);

    };


    const alterarQuantidade = (produtoId, quantidade) => {

        setSelecionados((anteriores) =>
            anteriores.map((item) => {

                if (item.produto.id !== produtoId) {

                    return item;

                }

                return {
                    ...item,
                    quantidade
                };

            })
        );

    };


    const validarQuantidadeAoSair = (produtoId, quantidade) => {

        const valor = Number(quantidade);

        if (!valor || valor <= 0) {

            setSelecionados((anteriores) =>
                anteriores.filter(
                    (item) => item.produto.id !== produtoId
                )
            );

        }

    };


    const adicionarProdutos = () => {

        const itensValidos = selecionados.filter(
            (item) => Number(item.quantidade) > 0
        );

        if (itensValidos.length === 0) {

            return;

        }

        onAdicionar(
            itensValidos.map((item) => ({
                ...item,
                quantidade: Number(item.quantidade)
            }))
        );

    };


    const data = produtosFiltrados.map((produto) => {

        const selecionado = encontrarSelecionado(produto.id);

        return [

            // SELEÇÃO

            <div
                className={`seletor-produto ${
                    selecionado ? "selecionado" : ""
                }`}
                onClick={(e) => {

                    e.stopPropagation();

                    if (!produtoJaNoPedido(produto.id)) {

                        alternarProduto(produto);

                    }

                }}
            >

                {selecionado && (

                    <ion-icon name="checkmark-outline"></ion-icon>

                )}

            </div>,


            // PRODUTO

            truncarTexto(
                produto.nome,
                25
            ),


            // DESCRIÇÃO

            truncarTexto(
                produto.descricao,
                45
            ),


            // VALOR

            `R$ ${Number(
                produto.precoVenda ??
                produto.preco ??
                0
            )
                .toFixed(2)
                .replace(".", ",")}`,


            // QUANTIDADE

            selecionado ? (

                <input
                    type="number"
                    min="0"
                    step="1"
                    value={selecionado.quantidade}
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

            ) : (

                "-"

            )

        ];

    });


    const quantidadeSelecionadosValidos =
        selecionados.filter(
            (item) => Number(item.quantidade) > 0
        ).length;


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

                        <ion-icon name="search-outline"></ion-icon>

                        <input
                            type="text"
                            value={busca}
                            onChange={(e) =>
                                setBusca(e.target.value)
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
                                "QTD."
                            ]}
                            data={data}
                            onRowClick={(row, index) => {

                                const produto =
                                    produtosFiltrados[index];

                                setProdutoVisualizado(produto);

                            }}
                        />

                    </div>


                    {/* INFORMAÇÃO */}

                    <div className="produtos-selecao-info">

                        <span>

                            {quantidadeSelecionadosValidos} produto(s)
                            selecionado(s)

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
                open={!!produtoVisualizado}
                produto={produtoVisualizado}
                quantidade={
                    encontrarSelecionado(
                        produtoVisualizado?.id
                    )?.quantidade || 1
                }
                descontoValor={0}
                descontoTipo="%"
                subtotal={
                    Number(
                        produtoVisualizado?.precoVenda ??
                        produtoVisualizado?.preco ??
                        0
                    ) *
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
