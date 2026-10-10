import Menu from "../shared/menu/Menu";
import PaginaInicialHeader from "../paginaInicial/PaginaInicialHeader";
import PaginaInicialTempo from "../paginaInicial/PaginaInicialTempo";
import KpiSection from "../paginaInicial/KpiSection";
import CardAlerta from "../paginaInicial/CardAlerta";
import CardLembrete from "../paginaInicial/CardLembrete";
import ProximasRetiradas from "../paginaInicial/ProximasRetiradas";

import { useEffect, useRef, useState } from "react";
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

  const [lembretesAbertos, setLembretesAbertos] = useState(false);

  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [alturaRetiradas, setAlturaRetiradas] = useState(0);
  const paginaInicialGridRef = useRef(null);

  useEffect(() => {
    const grid = paginaInicialGridRef.current;
    const cardRetiradas = grid?.querySelector(".retiradas-card");

    if (!cardRetiradas || typeof ResizeObserver === "undefined") {
      return;
    }

    const atualizarAltura = () => {
      setAlturaRetiradas(Math.ceil(cardRetiradas.getBoundingClientRect().height));
    };

    atualizarAltura();

    const observer = new ResizeObserver(atualizarAltura);
    observer.observe(cardRetiradas);

    return () => observer.disconnect();
  }, []);

  function mostrarMensagemSucesso(mensagem) {
    setMensagemSucesso(mensagem);
    setTimeout(() => setMensagemSucesso(""), 3000);
  }


  async function buscarLembretes() {
    try {
      const res = await api.get("/lembretes");
      setLembretes(res.data);
    } catch (erro) {
      console.log("Erro ao buscar lembretes:", erro.response?.data);
    }
  }


  async function criarLembrete(lembrete) {
    await api.post("/lembretes", lembrete);
    await buscarLembretes();
    mostrarMensagemSucesso("Lembrete criado com sucesso!");
  }


  function atualizarLembrete(id, lembrete) {
    api.put(
      `/lembretes/${id}`,
      lembrete
    )
      .then(() => {
        buscarLembretes();
        mostrarMensagemSucesso("Lembrete editado com sucesso!");
      })
      .catch((erro) => {
        console.log("Erro ao atualizar:", erro);
        console.log("Status:", erro.response?.status);
        console.log("Data:", erro.response?.data);
      });
  }


  function deletarLembrete(id) {

    api.delete(`/lembretes/${id}`)
      .then(() => {

        buscarLembretes();
        mostrarMensagemSucesso("Lembrete excluído com sucesso!");

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
            (res.data?.AGUARDANDO_SINAL || 0) +
            (res.data?.CONFIRMADO || 0) +
            (res.data?.EM_PRODUCAO || 0) +
            (res.data?.PRONTO_PARA_ENTREGA || 0),
          aguardandoPreparo: res.data?.CONFIRMADO || 0,
          emProducao: res.data?.EM_PRODUCAO || 0,
          pagamentosPendentes: res.data?.AGUARDANDO_SINAL || 0
        });

      })
      .catch((erro) => {
        console.error("Erro ao carregar os indicadores da página inicial:", erro);
      });


    buscarLembretes();


  }, []);

  return (
    <div className="paginaInicial-layout">

      {mensagemSucesso && (
        <div className="mensagem-sucesso-lembrete" role="status">
          {mensagemSucesso}
        </div>
      )}

      <Menu active="paginaInicial" />

      <main className="paginaInicial-content">

        <PaginaInicialHeader />

        <div
          className="paginaInicial-grid"
          ref={paginaInicialGridRef}
          style={alturaRetiradas ? { "--retiradas-card-height": `${alturaRetiradas}px` } : undefined}
        >

          <section className="left-content">

            <KpiSection kpis={kpis} />

            <ProximasRetiradas />

          </section>


          <aside
            className={`right-content ${lembretesAbertos ? "lembretes-aberto" : ""}`}
            onClick={(event) => {
              if (lembretesAbertos && event.target === event.currentTarget) {
                setLembretesAbertos(false);
              }
            }}
          >

            <CardLembrete
              painelAberto={lembretesAbertos}
              lembretes={lembretes}
              criarLembrete={criarLembrete}
              atualizarLembrete={atualizarLembrete}
              deletarLembrete={deletarLembrete}
              setLembreteSelecionado={setLembreteSelecionado}
            />

          </aside>

          <button
            className="btn-lembretes-mobile"
            onClick={() => setLembretesAbertos((abertos) => !abertos)}
            aria-label={lembretesAbertos ? "Fechar lembretes" : "Abrir lembretes"}
            aria-expanded={lembretesAbertos}
          >
            <ion-icon name={lembretesAbertos ? "close-outline" : "reader-outline"}></ion-icon>
          </button>

        </div>

      </main>

    </div>
  );
}

export default PaginaInicial
