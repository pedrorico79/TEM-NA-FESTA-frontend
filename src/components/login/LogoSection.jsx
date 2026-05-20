import logo from "../../assets/Logo_Tem_Na_Festa.png";
import simbolos from "../../assets/Simbolos.png";

function LogoSection() {
  return (
    <div className="logo-section">
      <div className="logo-circulo">
        <img src={logo} alt="Logo Tem na Festa" />
      </div>

      <div className="icones-fundo">
        <img src={simbolos} alt="Símbolos decorativos" />
      </div>
    </div>
  );
}

export default LogoSection