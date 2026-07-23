import ModalCriarLembrete from "./ModalCriarLembrete";
import ModalEditarLembrete from "./ModalEditarLembrete";
import ModalExcluirLembrete from "./ModalExcluirLembrete";
import ItemCardLembrete from "./ItemCardLembrete";
import { useState } from "react";

function CardLembrete(props) {

  const [openModal, setOpenModal] = useState(false);

  const [openModalEditar, setOpenModalEditar] = useState(false);

  const [openModalExcluir, setOpenModalExcluir] = useState(false);

  const [lembreteSelecionado, setLembreteSelecionado] = useState(null);


  function formatarData(data) {
    return new Date(data).toLocaleDateString("pt-BR");
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


    </div>
  );
}

export default CardLembrete;