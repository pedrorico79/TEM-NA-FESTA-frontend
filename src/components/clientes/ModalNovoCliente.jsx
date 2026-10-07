import { useEffect, useRef, useState } from "react";
import Modal from "../shared/modal/Modal";
import { aplicarMascaraTelefone } from "../../utils/telefone";
import { aplicarMascaraCep, normalizarCep } from "../../utils/cep";
import CampoEnderecoPesquisavel from "./CampoEnderecoPesquisavel";

const clienteVazio = {
    nome: "",
    telefone: "",
    whatsapp: "",
    instagram: "",
    anotacoes: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
};

function normalizarTexto(valor = "") {
    return String(valor).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function ModalNovoCliente(props) {
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [buscandoRua, setBuscandoRua] = useState(false);
    const [enderecosEncontrados, setEnderecosEncontrados] = useState([]);
    const [erroEndereco, setErroEndereco] = useState("");
    const buscaAtual = useRef(0);
    const buscaRuaTimer = useRef(null);
    const formRef = useRef(null);
    const [etapa, setEtapa] = useState(1);
    const [opcoesEstado, setOpcoesEstado] = useState([]);
    const [opcoesCidade, setOpcoesCidade] = useState([]);

    const [novoCliente, setNovoCliente] = useState(clienteVazio);

    useEffect(() => {
        fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
            .then((resposta) => resposta.json())
            .then((estados) => setOpcoesEstado(estados.map((estado) => ({ nome: `${estado.sigla} — ${estado.nome}`, valor: estado.sigla, id: estado.id }))))
            .catch(() => setOpcoesEstado([]));
    }, []);

    useEffect(() => {
        const uf = novoCliente.estado || "SP";
        const estado = opcoesEstado.find((opcao) => opcao.valor === uf);
        if (!estado) { setOpcoesCidade([]); return; }
        const controller = new AbortController();
        fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.id}/municipios?orderBy=nome`, { signal: controller.signal })
            .then((resposta) => resposta.json())
            .then((cidades) => setOpcoesCidade(cidades.map((cidade) => ({ nome: cidade.nome, valor: cidade.nome }))))
            .catch((erro) => { if (erro.name !== "AbortError") setOpcoesCidade([]); });
        return () => controller.abort();
    }, [novoCliente.estado, opcoesEstado]);

    useEffect(() => {
        if (!props.open) {
            window.clearTimeout(buscaRuaTimer.current);
            buscaAtual.current += 1;
            setNovoCliente(clienteVazio);
            setEtapa(1);
            setBuscandoCep(false);
            setBuscandoRua(false);
            setEnderecosEncontrados([]);
            setErroEndereco("");
        }
    }, [props.open]);

    function handleChange(e) {
        const { name } = e.target;
        const value = ["telefone", "whatsapp"].includes(name)
            ? aplicarMascaraTelefone(e.target.value)
            : name === "instagram"
                ? e.target.value.replace(/^@+/, "")
            : name === "cep"
                ? aplicarMascaraCep(e.target.value)
                : name === "estado"
                    ? e.target.value.toUpperCase()
                    : e.target.value;

        const dadosAtualizados = { ...novoCliente, [name]: value };
        if (name === "estado" && value !== novoCliente.estado) dadosAtualizados.cidade = "";
        if (name === "cidade" && value && !novoCliente.estado) dadosAtualizados.estado = "SP";
        if (["logradouro", "cidade", "estado"].includes(name)) {
            dadosAtualizados.cep = "";
            dadosAtualizados.bairro = "";
        }
        setNovoCliente(dadosAtualizados);

        if (["cep", "logradouro", "cidade", "estado"].includes(name)) {
            window.clearTimeout(buscaRuaTimer.current);
            buscaAtual.current += 1;
            setEnderecosEncontrados([]);
            setErroEndereco("");
            setBuscandoCep(false);
            setBuscandoRua(false);
        }

        if (name === "cep" && normalizarCep(value).length === 8) {
            buscarPorCep(value);
        } else if (["logradouro", "cidade", "estado"].includes(name) && dadosAtualizados.logradouro.trim().length >= 3) {
            buscaRuaTimer.current = window.setTimeout(() => {
                buscarPorLogradouro(
                    dadosAtualizados.logradouro,
                    dadosAtualizados.cidade,
                    dadosAtualizados.estado
                );
            }, 350);
        }
    }

    function aplicarEndereco(endereco, cepAtual = endereco.cep) {
        setNovoCliente((atual) => ({
            ...atual,
            cep: aplicarMascaraCep(cepAtual),
            logradouro: endereco.logradouro || atual.logradouro,
            bairro: endereco.bairro || atual.bairro,
            cidade: endereco.localidade || atual.cidade,
            estado: endereco.uf || atual.estado,
        }));
    }

    async function buscarPorCep(valor) {
        const cep = normalizarCep(valor);
        if (cep.length !== 8) return;

        const idBusca = ++buscaAtual.current;
        setBuscandoCep(true);
        setErroEndereco("");
        try {
            const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!resposta.ok) throw new Error("Falha ao consultar o CEP.");
            const endereco = await resposta.json();
            if (idBusca !== buscaAtual.current) return;
            if (endereco.erro) {
                setErroEndereco("CEP não encontrado. Confira o número ou preencha o endereço manualmente.");
                return;
            }
            aplicarEndereco(endereco, cep);
            setEnderecosEncontrados([]);
        } catch {
            if (idBusca === buscaAtual.current) setErroEndereco("Não foi possível consultar o CEP agora.");
        } finally {
            if (idBusca === buscaAtual.current) setBuscandoCep(false);
        }
    }

    async function buscarPorLogradouro(logradouro, _cidade, estado) {
        if (logradouro.trim().length < 3) return;
        const estadoBusca = (estado || "").trim().toUpperCase() || "SP";

        const idBusca = ++buscaAtual.current;
        setBuscandoRua(true);
        setErroEndereco("");
        setEnderecosEncontrados([]);
        try {
            const parametros = new URLSearchParams({ q: logradouro.trim(), state: estadoBusca, limit: "10" });
            const resposta = await fetch(`https://cep.awesomeapi.com.br/search?${parametros}`);
            if (!resposta.ok) throw new Error("Falha ao consultar o endereço.");
            const respostaBusca = await resposta.json();
            const listaResultados = Array.isArray(respostaBusca)
                ? respostaBusca
                : respostaBusca.results || respostaBusca.data || [];
            let resultados = listaResultados.map((endereco) => ({
                cep: endereco.cep,
                logradouro: endereco.address,
                bairro: endereco.district,
                localidade: endereco.city,
                uf: endereco.state,
            })).filter((endereco) =>
                endereco.uf === estadoBusca && normalizarTexto(endereco.logradouro).includes(normalizarTexto(logradouro.trim()))
            );

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
                resultados = (dadosPhoton.features || [])
                    .map(({ properties = {} }) => ({
                        cep: properties.postcode || "",
                        logradouro: properties.street || properties.name || "",
                        bairro: properties.district || properties.suburb || "",
                        localidade: properties.city || properties.locality || "",
                        uf: estadoBusca,
                        estadoNome: properties.state || "",
                        pais: properties.countrycode || "",
                    }))
                    .filter((endereco) => endereco.pais === "BR" &&
                        normalizarTexto(endereco.estadoNome) === normalizarTexto(nomeEstado) &&
                        endereco.logradouro &&
                        normalizarTexto(endereco.logradouro).includes(normalizarTexto(logradouro.trim())));
            }
            if (idBusca !== buscaAtual.current) return;
            setEnderecosEncontrados(Array.isArray(resultados) ? resultados : []);
        } catch {
            if (idBusca === buscaAtual.current) setErroEndereco("Não foi possível consultar o endereço agora.");
        } finally {
            if (idBusca === buscaAtual.current) setBuscandoRua(false);
        }
    }

    function selecionarEndereco(indice) {
        const endereco = enderecosEncontrados[indice];
        if (endereco) {
            window.clearTimeout(buscaRuaTimer.current);
            buscaAtual.current += 1;
            setBuscandoRua(false);
            aplicarEndereco(endereco);
        }
        setEnderecosEncontrados([]);
    }

    function validarDados() {
        if (!novoCliente.nome.trim()) {
            props.onErro("O nome do cliente é obrigatório.");
            return false;
        }

        if (![novoCliente.telefone, novoCliente.whatsapp, novoCliente.instagram]
            .some((contato) => contato.trim())) {
            props.onErro("Informe pelo menos um meio de contato: telefone, WhatsApp ou Instagram.");
            return false;
        }

        return true;
    }

    function irParaEndereco(e) {
        e.preventDefault();
        if (!validarDados()) return;
        setEtapa(2);
        requestAnimationFrame(() => formRef.current?.closest(".modal-content")?.scrollTo({ top: 0, behavior: "smooth" }));
    }

    function voltarParaDados() {
        setEtapa(1);
        requestAnimationFrame(() => formRef.current?.closest(".modal-content")?.scrollTo({ top: 0, behavior: "smooth" }));
    }

    function salvar(e) {
        e.preventDefault();
        if (!validarDados()) return;

        if (enderecosEncontrados.length > 0) {
            props.onErro("Escolha um dos endereços sugeridos antes de salvar.");
            return;
        }

        const endereco = [novoCliente.cep, novoCliente.logradouro, novoCliente.numero,
            novoCliente.complemento, novoCliente.bairro, novoCliente.cidade, novoCliente.estado];
        if (endereco.some((campo) => campo.trim()) && endereco.some((campo, indice) =>
            indice !== 3 && !campo.trim())) {
            props.onErro("Para cadastrar um endereço, preencha CEP, logradouro, número, bairro, cidade e estado.");
            return;
        }

        if (endereco.some((campo) => campo.trim()) && normalizarCep(novoCliente.cep).length !== 8) {
            props.onErro("O CEP deve conter 8 números.");
            return;
        }

        props.onSalvar({
            ...novoCliente,
            instagram: novoCliente.instagram ? `@${novoCliente.instagram}` : "",
        })
            .then(() => {
                setNovoCliente(clienteVazio);
                setEnderecosEncontrados([]);
                setErroEndereco("");

                props.onClose();
                props.onSucesso();
            })
            .catch((erro) => {
                console.error(erro);
                props.onErro(erro.response?.data?.message || erro.response?.data?.detail ||
                    "Não foi possível cadastrar o cliente. Confira os dados e tente novamente.");
            });
    }

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            title="Novo Cliente"
        >
            <form ref={formRef} className="form-cliente" onSubmit={etapa === 1 ? irParaEndereco : salvar}>

                <div className="cliente-etapa-indicador">
                    <span>Etapa {etapa} de 2</span>
                    <strong>{etapa === 1 ? "Dados do cliente" : "Endereço"}</strong>
                </div>

                {etapa === 1 && (
                    <>

                <div className="form-grid">
                    <div className="form-group">
                        <label>Nome *</label>
                        <input
                            type="text"
                            name="nome"
                            maxLength={100}
                            value={novoCliente.nome}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Telefone</label>
                        <input
                            type="tel"
                            inputMode="tel"
                            name="telefone"
                            value={novoCliente.telefone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>WhatsApp</label>
                        <input
                            type="tel"
                            inputMode="tel"
                            name="whatsapp"
                            value={novoCliente.whatsapp}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Instagram</label>
                        <div className="cliente-instagram-input">
                            <span aria-hidden="true">@</span>
                            <input
                                type="text"
                                name="instagram"
                                maxLength={49}
                                value={novoCliente.instagram}
                                onChange={handleChange}
                                placeholder="usuario"
                                aria-label="Usuário do Instagram"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>Anotações</label>
                    <textarea
                        name="anotacoes"
                        value={novoCliente.anotacoes}
                        onChange={handleChange}
                    />
                </div>

                <div className="modal-actions">
                    <button type="button" className="secondary-button" onClick={props.onClose}>
                        Cancelar
                    </button>
                    <button type="submit" className="primary-button">
                        Próximo
                    </button>
                </div>

                    </>
                )}

                {etapa === 2 && (
                    <>
                <div className="form-grid">

                    <div className="form-group">
                        <label>CEP</label>
                        <input
                            type="text"
                            name="cep"
                            inputMode="numeric"
                            autoComplete="postal-code"
                            maxLength={9}
                            value={novoCliente.cep}
                            onChange={handleChange}
                        />
                        {buscandoCep && <small className="cliente-busca-status">Buscando endereço…</small>}
                    </div>

                    <CampoEnderecoPesquisavel
                        label="Estado (UF)"
                        name="estado"
                        value={novoCliente.estado}
                        onChange={handleChange}
                        options={opcoesEstado}
                        placeholder="Selecione a UF"
                        maxLength={2}
                        helperText="Sem UF selecionada, a busca de logradouro usa SP como padrão."
                    />

                    <div className="form-group cliente-logradouro-grupo">
                        <label>Logradouro</label>
                        <div className="cliente-logradouro-busca">
                            <input
                                type="text"
                                name="logradouro"
                                maxLength={150}
                                placeholder="Digite o nome da rua"
                                value={novoCliente.logradouro}
                                onChange={handleChange}
                                autoComplete="address-line1"
                                role="combobox"
                                aria-autocomplete="list"
                                aria-controls="cliente-novo-opcoes-endereco"
                                aria-haspopup="listbox"
                                aria-expanded={enderecosEncontrados.length > 0}
                            />
                            {enderecosEncontrados.length > 0 && (
                                <div id="cliente-novo-opcoes-endereco" className="cliente-opcoes-endereco" role="listbox">
                                    {enderecosEncontrados.map((endereco, indice) => (
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected="false"
                                            key={`${endereco.cep}-${indice}`}
                                            onClick={() => selecionarEndereco(indice)}
                                        >
                                            <strong>{endereco.logradouro || novoCliente.logradouro}</strong>
                                            <span>{endereco.bairro || "Bairro não informado"} · {endereco.localidade}/{endereco.uf}{endereco.cep ? ` · CEP ${aplicarMascaraCep(endereco.cep)}` : ""}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {buscandoRua && <small className="cliente-busca-status">Buscando endereço em {novoCliente.estado || "SP"}…</small>}
                        {!buscandoRua && !novoCliente.estado && novoCliente.logradouro.trim().length >= 3 && (
                            <small className="cliente-busca-status">UF não selecionada: pesquisando em SP.</small>
                        )}
                    </div>

                    {erroEndereco && (
                        <p className="cliente-endereco-erro" role="status">{erroEndereco}</p>
                    )}

                    <CampoEnderecoPesquisavel
                        label="Cidade"
                        name="cidade"
                        value={novoCliente.cidade}
                        onChange={handleChange}
                        options={opcoesCidade}
                        placeholder="Pesquise ou selecione a cidade"
                    />

                    <div className="form-group">
                        <label>Bairro</label>
                        <input
                            type="text"
                            name="bairro"
                            maxLength={100}
                            value={novoCliente.bairro}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Número</label>
                        <input
                            type="text"
                            name="numero"
                            maxLength={10}
                            value={novoCliente.numero}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Complemento</label>
                        <input
                            type="text"
                            name="complemento"
                            maxLength={100}
                            value={novoCliente.complemento}
                            onChange={handleChange}
                        />
                    </div>

                </div>

                <div className="modal-actions">
                    <button type="button" className="secondary-button" onClick={props.onClose}>
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={voltarParaDados}
                    >
                        Voltar
                    </button>

                    <button
                        type="submit"
                        className="primary-button"
                    >
                        Confirmar
                    </button>
                </div>

                    </>
                )}

            </form>
        </Modal>
    );
}

export default ModalNovoCliente;
