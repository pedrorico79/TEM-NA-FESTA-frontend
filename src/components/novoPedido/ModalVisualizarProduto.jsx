import Modal from "../shared/modal/Modal";

function ModalVisualizarProduto({
open,
produto,
quantidade,
acrescimoValor = 0,
acrescimoTipo = "R$",
subtotal,
onClose
}) {


if (!produto) {
    return null;
}

const preco = Number(produto.precoVenda ?? produto.preco ?? 0);
const valorAcrescimo = Number(acrescimoValor || 0);
const acrescimoEmReais = acrescimoTipo === "%" ? preco * valorAcrescimo / 100 : valorAcrescimo;

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
                    <strong>Acréscimo</strong>
                    <p>
                        {acrescimoValor > 0
                            ? `${acrescimoTipo === "%" ? `+${acrescimoValor}%` : "+R$ " + Number(acrescimoValor).toFixed(2).replace(".", ",")}`
                            : "Sem acréscimo"
                        }
                    </p>
                </div>

                <div className="produto-detalhe">
                    <strong>Subtotal</strong>
                    <p>
                        R$ {Number(subtotal ?? ((preco + acrescimoEmReais) * Number(quantidade || 0)))
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
