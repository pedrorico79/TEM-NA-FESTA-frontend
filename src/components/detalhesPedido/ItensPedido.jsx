function ItensPedido({ itens, total, taxaEntrega = 0, descontoPedido = 0, totalAntesDesconto = 0, onEditar, mensagemBloqueio, unidadeAjuste = "R$", onAlterarUnidadeAjuste }) {

  function formatarAjuste(item) {
    const acrescimoSalvo = Number(item.acrescimo || 0);
    const qtd = Math.max(1, Number(item.qtd || 1));
    const base = Number(item.precoUnitario ?? item.precoBaseProduto ?? 0);
    const valor = unidadeAjuste === "%"
      ? (acrescimoSalvo === 0
        ? "0%"
        : base > 0 ? `+${(acrescimoSalvo / (base * qtd) * 100).toFixed(2).replace(".", ",")}%` : "—")
      : `${acrescimoSalvo === 0 ? "" : "+"}R$ ${acrescimoSalvo.toFixed(2).replace(".", ",")}`;
    return { tipo: "Acréscimo", valor, direcao: "acrescimo" };
  }

  const valorDesconto = Number(descontoPedido || 0);
  const descontoExibido = unidadeAjuste === "%"
    ? valorDesconto === 0
      ? "0%"
      : `−${totalAntesDesconto > 0 ? (valorDesconto / totalAntesDesconto * 100).toFixed(2).replace(".", ",") : "0,00"}%`
    : valorDesconto === 0
      ? "R$ 0,00"
      : `−R$ ${valorDesconto.toFixed(2).replace(".", ",")}`;
  const taxaEntregaExibida = `R$ ${Number(taxaEntrega || 0).toFixed(2).replace(".", ",")}`;
  const totalFinal = Math.max(0, Number(total || 0) + Number(taxaEntrega || 0) - valorDesconto);
  const quantidadePorProduto = new Map();
  itens.forEach((item) => {
    const id = String(item.produtoId ?? item.produto);
    quantidadePorProduto.set(id, (quantidadePorProduto.get(id) || 0) + 1);
  });
  const produtosExibidos = new Set();

  return (
    <div className="card-padrao itens-pedido-card">
      <div className="dados-cliente-header">
        <h2 className="secao-titulo">Itens do Pedido</h2>
        <div className="itens-pedido-header-acoes">
          <div className="itens-pedido-unidade-ajuste" role="group" aria-label="Exibir acréscimos e desconto em">
            {["R$", "%"].map((unidade) => (
              <button
                key={unidade}
                type="button"
                className={unidadeAjuste === unidade ? "ativo" : ""}
                aria-pressed={unidadeAjuste === unidade}
                onClick={() => onAlterarUnidadeAjuste?.(unidade)}
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

      {mensagemBloqueio && <p className="pedido-campo-bloqueado">{mensagemBloqueio}</p>}
      <div className="tabela-custom-wrapper tabela-itens-wrapper">
        <table className="tabela-pedido tabela-itens-pedido">
          <thead>
            <tr>
              <th>PRODUTO</th>
              <th>OBSERVAÇÃO</th>
              <th>QTD.</th>
              <th>PREÇO UNITÁRIO</th>
              <th title="Acréscimo aplicado a este item">ACRÉSCIMO</th>
              <th>SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => {
              const idProduto = String(item.produtoId ?? item.produto);
              const temVariacoes = quantidadePorProduto.get(idProduto) > 1;
              const variacao = temVariacoes && produtosExibidos.has(idProduto);
              produtosExibidos.add(idProduto);
              return (
              <tr key={item.id} className={temVariacoes ? `item-pedido-grupo-observacao ${variacao ? "item-pedido-variacao-observacao" : "item-pedido-observacao-principal"}` : ""}>
                <td>
                  <span className="produto-item-detalhe-nome">{item.produto}</span>
                  {variacao && <span className="item-pedido-variacao-tag">Outra observação do mesmo produto</span>}
                  {item.descricao?.trim() && <span className="produto-item-detalhe-descricao">{item.descricao}</span>}
                </td>
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
                    ) : "R$ 0,00";
                  })()}
                </td>
                <td className="text-right">R${item.subtotal.toFixed(2)}</td>
              </tr>
              );
            })}
            <tr className="linha-total total-itens-linha-desktop">
              <td colSpan="5"><strong>Total dos itens</strong></td>
              <td className="text-right"><strong>R${total.toFixed(2)}</strong></td>
            </tr>
            <tr className="linha-total total-itens-linha-mobile">
              <td><strong>Total dos itens</strong></td>
              <td className="text-right"><strong>R${total.toFixed(2)}</strong></td>
            </tr>
            <tr className="linha-total total-itens-linha-desktop">
              <td colSpan="5"><strong>Taxa de entrega</strong></td>
              <td className="text-right"><strong>{taxaEntregaExibida}</strong></td>
            </tr>
            <tr className="linha-total total-itens-linha-mobile">
              <td><strong>Taxa de entrega</strong></td>
              <td className="text-right"><strong>{taxaEntregaExibida}</strong></td>
            </tr>
            <tr className="linha-total desconto-pedido-linha-desktop">
              <td colSpan="5"><strong>Desconto do pedido</strong></td>
              <td className="text-right">
                <span className="ajuste-pedido-valor desconto"><strong>{descontoExibido}</strong></span>
              </td>
            </tr>
            <tr className="linha-total desconto-pedido-linha-mobile">
              <td><strong>Desconto do pedido</strong></td>
              <td className="text-right">
                <span className="ajuste-pedido-valor desconto"><strong>{descontoExibido}</strong></span>
              </td>
            </tr>
            <tr className="linha-total total-itens-linha-desktop total-final-pedido-linha">
              <td colSpan="5"><strong>Total final</strong></td>
              <td className="text-right"><strong>R$ {totalFinal.toFixed(2).replace(".", ",")}</strong></td>
            </tr>
            <tr className="linha-total total-itens-linha-mobile total-final-pedido-linha">
              <td><strong>Total final</strong></td>
              <td className="text-right"><strong>R$ {totalFinal.toFixed(2).replace(".", ",")}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ItensPedido;
