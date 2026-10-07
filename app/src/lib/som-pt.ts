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

/** Rótulo legível de cada som do curso, pela grafia IPA do dado. */
export const SOM_PT: Readonly<Record<string, string>> = {
  '(mudo)': 'mudo: só a vogal soa',
  '(mudo para a maioria)': 'mudo para a maioria: só a vogal soa',
  '/m/': 'm, como em "mãe"',
  '/t/': 't, como em "tatu"',
  '/n/': 'n, como em "nada"',
  '/h/': 'h soprado, como no inglês "hello"',
  '/j/': 'i, como em "iate"',
  '/ɡ/': 'g, como em "gato"',
  '/d/': 'd, como em "dado"',
  '/ʃ/': 'ch, como em "chave"',
  '/l/': 'l, como em "lua"',
  '/ʁ/': 'r macio do fundo da boca, como o francês',
  '/v/': 'v, como em "vaca"',
  '/z/': 'z, como em "zebra"',
  '/χ/': 'raspado na garganta, como o rr de "carro" no Rio',
  '/s/': 's, como em "sapo"',
  '/ts/': 'ts, como em "tsunami"',
  '/k/': 'k, como o c de "casa"',
  '/b/': 'b, como em "bola"',
  '/p/': 'p, como em "pato"',
  '/f/': 'f, como em "faca"'
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
  return partes(sound).map(p => SOM_PT[p] ?? p).join(' ou ');
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
