import { useEffect, useRef, useState } from "react";
import Modal from "../shared/modal/Modal";
import { aplicarMascaraTelefone, formatarTelefone } from "../../utils/telefone";
import { aplicarMascaraCep, normalizarCep } from "../../utils/cep";
import CampoEnderecoPesquisavel from "./CampoEnderecoPesquisavel";

function normalizarTexto(valor = "") {
    return String(valor).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function ModalEditarCliente(props) {
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

    const [clienteEditado, setClienteEditado] = useState({
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
    });

    useEffect(() => {
        fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
            .then((resposta) => resposta.json())
            .then((estados) => setOpcoesEstado(estados.map((estado) => ({ nome: `${estado.sigla} — ${estado.nome}`, valor: estado.sigla, id: estado.id }))))
            .catch(() => setOpcoesEstado([]));
    }, []);

    useEffect(() => {
        const uf = clienteEditado.estado || "SP";
        const estado = opcoesEstado.find((opcao) => opcao.valor === uf);
        if (!estado) { setOpcoesCidade([]); return; }
        const controller = new AbortController();
        fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.id}/municipios?orderBy=nome`, { signal: controller.signal })
            .then((resposta) => resposta.json())
            .then((cidades) => setOpcoesCidade(cidades.map((cidade) => ({ nome: cidade.nome, valor: cidade.nome }))))
            .catch((erro) => { if (erro.name !== "AbortError") setOpcoesCidade([]); });
        return () => controller.abort();
    }, [clienteEditado.estado, opcoesEstado]);

    useEffect(() => {
        window.clearTimeout(buscaRuaTimer.current);
        buscaAtual.current += 1;
        setBuscandoCep(false);
        setBuscandoRua(false);
        setEnderecosEncontrados([]);
        setErroEndereco("");
        setEtapa(1);
        if (!props.open || !props.cliente) return;

        setClienteEditado({
            nome: props.cliente.nome || "",
            telefone: formatarTelefone(props.cliente.telefone),
            whatsapp: formatarTelefone(props.cliente.whatsapp),
            instagram: (props.cliente.instagram || "").replace(/^@+/, ""),
            anotacoes: props.cliente.anotacoes || "",
            cep: aplicarMascaraCep(props.cliente.endereco?.cep || ""),
            logradouro: props.cliente.endereco?.logradouro || "",
            numero: props.cliente.endereco?.numero || "",
            complemento: props.cliente.endereco?.complemento || "",
            bairro: props.cliente.endereco?.bairro || "",
            cidade: props.cliente.endereco?.cidade || "",
            estado: props.cliente.endereco?.estado || "",
        });
    }, [props.open, props.cliente]);

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

        const dadosAtualizados = { ...clienteEditado, [name]: value };
        if (name === "estado" && value !== clienteEditado.estado) dadosAtualizados.cidade = "";
        if (name === "cidade" && value && !clienteEditado.estado) dadosAtualizados.estado = "SP";
        if (["logradouro", "cidade", "estado"].includes(name)) {
            dadosAtualizados.cep = "";
            dadosAtualizados.bairro = "";
        }
        setClienteEditado(dadosAtualizados);

        if (["cep", "logradouro", "cidade", "estado"].includes(name)) {
            window.clearTimeout(buscaRuaTimer.current);
            buscaAtual.current += 1;
            setEnderecosEncontrados([]);
            setErroEndereco("");
            setBuscandoCep(false);
            setBuscandoRua(false);
        }

        if (name === "cep") {
            setEnderecosEncontrados([]);
            setErroEndereco("");
            if (normalizarCep(value).length === 8) buscarPorCep(value);
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
        setClienteEditado((atual) => ({
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
        if (!clienteEditado.nome.trim()) {
            props.onErro("O nome do cliente é obrigatório.");
            return false;
        }

        if (![clienteEditado.telefone, clienteEditado.whatsapp, clienteEditado.instagram]
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

        const endereco = [clienteEditado.cep, clienteEditado.logradouro, clienteEditado.numero,
            clienteEditado.complemento, clienteEditado.bairro, clienteEditado.cidade, clienteEditado.estado];
        if (endereco.some((campo) => campo.trim()) && endereco.some((campo, indice) =>
            indice !== 3 && !campo.trim())) {
            props.onErro("Para salvar o endereço, preencha CEP, logradouro, número, bairro, cidade e estado.");
            return;
        }

        if (endereco.some((campo) => campo.trim()) && normalizarCep(clienteEditado.cep).length !== 8) {
            props.onErro("O CEP deve conter 8 números.");
            return;
        }

        if (enderecosEncontrados.length > 0) {
            props.onErro("Escolha um dos endereços sugeridos antes de salvar.");
            return;
        }

        props.onSalvar({
            id: props.cliente.id,
            enderecoId: props.cliente.endereco?.id,
            ...clienteEditado,
            instagram: clienteEditado.instagram ? `@${clienteEditado.instagram}` : "",
        })
            .then(() => {
                props.onClose();
                props.onSucesso();
            })
            .catch((erro) => {
                console.error(erro);
                props.onErro(erro.response?.data?.message || erro.response?.data?.detail ||
                    "Não foi possível editar o cliente. Confira os dados e tente novamente.");
            });
    }

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            title="Editar Cliente"
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
                            value={clienteEditado.nome}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Telefone</label>
                        <input
                            type="tel"
                            inputMode="tel"
                            name="telefone"
                            value={clienteEditado.telefone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>WhatsApp</label>
                        <input
                            type="tel"
                            inputMode="tel"
                            name="whatsapp"
                            value={clienteEditado.whatsapp}
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
                                value={clienteEditado.instagram}
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
                        value={clienteEditado.anotacoes}
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
                            value={clienteEditado.cep}
                            onChange={handleChange}
                            inputMode="numeric"
                            autoComplete="postal-code"
                            maxLength={9}
                        />
                        {buscandoCep && <small className="cliente-busca-status">Buscando endereço…</small>}
                    </div>

                    <CampoEnderecoPesquisavel
                        label="Estado (UF)"
                        name="estado"
                        value={clienteEditado.estado}
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
                                value={clienteEditado.logradouro}
                                onChange={handleChange}
                                autoComplete="address-line1"
                                role="combobox"
                                aria-autocomplete="list"
                                aria-controls="cliente-editar-opcoes-endereco"
                                aria-haspopup="listbox"
                                aria-expanded={enderecosEncontrados.length > 0}
                            />
                            {enderecosEncontrados.length > 0 && (
                                <div id="cliente-editar-opcoes-endereco" className="cliente-opcoes-endereco" role="listbox">
                                    {enderecosEncontrados.map((endereco, indice) => (
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected="false"
                                            key={`${endereco.cep}-${indice}`}
                                            onClick={() => selecionarEndereco(indice)}
                                        >
                                            <strong>{endereco.logradouro || clienteEditado.logradouro}</strong>
                                            <span>{endereco.bairro || "Bairro não informado"} · {endereco.localidade}/{endereco.uf}{endereco.cep ? ` · CEP ${aplicarMascaraCep(endereco.cep)}` : ""}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {buscandoRua && <small className="cliente-busca-status">Buscando endereço em {clienteEditado.estado || "SP"}…</small>}
                        {!buscandoRua && !clienteEditado.estado && clienteEditado.logradouro.trim().length >= 3 && (
                            <small className="cliente-busca-status">UF não selecionada: pesquisando em SP.</small>
                        )}
                    </div>

                    {erroEndereco && (
                        <p className="cliente-endereco-erro" role="status">
                            {erroEndereco}
                        </p>
                    )}

                    <CampoEnderecoPesquisavel
                        label="Cidade"
                        name="cidade"
                        value={clienteEditado.cidade}
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
                            value={clienteEditado.bairro}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Número</label>
                        <input
                            type="text"
                            name="numero"
                            maxLength={10}
                            value={clienteEditado.numero}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Complemento</label>
                        <input
                            type="text"
                            name="complemento"
                            maxLength={100}
                            value={clienteEditado.complemento}
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

export default ModalEditarCliente;
