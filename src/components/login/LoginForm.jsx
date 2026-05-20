import LoginInput from "./LoginInput";
import LembrarAcesso from "./LembrarAcesso";
import LoginButton from "./LoginButton";

function LoginForm(props) {
  return (
    <div className="form-section">
      <LoginInput label="E-mail" type="email" placeholder="exemplo@email.com" setEmailDigitado={props.setEmailDigitado} emailDigitado={props.emailDigitado}/>
      <LoginInput label="Senha" type="password" placeholder="********" setSenhaDigitada={props.setSenhaDigitada} senhaDigitada={props.senhaDigitada}/>
      <a href="/" className="esqueceu-senha">Esqueci minha senha</a>
      <LembrarAcesso/>
      <LoginButton logar={props.logar}/>
    </div>
  );
}

export default LoginForm