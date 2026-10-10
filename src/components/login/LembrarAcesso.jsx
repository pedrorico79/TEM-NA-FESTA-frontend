function LembrarAcesso({ lembrarAcesso, setLembrarAcesso }) {
  return (
    <div className="lembrar-acesso-container">
      <label className="switch-login">
        <input
          type="checkbox"
          checked={lembrarAcesso}
          onChange={(e) => setLembrarAcesso(e.target.checked)}
        />
        <span className="switch-login-bolinha"></span>
      </label>

      <span>Lembrar acesso</span>
    </div>
  );
}

export default LembrarAcesso;
