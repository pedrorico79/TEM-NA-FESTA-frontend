function Paginacao({
    paginaAtual,
    totalPaginas,
    onAnterior,
    onProximo
}) {

    return (
        <div className="paginacao">

            <button
                disabled={paginaAtual === 1}
                onClick={onAnterior}
            >
                <ion-icon name="chevron-back-outline"></ion-icon>
            </button>

            <span>
                Página {paginaAtual} de {totalPaginas}
            </span>

            <button
                disabled={paginaAtual === totalPaginas}
                onClick={onProximo}
            >
                <ion-icon name="chevron-forward-outline"></ion-icon>
            </button>

        </div>
    );
}

export default Paginacao;