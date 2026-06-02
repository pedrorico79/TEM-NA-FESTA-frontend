import Modal from "../shared/modal/Modal";
import { useState } from "react";

function ModalNovoCliente(props) {

    const [novoCliente, setNovoCliente] = useState({
        nome: "",
        telefone: "",
        whatsapp: "",
        instagram: "",
        anotacoes: "",

        endereco: {
            cep: "",
            rua: "",
            numero: "",
            complemento: "",
            bairro: "",
            cidade: "",
            estado: "",
        },
    });

    const cliente = novoCliente;

    const handleChange = (campo, valor) => {
        setNovoCliente({
        ...cliente,
        [campo]: valor,
    });
    };

    const handleEndereco = (campo, valor) => {
        setNovoCliente({
        ...cliente,

        endereco: {
            ...cliente.endereco,
            [campo]: valor,
        },
    });
    };

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            title="Novo Cliente"
        >

            <div className="form-grid">

                <div className="form-group">

                    <label>Nome *</label>

                    <input
                        value={cliente.nome}
                        onChange={(e) =>
                            handleChange("nome", e.target.value)
                        }
                    />

                </div>

                <div className="form-group">
                    <label>Telefone</label>

                    <input
                        value={cliente.telefone}
                        onChange={(e) =>
                            handleChange("telefone", e.target.value)
                        }
                    />
                </div>

                <div className="form-group">
                    <label>WhatsApp</label>

                    <input
                        value={cliente.whatsapp}
                    onChange={(e) =>
                        handleChange("whatsapp", e.target.value)
                    }
                    />
                </div>

                <div className="form-group">
                    <label>Instagram</label>

                    <input
                        value={cliente.instagram}
                    onChange={(e) =>
                        handleChange("instagram", e.target.value)
                    }
                    />
                </div>

            </div>

            <div className="form-group">
                    <label>Anotações</label>

                    <textarea
                        value={cliente.anotacoes}
                onChange={(e) =>
                    handleChange("anotacoes", e.target.value)
                }
                    />
                </div>

            <h3 className="modal-section-title">
                Endereço
            </h3>

            <div className="form-grid">

                <div className="form-group">
                    <label>CEP *</label>

                    <input
                        value={cliente.endereco.cep}
                    onChange={(e) =>
                        handleEndereco("cep", e.target.value)
                    }
                    />
                </div>

                <div className="form-group">
                    <label>Rua *</label>

                    <input
                        value={cliente.endereco.rua}
                    onChange={(e) =>
                        handleEndereco("rua", e.target.value)
                    }
                    />
                </div>

                <div className="form-group">
                    <label>Número *</label>

                    <input
                        value={cliente.endereco.numero}
                    onChange={(e) =>
                        handleEndereco("numero", e.target.value)
                    }
                    />
                </div>

                <div className="form-group">
                    <label>Complemento</label>

                    <input
                        value={cliente.endereco.complemento}
                    onChange={(e) =>
                        handleEndereco("complemento", e.target.value)
                    }
                    />
                </div>

                <div className="form-group">
                    <label>Bairro *</label>

                    <input
                        value={cliente.endereco.bairro}
                    onChange={(e) =>
                        handleEndereco("bairro", e.target.value)
                    }
                    />
                </div>

                <div className="form-group">
                    <label>Cidade *</label>

                    <input
                        value={cliente.endereco.cidade}
                    onChange={(e) =>
                        handleEndereco("cidade", e.target.value)
                    }
                    />
                </div>

                <div className="form-group">
                    <label>Estado *</label>

                    <input
                        value={cliente.endereco.estado}
                    onChange={(e) =>
                        handleEndereco("estado", e.target.value)
                    }
                    />
                </div>


            </div>

            <div className="modal-actions">

                <button
                    className="secondary-button"
                    onClick={props.onClose}
                >
                    Cancelar
                </button>

                <button
                    className="primary-button"
                    onClick={props.onSave}
                >
                    Criar Cliente
                </button>

            </div>

        </Modal>
    );
}

export default ModalNovoCliente;