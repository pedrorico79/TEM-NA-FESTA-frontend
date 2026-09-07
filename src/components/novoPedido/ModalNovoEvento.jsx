import Modal from "../shared/modal/Modal";

import { useState } from "react";

function ModalNovoEvento(props) {

    const [novoEvento, setNovoEvento] = useState({
        nome: "",
    });

    const handleChange = (valor) => {
        setNovoEvento({
            ...novoEvento,
            nome: valor,
        });
    };

    return (

        <Modal
            open={props.open}
            onClose={props.onClose}
            title="Novo Evento"
        >

            <div className="form-group">

                <label>Nome *</label>

                <input
                    value={novoEvento.nome}
                    onChange={(e) =>
                        handleChange(e.target.value)
                    }
                />

            </div>

            <div className="modal-actions">

                <button
                    className="secondary-button"
                    onClick={props.onClose}
                >
                    Cancelar
                </button>

                <button
                    className="primary-button"
                    onClick={() =>
                        props.onSave(novoEvento)
                    }
                >
                    Criar Evento
                </button>

            </div>

        </Modal>
    );
}

export default ModalNovoEvento;
