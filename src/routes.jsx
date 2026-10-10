import { createBrowserRouter, Navigate } from "react-router-dom";

import NovoPedido from "./components/pages/NovoPedido";
import PaginaInicial from "./components/pages/PaginaInicial";
import Pedidos from "./components/pages/Pedidos";
import Produtos from "./components/pages/Produtos";
import Relatorios from "./components/pages/Relatorios";
import Clientes from "./components/pages/Clientes";
import Eventos from "./components/pages/Eventos";
import Usuarios from "./components/pages/Usuarios";
import MeuPerfil from "./components/pages/MeuPerfil";
import DetalhesPedido from "./components/pages/DetalhesPedido";

import RotaLogin from "./RotaLogin";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
    errorElement: <div>Erro</div>,
  },
  {
    path: "/login",
    element: <RotaLogin />,
  },
  {
    path: "/pagina-inicial",
    element: <PaginaInicial />,
  },
  {
    path: "/pedidos",
    element: <Pedidos />,
  },
  {
    path: "/produtos",
    element: <Produtos />,
  },
  {
    path: "/novo-pedido",
    element: <NovoPedido />,
  },
  {
    path: "/relatorios",
    element: <Relatorios />,
  },
  {
    path: "/clientes",
    element: <Clientes />,
  },
  {
    path: "/eventos",
    element: <Eventos />,
  },
  {
    path: "/usuarios",
    element: <Usuarios />,
  },
  {
    path: "/meu-perfil",
    element: <MeuPerfil />,
  },
  {
    path: "/pedidos/:id",
    element: <DetalhesPedido />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
