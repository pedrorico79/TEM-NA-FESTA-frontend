import Tabela from "../shared/tabela/Tabela";

function TabelaComparativoEventos(props) {

    const columns = [
        props.modoEvento ? "ANO" : "EVENTO",
        "PEDIDOS",
        "FATURAMENTO",
        "TICKET MÉDIO"
    ];

    const data = (props.dados || []).map((evento) => [
        <span title={evento.evento}>{evento.evento}</span>,
        evento.pedidosTotais,
        evento.faturamento?.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        }) ?? "R$ 0,00",
        evento.ticketMedio?.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        }) ?? "R$ 0,00"
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
