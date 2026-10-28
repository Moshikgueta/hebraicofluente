import type { Traducao } from '..';

/* app/desafio-amigo (a página pública) e o botão "Desafiar um amigo" do
   vocabulário (28/10/2026). */
const pt = {
  metaTitulo: 'Desafio: você consegue ler estas palavras em hebraico?',
  metaDescricao: 'Um amigo que está aprendendo a ler hebraico mandou cinco palavras para você tentar ler.',
  kicker: 'Desafio de um amigo',
  titulo: 'Você consegue ler estas cinco palavras em hebraico?',
  intro: 'Quem mandou este link está aprendendo a ler hebraico. Tente adivinhar o sentido de cada palavra.',
  carregando: 'Abrindo o desafio...',
  erro: 'Este link de desafio não abriu. Peça para quem mandou gerar um novo.',
  palavraN: (n: number, total: number) => `Palavra ${n} de ${total}`,
  pergunta: 'O que esta palavra quer dizer?',
  certo: 'Isso!',
  quase: 'Quase.',
  seLe: (translit: string, pt: string) => `Lê-se «${translit}» e quer dizer «${pt}».`,
  proxima: 'Próxima',
  verResultado: 'Ver o resultado',
  resultado: (n: number, total: number) => `Você acertou ${n} de ${total}.`,
  falaFim: 'Com algumas lições, você lê estas palavras sozinho.',
  convite: 'São palavras do curso Hebraico Fluente, escritas só com letras que se aprendem nele.',
  experimentar: 'Experimentar o curso grátis',
  conhecer: 'Conhecer o curso',
  /* O botão do vocabulário, para quem manda. */
  desafiar: 'Desafiar um amigo',
  desafiarNota: 'Cinco palavras que você já lê, num link para um amigo tentar ler.',
  gerando: 'Preparando o link...',
  pronto: 'Pronto! Mande este link:',
  compartilhar: 'Compartilhar',
  copiar: 'Copiar o link',
  copiado: 'Link copiado.',
  outro: 'Sortear outras palavras',
  falhou: 'Não foi possível criar o desafio agora. Tente de novo em instantes.',
  textoDoConvite: 'Consegue ler estas cinco palavras em hebraico? Eu já consigo.'
} as const;

const en: Traducao<typeof pt> = {
  metaTitulo: 'Challenge: can you read these Hebrew words?',
  metaDescricao: 'A friend who is learning to read Hebrew sent you five words to try to read.',
  kicker: "A friend's challenge",
  titulo: 'Can you read these five Hebrew words?',
  intro: 'Whoever sent this link is learning to read Hebrew. Try to guess the meaning of each word.',
  carregando: 'Opening the challenge...',
  erro: 'This challenge link did not open. Ask whoever sent it to make a new one.',
  palavraN: (n, total) => `Word ${n} of ${total}`,
  pergunta: 'What does this word mean?',
  certo: 'Yes!',
  quase: 'Almost.',
  seLe: (translit, pt) => `It reads «${translit}» and means «${pt}».`,
  proxima: 'Next',
  verResultado: 'See the result',
  resultado: (n, total) => `You got ${n} of ${total}.`,
  falaFim: 'A few lessons in, you read these words on your own.',
  convite: 'These are words from the Hebraico Fluente course, written only with letters it teaches.',
  experimentar: 'Try the course for free',
  conhecer: 'See the course',
  desafiar: 'Challenge a friend',
  desafiarNota: 'Five words you can already read, in a link for a friend to try.',
  gerando: 'Preparing the link...',
  pronto: 'Done! Send this link:',
  compartilhar: 'Share',
  copiar: 'Copy the link',
  copiado: 'Link copied.',
  outro: 'Pick other words',
  falhou: 'The challenge could not be created right now. Try again in a moment.',
  textoDoConvite: 'Can you read these five Hebrew words? I already can.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
