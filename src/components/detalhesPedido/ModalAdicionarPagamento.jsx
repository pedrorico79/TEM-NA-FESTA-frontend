import { useEffect, useRef, useState } from "react";
import Modal from "../shared/modal/Modal";
import { mensagemErroApi } from "../../utils/mensagemErroApi";

function criarChaveIdempotencia() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (caractere) => {
        const aleatorio = Math.floor(Math.random() * 16);
        return (caractere === "x" ? aleatorio : (aleatorio & 0x3) | 0x8).toString(16);
    });
}

function ModalAdicionarPagamento({ open, onClose, onSalvar, metodos, saldoDisponivel, erroMetodos }) {
    const [valor, setValor] = useState("");
    const [tipoPagamento, setTipoPagamento] = useState("SINAL");
    const [statusPagamento, setStatusPagamento] = useState("CONFIRMADO");
    const [metodoPagamentoId, setMetodoPagamentoId] = useState("");
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    const chaveRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        setValor("");
        setTipoPagamento("SINAL");
        setStatusPagamento("CONFIRMADO");
        setMetodoPagamentoId(metodos?.[0]?.id ? String(metodos[0].id) : "");
        setErro("");
        setSalvando(false);
        chaveRef.current = null;
    }, [open]);

    useEffect(() => {
        if (open && !metodoPagamentoId && metodos?.length) {
            setMetodoPagamentoId(String(metodos[0].id));
        }
    }, [metodos, metodoPagamentoId, open]);

    function alterar(setter, value) {
        chaveRef.current = null;
        setErro("");
        setter(value);
    }

    async function salvar(event) {
        event.preventDefault();
        setErro("");

        const valorNumerico = Number(String(valor).replace(",", "."));
        if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
            setErro("Informe um valor maior que zero.");
            return;
        }
        if (valorNumerico > saldoDisponivel + 0.000001) {
            setErro("O valor não pode ultrapassar o saldo disponível do pedido.");
            return;
        }
        if (!metodoPagamentoId) {
            setErro("Selecione um método de pagamento.");
            return;
        }

        chaveRef.current ||= criarChaveIdempotencia();
        setSalvando(true);
        try {
            await onSalvar({
                valor: valorNumerico,
                tipoPagamento,
                statusPagamento,
                metodoPagamentoId: Number(metodoPagamentoId),
                chaveIdempotencia: chaveRef.current,
            });
            chaveRef.current = null;
            onClose();
        } catch (apiErro) {
            setErro(mensagemErroApi(apiErro, "Não foi possível registrar o pagamento."));
        } finally {
            setSalvando(false);
        }
    }

    return (
        <Modal open={open} onClose={salvando ? () => {} : onClose} title="Adicionar Pagamento">
            <form onSubmit={salvar}>
                <p className="pagamento-saldo-disponivel">
                    Saldo disponível para registrar: <strong>R$ {saldoDisponivel.toFixed(2)}</strong>
                </p>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="pagamento-valor">Valor *</label>
                        <input
                            id="pagamento-valor"
                            type="number"
                            min="0.01"
                            max={saldoDisponivel.toFixed(2)}
                            step="0.01"
                            inputMode="decimal"
                            value={valor}
                            onChange={(event) => alterar(setValor, event.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="pagamento-metodo">Método de pagamento *</label>
                        <select
                            id="pagamento-metodo"
                            value={metodoPagamentoId}
                            onChange={(event) => alterar(setMetodoPagamentoId, event.target.value)}
                            required
                            disabled={!metodos?.length}
                        >
                            <option value="">Selecione</option>
                            {(metodos || []).map((metodo) => (
                                <option key={metodo.id} value={metodo.id}>{metodo.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="pagamento-tipo">Tipo *</label>
                        <select
                            id="pagamento-tipo"
                            value={tipoPagamento}
                            onChange={(event) => alterar(setTipoPagamento, event.target.value)}
                        >
                            <option value="SINAL">Sinal</option>
                            <option value="QUITACAO">Quitação</option>
                            <option value="INTEGRAL">Integral</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="pagamento-status">Situação *</label>
                        <select
                            id="pagamento-status"
                            value={statusPagamento}
                            onChange={(event) => alterar(setStatusPagamento, event.target.value)}
                        >
                            <option value="CONFIRMADO">Recebido</option>
                            <option value="PENDENTE">Aguardando confirmação</option>
                        </select>
                    </div>
                </div>
                {(erro || erroMetodos) && <p className="pagamento-form-erro" role="alert">{erro || erroMetodos}</p>}
                <div className="modal-actions">
                    <button type="button" className="secondary-button" onClick={onClose} disabled={salvando}>Cancelar</button>
                    <button type="submit" className="primary-button" disabled={salvando || !metodos?.length}>
                        {salvando ? "Salvando…" : "Registrar pagamento"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default ModalAdicionarPagamento;
