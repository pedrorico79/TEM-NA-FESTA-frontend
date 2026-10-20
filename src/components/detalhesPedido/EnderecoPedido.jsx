import { aplicarMascaraCep } from "../../utils/cep";

function EnderecoPedido({ endereco, onEditar }) {
  const campos = [
    ["Logradouro", endereco?.logradouro],
    ["Número", endereco?.numero],
    ["Complemento", endereco?.complemento],
    ["Bairro", endereco?.bairro],
    ["Cidade", endereco?.cidade],
    ["Estado", endereco?.estado],
    ["CEP", endereco?.cep],
  ];

  return (
    <div className="card-padrao endereco-pedido-card">
      <div className="dados-cliente-header">
        <h2 className="secao-titulo">Endereço</h2>
        {onEditar && (
          <button
            type="button"
            className="btn-editar-dados-cliente"
            onClick={onEditar}
            aria-label="Editar endereço do pedido"
            title="Editar endereço do pedido"
          >
            <ion-icon name="pencil-outline"></ion-icon>
          </button>
        )}
      </div>
      <div className="endereco-pedido-grid">
        {campos.map(([label, valor]) => (
          <div className={`endereco-pedido-campo ${label === "Logradouro" ? "linha-cheia" : ""}`} key={label}>
            <span className="dado-label">{label}</span>
            <span className="dado-valor">
              {valor
                ? label === "CEP" ? aplicarMascaraCep(valor) : valor
                : "Não informado"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EnderecoPedido;
