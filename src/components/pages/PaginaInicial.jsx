import Menu from "../shared/Menu/Menu";
import PaginaInicialHeader from "../paginaInicial/PaginaInicialHeader";
import PaginaInicialTempo from "../paginaInicial/PaginaInicialTempo";
import KpiSection from "../paginaInicial/KpiSection";
import CardAlerta from "../paginaInicial/CardAlerta";
import CardLembrete from "../paginaInicial/CardLembrete";
import ProximasRetiradas from "../paginaInicial/ProximasRetiradas";

import "../css/PaginaInicial.css";

function PaginaInicial() {
  const proximasRetiradas = [
  {
    title: "Hoje",
    rows: [
      ["#25-005", "Igor Felix", "12x Itens Natal", "NAO_INICIADO"],
      ["#25-004", "Felipe Hideki", "20x Cookies Recheados", "PRONTO"],
      ["#25-002", "Laura Belinello Buzzato", "12x Doces Festa", "EM_PRODUCAO"]
    ]
  },
  {
    title: "Amanhã",
    rows: [
      ["#25-003", "Kauã Medeiros", "5x Ovos de Páscoa", "NAO_INICIADO"]
    ]
  }
];
  return (
    <div className="paginaInicial-layout">
      <Menu active="paginaInicial" />

      <main className="paginaInicial-content">
        <PaginaInicialHeader />

        <div className="paginaInicial-grid">
          <section className="left-content">

            <KpiSection />

            <ProximasRetiradas data={proximasRetiradas} />
          </section>

          <aside className="right-content">
            <CardAlerta />

            <CardLembrete />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default PaginaInicial