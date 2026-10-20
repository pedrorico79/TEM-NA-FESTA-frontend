function HeaderNovoPedido({ onBack }) {
  return (
    <div className="novo-pedido-cabecalho">
      <h1 className="titulo-pagina">
        Novo Pedido
      </h1>
      <button type="button" className="btn-voltar" onClick={onBack}>
        <ion-icon name="arrow-back-outline"></ion-icon>
        <span className="btn-voltar-texto-desktop">Voltar Para Todos Pedidos</span>
        <span className="btn-voltar-texto-mobile">Voltar</span>
      </button>
    </div>
  );
}

export default HeaderNovoPedido;
