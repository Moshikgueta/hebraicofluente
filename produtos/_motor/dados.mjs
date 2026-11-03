// Carrega um produto da coleção: metadados, conteúdo e textos, num objeto só.
// Tudo o que o gerador e a conferência leem passa por aqui, então trocar o
// formato de um arquivo é mexer num lugar.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const RAIZ_PRODUTOS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const RAIZ_REPO = path.resolve(RAIZ_PRODUTOS, '..');

const json = async p => JSON.parse(await readFile(p, 'utf8'));

export async function carregar(slug) {
  const dir = path.join(RAIZ_PRODUTOS, slug);
  const meta = await json(path.join(dir, 'produto.json'));
  const colecao = await json(path.join(RAIZ_PRODUTOS, 'colecao.json'));
  const { itens } = await json(path.join(dir, 'conteudo/vocabulario.json'));
  const { dialogos } = await json(path.join(dir, 'conteudo/dialogos.json'));
  const { atividades } = await json(path.join(dir, 'conteudo/atividades.json'));
  const textos = await json(path.join(dir, 'textos/guia.json'));
  // O número de cada item é a posição no arquivo: mudar a ordem renumera
  // o guia inteiro, o índice e o gabarito juntos, sem nada escrito à mão.
  itens.forEach((it, i) => { it.n = i + 1; });
  return { slug, dir, meta, colecao, itens, dialogos, atividades, textos, capitulos: textos.capitulos };
}

export const rascunho = meta => meta.revisao.hebraico !== 'aprovado' || meta.revisao.portugues !== 'aprovado';
