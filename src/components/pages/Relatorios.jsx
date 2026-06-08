import { useEffect, useState } from "react";

import { api } from "../../services/api";

import Kpi from "../shared/kpi/Kpi";
import Menu from "../shared/menu/Menu";
import FiltrosRelatorio from "../relatorios/FiltrosRelatorio";
import GraficosRelatorio from "../relatorios/GraficosRelatorio";
import TabelaPedidosPeriodo from "../relatorios/TabelaPedidosPeriodo";
import TabelaProdutosVendidos from "../relatorios/TabelaProdutosVendidos";

import "../css/Relatorios.css";

function Relatorios() {

    const hoje = new Date();

    const trintaDiasAtras = new Date();

    trintaDiasAtras.setDate(
        trintaDiasAtras.getDate() - 30
    );

    const formatarData = (data) =>
        data.toISOString().split("T")[0];

    const [dataInicial, setDataInicial] = useState(
        formatarData(trintaDiasAtras)
    );

    const [dataFinal, setDataFinal] = useState(
        formatarData(hoje)
    );

    const [kpis, setKpis] = useState(null);

    const [pedidosPorSemana, setPedidosPorSemana] = useState([]);

    const [pedidosPeriodo, setPedidosPeriodo] = useState([]);

    const [produtosMaisVendidos, setProdutosMaisVendidos] = useState([]);

    const [comparativoEventos, setComparativoEventos] = useState([]);

    useEffect(() => {

        carregarRelatorios();

    }, [dataInicial, dataFinal]);

    function carregarRelatorios() {

        api.get("/relatorios/kpis", {
            params: {
                de: dataInicial,
                ate: dataFinal
            }
        })
            .then((res) => {
                console.log("KPIs", res.data);
                setKpis(res.data);
            })
            .catch((err) => {
                console.log(err);
            });

        api.get("/relatorios/pedidos-por-semana", {
            params: {
                de: dataInicial,
                ate: dataFinal
            }
        })
            .then((res) => {
                console.log("Pedidos por semana", res.data);
                setPedidosPorSemana(res.data);
            })
            .catch((err) => {
                console.log(err);
            });

        api.get("/relatorios/pedidos-periodo", {
            params: {
                de: dataInicial,
                ate: dataFinal,
                page: 0,
                size: 10
            }
        })
            .then((res) => {
                console.log("Pedidos período", res.data);
                setPedidosPeriodo(res.data.content);
            })
            .catch((err) => {
                console.log(err);
            });

        api.get("/relatorios/produtos-mais-vendidos", {
            params: {
                de: dataInicial,
                ate: dataFinal,
                page: 0,
                size: 10
            }
        })
            .then((res) => {
                console.log("Produtos mais vendidos", res.data);
                setProdutosMaisVendidos(res.data.content);
            })
            .catch((err) => {
                console.log(err);
            });

        api.get("/relatorios/comparativo-eventos", {
            params: {
                de: dataInicial,
                ate: dataFinal
            }
        })
            .then((res) => {
                console.log("Comparativo eventos", res.data);
                setComparativoEventos(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    return (
        <div className="layout">

            <Menu active="relatorios" />

            <main className="relatorios">

                <h1>Relatórios</h1>

                <FiltrosRelatorio
                    dataInicial={dataInicial}
                    dataFinal={dataFinal}
                    setDataInicial={setDataInicial}
                    setDataFinal={setDataFinal}
                />

                <section className="kpis">

                    <Kpi
                        icon="cube-outline"
                        title="TOTAL DE PEDIDOS"
                        value={kpis?.totalPedidos ?? 0}
                        description={`${kpis?.totalEntregues ?? 0} entregue(s)`}
                        iconColor="#3b82f6"
                        iconBackground="#dbeafe"
                    />

                    <Kpi
                        icon="time-outline"
                        title="TAXA DE CONCLUSÃO"
                        value={`${kpis?.taxaConclusaoPorcentagem ?? 0}%`}
                        description={`${kpis?.totalEntregues ?? 0} de ${kpis?.totalPedidos ?? 0} pedidos entregues`}
                        iconColor="#f59e0b"
                        iconBackground="#fef3c7"
                    />

                    <Kpi
                        icon="checkmark-circle"
                        title="FATURAMENTO TOTAL"
                        value={`R$ ${kpis?.faturamentoTotal ?? 0}`}
                        description={`${kpis?.totalEntregues ?? 0} entregue(s)`}
                        iconColor="#22c55e"
                        iconBackground="#dcfce7"
                    />

                    <Kpi
                        icon="calendar-outline"
                        title="PERÍODO"
                        value={`${kpis?.periodoDias ?? 0} dias`}
                        description={`${kpis?.totalEntregues ?? 0} entrega(s)`}
                        iconColor="#8b5cf6"
                        iconBackground="#ede9fe"
                    />

                </section>

                <GraficosRelatorio
                    pedidosPorSemana={pedidosPorSemana}
                    comparativoEventos={comparativoEventos}
                    pedidosPeriodo={pedidosPeriodo}
                    produtosMaisVendidos={produtosMaisVendidos}
                />



            </main>

        </div>
    );
}

export default Relatorios;