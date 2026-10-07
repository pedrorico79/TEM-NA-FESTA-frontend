import { useEffect, useState } from "react";

import { api } from "../../services/api";

import Kpi from "../shared/kpi/Kpi";
import Menu from "../shared/menu/Menu";
import FiltrosRelatorio from "../relatorios/FiltrosRelatorio";
import GraficosRelatorio from "../relatorios/GraficosRelatorio";

import "../css/Relatorios.css";

function lerDataLocal(valor) {
    if (!valor) return null;
    const [ano, mes, dia] = String(valor).slice(0, 10).split("-").map(Number);
    if (!ano || !mes || !dia) return null;
    return new Date(ano, mes - 1, dia);
}

function obterInicioSemana(data) {
    const inicio = new Date(data);
    inicio.setHours(0, 0, 0, 0);
    inicio.setDate(inicio.getDate() - inicio.getDay());
    return inicio;
}

function chaveData(data) {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

function formatarDiaMes(data) {
    return `${String(data.getDate()).padStart(2, "0")}/${String(data.getMonth() + 1).padStart(2, "0")}`;
}

function criarIntervalosSemanais(inicio, fim) {
    if (!inicio || !fim || inicio > fim) return [];
    const semanas = [];
    const primeiraSemana = obterInicioSemana(inicio);
    const ultimaSemana = obterInicioSemana(fim);

    for (let cursor = primeiraSemana, indice = 1; cursor <= ultimaSemana; indice += 1) {
        const proximaSemana = new Date(cursor);
        proximaSemana.setDate(proximaSemana.getDate() + 7);
        const inicioIntervalo = new Date(Math.max(cursor.getTime(), inicio.getTime()));
        const fimIntervalo = new Date(Math.min(proximaSemana.getTime() - 86400000, fim.getTime()));
        semanas.push({
            chave: chaveData(cursor),
            rotulo: `Sem ${indice}`,
            periodo: `${formatarDiaMes(inicioIntervalo)} - ${formatarDiaMes(fimIntervalo)}`,
            quantidade: 0,
        });
        cursor = proximaSemana;
    }
    return semanas;
}

function preencherSemanasDoRelatorio(dados, dataInicio, dataFim) {
    const inicio = lerDataLocal(dataInicio);
    const fim = lerDataLocal(dataFim);
    if (!inicio || !fim) return [];
    const semanas = criarIntervalosSemanais(inicio, fim);
    const semanasAtivas = new Set();

    (dados || []).forEach((item) => {
        const inicioPeriodo = String(item.periodo || "").match(/^(\d{2})\/(\d{2})/);
        if (!inicioPeriodo) return;
        const dia = Number(inicioPeriodo[1]);
        const mes = Number(inicioPeriodo[2]);
        const semana = semanas.find((candidata) => {
            if (semanasAtivas.has(candidata.chave)) return false;
            for (let ano = inicio.getFullYear() - 1; ano <= fim.getFullYear() + 1; ano += 1) {
                const data = new Date(ano, mes - 1, dia);
                if (data >= inicio && data <= fim && chaveData(obterInicioSemana(data)) === candidata.chave) return true;
            }
            return false;
        });
        if (semana) {
            semana.quantidade = Number(item.quantidade || 0);
            semanasAtivas.add(semana.chave);
        }
    });

    return semanas.map(({ chave, ...semana }) => semana);
}

function contarPedidosPorSemana(pedidos, inicio, fim, lerDataPedido) {
    const semanas = criarIntervalosSemanais(inicio, fim);
    const mapa = new Map(semanas.map((semana) => [semana.chave, semana]));
    (pedidos || []).forEach((pedido) => {
        const dataPedido = lerDataPedido(pedido.dataPedido || pedido.dataEntrega);
        if (!dataPedido) return;
        const semana = mapa.get(chaveData(obterInicioSemana(dataPedido)));
        if (semana) semana.quantidade += 1;
    });
    return semanas.map(({ chave, ...semana }) => semana);
}

function Relatorios() {
    const hoje = new Date();

    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(
        trintaDiasAtras.getDate() - 30
    );

    const formatarData = (data) => {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");
        return `${ano}-${mes}-${dia}`;
    };

    const [dataInicial, setDataInicial] = useState(
        formatarData(trintaDiasAtras)
    );

    const [dataFinal, setDataFinal] = useState(
        formatarData(hoje)
    );

    const [periodo, setPeriodo] = useState("mes");
    const [tipoFiltro, setTipoFiltro] = useState("periodo");
    const [eventos, setEventos] = useState([]);
    const [eventoSelecionado, setEventoSelecionado] = useState("");
    const [eventosComDados, setEventosComDados] = useState(null);
    const [verificandoEventos, setVerificandoEventos] = useState(false);
    const [kpis, setKpis] = useState(null);
    const [pedidosPorSemana, setPedidosPorSemana] = useState([]);
    const [produtosMaisVendidos, setProdutosMaisVendidos] = useState([]);
    const [comparativoEventos, setComparativoEventos] = useState([]);
    const [erroRelatorio, setErroRelatorio] = useState("");
    const [carregandoRelatorio, setCarregandoRelatorio] = useState(false);

    const intervaloInvalido = Boolean(
        dataInicial && dataFinal && dataInicial > dataFinal
    );
    const nenhumEventoTemDados = tipoFiltro === "evento"
        && Array.isArray(eventosComDados)
        && eventosComDados.length === 0;
    const eventoSelecionadoSemDados = tipoFiltro === "evento"
        && Boolean(eventoSelecionado)
        && Array.isArray(eventosComDados)
        && !eventosComDados.includes(eventoSelecionado);

    function obterEventoMaisRecente(listaEventos) {
        const comDataFim = listaEventos.filter((evento) => evento.dataFim);
        const candidatos = comDataFim.length
            ? comDataFim
            : listaEventos.filter((evento) => evento.dataInicio);
        if (!candidatos.length) return listaEventos[listaEventos.length - 1];

        return candidatos.reduce((maisRecente, evento) => {
            const dataAtual = evento.dataFim || evento.dataInicio;
            const dataMaisRecente = maisRecente.dataFim || maisRecente.dataInicio;
            return dataAtual > dataMaisRecente ? evento : maisRecente;
        });
    }

    function alterarTipoFiltro(tipo) {
        setTipoFiltro(tipo);
        if (tipo === "evento") setEventoSelecionado("");
    }

    function alterarPeriodo(novoPeriodo) {
        setPeriodo(novoPeriodo);
        if (novoPeriodo === "personalizado") return;

        const fim = new Date();
        const inicio = new Date(fim);
        if (novoPeriodo === "mes") inicio.setDate(inicio.getDate() - 30);
        if (novoPeriodo === "6meses") inicio.setMonth(inicio.getMonth() - 6);
        if (novoPeriodo === "ano") {
            inicio.setMonth(0, 1);
        }

        setDataInicial(formatarData(inicio));
        setDataFinal(formatarData(fim));
    }

    function montarDadosEvento(evento, pedidosRecebidos) {
        const dataInicioEvento = evento?.dataInicio || "";
        const dataFimEvento = evento?.dataFim || formatarData(new Date());
        const inicio = dataInicioEvento ? new Date(`${dataInicioEvento}T00:00:00`) : null;
        const fim = dataFimEvento ? new Date(`${dataFimEvento}T23:59:59`) : null;
        const lerData = (valor) => {
            if (!valor) return null;
            const data = String(valor).slice(0, 10);
            const [ano, mes, dia] = data.split("-").map(Number);
            return new Date(ano, mes - 1, dia);
        };
        const pedidosFiltrados = (pedidosRecebidos || []).filter((pedido) => {
            const dataPedido = lerData(pedido.dataPedido || pedido.dataEntrega);
            if (!dataPedido) return false;
            return (!inicio || dataPedido >= inicio) && (!fim || dataPedido <= fim);
        });

        const totalPedidos = pedidosFiltrados.length;
        const totalEntregues = pedidosFiltrados.filter((pedido) =>
            String(pedido.statusProducao || pedido.status || "").toUpperCase() === "ENTREGUE"
        ).length;
        const faturamentoTotal = pedidosFiltrados.reduce(
            (total, pedido) => total + Number(pedido.valorTotal || 0),
            0
        );
        const periodoDias = inicio && fim
            ? Math.max(0, Math.round((fim - inicio) / 86400000))
            : 0;

        setKpis({
            totalPedidos,
            totalEntregues,
            taxaConclusaoPorcentagem: totalPedidos ? (totalEntregues / totalPedidos) * 100 : 0,
            faturamentoTotal: faturamentoTotal.toFixed(2),
            periodoDias,
        });

        setPedidosPorSemana(contarPedidosPorSemana(
            pedidosFiltrados,
            inicio,
            fim,
            lerData
        ));

        const produtos = new Map();
        pedidosFiltrados.forEach((pedido) => {
            (pedido.itens || []).forEach((item) => {
                const nome = item.produto?.nome || item.nomeProduto || "Produto";
                const quantidade = Number(item.quantidade || 0);
                const valorUnitario = Number(item.precoUnitario || item.produto?.precoVenda || 0);
                const registro = produtos.get(nome) || { item: nome, qtdeVendida: 0, faturamento: 0 };
                registro.qtdeVendida += quantidade;
                registro.faturamento += quantidade * valorUnitario;
                produtos.set(nome, registro);
            });
        });
        const listaProdutos = [...produtos.values()].sort((a, b) => b.qtdeVendida - a.qtdeVendida);
        const faturamentoProdutos = listaProdutos.reduce((total, produto) => total + produto.faturamento, 0);
        setProdutosMaisVendidos(listaProdutos.slice(0, 10).map((produto) => ({
            ...produto,
            faturamento: produto.faturamento.toFixed(2),
            porcentagemDoTotal: faturamentoProdutos
                ? ((produto.faturamento / faturamentoProdutos) * 100).toFixed(1)
                : "0.0",
        })));

        const porAno = new Map();
        pedidosFiltrados.forEach((pedido) => {
            const dataPedido = lerData(pedido.dataPedido || pedido.dataEntrega);
            if (!dataPedido) return;
            const ano = String(dataPedido.getFullYear());
            const registro = porAno.get(ano) || { evento: ano, pedidosTotais: 0, vendasObtidas: 0, faturamento: 0 };
            registro.pedidosTotais += 1;
            registro.faturamento += Number(pedido.valorTotal || 0);
            if (String(pedido.statusProducao || pedido.status || "").toUpperCase() === "ENTREGUE") {
                registro.vendasObtidas += 1;
            }
            porAno.set(ano, registro);
        });
        setComparativoEventos([...porAno.values()].sort((a, b) => a.evento.localeCompare(b.evento)).map((ano) => ({
            ...ano,
            faturamento: Number(ano.faturamento.toFixed(2)),
            ticketMedio: ano.pedidosTotais ? Number((ano.faturamento / ano.pedidosTotais).toFixed(2)) : 0,
        })));
    }

    useEffect(() => {
        let ativo = true;
        api.get("/eventos")
            .then((response) => {
                if (ativo) setEventos(response.data || []);
            })
            .catch((error) => {
                console.error("Erro ao carregar eventos para o relatório:", error.response?.data || error);
                if (ativo) setErroRelatorio("Não foi possível carregar a lista de eventos.");
            });
        return () => { ativo = false; };
    }, []);

    useEffect(() => {
        if (tipoFiltro !== "evento" || !eventos.length || eventoSelecionado) return;
        if (eventosComDados === null) return;

        const eventosOrdenados = [...eventos].sort((a, b) => {
            const dataA = a.dataFim || a.dataInicio || "";
            const dataB = b.dataFim || b.dataInicio || "";
            return dataB.localeCompare(dataA);
        });
        const eventoMaisRecenteComDados = eventosOrdenados.find((evento) =>
            Array.isArray(eventosComDados) && eventosComDados.includes(String(evento.id))
        );
        const eventoPadrao = eventoMaisRecenteComDados || obterEventoMaisRecente(eventos);
        if (eventoPadrao) setEventoSelecionado(String(eventoPadrao.id));
    }, [tipoFiltro, eventos, eventoSelecionado, eventosComDados]);

    useEffect(() => {
        if (tipoFiltro !== "evento" || !eventos.length || eventosComDados !== null) return undefined;

        let ativo = true;
        setVerificandoEventos(true);
        api.get("/pedidos")
            .then((response) => {
                if (!ativo) return;
                const pedidos = response.data || [];
                const eventosQueTemPedidos = eventos.filter((evento) => {
                    const inicio = evento.dataInicio || "";
                    const fim = evento.dataFim || "9999-12-31";
                    return pedidos.some((pedido) => {
                        if (String(pedido.eventoId) !== String(evento.id)) return false;
                        const dataPedido = String(pedido.dataPedido || pedido.dataEntrega || "").slice(0, 10);
                        return dataPedido && dataPedido >= inicio && dataPedido <= fim;
                    });
                });
                setEventosComDados(eventosQueTemPedidos.map((evento) => String(evento.id)));
            })
            .catch((error) => {
                console.error("Erro ao verificar eventos com pedidos:", error.response?.data || error);
                if (ativo) {
                    setEventosComDados(false);
                    setErroRelatorio("Não foi possível verificar quais eventos têm pedidos.");
                }
            })
            .finally(() => {
                if (ativo) setVerificandoEventos(false);
            });

        return () => { ativo = false; };
    }, [tipoFiltro, eventos, eventosComDados]);

    useEffect(() => {
        if (tipoFiltro === "periodo" && (!dataInicial || !dataFinal || intervaloInvalido)) {
            setCarregandoRelatorio(false);
            return undefined;
        }

        let ativo = true;
        setErroRelatorio("");
        setCarregandoRelatorio(true);

        async function carregarPorEvento() {
            if (!eventoSelecionado) {
                setKpis(null);
                setPedidosPorSemana([]);
                setProdutosMaisVendidos([]);
                setComparativoEventos([]);
                setCarregandoRelatorio(false);
                return;
            }

            try {
                const evento = eventos.find((item) => String(item.id) === eventoSelecionado);
                const pedidosResponse = await api.get("/pedidos", {
                    params: { evento: Number(eventoSelecionado) },
                });
                if (ativo) {
                    const pedidosEventoFiltrados = pedidosResponse.data || [];
                    montarDadosEvento(evento, pedidosEventoFiltrados);
                }
            } catch (error) {
                console.error("Erro ao carregar pedidos do evento:", error.response?.data || error);
                if (ativo) {
                    setKpis(null);
                    setPedidosPorSemana([]);
                    setProdutosMaisVendidos([]);
                    setComparativoEventos([]);
                    setErroRelatorio("Não foi possível carregar os pedidos deste evento.");
                }
            } finally {
                if (ativo) setCarregandoRelatorio(false);
            }
        }

        async function carregarPorPeriodo() {
            const params = { de: dataInicial, ate: dataFinal };
            const respostas = await Promise.allSettled([
                api.get("/relatorios/kpis", { params }),
                api.get("/relatorios/pedidos-por-semana", { params }),
                api.get("/relatorios/produtos-mais-vendidos", {
                    params: { ...params, page: 0, size: 10 },
                }),
                api.get("/relatorios/comparativo-eventos", { params }),
            ]);

            if (!ativo) return;
            const [kpi, semana, produtos, eventosResponse] = respostas;
            setKpis(kpi.status === "fulfilled" ? kpi.value.data : null);
            setPedidosPorSemana(semana.status === "fulfilled"
                ? preencherSemanasDoRelatorio(semana.value.data || [], dataInicial, dataFinal)
                : []);
            setProdutosMaisVendidos(produtos.status === "fulfilled" ? produtos.value.data?.content || [] : []);
            setComparativoEventos(eventosResponse.status === "fulfilled" ? eventosResponse.value.data || [] : []);

            const falhas = respostas.filter((resposta) => resposta.status === "rejected");
            if (falhas.length) {
                falhas.forEach((falha) => console.error("Erro ao carregar dados do relatório:", falha.reason?.response?.data || falha.reason));
                setErroRelatorio("Alguns dados do relatório não puderam ser carregados.");
            }
            setCarregandoRelatorio(false);
        }

        if (tipoFiltro === "evento") carregarPorEvento();
        else carregarPorPeriodo();

        return () => { ativo = false; };
        }, [dataInicial, dataFinal, intervaloInvalido, tipoFiltro, eventoSelecionado, eventos]);

    return (
        <div className="relatorios-layout">

            <Menu active="relatorios" />

            <main className="relatorios">

                <h1>Relatórios</h1>

                <FiltrosRelatorio
                    dataInicial={dataInicial}
                    dataFinal={dataFinal}
                    periodo={periodo}
                    setTipoFiltro={alterarTipoFiltro}
                    tipoFiltro={tipoFiltro}
                    eventos={eventos}
                    eventoSelecionado={eventoSelecionado}
                    setEventoSelecionado={setEventoSelecionado}
                    onPeriodoChange={alterarPeriodo}
                    setDataInicial={setDataInicial}
                    setDataFinal={setDataFinal}
                    intervaloInvalido={intervaloInvalido}
                />

                {tipoFiltro === "periodo" && intervaloInvalido && (
                    <p className="relatorio-erro-filtro" role="alert">
                        A data inicial precisa ser anterior ou igual à data final.
                    </p>
                )}

                {erroRelatorio && (
                    <p className="relatorio-erro-filtro" role="alert">{erroRelatorio}</p>
                )}

                {carregandoRelatorio && (
                    <p className="relatorio-carregando" role="status">Carregando relatório…</p>
                )}

                {tipoFiltro === "evento" && verificandoEventos && (
                    <p className="relatorio-carregando" role="status">Verificando quais eventos têm pedidos…</p>
                )}

                {tipoFiltro === "evento" && !verificandoEventos && eventos.length === 0 && (
                    <p className="relatorio-estado-vazio" role="status">Nenhum evento cadastrado para analisar.</p>
                )}

                {nenhumEventoTemDados && (
                    <p className="relatorio-estado-vazio" role="status">Ainda não há pedidos registrados para nenhum evento.</p>
                )}

                {eventoSelecionadoSemDados && !nenhumEventoTemDados && (
                    <p className="relatorio-estado-vazio" role="status">Este evento ainda não possui pedidos dentro do período dele.</p>
                )}

                {(tipoFiltro === "periodo" || (tipoFiltro === "evento" && eventoSelecionado && !eventoSelecionadoSemDados && !nenhumEventoTemDados)) && <>
                <section className="kpis">

                    <Kpi
                        icon="cube-outline"
                        title="TOTAL DE PEDIDOS"
                        value={kpis?.totalPedidos ?? 0}
                        description={`${kpis?.totalEntregues ?? 0} entregue(s)`}
                        iconColor="#3b82f6"
                        iconBackground="#dbeafe"
                    />

                    <Kpi
                        icon="time-outline"
                        title="TAXA DE CONCLUSÃO"
                        value={`${kpis?.taxaConclusaoPorcentagem ?? 0}%`}
                        description={`${kpis?.totalEntregues ?? 0} de ${kpis?.totalPedidos ?? 0} pedidos entregues`}
                        iconColor="#f59e0b"
                        iconBackground="#fef3c7"
                    />

                    <Kpi
                        icon="checkmark-circle"
                        title="FATURAMENTO TOTAL"
                        value={`R$ ${kpis?.faturamentoTotal ?? 0}`}
                        description={`${kpis?.totalEntregues ?? 0} entregue(s)`}
                        iconColor="#22c55e"
                        iconBackground="#dcfce7"
                    />

                    <Kpi
                        icon="calendar-outline"
                        title="PERÍODO"
                        value={`${kpis?.periodoDias ?? 0} dias`}
                        description={`${kpis?.totalEntregues ?? 0} entrega(s)`}
                        iconColor="#8b5cf6"
                        iconBackground="#ede9fe"
                    />

                </section>

                <GraficosRelatorio
                    pedidosPorSemana={pedidosPorSemana}
                    comparativoEventos={comparativoEventos}
                    produtosMaisVendidos={produtosMaisVendidos}
                    modoEvento={tipoFiltro === "evento"}
                />
                </>}

                {tipoFiltro === "evento" && !eventoSelecionado && eventos.length > 0 && !verificandoEventos && !nenhumEventoTemDados && (
                    <p className="relatorio-estado-vazio">Selecione um evento para ver a análise.</p>
                )}

            </main>

        </div>
    );
}

export default Relatorios;
