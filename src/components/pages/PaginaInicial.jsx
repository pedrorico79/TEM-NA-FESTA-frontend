import Menu from "../shared/menu/Menu";
import PaginaInicialHeader from "../paginaInicial/PaginaInicialHeader";
import PaginaInicialTempo from "../paginaInicial/PaginaInicialTempo";
import KpiSection from "../paginaInicial/KpiSection";
import CardAlerta from "../paginaInicial/CardAlerta";
import CardLembrete from "../paginaInicial/CardLembrete";
import ProximasRetiradas from "../paginaInicial/ProximasRetiradas";

import { useEffect, useState } from "react";
import { api } from "../../services/api";

import "../css/PaginaInicial.css";

function PaginaInicial() {

  const [kpis, setKpis] = useState({
    pedidosAtivos: 0,
    aguardandoPreparo: 0,
    emProducao: 0,
    pagamentosPendentes: 0
  });

  const [lembretes, setLembretes] = useState([]);

  const [lembreteSelecionado, setLembreteSelecionado] = useState(null);


  function buscarLembretes() {

    const usuarioId = localStorage.getItem("userId");

    api.get(`/lembretes`)
      .then((res) => {
        setLembretes(res.data);
      })
      .catch((erro) => {
        console.log("Erro ao buscar lembretes:", erro.response?.data);
      });

  }


  function criarLembrete(lembrete) {

    const usuarioId = localStorage.getItem("userId");

    api.post(
      `/lembretes?usuarioId=${usuarioId}`,
      lembrete
    )
      .then(() => {
        buscarLembretes();
      })
      .catch((erro) => {
        console.log(erro.response?.data);
      });

  }


  function atualizarLembrete(id, lembrete) {

    const usuarioId = localStorage.getItem("userId");

    api.put(
      `/lembretes/${id}?usuarioId=${usuarioId}`,
      lembrete
    )
      .then(() => {

        buscarLembretes();

      })
      .catch((erro) => {
        console.log("Erro ao atualizar:", erro.response?.data);
      });

  }


  function deletarLembrete(id) {

    api.delete(`/lembretes/${id}`)
      .then(() => {

        buscarLembretes();

      })
      .catch((erro) => {
        console.log("Erro ao deletar:", erro.response?.data);
      });

  }


  useEffect(() => {

    api.get("/pedidos/count-by-status")
      .then((res) => {

        setKpis({
          pedidosAtivos:
            (res.data.AGUARDANDO_SINAL || 0) +
            (res.data.CONFIRMADO || 0) +
            (res.data.EM_PRODUCAO || 0) +
            (res.data.PRONTO_PARA_ENTREGA || 0),
          aguardandoPreparo: res.data.CONFIRMADO,
          emProducao: res.data.EM_PRODUCAO,
          pagamentosPendentes: res.data.AGUARDANDO_SINAL
        });

      });


    buscarLembretes();


  }, []);

  return (
    <div className="paginaInicial-layout">

      <Menu active="paginaInicial" />

      <main className="paginaInicial-content">

        <PaginaInicialHeader />

        <div className="paginaInicial-grid">

          <section className="left-content">

            <KpiSection kpis={kpis} />

            <ProximasRetiradas />

          </section>


          <aside className="right-content">

            <CardLembrete
              lembretes={lembretes}
              criarLembrete={criarLembrete}
              atualizarLembrete={atualizarLembrete}
              deletarLembrete={deletarLembrete}
              setLembreteSelecionado={setLembreteSelecionado}
            />

          </aside>

        </div>

      </main>

    </div>
  );
}

export default PaginaInicial