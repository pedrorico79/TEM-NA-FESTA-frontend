import Tabela from "../shared/tabela/Tabela";
import SwitchStatus from "../shared/switchStatus/SwitchStatus";

function truncarTexto(texto, limite) {
    if (!texto) {
        return "-";
    }

    if (texto.length <= limite) {
        return texto;
    }

    return `${texto.slice(0, limite)}...`;
}

function TabelaProdutos({
    produtos,
    onEditar,
    onAlterarStatus,
    onRemover,
    onVisualizar
}) {

    const data = produtos.map((produto) => [
        truncarTexto(produto.nome, 25),
        truncarTexto(produto.descricao, 50),
        `R$ ${produto.precoVenda.toFixed(2)}`,
        <div className="acoes-produto">
            <SwitchStatus
                ativo={produto.ativo}
                onClick={(e) => {
                    e.stopPropagation();
                    onAlterarStatus(produto);
                }}
            />

            <button
                className="btn-editar"
                onClick={(e) => {
                    e.stopPropagation();
                    onEditar(produto);
                }}
            >
                <ion-icon name="pencil-outline"></ion-icon> Editar
            </button>

            <button
                className="btn-remover"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemover(produto);
                }}
            >
                <ion-icon name="trash-outline"></ion-icon> Remover
            </button>
        </div>
    ]);

    return (
        <div className="produtos-tabela-wrapper">
            <Tabela
                columns={[
                    "NOME",
                    "DESCRIÇÃO",
                    "VALOR",
                    "AÇÕES"
                ]}
                data={data}
                onRowClick={(row, index) =>
                    onVisualizar(produtos[index])
                }
            />
        </div>
    );
}

export default TabelaProdutos;