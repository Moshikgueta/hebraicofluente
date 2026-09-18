/* O catálogo — a lista de produtos da plataforma.
 * ─────────────────────────────────────────────────────────────────────────
 * Hebraico Fluente não é um curso com um site na frente; é uma plataforma em
 * que a mesma conta vai abrindo cursos: Alfabetização → A1 → A2 → B1. Este
 * módulo é o único lugar que sabe quais cursos existem.
 *
 * Três regras que valem a pena escrever, porque cada uma já foi quebrada em
 * algum produto que você conhece:
 *
 *   1. O preço vive aqui e em nenhum outro lugar. A página de vendas, o
 *      checkout e o que a cobrança manda para a Mercado Pago leem o MESMO
 *      campo. Um preço escrito duas vezes vira dois preços.
 *
 *   2. `status: 'soon'` é conteúdo de verdade, não um placeholder. Um curso
 *      que ainda não existe tem página, módulos e objetivos — é assim que o
 *      aluno decide continuar depois da alfabetização. O que ele não tem é
 *      botão de compra.
 *
 *   3. `engine` diz qual motor de curso renderiza as aulas. Hoje só a
 *      alfabetização tem um (`'alfabetizacao'`, as rotas /licao, /mapa,
 *      /modulo…). Um curso com `engine: null` nunca abre, mesmo que alguém
 *      tenha entitlement — o conteúdo não existe, e mentir sobre isso é pior
 *      do que a página de "em breve".
 *
 * Acrescentar um curso é acrescentar um objeto em data/courses.json. Nenhuma
 * rota precisa ser escrita: /cursos/<slug> é gerada para todo curso do
 * arquivo, e o painel do aluno passa a oferecê-lo sozinho.
 */

import catalogJson from '@content/courses.json';

export type CourseStatus = 'available' | 'soon';

export type CoursePrice = {
  /** O que é cobrado hoje, em reais inteiros. */
  brl: number;
  /** O "de", riscado. `null` quando não há âncora — e aí nada é riscado. */
  listBrl: number | null;
  /** Número máximo de parcelas no cartão. */
  installments: number;
  /** Desconto no PIX, em pontos percentuais. 0 desliga a linha inteira. */
  pixDiscountPct: number;
};

export type CatalogModule = {
  n: number;
  titlePt: string;
  subPt: string;
  /** Quantas letras o módulo ensina — só a alfabetização usa isto. */
  letters?: number;
};

export type CatalogCourse = {
  slug: string;
  /** "01".."04" — o número que aparece na capa do card. */
  code: string;
  n: number;
  titlePt: string;
  levelPt: string;
  cefr: string | null;
  status: CourseStatus;
  /** Qual motor de curso abre as aulas. `null` = ainda não existe conteúdo. */
  engine: 'alfabetizacao' | null;
  taglinePt: string;
  summaryPt: string;
  outcomesPt: string[];
  forWhomPt: string[];
  requiresPurchase: boolean;
  price: CoursePrice;
  /** Meses de acesso a partir da compra. */
  accessMonths: number;
  modules: CatalogModule[];
  stats: { modules: number; lessons: number | null };
};

const CATALOG = catalogJson as unknown as {
  currency: string;
  courses: CatalogCourse[];
};

export const currency = CATALOG.currency;

/** Todos os cursos, na ordem do catálogo. */
export const allCourses = (): CatalogCourse[] =>
  CATALOG.courses.slice().sort((a, b) => a.n - b.n);

export const getCourse = (slug: string): CatalogCourse | undefined =>
  CATALOG.courses.find(c => c.slug === slug);

/** O curso que a plataforma vende hoje. */
export const FLAGSHIP = 'alfabetizacao';

export const flagship = (): CatalogCourse => getCourse(FLAGSHIP)!;

/**
 * Dá para entrar neste curso?
 *
 * Duas condições, e as duas são necessárias: existir conteúdo (`engine`) e o
 * curso estar publicado. Um entitlement não entra nesta conta — quem tem
 * direito é outra pergunta, respondida em lib/account.
 */
export const isPlayable = (c: CatalogCourse): boolean =>
  c.status === 'available' && c.engine !== null;

/** A rota que abre o curso, ou a página de venda se ele ainda não abre. */
export function courseHref(c: CatalogCourse): string {
  return isPlayable(c) ? '/meu-hebraico' : `/cursos/${c.slug}`;
}

/* ── dinheiro ───────────────────────────────────────────────────────────
   Em centavos quando sai daqui para um meio de pagamento, em reais quando
   vai para a tela. Misturar os dois é o bug clássico de cobrança, então as
   duas funções têm nomes diferentes e a de centavos diz "cents". */

export const brl = (v: number): string =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL',
    minimumFractionDigits: Number.isInteger(v) ? 0 : 2 });

export const cents = (v: number): number => Math.round(v * 100);

/** O preço no PIX, já com desconto. Igual ao cheio quando não há desconto. */
export const pixPrice = (p: CoursePrice): number =>
  p.pixDiscountPct > 0
    ? Math.round(p.brl * (1 - p.pixDiscountPct / 100) * 100) / 100
    : p.brl;

/**
 * A parcela. Sem juros, que é o que "12x de R$ 12,25" significa em português
 * de site brasileiro — e o que a plataforma tem de bancar de fato.
 *
 * Arredonda PARA CIMA: 147 / 12 = 12,25 exatos, mas 100 / 3 daria 33,33 e
 * 3 × 33,33 é 99,99. A parcela anunciada nunca pode ser menor do que a que
 * o cartão cobra.
 */
export const installment = (p: CoursePrice): { n: number; brl: number } => {
  const n = Math.max(1, p.installments);
  return { n, brl: Math.ceil((p.brl / n) * 100) / 100 };
};
