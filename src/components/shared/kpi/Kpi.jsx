import "../../css/Kpi.css";

function Kpi(props){
  const Container = props.onClick ? "button" : "div";

return (
    <Container
      type={props.onClick ? "button" : undefined}
      className={`kpi-card${props.onClick ? " kpi-card-clickable" : ""}`}
      onClick={props.onClick}
      aria-label={props.onClick ? `${props.title}: ${props.value}. Ver pedidos` : undefined}
    >
      <div className="kpi-icon" style={{ color: props.iconColor, background: props.iconBackground }}>
        <ion-icon name={props.icon}></ion-icon>
      </div>

      <h3>{props.title}</h3>

      <h2>{props.value}</h2>

      {props.description && <p>{props.description}</p>}
    </Container>
  );
}

export default Kpi
