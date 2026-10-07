import Tabela from "../shared/tabela/Tabela";
import SwitchStatus from "../shared/switchStatus/SwitchStatus";

function formatarData(data) {
    if (!data) return "-";
    const [ano, mes, dia] = String(data).slice(0, 10).split("-");
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : data;
}

function TabelaEventos({
    eventos,
    onEditar,
    onAlterarStatus,
    onRemover,
    onVisualizar
}) {

    const data = eventos?.map((Evento) => [
        <div className="evento-nome-datas">
            <span className="evento-nome">{Evento.nome}</span>
            <span className="evento-datas-mobile">
                {formatarData(Evento.dataInicio)} – {formatarData(Evento.dataFim)}
            </span>
        </div>,
        formatarData(Evento.dataInicio),
        formatarData(Evento.dataFim),
        <div className="acoes-eventos">
            <SwitchStatus
                ativo={Evento.ativo}
                ariaLabel={`${Evento.ativo ? "Desativar" : "Ativar"} ${Evento.nome}`}
                onClick={(event) => {
                    event.stopPropagation();
                    onAlterarStatus(Evento)
                }}
            />

            <button
                type="button"
                className="btn-editar"
                aria-label={`Editar ${Evento.nome}`}
                title={`Editar ${Evento.nome}`}
                onClick={(event) => {
                    event.stopPropagation();
                    onEditar(Evento);
                }}
            >
                <ion-icon name="pencil-outline"></ion-icon> Editar
            </button>

            <button
                type="button"
                className="btn-remover"
                aria-label={`Remover ${Evento.nome}`}
                title={`Remover ${Evento.nome}`}
                onClick={(event) => {
                    event.stopPropagation();
                    onRemover(Evento);
                }}
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
                onRowClick={(_, index) => onVisualizar(eventos[index])}
            />
        </div>
    );
}

export default TabelaEventos;
