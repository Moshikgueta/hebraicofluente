/* O ecossistema do Hebraico Fluente: as jornadas e os produtos, num lugar só.
 * ─────────────────────────────────────────────────────────────────────────
 * 23/10/2026 (master prompt "Hebraico Fluente 2.0", decisões do dono): a capa
 * virou um portal de três jornadas. A capa, as páginas de jornada e o
 * catálogo leem DAQUI; um produto novo entra nesta lista e aparece em todo
 * lugar, sem mexer nas telas.
 *
 * A regra que segura tudo: o STATUS sai do catálogo de verdade
 * (data/courses.json), nunca é escrito à mão aqui.
 *   - curso com `status: available` e à venda  → 'disponivel';
 *   - curso com `status: soon`                  → 'em-desenvolvimento';
 *   - produto com `aVenda: false`               → 'em-breve' (pronto, fora
 *     de venda por decisão do dono: o e-book, à espera do contador e do
 *     advogado). Decisão de 23/10/2026: aparece "Em breve", SEM preço, sem
 *     botão de compra e sem checkout;
 *   - o Raízes Sefarditas não está no catálogo (não tem preço nem art. 1 dos
 *     Termos ainda): 'em-breve', pela mesma decisão.
 *
 * Os produtos 4 a 6 do master prompt (Hebraico de Sobrevivência, Israel
 * Antes de Embarcar, Biblioteca) NÃO existem, e por isso não estão aqui. O
 * prompt pede o mesmo: nada anunciado como pronto só porque foi planejado.
 */

import { estaAVenda, getCourse, type CatalogCourse } from '@/lib/catalog';
import { course, totalLicoes } from '@/lib/content-publico';

export type JornadaId = 'hebraico' | 'israel' | 'raizes';

export type Status = 'disponivel' | 'pre-lancamento' | 'em-desenvolvimento' | 'em-breve';

export const ROTULO_DO_STATUS: Record<Status, string> = {
  disponivel: 'Disponível',
  'pre-lancamento': 'Pré-lançamento',
  'em-desenvolvimento': 'Em desenvolvimento',
  'em-breve': 'Em breve'
};

export type Jornada = {
  id: JornadaId;
  rota: string;
  /** O nome no menu e no cartão. */
  nome: string;
  /** A promessa curta do cartão da capa. */
  chamada: string;
  /** Uma linha, para o menu do site. */
  resumo: string;
  /** O botão do cartão da capa. */
  cta: string;
  /** A letra hebraica que marca a jornada (só ilustração, sempre por <He>). */
  letra: string;
};

/* A letra de cada jornada é só ilustração: as três com que o curso abre a
   leitura (Álef, Mem e Tav, lições 1 e 2). Nenhuma é "explicada" como
   símbolo da jornada: significado inventado para uma letra seria hebraico
   escrito por nós sem revisão. */
export const JORNADAS: readonly Jornada[] = [
  {
    id: 'hebraico', rota: '/aprender-hebraico', nome: 'Aprender hebraico', letra: 'א',
    chamada: 'Do primeiro contato com as letras à leitura das suas primeiras palavras.',
    resumo: 'Ler e escrever do zero, letra por letra.',
    cta: 'Quero aprender hebraico'
  },
  {
    id: 'israel', rota: '/descobrir-israel', nome: 'Descobrir Israel', letra: 'מ',
    chamada: 'Lugares, histórias e o dia a dia de Israel, contados por quem nasceu lá.',
    resumo: 'Lugares, história e o dia a dia do país.',
    cta: 'Quero descobrir Israel'
  },
  {
    id: 'raizes', rota: '/raizes-sefarditas', nome: 'Explorar raízes sefarditas', letra: 'ת',
    chamada: 'A história dos judeus sefarditas, da Península Ibérica aos caminhos que chegaram ao Brasil.',
    resumo: 'A história sefardita, da Península Ibérica ao Brasil.',
    cta: 'Quero explorar minhas raízes'
  }
];

export const jornada = (id: JornadaId): Jornada => JORNADAS.find(j => j.id === id)!;

export type Produto = {
  id: string;
  jornada: JornadaId;
  nome: string;
  /** Uma linha: o benefício, não a descrição técnica. */
  subtitulo: string;
  /** O parágrafo da página da jornada. */
  descricao: string;
  formato: string;
  publico: string;
  status: Status;
  /** Para onde o cartão leva. Produto fora de venda leva à página da jornada,
   *  nunca a um checkout. */
  rota: string;
  cta: string;
  /** O slug no data/courses.json, quando o produto está no catálogo. */
  slug?: string;
  /** A ficha comum (FichaDoProduto): os mesmos campos para os três produtos,
   *  para quem compara não ter de procurar a mesma informação em lugares
   *  diferentes. Do catálogo quando ele tem (forWhomPt, outcomesPt). */
  ficha: { paraQuem: string[]; consegue: string[]; tempo: string };
};

/** O status de um produto do catálogo, lido do catálogo. */
export function statusDoCatalogo(c: CatalogCourse | undefined): Status {
  if (!c) return 'em-breve';
  if (!estaAVenda(c)) return 'em-breve';
  if (c.status === 'soon') return 'em-desenvolvimento';
  return 'disponivel';
}

/** A lista, montada na hora a partir do catálogo. */
export function produtos(): Produto[] {
  const alfabetizacao = getCourse('alfabetizacao');
  const a1 = getCourse('hebraico-a1');
  const livro = getCourse('israel-alem-do-roteiro');
  return [
    {
      id: 'alfabetizacao', slug: 'alfabetizacao', jornada: 'hebraico',
      nome: alfabetizacao?.titlePt ?? 'Alfabetização em Hebraico',
      subtitulo: alfabetizacao?.taglinePt ?? '',
      descricao: alfabetizacao?.summaryPt ?? '',
      formato: 'Curso interativo online, no celular ou no computador',
      publico: 'Quem nunca leu hebraico, ou já tentou e parou',
      status: statusDoCatalogo(alfabetizacao),
      rota: '/curso-de-hebraico', cta: 'Conhecer o curso',
      ficha: {
        paraQuem: alfabetizacao?.forWhomPt ?? [],
        consegue: alfabetizacao?.outcomesPt ?? [],
        tempo: `${totalLicoes()} lições em ${course.modules.length} módulos, no seu ritmo, com ${alfabetizacao?.accessMonths ?? 12} meses de acesso.`
      }
    },
    {
      id: 'hebraico-a1', slug: 'hebraico-a1', jornada: 'hebraico',
      nome: a1?.titlePt ?? 'Hebraico A1',
      subtitulo: a1?.taglinePt ?? '',
      descricao: a1?.summaryPt ?? '',
      formato: 'Curso interativo online',
      publico: 'Quem já lê as letras e quer começar a conversar',
      status: statusDoCatalogo(a1),
      rota: '/cursos', cta: 'Ver a trilha dos cursos',
      ficha: { paraQuem: a1?.forWhomPt ?? [], consegue: a1?.outcomesPt ?? [], tempo: '' }
    },
    {
      id: 'israel-alem-do-roteiro', slug: 'israel-alem-do-roteiro', jornada: 'israel',
      nome: livro?.titlePt ?? 'Israel Além do Óbvio',
      subtitulo: livro?.taglinePt ?? '',
      descricao: livro?.summaryPt ?? '',
      formato: 'Guia ilustrado e interativo, com o PDF para baixar',
      publico: 'Quem vai viajar para Israel, ou quer entender o país',
      status: statusDoCatalogo(livro),
      rota: '/israel-alem-do-obvio', cta: 'Ver o que tem dentro',
      ficha: {
        paraQuem: livro?.forWhomPt ?? [],
        consegue: livro?.outcomesPt ?? [],
        tempo: `${livro?.modules.length ?? 11} capítulos para ler antes da viagem e consultar durante, com ${livro?.accessMonths ?? 12} meses da versão interativa e o PDF para baixar.`
      }
    },
    {
      id: 'raizes-sefarditas', jornada: 'raizes',
      nome: 'Raízes Sefarditas',
      subtitulo: 'Uma jornada em dez módulos pela história, pelos caminhos e pela memória sefardita.',
      descricao:
        'Dez módulos de leitura e atividades sobre os judeus sefarditas: a vida na Península Ibérica, ' +
        'a Inquisição, os caminhos do exílio, o que chegou ao Brasil e o que ficou na língua e na cultura. ' +
        'Com um atlas que separa o que é documentado do que é hipótese, e um laboratório para organizar a ' +
        'memória da sua família, guardado só no seu aparelho.',
      formato: 'Curso interativo online, com atlas e laboratório de memórias',
      publico: 'Quem tem curiosidade, ou uma história de família, sobre a herança sefardita',
      /* Fora do catálogo: sem preço e sem art. 1 dos Termos (CLAUDE.md, Raízes). */
      status: 'em-breve',
      rota: '/raizes-sefarditas', cta: 'Ver o que tem dentro',
      /* Fora do catálogo: a ficha repete só o que esta página já diz (os dez
         módulos, o atlas, o laboratório), sem afirmação histórica nova. */
      ficha: {
        paraQuem: [
          'Quem tem curiosidade pela história dos judeus sefarditas.',
          'Quem tem uma história de família ligada à herança sefardita e quer organizá-la com cuidado.'
        ],
        consegue: [
          'Acompanhar no mapa os caminhos do exílio que o curso estuda.',
          'Separar o que é documentado do que é tradição ou hipótese.',
          'Organizar a memória da sua família por tipo de evidência, guardada só no seu aparelho.'
        ],
        tempo: 'Dez módulos de leitura e atividades, no seu ritmo.'
      }
    }
  ];
}

export const produtosDaJornada = (id: JornadaId): Produto[] => produtos().filter(p => p.jornada === id);

/** Um produto pode receber botão de compra? Só o disponível. */
export const vendavel = (p: Produto): boolean => p.status === 'disponivel';

/** "Disponível" ou "Em breve", para a jornada inteira: aberta se algum
 *  produto dela está à venda. É o selo do menu do site. */
export function jornadaAberta(id: JornadaId): boolean {
  return produtosDaJornada(id).some(vendavel);
}
