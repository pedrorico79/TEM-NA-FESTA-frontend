import { useState } from "react";

function LoginInput(props) {

  const [mostrarSenha, setMostrarSenha] = useState(false);

  function exibirSenha() {
    setMostrarSenha(!mostrarSenha);
  }

  const ehSenha = props.type === "password";
  
  function alterarValor(e) {
    props.setValor(e.target.value);
  }

  return (
    <div className="input-container">
      <fieldset>
        <legend>{props.label}</legend>
        <div className="input-wrapper">

          <input type={ehSenha && mostrarSenha ? "text" : props.type} placeholder={props.placeholder} value={props.valor} onChange={alterarValor}/>

          {ehSenha && (
            <button type="button" className="mostrar-senha" onClick={exibirSenha}>
              <ion-icon
                name={mostrarSenha ? "eye-outline" : "eye-off-outline"}></ion-icon>
            </button>
          )}
        </div>
      </fieldset>
    </div>
  );
}

export default LoginInput;