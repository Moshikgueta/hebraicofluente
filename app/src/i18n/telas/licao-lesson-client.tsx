import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* app/licao/[letterId]/LessonClient.tsx */
const pt = {
  /* As abas da lição. lib/etapas-da-licao.ts repete os nomes em português
     para a vitrine, e tests/etapas.test.ts confere que batem. */
  conhecer: 'Conhecer',
  palavras: 'Palavras',
  escrever: 'Escrever',
  fixacao: 'Fixação',
  exercicios: 'Exercícios',

  concluirEContinuar: 'Concluir e continuar',
  emSeguidaSom: (nome: string) => `Em seguida: o som ${nome}`,
  emSeguidaCheckpoint: (n: number) => `Em seguida: Checkpoint ${n}`,
  emSeguidaLetra: (nome: string) => `Em seguida: letra ${nome}`,
  deVolta: 'De volta ao mapa do curso',
  mapa: '← Mapa',
  badge: (modulo: number, licao: number, ordem: number) => `Módulo ${modulo} · lição ${licao} · letra ${ordem}/22`,
  etapas: 'Etapas da lição',
  etapaDe: (n: number, rotulo: string) => `Etapa ${n} de 5 - ${rotulo}`,

  descobrir: 'Descobrir',
  oQueVamos: 'O que vamos aprender hoje?',
  voceVai: (he: ReactNode, final: ReactNode): ReactNode =>
    <>Você vai conseguir reconhecer, pronunciar, ler e escrever {he}{final ? <> - e a sua forma final, {final}</> : null}.</>,
  gravacaoIntro: (nome: string) => `O nome, o som e uma palavra com ${nome}.`,
  ouvir: 'Ouvir',
  comoPronunciar: 'Como pronunciar?',
  gravacaoHet: 'O ח sozinho e em palavras, comparado ao R de alguns sotaques brasileiros.',
  entender: 'Entender',
  explicacaoCompleta: 'Ver a explicação completa',
  praticar: 'Praticar',
  comCadaVogal: 'A letra com cada vogal',
  toqueParaOuvir: 'Toque numa sílaba para ouvir. Depois grave a sua e compare.',
  toqueParaDica: 'Toque numa sílaba para ver a dica de pronúncia.',
  ouvirNome: (nome: string) => `Ouvir o nome: ${nome}`,
  compareComAsQueSabe: 'Compare com as letras que você já sabe',
  compararComAsQueSabe: 'Comparar com as letras que você já sabe',
  conferir: 'Conferir',
  entendeu: 'Entendeu? Perguntas rápidas',
  naoVaiNota: 'Não vale nota e não tranca nada. Se errar, a explicação aparece na hora.',
  fechoBom: 'Boa. Agora as palavras que esta letra abre.',
  fechoParcial: 'Vale reler os passos anteriores - são duas ou três ideias, e elas voltam nas próximas letras.',
  passoDe: (n: number, total: number) => `Passo ${n} de ${total}`,
  voltar: 'Voltar',
  continuarPalavras: 'Continuar para as palavras',
  proximo: (nome: string) => `Próximo: ${nome}`,

  detalhe: 'Detalhe importante',
  noMeio: 'no meio',
  noFim: 'no fim',
  oQueFaz: 'O que esta letra faz?',
  verMais: (n: number) => `Ver mais sobre esta letra (${n} ${n === 1 ? 'quadro' : 'quadros'})`,
  lembrar: 'O que você precisa lembrar?',

  jaConsegueLer: 'Palavras que você já consegue ler',
  tenteDecifrar: 'Tente decifrar antes de revelar. Todas usam só letras que você já aprendeu.',
  gravacaoTav: 'Como se lê אַתְ, e por que as mesmas duas letras também formam outra palavra.',
  compareLeitura: 'Compare a sua leitura das palavras com a do curso',
  semPalavra: 'Ainda não dá para formar uma palavra',
  semPalavraTexto: (umaConsoante: boolean) =>
    `Com ${umaConsoante ? 'uma consoante só' : 'as poucas letras que você tem até aqui'}, nenhuma combinação fecha uma palavra de verdade. Isso muda já na próxima letra - e não volta a acontecer. Por enquanto, leia as sílabas.`,
  continuarEscrita: 'Continuar para a escrita',
  maisLugares: (n: number) => `Mais ${n} ${n === 1 ? 'lugar' : 'lugares'} onde você já consegue ler`,
  verMaisPalavras: (n: number, resto: number) => `Ver mais ${n} ${resto === 1 ? 'palavra' : 'palavras'}`,
  restantes: (n: number) => ` · ${n} restantes`,

  aprendendoAEscrever: 'Aprendendo a escrever',
  mesmaLetra: 'A mesma letra, no desenho que se usa à mão.',
  impressa: 'Impressa',
  cursiva: 'Cursiva',
  formaFinal: (nome: string) => `${nome} - forma final`,
  continuarFixacao: 'Continuar para a fixação',

  praticarMais: 'Vamos praticar mais um pouco.',
  reforcoTexto: (n: number) =>
    `Estas ${n} questões saem do que escapou agora há pouco. Nada aqui vale nota. A que você errar volta depois de outras, até você acertar.`,
  reforco: 'Reforço',
  placar: (certas: number, total: number, pct: number) => `${certas} de ${total} · ${pct}%`,
  maisUma: 'Mais uma lição concluída.',
  reforcoFeito: 'Reforço feito.',
  quaseLa: 'Quase lá.',
  vamosFirmar: (nome: string) => `Vamos firmar ${nome}.`,
  reconhece: (nome: string) =>
    `Você reconhece ${nome} sozinha, dentro de uma palavra e entre as parecidas. Pode seguir com segurança.`,
  filaTrancada: (nome: string, libera: number) =>
    `${nome} entrou na fila de revisão e volta amanhã, no dia certo. `
    + `A próxima lição abre a partir de ${libera}% nos exercícios. `
    + 'Refaça o teste: as perguntas mudam a cada tentativa.',
  filaReforco: (nome: string) =>
    `${nome} entrou na fila de revisão e volta amanhã, no dia certo. `
    + 'Ela ainda não conta como concluída - refaça o teste quando quiser, '
    + 'com outras perguntas, e ela passa a contar. Pode seguir.',
  faltouPouco: 'Faltou pouco. Quatro questões rápidas, montadas a partir do que escapou, e seguimos.',
  naoFirme: 'Esta letra ainda não está firme, e tudo bem - é para isso que existe a prática. Quatro questões montadas a partir do que escapou.',
  praticarMaisUmPouco: 'Praticar mais um pouco',
  refazerPrecisa: (libera: number) => `Refazer os exercícios (precisa de ${libera}%)`,
  proximaAbre: (libera: number, acertos: number, total: number) =>
    `A próxima lição abre com ${libera}% nos exercícios: ${acertos} de ${total}.`,
  refazerTeste: 'Refazer o teste',
  exerciciosLetra: (nome: string) => `Exercícios - letra ${nome}`,

  minhaConquista: 'Minha conquista',
  conquista1: (nome: string) => `Reconhecer a letra ${nome} nas formas impressa e cursiva.`,
  conquistaSemSom: (nome: string) =>
    `Entender que, nas palavras estudadas, a letra ${nome} pode aparecer sem um som próprio.`,
  conquistaDoisSons: (nome: string, som: string) =>
    `Reconhecer os dois sons da letra ${nome}, com e sem daguesh: ${som}.`,
  conquistaSom: (nome: string, som: string) => `Associar a letra ${nome} ao som ${som}.`,
  conquista3: (nome: string) => `Reconhecer a letra ${nome} dentro de palavras.`,
  laboratorio: 'Praticar a leitura de palavras no Laboratório de Leitura.',

  antesDaPrimeira: 'Antes da primeira letra, a Aula 0',
  abreComAula0: (he: ReactNode): ReactNode =>
    <>A letra {he} abre quando você conclui a Aula 0: a direção da leitura, o que é o nikud e como o curso funciona. Ela termina com uma checagem curta, e dá para refazer quantas vezes quiser.</>,
  irAula0: 'Ir para a Aula 0',
  verMapa: 'Ver o mapa',
  naoAbriu: (he: ReactNode): ReactNode => <>A letra {he} ainda não abriu</>,
  vemDepois: (anterior: ReactNode): ReactNode =>
    <>Ela vem depois de {anterior}, e essa lição ainda não foi concluída. Cada letra usa as anteriores nas palavras - é por isso que a ordem importa.</>,
  faltamExercicios: (anterior: ReactNode, nota: number, libera: number): ReactNode =>
    <>Faltam os exercícios de {anterior}. Sua melhor nota lá foi {nota}%, e esta letra abre a partir de {libera}%. Dá para refazer quantas vezes quiser - as perguntas mudam a cada tentativa.</>,
  irPara: (nome: string) => `Ir para ${nome}`,
  refazerDe: (nome: string) => `Refazer os exercícios de ${nome}`,
  continuarDeOnde: (nome: string) => `Continuar de onde parei (${nome})`,

  duasLeituras: 'As duas leituras',
  leiturasDestaLetra: 'As leituras desta letra',
  mesmoDesenho: 'Mesmo desenho de letra. O que muda é o sinal - e é nele que você olha antes de pronunciar.',
  ouvirExemplo: (nome: string, exemplo: string) => `Ouvir ${nome}, no exemplo ${exemplo}`
} as const;

const en: Traducao<typeof pt> = {
  conhecer: 'Meet',
  palavras: 'Words',
  escrever: 'Write',
  fixacao: 'Practice',
  exercicios: 'Exercises',

  concluirEContinuar: 'Finish and continue',
  emSeguidaSom: nome => `Next: the sound ${nome}`,
  emSeguidaCheckpoint: n => `Next: Checkpoint ${n}`,
  emSeguidaLetra: nome => `Next: the letter ${nome}`,
  deVolta: 'Back to the course map',
  mapa: '← Map',
  badge: (modulo, licao, ordem) => `Module ${modulo} · lesson ${licao} · letter ${ordem}/22`,
  etapas: 'Lesson steps',
  etapaDe: (n, rotulo) => `Step ${n} of 5 - ${rotulo}`,

  descobrir: 'Discover',
  oQueVamos: 'What will we learn today?',
  voceVai: (he, final) =>
    <>You will be able to recognize, pronounce, read and write {he}{final ? <> - and its final form, {final}</> : null}.</>,
  gravacaoIntro: nome => `The name, the sound and a word with ${nome}.`,
  ouvir: 'Listen',
  comoPronunciar: 'How do you pronounce it?',
  // etapa 3: pronúncia, rever
  gravacaoHet: 'The ח on its own and in words, compared with the "ch" in the Scottish word "loch".',
  entender: 'Understand',
  explicacaoCompleta: 'See the full explanation',
  praticar: 'Practice',
  comCadaVogal: 'The letter with each vowel',
  toqueParaOuvir: 'Tap a syllable to hear it. Then record yours and compare.',
  toqueParaDica: 'Tap a syllable to see the pronunciation tip.',
  ouvirNome: nome => `Hear the name: ${nome}`,
  compareComAsQueSabe: 'Compare with the letters you already know',
  compararComAsQueSabe: 'Compare with the letters you already know',
  conferir: 'Check',
  entendeu: 'Got it? Quick questions',
  naoVaiNota: 'Not scored and nothing gets locked. If you get one wrong, the explanation appears right away.',
  fechoBom: 'Nice. Now the words this letter opens up.',
  fechoParcial: 'Worth rereading the previous steps - there are two or three ideas, and they come back in the next letters.',
  passoDe: (n, total) => `Step ${n} of ${total}`,
  voltar: 'Back',
  continuarPalavras: 'Continue to the words',
  proximo: nome => `Next: ${nome}`,

  detalhe: 'Important detail',
  noMeio: 'in the middle',
  noFim: 'at the end',
  oQueFaz: 'What does this letter do?',
  verMais: n => `See more about this letter (${n} ${n === 1 ? 'box' : 'boxes'})`,
  lembrar: 'What do you need to remember?',

  jaConsegueLer: 'Words you can already read',
  tenteDecifrar: 'Try to decode before revealing. They all use only letters you have already learned.',
  gravacaoTav: 'How אַתְ is read, and why the same two letters also make another word.',
  compareLeitura: 'Compare your reading of the words with the course',
  semPalavra: 'Not enough letters for a word yet',
  semPalavraTexto: umaConsoante =>
    `With ${umaConsoante ? 'just one consonant' : 'the few letters you have so far'}, no combination makes a real word. That changes with the very next letter - and it does not happen again. For now, read the syllables.`,
  continuarEscrita: 'Continue to writing',
  maisLugares: n => `${n} more ${n === 1 ? 'place' : 'places'} where you can already read`,
  verMaisPalavras: (n, resto) => `See ${n} more ${resto === 1 ? 'word' : 'words'}`,
  restantes: n => ` · ${n} left`,

  aprendendoAEscrever: 'Learning to write',
  mesmaLetra: 'The same letter, in the shape used by hand.',
  impressa: 'Print',
  cursiva: 'Cursive',
  formaFinal: nome => `${nome} - final form`,
  continuarFixacao: 'Continue to practice',

  praticarMais: 'Let\'s practice a little more.',
  reforcoTexto: n =>
    `These ${n} questions come from what slipped past you just now. Nothing here is scored. Any you miss come back after a few others, until you get them right.`,
  reforco: 'Reinforcement',
  placar: (certas, total, pct) => `${certas} of ${total} · ${pct}%`,
  maisUma: 'One more lesson complete.',
  reforcoFeito: 'Reinforcement done.',
  quaseLa: 'Almost there.',
  vamosFirmar: nome => `Let's make ${nome} solid.`,
  reconhece: nome =>
    `You recognize ${nome} on its own, inside a word and among look-alikes. You can move on with confidence.`,
  filaTrancada: (nome, libera) =>
    `${nome} went into your review queue and comes back tomorrow, on the right day. `
    + `The next lesson opens at ${libera}% on the exercises. `
    + 'Retake the test: the questions change with every attempt.',
  filaReforco: nome =>
    `${nome} went into your review queue and comes back tomorrow, on the right day. `
    + 'It does not count as complete yet - retake the test whenever you like, '
    + 'with different questions, and it will count. You can move on.',
  faltouPouco: 'So close. Four quick questions, built from what slipped past you, and we move on.',
  naoFirme: 'This letter is not solid yet, and that is fine - that is what practice is for. Four questions built from what slipped past you.',
  praticarMaisUmPouco: 'Practice a little more',
  refazerPrecisa: libera => `Redo the exercises (you need ${libera}%)`,
  proximaAbre: (libera, acertos, total) =>
    `The next lesson opens with ${libera}% on the exercises: ${acertos} of ${total}.`,
  refazerTeste: 'Retake the test',
  exerciciosLetra: nome => `Exercises - letter ${nome}`,

  minhaConquista: 'My achievement',
  conquista1: nome => `Recognize the letter ${nome} in print and in cursive.`,
  conquistaSemSom: nome =>
    `Understand that, in the words studied, the letter ${nome} can appear without a sound of its own.`,
  conquistaDoisSons: (nome, som) =>
    `Recognize the two sounds of the letter ${nome}, with and without dagesh: ${som}.`,
  conquistaSom: (nome, som) => `Connect the letter ${nome} with the sound ${som}.`,
  conquista3: nome => `Recognize the letter ${nome} inside words.`,
  laboratorio: 'Practice reading words in the Reading Lab.',

  antesDaPrimeira: 'Before the first letter, Lesson 0',
  abreComAula0: he =>
    <>The letter {he} opens when you finish Lesson 0: the reading direction, what nikud is and how the course works. It ends with a short check, and you can redo it as many times as you like.</>,
  irAula0: 'Go to Lesson 0',
  verMapa: 'See the map',
  naoAbriu: he => <>The letter {he} is not open yet</>,
  vemDepois: anterior =>
    <>It comes after {anterior}, and that lesson is not finished yet. Each letter uses the earlier ones in its words - that is why the order matters.</>,
  faltamExercicios: (anterior, nota, libera) =>
    <>The exercises for {anterior} are still to do. Your best score there was {nota}%, and this letter opens at {libera}%. You can redo them as many times as you like - the questions change with every attempt.</>,
  irPara: nome => `Go to ${nome}`,
  refazerDe: nome => `Redo the exercises for ${nome}`,
  continuarDeOnde: nome => `Continue where I left off (${nome})`,

  duasLeituras: 'The two readings',
  leiturasDestaLetra: 'The readings of this letter',
  mesmoDesenho: 'Same letter shape. What changes is the sign - and that is what you look at before pronouncing.',
  ouvirExemplo: (nome, exemplo) => `Listen to ${nome}, in the example ${exemplo}`
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
