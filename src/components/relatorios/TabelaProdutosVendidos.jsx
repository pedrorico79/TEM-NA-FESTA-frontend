import Tabela from "../shared/tabela/Tabela";

function TabelaProdutosVendidos() {

    const columns = [
        "#",
        "ITEM",
        "QTDE",
        "FATURAMENTO",
        "%"
    ];

    const data = [
        ["1", "Lembrancinhas", "60", "R$ 780,00", "74%"],
        ["2", "Trufas", "12", "R$ 129,96", "15%"],
        ["3", "Brigadeiros", "8", "R$ 96,00", "8%"],
        ["4", "Cupcakes", "4", "R$ 42,00", "3%"]
    ];

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