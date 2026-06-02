import Menu from "../shared/Menu/Menu";
import PaginaInicialHeader from "../paginaInicial/PaginaInicialHeader";
import PaginaInicialTempo from "../paginaInicial/PaginaInicialTempo";
import KpiSection from "../paginaInicial/KpiSection";
import CardAlerta from "../paginaInicial/CardAlerta";
import CardLembrete from "../paginaInicial/CardLembrete";
import ProximasRetiradas from "../paginaInicial/ProximasRetiradas";

import "../css/PaginaInicial.css";

function PaginaInicial() {
  const proximasRetiradas = [{ title: "Hoje", rows: [["#049", "Sarah Merli", "2x Ovo 200g + 1x Trufas", "EM_PRODUCAO"], ["#050", "Ana Clara", "1x Bento Cake + 6 Brigadeiros", "NAO_INICIADO"], ["#051", "Leonardo Cortez", "3x Cookies Recheados", "PRONTO"],], }, { title: "Amanhã", rows: [["#052", "Mayumi Tanaka", "2x Caixa Premium + 1x Brownie", "ENTREGUE"], ["#053", "Juliana Martins", "1x Ovo 350g Personalizado", "CANCELADO"],], },];
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