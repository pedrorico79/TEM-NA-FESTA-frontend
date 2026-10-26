import { useEffect, useRef, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import Menu from "../shared/menu/Menu";
import LoadingState from "../shared/LoadingState";

import DadosCliente from "../detalhesPedido/DadosCliente";
import InformacoesPedido from "../detalhesPedido/InformacoesPedido";
import ModalEditarDadosPedido from "../detalhesPedido/ModalEditarDadosPedido";
import ModalEditarItensPedido from "../detalhesPedido/ModalEditarItensPedido";
import ModalEditarCliente from "../clientes/ModalEditarCliente";
import ItensPedido from "../detalhesPedido/ItensPedido";

import PagamentosPedido from "../detalhesPedido/PagamentosPedido";
import ModalAdicionarPagamento from "../detalhesPedido/ModalAdicionarPagamento";
import ModalConfirmacao from "../shared/modal/ModalConfirmacao";
import FiltroDropdown from "../pedidos/FiltroDropdown";


import { api } from "../../services/api";

import "../css/DetalhesPedido.css";

function dataEntregaParaAtualizacao(dataEntrega) {
    if (!dataEntrega) return dataEntrega;
    return `${String(dataEntrega).slice(0, 10)}T23:59:59`;
}

function dataEstaAtrasada(dataEntrega) {
    if (!dataEntrega) return false;
    const hoje = new Date();
    const hojeLocal = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
    const dataRetiradaLocal = String(dataEntrega).slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(dataRetiradaLocal) && dataRetiradaLocal < hojeLocal;
}

function statusPedidoOperacional(status) {
    return ["AGUARDANDO_SINAL", "CONFIRMADO", "EM_PRODUCAO", "PRONTO_PARA_ENTREGA"].includes(status);
}

function mensagemErroPedido(error, fallback) {
    const resposta = error.response?.data;
    if (Array.isArray(resposta?.detalhes) && resposta.detalhes.length) {
        return resposta.detalhes.join(" ");
    }
    return resposta?.message || resposta?.erro || fallback;
}

function mensagemErroStatusPedido(error) {
    if (error.response?.status === 409) {
        const detalhe = mensagemErroPedido(error, "");
        const detalheGenerico = !detalhe
            || detalhe === "Os dados enviados conflitam com um registro existente."
            || detalhe.startsWith("Não foi possível concluir a operação devido a um conflito")
            || detalhe.startsWith("O banco recusou a operação por uma restrição de integridade")
            || detalhe.startsWith("O banco recusou a operação por um conflito de integridade que não pôde ser identificado.");
        if (!detalheGenerico) {
            return detalhe;
        }
        return "O status não foi alterado: o backend rejeitou a gravação por uma restrição de dados. Atualize o pedido e tente novamente. Se persistir, verifique o log do backend para identificar a restrição exata.";
    }
    return mensagemErroPedido(error, "Não foi possível atualizar o status do pedido.");
}

function formatarItensPedido(itens = []) {
    return itens.map((item) => ({
        id: item.id,
        produtoId: item.produto?.id ?? item.produtoId,
        produto: item.produto?.nome ?? "Produto não encontrado",
        descricao: item.produto?.descricao ?? "",
        precoBaseProduto: Number(
            item.produto?.precoVenda ?? item.produto?.preco ?? item.precoUnitario ?? 0
        ),
        observacaoItem: item.observacaoItem ?? "",
        acrescimo: Number(item.acrescimo ?? 0),
        qtd: Number(item.quantidade ?? 0),
        precoUnitario: Number(item.precoUnitario ?? 0),
        subtotal: Number(item.precoUnitario ?? 0) * Number(item.quantidade ?? 0) + Number(item.acrescimo ?? 0),
    }));
}

function formatarItensParaApi(itens = []) {
    return itens.map((item) => ({
        itemId: item.id,
        produtoId: item.produto?.id ?? item.produtoId,
        precoUnitario: Number(item.precoUnitario ?? 0),
        acrescimo: Number(item.acrescimo ?? 0),
        quantidade: Number(item.quantidade ?? 1),
        observacaoItem: item.observacaoItem ?? "",
    }));
}

function classeStatusPedido(status) {
    const classes = {
        RASCUNHO: "rascunho",
        AGUARDANDO_SINAL: "aguardandoSinal",
        CONFIRMADO: "confirmado",
        EM_PRODUCAO: "producao",
        PRONTO_PARA_ENTREGA: "pronto",
        ENTREGUE: "entregue",
        CANCELADO: "cancelado",
    };

    return classes[status] ?? "";
}

function formatarPagamentoApi(pagamento, metodos = []) {
    const tipos = { SINAL: "Sinal", QUITACAO: "Quitação", INTEGRAL: "Integral" };
    const situacoes = { CONFIRMADO: "Recebido", PENDENTE: "Aguardando confirmação", CANCELADO: "Cancelado" };
    const metodo = metodos.find((item) => Number(item.id) === Number(pagamento.metodoPagamentoId));
    return {
        ...pagamento,
        data: formatarDataCompleta(pagamento.dataPagamento),
        valor: Number(pagamento.valor ?? 0),
        metodo: metodo?.nome || `Método ${pagamento.metodoPagamentoId ?? "não informado"}`,
        tipoLabel: tipos[pagamento.tipoPagamento] || pagamento.tipoPagamento || "Não informado",
        statusLabel: situacoes[pagamento.statusPagamento] || pagamento.statusPagamento || "Não informado",
    };
}

function DetalhesPedido() {
    const navigate = useNavigate();

    const { id } = useParams();

    const [pedido, setPedido] = useState(null);
    const [pedidoApi, setPedidoApi] = useState(null);
    const [enderecoPedido, setEnderecoPedido] = useState(null);
    const [clienteEditavel, setClienteEditavel] = useState(null);
    const [modalEditarClienteOpen, setModalEditarClienteOpen] = useState(false);
    const [modalEditarDadosPedidoOpen, setModalEditarDadosPedidoOpen] = useState(false);
    const [secaoModalDadosPedido, setSecaoModalDadosPedido] = useState("resumo");
    const [modalEditarItensOpen, setModalEditarItensOpen] = useState(false);
    const [mensagemSucesso, setMensagemSucesso] = useState("");
    const [mensagemErroNotificacao, setMensagemErroNotificacao] = useState("");
    const timeoutNotificacaoErro = useRef(null);
    const [statusAtualizando, setStatusAtualizando] = useState(false);
    const [statusSelecionado, setStatusSelecionado] = useState(null);
    const [notificarCliente, setNotificarCliente] = useState(false);
    const [unidadeAjusteItens, setUnidadeAjusteItens] = useState("R$");
    const [metodosPagamento, setMetodosPagamento] = useState([]);
    const [modalAdicionarPagamentoOpen, setModalAdicionarPagamentoOpen] = useState(false);
    const [pagamentoParaConfirmar, setPagamentoParaConfirmar] = useState(null);
    const [pagamentoParaCancelar, setPagamentoParaCancelar] = useState(null);
    const [salvandoPagamentoId, setSalvandoPagamentoId] = useState(null);
    const [eventos, setEventos] = useState([]);

    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState(false);

    function mostrarErroNotificacao(mensagem) {
        window.clearTimeout(timeoutNotificacaoErro.current);
        setMensagemSucesso("");
        setMensagemErroNotificacao(mensagem);
        timeoutNotificacaoErro.current = window.setTimeout(() => setMensagemErroNotificacao(""), 5000);
    }

    useEffect(() => {
        const buscarPedido = async () => {
            try {
                setCarregando(true);
                setErro(false);

                // Remove o "#" caso a URL esteja /Pedidos/#21
                const pedidoId = decodeURIComponent(id).replace("#", "");

                // Busca o pedido
                const pedidoResponse = await api.get(
                    `/pedidos/${pedidoId}`
                );

                const pedidoRecebido = pedidoResponse.data;
                setPedidoApi(pedidoRecebido);

                // Busca cliente
                let cliente = null;

                if (pedidoRecebido.clienteId != null) {
                    try {
                        const clienteResponse = await api.get(
                            `/clientes/${pedidoRecebido.clienteId}`
                        );

                        cliente = clienteResponse.data;
                    } catch (error) {
                        console.error(
                            "Erro ao buscar cliente:",
                            error
                        );
                    }
                }

                setClienteEditavel(cliente);
                setEnderecoPedido(pedidoRecebido.enderecoEntrega ?? cliente?.endereco ?? null);

                // Busca evento
                let evento = null;

                if (pedidoRecebido.eventoId != null) {
                    try {
                        const eventoResponse = await api.get(
                            `/eventos/${pedidoRecebido.eventoId}`
                        );

                        evento = eventoResponse.data;
                    } catch (error) {
                        console.error(
                            "Erro ao buscar evento:",
                            error
                        );
                    }
                }

                /*
                 * Converte o retorno da API para o formato
                 * utilizado pelos componentes da tela.
                 */
                const pedidoFormatado = {
                    ...pedidoRecebido,

                    id: `#${pedidoRecebido.id}`,

                    clienteNome:
                        cliente?.nome ??
                        "Cliente não encontrado",

                    status:
                        pedidoRecebido.statusProducao,

                    eventoNome:
                        evento?.nome ?? "Sem evento",

                    dadosCliente: {
                        nome:
                            cliente?.nome ??
                            "Cliente não encontrado",

                        telefone:
                            cliente?.telefone ??
                            "Não informado",

                        whatsapp:
                            cliente?.whatsapp ??
                            cliente?.telefone ??
                            "Não informado",

                        instagram:
                            cliente?.instagram ??
                            "Não informado",

                        anotacoes:
                            cliente?.anotacoes ?? ""
                    },

                    datas: {
                        dataPedido:
                            formatarDataCompleta(
                                pedidoRecebido.dataPedido
                            ),

                        dataRetirada:
                            formatarDataCompleta(
                                pedidoRecebido.dataEntrega
                            )
                    },

                    itens: formatarItensPedido(pedidoRecebido.itens),

                    pagamentos: (pedidoRecebido.pagamentos ?? []).map((pagamento) =>
                        formatarPagamentoApi(pagamento, metodosPagamento))
                };

                setPedido(pedidoFormatado);
            } catch (error) {
                console.error(
                    "Erro ao buscar pedido:",
                    error
                );

                setErro(true);
                setPedido(null);
            } finally {
                setCarregando(false);
            }
        };

        buscarPedido();
    }, [id]);

    useEffect(() => {
        api.get("/eventos", { params: { ativos: true } })
            .then((response) => {
                setEventos(Array.isArray(response.data) ? response.data : []);
            })
            .catch((error) => {
                console.error("Erro ao carregar eventos para o pedido:", error);
                mostrarErroNotificacao("Não foi possível carregar os eventos. Tente novamente mais tarde.");
            });

        api.get("/metodos-pagamento")
            .then((response) => {
                const metodos = Array.isArray(response.data) ? response.data : [];
                setMetodosPagamento(metodos);
            })
            .catch((error) => {
                console.error("Erro ao buscar métodos de pagamento:", error);
                mostrarErroNotificacao("Não foi possível carregar os métodos de pagamento. Tente novamente mais tarde.");
            });
    }, []);

    useEffect(() => {
        if (!metodosPagamento.length) return;
        setPedido((atual) => atual ? ({
            ...atual,
            pagamentos: (atual.pagamentos || []).map((pagamento) =>
                formatarPagamentoApi(pagamento, metodosPagamento)),
        }) : atual);
    }, [metodosPagamento]);

    function aplicarPedidoComPagamentos(pedidoRecebido) {
        setPedidoApi(pedidoRecebido);
        setPedido((atual) => ({
            ...atual,
            status: pedidoRecebido.statusProducao,
            statusProducao: pedidoRecebido.statusProducao,
            valorTotal: Number(pedidoRecebido.valorTotal ?? atual.valorTotal ?? 0),
            taxaEntrega: Number(pedidoRecebido.taxaEntrega ?? atual.taxaEntrega ?? 0),
            descontoPedido: Number(pedidoRecebido.descontoPedido ?? atual.descontoPedido ?? 0),
            deletado: Boolean(pedidoRecebido.deletado),
            pagamentos: (pedidoRecebido.pagamentos || []).map((pagamento) =>
                formatarPagamentoApi(pagamento, metodosPagamento)),
        }));
    }

    async function salvarPagamento(payload) {
        const { chaveIdempotencia, ...dadosPagamento } = payload;
        const response = await api.post(
            `/pedidos/${pedidoApi.id}/pagamentos`,
            dadosPagamento,
            { headers: { "Idempotency-Key": chaveIdempotencia } }
        );
        aplicarPedidoComPagamentos(response.data);
        setMensagemSucesso("Pagamento registrado com sucesso!");
        window.setTimeout(() => setMensagemSucesso(""), 3000);
    }

    async function confirmarPagamento() {
        if (!pagamentoParaConfirmar) return;
        setSalvandoPagamentoId(pagamentoParaConfirmar.id);
        try {
            const response = await api.patch(
                `/pedidos/${pedidoApi.id}/pagamentos/${pagamentoParaConfirmar.id}/confirmar`
            );
            aplicarPedidoComPagamentos(response.data);
            setPagamentoParaConfirmar(null);
            setMensagemSucesso("Pagamento confirmado com sucesso!");
            window.setTimeout(() => setMensagemSucesso(""), 3000);
        } catch (error) {
            mostrarErroNotificacao(mensagemErroPedido(error, "Não foi possível confirmar o pagamento."));
        } finally {
            setSalvandoPagamentoId(null);
        }
    }

    async function cancelarPagamento() {
        if (!pagamentoParaCancelar) return;
        setSalvandoPagamentoId(pagamentoParaCancelar.id);
        try {
            const response = await api.patch(
                `/pedidos/${pedidoApi.id}/pagamentos/${pagamentoParaCancelar.id}/cancelar`
            );
            aplicarPedidoComPagamentos(response.data);
            setPagamentoParaCancelar(null);
            setMensagemSucesso("Pagamento cancelado com sucesso!");
            window.setTimeout(() => setMensagemSucesso(""), 3000);
        } catch (error) {
            mostrarErroNotificacao(mensagemErroPedido(error, "Não foi possível cancelar o pagamento."));
        } finally {
            setSalvandoPagamentoId(null);
        }
    }

    async function editarCliente(cliente) {
        const dadosCliente = {
            nome: cliente.nome,
            telefone: cliente.telefone,
            whatsapp: cliente.whatsapp,
            instagram: cliente.instagram,
            anotacoes: cliente.anotacoes,
            // A edição neste modal não altera o endereço do cadastro do cliente.
            endereco: clienteEditavel?.endereco ?? null,
        };

        const response = await api.put(
            `/clientes/${cliente.id}`,
            dadosCliente
        );
        const clienteAtualizado = response.data;

        setClienteEditavel(clienteAtualizado);
        setPedido((pedidoAtual) => ({
            ...pedidoAtual,
            clienteNome: clienteAtualizado.nome,
            dadosCliente: {
                ...pedidoAtual.dadosCliente,
                nome: clienteAtualizado.nome,
                telefone: clienteAtualizado.telefone,
                whatsapp: clienteAtualizado.whatsapp ?? clienteAtualizado.telefone,
                instagram: clienteAtualizado.instagram,
                anotacoes: clienteAtualizado.anotacoes ?? ""
            }
        }));

        return clienteAtualizado;
    }

    function mostrarSucessoEdicaoCliente() {
        setMensagemSucesso("Cliente editado com sucesso!");
        window.setTimeout(() => setMensagemSucesso(""), 3000);
    }

    function abrirEdicaoDadosPedido(secao = "resumo") {
        setSecaoModalDadosPedido(secao);
        setModalEditarDadosPedidoOpen(true);
    }

    function enderecoParaApi(endereco) {
        if (!endereco) return null;
        return {
            cep: String(endereco.cep ?? "").replace(/\D/g, ""),
            logradouro: endereco.logradouro ?? "",
            numero: endereco.numero ?? "",
            complemento: endereco.complemento ?? "",
            bairro: endereco.bairro ?? "",
            cidade: endereco.cidade ?? "",
            estado: endereco.estado ?? "",
        };
    }

    async function salvarDadosPedido(alteracoes = {}) {
        if (!pedidoApi) throw new Error("Pedido ainda não carregado.");
        const enderecoAtual = pedidoApi.enderecoEntrega ?? clienteEditavel?.endereco ?? null;
        const payload = {
            dataEntrega: alteracoes.dataEntrega ?? dataEntregaParaAtualizacao(pedidoApi.dataEntrega),
            taxaEntrega: alteracoes.taxaEntrega ?? pedidoApi.taxaEntrega ?? 0,
            descontoPedido: alteracoes.descontoPedido ?? pedidoApi.descontoPedido ?? 0,
            observacao: alteracoes.observacao ?? pedidoApi.observacao ?? "",
            eventoId: Object.hasOwn(alteracoes, "eventoId") ? alteracoes.eventoId : pedidoApi.eventoId ?? null,
            enderecoEntrega: Object.hasOwn(alteracoes, "enderecoEntrega")
                ? enderecoParaApi(alteracoes.enderecoEntrega)
                : enderecoParaApi(enderecoAtual),
            itens: alteracoes.itens ?? formatarItensParaApi(pedidoApi.itens),
        };
        try {
            const response = await api.put(`/pedidos/${pedidoApi.id}`, payload);
            const pedidoAtualizado = response.data;
            const nomeEvento = pedidoAtualizado.eventoId == null
                ? "Sem evento"
                : eventos.find((evento) => Number(evento.id) === Number(pedidoAtualizado.eventoId))?.nome
                    ?? pedido.eventoNome
                    ?? "Evento não encontrado";
            setPedidoApi(pedidoAtualizado);
            setEnderecoPedido(pedidoAtualizado.enderecoEntrega ?? clienteEditavel?.endereco ?? null);
            setPedido((atual) => ({
                ...atual,
                dataEntrega: pedidoAtualizado.dataEntrega,
                eventoId: pedidoAtualizado.eventoId,
                eventoNome: nomeEvento,
                taxaEntrega: Number(pedidoAtualizado.taxaEntrega ?? 0),
                descontoPedido: Number(pedidoAtualizado.descontoPedido ?? 0),
                observacao: pedidoAtualizado.observacao ?? "",
                valorTotal: Number(pedidoAtualizado.valorTotal ?? 0),
                datas: {
                    ...atual.datas,
                    dataRetirada: formatarDataCompleta(pedidoAtualizado.dataEntrega),
                },
                itens: formatarItensPedido(response.data.itens),
            }));
            setModalEditarDadosPedidoOpen(false);
            setMensagemSucesso("Pedido atualizado com sucesso!");
            window.setTimeout(() => setMensagemSucesso(""), 3000);
            return pedidoAtualizado;
        } catch (error) {
            console.error("Erro ao atualizar pedido:", error);
            throw new Error(mensagemErroPedido(error, "Não foi possível atualizar o pedido."));
        }
    }

    async function salvarItensPedido({ itens, descontoPedido, taxaEntrega }) {
        await salvarDadosPedido({ itens, descontoPedido, taxaEntrega });
    }

    async function confirmarAlteracaoStatus() {
        const novoStatus = statusSelecionado;
        const statusAtual = pedidoApi?.statusProducao;
        if (!statusAtual || !novoStatus || novoStatus === statusAtual) return;

        setStatusAtualizando(true);
        try {
            const response = await api.patch(`/pedidos/${pedidoApi.id}/status`, {
                novoStatus,
                observacao: "",
                notificarCliente,
            });
            setPedidoApi((atual) => ({ ...atual, ...response.data }));
            setPedido((atual) => ({
                ...atual,
                status: response.data.statusProducao,
                statusProducao: response.data.statusProducao,
            }));
            setStatusSelecionado(null);
            setNotificarCliente(false);
            if (response.headers?.["x-notificacao-cliente"] === "falhou") {
                mostrarErroNotificacao("O status foi atualizado, mas não foi possível enviar a mensagem ao cliente. O cliente não foi notificado.");
            } else {
                window.clearTimeout(timeoutNotificacaoErro.current);
                setMensagemErroNotificacao("");
                setMensagemSucesso("Status do pedido atualizado com sucesso!");
                window.setTimeout(() => setMensagemSucesso(""), 3000);
            }
        } catch (error) {
            console.error("Erro ao atualizar status do pedido:", error);
            const mensagem = mensagemErroStatusPedido(error);
            setStatusSelecionado(null);
            setNotificarCliente(false);
            setMensagemSucesso("");
            mostrarErroNotificacao(mensagem);
        } finally {
            setStatusAtualizando(false);
        }
    }

    if (carregando) {
        return (
            <div className="produtos-layout">
                <Menu active="pedidos" />

                <div className="produtos-content pedido-detalhes-container">
                    <LoadingState label="Carregando pedido…" />
                </div>
            </div>
        );
    }

    if (erro || !pedido) {
        return (
            <div className="produtos-layout">
                <Menu active="pedidos" />

                <div className="produtos-content pedido-detalhes-container">
                    <h1>Pedido não encontrado</h1>

                    <button
                        className="btn-voltar"
                        onClick={() =>
                            navigate("/pedidos")
                        }
                    >
                        <ion-icon name="arrow-back-outline"></ion-icon>
                        <span className="btn-voltar-texto-desktop">Voltar Para Todos Pedidos</span>
                        <span className="btn-voltar-texto-mobile">Voltar</span>
                    </button>
                </div>
            </div>
        );
    }

    const subtotalItens = pedido.itens.reduce(
        (acc, item) =>
            acc + Number(item.subtotal ?? 0),
        0
    );
    const totalPedido = Number(pedido.valorTotal ?? (
        subtotalItens + Number(pedido.taxaEntrega ?? 0) - Number(pedido.descontoPedido ?? 0)
    ));

    const totalPago = pedido.pagamentos.reduce(
        (acc, pagamento) =>
            pagamento.statusPagamento === "CONFIRMADO" ? acc + Number(pagamento.valor ?? 0) : acc,
        0
    );
    const totalPendente = pedido.pagamentos.reduce(
        (acc, pagamento) =>
            pagamento.statusPagamento === "PENDENTE" ? acc + Number(pagamento.valor ?? 0) : acc,
        0
    );
    const totalComprometido = pedido.pagamentos.reduce(
        (acc, pagamento) =>
            pagamento.statusPagamento !== "CANCELADO" ? acc + Number(pagamento.valor ?? 0) : acc,
        0
    );

    const totalAPagar = Math.max(totalPedido - totalPago, 0);
    const saldoDisponivel = Math.max(totalPedido - totalComprometido, 0);
    const podeExibirAcaoPagamento = !pedido.deletado
        && pedido.statusProducao !== "CANCELADO";
    const podeAdicionarPagamento = podeExibirAcaoPagamento && saldoDisponivel > 0;
    const pedidoAtrasado = dataEstaAtrasada(pedido.dataEntrega)
        && statusPedidoOperacional(pedido.statusProducao);
    const podeEditarDataRetirada = !pedido.deletado
        && !["ENTREGUE", "CANCELADO"].includes(pedido.statusProducao);
    const podeEditarDadosPedido = !pedidoAtrasado && !pedido.deletado
        && !["ENTREGUE", "CANCELADO"].includes(pedido.statusProducao);
    const podeEditarItens = !pedidoAtrasado && !pedido.deletado
        && !["EM_PRODUCAO", "PRONTO_PARA_ENTREGA", "ENTREGUE", "CANCELADO"].includes(pedido.statusProducao);
    const statusExibido = statusSelecionado ?? pedido.status;

    return (
        <div className="produtos-layout">
            <Menu active="pedidos" />

            {mensagemSucesso && (
                <div className="pedido-cliente-sucesso" role="status">
                    {mensagemSucesso}
                </div>
            )}
            {mensagemErroNotificacao && (
                <div className="pedido-cliente-erro" role="alert">
                    {mensagemErroNotificacao}
                </div>
            )}

            <div className="produtos-content pedido-detalhes-container">

                <div className="pedido-detalhe-header">

                    <div className="pedido-titulo-wrapper">

                        <div className="titulo-detalhe-pedido">

                        <h1>
                            Pedido{" "}
                            <span className="pedido-id">
                                {pedido.id}
                            </span>{" "}
                            - {pedido.clienteNome}
                        </h1>

                        <div className="status-pedido-control">
                            <FiltroDropdown
                                className={`status-pedido-dropdown badge-status ${classeStatusPedido(statusExibido)}`}
                                menuClassName="status-pedido-dropdown-menu"
                                value={statusExibido}
                                onChange={(valor) => {
                                    setNotificarCliente(false);
                                    setStatusSelecionado(valor === pedido.status ? null : valor);
                                }}
                                disabled={statusAtualizando || !pedidoApi || !proximosStatusPermitidos(pedido.status).length}
                                label="Alterar status do pedido"
                                options={[pedido.status, ...proximosStatusPermitidos(pedido.status)].map((status) => ({
                                    value: status,
                                    label: formatarStatus(status),
                                }))}
                            />
                        </div>

                        </div>

                        <div className="card-datas">

                            <div className="datas-grid">

                                <div className="dado-data">

                                    <span className="dado-label" title="Data criada automaticamente; não pode ser alterada.">
                                        Data do Pedido
                                    </span>

                                    <span className="dado-valor">
                                        {pedido.datas.dataPedido}
                                    </span>

                                </div>

                                <div className="dado-data">

                                    <span className="dado-label">
                                        Data de Retirada
                                    </span>

                                    <div className="data-retirada-valor">
                                        <span className={`dado-valor ${pedidoAtrasado ? "data-retirada-atrasada" : ""}`}>
                                            {pedido.datas.dataRetirada}
                                        </span>
                                        {podeEditarDataRetirada && <button
                                            type="button"
                                            className="btn-editar-data-retirada"
                                            onClick={() => abrirEdicaoDadosPedido("dataEntrega")}
                                            aria-label="Editar data de retirada"
                                            title="Editar data de retirada"
                                        >
                                            <ion-icon name="pencil-outline"></ion-icon>
                                        </button>}
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                    <button
                        className="btn-voltar"
                        onClick={() =>
                            navigate("/pedidos")
                        }
                    >
                        <ion-icon name="arrow-back-outline"></ion-icon>
                        <span className="btn-voltar-texto-desktop">Voltar Para Todos Pedidos</span>
                        <span className="btn-voltar-texto-mobile">Voltar</span>
                    </button>

                </div>

                <div className="pedido-grid-layout">

                    <div className="pedido-col-esquerda">



                        <ItensPedido
                            itens={pedido.itens}
                            total={subtotalItens}
                            taxaEntrega={pedido.taxaEntrega}
                            descontoPedido={pedidoApi?.descontoPedido ?? pedido.descontoPedido ?? 0}
                            totalAntesDesconto={subtotalItens + Number(pedido.taxaEntrega ?? 0)}
                            unidadeAjuste={unidadeAjusteItens}
                            onAlterarUnidadeAjuste={setUnidadeAjusteItens}
                            onEditar={podeEditarItens ? () => setModalEditarItensOpen(true) : undefined}
                            mensagemBloqueio={!podeEditarItens
                                ? pedidoAtrasado
                                    ? "Pedido atrasado. Apenas a data de retirada pode ser alterada."
                                    : "Os itens só podem ser alterados antes do início da produção."
                                : undefined}
                        />

                        <PagamentosPedido
                            pagamentos={pedido.pagamentos}
                            totalPedido={totalPedido}
                            totalAPagar={totalAPagar}
                            totalPago={totalPago}
                            totalPendente={totalPendente}
                            saldoDisponivel={saldoDisponivel}
                            podeExibirAcao={podeExibirAcaoPagamento}
                            podeAdicionar={podeAdicionarPagamento}
                            podeConfirmar={podeExibirAcaoPagamento}
                            onAdicionar={() => {
                                setModalAdicionarPagamentoOpen(true);
                            }}
                            onConfirmar={(pagamento) => setPagamentoParaConfirmar(pagamento)}
                            onCancelar={(pagamento) => setPagamentoParaCancelar(pagamento)}
                            salvandoPagamentoId={salvandoPagamentoId}
                        />

                    </div>

                    <div className="pedido-col-direita">
                        <InformacoesPedido
                            evento={pedido.eventoNome}
                            observacao={pedido.observacao}
                            onEditar={podeEditarDadosPedido ? () => abrirEdicaoDadosPedido("resumo") : undefined}
                            bloqueado={!podeEditarDadosPedido}
                            mensagemBloqueio={pedidoAtrasado ? "Pedido atrasado. Apenas a data de retirada pode ser alterada." : undefined}
                            atrasado={pedidoAtrasado}
                        />
                        <DadosCliente
                            cliente={pedido.dadosCliente}
                            endereco={enderecoPedido}
                            onEditar={clienteEditavel
                                ? () => {
                                    setModalEditarClienteOpen(true);
                                }
                                : undefined}
                            onEditarEndereco={podeEditarDadosPedido ? () => abrirEdicaoDadosPedido("endereco") : undefined}
                        />

                    </div>

                </div>

            </div>

            <ModalEditarCliente
                open={modalEditarClienteOpen}
                cliente={clienteEditavel}
                onClose={() => setModalEditarClienteOpen(false)}
                onSalvar={editarCliente}
                onSucesso={mostrarSucessoEdicaoCliente}
                onErro={mostrarErroNotificacao}
                somenteDadosCliente
            />

            <ModalEditarDadosPedido
                open={modalEditarDadosPedidoOpen}
                pedido={pedidoApi ? { ...pedidoApi, eventoNome: pedido.eventoNome } : null}
                enderecoPadrao={clienteEditavel?.endereco}
                eventos={eventos}
                secao={secaoModalDadosPedido}
                onClose={() => setModalEditarDadosPedidoOpen(false)}
                onSalvar={salvarDadosPedido}
                onErro={mostrarErroNotificacao}
            />

            <ModalEditarItensPedido
                open={modalEditarItensOpen}
                itens={pedidoApi?.itens ?? []}
                descontoPedido={pedidoApi?.descontoPedido ?? 0}
                taxaEntrega={pedidoApi?.taxaEntrega ?? 0}
                totalComprometido={(pedidoApi?.pagamentos ?? [])
                    .filter((pagamento) => pagamento.statusPagamento !== "CANCELADO")
                    .reduce((soma, pagamento) => soma + Number(pagamento.valor ?? 0), 0)}
                onClose={() => setModalEditarItensOpen(false)}
                onSalvar={salvarItensPedido}
                onErro={mostrarErroNotificacao}
            />

            <ModalAdicionarPagamento
                open={modalAdicionarPagamentoOpen}
                onClose={() => setModalAdicionarPagamentoOpen(false)}
                onSalvar={salvarPagamento}
                metodos={metodosPagamento}
                saldoDisponivel={saldoDisponivel}
                onErro={mostrarErroNotificacao}
            />

            <ModalConfirmacao
                open={Boolean(statusSelecionado && statusSelecionado !== pedido.status)}
                titulo="Confirmar alteração de status"
                onClose={() => {
                    setStatusSelecionado(null);
                    setNotificarCliente(false);
                }}
                onConfirmar={confirmarAlteracaoStatus}
                confirmando={statusAtualizando}
                mensagem={`Deseja alterar o status de “${formatarStatus(pedido.status)}” para “${formatarStatus(statusSelecionado)}”?`}
                conteudoAdicional={(
                    <label className="pedido-notificar-cliente">
                        <input
                            type="checkbox"
                            checked={notificarCliente}
                            onChange={(event) => setNotificarCliente(event.target.checked)}
                            disabled={statusAtualizando}
                        />
                        <span>Quero notificar o cliente</span>
                    </label>
                )}
            />

            <ModalConfirmacao
                open={Boolean(pagamentoParaConfirmar)}
                titulo="Confirmar recebimento"
                onClose={() => setPagamentoParaConfirmar(null)}
                onConfirmar={confirmarPagamento}
                confirmando={Boolean(salvandoPagamentoId)}
                mensagem={pagamentoParaConfirmar
                    ? `Deseja confirmar o recebimento de ${Number(pagamentoParaConfirmar.valor ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}?`
                    : "Deseja confirmar este pagamento?"}
            />

            <ModalConfirmacao
                open={Boolean(pagamentoParaCancelar)}
                onClose={() => setPagamentoParaCancelar(null)}
                onConfirmar={cancelarPagamento}
                confirmando={Boolean(salvandoPagamentoId)}
                mensagem="Deseja cancelar este pagamento? O valor será removido do total recebido e o registro ficará no histórico."
            />

        </div>
    );
}


/*
 * Formata:
 * 2026-08-06T14:30:00
 *
 * para:
 * 06/08/2026
 */
function formatarDataCompleta(data) {
    if (!data) {
        return "Não informado";
    }

    const dataObjeto = new Date(data);

    if (Number.isNaN(dataObjeto.getTime())) {
        return "Não informado";
    }

    const dia = String(
        dataObjeto.getDate()
    ).padStart(2, "0");

    const mes = String(
        dataObjeto.getMonth() + 1
    ).padStart(2, "0");

    const ano = dataObjeto.getFullYear();

    return `${dia}/${mes}/${ano}`;
}


/*
 * Converte o enum do backend para o texto
 * que aparece na tela.
 */
function formatarStatus(status) {
    const statusMap = {
        RASCUNHO: "Rascunho",
        AGUARDANDO_SINAL: "Aguardando sinal",
        CONFIRMADO: "Confirmado",
        EM_PRODUCAO: "Em Produção",
        PRONTO_PARA_ENTREGA: "Pronto",
        ENTREGUE: "Entregue",
        CANCELADO: "Cancelado"
    };

    return (
        statusMap[status] ??
        status ??
        "Não informado"
    );
}

function proximosStatusPermitidos(status) {
    const transicoes = {
        RASCUNHO: ["AGUARDANDO_SINAL", "CANCELADO"],
        AGUARDANDO_SINAL: ["CONFIRMADO", "CANCELADO"],
        CONFIRMADO: ["EM_PRODUCAO", "CANCELADO"],
        EM_PRODUCAO: ["PRONTO_PARA_ENTREGA", "CANCELADO"],
        PRONTO_PARA_ENTREGA: ["ENTREGUE", "CANCELADO"],
        ENTREGUE: [],
        CANCELADO: [],
    };

    return transicoes[status] ?? [];
}

export default DetalhesPedido;
