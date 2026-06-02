import CardPedido from "./CardPedido";

function ListaPedidos(props) {

  return (
    <div className="lista-pedidos">

      {props.pedidos.map((pedido) => (

        <CardPedido
          key={pedido.id}
          pedido={pedido}
        />

      ))}

    </div>
  );
}

export default ListaPedidos;