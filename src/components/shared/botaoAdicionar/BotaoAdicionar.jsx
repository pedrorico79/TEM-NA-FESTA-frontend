import "../../css/BotaoAdicionar.css";

function BotaoAdicionar(props) {
  return (
    <button className={`botao-adicionar ${props.size}`} onClick={props.onClick}>
      <ion-icon name="add-circle-outline"></ion-icon>
      {props.text}
    </button>
  );
}

export default BotaoAdicionar