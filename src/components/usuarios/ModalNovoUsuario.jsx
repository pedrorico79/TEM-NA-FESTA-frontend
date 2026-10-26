import { useEffect, useState } from "react";
import Modal from "../shared/modal/Modal";
import FiltroDropdown from "../pedidos/FiltroDropdown";
import { nomePerfilUsuario } from "../../utils/perfilUsuario";
import { mensagemErroApi } from "../../utils/mensagemErroApi";
import { notificar } from "../../utils/notificacoes";

function ModalNovoUsuario(props) {
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [novoUsuario, setNovoUsuario] = useState({
        nome: "",
        email: "",
        senha: "",
        perfilId: "",
    });

    useEffect(() => {
        if (!props.open) {
            setNovoUsuario({ nome: "", email: "", senha: "", perfilId: "" });
        }
    }, [props.open]);

    function handleChange(e) {
        const { name, value } = e.target;
        setNovoUsuario({
            ...novoUsuario,
            [name]: value,
        });
    }

    function alterarPerfil(perfilId) {
        setNovoUsuario((atual) => ({ ...atual, perfilId }));
    }

    function salvar(e) {
        e.preventDefault();

        if (!novoUsuario.nome.trim() || !novoUsuario.email.trim() || !novoUsuario.senha.trim() || !novoUsuario.perfilId) {
            notificar("Preencha nome, e-mail, senha e perfil.");
            return;
        }
        if (novoUsuario.senha.length < 8 || novoUsuario.senha.length > 72) {
            notificar("A senha deve ter entre 8 e 72 caracteres.");
            return;
        }

        props.onSalvar({
            nome: novoUsuario.nome,
            email: novoUsuario.email,
            senha: novoUsuario.senha,
            perfilId: Number(novoUsuario.perfilId),
        })
            .then(() => {
                setNovoUsuario({
                    nome: "",
                    email: "",
                    senha: "",
                    perfilId: "",
                });

                props.onClose();
                props.onSucesso();
            })
            .catch((erro) => {
                console.error(erro);
                notificar(mensagemErroApi(erro, "Erro ao cadastrar usuário."));
            });
    }

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            title="Novo Usuário"
        >
            <form onSubmit={salvar}>

                <div className="form-grid">
                    <div className="form-group">
                        <label>Nome *</label>
                        <input
                            type="text"
                            name="nome"
                            value={novoUsuario.nome}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>E-mail *</label>
                        <input
                            type="email"
                            name="email"
                            value={novoUsuario.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Senha inicial *</label>
                        <div className="senha-input-wrapper">
                            <input
                                type={mostrarSenha ? "text" : "password"}
                                name="senha"
                                value={novoUsuario.senha}
                                onChange={handleChange}
                                autoComplete="new-password"
                                minLength={8}
                                maxLength={72}
                                required
                            />
                            <button
                                type="button"
                                className="botao-mostrar-senha"
                                onClick={() => setMostrarSenha((atual) => !atual)}
                                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                            >
                                <ion-icon name={mostrarSenha ? "eye-outline" : "eye-off-outline"}></ion-icon>
                            </button>
                        </div>
                        <small>A senha deve ter entre 8 e 72 caracteres.</small>
                    </div>
                    <div className="form-group">
                        <label>Perfil *</label>
                        <FiltroDropdown
                            className="usuario-perfil-dropdown"
                            menuClassName="usuario-perfil-dropdown-menu"
                            label="Perfil de acesso"
                            value={novoUsuario.perfilId}
                            onChange={alterarPerfil}
                            disabled={!props.perfis?.length}
                            options={[
                                { value: "", label: "Selecione um perfil" },
                                ...(props.perfis || []).map((perfil) => ({
                                    value: String(perfil.id),
                                    label: nomePerfilUsuario(perfil),
                                })),
                            ]}
                        />
                    </div>
                </div>

                <div className="modal-actions">
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={props.onClose}
                    >
                        Cancelar
                    </button>

                    <button type="submit" className="primary-button">
                        Salvar
                    </button>
                </div>

            </form>
        </Modal>
    );
}

export default ModalNovoUsuario;
