/* O que a página de vendas AFIRMA.
 * ─────────────────────────────────────────────────────────────────────────
 * Este arquivo existe por um motivo só: as afirmações que vendem o curso
 * precisam morar num lugar que dê para ler de uma vez e testar sem navegador.
 * Enquanto elas estavam dentro do JSX, ninguém conferia - e foi assim que o
 * site passou a vender um áudio que não existe.
 *
 * ── o que aconteceu, em 21/09/2026 ───────────────────────────────────────
 * O manifesto de gravações estava vazio. O curso, corretamente, desligava os
 * exercícios de escuta e mostrava "áudio em breve". O FAQ dizia a verdade, com
 * duas versões da frase e o manifesto escolhendo. Mas a demonstração e o herói
 * não: listavam "Áudio gravado por falante nativo" como coisa entregue, punham
 * "escuta" entre os cinco tipos de exercício, desenhavam uma maquete de
 * exercício de escuta com botão de tocar, e o método tinha um passo "Ouça · O
 * som gravado por falante nativo".
 *
 * O site se contradizia, e a parte que contradizia era justamente a que vende.
 * No Brasil a oferta vincula (CDC art. 30): não é detalhe de texto, é
 * reembolso que o comprador tem razão em pedir.
 *
 * ── a regra, agora ───────────────────────────────────────────────────────
 * Toda frase sobre gravação tem duas versões, e quem escolhe é o MANIFESTO -
 * nunca uma decisão de quem escreve. No dia em que as gravações entrarem, a
 * vitrine volta a prometê-las sozinha, sem ninguém lembrar de nada.
 *
 * `tests/vitrine.test.ts` lê este arquivo e falha se alguma frase prometer
 * gravação sem haver gravação. `app/promessas.mjs` faz o mesmo contra o HTML
 * publicado - os dois porque o HTML só traz a primeira aba, e as outras quatro
 * só aparecem ao clicar.
 *
 * Por que `AUDIO_MANIFEST` direto, e não `audioAvailable()`: aquela função vive
 * num componente (.tsx), e importar JSX aqui faria o teste precisar de um
 * transformador de JSX para conferir texto. É o mesmo fato, lido da mesma
 * fonte gerada.
 */

import { AUDIO_MANIFEST } from '@/lib/audio-manifest';
import { ETAPAS_DA_LICAO } from '@/lib/etapas-da-licao';
import { tx } from '@/i18n/telas/venda-copy';

/** Existe gravação? É o mesmo que `audioAvailable()` responde ao curso. */
export const TEM_AUDIO = AUDIO_MANIFEST.length > 0;

export type Aba = {
  label: string;
  kicker: string;
  title: string;
  body: string;
  points: readonly string[];
};

/** As cinco abas da demonstração: um momento da lição em cada. */
export const ABAS: readonly Aba[] = [
  {
    label: tx.aulaLabel, kicker: tx.aulaKicker, title: tx.aulaTitle,
    body: TEM_AUDIO
      ? tx.aulaBodyAudio
      : tx.aulaBodySemAudio,
    points: [
      TEM_AUDIO ? tx.aulaPontoAudio : tx.aulaPontoSemAudio,
      tx.aulaPonto2,
      tx.aulaPonto3
    ]
  },
  {
    label: tx.escritaLabel, kicker: tx.escritaKicker, title: tx.escritaTitle,
    body: tx.escritaBody,
    points: [tx.escritaPonto1, tx.escritaPonto2, tx.escritaPonto3]
  },
  {
    /* Cinco categorias com gravação, quatro sem - e o número é CONTADO, não
       escolhido: múltipla escolha, digitação, associação, escuta e leitura, e a
       escuta é a única que o motor desliga quando não há clipe. Anunciar cinco
       e entregar quatro é o mesmo erro, de tamanho menor. */
    label: tx.praticaLabel, kicker: tx.praticaKicker,
    title: TEM_AUDIO ? tx.praticaTitleAudio : tx.praticaTitleSemAudio,
    body: TEM_AUDIO
      ? tx.praticaBodyAudio
      : tx.praticaBodySemAudio,
    points: [tx.praticaPonto1, tx.praticaPonto2, tx.praticaPonto3]   // só os jogos têm níveis (COM-013)
  },
  {
    label: tx.revisaoLabel, kicker: tx.revisaoKicker, title: tx.revisaoTitle,
    body: tx.revisaoBody,
    points: [tx.revisaoPonto1, tx.revisaoPonto2, tx.revisaoPonto3]
  },
  {
    label: tx.progressoLabel, kicker: tx.progressoKicker, title: tx.progressoTitle,
    body: tx.progressoBody,
    points: [tx.progressoPonto1, tx.progressoPonto2, tx.progressoPonto3]
  }
];

/* Os passos do método na capa SÃO as etapas da lição, com os nomes das abas
   que o aluno vê lá dentro (lib/etapas-da-licao.ts, auditoria de 01/10,
   CONV-010). Até então eram seis passos com outros nomes, sem a escrita. */
export const PASSOS: readonly (readonly [string, string])[] =
  ETAPAS_DA_LICAO.map(e => [e.aba, e.descricaoPt] as const);

/* A maquete do exercício, e o herói. Duas telas que MOSTRAM um exercício em
   vez de descrevê-lo - então elas também têm de mostrar um que exista hoje. */
export const MAQUETE = {
  /** O rótulo da aba de prática: escuta só quando há o que escutar. */
  praticaRotulo: TEM_AUDIO ? tx.maquetePraticaRotuloAudio : tx.maquetePraticaRotuloSemAudio,
  praticaPergunta: TEM_AUDIO ? tx.maquetePraticaPerguntaAudio : tx.maquetePraticaPerguntaSemAudio,
  /** A pergunta do herói vale nos dois casos: ela é respondida pelas opções. */
  heroiPergunta: tx.maqueteHeroiPergunta
} as const;
