import { useState } from "react";
import MenuItem from "./MenuItem";
import "../../css/Menu.css";
import { useNavigate } from "react-router-dom";

import cupcakeIcon from "../../../assets/cupcake-svgrepo-com.svg";
import campanhaIcon from "../../../assets/logo-campanha.png";

function Menu(props) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const pedidosOpen = [
    "pedidos",
    "produtos",
    "clientes",
    "eventos"
  ].includes(props.active);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <div className="mobile-header">
        <div className="mobile-logo">
          <h1>Tem na Festa</h1>
        </div>
        <button className="hamburger-btn" onClick={toggleMenu} aria-label="Menu">
          <ion-icon name={isOpen ? "close-outline" : "menu-outline"}></ion-icon>
        </button>
      </div>

      {isOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}

      <aside className={`menu ${isOpen ? "open" : ""}`}>
        <div>
          <div className="menu-logo">
            <h1>Tem na Festa</h1>
            <span>Gestão de Pedidos</span>
          </div>

          <nav className="menu-menu">
            <MenuItem 
              icon="home-outline" 
              text="Tela Inicial" 
              active={props.active === "paginaInicial"} 
              onClick={() => handleNavigate("/PaginaInicial")}
            />

            <div className="menu-group">
              <MenuItem 
                icon="bag-outline" 
                text="Pedidos" 
                active={props.active === "pedidos"} 
                arrow 
                open={pedidosOpen} 
                onClick={() => handleNavigate("/Pedidos")}
              />

              {pedidosOpen && (
                <div className="submenu">
                  <MenuItem 
                    image={cupcakeIcon} 
                    text="Produtos" 
                    active={props.active === "produtos"} 
                    subItem 
                    onClick={() => handleNavigate("/Produtos")}
                  />
                  <MenuItem 
                    icon="people-outline" 
                    text="Clientes" 
                    active={props.active === "clientes"} 
                    subItem 
                    onClick={() => handleNavigate("/Clientes")}
                  />
                  <MenuItem 
                    image={campanhaIcon} 
                    text="Eventos" 
                    active={props.active === "eventos"} 
                    subItem 
                    onClick={() => handleNavigate("/Eventos")}
                  />
                </div>
              )}
            </div>

            <MenuItem 
              icon="stats-chart-outline" 
              text="Relatórios" 
              active={props.active === "relatorios"} 
              onClick={() => handleNavigate("/Relatorios")}
            />

            <MenuItem 
              icon="settings-outline" 
              text="Usuários" 
              active={props.active === "usuarios"} 
              onClick={() => handleNavigate("/Usuarios")}
            />
          </nav>
        </div>

        <button className="logout-button">
          <ion-icon name="log-out-outline"></ion-icon>
          Sair
        </button>
      </aside>
    </>
  );
}

export default Menu;