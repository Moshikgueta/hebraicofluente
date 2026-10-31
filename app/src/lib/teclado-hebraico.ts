/* O teclado hebraico na tela (components/learn/TecladoHebraico.tsx).
 * ─────────────────────────────────────────────────────────────────────────
 * As teclas e a edição, sem React, para o teste conferir: inserir na posição
 * do cursor (ou no lugar do trecho selecionado) e apagar para trás UM ponto
 * de código - assim dá para tirar só a vogal de uma letra, sem perder a letra.
 */

import { tx } from '@/i18n/telas/motor-teclado-hebraico';
import { translit } from '@/i18n/translit';
import { LOCALE } from '@/i18n';

export type Tecla = { ch: string; nome: string };

export const LETRAS: Tecla[] = [
  /* Os nomes das letras são transliteração: no inglês saem convertidos
     (i18n/translit.ts), e o ח, que lá se escreve com ch, é Chet. */
  ['א', 'Álef'], ['ב', 'Bet'], ['ג', 'Guímel'], ['ד', 'Dálet'], ['ה', 'He'], ['ו', 'Vav'], // i18n-ok: transliteração
  ['ז', 'Záyin'], ['ח', 'Het'], ['ט', 'Tet'], ['י', 'Yud'], ['כ', 'Kaf'], ['ל', 'Lámed'], // i18n-ok: transliteração
  ['מ', 'Mem'], ['נ', 'Nun'], ['ס', 'Sámech'], ['ע', 'Áyin'], ['פ', 'Pe'], ['צ', 'Tsádi'], // i18n-ok: transliteração
  ['ק', 'Kuf'], ['ר', 'Resh'], ['ש', 'Shin'], ['ת', 'Tav']
].map(([ch, nome]) => ({ ch: ch!, nome: ch === 'ח' && LOCALE === 'en' ? 'Chet' : translit(nome!) }));

export const FINAIS: Tecla[] = [
  ['ך', 'Kaf'], ['ם', 'Mem'], ['ן', 'Nun'], ['ף', 'Pe'], ['ץ', 'Tsádi'] // i18n-ok: transliteração
].map(([ch, nome]) => ({ ch: ch!, nome: tx.final(translit(nome!)) }));

/* Os sinais que o curso ensina (data/nikud.json e as letras), na ordem em
   que aparecem nas lições. Cada um entra DEPOIS da letra que o leva. */
export const NIKUD: Tecla[] = [
  ['ַ', 'patach (a)'], ['ָ', 'kamats (a)'], ['ֶ', 'segol (e)'], ['ֵ', 'tsere (e)'],
  ['ִ', 'chirik (i)'], ['ֹ', 'cholam (o)'], ['ֻ', 'kubuts (u)'], ['ְ', 'shva'],
  ['ּ', tx.daguesh], ['ׁ', tx.pontoShin], ['ׂ', tx.pontoSin]
].map(([ch, nome]) => ({ ch: ch!, nome: nome! }));

export type Edicao = { valor: string; cursor: number };
export type Selecao = { ini: number; fim: number };

const limite = (valor: string, s: Selecao): Selecao => {
  const ini = Math.max(0, Math.min(s.ini, valor.length));
  const fim = Math.max(ini, Math.min(s.fim, valor.length));
  return { ini, fim };
};

/** Põe `txt` no lugar da seleção (ou no cursor, se ela é vazia). */
export function inserir(valor: string, sel: Selecao, txt: string): Edicao {
  const { ini, fim } = limite(valor, sel);
  return { valor: valor.slice(0, ini) + txt + valor.slice(fim), cursor: ini + txt.length };
}

/** Apaga a seleção, ou o ponto de código antes do cursor. */
export function apagar(valor: string, sel: Selecao): Edicao {
  const { ini, fim } = limite(valor, sel);
  if (fim > ini) return { valor: valor.slice(0, ini) + valor.slice(fim), cursor: ini };
  if (ini === 0) return { valor, cursor: 0 };
  /* Um ponto de código: o hebraico do curso não tem par substituto, então
     um caractere de JavaScript é uma letra OU um sinal. */
  return { valor: valor.slice(0, ini - 1) + valor.slice(ini), cursor: ini - 1 };
}
