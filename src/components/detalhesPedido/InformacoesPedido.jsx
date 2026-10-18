function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function InformacoesPedido({ evento, taxaEntrega, observacao, onEditar, bloqueado = false }) {
  return (
    <section className="card-padrao informacoes-pedido-card">
      <div className="dados-cliente-header">
        <h2 className="secao-titulo">Resumo do pedido</h2>
        {onEditar && (
          <button
            type="button"
            className="btn-editar-dados-cliente"
            onClick={onEditar}
            aria-label="Editar detalhes do pedido"
            title="Editar detalhes do pedido"
          >
            <ion-icon name="pencil-outline"></ion-icon>
          </button>
        )}
      </div>
      {bloqueado && (
        <p className="pedido-campo-bloqueado">Edição indisponível para pedidos entregues ou cancelados.</p>
      )}
      <div className="informacoes-pedido-grid resumo-pedido-campos">
        <div className="informacao-pedido-campo">
          <span className="dado-label">Evento</span>
          <span className="dado-valor">{evento || "Sem evento"}</span>
        </div>
        <div className="informacao-pedido-campo">
          <span className="dado-label">Taxa de entrega</span>
          <span className="dado-valor">{moeda(taxaEntrega)}</span>
        </div>
        {observacao?.trim() && (
          <div className="informacao-pedido-campo informacao-pedido-observacao">
            <span className="dado-label">Observação</span>
            <span className="dado-valor">{observacao.trim()}</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default InformacoesPedido;
