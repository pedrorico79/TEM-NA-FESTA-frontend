import Modal from "../shared/modal/Modal";

function ModalVisualizarCliente({
    open,
    cliente,
    onClose
}) {

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Detalhes do Cliente"
        >
            {cliente && (
                <div className="cliente-detalhes">

                    <div className="cliente-detalhe">
                        <strong>Nome</strong>
                        <p>{cliente.nome || "-"}</p>
                    </div>

                    <div className="form-grid">

                        <div className="cliente-detalhe">
                            <strong>Telefone</strong>
                            <p>{cliente.telefone || "-"}</p>
                        </div>

                        <div className="cliente-detalhe">
                            <strong>WhatsApp</strong>
                            <p>{cliente.whatsapp || "-"}</p>
                        </div>

                    </div>

                    <div className="form-grid">

                        <div className="cliente-detalhe">
                            <strong>Instagram</strong>
                            <p>{cliente.instagram || "-"}</p>
                        </div>

                        <div className="cliente-detalhe">
                            <strong>Status</strong>
                            <p>
                                {cliente.isAtivo
                                    ? "Ativo"
                                    : "Inativo"}
                            </p>
                        </div>

                    </div>

                    <div className="cliente-detalhe">
                        <strong>Endereço</strong>
                        <p>
                            {cliente.endereco
                                ? `${cliente.endereco.logradouro || ""}, ${
                                    cliente.endereco.numero || "S/N"
                                }${
                                    cliente.endereco.complemento
                                        ? ` - ${cliente.endereco.complemento}`
                                        : ""
                                } - ${
                                    cliente.endereco.bairro || ""
                                }, ${
                                    cliente.endereco.cidade || ""
                                } - ${
                                    cliente.endereco.estado || ""
                                }`
                                : "-"}
                        </p>
                    </div>

                    <div className="cliente-detalhe">
                        <strong>Anotações</strong>
                        <p>
                            {cliente.anotacoes || "-"}
                        </p>
                    </div>

                    <div className="modal-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onClose}
                        >
                            Fechar
                        </button>

                    </div>

                </div>
            )}
        </Modal>
    );
}

export default ModalVisualizarCliente;