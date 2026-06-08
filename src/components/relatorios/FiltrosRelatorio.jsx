import { useState } from "react";

function FiltrosRelatorio(props) {

    const [periodo, setPeriodo] = useState("mes");

    const [tipoFiltro, setTipoFiltro] = useState("periodo");

    return (
        <div className="filtros-relatorio">

            <button
                className={tipoFiltro === "evento" ? "active" : ""}
                onClick={() => setTipoFiltro("evento")}
            >
                <ion-icon name="pricetag-outline" />
                Por Evento
            </button>

            <button
                className={tipoFiltro === "periodo" ? "active" : ""}
                onClick={() => setTipoFiltro("periodo")}
            >
                <ion-icon name="calendar-outline" />
                Por Período
            </button>

            <span>Período:</span>

            <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
            >
                <option value="mes">Últimos 30 dias</option>
                <option value="6meses">Últimos 6 meses</option>
                <option value="ano">Este ano</option>
                <option value="personalizado">Personalizado</option>
            </select>

            {periodo === "personalizado" && (
                <>
                    <span>De:</span>

                    <input
                        type="date"
                        value={props.dataInicial}
                        onChange={(e) =>
                            props.setDataInicial(e.target.value)
                        }
                    />

                    <span>Até:</span>

                    <input
                        type="date"
                        value={props.dataFinal}
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