import Tabela from "../shared/tabela/Tabela";

function TabelaProdutosVendidos(props) {

    const columns = [
        "#",
        "ITEM",
        "QTDE",
        "FATURAMENTO",
        "%"
    ];

    const data = (props.produtos || []).map((produto, index) => [
        index + 1,
        produto.item,
        produto.qtdeVendida,
        `R$ ${produto.faturamento}`,
        `${produto.porcentagemDoTotal}%`
    ]);

    return (
        <div className="card-relatorio">

            <h2>Produtos Mais Vendidos</h2>

            <div className="relatorio-tabela-wrapper">

                <Tabela
                    columns={columns}
                    data={data}
                />

            </div>

        </div>
    );
}

export default TabelaProdutosVendidos;