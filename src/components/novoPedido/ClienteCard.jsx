import CampoCliente from "./CampoCliente";

function ClienteCard(props) {

  return (
    <div className="card-padrao">

      <div className="card-title">

        <ion-icon name="people-outline"></ion-icon>

        <h2>Cliente</h2>

      </div>

      <CampoCliente
  clientes={props.clientes}

  setClientes={props.setClientes}
      onCriarClienteErro={props.onCriarClienteErro}
      onCriarClienteSucesso={props.onCriarClienteSucesso}

  clienteSelecionado={
    props.pedido.cliente
  }

  setClienteSelecionado={(cliente) =>
    props.setPedido({
      ...props.pedido,
      cliente,
    })
  }
/>

      

    </div>
  );
}

export default ClienteCard;
