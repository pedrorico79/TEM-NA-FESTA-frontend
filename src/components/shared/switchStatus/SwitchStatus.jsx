import "../../css/SwitchStatus.css";

function SwitchStatus({
  ativo,
  onClick,
}) {

  return (
    <button
      className={`switch ${
        ativo ? "ativo" : ""
      }`}

      onClick={onClick}
    >
      <div className="switch-bolinha"></div>
    </button>
  );
}

export default SwitchStatus;