function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function PagamentosPedido({
  pagamentos = [],
  totalPedido,
  totalAPagar,
  totalPago,
  totalPendente,
  saldoDisponivel,
  podeExibirAcao,
  podeAdicionar,
  podeConfirmar,
  onAdicionar,
  onConfirmar,
  onCancelar,
  salvandoPagamentoId,
}) {
  function renderAcoesPagamento(pag) {
    return (
      <>
        {pag.statusPagamento === "PENDENTE" && podeConfirmar && (
          <button
            type="button"
            title="Confirmar recebimento"
            aria-label="Confirmar recebimento"
            disabled={salvandoPagamentoId === pag.id}
            onClick={() => onConfirmar(pag)}
          ><ion-icon name="checkmark-circle-outline"></ion-icon></button>
        )}
        {["PENDENTE", "CONFIRMADO"].includes(pag.statusPagamento) && (
          <button
            type="button"
            className="pagamento-cancelar"
            title="Cancelar pagamento"
            aria-label="Cancelar pagamento"
            disabled={salvandoPagamentoId === pag.id}
            onClick={() => onCancelar(pag)}
          ><ion-icon name="close-circle-outline"></ion-icon></button>
        )}
      </>
    );
  }

  return (
    <div className="card-padrao pagamentos-pedido-card">
      <div className="secao-header-flex pagamentos-secao-header">
        <h2 className="secao-titulo">Pagamentos</h2>
        {podeExibirAcao && (
          <button
            type="button"
            className="btn-registrar-pagamento"
            onClick={onAdicionar}
            disabled={!podeAdicionar}
            title={podeAdicionar ? "Registrar um novo pagamento" : "Não há saldo disponível para registrar outro pagamento"}
          >
            <ion-icon name="add-circle-outline"></ion-icon>
            Registrar pagamento
          </button>
        )}
      </div>

      <div className="pagamentos-resumo" aria-label="Resumo dos pagamentos">
        <div className="pagamento-resumo-item">
          <span>Total do pedido</span>
          <strong>{moeda(totalPedido)}</strong>
        </div>
        <div className="pagamento-resumo-item recebido">
          <span>Já recebido</span>
          <strong>{moeda(totalPago)}</strong>
        </div>
        <div className="pagamento-resumo-item aberto">
          <span>Saldo em aberto</span>
          <strong>{moeda(totalAPagar)}</strong>
        </div>
      </div>

      <div className="pagamentos-pendentes-linha">
        {podeExibirAcao ? (
          <>
            <span>Aguardando confirmação: <strong>{moeda(totalPendente)}</strong></span>
            <span>Disponível para registrar: <strong>{moeda(saldoDisponivel)}</strong></span>
          </>
        ) : <span>Registro de pagamentos indisponível para este pedido.</span>}
      </div>

      <details className="pagamentos-historico">
        <summary>Histórico de pagamentos <span>({pagamentos.length})</span></summary>
        <div className="tabela-custom-wrapper tabela-pagamentos-wrapper">
        <table className="tabela-pedido tabela-pagamentos-pedido">
          <thead>
            <tr>
              <th>DATA</th>
              <th>VALOR</th>
              <th>MÉTODO</th>
              <th>TIPO</th>
              <th>SITUAÇÃO</th>
              <th aria-label="Ações"></th>
            </tr>
          </thead>
          <tbody>
            {pagamentos.length ? pagamentos.map((pag) => {
              const temAcaoConfirmar = pag.statusPagamento === "PENDENTE" && podeConfirmar;
              const temAcaoCancelar = ["PENDENTE", "CONFIRMADO"].includes(pag.statusPagamento);
              const temDuasAcoes = temAcaoConfirmar && temAcaoCancelar;

              return (
              <tr key={pag.id}>
                <td><span className="badge-data">{pag.data}</span></td>
                <td>
                  {moeda(pag.valor)}
                  <span className="pagamento-metadados-mobile">
                    {[pag.metodo || "Não informado", pag.tipoLabel || pag.tipoPagamento || "Não informado"].join(" · ")}
                  </span>
                </td>
                <td>{pag.metodo || "Não informado"}</td>
                <td>{pag.tipoLabel || pag.tipoPagamento || "Não informado"}</td>
                <td>
                  <div className={`pagamento-situacao-com-acoes ${temDuasAcoes ? "duas-acoes" : temAcaoCancelar ? "acao-unica" : ""}`}>
                    <span className={`pagamento-status pagamento-status-${String(pag.statusPagamento || "").toLowerCase()}`}>
                      {pag.statusLabel || pag.statusPagamento || "Não informado"}
                    </span>
                    {(temAcaoConfirmar || temAcaoCancelar) && (
                      <div className="pagamento-acoes-mobile">{renderAcoesPagamento(pag)}</div>
                    )}
                  </div>
                </td>
                <td className="pagamento-acoes">
                  {renderAcoesPagamento(pag)}
                </td>
              </tr>
              );
            }) : (
              <tr><td colSpan="6" className="pagamentos-vazio">Nenhum pagamento registrado.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </details>
    </div>
  );
}

export default PagamentosPedido;
