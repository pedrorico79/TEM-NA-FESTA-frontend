import ItemCardAlerta from "./ItemCardAlerta";

function CardAlerta() {

  const alerts = [
    {
      icon: "alert-circle-outline",
      message:
        "1 Pedido Próximo Aguardando Confirmação",
    },

    {
      icon: "time-outline",
      message:
        "2 Pedidos atrasados para preparo",
    },
  ];

  return (
    <div className="alertas-card">
      <h2>Alertas</h2>

      <div className="lista-alertas">
        {alerts.map((alert, index) => (
          <ItemCardAlerta key={index} icone={alert.icon} mensagem={alert.message}/>
        ))}
      </div>
    </div>
  );
}

export default CardAlerta;