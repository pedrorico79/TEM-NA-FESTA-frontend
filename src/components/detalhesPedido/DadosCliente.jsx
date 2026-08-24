import React from "react";

function DadosCliente({ cliente }) {
  return (
    <div className="card-padrao">
      <h2 className="secao-titulo">Dados do Cliente</h2>

      <div className="dados-cliente-grid">
        <div className="dado-cliente">
          <span className="dado-label">Nome</span>
          <span className="dado-valor">{cliente.nome}</span>
        </div>

        <div className="dado-cliente">
          <span className="dado-label">Evento</span>
          <span className="dado-valor">{cliente.evento}</span>
        </div>

        <div className="dado-cliente col-span-2">
          <span className="dado-label">Endereço</span>
          <span className="dado-valor">{cliente.endereco}</span>
        </div>

        <div className="dado-cliente">
          <span className="dado-label">Telefone</span>
          <span className="dado-valor">{cliente.telefone}</span>
        </div>

        <div className="dado-cliente">
          <span className="dado-label">WhatsApp</span>
          <span className="dado-valor">{cliente.whatsapp}</span>
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