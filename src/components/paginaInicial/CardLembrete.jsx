import ModalCriarLembrete from "./ModalCriarLembrete";
import ModalEditarLembrete from "./ModalEditarLembrete";
import ModalExcluirLembrete from "./ModalExcluirLembrete";
import ModalVisualizarLembrete from "./ModalVisualizarLembrete";
import ItemCardLembrete from "./ItemCardLembrete";
import { useEffect, useState } from "react";

function CardLembrete(props) {

  const [openModal, setOpenModal] = useState(false);

  const [openModalEditar, setOpenModalEditar] = useState(false);

  const [openModalExcluir, setOpenModalExcluir] = useState(false);

  const [openModalVisualizar, setOpenModalVisualizar] = useState(false);

  const [lembreteSelecionado, setLembreteSelecionado] = useState(null);

  useEffect(() => {
    if (props.painelAberto === false) {
      setOpenModal(false);
    }
  }, [props.painelAberto]);


  function formatarData(data) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}


  function abrirModalEditar(lembrete) {

    setLembreteSelecionado(lembrete);
    setOpenModalEditar(true);

  }


  function abrirModalExcluir(lembrete) {

    setLembreteSelecionado(lembrete);
    setOpenModalExcluir(true);

  }


  return (
    <div className="lembretes-card">

      <h2>Lembretes</h2>


      <div className="lista-lembretes">

        {props.lembretes.map((lembrete) => (

          <ItemCardLembrete

            key={lembrete.id}

            texto={lembrete.descricao}

            data={`Até dia ${formatarData(lembrete.dataLimite)}`}

            onVisualizar={() => {
              setLembreteSelecionado(lembrete);
              setOpenModalVisualizar(true);
            }}

            onEditar={() => abrirModalEditar(lembrete)}

            onExcluir={() => abrirModalExcluir(lembrete)}

          />

        ))}

      </div>


      <button

        className="btn-adicionar-lembrete"

        onClick={() => setOpenModal(true)}

      >

        + Adicionar lembrete

      </button>



      <ModalCriarLembrete

        open={openModal}

        onClose={() => setOpenModal(false)}

        criarLembrete={props.criarLembrete}

      />



      <ModalEditarLembrete

        open={openModalEditar}

        onClose={() => setOpenModalEditar(false)}

        lembrete={lembreteSelecionado}

        atualizarLembrete={props.atualizarLembrete}

      />



      <ModalExcluirLembrete

        open={openModalExcluir}

        onClose={() => setOpenModalExcluir(false)}

        lembrete={lembreteSelecionado}

        deletarLembrete={props.deletarLembrete}

      />

      <ModalVisualizarLembrete
        open={openModalVisualizar}
        onClose={() => setOpenModalVisualizar(false)}
        lembrete={lembreteSelecionado}
      />


    </div>
  );
}

export default CardLembrete;
