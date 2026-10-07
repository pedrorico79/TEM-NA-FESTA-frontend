import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

function FiltroDropdown({ value, options, onChange, label }) {
  const [aberto, setAberto] = useState(false);
  const [posicao, setPosicao] = useState({ top: 0, left: 0, width: 0, maxHeight: 280 });
  const botaoRef = useRef(null);
  const menuRef = useRef(null);
  const id = useId().replace(/:/g, "");
  const opcaoSelecionada = options.find((opcao) => opcao.value === value);

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

    function fecharAoMover(event) {
      if (!menuRef.current?.contains(event.target)) setAberto(false);
    }

    function fecharAoRedimensionar() {
      setAberto(false);
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
    const altura = Math.min(options.length * 44 + 12, 280);
    const largura = Math.min(retangulo.width, window.innerWidth - 16);
    const left = Math.max(8, Math.min(retangulo.left, window.innerWidth - largura - 8));
    const top = retangulo.bottom + altura + 8 <= window.innerHeight
      ? retangulo.bottom + 6
      : Math.max(8, retangulo.top - altura - 6);

    setPosicao({ top, left, width: largura, maxHeight: Math.min(280, window.innerHeight - 16) });
    setAberto(true);
  }

  return (
    <>
      <button
        ref={botaoRef}
        type="button"
        className="filtro-dropdown"
        onClick={alternarMenu}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={id}
        aria-label={label}
      >
        <span>{opcaoSelecionada?.label ?? value}</span>
        <ion-icon name="chevron-down-outline"></ion-icon>
      </button>

      {aberto && createPortal(
        <div
          ref={menuRef}
          id={id}
          className="filtro-dropdown-menu"
          role="listbox"
          aria-label={label}
          style={{
            top: `${posicao.top}px`,
            left: `${posicao.left}px`,
            width: `${posicao.width}px`,
            maxHeight: `${posicao.maxHeight}px`
          }}
        >
          {options.map((opcao) => (
            <button
              key={opcao.value}
              type="button"
              role="option"
              aria-selected={value === opcao.value}
              className={value === opcao.value ? "selecionado" : ""}
              onClick={() => {
                onChange(opcao.value);
                setAberto(false);
              }}
            >
              {opcao.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

export default FiltroDropdown;
