import type { Traducao } from '..';

/* app/checkpoint/[n]/CheckpointClient.tsx */
const pt = {
  kicker: (n: number, certas: number, total: number) => `Checkpoint ${n} · ${certas} de ${total}`,
  concluido: (pct: number) => `${pct}% - checkpoint concluído.`,
  quaseLa: (pct: number) => `${pct}% - quase lá.`,
  conhece: (n: number) => `Você agora conhece ${n} letras do alfabeto hebraico.`,
  faltouPouco: 'Faltou pouco. Vale rever as letras abaixo e refazer - sem pressa e sem penalidade.',
  refazer: 'Refazer',
  missaoDoModulo: 'Missão do módulo',
  proximoModulo: (n: number, titulo: string) => `Módulo ${n} - ${titulo}`,
  desafioFinal: 'Ir para o desafio final',
  primeiraLeitura: 'Minha Primeira Leitura',
  jaFez: 'Você já fez a leitura deste módulo. Dá para ler de novo quando quiser.',
  algumasPalavras: 'Algumas palavras com as letras deste módulo. Você lê sozinho, depois ouve e confere.',
  lerAgora: 'Ler agora',
  semPontinhos: 'Sem os pontinhos',
  rampa: (certas: number, total: number) =>
    `Você leu ${certas} de ${total} palavras sem nikud, do jeito que elas aparecem na rua. Isso não entra na nota: é um aquecimento para o módulo 6, onde os pontos somem de vez.`,
  valeVoltar: 'Vale voltar nestas',
  titulo: (n: number) => `Checkpoint ${n}`,
  mapa: '← Mapa',
  letrasDoModulo: 'As letras deste módulo',
  concluida: ' · concluída',
  faltaNota: ' · falta a nota dos exercícios',
  refazerExercicios: (regra: string) => `refazer os exercícios (${regra})`,
  fazerLicao: 'fazer a lição',
  licoesConcluidas: 'Lições concluídas',
  oQueVem: 'O que vem no checkpoint?',
  questoes:
    '12 questões misturando reconhecimento, leitura, vocabulário e as formas finais - só com letras que você já viu. Passa com 70%, e dá para refazer quantas vezes quiser.',
  comRampa:
    ' No fim vêm 3 palavras que você já conhece, sem os pontinhos, como aparecem na rua. Elas não entram na nota.',
  melhor: (pct: number, tentativas: number) =>
    `Melhor resultado até agora: ${pct}% em ${tentativas} ${tentativas === 1 ? 'tentativa' : 'tentativas'}.`,
  faltam: (faltam: number, total: number) =>
    `Faltam ${faltam} lições deste módulo. Você pode fazer o checkpoint assim mesmo, mas ele cobra as ${total} letras.`,
  mesmoAssim: 'Fazer mesmo assim',
  comecar: 'Começar o checkpoint',
  voltarMapa: 'Voltar ao mapa'
} as const;

const en: Traducao<typeof pt> = {
  kicker: (n, certas, total) => `Checkpoint ${n} · ${certas} of ${total}`,
  concluido: pct => `${pct}% - checkpoint complete.`,
  quaseLa: pct => `${pct}% - almost there.`,
  conhece: n => `You now know ${n} letters of the Hebrew alphabet.`,
  faltouPouco: 'So close. Review the letters below and try again - no rush and no penalty.',
  refazer: 'Try again',
  missaoDoModulo: 'Module mission',
  proximoModulo: (n, titulo) => `Module ${n} - ${titulo}`,
  desafioFinal: 'Go to the final challenge',
  primeiraLeitura: 'My First Reading',
  jaFez: 'You have already done this module\'s reading. You can read it again whenever you like.',
  algumasPalavras: 'A few words with this module\'s letters. You read them on your own, then listen and check.',
  lerAgora: 'Read now',
  semPontinhos: 'Without the dots',
  rampa: (certas, total) =>
    `You read ${certas} of ${total} words without nikud, the way they appear on the street. This does not count toward your score: it is a warm-up for module 6, where the dots disappear for good.`,
  valeVoltar: 'Worth going back to',
  titulo: n => `Checkpoint ${n}`,
  mapa: '← Map',
  letrasDoModulo: 'The letters in this module',
  concluida: ' · complete',
  faltaNota: ' · exercise score still needed',
  refazerExercicios: regra => `redo the exercises (${regra})`,
  fazerLicao: 'do the lesson',
  licoesConcluidas: 'Lessons completed',
  oQueVem: 'What is in the checkpoint?',
  questoes:
    '12 questions mixing recognition, reading, vocabulary and final forms - only with letters you have already seen. You pass with 70%, and you can redo it as many times as you like.',
  comRampa:
    ' At the end come 3 words you already know, without the dots, the way they appear on the street. They do not count toward your score.',
  melhor: (pct, tentativas) =>
    `Best result so far: ${pct}% in ${tentativas} ${tentativas === 1 ? 'attempt' : 'attempts'}.`,
  faltam: (faltam, total) =>
    `${faltam} lessons in this module are still to do. You can take the checkpoint anyway, but it covers all ${total} letters.`,
  mesmoAssim: 'Take it anyway',
  comecar: 'Start the checkpoint',
  voltarMapa: 'Back to the map'
};

const es: Traducao<typeof pt> = {
  kicker: (n, certas, total) => `Checkpoint ${n} · ${certas} de ${total}`,
  concluido: pct => `${pct}% - checkpoint completado.`,
  quaseLa: pct => `${pct}% - casi lo logras.`,
  conhece: n => `Ahora conoces ${n} letras del alfabeto hebreo.`,
  faltouPouco: 'Faltó poco. Vale la pena repasar las letras de abajo y volver a intentarlo - sin prisa y sin penalización.',
  refazer: 'Volver a intentarlo',
  missaoDoModulo: 'Misión del módulo',
  proximoModulo: (n, titulo) => `Módulo ${n} - ${titulo}`,
  desafioFinal: 'Ir al desafío final',
  primeiraLeitura: 'Mi Primera Lectura',
  jaFez: 'Ya hiciste la lectura de este módulo. Puedes leerla de nuevo cuando quieras.',
  algumasPalavras: 'Algunas palabras con las letras de este módulo. Las lees por tu cuenta, después escuchas y compruebas.',
  lerAgora: 'Leer ahora',
  semPontinhos: 'Sin los puntitos',
  rampa: (certas, total) =>
    `Leíste ${certas} de ${total} palabras sin nikud, como aparecen en la calle. Esto no cuenta para la nota: es un calentamiento para el módulo 6, donde los puntos desaparecen del todo.`,
  valeVoltar: 'Vale la pena volver a estas',
  titulo: n => `Checkpoint ${n}`,
  mapa: '← Mapa',
  letrasDoModulo: 'Las letras de este módulo',
  concluida: ' · completada',
  faltaNota: ' · falta la nota de los ejercicios',
  refazerExercicios: regra => `rehacer los ejercicios (${regra})`,
  fazerLicao: 'hacer la lección',
  licoesConcluidas: 'Lecciones completadas',
  oQueVem: '¿Qué trae el checkpoint?',
  questoes:
    '12 preguntas que mezclan reconocimiento, lectura, vocabulario y las formas finales - solo con letras que ya viste. Se aprueba con 70%, y puedes rehacerlo todas las veces que quieras.',
  comRampa:
    ' Al final vienen 3 palabras que ya conoces, sin los puntitos, como aparecen en la calle. No cuentan para la nota.',
  melhor: (pct, tentativas) =>
    `Mejor resultado hasta ahora: ${pct}% en ${tentativas} ${tentativas === 1 ? 'intento' : 'intentos'}.`,
  faltam: (faltam, total) =>
    `Faltan ${faltam} lecciones de este módulo. Puedes hacer el checkpoint de todos modos, pero evalúa las ${total} letras.`,
  mesmoAssim: 'Hacerlo de todos modos',
  comecar: 'Empezar el checkpoint',
  voltarMapa: 'Volver al mapa'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
