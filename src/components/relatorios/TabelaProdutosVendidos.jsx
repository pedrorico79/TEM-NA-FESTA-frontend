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
        <span className="relatorio-produto-item" title={produto.item}>{produto.item}</span>,
        produto.qtdeVendida,
        `R$ ${produto.faturamento}`,
        `${produto.porcentagemDoTotal}%`
    ]);

    return (
        <div>

            <h2>Produtos Mais Vendidos</h2>

            <div className="relatorio-tabela-wrapper relatorio-produtos-tabela-wrapper">

                <Tabela
                    columns={columns}
                    data={data}
                />

            </div>

        </div>
    );
}

export default TabelaProdutosVendidos;
