import Tabela from "../shared/tabela/Tabela";
import SwitchStatus from "../shared/switchStatus/SwitchStatus";
import { dataCriacaoUsuario, nomePerfilUsuario } from "../../utils/perfilUsuario";

function TabelaUsuarios({
    usuarios = [],
    onEditar,
    onAlterarStatus,
    onRemover,
    onAlterarSenha,
    usuarioAtualId,
    onVisualizar
}) {

    const usuariosOrdenados = [...usuarios].sort((a, b) => {
        const aEhUsuarioAtual = String(a.id) === String(usuarioAtualId);
        const bEhUsuarioAtual = String(b.id) === String(usuarioAtualId);
        if (aEhUsuarioAtual !== bEhUsuarioAtual) return aEhUsuarioAtual ? -1 : 1;

        const perfilA = a.idPerfil ?? a.perfilId ?? 0;
        const perfilB = b.idPerfil ?? b.perfilId ?? 0;
        return perfilA - perfilB;
    });

    const data = usuariosOrdenados.map((usuario) => [
        <div className="usuario-identificacao">
            <span className="usuario-nome-celula">
                <span title={usuario.nome}>{usuario.nome || "-"}</span>
                {String(usuario.id) === String(usuarioAtualId) && (
                    <span className="usuario-tag-proprio">Você</span>
                )}
            </span>
            <span className="usuario-email-mobile" title={usuario.email}>{usuario.email || "-"}</span>
            <span className="usuario-meta-mobile">
                {nomePerfilUsuario(usuario.perfil)}
            </span>
        </div>,
        <span title={usuario.email}>{usuario.email || "-"}</span>,
        <span>{nomePerfilUsuario(usuario.perfil)}</span>,
        <span>{dataCriacaoUsuario(usuario.dataCriacao)}</span>,
        <div className="acoes-usuarios" key={usuario.id}>
            {String(usuario.id) !== String(usuarioAtualId) && (
                <SwitchStatus
                    ativo={usuario.ativo}
                    ariaLabel={usuario.ativo ? "Desativar usuário" : "Ativar usuário"}
                    onClick={(event) => {
                        event.stopPropagation();
                        onAlterarStatus(usuario);
                    }}
                />
            )}
            {String(usuario.id) === String(usuarioAtualId) && (
                <span className="acoes-usuarios-switch-placeholder" aria-hidden="true" />
            )}

            <button
                className="btn-editar"
                onClick={(event) => {
                    event.stopPropagation();
                    onEditar(usuario);
                }}
            >
                <ion-icon name="pencil-outline"></ion-icon><span>Editar</span>
            </button>

            <button
                className="btn-editar btn-alterar-senha"
                title="Alterar senha"
                aria-label={`Alterar senha de ${usuario.nome}`}
                onClick={(event) => {
                    event.stopPropagation();
                    onAlterarSenha(usuario);
                }}
            >
                <ion-icon name="key-outline"></ion-icon><span>Senha</span>
            </button>

            <button
                className="btn-remover"
                onClick={(event) => {
                    event.stopPropagation();
                    onRemover(usuario);
                }}
            >
                <ion-icon name="trash-outline"></ion-icon><span>Remover</span>
            </button>
        </div>
    ]);

    return (
        <div className="usuarios-tabela-wrapper">
            <Tabela
                columns={[
                    "NOME",
                    "E-MAIL",
                    "PERFIL",
                    "DATA DE CADASTRO",
                    "AÇÕES"
                ]}
                data={data}
                onRowClick={(_, index) => onVisualizar?.(usuariosOrdenados[index])}
            />
        </div>
    );
}

export default TabelaUsuarios;
