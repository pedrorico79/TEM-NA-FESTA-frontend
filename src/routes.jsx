import { createBrowserRouter } from "react-router-dom";

import Login from "./components/pages/Login";
import NovoPedido from "./components/pages/NovoPedido";
import PaginaInicial from "./components/pages/PaginaInicial";
import Pedidos from "./components/pages/Pedidos";
import Produtos from "./components/pages/Produtos";
import Relatorios from "./components/pages/Relatorios";
import Clientes from "./components/pages/Clientes";

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
]);