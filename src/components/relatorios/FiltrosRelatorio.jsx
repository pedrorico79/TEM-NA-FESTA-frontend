import FiltroDropdown from "../pedidos/FiltroDropdown";

function FiltrosRelatorio(props) {
    return (
        <div className="filtros-relatorio">

            <button
                type="button"
                className={props.tipoFiltro === "evento" ? "active" : ""}
                aria-pressed={props.tipoFiltro === "evento"}
                onClick={() => props.setTipoFiltro("evento")}
            >
                <ion-icon name="pricetag-outline" />
                Por Evento
            </button>

            <button
                type="button"
                className={props.tipoFiltro === "periodo" ? "active" : ""}
                aria-pressed={props.tipoFiltro === "periodo"}
                onClick={() => props.setTipoFiltro("periodo")}
            >
                <ion-icon name="calendar-outline" />
                Por Período
            </button>

            {props.tipoFiltro === "periodo" && <>
                <span>Período:</span>

                <FiltroDropdown
                    value={props.periodo}
                    onChange={props.onPeriodoChange}
                    label="Selecionar período"
                    options={[
                        { value: "mes", label: "Últimos 30 dias" },
                        { value: "6meses", label: "Últimos 6 meses" },
                        { value: "ano", label: "Este ano" },
                        { value: "personalizado", label: "Personalizado" }
                    ]}
                />
            </>}

            {props.tipoFiltro === "evento" && (
                <>
                    <span>Evento:</span>
                    <FiltroDropdown
                        value={props.eventoSelecionado}
                        onChange={props.setEventoSelecionado}
                        label="Selecionar evento"
                        options={[
                            { value: "", label: "Selecione um evento" },
                            ...props.eventos.map((evento) => ({
                                value: String(evento.id),
                                label: evento.nome
                            }))
                        ]}
                    />
                </>
            )}

            {props.tipoFiltro === "periodo" && props.periodo === "personalizado" && (
                <>
                    <span>De:</span>

                    <input
                        type="date"
                        value={props.dataInicial}
                        aria-invalid={props.intervaloInvalido}
                        onClick={(e) => e.currentTarget.showPicker?.()}
                        onChange={(e) =>
                            props.setDataInicial(e.target.value)
                        }
                    />

                    <span>Até:</span>

                    <input
                        type="date"
                        value={props.dataFinal}
                        aria-invalid={props.intervaloInvalido}
                        onClick={(e) => e.currentTarget.showPicker?.()}
                        onChange={(e) =>
                            props.setDataFinal(e.target.value)
                        }
                    />
                </>
            )}

        </div>
    );
}

export default FiltrosRelatorio;
