import { useEffect, useState } from "react";
import Modal from "../shared/Modal/Modal";

function ModalEditarLembrete(props) {

    const [descricao, setDescricao] = useState("");
    const [dataLimite, setDataLimite] = useState("");

    useEffect(() => {

        if (props.lembrete) {
            setDescricao(props.lembrete.descricao);
            setDataLimite(props.lembrete.dataLimite);
        }

    }, [props.lembrete]);

    function salvar() {

        props.atualizarLembrete(
            props.lembrete.id,
            {
                descricao,
                data_criacao: props.lembrete.dataCriacao,
                data_limite: dataLimite,
                prioridade: props.lembrete.prioridade
            }
        );

        props.onClose();

    }

    return (

        <Modal
            open={props.open}
            title="Editar lembrete"
            onClose={props.onClose}
        >

            <form>

                <div className="form-group">

                    <label>Descrição</label>

                    <input
                        type="text"
                        value={descricao}
                        onChange={(e) =>
                            setDescricao(e.target.value)
                        }
                    />

                </div>

                <div className="form-group">

                    <label>Data limite</label>

                    <input
                        type="date"
                        value={dataLimite}
                        onChange={(e) =>
                            setDataLimite(e.target.value)
                        }
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
                        type="button"
                        className="primary-button"
                        onClick={salvar}
                    >
                        Salvar
                    </button>

                </div>

            </form>

        </Modal>

    );

}

export default ModalEditarLembrete;