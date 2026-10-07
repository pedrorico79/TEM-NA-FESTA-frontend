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

        {props.exibirEvolucaoEvento !== false && <div className="card-relatorio">

                <h2>
                    {props.modoEvento
                        ? props.agrupamentoEvento === "ANO"
                            ? "Pedidos por ano do evento"
                            : "Pedidos por mês do evento"
                        : "Comparativo entre Eventos"}
                </h2>

            <GraficoComparativoEventos
                dados={props.comparativoEventos}
                modoEvento={props.modoEvento}
            />

            <TabelaComparativoEventos
                dados={props.comparativoEventos}
                modoEvento={props.modoEvento}
                agrupamentoEvento={props.agrupamentoEvento}
            />

        </div>}

    </>

);

}

export default GraficosRelatorio;
