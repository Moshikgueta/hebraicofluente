import type { Traducao } from '..';

/* app/onboarding/page.tsx - as quatro perguntas do começo. */
const pt = {
  motivoViagem: 'Viajar para Israel',
  motivoFamilia: 'Família ou relacionamento',
  motivoMorar: 'Morar em Israel',
  motivoBiblia: 'Ler a Bíblia ou textos religiosos',
  motivoIdiomas: 'Interesse em idiomas',
  motivoTrabalho: 'Trabalho',
  motivoOutro: 'Outro motivo',

  meta5: '5 minutos',
  meta5Nota: 'Uma letra a cada dois dias. Devagar e sempre.',
  meta10: '10 minutos',
  meta10Nota: 'Cerca de uma letra por dia.',
  meta15: '15 minutos',
  meta15Nota: 'Uma letra por dia, com folga para revisar.',
  meta20: '20 minutos',
  meta20Nota: 'Intenso. O alfabeto em três semanas.',

  inicioZero: 'Estou começando do zero',
  inicioAlgumas: 'Reconheço algumas letras',
  inicioUmPouco: 'Já consigo ler um pouco',

  contador: '{n} de 4',
  porQueTitulo: 'Por que você quer aprender hebraico?',
  porQueDica: 'Fica na sua conta, para a gente conhecer você. Não muda o conteúdo: todo mundo faz o mesmo curso.',
  tempoTitulo: 'Quanto tempo por dia?',
  tempoDica: 'É a sua meta diária. Dá para mudar depois - e ninguém é punido por não bater.',
  sabeTitulo: 'Você já sabe alguma coisa em hebraico?',
  sabeDica: 'Todo mundo começa pela primeira letra: cada lição se apoia nas anteriores, e é isso que permite ler palavras inteiras tão cedo.',
  nomeTitulo: 'Como podemos te chamar?',
  nomeDica: 'Opcional. Fica na sua conta e já preenche o certificado e a atividade Meu nome.',
  seuNome: 'Seu nome',
  comecarCurso: 'Começar o curso',
  voltar: '← Voltar'
} as const;

const en: Traducao<typeof pt> = {
  motivoViagem: 'Travel to Israel',
  motivoFamilia: 'Family or a relationship',
  motivoMorar: 'Living in Israel',
  motivoBiblia: 'Reading the Bible or religious texts',
  motivoIdiomas: 'Interest in languages',
  motivoTrabalho: 'Work',
  motivoOutro: 'Another reason',

  meta5: '5 minutes',
  meta5Nota: 'One letter every two days. Slow and steady.',
  meta10: '10 minutes',
  meta10Nota: 'About one letter a day.',
  meta15: '15 minutes',
  meta15Nota: 'One letter a day, with room to review.',
  meta20: '20 minutes',
  meta20Nota: 'Intense. The alphabet in three weeks.',

  inicioZero: 'I am starting from zero',
  inicioAlgumas: 'I recognize a few letters',
  inicioUmPouco: 'I can already read a little',

  contador: '{n} of 4',
  porQueTitulo: 'Why do you want to learn Hebrew?',
  porQueDica: 'It stays in your account, so we get to know you. It does not change the content: everyone takes the same course.',
  tempoTitulo: 'How much time per day?',
  tempoDica: 'It is your daily goal. You can change it later - and nobody is punished for missing it.',
  sabeTitulo: 'Do you already know any Hebrew?',
  sabeDica: 'Everyone starts with the first letter: each lesson builds on the ones before, and that is what lets you read whole words so early.',
  nomeTitulo: 'What should we call you?',
  nomeDica: 'Optional. It stays in your account and fills in the certificate and the My name activity.',
  seuNome: 'Your name',
  comecarCurso: 'Start the course',
  voltar: '← Back'
};

const es: Traducao<typeof pt> = {
  motivoViagem: 'Viajar a Israel',
  motivoFamilia: 'Familia o pareja',
  motivoMorar: 'Vivir en Israel',
  motivoBiblia: 'Leer la Biblia o textos religiosos',
  motivoIdiomas: 'Interés en los idiomas',
  motivoTrabalho: 'Trabajo',
  motivoOutro: 'Otro motivo',

  meta5: '5 minutos',
  meta5Nota: 'Una letra cada dos días. Despacio y sin parar.',
  meta10: '10 minutos',
  meta10Nota: 'Más o menos una letra por día.',
  meta15: '15 minutos',
  meta15Nota: 'Una letra por día, con margen para repasar.',
  meta20: '20 minutos',
  meta20Nota: 'Intenso. El alfabeto en tres semanas.',

  inicioZero: 'Estoy empezando desde cero',
  inicioAlgumas: 'Reconozco algunas letras',
  inicioUmPouco: 'Ya puedo leer un poco',

  contador: '{n} de 4',
  porQueTitulo: '¿Por qué quieres aprender hebreo?',
  porQueDica: 'Queda en tu cuenta, para que te conozcamos. No cambia el contenido: todos hacen el mismo curso.',
  tempoTitulo: '¿Cuánto tiempo al día?',
  tempoDica: 'Es tu meta diaria. Puedes cambiarla después - y nadie es castigado por no cumplirla.',
  sabeTitulo: '¿Ya sabes algo de hebreo?',
  sabeDica: 'Todos empiezan por la primera letra: cada lección se apoya en las anteriores, y eso es lo que permite leer palabras enteras tan pronto.',
  nomeTitulo: '¿Cómo te llamamos?',
  nomeDica: 'Opcional. Queda en tu cuenta y ya completa el certificado y la actividad Mi nombre.',
  seuNome: 'Tu nombre',
  comecarCurso: 'Empezar el curso',
  voltar: '← Volver'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
