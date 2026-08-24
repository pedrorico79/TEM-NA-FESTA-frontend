import "../../css/Tabela.css";

function Tabela({
  columns,
  data,
  sections,
  onRowClick,
  rowClassName
}) {

  const renderRow = (row, index) => {

    const classeLinha = rowClassName
      ? rowClassName(index)
      : "";

    return (
      <tr
        key={index}
        onClick={
          onRowClick
            ? () => onRowClick(index)
            : undefined
        }
        className={classeLinha}
      >
        {row.map((item, index) => (
          <td key={index}>
            {item}
          </td>
        ))}
      </tr>
    );
  };

  return (
    <table className="custom-table">

      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>
              {column}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>

        {!sections &&
          data.map((row, index) =>
            renderRow(row, index)
          )
        }

        {sections &&
          sections.map((section, sectionIndex) => (
            <React.Fragment key={sectionIndex}>

              <tr className="section-row">
                <td colSpan={columns.length}>
                  <div className="section-divider">
                    <span>
                      {section.title}
                    </span>
                  </div>
                </td>
              </tr>

              {section.rows.map(
                (row, rowIndex) =>
                  renderRow(
                    row,
                    `${sectionIndex}-${rowIndex}`
                  )
              )}

            </React.Fragment>
          ))
        }

      </tbody>

    </table>
  );
}

export default Tabela;