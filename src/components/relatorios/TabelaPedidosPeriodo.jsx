import Tabela from "../shared/tabela/Tabela";

function TabelaPedidosPeriodo() {

    const columns = [
        "#PEDIDO",
        "CLIENTE",
        "ENTREGA",
        "TOTAL",
        "STATUS"
    ];

    const data = [
        ["25-004", "Daniela Santos", "05/06/2026", "R$ 780,00", "Novo"],
        ["25-003", "Mariana Lima", "01/06/2026", "R$ 420,00", "Entregue"],
        ["25-002", "Beatriz Ferreira", "25/05/2026", "R$ 180,00", "Novo"],
        ["25-001", "Ana Carolina", "18/05/2026", "R$ 320,00", "Em Produção"]
    ];

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