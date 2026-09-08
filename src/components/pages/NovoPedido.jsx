import { useEffect, useState } from "react";

import Menu from "../shared/Menu/Menu";

import HeaderNovoPedido from "../novoPedido/HeaderNovoPedido";

import ClienteCard from "../novoPedido/ClienteCard";

import DetalhesPedidoCard from "../novoPedido/DetalhesPedidoCard";

import ItensPedidoCard from "../novoPedido/ItensPedidoCard";

import { useNavigate } from "react-router-dom";

import { api } from "../../services/api";

import "../css/NovoPedido.css";

function NovoPedido() {

    const navigate = useNavigate();

    const [clientes, setClientes] = useState([]);

    const [produtos, setProdutos] = useState([]);

    const [eventos, setEventos] = useState([]);

    const [entrada, setEntrada] = useState("");

    const [pedido, setPedido] = useState({
    cliente: null,
    eventoId: null,
    status: "AGUARDANDO_SINAL",
    dataEntrega: "",
    enderecoEntregaId: null,
    itens: [],
});

    useEffect(() => {

        async function carregarDados() {

            try {

                const [
                    clientesResponse,
                    produtosResponse,
                    eventosResponse
                ] = await Promise.all([

                    api.get("/clientes"),

                    api.get("/produtos"),

                    api.get("/eventos"),

                ]);

                setClientes(clientesResponse.data);

                setProdutos(produtosResponse.data);

                setEventos(eventosResponse.data);

            } catch (error) {

                console.error(
                    "Erro ao carregar dados do novo pedido:",
                    error
                );

            }

        }

        carregarDados();

    }, []);

    const adicionarItens = (produtosSelecionados) => {

        setPedido((pedidoAtual) => {

            const novosItens = pedidoAtual.itens.map((item) => ({
                ...item,

                desconto: item.desconto
                    ? {
                        ...item.desconto,
                    }
                    : {
                        valor: 0,
                        tipo: "%",
                    },
            }));

            produtosSelecionados.forEach((selecionado) => {

                const indexExistente = novosItens.findIndex(
                    (item) =>
                        item.produto?.id ===
                        selecionado.produto?.id
                );

                const quantidadeSelecionada = Number(
                    selecionado.quantidade || 1
                );

                if (indexExistente !== -1) {

                    const itemExistente =
                        novosItens[indexExistente];

                    /*
                     * A quantidade que veio do modal já contém
                     * a quantidade atual do pedido.
                     *
                     * Exemplo:
                     * Pedido = 55
                     * Modal = 55
                     * Não adiciona novamente.
                     *
                     * Se no modal mudar para 56:
                     * 56 - 55 = 1
                     * Pedido passa para 56.
                     */

                    const quantidadeAtual = Number(
                        itemExistente.quantidade || 0
                    );

                    const diferenca =
                        quantidadeSelecionada -
                        quantidadeAtual;

                    novosItens[indexExistente] = {
                        ...itemExistente,

                        quantidade:
                            quantidadeAtual +
                            diferenca,

                        desconto: {
                            valor: Number(
                                selecionado.desconto?.valor ??
                                itemExistente.desconto?.valor ??
                                0
                            ),

                            tipo:
                                selecionado.desconto?.tipo ??
                                itemExistente.desconto?.tipo ??
                                "%",
                        },
                    };

                } else {

                    // Produto novo

                    novosItens.push({

                        produto:
                            selecionado.produto,

                        quantidade:
                            quantidadeSelecionada,

                        descricao:
                            selecionado.produto?.descricao ||
                            "",

                        desconto: {

                            valor: Number(
                                selecionado.desconto?.valor || 0
                            ),

                            tipo:
                                selecionado.desconto?.tipo ||
                                "%",
                        },

                    });

                }

            });

            return {

                ...pedidoAtual,

                itens: novosItens,

            };

        });

    };

    const removerItem = (index) => {

        setPedido((pedidoAtual) => ({

            ...pedidoAtual,

            itens: pedidoAtual.itens.filter(
                (_, i) => i !== index
            ),

        }));

    };

    const alterarDesconto = (index, valor) => {

        setPedido((pedidoAtual) => ({

            ...pedidoAtual,

            itens: pedidoAtual.itens.map((item, i) => {

                if (i !== index) {
                    return item;
                }

                return {

                    ...item,

                    desconto: {

                        ...item.desconto,

                        valor: valor,

                    },

                };

            }),

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

    const alterarTipoDesconto = (index, tipo) => {

        setPedido((pedidoAtual) => ({

            ...pedidoAtual,

            itens: pedidoAtual.itens.map((item, i) => {

                if (i !== index) {
                    return item;
                }

                return {

                    ...item,

                    desconto: {

                        ...item.desconto,

                        tipo: tipo,

                    },

                };

            }),

        }));

    };

    const alterarEntrada = (valor) => {

        setEntrada(valor);

    };

    const voltarPedidos = () => {
        navigate("/Pedidos");
    };

    const salvarPedido = async () => {
        try {
            if (!pedido.cliente) {
                alert("Selecione um cliente.");
                return;
            }

            console.log("PEDIDO ANTES DE SALVAR:", pedido);
console.log("STATUS SELECIONADO:", pedido.status);

if (!pedido.status) {
    alert("Selecione um status.");
    return;
}

            if (!pedido.status) {
                alert("Selecione um status.");
                return;
            }

            if (!pedido.dataEntrega) {
                alert("Informe a data de entrega.");
                return;
            }

            if (!pedido.itens || pedido.itens.length === 0) {
                alert("Adicione pelo menos um produto.");
                return;
            }

            const pedidoParaSalvar = {
                clienteId: pedido.cliente.id,

                dataEntrega: `${pedido.dataEntrega}T00:00:00`,

                taxaEntrega: 0,

                observacao: "",

                eventoId: pedido.eventoId || null,

                enderecoEntregaId: null,

                itens: pedido.itens.map((item) => ({
                    produtoId: item.produto.id,

                    precoUnitario: Number(
                        item.produto.precoVenda || 0
                    ),

                    quantidade: Number(
                        item.quantidade || 1
                    ),

                    observacaoItem: item.descricao || "",
                })),
            };

            console.log(
                "POST /pedidos:",
                pedidoParaSalvar
            );

            // 1. CRIA O PEDIDO
            const response = await api.post(
                "/pedidos",
                pedidoParaSalvar
            );

            const pedidoCriado = response.data;

            console.log(
                "Pedido criado:",
                pedidoCriado
            );

            // 2. ATUALIZA O STATUS ESCOLHIDO NO SELECT
            const statusRequest = {
                novoStatus: pedido.status,
                observacao: "",
            };

            console.log(
                `PATCH /pedidos/${pedidoCriado.id}/status:`,
                statusRequest
            );

            await api.patch(
                `/pedidos/${pedidoCriado.id}/status`,
                statusRequest
            );

            alert("Pedido criado com sucesso!");

            navigate("/Pedidos");

        } catch (error) {
            console.error(
                "Erro ao salvar pedido:",
                error
            );

            console.error(
                "Resposta do backend:",
                error.response?.data
            );

            alert(
                error.response?.data?.message ||
                "Erro ao criar pedido."
            );
        }
    };

    return (

        <div className="novoPedido-layout">

            <Menu active="pedidos" />

            <main className="novoPedido-content">

                <HeaderNovoPedido />

                <div className="novoPedido-top">

                    <ClienteCard
                        clientes={clientes}
                        setClientes={setClientes}
                        pedido={pedido}
                        setPedido={setPedido}
                    />

                    <DetalhesPedidoCard
                        eventos={eventos}
                        pedido={pedido}
                        setPedido={setPedido}
                    />

                </div>

                <ItensPedidoCard
                    itens={pedido.itens}
                    produtos={produtos}
                    adicionarItens={adicionarItens}
                    removerItem={removerItem}
                    alterarQuantidade={alterarQuantidade}
                    alterarDesconto={alterarDesconto}
                    alterarTipoDesconto={alterarTipoDesconto}
                    entrada={entrada}
                    alterarEntrada={alterarEntrada}
                    voltarPedidos={voltarPedidos}
                    salvarPedido={salvarPedido}
                />

            </main>

        </div>

    );

}

export default NovoPedido;