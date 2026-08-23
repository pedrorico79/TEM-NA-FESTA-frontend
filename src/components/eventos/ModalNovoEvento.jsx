import { useState } from "react";
import Modal from "../shared/modal/Modal";

function ModalNovoEvento(props) {
    const [novoEvento, setNovoEvento] = useState({
        nome: "",
        dataInicio: "",
        dataFim: "",
        ativa: true
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
            alert("Nome, Data de Início e Data de Fim são obrigatórios.");
            return;
        }

        props.onSalvar({
            nome: novoEvento.nome,
            dataInicio: novoEvento.dataInicio,
            dataFim: novoEvento.dataFim,
            ativa: true
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
                alert("Erro ao cadastrar Evento.");
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
                        />
                    </div>

                    <div className="form-group">
                        <label>Data de Fim *</label>
                        <input
                            type="date"
                            name="dataFim"
                            value={novoEvento.dataFim}
                            onChange={handleChange}
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