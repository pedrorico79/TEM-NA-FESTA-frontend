function ItemCardLembrete(props) {

  return (

    <div className="lembrete-item">

      <div>

        <p>{props.texto}</p>

        <span>{props.data}</span>

      </div>

      <div className="lembrete-actions">

        <ion-icon
          name="create-outline"
          onClick={props.onEditar}
        />

        <ion-icon
          name="trash-outline"
          className="delete-icon"
          onClick={props.onExcluir}
        />

      </div>

    </div>

  );

}

export default ItemCardLembrete;