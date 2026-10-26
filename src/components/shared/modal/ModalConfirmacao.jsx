import Modal from "./Modal";

function ModalConfirmacao({
    open,
    onClose,
    onConfirmar,
    mensagem,
    conteudoAdicional,
    erro,
    confirmando = false,
    titulo = "Confirmar alteração"
}) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={titulo}
        >
            <div className="produto-confirmacao-conteudo">
                <p>{mensagem}</p>
                {conteudoAdicional}
                {erro && <p className="erro-edicao-pedido" role="alert">{erro}</p>}

                <div className="modal-actions">
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onClose}
                        disabled={confirmando}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={onConfirmar}
                        disabled={confirmando}
                    >
                        {confirmando ? "Salvando…" : "Confirmar"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ModalConfirmacao;
