import LogoSection from "../login/LogoSection";
import LoginForm from "../login/LoginForm";
import "../css/login.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

function Login({ destinoAposLogin }) {

  const [emailDigitado, setEmailDigitado] = useState("");
  const [senhaDigitada, setSenhaDigitada] = useState("");
  const [lembrarAcesso, setLembrarAcesso] = useState(false);
  const [erroLogin, setErroLogin] = useState("");
  const timeoutErroRef = useRef(null);

  const navigate = useNavigate();

  function limparErroLogin() {
    window.clearTimeout(timeoutErroRef.current);
    setErroLogin("");
  }

  function exibirErroLogin(mensagem) {
    window.clearTimeout(timeoutErroRef.current);
    setErroLogin(mensagem);
    timeoutErroRef.current = window.setTimeout(() => setErroLogin(""), 5000);
  }

  useEffect(() => () => window.clearTimeout(timeoutErroRef.current), []);

  function logar() {
    limparErroLogin();

    api.post("/usuarios/login", {
      email: emailDigitado,
      senha: senhaDigitada,
      jwtValidityRememberMe: lembrarAcesso
    })
      .then(() => {

        console.log("Usuário logado!");


        navigate(destinoAposLogin || "/visao-geral", { replace: true });

      })
      .catch((erro) => {

        console.log(erro.response?.data);
        console.log(erro.response?.status);

        if (erro.response?.status === 429) {
          const segundos = Number(erro.response.headers?.["retry-after"]);
          exibirErroLogin(segundos
            ? `Muitas tentativas. Aguarde ${Math.ceil(segundos / 60)} minuto(s) antes de tentar novamente.`
            : "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.");
          return;
        }

        if (erro.response?.status === 401) {
          exibirErroLogin("E-mail ou senha inválidos.");
          return;
        }

        exibirErroLogin("Não foi possível entrar. Tente novamente em instantes.");
      });
  }

  return (
    <div className="login-pagina">
      <div className="login-card">
        <LogoSection />

        <LoginForm
          logar={logar}
          emailDigitado={emailDigitado}
          setEmailDigitado={setEmailDigitado}
          senhaDigitada={senhaDigitada}
          setSenhaDigitada={setSenhaDigitada}
          lembrarAcesso={lembrarAcesso}
          setLembrarAcesso={setLembrarAcesso}
          erro={erroLogin}
          limparErro={limparErroLogin}
        />

      </div>
    </div>
  );
}

export default Login;
