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
          type="text"

          value={form.telefone}

          onChange={(e) =>
            setForm({
              ...form,
              telefone: e.target.value,
            })
          }
        />

      </div>

      <div className="form-group">

        <label>WhatsApp</label>

        <input
          type="text"

          value={form.whatsapp}

          onChange={(e) =>
            setForm({
              ...form,
              whatsapp: e.target.value,
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