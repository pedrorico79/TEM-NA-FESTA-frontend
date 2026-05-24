function ItemCardAlerta(props) {
  return (
    <div className="alerta-item">
      <div className="separator">
        <ion-icon name={props.icone}></ion-icon>

        <p>{props.mensagem}</p>
      </div>

      <ion-icon name="chevron-forward-outline"></ion-icon>
    </div>
  );
}

export default ItemCardAlerta;