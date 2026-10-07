import Modal from "../shared/modal/Modal";

function ModalVisualizarLembrete({ open, lembrete, onClose }) {
  function formatarData(data) {
    if (!data) return "-";

    const [ano, mes, dia] = data.split("T")[0].split("-");
    if (!ano || !mes || !dia) return data;

    return `${dia}/${mes}/${ano}`;
  }

  return (
    <Modal open={open} onClose={onClose} title="Resumo do Lembrete" variant="lembrete">
      {lembrete && (
        <div className="lembrete-detalhes">
          <div className="lembrete-detalhe">
            <strong>Descrição</strong>
            <p>{lembrete.descricao || "-"}</p>
          </div>

          <div className="lembrete-detalhe">
            <strong>Data limite</strong>
            <p>{formatarData(lembrete.dataLimite)}</p>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default ModalVisualizarLembrete;
