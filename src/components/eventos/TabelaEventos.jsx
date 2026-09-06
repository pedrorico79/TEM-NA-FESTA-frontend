import Tabela from "../shared/tabela/Tabela";
import SwitchStatus from "../shared/switchStatus/SwitchStatus";

function TabelaEventos({
    eventos,
    onEditar,
    onAlterarStatus,
    onRemover
}) {

    const data = eventos?.map((Evento) => [
        Evento.nome,
        Evento.dataInicio,
        Evento.dataFim,
        <div className="acoes-eventos">
            <SwitchStatus
                ativo={Evento.ativo}
                onClick={() =>
                    onAlterarStatus(Evento)
                }
            />

            <button
                className="btn-editar"
                onClick={() => onEditar(Evento)}
            >
                <ion-icon name="pencil-outline"></ion-icon> Editar
            </button>

            <button
                className="btn-remover"
                onClick={() => onRemover(Evento)}
            >
                <ion-icon name="trash-outline"></ion-icon> Remover
            </button>
        </div>
    ]);

    return (
        <div className="eventos-tabela-wrapper">
            <Tabela
                columns={[
                    "NOME",
                    "DATA INICIAL",
                    "DATA FINAL",
                    "AÇÕES"
                ]}
                data={data}
            />
        </div>
    );
}

export default TabelaEventos;