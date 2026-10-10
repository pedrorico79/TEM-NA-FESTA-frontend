import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { api } from "./services/api";
import LoadingState from "./components/shared/LoadingState";

function RotaProtegida() {
    const [estado, setEstado] = useState("carregando");
    const [tentativa, setTentativa] = useState(0);
    const location = useLocation();

    useEffect(() => {
        let ativo = true;

        api.get("/usuarios/me")
            .then(() => {
                if (ativo) setEstado("autenticado");
            })
            .catch((erro) => {
                if (!ativo) return;
                setEstado(erro.response?.status === 401 ? "nao-autenticado" : "erro");
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
            <main className="api-estado" role="alert">
                <h1>Não foi possível carregar esta página</h1>
                <p>Verifique se o servidor está disponível e tente novamente.</p>
                <button type="button" onClick={() => {
                    setEstado("carregando");
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
