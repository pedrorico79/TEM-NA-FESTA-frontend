import GraficoPedidosSemana from "./GraficoPedidosSemana";
import GraficoComparativoEventos from "./GraficoComparativoEventos";
import TabelaPedidosPeriodo from "./TabelaPedidosPeriodo";
import TabelaProdutosVendidos from "./TabelaProdutosVendidos";

function GraficosRelatorio() {

    const pedidosPorSemana = [
        { semana: "Sem 1", pedidos: 8 },
        { semana: "Sem 2", pedidos: 9 },
        { semana: "Sem 3", pedidos: 13 },
        { semana: "Sem 4", pedidos: 15 },
        { semana: "Sem 5", pedidos: 16 }
    ];

    const eventos = [
        {
            evento: "Casamentos",
            pedidos: 7
        },
        {
            evento: "Campanha Livre",
            pedidos: 5
        },
        {
            evento: "Halloween",
            pedidos: 9
        },
        {
            evento: "Aniversários",
            pedidos: 4
        }
    ];

    return (
        <>
            <div className="card-relatorio">

                <h2>Pedidos por semana</h2>

                <GraficoPedidosSemana
                    dados={pedidosPorSemana}
                />

            </div>

            <div className="tabelas-relatorio">

                <TabelaPedidosPeriodo />

                <TabelaProdutosVendidos />

            </div>

            <div className="card-relatorio">

                <h2>Comparativo entre Eventos</h2>

                <GraficoComparativoEventos
                    dados={eventos}
                />

            </div>
        </>
    );
}

export default GraficosRelatorio;