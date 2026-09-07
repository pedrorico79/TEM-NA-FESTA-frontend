import { useEffect, useState } from "react";

import Menu from "../shared/Menu/Menu";

import HeaderNovoPedido from "../novoPedido/HeaderNovoPedido";

import ClienteCard from "../novoPedido/ClienteCard";

import DetalhesPedidoCard from "../novoPedido/DetalhesPedidoCard";

import ItensPedidoCard from "../novoPedido/ItensPedidoCard";

import { api } from "../../services/api";

import "../css/NovoPedido.css";

function NovoPedido() {

    const [clientes, setClientes] = useState([]);

    const [produtos, setProdutos] = useState([]);

    const [eventos, setEventos] = useState([]);

    const [entrada, setEntrada] = useState("");

    const [pedido, setPedido] = useState({

        cliente: null,

        evento: null,

        status: "NAO_INICIADO",

        entrega: "",

        tipoEntrega: "RETIRADA",

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

            const novosItens = [...pedidoAtual.itens];

            produtosSelecionados.forEach((selecionado) => {

                const itemExistente = novosItens.find(
                    (item) =>
                        item.produto?.id === selecionado.produto?.id
                );

                if (itemExistente) {

                    itemExistente.quantidade += Number(
                        selecionado.quantidade || 1
                    );

                } else {

                    novosItens.push({
                        produto: selecionado.produto,

                        quantidade: Number(
                            selecionado.quantidade || 1
                        ),

                        descricao: selecionado.produto?.descricao || "",

                        desconto: {
                            valor: 0,
                            tipo: "%",
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

    const cancelarPedido = () => {

        setPedido({

            cliente: null,

            evento: null,

            status: "NAO_INICIADO",

            entrega: "",

            tipoEntrega: "RETIRADA",

            itens: [],

        });

        setEntrada("");

    };

    const salvarPedido = async () => {

        try {

            const pedidoParaSalvar = {

                ...pedido,

                entrada: Number(entrada || 0),

            };

            console.log(
                "Pedido para salvar:",
                pedidoParaSalvar
            );

            // Quando o endpoint estiver definido,
            // podemos fazer o POST aqui:
            //
            // await api.post("/pedidos", pedidoParaSalvar);

        } catch (error) {

            console.error(
                "Erro ao salvar pedido:",
                error
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
                    cancelarPedido={cancelarPedido}
                    salvarPedido={salvarPedido}
                />

            </main>

        </div>

    );

}

export default NovoPedido;