import LoginInput from "./LoginInput";
import LembrarAcesso from "./LembrarAcesso";
import LoginButton from "./LoginButton";

function LoginForm(props) {
  return (
    <form
      className="form-section"
      onSubmit={(event) => {
        event.preventDefault();
        props.logar();
      }}
    >
      <LoginInput label="E-mail" type="email" placeholder="exemplo@email.com" valor={props.emailDigitado} setValor={props.setEmailDigitado} />

      <LoginInput label="Senha" type="password" placeholder="********" valor={props.senhaDigitada} setValor={props.setSenhaDigitada}/>
      <LembrarAcesso lembrarAcesso={props.lembrarAcesso} setLembrarAcesso={props.setLembrarAcesso}/>
      <LoginButton logar={props.logar} />
    </form>
  );
}

export default LoginForm
