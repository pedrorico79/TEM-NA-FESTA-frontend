import { useEffect, useState } from "react";

import Menu from "../shared/menu/Menu";

import BotaoAdicionar from "../shared/botaoAdicionar/BotaoAdicionar";

import TabelaUsuarios from "../usuarios/TabelaUsuarios";

import ModalEditarUsuario from "../usuarios/ModalEditarUsuario";
import ModalVisualizarUsuario from "../usuarios/ModalVisualizarUsuario";

import ModalNovoUsuario from "../usuarios/ModalNovoUsuario";

import ModalAlterarSenhaUsuario from "../usuarios/ModalAlterarSenhaUsuario";

import TelaAutenticacaoSenha from "../usuarios/TelaAutenticacaoSenha";

import Paginacao from "../shared/paginacao/Paginacao";

import { api } from "../../services/api";
import { buscarUsuarioAtual, obterUsuarioAtualEmCache } from "../../services/usuarioAtual";

import ModalConfirmacao from "../shared/modal/ModalConfirmacao";

import "../css/Usuarios.css";

function Usuarios() {

    const [acessoLiberado, setAcessoLiberado] = useState(false);

    const [usuarioAtualId, setUsuarioAtualId] = useState(obterUsuarioAtualEmCache()?.id ?? null);

    const [usuarios, setUsuarios] = useState([]);

    const [perfisDisponiveis, setPerfisDisponiveis] = useState([]);

    const [busca, setBusca] = useState("");

    const [modalOpen, setModalOpen] = useState(false);

    const [modalVisualizarOpen, setModalVisualizarOpen] = useState(false);

    const [usuarioVisualizado, setUsuarioVisualizado] = useState(null);

    const [modalNovoOpen, setModalNovoOpen] = useState(false);

    const [modalSenhaOpen, setModalSenhaOpen] = useState(false);

    const [usuarioselecionado, setUsuarioselecionado] = useState(null);

    const [mensagemSucesso, setMensagemSucesso] = useState("");

    const [paginaAtual, setPaginaAtual] = useState(1);

    const [totalPaginas, setTotalPaginas] = useState(1);

    const [modalConfirmacaoOpen, setModalConfirmacaoOpen] = useState(false);

    const [usuarioConfirmacao, setUsuarioConfirmacao] = useState(null);

    const [usuarioRemocao, setUsuarioRemocao] = useState(null);

    const usuariosPorPagina = 7;

    async function autenticarAcesso(senhaAcesso) {
        const usuarioAtual = await buscarUsuarioAtual();

        if (String(usuarioAtual?.perfil || "").toUpperCase() !== "ADMIN") {
            throw new Error("Apenas administradores podem acessar esta página.");
        }

        if (!usuarioAtual?.email) {
            throw new Error("Não foi possível identificar o administrador da sessão.");
        }

        await api.post("/usuarios/login", {
            email: usuarioAtual.email,
            senha: senhaAcesso,
            jwtValidityRememberMe: false
        });

        setUsuarioAtualId(usuarioAtual.id);
        setAcessoLiberado(true);
    }

    function buscarUsuarios(pagina = paginaAtual, termo = busca) {

        if (!acessoLiberado) {


            return;

        }


        api.get("/usuarios", {
            params: {
                nome: termo.trim() || undefined,
                page: pagina - 1,
                size: usuariosPorPagina
            }
        })
            .then(({ data }) => {
                const lista = Array.isArray(data) ? data : data?.content;
                setUsuarios(Array.isArray(lista) ? lista : []);
                setTotalPaginas(Math.max(Number(data?.totalPages) || 1, 1));
            })
            .catch((erro) => {
                console.error("ERRO AO BUSCAR USUÁRIOS:", erro);
                setUsuarios([]);
                setTotalPaginas(1);
            });

    }

    useEffect(() => {

        if (acessoLiberado) {

            buscarUsuarios();

        }

    }, [acessoLiberado, paginaAtual, busca]);

    useEffect(() => {
        if (!acessoLiberado) return;

        api.get("/usuarios", { params: { page: 0, size: 1000 } })
            .then(({ data }) => {
                const lista = Array.isArray(data) ? data : data?.content;
                const perfis = new Map();
                (Array.isArray(lista) ? lista : []).forEach((usuario) => {
                    if (usuario.perfil?.id != null) {
                        perfis.set(String(usuario.perfil.id), usuario.perfil);
                    }
                });
                setPerfisDisponiveis(Array.from(perfis.values()));
            })
            .catch((erro) => {
                console.error("Erro ao carregar perfis dos usuários:", erro);
                setPerfisDisponiveis([]);
            });
    }, [acessoLiberado]);

    const usuariosPaginados = usuarios;
    function cadastrarUsuario(usuario) {

        return api.post("/usuarios", usuario)

            .then((response) => {

                setPaginaAtual(1);
                setBusca("");
                buscarUsuarios(1, "");

                return response.data;

            });

    }

    function abrirModalEditar(usuario) {
        setUsuarioselecionado(usuario);

        setModalOpen(true);

    }

    function abrirModalVisualizar(usuario) {
        setUsuarioVisualizado(usuario);
        setModalVisualizarOpen(true);
    }

    function abrirModalAlterarSenha(usuario) {

        setUsuarioselecionado(usuario);

        setModalSenhaOpen(true);

    }

    function editarUsuario(usuario) {
        const { id, nome, email, perfilId } = usuario;
        return api.put(`/usuarios/${id}`, { nome, email, perfilId })

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

        const novoStatus = !(usuarioConfirmacao?.ativo ?? usuarioConfirmacao?.isAtivo);

        api.patch(
            `/usuarios/${usuarioConfirmacao.id}/ativo`,
            { ativo: novoStatus }
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
                alert(erro.response?.data?.message || "Erro ao alterar o status do usuário.");

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
                                usuarioAtualId={usuarioAtualId}
                                onVisualizar={abrirModalVisualizar}
                                onEditar={abrirModalEditar}
                                onAlterarSenha={
                                    abrirModalAlterarSenha
                                }
                                onAlterarStatus={(u) => {
                                    if (String(u.id) === String(usuarioAtualId)) return;

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
                        bloquearPerfil={String(usuarioselecionado?.id) === String(usuarioAtualId)}
                        perfis={perfisDisponiveis}
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

                    <ModalVisualizarUsuario
                        open={modalVisualizarOpen}
                        usuario={usuarioVisualizado}
                        usuarioAtualId={usuarioAtualId}
                        onClose={() => setModalVisualizarOpen(false)}
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
                        perfis={perfisDisponiveis}
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
