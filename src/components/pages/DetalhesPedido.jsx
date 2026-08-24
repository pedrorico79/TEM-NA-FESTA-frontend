import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Menu from "../shared/Menu/Menu";

import DadosCliente from "../detalhesPedido/DadosCliente";
import ItensPedido from "../detalhesPedido/ItensPedido";
import PagamentosPedido from "../detalhesPedido/PagamentosPedido";
import ReciboPedido from "../detalhesPedido/ReciboPedido";

import "../css/DetalhesPedido.css";

function DetalhesPedido() {

    const navigate = useNavigate();
    const { id } = useParams();

    const pedidosMock = {

        "#21": {
            id: "#21",
            clienteNome: "Igor Felix",
            status: "Não iniciado",

            dadosCliente: {
                nome: "Igor Felix",
                evento: "Natal",
                endereco: "Travessa Brasil, 5750",
                telefone: "(11)91234-2039",
                whatsapp: "(11)91234-2039",
                instagram: "@igor-felix"
            },

            datas: {
                dataPedido: "01/04/2026",
                dataRetirada: "14/04/2026"
            },

            itens: [
                {
                    id: 1,
                    produto: "Bolo de Morango",
                    descricao: "",
                    qtd: 2,
                    precoUnitario: 45.0,
                    desconto: 0,
                    subtotal: 90.0
                },
                {
                    id: 2,
                    produto: "Trufas de Maracujá",
                    descricao: "",
                    qtd: 1,
                    precoUnitario: 7.0,
                    desconto: 0,
                    subtotal: 7.0
                },
                {
                    id: 3,
                    produto: "Pudim",
                    descricao: "",
                    qtd: 1,
                    precoUnitario: 100.0,
                    desconto: "10%",
                    subtotal: 90.0
                }
            ],

            pagamentos: [
                {
                    id: 1,
                    data: "01/04/2026",
                    valor: 100.0,
                    metodo: "PIX"
                },
                {
                    id: 2,
                    data: "13/04/2026",
                    valor: 87.0,
                    metodo: "PIX"
                }
            ]
        },

        "#22": {
            id: "#22",
            clienteNome: "Felipe Hideki",
            status: "Pronto",

            dadosCliente: {
                nome: "Felipe Hideki",
                evento: "Halloween",
                endereco: "Rua das Flores, 123",
                telefone: "(11)98888-1111",
                whatsapp: "(11)98888-1111",
                instagram: "@felipehideki"
            },

            datas: {
                dataPedido: "05/04/2026",
                dataRetirada: "14/04/2026"
            },

            itens: [
                {
                    id: 1,
                    produto: "Brigadeiro Gourmet",
                    descricao: "",
                    qtd: 10,
                    precoUnitario: 8.0,
                    desconto: 0,
                    subtotal: 80.0
                },
                {
                    id: 2,
                    produto: "Cupcake Halloween",
                    descricao: "",
                    qtd: 10,
                    precoUnitario: 12.0,
                    desconto: 0,
                    subtotal: 120.0
                }
            ],

            pagamentos: [
                {
                    id: 1,
                    data: "10/04/2026",
                    valor: 200.0,
                    metodo: "PIX"
                }
            ]
        },

        "#23": {
            id: "#23",
            clienteNome: "Kauã Medeiros",
            status: "Não iniciado",

            dadosCliente: {
                nome: "Kauã Medeiros",
                evento: "Páscoa",
                endereco: "Rua Brasil, 500",
                telefone: "(11)97777-2222",
                whatsapp: "(11)97777-2222",
                instagram: "@kauamedeiros"
            },

            datas: {
                dataPedido: "07/04/2026",
                dataRetirada: "15/04/2026"
            },

            itens: [
                {
                    id: 1,
                    produto: "Ovo de Páscoa",
                    descricao: "",
                    qtd: 5,
                    precoUnitario: 25.0,
                    desconto: 0,
                    subtotal: 125.0
                }
            ],

            pagamentos: []
        },

        "#24": {
            id: "#24",
            clienteNome: "Laura Belinello Buzzato",
            status: "Em Produção",

            dadosCliente: {
                nome: "Laura Belinello Buzzato",
                evento: "Aniversário",
                endereco: "Avenida Paulista, 1000",
                telefone: "(11)96666-3333",
                whatsapp: "(11)96666-3333",
                instagram: "@laurabuzzato"
            },

            datas: {
                dataPedido: "08/04/2026",
                dataRetirada: "14/04/2026"
            },

            itens: [
                {
                    id: 1,
                    produto: "Bolo de Chocolate",
                    descricao: "",
                    qtd: 2,
                    precoUnitario: 90.0,
                    desconto: 0,
                    subtotal: 180.0
                },
                {
                    id: 2,
                    produto: "Brigadeiros",
                    descricao: "",
                    qtd: 10,
                    precoUnitario: 6.0,
                    desconto: 0,
                    subtotal: 60.0
                }
            ],

            pagamentos: [
                {
                    id: 1,
                    data: "10/04/2026",
                    valor: 100.0,
                    metodo: "PIX"
                }
            ]
        },

        "#25": {
            id: "#25",
            clienteNome: "Pedro Rico",
            status: "Entregue",

            dadosCliente: {
                nome: "Pedro Rico",
                evento: "Casamento",
                endereco: "Rua das Palmeiras, 200",
                telefone: "(11)95555-4444",
                whatsapp: "(11)95555-4444",
                instagram: "@pedrorico"
            },

            datas: {
                dataPedido: "01/05/2026",
                dataRetirada: "22/05/2026"
            },

            itens: [
                {
                    id: 1,
                    produto: "Doces para Casamento",
                    descricao: "",
                    qtd: 12,
                    precoUnitario: 18.33,
                    desconto: 0,
                    subtotal: 220.0
                }
            ],

            pagamentos: [
                {
                    id: 1,
                    data: "20/05/2026",
                    valor: 220.0,
                    metodo: "PIX"
                }
            ]
        },

        "#26": {
            id: "#26",
            clienteNome: "Ana Souza",
            status: "Cancelado",

            dadosCliente: {
                nome: "Ana Souza",
                evento: "Formatura",
                endereco: "Rua dos Lírios, 300",
                telefone: "(11)94444-5555",
                whatsapp: "(11)94444-5555",
                instagram: "@anasouza"
            },

            datas: {
                dataPedido: "01/05/2026",
                dataRetirada: "18/05/2026"
            },

            itens: [
                {
                    id: 1,
                    produto: "Mini Doces",
                    descricao: "",
                    qtd: 8,
                    precoUnitario: 11.875,
                    desconto: 0,
                    subtotal: 95.0
                }
            ],

            pagamentos: []
        }
    };

    const pedido = pedidosMock[decodeURIComponent(id)];

    if (!pedido) {
        return (
            <div className="produtos-layout">

                <Menu active="pedidos" />

                <div className="produtos-content pedido-detalhes-container">

                    <h1>Pedido não encontrado</h1>

                    <button
                        className="btn-voltar"
                        onClick={() => navigate("/Pedidos")}
                    >
                        <ion-icon name="arrow-back-outline"></ion-icon>
                        Voltar Para Todos Pedidos
                    </button>

                </div>

            </div>
        );
    }

    const totalPedido = pedido.itens.reduce(
        (acc, item) => acc + item.subtotal,
        0
    );

    const totalPago = pedido.pagamentos.reduce(
        (acc, pag) => acc + pag.valor,
        0
    );

    const totalAPagar = totalPedido - totalPago;

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
                            className={`badge-status ${pedido.status === "Não iniciado"
                                    ? "naoIniciado"
                                    : pedido.status === "Em Produção"
                                        ? "producao"
                                        : pedido.status === "Pronto"
                                            ? "pronto"
                                            : pedido.status === "Entregue"
                                                ? "entregue"
                                                : pedido.status === "Cancelado"
                                                    ? "cancelado"
                                                    : ""
                                }`}
                        >
                            {pedido.status}
                        </span>

                    </div>

                    <button
                        className="btn-voltar"
                        onClick={() => navigate("/Pedidos")}
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

export default DetalhesPedido;