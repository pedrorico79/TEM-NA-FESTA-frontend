import { useEffect, useState } from "react";
import Modal from "../shared/modal/Modal";
import { nomePerfilUsuario } from "../../utils/perfilUsuario";

function ModalNovoUsuario(props) {
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [novoUsuario, setNovoUsuario] = useState({
        nome: "",
        email: "",
        senha: "",
        perfilId: "",
    });

    useEffect(() => {
        if (!props.open) {
            setNovoUsuario({ nome: "", email: "", senha: "", perfilId: "" });
        }
    }, [props.open]);

    function handleChange(e) {
        const { name, value } = e.target;
        setNovoUsuario({
            ...novoUsuario,
            [name]: value,
        });
    }

    function salvar(e) {
        e.preventDefault();

        if (!novoUsuario.nome.trim() || !novoUsuario.email.trim() || !novoUsuario.senha.trim() || !novoUsuario.perfilId) {
            alert("Preencha nome, e-mail, senha e perfil.");
            return;
        }

        props.onSalvar({
            nome: novoUsuario.nome,
            email: novoUsuario.email,
            senha: novoUsuario.senha,
            perfilId: Number(novoUsuario.perfilId),
        })
            .then(() => {
                setNovoUsuario({
                    nome: "",
                    email: "",
                    senha: "",
                    perfilId: "",
                });

                props.onClose();
                props.onSucesso();
            })
            .catch((erro) => {
                console.error(erro);
                alert(erro.response?.data?.message || "Erro ao cadastrar usuário.");
            });
    }

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            title="Novo Usuário"
        >
            <form onSubmit={salvar}>

                <div className="form-grid">
                    <div className="form-group">
                        <label>Nome *</label>
                        <input
                            type="text"
                            name="nome"
                            value={novoUsuario.nome}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>E-mail *</label>
                        <input
                            type="email"
                            name="email"
                            value={novoUsuario.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Senha inicial *</label>
                        <div className="senha-input-wrapper">
                            <input
                                type={mostrarSenha ? "text" : "password"}
                                name="senha"
                                value={novoUsuario.senha}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="botao-mostrar-senha"
                                onClick={() => setMostrarSenha((atual) => !atual)}
                                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                            >
                                <ion-icon name={mostrarSenha ? "eye-outline" : "eye-off-outline"}></ion-icon>
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Perfil *</label>
                        <div className="usuario-select-wrap">
                            <select
                                className="usuario-perfil-select"
                                name="perfilId"
                                value={novoUsuario.perfilId}
                                onChange={handleChange}
                                disabled={!props.perfis?.length}
                                required
                            >
                                <option value="">Selecione um perfil</option>
                                {(props.perfis || []).map((perfil) => (
                                    <option key={perfil.id} value={perfil.id}>
                                        {nomePerfilUsuario(perfil)}
                                    </option>
                                ))}
                            </select>
                        </div>
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

                    <button type="submit" className="primary-button">
                        Salvar
                    </button>
                </div>

            </form>
        </Modal>
    );
}

export default ModalNovoUsuario;
