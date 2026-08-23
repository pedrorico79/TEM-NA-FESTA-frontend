import { useState } from "react";
import Modal from "../shared/modal/Modal";

function ModalNovoUsuario(props) {
    const [novoUsuario, setNovoUsuario] = useState({
        nome: "",
        email: "",
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setNovoUsuario({
            ...novoUsuario,
            [name]: value,
        });
    }

    function salvar(e) {
        e.preventDefault();

        if (!novoUsuario.nome.trim() || !novoUsuario.email.trim()) {
            alert("Nome e E-mail são obrigatórios.");
            return;
        }

        props.onSalvar({
            nome: novoUsuario.nome,
            email: novoUsuario.email,
        })
            .then(() => {
                setNovoUsuario({
                    nome: "",
                    email: "",
                });

                props.onClose();
                props.onSucesso();
            })
            .catch((erro) => {
                console.error(erro);
                alert("Erro ao cadastrar Usuário.");
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