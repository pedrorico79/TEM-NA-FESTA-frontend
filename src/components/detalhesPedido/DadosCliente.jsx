import { formatarTelefone } from "../../utils/telefone";

function DadosCliente({ cliente, onEditar }) {
  return (
    <div className="card-padrao">
      <div className="dados-cliente-header">
        <h2 className="secao-titulo">Dados do Cliente</h2>
        {onEditar && (
          <button
            type="button"
            className="btn-editar-dados-cliente"
            onClick={onEditar}
            aria-label="Editar dados do cliente"
            title="Editar cliente"
          >
            <ion-icon name="pencil-outline"></ion-icon>
          </button>
        )}
      </div>

      <div className="dados-cliente-grid">
        <div className="dado-cliente">
          <span className="dado-label">Nome</span>
          <span className="dado-valor">{cliente.nome}</span>
        </div>

        <div className="dado-cliente">
          <span className="dado-label">Evento</span>
          <span className="dado-valor">{cliente.evento}</span>
        </div>

        <div className="dado-cliente">
          <span className="dado-label">Telefone</span>
          <span className="dado-valor">{formatarTelefone(cliente.telefone) || "-"}</span>
        </div>

        <div className="dado-cliente">
          <span className="dado-label">WhatsApp</span>
          <span className="dado-valor">{formatarTelefone(cliente.whatsapp) || "-"}</span>
        </div>

        <div className="dado-cliente">
          <span className="dado-label">Instagram</span>
          <span className="dado-valor">{cliente.instagram}</span>
        </div>
      </div>
    </div>
  );
}

export default DadosCliente;
