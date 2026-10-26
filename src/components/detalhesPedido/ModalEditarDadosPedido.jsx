import { useEffect, useRef, useState } from "react";
import Modal from "../shared/modal/Modal";
import FiltroDropdown from "../pedidos/FiltroDropdown";
import CampoEnderecoPesquisavel from "../clientes/CampoEnderecoPesquisavel";
import { aplicarMascaraCep, normalizarCep } from "../../utils/cep";

function normalizarTexto(valor = "") {
  return String(valor).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function hojeLocal() {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
}

function ModalEditarDadosPedido({ open, pedido, enderecoPadrao, eventos = [], erroEventos, secao = "resumo", onClose, onSalvar, onErro }) {
  const [form, setForm] = useState({
    dataEntrega: "",
    eventoId: "",
    observacao: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [buscandoRua, setBuscandoRua] = useState(false);
  const [enderecosEncontrados, setEnderecosEncontrados] = useState([]);
  const [erroCep, setErroCep] = useState("");
  const [erroRua, setErroRua] = useState("");
  const [opcoesEstado, setOpcoesEstado] = useState([]);
  const [opcoesCidade, setOpcoesCidade] = useState([]);
  const buscaAtual = useRef(0);
  const buscaRuaTimer = useRef(null);
  const enderecoOriginal = useRef(null);

  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then((resposta) => resposta.json())
      .then((estados) => setOpcoesEstado(estados.map((estado) => ({
        nome: `${estado.sigla} — ${estado.nome}`,
        valor: estado.sigla,
        id: estado.id,
      }))))
      .catch(() => setOpcoesEstado([]));
  }, []);

  useEffect(() => {
    const estado = opcoesEstado.find((opcao) => opcao.valor === (form.estado || "SP"));
    if (!estado) {
      setOpcoesCidade([]);
      return undefined;
    }
    const controller = new AbortController();
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.id}/municipios?orderBy=nome`, { signal: controller.signal })
      .then((resposta) => resposta.json())
      .then((cidades) => setOpcoesCidade(cidades.map((cidade) => ({ nome: cidade.nome, valor: cidade.nome }))))
      .catch((error) => { if (error.name !== "AbortError") setOpcoesCidade([]); });
    return () => controller.abort();
  }, [form.estado, opcoesEstado]);

  useEffect(() => {
    window.clearTimeout(buscaRuaTimer.current);
    buscaAtual.current += 1;
    setBuscandoCep(false);
    setBuscandoRua(false);
    setEnderecosEncontrados([]);
    setErroCep("");
    setErroRua("");
    if (!open || !pedido) return;
    const endereco = pedido.enderecoEntrega ?? enderecoPadrao ?? {};
    enderecoOriginal.current = {
      cep: aplicarMascaraCep(endereco.cep || ""),
      logradouro: endereco.logradouro || "",
      numero: endereco.numero || "",
      complemento: endereco.complemento || "",
      bairro: endereco.bairro || "",
      cidade: endereco.cidade || "",
      estado: endereco.estado || "",
    };
    setForm({
      dataEntrega: pedido.dataEntrega?.slice(0, 10) || "",
      eventoId: pedido.eventoId == null ? "" : String(pedido.eventoId),
      observacao: pedido.observacao || "",
      ...enderecoOriginal.current,
    });
    setErro("");
  }, [open, pedido, enderecoPadrao]);

  function alterar(event) {
    const { name, value } = event.target;
    const valor = name === "cep"
      ? aplicarMascaraCep(value)
      : name === "estado"
        ? value.toUpperCase().slice(0, 2)
        : value;
    const dadosAtualizados = {
      ...form,
      [name]: valor,
      ...(name === "estado" && valor !== form.estado ? { cidade: "" } : {}),
      ...(name === "cidade" && valor && !form.estado ? { estado: "SP" } : {}),
    };
    if (["logradouro", "cidade", "estado"].includes(name)) {
      dadosAtualizados.cep = "";
      dadosAtualizados.bairro = "";
    }
    setForm(dadosAtualizados);
    setErro("");

    if (["cep", "logradouro", "cidade", "estado"].includes(name)) {
      window.clearTimeout(buscaRuaTimer.current);
      buscaAtual.current += 1;
      setEnderecosEncontrados([]);
      setErroCep("");
      setErroRua("");
      setBuscandoCep(false);
      setBuscandoRua(false);
    }

    if (name === "cep") {
      if (normalizarCep(valor).length === 8) buscarPorCep(valor);
    } else if (["logradouro", "cidade", "estado"].includes(name) && dadosAtualizados.logradouro.trim().length >= 3) {
      buscaRuaTimer.current = window.setTimeout(() => {
        buscarPorLogradouro(dadosAtualizados.logradouro, dadosAtualizados.estado);
      }, 350);
    }
  }

  function restaurarEnderecoAtual() {
    if (!enderecoOriginal.current) return;
    setForm((atual) => ({ ...atual, ...enderecoOriginal.current }));
    window.clearTimeout(buscaRuaTimer.current);
    buscaAtual.current += 1;
    setEnderecosEncontrados([]);
    setErroCep("");
    setErroRua("");
    setBuscandoCep(false);
    setBuscandoRua(false);
    setErro("");
  }

  async function buscarPorCep(valor) {
    const cep = normalizarCep(valor);
    if (cep.length !== 8) return;
    const idBusca = ++buscaAtual.current;
    setBuscandoCep(true);
    setErroCep("");
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!resposta.ok) throw new Error("Falha ao consultar CEP");
      const endereco = await resposta.json();
      if (idBusca !== buscaAtual.current) return;
      if (endereco.erro) {
        setErroCep("CEP não encontrado. Confira o número ou preencha o endereço manualmente.");
        return;
      }
      aplicarEndereco(endereco, cep);
      setEnderecosEncontrados([]);
    } catch {
      if (idBusca === buscaAtual.current) setErroCep("Não foi possível consultar o CEP agora.");
    } finally {
      if (idBusca === buscaAtual.current) setBuscandoCep(false);
    }
  }

  function aplicarEndereco(endereco, cepAtual = endereco.cep) {
    setForm((atual) => ({
      ...atual,
      cep: aplicarMascaraCep(cepAtual),
      logradouro: endereco.logradouro || atual.logradouro,
      bairro: endereco.bairro || atual.bairro,
      cidade: endereco.localidade || atual.cidade,
      estado: endereco.uf || atual.estado,
    }));
  }

  async function buscarPorLogradouro(logradouro, estado) {
    if (logradouro.trim().length < 3) return;
    const estadoBusca = (estado || "").trim().toUpperCase() || "SP";
    const idBusca = ++buscaAtual.current;
    setBuscandoRua(true);
    setErroRua("");
    setEnderecosEncontrados([]);
    try {
      const parametros = new URLSearchParams({ q: logradouro.trim(), state: estadoBusca, limit: "10" });
      const resposta = await fetch(`https://cep.awesomeapi.com.br/search?${parametros}`);
      const respostaBusca = resposta.ok ? await resposta.json() : [];
      const listaResultadosBruta = Array.isArray(respostaBusca)
        ? respostaBusca
        : respostaBusca.results || respostaBusca.data || [];
      const listaResultados = Array.isArray(listaResultadosBruta) ? listaResultadosBruta : [];
      let resultados = listaResultados.map((endereco) => ({
        cep: endereco.cep,
        logradouro: endereco.address,
        bairro: endereco.district,
        localidade: endereco.city,
        uf: endereco.state,
      })).filter((endereco) => endereco.uf === estadoBusca
        && normalizarTexto(endereco.logradouro).includes(normalizarTexto(logradouro.trim())));

      if (resultados.length === 0) {
        const nomeEstado = opcoesEstado.find((opcao) => opcao.valor === estadoBusca)?.nome.split(" — ")[1] || "São Paulo";
        const parametrosPhoton = new URLSearchParams({
          street: logradouro.trim(),
          state: nomeEstado,
          limit: "50",
          countrycode: "BR",
        });
        const respostaPhoton = await fetch(`https://photon.komoot.io/structured?${parametrosPhoton}`);
        if (!respostaPhoton.ok) throw new Error("Falha ao pesquisar o logradouro.");
        const dadosPhoton = await respostaPhoton.json();
        resultados = (dadosPhoton.features || []).map(({ properties = {} }) => ({
          cep: properties.postcode || "",
          logradouro: properties.street || properties.name || "",
          bairro: properties.district || properties.suburb || "",
          localidade: properties.city || properties.locality || "",
          uf: estadoBusca,
          estadoNome: properties.state || "",
          pais: properties.countrycode || "",
        })).filter((endereco) => normalizarTexto(endereco.pais) === "br"
          && normalizarTexto(endereco.estadoNome) === normalizarTexto(nomeEstado)
          && endereco.logradouro
          && normalizarTexto(endereco.logradouro).includes(normalizarTexto(logradouro.trim())));
      }
      if (idBusca === buscaAtual.current) setEnderecosEncontrados(Array.isArray(resultados) ? resultados : []);
    } catch {
      if (idBusca === buscaAtual.current) setErroRua("Não foi possível consultar o endereço agora.");
    } finally {
      if (idBusca === buscaAtual.current) setBuscandoRua(false);
    }
  }

  function selecionarEndereco(endereco) {
    window.clearTimeout(buscaRuaTimer.current);
    buscaAtual.current += 1;
    setBuscandoRua(false);
    aplicarEndereco(endereco);
    setEnderecosEncontrados([]);
  }

  async function submeter(event) {
    event.preventDefault();
    setErro("");
    let alteracoes;

    if (secao === "dataEntrega") {
      if (!form.dataEntrega) {
        setErro("Informe a data de retirada.");
        return;
      }
      alteracoes = { dataEntrega: `${form.dataEntrega}T23:59:59` };
    } else if (secao === "resumo") {
      const totalItens = (pedido?.itens || []).reduce((soma, item) => {
        const subtotal = item.subtotal != null
          ? Number(item.subtotal)
          : Number(item.precoUnitario || 0) * Number(item.quantidade || 0) + Number(item.acrescimo || 0);
        return soma + (Number.isFinite(subtotal) ? subtotal : 0);
      }, 0);
      const totalBruto = totalItens + Number(pedido?.taxaEntrega || 0);
      const descontoAtual = Number(pedido?.descontoPedido || 0);
      if (descontoAtual > totalBruto) {
        setErro("A taxa de entrega deixa o desconto atual acima do total. Ajuste o desconto na seção Itens do Pedido.");
        return;
      }
      const totalDepoisDesconto = totalBruto - descontoAtual;
      const totalComprometido = (pedido?.pagamentos || [])
        .filter((pagamento) => pagamento.statusPagamento !== "CANCELADO")
        .reduce((soma, pagamento) => soma + Number(pagamento.valor || 0), 0);
      if (totalComprometido > totalDepoisDesconto) {
        setErro("O desconto deixaria o total abaixo dos pagamentos já registrados. Reduza o desconto ou revise os pagamentos.");
        return;
      }
      alteracoes = {
        eventoId: form.eventoId ? Number(form.eventoId) : null,
        observacao: form.observacao.trim(),
      };
    } else {
      const camposEndereco = [form.cep, form.logradouro, form.numero, form.bairro, form.cidade, form.estado];
      const temEndereco = [...camposEndereco, form.complemento].some((valor) => valor.trim());
      const enderecoIncompleto = temEndereco && camposEndereco.some((valor) => !valor.trim());
      if (enderecoIncompleto) {
        setErro("Para informar um endereço, preencha CEP, logradouro, número, bairro, cidade e UF.");
        return;
      }
      if (temEndereco && normalizarCep(form.cep).length !== 8) {
        setErro("O CEP deve conter 8 números.");
        return;
      }

      alteracoes = {
        enderecoEntrega: temEndereco ? {
          cep: normalizarCep(form.cep),
          logradouro: form.logradouro.trim(),
          numero: form.numero.trim(),
          complemento: form.complemento.trim(),
          bairro: form.bairro.trim(),
          cidade: form.cidade.trim(),
          estado: form.estado.trim().toUpperCase(),
        } : null,
      };
    }

    setSalvando(true);
    try {
      await onSalvar(alteracoes);
      onClose();
    } catch (error) {
      onErro?.(error.message || "Não foi possível atualizar os dados do pedido.");
    } finally {
      setSalvando(false);
    }
  }

  const titulo = secao === "dataEntrega"
    ? "Editar data de retirada"
    : secao === "endereco"
      ? "Editar endereço do pedido"
      : "Editar resumo do pedido";

  return (
    <Modal open={open} onClose={salvando ? () => {} : onClose} title={titulo}>
      <form className="form-editar-dados-pedido" onSubmit={submeter}>
        {secao === "dataEntrega" && (
          <div className="form-group">
            <label htmlFor="pedido-data-entrega">Data de retirada *</label>
            <input id="pedido-data-entrega" name="dataEntrega" type="date" min={hojeLocal()} value={form.dataEntrega} onChange={alterar} onClick={(event) => event.currentTarget.showPicker?.()} required />
          </div>
        )}

        {secao === "resumo" && <>
          <div className="form-group">
            <label>Evento</label>
            <FiltroDropdown
              className="evento-edicao-dropdown"
              menuClassName="evento-edicao-dropdown-menu"
              label="Evento do pedido"
              value={form.eventoId}
              onChange={(value) => alterar({ target: { name: "eventoId", value } })}
              options={[
                { value: "", label: "Sem evento" },
                ...(form.eventoId && !eventos.some((evento) => String(evento.id) === form.eventoId) && pedido?.eventoNome
                  ? [{ value: form.eventoId, label: `${pedido.eventoNome} (atual)` }]
                  : []),
                ...eventos.map((evento) => ({
                  value: String(evento.id),
                  label: `${evento.nome}${!evento.ativo ? " (inativo)" : ""}`,
                })),
              ]}
            />
          </div>
          {erroEventos && <p className="erro-edicao-pedido" role="status">{erroEventos}</p>}
          <div className="form-group">
            <label htmlFor="pedido-observacao">Observação do pedido</label>
            <textarea id="pedido-observacao" name="observacao" value={form.observacao} onChange={alterar} rows="3" />
          </div>
        </>}

        {secao === "endereco" && <>
          <div className="form-editar-pedido-endereco-titulo">
            <h3 className="form-editar-pedido-subtitulo">Endereço de entrega</h3>
            <button type="button" className="btn-limpar-endereco-pedido" onClick={restaurarEnderecoAtual}>Restaurar endereço atual</button>
          </div>
          <p className="form-editar-pedido-ajuda">Os campos mostram o endereço atualmente usado neste pedido. Use “Restaurar endereço atual” para desfazer as alterações feitas aqui.</p>
          <div className="form-grid">
          <div className="form-group">
            <label htmlFor="pedido-endereco-cep">CEP</label>
            <input id="pedido-endereco-cep" name="cep" value={form.cep} onChange={alterar} inputMode="numeric" autoComplete="postal-code" maxLength="9" />
            {buscandoCep && <small className="cliente-busca-status">Buscando endereço…</small>}
            {!buscandoCep && erroCep && <small className="pedido-endereco-erro-busca">{erroCep}</small>}
          </div>
          {opcoesEstado.length ? (
            <CampoEnderecoPesquisavel
              label="Estado (UF)"
              name="estado"
              value={form.estado}
              onChange={alterar}
              options={opcoesEstado}
              placeholder="Selecione a UF"
              maxLength={2}
              helperText="Sem UF selecionada, a busca de logradouro usa SP como padrão."
            />
          ) : (
            <div className="form-group">
              <label htmlFor="pedido-endereco-estado">Estado (UF)</label>
              <input id="pedido-endereco-estado" name="estado" value={form.estado} onChange={(event) => alterar({ target: { name: "estado", value: event.target.value.toUpperCase().slice(0, 2) } })} maxLength="2" />
            </div>
          )}
          <div className="form-group form-editar-pedido-linha-cheia cliente-logradouro-grupo">
            <label htmlFor="pedido-endereco-logradouro">Logradouro</label>
            <div className="cliente-logradouro-busca">
              <input id="pedido-endereco-logradouro" name="logradouro" value={form.logradouro} onChange={alterar} maxLength="150" autoComplete="address-line1" />
              {buscandoRua && <small className="cliente-busca-status">Buscando endereços…</small>}
              {enderecosEncontrados.length > 0 && (
                <div className="cliente-opcoes-endereco pedido-opcoes-endereco" role="listbox">
                  {enderecosEncontrados.map((endereco, indice) => (
                    <button
                      type="button"
                      role="option"
                      aria-selected="false"
                      key={`${endereco.cep}-${endereco.logradouro}-${indice}`}
                      onPointerDown={(event) => event.preventDefault()}
                      onClick={() => selecionarEndereco(endereco)}
                    >
                      <strong>{endereco.logradouro || form.logradouro}</strong>
                      <span>{[endereco.bairro, endereco.localidade, endereco.uf, endereco.cep ? `CEP ${aplicarMascaraCep(endereco.cep)}` : ""]
                        .filter(Boolean).join(" · ")}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {!buscandoRua && erroRua && <small className="pedido-endereco-erro-busca">{erroRua}</small>}
          </div>
          {opcoesCidade.length ? (
            <CampoEnderecoPesquisavel
              label="Cidade"
              name="cidade"
              value={form.cidade}
              onChange={alterar}
              options={opcoesCidade}
              placeholder="Pesquise ou selecione a cidade"
            />
          ) : (
            <div className="form-group">
              <label htmlFor="pedido-endereco-cidade">Cidade</label>
              <input id="pedido-endereco-cidade" name="cidade" value={form.cidade} onChange={alterar} maxLength="100" />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="pedido-endereco-bairro">Bairro</label>
            <input id="pedido-endereco-bairro" name="bairro" value={form.bairro} onChange={alterar} maxLength="100" />
          </div>
          <div className="form-group">
            <label htmlFor="pedido-endereco-numero">Número</label>
            <input id="pedido-endereco-numero" name="numero" value={form.numero} onChange={alterar} maxLength="10" />
          </div>
          <div className="form-group">
            <label htmlFor="pedido-endereco-complemento">Complemento</label>
            <input id="pedido-endereco-complemento" name="complemento" value={form.complemento} onChange={alterar} maxLength="100" />
          </div>
          </div>
        </>}
        {erro && <p className="erro-edicao-pedido" role="alert">{erro}</p>}
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={salvando}>Cancelar</button>
          <button type="submit" className="primary-button" disabled={salvando}>{salvando ? "Salvando…" : "Salvar alterações"}</button>
        </div>
      </form>
    </Modal>
  );
}

export default ModalEditarDadosPedido;
