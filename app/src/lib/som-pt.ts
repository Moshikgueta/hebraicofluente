/* O som da letra, escrito para quem fala português.
 * ─────────────────────────────────────────────────────────────────────────
 * `sound` em data/letters.json está em IPA ("/j/", "/ʁ/", "/χ/"). Para um
 * leigo isso é ruído, e às vezes é pior: "/j/" o brasileiro lê como o J de
 * "janela", o erro que a própria nota do Yod proíbe (auditoria de
 * 01/10/2026, CONT-003). A tela mostra o rótulo daqui; o IPA fica só como
 * detalhe secundário, para quem conhece.
 *
 * O mapa é por FONEMA, não por letra: Tav e Tet são o mesmo /t/, Kaf com o
 * ponto e Kuf o mesmo /k/, e é exatamente essa igualdade que o exercício de
 * ligar letra e som precisa enxergar (CONT-001).
 */

import { tx } from '@/i18n/telas/motor-som-pt';

/** Rótulo legível de cada som do curso, pela grafia IPA do dado. */
export const SOM_PT: Readonly<Record<string, string>> = {
  '(mudo)': tx.mudo,
  '(mudo para a maioria)': tx.mudoMaioria,
  '/m/': tx.m,
  '/t/': tx.t,
  '/n/': tx.n,
  '/h/': tx.h,
  '/j/': tx.j,
  '/ɡ/': tx.g,
  '/d/': tx.d,
  '/ʃ/': tx.sh,
  '/l/': tx.l,
  '/ʁ/': tx.r,
  '/v/': tx.v,
  '/z/': tx.z,
  /* Alinhado ao texto do ח aprovado em 11/10/2026: o R carioca é aproximação. */
  '/χ/': tx.ch,
  '/s/': tx.s,
  '/ts/': tx.ts,
  '/k/': tx.k,
  '/b/': tx.b,
  '/p/': tx.p,
  '/f/': tx.f
};

/* As partes de um `sound`: "/b/ ou /v/" são duas, "(mudo)" é uma. */
function partes(sound: string): string[] {
  const s = sound.trim();
  if (s.startsWith('(')) return [s];
  return s.split(/\s+ou\s+|\s+/).map(p => p.trim()).filter(Boolean);
}

/**
 * O som legível. Uma parte desconhecida volta como veio (o teste do mapa
 * garante que nenhuma letra do curso cai nesse caso).
 */
export function somPt(sound: string): string {
  return partes(sound).map(p => SOM_PT[p] ?? p).join(tx.ou);
}

/**
 * Os fonemas de um `sound`, como chaves comparáveis: "mudo" vale para Álef
 * e Áyin, "/k/" para Kaf e Kuf. Duas letras cujos conjuntos se cruzam não
 * podem ser respostas diferentes da mesma pergunta de som.
 */
export function fonemasDe(sound: string): string[] {
  return partes(sound).map(p => (p.startsWith('(mudo') ? 'mudo' : p));
}

/** As duas letras têm algum som em comum? */
export const somEmComum = (a: string, b: string): boolean => {
  const fa = new Set(fonemasDe(a));
  return fonemasDe(b).some(f => fa.has(f));
};
