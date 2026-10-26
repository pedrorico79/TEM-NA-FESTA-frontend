import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

function FiltroStatusPedidos({ valores = [], opcoes, onChange, label = "Filtrar por status" }) {
  const [aberto, setAberto] = useState(false);
  const [posicao, setPosicao] = useState({ top: 0, left: 0, width: 0, maxHeight: 280 });
  const botaoRef = useRef(null);
  const menuRef = useRef(null);
  const id = useId().replace(/:/g, "");
  const selecionados = new Set(valores);
  const opcoesSelecionadas = opcoes.filter((opcao) => selecionados.has(opcao.value));
  const textoSelecionado = opcoesSelecionadas.length === 0
    ? "Todos os status"
    : opcoesSelecionadas.length === 1
      ? opcoesSelecionadas[0].label
      : `${opcoesSelecionadas.length} filtros selecionados`;

  useEffect(() => {
    if (!aberto) return undefined;

    function fecharFora(event) {
      if (!botaoRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) {
        setAberto(false);
      }
    }

    function fecharEscape(event) {
      if (event.key === "Escape") setAberto(false);
    }

    function fecharAoRedimensionar() {
      setAberto(false);
    }

    function fecharAoMover(event) {
      if (!menuRef.current?.contains(event.target)) setAberto(false);
    }

    document.addEventListener("pointerdown", fecharFora);
    document.addEventListener("keydown", fecharEscape);
    document.addEventListener("scroll", fecharAoMover, true);
    window.addEventListener("resize", fecharAoRedimensionar);
    return () => {
      document.removeEventListener("pointerdown", fecharFora);
      document.removeEventListener("keydown", fecharEscape);
      document.removeEventListener("scroll", fecharAoMover, true);
      window.removeEventListener("resize", fecharAoRedimensionar);
    };
  }, [aberto]);

  function alternarMenu() {
    if (aberto) {
      setAberto(false);
      return;
    }

    const botao = botaoRef.current;
    if (!botao) return;

    const retangulo = botao.getBoundingClientRect();
    const altura = Math.min(opcoes.length * 44 + 12, 320);
    const largura = Math.min(Math.max(retangulo.width, 260), window.innerWidth - 16);
    const left = Math.max(8, Math.min(retangulo.left, window.innerWidth - largura - 8));
    const top = retangulo.bottom + altura + 8 <= window.innerHeight
      ? retangulo.bottom + 6
      : Math.max(8, retangulo.top - altura - 6);

    setPosicao({ top, left, width: largura, maxHeight: Math.min(320, window.innerHeight - 16) });
    setAberto(true);
  }

  function alternarOpcao(valor) {
    if (valor === "TODOS") {
      onChange([]);
      return;
    }

    onChange(selecionados.has(valor)
      ? valores.filter((atual) => atual !== valor)
      : [...valores, valor]);
  }

  return (
    <>
      <button
        ref={botaoRef}
        type="button"
        className="filtro-dropdown filtro-status-dropdown filtro-status-multiplo"
        onClick={alternarMenu}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={id}
      >
        <span>{textoSelecionado}</span>
        <ion-icon name="chevron-down-outline"></ion-icon>
      </button>

      {aberto && createPortal(
        <div
          ref={menuRef}
          id={id}
          className="filtro-dropdown-menu filtro-status-multiplo-menu"
          role="listbox"
          aria-label={label}
          aria-multiselectable="true"
          style={{
            top: `${posicao.top}px`,
            left: `${posicao.left}px`,
            width: `${posicao.width}px`,
            maxHeight: `${posicao.maxHeight}px`,
          }}
        >
          {opcoes.map((opcao) => {
            const marcado = opcao.value === "TODOS"
              ? valores.length === 0
              : selecionados.has(opcao.value);
            return (
              <button
                key={opcao.value}
                type="button"
                role="option"
                aria-selected={opcao.value === "TODOS" ? valores.length === 0 : marcado}
                className={marcado ? "selecionado" : ""}
                onClick={() => alternarOpcao(opcao.value)}
              >
                <span className={`filtro-status-multiplo-check ${marcado ? "marcado" : ""}`} aria-hidden="true">
                  {marcado && <ion-icon name="checkmark-outline"></ion-icon>}
                </span>
                <span>{opcao.label}</span>
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}

export default FiltroStatusPedidos;
