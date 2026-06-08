import GraficoPedidosSemana from "./GraficoPedidosSemana";
import GraficoComparativoEventos from "./GraficoComparativoEventos";
import TabelaPedidosPeriodo from "./TabelaPedidosPeriodo";
import TabelaProdutosVendidos from "./TabelaProdutosVendidos";

function GraficosRelatorio(props) {

    return (
        <>
            <div className="card-relatorio">

                <h2>Pedidos por semana</h2>

                <GraficoPedidosSemana
                    dados={props.pedidosPorSemana}
                />

            </div>

            <div className="tabelas-relatorio">

                <TabelaPedidosPeriodo
                    pedidos={props.pedidosPeriodo}
                />

                <TabelaProdutosVendidos
                    produtos={props.produtosMaisVendidos}
                />

            </div>

            <div className="card-relatorio">

                <h2>Comparativo entre Eventos</h2>

                <GraficoComparativoEventos
                    dados={props.comparativoEventos}
                />

            </div>
        </>
    );
}

export default GraficosRelatorio;