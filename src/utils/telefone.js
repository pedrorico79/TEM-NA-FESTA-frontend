import { countries as countriesData, getEmojiFlag, languages as languagesData } from "countries-list";

function extrairNumerosTelefone(valor) {
  let numeros = String(valor ?? "").replace(/\D/g, "");

  if (numeros.startsWith("55") && (numeros.length === 12 || numeros.length === 13)) {
    numeros = numeros.slice(2);
  }

  return numeros;
}

const nomesRegiaoPt = typeof Intl.DisplayNames === "function"
  ? new Intl.DisplayNames(["pt-BR"], { type: "region" })
  : null;

export const paisesTelefone = Object.entries(countriesData)
  .filter(([, dados]) => dados.phone?.length)
  .map(([sigla, dados]) => ({
    sigla,
    nome: nomesRegiaoPt?.of(sigla) && nomesRegiaoPt.of(sigla) !== sigla
      ? nomesRegiaoPt.of(sigla)
      : dados.name,
    nomeOriginal: dados.name,
    nomeNativo: dados.native || dados.name,
    codigo: String(dados.phone[0]),
    bandeira: getEmojiFlag(sigla),
    idiomas: (dados.languages || []).map((idioma) => languagesData[idioma]?.native).filter(Boolean),
  }))
  .sort((a, b) => a.sigla === "BR" ? -1 : b.sigla === "BR" ? 1 : a.nome.localeCompare(b.nome, "pt-BR"));

const paisesPorSigla = new Map(paisesTelefone.map((pais) => [pais.sigla, pais]));

const regrasMascaraTelefone = {
  US: { grupos: [3, 3, 4], max: 10, prefixo: "(", separadores: ["", ") ", "-"] },
  CA: { grupos: [3, 3, 4], max: 10, prefixo: "(", separadores: ["", ") ", "-"] },
  GB: { grupos: [3, 4, 4], max: 11, separadores: ["", " ", " "] },
  FR: { grupos: [2, 2, 2, 2, 2], max: 10, separadores: ["", " ", " ", " ", " "] },
  DE: { grupos: [3, 4, 4], max: 11, separadores: ["", " ", " "] },
  ES: { grupos: [3, 2, 2, 2], max: 9, separadores: ["", " ", " ", " "] },
  PT: { grupos: [3, 3, 3], max: 9, separadores: ["", " ", " "] },
  IT: { grupos: [3, 3, 4], max: 10, separadores: ["", " ", " "] },
  IN: { grupos: [5, 5], max: 10, separadores: ["", " "] },
  JP: { grupos: [3, 4, 4], max: 11, separadores: ["", "-", "-"] },
  CN: { grupos: [3, 4, 4], max: 11, separadores: ["", " ", " "] },
  AU: { grupos: [4, 3, 3], max: 10, separadores: ["", " ", " "] },
  NZ: { grupos: [3, 3, 4], max: 10, separadores: ["", " ", " "] },
  MX: { grupos: [2, 4, 4], max: 10, separadores: ["", " ", " "] },
  AR: { grupos: [2, 4, 4], max: 10, separadores: ["", " ", " "] },
  CL: { grupos: [1, 4, 4], max: 9, separadores: ["", " ", " "] },
  RU: { grupos: [3, 3, 2, 2], max: 10, separadores: ["", " ", "-", "-"] },
  KZ: { grupos: [3, 3, 2, 2], max: 10, separadores: ["", " ", "-", "-"] },
  NL: { grupos: [2, 4, 4], max: 10, separadores: ["", " ", " "] },
  BE: { grupos: [3, 2, 2, 2], max: 9, separadores: ["", " ", " ", " "] },
  CH: { grupos: [2, 3, 2, 2], max: 9, separadores: ["", " ", " ", " "] },
  KR: { grupos: [3, 4, 4], max: 11, separadores: ["", "-", "-"] },
  SG: { grupos: [4, 4], max: 8, separadores: ["", " "] },
};

function mascararPorGrupos(valor, regra) {
  const digitos = String(valor ?? "").replace(/\D/g, "").slice(0, regra.max);
  if (!digitos) return "";

  let resultado = regra.prefixo || "";
  let indice = 0;
  regra.grupos.forEach((tamanho, grupo) => {
    if (indice >= digitos.length) return;
    if (grupo > 0 && indice < digitos.length) {
      resultado += regra.separadores[grupo] || " ";
    }
    resultado += digitos.slice(indice, indice + tamanho);
    indice += tamanho;
  });
  return resultado;
}

export function formatarTelefonePorPais(valor, paisSigla = "BR") {
  if (paisSigla === "BR") return aplicarMascaraTelefone(valor);
  const regra = regrasMascaraTelefone[paisSigla] || {
    grupos: [3, 3, 3, 3],
    max: 12,
    separadores: ["", " ", " ", " "],
  };
  return mascararPorGrupos(valor, regra);
}

export function separarTelefoneComCodigo(valor) {
  const numeros = String(valor ?? "").replace(/\D/g, "");
  if (!numeros) return { pais: "BR", codigo: "55", numero: "" };
  // Números E.164 dos EUA têm o código 1 mais 10 dígitos nacionais.
  if (numeros.startsWith("1") && numeros.length === 11) {
    return {
      pais: "US",
      codigo: "1",
      numero: numeros.slice(1),
    };
  }

  const codigosOrdenados = [...paisesTelefone]
    .filter((pais) => pais.sigla !== "CA")
    .sort((a, b) => b.codigo.length - a.codigo.length || a.sigla.localeCompare(b.sigla));
  const encontrado = codigosOrdenados.find(({ codigo }) =>
    numeros.startsWith(codigo)
      && (codigo === "55"
        ? numeros.length === 12 || numeros.length === 13
        : numeros.length - codigo.length >= 7 && numeros.length - codigo.length <= 12)
  );

  if (encontrado) {
    return { pais: encontrado.sigla, codigo: encontrado.codigo, numero: aplicarMascaraTelefone(numeros.slice(encontrado.codigo.length)) };
  }

  return { pais: "BR", codigo: "55", numero: aplicarMascaraTelefone(numeros) };
}

export function normalizarTelefoneParaApi(paisOuCodigo, valor) {
  const numero = String(valor ?? "").replace(/\D/g, "");
  const pais = paisesPorSigla.get(paisOuCodigo);
  const codigo = pais?.codigo || String(paisOuCodigo || "55").replace(/\D/g, "");
  return numero ? `${codigo}${numero}` : "";
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
  const texto = String(valor ?? "").trim();
  if (!texto) return "";

  const telefone = separarTelefoneComCodigo(texto);
  const numeroLocal = String(telefone.numero).replace(/\D/g, "");
  if (!numeroLocal) return texto;

  if (telefone.pais === "BR") {
    return `+${telefone.codigo} ${aplicarMascaraTelefone(numeroLocal)}`;
  }

  return `+${telefone.codigo} ${formatarTelefonePorPais(numeroLocal, telefone.pais)}`;
}

function agruparNumeroInternacional(numero) {
  if (numero.length <= 4) return numero;
  if (numero.length === 5) return `${numero.slice(0, 1)} ${numero.slice(1)}`;
  if (numero.length === 7) return `${numero.slice(0, 3)} ${numero.slice(3)}`;
  if (numero.length === 8) return `${numero.slice(0, 4)} ${numero.slice(4)}`;
  if (numero.length === 10) return `${numero.slice(0, 3)} ${numero.slice(3, 6)} ${numero.slice(6)}`;
  if (numero.length === 11) return `${numero.slice(0, 3)} ${numero.slice(3, 7)} ${numero.slice(7)}`;

  const grupos = [];
  for (let indice = 0; indice < numero.length; indice += 3) {
    grupos.push(numero.slice(indice, indice + 3));
  }
  return grupos.join(" ");
}
