import Modal from "../shared/modal/Modal";

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
        </Modal>
    );
}

export default ModalConfirmacao;