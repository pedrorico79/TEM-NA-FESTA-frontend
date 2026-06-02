import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Login from "./components/pages/Login";
import NovoPedido from "./components/pages/NovoPedido";
import PaginaInicial from "./components/pages/PaginaInicial";
import Pedidos from "./components/pages/Pedidos";
import Produtos from "./components/pages/Produtos";
import Relatorios from "./components/pages/Relatorios";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/PaginaInicial"
          element={<PaginaInicial />}
        />


        <Route
          path="/Pedidos"
          element={<Pedidos />}
        />

        <Route
          path="/Produtos"
          element={<Produtos />}
        />

        <Route
          path="/NovoPedido"
          element={<NovoPedido />}
        />
        
        <Route
          path="/Relatorios"
          element={<Relatorios />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;