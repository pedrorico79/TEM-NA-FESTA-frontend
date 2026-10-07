import { useEffect, useRef, useState } from "react";

import Menu from "../shared/menu/Menu";
import BotaoAdicionar from "../shared/botaoAdicionar/BotaoAdicionar";
import TabelaClientes from "../clientes/TabelaClientes";
import ModalEditarCliente from "../clientes/ModalEditarCliente";
import ModalNovoCliente from "../clientes/ModalNovoCliente";
import ModalVisualizarCliente from "../clientes/ModalVisualizarCliente";
import Paginacao from "../shared/paginacao/Paginacao";
import LoadingState from "../shared/LoadingState";
import { api } from "../../services/api";
import ModalConfirmacao from "../shared/modal/ModalConfirmacao";

import "../css/Clientes.css";

function Clientes() {

    const [clientes, setClientes] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalNovoOpen, setModalNovoOpen] = useState(false);

    const [clienteSelecionado, setClienteSelecionado] = useState(null);

    const [alerta, setAlerta] = useState(null);
    const timeoutAlerta = useRef(null);

    const [paginaAtual, setPaginaAtual] = useState(1);

    const [modalConfirmacaoOpen, setModalConfirmacaoOpen] = useState(false);
    const [clienteConfirmacao, setClienteConfirmacao] = useState(null);

    const [clienteRemocao, setClienteRemocao] = useState(null);

    const [busca, setBusca] = useState("");

    const [modalVisualizarOpen, setModalVisualizarOpen] = useState(false);
    const [clienteVisualizado, setClienteVisualizado] = useState(null);
    const requisicaoBuscaAtual = useRef(0);
    const [carregando, setCarregando] = useState(false);
    const [erroBusca, setErroBusca] = useState("");

    const itensPorPagina = 7;

    const clientesFiltrados = clientes;

    const totalPaginas = Math.ceil(
        clientesFiltrados.length / itensPorPagina
    );

    const indiceInicial = (paginaAtual - 1) * itensPorPagina;

    const clientesPaginados = clientesFiltrados.slice(
        indiceInicial,
        indiceInicial + itensPorPagina
    );

    function mostrarAlerta(mensagem, tipo = "sucesso") {
        window.clearTimeout(timeoutAlerta.current);
        setAlerta({ mensagem, tipo });
        timeoutAlerta.current = window.setTimeout(() => setAlerta(null), 3000);
    }

    function buscarClientes(busca = "") {
        const requisicao = ++requisicaoBuscaAtual.current;
        setCarregando(true);
        setErroBusca("");
        api.get("/clientes", {
            params: {
                busca: busca || undefined
            }
        })
            .then((response) => {
                if (requisicao === requisicaoBuscaAtual.current) {
                    setClientes(response.data);
                    setCarregando(false);
                }
            })
            .catch((erro) => {
                if (requisicao === requisicaoBuscaAtual.current) {
                    console.error("Erro ao buscar clientes:", erro.response?.data || erro);
                    setErroBusca(erro.response?.data?.message || "Não foi possível carregar os clientes.");
                    setCarregando(false);
                }
            });
    }

    useEffect(() => {
        buscarClientes();
    }, []);

    useEffect(() => {
        if (totalPaginas > 0 && paginaAtual > totalPaginas) {
            setPaginaAtual(totalPaginas);
        }
    }, [paginaAtual, totalPaginas]);

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
        const enderecoInformado = [cliente.cep, cliente.logradouro, cliente.numero,
            cliente.complemento, cliente.bairro, cliente.cidade, cliente.estado]
            .some((valor) => valor?.trim());
        const dadosCliente = {
            nome: cliente.nome,
            telefone: cliente.telefone,
            whatsapp: cliente.whatsapp,
            instagram: cliente.instagram,
            anotacoes: cliente.anotacoes,
            endereco: enderecoInformado ? {
                cep: cliente.cep?.replace(/\D/g, ""),
                logradouro: cliente.logradouro,
                numero: cliente.numero,
                complemento: cliente.complemento,
                bairro: cliente.bairro,
                cidade: cliente.cidade,
                estado: cliente.estado
            } : null
        };

        const responseCliente = await api.post("/clientes", dadosCliente);

        setPaginaAtual(1);
        buscarClientes(busca);

        return responseCliente.data;
    } catch (erro) {
        throw erro;
    }
}

    async function editarCliente(cliente) {
    try {
        const enderecoInformado = [cliente.cep, cliente.logradouro, cliente.numero,
            cliente.complemento, cliente.bairro, cliente.cidade, cliente.estado]
            .some((valor) => valor?.trim());
        const dadosCliente = {
            nome: cliente.nome,
            telefone: cliente.telefone,
            whatsapp: cliente.whatsapp,
            instagram: cliente.instagram,
            anotacoes: cliente.anotacoes,
            endereco: enderecoInformado ? {
                cep: cliente.cep?.replace(/\D/g, ""),
                logradouro: cliente.logradouro,
                numero: cliente.numero,
                complemento: cliente.complemento,
                bairro: cliente.bairro,
                cidade: cliente.cidade,
                estado: cliente.estado
            } : null
        };

        const responseCliente = await api.put(
            `/clientes/${cliente.id}`,
            dadosCliente
        );

        buscarClientes(busca);

        return responseCliente.data;

    } catch (erro) {
        throw erro;
    }
}

    function abrirModalRemover(cliente) {
        setClienteRemocao(cliente);
    }

    function removerCliente() {

        return api.delete(`/clientes/${clienteRemocao.id}`)
            .then(() => {

                buscarClientes(busca);

                setClienteRemocao(null);

                mostrarAlerta("Cliente removido com sucesso!");

            })
            .catch((erro) => {

                console.error(erro);
                mostrarAlerta(erro.response?.status === 422
                    ? "Não é possível remover este cliente porque ele possui pedidos em andamento."
                    : erro.response?.data?.message || "Erro ao remover cliente.", "erro");

            });
    }

    function alterarStatus(cliente) {

        setClienteConfirmacao(cliente);
        setModalConfirmacaoOpen(true);
    }

    function confirmarAlteracaoStatus() {
        const novoStatus = !clienteConfirmacao.ativo;

        api.patch(
            `/clientes/${clienteConfirmacao.id}/ativo`,
            {
                ativo: novoStatus
            }
        )
            .then(() => {
                buscarClientes(busca);

                setModalConfirmacaoOpen(false);

                mostrarAlerta(novoStatus
                    ? "Cliente ativado com sucesso!"
                    : "Cliente desativado com sucesso!");
            })
            .catch((erro) => {
                mostrarAlerta(erro.response?.status === 422
                    ? "Não é possível desativar este cliente porque ele possui pedidos em andamento."
                    : erro.response?.data?.message || "Erro ao alterar o status do cliente.", "erro");
            });
    }

    return (

        <div className="clientes-layout">

            {alerta && (
                <div className={`alerta-cliente ${alerta.tipo}`} role={alerta.tipo === "erro" ? "alert" : "status"}>
                    {alerta.mensagem}
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
                            type="search"
                            placeholder="Buscar cliente"
                            aria-label="Buscar por nome, telefone, WhatsApp ou Instagram"
                            value={busca}
                            onChange={(e) => {
                                const valor = e.target.value;

                                setBusca(valor);
                                setPaginaAtual(1);
                                buscarClientes(valor);
                            }}
                        />

                    </div>

                    {carregando ? (
                        <LoadingState className="clientes-estado" label="Carregando clientes…" />
                    ) : erroBusca ? (
                        <div className="clientes-estado clientes-estado-erro" role="alert">
                            <span>{erroBusca}</span>
                            <button type="button" onClick={() => buscarClientes(busca)}>Tentar novamente</button>
                        </div>
                    ) : clientesPaginados.length > 0 ? (
                        <TabelaClientes
                            clientes={clientesPaginados}
                            onEditar={abrirModalEditar}
                            onAlterarStatus={alterarStatus}
                            onRemover={abrirModalRemover}
                            onVisualizar={abrirModalVisualizar}
                        />
                    ) : (
                        <p className="clientes-estado">
                            {busca ? "Nenhum cliente encontrado para essa busca." : "Nenhum cliente cadastrado."}
                        </p>
                    )}

                    {totalPaginas > 1 && (
                        <Paginacao
                            paginaAtual={paginaAtual}
                            totalPaginas={totalPaginas}
                            onAnterior={() => setPaginaAtual((pagina) => pagina - 1)}
                            onProximo={() => setPaginaAtual((pagina) => pagina + 1)}
                        />
                    )}

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
                    mostrarAlerta("Cliente editado com sucesso!");
                }}
                onErro={(mensagem) => mostrarAlerta(mensagem, "erro")}
            />

            <ModalNovoCliente
                open={modalNovoOpen}
                onClose={() =>
                    setModalNovoOpen(false)
                }
                onSalvar={cadastrarCliente}
                onSucesso={() => {
                    mostrarAlerta("Cliente cadastrado com sucesso!");
                }}
                onErro={(mensagem) => mostrarAlerta(mensagem, "erro")}
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
                onClose={() => setModalConfirmacaoOpen(false)}
                onConfirmar={confirmarAlteracaoStatus}
                mensagem={`Tem certeza que deseja ${clienteConfirmacao?.ativo
                        ? "desativar"
                        : "ativar"
                    } o cliente ${clienteConfirmacao?.nome || ""
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
