/* O teclado hebraico na tela (components/learn/TecladoHebraico.tsx).
 * ─────────────────────────────────────────────────────────────────────────
 * As teclas e a edição, sem React, para o teste conferir: inserir na posição
 * do cursor (ou no lugar do trecho selecionado) e apagar para trás UM ponto
 * de código - assim dá para tirar só a vogal de uma letra, sem perder a letra.
 */

export type Tecla = { ch: string; nome: string };

export const LETRAS: Tecla[] = [
  ['א', 'Álef'], ['ב', 'Bet'], ['ג', 'Guímel'], ['ד', 'Dálet'], ['ה', 'He'], ['ו', 'Vav'],
  ['ז', 'Záyin'], ['ח', 'Chet'], ['ט', 'Tet'], ['י', 'Yod'], ['כ', 'Kaf'], ['ל', 'Lámed'],
  ['מ', 'Mem'], ['נ', 'Nun'], ['ס', 'Sâmech'], ['ע', 'Áyin'], ['פ', 'Pe'], ['צ', 'Tsadi'],
  ['ק', 'Qof'], ['ר', 'Resh'], ['ש', 'Shin'], ['ת', 'Tav']
].map(([ch, nome]) => ({ ch: ch!, nome: nome! }));

export const FINAIS: Tecla[] = [
  ['ך', 'Kaf final'], ['ם', 'Mem final'], ['ן', 'Nun final'], ['ף', 'Pe final'], ['ץ', 'Tsadi final']
].map(([ch, nome]) => ({ ch: ch!, nome: nome! }));

/* Os sinais que o curso ensina (data/nikud.json e as letras), na ordem em
   que aparecem nas lições. Cada um entra DEPOIS da letra que o leva. */
export const NIKUD: Tecla[] = [
  ['ַ', 'patach (a)'], ['ָ', 'kamats (a)'], ['ֶ', 'segol (e)'], ['ֵ', 'tsere (e)'],
  ['ִ', 'chiriq (i)'], ['ֹ', 'cholam (o)'], ['ֻ', 'kubuts (u)'], ['ְ', 'shvá'],
  ['ּ', 'daguesh (ponto dentro)'], ['ׁ', 'ponto do Shin'], ['ׂ', 'ponto do Sin']
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
