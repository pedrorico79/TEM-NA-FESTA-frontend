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

        /*
         * Calculamos a altura com base na quantidade
         * de itens e pagamentos.
         */

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
          "CNPJ: XX.XXX.XXX/XXXX-XX",
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
         * INFORMAÇÕES
         * =====================================================
         */

        ctx.textAlign = "left";

        ctx.font =
          "26px Arial";

        const escreverInformacao = (
          label,
          valor
        ) => {
          ctx.fillStyle = "#333333";

          ctx.font =
            "bold 26px Arial";

          ctx.fillText(
            label,
            padding,
            y
          );

          const larguraLabel =
            ctx.measureText(label).width;

          ctx.font =
            "26px Arial";

          ctx.fillText(
            valor,
            padding + larguraLabel + 8,
            y
          );

          y += 42;
        };


        escreverInformacao(
          "Cliente:",
          "Sarah Mayumi"
        );

        escreverInformacao(
          "Endereço:",
          "Rua das Orquídeas, 342"
        );

        escreverInformacao(
          "Contato:",
          "(11) 93478-0032"
        );

        escreverInformacao(
          "Pedido:",
          String(pedido?.id ?? "")
        );

        escreverInformacao(
          "Data de Emissão:",
          "13/04/2026 - 14:32"
        );

        escreverInformacao(
          "Local de Pagamento:",
          "São Paulo - SP, pagamento on-line"
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
                item.subtotal
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
            totalPedido
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


        pedido?.pagamentos?.forEach(
          (pag, idx) => {

            ctx.font =
              "26px Arial";

            ctx.fillStyle = "#333333";

            const descricao =
              `Parcela ${idx + 1} (${pag.data})`;

            const valor =
              `R$ ${Number(
                pag.valor
              ).toFixed(2)} - ${pag.metodo}`;

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
         * ===================================================== */

        ctx.textAlign = "right";

        ctx.fillStyle = "#333333";

        ctx.font =
          "bold 28px Arial";

        ctx.fillText(
          `Total Pago: R$ ${Number(
            totalPago
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
            totalAPagar
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
        className={`botao-copiar-recibo ${
          copiado
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