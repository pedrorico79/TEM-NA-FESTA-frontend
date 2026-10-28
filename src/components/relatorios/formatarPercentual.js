export function formatarPercentual(valor) {
    const numero = typeof valor === "number"
        ? valor
        : Number.parseFloat(String(valor ?? "0").replace("%", "").replace(",", ".").trim());
    const valorFinito = Number.isFinite(numero) ? numero : 0;

    return valorFinito
        .toFixed(2)
        .replace(/(\.\d*?[1-9])0+$|\.0+$/, "$1")
        .replace(".", ",");
}

export function formatarMoeda(valor) {
    const numero = typeof valor === "number"
        ? valor
        : Number.parseFloat(String(valor ?? "0").replace(",", ".").trim());
    const valorFinito = Number.isFinite(numero) ? numero : 0;

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valorFinito);
}
