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
  etapaFechada: (n: number, rotulo: string) => `Etapa ${n} de 5 - ${rotulo} (abre quando você concluir a anterior)`,

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
  naoVaiNota: 'Não vale nota. Se errar, a explicação aparece na hora, e você relê o passo antes de responder de novo.',
  relerEResponder: 'Reler a explicação e responder de novo',
  respondaParaContinuar: 'Responda às perguntas acima para continuar.',
  acerteParaContinuar: 'Acerte todas as perguntas para continuar. Releia a explicação e tente de novo.',
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
  escrevaParaContinuar: 'Escreva a letra pelo menos uma vez e toque em Conferir para continuar.',
  naoConsigoEscrever: 'Não consigo escrever nesta tela',

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
  fixacao: 'Reinforce',
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
  etapaFechada: (n, rotulo) => `Step ${n} of 5 - ${rotulo} (opens when you finish the previous one)`,

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
  naoVaiNota: 'Not scored. If you get one wrong, the explanation appears right away, and you reread the step before answering again.',
  relerEResponder: 'Reread the explanation and answer again',
  respondaParaContinuar: 'Answer the questions above to continue.',
  acerteParaContinuar: 'Get every question right to continue. Reread the explanation and try again.',
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
  continuarFixacao: 'Continue to Reinforce',
  escrevaParaContinuar: 'Write the letter at least once and tap Check to continue.',
  naoConsigoEscrever: "I can't write on this screen",

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

const es: Traducao<typeof pt> = {
  conhecer: 'Conocer',
  palavras: 'Palabras',
  escrever: 'Escribir',
  fixacao: 'Fijación',
  exercicios: 'Ejercicios',

  concluirEContinuar: 'Terminar y continuar',
  emSeguidaSom: nome => `A continuación: el sonido ${nome}`,
  emSeguidaCheckpoint: n => `A continuación: Checkpoint ${n}`,
  emSeguidaLetra: nome => `A continuación: la letra ${nome}`,
  deVolta: 'De vuelta al mapa del curso',
  mapa: '← Mapa',
  badge: (modulo, licao, ordem) => `Módulo ${modulo} · lección ${licao} · letra ${ordem}/22`,
  etapas: 'Etapas de la lección',
  etapaDe: (n, rotulo) => `Etapa ${n} de 5 - ${rotulo}`,
  etapaFechada: (n, rotulo) => `Etapa ${n} de 5 - ${rotulo} (se abre cuando termines la anterior)`,

  descobrir: 'Descubrir',
  oQueVamos: '¿Qué vamos a aprender hoy?',
  voceVai: (he, final) =>
    <>Vas a poder reconocer, pronunciar, leer y escribir {he}{final ? <> - y su forma final, {final}</> : null}.</>,
  gravacaoIntro: nome => `El nombre, el sonido y una palabra con ${nome}.`,
  ouvir: 'Escuchar',
  comoPronunciar: '¿Cómo se pronuncia?',
  // etapa 3: pronúncia, rever
  gravacaoHet: 'La ח sola y en palabras, comparada con la j de "jamón".',
  entender: 'Entender',
  explicacaoCompleta: 'Ver la explicación completa',
  praticar: 'Practicar',
  comCadaVogal: 'La letra con cada vocal',
  toqueParaOuvir: 'Toca una sílaba para escucharla. Después graba la tuya y compara.',
  toqueParaDica: 'Toca una sílaba para ver el consejo de pronunciación.',
  ouvirNome: nome => `Escuchar el nombre: ${nome}`,
  compareComAsQueSabe: 'Compara con las letras que ya sabes',
  compararComAsQueSabe: 'Comparar con las letras que ya sabes',
  conferir: 'Comprobar',
  entendeu: '¿Entendiste? Preguntas rápidas',
  naoVaiNota: 'No cuenta para la nota. Si te equivocas, la explicación aparece al instante, y relees el paso antes de responder de nuevo.',
  relerEResponder: 'Releer la explicación y responder de nuevo',
  respondaParaContinuar: 'Responde las preguntas de arriba para continuar.',
  acerteParaContinuar: 'Acierta todas las preguntas para continuar. Relee la explicación e intenta de nuevo.',
  fechoBom: 'Bien. Ahora las palabras que abre esta letra.',
  fechoParcial: 'Vale la pena releer los pasos anteriores - son dos o tres ideas, y vuelven en las próximas letras.',
  passoDe: (n, total) => `Paso ${n} de ${total}`,
  voltar: 'Volver',
  continuarPalavras: 'Continuar a las palabras',
  proximo: nome => `Siguiente: ${nome}`,

  detalhe: 'Detalle importante',
  noMeio: 'en el medio',
  noFim: 'al final',
  oQueFaz: '¿Qué hace esta letra?',
  verMais: n => `Ver más sobre esta letra (${n} ${n === 1 ? 'recuadro' : 'recuadros'})`,
  lembrar: '¿Qué necesitas recordar?',

  jaConsegueLer: 'Palabras que ya puedes leer',
  tenteDecifrar: 'Intenta descifrarlas antes de revelarlas. Todas usan solo letras que ya aprendiste.',
  gravacaoTav: 'Cómo se lee אַתְ, y por qué las mismas dos letras también forman otra palabra.',
  compareLeitura: 'Compara tu lectura de las palabras con la del curso',
  semPalavra: 'Todavía no se puede formar una palabra',
  semPalavraTexto: umaConsoante =>
    `Con ${umaConsoante ? 'una sola consonante' : 'las pocas letras que tienes hasta aquí'}, ninguna combinación forma una palabra de verdad. Eso cambia ya con la próxima letra - y no vuelve a pasar. Por ahora, lee las sílabas.`,
  continuarEscrita: 'Continuar a la escritura',
  maisLugares: n => `${n} ${n === 1 ? 'lugar' : 'lugares'} más donde ya puedes leer`,
  verMaisPalavras: (n, resto) => `Ver ${n} ${resto === 1 ? 'palabra' : 'palabras'} más`,
  restantes: n => ` · ${n} restantes`,

  aprendendoAEscrever: 'Aprendiendo a escribir',
  mesmaLetra: 'La misma letra, con el trazo que se usa a mano.',
  impressa: 'Impresa',
  cursiva: 'Cursiva',
  formaFinal: nome => `${nome} - forma final`,
  continuarFixacao: 'Continuar a la fijación',
  escrevaParaContinuar: 'Escribe la letra al menos una vez y toca Comprobar para continuar.',
  naoConsigoEscrever: 'No puedo escribir en esta pantalla',

  praticarMais: 'Vamos a practicar un poco más.',
  reforcoTexto: n =>
    `Estas ${n} preguntas salen de lo que se te escapó hace un momento. Nada aquí cuenta para la nota. La que falles vuelve después de otras, hasta que la aciertes.`,
  reforco: 'Refuerzo',
  placar: (certas, total, pct) => `${certas} de ${total} · ${pct}%`,
  maisUma: 'Una lección más completada.',
  reforcoFeito: 'Refuerzo hecho.',
  quaseLa: 'Casi lo logras.',
  vamosFirmar: nome => `Vamos a afirmar ${nome}.`,
  reconhece: nome =>
    `Reconoces ${nome} sola, dentro de una palabra y entre las parecidas. Puedes seguir con seguridad.`,
  filaTrancada: (nome, libera) =>
    `${nome} entró en la fila de repaso y vuelve mañana, en el día justo. `
    + `La próxima lección se abre a partir del ${libera}% en los ejercicios. `
    + 'Rehaz la prueba: las preguntas cambian en cada intento.',
  filaReforco: nome =>
    `${nome} entró en la fila de repaso y vuelve mañana, en el día justo. `
    + 'Todavía no cuenta como completada - rehaz la prueba cuando quieras, '
    + 'con otras preguntas, y pasa a contar. Puedes seguir.',
  faltouPouco: 'Faltó poco. Cuatro preguntas rápidas, armadas a partir de lo que se te escapó, y seguimos.',
  naoFirme: 'Esta letra todavía no está firme, y está bien - para eso existe la práctica. Cuatro preguntas armadas a partir de lo que se te escapó.',
  praticarMaisUmPouco: 'Practicar un poco más',
  refazerPrecisa: libera => `Rehacer los ejercicios (necesitas ${libera}%)`,
  proximaAbre: (libera, acertos, total) =>
    `La próxima lección se abre con ${libera}% en los ejercicios: ${acertos} de ${total}.`,
  refazerTeste: 'Rehacer la prueba',
  exerciciosLetra: nome => `Ejercicios - letra ${nome}`,

  minhaConquista: 'Mi logro',
  conquista1: nome => `Reconocer la letra ${nome} en sus formas impresa y cursiva.`,
  conquistaSemSom: nome =>
    `Entender que, en las palabras estudiadas, la letra ${nome} puede aparecer sin un sonido propio.`,
  conquistaDoisSons: (nome, som) =>
    `Reconocer los dos sonidos de la letra ${nome}, con y sin daguesh: ${som}.`,
  conquistaSom: (nome, som) => `Asociar la letra ${nome} con el sonido ${som}.`,
  conquista3: nome => `Reconocer la letra ${nome} dentro de palabras.`,
  laboratorio: 'Practicar la lectura de palabras en el Laboratorio de Lectura.',

  antesDaPrimeira: 'Antes de la primera letra, la Clase 0',
  abreComAula0: he =>
    <>La letra {he} se abre cuando terminas la Clase 0: la dirección de la lectura, qué es el nikud y cómo funciona el curso. Termina con una comprobación corta, y puedes rehacerla todas las veces que quieras.</>,
  irAula0: 'Ir a la Clase 0',
  verMapa: 'Ver el mapa',
  naoAbriu: he => <>La letra {he} todavía no se abrió</>,
  vemDepois: anterior =>
    <>Viene después de {anterior}, y esa lección todavía no está terminada. Cada letra usa las anteriores en las palabras - por eso importa el orden.</>,
  faltamExercicios: (anterior, nota, libera) =>
    <>Faltan los ejercicios de {anterior}. Tu mejor nota ahí fue {nota}%, y esta letra se abre a partir del {libera}%. Puedes rehacerlos todas las veces que quieras - las preguntas cambian en cada intento.</>,
  irPara: nome => `Ir a ${nome}`,
  refazerDe: nome => `Rehacer los ejercicios de ${nome}`,
  continuarDeOnde: nome => `Continuar donde lo dejé (${nome})`,

  duasLeituras: 'Las dos lecturas',
  leiturasDestaLetra: 'Las lecturas de esta letra',
  mesmoDesenho: 'El mismo dibujo de letra. Lo que cambia es el signo - y es en él que te fijas antes de pronunciar.',
  ouvirExemplo: (nome, exemplo) => `Escuchar ${nome}, en el ejemplo ${exemplo}`
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
