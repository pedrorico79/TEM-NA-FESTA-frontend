function HeaderPedidos({ resumo = {}, filtrosSelecionados = [], onFiltrar }) {
  const atrasadosSelecionado = filtrosSelecionados.includes("ATRASADOS");
  const producaoSelecionada = filtrosSelecionados.includes("EM_PRODUCAO");
  const pagamentosSelecionados = filtrosSelecionados.includes("PAGAMENTOS_PENDENTES");
  const pagamentosPendentesEntregues = Number(resumo.pagamentosPendentesEntregues ?? 0);

  return (
    <div className="pedidos-header">
      <h1 className="titulo-pagina">
        Pedidos
      </h1>
      <div className="pedidos-resumo" aria-label="Resumo dos pedidos">
        <button
          type="button"
          className={`pedido-resumo-item producao ${producaoSelecionada ? "selecionado" : ""}`}
          onClick={() => onFiltrar?.("EM_PRODUCAO")}
          aria-pressed={producaoSelecionada}
          aria-label={`Em produção: ${resumo.emProducao ?? "carregando"}. Filtrar pedidos em produção`}
        >
          <span className="pedido-resumo-icone"><ion-icon name="restaurant-outline"></ion-icon></span>
          <span className="pedido-resumo-texto"><span>Em produção</span><strong>{resumo.emProducao ?? "—"}</strong></span>
        </button>
        <button
          type="button"
          className={`pedido-resumo-item atrasados ${atrasadosSelecionado ? "selecionado" : ""}`}
          onClick={() => onFiltrar?.("ATRASADOS")}
          aria-pressed={atrasadosSelecionado}
          aria-label={`Atrasados: ${resumo.atrasados ?? "carregando"}. Filtrar pedidos atrasados`}
        >
          <span className="pedido-resumo-icone"><ion-icon name="alert-circle-outline"></ion-icon></span>
          <span className="pedido-resumo-texto"><span>Atrasados</span><strong>{resumo.atrasados ?? "—"}</strong></span>
        </button>
        <button
          type="button"
          className={`pedido-resumo-item pagamentos ${pagamentosSelecionados ? "selecionado" : ""}`}
          onClick={() => onFiltrar?.("PAGAMENTOS_PENDENTES")}
          aria-pressed={pagamentosSelecionados}
          aria-label={`Pagamentos pendentes: ${resumo.pagamentosPendentes ?? "carregando"}. Filtrar pedidos com pagamentos pendentes`}
        >
          <span className="pedido-resumo-icone"><ion-icon name="card-outline"></ion-icon></span>
          <span className={`pedido-resumo-texto ${pagamentosPendentesEntregues > 0 ? "" : "sem-subtitulo"}`}>
            <span>Pagamentos pendentes</span>
            <strong>{resumo.pagamentosPendentes ?? "—"}</strong>
            <small aria-hidden={pagamentosPendentesEntregues <= 0 || undefined}>
              {pagamentosPendentesEntregues > 0
                ? `${pagamentosPendentesEntregues} já entregue${pagamentosPendentesEntregues === 1 ? "" : "s"}`
                : "\u00a0"}
            </small>
          </span>
        </button>
      </div>
    </div>
  );
}

export default HeaderPedidos;
