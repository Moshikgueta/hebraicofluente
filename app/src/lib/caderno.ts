/* Meu caderno de palavras (28/10/2026, pedido do dono: "faz tudo", item 6).
 * ─────────────────────────────────────────────────────────────────────────
 * O aluno marca as palavras que quer rever e treina só elas. A chave é a
 * palavra do curso como ela está, com os pontos (`clean` só tira o que é
 * invisível): שֵׁם e שָׁם são duas palavras.
 *
 * A fusão é monotônica, como manda `state/merge.ts`: cada palavra guarda a
 * data em que entrou (`em`) e a em que saiu (`tirada`), e a fusão fica com a
 * MAIS RECENTE de cada uma. Está no caderno quem entrou depois de sair. Tirar
 * num aparelho e pôr no outro decide pelo gesto mais recente, e repetir a
 * fusão não muda nada.
 */

import { clean } from '@/lib/hebrew';

export type MarcaDoCaderno = { em: string; tirada: string | null };
export type Caderno = Record<string, MarcaDoCaderno>;

const chave = (he: string) => clean(he);
const maisTarde = (x: string | null, y: string | null) => (!x ? y : !y ? x : x >= y ? x : y);

export const noCaderno = (c: Caderno | undefined, he: string): boolean => {
  const m = c?.[chave(he)];
  return !!m && (!m.tirada || m.em > m.tirada);
};

export function alternarNoCaderno(c: Caderno | undefined, he: string, agora: string): Caderno {
  const k = chave(he);
  const atual = c?.[k];
  return noCaderno(c, he)
    ? { ...c, [k]: { em: atual!.em, tirada: agora } }
    : { ...c, [k]: { em: agora, tirada: atual?.tirada ?? null } };
}

export function fundirCaderno(a: Caderno, b: Caderno): Caderno {
  const out: Caderno = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[k], y = b[k];
    out[k] = !x ? y! : !y ? x : { em: maisTarde(x.em, y.em)!, tirada: maisTarde(x.tirada, y.tirada) };
  }
  return out;
}

/** As palavras do caderno, na ordem em que aparecem na lista dada. */
export const palavrasDoCaderno = <T extends { he: string }>(c: Caderno | undefined, palavras: readonly T[]): T[] =>
  palavras.filter(w => noCaderno(c, w.he));
