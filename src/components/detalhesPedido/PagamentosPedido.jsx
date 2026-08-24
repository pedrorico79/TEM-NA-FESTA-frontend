import React from "react";
import BotaoAdicionar from "../shared/botaoAdicionar/BotaoAdicionar";

function PagamentosPedido({ pagamentos, totalAPagar, totalPago }) {
  return (
    <div className="card-padrao">
      <div className="secao-header-flex">
        <h2 className="secao-titulo">Pagamentos</h2>
        <BotaoAdicionar text="Adicionar Pagamento" size="medium" onClick={() => {}} />
      </div>

      <div className="tabela-custom-wrapper">
        <table className="tabela-pedido">
          <thead>
            <tr>
              <th>DATA</th>
              <th>VALOR</th>
              <th>MÉTODO DE PAGAMENTO</th>
            </tr>
          </thead>
          <tbody>
            {pagamentos.map((pag) => (
              <tr key={pag.id}>
                <td><span className="badge-data">{pag.data}</span></td>
                <td>R${pag.valor.toFixed(2)}</td>
                <td>{pag.metodo}</td>
              </tr>
            ))}
            <tr className="linha-destaque-red">
              <td><strong>Total a Pagar</strong></td>
              <td colSpan="2" className="text-right color-danger">
                <strong>R${totalAPagar.toFixed(2)}</strong>
              </td>
            </tr>
            <tr className="linha-total">
              <td><strong>Total Pago</strong></td>
              <td colSpan="2" className="text-right">
                <strong>R${totalPago.toFixed(2)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PagamentosPedido;