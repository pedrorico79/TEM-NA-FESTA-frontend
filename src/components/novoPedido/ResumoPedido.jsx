function ResumoPedido() {

  return (
    <div className="resumo-pedido">

      <div>

        <span>Subtotal</span>

        <strong>R$ 59,00</strong>

      </div>

      <div>

        <span>Sinal / Entrada</span>

        <input
          type="text"
          value="0,00"
        />

      </div>

      <div className="total-row">

        <span>Total</span>

        <strong>R$ 59,00</strong>

      </div>

    </div>
  );
}

export default ResumoPedido;