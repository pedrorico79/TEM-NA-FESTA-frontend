function FiltrosPedidos() {

    return (
        <div className="filtros-card">

            <div className="filtros-top">

                <div className="search-container">

                    <ion-icon name="search-outline"></ion-icon>

                    <input
                        type="text"
                        placeholder="Buscar por cliente ou número..."
                    />

                </div>

                <div className="view-buttons">

                    <button className="active">
                        <ion-icon name="grid-outline"></ion-icon>
                    </button>

                    <button>
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

                    <select>
                        <option>Todos os status</option>
                    </select>

                    <select>
                        <option>Todos os eventos</option>
                    </select>

                </div>

                <div className="ordenacao">

                    <div className="filtro-label">
                        <ion-icon name="swap-vertical-outline"></ion-icon>
                        <span>Ordenar</span>
                    </div>

                    <select>
                        <option>Ordem de Pedido</option>
                    </select>

                    <div className="sort-buttons">

                        <button className="active">
                            <ion-icon name="caret-down-outline"></ion-icon>
                        </button>

                        <button>
                            <ion-icon name="caret-up-outline"></ion-icon>
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default FiltrosPedidos;