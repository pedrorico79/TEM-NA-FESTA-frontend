import { useEffect, useState } from "react";

import Menu from "../shared/Menu/Menu";
import BotaoAdicionar from "../shared/botaoAdicionar/BotaoAdicionar";

import TabelaProdutos from "../produtos/TabelaProdutos";
import ModalEditarProduto from "../produtos/ModalEditarProduto";
import ModalNovoProduto from "../produtos/ModalNovoProduto";
import Paginacao from "../shared/paginacao/Paginacao";

import "../css/Produtos.css";

function Produtos() {

    const [produtos, setProdutos] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);

    const [modalNovoOpen, setModalNovoOpen] = useState(false);

    const [produtoSelecionado, setProdutoSelecionado] = useState(null);

    const [paginaAtual, setPaginaAtual] = useState(1);

    const itensPorPagina = 7;

    useEffect(() => {
        buscarProdutos();
    }, []);

    async function buscarProdutos() {

        const dados = [
            {
                id: 1,
                nome: "Brigadeiro",
                descricao: "Tradicional",
                valor: 10,
                ativo: true,
            },
            {
                id: 2,
                nome: "Bolacha Recheada",
                descricao: "Chocolate",
                valor: 20,
                ativo: false,
            },
            {
                id: 3,
                nome: "Cupcake de Morango",
                descricao: "Com chantilly",
                valor: 15,
                ativo: true,
            },
            {
                id: 4,
                nome: "Trufa de Maracujá",
                descricao: "Recheio cremoso",
                valor: 8,
                ativo: true,
            },
            {
                id: 5,
                nome: "Bolo de Cenoura",
                descricao: "Cobertura de chocolate",
                valor: 55,
                ativo: false,
            },
            {
                id: 6,
                nome: "Kit Festa Pequeno",
                descricao: "Serve 10 pessoas",
                valor: 120,
                ativo: true,
            },
            {
                id: 7,
                nome: "Kit Festa Grande",
                descricao: "Serve 30 pessoas",
                valor: 320,
                ativo: true,
            },
            {
                id: 8,
                nome: "Mini Donuts",
                descricao: "Caixa com 12",
                valor: 25,
                ativo: false,
            },
            {
                id: 9,
                nome: "Pirulito de Chocolate",
                descricao: "Tema infantil",
                valor: 6,
                ativo: true,
            },
            {
                id: 10,
                nome: "Macaron",
                descricao: "Sabores variados",
                valor: 12,
                ativo: true,
            },
            {
                id: 11,
                nome: "Brownie",
                descricao: "Com nozes",
                valor: 14,
                ativo: false,
            },
            {
                id: 12,
                nome: "Bolo Red Velvet",
                descricao: "Cream cheese",
                valor: 85,
                ativo: true,
            },
        ];

        setProdutos(dados);
    }

    async function cadastrarProduto(
        produto
    ) {

        const response =
            await api.post(
                "/produtos",
                produto
            );

        buscarProdutos();

        return response.data;
    }

    function abrirModalEditar(produto) {

        setProdutoSelecionado(produto);

        setModalOpen(true);
    }

    function alterarStatus(id) {

        const novosProdutos = produtos.map((produto) => {

            if (produto.id === id) {

                return {
                    ...produto,
                    ativo: !produto.ativo,
                };
            }

            return produto;
        });

        setProdutos(novosProdutos);
    }

    const indiceInicial =
        (paginaAtual - 1) * itensPorPagina;

    const indiceFinal =
        indiceInicial + itensPorPagina;

    const produtosPaginados =
        produtos.slice(
            indiceInicial,
            indiceFinal
        );

    const totalPaginas =
        Math.ceil(
            produtos.length / itensPorPagina
        );

    return (
        <div className="produtos-layout">

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
                        produtos={produtosPaginados}
                        onEditar={abrirModalEditar}
                        onAlterarStatus={alterarStatus}
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
            />

            <ModalNovoProduto
                open={modalNovoOpen}
                onClose={() =>
                    setModalNovoOpen(false)
                }
                onSalvar={cadastrarProduto}
            />

        </div>
    );
}

export default Produtos;