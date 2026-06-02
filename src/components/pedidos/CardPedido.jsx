function CardPedido(props) {

    const pedido = props.pedido;

    const getStatusClass = () => {

        if (pedido.status === "NAO_INICIADO") {
            return "naoIniciado";
        }

        if (pedido.status === "EM_PRODUCAO") {
            return "producao";
        }

        if (pedido.status === "PRONTO") {
            return "pronto";
        }

        if (pedido.status === "ENTREGUE") {
            return "entregue";
        }

        if (pedido.status === "CANCELADO") {
            return "cancelado";
        }

        return "";
    };

    const getStatusText = () => {

        if (pedido.status === "NAO_INICIADO") {
            return "Não iniciado";
        }

        if (pedido.status === "EM_PRODUCAO") {
            return "Em Produção";
        }

        if (pedido.status === "PRONTO") {
            return "Pronto";
        }

        if (pedido.status === "ENTREGUE") {
            return "Entregue";
        }

        if (pedido.status === "CANCELADO") {
            return "Cancelado";
        }

        return pedido.status;
    };

    return (
        <div className="pedido-card">

            <div className="pedido-header">

                <span className="pedido-id">
                    {pedido.id}
                </span>

                <div className="pedido-top-right">

                    <span className="pedido-campanha">
                        {pedido.campanha}
                    </span>

                    <span className={`pedido-status ${getStatusClass()}`}>
                        {getStatusText()}
                    </span>

                    <ion-icon name="chevron-forward-outline"></ion-icon>

                </div>

            </div>

            <h3 className="pedido-cliente">
                {pedido.cliente}
            </h3>

            <div className="pedido-infos">

                <span>
                    <ion-icon name="archive-outline"></ion-icon>
                    {pedido.itens} itens
                </span>

                <span>
                    <ion-icon name="calendar-outline"></ion-icon>
                    {pedido.retirada}
                </span>

                <span>
                    <ion-icon name="time-outline"></ion-icon>
                    {pedido.restante}
                </span>

            </div>

            <div className="pedido-footer">

                <span>Total</span>

                <strong>{pedido.total}</strong>

            </div>

        </div>
    );
}

export default CardPedido;