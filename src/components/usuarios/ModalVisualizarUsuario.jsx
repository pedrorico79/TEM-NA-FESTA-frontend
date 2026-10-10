import Modal from "../shared/modal/Modal";
import { dataCriacaoUsuario, nomePerfilUsuario } from "../../utils/perfilUsuario";

function ModalVisualizarUsuario({ open, usuario, onClose, usuarioAtualId }) {
    return (
        <Modal open={open} onClose={onClose} title="Detalhes do Usuário">
            {usuario && (
                <div className="usuario-detalhes">
                    <div className="usuario-detalhe">
                        <strong>Nome</strong>
                        <p className="usuario-detalhe-nome">
                            {usuario.nome || "-"}
                            {String(usuario.id) === String(usuarioAtualId) && (
                                <span className="usuario-tag-proprio">Você</span>
                            )}
                        </p>
                    </div>

                    <div className="usuario-detalhe">
                        <strong>E-mail</strong>
                        <p>{usuario.email || "-"}</p>
                    </div>

                    <div className="form-grid">
                        <div className="usuario-detalhe">
                            <strong>Perfil</strong>
                            <p>
                                {nomePerfilUsuario(usuario.perfil)}
                            </p>
                        </div>
                        <div className="usuario-detalhe">
                            <strong>Status</strong>
                            <p>{usuario.ativo ? "Ativo" : "Inativo"}</p>
                        </div>
                    </div>

                    <div className="usuario-detalhe">
                            <strong>Data de cadastro</strong>
                        <p>{dataCriacaoUsuario(usuario.dataCriacao)}</p>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="secondary-button" onClick={onClose}>
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}

export default ModalVisualizarUsuario;
