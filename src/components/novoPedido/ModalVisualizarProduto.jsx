import Modal from "../shared/modal/Modal";

function ModalVisualizarProduto({
open,
produto,
quantidade,
descontoValor,
descontoTipo,
subtotal,
onClose
}) {


if (!produto) {
    return null;
}

const preco = Number(produto.preco || 0);

return (
    <Modal
        open={open}
        onClose={onClose}
        title="Resumo do Produto"
    >
        <div className="produto-detalhes">

            <div className="produto-detalhe">
                <strong>Produto</strong>
                <p>{produto.nome || "-"}</p>
            </div>

            <div className="produto-detalhe">
                <strong>Descrição</strong>
                <p>{produto.descricao || "-"}</p>
            </div>

            <div className="form-grid">

                <div className="produto-detalhe">
                    <strong>Quantidade</strong>
                    <p>{quantidade}</p>
                </div>

                <div className="produto-detalhe">
                    <strong>Preço Unitário</strong>
                    <p>
                        R$ {preco.toFixed(2).replace(".", ",")}
                    </p>
                </div>

            </div>

            <div className="form-grid">

                <div className="produto-detalhe">
                    <strong>Desconto</strong>
                    <p>
                        {descontoValor > 0
                            ? `${descontoTipo === "%" ? descontoValor + "%" : "R$ " + descontoValor.toFixed(2).replace(".", ",")}`
                            : "Sem desconto"
                        }
                    </p>
                </div>

                <div className="produto-detalhe">
                    <strong>Subtotal</strong>
                    <p>
                        R$ {Number(subtotal || 0)
                            .toFixed(2)
                            .replace(".", ",")}
                    </p>
                </div>

            </div>

        </div>
    </Modal>
);


}

export default ModalVisualizarProduto;
