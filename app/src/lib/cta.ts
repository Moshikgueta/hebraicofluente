/* O próximo passo, decidido num lugar só.
 * ─────────────────────────────────────────────────────────────────────────
 * A plataforma pede alguma coisa ao leitor em oito lugares diferentes: o
 * hero, o fim de cada página de conteúdo, o fim da aula de amostra, o fim da
 * lição, o fim do módulo, a área de progresso e o fim do curso. Escrever o
 * botão à mão em cada um deles produz sempre o mesmo defeito, e ele é caro:
 *
 *   o aluno que JÁ COMPROU abre /metodo e leva um "Comprar o curso" na cara.
 *
 * Isso não é um detalhe de copy. É a plataforma dizendo ao cliente pagante
 * que não sabe quem ele é - e é o tipo de erro que faz pedir reembolso. Por
 * isso a regra mora aqui, em função pura, e não dentro de cada tela:
 *
 *   tem o curso   → o passo é APRENDER, nunca comprar;
 *   não tem       → o passo é comprar, com a microcópia do que ele leva;
 *   ainda não sei → o passo de visitante, que é o destino seguro para quem
 *                   não está logado e custa um clique a quem está.
 *
 * `vende` existe para quem precisa saber o que vai renderizar sem reler a
 * regra: uma faixa comercial some inteira quando o passo não vende.
 */

import { FLAGSHIP, getCourse, isPlayable, allCourses, type CatalogCourse } from './catalog';

export type Passo = {
  href: string;
  label: string;
  /** A linha curta embaixo do botão. Nunca uma frase inteira. */
  micro: string;
  /** Este botão leva a uma cobrança? */
  vende: boolean;
};

/** O pedaço de `useAccount` de que a regra precisa - e nada além dele. */
export type Conta = {
  ready: boolean;
  signedIn: boolean;
  can(courseSlug: string): boolean;
};

/**
 * O que oferecer a esta pessoa, sobre este curso.
 *
 * Devolve sempre um passo: uma página de vendas sem botão não é uma página
 * de vendas. Enquanto a sessão não respondeu, o passo é o de visitante.
 */
export function proximoPasso(conta: Conta, slug: string = FLAGSHIP): Passo {
  const curso = getCourse(slug);

  /* Curso que ainda não abriu: não existe compra a fazer, e fingir que existe
     é vender o que não se tem. */
  if (curso && !isPlayable(curso)) {
    return {
      href: `/cursos/${slug}`,
      label: 'Ver o que vem neste curso',
      micro: 'Em breve. A página mostra o plano completo.',
      vende: false
    };
  }

  if (conta.ready && conta.can(slug)) {
    return {
      href: '/meu-hebraico',
      label: 'Continuar de onde parei',
      micro: 'Seu progresso está salvo.',
      vende: false
    };
  }

  const meses = curso?.accessMonths ?? 12;
  return {
    href: `/checkout/${slug}`,
    label: conta.ready && conta.signedIn ? 'Liberar meu acesso' : 'Começar a aprender',
    micro: `Acesso imediato · ${meses} meses · sem mensalidade`,
    vende: true
  };
}

/**
 * O curso seguinte que esta pessoa ainda NÃO tem.
 *
 * É a resposta para "e depois?", e a razão de ela existir como função: quem
 * já comprou o A1 não pode receber uma oferta do A1 na tela de conclusão da
 * alfabetização. Devolve `null` quando não sobrou nada para oferecer - e aí
 * a seção inteira não é renderizada, em vez de virar um botão morto.
 */
export function proximoCurso(conta: Conta, atual: string = FLAGSHIP): CatalogCourse | null {
  if (!conta.ready) return null;
  const aqui = getCourse(atual);
  return allCourses().find(c =>
    c.slug !== atual &&
    c.n > (aqui?.n ?? 0) &&
    !conta.can(c.slug)
  ) ?? null;
}
