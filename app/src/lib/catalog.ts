/* O catálogo - a lista de produtos da plataforma.
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
 *      que ainda não existe tem página, módulos e objetivos - é assim que o
 *      aluno decide continuar depois da alfabetização. O que ele não tem é
 *      botão de compra.
 *
 *   3. `engine` diz qual motor de curso renderiza as aulas. Hoje só a
 *      alfabetização tem um (`'alfabetizacao'`, as rotas /licao, /mapa,
 *      /modulo…). Um curso com `engine: null` nunca abre, mesmo que alguém
 *      tenha entitlement - o conteúdo não existe, e mentir sobre isso é pior
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
  /** O preço CHEIO do curso, quando o de hoje é promocional: hoje, o valor
   *  que passa a valer quando o pré-lançamento terminar. `null` quando o
   *  preço cobrado já é o cheio - e aí nada é riscado. Ver `ancora()`. */
  listBrl: number | null;
  /** Número máximo de parcelas no cartão. */
  installments: number;
  /** Desconto no PIX, em pontos percentuais. 0 desliga a linha inteira. */
  pixDiscountPct: number;
  /** Último dia do preço de pré-lançamento (AAAA-MM-DD), quando há. */
  preLancamentoAte?: string | null;
  /** Preço para quem chega pelo link de uma parceria (lib/parceria.ts). */
  parceriaBrl?: number | null;
  /** Último dia (AAAA-MM-DD, Brasília) em que o preço da parceria vale. */
  parceriaAte?: string | null;
};

export type CatalogModule = {
  n: number;
  titlePt: string;
  subPt: string;
  /** Quantas letras o módulo ensina - só a alfabetização usa isto. */
  letters?: number;
};

export type CatalogCourse = {
  slug: string;
  /** "01".."04" - o número que aparece na capa do card. */
  code: string;
  n: number;
  titlePt: string;
  levelPt: string;
  cefr: string | null;
  status: CourseStatus;
  /** Qual motor de curso abre as aulas. `null` = ainda não existe conteúdo.
   *  `livro` e `pacote` não são cursos: ver `tipo`. */
  engine: 'alfabetizacao' | 'livro' | 'pacote' | null;
  /** Sem `tipo`, é curso. `livro` = o e-book; `pacote` = vários produtos num pedido. */
  tipo?: 'curso' | 'livro' | 'pacote';
  /** No pacote: os slugs que um pedido dele libera. */
  componentes?: string[];
  /** Onde o produto abre depois de comprado. Sem isto, /meu-hebraico. */
  abre?: string;
  /** `false` = no ar só para quem tem o acesso liberado à mão: sem página de
   *  venda, sem checkout, sem link e sem parágrafo nas políticas (22/10/2026,
   *  o e-book, como o Raízes Sefarditas). Sem o campo, está à venda. */
  aVenda?: boolean;
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

export const tipoDe = (c: CatalogCourse | undefined): 'curso' | 'livro' | 'pacote' => c?.tipo ?? 'curso';

/** Todos os CURSOS, na ordem do catálogo. O e-book e o pacote ficam de fora:
 *  /cursos, a estante, o "próximo curso" e o rodapé falam de cursos. */
export const allCourses = (): CatalogCourse[] =>
  CATALOG.courses.filter(c => tipoDe(c) === 'curso').sort((a, b) => a.n - b.n);

/** Está à venda? `aVenda: false` tira o produto da vitrine e do checkout. */
export const estaAVenda = (c: CatalogCourse | undefined): c is CatalogCourse => !!c && c.aVenda !== false;

/** Todos os produtos À VENDA: cursos, o e-book e o pacote. Um produto com
 *  `aVenda: false` não ganha página de venda nem de checkout. */
export const allProducts = (): CatalogCourse[] =>
  CATALOG.courses.filter(estaAVenda).sort((a, b) => a.n - b.n);

export const getCourse = (slug: string): CatalogCourse | undefined =>
  CATALOG.courses.find(c => c.slug === slug);

/** O curso que a plataforma vende hoje. */
export const FLAGSHIP = 'alfabetizacao';

export const flagship = (): CatalogCourse => getCourse(FLAGSHIP)!;

/**
 * Dá para entrar neste curso?
 *
 * Duas condições, e as duas são necessárias: existir conteúdo (`engine`) e o
 * curso estar publicado. Um entitlement não entra nesta conta - quem tem
 * direito é outra pergunta, respondida em lib/account.
 */
export const isPlayable = (c: CatalogCourse): boolean =>
  c.status === 'available' && c.engine !== null;

/** A rota que abre o curso, ou a página de venda se ele ainda não abre. */
export function courseHref(c: CatalogCourse): string {
  return isPlayable(c) ? (c.abre ?? '/meu-hebraico') : `/cursos/${c.slug}`;
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
 * Em quantas vezes dá para parcelar no cartão. Só o NÚMERO DE PARCELAS.
 * ─────────────────────────────────────────────────────────────────────────
 * Esta função já devolveu também o valor de cada parcela, e as telas
 * anunciavam "12x de R$ 12,25 sem juros". Isso descrevia uma loja que banca
 * a taxa do cartão. A nossa repassa a taxa ao comprador, e aí o valor da
 * parcela não é o preço dividido por doze: quem calcula é a operadora, no
 * momento da compra, e o número depende da bandeira e do prazo.
 *
 * Então o valor da parcela não sai mais daqui - não por descuido, mas para
 * que nenhuma tela consiga anunciá-lo. O único lugar honesto para ele é a
 * tela da Mercado Pago, que cobra o que mostra. O site diz em quantas vezes
 * dá para dividir; o valor de cada vez aparece antes de confirmar.
 *
 * `app/numeros.mjs` recusa a volta de "Nx de R$ …" em qualquer página da
 * vitrine, para o caso de alguém reescrever a conta à mão.
 */
export const parcelasMax = (p: CoursePrice): number => Math.max(1, p.installments);

/**
 * O preço cheio, para a tela mostrar riscado ao lado do que se cobra hoje.
 * ─────────────────────────────────────────────────────────────────────────
 * Devolve `null` quando não há o que riscar - e, de propósito, também quando
 * o "cheio" é MENOR ou IGUAL ao cobrado. Um "de R$ 100 por R$ 147" riscado
 * na tela é o defeito que um erro de digitação em data/courses.json produz
 * sozinho, e ele não aparece em teste nenhum: a página continua montando,
 * só que anunciando um aumento como se fosse desconto.
 *
 * O que o número SIGNIFICA importa tanto quanto o número. Aqui ele é o preço
 * que o curso passa a custar quando o pré-lançamento acabar, e não um "de"
 * inventado para o 147 parecer barato - por isso as telas escrevem "depois
 * do pré-lançamento, R$ 297" em vez de deixarem um número riscado sozinho,
 * que no Brasil é preço de referência e precisa ser praticado de fato
 * (CDC art. 37, publicidade enganosa por indução).
 */
export const ancora = (p: CoursePrice): number | null =>
  p.listBrl !== null && p.listBrl > p.brl ? p.listBrl : null;

/**
 * Até quando vale o preço de pré-lançamento, como as telas escrevem
 * ("31/10/2026"), ou null. Sem traço no preço cheio desde 28/09/2026
 * (auditoria, LEGAL-014): um número riscado é preço de referência, e o
 * R$ 297 nunca foi praticado. No lugar dele, a frase com a data de fim.
 */
export function fimDoPreLancamento(p: CoursePrice): string | null {
  const d = ancora(p) && p.preLancamentoAte;
  if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const [a, m, dia] = d.split('-');
  return `${dia}/${m}/${a}`;
}
