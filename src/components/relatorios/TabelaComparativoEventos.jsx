import Tabela from "../shared/tabela/Tabela";
import { formatarMoeda } from "./formatarPercentual";

function TabelaComparativoEventos(props) {

    const columns = [
        props.modoEvento
            ? props.agrupamentoEvento === "MES" ? "MÊS" : "ANO"
            : "EVENTO",
        "PEDIDOS",
        "FATURAMENTO",
        "TICKET MÉDIO"
    ];

    const data = (props.dados || []).map((evento) => [
        <span title={props.modoEvento ? evento.periodo : evento.evento}>
            {props.modoEvento ? evento.periodo : evento.evento}
        </span>,
        evento.pedidosTotais,
        formatarMoeda(evento.faturamento),
        formatarMoeda(evento.ticketMedio)
    ]);

    return (
        <div className="relatorio-tabela-wrapper relatorio-eventos-tabela-wrapper">
            <Tabela
                columns={columns}
                data={data}
            />
        </div>
    );
}

export default TabelaComparativoEventos;
