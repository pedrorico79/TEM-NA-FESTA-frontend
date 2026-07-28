import { useEffect, useState } from "react";
import Modal from "../shared/modal/Modal";

function ModalEditarCliente(props) {

    const [clienteEditado, setClienteEditado] = useState({
        nome: "",
        telefone: "",
        whatsapp: "",
        instagram: "",
        anotacoes: "",
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
    });

    useEffect(() => {
        if (props.cliente) {
            setClienteEditado({
                nome: props.cliente.nome || "",
                telefone: props.cliente.telefone || "",
                whatsapp: props.cliente.whatsapp || "",
                instagram: props.cliente.instagram || "",
                anotacoes: props.cliente.anotacoes || "",
                cep: props.cliente.endereco?.cep || "",
                logradouro: props.cliente.endereco?.logradouro || "",
                numero: props.cliente.endereco?.numero || "",
                complemento: props.cliente.endereco?.complemento || "",
                bairro: props.cliente.endereco?.bairro || "",
                cidade: props.cliente.endereco?.cidade || "",
                estado: props.cliente.endereco?.estado || "",
            });
        }
    }, [props.cliente]);

    function handleChange(e) {
        const { name, value } = e.target;

        setClienteEditado({
            ...clienteEditado,
            [name]: value,
        });
    }

    function salvar(e) {
        e.preventDefault();

        if (
            !clienteEditado.nome.trim() ||
            !clienteEditado.telefone ||
            !clienteEditado.whatsapp ||
            !clienteEditado.cep ||
            !clienteEditado.logradouro ||
            !clienteEditado.numero ||
            !clienteEditado.bairro ||
            !clienteEditado.cidade ||
            !clienteEditado.estado
        ) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        props.onSalvar({
            id: props.cliente.id,
            enderecoId: props.cliente.endereco?.id,
            ...clienteEditado,
        })
            .then(() => {
                props.onClose();
                props.onSucesso();
            })
            .catch((erro) => {
                console.error(erro);
                alert("Erro ao editar cliente.");
            });
    }

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            title="Editar Cliente"
        >
            <form onSubmit={salvar}>

                <div className="form-grid">

                    <div className="form-group">
                        <label>Nome *</label>
                        <input
                            type="text"
                            name="nome"
                            value={clienteEditado.nome}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Telefone *</label>
                        <input
                            type="text"
                            name="telefone"
                            value={clienteEditado.telefone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>WhatsApp *</label>
                        <input
                            type="text"
                            name="whatsapp"
                            value={clienteEditado.whatsapp}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Instagram</label>
                        <input
                            type="text"
                            name="instagram"
                            value={clienteEditado.instagram}
                            onChange={handleChange}
                        />
                    </div>

                </div>

                <div className="form-group">
                    <label>Anotações</label>
                    <textarea
                        name="anotacoes"
                        value={clienteEditado.anotacoes}
                        onChange={handleChange}
                    />
                </div>

                <h3>Endereço</h3>

                <div className="form-grid">

                    <div className="form-group">
                        <label>CEP *</label>
                        <input
                            type="text"
                            name="cep"
                            value={clienteEditado.cep}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Logradouro *</label>
                        <input
                            type="text"
                            name="logradouro"
                            value={clienteEditado.logradouro}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Número *</label>
                        <input
                            type="text"
                            name="numero"
                            value={clienteEditado.numero}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Complemento</label>
                        <input
                            type="text"
                            name="complemento"
                            value={clienteEditado.complemento}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Bairro *</label>
                        <input
                            type="text"
                            name="bairro"
                            value={clienteEditado.bairro}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Cidade *</label>
                        <input
                            type="text"
                            name="cidade"
                            value={clienteEditado.cidade}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Estado *</label>
                        <input
                            type="text"
                            name="estado"
                            maxLength={2}
                            value={clienteEditado.estado}
                            onChange={handleChange}
                        />
                    </div>

                </div>

                <div className="modal-actions">

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={props.onClose}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="primary-button"
                    >
                        Salvar
                    </button>

                </div>

            </form>
        </Modal>
    );
}

export default ModalEditarCliente;