import type { Traducao } from '..';

/* app/mapa/CourseMapClient.tsx - o mapa do curso, a linha do tempo. */
const pt = {
  meuCurso: 'Meu curso',
  resumo: '{modulos} módulos · {licoes} lições · {letras} letras',
  concluido: 'concluído',

  /* a Aula 0 */
  tagConcluido: 'Concluído',
  comeceAqui: 'Comece por aqui',
  aula0Rotulo: 'Aula 0 · antes da primeira letra',
  comoFunciona: 'Como o hebraico funciona',
  aula0Feita: 'A direção da leitura, o alfabeto e o nikud. Fica aqui para você reler quando quiser.',
  aula0Falta: 'A direção da leitura, o alfabeto, o nikud e como o curso funciona. Termina com uma checagem curta, e aí o Álef abre.',

  /* um módulo */
  emAndamento: 'Em andamento',
  faltaCheckpoint: 'Falta o checkpoint',
  abreDepoisAula0: 'Abre depois da Aula 0',
  abreDepoisModulo: 'Abre depois do módulo {n}',
  moduloLicoes: (n: number, licoes: number) => `Módulo ${n} · ${licoes} ${licoes === 1 ? 'lição' : 'lições'}`,
  letraConcluida: ' - concluída',
  letraEtapas: ' - {n} de {total} etapas',
  letraBloqueada: ' - bloqueada',
  letraProxima: ' - a próxima',
  abrirLicao: 'Abrir a lição de {nome}',
  checkpointRotulo: 'Checkpoint',
  abrirCheckpoint: (n: number) => `Abrir o checkpoint do módulo ${n}`,
  checkpointAprovado: (nota: number | null) => nota != null ? ` - aprovado com ${nota}%` : ' - aprovado',
  checkpointPronto: ' - pronto para fazer',
  checkpointDepois: ' - melhor depois das lições do módulo',
  metaAlcancada: '✓ Meta alcançada: ',
  meta: 'Meta: ',

  /* o desafio final */
  aprovado: 'Aprovado',
  disponivel: 'Disponível',
  abreQuando: 'Abre quando você concluir as lições das 22 letras',
  finalFeito: 'Você passou no exame final. O seu certificado do curso está pronto.',
  finalFalta: 'Um exame com as letras, os sons, as sílabas, palavras, frases e palavras sem nikud. No fim, o certificado do curso.',

  /* o próximo passo, no topo (28/10/2026) */
  proximoPasso: 'Seu próximo passo',
  continuar: 'Continuar',
  comecar: 'Começar',
  aula0Curto: 'Aula 0',
  licaoDe: (nome: string) => `A lição de ${nome}`,
  checkpointDo: (n: number) => `O checkpoint do módulo ${n}`,
  faltaSoCheckpoint: 'As letras deste módulo estão feitas. Falta só o checkpoint para abrir o próximo lugar.',
  faltamLicoes: (n: number) => (n === 1 ? 'Falta 1 lição para fechar o caminho.' : `Faltam ${n} lições para fechar o caminho.`),
  dominarAntes: (nome: string) => `Revisar a lição de ${nome}`,
  dominarDetalhe: (regra: string) => `O desafio final abre com todas as letras dominadas: ${regra}.`,
  certificadoPronto: 'O seu certificado está pronto',
  verCertificado: 'Ver o certificado',

  /* o caminho */
  reler: 'reler',
  moduloLugar: (n: number) => `Módulo ${n}`,
  chegada: 'A chegada',

  naoEncontrado: 'Mapa não encontrado.',
  lugarNovo: 'Lugar novo',
  lugarNovoAberto: (lugar: string) => `Lugar novo aberto: ${lugar}.`,
} as const;

const en: Traducao<typeof pt> = {
  meuCurso: 'My course',
  resumo: '{modulos} modules · {licoes} lessons · {letras} letters',
  concluido: 'complete',

  tagConcluido: 'Complete',
  comeceAqui: 'Start here',
  aula0Rotulo: 'Lesson 0 · before the first letter',
  comoFunciona: 'How Hebrew works',
  aula0Feita: 'The reading direction, the alphabet and nikud. It stays here for you to reread whenever you like.',
  aula0Falta: 'The reading direction, the alphabet, nikud and how the course works. It ends with a short check, and then Aleph opens.',

  emAndamento: 'In progress',
  faltaCheckpoint: 'Checkpoint to go',
  abreDepoisAula0: 'Opens after Lesson 0',
  abreDepoisModulo: 'Opens after module {n}',
  moduloLicoes: (n: number, licoes: number) => `Module ${n} · ${licoes} ${licoes === 1 ? 'lesson' : 'lessons'}`,
  letraConcluida: ' - completed',
  letraEtapas: ' - {n} of {total} stages',
  letraBloqueada: ' - locked',
  letraProxima: ' - up next',
  abrirLicao: 'Open the lesson for {nome}',
  checkpointRotulo: 'Checkpoint',
  abrirCheckpoint: (n: number) => `Open the module ${n} checkpoint`,
  checkpointAprovado: (nota: number | null) => nota != null ? ` - passed with ${nota}%` : ' - passed',
  checkpointPronto: ' - ready to take',
  checkpointDepois: ' - best after the module lessons',
  metaAlcancada: '✓ Goal reached: ',
  meta: 'Goal: ',

  aprovado: 'Passed',
  disponivel: 'Available',
  abreQuando: 'Opens when you complete the lessons for the 22 letters',
  finalFeito: 'You passed the final exam. Your course certificate is ready.',
  finalFalta: 'An exam with the letters, the sounds, syllables, words, sentences and words without nikud. At the end, the course certificate.',

  proximoPasso: 'Your next step',
  continuar: 'Continue',
  comecar: 'Start',
  aula0Curto: 'Lesson 0',
  licaoDe: (nome: string) => `The ${nome} lesson`,
  checkpointDo: (n: number) => `The module ${n} checkpoint`,
  faltaSoCheckpoint: 'The letters in this module are done. Only the checkpoint is left to open the next place.',
  faltamLicoes: (n: number) => (n === 1 ? '1 lesson left to finish the path.' : `${n} lessons left to finish the path.`),
  dominarAntes: (nome: string) => `Review the ${nome} lesson`,
  dominarDetalhe: (regra: string) => `The final challenge opens once every letter is mastered: ${regra}.`,
  certificadoPronto: 'Your certificate is ready',
  verCertificado: 'See the certificate',

  reler: 'reread',
  moduloLugar: (n: number) => `Module ${n}`,
  chegada: 'The finish line',

  naoEncontrado: 'Map not found.',
  lugarNovo: 'New place',
  lugarNovoAberto: (lugar: string) => `New place unlocked: ${lugar}.`
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
