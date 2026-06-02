// falta arrumar as cores
import Menu from "../shared/Menu/Menu";
import BotaoAdicionar from "../shared/botaoAdicionar/botaoAdicionar";

import HeaderPedidos from "../pedidos/HeaderPedidos";
import FiltrosPedidos from "../pedidos/FiltrosPedidos";
import ListaPedidos from "../pedidos/ListaPedidos";

import "../css/Pedidos.css";

function Pedidos() {

  function IrParaAdicionarPedido(){

  }

  const pedidos = [
  {
    id: "#25-005",
    campanha: "Natal",
    cliente: "Igor Felix",
    itens: 12,
    retirada: "05/06",
    restante: "18d restantes",
    total: "R$780,00",
    status: "NAO_INICIADO"
  },

  {
    id: "#25-004",
    campanha: "Halloween",
    cliente: "Felipe Hideki",
    itens: 20,
    retirada: "23/05",
    restante: "1d restante",
    total: "R$200,00",
    status: "PRONTO"
  },

  {
    id: "#25-003",
    campanha: "Páscoa",
    cliente: "Kauã Medeiros",
    itens: 5,
    retirada: "25/06",
    restante: "3d restantes",
    total: "R$125,00",
    status: "NAO_INICIADO"
  },

  {
    id: "#25-002",
    campanha: "Aniversario",
    cliente: "Laura Belinello Buzzato",
    itens: 12,
    retirada: "05/06",
    restante: "18d restantes",
    total: "R$780,00",
    status: "EM_PRODUCAO"
  },

  {
    id: "#25-001",
    campanha: "Casamento",
    cliente: "Pedro Rico",
    itens: 12,
    retirada: "22/05",
    restante: "Entregue",
    total: "R$220,00",
    status: "ENTREGUE"
  },

  {
    id: "#25-000",
    campanha: "Formatura",
    cliente: "Ana Souza",
    itens: 8,
    retirada: "18/05",
    restante: "Cancelado",
    total: "R$95,00",
    status: "CANCELADO"
  },
];

  return (
    <div className="pedidos-layout">

      <Menu active="pedidos" />

      <main className="pedidos-content">

        <div className="pedidos-top">

          <HeaderPedidos />

          <BotaoAdicionar text="Novo Pedido" size = "small" style={{ marginTop: "40px" }} onClick={IrParaAdicionarPedido}/>

        </div>

        <FiltrosPedidos />

        <ListaPedidos pedidos={pedidos} />

      </main>

    </div>
  );
}

export default Pedidos;