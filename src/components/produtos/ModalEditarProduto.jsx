import Modal from "../shared/modal/Modal";

function ModalEditarProduto({
    open,
    onClose,
    produto
}) {

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Editar Produto"
        >

            <form className="form-produto">

                <input
                    placeholder="Nome"
                    defaultValue={produto?.nome}
                />

                <textarea
                    placeholder="Descrição"
                    defaultValue={produto?.descricao}
                />

                <input
                    placeholder="Valor"
                    defaultValue={produto?.valor}
                />

                <button>
                    Salvar
                </button>

            </form>

        </Modal>
    );
}

export default ModalEditarProduto;