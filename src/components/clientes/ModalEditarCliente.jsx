import { useEffect, useRef, useState } from "react";
import Modal from "../shared/modal/Modal";
import { aplicarMascaraTelefone, formatarTelefone } from "../../utils/telefone";
import { aplicarMascaraCep, normalizarCep } from "../../utils/cep";

function ModalEditarCliente(props) {
    const [buscandoEndereco, setBuscandoEndereco] = useState(false);
    const [enderecosEncontrados, setEnderecosEncontrados] = useState([]);
    const [erroEndereco, setErroEndereco] = useState("");
    const buscaAtual = useRef(0);

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
        buscaAtual.current += 1;
        setEnderecosEncontrados([]);
        setErroEndereco("");
        if (!props.open || !props.cliente) return;

        setClienteEditado({
            nome: props.cliente.nome || "",
            telefone: formatarTelefone(props.cliente.telefone),
            whatsapp: formatarTelefone(props.cliente.whatsapp),
            instagram: props.cliente.instagram || "",
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
            : name === "cep"
                ? aplicarMascaraCep(e.target.value)
                : name === "estado"
                    ? e.target.value.toUpperCase()
                    : e.target.value;

        setClienteEditado({
            ...clienteEditado,
            [name]: value,
        });

        if (["cep", "logradouro", "cidade", "estado"].includes(name)) {
            buscaAtual.current += 1;
            setEnderecosEncontrados([]);
            setErroEndereco("");
        }

        if (name === "cep") {
            setEnderecosEncontrados([]);
            setErroEndereco("");
            if (normalizarCep(value).length === 8) buscarPorCep(value);
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
        setBuscandoEndereco(true);
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
            if (idBusca === buscaAtual.current) setBuscandoEndereco(false);
        }
    }

    async function buscarPorLogradouro() {
        const { estado, cidade, logradouro } = clienteEditado;
        if (estado.trim().length !== 2 || cidade.trim().length < 3 || logradouro.trim().length < 3) return;

        const idBusca = ++buscaAtual.current;
        setBuscandoEndereco(true);
        setErroEndereco("");
        setEnderecosEncontrados([]);
        try {
            const consulta = [estado.trim(), cidade.trim(), logradouro.trim()]
                .map(encodeURIComponent)
                .join("/");
            const resposta = await fetch(`https://viacep.com.br/ws/${consulta}/json/`);
            if (!resposta.ok) throw new Error("Falha ao consultar o endereço.");
            const resultados = await resposta.json();
            if (idBusca !== buscaAtual.current) return;
            if (!Array.isArray(resultados) || resultados.length === 0) {
                setErroEndereco("Nenhum endereço encontrado. Confira rua, cidade e estado.");
            } else if (resultados.length === 1) {
                aplicarEndereco(resultados[0]);
            } else {
                setEnderecosEncontrados(resultados);
            }
        } catch {
            if (idBusca === buscaAtual.current) setErroEndereco("Não foi possível consultar o endereço agora.");
        } finally {
            if (idBusca === buscaAtual.current) setBuscandoEndereco(false);
        }
    }

    function selecionarEndereco(e) {
        const endereco = enderecosEncontrados[Number(e.target.value)];
        if (endereco) aplicarEndereco(endereco);
        setEnderecosEncontrados([]);
    }

    function salvar(e) {
        e.preventDefault();

        if (
            !clienteEditado.nome.trim() ||
            !clienteEditado.telefone ||
            !clienteEditado.whatsapp ||
            !clienteEditado.cep ||
            !clienteEditado.logradouro ||
            !clienteEditado.numero ||
            !clienteEditado.bairro ||
            !clienteEditado.cidade ||
            !clienteEditado.estado
        ) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        if (enderecosEncontrados.length > 1) {
            alert("Selecione um dos endereços encontrados antes de salvar.");
            return;
        }

        props.onSalvar({
            id: props.cliente.id,
            enderecoId: props.cliente.endereco?.id,
            ...clienteEditado,
        })
            .then(() => {
                props.onClose();
                props.onSucesso();
            })
            .catch((erro) => {
                console.error(erro);
                alert("Erro ao editar cliente.");
            });
    }

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            title="Editar Cliente"
        >
            <form onSubmit={salvar}>

                <div className="form-grid">

                    <div className="form-group">
                        <label>Nome *</label>
                        <input
                            type="text"
                            name="nome"
                            value={clienteEditado.nome}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Telefone *</label>
                        <input
                            type="tel"
                            inputMode="tel"
                            name="telefone"
                            value={clienteEditado.telefone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>WhatsApp *</label>
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
                        <input
                            type="text"
                            name="instagram"
                            value={clienteEditado.instagram}
                            onChange={handleChange}
                        />
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

                <h3>Endereço</h3>

                <div className="form-grid">

                    <div className="form-group">
                        <label>CEP *</label>
                        <input
                            type="text"
                            name="cep"
                            value={clienteEditado.cep}
                            onChange={handleChange}
                            inputMode="numeric"
                            autoComplete="postal-code"
                            maxLength={9}
                        />
                        {buscandoEndereco && <small>Buscando endereço…</small>}
                    </div>

                    <div className="form-group">
                        <label>Logradouro *</label>
                        <input
                            type="text"
                            name="logradouro"
                            value={clienteEditado.logradouro}
                            onChange={handleChange}
                            onBlur={buscarPorLogradouro}
                            autoComplete="address-line1"
                        />
                    </div>

                    {enderecosEncontrados.length > 1 && (
                        <div className="form-group">
                            <label>Selecione o endereço</label>
                            <select defaultValue="" onChange={selecionarEndereco}>
                                <option value="" disabled>Escolha uma rua</option>
                                {enderecosEncontrados.map((endereco, indice) => (
                                    <option key={`${endereco.cep}-${indice}`} value={indice}>
                                        {endereco.logradouro} — {endereco.bairro} — CEP {aplicarMascaraCep(endereco.cep)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {erroEndereco && (
                        <p role="status" style={{ color: "#b42318", margin: 0 }}>
                            {erroEndereco}
                        </p>
                    )}

                    <div className="form-group">
                        <label>Número *</label>
                        <input
                            type="text"
                            name="numero"
                            value={clienteEditado.numero}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Complemento</label>
                        <input
                            type="text"
                            name="complemento"
                            value={clienteEditado.complemento}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Bairro *</label>
                        <input
                            type="text"
                            name="bairro"
                            value={clienteEditado.bairro}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Cidade *</label>
                        <input
                            type="text"
                            name="cidade"
                            value={clienteEditado.cidade}
                            onChange={handleChange}
                            onBlur={buscarPorLogradouro}
                        />
                    </div>

                    <div className="form-group">
                        <label>Estado *</label>
                        <input
                            type="text"
                            name="estado"
                            maxLength={2}
                            value={clienteEditado.estado}
                            onChange={handleChange}
                            onBlur={buscarPorLogradouro}
                        />
                    </div>

                </div>

                <div className="modal-actions">

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={props.onClose}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="primary-button"
                    >
                        Salvar
                    </button>

                </div>

            </form>
        </Modal>
    );
}

export default ModalEditarCliente;
