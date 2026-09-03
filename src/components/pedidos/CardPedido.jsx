import { useNavigate } from "react-router-dom";

function CardPedido({ pedido }) {

    const navigate = useNavigate();

    const getStatusClass = () => {
        if (pedido.status === "RASCUNHO") return "rascunho";
        if (pedido.status === "EM_PRODUCAO") return "producao";
        if (pedido.status === "PRONTO_PARA_ENTREGA") return "pronto";
        if (pedido.status === "ENTREGUE") return "entregue";
        if (pedido.status === "CANCELADO") return "cancelado";
        if (pedido.status === "AGUARDANDO_SINAL") return "aguardandoSinal";
        if (pedido.status === "CONFIRMADO") return "confirmado";

        return "";
    };

    const getStatusText = () => {
        if (pedido.status === "RASCUNHO") return "Rascunho";
        if (pedido.status === "EM_PRODUCAO") return "Em Produção";
        if (pedido.status === "PRONTO_PARA_ENTREGA") return "Pronto";
        if (pedido.status === "ENTREGUE") return "Entregue";
        if (pedido.status === "CANCELADO") return "Cancelado";
        if (pedido.status === "AGUARDANDO_SINAL") return "Aguardando Sinal";
        if (pedido.status === "CONFIRMADO") return "Confirmado";

        return pedido.status;
    };

    const isDesativado =
        pedido.status === "ENTREGUE" ||
        pedido.status === "CANCELADO";

    function handleClick() {
        navigate(`/DetalhesPedido/${encodeURIComponent(pedido.id)}`);
    }

    return (
        <div
            className={`pedido-card ${isDesativado ? "desativado" : ""}`}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    handleClick();
                }
            }}
        >
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

                <strong>
                    {pedido.total}
                </strong>

            </div>

        </div>
    );
}

export default CardPedido;