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
