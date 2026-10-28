import type { Traducao } from '..';

/* components/landing/faq-capa.ts: as perguntas da FAQ da capa, que também
   saem no JSON-LD FAQPage. */
const pt = {
  p1: 'Preciso saber hebraico?',
  r1: 'Não. O curso começa do zero absoluto, na primeira letra, e assume que você nunca viu o alfabeto.',
  p2: 'É hebraico moderno ou bíblico?',
  r2: 'A leitura é a mesma: as letras e os sinais de vogal do texto bíblico são os que este curso ensina. O curso usa a pronúncia do hebraico moderno e vocabulário do dia a dia, o que abre os dois caminhos. Ler em voz alta e entender, porém, são coisas diferentes - a página /biblia responde isso por inteiro.',
  p3: 'Quanto tempo leva?',
  r3: (tempo: string) => `${tempo} O ritmo é seu.`,
  p4: 'O curso funciona no celular?',
  r4: 'Sim. A plataforma foi desenhada primeiro para o celular: uma atividade por tela e o botão de continuar sempre à mão.',
  p5: 'Tem áudio?',
  r5Audio: 'Cada letra, sílaba e palavra tem áudio gravado pelo professor, um israelense, para ouvir quantas vezes quiser.',
  r5SemAudio: 'As gravações estão em produção. Enquanto não entram, o curso não usa voz sintética: cada som é explicado por comparação com um som do português, e os exercícios de escuta ficam desativados em vez de virar adivinhação.',
  p6: 'Por quanto tempo tenho acesso?',
  r6: (meses: number) => `${meses} meses a partir da confirmação do pagamento, incluindo as atualizações feitas no curso nesse período.`,
  p7: 'E se eu não gostar?',
  r7: (dias: number) => `Você tem ${dias} dias, contados da liberação do acesso, para desistir pelo site e receber 100% de volta, sem precisar justificar. O estorno sai pelo mesmo meio de pagamento.`,
  p8: 'O que acontece depois que termino?',
  r8: 'O próximo nível é o Hebraico A1, um curso à parte, ainda em produção e sem data. Se quiser, marque em Sua conta o pedido de receber um e-mail quando ele abrir.'
} as const;

const en: Traducao<typeof pt> = {
  p1: 'Do I need to know Hebrew?',
  r1: 'No. The course starts from absolute zero, at the first letter, and assumes you have never seen the alphabet.',
  p2: 'Is it modern or biblical Hebrew?',
  r2: 'The reading is the same: the letters and vowel signs of the biblical text are the ones this course teaches. The course uses modern Hebrew pronunciation and everyday vocabulary, which opens both paths. Reading aloud and understanding, though, are different things - the /biblia page answers that in full.',
  p3: 'How long does it take?',
  r3: (tempo: string) => `${tempo} You set the pace.`,
  p4: 'Does the course work on my phone?',
  r4: 'Yes. The platform was designed for the phone first: one activity per screen and the continue button always within reach.',
  p5: 'Is there audio?',
  r5Audio: 'Every letter, syllable and word has audio recorded by the teacher, an Israeli, to listen to as many times as you like.',
  // etapa 3: pronúncia, rever
  r5SemAudio: 'The recordings are in production. Until they are in, the course does not use a synthetic voice: each sound is explained by comparison with a sound in English, and the listening exercises stay turned off instead of becoming guesswork.',
  p6: 'How long do I have access?',
  r6: (meses: number) => `${meses} months from payment confirmation, including any updates made to the course during that time.`,
  p7: 'What if I do not like it?',
  // etapa 5/6: Brasil, rever (direito de arrependimento do CDC)
  r7: (dias: number) => `You have ${dias} days, counted from when your access is granted, to cancel on the site and get 100% back, no reason needed. The refund goes back through the same payment method.`,
  p8: 'What happens after I finish?',
  r8: 'The next level is Hebrew A1, a separate course, still in production and with no date yet. If you like, check the box in Your account to get an email when it opens.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
