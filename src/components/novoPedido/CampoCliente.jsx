import {
  useEffect,
  useRef,
  useState
} from "react";

import ModalNovoCliente from "./ModalNovoCliente";
import { formatarTelefone } from "../../utils/telefone";

function CampoCliente(props) {

  const [modalNovoCliente, setModalNovoCliente] =
    useState(false);

  const [busca, setBusca] = useState("");

  const [aberto, setAberto] =
    useState(false);

  const containerRef = useRef(null);

  useEffect(() => {

    function handleClickOutside(event) {

      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target
        )
      ) {
        setAberto(false);
      }

    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);

  const removerAcentos = (texto) => {

    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  };

  const clientesFiltrados = props.clientes.filter((cliente) => {

  const buscaNome = removerAcentos(busca);

  const nomeCliente = removerAcentos(
    cliente.nome || ""
  );

  const buscaNumero = busca.replace(/\D/g, "");

  const telefoneCliente = (
    cliente.telefone || ""
  ).replace(/\D/g, "");

  const encontrouNome =
    nomeCliente.includes(buscaNome);

  const encontrouTelefone =
    buscaNumero !== "" &&
    telefoneCliente.includes(buscaNumero);

  return encontrouNome || encontrouTelefone;
});

  return (

    <div
      className="campo-cliente"
      ref={containerRef}
    >

      {!props.clienteSelecionado ? (

        <>

          <div className="input-cliente">

            <ion-icon name="search-outline"></ion-icon>

            <input
              type="text"
              placeholder="Buscar cliente"
              value={busca}
              onFocus={() =>
                setAberto(true)
              }
              onChange={(e) => {

                setBusca(e.target.value);
                setAberto(true);

              }}
            />

            <ion-icon
              name={
                aberto
                  ? "chevron-up-outline"
                  : "chevron-down-outline"
              }
              className="seta-dropdown"
              onClick={() =>
                setAberto(!aberto)
              }
            ></ion-icon>

          </div>

          {aberto && (

            <div className="lista-clientes">

              {clientesFiltrados.length > 0 ? (

                clientesFiltrados.map((cliente) => (

                  <button
                    key={cliente.id}
                    className="cliente-option"
                    onClick={() => {

                      props.setClienteSelecionado(
                        cliente
                      );

                      setBusca("");
                      setAberto(false);

                    }}
                  >

                    <span>

                      {cliente.nome}

                      {cliente.telefone && (

                        <span className="cliente-telefone">
                          {" "}— {formatarTelefone(cliente.telefone)}
                        </span>

                      )}

                    </span>

                  </button>

                ))

              ) : (

                <span className="sem-clientes">
                  Nenhum cliente encontrado
                </span>

              )}

            </div>

          )}

        </>

      ) : (

        <div className="cliente-selecionado">

          <span>

            {props.clienteSelecionado.nome}

            {props.clienteSelecionado.telefone && (

              <span className="cliente-telefone">
                {" "}— {formatarTelefone(
                  props.clienteSelecionado.telefone
                )}
              </span>

            )}

          </span>

          <button
            onClick={() => {

              props.setClienteSelecionado(null);
              setBusca("");
              setAberto(true);

            }}
          >

            <ion-icon name="close-outline"></ion-icon>

          </button>

        </div>

      )}

      <button
        className="criar-cliente-button"
        onClick={() =>
          setModalNovoCliente(true)
        }
      >

        <ion-icon name="person-add"></ion-icon>

        Criar novo cliente

      </button>

      <ModalNovoCliente
        open={modalNovoCliente}
        onClose={() =>
          setModalNovoCliente(false)
        }
        onCreate={(novoCliente) => {

          props.setClientes([
            ...props.clientes,
            novoCliente,
          ]);

          props.setClienteSelecionado(
            novoCliente
          );

          setModalNovoCliente(false);

        }}
      />

    </div>

  );

}

export default CampoCliente;
