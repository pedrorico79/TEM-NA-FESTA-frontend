function InformacoesPedido({ evento, observacao, onEditar, bloqueado = false, mensagemBloqueio, atrasado = false }) {
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
        <p className={`pedido-campo-bloqueado${atrasado ? " pedido-campo-atrasado" : ""}`}>
          {mensagemBloqueio || "Edição indisponível para pedidos entregues ou cancelados."}
        </p>
      )}
      <div className="informacoes-pedido-grid resumo-pedido-campos">
        <div className="informacao-pedido-campo informacao-pedido-evento">
          <span className="dado-label">Evento</span>
          <span className="dado-valor">{evento || "Sem evento"}</span>
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
