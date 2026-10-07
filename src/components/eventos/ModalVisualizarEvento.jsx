import Modal from "../shared/modal/Modal";
import LoadingState from "../shared/LoadingState";

function formatarData(data) {
    if (!data) return "-";
    const [ano, mes, dia] = String(data).slice(0, 10).split("-");
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : data;
}

function ModalVisualizarEvento({ open, evento, carregando, erro, onClose }) {
    return (
        <Modal open={open} onClose={onClose} title="Detalhes do Evento">
            {carregando ? (
                <LoadingState className="evento-detalhe-estado loading-state--compact" label="Carregando evento…" />
            ) : erro ? (
                <p className="evento-detalhe-estado" role="alert">{erro}</p>
            ) : evento ? (
                <div className="evento-detalhes">
                    <div className="evento-detalhe">
                        <strong>Nome</strong>
                        <p>{evento.nome || "-"}</p>
                    </div>

                    <div className="evento-detalhes-datas">
                        <div className="evento-detalhe">
                            <strong>Data inicial</strong>
                            <p>{formatarData(evento.dataInicio)}</p>
                        </div>
                        <div className="evento-detalhe">
                            <strong>Data final</strong>
                            <p>{formatarData(evento.dataFim)}</p>
                        </div>
                    </div>

                    <div className="evento-detalhe">
                        <strong>Status</strong>
                        <p>{evento.ativo ? "Ativo" : "Inativo"}</p>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="secondary-button" onClick={onClose}>
                            Fechar
                        </button>
                    </div>
                </div>
            ) : null}
        </Modal>
    );
}

export default ModalVisualizarEvento;
