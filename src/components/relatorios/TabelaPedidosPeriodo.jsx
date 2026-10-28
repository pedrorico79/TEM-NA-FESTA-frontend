import Tabela from "../shared/tabela/Tabela";
import { formatarMoeda } from "./formatarPercentual";

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
        formatarMoeda(pedido.valorTotal),
        pedido.statusNome
    ]);

    return (
        <div className="card-relatorio">
            <h2>{props.titulo || "Pedidos do Período"}</h2>

            <div className="relatorio-tabela-wrapper">
                <Tabela
                    columns={columns}
                    data={data}
                />
                {data.length === 0 && (
                    <p className="relatorio-estado-vazio">Nenhum pedido encontrado neste filtro.</p>
                )}
            </div>
        </div>
    );
}

export default TabelaPedidosPeriodo;
