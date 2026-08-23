import { useEffect, useState } from "react";

import Menu from "../shared/Menu/Menu";

import BotaoAdicionar from "../shared/botaoAdicionar/BotaoAdicionar";

import TabelaUsuarios from "../usuarios/TabelaUsuarios";

import ModalEditarUsuario from "../usuarios/ModalEditarUsuario";

import ModalNovoUsuario from "../usuarios/ModalNovoUsuario";

import ModalAlterarSenhaUsuario from "../usuarios/ModalAlterarSenhaUsuario";

import TelaAutenticacaoSenha from "../usuarios/TelaAutenticacaoSenha";

import Paginacao from "../shared/paginacao/Paginacao";

import { api } from "../../services/api";

import ModalConfirmacao from "../shared/modal/ModalConfirmacao";

import "../css/Usuarios.css";

function Usuarios() {

    const [acessoLiberado, setAcessoLiberado] = useState(false);

    const [usuarios, setUsuarios] = useState([]);

    const [busca, setBusca] = useState("");

    const [modalOpen, setModalOpen] = useState(false);

    const [modalNovoOpen, setModalNovoOpen] = useState(false);

    const [modalSenhaOpen, setModalSenhaOpen] = useState(false);

    const [usuarioselecionado, setUsuarioselecionado] = useState(null);

    const [mensagemSucesso, setMensagemSucesso] = useState("");

    const [paginaAtual, setPaginaAtual] = useState(1);

    const [modalConfirmacaoOpen, setModalConfirmacaoOpen] = useState(false);

    const [usuarioConfirmacao, setUsuarioConfirmacao] = useState(null);

    const [usuarioRemocao, setUsuarioRemocao] = useState(null);

    const usuariosPorPagina = 7;

    function autenticarAcesso(senhaAcesso) {

        const emailAdminLogado = localStorage.getItem("userEmail");

        if (!emailAdminLogado) {

            console.error("E-mail não encontrado no localStorage.");

            return Promise.reject(
                new Error("Sessão expirada. Faça login novamente.")
            );

        }


        return api.post("/usuarios/login", {
            email: emailAdminLogado,
            senha: senhaAcesso,
            rememberMe: false
        }).then(() => {

            setAcessoLiberado(true);

        });

    }

    function buscarUsuarios() {

        if (!acessoLiberado) {


            return;

        }


        api.get("/usuarios", {
            params: {
                apenasAtivos: false
            }
        })

            .then((response) => {


                setUsuarios(response.data);

            })

            .catch((erro) => {

                console.error("ERRO AO BUSCAR USUÁRIOS:", erro);

            });

    }

    useEffect(() => {

        if (acessoLiberado) {

            buscarUsuarios();

        }

    }, [acessoLiberado]);

    const usuariosFiltrados = usuarios.filter((usuario) => {

        const nome = usuario.nome
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        const buscaNormalizada = busca
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        return nome?.includes(buscaNormalizada);

    });

    const totalPaginas = Math.max(
        1,
        Math.ceil(usuariosFiltrados.length / usuariosPorPagina)
    );

    const indiceInicial = (paginaAtual - 1) * usuariosPorPagina;

    const usuariosPaginados = usuariosFiltrados.slice(
        indiceInicial,
        indiceInicial + usuariosPorPagina
    );

    function cadastrarUsuario(usuario) {

        return api.post("/usuarios", usuario)

            .then((response) => {

                setPaginaAtual(1);

                buscarUsuarios();

                return response.data;

            });

    }

    function abrirModalEditar(usuario) {

        setUsuarioselecionado(usuario);

        setModalOpen(true);

    }

    function abrirModalAlterarSenha(usuario) {

        setUsuarioselecionado(usuario);

        setModalSenhaOpen(true);

    }

    function editarUsuario(usuario) {

        return api.put(`/usuarios/${usuario.id}`, usuario)

            .then((response) => {

                buscarUsuarios();

                return response.data;

            });

    }

    function alterarSenhaUsuario({ id, novaSenha }) {

        return api.patch(
            `/usuarios/${id}/senha`,
            { senha: novaSenha }
        )

            .then((response) => {

                buscarUsuarios();

                return response.data;

            });

    }

    function removerUsuario() {

        api.delete(`/usuarios/${usuarioRemocao.id}`)

            .then(() => {

                buscarUsuarios();

                setUsuarioRemocao(null);

                exibirMensagemSucesso(
                    "Usuário removido com sucesso!"
                );

            })

            .catch((erro) => {

                console.error(erro);

                alert("Erro ao remover usuário.");

            });

    }

    function confirmarAlteracaoStatus() {

        api.patch(
            `/usuarios/${usuarioConfirmacao.id}/ativo`
        )

            .then(() => {

                buscarUsuarios();

                setModalConfirmacaoOpen(false);

                const statusMensagem =
                    (usuarioConfirmacao.ativo ||
                        usuarioConfirmacao.isAtivo)
                        ? "Usuário desativado com sucesso!"
                        : "Usuário ativado com sucesso!";

                exibirMensagemSucesso(statusMensagem);

            })

            .catch((erro) => {

                console.error(
                    "Erro ao alterar status do usuário:",
                    erro
                );

            });

    }

    function exibirMensagemSucesso(msg) {

        setMensagemSucesso(msg);

        setTimeout(() => {

            setMensagemSucesso("");

        }, 3000);

    }

    return (

        <div className="usuarios-layout">

            <Menu active="usuarios" />

            {!acessoLiberado ? (

                <TelaAutenticacaoSenha
                    onSucesso={autenticarAcesso}
                />

            ) : (

                <>

                    {mensagemSucesso && (

                        <div className="mensagem-sucesso">

                            {mensagemSucesso}

                        </div>

                    )}

                    <div className="usuarios-content">

                        <h1>Gestão de Usuários</h1>

                        <div className="card-padrao">

                            <div className="usuarios-topo">

                                <BotaoAdicionar
                                    text="Adicionar Novo Usuário"
                                    size="medium"
                                    onClick={() =>
                                        setModalNovoOpen(true)
                                    }
                                />

                                <input
                                    placeholder="Buscar usuário"
                                    value={busca}
                                    onChange={(e) => {

                                        setBusca(e.target.value);

                                        setPaginaAtual(1);

                                    }}
                                />

                            </div>

                            <TabelaUsuarios
                                usuarios={usuariosPaginados}
                                onEditar={abrirModalEditar}
                                onAlterarSenha={
                                    abrirModalAlterarSenha
                                }
                                onAlterarStatus={(u) => {

                                    setUsuarioConfirmacao(u);

                                    setModalConfirmacaoOpen(true);

                                }}
                                onRemover={(u) =>
                                    setUsuarioRemocao(u)
                                }
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

                    <ModalEditarUsuario
                        open={modalOpen}
                        Usuario={usuarioselecionado}
                        onClose={() =>
                            setModalOpen(false)
                        }
                        onSalvar={editarUsuario}
                        onSucesso={() =>
                            exibirMensagemSucesso(
                                "Usuário editado com sucesso!"
                            )
                        }
                    />

                    <ModalAlterarSenhaUsuario
                        open={modalSenhaOpen}
                        Usuario={usuarioselecionado}
                        onClose={() =>
                            setModalSenhaOpen(false)
                        }
                        onSalvarSenha={alterarSenhaUsuario}
                        onSucesso={() =>
                            exibirMensagemSucesso(
                                "Senha alterada com sucesso!"
                            )
                        }
                    />

                    <ModalNovoUsuario
                        open={modalNovoOpen}
                        onClose={() =>
                            setModalNovoOpen(false)
                        }
                        onSalvar={cadastrarUsuario}
                        onSucesso={() =>
                            exibirMensagemSucesso(
                                "Usuário cadastrado com sucesso!"
                            )
                        }
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
                            (
                                usuarioConfirmacao?.ativo ||
                                usuarioConfirmacao?.isAtivo
                            )
                                ? "desativar"
                                : "ativar"
                        } o usuário ${
                            usuarioConfirmacao?.nome || ""
                        }?`}
                    />

                    <ModalConfirmacao
                        open={!!usuarioRemocao}
                        onClose={() =>
                            setUsuarioRemocao(null)
                        }
                        onConfirmar={removerUsuario}
                        mensagem={
                            <>
                                Tem certeza que deseja remover
                                o usuário{" "}
                                {usuarioRemocao?.nome || ""}?

                                <br />
                                <br />

                                Essa ação não pode ser desfeita.
                            </>
                        }
                    />

                </>

            )}

        </div>

    );

}

export default Usuarios;