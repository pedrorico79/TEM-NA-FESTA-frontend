import { useEffect, useRef, useState } from "react";

import Menu from "../shared/menu/Menu";

import HeaderNovoPedido from "../novoPedido/HeaderNovoPedido";

import ClienteCard from "../novoPedido/ClienteCard";

import DetalhesPedidoCard from "../novoPedido/DetalhesPedidoCard";

import ItensPedidoCard, { calcularAcrescimoItem, calcularPrecoUnitarioFinal } from "../novoPedido/ItensPedidoCard";
import ModalEnderecoPedido from "../novoPedido/ModalEnderecoPedido";

import { useNavigate } from "react-router-dom";

import { api } from "../../services/api";
import { mensagemErroApi } from "../../utils/mensagemErroApi";

import "../css/NovoPedido.css";
import "../css/Clientes.css";

function criarChaveIdempotencia() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (caractere) => {
        const aleatorio = Math.floor(Math.random() * 16);
        return (caractere === "x" ? aleatorio : (aleatorio & 0x3) | 0x8).toString(16);
    });
}

function hojeISO() {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
}

function valorAcrescimoVisivel(valor) {
    return Number(valor || 0) === 0 ? "" : valor;
}

function NovoPedido() {

    const navigate = useNavigate();

    const [clientes, setClientes] = useState([]);

    const [produtos, setProdutos] = useState([]);

    const [eventos, setEventos] = useState([]);
    const [metodosPagamento, setMetodosPagamento] = useState([]);
    const [metodoPagamentoId, setMetodoPagamentoId] = useState("");
    const [erroMetodosPagamento, setErroMetodosPagamento] = useState("");

    const [entrada, setEntrada] = useState("");
    const [statusEntrada, setStatusEntrada] = useState("CONFIRMADO");
    const [modalEnderecoAberto, setModalEnderecoAberto] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [mensagemErro, setMensagemErro] = useState("");
    const [mensagemSucesso, setMensagemSucesso] = useState("");
    const [pedidoIncompletoId, setPedidoIncompletoId] = useState(null);
    const [erroPedidoIncompleto, setErroPedidoIncompleto] = useState("");
    const timeoutNotificacaoRef = useRef(null);

    function limparTimeoutNotificacao() {
        if (timeoutNotificacaoRef.current) {
            window.clearTimeout(timeoutNotificacaoRef.current);
            timeoutNotificacaoRef.current = null;
        }
    }

    function limparNotificacao() {
        limparTimeoutNotificacao();
        setMensagemErro("");
        setMensagemSucesso("");
    }

    function exibirErro(mensagem, duracao = 5000) {
        limparTimeoutNotificacao();
        setMensagemSucesso("");
        setMensagemErro(mensagem);
        timeoutNotificacaoRef.current = window.setTimeout(() => {
            setMensagemErro("");
            timeoutNotificacaoRef.current = null;
        }, duracao);
    }

    function exibirSucesso(mensagem, duracao = 3000) {
        limparTimeoutNotificacao();
        setMensagemErro("");
        setMensagemSucesso(mensagem);
        timeoutNotificacaoRef.current = window.setTimeout(() => {
            setMensagemSucesso("");
            timeoutNotificacaoRef.current = null;
        }, duracao);
    }

    function exibirErroCadastro(mensagem) {
        exibirErro(mensagem);
    }

    function exibirSucessoCadastro(mensagem) {
        exibirSucesso(mensagem);
    }

    async function criarProduto(produto) {
        const response = await api.post("/produtos", produto);
        const produtoCriado = response.data;
        if (produtoCriado?.id) {
            setProdutos((atuais) => [
                ...atuais.filter((item) => item.id !== produtoCriado.id),
                produtoCriado,
            ]);
        }
        return produtoCriado;
    }

    const [pedido, setPedido] = useState({
        cliente: null,
        eventoId: null,
        dataEntrega: "",
        taxaEntrega: "",
        descontoPedidoAjuste: { valor: "", tipo: "R$" },
        observacao: "",
        itens: [],
    });

    useEffect(() => {

        async function carregarDados() {
            const resultados = await Promise.allSettled([
                api.get("/clientes", { params: { ativos: true } }),
                api.get("/produtos", { params: { ativos: true } }),
                api.get("/eventos", { params: { ativos: true } }),
                api.get("/metodos-pagamento"),
            ]);

            const [clientesResult, produtosResult, eventosResult, metodosResult] = resultados;
            if (clientesResult.status === "fulfilled") {
                setClientes(Array.isArray(clientesResult.value.data) ? clientesResult.value.data : []);
            } else {
                exibirErro(mensagemErroApi(clientesResult.reason, "Não foi possível carregar os clientes."));
            }
            if (produtosResult.status === "fulfilled") {
                setProdutos(Array.isArray(produtosResult.value.data) ? produtosResult.value.data : []);
            } else {
                exibirErro(mensagemErroApi(produtosResult.reason, "Não foi possível carregar os produtos."));
            }
            if (eventosResult.status === "fulfilled") {
                setEventos(Array.isArray(eventosResult.value.data) ? eventosResult.value.data : []);
            } else {
                setEventos([]);
            }
            if (metodosResult.status === "fulfilled") {
                const lista = Array.isArray(metodosResult.value.data) ? metodosResult.value.data : [];
                setMetodosPagamento(lista);
                setMetodoPagamentoId(lista[0]?.id ? String(lista[0].id) : "");
                setErroMetodosPagamento(lista.length ? "" : "Nenhum método de pagamento está cadastrado.");
            } else {
                setErroMetodosPagamento(mensagemErroApi(metodosResult.reason, "Não foi possível carregar os métodos de pagamento."));
            }
        }

        carregarDados();

    }, []);

    useEffect(() => () => limparTimeoutNotificacao(), []);

    const adicionarItens = (produtosSelecionados) => {

        setPedido((pedidoAtual) => {
            return {

                ...pedidoAtual,

                itens: produtosSelecionados.map((selecionado) => ({
                    ...selecionado,
                    chaveLocal: selecionado.chaveLocal || globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
                    descricao: selecionado.descricao || selecionado.produto?.descricao || "",
                    acrescimoAjuste: {
                        valor: selecionado.acrescimoAjuste?.valor ?? "",
                        tipo: selecionado.acrescimoAjuste?.tipo || "R$",
                    },
                    observacaoItem: selecionado.observacaoItem || "",
                })),

            };

        });

    };

    const removerItem = (index) => {
        setPedido((pedidoAtual) => {
            const removido = pedidoAtual.itens[index];
            let itens = pedidoAtual.itens.filter((_, i) => i !== index);
            const grupoId = removido?.grupoObservacaoId;
            if (grupoId) {
                const grupo = itens.map((item, i) => ({ item, i }))
                    .filter(({ item }) => item.grupoObservacaoId === grupoId);
                if (grupo.length <= 1) {
                    itens = itens.map((item) => {
                        if (item.grupoObservacaoId !== grupoId) return item;
                        const { grupoObservacaoId, linhaObservacaoPrincipal, ...resto } = item;
                        return resto;
                    });
                } else if (!grupo.some(({ item }) => item.linhaObservacaoPrincipal)) {
                    const primeiroIndice = grupo[0].i;
                    itens = itens.map((item, i) => i === primeiroIndice
                        ? { ...item, linhaObservacaoPrincipal: true }
                        : item);
                }
            }
            return { ...pedidoAtual, itens };
        });
    };

    const alterarAcrescimo = (index, valor) => {
        setPedido((atual) => ({
            ...atual,
            itens: atual.itens.map((item, i) => i === index
                ? { ...item, acrescimoAjuste: { ...item.acrescimoAjuste, valor } }
                : item),
        }));
    };

    const alterarUnidadeAcrescimo = (index, tipo) => {
        setPedido((atual) => ({
            ...atual,
            itens: atual.itens.map((item, i) => i === index
                ? { ...item, acrescimoAjuste: { ...item.acrescimoAjuste, tipo } }
                : item),
        }));
    };

    const alterarQuantidade = (index, valor) => {
        setPedido((pedidoAtual) => ({
            ...pedidoAtual,
            itens: pedidoAtual.itens.map((item, i) => {
                if (i !== index) {
                    return item;
                }

                return {
                    ...item,
                    quantidade: valor,
                };
            }),
        }));
    };

    const alterarObservacaoItem = (index, valor) => {
        setPedido((pedidoAtual) => ({
            ...pedidoAtual,
            itens: pedidoAtual.itens.map((item, i) => (
                i === index ? { ...item, observacaoItem: valor } : item
            )),
        }));
    };

    const dividirItemParaObservacao = (index) => {
        setPedido((pedidoAtual) => {
            const item = pedidoAtual.itens[index];
            const quantidade = Number(item?.quantidade);
            if (!item || quantidade < 2 || !Number.isInteger(quantidade)) return pedidoAtual;

            const ajuste = item.acrescimoAjuste || { valor: "", tipo: "R$" };
            const valorAjuste = Number(ajuste.valor || 0);
            const temAcrescimo = Number.isFinite(valorAjuste) && valorAjuste > 0;
            const grupoObservacaoId = item.grupoObservacaoId
                || globalThis.crypto?.randomUUID?.()
                || `${Date.now()}-${Math.random()}`;
            const valorNovaLinha = !temAcrescimo
                ? ""
                : ajuste.tipo === "%"
                ? valorAjuste
                : Number((valorAjuste / quantidade).toFixed(2));
            const itemOriginal = {
                ...item,
                grupoObservacaoId,
                linhaObservacaoPrincipal: item.grupoObservacaoId
                    ? Boolean(item.linhaObservacaoPrincipal)
                    : true,
                quantidade: quantidade - 1,
                acrescimoAjuste: !temAcrescimo
                    ? { ...ajuste, valor: "" }
                    : ajuste.tipo === "%"
                    ? { ...ajuste, valor: valorAcrescimoVisivel(ajuste.valor) }
                    : { ...ajuste, valor: valorAcrescimoVisivel(Number((valorAjuste - valorNovaLinha).toFixed(2))) },
            };
            const novaLinha = {
                ...item,
                chaveLocal: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
                grupoObservacaoId,
                linhaObservacaoPrincipal: false,
                quantidade: 1,
                observacaoItem: "",
                acrescimoAjuste: { ...ajuste, valor: valorAcrescimoVisivel(valorNovaLinha) },
            };
            const itens = [...pedidoAtual.itens];
            itens.splice(index, 1, itemOriginal, novaLinha);
            return { ...pedidoAtual, itens };
        });
    };

    const juntarVariacaoObservacao = (index) => {
        setPedido((pedidoAtual) => {
            const variacao = pedidoAtual.itens[index];
            const grupoId = variacao?.grupoObservacaoId;
            if (!grupoId) return pedidoAtual;
            const grupo = pedidoAtual.itens.map((item, i) => ({ item, i }))
                .filter(({ item }) => item.grupoObservacaoId === grupoId);
            const principal = grupo.find(({ item }) => item.linhaObservacaoPrincipal)
                || grupo.find(({ i }) => i !== index);
            if (!principal || principal.i === index) return pedidoAtual;

            const itemPrincipal = principal.item;
            const quantidadePrincipal = Number(itemPrincipal.quantidade || 0);
            const quantidadeVariacao = Number(variacao.quantidade || 0);
            const ajustePrincipal = itemPrincipal.acrescimoAjuste || { valor: 0, tipo: "R$" };
            const ajusteVariacao = variacao.acrescimoAjuste || { valor: 0, tipo: "R$" };
            const precoBase = Number(itemPrincipal.produto?.precoVenda ?? itemPrincipal.produto?.preco ?? 0);
            const valorAcrescimoEmReais = (item, ajuste) => ajuste.tipo === "%"
                ? precoBase * Number(item.quantidade || 0) * Number(ajuste.valor || 0) / 100
                : Number(ajuste.valor || 0);
            const mesmoPercentual = ajustePrincipal.tipo === "%"
                && ajusteVariacao.tipo === "%"
                && Number(ajustePrincipal.valor) === Number(ajusteVariacao.valor);
            const acrescimoMesclado = mesmoPercentual
                ? ajustePrincipal
                : {
                    tipo: "R$",
                    valor: Number((valorAcrescimoEmReais(itemPrincipal, ajustePrincipal)
                        + valorAcrescimoEmReais(variacao, ajusteVariacao)).toFixed(2)),
                };
            const observacaoPrincipal = itemPrincipal.observacaoItem?.trim()
                ? itemPrincipal.observacaoItem
                : variacao.observacaoItem || "";
            const unidos = {
                ...itemPrincipal,
                quantidade: quantidadePrincipal + quantidadeVariacao,
                observacaoItem: observacaoPrincipal,
                acrescimoAjuste: acrescimoMesclado,
            };
            const restantes = grupo.length - 2;
            const { grupoObservacaoId: grupoIgnorado, linhaObservacaoPrincipal: principalIgnorado, ...itemSemGrupo } = unidos;
            const itemFinal = restantes > 0
                ? { ...unidos, linhaObservacaoPrincipal: true }
                : itemSemGrupo;
            const itens = pedidoAtual.itens
                .map((item, i) => i === principal.i ? itemFinal : item)
                .filter((_, i) => i !== index);
            return { ...pedidoAtual, itens };
        });
    };

    const alterarEntrada = (valor) => {

        setEntrada(valor);

    };

    const voltarPedidos = () => {
        navigate("/pedidos");
    };

    const totalItens = pedido.itens.reduce(
        (total, item) => !item || typeof item !== "object"
            ? total
            : total + calcularPrecoUnitarioFinal(item) * Number(item.quantidade || 0) + calcularAcrescimoItem(item),
        0
    );
    const taxaEntrega = Number(pedido.taxaEntrega || 0);
    const descontoPedidoAjuste = pedido.descontoPedidoAjuste || { valor: "", tipo: "R$" };
    const valorDescontoPedido = Number(descontoPedidoAjuste.valor || 0);
    const totalAntesDesconto = totalItens + taxaEntrega;
    const descontoPedido = descontoPedidoAjuste.tipo === "%"
        ? Number((totalAntesDesconto * valorDescontoPedido / 100).toFixed(2))
        : valorDescontoPedido;
    const totalPedido = Math.max(0, totalItens + taxaEntrega - descontoPedido);
    const valorEntrada = Number(entrada || 0);

    const abrirFluxoEndereco = () => {
        limparNotificacao();
        if (!pedido.cliente) return exibirErro("Selecione um cliente para continuar.");
        if (!pedido.dataEntrega) return exibirErro("Informe a data de retirada.");
        if (pedido.dataEntrega < hojeISO()) {
            return exibirErro("A data de retirada não pode ser anterior a hoje.");
        }
        if (!pedido.itens.length || pedido.itens.some((item) => {
            if (!item || typeof item !== "object") return true;
            const quantidade = Number(item.quantidade);
            const acrescimo = Number(item.acrescimoAjuste?.valor || 0);
            return !item.produto?.id || !Number.isInteger(quantidade) || quantidade < 1
                || !Number.isFinite(acrescimo) || acrescimo < 0
                || (item.acrescimoAjuste?.tipo === "%" && acrescimo > 100);
        })) {
            return exibirErro("Confira os produtos, quantidades e acréscimos informados.");
        }
        if (!Number.isFinite(taxaEntrega) || taxaEntrega < 0) {
            return exibirErro("A taxa de entrega não pode ser negativa.");
        }
        if (!Number.isFinite(valorDescontoPedido) || valorDescontoPedido < 0
            || (descontoPedidoAjuste.tipo === "%" && valorDescontoPedido > 100)
            || !Number.isFinite(descontoPedido) || descontoPedido > totalAntesDesconto) {
            return exibirErro(descontoPedidoAjuste.tipo === "%"
                ? "O desconto percentual deve estar entre 0% e 100%."
                : "O desconto do pedido deve estar entre R$ 0,00 e o total dos itens com a taxa de entrega.");
        }
        if (!Number.isFinite(valorEntrada) || valorEntrada < 0 || valorEntrada > totalPedido) {
            return exibirErro("O pagamento inicial deve ser entre R$ 0,00 e o total do pedido.");
        }
        if (valorEntrada > 0 && !metodoPagamentoId) {
            return exibirErro(erroMetodosPagamento || "Selecione um método para registrar o pagamento inicial.");
        }
        setModalEnderecoAberto(true);
    };

    const salvarPedido = async (enderecoEntrega) => {
        setSalvando(true);
        limparNotificacao();
        try {
            const pedidoParaSalvar = {
                clienteId: pedido.cliente.id,
                dataEntrega: `${pedido.dataEntrega}T23:59:59`,
                taxaEntrega,
                descontoPedido,
                observacao: pedido.observacao.trim(),
                eventoId: pedido.eventoId || null,
                enderecoEntrega,
                itens: pedido.itens.map((item) => ({
                    produtoId: Number(item.produto.id),
                    precoUnitario: calcularPrecoUnitarioFinal(item),
                    acrescimo: calcularAcrescimoItem(item),
                    quantidade: Number(item.quantidade),
                    observacaoItem: item.observacaoItem?.trim() || "",
                })),
            };

            const response = await api.post("/pedidos", pedidoParaSalvar);
            const pedidoCriado = response.data;

            try {
                await api.patch(`/pedidos/${pedidoCriado.id}/status`, {
                    novoStatus: "AGUARDANDO_SINAL",
                    observacao: "",
                });

                if (valorEntrada > 0) {
                    await api.post(
                        `/pedidos/${pedidoCriado.id}/pagamentos`,
                        {
                            valor: valorEntrada,
                            tipoPagamento: valorEntrada >= totalPedido ? "INTEGRAL" : "SINAL",
                            statusPagamento: statusEntrada,
                            metodoPagamentoId: Number(metodoPagamentoId),
                        },
                        { headers: { "Idempotency-Key": criarChaveIdempotencia() } }
                    );

                }
            } catch (erroEtapaFinal) {
                setPedidoIncompletoId(pedidoCriado.id);
                setErroPedidoIncompleto(
                    `O pedido #${pedidoCriado.id} foi criado, mas não foi possível concluir o status ou pagamento inicial. Abra o pedido para finalizar essa etapa. ${mensagemErroApi(erroEtapaFinal, "")}`.trim()
                );
                setModalEnderecoAberto(false);
                return;
            }

            setModalEnderecoAberto(false);
            navigate(`/pedidos/${pedidoCriado.id}`);
        } catch (error) {
            exibirErro(mensagemErroApi(error, "Não foi possível criar o pedido."));
        } finally {
            setSalvando(false);
        }
    };

    return (

        <div className="novoPedido-layout">

            <Menu active="pedidos" />

            <main className="novoPedido-content">

                {mensagemErro && !pedidoIncompletoId && <div className="novo-pedido-notificacao erro" role="alert">{mensagemErro}</div>}
                {mensagemSucesso && <div className="novo-pedido-notificacao sucesso" role="status">{mensagemSucesso}</div>}

                <HeaderNovoPedido onBack={voltarPedidos} />

                <div className="novoPedido-top">

                    <ClienteCard
                        clientes={clientes}
                        setClientes={setClientes}
                        pedido={pedido}
                        setPedido={setPedido}
                        onCriarClienteErro={exibirErroCadastro}
                        onCriarClienteSucesso={() => exibirSucessoCadastro("Cliente criado com sucesso!")}
                    />

                    <DetalhesPedidoCard
                        eventos={eventos}
                        setEventos={setEventos}
                        pedido={pedido}
                        setPedido={setPedido}
                        onCriarEventoErro={exibirErroCadastro}
                        onCriarEventoSucesso={() => exibirSucessoCadastro("Evento criado com sucesso!")}
                    />

                </div>

                <ItensPedidoCard
                    itens={pedido.itens}
                    produtos={produtos}
                    adicionarItens={adicionarItens}
                    removerItem={removerItem}
                    alterarQuantidade={alterarQuantidade}
                    alterarAcrescimo={alterarAcrescimo}
                    alterarUnidadeAcrescimo={alterarUnidadeAcrescimo}
                    alterarObservacaoItem={alterarObservacaoItem}
                    dividirItemParaObservacao={dividirItemParaObservacao}
                    juntarVariacaoObservacao={juntarVariacaoObservacao}
                    entrada={entrada}
                    alterarEntrada={alterarEntrada}
                    statusEntrada={statusEntrada}
                    onAlterarStatusEntrada={setStatusEntrada}
                    taxaEntrega={pedido.taxaEntrega}
                    descontoPedido={descontoPedido}
                    descontoPedidoAjuste={descontoPedidoAjuste}
                    onAlterarDescontoPedido={(valor) => setPedido((atual) => ({
                        ...atual,
                        descontoPedidoAjuste: { ...atual.descontoPedidoAjuste, valor },
                    }))}
                    onAlterarTipoDescontoPedido={(tipo) => setPedido((atual) => ({
                        ...atual,
                        descontoPedidoAjuste: { ...atual.descontoPedidoAjuste, tipo },
                    }))}
                    metodosPagamento={metodosPagamento}
                    metodoPagamentoId={metodoPagamentoId}
                    onAlterarMetodoPagamento={setMetodoPagamentoId}
                    erroMetodosPagamento={erroMetodosPagamento}
                    criarProduto={criarProduto}
                    onCriarProdutoSucesso={() => exibirSucessoCadastro("Produto criado com sucesso!")}
                    voltarPedidos={voltarPedidos}
                    salvarPedido={abrirFluxoEndereco}
                    salvando={salvando}
                    pedidoIncompletoId={pedidoIncompletoId}
                    erroSalvamento={erroPedidoIncompleto}
                    abrirPedido={(id) => navigate(`/pedidos/${id}`)}
                />

            </main>

            <ModalEnderecoPedido
                open={modalEnderecoAberto}
                cliente={pedido.cliente}
                onClose={() => setModalEnderecoAberto(false)}
                onConfirm={salvarPedido}
            />

        </div>

    );

}

export default NovoPedido;
