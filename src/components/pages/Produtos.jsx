import { useEffect, useRef, useState } from "react";

import Menu from "../shared/menu/Menu";
import BotaoAdicionar from "../shared/botaoAdicionar/BotaoAdicionar";

import TabelaProdutos from "../produtos/TabelaProdutos";
import ModalEditarProduto from "../produtos/ModalEditarProduto";
import ModalNovoProduto from "../produtos/ModalNovoProduto";
import Paginacao from "../shared/paginacao/Paginacao";
import LoadingState from "../shared/LoadingState";
import { api } from "../../services/api";
import ModalConfirmacao from "../shared/modal/ModalConfirmacao";
import ModalVisualizarProduto from "../produtos/ModalVisualizarProduto";

import "../css/Produtos.css";

function Produtos() {

    const [produtos, setProdutos] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);

    const [modalNovoOpen, setModalNovoOpen] = useState(false);

    const [produtoSelecionado, setProdutoSelecionado] = useState(null);

    const [mensagemSucesso, setMensagemSucesso] = useState("");

    const [paginaAtual, setPaginaAtual] = useState(1);

    const [modalConfirmacaoOpen, setModalConfirmacaoOpen] = useState(false);

    const [produtoConfirmacao, setProdutoConfirmacao] = useState(null);

    const [busca, setBusca] = useState("");
    const buscaSequencia = useRef(0);
    const [carregandoProdutos, setCarregandoProdutos] = useState(true);
    const [erroProdutos, setErroProdutos] = useState("");

    const itensPorPagina = 7;

    const [modalVisualizarOpen, setModalVisualizarOpen] = useState(false);
    const [produtoVisualizado, setProdutoVisualizado] = useState(null);

    const totalPaginas = Math.ceil(
        produtos.length / itensPorPagina
    );

    const indiceInicial = (paginaAtual - 1) * itensPorPagina;
    const indiceFinal = indiceInicial + itensPorPagina;

    const produtosPaginados = produtos.slice(
        indiceInicial,
        indiceFinal
    );

    useEffect(() => {
        if (totalPaginas === 0 && paginaAtual !== 1) {
            setPaginaAtual(1);
        } else if (totalPaginas > 0 && paginaAtual > totalPaginas) {
            setPaginaAtual(totalPaginas);
        }
    }, [paginaAtual, totalPaginas]);

    function buscarProdutos(nome = "") {
        const sequenciaAtual = ++buscaSequencia.current;
        setCarregandoProdutos(true);
        setErroProdutos("");
        return api.get("/produtos", {
            params: {
                nome: nome || undefined
            }
        })
            .then((response) => {
                if (sequenciaAtual === buscaSequencia.current) {
                    setProdutos(Array.isArray(response.data) ? response.data : []);
                    setCarregandoProdutos(false);
                }
            })
            .catch((erro) => {
                console.error(erro);
                if (sequenciaAtual === buscaSequencia.current) {
                    setErroProdutos(erro.response?.data?.message || "Não foi possível carregar os produtos.");
                    setCarregandoProdutos(false);
                }
            });
    }

    useEffect(() => {
        buscarProdutos();
    }, []);


    function cadastrarProduto(produto) {
        return api.post("/produtos", produto)
            .then((response) => {
                setPaginaAtual(1);
                buscarProdutos(busca);
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
        return api.put(`/produtos/${produto.id}`, {
            nome: produto.nome,
            descricao: produto.descricao,
            precoVenda: produto.precoVenda,
            ativo: produto.ativo,
        })
            .then((response) => {
                buscarProdutos(busca);
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
                buscarProdutos(busca);

                setProdutoRemocao(null);

                setMensagemSucesso("Produto removido com sucesso!");

                setTimeout(() => {
                    setMensagemSucesso("");
                }, 3000);
            })
            .catch((erro) => {
                console.error(erro);
                alert(erro.response?.data?.message || "Erro ao remover produto.");
            });
    }

    function alterarStatus(produto) {
        setProdutoConfirmacao(produto);
        setModalConfirmacaoOpen(true);
    }

    function confirmarAlteracaoStatus() {
    const novoStatus = !produtoConfirmacao.ativo;

    api.patch(
        `/produtos/${produtoConfirmacao.id}/ativo`,
        {
            ativo: novoStatus
        }
    )
        .then(() => {
            buscarProdutos(busca);

            setModalConfirmacaoOpen(false);

            setMensagemSucesso(
                novoStatus
                    ? "Produto ativado com sucesso!"
                    : "Produto desativado com sucesso!"
            );

            setTimeout(() => {
                setMensagemSucesso("");
            }, 3000);
        })
        .catch((erro) => {
            console.error(erro);
            alert(erro.response?.data?.message || "Erro ao alterar o status do produto.");
        });
}

    function abrirModalVisualizar(produto) {
        setProdutoVisualizado(produto);
        setModalVisualizarOpen(true);
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
                            type="search"
                            placeholder="Buscar produto"
                            aria-label="Buscar produto por nome"
                            value={busca}
                            onChange={(e) => {
                                const valor = e.target.value;

                                setBusca(valor);
                                setPaginaAtual(1);
                                buscarProdutos(valor);
                            }}
                        />

                    </div>

                    {carregandoProdutos ? (
                        <LoadingState className="produtos-vazio" label="Carregando produtos…" />
                    ) : erroProdutos ? (
                        <p className="produtos-vazio" role="alert">{erroProdutos}</p>
                    ) : produtosPaginados.length > 0 ? (
                        <>
                            <TabelaProdutos
                                produtos={produtosPaginados}
                                onEditar={abrirModalEditar}
                                onAlterarStatus={alterarStatus}
                                onRemover={abrirModalRemover}
                                onVisualizar={abrirModalVisualizar}
                            />

                            <Paginacao
                                paginaAtual={paginaAtual}
                                totalPaginas={totalPaginas}
                                onAnterior={() => setPaginaAtual((pagina) => pagina - 1)}
                                onProximo={() => setPaginaAtual((pagina) => pagina + 1)}
                            />
                        </>
                    ) : (
                        <p className="produtos-vazio">
                            {busca ? "Nenhum produto encontrado para essa busca." : "Nenhum produto cadastrado."}
                        </p>
                    )}

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

            <ModalVisualizarProduto
                open={modalVisualizarOpen}
                produto={produtoVisualizado}
                onClose={() => {
                    setModalVisualizarOpen(false);
                    setProdutoVisualizado(null);
                }}
            />


        </div>
    );
}

export default Produtos;
