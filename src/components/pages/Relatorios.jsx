import Kpi from "../shared/kpi/Kpi";
import Menu from "../shared/menu/Menu";
import FiltrosRelatorio from "../relatorios/FiltrosRelatorio"
import GraficosRelatorio from "../relatorios/GraficosRelatorio"
import TabelaPedidosPeriodo from "../relatorios/TabelaPedidosPeriodo"
import TabelaProdutosVendidos from "../relatorios/TabelaProdutosVendidos"

import "../css/Relatorios.css";

function Relatorios() {
    return (
        <div className="layout">

            <Menu active="relatorios" />

            <main className="relatorios">

                <h1>Relatórios</h1>

                <FiltrosRelatorio />

                <section className="kpis">

                    <Kpi
                        icon="cube-outline"
                        title="TOTAL DE PEDIDOS"
                        value="5"
                        description="1 entregue(s)"
                        iconColor="#3b82f6"
                        iconBackground="#dbeafe"
                    />

                    <Kpi
                        icon="time-outline"
                        title="TAXA DE CONCLUSÃO"
                        value="20%"
                        description="1 de 5 pedidos entregues"
                        iconColor="#f59e0b"
                        iconBackground="#fef3c7"
                    />

                    <Kpi
                        icon="checkmark-circle"
                        title="FATURAMENTO TOTAL"
                        value="R$ 1.250,00"
                        description="1 entregue(s)"
                        iconColor="#22c55e"
                        iconBackground="#dcfce7"
                    />

                    <Kpi
                        icon="calendar-outline"
                        title="PERÍODO"
                        value="136 dias"
                        description="1 entrega(s)"
                        iconColor="#8b5cf6"
                        iconBackground="#ede9fe"
                    />

                </section>

                <GraficosRelatorio />



            </main>

        </div>
    );
}

export default Relatorios