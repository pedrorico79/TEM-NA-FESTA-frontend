function DetalhesPedidoCard(props) {

  return (
    <div className="card-padrao">

      <div className="card-title">

        <ion-icon name="briefcase-outline"></ion-icon>

        <h2>Detalhes do Pedido</h2>

      </div>

      <div className="detalhes-grid">

        <div className="input-group">

          <label>Evento</label>

          <select
            value={props.pedido.campanha}

            onChange={(e) =>
              props.setPedido({
                ...props.pedido,
                campanha: e.target.value,
              })
            }
          >

            {props.campanhas.map((campanha) => (
              <option
                key={campanha}
                value={campanha}
              >
                {campanha}
              </option>
            ))}

          </select>

        </div>

        <div className="input-group">

          <label>Status</label>

          <select
            value={props.pedido.status}

            onChange={(e) =>
              props.setPedido({
                ...props.pedido,
                status: e.target.value,
              })
            }
          >

            <option value="NAO_INICIADO">
              Não iniciado
            </option>

            <option value="EM_PRODUCAO">
              Em produção
            </option>

            <option value="PRONTO">
              Pronto
            </option>

            <option value="ENTREGUE">
              Entregue
            </option>

            <option value="CANCELADO">
              Cancelado
            </option>

          </select>

        </div>

        <div className="input-group">

          <label>Data de entrega</label>

          <input
            type="date"
            value={props.pedido.dataEntrega || ""}

            onChange={(e) =>
              props.setPedido({
                ...props.pedido,
                dataEntrega: e.target.value,
              })
            }
          />

        </div>

      </div>

    </div>
  );
}

export default DetalhesPedidoCard;