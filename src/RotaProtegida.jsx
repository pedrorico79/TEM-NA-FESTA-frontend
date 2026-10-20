import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { api } from "./services/api";
import LoadingState from "./components/shared/LoadingState";
import EstadoErro from "./components/shared/EstadoErro";

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
                const status = erro.response?.status;
                setEstado(status === 401 || status === 403 ? "nao-autenticado" : "erro");
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
                <EstadoErro titulo="Não foi possível carregar esta página" mensagem="Verifique se o servidor está disponível e tente novamente." onTentarNovamente={() => {
                    setEstado("carregando");
                    setTentativa((valor) => valor + 1);
                }} />
            </main>
        );
    }

    return <Outlet />;
}

export default RotaProtegida;
