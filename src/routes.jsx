import { createBrowserRouter, Navigate } from "react-router-dom";

import Login from "./components/pages/Login";
import NovoPedido from "./components/pages/NovoPedido";
import PaginaInicial from "./components/pages/PaginaInicial";
import Pedidos from "./components/pages/Pedidos";
import Produtos from "./components/pages/Produtos";
import Relatorios from "./components/pages/Relatorios";
import Clientes from "./components/pages/Clientes";
import Eventos from "./components/pages/Eventos";
import Usuarios from "./components/pages/Usuarios";
import DetalhesPedido from "./components/pages/DetalhesPedido";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <div>Erro</div>,
  },
  {
    path: "/PaginaInicial",
    element: <PaginaInicial />,
  },
  {
    path: "/Pedidos",
    element: <Pedidos />,
  },
  {
    path: "/Produtos",
    element: <Produtos />,
  },
  {
    path: "/NovoPedido",
    element: <NovoPedido />,
  },
  {
    path: "/Relatorios",
    element: <Relatorios />,
  },
  {
    path: "/Clientes",
    element: <Clientes />,
  },
  {
    path: "/Eventos",
    element: <Eventos />,
  },
  {
    path: "/Usuarios",
    element: <Usuarios />,
  },
  {
    path: "/DetalhesPedido/:id",
    element: <DetalhesPedido />,
  },
  {
  path: "/login",
  element: <Navigate to="/" replace />,
},
]);