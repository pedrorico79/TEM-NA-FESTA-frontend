import "../../css/SwitchStatus.css";

function SwitchStatus({
  ativo,
  onClick,
  ariaLabel = ativo ? "Ativo" : "Inativo",
}) {

  return (
    <button
      className={`switch ${
        ativo ? "ativo" : ""
      }`}
      type="button"
      role="switch"
      aria-checked={ativo}
      aria-label={ariaLabel}
      title={ariaLabel}

      onClick={onClick}
    >
      <div className="switch-bolinha"></div>
    </button>
  );
}

export default SwitchStatus;
