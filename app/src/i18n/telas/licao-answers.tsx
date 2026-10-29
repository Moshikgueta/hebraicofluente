import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* components/learn/Answers.tsx */
const pt = {
  toqueNumSinal: 'toque num sinal para montar',
  deveSoar: (som: string) => `deve soar “${som}”`,
  sinal: (n: number) => `Sinal ${n}`,
  palavraEmConstrucao: 'Palavra em construção',
  toqueNasPecas: 'toque ou arraste as peças na ordem - a primeira letra fica à direita',
  tirarPeca: (n: number) => `Tirar a peça ${n}`,
  conferir: 'Conferir',
  recomecar: 'Recomeçar',
  soa: (dica: string) => `soa “${dica}”`,
  avisoDeErro: (n: number, esperada: string, posta: string) =>
    `A ${n}ª letra, contando da direita, é ${esperada} - você pôs ${posta}. As letras certas ficaram; continue dali.`,
  querDizer: (pt: ReactNode): ReactNode => <>Quer dizer {pt}</>,
  aMaoCurto: 'as letras estão escritas à mão',
  aMao: 'As letras estão escritas à mão.',
  emConstrucao: (feitas: number, total: number) => `Palavra em construção: ${feitas} de ${total} letras`,
  toqueNasLetras: 'toque ou arraste as letras na ordem - a primeira fica à direita',
  tirarLetra: (n: number) => `Tirar a letra ${n}`,
  letrasParaMontar: 'Letras para montar',
  letra: (g: string) => `Letra ${g}`,
  mostrarResposta: 'Mostrar a resposta',
  respostaEmHebraico: 'Sua resposta, em hebraico',
  digiteAqui: 'digite aqui, em hebraico',
  latino:
    'Isso chegou em letras latinas: o teclado ainda está em português. Troque para o hebraico (o globo ou a tecla de idioma) e digite de novo.',
  oCertoEra: (he: ReactNode): ReactNode => <>O certo era {he}.</>,
  escolhido: (valor: string) => `Escolhido: ${valor}. Agora escolha o par na outra coluna.`,
  parCerto: (a: string, b: string, faltam: number) =>
    `Par certo: ${a} com ${b}.` + (faltam > 0 ? ` Faltam ${faltam}.` : ' Todos ligados.'),
  naoCombinam: (a: string, b: string) => `Não combinam: ${a} e ${b}. Tente outro par.`,
  ligadoA: (a: string, b: string) => `${a}, ligado a ${b}`,
  /** O idioma de quem digita a transliteração na caixa. */
  campoLang: 'pt-BR',
  suaResposta: 'Sua resposta',
  voceEscreveu: (escrito: ReactNode, certo: ReactNode, extra: ReactNode): ReactNode =>
    <>Você escreveu {escrito}. O certo era {certo}{extra}.</>,
  precisaDica: 'Precisa de uma dica?',
  maisUmaDica: 'Mais uma dica',
  ouvir: 'Ouvir'
} as const;

const en: Traducao<typeof pt> = {
  toqueNumSinal: 'tap a sign to build it',
  deveSoar: som => `should sound “${som}”`,
  sinal: n => `Sign ${n}`,
  palavraEmConstrucao: 'Word being built',
  toqueNasPecas: 'tap or drag the pieces in order - the first letter goes on the right',
  tirarPeca: n => `Remove piece ${n}`,
  conferir: 'Check',
  recomecar: 'Start over',
  soa: dica => `sounds “${dica}”`,
  avisoDeErro: (n, esperada, posta) =>
    `Letter number ${n}, counting from the right, is ${esperada} - you put ${posta}. The correct letters stayed; carry on from there.`,
  querDizer: pt => <>It means {pt}</>,
  aMaoCurto: 'the letters are handwritten',
  aMao: 'The letters are handwritten.',
  emConstrucao: (feitas, total) => `Word being built: ${feitas} of ${total} letters`,
  toqueNasLetras: 'tap or drag the letters in order - the first one goes on the right',
  tirarLetra: n => `Remove letter ${n}`,
  letrasParaMontar: 'Letters to build with',
  letra: g => `Letter ${g}`,
  mostrarResposta: 'Show the answer',
  respostaEmHebraico: 'Your answer, in Hebrew',
  digiteAqui: 'type here, in Hebrew',
  latino:
    'That came in as Latin letters: the keyboard is still in English. Switch to Hebrew (the globe or the language key) and type again.',
  oCertoEra: he => <>The correct answer was {he}.</>,
  escolhido: valor => `Selected: ${valor}. Now choose its pair in the other column.`,
  parCerto: (a, b, faltam) =>
    `Correct pair: ${a} with ${b}.` + (faltam > 0 ? ` ${faltam} to go.` : ' All matched.'),
  naoCombinam: (a, b) => `Not a match: ${a} and ${b}. Try another pair.`,
  ligadoA: (a, b) => `${a}, matched with ${b}`,
  campoLang: 'en-US',
  suaResposta: 'Your answer',
  voceEscreveu: (escrito, certo, extra) =>
    <>You wrote {escrito}. The correct answer was {certo}{extra}.</>,
  precisaDica: 'Need a hint?',
  maisUmaDica: 'One more hint',
  ouvir: 'Listen'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
