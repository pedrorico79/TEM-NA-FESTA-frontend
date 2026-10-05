import Modal from "./Modal";

function ModalConfirmacao({
    open,
    onClose,
    onConfirmar,
    mensagem
}) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Confirmar alteração"
        >
            <div className="produto-confirmacao-conteudo">
                <p>{mensagem}</p>

                <div className="modal-actions">
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={onConfirmar}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ModalConfirmacao;
