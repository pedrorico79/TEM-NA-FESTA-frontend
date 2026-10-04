function extrairNumerosTelefone(valor) {
  let numeros = String(valor ?? "").replace(/\D/g, "");

  if (numeros.startsWith("55") && (numeros.length === 12 || numeros.length === 13)) {
    numeros = numeros.slice(2);
  }

  return numeros;
}

export function aplicarMascaraTelefone(valor) {
  const numeros = extrairNumerosTelefone(valor).slice(0, 11);

  if (!numeros) return "";
  if (numeros.length <= 2) return `(${numeros}`;

  const ddd = numeros.slice(0, 2);
  const telefone = numeros.slice(2);
  const tamanhoPrefixo = numeros.length > 10 ? 5 : 4;

  if (telefone.length <= tamanhoPrefixo) {
    return `(${ddd}) ${telefone}`;
  }

  return `(${ddd}) ${telefone.slice(0, tamanhoPrefixo)}-${telefone.slice(tamanhoPrefixo, tamanhoPrefixo + 4)}`;
}

export function formatarTelefone(valor) {
  const numeros = extrairNumerosTelefone(valor);

  if (numeros.length !== 10 && numeros.length !== 11) {
    return valor || "";
  }

  return aplicarMascaraTelefone(numeros);
}
