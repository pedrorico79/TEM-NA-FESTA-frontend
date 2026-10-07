import { useEffect, useState } from "react";

import Menu from "../shared/menu/Menu";
import BotaoAdicionar from "../shared/botaoAdicionar/BotaoAdicionar";
import TabelaEventos from "../eventos/TabelaEventos";
import ModalEditarEvento from "../eventos/ModalEditarEvento";
import ModalNovoEvento from "../eventos/ModalNovoEvento";
import ModalVisualizarEvento from "../eventos/ModalVisualizarEvento";
import Paginacao from "../shared/paginacao/Paginacao";
import LoadingState from "../shared/LoadingState";
import { api } from "../../services/api";
import ModalConfirmacao from "../shared/modal/ModalConfirmacao";
import "../css/Eventos.css";

function Eventos() {
    const [eventos, setEventos] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalNovoOpen, setModalNovoOpen] = useState(false);
    const [eventoSelecionado, setEventoSelecionado] = useState(null);
    const [mensagemSucesso, setMensagemSucesso] = useState("");
    const [mensagemErro, setMensagemErro] = useState("");
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [modalConfirmacaoOpen, setModalConfirmacaoOpen] = useState(false);
    const [eventoConfirmacao, setEventoConfirmacao] = useState(null);
    const [eventoRemocao, setEventoRemocao] = useState(null);
    const [busca, setBusca] = useState("");
    const [carregandoEventos, setCarregandoEventos] = useState(true);
    const [erroEventos, setErroEventos] = useState("");
    const [eventoVisualizado, setEventoVisualizado] = useState(null);
    const [modalVisualizarOpen, setModalVisualizarOpen] = useState(false);
    const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);
    const [erroDetalhe, setErroDetalhe] = useState("");

    const eventosPorPagina = 7;

    function buscarEventos() {
        setCarregandoEventos(true);
        setErroEventos("");
        api.get("/eventos")
            .then((response) => {
                setEventos(Array.isArray(response.data) ? response.data : []);
            })
            .catch((erro) => {
                console.error("ERRO AO BUSCAR EVENTOS:", erro);
                setErroEventos(erro.response?.data?.message || "Não foi possível carregar os eventos.");
            })
            .finally(() => {
                setCarregandoEventos(false);
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

    useEffect(() => {
        if (paginaAtual > totalPaginas) setPaginaAtual(totalPaginas);
    }, [paginaAtual, totalPaginas]);

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

    function abrirModalVisualizar(evento) {
        setEventoVisualizado(evento);
        setModalVisualizarOpen(true);
        setCarregandoDetalhe(true);
        setErroDetalhe("");

        api.get(`/eventos/${evento.id}`)
            .then((response) => setEventoVisualizado(response.data))
            .catch((erro) => {
                console.error("ERRO AO BUSCAR DETALHES DO EVENTO:", erro);
                setErroDetalhe(erro.response?.data?.message || "Não foi possível carregar os detalhes do evento.");
            })
            .finally(() => setCarregandoDetalhe(false));
    }

    function editarEvento(evento) {
        return api.put(`/eventos/${evento.id}`, {
            nome: evento.nome,
            dataInicio: evento.dataInicio,
            dataFim: evento.dataFim
        })
            .then((response) => {
                buscarEventos();
                return response.data;
            })
            .catch((erro) => {
                console.error("ERRO AO EDITAR EVENTO:", erro);
                console.error(
                    "RESPOSTA DO BACKEND:",
                    erro.response?.data
                );
                throw erro;
            });
    }

    function abrirModalRemover(evento) {
        setEventoRemocao(evento);
    }

    function removerEvento() {
        return api.delete(`/eventos/${eventoRemocao.id}`)
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
                console.error("ERRO AO REMOVER EVENTO:", erro);
                setMensagemErro(erro.response?.data?.message || "Não foi possível remover o evento.");
                setTimeout(() => setMensagemErro(""), 3000);
            });
    }

    function alterarStatus(evento) {
        setEventoConfirmacao(evento);
        setModalConfirmacaoOpen(true);
    }

    function confirmarAlteracaoStatus() {
        const novoStatus = !eventoConfirmacao.ativo;

        return api.patch(
            `/eventos/${eventoConfirmacao.id}`,
            {
                ativo: novoStatus
            }
        )
            .then((response) => {
                const eventoAtualizado = response.data;
                setEventos((atuais) => atuais.map((evento) =>
                    evento.id === eventoAtualizado.id ? eventoAtualizado : evento
                ));

                setModalConfirmacaoOpen(false);

                setMensagemSucesso(
                    novoStatus
                        ? "Evento ativado com sucesso!"
                        : "Evento desativado com sucesso!"
                );

                setTimeout(() => {
                    setMensagemSucesso("");
                }, 3000);
            })
            .catch((erro) => {
                console.error("STATUS:", erro.response?.status);
                console.error(
                    "ERRO BACKEND:",
                    erro.response?.data
                );
                setMensagemErro(erro.response?.data?.message || "Não foi possível alterar o status do evento.");
                setTimeout(() => setMensagemErro(""), 3000);
            });
    }

    return (
        <div className="eventos-layout">

            {mensagemSucesso && (
                <div className="mensagem-sucesso">
                    {mensagemSucesso}
                </div>
            )}

            {mensagemErro && (
                <div className="mensagem-erro-evento" role="alert">
                    {mensagemErro}
                </div>
            )}

            <Menu active="eventos" />

            <main className="eventos-content">

                <h1>Gestão de Eventos</h1>

                <div className="card-padrao">

                    <div className="eventos-topo">

                        <BotaoAdicionar
                            text="Adicionar Novo Evento"
                            size="medium"
                            onClick={() => setModalNovoOpen(true)}
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

                    {carregandoEventos ? (
                        <LoadingState className="eventos-estado" label="Carregando eventos…" />
                    ) : erroEventos ? (
                        <p className="eventos-estado" role="alert">{erroEventos}</p>
                    ) : eventosFiltrados.length === 0 ? (
                        <p className="eventos-estado">
                            {busca ? "Nenhum evento encontrado para essa busca." : "Nenhum evento cadastrado."}
                        </p>
                    ) : (
                        <>
                            <TabelaEventos
                                eventos={eventosPaginados}
                                onEditar={abrirModalEditar}
                                onAlterarStatus={alterarStatus}
                                onRemover={abrirModalRemover}
                                onVisualizar={abrirModalVisualizar}
                            />

                            <Paginacao
                                paginaAtual={paginaAtual}
                                totalPaginas={totalPaginas}
                                onAnterior={() => setPaginaAtual((pagina) => Math.max(1, pagina - 1))}
                                onProximo={() => setPaginaAtual((pagina) => Math.min(totalPaginas, pagina + 1))}
                            />
                        </>
                    )}

                </div>

            </main>

            <ModalEditarEvento
                open={modalOpen}
                Evento={eventoSelecionado}
                onClose={() => setModalOpen(false)}
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
                onClose={() => setModalNovoOpen(false)}
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

            <ModalVisualizarEvento
                open={modalVisualizarOpen}
                evento={eventoVisualizado}
                carregando={carregandoDetalhe}
                erro={erroDetalhe}
                onClose={() => setModalVisualizarOpen(false)}
            />

            <ModalConfirmacao
                open={modalConfirmacaoOpen}
                onClose={() =>
                    setModalConfirmacaoOpen(false)
                }
                onConfirmar={confirmarAlteracaoStatus}
                mensagem={`Tem certeza que deseja ${
                    eventoConfirmacao?.ativo
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
                        Tem certeza que deseja remover o evento{" "}
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
