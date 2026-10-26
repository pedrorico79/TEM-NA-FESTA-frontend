import FiltroDropdown from "./FiltroDropdown";
import FiltroStatusPedidos from "./FiltroStatusPedidos";

function FiltrosPedidos({
    busca,
    setBusca,
    statusFiltros,
    setStatusFiltros,
    eventoFiltro,
    setEventoFiltro,
    limparFiltros,
    ordem,
    setOrdem,
    ordemCrescente,
    setOrdemCrescente,
    modoVisualizacao,
    setModoVisualizacao,
    eventosDisponiveis = []
}) {
    const temFiltrosAtivos = Boolean(busca.trim()) ||
        statusFiltros.length > 0 ||
        eventoFiltro !== "TODOS" ||
        ordem !== "PEDIDO" ||
        !ordemCrescente;

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

            <div className={`filtros-bottom ${temFiltrosAtivos ? "com-filtros-ativos" : ""}`}>

                <div className="filtros-left">

                    <div className="filtro-label">

                        <ion-icon name="funnel-outline"></ion-icon>

                        <span>Filtrar</span>

                    </div>

                    <FiltroStatusPedidos
                        label="Filtrar por status"
                        valores={statusFiltros}
                        onChange={setStatusFiltros}
                        opcoes={[
                            { value: "TODOS", label: "Todos os status" },
                            { value: "ATIVOS", label: "Ativos" },
                            { value: "PAGAMENTOS_PENDENTES", label: "Pagamentos pendentes" },
                            { value: "ATRASADOS", label: "Atrasados" },
                            { value: "AGUARDANDO_SINAL", label: "Aguardando sinal" },
                            { value: "CONFIRMADO", label: "Confirmado" },
                            { value: "EM_PRODUCAO", label: "Em Produção" },
                            { value: "PRONTO_PARA_ENTREGA", label: "Pronto" },
                            { value: "ENTREGUE", label: "Entregue" }
                        ]}
                    />

                    <FiltroDropdown
                        label="Filtrar por evento"
                        value={eventoFiltro}
                        onChange={setEventoFiltro}
                        options={[
                            { value: "TODOS", label: "Todos os eventos" },
                            ...eventosDisponiveis.map((evento) => ({
                                value: String(evento.id),
                                label: evento.nome
                            }))
                        ]}
                    />

                </div>

                <div className="ordenacao">

                    <div className="filtro-label">

                        <ion-icon name="swap-vertical-outline"></ion-icon>

                        <span>Ordenar</span>

                    </div>

                    <FiltroDropdown
                        label="Ordenar pedidos"
                        value={ordem}
                        onChange={setOrdem}
                        options={[
                            { value: "PEDIDO", label: "Ordem de Pedido" },
                            { value: "CLIENTE", label: "Cliente" },
                            { value: "EVENTO", label: "Evento" }
                        ]}
                    />

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

                {temFiltrosAtivos && (
                    <button
                        type="button"
                        className="limpar-filtros"
                        onClick={limparFiltros}
                    >
                        <ion-icon name="close-circle-outline"></ion-icon>
                        Limpar filtros
                    </button>
                )}

            </div>

        </div>
    );
}

export default FiltrosPedidos;
