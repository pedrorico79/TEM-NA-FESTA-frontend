import { formatarTelefone } from "../../utils/telefone";
import { aplicarMascaraCep } from "../../utils/cep";

function DadosCliente({ cliente, endereco, onEditar, onEditarEndereco }) {
  const contatos = [
    { chave: "telefone", label: "Telefone", valor: cliente.telefone?.trim(), formatar: formatarTelefone },
    { chave: "whatsapp", label: "WhatsApp", valor: cliente.whatsapp?.trim(), formatar: formatarTelefone },
    { chave: "instagram", label: "Instagram", valor: cliente.instagram?.trim(), formatar: (valor) => valor },
  ].filter((contato) => contato.valor);
  const contatoPrincipal = contatos.find((contato) => contato.chave === "telefone")
    || contatos[0];
  const outrosContatos = contatoPrincipal
    ? contatos.filter((contato) => contato !== contatoPrincipal)
    : [];
  const camposEndereco = [
    ["Logradouro", endereco?.logradouro],
    ["Número", endereco?.numero],
    ["Complemento", endereco?.complemento],
    ["Bairro", endereco?.bairro],
    ["Cidade", endereco?.cidade],
    ["Estado", endereco?.estado],
    ["CEP", endereco?.cep],
  ];
  const enderecoCurto = [
    endereco?.logradouro,
    endereco?.numero,
    endereco?.bairro,
    endereco?.cidade,
  ].filter(Boolean).join(", ");

  return (
    <section className="card-padrao dados-cliente-card">
      <div className="dados-cliente-header">
        <h2 className="secao-titulo">Cliente e entrega</h2>
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

      <div className="pedido-resumo-linha">
        <div>
          <span className="dado-label">Cliente</span>
          <span className="dado-valor">{cliente.nome}</span>
        </div>
        {contatoPrincipal && <div>
          <span className="dado-label">{contatoPrincipal.label}</span>
          <span className="dado-valor">{contatoPrincipal.formatar(contatoPrincipal.valor)}</span>
        </div>}
      </div>

      {cliente.anotacoes?.trim() && (
        <div className="pedido-anotacoes-cliente">
          <span className="dado-label">Anotações do cliente</span>
          <span className="dado-valor">{cliente.anotacoes}</span>
        </div>
      )}

      {outrosContatos.length > 0 && <details className="pedido-dados-completos">
        <summary>Ver outros contatos</summary>
        <div className="pedido-dados-completos-grid">
          {outrosContatos.map((contato) => (
            <div className="dado-cliente" key={contato.chave}>
              <span className="dado-label">{contato.label}</span>
              <span className="dado-valor">{contato.formatar(contato.valor)}</span>
            </div>
          ))}
        </div>
      </details>}

      <div className="pedido-resumo-endereco">
        <div className="pedido-resumo-endereco-texto">
          <span className="dado-label">Endereço do pedido</span>
          <span className="dado-valor">{enderecoCurto || "Não informado"}</span>
        </div>
        {onEditarEndereco && (
          <button
            type="button"
            className="btn-editar-dados-cliente"
            onClick={onEditarEndereco}
            aria-label="Editar endereço do pedido"
            title="Editar endereço do pedido"
          >
            <ion-icon name="pencil-outline"></ion-icon>
          </button>
        )}
      </div>

      <details className="pedido-dados-completos pedido-endereco-completo">
        <summary>Ver endereço completo</summary>
        <div className="endereco-pedido-grid">
          {camposEndereco.map(([label, valor]) => (
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
      </details>
    </section>
  );
}

export default DadosCliente;
