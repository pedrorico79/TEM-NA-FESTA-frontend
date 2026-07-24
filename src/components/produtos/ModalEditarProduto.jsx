import { useEffect, useState } from "react";
import Modal from "../shared/modal/Modal";

function ModalEditarProduto(props) {

    const [produtoEditado, setProdutoEditado] = useState({
        nome: "",
        descricao: "",
        precoVenda: "",
        ativo: true,
    });

    useEffect(() => {
        if (props.produto) {
            setProdutoEditado({
                nome: props.produto.nome || "",
                descricao: props.produto.descricao || "",
                precoVenda: props.produto.precoVenda || "",
                ativo: props.produto.ativo,
            });
        }
    }, [props.produto]);

    function handleChange(e) {
        const { name, value } = e.target;

        setProdutoEditado({
            ...produtoEditado,
            [name]: value,
        });
    }

    function salvar(e) {
        e.preventDefault();

        if (!produtoEditado.nome.trim() || !produtoEditado.precoVenda) {
            alert("Nome e preço de venda são obrigatórios.");
            return;
        }

        props.onSalvar({
            id: props.produto.id,
            nome: produtoEditado.nome,
            descricao: produtoEditado.descricao,
            precoVenda: Number(produtoEditado.precoVenda),
            ativo: produtoEditado.ativo,
        })
            .then(() => {
                props.onClose();
                props.onSucesso();
            })
            .catch((erro) => {
                console.error(erro);
                alert("Erro ao editar produto.");
            });
    }

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            title="Editar Produto"
        >
            <form onSubmit={salvar}>

                <div className="form-grid">

                    <div className="form-group">
                        <label>Nome *</label>
                        <input
                            type="text"
                            name="nome"
                            value={produtoEditado.nome}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Preço de Venda *</label>

                        <div className="input-valor">
                            <span>R$</span>
                            <input
                                type="number"
                                step="0.01"
                                name="precoVenda"
                                value={produtoEditado.precoVenda}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                </div>

                <div className="form-group">
                    <label>Descrição</label>
                    <textarea
                        name="descricao"
                        value={produtoEditado.descricao}
                        onChange={handleChange}
                    />
                </div>


                <div className="modal-actions">

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={props.onClose}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="primary-button"
                    >
                        Salvar
                    </button>

                </div>

            </form>
        </Modal>
    );
}

export default ModalEditarProduto;