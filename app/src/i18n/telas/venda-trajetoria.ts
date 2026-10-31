import type { Traducao } from '..';

/* components/landing/Trajetoria.tsx: a história do professor, em /sobre.
   Só fatos que o dono deu; o inglês traduz, não acrescenta. */
const pt = {
  padrao1: 'um alfabeto inteiramente novo',
  padrao2: 'a dependência da transliteração',
  padrao3: 'letras parecidas que se confundem',
  padrao4: 'o salto de reconhecer letras para ler palavras',
  padrao5: 'materiais que presumem o que o aluno ainda não sabe',

  caminhoIsraelT: 'Israel',
  caminhoIsraelD: 'O hebraico como língua materna.',
  caminhoBrasilT: 'Brasil',
  caminhoBrasilD: 'Desde 2021, vivendo e ensinando aqui.',
  caminhoSalaT: 'Sala de aula',
  caminhoSalaD: 'Professor de hebraico na Escola Israelita de Curitiba (2021-2023) e shaliach na comunidade judaica.',
  caminhoIdiomasT: 'Idiomas',
  caminhoIdiomasD: 'Hebraico, português, inglês, espanhol e italiano.',
  caminhoMetodologiaT: 'Metodologia',
  caminhoMetodologiaD: 'Gerente Pedagógico da New School, em Tel Aviv, e professor na Universidad Isaac Abarbanel, em Buenos Aires.',
  caminhoHfT: 'Hebraico Fluente',
  caminhoHfD: 'Tudo isso numa plataforma pensada para brasileiros.',

  reune1: 'O hebraico como língua materna',
  reune2: 'Sala de aula com alunos brasileiros',
  reune3: 'A experiência de aprender cinco línguas',
  reune4: 'Formação em ensino de idiomas: CELTA e estudos em Letras',
  reune5: 'O trabalho diário de criar cursos de idiomas',

  atividade1: 'aprende as letras aos poucos',
  atividade2: 'pratica o reconhecimento',
  atividade3: 'diferencia letras parecidas',
  atividade4: 'aprende o nikud',
  atividade5: 'pratica a leitura',
  atividade6: 'conhece a escrita cursiva',
  atividade7: 'monta palavras',
  atividade8: 'recebe correção na hora',

  retratoAlt: 'Moshik Gueta, professor e criador do Hebraico Fluente',
  nome: 'Moshik Gueta',
  descricao: 'Israelense, professor de idiomas e educador',
  rubrica: 'Quem está por trás do Hebraico Fluente',
  titulo: 'De Israel ao Brasil: anos ensinando, aprendendo e pensando idiomas, transformados em uma metodologia para brasileiros.',
  p1: 'Sou Moshik Gueta, israelense, professor de idiomas e educador. Quando vim morar no Brasil, em 2021, comecei a ensinar hebraico para brasileiros e logo percebi que aprender a língua começa muito antes da gramática.',
  p2: 'Para quem cresceu com o alfabeto latino, o primeiro contato com o hebraico é uma nova direção de leitura, novos símbolos, novos sons e outra lógica. Em sala de aula, alguns pontos voltavam sempre:',
  decisao: 'Cada um desses pontos virou uma decisão do curso.',
  caminho: 'O caminho até aqui',

  ensinandoTitulo: 'Ensinando brasileiros',
  ensinandoTexto: 'Foi dando aulas em Curitiba, na Escola Israelita e junto à comunidade judaica como shaliach, que entendi quais dificuldades se repetiam e quais estratégias realmente ajudavam o aluno a começar a ler. O Hebraico Fluente não é um curso estrangeiro traduzido para o português: a metodologia nasceu desse contato direto com brasileiros aprendendo hebraico.',
  ensinandoCitacao: 'Ensinar hebraico no Brasil me mostrou que aprender o alfabeto não é apenas memorizar 22 letras. É aprender uma nova lógica de leitura.',
  ladosTitulo: 'Dos dois lados da sala de aula',
  ladosTexto: 'Além de ensinar, continuo sendo aluno de idiomas. Falo hebraico, português, inglês, espanhol e italiano, e cada língua me colocou de novo no começo: estruturas diferentes, vocabulário do zero, uma leitura que demora a engrenar, a vontade de traduzir tudo. É desse lado que eu penso cada exercício: o que ajuda a avançar, o que cria dependência e o que transforma conhecimento passivo em habilidade real.',
  ladosCitacao: 'Ensinar idiomas faz parte da minha profissão. Aprendê-los também faz parte da minha vida.',

  nasceuTitulo: 'Como nasceu o Hebraico Fluente',
  nasceuP1: 'Com o tempo, meu trabalho passou a envolver cada vez mais metodologia. Hoje sou Gerente Pedagógico da New School, em Tel Aviv, onde trabalho na estruturação de cursos, materiais e experiências de aprendizagem de idiomas, e ensino hebraico na Universidad Isaac Abarbanel, em Buenos Aires. A formação em ensino de línguas, do CELTA aos estudos em Letras - Inglês (UNINTER), também está em cada decisão deste curso.',
  nasceuP2: 'O Hebraico Fluente nasceu dessa experiência: eu queria transformar o que funcionava nas minhas aulas em algo que qualquer brasileiro pudesse seguir no próprio ritmo. Não é uma sequência de vídeos nem um PDF digitalizado. É a metodologia virada em atividades, em que você:',
  nasceuFecho: 'e avança aos poucos, até ler as suas primeiras palavras sozinho.',
  junta: 'O que se junta nesta plataforma',
  linkedin: 'Ver meu perfil no LinkedIn',
  abreAba: ' (abre em outra aba)'
} as const;

const en: Traducao<typeof pt> = {
  padrao1: 'an entirely new alphabet',
  padrao2: 'depending on transliteration',
  padrao3: 'similar letters that get mixed up',
  padrao4: 'the jump from recognizing letters to reading words',
  padrao5: 'materials that assume what the student does not know yet',

  caminhoIsraelT: 'Israel',
  caminhoIsraelD: 'Hebrew as my native language.',
  caminhoBrasilT: 'Brazil',
  caminhoBrasilD: 'Since 2021, living and teaching here.',
  caminhoSalaT: 'Classroom',
  caminhoSalaD: 'Hebrew teacher at a Jewish school (2021-2023) and shaliach in the Jewish community.',
  caminhoIdiomasT: 'Languages',
  caminhoIdiomasD: 'Five languages, among them Hebrew, English, Spanish and Italian.',
  caminhoMetodologiaT: 'Methodology',
  caminhoMetodologiaD: 'Academic Manager at New School, in Tel Aviv, and teacher at Universidad Isaac Abarbanel, in Buenos Aires.',
  caminhoHfT: 'Hebraico Fluente',
  caminhoHfD: 'All of this in one learning platform.',

  reune1: 'Hebrew as a native language',
  reune2: 'Classroom experience with students starting from zero',
  reune3: 'The experience of learning five languages',
  reune4: 'Training in language teaching: CELTA and studies in Languages and Literature',
  reune5: 'The daily work of creating language courses',

  atividade1: 'learn the letters little by little',
  atividade2: 'practice recognizing them',
  atividade3: 'tell similar letters apart',
  atividade4: 'learn nikud',
  atividade5: 'practice reading',
  atividade6: 'get to know cursive handwriting',
  atividade7: 'build words',
  atividade8: 'get instant feedback',

  retratoAlt: 'Moshik Gueta, teacher and creator of Hebraico Fluente',
  nome: 'Moshik Gueta',
  descricao: 'Israeli, language teacher and educator',
  rubrica: 'Who is behind Hebraico Fluente',
  titulo: 'Years of teaching, learning and thinking about languages, turned into a method.',
  p1: 'I am Moshik Gueta, an Israeli language teacher and educator. Teaching Hebrew to students starting from zero, I soon realized that learning the language starts long before grammar.',
  p2: 'For anyone who grew up with the Latin alphabet, the first contact with Hebrew means a new reading direction, new symbols, new sounds and a different logic. In the classroom, a few issues kept coming back:',
  decisao: 'Each of these issues became a decision in the course.',
  caminho: 'The road so far',

  ensinandoTitulo: 'Teaching beginners',
  ensinandoTexto: 'It was while teaching at a Jewish school and in the Jewish community as a shaliach that I understood which difficulties kept repeating and which strategies really helped students start to read. Hebraico Fluente was not adapted from someone else\'s course: the method was born from this direct contact with students learning Hebrew.',
  ensinandoCitacao: 'Teaching Hebrew showed me that learning the alphabet is not just memorizing 22 letters. It is learning a new logic of reading.',
  ladosTitulo: 'On both sides of the classroom',
  ladosTexto: 'Besides teaching, I am still a language learner. I speak five languages, and each language put me back at the beginning: different structures, vocabulary from zero, reading that takes a while to get going, the urge to translate everything. It is from that side that I think about each exercise: what helps you move forward, what creates dependence and what turns passive knowledge into real skill.',
  ladosCitacao: 'Teaching languages is part of my profession. Learning them is part of my life too.',

  nasceuTitulo: 'How Hebraico Fluente was born',
  nasceuP1: 'Over time, my work came to involve more and more methodology. Today I am Academic Manager at New School, in Tel Aviv, where I work on structuring language courses, materials and learning experiences, and I teach Hebrew at Universidad Isaac Abarbanel, in Buenos Aires. My training in language teaching, from CELTA to my studies in Languages and Literature, is also in every decision in this course.',
  nasceuP2: 'Hebraico Fluente was born from that experience: I wanted to turn what worked in my classes into something anyone could follow at their own pace. It is not a series of videos or a scanned PDF. It is the method turned into activities, in which you:',
  nasceuFecho: 'and move forward little by little, until you read your first words on your own.',
  junta: 'What comes together on this platform',
  linkedin: 'See my LinkedIn profile',
  abreAba: ' (opens in a new tab)'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
