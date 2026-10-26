import { useState } from "react";
import FiltroDropdown from "../pedidos/FiltroDropdown";

function PaginaInicialTempo() {
  const [periodo, setPeriodo] = useState("7");

  return (
    <div className="pedidos-header">
      <h2>Pedidos dos Próximos</h2>
      <FiltroDropdown
        value={periodo}
        onChange={setPeriodo}
        label="Período de pedidos próximos"
        options={[
          { value: "7", label: "7 dias" },
          { value: "15", label: "15 dias" },
          { value: "30", label: "30 dias" },
        ]}
      />
    </div>
  );
}

export default PaginaInicialTempo;
