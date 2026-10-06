import Tabela from "../shared/tabela/Tabela";
import SwitchStatus from "../shared/switchStatus/SwitchStatus";
import { formatarTelefone } from "../../utils/telefone";

function truncarTexto(texto, limite) {
    if (!texto) {
        return "-";
    }

    if (texto.length <= limite) {
        return texto;
    }

    return `${texto.slice(0, limite)}...`;
}

function formatarContatoMobile(cliente) {
    if (cliente.telefone) return formatarTelefone(cliente.telefone);
    if (cliente.whatsapp) return formatarTelefone(cliente.whatsapp);
    if (cliente.instagram) {
        return cliente.instagram.startsWith("@") ? cliente.instagram : `@${cliente.instagram}`;
    }
    return "Sem contato";
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
        <div className="cliente-identificacao">
            <span className="cliente-nome-tabela">{truncarTexto(cliente.nome, 25)}</span>
            <span className="cliente-contatos-mobile">
                {formatarContatoMobile(cliente)}
            </span>
        </div>,

        truncarTexto(formatarTelefone(cliente.telefone), 15),

        truncarTexto(formatarTelefone(cliente.whatsapp), 15),

        truncarTexto(cliente.instagram, 20),

        truncarTexto(formatarEndereco(cliente.endereco), 40),

        <div className="acoes-cliente">
            <SwitchStatus
                ativo={cliente.ativo}
                ariaLabel={`${cliente.ativo ? "Desativar" : "Ativar"} ${cliente.nome}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onAlterarStatus(cliente);
                }}
            />

            <button
                type="button"
                className="btn-editar"
                aria-label={`Editar ${cliente.nome}`}
                title={`Editar ${cliente.nome}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onEditar(cliente);
                }}
            >
                <ion-icon name="pencil-outline"></ion-icon>
                <span>Editar</span>
            </button>

            <button
                type="button"
                className="btn-remover"
                aria-label={`Remover ${cliente.nome}`}
                title={`Remover ${cliente.nome}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onRemover(cliente);
                }}
            >
                <ion-icon name="trash-outline"></ion-icon>
                <span>Remover</span>
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
