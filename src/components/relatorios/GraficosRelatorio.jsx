import GraficoPedidosSemana from "./GraficoPedidosSemana";

import GraficoComparativoEventos from "./GraficoComparativoEventos";

import TabelaProdutosVendidos from "./TabelaProdutosVendidos";

import TabelaComparativoEventos from "./TabelaComparativoEventos";

function GraficosRelatorio(props) {

return (

    <>

        <div className="relatorio-pedidos-produtos">

            <div className="card-relatorio">

                <h2>Pedidos por semana</h2>

                <GraficoPedidosSemana
                    dados={props.pedidosPorSemana}
                />

            </div>

            <div className="card-relatorio">

                <TabelaProdutosVendidos
                    produtos={props.produtosMaisVendidos}
                />

            </div>

        </div>

        <div className="card-relatorio">

            <h2>Comparativo entre Eventos</h2>

            <GraficoComparativoEventos
                dados={props.comparativoEventos}
            />

            <TabelaComparativoEventos
                dados={props.comparativoEventos}
            />

        </div>

    </>

);

}

export default GraficosRelatorio;
