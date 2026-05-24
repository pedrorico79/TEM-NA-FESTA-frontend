import KPI from "../shared/KPI/KPI";

function KpiSection() {
  return (
    <div className="kpis-grid">
      <KPI
        icon="bag-outline"
        iconColor="#3b82f6"
        iconBackground="#dbeafe"
        title="TOTAL DE PEDIDOS"
        value="4"
        description="+12%"
      />

      <KPI
        icon="hourglass-outline"
        iconColor="#9a7b6b"
        iconBackground="#f3ebe6"
        title="AGUARDANDO PREPARO"
        value="2"
      />

      <KPI
        icon="card-outline"
        iconColor="#ef4444"
        iconBackground="#fee2e2"
        title="PAGAMENTOS PENDENTES"
        value="1"
      />
    </div>
  );
}

export default KpiSection;