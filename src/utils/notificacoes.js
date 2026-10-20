const EVENTO_NOTIFICACAO = "app:notificacao";

export function notificar(mensagem, tipo = "erro", duracao = 5000) {
    if (!mensagem || typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(EVENTO_NOTIFICACAO, {
        detail: { mensagem: String(mensagem), tipo, duracao }
    }));
}

export { EVENTO_NOTIFICACAO };
