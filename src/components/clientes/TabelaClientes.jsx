import Tabela from "../shared/tabela/Tabela";
import SwitchStatus from "../shared/switchStatus/SwitchStatus";

function TabelaClientes({
    clientes,
    onEditar,
    onAlterarStatus,
    onRemover
}) {

    function formatarEndereco(endereco) {
        if (!endereco) {
            return "-";
        }

        return `${endereco.logradouro}, ${endereco.numero}${
            endereco.complemento
                ? ` - ${endereco.complemento}`
                : ""
        }`;
    }

    const data = clientes.map((cliente) => [
        cliente.nome,
        cliente.telefone,
        cliente.whatsapp,
        cliente.instagram || "-",
        formatarEndereco(cliente.endereco),

        <div className="acoes-cliente">
            <SwitchStatus
                ativo={cliente.isAtivo}
                onClick={() =>
                    onAlterarStatus(cliente)
                }
            />

            <button
                className="btn-editar"
                onClick={() => onEditar(cliente)}
            >
                <ion-icon name="pencil-outline"></ion-icon>
                {" "}Editar
            </button>

            <button
                className="btn-remover"
                onClick={() => onRemover(cliente)}
            >
                <ion-icon name="trash-outline"></ion-icon>
                {" "}Remover
            </button>
        </div>
    ]);

    return (
        <div className="clientes-tabela-wrapper">
            <Tabela
                columns={[
                    "NOME",
                    "TELEFONE",
                    "WHATSAPP",
                    "INSTAGRAM",
                    "ENDEREÇO",
                    "AÇÕES"
                ]}
                data={data}
            />
        </div>
    );
}

export default TabelaClientes;