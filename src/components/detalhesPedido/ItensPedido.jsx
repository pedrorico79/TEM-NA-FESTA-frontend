import { useState } from "react";

function ItensPedido({ itens, total, onEditar, mensagemBloqueio }) {
  const [unidadeAjuste, setUnidadeAjuste] = useState("R$");

  function formatarAjuste(item) {
    const base = Number(item.precoBaseProduto ?? item.precoUnitario ?? 0);
    const diferenca = Number((Number(item.precoUnitario || 0) - base).toFixed(2));
    if (Math.abs(diferenca) < 0.01) return null;

    const tipo = diferenca < 0 ? "Desconto" : "Acréscimo";
    if (unidadeAjuste === "%") {
      if (base <= 0) return { tipo, valor: "—", direcao: diferenca < 0 ? "desconto" : "acrescimo" };
      const percentual = Math.abs(diferenca / base * 100);
      return {
        tipo,
        valor: `${diferenca < 0 ? "−" : "+"}${percentual.toFixed(2).replace(".", ",")}%`,
        direcao: diferenca < 0 ? "desconto" : "acrescimo",
      };
    }

    return {
      tipo,
      valor: `${diferenca < 0 ? "−" : "+"}R$ ${Math.abs(diferenca).toFixed(2).replace(".", ",")}`,
      direcao: diferenca < 0 ? "desconto" : "acrescimo",
    };
  }

  return (
    <div className="card-padrao itens-pedido-card">
      <div className="dados-cliente-header">
        <h2 className="secao-titulo">Itens do Pedido</h2>
        <div className="itens-pedido-header-acoes">
          <div className="itens-pedido-unidade-ajuste" role="group" aria-label="Exibir ajuste em">
            {["R$", "%"].map((unidade) => (
              <button
                key={unidade}
                type="button"
                className={unidadeAjuste === unidade ? "ativo" : ""}
                aria-pressed={unidadeAjuste === unidade}
                onClick={() => setUnidadeAjuste(unidade)}
              >
                {unidade}
              </button>
            ))}
          </div>
          {onEditar && <button
            type="button"
            className="btn-editar-dados-cliente"
            onClick={onEditar}
            aria-label="Editar itens do pedido"
            title="Editar itens do pedido"
          >
            <ion-icon name="pencil-outline"></ion-icon>
          </button>}
        </div>
      </div>
      <p className="itens-pedido-ajuste-nota">
        Ajustes calculados em relação ao preço atual do produto.
      </p>
      {mensagemBloqueio && <p className="pedido-campo-bloqueado">{mensagemBloqueio}</p>}
      <div className="tabela-custom-wrapper tabela-itens-wrapper">
        <table className="tabela-pedido tabela-itens-pedido">
          <thead>
            <tr>
              <th>PRODUTO</th>
              <th>DESCRIÇÃO</th>
              <th>OBSERVAÇÃO</th>
              <th>QTD.</th>
              <th>PREÇO UNITÁRIO</th>
              <th title="Diferença entre o preço salvo no pedido e o preço atual do produto">AJUSTE</th>
              <th>SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id}>
                <td>
                  <span>{item.produto}</span>
                  {(() => {
                    const ajuste = formatarAjuste(item);
                    return ajuste && (
                      <span className={`item-pedido-mobile-ajuste ${ajuste.direcao}`}>
                        {ajuste.tipo}: {ajuste.valor}
                      </span>
                    );
                  })()}
                  <span className="item-pedido-mobile-resumo">
                    Qtd. {item.qtd} · Unitário R${item.precoUnitario.toFixed(2)}
                  </span>
                  {(item.descricao?.trim() || item.observacaoItem?.trim()) && <details className="item-pedido-mobile-detalhes">
                    <summary>Descrição e observação</summary>
                    <div className="item-pedido-mobile-conteudo">
                      {item.descricao?.trim() && <span><strong>Descrição:</strong> {item.descricao}</span>}
                      {item.observacaoItem?.trim() && <span><strong>Observação:</strong> {item.observacaoItem}</span>}
                    </div>
                  </details>}
                </td>
                <td>{item.descricao}</td>
                <td>{item.observacaoItem || "—"}</td>
                <td className="text-center">{item.qtd}</td>
                <td className="text-right">R${item.precoUnitario.toFixed(2)}</td>
                <td>
                  {(() => {
                    const ajuste = formatarAjuste(item);
                    return ajuste ? (
                      <span className={`ajuste-pedido-valor ${ajuste.direcao}`}>
                        <span>{ajuste.tipo}</span>
                        <strong>{ajuste.valor}</strong>
                      </span>
                    ) : "—";
                  })()}
                </td>
                <td className="text-right">R${item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="linha-total total-itens-linha-desktop">
              <td colSpan="6"><strong>Total dos itens</strong></td>
              <td className="text-right"><strong>R${total.toFixed(2)}</strong></td>
            </tr>
            <tr className="linha-total total-itens-linha-mobile">
              <td><strong>Total dos itens</strong></td>
              <td className="text-right"><strong>R${total.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ItensPedido;
