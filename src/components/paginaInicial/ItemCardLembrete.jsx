function ItemCardLembrete(props) {

  return (
    <div
      className="lembrete-item"
      onClick={props.onVisualizar}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          props.onVisualizar();
        }
      }}
      role="group"
      tabIndex={0}
      aria-label={`Lembrete: ${props.texto}. Pressione Enter ou espaço para ver o resumo.`}
    >

      <div>
        <p className="lembrete-texto">{props.texto}</p>

        <span>{props.data}</span>
      </div>

      <div className="lembrete-actions">

        <ion-icon
          name="create-outline"
          onClick={(event) => {
            event.stopPropagation();
            props.onEditar();
          }}
          role="button"
          aria-label="Editar lembrete"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.stopPropagation();
              event.preventDefault();
              props.onEditar();
            }
          }}
        />

        <ion-icon
          name="trash-outline"
          className="delete-icon"
          onClick={(event) => {
            event.stopPropagation();
            props.onExcluir();
          }}
          role="button"
          aria-label="Excluir lembrete"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.stopPropagation();
              event.preventDefault();
              props.onExcluir();
            }
          }}
        />

      </div>

    </div>
  );
}

export default ItemCardLembrete;
