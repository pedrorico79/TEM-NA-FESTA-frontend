import { useEffect, useState } from "react";
import Modal from "../shared/modal/Modal";

function ModalEditarEvento(props) {

    const [EventoEditado, setEventoEditado] = useState({
        nome: "",
        dataInicio: "",
        dataFim: "",
    });

    useEffect(() => {
        if (props.Evento) {
            setEventoEditado({
                nome: props.Evento.nome || "",
                dataInicio: props.Evento.dataInicio || "",
                dataFim: props.Evento.dataFim || "",
            });
        }
    }, [props.Evento]);

    function handleChange(e) {
        const { name, value } = e.target;

        setEventoEditado({
            ...EventoEditado,
            [name]: value,
        });
    }

    function salvar(e) {
        e.preventDefault();

        if (!EventoEditado.nome.trim() || !EventoEditado.dataInicio || !EventoEditado.dataFim) {
            alert("Nome, Data de Início e Data de Fim são obrigatórios.");
            return;
        }

        props.onSalvar({
            id: props.Evento.id,
            nome: EventoEditado.nome,
            dataInicio: EventoEditado.dataInicio,
            dataFim: EventoEditado.dataFim,
        })
            .then(() => {
                props.onClose();
                props.onSucesso();
            })
            .catch((erro) => {
                console.error(erro);
                alert("Erro ao editar Evento.");
            });
    }

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            title="Editar Evento"
        >
            <form onSubmit={salvar}>

                <div className="form-grid">

                    <div className="form-group">
                        <label>Nome *</label>
                        <input
                            type="text"
                            name="nome"
                            value={EventoEditado.nome}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Data de Início *</label>
                        <input
                            type="date"
                            name="dataInicio"
                            value={EventoEditado.dataInicio}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Data de Fim *</label>
                        <input
                            type="date"
                            name="dataFim"
                            value={EventoEditado.dataFim}
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

export default ModalEditarEvento;