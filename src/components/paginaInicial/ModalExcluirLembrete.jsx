import Modal from "../shared/Modal/Modal";

function ModalExcluirLembrete(props) {

    function excluir() {

        props.deletarLembrete(
            props.lembrete.id
        );

        props.onClose();

    }

    return (

        <Modal
            open={props.open}
            title="Excluir lembrete"
            onClose={props.onClose}
        >

            <p>
                Tem certeza que deseja excluir este lembrete?
            </p>

            <p>
                Esta ação não poderá ser desfeita.
            </p>

            <div className="modal-actions">

                <button
                    type="button"
                    className="secondary-button"
                    onClick={props.onClose}
                >
                    Cancelar
                </button>

                <button
                    type="button"
                    className="primary-button delete-button"
                    onClick={excluir}
                >
                    Excluir
                </button>

            </div>

        </Modal>

    );

}

export default ModalExcluirLembrete;