import Tabela from "../shared/tabela/Tabela";
import SwitchStatus from "../shared/switchStatus/SwitchStatus";

function TabelaUsuarios({
    usuarios = [],
    onEditar,
    onAlterarStatus,
    onRemover,
    onAlterarSenha
}) {

    const usuariosOrdenados = [...usuarios].sort((a, b) => {
        const perfilA = a.idPerfil ?? a.perfilId ?? 0;
        const perfilB = b.idPerfil ?? b.perfilId ?? 0;
        return perfilA - perfilB;
    });

    const data = usuariosOrdenados.map((usuario) => [
        usuario.nome,
        usuario.email,
        <div className="acoes-usuarios" key={usuario.id}>
            <SwitchStatus
                ativo={usuario.ativo}
                onClick={() => onAlterarStatus(usuario)}
            />

            <button
                className="btn-editar"
                onClick={() => onEditar(usuario)}
            >
                <ion-icon name="pencil-outline"></ion-icon> Editar
            </button>

            <button
                className="btn-remover"
                onClick={() => onRemover(usuario)}
            >
                <ion-icon name="trash-outline"></ion-icon> Remover
            </button>
        </div>
    ]);

    return (
        <div className="usuarios-tabela-wrapper">
            <Tabela
                columns={[
                    "NOME",
                    "E-MAIL",
                    "AÇÕES"
                ]}
                data={data}
            />
        </div>
    );
}

export default TabelaUsuarios;