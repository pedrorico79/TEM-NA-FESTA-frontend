export function aplicarMascaraCep(valor) {
  const numeros = String(valor ?? "").replace(/\D/g, "").slice(0, 8);

  if (numeros.length <= 5) return numeros;

  return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
}

export function normalizarCep(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}
