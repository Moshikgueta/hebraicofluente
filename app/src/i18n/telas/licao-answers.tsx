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
  ouvir: 'Ouvir',
  cacaAchou: (n: number, total: number) => `Achou ${n} de ${total}.`,
  cacaCelula: (k: number) => `Letra ${k}`,
  igualSim: 'Sim, é igual',
  igualNao: 'Não, é diferente'
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
  ouvir: 'Listen',
  cacaAchou: (n, total) => `Found ${n} of ${total}.`,
  cacaCelula: k => `Letter ${k}`,
  igualSim: 'Yes, the same',
  igualNao: 'No, different'
};

const es: Traducao<typeof pt> = {
  toqueNumSinal: 'toca un signo para armar',
  deveSoar: som => `debe sonar “${som}”`,
  sinal: n => `Signo ${n}`,
  palavraEmConstrucao: 'Palabra en construcción',
  toqueNasPecas: 'toca o arrastra las piezas en orden - la primera letra va a la derecha',
  tirarPeca: n => `Quitar la pieza ${n}`,
  conferir: 'Comprobar',
  recomecar: 'Empezar de nuevo',
  soa: dica => `suena “${dica}”`,
  avisoDeErro: (n, esperada, posta) =>
    `La letra número ${n}, contando desde la derecha, es ${esperada} - pusiste ${posta}. Las letras correctas se quedaron; sigue desde ahí.`,
  querDizer: pt => <>Quiere decir {pt}</>,
  aMaoCurto: 'las letras están escritas a mano',
  aMao: 'Las letras están escritas a mano.',
  emConstrucao: (feitas, total) => `Palabra en construcción: ${feitas} de ${total} letras`,
  toqueNasLetras: 'toca o arrastra las letras en orden - la primera va a la derecha',
  tirarLetra: n => `Quitar la letra ${n}`,
  letrasParaMontar: 'Letras para armar',
  letra: g => `Letra ${g}`,
  mostrarResposta: 'Mostrar la respuesta',
  respostaEmHebraico: 'Tu respuesta, en hebreo',
  digiteAqui: 'escribe aquí, en hebreo',
  latino:
    'Esto llegó en letras latinas: el teclado todavía está en español. Cámbialo al hebreo (el globo o la tecla de idioma) y escribe de nuevo.',
  oCertoEra: he => <>La respuesta correcta era {he}.</>,
  escolhido: valor => `Elegido: ${valor}. Ahora elige su pareja en la otra columna.`,
  parCerto: (a, b, faltam) =>
    `Pareja correcta: ${a} con ${b}.` + (faltam > 0 ? ` Faltan ${faltam}.` : ' Todas unidas.'),
  naoCombinam: (a, b) => `No combinan: ${a} y ${b}. Prueba otra pareja.`,
  ligadoA: (a, b) => `${a}, unido a ${b}`,
  campoLang: 'es',
  suaResposta: 'Tu respuesta',
  voceEscreveu: (escrito, certo, extra) =>
    <>Escribiste {escrito}. La respuesta correcta era {certo}{extra}.</>,
  precisaDica: '¿Necesitas una pista?',
  maisUmaDica: 'Una pista más',
  ouvir: 'Escuchar',
  cacaAchou: (n, total) => `Encontraste ${n} de ${total}.`,
  cacaCelula: k => `Letra ${k}`,
  igualSim: 'Sí, es igual',
  igualNao: 'No, es diferente'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
