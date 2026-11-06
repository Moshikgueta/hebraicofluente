import type { Traducao } from '..';

/* A aula particular com o Moshik (06/11/2026, pedido do dono): app/aula-particular.
 * Só no site brasileiro. */
const pt = {
  metaTitulo: 'Aula particular - Hebraico Fluente',
  metaDescricao: 'Peça uma aula particular com o Moshik, para uma ajuda extra no curso.',
  kicker: 'Ajuda extra',
  titulo: 'Aula particular comigo',
  intro: 'Se você quiser uma ajuda extra, pode marcar uma aula particular comigo.',
  preco: 'Cada aula custa R$ 300.',
  combinado: 'Tudo é combinado diretamente comigo: o dia, o horário, como vai ser a aula e o pagamento.',
  comoPedir: 'Para pedir, me mande uma mensagem contando o que você quer treinar.',
  whatsapp: 'Pedir pelo WhatsApp',
  email: 'Pedir por e-mail',
  aParte: 'A aula particular é à parte do curso: não muda o seu acesso nem o que já está incluído nele.',
  mensagem: (email: string) => `Olá, Moshik! Sou aluno(a) do Hebraico Fluente e quero marcar uma aula particular.${email ? ` O e-mail da minha conta é ${email}.` : ''} Quero treinar: `,
  assunto: 'Aula particular',
  voltar: 'Voltar para Hoje',
  chamada: 'Quer uma ajuda extra? Peça uma aula particular comigo'
} as const;

const en: Traducao<typeof pt> = {
  metaTitulo: 'Private lesson - Hebrew Unlocked',
  metaDescricao: 'Ask Moshik for a private lesson, for extra help with the course.',
  kicker: 'Extra help',
  titulo: 'A private lesson with me',
  intro: 'If you want extra help, you can book a private lesson with me.',
  preco: 'Each lesson costs R$ 300.',
  combinado: 'Everything is arranged directly with me: the day, the time, how the lesson will be and the payment.',
  comoPedir: 'To ask, send me a message saying what you want to practise.',
  whatsapp: 'Ask on WhatsApp',
  email: 'Ask by e-mail',
  aParte: 'The private lesson is separate from the course: it does not change your access or what is already included.',
  mensagem: email => `Hi, Moshik! I am a student and I would like to book a private lesson.${email ? ` My account e-mail is ${email}.` : ''} I want to practise: `,
  assunto: 'Private lesson',
  voltar: 'Back to Today',
  chamada: 'Want extra help? Ask me for a private lesson'
};

const es: Traducao<typeof pt> = {
  metaTitulo: 'Clase particular - Hebreo Fluido',
  metaDescricao: 'Pide una clase particular con Moshik, para una ayuda extra en el curso.',
  kicker: 'Ayuda extra',
  titulo: 'Clase particular conmigo',
  intro: 'Si quieres una ayuda extra, puedes reservar una clase particular conmigo.',
  preco: 'Cada clase cuesta R$ 300.',
  combinado: 'Todo se acuerda directamente conmigo: el día, la hora, cómo será la clase y el pago.',
  comoPedir: 'Para pedirla, mándame un mensaje contando qué quieres practicar.',
  whatsapp: 'Pedir por WhatsApp',
  email: 'Pedir por correo',
  aParte: 'La clase particular es aparte del curso: no cambia tu acceso ni lo que ya está incluido.',
  mensagem: email => `¡Hola, Moshik! Soy alumno(a) y quiero reservar una clase particular.${email ? ` El correo de mi cuenta es ${email}.` : ''} Quiero practicar: `,
  assunto: 'Clase particular',
  voltar: 'Volver a Hoy',
  chamada: '¿Quieres una ayuda extra? Pídeme una clase particular'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;

/** A aula particular existe só no site brasileiro (o preço é em reais e o
 *  combinado é direto com o dono, pelo WhatsApp brasileiro). */
export const AULA_PARTICULAR = !process.env.NEXT_PUBLIC_LOCALE || process.env.NEXT_PUBLIC_LOCALE === 'pt';
