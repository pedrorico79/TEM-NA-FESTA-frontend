function SwitchStatusProduto({
  ativo,
  onClick,
}) {

  return (
    <button
      className={`switch-produto ${
        ativo ? "ativo" : ""
      }`}

      onClick={onClick}
    >
      <div className="switch-bolinha"></div>
    </button>
  );
}

export default SwitchStatusProduto;