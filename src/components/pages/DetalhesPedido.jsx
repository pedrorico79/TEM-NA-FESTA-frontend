import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import Menu from "../shared/menu/Menu";

import DadosCliente from "../detalhesPedido/DadosCliente";
import EnderecoPedido from "../detalhesPedido/EnderecoPedido";
import ModalEditarItensPedido from "../detalhesPedido/ModalEditarItensPedido";
import ModalEditarCliente from "../clientes/ModalEditarCliente";
import Modal from "../shared/modal/Modal";

import ItensPedido from "../detalhesPedido/ItensPedido";

import PagamentosPedido from "../detalhesPedido/PagamentosPedido";


import { api } from "../../services/api";

import "../css/DetalhesPedido.css";

function formatarEndereco(endereco) {
    if (!endereco) {
        return "Não informado";
    }

    return `${endereco.logradouro}, ${endereco.numero}${
        endereco.complemento
            ? ` - ${endereco.complemento}`
            : ""
    } - ${endereco.bairro}, ${endereco.cidade} - ${
        endereco.estado
    }, ${endereco.cep}`;
}

function dataLocalParaInput(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function dataEntregaParaAtualizacao(dataEntrega) {
    if (!dataEntrega) return dataEntrega;
    return `${String(dataEntrega).slice(0, 10)}T23:59:59`;
}

function mensagemErroPedido(error, fallback) {
    const resposta = error.response?.data;
    if (Array.isArray(resposta?.detalhes) && resposta.detalhes.length) {
        return resposta.detalhes.join(" ");
    }
    return resposta?.message || resposta?.erro || fallback;
}

function formatarItensPedido(itens = []) {
    return itens.map((item) => ({
        id: item.id,
        produtoId: item.produto?.id ?? item.produtoId,
        produto: item.produto?.nome ?? "Produto não encontrado",
        descricao: item.produto?.descricao ?? "",
        observacaoItem: item.observacaoItem ?? "",
        qtd: Number(item.quantidade ?? 0),
        precoUnitario: Number(item.precoUnitario ?? 0),
        desconto: 0,
        subtotal: Number(item.precoUnitario ?? 0) * Number(item.quantidade ?? 0),
    }));
}

function formatarItensParaApi(itens = []) {
    return itens.map((item) => ({
        produtoId: item.produto?.id ?? item.produtoId,
        precoUnitario: Number(item.precoUnitario ?? 0),
        quantidade: Number(item.quantidade ?? 1),
        observacaoItem: item.observacaoItem ?? "",
    }));
}

function DetalhesPedido() {
    const navigate = useNavigate();

    const { id } = useParams();

    const [pedido, setPedido] = useState(null);
    const [pedidoApi, setPedidoApi] = useState(null);
    const [enderecoPedido, setEnderecoPedido] = useState(null);
    const [clienteEditavel, setClienteEditavel] = useState(null);
    const [modalEditarClienteOpen, setModalEditarClienteOpen] = useState(false);
    const [modalDataRetiradaOpen, setModalDataRetiradaOpen] = useState(false);
    const [modalEditarItensOpen, setModalEditarItensOpen] = useState(false);
    const [dataRetiradaEditada, setDataRetiradaEditada] = useState("");
    const [erroEdicaoPedido, setErroEdicaoPedido] = useState("");
    const [salvandoPedido, setSalvandoPedido] = useState(false);
    const [mensagemSucesso, setMensagemSucesso] = useState("");
    const [statusAtualizando, setStatusAtualizando] = useState(false);
    const [erroStatusPedido, setErroStatusPedido] = useState("");

    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState(false);

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

                    dadosCliente: {
                        nome:
                            cliente?.nome ??
                            "Cliente não encontrado",

                        evento:
                            evento?.nome ??
                            evento?.descricao ??
                            "Sem evento",

                        telefone:
                            cliente?.telefone ??
                            "Não informado",

                        whatsapp:
                            cliente?.whatsapp ??
                            cliente?.telefone ??
                            "Não informado",

                        instagram:
                            cliente?.instagram ??
                            "Não informado"
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

                    pagamentos:
                        (pedidoRecebido.pagamentos ?? []).map(
                            (pagamento) => ({
                                id: pagamento.id,

                                data:
                                    formatarDataCompleta(
                                        pagamento.dataPagamento
                                    ),

                                valor:
                                    Number(
                                        pagamento.valor ?? 0
                                    ),

                                metodo:
                                    pagamento.tipoPagamento ??
                                    "Não informado"
                            })
                        )
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

    async function editarCliente(cliente) {
        const dadosCliente = {
            nome: cliente.nome,
            telefone: cliente.telefone,
            whatsapp: cliente.whatsapp,
            instagram: cliente.instagram,
            anotacoes: cliente.anotacoes,
            endereco: {
                cep: cliente.cep?.replace(/\D/g, ""),
                logradouro: cliente.logradouro,
                numero: cliente.numero,
                complemento: cliente.complemento,
                bairro: cliente.bairro,
                cidade: cliente.cidade,
                estado: cliente.estado
            }
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
                endereco: formatarEndereco(clienteAtualizado.endereco),
                telefone: clienteAtualizado.telefone,
                whatsapp: clienteAtualizado.whatsapp ?? clienteAtualizado.telefone,
                instagram: clienteAtualizado.instagram
            }
        }));

        return clienteAtualizado;
    }

    function mostrarSucessoEdicaoCliente() {
        setMensagemSucesso("Cliente editado com sucesso!");
        window.setTimeout(() => setMensagemSucesso(""), 3000);
    }

    function abrirEdicaoDataRetirada() {
        setDataRetiradaEditada(pedidoApi?.dataEntrega?.slice(0, 10) || "");
        setErroEdicaoPedido("");
        setModalDataRetiradaOpen(true);
    }

    async function salvarDataRetirada(e) {
        e.preventDefault();
        if (!dataRetiradaEditada || !pedidoApi) return;

        setSalvandoPedido(true);
        setErroEdicaoPedido("");
        try {
            const payload = {
                dataEntrega: `${dataRetiradaEditada}T23:59:59`,
                taxaEntrega: pedidoApi.taxaEntrega ?? 0,
                observacao: pedidoApi.observacao ?? "",
                eventoId: pedidoApi.eventoId ?? null,
                enderecoEntregaId: pedidoApi.enderecoEntregaId ?? null,
                itens: formatarItensParaApi(pedidoApi.itens),
            };

            const response = await api.put(
                `/pedidos/${pedidoApi.id}`,
                payload
            );
            const pedidoAtualizado = response.data;
            setPedidoApi(pedidoAtualizado);
            setEnderecoPedido(pedidoAtualizado.enderecoEntrega ?? enderecoPedido);
            setPedido((atual) => ({
                ...atual,
                dataEntrega: pedidoAtualizado.dataEntrega,
                datas: {
                    ...atual.datas,
                    dataRetirada: formatarDataCompleta(pedidoAtualizado.dataEntrega),
                },
            }));
            setModalDataRetiradaOpen(false);
            setMensagemSucesso("Data de retirada atualizada com sucesso!");
            window.setTimeout(() => setMensagemSucesso(""), 3000);
        } catch (error) {
            console.error("Erro ao atualizar data de retirada:", error);
            setErroEdicaoPedido(mensagemErroPedido(error, "Não foi possível atualizar a data de retirada."));
        } finally {
            setSalvandoPedido(false);
        }
    }

    async function salvarItensPedido(itens) {
        if (!pedidoApi) throw new Error("Pedido ainda não carregado.");
        const payload = {
            dataEntrega: dataEntregaParaAtualizacao(pedidoApi.dataEntrega),
            taxaEntrega: pedidoApi.taxaEntrega ?? 0,
            observacao: pedidoApi.observacao ?? "",
            eventoId: pedidoApi.eventoId ?? null,
            enderecoEntregaId: pedidoApi.enderecoEntregaId ?? null,
            itens,
        };

        try {
            const response = await api.put(`/pedidos/${pedidoApi.id}`, payload);
            setPedidoApi(response.data);
            setPedido((atual) => ({
                ...atual,
                itens: formatarItensPedido(response.data.itens),
            }));
            setMensagemSucesso("Itens do pedido atualizados com sucesso!");
            window.setTimeout(() => setMensagemSucesso(""), 3000);
        } catch (error) {
            console.error("Erro ao atualizar itens do pedido:", error);
            throw new Error(mensagemErroPedido(error, "Não foi possível atualizar os itens do pedido."));
        }
    }

    async function alterarStatusPedido(novoStatus) {
        const statusAtual = pedidoApi?.statusProducao;
        if (!statusAtual || !novoStatus || novoStatus === statusAtual) return;

        setStatusAtualizando(true);
        setErroStatusPedido("");
        try {
            const response = await api.patch(`/pedidos/${pedidoApi.id}/status`, {
                novoStatus,
                observacao: "",
            });
            setPedidoApi((atual) => ({ ...atual, ...response.data }));
            setPedido((atual) => ({ ...atual, status: response.data.statusProducao }));
            setMensagemSucesso("Status do pedido atualizado com sucesso!");
            window.setTimeout(() => setMensagemSucesso(""), 3000);
        } catch (error) {
            console.error("Erro ao atualizar status do pedido:", error);
            setErroStatusPedido(mensagemErroPedido(error, "Não foi possível atualizar o status do pedido."));
        } finally {
            setStatusAtualizando(false);
        }
    }

    if (carregando) {
        return (
            <div className="produtos-layout">
                <Menu active="pedidos" />

                <div className="produtos-content pedido-detalhes-container">
                    <h1>Carregando pedido...</h1>
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
                            navigate("/Pedidos")
                        }
                    >
                        <ion-icon name="arrow-back-outline"></ion-icon>

                        Voltar Para Todos Pedidos
                    </button>
                </div>
            </div>
        );
    }

    const totalPedido = pedido.itens.reduce(
        (acc, item) =>
            acc + Number(item.subtotal ?? 0),
        0
    );

    const totalPago = pedido.pagamentos.reduce(
        (acc, pagamento) =>
            acc + Number(pagamento.valor ?? 0),
        0
    );

    const totalAPagar =
        totalPedido - totalPago;

    return (
        <div className="produtos-layout">
            <Menu active="pedidos" />

            {mensagemSucesso && (
                <div className="pedido-cliente-sucesso" role="status">
                    {mensagemSucesso}
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
                            <select
                                className={`badge-status badge-status-select ${
                                    pedido.status === "RASCUNHO"
                                        ? "rascunho"
                                        : pedido.status === "AGUARDANDO_SINAL" || pedido.status === "CONFIRMADO"
                                            ? "naoIniciado"
                                            : pedido.status === "EM_PRODUCAO"
                                                ? "producao"
                                                : pedido.status === "PRONTO_PARA_ENTREGA"
                                                    ? "pronto"
                                                    : pedido.status === "ENTREGUE"
                                                        ? "entregue"
                                                        : pedido.status === "CANCELADO"
                                                            ? "cancelado"
                                                            : ""
                                }`}
                                value={pedido.status}
                                onChange={(event) => alterarStatusPedido(event.target.value)}
                                disabled={statusAtualizando || !pedidoApi || !proximosStatusPermitidos(pedido.status).length}
                                aria-label="Alterar status do pedido"
                            >
                                <option value={pedido.status}>{formatarStatus(pedido.status)}</option>
                                {proximosStatusPermitidos(pedido.status).map((status) => (
                                    <option key={status} value={status}>{formatarStatus(status)}</option>
                                ))}
                            </select>
                            {erroStatusPedido && (
                                <p className="erro-status-pedido" role="alert">{erroStatusPedido}</p>
                            )}
                        </div>

                        </div>

                        <div className="card-datas">

                            <div className="datas-grid">

                                <div className="dado-data">

                                    <span className="dado-label">
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
                                        <span className="dado-valor">
                                            {pedido.datas.dataRetirada}
                                        </span>
                                        <button
                                            type="button"
                                            className="btn-editar-data-retirada"
                                            onClick={abrirEdicaoDataRetirada}
                                            disabled={["ENTREGUE", "CANCELADO"].includes(pedidoApi?.statusProducao)}
                                            aria-label="Editar data de retirada"
                                            title={["ENTREGUE", "CANCELADO"].includes(pedidoApi?.statusProducao)
                                                ? "Não é possível alterar um pedido entregue ou cancelado"
                                                : "Editar data de retirada"}
                                        >
                                            <ion-icon name="pencil-outline"></ion-icon>
                                        </button>
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                    <button
                        className="btn-voltar"
                        onClick={() =>
                            navigate("/Pedidos")
                        }
                    >
                        <ion-icon name="arrow-back-outline"></ion-icon>

                        Voltar Para Todos Pedidos
                    </button>

                </div>

                <div className="pedido-grid-layout">

                    <div className="pedido-col-esquerda">



                        <ItensPedido
                            itens={pedido.itens}
                            total={totalPedido}
                            onEditar={() => setModalEditarItensOpen(true)}
                        />

                        <PagamentosPedido
                            pagamentos={pedido.pagamentos}
                            totalAPagar={totalAPagar}
                            totalPago={totalPago}
                        />

                    </div>

                    <div className="pedido-col-direita">

                        {/* <h2>Datas do Pedido</h2> */}



                        <DadosCliente
                            cliente={pedido.dadosCliente}
                            onEditar={clienteEditavel
                                ? () => setModalEditarClienteOpen(true)
                                : undefined}
                        />

                        <EnderecoPedido endereco={enderecoPedido} />

                        {/* <div className="recibo-secao">

                            <h2 className="recibo-titulo-main">
                                Recibo
                            </h2>

                            <ReciboPedido
                                pedido={pedido}
                                totalPedido={totalPedido}
                                totalPago={totalPago}
                                totalAPagar={totalAPagar}
                            />

                        </div> */}

                    </div>

                </div>

            </div>

            <ModalEditarCliente
                open={modalEditarClienteOpen}
                cliente={clienteEditavel}
                onClose={() => setModalEditarClienteOpen(false)}
                onSalvar={editarCliente}
                onSucesso={mostrarSucessoEdicaoCliente}
            />

            <ModalEditarItensPedido
                open={modalEditarItensOpen}
                itens={pedidoApi?.itens ?? []}
                onClose={() => setModalEditarItensOpen(false)}
                onSalvar={salvarItensPedido}
            />

            <Modal
                open={modalDataRetiradaOpen}
                onClose={() => setModalDataRetiradaOpen(false)}
                title="Editar data de retirada"
            >
                <form onSubmit={salvarDataRetirada}>
                    <div className="form-group">
                        <label htmlFor="data-retirada-pedido">Data de retirada *</label>
                        <input
                            id="data-retirada-pedido"
                            type="date"
                            min={dataLocalParaInput(new Date())}
                            value={dataRetiradaEditada}
                            onChange={(e) => setDataRetiradaEditada(e.target.value)}
                            required
                        />
                    </div>
                    {erroEdicaoPedido && (
                        <p role="alert" className="erro-edicao-pedido">{erroEdicaoPedido}</p>
                    )}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => setModalDataRetiradaOpen(false)}
                            disabled={salvandoPedido}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="primary-button"
                            disabled={salvandoPedido}
                        >
                            {salvandoPedido ? "Salvando…" : "Salvar"}
                        </button>
                    </div>
                </form>
            </Modal>
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
        AGUARDANDO_SINAL: "Não iniciado",
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
