import {
  useEffect,
  useRef,
  useState
} from "react";

import { api } from "../../services/api";
import ModalNovoEvento from "./ModalNovoEvento";

function DetalhesPedidoCard({
  eventos,
  pedido,
  setPedido,
  setEventos
}) {
  const [statusDisponiveis, setStatusDisponiveis] = useState([]);
  const [buscaEvento, setBuscaEvento] = useState("");
  const [eventoAberto, setEventoAberto] = useState(false);
  const [modalNovoEvento, setModalNovoEvento] = useState(false);

  const eventoContainerRef = useRef(null);

  const nomesStatus = {
    AGUARDANDO_SINAL: "Aguardando sinal",
    CONFIRMADO: "Confirmado",
    EM_PRODUCAO: "Em produção",
    PRONTO_PARA_ENTREGA: "Pronto para entrega",
    ENTREGUE: "Entregue",
    CANCELADO: "Cancelado",
  };

  useEffect(() => {
    async function carregarStatus() {
      try {
        const response = await api.get("/status");

        const statusSemRascunho = response.data.filter(
          (status) => status !== "RASCUNHO"
        );

        setStatusDisponiveis(statusSemRascunho);
      } catch (error) {
        console.error("Erro ao carregar status:", error);
      }
    }

    carregarStatus();
  }, []);

  // Fecha o dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        eventoContainerRef.current &&
        !eventoContainerRef.current.contains(event.target)
      ) {
        setEventoAberto(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const removerAcentos = (texto) => {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const eventosFiltrados = eventos.filter((evento) =>
    removerAcentos(evento.nome).includes(
      removerAcentos(buscaEvento)
    )
  );

  const eventoSelecionado = eventos.find(
    (evento) => evento.id === pedido.eventoId
  );

  function selecionarEvento(evento) {
    setPedido({
      ...pedido,
      eventoId: evento.id,
    });

    setBuscaEvento("");
    setEventoAberto(false);
  }

  function removerEvento() {
    setPedido({
      ...pedido,
      eventoId: null,
    });

    setBuscaEvento("");
    setEventoAberto(true);
  }

  function criarNovoEvento() {
    setModalNovoEvento(true);
  }

  function salvarNovoEvento(novoEvento) {
    setEventos([
      ...eventos,
      novoEvento
    ]);

    setPedido({
      ...pedido,
      eventoId: novoEvento.id,
    });

    setBuscaEvento("");
    setEventoAberto(false);
    setModalNovoEvento(false);
  }

  return (
    <div className="card-padrao">

      <div className="card-title">
        <ion-icon name="briefcase-outline"></ion-icon>
        <h2>Detalhes do Pedido</h2>
      </div>

      <div className="detalhes-grid">

        {/* COLUNA ESQUERDA: STATUS + DATA */}

        <div className="detalhes-coluna">

          {/* STATUS */}

          <div className="input-group">
            <label>Status</label>

            <select
              value={pedido.status}
              onChange={(e) => {
                setPedido((pedidoAtual) => ({
                  ...pedidoAtual,
                  status: e.target.value,
                }));
              }}
            >
              {statusDisponiveis.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {nomesStatus[status] || status}
                </option>
              ))}
            </select>
          </div>

          {/* DATA DE ENTREGA */}

          <div className="input-group">
            <label>Data de entrega</label>

            <input
              type="date"
              value={pedido.dataEntrega || ""}
              onChange={(e) =>
                setPedido({
                  ...pedido,
                  dataEntrega: e.target.value,
                })
              }
              onClick={(e) => {
                e.currentTarget.showPicker?.();
              }}
            />
          </div>

        </div>

        {/* EVENTO */}

        <div className="input-group campo-evento">

          <label>Evento</label>

          <div
            className="campo-evento-container"
            ref={eventoContainerRef}
          >
            {!eventoSelecionado ? (
              <>
                <div className="input-evento">
                  <ion-icon name="search-outline"></ion-icon>

                  <input
                    type="text"
                    placeholder="Buscar evento"
                    value={buscaEvento}
                    onFocus={() => setEventoAberto(true)}
                    onChange={(e) => {
                      setBuscaEvento(e.target.value);
                      setEventoAberto(true);
                    }}
                  />

                  <ion-icon
                    name={
                      eventoAberto
                        ? "chevron-up-outline"
                        : "chevron-down-outline"
                    }
                    className="seta-dropdown"
                    onClick={() => setEventoAberto(!eventoAberto)}
                  ></ion-icon>
                </div>

                {eventoAberto && (
                  <div className="lista-eventos">
                    {eventosFiltrados.length > 0 ? (
                      eventosFiltrados.map((evento) => (
                        <button
                          type="button"
                          key={evento.id}
                          className="evento-option"
                          onClick={() => selecionarEvento(evento)}
                        >
                          {evento.nome}
                        </button>
                      ))
                    ) : (
                      <span className="sem-eventos">
                        Nenhum evento encontrado
                      </span>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="evento-selecionado">
                <span>{eventoSelecionado.nome}</span>

                <button
                  type="button"
                  onClick={removerEvento}
                >
                  <ion-icon name="close-outline"></ion-icon>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="criar-evento-button"
            onClick={criarNovoEvento}
          >
            <ion-icon name="calendar-outline"></ion-icon>
            Criar novo evento
          </button>

        </div>

      </div>

      <ModalNovoEvento
        open={modalNovoEvento}
        onClose={() => setModalNovoEvento(false)}
        onSave={salvarNovoEvento}
      />

    </div>
  );
}

export default DetalhesPedidoCard;

