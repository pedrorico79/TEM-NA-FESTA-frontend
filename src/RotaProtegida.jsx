import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { api } from "./services/api";
import LoadingState from "./components/shared/LoadingState";

function RotaProtegida() {
    const [estado, setEstado] = useState("carregando");
    const [tentativa, setTentativa] = useState(0);
    const [mensagemErro, setMensagemErro] = useState("");
    const location = useLocation();

    useEffect(() => {
        let ativo = true;

        api.get("/usuarios/me")
            .then(() => {
                if (ativo) setEstado("autenticado");
            })
            .catch((erro) => {
                if (!ativo) return;
                const status = erro.response?.status;
                if (status === 401 || status === 403) {
                    setEstado("nao-autenticado");
                    return;
                }
                setMensagemErro(erro.message || "Verifique se o servidor está disponível e tente novamente.");
                setEstado("erro");
            });

        return () => { ativo = false; };
    }, [tentativa]);

    if (estado === "carregando") {
        return <LoadingState label="Verificando acesso…" />;
    }

    if (estado === "nao-autenticado") {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (estado === "erro") {
        return (
            <main className="api-estado">
                <h1>Não foi possível carregar esta página</h1>
                <p>{mensagemErro || "Verifique se o servidor está disponível e tente novamente."}</p>
                <button type="button" onClick={() => {
                    setEstado("carregando");
                    setMensagemErro("");
                    setTentativa((valor) => valor + 1);
                }}>
                    Tentar novamente
                </button>
            </main>
        );
    }

    return <Outlet />;
}

export default RotaProtegida;
