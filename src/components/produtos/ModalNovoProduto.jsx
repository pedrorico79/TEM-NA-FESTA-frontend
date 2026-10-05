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

        const precoVenda = Number(novoProduto.precoVenda);
        if (!novoProduto.nome.trim()) {
            alert("O nome do produto é obrigatório.");
            return;
        }
        if (!novoProduto.precoVenda || !Number.isFinite(precoVenda) || precoVenda <= 0) {
            alert("O preço de venda deve ser maior que zero.");
            return;
        }
        if (precoVenda > 99999999.99) {
            alert("O preço deve ter no máximo 8 dígitos inteiros e 2 casas decimais.");
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
                alert(erro.response?.data?.message || erro.response?.data?.detail || "Erro ao cadastrar produto.");
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
                            maxLength={100}
                            required
                            value={novoProduto.nome}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Preço de Venda *</label>

                        <div className="input-valor">
                            <span>R$</span>
                            <input
                                type="number"
                                min="0.01"
                                max="99999999.99"
                                step="0.01"
                                name="precoVenda"
                                required
                                value={novoProduto.precoVenda}
                                onChange={handleChange}
                            />
                        </div>
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
