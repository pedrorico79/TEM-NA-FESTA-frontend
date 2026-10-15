export function mensagemErroApi(erro, mensagemPadrao) {
    const dados = erro?.response?.data;
    const detalhes = dados?.detalhes;

    if (Array.isArray(detalhes) && detalhes.length) {
        return detalhes.filter(Boolean).join(" ");
    }
    if (typeof detalhes === "string" && detalhes.trim()) return detalhes;
    if (typeof dados?.message === "string" && dados.message.trim()) return dados.message;
    if (typeof dados?.erro === "string" && dados.erro.trim()) return dados.erro;
    if (erro?.isApiUnavailable && typeof erro.message === "string") return erro.message;

    return mensagemPadrao;
}
