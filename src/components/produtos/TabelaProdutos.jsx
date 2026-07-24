import Tabela from "../shared/tabela/Tabela";
import SwitchStatus from "../shared/switchStatus/SwitchStatus";

function TabelaProdutos({
    produtos,
    onEditar,
    onAlterarStatus,
    onRemover
}) {

    const data = produtos.map((produto) => [
        produto.nome,
        produto.descricao,
        `R$ ${produto.precoVenda.toFixed(2)}`,
        <div className="acoes-produto">
            <SwitchStatus
                ativo={produto.ativo}
                onClick={() =>
                    onAlterarStatus(produto)
                }
            />

            <button
                className="btn-editar"
                onClick={() => onEditar(produto)}
            >
                <ion-icon name="pencil-outline"></ion-icon> Editar
            </button>

            <button
                className="btn-remover"
                onClick={() => onRemover(produto)}
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
            />
        </div>
    );
}

export default TabelaProdutos;