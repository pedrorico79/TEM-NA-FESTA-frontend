import Tabela from "../shared/tabela/Tabela";

function TabelaComparativoEventos(props) {

    const columns = [
        "EVENTO",
        "PEDIDOS",
        "FATURAMENTO",
        "TICKET MÉDIO"
    ];

    const data = (props.dados || []).map((evento) => [
        evento.evento,
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
        <div className="relatorio-tabela-wrapper">
            <Tabela
                columns={columns}
                data={data}
            />
        </div>
    );
}

export default TabelaComparativoEventos;