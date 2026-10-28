import type { Traducao } from '..';

/* app/meu-nome/MeuNomeClient.tsx e app/meu-nome/page.tsx */
const pt = {
  metaTitulo: 'Meu nome em hebraico - Hebraico Fluente',
  metaDescricao: 'Escreva o seu nome em hebraico, em letra impressa e à mão.',

  bonus: 'Bônus',
  titulo: 'Agora escreva o seu nome em hebraico',
  intro: 'Com as letras que você aprendeu. Nome não tem grafia única em hebraico - o curso sugere, e quem decide é você.',
  passoNome: '1 · O seu nome',
  comoSeChama: 'Como você se chama? Pode ser só o primeiro nome.',
  faltamLetras: (n: number, nome: string) =>
    `Faltam ${n} ${n === 1 ? 'letra' : 'letras'} para escrever “${nome}”. `
    + 'Elas chegam nas próximas lições - e este bônus fica esperando por você.',
  semSugestao: 'Não consegui sugerir uma grafia para esse nome. Tente escrevê-lo sem símbolos.',
  passoGrafia: '2 · A grafia',
  maisDeUmJeito: 'Há mais de um jeito comum de escrever. Escolha o que soa como o seu nome:',
  grafiasSugeridas: 'Grafias sugeridas',
  querAjustar: 'Quer ajustar? Toque numa letra para tirá-la e nas de baixo para pôr. Ela aparece da direita para a esquerda, como se lê.',
  passoVer: '3 · O seu nome, nas duas escritas',
  impressa: 'Impressa',
  aMao: 'À mão',
  confirmado: '✓ Confirmado',
  confirmar: 'É assim que eu escrevo o meu nome',
  ficaGuardado: 'Fica guardado na sua conta, e o certificado pode usá-lo.',
  voltarPainel: 'Voltar ao painel',

  passoEscrever: '4 · Escreva à mão',
  qualPalavra: 'Qual palavra praticar',
  escrevaAMao: (palavra: string) => `Escreva ${palavra} à mão`,
  comecePelaDireita: 'Comece pela direita, como se lê.',
  passeODedo: 'Passe o dedo por cima do modelo.',
  semModelo: 'Agora sem modelo.',
  conferir: 'Conferir',
  limpar: 'Limpar',
  tentarSemModelo: 'Tentar sem o modelo',
  voltarModelo: 'Voltar ao modelo'
} as const;

const en: Traducao<typeof pt> = {
  metaTitulo: 'My name in Hebrew - Hebraico Fluente',
  metaDescricao: 'Write your name in Hebrew, in print and by hand.',

  bonus: 'Bonus',
  titulo: 'Now write your name in Hebrew',
  intro: 'With the letters you have learned. A name has no single spelling in Hebrew - the course suggests, and you decide.',
  passoNome: '1 · Your name',
  comoSeChama: 'What is your name? Just your first name is fine.',
  faltamLetras: (n, nome) =>
    `${n} more ${n === 1 ? 'letter' : 'letters'} to write “${nome}”. `
    + 'They come in the next lessons - and this bonus will be waiting for you.',
  semSugestao: 'I could not suggest a spelling for that name. Try writing it without symbols.',
  passoGrafia: '2 · The spelling',
  maisDeUmJeito: 'There is more than one common way to write it. Choose the one that sounds like your name:',
  grafiasSugeridas: 'Suggested spellings',
  querAjustar: 'Want to adjust it? Tap a letter to remove it and the ones below to add. It runs from right to left, the way it is read.',
  passoVer: '3 · Your name, in both scripts',
  impressa: 'Print',
  aMao: 'Handwritten',
  confirmado: '✓ Confirmed',
  confirmar: 'This is how I write my name',
  ficaGuardado: 'It is saved in your account, and the certificate can use it.',
  voltarPainel: 'Back to the dashboard',

  passoEscrever: '4 · Write it by hand',
  qualPalavra: 'Which word to practice',
  escrevaAMao: palavra => `Write ${palavra} by hand`,
  comecePelaDireita: 'Start from the right, the way it is read.',
  passeODedo: 'Trace over the model with your finger.',
  semModelo: 'Now without the model.',
  conferir: 'Check',
  limpar: 'Clear',
  tentarSemModelo: 'Try without the model',
  voltarModelo: 'Back to the model'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
