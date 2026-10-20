import "../css/EstadoErro.css";

export default function EstadoErro({ mensagem, titulo = "Não foi possível carregar os dados", onTentarNovamente }) {
    return (
        <section className="estado-erro-card" role="alert">
            <span className="estado-erro-icone" aria-hidden="true">
                <ion-icon name="alert-circle-outline"></ion-icon>
            </span>
            <div className="estado-erro-conteudo">
                <h2>{titulo}</h2>
                <p>{mensagem}</p>
            </div>
            {onTentarNovamente && (
                <button type="button" className="estado-erro-tentar" onClick={onTentarNovamente}>
                    Tentar novamente
                </button>
            )}
        </section>
    );
}
