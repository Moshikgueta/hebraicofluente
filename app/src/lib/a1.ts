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

/** Do exame, o navegador só recebe as regras e os nomes das partes: as
 *  perguntas e o gabarito ficam no servidor (worker/src/api/exame-a1.js). */
export type ParteExameA1 = { id: string; tituloPt: string; unidades: number[] };

export type CursoA1 = {
  _licenca?: string;
  genero: { perguntaPt: string };
  modulos: ModuloA1[];
  unidades: UnidadeA1[];
  exame: { sorteio: number; aprovacao: number; partes: ParteExameA1[] };
  certificado: { tituloPt: string; linhaPt: string; avisoPt: string };
};

export const CURSO_A1 = 'hebraico-a1';

/* As unidades. Escritas aqui, e não lidas do conteúdo, porque as páginas
   são geradas na build e o conteúdo do A1 é pago: chega pela rede, dentro do
   CourseGate. Um teste confere que são as mesmas dos módulos de
   data/a1/curso.json, na mesma ordem. */
export const UNIDADES_A1: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
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

/* ── conferir uma resposta escrita ─────────────────────────────────────────
   A mesma régua do alfabeto (hebraicoDigitadoCerto, lib/engine/palavras.ts):
   sem nikud, sem forma final, sem espaço nem pontuação - só a sequência de
   letras. Quem digita "אני סטודנט" ou "אֲנִי סְטוּדֶנְט" acerta igual. */
export { hebraicoDigitadoCerto as respostaHebraicaCerta } from '@/lib/engine/palavras';
