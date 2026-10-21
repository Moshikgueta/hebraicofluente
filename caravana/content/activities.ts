// Atividades e selos da biblioteca.
//
// A `key` de cada pergunta e estavel: o progresso do viajante aponta para ela,
// entao reordenar ou corrigir o texto nao apaga o que ja foi respondido.
// As respostas ficam no servidor; a tela recebe as perguntas sem gabarito.

import type { MatchPair, QuestionKind, QuestionOption } from '../src/lib/db/schema';

export type QuestionSeed = {
  key: string;
  kind: QuestionKind;
  prompt: string;
  promptHe?: string;
  options?: QuestionOption[];
  pairs?: MatchPair[];
  correct?: string;
  explanation: string;
};

export type ActivitySeed = {
  slug: string;
  type: 'quiz' | 'hebrew' | 'challenge';
  feature: 'quizzes' | 'hebrew' | 'challenges';
  title: string;
  intro: string;
  destination?: string;
  questions: QuestionSeed[];
};

const tf = (correct: boolean) => ({
  options: [
    { id: 'v', text: 'Verdadeiro' },
    { id: 'f', text: 'Falso' },
  ],
  correct: correct ? 'v' : 'f',
});

export const activities: ActivitySeed[] = [
  {
    slug: 'quiz-muro-ocidental',
    type: 'quiz',
    feature: 'quizzes',
    title: 'O Muro Ocidental',
    intro: 'Quatro perguntas sobre o lugar mais visitado da Cidade Antiga.',
    destination: 'muro-ocidental',
    questions: [
      {
        key: 'o-que-era',
        kind: 'multiple_choice',
        prompt: 'O Muro Ocidental era…',
        options: [
          { id: 'a', text: 'uma parede interna do Templo' },
          { id: 'b', text: 'parte do muro de contenção da esplanada do Templo' },
          { id: 'c', text: 'a muralha otomana da cidade' },
          { id: 'd', text: 'um aqueduto romano' },
        ],
        correct: 'b',
        explanation:
          'Herodes cercou o Monte do Templo com muros de contenção para ampliar a esplanada. O Muro Ocidental é o lado oeste dessa estrutura.',
      },
      {
        key: 'pedras-herodianas',
        kind: 'true_false',
        prompt: 'As pedras grandes das fiadas de baixo são do período herodiano.',
        ...tf(true),
        explanation: 'Os blocos de baixo, com moldura rebaixada nas bordas, são herodianos. As fiadas de cima foram acrescentadas depois.',
      },
      {
        key: 'bilhetes',
        kind: 'multiple_choice',
        prompt: 'O que os visitantes costumam deixar nas fendas entre as pedras?',
        options: [
          { id: 'a', text: 'Moedas' },
          { id: 'b', text: 'Flores' },
          { id: 'c', text: 'Bilhetes com pedidos' },
          { id: 'd', text: 'Velas' },
        ],
        correct: 'c',
        explanation: 'Os bilhetes são recolhidos duas vezes por ano e enterrados no Monte das Oliveiras, como se faz com textos sagrados.',
      },
      {
        key: 'shabat-fotos',
        kind: 'true_false',
        prompt: 'No Shabat, é comum fotografar a praça do Muro.',
        ...tf(false),
        explanation: 'No Shabat e nos feriados judaicos não se fotografa nem se usa o celular na praça.',
      },
    ],
  },
  {
    slug: 'quiz-cafarnaum',
    type: 'quiz',
    feature: 'quizzes',
    title: 'Cafarnaum',
    intro: 'Três perguntas sobre a vila de pescadores à beira do Kinéret.',
    destination: 'cafarnaum',
    questions: [
      {
        key: 'nome',
        kind: 'multiple_choice',
        prompt: 'O que quer dizer Kfar Nachum, o nome hebraico de Cafarnaum?',
        options: [
          { id: 'a', text: 'Porto da Galileia' },
          { id: 'b', text: 'Aldeia de Naum' },
          { id: 'c', text: 'Casa do pescador' },
          { id: 'd', text: 'Vila nova' },
        ],
        correct: 'b',
        explanation: '"Kfar" é aldeia, e "Nachum" é o nome Naum.',
      },
      {
        key: 'sinagoga-epoca',
        kind: 'true_false',
        prompt: 'A sinagoga de calcário branco que se vê hoje é da época de Jesus.',
        ...tf(false),
        explanation:
          'A sinagoga branca é posterior: a datação mais aceita a coloca entre os séculos IV e V. Os alicerces de basalto embaixo dela podem ser de uma construção mais antiga.',
      },
      {
        key: 'basalto',
        kind: 'multiple_choice',
        prompt: 'Que pedra escura é típica das casas antigas da região?',
        options: [
          { id: 'a', text: 'Basalto' },
          { id: 'b', text: 'Mármore' },
          { id: 'c', text: 'Granito' },
          { id: 'd', text: 'Arenito' },
        ],
        correct: 'a',
        explanation: 'O basalto é uma rocha vulcânica comum em volta do Mar da Galileia.',
      },
    ],
  },
  {
    slug: 'quiz-jaffa',
    type: 'quiz',
    feature: 'quizzes',
    title: 'Jaffa',
    intro: 'Três perguntas sobre o porto mais antigo do roteiro.',
    destination: 'jaffa',
    questions: [
      {
        key: 'jonas',
        kind: 'multiple_choice',
        prompt: 'Segundo a Bíblia, quem embarcou em Jope para fugir da sua missão?',
        options: [
          { id: 'a', text: 'Moisés' },
          { id: 'b', text: 'Elias' },
          { id: 'c', text: 'Davi' },
          { id: 'd', text: 'Jonas' },
        ],
        correct: 'd',
        explanation: 'O livro de Jonas (1:3) conta que o profeta desceu a Jope e embarcou num navio para Társis.',
      },
      {
        key: 'origem-tel-aviv',
        kind: 'true_false',
        prompt: 'Tel Aviv nasceu de um bairro fundado por moradores de Jaffa.',
        ...tf(true),
        explanation: 'Em 1909, famílias judias de Jaffa fundaram um bairro nas dunas ao norte, que deu origem a Tel Aviv.',
      },
      {
        key: 'uniao',
        kind: 'multiple_choice',
        prompt: 'Em que ano Jaffa e Tel Aviv viraram uma só cidade?',
        options: [
          { id: 'a', text: '1909' },
          { id: 'b', text: '1948' },
          { id: 'c', text: '1950' },
          { id: 'd', text: '1967' },
        ],
        correct: 'c',
        explanation: 'A união foi em 1950, com o nome oficial de Tel Aviv-Yafo.',
      },
    ],
  },
  {
    slug: 'quiz-massada',
    type: 'quiz',
    feature: 'quizzes',
    title: 'Massada',
    intro: 'Quatro perguntas sobre a fortaleza no deserto.',
    destination: 'massada',
    questions: [
      {
        key: 'herodes',
        kind: 'multiple_choice',
        prompt: 'Quem transformou Massada numa fortaleza-palácio?',
        options: [
          { id: 'a', text: 'O rei Salomão' },
          { id: 'b', text: 'Herodes, o Grande' },
          { id: 'c', text: 'O rei Davi' },
          { id: 'd', text: 'Saladino' },
        ],
        correct: 'b',
        explanation: 'No século I a.C., Herodes construiu ali palácios, armazéns, cisternas e termas.',
      },
      {
        key: 'josefo',
        kind: 'multiple_choice',
        prompt: 'De quem é o principal relato antigo do cerco de Massada?',
        options: [
          { id: 'a', text: 'Heródoto' },
          { id: 'b', text: 'Plutarco' },
          { id: 'c', text: 'Flávio Josefo' },
          { id: 'd', text: 'Eusébio' },
        ],
        correct: 'c',
        explanation: 'Flávio Josefo descreve o cerco no livro VII de A Guerra dos Judeus. Historiadores discutem a exatidão de parte do relato.',
      },
      {
        key: 'linha-preta',
        kind: 'true_false',
        prompt: 'A linha preta pintada nas paredes separa o que foi encontrado de pé (abaixo) do que foi reconstruído (acima).',
        ...tf(true),
        explanation: 'É a forma de mostrar ao visitante onde termina a ruína original e começa a restauração.',
      },
      {
        key: 'nome',
        kind: 'multiple_choice',
        prompt: 'O que quer dizer Metsadá, o nome hebraico de Massada?',
        options: [
          { id: 'a', text: 'Fortaleza' },
          { id: 'b', text: 'Deserto' },
          { id: 'c', text: 'Montanha' },
          { id: 'd', text: 'Sal' },
        ],
        correct: 'a',
        explanation: '"Metsadá" é a palavra hebraica para fortaleza.',
      },
    ],
  },
  {
    slug: 'hebraico-primeiras-palavras',
    type: 'hebrew',
    feature: 'hebrew',
    title: 'Primeiras palavras',
    intro: 'Reconheça as palavras que você mais vai usar na viagem.',
    questions: [
      {
        key: 'shalom',
        kind: 'multiple_choice',
        prompt: 'O que quer dizer esta palavra?',
        promptHe: 'שלום',
        options: [
          { id: 'a', text: 'Obrigado' },
          { id: 'b', text: 'Olá, tchau, paz' },
          { id: 'c', text: 'Por favor' },
          { id: 'd', text: 'Saída' },
        ],
        correct: 'b',
        explanation: '"Shalóm" serve para chegar e para ir embora, e quer dizer "paz".',
      },
      {
        key: 'toda',
        kind: 'multiple_choice',
        prompt: 'O que quer dizer esta palavra?',
        promptHe: 'תודה',
        options: [
          { id: 'a', text: 'Obrigado, obrigada' },
          { id: 'b', text: 'Com licença' },
          { id: 'c', text: 'Sim' },
          { id: 'd', text: 'Água' },
        ],
        correct: 'a',
        explanation: '"Todá" é obrigado. Para agradecer muito: "todá rabá".',
      },
      {
        key: 'bevakasha',
        kind: 'multiple_choice',
        prompt: 'O que quer dizer esta palavra?',
        promptHe: 'בבקשה',
        options: [
          { id: 'a', text: 'Bom dia' },
          { id: 'b', text: 'Até logo' },
          { id: 'c', text: 'Por favor; de nada' },
          { id: 'd', text: 'Cardápio' },
        ],
        correct: 'c',
        explanation: '"Bevakashá" serve para pedir, para responder a um obrigado e para entregar algo.',
      },
      {
        key: 'slicha',
        kind: 'multiple_choice',
        prompt: 'Você esbarrou em alguém no mercado. O que diz?',
        options: [
          { id: 'a', text: 'שלום', he: 'שלום' },
          { id: 'b', text: 'סליחה', he: 'סליחה' },
          { id: 'c', text: 'כן', he: 'כן' },
          { id: 'd', text: 'מים', he: 'מים' },
        ],
        correct: 'b',
        explanation: '"Slichá" é com licença e desculpe.',
      },
      {
        key: 'pares',
        kind: 'match_pairs',
        prompt: 'Ligue cada palavra ao seu significado.',
        pairs: [
          { left: 'כן', leftHe: 'כן', right: 'sim' },
          { left: 'לא', leftHe: 'לא', right: 'não' },
          { left: 'מים', leftHe: 'מים', right: 'água' },
          { left: 'קפה', leftHe: 'קפה', right: 'café' },
        ],
        explanation: 'Ken (sim), lo (não), máyim (água) e kafé (café).',
      },
    ],
  },
  {
    slug: 'hebraico-placas',
    type: 'hebrew',
    feature: 'hebrew',
    title: 'Lendo as placas',
    intro: 'As palavras que você vai encontrar escritas pelas ruas e nos sítios.',
    questions: [
      {
        key: 'knisa',
        kind: 'multiple_choice',
        prompt: 'Esta placa está numa porta. O que ela indica?',
        promptHe: 'כניסה',
        options: [
          { id: 'a', text: 'Saída' },
          { id: 'b', text: 'Entrada' },
          { id: 'c', text: 'Banheiros' },
          { id: 'd', text: 'Fechado' },
        ],
        correct: 'b',
        explanation: '"Knissá" é entrada.',
      },
      {
        key: 'yetsia',
        kind: 'multiple_choice',
        prompt: 'E esta?',
        promptHe: 'יציאה',
        options: [
          { id: 'a', text: 'Saída' },
          { id: 'b', text: 'Entrada' },
          { id: 'c', text: 'Aberto' },
          { id: 'd', text: 'Estação' },
        ],
        correct: 'a',
        explanation: '"Yetsiá" é saída.',
      },
      {
        key: 'sherutim',
        kind: 'multiple_choice',
        prompt: 'Você procura o banheiro. Qual placa seguir?',
        options: [
          { id: 'a', text: 'תחנה', he: 'תחנה' },
          { id: 'b', text: 'שירותים', he: 'שירותים' },
          { id: 'c', text: 'תפריט', he: 'תפריט' },
          { id: 'd', text: 'יציאה', he: 'יציאה' },
        ],
        correct: 'b',
        explanation: '"Sherutím" quer dizer banheiros. A pergunta completa é "éifo hasherutím?".',
      },
      {
        key: 'pares',
        kind: 'match_pairs',
        prompt: 'Ligue cada placa ao seu significado.',
        pairs: [
          { left: 'סגור', leftHe: 'סגור', right: 'fechado' },
          { left: 'פתוח', leftHe: 'פתוח', right: 'aberto' },
          { left: 'ימינה', leftHe: 'ימינה', right: 'à direita' },
          { left: 'שמאלה', leftHe: 'שמאלה', right: 'à esquerda' },
        ],
        explanation: 'Sagúr (fechado), patúach (aberto), yamína (à direita) e smóla (à esquerda).',
      },
    ],
  },
  {
    slug: 'desafio-cultura',
    type: 'challenge',
    feature: 'challenges',
    title: 'Desafio da cultura israelense',
    intro: 'Cinco perguntas sobre o dia a dia em Israel.',
    questions: [
      {
        key: 'shabat',
        kind: 'multiple_choice',
        prompt: 'Quando começa o Shabat?',
        options: [
          { id: 'a', text: 'No sábado de manhã' },
          { id: 'b', text: 'Na sexta-feira, ao pôr do sol' },
          { id: 'c', text: 'Na sexta-feira, ao meio-dia' },
          { id: 'd', text: 'No domingo' },
        ],
        correct: 'b',
        explanation:
          'O dia judaico começa ao anoitecer: o Shabat vai do pôr do sol de sexta até o anoitecer de sábado. Muito comércio e o transporte público param em boa parte do país.',
      },
      {
        key: 'semana',
        kind: 'true_false',
        prompt: 'Em Israel, a semana de trabalho costuma começar no domingo.',
        ...tf(true),
        explanation: 'Domingo, "yom rishón", é literalmente "o primeiro dia". Para a maioria, a semana vai de domingo a quinta.',
      },
      {
        key: 'mar-do-sal',
        kind: 'multiple_choice',
        prompt: 'Em hebraico, o Mar Morto se chama Yam HaMélach. O que quer dizer?',
        options: [
          { id: 'a', text: 'Mar Profundo' },
          { id: 'b', text: 'Mar do Leste' },
          { id: 'c', text: 'Mar do Sal' },
          { id: 'd', text: 'Mar Morto' },
        ],
        correct: 'c',
        explanation: '"Mélach" é sal. A água do Mar Morto é tão salgada que o corpo boia sem esforço.',
      },
      {
        key: 'moeda',
        kind: 'multiple_choice',
        prompt: 'Qual é a moeda de Israel?',
        options: [
          { id: 'a', text: 'Dinar' },
          { id: 'b', text: 'Novo shekel' },
          { id: 'c', text: 'Libra' },
          { id: 'd', text: 'Dólar' },
        ],
        correct: 'b',
        explanation: 'O novo shekel israelense (ILS, ₪). Um shekel tem 100 agorot.',
      },
      {
        key: 'roupa',
        kind: 'true_false',
        prompt: 'Em lugares sagrados, espera-se que os visitantes cubram ombros e joelhos.',
        ...tf(true),
        explanation: 'Vale para sinagogas, igrejas e mesquitas. Uma echarpe ou uma calça leve na mochila resolvem.',
      },
    ],
  },
];

export type BadgeSeed = {
  slug: string;
  title: string;
  description: string;
  activities: string[];
  art: string;
  ink: string;
};

export const badges: BadgeSeed[] = [
  { slug: 'explorador-jerusalem', title: 'Explorador de Jerusalém', description: 'Concluiu a atividade do Muro Ocidental.', activities: ['quiz-muro-ocidental'], art: 'arch', ink: '#2E4A6B' },
  { slug: 'descobridor-galileia', title: 'Descobridor da Galileia', description: 'Concluiu a atividade de Cafarnaum.', activities: ['quiz-cafarnaum'], art: 'wave', ink: '#2F6B6A' },
  { slug: 'explorador-massada', title: 'Explorador de Massada', description: 'Concluiu a atividade de Massada.', activities: ['quiz-massada'], art: 'mesa', ink: '#9A5B2E' },
  { slug: 'navegador-jaffa', title: 'Navegador de Jaffa', description: 'Concluiu a atividade de Jaffa.', activities: ['quiz-jaffa'], art: 'tower', ink: '#7A4B6B' },
  { slug: 'primeiras-palavras', title: 'Primeiras palavras em hebraico', description: 'Reconheceu as primeiras palavras da viagem.', activities: ['hebraico-primeiras-palavras'], art: 'aleph', ink: '#1F3B57' },
  { slug: 'leitor-de-placas', title: 'Leitor de placas', description: 'Leu as placas mais comuns em hebraico.', activities: ['hebraico-placas'], art: 'sign', ink: '#5C6B2F' },
  { slug: 'conhecedor-cultura', title: 'Conhecedor da cultura israelense', description: 'Venceu o desafio da cultura.', activities: ['desafio-cultura'], art: 'star', ink: '#8A6A1F' },
];
