function FiltrosPedidos({
    busca,
    setBusca,
    statusFiltro,
    setStatusFiltro,
    eventoFiltro,
    setEventoFiltro,
    ordem,
    setOrdem,
    ordemCrescente,
    setOrdemCrescente,
    modoVisualizacao,
    setModoVisualizacao,
    pedidos
}) {

    const eventos = [
        ...new Set(
            pedidos
                .map((pedido) => pedido.campanha)
                .filter((evento) => evento)
        )
    ];

    return (
        <div className="filtros-card">

            <div className="filtros-top">

                <div className="search-container">

                    <ion-icon name="search-outline"></ion-icon>

                    <input
                        type="text"
                        placeholder="Buscar por cliente ou número..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />

                </div>

                <div className="view-buttons">

                    {/* VISUALIZAÇÃO EM GRADE */}
                    <button
                        type="button"
                        className={
                            modoVisualizacao === "grid"
                                ? "active"
                                : ""
                        }
                        onClick={() => setModoVisualizacao("grid")}
                        title="Visualização em grade"
                    >
                        <ion-icon name="grid-outline"></ion-icon>
                    </button>

                    {/* VISUALIZAÇÃO EM LISTA */}
                    <button
                        type="button"
                        className={
                            modoVisualizacao === "list"
                                ? "active"
                                : ""
                        }
                        onClick={() => setModoVisualizacao("list")}
                        title="Visualização em lista"
                    >
                        <ion-icon name="list-outline"></ion-icon>
                    </button>

                </div>

            </div>

            <div className="filtros-bottom">

                <div className="filtros-left">

                    <div className="filtro-label">

                        <ion-icon name="funnel-outline"></ion-icon>

                        <span>Filtrar</span>

                    </div>

                    <select
                        value={statusFiltro}
                        onChange={(e) =>
                            setStatusFiltro(e.target.value)
                        }
                    >

                        <option value="TODOS">
                            Todos os status
                        </option>

                        <option value="NAO_INICIADO">
                            Não iniciado
                        </option>

                        <option value="EM_PRODUCAO">
                            Em Produção
                        </option>

                        <option value="PRONTO">
                            Pronto
                        </option>

                        <option value="ENTREGUE">
                            Entregue
                        </option>

                        <option value="CANCELADO">
                            Cancelado
                        </option>

                    </select>

                    <select
                        value={eventoFiltro}
                        onChange={(e) =>
                            setEventoFiltro(e.target.value)
                        }
                    >

                        <option value="TODOS">
                            Todos os eventos
                        </option>

                        {eventos.map((evento) => (

                            <option
                                key={evento}
                                value={evento}
                            >
                                {evento}
                            </option>

                        ))}

                    </select>

                </div>

                <div className="ordenacao">

                    <div className="filtro-label">

                        <ion-icon name="swap-vertical-outline"></ion-icon>

                        <span>Ordenar</span>

                    </div>

                    <select
                        value={ordem}
                        onChange={(e) =>
                            setOrdem(e.target.value)
                        }
                    >

                        <option value="PEDIDO">
                            Ordem de Pedido
                        </option>

                        <option value="CLIENTE">
                            Cliente
                        </option>

                        <option value="EVENTO">
                            Evento
                        </option>

                    </select>

                    <div className="sort-buttons">

                        {/* ORDEM CRESCENTE */}
                        <button
                            type="button"
                            className={
                                ordemCrescente
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setOrdemCrescente(true)
                            }
                            title="Ordem crescente"
                        >
                            <ion-icon name="caret-up-outline"></ion-icon>
                        </button>

                        {/* ORDEM DECRESCENTE */}
                        <button
                            type="button"
                            className={
                                !ordemCrescente
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setOrdemCrescente(false)
                            }
                            title="Ordem decrescente"
                        >
                            <ion-icon name="caret-down-outline"></ion-icon>
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default FiltrosPedidos;