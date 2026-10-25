import BotaoAdicionar from "../shared/botaoAdicionar/BotaoAdicionar";
import { useNavigate } from "react-router-dom";

function PaginaInicialHeader() {

  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="paginaInicial-top">
      <h1>Visão Geral</h1>

      <BotaoAdicionar text="Novo Pedido" size = "small" onClick={() => handleNavigate("/novo-pedido")}/>
    </div>
  );
}

export default PaginaInicialHeader;
