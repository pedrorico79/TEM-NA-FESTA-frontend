import { useEffect, useState } from "react";

import Tabela from "../shared/tabela/Tabela";

import Modal from "../shared/modal/Modal";

import ModalVisualizarProduto from "./ModalVisualizarProduto";
import ModalNovoProduto from "../produtos/ModalNovoProduto";

function valorAcrescimoVisivel(valor) {
    return Number(valor || 0) === 0 ? "" : valor;
}

function truncarTexto(texto, limite) {

    if (!texto) {

        return "-";

    }

    if (texto.length <= limite) {

        return texto;

    }

    return `${texto.slice(0, limite)}...`;

}

function ModalAdicionarProduto({
    open,
    produtos,
    onCriarProduto,
    onCriarProdutoSucesso,
    itensExistentes = [],
    onClose,
    onAdicionar
}) {

    const [busca, setBusca] = useState("");

    const [selecionados, setSelecionados] = useState([]);
    const [erroSelecao, setErroSelecao] = useState("");

    const [produtoVisualizado, setProdutoVisualizado] = useState(null);
    const [modalNovoProdutoAberto, setModalNovoProdutoAberto] = useState(false);


    // ==========================================
    // ABRIR / FECHAR MODAL
    // ==========================================

    useEffect(() => {

        if (open) {

            setBusca("");
            setErroSelecao("");

            setProdutoVisualizado(null);

            const itens = Array.isArray(itensExistentes) ? itensExistentes : [];
            const porProduto = new Map();
            itens.forEach((linha) => {
                if (!linha?.produto) return;
                const id = String(linha.produto.id);
                if (!porProduto.has(id)) porProduto.set(id, []);
                porProduto.get(id).push(linha);
            });
            setSelecionados(Array.from(porProduto.values()).map(([principal, ...extras]) => ({
                ...principal,
                acrescimoAjuste: {
                    ...(principal.acrescimoAjuste || { valor: principal.acrescimo || 0, tipo: "R$" }),
                    valor: valorAcrescimoVisivel(principal.acrescimoAjuste?.valor ?? principal.acrescimo),
                },
                observacaoItem: principal.observacaoItem || "",
                outrasLinhas: extras.map((linha) => ({
                    ...linha,
                    chave: linha.chaveLocal || globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
                    acrescimoAjuste: {
                        ...(linha.acrescimoAjuste || { valor: linha.acrescimo || 0, tipo: "R$" }),
                        valor: valorAcrescimoVisivel(linha.acrescimoAjuste?.valor ?? linha.acrescimo),
                    },
                    observacaoItem: linha.observacaoItem || "",
                })),
            })));

        } else {

            setBusca("");

            setSelecionados([]);

            setProdutoVisualizado(null);

        }

    }, [open, itensExistentes]);


    if (!open) {

        return null;

    }


    // ==========================================
    // FILTRO DE PRODUTOS
    // ==========================================

    const produtosFiltrados = (produtos || []).filter((produto) => {

        const termo = busca.toLowerCase().trim();

        if (!termo) {

            return true;

        }

        return (
            produto.nome?.toLowerCase().includes(termo) ||
            produto.descricao?.toLowerCase().includes(termo)
        );

    });


    // ==========================================
    // ENCONTRAR PRODUTO SELECIONADO
    // ==========================================

    const encontrarSelecionado = (produtoId) => {

        return selecionados.find(
            (item) =>
                Number(item.produto?.id) === Number(produtoId)
        );

    };

    function atualizarSelecionado(produtoId, atualizar) {
        setErroSelecao("");
        setSelecionados((anteriores) => anteriores.map((item) => (
            item.produto?.id === produtoId ? atualizar(item) : item
        )));
    }


    // ==========================================
    // SELECIONAR / DESELECIONAR PRODUTO
    // ==========================================

    const alternarProduto = (produto) => {
        setErroSelecao("");

        const existe = encontrarSelecionado(produto.id);

        // Se já está selecionado, desmarca
        if (existe) {

            setSelecionados((anteriores) =>
                anteriores.filter(
                    (item) =>
                    Number(item.produto?.id) !== Number(produto.id)
                )
            );

            return;

        }


        setSelecionados((anteriores) => [

            ...anteriores,

            {
                produto,

                quantidade: 1,
                observacaoItem: "",
                acrescimoAjuste: { valor: "", tipo: "R$" },
                outrasLinhas: [],
            },

        ]);

    };


    // ==========================================
    // ALTERAR QUANTIDADE
    // ==========================================

    function dividirLinha(produtoId, chave = null) {
        setErroSelecao("");
        atualizarSelecionado(produtoId, (item) => {
            const extras = item.outrasLinhas || [];
            const origem = chave
                ? extras.find((linha) => linha.chave === chave)
                : item;
            if (!origem || !Number.isInteger(Number(origem.quantidade)) || Number(origem.quantidade) < 2) return item;

            const quantidadeOrigem = Number(origem.quantidade);
            const ajusteOrigem = origem.acrescimoAjuste || { valor: 0, tipo: "R$" };
            const valorAjuste = Number(ajusteOrigem.valor || 0);
            const valorAjusteNovaLinha = ajusteOrigem.tipo === "%"
                ? valorAjuste
                : Number((valorAjuste / quantidadeOrigem).toFixed(2));
            const linhaOrigemAtualizada = {
                ...origem,
                quantidade: quantidadeOrigem - 1,
                acrescimoAjuste: {
                    ...ajusteOrigem,
                    valor: valorAcrescimoVisivel(ajusteOrigem.tipo === "%"
                        ? valorAjuste
                        : Number((valorAjuste - valorAjusteNovaLinha).toFixed(2))),
                },
            };

            const novaLinha = {
                chave: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
                quantidade: 1,
                observacaoItem: "",
                acrescimoAjuste: { ...ajusteOrigem, valor: valorAcrescimoVisivel(valorAjusteNovaLinha) },
            };

            if (!chave) {
                return {
                    ...item,
                    ...linhaOrigemAtualizada,
                    outrasLinhas: [...extras, novaLinha],
                };
            }

            return {
                ...item,
                outrasLinhas: extras.map((linha) => linha.chave === chave
                    ? linhaOrigemAtualizada
                    : linha).concat(novaLinha),
            };
        });
    }

    function removerLinhaExtra(produtoId, chave) {
        setErroSelecao("");
        atualizarSelecionado(produtoId, (item) => {
            const removida = (item.outrasLinhas || []).find((linha) => linha.chave === chave);
            const quantidadeRemovida = Number(removida?.quantidade);
            return {
                ...item,
                quantidade: Number(item.quantidade || 0) + (Number.isFinite(quantidadeRemovida) && quantidadeRemovida > 0 ? quantidadeRemovida : 1),
                outrasLinhas: (item.outrasLinhas || []).filter((linha) => linha.chave !== chave),
            };
        });
    }

    function atualizarLinhaProduto(produtoId, linha, atualizar) {
        setErroSelecao("");
        if (!linha.chave) {
            atualizarSelecionado(produtoId, atualizar);
            return;
        }
        setSelecionados((anteriores) => anteriores.map((item) => item.produto?.id !== produtoId
            ? item
            : {
                ...item,
                outrasLinhas: (item.outrasLinhas || []).map((extra) => (
                    extra.chave === linha.chave ? atualizar(extra) : extra
                )),
            }));
    }

    function atualizarAcrescimoLinha(produtoId, linha, campo, valor) {
        atualizarLinhaProduto(produtoId, linha, (atual) => ({
            ...atual,
            acrescimoAjuste: { ...atual.acrescimoAjuste, [campo]: valor },
        }));
    }


    // ==========================================
    // ==========================================
    // VALIDAR QUANTIDADE
    // ==========================================

    const validarQuantidadeAoSair = (
        produtoId,
        quantidade
    ) => {

        const valor = Number(quantidade);

        if (!valor || valor <= 0) {

            setSelecionados((anteriores) =>
                anteriores.filter(
                    (item) =>
                        item.produto?.id !== produtoId
                )
            );

        }

    };


    // ==========================================
    // ADICIONAR PRODUTOS
    // ==========================================

    const adicionarProdutos = () => {

        const linhasSelecionadas = selecionados.flatMap((item) => [
            item,
            ...(item.outrasLinhas || []).map((linha) => ({ ...linha, produto: item.produto })),
        ]);
        const todosValidos = linhasSelecionadas.every((item) => {
            const quantidade = Number(item.quantidade);
            const ajuste = Number(item.acrescimoAjuste?.valor ?? 0);
            const unidade = item.acrescimoAjuste?.tipo;
            return Number.isInteger(quantidade) && quantidade > 0
                && Number.isFinite(ajuste) && ajuste >= 0
                && (unidade !== "%" || ajuste <= 100);
        });

        if (!linhasSelecionadas.length) {
            return;
        }

        if (!todosValidos) {
            setErroSelecao("Confira a quantidade e o acréscimo de cada linha antes de adicionar.");
            return;
        }

        onAdicionar(selecionados.flatMap((item) => {
            const temVariacoes = (item.outrasLinhas || []).length > 0;
            const grupoObservacaoId = temVariacoes
                ? item.grupoObservacaoId || globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
                : undefined;
            return [item, ...(item.outrasLinhas || [])].map((linha, indice) => ({
                chaveLocal: linha.chaveLocal || globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
                itemId: linha.itemId ?? null,
                produto: item.produto,
                quantidade: Number(linha.quantidade),
                descricao: linha.descricao || item.produto?.descricao || "",
                observacaoItem: linha.observacaoItem || "",
                acrescimoAjuste: {
                    valor: valorAcrescimoVisivel(linha.acrescimoAjuste?.valor),
                    tipo: linha.acrescimoAjuste?.tipo || "R$",
                },
                ...(temVariacoes ? { grupoObservacaoId, linhaObservacaoPrincipal: indice === 0 } : {}),
            }));
        }));

    };

    const criarProduto = async (produto) => {
        const produtoCriado = await onCriarProduto(produto);

        if (produtoCriado?.id) {
            setBusca("");
            setSelecionados((anteriores) => [
            ...anteriores,
                {
                    produto: produtoCriado,
                    quantidade: 1,
                    acrescimoAjuste: { valor: "", tipo: "R$" },
                    observacaoItem: "",
                    outrasLinhas: [],
                },
            ]);
        }

        return produtoCriado;
    };


    // ==========================================
    // DADOS DA TABELA
    // ==========================================

    const produtosDaTabela = [...produtosFiltrados];
    (Array.isArray(itensExistentes) ? itensExistentes : []).forEach((item) => {
        const produto = item?.produto;
        if (produto?.id == null) return;
        const indiceExistente = produtosDaTabela.findIndex((atual) => Number(atual.id) === Number(produto.id));
        if (indiceExistente < 0) produtosDaTabela.push(produto);
        else produtosDaTabela[indiceExistente] = produto;
    });

    const data = produtosDaTabela.map((produto) => {

        const selecionado =
            encontrarSelecionado(produto.id);

        const preco = Number(
            produto.precoVenda ??
            produto.preco ??
            0
        );


        return [

            // ==========================================
            // SELEÇÃO
            // ==========================================

            <button
                type="button"
                className={`seletor-produto ${selecionado ? "selecionado" : ""}`}
                aria-label={`${selecionado ? "Desmarcar" : "Selecionar"} ${produto.nome}`}
                aria-pressed={Boolean(selecionado)}
                onClick={(e) => {

                    e.stopPropagation();

                    alternarProduto(produto);

                }}
            >

                {selecionado && (

                    <ion-icon
                        name="checkmark-outline"
                    ></ion-icon>

                )}

            </button>,


            // ==========================================
            // PRODUTO
            // ==========================================

            <div className="produto-selecao-identificacao">
                <strong title={produto.nome}>{truncarTexto(produto.nome, 32)}</strong>
                <span title={produto.descricao}>{truncarTexto(produto.descricao, 54)}</span>
            </div>,


            // ==========================================
            // VALOR
            // ==========================================

            `R$ ${preco
                .toFixed(2)
                .replace(".", ",")}`,


            // ==========================================
            // QUANTIDADE
            // ==========================================

            selecionado ? (() => {
                const linhasProduto = [selecionado, ...(selecionado.outrasLinhas || [])];
                return (
                    <div className="produto-selecao-linhas-coluna">
                        {linhasProduto.map((linha, indice) => (
                            <div className="produto-selecao-linha-controle" key={linha.chave || `principal-${produto.id}`}>
                                <div className="quantidade-input">
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={linha.quantidade ?? 1}
                                        aria-label={`Quantidade da linha ${indice + 1} de ${produto.nome}`}
                                        onChange={(event) => atualizarLinhaProduto(produto.id, linha, (atual) => ({ ...atual, quantidade: event.target.value }))}
                                        onBlur={(event) => {
                                            if (Number(event.target.value) > 0) return;
                                            if (linha.chave) removerLinhaExtra(produto.id, linha.chave);
                                            else validarQuantidadeAoSair(produto.id, event.target.value);
                                        }}
                                        onClick={(event) => event.stopPropagation()}
                                        onMouseDown={(event) => event.stopPropagation()}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                );
            })() : "-",

            selecionado ? (() => {
                const linhasProduto = [selecionado, ...(selecionado.outrasLinhas || [])];
                return (
                    <div className="produto-selecao-linhas-coluna">
                        {linhasProduto.map((linha, indice) => {
                            const unidade = linha.acrescimoAjuste?.tipo || "R$";
                            return (
                                <div className="produto-selecao-linha-controle" key={linha.chave || `principal-${produto.id}`}>
                                    <div className="ajuste-selecao-produto" onClick={(event) => event.stopPropagation()} onMouseDown={(event) => event.stopPropagation()}>
                                        <div className="ajuste-selecao-valor">
                                            <input
                                                type="number"
                                                min="0"
                                                max={unidade === "%" ? "100" : undefined}
                                                step="0.01"
                                                value={linha.acrescimoAjuste?.valor ?? ""}
                                                placeholder={unidade === "%" ? "0" : "0,00"}
                                                aria-label={`Acréscimo da linha ${indice + 1} de ${produto.nome}`}
                                                onChange={(event) => atualizarAcrescimoLinha(produto.id, linha, "valor", event.target.value)}
                                                onBlur={(event) => atualizarAcrescimoLinha(produto.id, linha, "valor", valorAcrescimoVisivel(event.target.value))}
                                            />
                                            <select
                                                aria-label={`Unidade do acréscimo da linha ${indice + 1} de ${produto.nome}`}
                                                value={unidade}
                                                onChange={(event) => atualizarAcrescimoLinha(produto.id, linha, "tipo", event.target.value)}
                                            >
                                                <option value="R$">R$</option>
                                                <option value="%">%</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            })() : "-",

            selecionado ? (() => {
                const linhasProduto = [selecionado, ...(selecionado.outrasLinhas || [])];
                return (
                    <div className="produto-selecao-linhas-coluna produto-selecao-observacoes">
                        {linhasProduto.map((linha, indice) => (
                            <div className="produto-selecao-linha-controle" key={linha.chave || `principal-${produto.id}`}>
                                <div className="produto-selecao-observacao-input-wrap">
                                    <input
                                        className="observacao-item-selecao"
                                        type="text"
                                        value={linha.observacaoItem || ""}
                                        onClick={(event) => event.stopPropagation()}
                                        onMouseDown={(event) => event.stopPropagation()}
                                        onChange={(event) => atualizarLinhaProduto(produto.id, linha, (atual) => ({ ...atual, observacaoItem: event.target.value }))}
                                        placeholder={`Observação da linha ${indice + 1}`}
                                        aria-label={`Observação da linha ${indice + 1} de ${produto.nome}`}
                                    />
                                    {linha.chave && (
                                        <button
                                            type="button"
                                            className="produto-selecao-remover-linha"
                                            onClick={(event) => { event.stopPropagation(); removerLinhaExtra(produto.id, linha.chave); }}
                                            onMouseDown={(event) => event.stopPropagation()}
                                            aria-label="Juntar esta linha à anterior"
                                            title="Juntar à linha principal"
                                        >
                                            <ion-icon name="close-outline"></ion-icon>
                                        </button>
                                    )}
                                </div>
                                <div className="produto-selecao-acoes-linha">
                                    {Number(linha.quantidade) > 1 && <button
                                        type="button"
                                        className="produto-selecao-dividir"
                                        onClick={(event) => { event.stopPropagation(); dividirLinha(produto.id, linha.chave || null); }}
                                        onMouseDown={(event) => event.stopPropagation()}
                                        title="Separe uma unidade para adicionar outra observação"
                                    >
                                        + Outra observação
                                    </button>}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            })() : "-",


        ];

    });


    // ==========================================
    // QUANTIDADE DE PRODUTOS SELECIONADOS
    // ==========================================

        const quantidadeSelecionadosValidos = selecionados.reduce((total, item) => (
            total + 1 + (item.outrasLinhas || []).length
        ), 0);


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <>

            <Modal
                open={open}

                onClose={onClose}

                title="Adicionar Produtos"

                className="modal-adicionar-produto"
            >

                <div className="adicionar-produto-modal">

                    <p className="adicionar-produto-descricao">

                        Pesquise e selecione os produtos que deseja
                        adicionar ao pedido.

                    </p>


                    {/* BUSCA */}

                    <div className="busca-produtos-modal">

                        <ion-icon
                            name="search-outline"
                        ></ion-icon>

                        <input
                            type="text"

                            value={busca}

                            onChange={(e) =>
                                setBusca(
                                    e.target.value
                                )
                            }

                            placeholder="Pesquisar produto..."
                        />

                    </div>

                    <button
                        type="button"
                        className="novo-produto-no-pedido"
                        onClick={() => setModalNovoProdutoAberto(true)}
                    >
                        <ion-icon name="add-circle-outline"></ion-icon>
                        Cadastrar novo produto
                    </button>


                    {/* TABELA */}

                    <div className="produtos-selecao-wrapper">

                        <Tabela
                            columns={[
                                "",
                                "PRODUTO",
                                "VALOR",
                                "QTD.",
                                "ACRÉSCIMO",
                                "OBSERVAÇÃO"
                            ]}

                            data={data}

                            rowClassName={(index) => encontrarSelecionado(produtosDaTabela[index]?.id)
                                ? "produto-selecionado"
                                : "produto-nao-selecionado"}

                            onRowClick={(row, index) => {

                                const produto =
                                    produtosDaTabela[index];

                                setProdutoVisualizado(
                                    produto
                                );

                            }}
                        />

                    </div>


                    {/* INFORMAÇÃO */}

                    <div className="produtos-selecao-info">

                        <span>

                            {quantidadeSelecionadosValidos} linha{quantidadeSelecionadosValidos === 1 ? "" : "s"} de item selecionada{quantidadeSelecionadosValidos === 1 ? "" : "s"}

                        </span>

                        {erroSelecao && <span className="produtos-selecao-erro" role="alert">{erroSelecao}</span>}

                    </div>


                    {/* BOTÕES */}

                    <div className="modal-actions">

                        <button
                            type="button"

                            className="secondary-button"

                            onClick={onClose}
                        >

                            Cancelar

                        </button>


                        <button
                            type="button"

                            className="primary-button"

                            disabled={
                                quantidadeSelecionadosValidos === 0
                            }

                            onClick={adicionarProdutos}
                        >

                            Salvar itens do pedido

                        </button>

                    </div>

                </div>

            </Modal>

            <ModalNovoProduto
                open={modalNovoProdutoAberto}
                onClose={() => setModalNovoProdutoAberto(false)}
                onSalvar={criarProduto}
                onSucesso={onCriarProdutoSucesso}
            />


            {/* MODAL VISUALIZAR PRODUTO */}

            <ModalVisualizarProduto

                open={
                    !!produtoVisualizado
                }

                produto={
                    produtoVisualizado
                }

                quantidade={

                    encontrarSelecionado(
                        produtoVisualizado?.id
                    )?.quantidade || 1

                }

                acrescimoValor={encontrarSelecionado(produtoVisualizado?.id)?.acrescimoAjuste?.valor || 0}
                acrescimoTipo={encontrarSelecionado(produtoVisualizado?.id)?.acrescimoAjuste?.tipo || "R$"}

                subtotal={

                    (() => {
                        const produto = produtoVisualizado;
                        const selecionado = encontrarSelecionado(produtoVisualizado?.id);
                        const base = Number(produto?.precoVenda ?? produto?.preco ?? 0);
                        const quantidade = Number(selecionado?.quantidade || 1);
                        const valor = Number(selecionado?.acrescimoAjuste?.valor || 0);
                        const acrescimo = selecionado?.acrescimoAjuste?.tipo === "%"
                            ? base * quantidade * valor / 100
                            : valor;
                        return base * quantidade + acrescimo;
                    })()

                }

                onClose={() =>
                    setProdutoVisualizado(null)
                }

            />

        </>

    );

}

export default ModalAdicionarProduto;
