import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../css/CampoTelefone.css";
import { paisesTelefone } from "../../utils/telefone";

function CampoTelefone({ label, name, value, pais = "BR", onChange, onPaisChange }) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [posicao, setPosicao] = useState(null);
  const campoRef = useRef(null);
  const botaoRef = useRef(null);
  const menuRef = useRef(null);
  const paisSelecionado = paisesTelefone.find((item) => item.sigla === pais) || paisesTelefone[0];

  const paisesFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase();
    if (!termo) return paisesTelefone;
    return paisesTelefone.filter((item) =>
      `${item.nome} ${item.nomeNativo} ${item.nomeOriginal} ${item.sigla} +${item.codigo} ${item.idiomas.join(" ")}`
        .toLocaleLowerCase()
        .includes(termo)
    );
  }, [busca]);

  useEffect(() => {
    if (!aberto) return undefined;

    function fecharFora(event) {
      if (!campoRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) {
        setAberto(false);
      }
    }

    function fecharEscape(event) {
      if (event.key === "Escape") setAberto(false);
    }

    function fecharAoMover(event) {
      if (!menuRef.current?.contains(event.target)) setAberto(false);
    }

    function atualizarPosicao() {
      const retangulo = botaoRef.current?.getBoundingClientRect();
      if (!retangulo) return;
      const alturaMaxima = Math.min(320, window.innerHeight - 24);
      const abrirAbaixo = retangulo.bottom + alturaMaxima + 6 <= window.innerHeight;
      const largura = Math.min(Math.max(retangulo.width, 300), window.innerWidth - 16);
      setPosicao({
        left: Math.max(8, Math.min(retangulo.left, window.innerWidth - largura - 8)),
        width: largura,
        top: abrirAbaixo ? retangulo.bottom + 6 : Math.max(8, retangulo.top - alturaMaxima - 6),
        maxHeight: alturaMaxima,
      });
    }

    atualizarPosicao();
    document.addEventListener("pointerdown", fecharFora);
    document.addEventListener("keydown", fecharEscape);
    document.addEventListener("scroll", fecharAoMover, true);
    window.addEventListener("resize", atualizarPosicao);

    return () => {
      document.removeEventListener("pointerdown", fecharFora);
      document.removeEventListener("keydown", fecharEscape);
      document.removeEventListener("scroll", fecharAoMover, true);
      window.removeEventListener("resize", atualizarPosicao);
    };
  }, [aberto]);

  function alternarMenu() {
    if (aberto) {
      setAberto(false);
      return;
    }
    const retangulo = botaoRef.current?.getBoundingClientRect();
    if (!retangulo) return;
    const alturaMaxima = Math.min(320, window.innerHeight - 24);
    const abrirAbaixo = retangulo.bottom + alturaMaxima + 6 <= window.innerHeight;
    const largura = Math.min(Math.max(retangulo.width, 300), window.innerWidth - 16);
    setPosicao({
      left: Math.max(8, Math.min(retangulo.left, window.innerWidth - largura - 8)),
      width: largura,
      top: abrirAbaixo ? retangulo.bottom + 6 : Math.max(8, retangulo.top - alturaMaxima - 6),
      maxHeight: alturaMaxima,
    });
    setBusca("");
    setAberto(true);
  }

  return (
    <div className="form-group">
      <label htmlFor={`cliente-${name}`}>{label}</label>
      <div className="cliente-telefone-field" ref={campoRef}>
        <button
          ref={botaoRef}
          type="button"
          className="cliente-telefone-pais"
          aria-label={`País do código telefônico de ${label.toLowerCase()}: ${paisSelecionado.nome} (+${paisSelecionado.codigo})`}
          aria-haspopup="listbox"
          aria-expanded={aberto}
          onClick={alternarMenu}
        >
          <span>{paisSelecionado.bandeira}</span>
          <span>+{paisSelecionado.codigo}</span>
          <ion-icon name="chevron-down-outline" aria-hidden="true"></ion-icon>
        </button>
        <input
          id={`cliente-${name}`}
          type="tel"
          inputMode="tel"
          name={name}
          value={value}
          onChange={onChange}
          aria-label={label}
        />
      </div>

      {aberto && posicao && createPortal(
        <div
          ref={menuRef}
          className="cliente-telefone-paises-menu"
          role="listbox"
          aria-label={`Selecionar país para ${label.toLowerCase()}`}
          style={{ top: posicao.top, left: posicao.left, width: posicao.width, maxHeight: posicao.maxHeight }}
        >
          <div className="cliente-telefone-paises-busca">
            <ion-icon name="search-outline" aria-hidden="true"></ion-icon>
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar país ou código"
              aria-label="Buscar país ou código telefônico"
              autoFocus
            />
          </div>
          <div className="cliente-telefone-paises-lista">
            {paisesFiltrados.map((item) => (
              <button
                key={item.sigla}
                type="button"
                role="option"
                aria-selected={item.sigla === pais}
                className={item.sigla === pais ? "selecionado" : ""}
                onClick={() => {
                  onPaisChange(name, item.sigla);
                  setAberto(false);
                }}
              >
                <span className="cliente-telefone-bandeira">{item.bandeira}</span>
                <span className="cliente-telefone-nomes">
                  <span>{item.nome}</span>
                  <span>({item.nomeNativo})</span>
                </span>
                <span className="cliente-telefone-codigo">+{item.codigo}</span>
              </button>
            ))}
            {paisesFiltrados.length === 0 && <p className="cliente-telefone-sem-paises">Nenhum país encontrado.</p>}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default CampoTelefone;
