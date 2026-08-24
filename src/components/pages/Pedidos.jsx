import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Menu from "../shared/Menu/Menu";
import BotaoAdicionar from "../shared/botaoAdicionar/botaoAdicionar";

import HeaderPedidos from "../pedidos/HeaderPedidos";
import FiltrosPedidos from "../pedidos/FiltrosPedidos";
import ListaPedidos from "../pedidos/ListaPedidos";

import "../css/Pedidos.css";

function Pedidos() {

  const navigate = useNavigate();

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("TODOS");
  const [eventoFiltro, setEventoFiltro] = useState("TODOS");

  const [ordem, setOrdem] = useState("PEDIDO");
  const [ordemCrescente, setOrdemCrescente] = useState(true);

  // Começa sempre na visualização em grade
  const [modoVisualizacao, setModoVisualizacao] = useState("grid");

  const handleNavigate = (path) => {
    navigate(path);
  };

  const formatarData = (data) => {

    const dia = String(data.getDate()).padStart(2, "0");

    const mes = String(data.getMonth() + 1).padStart(2, "0");

    return `${dia}/${mes}`;
  };

  const hojeObjeto = new Date();

  const amanhaObjeto = new Date();

  amanhaObjeto.setDate(
    hojeObjeto.getDate() + 1
  );

  const dataHoje = formatarData(hojeObjeto);

  const dataAmanha = formatarData(amanhaObjeto);

  const pedidos = [
    {
      id: "#21",
      campanha: "Natal",
      cliente: "Igor Felix",
      itens: 12,
      retirada: dataHoje,
      restante: "0d restantes",
      total: "R$780,00",
      status: "NAO_INICIADO"
    },

    {
      id: "#22",
      campanha: "Halloween",
      cliente: "Felipe Hideki",
      itens: 20,
      retirada: dataHoje,
      restante: "0d restante",
      total: "R$200,00",
      status: "PRONTO"
    },

    {
      id: "#23",
      campanha: "Páscoa",
      cliente: "Kauã Medeiros",
      itens: 5,
      retirada: dataAmanha,
      restante: "1d restante",
      total: "R$125,00",
      status: "NAO_INICIADO"
    },

    {
      id: "#24",
      campanha: "Aniversario",
      cliente: "Laura Belinello Buzzato",
      itens: 12,
      retirada: dataHoje,
      restante: "0d restantes",
      total: "R$780,00",
      status: "EM_PRODUCAO"
    },

    {
      id: "#25",
      campanha: "Casamento",
      cliente: "Pedro Rico",
      itens: 12,
      retirada: "22/05",
      restante: "Entregue",
      total: "R$220,00",
      status: "ENTREGUE"
    },

    {
      id: "#26",
      campanha: "Formatura",
      cliente: "Ana Souza",
      itens: 8,
      retirada: "18/05",
      restante: "Cancelado",
      total: "R$95,00",
      status: "CANCELADO"
    }
  ];

  const pedidosFiltrados = [...pedidos]
    .filter((pedido) => {

      const textoBusca = busca
        .toLowerCase()
        .trim();

      const correspondeBusca =
        pedido.cliente
          .toLowerCase()
          .includes(textoBusca) ||
        pedido.id
          .toLowerCase()
          .includes(textoBusca);

      const correspondeStatus =
        statusFiltro === "TODOS" ||
        pedido.status === statusFiltro;

      const correspondeEvento =
        eventoFiltro === "TODOS" ||
        pedido.campanha === eventoFiltro;

      return (
        correspondeBusca &&
        correspondeStatus &&
        correspondeEvento
      );
    })

    .sort((a, b) => {

      if (ordem === "PEDIDO") {

        const numeroA = Number(
          a.id.replace("#", "")
        );

        const numeroB = Number(
          b.id.replace("#", "")
        );

        return ordemCrescente
          ? numeroA - numeroB
          : numeroB - numeroA;
      }

      if (ordem === "CLIENTE") {

        const resultado = a.cliente.localeCompare(
          b.cliente,
          "pt-BR"
        );

        return ordemCrescente
          ? resultado
          : -resultado;
      }

      if (ordem === "EVENTO") {

        const resultado = a.campanha.localeCompare(
          b.campanha,
          "pt-BR"
        );

        return ordemCrescente
          ? resultado
          : -resultado;
      }

      return 0;
    });

  return (
    <div className="pedidos-layout">

      <Menu active="pedidos" />

      <main className="pedidos-content">

        <div className="pedidos-top">

          <HeaderPedidos />

          <BotaoAdicionar
            text="Novo Pedido"
            size="small"
            style={{
              marginTop: "40px"
            }}
            onClick={() =>
              handleNavigate("/NovoPedido")
            }
          />

        </div>

        <FiltrosPedidos
          busca={busca}
          setBusca={setBusca}

          statusFiltro={statusFiltro}
          setStatusFiltro={setStatusFiltro}

          eventoFiltro={eventoFiltro}
          setEventoFiltro={setEventoFiltro}

          ordem={ordem}
          setOrdem={setOrdem}

          ordemCrescente={ordemCrescente}
          setOrdemCrescente={setOrdemCrescente}

          modoVisualizacao={modoVisualizacao}
          setModoVisualizacao={setModoVisualizacao}

          pedidos={pedidos}
        />

        <ListaPedidos
          pedidos={pedidosFiltrados}
          modoVisualizacao={modoVisualizacao}
        />

      </main>

    </div>
  );
}

export default Pedidos;