import { useState } from "react";
import { useNavigate } from "react-router-dom";

function TelaAutenticacaoSenha({
    onSucesso,
    titulo = "Acesso Restrito",
    subtitulo = "Esta área contém dados sensíveis. Confirme sua senha de administrador para liberar o acesso.",
    textoBotao = "Confirmar Acesso",
}) {
    const navigate = useNavigate();

    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);

    function mensagemDoErro(err) {
        const status = err.response?.status;
        if (status === 400 || status === 401) return "Senha incorreta. Confira e tente novamente.";
        if (status === 403) return "Seu usuário não tem permissão para acessar esta área.";
        if (!err.response) {
            if (err.isApiUnavailable) return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
            return err.message || "Não foi possível confirmar o acesso. Tente novamente.";
        }
        if (status >= 500) return "O servidor está indisponível no momento. Tente novamente em instantes.";

        const mensagemApi = err.response.data?.message;
        if (typeof mensagemApi === "string" && mensagemApi.trim()) return mensagemApi;
        if (typeof err.message === "string" && err.message.trim()) return err.message;
        return "Não foi possível confirmar o acesso. Tente novamente.";
    }

    function handleSubmit(e) {
        e.preventDefault();

        setErro("");

        if (!senha.trim()) {
            setErro("A senha é obrigatória.");
            return;
        }

        setCarregando(true);

        onSucesso(senha)
            .catch((err) => {
                console.error(err);
                setErro(mensagemDoErro(err));
            })
            .finally(() => {
                setCarregando(false);
            });
    }

    return (
        <div className="autenticacao-container-rosa">

            <div className="autenticacao-conteudo">

                <div className="autenticacao-logo">
                    <svg
                        viewBox="0 0 100 100"
                        className="icone-acesso-restrito"
                        aria-hidden="true"
                    >
                        <path
                            d="M50 8 L82 20 V45 C82 66 68 82 50 92 C32 82 18 66 18 45 V20 Z"
                            fill="none"
                            stroke="white"
                            strokeWidth="5"
                            strokeLinejoin="round"
                        />

                        <text
                            x="49"
                            y="61"
                            textAnchor="middle"
                            fill="white"
                            fontSize="42"
                            fontWeight="600"
                            fontFamily="Inter, sans-serif"
                        >
                            S
                        </text>

                        <path
                            d="M67 48 C77 48 84 56 84 66"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />

                        <path
                            d="M64 54 C73 52 80 59 80 68"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />

                        <path
                            d="M63 60 C69 58 75 63 75 70"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />

                        <path
                            d="M64 66 C67 65 70 67 70 71"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <h1>{titulo}</h1>

                <p className="autenticacao-subtitulo">
                    {subtitulo}
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="autenticacao-form"
                >
                    <div className="form-group">

                        <label htmlFor="senha">
                            Sua Senha *
                        </label>

                        <div className="senha-input-wrapper">

                            <input
                                id="senha"
                                type={mostrarSenha ? "text" : "password"}
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                placeholder="Digite sua senha para continuar"
                                autoFocus
                            />

                            <button
                                type="button"
                                className="botao-mostrar-senha"
                                onClick={() =>
                                    setMostrarSenha(!mostrarSenha)
                                }
                                aria-label={
                                    mostrarSenha
                                        ? "Ocultar senha"
                                        : "Mostrar senha"
                                }
                            >
                                {mostrarSenha ? (
                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="3"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M3 3l18 18"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M10.6 6.2A9.8 9.8 0 0 1 12 6c6.5 0 10 6 10 6a18.4 18.4 0 0 1-3.2 3.9"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M6.6 6.6C3.7 8.3 2 12 2 12s3.5 6 10 6c1.7 0 3.2-.4 4.5-1"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </button>

                        </div>

                        {erro && (
                            <span className="erro-texto">
                                {erro}
                            </span>
                        )}

                    </div>

                    <div className="autenticacao-acoes">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => navigate(-1)}
                        >
                            Voltar
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={carregando}
                        >
                            {carregando
                                ? "Validando..."
                                : textoBotao}
                        </button>

                    </div>
                </form>

            </div>
        </div>
    );
}

export default TelaAutenticacaoSenha;
