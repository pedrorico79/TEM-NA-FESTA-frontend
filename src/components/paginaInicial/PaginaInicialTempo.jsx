function PaginaInicialTempo() {
  return (
    <div className="pedidos-header">
      <h2>Pedidos dos Próximos</h2>

      <select>
        <option>7 dias</option>
        <option>15 dias</option>
        <option>30 dias</option>
      </select>
    </div>
  );
}

export default PaginaInicialTempo;