import LogoSection from "../login/LogoSection";
import LoginForm from "../login/LoginForm";
import "../css/login.css";
import React, { useState } from 'react';

function Login() {

  const [emailDigitado, setEmailDigitado] = useState('')
  const [senhaDigitada, setSenhaDigitada] = useState('')

  function logar(){
    console.log(emailDigitado);
    console.log(senhaDigitada);
    
  }

  return (
    <div className="login-pagina">
      <div className="login-card">
        <LogoSection />
        <LoginForm logar={logar} emailDigitado={emailDigitado} setEmailDigitado={setEmailDigitado} senhaDigitada={senhaDigitada} setSenhaDigitada={setSenhaDigitada}/>
      </div>
    </div>
  );
}

export default Login