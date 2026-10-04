import { aplicarMascaraCep } from "../../utils/cep";

function EnderecoPedido({ endereco }) {
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
      </div>
      <div className="endereco-pedido-grid">
        {campos.map(([label, valor]) => (
          <div className="endereco-pedido-campo" key={label}>
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
