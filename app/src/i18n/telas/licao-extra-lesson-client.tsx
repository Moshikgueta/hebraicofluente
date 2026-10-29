import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* app/extra/[slug]/ExtraLessonClient.tsx */
const pt = {
  ondeVemOPonto: 'Onde vem o ponto?',
  asFinais: 'As finais',
  semNikud: 'Sem nikud',
  oGueresh: 'O guéresh',
  ler: 'Ler',
  fecho: 'Fecho',
  modulo: (n: number) => `← Módulo ${n}`,
  badge: (n: number, licao: number | undefined) => `Módulo ${n} · lição ${licao}`,
  etapas: 'Etapas do módulo',
  etapaDe: (n: number, rotulo: string) => `Etapa ${n} de 3 - ${rotulo}`,
  proximoModulo: (n: number, titulo: string) => `Módulo ${n} - ${titulo}`,
  desafioFinal: 'Ir para o desafio final',
  fechoDoAlfabeto: 'Fecho do alfabeto',
  semPontoImpresso: 'Sem o ponto impresso',
  licao21: 'Lição 21 concluída',
  decideOSom: 'Você decide o som pelo lugar da letra.',
  emTodaPalavra: 'É o que vai fazer em toda palavra sem pontos. Agora as cinco formas finais, juntas.',
  continuarFinais: 'Continuar para as formas finais',
  praticarDeNovo: 'Praticar de novo',
  ondeAparece: 'Onde o ponto aparece?',
  doisLados: (b: ReactNode, k: ReactNode, p: ReactNode): ReactNode =>
    <>Você já conhece os dois lados de {b}, {k} e {p}. Mas fora do livro o ponto quase nunca é impresso. Então a pergunta muda: sem ver o ponto, como saber o som? Pelo lugar da letra na palavra.</>,
  aRegra: 'A regra',
  semOPonto: 'sem o ponto: V, CH, F',
  comOPonto: 'com o ponto: B, K, P',
  eAsFinais: 'E as formas finais',
  finaisSemPonto: (chaf: ReactNode, fe: ReactNode): ReactNode =>
    <>{chaf} e {fe} nunca levam o ponto: no fim da palavra, são sempre CH e F.</>,
  regraNaoBasta: 'Quando a regra não basta',
  dobra:
    'Em algumas palavras o ponto aparece depois de vogal. Ali ele não muda só o som: ele dobra a consoante, e o som fica o forte. Essas palavras se aprendem de ouvido e de leitura, uma a uma.',
  shva: (a: ReactNode, b: ReactNode): ReactNode =>
    <>E depois de uma letra com shva no começo da palavra (ou de um prefixo) a regra também falha: ali a letra fica sem o ponto, e o som é o suave, como em {a} (bevakashá) e {b} (kvar).</>,
  naoEDetalhe: 'Isto não é detalhe de acabamento',
  praticarSemPonto: 'Praticar: ler sem o ponto impresso',
  cincoFinais: 'As cinco formas finais',
  conheceuCada:
    'Você conheceu cada uma junto com a sua letra. Aqui elas estão juntas pela primeira vez - e é assim, em bloco, que elas se fixam.',
  atalho: 'O atalho visual',
  descem: (quatro: ReactNode, uma: ReactNode): ReactNode =>
    <>Quatro das cinco descem abaixo da linha - {quatro} - e só {uma} fecha em cima. Se desceu, é fim de palavra.</>,
  outroDesenho: 'Outro desenho, a mesma letra',
  final1: 'Cinco letras mudam de forma quando aparecem no fim da palavra.',
  final2: 'Muda só o desenho: o nome e o som da letra continuam os mesmos.',
  final3: 'A forma final não é uma letra a mais. O alfabeto continua tendo 22 letras.',
  final4: 'Na leitura, o que importa é reconhecer a forma final quando ela aparece.',
  continuarSemNikud: 'Continuar - ler sem nikud',
  memOuNunTitulo: 'ם ou ן? O M e o N do fim da palavra',
  memOuNun: (mem: ReactNode, em: ReactNode, nun: ReactNode, min: ReactNode): ReactNode =>
    <>Em português, o fim de &quot;bem&quot; não é um M de verdade: os lábios não se fecham, e o som fica nasal. Em hebraico, o fim conta. {mem} é o M, com os lábios fechados no fim, como em {em} (em, mãe). {nun} é o N, com a língua atrás dos dentes e a boca aberta, como em {min} (min, de). São duas letras diferentes, mem e nun, e cada uma tem a sua forma final.</>,
  escuteDiferenca: 'Escute a diferença: português × hebraico',
  oucaProfessor:
    'Ouça como o professor diz "bem" em português e as palavras em hebraico: preste atenção nos lábios no fim de cada uma.',
  agoraVoce: 'Agora você: ouça cada palavra e diga como ela termina.',
  ouvir: 'Ouvir',
  ouvirPalavra: (translit: string) => `Ouvir a palavra ${translit}`,
  comoTermina: 'Como a palavra termina?',
  isso: 'Isso. ',
  nao: 'Não: ',
  termina: (translit: string, sentido: string, mem: boolean) =>
    `${translit} (${sentido}) termina em ${mem
      ? 'ם, um M: os lábios se fecham no fim.'
      : 'ן, um N: a língua toca atrás dos dentes, e os lábios ficam abertos.'}`,
  fechoModulo6: 'Módulo 6 - fecho',
  lerSemNikud: 'Ler sem nikud',
  grupo: (i: number, total: number, palavras: number) => `${i} de ${total} · ${palavras} palavras`,
  prontoFecho: 'Estou pronto - fazer o fecho do módulo',
  umaQueEDuas: 'E uma que é duas',
  conferir: 'Conferir',
  sonsModernos: 'Os sons modernos',
  oSinal: 'O sinal',
  tresSons:
    'Estes três sons quase só aparecem em nomes próprios e em palavras importadas - que é exatamente onde um brasileiro mais acerta, porque já sabe como elas soam.',
  continuarPalavras: 'Continuar - ler as palavras',
  leiaEConfira: 'Leia e confira',
  todasAsPalavras:
    'Todas as palavras desta página você já conhece em português. Leia cada uma em voz alta antes de olhar o significado.',
  continuarFecho: 'Continuar para o fecho',
  kicker: (n: number, certas: number, total: number, pct: number) => `Módulo ${n} · ${certas} de ${total} · ${pct}%`,
  concluido: 'Módulo concluído.',
  repetir: 'Vale repetir antes de seguir.',
  separa: 'Este é o módulo que separa quem decora de quem lê.',
  semPressa: 'Sem pressa e sem penalidade - refaça e veja o que ainda escapa.',
  refazer: 'Refazer'
} as const;

const en: Traducao<typeof pt> = {
  ondeVemOPonto: 'Where does the dot go?',
  asFinais: 'The finals',
  semNikud: 'No nikud',
  oGueresh: 'The geresh',
  ler: 'Read',
  fecho: 'Wrap-up',
  modulo: n => `← Module ${n}`,
  badge: (n, licao) => `Module ${n} · lesson ${licao}`,
  etapas: 'Module steps',
  etapaDe: (n, rotulo) => `Step ${n} of 3 - ${rotulo}`,
  proximoModulo: (n, titulo) => `Module ${n} - ${titulo}`,
  desafioFinal: 'Go to the final challenge',
  fechoDoAlfabeto: 'Alphabet wrap-up',
  semPontoImpresso: 'Without the printed dot',
  licao21: 'Lesson 21 complete',
  decideOSom: 'You decide the sound by where the letter sits.',
  emTodaPalavra: 'That is what you will do in every word without points. Now the five final forms, together.',
  continuarFinais: 'Continue to the final forms',
  praticarDeNovo: 'Practice again',
  ondeAparece: 'Where does the dot appear?',
  doisLados: (b, k, p) =>
    <>You already know both sides of {b}, {k} and {p}. But outside the textbook the dot is almost never printed. So the question changes: without seeing the dot, how do you know the sound? By where the letter sits in the word.</>,
  aRegra: 'The rule',
  semOPonto: 'without the dot: V, CH, F',
  comOPonto: 'with the dot: B, K, P',
  eAsFinais: 'And the final forms',
  finaisSemPonto: (chaf, fe) =>
    <>{chaf} and {fe} never take the dot: at the end of a word, they are always CH and F.</>,
  regraNaoBasta: 'When the rule is not enough',
  dobra:
    'In some words the dot appears after a vowel. There it does not just change the sound: it doubles the consonant, and the sound is the hard one. These words are learned by ear and by reading, one by one.',
  shva: (a, b) =>
    <>And after a letter with shva at the start of a word (or after a prefix) the rule also fails: there the letter has no dot, and the sound is the soft one, as in {a} (bevakasha) and {b} (kvar).</>,
  naoEDetalhe: 'This is not a finishing detail',
  praticarSemPonto: 'Practice: reading without the printed dot',
  cincoFinais: 'The five final forms',
  conheceuCada:
    'You met each one together with its letter. Here they are together for the first time - and seeing them as a group is how they stick.',
  atalho: 'The visual shortcut',
  descem: (quatro, uma) =>
    <>Four of the five drop below the line - {quatro} - and only {uma} closes at the top. If it drops, it is the end of a word.</>,
  outroDesenho: 'A different shape, the same letter',
  final1: 'Five letters change shape when they appear at the end of a word.',
  final2: 'Only the shape changes: the letter keeps its name and its sound.',
  final3: 'A final form is not an extra letter. The alphabet still has 22 letters.',
  final4: 'When reading, what matters is recognizing the final form when it appears.',
  continuarSemNikud: 'Continue - reading without nikud',
  memOuNunTitulo: 'ם or ן? The M and the N at the end of a word',
  // etapa 3: pronúncia, rever
  memOuNun: (mem, em, nun, min) =>
    <>In English you already close your lips for a final M, as in &quot;him&quot;, and keep them open for a final N, as in &quot;pin&quot;. Hebrew works the same way, and the ending counts. {mem} is the M, with the lips closed at the end, as in {em} (em, mother). {nun} is the N, with the tongue behind the teeth and the mouth open, as in {min} (min, from). They are two different letters, mem and nun, and each has its own final form.</>,
  // etapa 3: pronúncia, rever
  escuteDiferenca: 'Hear the difference: Portuguese × Hebrew',
  // etapa 3: pronúncia, rever
  oucaProfessor:
    'Listen to how the teacher says "bem" in Portuguese and the words in Hebrew: pay attention to the lips at the end of each one.',
  agoraVoce: 'Now you: listen to each word and say how it ends.',
  ouvir: 'Listen',
  ouvirPalavra: translit => `Listen to the word ${translit}`,
  comoTermina: 'How does the word end?',
  isso: 'That\'s it. ',
  nao: 'No: ',
  termina: (translit, sentido, mem) =>
    `${translit} (${sentido}) ends in ${mem
      ? 'ם, an M: the lips close at the end.'
      : 'ן, an N: the tongue touches behind the teeth, and the lips stay open.'}`,
  fechoModulo6: 'Module 6 - wrap-up',
  lerSemNikud: 'Reading without nikud',
  grupo: (i, total, palavras) => `${i} of ${total} · ${palavras} words`,
  prontoFecho: 'I\'m ready - do the module wrap-up',
  umaQueEDuas: 'And one that is two',
  conferir: 'Check',
  sonsModernos: 'The modern sounds',
  oSinal: 'The sign',
  // etapa 3: pronúncia, rever
  tresSons:
    'These three sounds appear almost only in proper names and borrowed words - which is exactly where you get them right most easily, because you already know how those words sound.',
  continuarPalavras: 'Continue - reading the words',
  leiaEConfira: 'Read and check',
  todasAsPalavras:
    'You already know every word on this page in English. Read each one aloud before looking at the meaning.',
  continuarFecho: 'Continue to the wrap-up',
  kicker: (n, certas, total, pct) => `Module ${n} · ${certas} of ${total} · ${pct}%`,
  concluido: 'Module complete.',
  repetir: 'Worth repeating before moving on.',
  separa: 'This is the module that separates memorizing from reading.',
  semPressa: 'No rush and no penalty - redo it and see what still slips past you.',
  refazer: 'Try again'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
