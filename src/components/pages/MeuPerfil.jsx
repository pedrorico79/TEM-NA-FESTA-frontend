import { useState } from "react";
import Menu from "../shared/menu/Menu";
import TelaAutenticacaoSenha from "../usuarios/TelaAutenticacaoSenha";
import { api } from "../../services/api";
import { buscarUsuarioAtual, limparUsuarioAtualEmCache } from "../../services/usuarioAtual";
import { nomePerfilUsuario } from "../../utils/perfilUsuario";
import "../css/Usuarios.css";

function mensagemDaApi(apiErro, mensagemPadrao) {
    const detalhes = apiErro.response?.data?.detalhes;
    if (Array.isArray(detalhes) && detalhes.length) return detalhes.join(" ");
    return apiErro.response?.data?.message || apiErro.message || mensagemPadrao;
}

function MeuPerfil() {
    const [acessoLiberado, setAcessoLiberado] = useState(false);
    const [usuario, setUsuario] = useState(null);
    const [dados, setDados] = useState({ nome: "", email: "" });
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");
    const [erroSenha, setErroSenha] = useState("");

    async function autenticar(senha) {
        let sessao;
        try {
            sessao = await buscarUsuarioAtual();
        } catch (apiErro) {
            if (!apiErro.response || apiErro.isApiUnavailable || apiErro.response.status >= 500) {
                throw apiErro;
            }
            throw new Error("Ocorreu um erro no sistema. Tente novamente mais tarde.", { cause: apiErro });
        }
        if (!sessao?.email || sessao?.id == null) {
            throw new Error("Ocorreu um erro no sistema. Tente novamente mais tarde.");
        }

        await api.post("/usuarios/login", {
            email: sessao.email,
            senha,
            jwtValidityRememberMe: false,
        });

        const { data: registro } = await api.get("/usuarios/me");
        if (!registro?.id) {
            throw new Error("Ocorreu um erro no sistema. Tente novamente mais tarde.");
        }

        setUsuario(registro);
        setDados({ nome: registro.nome || "", email: registro.email || "" });
        setAcessoLiberado(true);
    }

    async function salvarPerfil(event) {
        event.preventDefault();
        setErro("");
        setMensagem("");

        if (!dados.nome.trim() || !dados.email.trim()) {
            setErro("Nome e e-mail são obrigatórios.");
            return;
        }

        try {
            const { data: atualizado } = await api.put("/usuarios/me", {
                nome: dados.nome.trim(),
                email: dados.email.trim(),
            });

            const proximoUsuario = atualizado || {
                ...usuario,
                nome: dados.nome.trim(),
                email: dados.email.trim(),
            };
            setUsuario(proximoUsuario);
            setDados({ nome: proximoUsuario.nome, email: proximoUsuario.email });
            limparUsuarioAtualEmCache();
            const usuarioAtualizado = await buscarUsuarioAtual();
            setUsuario(usuarioAtualizado);
            setDados({ nome: usuarioAtualizado.nome, email: usuarioAtualizado.email });
            setMensagem("Perfil atualizado com sucesso!");
            window.setTimeout(() => setMensagem(""), 3000);
        } catch (apiErro) {
            setErro(mensagemDaApi(apiErro, "Não foi possível atualizar seu perfil."));
        }
    }

    async function salvarNovaSenha(event) {
        event.preventDefault();
        setErroSenha("");
        setMensagem("");

        if (!novaSenha.trim()) {
            setErroSenha("Informe a nova senha.");
            return;
        }
        if (novaSenha !== confirmarSenha) {
            setErroSenha("As senhas não coincidem.");
            return;
        }

        try {
            await api.patch("/usuarios/me/senha", { senha: novaSenha });
            setNovaSenha("");
            setConfirmarSenha("");
            setMostrarSenha(false);
            setMostrarConfirmacao(false);
            setMensagem("Senha alterada com sucesso!");
            window.setTimeout(() => setMensagem(""), 3000);
        } catch (apiErro) {
            setErroSenha(mensagemDaApi(apiErro, "Não foi possível alterar sua senha."));
        }
    }

    return (
        <div className="usuarios-layout">
            <Menu active="meuPerfil" />

            {!acessoLiberado ? (
                <TelaAutenticacaoSenha
                    onSucesso={autenticar}
                    titulo="Meu perfil"
                    subtitulo="Confirme sua senha para acessar e alterar seus dados pessoais."
                    textoBotao="Confirmar senha"
                />
            ) : (
                <>
                    {mensagem && <div className="mensagem-sucesso">{mensagem}</div>}
                    <main className="usuarios-content meu-perfil-content">
                        <header className="meu-perfil-topo">
                            <div className="meu-perfil-titulo-linha">
                                <h1>Meu perfil</h1>
                                <span className="usuario-tag-proprio">{nomePerfilUsuario(usuario?.perfil)}</span>
                            </div>
                            <p>Atualize seus dados de acesso e mantenha sua conta em dia.</p>
                        </header>

                        <section className="meu-perfil-secao">
                            <form className="meu-perfil-formulario" onSubmit={salvarPerfil}>
                                <div className="meu-perfil-campos">
                                    <div className="meu-perfil-campo">
                                        <label htmlFor="meu-perfil-nome">Nome *</label>
                                        <input
                                            id="meu-perfil-nome"
                                            name="nome"
                                            value={dados.nome}
                                            onChange={(event) => setDados((anterior) => ({ ...anterior, nome: event.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="meu-perfil-campo">
                                        <label htmlFor="meu-perfil-email">E-mail *</label>
                                        <input
                                            id="meu-perfil-email"
                                            type="email"
                                            name="email"
                                            value={dados.email}
                                            onChange={(event) => setDados((anterior) => ({ ...anterior, email: event.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                {erro && <p className="meu-perfil-erro" role="alert">{erro}</p>}

                                <div className="modal-actions meu-perfil-acoes">
                                    <button type="submit" className="primary-button">Salvar alterações</button>
                                </div>
                            </form>

                            <section className="meu-perfil-senha" aria-labelledby="meu-perfil-senha-titulo">
                                <div className="meu-perfil-cabecalho">
                                    <h2 id="meu-perfil-senha-titulo">Alterar senha</h2>
                                    <p>Escolha uma nova senha para sua conta.</p>
                                </div>
                                <form className="meu-perfil-formulario" onSubmit={salvarNovaSenha}>
                                    <div className="meu-perfil-campos">
                                        <div className="meu-perfil-campo">
                                            <label htmlFor="meu-perfil-nova-senha">Nova senha *</label>
                                            <div className="senha-input-wrapper">
                                                <input
                                                    id="meu-perfil-nova-senha"
                                                    type={mostrarSenha ? "text" : "password"}
                                                    name="novaSenha"
                                                    value={novaSenha}
                                                    onChange={(event) => setNovaSenha(event.target.value)}
                                                    autoComplete="new-password"
                                                    required
                                                />
                                                <button type="button" className="botao-mostrar-senha" onClick={() => setMostrarSenha((atual) => !atual)} aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}>
                                                    <ion-icon name={mostrarSenha ? "eye-outline" : "eye-off-outline"}></ion-icon>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="meu-perfil-campo">
                                            <label htmlFor="meu-perfil-confirmar-senha">Confirmar nova senha *</label>
                                            <div className="senha-input-wrapper">
                                                <input
                                                    id="meu-perfil-confirmar-senha"
                                                    type={mostrarConfirmacao ? "text" : "password"}
                                                    name="confirmarSenha"
                                                    value={confirmarSenha}
                                                    onChange={(event) => setConfirmarSenha(event.target.value)}
                                                    autoComplete="new-password"
                                                    required
                                                />
                                                <button type="button" className="botao-mostrar-senha" onClick={() => setMostrarConfirmacao((atual) => !atual)} aria-label={mostrarConfirmacao ? "Ocultar confirmação" : "Mostrar confirmação"}>
                                                    <ion-icon name={mostrarConfirmacao ? "eye-outline" : "eye-off-outline"}></ion-icon>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {erroSenha && <p className="meu-perfil-erro" role="alert">{erroSenha}</p>}
                                    <div className="modal-actions meu-perfil-acoes">
                                        <button type="submit" className="primary-button">Salvar nova senha</button>
                                    </div>
                                </form>
                            </section>
                        </section>
                    </main>
                </>
            )}
        </div>
    );
}

export default MeuPerfil;
