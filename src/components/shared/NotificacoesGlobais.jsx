import { useEffect, useRef, useState } from "react";
import { EVENTO_NOTIFICACAO } from "../../utils/notificacoes";
import "../css/NotificacoesGlobais.css";

export default function NotificacoesGlobais() {
    const [notificacao, setNotificacao] = useState(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        function receberNotificacao(evento) {
            window.clearTimeout(timeoutRef.current);
            const nova = { ...evento.detail, id: Date.now() };
            setNotificacao(nova);
            timeoutRef.current = window.setTimeout(() => setNotificacao(null), nova.duracao || 5000);
        }

        window.addEventListener(EVENTO_NOTIFICACAO, receberNotificacao);
        return () => {
            window.removeEventListener(EVENTO_NOTIFICACAO, receberNotificacao);
            window.clearTimeout(timeoutRef.current);
        };
    }, []);

    if (!notificacao) return null;

    return (
        <div
            key={notificacao.id}
            className={`notificacao-global ${notificacao.tipo === "sucesso" ? "sucesso" : "erro"}`}
            role={notificacao.tipo === "sucesso" ? "status" : "alert"}
            aria-live={notificacao.tipo === "sucesso" ? "polite" : "assertive"}
        >
            <span>{notificacao.mensagem}</span>
            <button type="button" aria-label="Fechar aviso" onClick={() => {
                window.clearTimeout(timeoutRef.current);
                setNotificacao(null);
            }}>×</button>
        </div>
    );
}
