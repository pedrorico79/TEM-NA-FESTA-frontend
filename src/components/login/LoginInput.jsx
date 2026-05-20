import { useState } from "react";

function LoginInput(props) {
  const [mostrarSenha, setMostrarSenha] =
    useState(false);

  function exibirSenha(){
    setMostrarSenha(!mostrarSenha)
  }

  function setSenha(e){
    props.setSenhaDigitada(e.target.value)
  }

  function setEmail(e){
    props.setEmailDigitado(e.target.value)
  }

  const ehSenha = props.type === "password";

  return (
    <div className="input-container">
      <fieldset>
        <legend>{props.label}</legend>
        <div className="input-wrapper">
          <input type={ehSenha && mostrarSenha ? "text" : props.type} placeholder={props.placeholder} onChange={ehSenha ? setSenha : setEmail}/>
          {ehSenha && (
            <button type="button" className="mostrar-senha" onClick={exibirSenha}>
              <ion-icon name={ mostrarSenha ? "eye-outline" : "eye-off-outline" }></ion-icon>
            </button>
          )}
        </div>
      </fieldset>
    </div>
  );
}

export default LoginInput