import { useEffect, useState } from "react";

import Menu from "../shared/Menu/Menu";
import BotaoAdicionar from "../shared/botaoAdicionar/BotaoAdicionar";
import TabelaClientes from "../clientes/TabelaClientes";
import ModalEditarCliente from "../clientes/ModalEditarCliente";
import ModalNovoCliente from "../clientes/ModalNovoCliente";
import ModalVisualizarCliente from "../clientes/ModalVisualizarCliente";
import Paginacao from "../shared/paginacao/Paginacao";
import { api } from "../../services/api";
import ModalConfirmacao from "../shared/modal/ModalConfirmacao";

import "../css/Clientes.css";

function Clientes() {

    const [clientes, setClientes] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalNovoOpen, setModalNovoOpen] = useState(false);

    const [clienteSelecionado, setClienteSelecionado] = useState(null);

    const [mensagemSucesso, setMensagemSucesso] = useState("");

    const [paginaAtual, setPaginaAtual] = useState(1);

    const [modalConfirmacaoOpen, setModalConfirmacaoOpen] = useState(false);
    const [clienteConfirmacao, setClienteConfirmacao] = useState(null);

    const [clienteRemocao, setClienteRemocao] = useState(null);

    const [busca, setBusca] = useState("");

    const [modalVisualizarOpen, setModalVisualizarOpen] = useState(false);
    const [clienteVisualizado, setClienteVisualizado] = useState(null);

    const itensPorPagina = 7;

    const clientesFiltrados = (clientes || []).filter((cliente) =>
        cliente.nome
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .includes(
                busca
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
            )
    );

    const totalPaginas = Math.ceil(
        clientesFiltrados.length / itensPorPagina
    );

    const indiceInicial = (paginaAtual - 1) * itensPorPagina;

    const clientesPaginados = clientesFiltrados.slice(
        indiceInicial,
        indiceInicial + itensPorPagina
    );

    function buscarClientes() {

        api.get("/clientes")
            .then((response) => {
                setClientes(response.data);
            })
            .catch((erro) => {
                console.error(erro);
            });
    }

    useEffect(() => {
        buscarClientes();
    }, []);

    function abrirModalEditar(cliente) {
        setClienteSelecionado(cliente);
        setModalOpen(true);
    }

    function abrirModalVisualizar(cliente) {
        setClienteVisualizado(cliente);
        setModalVisualizarOpen(true);
    }

    async function cadastrarCliente(cliente) {

        try {

            const responseEndereco = await api.post(
                "/enderecos",
                {
                    cep: cliente.cep,
                    logradouro: cliente.logradouro,
                    numero: cliente.numero,
                    complemento: cliente.complemento,
                    bairro: cliente.bairro,
                    cidade: cliente.cidade,
                    estado: cliente.estado
                }
            );

            const enderecoId = responseEndereco.data.id;

            const dadosCliente = {
                nome: cliente.nome,
                telefone: cliente.telefone,
                whatsapp: cliente.whatsapp,
                instagram: cliente.instagram,
                anotacoes: cliente.anotacoes,
                enderecoId
            };

            console.log("CLIENTE ENVIADO:", dadosCliente);

            const responseCliente = await api.post(
                "/clientes",
                dadosCliente
            );

            setPaginaAtual(1);
            buscarClientes();

            return responseCliente.data;

        } catch (erro) {

            console.error("STATUS:", erro.response?.status);
            console.error("ERRO BACKEND:", erro.response?.data);

            throw erro;
        }
    }

    async function editarCliente(cliente) {

        try {

            await api.put(
                `/enderecos/${cliente.enderecoId}`,
                {
                    cep: cliente.cep,
                    logradouro: cliente.logradouro,
                    numero: cliente.numero,
                    complemento: cliente.complemento,
                    bairro: cliente.bairro,
                    cidade: cliente.cidade,
                    estado: cliente.estado
                }
            );

            const responseCliente = await api.put(
                `/clientes/${cliente.id}`,
                {
                    nome: cliente.nome,
                    telefone: cliente.telefone,
                    whatsapp: cliente.whatsapp,
                    instagram: cliente.instagram,
                    anotacoes: cliente.anotacoes,
                    enderecoId: cliente.enderecoId
                }
            );

            buscarClientes();

            return responseCliente.data;

        } catch (erro) {

            console.error(erro);
            throw erro;
        }
    }

    function abrirModalRemover(cliente) {
        setClienteRemocao(cliente);
    }

    function removerCliente() {

        return api.delete(`/clientes/${clienteRemocao.id}`)
            .then(() => {

                buscarClientes();

                setClienteRemocao(null);

                setMensagemSucesso(
                    "Cliente removido com sucesso!"
                );

                setTimeout(() => {
                    setMensagemSucesso("");
                }, 3000);

            })
            .catch((erro) => {

                console.error(erro);
                alert("Erro ao remover cliente.");

            });
    }

    function alterarStatus(cliente) {

        setClienteConfirmacao(cliente);
        setModalConfirmacaoOpen(true);
    }

    function confirmarAlteracaoStatus() {

        api.patch(`/clientes/${clienteConfirmacao.id}/ativo`)
            .then(() => {

                buscarClientes();

                setModalConfirmacaoOpen(false);

                setMensagemSucesso(
                    clienteConfirmacao.isAtivo
                        ? "Cliente desativado com sucesso!"
                        : "Cliente ativado com sucesso!"
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

        <div className="clientes-layout">

            {mensagemSucesso && (
                <div className="mensagem-sucesso">
                    {mensagemSucesso}
                </div>
            )}

            <Menu active="clientes" />

            <div className="clientes-content">

                <h1>Gestão de Clientes</h1>

                <div className="card-padrao">

                    <div className="clientes-topo">

                        <BotaoAdicionar
                            text="Adicionar Novo Cliente"
                            size="medium"
                            onClick={() =>
                                setModalNovoOpen(true)
                            }
                        />

                        <input
                            placeholder="Buscar cliente"
                            value={busca}
                            onChange={(e) => {
                                setBusca(e.target.value);
                                setPaginaAtual(1);
                            }}
                        />

                    </div>

                    <TabelaClientes
                        clientes={clientesPaginados}
                        onEditar={abrirModalEditar}
                        onAlterarStatus={alterarStatus}
                        onRemover={abrirModalRemover}
                        onVisualizar={abrirModalVisualizar}
                    />

                    <Paginacao
                        paginaAtual={paginaAtual}
                        totalPaginas={totalPaginas}
                        onAnterior={() =>
                            setPaginaAtual(paginaAtual - 1)
                        }
                        onProximo={() =>
                            setPaginaAtual(paginaAtual + 1)
                        }
                    />

                </div>

            </div>

            <ModalEditarCliente
                open={modalOpen}
                cliente={clienteSelecionado}
                onClose={() =>
                    setModalOpen(false)
                }
                onSalvar={editarCliente}
                onSucesso={() => {

                    setMensagemSucesso(
                        "Cliente editado com sucesso!"
                    );

                    setTimeout(() => {
                        setMensagemSucesso("");
                    }, 3000);

                }}
            />

            <ModalNovoCliente
                open={modalNovoOpen}
                onClose={() =>
                    setModalNovoOpen(false)
                }
                onSalvar={cadastrarCliente}
                onSucesso={() => {

                    setMensagemSucesso(
                        "Cliente cadastrado com sucesso!"
                    );

                    setTimeout(() => {
                        setMensagemSucesso("");
                    }, 3000);

                }}
            />

            <ModalVisualizarCliente
                open={modalVisualizarOpen}
                cliente={clienteVisualizado}
                onClose={() => {
                    setModalVisualizarOpen(false);
                    setClienteVisualizado(null);
                }}
            />

            <ModalConfirmacao
                open={modalConfirmacaoOpen}
                onClose={() =>
                    setModalConfirmacaoOpen(false)
                }
                onConfirmar={confirmarAlteracaoStatus}
                mensagem={`Tem certeza que deseja ${
                    clienteConfirmacao?.isAtivo
                        ? "desativar"
                        : "ativar"
                } o cliente ${
                    clienteConfirmacao?.nome || ""
                }?`}
            />

            <ModalConfirmacao
                open={!!clienteRemocao}
                onClose={() =>
                    setClienteRemocao(null)
                }
                onConfirmar={removerCliente}
                mensagem={
                    <>
                        Tem certeza que deseja remover o cliente{" "}
                        {clienteRemocao?.nome || ""}?

                        <br />
                        <br />

                        Essa ação não pode ser desfeita.
                    </>
                }
            />

        </div>
    );
}

export default Clientes;