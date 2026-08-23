import { useEffect, useState } from "react";

import Menu from "../shared/Menu/Menu";

import BotaoAdicionar from "../shared/botaoAdicionar/BotaoAdicionar";

import TabelaEventos from "../eventos/TabelaEventos";

import ModalEditarEvento from "../eventos/ModalEditarEvento";

import ModalNovoEvento from "../eventos/ModalNovoEvento";

import Paginacao from "../shared/paginacao/Paginacao";

import { api } from "../../services/api";

import ModalConfirmacao from "../shared/modal/ModalConfirmacao";

import "../css/Eventos.css";

function Eventos() {

    const [eventos, setEventos] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);

    const [modalNovoOpen, setModalNovoOpen] = useState(false);

    const [eventoSelecionado, setEventoSelecionado] = useState(null);

    const [mensagemSucesso, setMensagemSucesso] = useState("");

    const [paginaAtual, setPaginaAtual] = useState(1);

    const [modalConfirmacaoOpen, setModalConfirmacaoOpen] = useState(false);

    const [eventoConfirmacao, setEventoConfirmacao] = useState(null);

    const [eventoRemocao, setEventoRemocao] = useState(null);

    const [busca, setBusca] = useState("");

    const eventosPorPagina = 7;

    function buscarEventos() {

        api.get("/eventos", {
            params: {
                apenasAtivas: false
            }
        })

            .then((response) => {

                console.log("Eventos recebidos:", response.data);

                setEventos(response.data);

            })

            .catch((erro) => {

                console.error("ERRO AO BUSCAR EVENTOS:", erro);

            });

    }

    useEffect(() => {

        buscarEventos();

    }, []);

    const eventosFiltrados = eventos.filter((evento) => {

        const nomeEvento = evento.nome
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        const buscaNormalizada = busca
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        return nomeEvento?.includes(buscaNormalizada);

    });

    const totalPaginas = Math.max(
        1,
        Math.ceil(eventosFiltrados.length / eventosPorPagina)
    );

    const indiceInicial = (paginaAtual - 1) * eventosPorPagina;

    const eventosPaginados = eventosFiltrados.slice(
        indiceInicial,
        indiceInicial + eventosPorPagina
    );

    function cadastrarEvento(evento) {

        return api.post("/eventos", evento)

            .then((response) => {

                setPaginaAtual(1);

                buscarEventos();

                return response.data;

            })

            .catch((erro) => {

                console.error("ERRO:", erro);

                console.error(
                    "RESPOSTA DO BACKEND:",
                    erro.response?.data
                );

                throw erro;

            });

    }

    function abrirModalEditar(evento) {

        setEventoSelecionado(evento);

        setModalOpen(true);

    }

    function editarEvento(evento) {

        return api.put(`/eventos/${evento.id}`, evento)

            .then((response) => {

                buscarEventos();

                return response.data;

            })

            .catch((erro) => {

                console.error(erro);

                throw erro;

            });

    }

    function abrirModalRemover(evento) {

        setEventoRemocao(evento);

    }

    function removerEvento() {

        api.delete(`/eventos/${eventoRemocao.id}`)

            .then(() => {

                buscarEventos();

                setEventoRemocao(null);

                setMensagemSucesso(
                    "Evento removido com sucesso!"
                );

                setTimeout(() => {

                    setMensagemSucesso("");

                }, 3000);

            })

            .catch((erro) => {

                console.error(erro);

                alert("Erro ao remover evento.");

            });

    }

    function alterarStatus(evento) {

        setEventoConfirmacao(evento);

        setModalConfirmacaoOpen(true);

    }

    function confirmarAlteracaoStatus() {

        api.patch(
            `/eventos/${eventoConfirmacao.id}/ativo`
        )

            .then(() => {

                buscarEventos();

                setModalConfirmacaoOpen(false);

                setMensagemSucesso(

                    eventoConfirmacao.ativa

                        ? "Evento desativado com sucesso!"

                        : "Evento ativado com sucesso!"

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

        <div className="eventos-layout">

            {mensagemSucesso && (

                <div className="mensagem-sucesso">

                    {mensagemSucesso}

                </div>

            )}

            <Menu active="eventos" />

            <div className="eventos-content">

                <h1>Gestão de Eventos</h1>

                <div className="card-padrao">

                    <div className="eventos-topo">

                        <BotaoAdicionar
                            text="Adicionar Novo Evento"
                            size="medium"
                            onClick={() =>
                                setModalNovoOpen(true)
                            }
                        />

                        <input
                            placeholder="Buscar evento"
                            value={busca}
                            onChange={(e) => {

                                setBusca(e.target.value);

                                setPaginaAtual(1);

                            }}
                        />

                    </div>

                    <TabelaEventos
                        eventos={eventosPaginados}
                        onEditar={abrirModalEditar}
                        onAlterarStatus={alterarStatus}
                        onRemover={abrirModalRemover}
                    />

                    <Paginacao
                        paginaAtual={paginaAtual}
                        totalPaginas={totalPaginas}
                        onAnterior={() =>
                            setPaginaAtual((pagina) =>
                                Math.max(1, pagina - 1)
                            )
                        }
                        onProximo={() =>
                            setPaginaAtual((pagina) =>
                                Math.min(
                                    totalPaginas,
                                    pagina + 1
                                )
                            )
                        }
                    />

                </div>

            </div>

            <ModalEditarEvento
                open={modalOpen}
                evento={eventoSelecionado}
                onClose={() =>
                    setModalOpen(false)
                }
                onSalvar={editarEvento}
                onSucesso={() => {

                    setMensagemSucesso(
                        "Evento editado com sucesso!"
                    );

                    setTimeout(() => {

                        setMensagemSucesso("");

                    }, 3000);

                }}
            />

            <ModalNovoEvento
                open={modalNovoOpen}
                onClose={() =>
                    setModalNovoOpen(false)
                }
                onSalvar={cadastrarEvento}
                onSucesso={() => {

                    setMensagemSucesso(
                        "Evento cadastrado com sucesso!"
                    );

                    setTimeout(() => {

                        setMensagemSucesso("");

                    }, 3000);

                }}
            />

            <ModalConfirmacao
                open={modalConfirmacaoOpen}
                onClose={() =>
                    setModalConfirmacaoOpen(false)
                }
                onConfirmar={
                    confirmarAlteracaoStatus
                }
                mensagem={`Tem certeza que deseja ${
                    eventoConfirmacao?.isAtivo
                        ? "desativar"
                        : "ativar"
                } o evento ${
                    eventoConfirmacao?.nome || ""
                }?`}
            />

            <ModalConfirmacao
                open={!!eventoRemocao}
                onClose={() =>
                    setEventoRemocao(null)
                }
                onConfirmar={removerEvento}
                mensagem={
                    <>
                        Tem certeza que deseja remover
                        o evento{" "}
                        {eventoRemocao?.nome || ""}?

                        <br />
                        <br />

                        Essa ação não pode ser desfeita.
                    </>
                }
            />

        </div>

    );

}

export default Eventos;