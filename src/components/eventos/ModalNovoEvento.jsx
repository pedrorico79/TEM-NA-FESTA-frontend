import { useState } from "react";
import Modal from "../shared/modal/Modal";

function ModalNovoEvento(props) {
    const [novoEvento, setNovoEvento] = useState({
        nome: "",
        dataInicio: "",
        dataFim: ""
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setNovoEvento({
            ...novoEvento,
            [name]: value,
        });
    }

    function salvar(e) {
        e.preventDefault();

        if (!novoEvento.nome.trim() || !novoEvento.dataInicio || !novoEvento.dataFim) {
            const mensagem = "Nome, Data de Início e Data de Fim são obrigatórios.";
            if (props.onErro) props.onErro(mensagem);
            else alert(mensagem);
            return;
        }

        props.onSalvar({
            nome: novoEvento.nome,
            dataInicio: novoEvento.dataInicio,
            dataFim: novoEvento.dataFim
        })
            .then(() => {
                setNovoEvento({
                    nome: "",
                    dataInicio: "",
                    dataFim: "",
                });

                props.onClose();
                props.onSucesso();
            })
            .catch((erro) => {
                console.error(erro);
                const mensagem = erro.response?.data?.message || erro.response?.data?.detail || "Não foi possível cadastrar o evento. Confira os dados e tente novamente.";
                if (props.onErro) props.onErro(mensagem);
                else alert(mensagem);
            });
    }

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            title="Novo Evento"
        >
            <form onSubmit={salvar}>

                <div className="form-grid">
                    <div className="form-group">
                        <label>Nome *</label>
                        <input
                            type="text"
                            name="nome"
                            value={novoEvento.nome}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Data de Início *</label>
                        <input
                            type="date"
                            name="dataInicio"
                            value={novoEvento.dataInicio}
                            onChange={handleChange}
                            onClick={(e) => e.currentTarget.showPicker?.()}
                        />
                    </div>

                    <div className="form-group">
                        <label>Data de Fim *</label>
                        <input
                            type="date"
                            name="dataFim"
                            value={novoEvento.dataFim}
                            onChange={handleChange}
                            onClick={(e) => e.currentTarget.showPicker?.()}
                        />
                    </div>
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

export default ModalNovoEvento;
