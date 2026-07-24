import { useEffect, useState } from "react";

import Menu from "../shared/Menu/Menu";
import BotaoAdicionar from "../shared/botaoAdicionar/BotaoAdicionar";

import TabelaProdutos from "../produtos/TabelaProdutos";
import ModalEditarProduto from "../produtos/ModalEditarProduto";
import ModalNovoProduto from "../produtos/ModalNovoProduto";
import Paginacao from "../shared/paginacao/Paginacao";
import { api } from "../../services/api";
import ModalConfirmacao from "../produtos/ModalConfirmacao";

import "../css/Produtos.css";

function Produtos() {

    const [produtos, setProdutos] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);

    const [modalNovoOpen, setModalNovoOpen] = useState(false);

    const [produtoSelecionado, setProdutoSelecionado] = useState(null);

    const [mensagemSucesso, setMensagemSucesso] = useState("");

    const [paginaAtual, setPaginaAtual] = useState(1);

    const [totalPaginas, setTotalPaginas] = useState(1);

    const [modalConfirmacaoOpen, setModalConfirmacaoOpen] = useState(false);

    const [produtoConfirmacao, setProdutoConfirmacao] = useState(null);

    function buscarProdutos() {

        api.get("/produtos", {
            params: {
                page: paginaAtual - 1,
                size: 7
            }
        })
            .then((response) => {

                setProdutos(response.data.content);

                setTotalPaginas(response.data.totalPages);

            })
            .catch((erro) => {
                console.error(erro);
            });

    }

    useEffect(() => {
        buscarProdutos();
    }, [paginaAtual]);


    function cadastrarProduto(produto) {
        return api.post("/produtos", produto)
            .then((response) => {
                setPaginaAtual(1);
                buscarProdutos();
                return response.data;
            })
            .catch((erro) => {
                console.error(erro);
                throw erro;
            });
    }

    function abrirModalEditar(produto) {

        setProdutoSelecionado(produto);

        setModalOpen(true);
    }

    function editarProduto(produto) {
        return api.put(`/produtos/${produto.id}`, produto)
            .then((response) => {
                buscarProdutos();
                return response.data;
            })
            .catch((erro) => {
                console.error(erro);
                throw erro;
            });
    }

    const [produtoRemocao, setProdutoRemocao] = useState(null);

    function abrirModalRemover(produto) {
        setProdutoRemocao(produto);
    }

    function removerProduto() {
        api.delete(`/produtos/${produtoRemocao.id}`)
            .then(() => {
                buscarProdutos();

                setProdutoRemocao(null);

                setMensagemSucesso("Produto removido com sucesso!");

                setTimeout(() => {
                    setMensagemSucesso("");
                }, 3000);
            })
            .catch((erro) => {
                console.error(erro);
                alert("Erro ao remover produto.");
            });
    }

    function alterarStatus(produto) {
        setProdutoConfirmacao(produto);
        setModalConfirmacaoOpen(true);
    }

    function confirmarAlteracaoStatus() {

        api.patch(`/produtos/${produtoConfirmacao.id}/ativo`)
            .then(() => {

                buscarProdutos();

                setModalConfirmacaoOpen(false);

                setMensagemSucesso(
                    produtoConfirmacao.ativo
                        ? "Produto desativado com sucesso!"
                        : "Produto ativado com sucesso!"
                );

                setTimeout(() => {
                    setMensagemSucesso("");
                }, 3000);

            })
            .catch((erro) => {
                console.error(erro);
            });
    }

    return (
        <div className="produtos-layout">

            {mensagemSucesso && (
                <div className="mensagem-sucesso">
                    {mensagemSucesso}
                </div>
            )}

            <Menu active="produtos" />

            <div className="produtos-content">

                <h1>Gestão de Produtos</h1>

                <div className="card-padrao">

                    <div className="produtos-topo">

                        <BotaoAdicionar
                            text="Adicionar Novo Produto"
                            size="medium"
                            onClick={() =>
                                setModalNovoOpen(true)
                            }
                        />

                        <input
                            placeholder="Buscar produto"
                        />

                    </div>

                    <TabelaProdutos
                        produtos={produtos}
                        onEditar={abrirModalEditar}
                        onAlterarStatus={alterarStatus}
                        onRemover={abrirModalRemover}
                    />

                    <Paginacao
                        paginaAtual={paginaAtual}
                        totalPaginas={totalPaginas}
                        onAnterior={() =>
                            setPaginaAtual(
                                paginaAtual - 1
                            )
                        }
                        onProximo={() =>
                            setPaginaAtual(
                                paginaAtual + 1
                            )
                        }
                    />

                </div>

            </div>

            <ModalEditarProduto
                open={modalOpen}
                produto={produtoSelecionado}
                onClose={() =>
                    setModalOpen(false)
                }
                onSalvar={editarProduto}
                onSucesso={() => {
                    setMensagemSucesso("Produto editado com sucesso!");

                    setTimeout(() => {
                        setMensagemSucesso("");
                    }, 3000);
                }}
            />

            <ModalNovoProduto
                open={modalNovoOpen}
                onClose={() => setModalNovoOpen(false)}
                onSalvar={cadastrarProduto}
                onSucesso={() => {
                    setMensagemSucesso("Produto cadastrado com sucesso!");

                    setTimeout(() => {
                        setMensagemSucesso("");
                    }, 3000);
                }}
            />

            <ModalConfirmacao
                open={modalConfirmacaoOpen}
                onClose={() => setModalConfirmacaoOpen(false)}
                onConfirmar={confirmarAlteracaoStatus}
                mensagem={`Tem certeza que deseja ${produtoConfirmacao?.ativo
                    ? "desativar"
                    : "ativar"
                    } o produto ${produtoConfirmacao?.nome || ""
                    }?`}
            />

            <ModalConfirmacao
                open={!!produtoRemocao}
                onClose={() => setProdutoRemocao(null)}
                onConfirmar={removerProduto}
                mensagem={
                    <>
                        Tem certeza que deseja remover o produto {produtoRemocao?.nome || ""}?
                        <br />
                        <br />
                        Essa ação não pode ser desfeita.
                    </>
                }
            />


        </div>
    );
}

export default Produtos;