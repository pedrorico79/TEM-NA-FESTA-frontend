import { api } from "./api";

let usuarioAtual = null;
let requisicaoUsuarioAtual = null;

export function obterUsuarioAtualEmCache() {
    return usuarioAtual;
}

export function buscarUsuarioAtual() {
    if (usuarioAtual) return Promise.resolve(usuarioAtual);
    if (requisicaoUsuarioAtual) return requisicaoUsuarioAtual;

    requisicaoUsuarioAtual = api.get("/usuarios/me")
        .then(({ data }) => {
            usuarioAtual = data;
            return data;
        })
        .finally(() => {
            requisicaoUsuarioAtual = null;
        });

    return requisicaoUsuarioAtual;
}

export function limparUsuarioAtualEmCache() {
    usuarioAtual = null;
    requisicaoUsuarioAtual = null;
}
