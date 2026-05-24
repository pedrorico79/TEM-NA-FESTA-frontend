import MenuItem from "./MenuItem";
import "../../css/Menu.css";

import cupcakeIcon from "../../../assets/cupcake-svgrepo-com.svg";
import campanhaIcon from "../../../assets/logo-campanha.png";

function Menu(props) {

    const pedidosOpen = [
        "pedidos",
        "produtos",
        "clientes",
        "campanhas"
    ].includes(props.active)

    return (
        <aside className="menu">

            <div>

                <div className="menu-logo">
                    <h1>Tem na Festa</h1>
                    <span>Gestão de Pedidos</span>
                </div>

                <nav className="menu-menu">

                    <MenuItem icon="home-outline" text="Tela Inicial" active={props.active === "paginaInicial"}/>

                    <div className="menu-group">

                        <MenuItem icon="bag-outline" text="Pedidos" active={props.active === "pedidos"} arrow open={pedidosOpen}/>

                        {pedidosOpen && (<div className="submenu">

                                <MenuItem image={cupcakeIcon} text="Produtos" active={props.active === "produtos"} subItem/>

                                <MenuItem icon="people-outline" text="Clientes" active={props.active === "clientes"} subItem/>

                                <MenuItem image={campanhaIcon} text="Campanhas" active={props.active === "campanhas"} subItem/>

                            </div>
                        )}

                    </div>

                    <MenuItem icon="stats-chart-outline" text="Relatórios" active={props.active === "relatorios"}/>

                    <MenuItem icon="settings-outline" text="Usuários" active={props.active === "usuarios"}/>

                </nav>

            </div>

            <button className="logout-button">
                <ion-icon name="log-out-outline"></ion-icon>
                Sair
            </button>

        </aside>
    );
}

export default Menu;