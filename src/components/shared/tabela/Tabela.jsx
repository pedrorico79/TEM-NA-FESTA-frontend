import "../../css/Tabela.css";

function Tabela({
  columns,
  data,
  sections,
}) {

  const renderRow = (row, index) => (
    <tr key={index}>
      {row.map((item, index) => (
        <td key={index}>{item}</td>
      ))}
    </tr>
  );

  return (
    <table className="custom-table">

      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>

      <tbody>

        {/* TABELA NORMAL */}
        {!sections &&
          data.map((row, index) =>
            renderRow(row, index)
          )
        }

        {/* TABELA COM SEÇÕES (Página Inicial) */}
        {sections &&
          sections.map((section, sectionIndex) => (
            <>
              <tr
                className="section-row"
                key={sectionIndex}
              >
                <td colSpan={columns.length}>
                  <div className="section-divider">
                    <span>{section.title}</span>
                  </div>
                </td>
              </tr>

              {section.rows.map((row, rowIndex) =>
                renderRow(
                  row,
                  `${sectionIndex}-${rowIndex}`
                )
              )}
            </>
          ))
        }

      </tbody>

    </table>
  );
}

export default Tabela;