import "../../css/Kpi.css";

function Kpi(props){

return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ color: props.iconColor, background: props.iconBackground }}>
        <ion-icon name={props.icon}></ion-icon>
      </div>

      <h3>{props.title}</h3>

      <h2>{props.value}</h2>

      {props.description && <p>{props.description}</p>}
    </div>
  );
}

export default Kpi