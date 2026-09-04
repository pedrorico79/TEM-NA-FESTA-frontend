import Modal from "../shared/modal/Modal";

function ModalVisualizarProduto({
    open,
    produto,
    onClose
}) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Detalhes do Produto"
        >
            {produto && (
                <div className="produto-detalhes">

                    <div className="produto-detalhe">
                        <strong>Nome</strong>
                        <p>{produto.nome || "-"}</p>
                    </div>

                    <div className="produto-detalhe">
                        <strong>Descrição</strong>
                        <p>{produto.descricao || "-"}</p>
                    </div>

                    <div className="form-grid">

                        <div className="produto-detalhe">
                            <strong>Valor</strong>
                            <p>
                                R$ {produto.precoVenda?.toFixed(2) || "0,00"}
                            </p>
                        </div>

                        <div className="produto-detalhe">
                            <strong>Status</strong>
                            <p>
                                {produto.ativo ? "Ativo" : "Inativo"}
                            </p>
                        </div>

                    </div>


                </div>
            )}
        </Modal>
    );
}

export default ModalVisualizarProduto;