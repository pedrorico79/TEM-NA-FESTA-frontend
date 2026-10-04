import { aplicarMascaraTelefone, formatarTelefone } from "../../utils/telefone";

function FormCliente(props) {

  const form = props.form;

  const setForm = props.setForm;

  return (
    <div className="form-cliente">

      <div className="form-group">

        <label>Nome *</label>

        <input
          type="text"

          value={form.nome}

          onChange={(e) =>
            setForm({
              ...form,
              nome: e.target.value,
            })
          }
        />

      </div>

      <div className="form-group">

        <label>Telefone</label>

        <input
          type="tel"
          inputMode="tel"

          value={formatarTelefone(form.telefone)}

          onChange={(e) =>
            setForm({
              ...form,
              telefone: aplicarMascaraTelefone(e.target.value),
            })
          }
        />

      </div>

      <div className="form-group">

        <label>WhatsApp</label>

        <input
          type="tel"
          inputMode="tel"

          value={formatarTelefone(form.whatsapp)}

          onChange={(e) =>
            setForm({
              ...form,
              whatsapp: aplicarMascaraTelefone(e.target.value),
            })
          }
        />

      </div>

      <div className="form-group">

        <label>Instagram</label>

        <input
          type="text"

          value={form.instagram}

          onChange={(e) =>
            setForm({
              ...form,
              instagram: e.target.value,
            })
          }
        />

      </div>

      <div className="form-group">

        <label>Anotações</label>

        <textarea
          rows="4"

          value={form.anotacoes}

          onChange={(e) =>
            setForm({
              ...form,
              anotacoes: e.target.value,
            })
          }
        ></textarea>

      </div>

      <button
        className="salvar-cliente-button"
        onClick={props.onSubmit}
      >

        Salvar Cliente

      </button>

    </div>
  );
}

export default FormCliente;
