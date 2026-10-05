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

    const data = produtos.map((produto) => {
        const valorFormatado = Number(produto.precoVenda || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });

        return [
            <div className="produto-nome-valor">
                <span className="produto-nome-tabela">{truncarTexto(produto.nome, 25)}</span>
                <span className="produto-valor-mobile">{valorFormatado}</span>
            </div>,
            truncarTexto(produto.descricao, 50),
            valorFormatado,
            <div className="acoes-produto">
                <SwitchStatus
                    ativo={produto.ativo}
                    ariaLabel={`${produto.ativo ? "Desativar" : "Ativar"} ${produto.nome}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onAlterarStatus(produto);
                    }}
                />

                <button
                    type="button"
                    className="btn-editar"
                    aria-label={`Editar ${produto.nome}`}
                    title={`Editar ${produto.nome}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onEditar(produto);
                    }}
                >
                    <ion-icon name="pencil-outline"></ion-icon>
                    <span>Editar</span>
                </button>

                <button
                    type="button"
                    className="btn-remover"
                    aria-label={`Remover ${produto.nome}`}
                    title={`Remover ${produto.nome}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemover(produto);
                    }}
                >
                    <ion-icon name="trash-outline"></ion-icon>
                    <span>Remover</span>
                </button>
            </div>
        ];
    });

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
