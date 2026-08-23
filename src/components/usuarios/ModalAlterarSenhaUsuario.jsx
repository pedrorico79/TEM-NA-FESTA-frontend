import { useState } from "react";
import Modal from "../shared/modal/Modal";

function ModalAlterarSenhaUsuario(props) {
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    function salvar(e) {
        e.preventDefault();

        if (!novaSenha.trim()) {
            alert("A nova senha é obrigatória.");
            return;
        }

        if (novaSenha !== confirmarSenha) {
            alert("As senhas não coincidem.");
            return;
        }

        props.onSalvarSenha({
            id: props.Usuario.id,
            novaSenha: novaSenha,
        })
            .then(() => {
                setNovaSenha("");
                setConfirmarSenha("");
                props.onClose();
                props.onSucesso();
            })
            .catch((erro) => {
                console.error(erro);
                alert("Erro ao alterar senha do usuário.");
            });
    }

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            title={`Alterar Senha - ${props.Usuario?.nome || ""}`}
        >
            <form onSubmit={salvar}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Nova Senha *</label>
                        <input
                            type="password"
                            name="novaSenha"
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            placeholder="Digite a nova senha"
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirmar Nova Senha *</label>
                        <input
                            type="password"
                            name="confirmarSenha"
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                            placeholder="Confirme a nova senha"
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
                        Salvar Nova Senha
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default ModalAlterarSenhaUsuario;