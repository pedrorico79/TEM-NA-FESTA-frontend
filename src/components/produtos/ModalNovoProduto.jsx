import { useState } from "react";
import Modal from "../shared/modal/Modal";

function ModalNovoProduto(props) {
    const [novoProduto, setNovoProduto] = useState({
        nome: "",
        descricao: "",
        precoVenda: "",
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setNovoProduto({
            ...novoProduto,
            [name]: value,
        });
    }

    function salvar(e) {
        e.preventDefault();

        if (!novoProduto.nome.trim() || !novoProduto.precoVenda) {
            alert("Nome e preço de venda são obrigatórios.");
            return;
        }

        props.onSalvar({
            nome: novoProduto.nome,
            descricao: novoProduto.descricao,
            precoVenda: Number(novoProduto.precoVenda),
            ativo: true
        })
            .then(() => {

                setNovoProduto({
                    nome: "",
                    descricao: "",
                    precoVenda: "",
                });

                props.onClose();

                props.onSucesso();
            })
            .catch((erro) => {
                console.error(erro);
                alert("Erro ao cadastrar produto.");
            });
    }

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            title="Novo Produto"
        >
            <form onSubmit={salvar}>

                <div className="form-grid">
                    <div className="form-group">
                        <label>Nome *</label>
                        <input
                            type="text"
                            name="nome"
                            value={novoProduto.nome}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Preço de Venda *</label>
                        <input
                            type="number"
                            step="0.01"
                            name="precoVenda"
                            value={novoProduto.precoVenda}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Descrição</label>
                    <textarea
                        name="descricao"
                        value={novoProduto.descricao}
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

                    <button type="submit" className="primary-button">
                        Salvar
                    </button>
                </div>

            </form>
        </Modal>
    );
}

export default ModalNovoProduto;