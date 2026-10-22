import axios from "axios";

const apiUrlConfigurada = String(import.meta.env.VITE_API_URL || "").trim();
const apiBaseURL = apiUrlConfigurada || "/api/v1";

export const api = axios.create({
    baseURL: apiBaseURL,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    // No Vite, chamadas relativas vão para o próprio servidor de desenvolvimento.
    // Como ele não encaminha /api, avisamos da configuração ausente antes de gerar
    // um 404 enganoso da aplicação frontend. Em produção, o caminho relativo usa Nginx.
    if (import.meta.env.DEV && !apiUrlConfigurada) {
        const erro = new Error("A URL do backend não está configurada. Defina VITE_API_URL para conectar ao servidor.");
        erro.name = "ApiUrlNaoConfiguradaError";
        erro.isApiUnavailable = true;
        erro.config = config;
        return Promise.reject(erro);
    }
    return config;
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

    const params = response.config?.params;
    const requisicaoPaginada = params && (
        Object.prototype.hasOwnProperty.call(params, "page") ||
        Object.prototype.hasOwnProperty.call(params, "size")
    );

    // As telas com paginação server-side precisam do envelope completo do Spring
    // (content, totalPages e totalElements), enquanto os demais consumidores
    // continuam recebendo apenas o array de conteúdo.
    if (requisicaoPaginada && Array.isArray(dados?.content)) return response;

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
        const caminho = caminhoDaRequisicao(erro.config);
        if ([502, 503, 504].includes(erro.response?.status)) {
            erro.message = "O servidor está indisponível no momento. Verifique sua conexão e tente novamente.";
            erro.isApiUnavailable = true;
        }
        if (erro.response?.status === 401
            && caminho !== "/usuarios/login"
            && caminho !== "/auth/login"
            && typeof window !== "undefined"
            && window.location.pathname.replace(/\/+$/, "") !== "/login") {
            window.location.replace("/login");
        }


        if (!erro.response) {
            erro.message = "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
            erro.isApiUnavailable = true;
        }
        return Promise.reject(erro);
    }
);
