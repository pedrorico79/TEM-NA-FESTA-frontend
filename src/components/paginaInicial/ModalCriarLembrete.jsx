import { useState } from "react";
import Modal from "../shared/Modal/Modal";

function ModalCriarLembrete(props) {

  const [descricao, setDescricao] = useState("");
  const [dataLimite, setDataLimite] = useState("");

  function salvar() {

    props.criarLembrete({
      descricao,
      dataLimite
    });

    setDescricao("");
    setDataLimite("");

    props.onClose();
  }

  return (
    <Modal
      open={props.open}
      title="Novo lembrete"
      onClose={props.onClose}
    >

      <form>

        <div className="form-group">

          <label>Descrição</label>

          <input
            type="text"
            placeholder="Digite a descrição do lembrete"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

        </div>

        <div className="form-group">

          <label>Data limite</label>

          <input
            type="date"
            value={dataLimite}
            onChange={(e) => setDataLimite(e.target.value)}
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

export default ModalCriarLembrete;