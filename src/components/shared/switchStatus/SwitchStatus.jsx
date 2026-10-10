import "../../css/SwitchStatus.css";

function SwitchStatus({
  ativo,
  onClick,
  ariaLabel = ativo ? "Ativo" : "Inativo",
  disabled = false,
}) {

  return (
    <button
      className={`switch-status ${
        ativo ? "ativo" : ""
      }`}
      type="button"
      role="switch"
      aria-checked={ativo}
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled}

      onClick={onClick}
    >
      <div className="switch-status-bolinha"></div>
    </button>
  );
}

export default SwitchStatus;
