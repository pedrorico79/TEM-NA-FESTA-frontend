import React, { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import Menu from "../shared/menu/Menu";

import DadosCliente from "../detalhesPedido/DadosCliente";

import ItensPedido from "../detalhesPedido/ItensPedido";

import PagamentosPedido from "../detalhesPedido/PagamentosPedido";

import ReciboPedido from "../detalhesPedido/ReciboPedido";

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

function DetalhesPedido() {
    const navigate = useNavigate();

    const { id } = useParams();

    const [pedido, setPedido] = useState(null);

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

                        endereco: formatarEndereco(cliente?.endereco),

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

                    itens:
                        (pedidoRecebido.itens ?? []).map(
                            (item) => ({
                                id: item.id,

                                produto:
                                    item.produto?.nome ??
                                    "Produto não encontrado",

                                descricao:
                                    item.produto?.descricao ??
                                    "",

                                qtd:
                                    item.quantidade,

                                precoUnitario:
                                    Number(
                                        item.precoUnitario ?? 0
                                    ),

                                desconto: 0,

                                subtotal:
                                    Number(
                                        item.precoUnitario ?? 0
                                    ) *
                                    Number(
                                        item.quantidade ?? 0
                                    )
                            })
                        ),

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

            <div className="produtos-content pedido-detalhes-container">

                <div className="pedido-detalhe-header">

                    <div className="pedido-titulo-wrapper">

                        <h1>
                            Pedido{" "}
                            <span className="pedido-id">
                                {pedido.id}
                            </span>{" "}
                            - {pedido.clienteNome}
                        </h1>

                        <span
                            className={`badge-status ${
                                pedido.status ===
                                "AGUARDANDO_SINAL"
                                    ? "naoIniciado"
                                    : pedido.status ===
                                      "CONFIRMADO"
                                    ? "naoIniciado"
                                    : pedido.status ===
                                      "EM_PRODUCAO"
                                    ? "producao"
                                    : pedido.status ===
                                      "PRONTO_PARA_ENTREGA"
                                    ? "pronto"
                                    : pedido.status ===
                                      "ENTREGUE"
                                    ? "entregue"
                                    : pedido.status ===
                                      "CANCELADO"
                                    ? "cancelado"
                                    : ""
                            }`}
                        >
                            {formatarStatus(
                                pedido.status
                            )}
                        </span>

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

                        <DadosCliente
                            cliente={pedido.dadosCliente}
                        />

                        <ItensPedido
                            itens={pedido.itens}
                            total={totalPedido}
                        />

                        <PagamentosPedido
                            pagamentos={pedido.pagamentos}
                            totalAPagar={totalAPagar}
                            totalPago={totalPago}
                        />

                    </div>

                    <div className="pedido-col-direita">

                        <h2>Datas do Pedido</h2>

                        <div className="card-padrao card-datas">

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

                                    <span className="dado-valor">
                                        {pedido.datas.dataRetirada}
                                    </span>

                                </div>

                            </div>

                        </div>

                        <div className="recibo-secao">

                            <h2 className="recibo-titulo-main">
                                Recibo
                            </h2>

                            <ReciboPedido
                                pedido={pedido}
                                totalPedido={totalPedido}
                                totalPago={totalPago}
                                totalAPagar={totalAPagar}
                            />

                        </div>

                    </div>

                </div>

            </div>
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

export default DetalhesPedido;
