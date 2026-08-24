import BotaoAdicionar from "../shared/botaoAdicionar/botaoAdicionar";
import { useNavigate } from "react-router-dom";

function PaginaInicialHeader() {

  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="paginaInicial-top">
      <h1>Tela Inicial</h1>

      <BotaoAdicionar text="Novo Pedido" size = "small" onClick={() => handleNavigate("/NovoPedido")}/>
    </div>
  );
}

export default PaginaInicialHeader;