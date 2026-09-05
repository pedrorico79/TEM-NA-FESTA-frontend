import React, { useEffect, useState } from "react";

function ReciboPedido({
  pedido,
  totalPedido,
  totalPago,
  totalAPagar
}) {
  const [imagemRecibo, setImagemRecibo] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [erroImagem, setErroImagem] = useState(false);

  useEffect(() => {
    let cancelado = false;

    const gerarRecibo = async () => {
      try {
        setImagemRecibo(null);
        setErroImagem(false);

        const canvas = document.createElement("canvas");

        const largura = 840;
        const padding = 60;

        const quantidadeItens =
          pedido?.itens?.length || 0;

        const quantidadePagamentos =
          pedido?.pagamentos?.length || 0;

        const altura =
          1000 +
          quantidadeItens * 55 +
          quantidadePagamentos * 55;

        canvas.width = largura;
        canvas.height = altura;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error(
            "Não foi possível criar o canvas."
          );
        }

        ctx.fillStyle = "#ffffff";

        ctx.fillRect(
          0,
          0,
          largura,
          altura
        );

        ctx.textBaseline = "top";

        let y = padding;

        /*
         * =====================================================
         * DADOS DO RECIBO
         * =====================================================
         */

        const dadosCliente = pedido?.dadosCliente ?? {};

        const nomeCliente =
          dadosCliente.nome ??
          "Cliente não informado";

        const enderecoCliente =
          dadosCliente.endereco ??
          "Não informado";

        const contatoCliente =
          dadosCliente.whatsapp ??
          dadosCliente.telefone ??
          "Não informado";

        const dataEmissao =
          pedido?.datas?.dataPedido ??
          "Não informado";

        const numeroPedido =
          pedido?.id ??
          "Não informado";

        /*
         * CNPJ vindo do .env
         *
         * No Vite:
         * VITE_CNPJ=XX.XXX.XXX/XXXX-XX
         */

        const cnpj =
          import.meta.env.VITE_CNPJ ??
          "CNPJ não informado";

        /*
         * =====================================================
         * CABEÇALHO
         * =====================================================
         */

        ctx.textAlign = "center";

        ctx.fillStyle = "#bc5a6c";

        ctx.font =
          "bold 56px Arial";

        ctx.fillText(
          "Tem na Festa",
          largura / 2,
          y
        );

        y += 70;

        ctx.fillStyle = "#777777";

        ctx.font =
          "24px Arial";

        ctx.fillText(
          `CNPJ: ${cnpj}`,
          largura / 2,
          y
        );

        y += 60;

        /*
         * =====================================================
         * LINHA
         * =====================================================
         */

        ctx.strokeStyle = "#dddddd";

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.moveTo(
          padding,
          y
        );

        ctx.lineTo(
          largura - padding,
          y
        );

        ctx.stroke();

        y += 35;

        /*
         * =====================================================
         * INFORMAÇÕES DO PEDIDO
         * =====================================================
         */

        ctx.textAlign = "left";

        ctx.font =
          "26px Arial";

        const escreverInformacao = (label, valor) => {
          const texto = String(
            valor ?? "Não informado"
          );

          const tamanhoFonte = 26;
          const alturaLinha = 38;

          const larguraDisponivel =
            largura - padding * 2;

          ctx.font =
            `bold ${tamanhoFonte}px Arial`;

          const larguraLabel =
            ctx.measureText(label).width;

          const xValor =
            padding +
            larguraLabel +
            8;

          const larguraPrimeiraLinha =
            largura - xValor - padding;

          const larguraLinhasSeguintes =
            largura - xValor - padding;

          const quebrarTexto = (
            texto,
            larguraMaxima
          ) => {
            const palavras = texto.split(" ");

            const linhas = [];
            let linhaAtual = "";

            for (const palavra of palavras) {
              const tentativa =
                linhaAtual
                  ? `${linhaAtual} ${palavra}`
                  : palavra;

              ctx.font =
                `${tamanhoFonte}px Arial`;

              if (
                ctx.measureText(tentativa).width <=
                larguraMaxima
              ) {
                linhaAtual = tentativa;
                continue;
              }

              if (linhaAtual) {
                linhas.push(linhaAtual);
              }

              /*
               * Palavra maior que a própria largura:
               * quebra caractere por caractere.
               */
              if (
                ctx.measureText(palavra).width >
                larguraMaxima
              ) {
                let parte = "";

                for (const caractere of palavra) {
                  const tentativaParte =
                    parte + caractere;

                  if (
                    ctx.measureText(
                      tentativaParte
                    ).width <= larguraMaxima
                  ) {
                    parte = tentativaParte;
                  } else {
                    if (parte) {
                      linhas.push(parte);
                    }

                    parte = caractere;
                  }
                }

                linhaAtual = parte;
              } else {
                linhaAtual = palavra;
              }
            }

            if (linhaAtual) {
              linhas.push(linhaAtual);
            }

            return linhas;
          };

          /*
           * Descobre primeiro se cabe na mesma
           * linha do label.
           */
          const linhasPrimeira =
            quebrarTexto(
              texto,
              larguraPrimeiraLinha
            );

          ctx.textAlign = "left";

          /*
           * Label
           */
          ctx.fillStyle = "#333333";

          ctx.font =
            `bold ${tamanhoFonte}px Arial`;

          ctx.fillText(
            label,
            padding,
            y
          );

          /*
           * Valor
           */
          ctx.font =
            `${tamanhoFonte}px Arial`;

          ctx.fillText(
            linhasPrimeira[0] ??
            "Não informado",
            xValor,
            y
          );

          y += alturaLinha;

          /*
           * Se o valor continuou em outras linhas,
           * desenha cada uma alinhada com o valor.
           */
          if (linhasPrimeira.length > 1) {
            const textoRestante =
              linhasPrimeira
                .slice(1)
                .join(" ");

            const outrasLinhas =
              quebrarTexto(
                textoRestante,
                larguraLinhasSeguintes
              );

            outrasLinhas.forEach(
              (linha) => {
                ctx.fillText(
                  linha,
                  xValor,
                  y
                );

                y += alturaLinha;
              }
            );
          }
        };

        escreverInformacao(
          "Cliente:",
          nomeCliente
        );

        escreverInformacao(
          "Endereço:",
          enderecoCliente
        );

        escreverInformacao(
          "Contato:",
          contatoCliente
        );

        escreverInformacao(
          "Pedido:",
          numeroPedido
        );

        escreverInformacao(
          "Data de Emissão:",
          dataEmissao
        );

        /*
         * =====================================================
         * SEPARADOR
         * =====================================================
         */

        y += 15;

        ctx.strokeStyle = "#dddddd";

        ctx.beginPath();

        ctx.moveTo(
          padding,
          y
        );

        ctx.lineTo(
          largura - padding,
          y
        );

        ctx.stroke();

        y += 35;

        /*
         * =====================================================
         * RESUMO DOS ITENS
         * =====================================================
         */

        ctx.fillStyle = "#333333";

        ctx.font =
          "bold 28px Arial";

        ctx.fillText(
          "Resumo dos Itens",
          padding,
          y
        );

        y += 48;

        pedido?.itens?.forEach(
          (item) => {
            ctx.font =
              "26px Arial";

            ctx.fillStyle = "#333333";

            const nome =
              `${item.qtd}x ${item.produto}`;

            const valor =
              `R$ ${Number(
                item.subtotal ?? 0
              ).toFixed(2)}`;

            ctx.textAlign = "left";

            ctx.fillText(
              nome,
              padding,
              y
            );

            ctx.textAlign = "right";

            ctx.fillText(
              valor,
              largura - padding,
              y
            );

            y += 42;
          }
        );

        /*
         * =====================================================
         * TOTAL DO PEDIDO
         * =====================================================
         */

        y += 10;

        ctx.strokeStyle = "#cccccc";

        ctx.setLineDash([
          8,
          6
        ]);

        ctx.beginPath();

        ctx.moveTo(
          padding,
          y
        );

        ctx.lineTo(
          largura - padding,
          y
        );

        ctx.stroke();

        ctx.setLineDash([]);

        y += 25;

        ctx.fillStyle = "#bc5a6c";

        ctx.font =
          "bold 28px Arial";

        ctx.textAlign = "right";

        ctx.fillText(
          `Total do Pedido: R$ ${Number(
            totalPedido ?? 0
          ).toFixed(2)}`,
          largura - padding,
          y
        );

        y += 60;

        /*
         * =====================================================
         * SEPARADOR
         * =====================================================
         */

        ctx.strokeStyle = "#dddddd";

        ctx.beginPath();

        ctx.moveTo(
          padding,
          y
        );

        ctx.lineTo(
          largura - padding,
          y
        );

        ctx.stroke();

        y += 35;

        /*
         * =====================================================
         * HISTÓRICO DE PAGAMENTOS
         * =====================================================
         */

        ctx.textAlign = "left";

        ctx.fillStyle = "#333333";

        ctx.font =
          "bold 28px Arial";

        ctx.fillText(
          "Histórico de Pagamentos",
          padding,
          y
        );

        y += 48;

        if (
          !pedido?.pagamentos ||
          pedido.pagamentos.length === 0
        ) {
          ctx.font =
            "26px Arial";

          ctx.fillStyle = "#777777";

          ctx.fillText(
            "Nenhum pagamento registrado.",
            padding,
            y
          );

          y += 42;
        }

        pedido?.pagamentos?.forEach(
          (pag, idx) => {
            ctx.font =
              "26px Arial";

            ctx.fillStyle = "#333333";

            const descricao =
              `Parcela ${idx + 1} (${pag.data})`;

            const valor =
              `R$ ${Number(
                pag.valor ?? 0
              ).toFixed(2)} - ${pag.metodo ?? "Não informado"
              }`;

            ctx.textAlign = "left";

            ctx.fillText(
              descricao,
              padding,
              y
            );

            ctx.textAlign = "right";

            ctx.fillText(
              valor,
              largura - padding,
              y
            );

            y += 42;
          }
        );

        /*
         * =====================================================
         * SEPARADOR FINAL
         * =====================================================
         */

        y += 15;

        ctx.strokeStyle = "#dddddd";

        ctx.beginPath();

        ctx.moveTo(
          padding,
          y
        );

        ctx.lineTo(
          largura - padding,
          y
        );

        ctx.stroke();

        y += 35;

        /*
         * =====================================================
         * TOTAIS
         * =====================================================
         */

        ctx.textAlign = "right";

        ctx.fillStyle = "#333333";

        ctx.font =
          "bold 28px Arial";

        ctx.fillText(
          `Total Pago: R$ ${Number(
            totalPago ?? 0
          ).toFixed(2)}`,
          largura - padding,
          y
        );

        y += 42;

        ctx.fillStyle = "#bc5a6c";

        ctx.font =
          "bold 32px Arial";

        ctx.fillText(
          `Total a Pagar: R$ ${Number(
            totalAPagar ?? 0
          ).toFixed(2)}`,
          largura - padding,
          y
        );

        /*
         * =====================================================
         * CONVERTE CANVAS PARA PNG
         * =====================================================
         */

        const imagem =
          canvas.toDataURL(
            "image/png"
          );

        if (!cancelado) {
          setImagemRecibo(imagem);
        }

      } catch (error) {
        console.error(
          "Erro ao gerar recibo:",
          error
        );

        if (!cancelado) {
          setErroImagem(true);
        }
      }
    };

    gerarRecibo();

    return () => {
      cancelado = true;
    };

  }, [
    pedido,
    totalPedido,
    totalPago,
    totalAPagar
  ]);

  /*
   * =====================================================
   * COPIAR IMAGEM
   * =====================================================
   */

  const copiarRecibo = async () => {
    if (!imagemRecibo) {
      return;
    }

    try {
      const response =
        await fetch(imagemRecibo);

      const blob =
        await response.blob();

      if (
        !navigator.clipboard ||
        !window.ClipboardItem
      ) {
        throw new Error(
          "Clipboard de imagens não suportado."
        );
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob
        })
      ]);

      setCopiado(true);

      setTimeout(() => {
        setCopiado(false);
      }, 2000);

    } catch (error) {
      console.error(
        "Erro ao copiar recibo:",
        error
      );

      alert(
        "Não foi possível copiar a imagem do recibo."
      );
    }
  };

  return (
    <div className="recibo-container">

      {imagemRecibo ? (

        <img
          src={imagemRecibo}
          alt="Recibo do pedido"
          className="recibo-imagem"
          draggable="true"
        />

      ) : erroImagem ? (

        <div className="recibo-erro">
          Não foi possível gerar o recibo.
        </div>

      ) : (

        <div className="recibo-carregando">
          Gerando recibo...
        </div>

      )}

      <button
        type="button"
        className={`botao-copiar-recibo ${copiado
            ? "copiado"
            : ""
          }`}
        onClick={copiarRecibo}
        disabled={!imagemRecibo}
      >
        {copiado
          ? "✓ Recibo copiado!"
          : "Copiar recibo"}
      </button>

    </div>
  );
}

export default ReciboPedido;

