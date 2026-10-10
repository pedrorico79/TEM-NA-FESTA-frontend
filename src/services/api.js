import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api/v1",
    withCredentials: true
});

function caminhoDaRequisicao(config) {
    return (config?.url || "")
        .split("?")[0]
        .replace(/^\/api\/v\d+/, "")
        .replace(/\/+$/, "") || "/";
}

function respostaVaziaParaLista(caminho) {
    if (ENDPOINTS_DE_LISTA.has(caminho)) return [];
    if (caminho === "/usuarios" || caminho === "/relatorios/produtos-mais-vendidos") {
        return { content: [], totalElements: 0, totalPages: 0, number: 0 };
    }
    if (/^\/relatorios\/eventos\/[^/]+\/evolucao$/.test(caminho)) {
        return { agrupamento: "NENHUM", dados: [] };
    }
    if (caminho === "/pedidos/count-by-status") return {};
    return null;
}

const ENDPOINTS_DE_LISTA = new Set([
    "/clientes",
    "/eventos",
    "/lembretes",
    "/pedidos",
    "/pedidos/proximas-retiradas",
    "/produtos",
    "/status",
    "/relatorios/pedidos-por-semana",
    "/relatorios/comparativo-eventos",
]);

function normalizarRespostaDeLista(response, caminho) {
    if (!ENDPOINTS_DE_LISTA.has(caminho)) return response;

    const dados = response.data;
    if (Array.isArray(dados)) return response;

    // Alguns endpoints podem devolver uma página do Spring, mesmo quando a tela
    // consome uma lista simples.
    if (Array.isArray(dados?.content)) {
        response.data = dados.content;
        return response;
    }

    if (dados == null) {
        response.data = [];
        return response;
    }

    const erro = new Error("Não foi possível carregar os pedidos.");
    erro.name = "ApiRespostaFormatoInvalidoError";
    erro.isApiUnavailable = true;
    erro.config = response.config;
    erro.response = response;
    return Promise.reject(erro);
}

api.interceptors.response.use(
    (response) => {
        const caminho = caminhoDaRequisicao(response.config);
        const metodo = (response.config?.method || "get").toLowerCase();
        if (response.status === 204) return response;

        if (metodo === "get" && ENDPOINTS_DE_LISTA.has(caminho)) {
            return normalizarRespostaDeLista(response, caminho);
        }

        if (response.data != null) return response;

        if (metodo === "get") {
            const respostaVazia = respostaVaziaParaLista(caminho);
            if (respostaVazia !== null) {
                response.data = respostaVazia;
                return response;
            }
        }

        const erro = new Error("O servidor retornou uma resposta vazia. Tente novamente em instantes.");
        erro.name = "ApiRespostaVaziaError";
        erro.isApiUnavailable = true;
        erro.config = response.config;
        erro.response = response;
        return Promise.reject(erro);
    },
    (erro) => {
        if (!erro.response) {
            erro.message = "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
            erro.isApiUnavailable = true;
        }
        return Promise.reject(erro);
    }
);
