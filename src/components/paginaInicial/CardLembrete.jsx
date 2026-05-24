import ItemCardLembrete from "./ItemCardLembrete";

function CardLembrete() {

  const reminders = [
    {
      text: "Comprar pote tamanho M",
      date: "Até dia 17/04",
    },

    {
      text: "Separar embalagens",
      date: "Até dia 20/04",
    },
  ];

  return (
    <div className="lembretes-card">
      <h2>Lembretes</h2>

      <div className="lista-lembretes">
        {reminders.map((reminder, index) => (
          <ItemCardLembrete key={index} texto={reminder.text} data={reminder.date}/>
        ))}
      </div>
    </div>
  );
}

export default CardLembrete;