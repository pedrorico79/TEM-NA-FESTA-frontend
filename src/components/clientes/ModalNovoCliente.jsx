import { useState } from "react";
import Modal from "../shared/modal/Modal";

function ModalNovoCliente(props) {
    const [novoCliente, setNovoCliente] = useState({
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

    function handleChange(e) {
        const { name, value } = e.target;

        setNovoCliente({
            ...novoCliente,
            [name]: value,
        });
    }

    function salvar(e) {
        e.preventDefault();

        if (
            !novoCliente.nome.trim() ||
            !novoCliente.telefone ||
            !novoCliente.whatsapp ||
            !novoCliente.cep ||
            !novoCliente.logradouro ||
            !novoCliente.numero ||
            !novoCliente.bairro ||
            !novoCliente.cidade ||
            !novoCliente.estado
        ) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        props.onSalvar(novoCliente)
            .then(() => {
                setNovoCliente({
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

                props.onClose();
                props.onSucesso();
            })
            .catch((erro) => {
                console.error(erro);
                alert("Erro ao cadastrar cliente.");
            });
    }

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            title="Novo Cliente"
        >
            <form onSubmit={salvar}>

                <div className="form-grid">
                    <div className="form-group">
                        <label>Nome *</label>
                        <input
                            type="text"
                            name="nome"
                            value={novoCliente.nome}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Telefone *</label>
                        <input
                            type="text"
                            name="telefone"
                            value={novoCliente.telefone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>WhatsApp *</label>
                        <input
                            type="text"
                            name="whatsapp"
                            value={novoCliente.whatsapp}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Instagram</label>
                        <input
                            type="text"
                            name="instagram"
                            value={novoCliente.instagram}
                            onChange={handleChange}
                            placeholder="@usuario"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Anotações</label>
                    <textarea
                        name="anotacoes"
                        value={novoCliente.anotacoes}
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
                            value={novoCliente.cep}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Logradouro *</label>
                        <input
                            type="text"
                            name="logradouro"
                            value={novoCliente.logradouro}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Número *</label>
                        <input
                            type="text"
                            name="numero"
                            value={novoCliente.numero}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Complemento</label>
                        <input
                            type="text"
                            name="complemento"
                            value={novoCliente.complemento}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Bairro *</label>
                        <input
                            type="text"
                            name="bairro"
                            value={novoCliente.bairro}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Cidade *</label>
                        <input
                            type="text"
                            name="cidade"
                            value={novoCliente.cidade}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Estado *</label>
                        <input
                            type="text"
                            name="estado"
                            maxLength={2}
                            value={novoCliente.estado}
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

export default ModalNovoCliente;