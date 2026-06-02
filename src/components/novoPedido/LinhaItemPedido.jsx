function LinhaItemPedido(props) {

  const item = props.item;

  return (
    <tr>

      <td>{item.produto}</td>

      <td>{item.quantidade}</td>

      <td>{item.preco}</td>

      <td>{item.descricao}</td>

      <td>{item.subtotal}</td>

      <td>

        <button className="remover-item">

          <ion-icon name="close-circle-outline"></ion-icon>

        </button>

      </td>

    </tr>
  );
}

export default LinhaItemPedido;