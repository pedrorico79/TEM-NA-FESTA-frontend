import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api } from "./services/api";
import Login from "./components/pages/Login";

function RotaLogin() {
    const location = useLocation();
    const [carregando, setCarregando] = useState(true);
    const [autenticado, setAutenticado] = useState(false);

    useEffect(() => {
        async function verificarAutenticacao() {
            try {
                await api.get("/usuarios/me");

                setAutenticado(true);
            } catch{
                setAutenticado(false);
            } finally {
                setCarregando(false);
            }
        }

        verificarAutenticacao();
    }, []);

    if (carregando) {
        return null;
    }

    if (autenticado) {
        return <Navigate to={location.state?.from || "/pagina-inicial"} replace />;
    }

    return <Login destinoAposLogin={location.state?.from} />;
}

export default RotaLogin;
