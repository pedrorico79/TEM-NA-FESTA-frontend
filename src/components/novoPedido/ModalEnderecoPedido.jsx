import { useEffect, useRef, useState } from "react";
import Modal from "../shared/modal/Modal";
import { aplicarMascaraCep, normalizarCep } from "../../utils/cep";

function enderecoCliente(cliente) {
  const endereco = cliente?.endereco || {};
  return {
    cep: aplicarMascaraCep(endereco.cep || ""),
    logradouro: endereco.logradouro || endereco.rua || "",
    numero: endereco.numero || "",
    complemento: endereco.complemento || "",
    bairro: endereco.bairro || "",
    cidade: endereco.cidade || "",
    estado: String(endereco.estado || "").toUpperCase().slice(0, 2),
  };
}

function enderecoCompleto(endereco) {
  return Boolean(
    normalizarCep(endereco.cep).length === 8 &&
    endereco.logradouro.trim() &&
    endereco.numero.trim() &&
    endereco.bairro.trim() &&
    endereco.cidade.trim() &&
    endereco.estado.trim().length === 2
  );
}

function ModalEnderecoPedido({ open, cliente, onClose, onConfirm }) {
  const [etapa, setEtapa] = useState("escolha");
  const [enderecoClienteAtual, setEnderecoClienteAtual] = useState(enderecoCliente(null));
  const [form, setForm] = useState(enderecoCliente(null));
  const [erro, setErro] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [sugestoes, setSugestoes] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const buscaId = useRef(0);
  const timerBusca = useRef(null);

  const temEnderecoCliente = enderecoCompleto(enderecoCliente(cliente));

  useEffect(() => {
    if (!open) return;
    const endereco = enderecoCliente(cliente);
    setEnderecoClienteAtual(endereco);
    setForm(enderecoCliente(null));
    setEtapa(enderecoCompleto(endereco) ? "escolha" : "formulario");
    setErro("");
    setSugestoes([]);
    setSalvando(false);
  }, [open, cliente]);

  useEffect(() => () => window.clearTimeout(timerBusca.current), []);

  function limparBuscaRua() {
    window.clearTimeout(timerBusca.current);
    buscaId.current += 1;
    setSugestoes([]);
  }

  async function buscarCep(cep) {
    const cepNumerico = normalizarCep(cep);
    if (cepNumerico.length !== 8) return;
    const id = ++buscaId.current;
    setBuscandoCep(true);
    setErro("");
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cepNumerico}/json/`);
      if (!resposta.ok) throw new Error("Falha ao consultar CEP");
      const dados = await resposta.json();
      if (id !== buscaId.current) return;
      if (dados.erro) {
        setErro("CEP não encontrado. Você pode preencher o endereço manualmente.");
        return;
      }
      setForm((atual) => ({
        ...atual,
        cep: aplicarMascaraCep(cepNumerico),
        logradouro: dados.logradouro || atual.logradouro,
        bairro: dados.bairro || atual.bairro,
        cidade: dados.localidade || atual.cidade,
        estado: dados.uf || atual.estado,
      }));
      setSugestoes([]);
    } catch {
      if (id === buscaId.current) setErro("Não foi possível consultar o CEP. Preencha o endereço manualmente.");
    } finally {
      if (id === buscaId.current) setBuscandoCep(false);
    }
  }

  function alterar(event) {
    const { name, value } = event.target;
    const atualizado = name === "cep"
      ? aplicarMascaraCep(value)
      : name === "estado"
        ? value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2)
        : value;

    setForm((atual) => ({ ...atual, [name]: atualizado }));
    setErro("");

    if (name === "cep") {
      limparBuscaRua();
      if (normalizarCep(atualizado).length === 8) buscarCep(atualizado);
    } else if (name === "logradouro" || name === "estado") {
      limparBuscaRua();
      const logradouro = name === "logradouro" ? atualizado : form.logradouro;
      const estado = name === "estado" ? atualizado : form.estado;
      if (logradouro.trim().length >= 3) {
        timerBusca.current = window.setTimeout(() => buscarLogradouro(logradouro, estado), 350);
      }
    }
  }

  async function buscarLogradouro(logradouro, estado) {
    const id = ++buscaId.current;
    const uf = estado.trim().toUpperCase() || "SP";
    try {
      const query = new URLSearchParams({ q: logradouro.trim(), state: uf, limit: "10" });
      const resposta = await fetch(`https://cep.awesomeapi.com.br/search?${query}`);
      if (!resposta.ok) return;
      const dados = await resposta.json();
      const resultados = (Array.isArray(dados) ? dados : dados.results || dados.data || [])
        .map((item) => ({
          cep: item.cep || "",
          logradouro: item.address || "",
          bairro: item.district || "",
          cidade: item.city || "",
          estado: item.state || uf,
        }))
        .filter((item) => item.logradouro && item.estado === uf);
      if (id === buscaId.current) setSugestoes(resultados.slice(0, 10));
    } catch {
      if (id === buscaId.current) setSugestoes([]);
    }
  }

  function selecionarSugestao(sugestao) {
    setForm((atual) => ({
      ...atual,
      cep: aplicarMascaraCep(sugestao.cep || atual.cep),
      logradouro: sugestao.logradouro,
      bairro: sugestao.bairro || atual.bairro,
      cidade: sugestao.cidade || atual.cidade,
      estado: sugestao.estado || atual.estado,
    }));
    setSugestoes([]);
  }

  async function confirmar(endereco) {
    setSalvando(true);
    setErro("");
    try {
      await onConfirm({
        cep: normalizarCep(endereco.cep),
        logradouro: endereco.logradouro.trim(),
        numero: endereco.numero.trim(),
        complemento: endereco.complemento.trim(),
        bairro: endereco.bairro.trim(),
        cidade: endereco.cidade.trim(),
        estado: endereco.estado.trim().toUpperCase(),
      });
      onClose();
    } catch (error) {
      setErro(error.message || "Não foi possível criar o pedido.");
    } finally {
      setSalvando(false);
    }
  }

  function submeterEndereco(event) {
    event.preventDefault();
    if (!enderecoCompleto(form)) {
      setErro("Preencha CEP, logradouro, número, bairro, cidade e UF para usar outro endereço.");
      return;
    }
    confirmar(form);
  }

  return (
    <Modal
      open={open}
      onClose={salvando ? () => {} : onClose}
      title="Endereço de entrega"
    >
      {etapa === "escolha" && temEnderecoCliente ? (
        <div className="novo-pedido-endereco-escolha">
          <p>O endereço de entrega será o mesmo do cliente?</p>
          <div className="novo-pedido-endereco-atual">
            <h3>{cliente?.nome}</h3>
            <div className="novo-pedido-endereco-atual-grid">
              {[
                ["Logradouro", enderecoClienteAtual.logradouro, "linha-cheia"],
                ["Número", enderecoClienteAtual.numero],
                ["Complemento", enderecoClienteAtual.complemento || "Não informado"],
                ["Bairro", enderecoClienteAtual.bairro],
                ["Cidade", enderecoClienteAtual.cidade],
                ["Estado", enderecoClienteAtual.estado],
                ["CEP", enderecoClienteAtual.cep],
              ].map(([label, valor, variante]) => (
                <div className={`novo-pedido-endereco-atual-campo ${variante || ""}`} key={label}>
                  <span>{label}</span>
                  <strong>{valor}</strong>
                </div>
              ))}
            </div>
          </div>
          {erro && <p className="novo-pedido-erro" role="alert">{erro}</p>}
          <div className="modal-actions novo-pedido-endereco-escolha-acoes">
            <button type="button" className="secondary-button" onClick={() => {
              setErro("");
              setEtapa("formulario");
            }} disabled={salvando}>
              Informar outro endereço
            </button>
            <button type="button" className="primary-button" onClick={() => confirmar(enderecoClienteAtual)} disabled={salvando}>
              {salvando ? "Salvando…" : "Usar endereço do cliente"}
            </button>
          </div>
        </div>
      ) : (
        <form className="novo-pedido-endereco-form" onSubmit={submeterEndereco}>
          <p className="novo-pedido-endereco-ajuda">
            {temEnderecoCliente
              ? "Informe o endereço específico deste pedido. Ele não altera o cadastro do cliente."
              : "Este cliente não tem um endereço completo cadastrado. Informe o endereço de entrega do pedido."}
          </p>
          <div className="form-grid novo-pedido-endereco-grid">
            <div className="form-group">
              <label htmlFor="novo-pedido-estado">Estado (UF)</label>
              <input id="novo-pedido-estado" name="estado" value={form.estado} onChange={alterar} maxLength="2" placeholder="SP" required />
              <small>Sem UF informada, a busca do logradouro usa SP.</small>
            </div>
            <div className="form-group">
              <label htmlFor="novo-pedido-cep">CEP</label>
              <input id="novo-pedido-cep" name="cep" value={form.cep} onChange={alterar} inputMode="numeric" autoComplete="postal-code" maxLength="9" placeholder="00000-000" required />
              {buscandoCep && <small>Buscando endereço…</small>}
            </div>
            <div className="form-group novo-pedido-endereco-linha-cheia">
              <label htmlFor="novo-pedido-logradouro">Logradouro</label>
              <div className="novo-pedido-logradouro-wrap cliente-logradouro-busca">
                <input id="novo-pedido-logradouro" name="logradouro" value={form.logradouro} onChange={alterar} autoComplete="address-line1" maxLength="150" required />
                {sugestoes.length > 0 && (
                  <div className="novo-pedido-endereco-sugestoes cliente-opcoes-endereco" role="listbox">
                    {sugestoes.map((sugestao, index) => (
                      <button
                        type="button"
                        role="option"
                        key={`${sugestao.cep}-${sugestao.logradouro}-${index}`}
                        onPointerDown={(event) => event.preventDefault()}
                        onClick={() => selecionarSugestao(sugestao)}
                      >
                        <strong>{sugestao.logradouro}</strong>
                        <span>{[sugestao.bairro, sugestao.cidade, sugestao.estado, sugestao.cep ? `CEP ${aplicarMascaraCep(sugestao.cep)}` : ""].filter(Boolean).join(" · ")}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="novo-pedido-numero">Número</label>
              <input id="novo-pedido-numero" name="numero" value={form.numero} onChange={alterar} maxLength="10" required />
            </div>
            <div className="form-group">
              <label htmlFor="novo-pedido-complemento">Complemento</label>
              <input id="novo-pedido-complemento" name="complemento" value={form.complemento} onChange={alterar} maxLength="100" />
            </div>
            <div className="form-group">
              <label htmlFor="novo-pedido-cidade">Cidade</label>
              <input id="novo-pedido-cidade" name="cidade" value={form.cidade} onChange={alterar} maxLength="100" required />
            </div>
            <div className="form-group">
              <label htmlFor="novo-pedido-bairro">Bairro</label>
              <input id="novo-pedido-bairro" name="bairro" value={form.bairro} onChange={alterar} maxLength="100" required />
            </div>
          </div>
          {erro && <p className="novo-pedido-erro" role="alert">{erro}</p>}
          <div className="modal-actions novo-pedido-endereco-acoes">
            {temEnderecoCliente && <button type="button" className="secondary-button" onClick={() => {
              setErro("");
              setEtapa("escolha");
            }} disabled={salvando}>Voltar</button>}
            <button type="button" className="secondary-button" onClick={onClose} disabled={salvando}>Cancelar</button>
            <button type="submit" className="primary-button" disabled={salvando}>
              {salvando ? "Salvando…" : "Usar este endereço"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default ModalEnderecoPedido;
