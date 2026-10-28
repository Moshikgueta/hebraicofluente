import type { Traducao } from '..';

/* components/landing/Secoes.tsx: problema, demonstração, método, currículo
   e jornada. */
const pt = {
  problema1: 'As letras parecem todas iguais.',
  problema2: 'Você não sabe por onde começar.',
  problema3: 'Os materiais explicam hebraico, mas não pensando em brasileiros.',
  problema4: 'Você assiste vídeos, mas sente que não existe uma sequência.',
  problemaTitulo: 'Aprender hebraico não deveria parecer um quebra-cabeça.',
  problemaFecho: 'Por isso criamos um caminho claro, progressivo e pensado para quem fala português.',

  demoTitulo: 'Veja como você vai aprender.',
  demoLead: 'Cinco momentos que se repetem em toda lição. Um de cada vez, sempre na mesma ordem.',
  demoAbas: 'Momentos de uma lição',

  rotuloLicao: (etapa: string) => `Lição 4 · ${etapa}`,
  aprender: 'Aprender',
  escrever: 'Escrever',
  /* Transliteração: fica igual até a etapa 3. */
  shin: 'Shin',
  aulaSom: 'som /ʃ/ - como o X de «xícara»; no curso, escrito sh',
  aulaPonto: 'O ponto em cima, à direita, é o que faz o som SH. Do lado esquerdo, a mesma letra vira Sin, com som de S.',
  escritaTexto: 'Este é o diagrama que a lição mostra. Depois de ver o movimento, você traça a letra com o dedo e o curso confere. A forma é a da cursiva que se escreve em Israel - a que você vai ver num bilhete, e não a de imprensa.',
  reproduzir: 'Reproduzir áudio',

  /* Nomes das letras: transliteração, fica igual até a etapa 3. */
  samech: 'Sámech',
  ayin: 'Áyin',
  tet: 'Tet',
  het: 'Het',
  confundidaMem: 'Confundida com ם',
  confundidaAlef: 'Confundida com א',
  tresErros: '3 erros seguidos',
  somGutural: 'Som gutural',
  revisaoHoje: 'Revisão de hoje',
  revisaoQuantas: '4 letras precisam voltar',
  revisar: 'Revisar',

  seuProgresso: 'Seu progresso',
  doCurso: 'do curso',
  letrasFirmes: 'letras firmes',
  diasSeguidos: 'dias seguidos',
  dominio22: 'Domínio das 22 letras',

  metodoRubrica: 'O método',
  metodoTitulo: 'Um método simples para transformar símbolos em leitura.',
  metodoLead: (quantas: string) =>
    `${quantas} etapas em toda lição de letra, com os mesmos nomes que você vai ver lá dentro, sempre nesta sequência. Nenhuma letra avança sem passar por todas.`,

  modulo: (n: number) => `Módulo ${n}`,
  modulos: (a: number, b: number) => `Módulos ${a}-${b}`,
  contaModulos: 'módulos',
  contaLicoes: 'lições',
  contaLetras: 'letras',
  faixaLetras: (faixa: string, n: number) => `${faixa} · as ${n} letras`,
  faixaLetrasTexto: 'Uma de cada vez, na ordem em que aparecem nas palavras - e cada uma já entra numa palavra de verdade.',
  faixaSemApoio: (faixa: string) => `${faixa} · ler sem apoio`,
  faixaSemApoioTexto: 'O alfabeto já está completo. Aqui o texto perde as marcas que facilitavam, do jeito que ele aparece numa placa ou num rótulo.',

  curriculoRubrica: 'O currículo',
  curriculoTitulo: 'O que você estuda, módulo a módulo.',
  curriculoLead: (n: number) =>
    `${n} módulos. As letras aparecem por utilidade, não por ordem alfabética - você lê palavras reais já na primeira semana.`,
  nLicoes: (n: number) => `${n} ${n === 1 ? 'lição' : 'lições'}`,
  nLetras: (n: number) => `${n} ${n === 1 ? 'letra' : 'letras'}`,

  jornadaTitulo: 'Seu hebraico começa aqui. Não termina aqui.',
  jornadaLead: 'A Alfabetização é o primeiro degrau. Os próximos níveis estão em preparação e serão cursos à parte.',
  disponivel: 'Disponível',
  emBreve: 'Em breve'
} as const;

const en: Traducao<typeof pt> = {
  problema1: 'The letters all look the same.',
  problema2: 'You do not know where to start.',
  problema3: 'The materials explain Hebrew, but not with English speakers in mind.',
  problema4: 'You watch videos, but feel there is no real sequence.',
  problemaTitulo: 'Learning Hebrew should not feel like a puzzle.',
  problemaFecho: 'That is why we built a clear, step-by-step path designed for English speakers.',

  demoTitulo: 'See how you will learn.',
  demoLead: 'Five moments that repeat in every lesson. One at a time, always in the same order.',
  demoAbas: 'Moments of a lesson',

  rotuloLicao: (etapa: string) => `Lesson 4 · ${etapa}`,
  aprender: 'Learn',
  escrever: 'Write',
  shin: 'Shin',
  // etapa 3: pronúncia, rever
  aulaSom: 'sound /ʃ/ - like the sh in «ship»; in the course, written sh',
  aulaPonto: 'The dot on top, on the right, is what makes the SH sound. On the left side, the same letter becomes Sin, with an S sound.',
  escritaTexto: 'This is the diagram the lesson shows. After you see the movement, you trace the letter with your finger and the course checks it. The shape is the cursive written in Israel - the one you will see on a handwritten note, not the print form.',
  reproduzir: 'Play audio',

  samech: 'Samech',
  ayin: 'Ayin',
  tet: 'Tet',
  het: 'Chet',
  confundidaMem: 'Confused with ם',
  confundidaAlef: 'Confused with א',
  tresErros: '3 mistakes in a row',
  somGutural: 'Guttural sound',
  revisaoHoje: 'Today\'s review',
  revisaoQuantas: '4 letters need to come back',
  revisar: 'Review',

  seuProgresso: 'Your progress',
  doCurso: 'of the course',
  letrasFirmes: 'letters mastered',
  diasSeguidos: 'days in a row',
  dominio22: 'Mastery of the 22 letters',

  metodoRubrica: 'The method',
  metodoTitulo: 'A simple method to turn symbols into reading.',
  metodoLead: (quantas: string) =>
    `${quantas} steps in every letter lesson, with the same names you will see inside, always in this order. No letter moves on without going through all of them.`,

  modulo: (n: number) => `Module ${n}`,
  modulos: (a: number, b: number) => `Modules ${a}-${b}`,
  contaModulos: 'modules',
  contaLicoes: 'lessons',
  contaLetras: 'letters',
  faixaLetras: (faixa: string, n: number) => `${faixa} · the ${n} letters`,
  faixaLetrasTexto: 'One at a time, in the order they show up in words - and each one goes straight into a real word.',
  faixaSemApoio: (faixa: string) => `${faixa} · reading without support`,
  faixaSemApoioTexto: 'The alphabet is already complete. Here the text loses the marks that made it easier, the way it appears on a sign or a label.',

  curriculoRubrica: 'The curriculum',
  curriculoTitulo: 'What you study, module by module.',
  curriculoLead: (n: number) =>
    `${n} modules. The letters come in by how useful they are, not in alphabetical order - you read real words in the very first week.`,
  nLicoes: (n: number) => `${n} ${n === 1 ? 'lesson' : 'lessons'}`,
  nLetras: (n: number) => `${n} ${n === 1 ? 'letter' : 'letters'}`,

  jornadaTitulo: 'Your Hebrew starts here. It does not end here.',
  jornadaLead: 'Learning to read is the first step. The next levels are in preparation and will be separate courses.',
  disponivel: 'Available',
  emBreve: 'Coming soon'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
