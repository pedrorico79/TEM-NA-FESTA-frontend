import KPI from "../shared/kpi/Kpi";

function KpiSection({ kpis, onSelecionar }) {
  const pagamentosPendentesEntregues = Number(kpis.pagamentosPendentesEntregues ?? 0);

  return (
    <div className="kpis-grid">
      <KPI
        icon="bag-outline"
        iconColor="#16a34a"
        iconBackground="#dcfce7"
        title="PEDIDOS ATIVOS"
        value={kpis.pedidosAtivos}
        onClick={() => onSelecionar("ATIVOS")}
      />

      <KPI
        icon="checkmark-circle-outline"
        iconColor="#3b82f6"
        iconBackground="#dbeafe"
        title="CONFIRMADOS"
        value={kpis.aguardandoPreparo}
        onClick={() => onSelecionar("CONFIRMADO")}
      />

      <KPI
        icon="restaurant-outline"
        iconColor="#f59e0b"
        iconBackground="#fef3c7"
        title="EM PRODUÇÃO"
        value={kpis.emProducao}
        onClick={() => onSelecionar("EM_PRODUCAO")}
      />

      <KPI
        icon="card-outline"
        iconColor="#ef4444"
        iconBackground="#fee2e2"
        title="PAGAMENTOS PENDENTES"
        value={kpis.pagamentosPendentes}
        description={pagamentosPendentesEntregues > 0
          ? `${pagamentosPendentesEntregues} já entregue${pagamentosPendentesEntregues === 1 ? "" : "s"}`
          : "\u00a0"}
        descriptionClassName="kpi-subtitulo-pagamentos"
        onClick={() => onSelecionar("PAGAMENTOS_PENDENTES")}
      />
    </div>
  );
}

export default KpiSection;
