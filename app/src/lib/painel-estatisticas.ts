/* As tabelas do painel de estatísticas (30/09/2026), sem navegador: o que
 * o dono lê em /admin/estatisticas. Ver worker/src/api/estatisticas.js. */

export type Resposta = { kind: string; licao: string; total: number; erros: number };
export type Etapa = { licao: string; etapa: number; n: number };

/** O nome de cada tipo de exercício, como o dono o reconhece. */
export const TIPO_PT: Record<string, string> = {
  'audio-recognition': 'Ouvir e achar a letra',
  'build-letters': 'Montar com letras',
  'build-syllable': 'Montar a sílaba',
  'build-word': 'Montar a palavra',
  'complete-word': 'Completar a palavra',
  'cursive-word': 'Palavra em cursiva',
  'final-form': 'Forma final',
  'letter-in-word': 'Achar a letra na palavra',
  'letter-position': 'Posição da letra',
  'letter-recognition': 'Reconhecer a letra',
  'letter-variant': 'Com ou sem o ponto',
  'listen-meaning': 'Ouvir e entender',
  'listen-syllable': 'Ouvir a sílaba',
  'match': 'Ligar pares',
  'meaning-to-word': 'Do sentido à palavra',
  'odd-one-out': 'Achar a intrusa',
  'print-vs-cursive': 'Impressa e cursiva',
  'scene-reading': 'Cena do mundo real',
  'sentence-reading': 'Ler a frase',
  'sound-to-syllable': 'Do som à sílaba',
  'syllable-reading': 'Ler sílaba ou palavra',
  'type-answer': 'Digitar a leitura',
  'type-hebrew': 'Digitar em hebraico',
  'vowel-pair': 'Par de vogais',
  'vowel-sound': 'Som da vogal',
  'word-meaning': 'Sentido da palavra'
};

/** Onde mais se erra: só com respostas bastantes para não ser acaso. */
export function ondeErram(respostas: readonly Resposta[], minimo = 10, limite = 25) {
  return respostas
    .filter(r => r.total >= minimo)
    .map(r => ({ ...r, taxa: r.erros / r.total }))
    .sort((a, b) => b.taxa - a.taxa || b.total - a.total)
    .slice(0, limite);
}

/**
 * Onde param: para cada lição, na ordem do curso, quantos concluíram a
 * primeira etapa (começaram) e a última (terminaram). A última é a 5 numa
 * letra ou som, e a 3 nos módulos sem letra.
 */
export function ondeParam(etapas: readonly Etapa[], ordem: readonly { id: string; etapas: number }[]) {
  const conta = new Map(etapas.map(e => [`${e.licao}|${e.etapa}`, e.n]));
  return ordem.map(({ id, etapas: ultima }) => {
    const comecaram = conta.get(`${id}|1`) ?? 0;
    const terminaram = conta.get(`${id}|${ultima}`) ?? 0;
    return { id, comecaram, terminaram, taxa: comecaram ? terminaram / comecaram : null };
  });
}

/** A ordem do curso tirada do plano público (modules.json): letras e sons
 *  pela lição, e os módulos sem letra pelo id do módulo. */
export function ordemDoPlano(modulos: readonly {
  id: string; letterIds: readonly string[]; lessons: readonly { n: number; letters?: readonly string[]; som?: string }[];
}[]): { id: string; etapas: number }[] {
  const out: { id: string; etapas: number }[] = [];
  for (const m of modulos) {
    if (!m.letterIds.length) {
      for (const l of [...m.lessons].sort((a, b) => a.n - b.n)) if (l.som) out.push({ id: `som-${l.som}`, etapas: 5 });
      out.push({ id: m.id, etapas: 3 });
      continue;
    }
    for (const l of [...m.lessons].sort((a, b) => a.n - b.n)) {
      if (l.som) out.push({ id: `som-${l.som}`, etapas: 5 });
      for (const id of l.letters ?? []) out.push({ id, etapas: 5 });
    }
  }
  return out;
}

/* O teste grátis da capa (03/10/2026): as etapas na ordem, com o nome que o
   dono reconhece. Ver worker/src/api/estatisticas.js, `contarDemo`. */
export const ETAPAS_DA_DEMO_PT: readonly { etapa: string; nome: string }[] = [
  { etapa: 'visto', nome: 'Viram o teste na página' },
  { etapa: 'reconhecer', nome: 'Começaram (Reconhecer)' },
  { etapa: 'comparar', nome: 'Comparar (Álef ou Áyin)' },
  { etapa: 'vogais', nome: 'Vogais' },
  { etapa: 'escrever', nome: 'Escrever' },
  { etapa: 'achar', nome: 'Achar nas palavras' },
  { etapa: 'ler', nome: 'Ler a palavra' },
  { etapa: 'pronto', nome: 'Terminaram o teste' },
  { etapa: 'cta', nome: 'Clicaram para comprar' }
];

/** O funil do teste: quantos chegaram a cada etapa, e a parte de quem viu. */
export function funilDaDemo(demo: readonly { etapa: string; n: number }[]) {
  const conta = new Map(demo.map(d => [d.etapa, d.n]));
  const viram = conta.get('visto') ?? 0;
  return ETAPAS_DA_DEMO_PT.map(({ etapa, nome }) => {
    const n = conta.get(etapa) ?? 0;
    return { etapa, nome, n, deQuemViu: viram ? n / viram : null };
  });
}
