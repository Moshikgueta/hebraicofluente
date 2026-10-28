import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* app/faq/page.tsx */
const pt = {
  metaTitulo: 'Dúvidas frequentes - Hebraico Fluente',
  metaDescricao:
    'Pagamento, acesso, prazo, celular, áudio, certificado e reembolso - as perguntas ' +
    'que aparecem antes da compra, respondidas sem enrolação.',

  saberQ: 'Preciso saber alguma coisa de hebraico para começar?',
  saberA: 'Não. O curso começa assumindo que você nunca viu o alfabeto e não sabe nem por onde o texto começa. A primeira lição ensina uma letra só.',

  tempoQ: 'Quanto tempo leva?',
  tempoA: (tempo: string) => `${tempo} Não há prazo interno nem turma: o curso espera por você.`,

  pagoQ: 'Como eu pago?',
  pagoPix: 'Por PIX, pelo aplicativo do seu banco. O checkout mostra o código copia e cola.',
  pagoPixPreco: (preco: string, pct: number, cheio: string) =>
    `O curso sai por ${preco}${pct > 0 ? ` no PIX (${pct}% de desconto sobre os ${cheio})` : ''}.`,
  pagoSemCartao: 'Cartão de crédito ainda não. Quando entrar, aparece no checkout.',
  pagoPixCartao: (parcelas: string) => `PIX, cartão de crédito à vista ou parcelado ${parcelas}.`,
  pagoCartao: (parcelas: string) =>
    `Cartão de crédito, à vista ou parcelado ${parcelas}. O PIX ainda não está disponível; quando entrar, aparece no checkout.`,
  pagoAVista: (preco: string, pix: string | null) => `À vista o curso sai por ${preco}${pix ? `, ou ${pix} no PIX` : ''}.`,
  pagoPreLancamento: (fim: string | null, cheio: string, meses: number) =>
    `Esse é o preço de pré-lançamento${fim ? `, válido até ${fim}` : ''}. Depois dele, o curso passa a custar ${cheio}. Quem compra agora paga uma vez e fica com os ${meses} meses de acesso.`,
  pagoJuros: 'No parcelamento há juros, cobrados pela Mercado Pago. O valor de cada parcela e o total aparecem na tela de pagamento dela antes de você confirmar.',

  liberadoQ: 'Quando o acesso é liberado?',
  liberadoCartao: 'No cartão, na hora - a confirmação vem em segundos.',
  liberadoPix: 'No PIX, assim que o pagamento compensa, que costuma levar menos de um minuto.',
  liberadoAutomatico: 'A liberação é automática. Não existe aprovação manual, e você não precisa mandar comprovante para ninguém.',
  liberadoAMao: (dias: number) =>
    `Depois que conferimos o pagamento: neste momento a liberação é feita à mão, em até ${dias} dias úteis. Você não precisa deixar nenhuma página aberta nem mandar comprovante: é só entrar com o mesmo e-mail e a mesma senha que você usou para comprar.`,
  liberadoPrazo: (email: string) => `Se passar desse prazo, escreva para ${email} com o e-mail da compra.`,

  acessoQ: 'Por quanto tempo eu tenho acesso?',
  acessoMeses: (meses: number, inicio: string) =>
    `${meses} meses, ${inicio}, com tudo que for acrescentado ao curso nesse período.`,
  acessoAviso: 'Perto do fim, a plataforma avisa - com trinta dias de antecedência, e de novo na última semana.',

  incluidoQ: 'O que não está incluído?',
  incluidoA1: (duvidas: string) =>
    `O curso é autoinstrucional: você estuda no seu ritmo, e a plataforma corrige cada exercício na hora. Por isso não há aulas ao vivo, nem correção ou acompanhamento feito por professor. O atendimento por e-mail e WhatsApp é para acesso, pagamento e conta. ${duvidas}`,
  incluidoA2: 'Também não vêm junto: os outros cursos (A1, A2 e B1, vendidos à parte quando forem lançados), aplicativo para instalar (tudo funciona no navegador) e material físico. O certificado de conclusão não é um certificado oficial.',

  falarQ: 'O curso ensina a falar e a entender hebraico?',
  falarA: 'Aqui você aprende a decodificar: reconhecer cada letra e cada sinal de vogal, ler palavras em voz alta e escrevê-las.',

  celularQ: 'Funciona no celular?',
  celularA1: 'Foi feito para o celular primeiro. Os exercícios cabem numa mão, os botões são grandes o suficiente para o polegar, e a tela não sai do lugar quando você escreve uma letra com o dedo.',
  celularA2: 'No computador ele vira um painel maior, com o alfabeto inteiro e o progresso à vista de uma vez.',

  audioQ: 'O curso tem áudio com voz de verdade?',
  audioSim1: 'Sim. As letras, as sílabas, as palavras, as frases e os textos do curso têm áudio gravado pelo professor, um israelense. Você ouve quantas vezes quiser, e também mais devagar.',
  audioSim2: 'Os exercícios de escuta usam essas gravações: você ouve e responde, sem ver o texto.',
  audioNao1: 'As gravações estão em produção. Enquanto não entram, o curso não usa voz sintética: cada som é explicado por comparação com um som do português.',
  audioNao2: 'Os exercícios que dependem só de escutar ficam desativados até lá, em vez de virar adivinhação.',

  maoQ: 'Preciso saber escrever à mão?',
  maoA1: 'Não precisa, mas o curso ensina. Você traça a letra com o dedo na tela, na ordem certa dos traços, e recebe uma avaliação do traço - não uma nota, um comentário.',
  maoA2: 'Quem não quiser escrever pode pular essa etapa: ela não bloqueia o resto da lição.',

  progressoQ: 'Meu progresso fica salvo?',
  progressoA1: 'Fica, e a plataforma volta exatamente na lição e na questão em que você parou.',
  progressoA2: 'Ele é da sua conta, e não do aparelho: estude no celular, abra no computador e continue de onde estava. Se a internet cair no meio de uma aula, o que você já fez fica guardado no aparelho e sobe sozinho quando a conexão voltar. Para abrir uma aula nova, é preciso estar conectado.',
  progressoA3: 'E se você já tinha estudado neste aparelho antes de entrar na conta, nada se perde: as duas coisas são juntadas no login.',
  progressoA4: 'A conta fica conectada em até 3 aparelhos ao mesmo tempo. Se você entrar num quarto, o mais antigo pede o login de novo, e o que estava nele se junta à conta quando você entrar outra vez.',

  bibliaQ: 'Vou conseguir ler a Bíblia em hebraico?',
  bibliaA1: 'Ler em voz alta, sim. O texto hebraico da Bíblia vem com os sinais de vogal, que são exatamente os que este curso ensina - com as 22 letras você decodifica qualquer versículo, sem transliteração.',
  bibliaA2: 'Entender o que leu, não. Isso pede vocabulário e gramática, e é outro curso. Vale dizer que as duas coisas são diferentes antes da compra, e não depois.',
  bibliaLink: 'Gênesis 1:1, palavra por palavra',

  certificadoQ: 'Tem certificado?',
  certificadoA1: 'Tem, e ele não é por participação. Sai quando duas coisas estiverem feitas: todas as letras concluídas e o exame final aprovado, com pelo menos 70%.',
  certificadoA2: 'É uma imagem com o seu nome e a data, pronta para postar. Ela diz, na própria imagem, que não é um certificado oficial nem uma avaliação de proficiência reconhecida - porque não é, e quem recebe merece saber.',

  gostarQ: 'E se eu não gostar?',
  gostarA1: (dias: number, inicio: string) =>
    `O Código de Defesa do Consumidor te dá ${dias} dias para desistir de uma compra feita pela internet, ${inicio}. Dentro desse prazo, basta pedir: o valor volta integral, sem pergunta e sem etapa.`,
  gostarA2: (sozinho: boolean, email: string, confirmacao: string) =>
    `Em Sua conta, na compra, use "Desistir da compra"${sozinho ? ': o estorno é pedido à Mercado Pago na hora, sozinho' : ''}. Se preferir, escreva para ${email} com o e-mail da compra. ${confirmacao}`,

  niveisQ: 'Vocês vão lançar os outros níveis mesmo?',
  niveisA1: 'O A1 está em produção e é o próximo. O A2 e o B1 vêm depois, nessa ordem.',
  niveisA2: 'Quando saírem, entram na mesma conta e na mesma plataforma - você não recomeça em outro lugar, e o que já fez continua onde está.',

  trilha: 'Dúvidas',
  eyebrow: 'Dúvidas frequentes',
  titulo: 'Tudo o que vale saber antes de começar.',
  lead: 'Respostas diretas sobre o curso, o acesso, o conteúdo e o que esperar da experiência dentro da plataforma.',
  perguntas: 'Dúvidas frequentes',
  ctaTitulo: 'Ficou alguma pergunta de fora?',
  ctaLinha: (email: ReactNode, prazo: string, duvidas: string): ReactNode => (
    <>Escreva para{' '}{email}. Respondemos {prazo}. {duvidas}</>
  )
} as const;

const en: Traducao<typeof pt> = {
  metaTitulo: 'Frequently asked questions - Hebraico Fluente',
  metaDescricao:
    'Payment, access, timing, phone, audio, certificate and refunds - the questions ' +
    'that come up before buying, answered straight.',

  saberQ: 'Do I need to know any Hebrew to start?',
  saberA: 'No. The course starts by assuming you have never seen the alphabet and do not even know where the text begins. The first lesson teaches just one letter.',

  tempoQ: 'How long does it take?',
  tempoA: (tempo: string) => `${tempo} There are no internal deadlines and no class schedule: the course waits for you.`,

  pagoQ: 'How do I pay?',
  // etapa 5/6: Brasil, rever (PIX)
  pagoPix: 'By PIX, in your bank\'s app. The checkout shows the copy-and-paste code.',
  // etapa 5/6: Brasil, rever (PIX)
  pagoPixPreco: (preco: string, pct: number, cheio: string) =>
    `The course comes to ${preco}${pct > 0 ? ` by PIX (${pct}% off the ${cheio})` : ''}.`,
  pagoSemCartao: 'No credit card yet. When it is added, it will show up at checkout.',
  // etapa 5/6: Brasil, rever (PIX e parcelamento)
  pagoPixCartao: (parcelas: string) => `PIX, credit card paid in full or in installments ${parcelas}.`,
  // etapa 5/6: Brasil, rever (PIX e parcelamento)
  pagoCartao: (parcelas: string) =>
    `Credit card, paid in full or in installments ${parcelas}. PIX is not available yet; when it is added, it will show up at checkout.`,
  // etapa 5/6: Brasil, rever (PIX)
  pagoAVista: (preco: string, pix: string | null) => `Paid in full, the course comes to ${preco}${pix ? `, or ${pix} by PIX` : ''}.`,
  pagoPreLancamento: (fim: string | null, cheio: string, meses: number) =>
    `That is the pre-launch price${fim ? `, valid until ${fim}` : ''}. After that, the course will cost ${cheio}. If you buy now, you pay once and get the ${meses} months of access.`,
  // etapa 5/6: Brasil, rever (parcelamento e Mercado Pago)
  pagoJuros: 'Installments carry interest, charged by Mercado Pago. The amount of each installment and the total appear on its payment screen before you confirm.',

  liberadoQ: 'When is access granted?',
  liberadoCartao: 'By card, right away - confirmation comes in seconds.',
  // etapa 5/6: Brasil, rever (PIX)
  liberadoPix: 'By PIX, as soon as the payment clears, which usually takes less than a minute.',
  liberadoAutomatico: 'Access is granted automatically. There is no manual approval, and you do not need to send a receipt to anyone.',
  liberadoAMao: (dias: number) =>
    `After we check the payment: at the moment access is granted by hand, within ${dias} business days. You do not need to keep any page open or send a receipt: just sign in with the same email and password you used to buy.`,
  liberadoPrazo: (email: string) => `If it takes longer than that, write to ${email} with the email you used to buy.`,

  acessoQ: 'How long do I have access?',
  acessoMeses: (meses: number, inicio: string) =>
    `${meses} months, ${inicio}, including everything added to the course during that time.`,
  acessoAviso: 'Near the end, the platform lets you know - thirty days ahead, and again in the last week.',

  incluidoQ: 'What is not included?',
  incluidoA1: (duvidas: string) =>
    `The course is self-paced: you study at your own pace, and the platform corrects each exercise right away. That is why there are no live classes, and no grading or follow-up by a teacher. Support by email and WhatsApp is for access, payment and your account. ${duvidas}`,
  incluidoA2: 'Also not included: the other courses (A1, A2 and B1, sold separately when they launch), an app to install (everything works in the browser) and physical materials. The certificate of completion is not an official certificate.',

  falarQ: 'Does the course teach you to speak and understand Hebrew?',
  falarA: 'Here you learn to decode: recognize each letter and each vowel sign, read words aloud and write them.',

  celularQ: 'Does it work on my phone?',
  celularA1: 'It was made for the phone first. The exercises fit in one hand, the buttons are big enough for your thumb, and the screen stays put when you write a letter with your finger.',
  celularA2: 'On a computer it becomes a bigger dashboard, with the whole alphabet and your progress in view at once.',

  audioQ: 'Does the course have audio with a real voice?',
  audioSim1: 'Yes. The letters, syllables, words, sentences and texts of the course have audio recorded by the teacher, an Israeli. You can listen as many times as you like, and slower too.',
  audioSim2: 'The listening exercises use these recordings: you listen and answer without seeing the text.',
  // etapa 3: pronúncia, rever
  audioNao1: 'The recordings are in production. Until they are in, the course does not use a synthetic voice: each sound is explained by comparison with a sound in English.',
  audioNao2: 'The exercises that depend only on listening stay turned off until then, instead of becoming guesswork.',

  maoQ: 'Do I need to know how to write by hand?',
  maoA1: 'You do not need to, but the course teaches it. You trace the letter with your finger on the screen, in the right stroke order, and get feedback on your stroke - not a grade, a comment.',
  maoA2: 'If you do not want to write, you can skip that step: it does not block the rest of the lesson.',

  progressoQ: 'Is my progress saved?',
  progressoA1: 'It is, and the platform takes you back to exactly the lesson and question where you stopped.',
  progressoA2: 'It belongs to your account, not your device: study on your phone, open it on your computer and pick up where you were. If the internet drops in the middle of a lesson, what you have done stays saved on the device and uploads on its own when the connection comes back. To open a new lesson, you need to be online.',
  progressoA3: 'And if you had already studied on this device before signing in, nothing is lost: the two are merged when you sign in.',
  progressoA4: 'Your account can stay signed in on up to 3 devices at once. If you sign in on a fourth, the oldest one asks you to sign in again, and whatever was on it joins your account when you sign in again.',

  bibliaQ: 'Will I be able to read the Bible in Hebrew?',
  bibliaA1: 'Read it aloud, yes. The Hebrew text of the Bible comes with the vowel signs, which are exactly the ones this course teaches - with the 22 letters you can decode any verse, without transliteration.',
  bibliaA2: 'Understand what you read, no. That takes vocabulary and grammar, and it is a different course. It is worth saying that the two are different before you buy, not after.',
  bibliaLink: 'Genesis 1:1, word by word',

  certificadoQ: 'Is there a certificate?',
  certificadoA1: 'There is, and it is not for participation. It comes when two things are done: all the letters completed and the final exam passed, with at least 70%.',
  certificadoA2: 'It is an image with your name and the date, ready to post. It says, on the image itself, that it is not an official certificate or a recognized proficiency assessment - because it is not, and whoever receives it deserves to know.',

  gostarQ: 'What if I do not like it?',
  // etapa 5/6: Brasil, rever (CDC, direito de arrependimento)
  gostarA1: (dias: number, inicio: string) =>
    `Brazil's Consumer Protection Code gives you ${dias} days to cancel a purchase made online, ${inicio}. Within that period, just ask: you get the full amount back, no questions and no extra steps.`,
  // etapa 5/6: Brasil, rever (Mercado Pago)
  gostarA2: (sozinho: boolean, email: string, confirmacao: string) =>
    `In Your account, under the purchase, use "Cancel purchase"${sozinho ? ': the refund is requested from Mercado Pago right away, automatically' : ''}. If you prefer, write to ${email} with the email you used to buy. ${confirmacao}`,

  niveisQ: 'Are you really going to launch the other levels?',
  niveisA1: 'A1 is in production and comes next. A2 and B1 come after, in that order.',
  niveisA2: 'When they come out, they go on the same account and the same platform - you do not start over somewhere else, and what you have done stays where it is.',

  trilha: 'Questions',
  eyebrow: 'Frequently asked questions',
  titulo: 'Everything worth knowing before you start.',
  lead: 'Straight answers about the course, access, content and what to expect from the experience inside the platform.',
  perguntas: 'Frequently asked questions',
  ctaTitulo: 'Is there a question we missed?',
  ctaLinha: (email: ReactNode, prazo: string, duvidas: string): ReactNode => (
    <>Write to{' '}{email}. We reply {prazo}. {duvidas}</>
  )
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
