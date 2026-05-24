import BotaoAdicionar from "../shared/botaoAdicionar/botaoAdicionar";

function PaginaInicialHeader() {
  return (
    <div className="paginaInicial-top">
      <h1>Tela Inicial</h1>

      <BotaoAdicionar text="Novo Pedido" size = "small"/>
    </div>
  );
}

export default PaginaInicialHeader;