import { useEffect, useState } from "react";
import Modal from "../shared/modal/Modal";
import { nomePerfilUsuario } from "../../utils/perfilUsuario";
import { mensagemErroApi } from "../../utils/mensagemErroApi";
import { notificar } from "../../utils/notificacoes";

function ModalEditarUsuario(props) {
    const [UsuarioEditado, setUsuarioEditado] = useState({
        nome: "",
        email: "",
        perfilId: "",
    });

    useEffect(() => {
        if (props.Usuario) {
            setUsuarioEditado({
                nome: props.Usuario.nome || "",
                email: props.Usuario.email || "",
                perfilId: props.Usuario.perfil?.id != null ? String(props.Usuario.perfil.id) : "",
            });
        }
    }, [props.Usuario]);

    function handleChange(e) {
        const { name, value } = e.target;

        setUsuarioEditado({
            ...UsuarioEditado,
            [name]: value,
        });
    }

    function salvar(e) {
        e.preventDefault();

        if (!UsuarioEditado.nome.trim() || !UsuarioEditado.email.trim() || !UsuarioEditado.perfilId) {
            notificar("Nome, e-mail e perfil de acesso são obrigatórios.");
            return;
        }

        const payload = {
            id: props.Usuario.id,
            nome: UsuarioEditado.nome,
            email: UsuarioEditado.email,
            perfilId: Number(UsuarioEditado.perfilId),
        };

        props.onSalvar(payload)
            .then(() => {
                props.onClose();
                props.onSucesso();
            })
            .catch((erro) => {
                console.error(erro);
                notificar(mensagemErroApi(erro, "Erro ao editar usuário."));
            });
    }

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            title="Editar Usuário"
        >
            <form onSubmit={salvar}>

                <div className="form-grid form-usuarios-edicao">

                    <div className="form-group">
                        <label>Nome *</label>
                        <input
                            type="text"
                            name="nome"
                            value={UsuarioEditado.nome}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>E-mail *</label>
                        <input
                            type="email"
                            name="email"
                            value={UsuarioEditado.email}
                            onChange={handleChange}
                        />
                        {UsuarioEditado.email.trim()
                            && UsuarioEditado.email.trim().toLowerCase() !== (props.Usuario?.email || "").trim().toLowerCase()
                            && (
                            <small className="usuario-aviso-email">
                                {props.proprioUsuario
                                    ? "Sua sessão será atualizada com o novo e-mail."
                                    : "A pessoa precisará entrar novamente com o novo e-mail."}
                            </small>
                        )}
                    </div>

                    {!props.bloquearPerfil && (
                        <div className="form-group">
                            <label>Perfil de acesso *</label>
                            <div className="usuario-select-wrap">
                                <select
                                    className="usuario-perfil-select"
                                    name="perfilId"
                                    value={UsuarioEditado.perfilId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Selecione um perfil</option>
                                    {(props.perfis || []).map((perfil) => (
                                        <option key={perfil.id} value={perfil.id}>
                                            {nomePerfilUsuario(perfil)}
                                        </option>
                                    ))}
                                    {UsuarioEditado.perfilId && !(props.perfis || []).some((perfil) => String(perfil.id) === UsuarioEditado.perfilId) && (
                                        <option value={UsuarioEditado.perfilId}>{nomePerfilUsuario(props.Usuario?.perfil) || `Perfil ${UsuarioEditado.perfilId}`}</option>
                                    )}
                                </select>
                            </div>
                        </div>
                    )}

                </div>

                <div className="modal-actions">

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={props.onClose}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="primary-button"
                    >
                        Salvar
                    </button>

                </div>

            </form>
        </Modal>
    );
}

export default ModalEditarUsuario;
