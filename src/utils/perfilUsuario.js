export function nomePerfilUsuario(perfil) {
    const valor = typeof perfil === "string"
        ? perfil
        : perfil?.nome || perfil?.descricao || "";
    const normalizado = String(valor).replace(/^ROLE_/, "").trim().toUpperCase();

    if (normalizado === "ADMIN" || normalizado === "ADMINISTRADOR") return "Administrador";
    if (normalizado === "CLIENTE") return "Cliente";
    if (!valor) return "-";

    return String(valor).charAt(0).toUpperCase() + String(valor).slice(1).toLowerCase();
}

export function dataCriacaoUsuario(data) {
    if (!data) return "-";
    const dataObj = new Date(data);
    return Number.isNaN(dataObj.getTime()) ? "-" : dataObj.toLocaleDateString("pt-BR");
}
