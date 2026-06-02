import Tabela from "../shared/tabela/Tabela";

function ItensPedidoCard(props) {

  const data = props.itens.map((item, index) => [

    item.produto.nome,

    item.quantidade,

    `R$${item.produto.preco}`,

    item.descricao,

    `R$${item.produto.preco * item.quantidade}`,

    <button
      className="remover-item"

      onClick={() =>
        props.removerItem(index)
      }
    >
      <ion-icon name="close-outline"></ion-icon>
    </button>
  ]);

  return (
    <div className="card-padrao">

      <div className="card-title">

        <ion-icon name="cube-outline"></ion-icon>

        <h2>Itens do Pedido</h2>

      </div>

      <Tabela
        columns={[
          "PRODUTO",
          "QTD",
          "PREÇO",
          "DESCRIÇÃO",
          "SUBTOTAL",
          ""
        ]}

        data={data}
      />

      <button
        className="adicionar-item"

        onClick={props.adicionarItem}
      >

        <ion-icon name="add-circle-outline"></ion-icon>

        Adicionar Item

      </button>

    </div>
  );
}

export default ItensPedidoCard;