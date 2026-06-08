import Tabela from "../shared/tabela/Tabela";

function TabelaPedidosPeriodo(props) {

    const columns = [
        "#",
        "CLIENTE",
        "EVENTO",
        "TOTAL",
        "STATUS"
    ];

    const data = (props.pedidos || []).map((pedido) => [
        pedido.id,
        pedido.clienteNome,
        pedido.eventoNome,
        `R$ ${pedido.valorTotal}`,
        pedido.statusNome
    ]);

    return (
        <div className="card-relatorio">
            <h2>Pedidos do Período</h2>

            <div className="relatorio-tabela-wrapper">
                <Tabela
                    columns={columns}
                    data={data}
                />
            </div>
        </div>
    );
}

export default TabelaPedidosPeriodo;