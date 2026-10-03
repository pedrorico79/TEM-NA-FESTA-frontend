import { useState } from "react";
import Modal from "../shared/modal/Modal";

function ModalCriarLembrete(props) {

  const [descricao, setDescricao] = useState("");
  const [dataLimite, setDataLimite] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  function hojeEmFormatoISO() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }

  async function salvar(event) {
    event.preventDefault();

    if (!dataLimite || dataLimite <= hojeEmFormatoISO()) {
      setErro("A data limite do lembrete deve ser futura.");
      return;
    }

    setErro("");
    setSalvando(true);

    try {
      await props.criarLembrete({ descricao, dataLimite });

      setDescricao("");
      setDataLimite("");
      props.onClose();
    } catch (error) {
      console.error("Erro ao criar lembrete:", error);
      setErro("Não foi possível criar o lembrete. Confira se a data limite é futura e tente novamente.");
    } finally {
      setSalvando(false);
    }

  }

  return (
    <Modal
      open={props.open}
      title="Novo lembrete"
      onClose={props.onClose}
    >

      <form onSubmit={salvar}>

        {erro && (
          <div className="mensagem-erro-lembrete" role="alert">
            {erro}
          </div>
        )}

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
            min={hojeEmFormatoISO()}
            onChange={(e) => {
              setDataLimite(e.target.value);
              setErro("");
            }}
            onClick={(e) => {
              e.currentTarget.showPicker?.();
            }}
          />

        </div>

        <div className="modal-actions">

          <button
            type="button"
            className="secondary-button"
            onClick={props.onClose}
            disabled={salvando}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>

        </div>

      </form>

    </Modal>
  );
}

export default ModalCriarLembrete;
