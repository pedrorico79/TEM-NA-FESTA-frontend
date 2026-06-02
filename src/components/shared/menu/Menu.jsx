import MenuItem from "./MenuItem";
import "../../css/Menu.css";
import { useNavigate } from "react-router-dom";

import cupcakeIcon from "../../../assets/cupcake-svgrepo-com.svg";
import campanhaIcon from "../../../assets/logo-campanha.png";

function Menu(props) {

    const navigate = useNavigate();

    const pedidosOpen = [
        "pedidos",
        "produtos",
        "clientes",
        "eventos"
    ].includes(props.active)

    return (
        <aside className="menu">

            <div>

                <div className="menu-logo">
                    <h1>Tem na Festa</h1>
                    <span>Gestão de Pedidos</span>
                </div>

                <nav className="menu-menu">

                    <MenuItem icon="home-outline" text="Tela Inicial" active={props.active === "paginaInicial"} onClick={() => navigate("/PaginaInicial")}/>

                    <div className="menu-group">

                        <MenuItem icon="bag-outline" text="Pedidos" active={props.active === "pedidos"} arrow open={pedidosOpen} onClick={() => navigate("/Pedidos")}/>

                        {pedidosOpen && (<div className="submenu">

                                <MenuItem image={cupcakeIcon} text="Produtos" active={props.active === "produtos"} subItem onClick={() => navigate("/Produtos")}/>

                                <MenuItem icon="people-outline" text="Clientes" active={props.active === "clientes"} subItem onClick={() => navigate("/Clientes")}/>

                                <MenuItem image={campanhaIcon} text="Eventos" active={props.active === "eventos"} subItem onClick={() => navigate("/Eventos")}/>

                            </div>
                        )}

                    </div>

                    <MenuItem icon="stats-chart-outline" text="Relatórios" active={props.active === "relatorios"} onClick={() => navigate("/Relatorios")}/>

                    <MenuItem icon="settings-outline" text="Usuários" active={props.active === "usuarios"} onClick={() => navigate("/Usuarios")}/>

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