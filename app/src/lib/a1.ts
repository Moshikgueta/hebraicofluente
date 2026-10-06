/* O curso Hebraico A1, do lado do app (06/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * O mesmo desenho de lib/content.ts, para o outro curso: o conteúdo não mora
 * no pacote, chega por GET /api/content/a1 (só para quem comprou o A1, ver
 * worker/src/api/content-a1.js) e fica num depósito na memória. Toda tela do
 * A1 renderiza dentro do CourseGate, que espera o depósito encher.
 *
 * Na build de demonstração o conteúdo vem do JSON local, por `import()`
 * dentro de um `if` que a build de produção apaga - o mesmo truque de
 * lib/content.ts, e pelo mesmo motivo: o JSON fica fora do pacote público
 * (conferido por pacote.mjs).
 */

import {
  chaveDeFrase, chaveDePalavra, chaveDoItem, unidadeConcluida, type EstadoA1, type HabilidadeA1
} from '@/lib/state/a1-estado';

export type PalavraA1 = { he: string; translit: string; pt: string; audioId?: string; reconhecer?: boolean };
export type FormasA1 = { pt: string; formas: string[] };
export type LinhaA1 = { quem: string; he: string; translit: string; pt: string; audioId?: string };

/** O retorno de uma opção errada, pelo índice dela: "Quase. בַּיִת é masculino...". */
export type DicasA1 = Record<string, string>;

export type ItemA1 =
  | { t: 'escolha'; q: string; opcoes: string[]; certa: number; porque?: string; dicas?: DicasA1; semPontos?: boolean }
  | { t: 'ouvir'; he: string; audioId?: string; q: string; opcoes: string[]; certa: number; porque?: string; dicas?: DicasA1 }
  | { t: 'ligar'; q: string; pares: [string, string][] }
  | { t: 'separar'; q: string; baldes: string[]; itens: [string, number][] }
  | { t: 'montar'; pt: string; palavras: string[]; porque?: string }
  | { t: 'completar'; q: string; antes: string; depois: string; respostas: string[]; porque?: string }
  | { t: 'erro'; q: string; errada: string; respostas: string[]; porque: string }
  | { t: 'vf'; q: string; certa: boolean; porque: string }
  | { t: 'intruso'; q: string; opcoes: string[]; certa: number; porque: string; dicas?: DicasA1 }
  | { t: 'escrever'; pt: string; respostas: string[]; porque?: string }
  | { t: 'tabela'; q: string; base: string; linhas: [string, string][] }
  | { t: 'aberta'; pt: string; exemplo: string }
  /* Os tipos que vieram com o A1 completo (06/10/2026): */
  /** Ouvir e escrever. Some sem a gravação, como o "ouvir". */
  | { t: 'ditado'; he: string; audioId?: string; respostas: string[]; porque?: string }
  /** Uma conversa que para numa fala: escolher a resposta natural. */
  | { t: 'dialogo'; q: string; linhas: [string, string][]; opcoes: string[]; certa: number; porque?: string; dicas?: DicasA1 }
  /** Pôr as falas de uma conversa na ordem (por toque, sem arrastar). */
  | { t: 'ordenar'; q: string; falas: string[]; porque?: string };

export type TipoItemA1 = ItemA1['t'];

/** Uma caixa de texto curto: cultura ("Em Israel") ou curiosidade ("Você sabia?"). */
export type CaixaA1 = { tituloPt: string; textoPt: string };

/** Um texto curto do mundo real (placa, cardápio, mensagem), com perguntas. */
export type LeituraA1 = {
  tituloPt: string;
  /** Escrito sem nikud (decisão 1: o mundo real não tem pontos). */
  semPontos?: boolean;
  linhas: { he: string; translit: string; pt: string }[];
  perguntas: ItemA1[];
};

export type UnidadeA1 = {
  n: number;
  /** O hebraico desta unidade foi aprovado pelo dono. */
  revisado: boolean;
  tituloPt: string;
  objetivoPt: string;
  /** A cena: onde, com quem. */
  situacaoPt?: string;
  notaPt?: string;
  palavras: (PalavraA1 | FormasA1)[];
  gramatica: { tituloPt: string; textoPt: string; erroPt?: string; exemplos?: { he: string; pt: string }[] }[];
  dialogo: { tituloPt: string; linhas: LinhaA1[]; glossario: PalavraA1[]; notaPt?: string };
  leitura?: LeituraA1;
  cultura?: CaixaA1[];
  sabia?: CaixaA1[];
  /** "Eu consigo...": o aluno marca o que sente que já sabe. */
  autoavaliacao?: string[];
  exercicios: ItemA1[];
};

export type ModuloA1 = { n: number; tituloPt: string; objetivoPt: string; unidades: number[] };
export type CheckpointA1 = { n: number; depoisDoModulo: number; tituloPt: string; unidades: number[] };

/** Do exame, o navegador só recebe as regras e os nomes das partes: as
 *  perguntas e o gabarito ficam no servidor (worker/src/api/exame-a1.js). */
export type ParteExameA1 = { id: string; tituloPt: string; unidades: number[] };

export type CursoA1 = {
  _licenca?: string;
  genero: { perguntaPt: string };
  modulos: ModuloA1[];
  checkpoints: CheckpointA1[];
  unidades: UnidadeA1[];
  exame: { sorteio: number; aprovacao: number; partes: ParteExameA1[] };
  certificado: { tituloPt: string; linhaPt: string; avisoPt: string };
  /** A trilha da história da língua: bônus, sempre aberta. */
  historia: { revisado: boolean; capitulos: CapituloHistoria[] };
};

export type CapituloHistoria = { n: number; tituloPt: string; epocaPt: string; depoisDaUnidade: number; textoPt: string };

export const CURSO_A1 = 'hebraico-a1';

/* As unidades. Escritas aqui, e não lidas do conteúdo, porque as páginas
   são geradas na build e o conteúdo do A1 é pago: chega pela rede, dentro do
   CourseGate. Um teste confere que são as mesmas dos módulos de
   data/a1/curso.json, na mesma ordem. */
export const CHECKPOINTS_A1: readonly number[] = [1, 2, 3, 4];
export const UNIDADES_A1: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
export const ehFormas = (w: PalavraA1 | FormasA1): w is FormasA1 => 'formas' in w;

/** Esta rota é do A1? (as rotas do A1 moram todas debaixo de /a1). */
export const rotaDoA1 = (pathname: string | null | undefined): boolean => {
  const p = (pathname ?? '').replace(/\/+$/, '');
  return p === '/a1' || p.startsWith('/a1/');
};

let DADOS: CursoA1 | null = null;

export const a1Pronto = (): boolean => DADOS !== null;

export function hidratarA1(d: CursoA1): void {
  DADOS = d;
  INDICE = null;
}

/** O curso inteiro. Lido antes de carregar é erro de programação: toda tela
 *  do A1 está dentro do CourseGate, que espera. */
export function cursoA1(): CursoA1 {
  if (!DADOS) {
    throw new Error('conteúdo do A1 lido antes de carregar; toda tela do A1 renderiza dentro de CourseGate.');
  }
  return DADOS;
}

export const unidadeA1 = (n: number): UnidadeA1 | undefined => cursoA1().unidades.find(u => u.n === n);

/** O módulo de uma unidade. */
export const moduloDaUnidade = (n: number): ModuloA1 | undefined => cursoA1().modulos.find(m => m.unidades.includes(n));

/** A unidade que vem depois desta, na ordem do curso (null na última). */
export const proximaUnidade = (n: number): number | null => {
  const ordem = cursoA1().modulos.flatMap(m => m.unidades);
  const i = ordem.indexOf(n);
  return i >= 0 && i + 1 < ordem.length ? ordem[i + 1]! : null;
};

let emAndamento: Promise<void> | null = null;

export function carregarA1(): Promise<void> {
  if (DADOS) return Promise.resolve();
  if (!emAndamento) emAndamento = buscarA1().catch(e => { emAndamento = null; throw e; });
  return emAndamento;
}

async function buscarA1(): Promise<void> {
  if (DADOS) return;
  if (process.env.NEXT_PUBLIC_PLATFORM_API !== 'worker') {
    const m = await import('@content/a1.json');
    hidratarA1(((m as { default?: unknown }).default ?? m) as CursoA1);
    return;
  }
  const r = await fetch('/api/content/a1', { credentials: 'same-origin' });
  if (!r.ok) throw new Error(`a1 ${r.status}`);
  hidratarA1(await r.json() as CursoA1);
}

/* ── que habilidade um item exercita ──────────────────────────────────────
   Para o domínio por habilidade, a partir do TIPO do item, sem marcar item
   por item à mão: o que se ouve é escuta, o que se digita é escrita, o que
   liga ou separa palavras é vocabulário, a conversa é comunicação. A escolha
   se divide pelas opções: se todas estão em português, a pergunta era o
   sentido de uma palavra (vocabulário); se há hebraico, era a forma
   (gramática). As perguntas de um texto são sempre leitura. */
const TEM_HEBRAICO = /[\u05d0-\u05ea]/;
export function habilidadeDoItem(item: ItemA1, daLeitura = false): HabilidadeA1 {
  if (daLeitura) return 'leitura';
  switch (item.t) {
    case 'ouvir': case 'ditado': return 'escuta';
    case 'escrever': case 'completar': case 'erro': case 'tabela': case 'aberta': return 'escrita';
    case 'ligar': case 'separar': case 'intruso': return 'vocabulario';
    case 'dialogo': case 'ordenar': return 'comunicacao';
    case 'escolha': return item.opcoes.some(o => TEM_HEBRAICO.test(o)) ? 'gramatica' : 'vocabulario';
    default: return 'gramatica';
  }
}

/** Onde mora cada item do curso, pela chave da revisão (chaveDoItem). */
export type ItemLocalizado = { n: number; item: ItemA1; daLeitura: boolean; chave: string };
let INDICE: Map<string, ItemLocalizado> | null = null;
export function indiceDeItens(): Map<string, ItemLocalizado> {
  if (INDICE) return INDICE;
  const m = new Map<string, ItemLocalizado>();
  for (const u of cursoA1().unidades) {
    for (const item of u.exercicios) { const chave = chaveDoItem(u.n, item); m.set(chave, { n: u.n, item, daLeitura: false, chave }); }
    for (const item of u.leitura?.perguntas ?? []) { const chave = chaveDoItem(u.n, item); m.set(chave, { n: u.n, item, daLeitura: true, chave }); }
  }
  INDICE = m;
  return m;
}

/* ── o caderno: palavras aprendidas e conquistas ───────────────────────── */

export type PalavraDoCaderno = { chave: string; he: string; pt: string; n: number; frase?: boolean };

/** Todas as palavras e frases do curso que podem ir para o caderno, pela
 *  chave do favorito: as palavras de cada unidade (uma forma de cada) e as
 *  falas dos diálogos. */
export function palavrasDoCurso(): Map<string, PalavraDoCaderno> {
  const m = new Map<string, PalavraDoCaderno>();
  for (const u of cursoA1().unidades) {
    for (const w of u.palavras) {
      const he = ehFormas(w) ? w.formas[0]! : w.he;
      const chave = chaveDePalavra(he);
      if (!m.has(chave)) m.set(chave, { chave, he, pt: w.pt, n: u.n });
    }
    for (const l of u.dialogo.linhas) {
      const chave = chaveDeFrase(l.he);
      if (!m.has(chave)) m.set(chave, { chave, he: l.he, pt: l.pt, n: u.n, frase: true });
    }
  }
  return m;
}

/** As palavras das unidades concluídas: o vocabulário que o aluno já viu E
 *  praticou até passar de 70%. */
export const palavrasAprendidas = (a1: EstadoA1): PalavraDoCaderno[] =>
  [...palavrasDoCurso().values()].filter(p => !p.frase && unidadeConcluida(a1, p.n));

export type ConquistaA1 = { id: string; tituloPt: string; comoPt: string; feita: boolean };

/** As conquistas do A1, calculadas do progresso (nada a mais guardado): o
 *  que o aluno vê é sempre o que ele fez de verdade. */
export function conquistasA1(a1: EstadoA1): ConquistaA1[] {
  const palavras = palavrasAprendidas(a1).length;
  const feita = (n: number) => unidadeConcluida(a1, n);
  const diasDeRevisao = Object.values(a1.dias).filter(v => v > 0).length;
  return [
    { id: 'primeiro-dialogo', tituloPt: 'Primeiro diálogo', comoPt: 'Concluir a Unidade 1.', feita: feita(1) },
    { id: 'palavras-10', tituloPt: 'Primeiras 10 palavras', comoPt: 'Concluir unidades com 10 palavras.', feita: palavras >= 10 },
    { id: 'primeira-leitura', tituloPt: 'Li meu primeiro texto', comoPt: 'Acertar uma pergunta de leitura.', feita: (a1.habilidades.leitura?.h ?? 0) > 0 },
    { id: 'palavras-100', tituloPt: '100 palavras', comoPt: 'Concluir unidades com 100 palavras.', feita: palavras >= 100 },
    { id: 'sem-translit', tituloPt: 'Sem transliteração', comoPt: 'Desligar a transliteração e concluir uma unidade a partir da 5.',
      feita: a1.translit?.valor === 'esconder' && Object.entries(a1.unidades).some(([n, u]) => Number(n) >= 5 && !!u.concluidaEm && u.concluidaEm >= a1.translit!.em) },
    { id: 'semana-de-revisao', tituloPt: 'Uma semana de revisão', comoPt: 'Fazer a revisão em 7 dias diferentes.', feita: diasDeRevisao >= 7 },
    { id: 'palavras-300', tituloPt: '300 palavras', comoPt: 'Concluir unidades com 300 palavras.', feita: palavras >= 300 },
    { id: 'sobrevivencia', tituloPt: 'Sobrevivência em Israel', comoPt: 'Concluir as unidades da cidade, do restaurante, das lojas, da viagem e da saúde.',
      feita: [12, 13, 14, 17, 18].every(feita) },
    { id: 'a1-concluido', tituloPt: 'A1 concluído', comoPt: 'Passar no exame final.', feita: !!a1.exame.passedAt }
  ];
}

/* ── conferir uma resposta escrita ─────────────────────────────────────────
   A mesma régua do alfabeto (hebraicoDigitadoCerto, lib/engine/palavras.ts):
   sem nikud, sem forma final, sem espaço nem pontuação - só a sequência de
   letras. Quem digita "אני סטודנט" ou "אֲנִי סְטוּדֶנְט" acerta igual. */
export { hebraicoDigitadoCerto as respostaHebraicaCerta } from '@/lib/engine/palavras';
