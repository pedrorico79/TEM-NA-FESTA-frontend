function ItemCardLembrete(props) {
  return (
    <div className="lembrete-item">
      <div>
        <p>{props.texto}</p>

        <span>{props.data}</span>
      </div>

      <ion-icon name="create-outline"></ion-icon>
    </div>
  );
}

export default ItemCardLembrete;