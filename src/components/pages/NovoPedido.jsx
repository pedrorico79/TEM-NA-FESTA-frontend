import { useState } from "react";

import Menu from "../shared/Menu/Menu";

import HeaderNovoPedido from "../novoPedido/HeaderNovoPedido";
import ClienteCard from "../novoPedido/ClienteCard";
import DetalhesPedidoCard from "../novoPedido/DetalhesPedidoCard";
import ItensPedidoCard from "../novoPedido/ItensPedidoCard";
import FooterNovoPedido from "../novoPedido/FooterNovoPedido";

import "../css/NovoPedido.css";

function NovoPedido() {

    // FUTURAMENTE VEM DA API
    const [clientes, setClientes] =
        useState([
            {
                id: 1,
                nome: "Maria Silva",
            },

            {
                id: 2,
                nome: "João Pedro",
            },

            {
                id: 3,
                nome: "Fernanda Lima",
            },
        ]);

    const campanhas = [
        "Sem Evento",
        "Páscoa",
        "Natal",
        "Aniversário",
    ];

    const produtos = [
        {
            id: 1,
            nome: "Bolo de Morango",
            preco: 780,
        },

        {
            id: 2,
            nome: "Trufa de Maracujá",
            preco: 345,
        },

        {
            id: 3,
            nome: "Kit Festa",
            preco: 320,
        },
    ];

    const [pedido, setPedido] = useState({
        cliente: null,
        campanha: "Sem Evento",
        status: "NAO_INICIADO",
        entrega: "",
        tipoEntrega: "RETIRADA",
        itens: [],
    });

    const adicionarItem = () => {

        const novoItem = {
            produto: produtos[0],
            quantidade: 1,
            descricao: "",
        };

        setPedido({
            ...pedido,

            itens: [
                ...pedido.itens,
                novoItem
            ]
        });
    };

    const removerItem = (index) => {

        const novosItens =
            pedido.itens.filter((_, i) => i !== index);

        setPedido({
            ...pedido,
            itens: novosItens,
        });
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
                        campanhas={campanhas}
                        pedido={pedido}
                        setPedido={setPedido}
                    />

                </div>

                <ItensPedidoCard
                    itens={pedido.itens}
                    produtos={produtos}
                    adicionarItem={adicionarItem}
                    removerItem={removerItem}
                />

            </main>

            <FooterNovoPedido />

        </div>
    );
}

export default NovoPedido;