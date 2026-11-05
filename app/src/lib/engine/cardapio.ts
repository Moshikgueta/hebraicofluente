/* Ler cardápios (05/11/2026, pedido do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * Cardápios como chegam em Israel: sem nikud, com o preço em shekels. O aluno
 * lê o nome em voz alta e reconhece o que é (קפה é "kafé"), e acha no
 * cardápio quanto custa uma coisa. Abre com o alfabeto dominado: todo
 * cardápio usa letras do alfabeto inteiro. data/cardapios.json.
 *
 * As perguntas saem do próprio cardápio, numa ordem fixa por cardápio:
 *   · "O que é <nome sem nikud>?", com o sentido de outros itens como
 *     alternativas erradas;
 *   · "Quanto custa <sentido>?", com outros preços do cardápio. */

import type { ItemCompreensao } from '@/lib/content-publico';
import { stripNikud } from '@/lib/hebrew';
import { rng, shuffled } from './rng';
import { tx } from '@/i18n/telas/motor-cardapio';

export type ItemDoCardapio = { he: string; translit: string; pt: string; preco: number };
export type Cardapio = { id: string; he: string; nomePt: string; tipoPt: string; itens: ItemDoCardapio[] };

export const PERGUNTAS_DE_CADA_TIPO = 2;

export const precoEm = (n: number) => `₪${n}`;

export function perguntasDoCardapio(c: Cardapio): ItemCompreensao[] {
  const rand = rng(`cardapio-${c.id}`);
  const itens = c.itens.filter((it, i, a) => a.findIndex(x => x.pt === it.pt) === i);
  const out: ItemCompreensao[] = [];
  const [oQue, quanto] = [shuffled(itens, rand), shuffled(itens, rand)];

  for (const it of oQue.slice(0, PERGUNTAS_DE_CADA_TIPO)) {
    const erradas = shuffled(itens.filter(x => x !== it), rand).slice(0, 2).map(x => x.pt);
    const opcoes = shuffled([it.pt, ...erradas], rand);
    const he = stripNikud(it.he);
    out.push({ t: 'escolha', q: tx.oQueE(he), opcoes, certa: opcoes.indexOf(it.pt), porque: tx.porque(he, it.translit, it.pt, precoEm(it.preco)) });
  }

  const usados = new Set(out.map(p => p.q));
  for (const it of quanto.filter(x => !usados.has(tx.oQueE(stripNikud(x.he)))).slice(0, PERGUNTAS_DE_CADA_TIPO)) {
    const outros = [...new Set(itens.filter(x => x.preco !== it.preco).map(x => x.preco))];
    const erradas = shuffled(outros, rand).slice(0, 2);
    const opcoes = shuffled([it.preco, ...erradas], rand).map(precoEm);
    const he = stripNikud(it.he);
    out.push({ t: 'escolha', q: tx.quantoCusta(it.pt), opcoes, certa: opcoes.indexOf(precoEm(it.preco)), porque: tx.porque(he, it.translit, it.pt, precoEm(it.preco)) });
  }
  return out;
}
