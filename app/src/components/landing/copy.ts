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
    label: 'Aula', kicker: 'Aprender', title: 'A letra primeiro, sempre sozinha.',
    body: TEM_AUDIO
      ? 'Uma forma por tela. O nome, o som, o áudio e a explicação em português - nada mais disputando atenção.'
      : 'Uma forma por tela. O nome, o som e a explicação em português - nada mais disputando atenção.',
    points: [
      TEM_AUDIO ? 'Áudio gravado por falante nativo' : 'O som comparado com um som do português',
      'Explicação escrita em português',
      'Uma palavra de exemplo, já com nikud'
    ]
  },
  {
    label: 'Escrita', kicker: 'Escrever', title: 'Você escreve a letra, com o dedo na tela.',
    body: 'O curso mostra a ordem dos traços e depois devolve a caneta para você. Escrever é o que separa reconhecer de saber - a mão aprende o que o olho só reconhece.',
    points: ['A ordem dos traços, movimento a movimento', 'Traçado com o dedo, direto no celular', 'A forma exata da cursiva israelense, e não um desenho aproximado']
  },
  {
    /* Cinco categorias com gravação, quatro sem - e o número é CONTADO, não
       escolhido: múltipla escolha, digitação, associação, escuta e leitura, e a
       escuta é a única que o motor desliga quando não há clipe. Anunciar cinco
       e entregar quatro é o mesmo erro, de tamanho menor. */
    label: 'Prática', kicker: 'Fixar',
    title: TEM_AUDIO ? 'Cinco tipos de exercício, alternados.' : 'Quatro tipos de exercício, alternados.',
    body: TEM_AUDIO
      ? 'Múltipla escolha, digitação, associação, escuta e leitura. A alternância é o que impede a decoreba.'
      : 'Múltipla escolha, digitação, associação e leitura. A alternância é o que impede a decoreba.',
    points: ['Correção imediata, com explicação', 'Erro não bloqueia: você tenta de novo', 'Nos jogos, a dificuldade sobe conforme você acerta']   // só os jogos têm níveis (COM-013)
  },
  {
    label: 'Revisão', kicker: 'Consolidar', title: 'O que você errou volta na hora certa.',
    body: 'As letras que ainda escapam reaparecem em intervalos crescentes, até ficarem automáticas.',
    points: ['Revisões curtas, de 3 a 5 minutos', 'Só o que precisa - não repete o que já domina', 'Aviso quando há revisão pendente']
  },
  {
    label: 'Progresso', kicker: 'Acompanhar', title: 'Você vê exatamente onde está.',
    body: 'Letras dominadas, letras em progresso, letras a revisar. Sem pontuação inflada: o número reflete leitura real.',
    points: ['Percentual por módulo', 'Mapa de domínio das 22 letras', 'Tempo de estudo por semana']
  }
];

/* Seis passos com gravação, cinco sem: o "Ouça" não tem como existir com o
   manifesto vazio, e deixá-lo na lista era prometer um passo do método que a
   lição não executa. O que sobra não é um buraco - "Associe" já era o passo que
   faz o trabalho de ensinar o som, por comparação com o português. */
export const PASSOS: readonly (readonly [string, string])[] = TEM_AUDIO
  ? [
      ['Reconheça', 'A forma isolada, grande, sem distração.'],
      ['Ouça', 'O som gravado por falante nativo.'],
      ['Associe', 'A comparação com um som do português.'],
      ['Pratique', 'Cinco tipos de exercício, alternados.'],
      ['Leia', 'A letra dentro de uma palavra real.'],
      ['Revise', 'Ela volta depois, no intervalo certo.']
    ]
  : [
      ['Reconheça', 'A forma isolada, grande, sem distração.'],
      ['Associe', 'O som comparado com um som que você já faz em português.'],
      ['Pratique', 'Quatro tipos de exercício, alternados.'],
      ['Leia', 'A letra dentro de uma palavra real.'],
      ['Revise', 'Ela volta depois, no intervalo certo.']
    ];

/* A maquete do exercício, e o herói. Duas telas que MOSTRAM um exercício em
   vez de descrevê-lo - então elas também têm de mostrar um que exista hoje. */
export const MAQUETE = {
  /** O rótulo da aba de prática: escuta só quando há o que escutar. */
  praticaRotulo: TEM_AUDIO ? 'Escuta' : 'Reconhecer',
  praticaPergunta: TEM_AUDIO ? 'Qual som você ouviu?' : 'Qual destas letras faz o som SH?',
  /** A pergunta do herói vale nos dois casos: ela é respondida pelas opções. */
  heroiPergunta: 'Qual é o som desta letra?'
} as const;
