function ItensPedido({ itens, total, onEditar }) {
  return (
    <div className="card-padrao">
      <div className="dados-cliente-header">
        <h2 className="secao-titulo">Itens do Pedido</h2>
        <button
          type="button"
          className="btn-editar-dados-cliente"
          onClick={onEditar}
          aria-label="Editar itens do pedido"
          title="Editar itens do pedido"
        >
          <ion-icon name="pencil-outline"></ion-icon>
        </button>
      </div>
      <div className="tabela-custom-wrapper">
        <table className="tabela-pedido">
          <thead>
            <tr>
              <th>PRODUTO</th>
              <th>DESCRIÇÃO</th>
              <th>OBSERVAÇÃO</th>
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
                <td>{item.observacaoItem || "—"}</td>
                <td className="text-center">{item.qtd}</td>
                <td className="text-right">R${item.precoUnitario.toFixed(2)}</td>
                <td className="text-center">{typeof item.desconto === "number" ? `R$${item.desconto.toFixed(2)}` : item.desconto}</td>
                <td className="text-right">R${item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="linha-total">
              <td colSpan="6"><strong>Total</strong></td>
              <td className="text-right"><strong>R${total.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ItensPedido;
