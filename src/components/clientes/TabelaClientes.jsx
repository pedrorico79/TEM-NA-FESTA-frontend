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

function TabelaClientes({
    clientes,
    onEditar,
    onAlterarStatus,
    onRemover,
    onVisualizar
}) {

    function formatarEndereco(endereco) {
        if (!endereco) {
            return "-";
        }

        const logradouro = endereco.logradouro || "";
        const numero = endereco.numero || "S/N";
        const complemento = endereco.complemento
            ? ` - ${endereco.complemento}`
            : "";

        return `${logradouro}, ${numero}${complemento}`;
    }

    const data = clientes.map((cliente) => [
        truncarTexto(cliente.nome, 25),

        truncarTexto(cliente.telefone, 15),

        truncarTexto(cliente.whatsapp, 15),

        truncarTexto(cliente.instagram, 20),

        truncarTexto(formatarEndereco(cliente.endereco), 40),

        <div className="acoes-cliente">
            <SwitchStatus
                ativo={cliente.ativo}
                onClick={(e) => {
                    e.stopPropagation();
                    onAlterarStatus(cliente);
                }}
            />

            <button
                className="btn-editar"
                onClick={(e) => {
                    e.stopPropagation();
                    onEditar(cliente);
                }}
            >
                <ion-icon name="pencil-outline"></ion-icon>
                {" "}Editar
            </button>

            <button
                className="btn-remover"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemover(cliente);
                }}
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
                onRowClick={(row, index) =>
                    onVisualizar(clientes[index])
                }
            />
        </div>
    );
}

export default TabelaClientes;