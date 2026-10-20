import { useEffect, useRef, useState } from "react";
import ModalNovoEvento from "../eventos/ModalNovoEvento";
import { api } from "../../services/api";

function normalizarTexto(texto = "") {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function hojeISO() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
}

function DetalhesPedidoCard({
  eventos = [],
  pedido,
  setPedido,
  setEventos,
  onCriarEventoSucesso,
  onCriarEventoErro,
}) {
  const [buscaEvento, setBuscaEvento] = useState("");
  const [eventoAberto, setEventoAberto] = useState(false);
  const [modalNovoEvento, setModalNovoEvento] = useState(false);
  const eventoContainerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (eventoContainerRef.current && !eventoContainerRef.current.contains(event.target)) {
        setEventoAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const eventosSeguros = Array.isArray(eventos) ? eventos : [];
  const eventosFiltrados = eventosSeguros.filter((evento) =>
    normalizarTexto(evento.nome).includes(normalizarTexto(buscaEvento))
  );
  const eventoSelecionado = eventosSeguros.find((evento) => Number(evento.id) === Number(pedido.eventoId));

  function selecionarEvento(evento) {
    setPedido((atual) => ({ ...atual, eventoId: evento.id }));
    setBuscaEvento("");
    setEventoAberto(false);
  }

  function criarNovoEvento() {
    setModalNovoEvento(true);
  }

  async function salvarNovoEvento(novoEvento) {
    const response = await api.post("/eventos", novoEvento);
    const eventoCriado = response.data;
    setEventos((atuais) => [...(Array.isArray(atuais) ? atuais : []), eventoCriado]);
    setPedido((atual) => ({ ...atual, eventoId: eventoCriado.id }));
    setBuscaEvento("");
    setEventoAberto(false);
    return eventoCriado;
  }

  return (
    <div className="card-padrao">
      <div className="card-title">
        <ion-icon name="briefcase-outline"></ion-icon>
        <h2>Detalhes do Pedido</h2>
      </div>

      <div className="detalhes-grid">
          <div className="input-group detalhes-data-retirada">
            <label htmlFor="novo-pedido-data-entrega">Data de retirada *</label>
            <input
              id="novo-pedido-data-entrega"
              type="date"
              min={hojeISO()}
              value={pedido.dataEntrega || ""}
              onChange={(event) => setPedido((atual) => ({ ...atual, dataEntrega: event.target.value }))}
              onClick={(event) => event.currentTarget.showPicker?.()}
              required
            />
          </div>

          <div className="input-group detalhes-taxa-entrega">
            <label htmlFor="novo-pedido-taxa-entrega">Taxa de entrega (R$)</label>
            <div className="entrada-input novo-pedido-taxa-input">
              <span>R$</span>
              <input
                id="novo-pedido-taxa-entrega"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={pedido.taxaEntrega ?? ""}
                onChange={(event) => setPedido((atual) => ({ ...atual, taxaEntrega: event.target.value }))}
                placeholder="0"
                aria-label="Taxa de entrega em reais"
              />
            </div>
          </div>

          <div className="input-group campo-evento detalhes-evento">
            <label>Evento</label>
            <div className="campo-evento-container" ref={eventoContainerRef}>
              {!eventoSelecionado ? (
                <>
                  <div className="input-evento">
                    <ion-icon name="search-outline"></ion-icon>
                    <input
                      type="text"
                      placeholder="Buscar evento"
                      value={buscaEvento}
                      onFocus={() => setEventoAberto(true)}
                      onChange={(event) => {
                        setBuscaEvento(event.target.value);
                        setEventoAberto(true);
                      }}
                    />
                    <ion-icon
                      name={eventoAberto ? "chevron-up-outline" : "chevron-down-outline"}
                      className="seta-dropdown"
                      onClick={() => setEventoAberto((aberto) => !aberto)}
                    ></ion-icon>
                  </div>
                  {eventoAberto && (
                    <div className="lista-eventos">

                      {eventosFiltrados.length ? eventosFiltrados.map((evento) => (
                        <button
                          type="button"
                          key={evento.id}
                          className="evento-option"
                          onClick={() => selecionarEvento(evento)}
                        >
                          {evento.nome}
                        </button>
                      )) : buscaEvento && <span className="sem-eventos">Nenhum evento encontrado</span>}
                    </div>
                  )}
                </>
              ) : (
                <div className="evento-selecionado">
                  <span>{eventoSelecionado.nome}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPedido((atual) => ({ ...atual, eventoId: null }));
                      setBuscaEvento("");
                      setEventoAberto(true);
                    }}
                    aria-label="Remover evento"
                  >
                    <ion-icon name="close-outline"></ion-icon>
                  </button>
                </div>
              )}
            </div>
          </div>

          <button type="button" className="criar-evento-button detalhes-criar-evento" onClick={criarNovoEvento}>
            <ion-icon name="calendar-outline"></ion-icon>
            Criar novo evento
          </button>

          <div className="input-group novo-pedido-observacao-grupo">
            <label htmlFor="novo-pedido-observacao">Observação do pedido</label>
            <textarea
              id="novo-pedido-observacao"
              rows="3"
              value={pedido.observacao || ""}
              onChange={(event) => setPedido((atual) => ({ ...atual, observacao: event.target.value }))}
              placeholder="Detalhes importantes sobre este pedido"
            />
          </div>
      </div>

      <ModalNovoEvento
        open={modalNovoEvento}
        onClose={() => setModalNovoEvento(false)}
        onSalvar={salvarNovoEvento}
        onSucesso={onCriarEventoSucesso}
        onErro={onCriarEventoErro}
      />
    </div>
  );
}

export default DetalhesPedidoCard;
