import { useEffect, useState } from "react";

import MenuItem from "./MenuItem";

import "../../css/Menu.css";

import { useNavigate } from "react-router-dom";

import { api } from "../../../services/api";
import { buscarUsuarioAtual, limparUsuarioAtualEmCache, obterUsuarioAtualEmCache } from "../../../services/usuarioAtual";

import cupcakeIcon from "../../../assets/cupcake-svgrepo-com.svg";
import campanhaIcon from "../../../assets/logo-campanha.png";

function Menu(props) {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(
    String(obterUsuarioAtualEmCache()?.perfil || "").toUpperCase() === "ADMIN"
  );

  useEffect(() => {
    let ativo = true;

    buscarUsuarioAtual()
      .then((usuario) => {
        if (ativo) setIsAdmin(String(usuario?.perfil || "").toUpperCase() === "ADMIN");
      })
      .catch(() => {
        if (ativo) setIsAdmin(false);
      });

    return () => { ativo = false; };
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await api.post("usuarios/logout");
      limparUsuarioAtualEmCache();
      navigate("/");
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
    }
  };

  return (
    <>
      <div className="mobile-header">
        <button
          className="hamburger-btn"
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <ion-icon
            name={isOpen ? "close-outline" : "menu-outline"}
          ></ion-icon>
        </button>

        <div className="mobile-logo">
          <h1>Tem na Festa</h1>
        </div>


      </div>

      {isOpen && (
        <div className="menu-overlay" onClick={toggleMenu}></div>
      )}

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

            <MenuItem
              icon="bag-outline"
              text="Pedidos"
              active={props.active === "pedidos"}
              onClick={() => handleNavigate("/Pedidos")}
            />


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


            <MenuItem
              icon="stats-chart-outline"
              text="Relatórios"
              active={props.active === "relatorios"}
              onClick={() => handleNavigate("/Relatorios")}
            />

            {isAdmin && (
              <MenuItem
                icon="id-card-outline"
                text="Usuários"
                active={props.active === "usuarios"}
                onClick={() => handleNavigate("/Usuarios")}
              />
            )}
          </nav>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          <ion-icon name="log-out-outline"></ion-icon>
          Sair
        </button>
      </aside>
    </>
  );
}

export default Menu;
