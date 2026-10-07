import { useMemo, useState } from "react";

function CampoEnderecoPesquisavel({ label, name, value, onChange, options, placeholder, disabled = false, maxLength, helperText }) {
    const [aberto, setAberto] = useState(false);
    const [busca, setBusca] = useState("");
    const filtradas = useMemo(() => {
        const termo = (aberto ? busca : "").trim().toLocaleLowerCase("pt-BR");
        return options
            .filter((opcao) => opcao.nome.toLocaleLowerCase("pt-BR").includes(termo))
            .slice(0, 60);
    }, [options, aberto, busca]);

    function escolher(opcao) {
        onChange({ target: { name, value: opcao.valor } });
        setBusca("");
        setAberto(false);
    }

    const listaOpcoes = aberto && filtradas.length > 0 && (
        <div
            id={`cliente-endereco-opcoes-${name}`}
            className={`cliente-opcoes-endereco cliente-opcoes-localidade${name === "estado" ? " cliente-opcoes-uf" : ""}`}
            role="listbox"
        >
            {filtradas.map((opcao) => (
                <button
                    type="button"
                    role="option"
                    aria-selected={opcao.valor === value}
                    key={opcao.valor}
                    onPointerDown={(evento) => evento.preventDefault()}
                    onClick={() => escolher(opcao)}
                >
                    {opcao.nome}
                </button>
            ))}
        </div>
    );

    return (
        <div className="form-group cliente-select-pesquisavel">
            <label htmlFor={`cliente-endereco-${name}`}>{label}</label>
            <div className="cliente-select-input-wrap">
                <input
                    id={`cliente-endereco-${name}`}
                    type="text"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={aberto && filtradas.length > 0}
                    aria-haspopup="listbox"
                    aria-controls={`cliente-endereco-opcoes-${name}`}
                    autoComplete="off"
                    maxLength={maxLength}
                    value={aberto ? busca : value}
                    placeholder={placeholder}
                    disabled={disabled}
                    onFocus={() => { setBusca(""); setAberto(true); }}
                    onChange={(evento) => { setBusca(evento.target.value); setAberto(true); }}
                    onBlur={() => window.setTimeout(() => setAberto(false), 120)}
                    onKeyDown={(evento) => {
                        if (evento.key === "Escape") setAberto(false);
                        if (evento.key === "Enter" && filtradas.length > 0) {
                            evento.preventDefault();
                            escolher(filtradas[0]);
                        }
                    }}
                />
                <span className="cliente-select-seta" aria-hidden="true" />
                {name === "estado" && listaOpcoes}
            </div>
            {helperText && <small className="cliente-busca-status">{helperText}</small>}
            {name !== "estado" && listaOpcoes}
        </div>
    );
}

export default CampoEnderecoPesquisavel;
