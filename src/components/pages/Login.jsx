import LogoSection from "../login/LogoSection";
import LoginForm from "../login/LoginForm";
import "../css/login.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

function Login() {

  const [emailDigitado, setEmailDigitado] = useState('')
  const [senhaDigitada, setSenhaDigitada] = useState('')

  const navigate = useNavigate();

  function logar() {

    api.post("/usuarios/login", {
      email: emailDigitado,
      senha: senhaDigitada
    }).then((res) => {
      const resposta = res.data;

      console.log("Usuário logado:", resposta);

      localStorage.setItem("token", resposta.token);

      navigate("/PaginaInicial");
    }).catch((erro) => {
      console.log(erro.response?.data);
      console.log(erro.response?.status);

      alert("Email ou senha inválidos");
    })

  }


  return (
    <div className="login-pagina">
      <div className="login-card">
        <LogoSection />
        <LoginForm logar={logar} emailDigitado={emailDigitado} setEmailDigitado={setEmailDigitado} senhaDigitada={senhaDigitada} setSenhaDigitada={setSenhaDigitada} />
      </div>
    </div>
  );
}

export default Login