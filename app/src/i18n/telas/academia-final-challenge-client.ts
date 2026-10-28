import type { Traducao } from '..';

/* app/desafio-final/FinalChallengeClient.tsx */
const pt = {
  trancadoTitulo: 'O teste final ainda está trancado.',
  trancadoTexto: (total: number, faltam: number, regra: string) =>
    `Conclua as lições das ${total} letras para desbloquear o teste final. ` +
    `${faltam === 1 ? 'Falta concluir 1 lição.' : `Faltam ${faltam} lições para concluir.`} ` +
    `${regra} O teste mede o alfabeto inteiro - feito antes da hora, ele pergunta sobre letras que você ainda não viu e o número não diz nada.`,
  continuarDeOnde: 'Continuar de onde parei',
  verMapa: 'Ver o mapa',

  parteTitulo: (n: number, titulo: string) => `Parte ${n} · ${titulo}`,
  parteDe: (n: number, total: number) => `Parte ${n} de ${total}`,
  retomado: (feitas: number) =>
    `Você voltou ao exame. ${feitas === 1 ? 'A parte 1 já está contada' : `As partes 1 a ${feitas} já estão contadas`}; esta parte recomeça do início.`,
  questoesSemTempo: (n: number) => `${n} questões. Sem tempo, sem penalidade por errar.`,
  comecar: 'Começar',
  continuar: 'Continuar',

  kicker: (certas: number, total: number, pct: number) => `${certas} de ${total} · ${pct}%`,
  partePorParte: 'Parte por parte',
  treinarNaAcademia: (parte: string) => `Treinar ${parte} na Academia →`,
  aprovado: 'Aprovado',
  certificadoPronto: 'Seu certificado está pronto.',
  certificadoTexto: 'Com o seu nome, a data e as 22 letras - para baixar ou postar.',
  verCertificado: 'Ver o certificado',
  oQueConquistou: 'O que você conquistou',
  faltaram: (pct: number, n: number) =>
    `O certificado sai a partir de ${pct}%. Faltaram ${n} questões - e a próxima tentativa é um exame novo, não o mesmo.`,
  refazer: 'Refazer o exame',
  refazerMesmoAssim: 'Refazer mesmo assim',

  exameFinal: 'Exame final',
  portaTitulo: 'Hebraico de verdade, sem apoio',
  portaTexto: (questoes: number, partes: number) =>
    `${questoes} questões em ${partes} partes, com as 22 letras e sem transliteração. Cada parte tem a sua própria nota - no fim você vê exatamente o que está firme e o que não está.`,
  oQueCai: 'O que cai?',
  semEscuta: 'A parte de escuta entra quando as gravações chegarem. Até lá o exame não cobra o que o curso ainda não pôde ensinar.',
  semMod6e7: 'As partes "Sem os pontos" e "Os sons de fora" entram quando você fizer os módulos 6 e 7. ',
  semMod6: 'A parte "Sem os pontos" entra quando você fizer o módulo 6. ',
  semMod7: 'A parte "Os sons de fora" entra quando você fizer o módulo 7. ',
  ateLa: 'Até lá o exame não cobra o que você ainda não estudou.',
  licoesConcluidas: 'Lições concluídas',
  melhorResultado: (pct: number) => `Melhor resultado até agora: ${pct}%`,
  aprovadoCurto: ' · aprovado',
  tentativas: (n: number) => ` · ${n} ${n === 1 ? 'tentativa' : 'tentativas'}`,
  comecarExame: 'Começar o exame',
  aprovacao: (pct: number) => `Aprovação a partir de ${pct}%. Sem limite de tentativas, e cada tentativa é um exame diferente.`,
  verMeuCertificado: 'Ver o meu certificado',
  faltamLetras: (n: number) =>
    `Faltam ${n} letras. O exame só faz sentido com o alfabeto inteiro - e ele fica aqui esperando, sem prazo.`,
  voltarMapa: 'Voltar ao mapa',
  partesDoExame: 'Partes do exame'
} as const;

const en: Traducao<typeof pt> = {
  trancadoTitulo: 'The final test is still locked.',
  trancadoTexto: (total, faltam, regra) =>
    `Finish the lessons for all ${total} letters to unlock the final test. ` +
    `${faltam === 1 ? '1 lesson left to finish.' : `${faltam} lessons left to finish.`} ` +
    `${regra} The test covers the whole alphabet - taken too early, it asks about letters you have not seen yet and the score means nothing.`,
  continuarDeOnde: 'Pick up where I left off',
  verMapa: 'See the map',

  parteTitulo: (n, titulo) => `Part ${n} · ${titulo}`,
  parteDe: (n, total) => `Part ${n} of ${total}`,
  retomado: feitas =>
    `You are back in the exam. ${feitas === 1 ? 'Part 1 is already counted' : `Parts 1 to ${feitas} are already counted`}; this part starts over from the beginning.`,
  questoesSemTempo: n => `${n} questions. No time limit, no penalty for mistakes.`,
  comecar: 'Start',
  continuar: 'Continue',

  kicker: (certas, total, pct) => `${certas} of ${total} · ${pct}%`,
  partePorParte: 'Part by part',
  treinarNaAcademia: parte => `Train ${parte} in the Academy →`,
  aprovado: 'Passed',
  certificadoPronto: 'Your certificate is ready.',
  certificadoTexto: 'With your name, the date and the 22 letters - to download or share.',
  verCertificado: 'See the certificate',
  oQueConquistou: 'What you have achieved',
  faltaram: (pct, n) =>
    `The certificate is issued from ${pct}%. You were ${n} questions short - and the next attempt is a new exam, not the same one.`,
  refazer: 'Retake the exam',
  refazerMesmoAssim: 'Retake it anyway',

  exameFinal: 'Final exam',
  portaTitulo: 'Real Hebrew, no support',
  portaTexto: (questoes, partes) =>
    `${questoes} questions in ${partes} parts, with all 22 letters and no transliteration. Each part has its own score - at the end you see exactly what is solid and what is not.`,
  oQueCai: 'What is on it?',
  semEscuta: 'The listening part comes in when the recordings arrive. Until then the exam does not test what the course has not been able to teach yet.',
  semMod6e7: 'The "Without the dots" and "Sounds from abroad" parts come in when you do modules 6 and 7. ',
  semMod6: 'The "Without the dots" part comes in when you do module 6. ',
  semMod7: 'The "Sounds from abroad" part comes in when you do module 7. ',
  ateLa: 'Until then the exam does not test what you have not studied yet.',
  licoesConcluidas: 'Lessons completed',
  melhorResultado: pct => `Best result so far: ${pct}%`,
  aprovadoCurto: ' · passed',
  tentativas: n => ` · ${n} ${n === 1 ? 'attempt' : 'attempts'}`,
  comecarExame: 'Start the exam',
  aprovacao: pct => `You pass from ${pct}%. Unlimited attempts, and each attempt is a different exam.`,
  verMeuCertificado: 'See my certificate',
  faltamLetras: n =>
    `${n} letters to go. The exam only makes sense with the whole alphabet - and it will wait here for you, no deadline.`,
  voltarMapa: 'Back to the map',
  partesDoExame: 'Exam parts'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
