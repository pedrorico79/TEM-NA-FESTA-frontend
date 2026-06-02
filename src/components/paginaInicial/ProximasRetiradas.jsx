import Tabela from "../shared/tabela/Tabela";

function ProximasRetiradas(props) {

  const getStatus = (status) => {

    if (status === "NAO_INICIADO") {
      return (
        <span className="status naoIniciado">
          Não iniciado
        </span>
      );
    }

    if (status === "EM_PRODUCAO") {
      return (
        <span className="status emProducao">
          Em produção
        </span>
      );
    }

    if (status === "PRONTO") {
      return (
        <span className="status pronto">
          Pronto
        </span>
      );
    }

    if (status === "ENTREGUE") {
      return (
        <span className="status entregue">
          Entregue
        </span>
      );
    }

    if (status === "CANCELADO") {
      return (
        <span className="status cancelado">
          Cancelado
        </span>
      );
    }

    return (
      <span className="status">
        {status}
      </span>
    );
  };

  const formattedSections = props.data.map(
    (section) => ({
      title: section.title,

      rows: section.rows.map((row) => [
        row[0],
        row[1],
        row[2],

        getStatus(row[3]),

        <ion-icon name="chevron-forward-outline"></ion-icon>
      ]),
    })
  );

  return (
    <div className="retiradas-card">

      <div className="retiradas-tempo">

        <h2>Próximas Retiradas</h2>

        <select>
          <option>7 dias</option>
          <option>15 dias</option>
          <option>30 dias</option>
        </select>

      </div>

      <div className="tabela-wrapper">

        <Tabela
          columns={[
            "#PEDIDO",
            "CLIENTE",
            "ITENS",
            "STATUS",
            ""
          ]}

          sections={formattedSections}
        />

      </div>

    </div>
  );
}

export default ProximasRetiradas;