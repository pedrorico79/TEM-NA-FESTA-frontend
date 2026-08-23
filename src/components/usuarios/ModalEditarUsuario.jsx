import { useEffect, useState } from "react";
import Modal from "../shared/modal/Modal";

function ModalEditarUsuario(props) {

    const [UsuarioEditado, setUsuarioEditado] = useState({
        nome: "",
        email: "",
        novaSenha: "",
    });

    useEffect(() => {
        if (props.Usuario) {
            setUsuarioEditado({
                nome: props.Usuario.nome || "",
                email: props.Usuario.email || "",
                novaSenha: "",
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

        if (!UsuarioEditado.nome.trim() || !UsuarioEditado.email.trim()) {
            alert("Nome e E-mail são obrigatórios.");
            return;
        }

        const payload = {
            id: props.Usuario.id,
            nome: UsuarioEditado.nome,
            email: UsuarioEditado.email,
        };

        // Envia a senha apenas se o admin tiver digitado algo
        if (UsuarioEditado.novaSenha.trim()) {
            payload.novaSenha = UsuarioEditado.novaSenha;
        }

        props.onSalvar(payload)
            .then(() => {
                props.onClose();
                props.onSucesso();
            })
            .catch((erro) => {
                console.error(erro);
                alert("Erro ao editar Usuário.");
            });
    }

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            title="Editar Usuário"
        >
            <form onSubmit={salvar}>

                <div className="form-grid">

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
                    </div>

                    <div className="form-group">
                        <label>Nova Senha (deixe em branco para não alterar)</label>
                        <input
                            type="password"
                            name="novaSenha"
                            value={UsuarioEditado.novaSenha}
                            onChange={handleChange}
                            placeholder="Digite uma nova senha caso queira redefinir"
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