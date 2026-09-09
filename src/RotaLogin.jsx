import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "./services/api";
import Login from "./components/pages/Login";

function RotaLogin() {
    const [carregando, setCarregando] = useState(true);
    const [autenticado, setAutenticado] = useState(false);

    useEffect(() => {
        async function verificarAutenticacao() {
            try {
                await api.get("/usuarios/me");

                setAutenticado(true);
            } catch (error) {
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
        return <Navigate to="/PaginaInicial" replace />;
    }

    return <Login />;
}

export default RotaLogin;