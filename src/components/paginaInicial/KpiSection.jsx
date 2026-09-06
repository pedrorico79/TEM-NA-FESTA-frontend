import KPI from "../shared/kpi/Kpi";

function KpiSection(props) {
  return (
    <div className="kpis-grid">
      <KPI
        icon="bag-outline"
        iconColor="#3b82f6"
        iconBackground="#dbeafe"
        title="PEDIDOS ATIVOS"
        value={props.kpis.pedidosAtivos}
      />

      <KPI
        icon="hourglass-outline"
        iconColor="#9a7b6b"
        iconBackground="#f3ebe6"
        title="AGUARDANDO PREPARO"
        value={props.kpis.aguardandoPreparo}
      />

      <KPI
        icon="restaurant-outline"
        iconColor="#f59e0b"
        iconBackground="#fef3c7"
        title="EM PRODUÇÃO"
        value={props.kpis.emProducao}
      />

      <KPI
        icon="card-outline"
        iconColor="#ef4444"
        iconBackground="#fee2e2"
        title="PAGAMENTOS PENDENTES"
        value={props.kpis.pagamentosPendentes}
      />
    </div>
  );
}

export default KpiSection;
