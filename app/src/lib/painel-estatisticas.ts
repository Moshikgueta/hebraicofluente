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
  { etapa: 'cta', nome: 'Clicaram para comprar' },
  { etapa: 'segunda-letra', nome: 'Pediram a segunda letra por e-mail' }
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

/* Os motivos de desistência (04/10/2026), opcionais: o nome de cada um, como
   a pessoa viu ao desistir. É a lista de lib/motivos-desistencia.ts. */
export { MOTIVOS_DESISTENCIA as MOTIVOS_PT } from './motivos-desistencia';

/* O funil do portal (23/10/2026): a capa vista, a jornada escolhida, o
   produto aberto e os botões que levam ao curso. Os eventos são os de
   lib/funil-portal.ts (e de EVENTOS_DO_PORTAL no servidor), cada um contado
   uma vez por visita; a porcentagem é sobre quem viu a capa. Depois da capa,
   a página de venda tem o funil do teste grátis, e as compras estão em
   /admin/vendas: o portal não conta checkout nem compra. */
export const EVENTOS_DO_PORTAL_PT: readonly { grupo: string; evento: string; nome: string }[] = [
  { grupo: 'Capa', evento: 'visto', nome: 'Viu a capa' },
  { grupo: 'Jornada', evento: 'jornada-hebraico', nome: 'Aprender hebraico' },
  { grupo: 'Jornada', evento: 'jornada-israel', nome: 'Descobrir Israel' },
  { grupo: 'Jornada', evento: 'jornada-raizes', nome: 'Raízes sefarditas' },
  { grupo: 'Produto', evento: 'produto-alfabetizacao', nome: 'Alfabetização em Hebraico' },
  { grupo: 'Produto', evento: 'produto-hebraico-a1', nome: 'A trilha (A1 em diante)' },
  { grupo: 'Produto', evento: 'produto-israel-alem-do-roteiro', nome: 'Israel Além do Óbvio' },
  { grupo: 'Produto', evento: 'produto-raizes-sefarditas', nome: 'Raízes Sefarditas' },
  { grupo: 'Para o curso', evento: 'cta-curso', nome: 'Botão para a página de venda' },
  { grupo: 'Para o curso', evento: 'cta-explorar', nome: 'Botão "explorar as experiências"' },
  { grupo: 'Palavra da capa', evento: 'palavra-revelar', nome: 'Viu as partes de «shalóm»' },
  { grupo: 'Palavra da capa', evento: 'palavra-ouvir', nome: 'Ouviu a palavra' }
];

/* A prévia grátis do e-book (/previa, 23/10/2026): o mesmo contador do
   portal, eventos `previa-*`. A porcentagem é sobre quem abriu a prévia. */
export const EVENTOS_DA_PREVIA_PT: readonly { evento: string; nome: string }[] = [
  { evento: 'previa-visto', nome: 'Abriu a prévia' },
  { evento: 'previa-mochila-cheia', nome: 'Encheu a mochila' },
  { evento: 'previa-prato-pronto', nome: 'Montou um prato' },
  { evento: 'previa-diario-aberto', nome: 'Abriu o diário' },
  { evento: 'previa-clique-curso', nome: 'Foi para o curso de hebraico' }
];

export function funilDaPrevia(portal: readonly { evento: string; n: number }[]) {
  const conta = new Map(portal.map(d => [d.evento, d.n]));
  const abriram = conta.get('previa-visto') ?? 0;
  return EVENTOS_DA_PREVIA_PT.map(({ evento, nome }) => {
    const n = conta.get(evento) ?? 0;
    return { evento, nome, n, deQuemAbriu: abriram ? n / abriram : null };
  });
}

/* A página "Comece aqui" (/comece-aqui, 24/10/2026): o link da bio do
   Instagram leva para lá. O mesmo contador do portal, eventos `comece-*`. A
   porcentagem é sobre quem abriu a página. Quem escolheu "ler hebraico" segue
   para o teste grátis, e o funil dele está na tabela do teste. */
export const EVENTOS_DO_COMECE_PT: readonly { evento: string; nome: string }[] = [
  { evento: 'comece-visto', nome: 'Abriu a página' },
  { evento: 'comece-ler', nome: 'Escolheu ler hebraico (teste grátis)' },
  { evento: 'comece-israel', nome: 'Escolheu conhecer Israel (prévia do e-book)' },
  { evento: 'comece-palavra', nome: 'Ouviu ou abriu a palavra «shalóm»' },
  { evento: 'comece-curso', nome: 'Foi para a página do curso' }
];

export function funilDoComece(portal: readonly { evento: string; n: number }[]) {
  const conta = new Map(portal.map(d => [d.evento, d.n]));
  const abriram = conta.get('comece-visto') ?? 0;
  return EVENTOS_DO_COMECE_PT.map(({ evento, nome }) => {
    const n = conta.get(evento) ?? 0;
    return { evento, nome, n, deQuemAbriu: abriram ? n / abriram : null };
  });
}

export function funilDoPortal(portal: readonly { evento: string; n: number }[]) {
  const conta = new Map(portal.map(d => [d.evento, d.n]));
  const viram = conta.get('visto') ?? 0;
  return EVENTOS_DO_PORTAL_PT.map(({ grupo, evento, nome }) => {
    const n = conta.get(evento) ?? 0;
    return { grupo, evento, nome, n, deQuemViu: viram ? n / viram : null };
  });
}

/* ── Crescimento por origem (23/10/2026, marketing/04-painel.md) ──────────
   Uma linha por fonte da visita (lib/origem.ts): quem abriu a página de
   venda, quem abriu o checkout, pedidos, compras e receita no período. A
   conversão é compras sobre visitas da página de venda da MESMA fonte. */
export const FONTES_PT: Record<string, string> = {
  direto: 'Direto (sem marca)', bio: 'Link da bio', stories: 'Stories', dm: 'Direct', sefarad: 'Sefarad (parceria)',
  instagram: 'Instagram (outros)', previa: 'Prévia do e-book', busca: 'Busca', ia: 'Busca por IA', email: 'E-mail',
  parceiro: 'Parceiros', anuncio: 'Anúncio', outro: 'Outros sites', 'sem-marca': 'Pedido sem origem'
};

export type PedidosDaFonte = { fonte: string; pedidos: number; compras: number; receitaCentavos: number; estornos: number };

export function crescimentoPorFonte(
  porFonte: readonly { evento: string; fonte: string; n: number }[],
  pedidos: readonly PedidosDaFonte[]
) {
  const linhas = new Map<string, { fonte: string; nome: string; venda: number; checkout: number; pedidos: number; compras: number; receitaCentavos: number; estornos: number }>();
  const linha = (fonte: string) => {
    let l = linhas.get(fonte);
    if (!l) { l = { fonte, nome: FONTES_PT[fonte] ?? fonte, venda: 0, checkout: 0, pedidos: 0, compras: 0, receitaCentavos: 0, estornos: 0 }; linhas.set(fonte, l); }
    return l;
  };
  for (const f of porFonte) {
    if (f.evento === 'venda-visto') linha(f.fonte).venda += f.n;
    else if (f.evento === 'checkout-aberto') linha(f.fonte).checkout += f.n;
  }
  for (const p of pedidos) {
    const l = linha(p.fonte);
    l.pedidos += p.pedidos; l.compras += p.compras; l.receitaCentavos += p.receitaCentavos; l.estornos += p.estornos;
  }
  const todas = [...linhas.values()].map(l => ({ ...l, conversao: l.venda ? l.compras / l.venda : null }));
  todas.sort((a, b) => b.compras - a.compras || b.venda - a.venda || a.fonte.localeCompare(b.fonte));
  const total = todas.reduce((t, l) => ({
    venda: t.venda + l.venda, checkout: t.checkout + l.checkout, pedidos: t.pedidos + l.pedidos,
    compras: t.compras + l.compras, receitaCentavos: t.receitaCentavos + l.receitaCentavos, estornos: t.estornos + l.estornos
  }), { venda: 0, checkout: 0, pedidos: 0, compras: 0, receitaCentavos: 0, estornos: 0 });
  return { linhas: todas, total: { ...total, conversao: total.venda ? total.compras / total.venda : null } };
}
