import React from "react";

function ItensPedido({ itens, total }) {
  return (
    <div className="card-padrao">
      <h2 className="secao-titulo">Itens do Pedido</h2>
      <div className="tabela-custom-wrapper">
        <table className="tabela-pedido">
          <thead>
            <tr>
              <th>PRODUTO</th>
              <th>DESCRIÇÃO</th>
              <th>QTD.</th>
              <th>PREÇO UNITÁRIO</th>
              <th>DESCONTO</th>
              <th>SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id}>
                <td>{item.produto}</td>
                <td>{item.descricao}</td>
                <td className="text-center">{item.qtd}</td>
                <td className="text-right">R${item.precoUnitario.toFixed(2)}</td>
                <td className="text-center">{typeof item.desconto === "number" ? `R$${item.desconto.toFixed(2)}` : item.desconto}</td>
                <td className="text-right">R${item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="linha-total">
              <td colSpan="5"><strong>Total</strong></td>
              <td className="text-right"><strong>R${total.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ItensPedido;