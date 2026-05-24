import Menu from "../shared/Menu/Menu";
import PaginaInicialHeader from "../paginaInicial/PaginaInicialHeader";
import PaginaInicialTempo from "../paginaInicial/PaginaInicialTempo";
import KpiSection from "../paginaInicial/KpiSection";
import CardAlerta from "../paginaInicial/CardAlerta";
import CardLembrete from "../paginaInicial/CardLembrete";
import ProximasRetiradas from "../paginaInicial/ProximasRetiradas";

import "../css/PaginaInicial.css";

function PaginaInicial(props) {
  return (
    <div className="paginaInicial-layout">
      <Menu active="paginaInicial" />

      <main className="paginaInicial-content">
        <PaginaInicialHeader />

        <div className="paginaInicial-grid">
          <section className="left-content">
            <PaginaInicialTempo />

            <KpiSection />

            <ProximasRetiradas data={props.proximasRetiradas} />
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