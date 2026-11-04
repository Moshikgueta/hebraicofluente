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

const es: Traducao<typeof pt> = {
  ondeVemOPonto: '¿Dónde va el punto?',
  asFinais: 'Las finales',
  semNikud: 'Sin nikud',
  oGueresh: 'El guéresh',
  ler: 'Leer',
  fecho: 'Cierre',
  modulo: n => `← Módulo ${n}`,
  badge: (n, licao) => `Módulo ${n} · lección ${licao}`,
  etapas: 'Etapas del módulo',
  etapaDe: (n, rotulo) => `Etapa ${n} de 3 - ${rotulo}`,
  proximoModulo: (n, titulo) => `Módulo ${n} - ${titulo}`,
  desafioFinal: 'Ir al desafío final',
  fechoDoAlfabeto: 'Cierre del alfabeto',
  semPontoImpresso: 'Sin el punto impreso',
  licao21: 'Lección 21 completada',
  decideOSom: 'Decides el sonido por el lugar de la letra.',
  emTodaPalavra: 'Es lo que vas a hacer en toda palabra sin puntos. Ahora las cinco formas finales, juntas.',
  continuarFinais: 'Continuar a las formas finales',
  praticarDeNovo: 'Practicar de nuevo',
  ondeAparece: '¿Dónde aparece el punto?',
  doisLados: (b, k, p) =>
    <>Ya conoces los dos lados de {b}, {k} y {p}. Pero fuera del libro el punto casi nunca se imprime. Entonces la pregunta cambia: sin ver el punto, ¿cómo saber el sonido? Por el lugar de la letra en la palabra.</>,
  aRegra: 'La regla',
  semOPonto: 'sin el punto: V, J, F',
  comOPonto: 'con el punto: B, K, P',
  eAsFinais: 'Y las formas finales',
  finaisSemPonto: (chaf, fe) =>
    <>{chaf} y {fe} nunca llevan el punto: al final de la palabra, son siempre J y F.</>,
  regraNaoBasta: 'Cuando la regla no alcanza',
  dobra:
    'En algunas palabras el punto aparece después de una vocal. Ahí no cambia solo el sonido: duplica la consonante, y el sonido queda fuerte. Estas palabras se aprenden de oído y leyendo, una por una.',
  shva: (a, b) =>
    <>Y después de una letra con shvá al comienzo de la palabra (o de un prefijo) la regla también falla: ahí la letra queda sin el punto, y el sonido es el suave, como en {a} (bevakashá) y {b} (kvar).</>,
  naoEDetalhe: 'Esto no es un detalle de acabado',
  praticarSemPonto: 'Practicar: leer sin el punto impreso',
  cincoFinais: 'Las cinco formas finales',
  conheceuCada:
    'Conociste cada una junto con su letra. Aquí están juntas por primera vez - y es así, en bloque, como se fijan.',
  atalho: 'El atajo visual',
  descem: (quatro, uma) =>
    <>Cuatro de las cinco bajan por debajo de la línea - {quatro} - y solo {uma} cierra arriba. Si bajó, es final de palabra.</>,
  outroDesenho: 'Otro dibujo, la misma letra',
  final1: 'Cinco letras cambian de forma cuando aparecen al final de la palabra.',
  final2: 'Cambia solo el dibujo: el nombre y el sonido de la letra siguen siendo los mismos.',
  final3: 'La forma final no es una letra más. El alfabeto sigue teniendo 22 letras.',
  final4: 'Al leer, lo que importa es reconocer la forma final cuando aparece.',
  continuarSemNikud: 'Continuar - leer sin nikud',
  memOuNunTitulo: '¿ם o ן? La M y la N del final de la palabra',
  // etapa 3: pronúncia, rever
  memOuNun: (mem, em, nun, min) =>
    <>En español casi ninguna palabra termina en M, y la N final se dice con la lengua arriba y los labios abiertos, como en &quot;pan&quot;. En hebreo el final cuenta, y las dos existen. {mem} es la M, con los labios cerrados al final, como en {em} (em, madre). {nun} es la N, con la lengua detrás de los dientes y la boca abierta, como en {min} (min, de). Son dos letras diferentes, mem y nun, y cada una tiene su forma final.</>,
  // etapa 3: pronúncia, rever
  escuteDiferenca: 'Escucha la diferencia: portugués × hebreo',
  // etapa 3: pronúncia, rever
  oucaProfessor:
    'Escucha cómo el profesor dice "bem" en portugués y las palabras en hebreo: presta atención a los labios al final de cada una.',
  agoraVoce: 'Ahora tú: escucha cada palabra y di cómo termina.',
  ouvir: 'Escuchar',
  ouvirPalavra: translit => `Escuchar la palabra ${translit}`,
  comoTermina: '¿Cómo termina la palabra?',
  isso: 'Eso es. ',
  nao: 'No: ',
  termina: (translit, sentido, mem) =>
    `${translit} (${sentido}) termina en ${mem
      ? 'ם, una M: los labios se cierran al final.'
      : 'ן, una N: la lengua toca detrás de los dientes, y los labios quedan abiertos.'}`,
  fechoModulo6: 'Módulo 6 - cierre',
  lerSemNikud: 'Leer sin nikud',
  grupo: (i, total, palavras) => `${i} de ${total} · ${palavras} palabras`,
  prontoFecho: 'Estoy listo - hacer el cierre del módulo',
  umaQueEDuas: 'Y una que es dos',
  conferir: 'Comprobar',
  sonsModernos: 'Los sonidos modernos',
  oSinal: 'El signo',
  // etapa 3: pronúncia, rever
  tresSons:
    'Estos tres sonidos aparecen casi solo en nombres propios y en palabras tomadas de otros idiomas - que es justo donde más fácil aciertas, porque ya sabes cómo suenan esas palabras.',
  continuarPalavras: 'Continuar - leer las palabras',
  leiaEConfira: 'Lee y comprueba',
  todasAsPalavras:
    'Ya conoces en español todas las palabras de esta página. Lee cada una en voz alta antes de mirar el significado.',
  continuarFecho: 'Continuar al cierre',
  kicker: (n, certas, total, pct) => `Módulo ${n} · ${certas} de ${total} · ${pct}%`,
  concluido: 'Módulo completado.',
  repetir: 'Vale la pena repetir antes de seguir.',
  separa: 'Este es el módulo que separa a quien memoriza de quien lee.',
  semPressa: 'Sin prisa y sin penalización - rehazlo y mira lo que todavía se te escapa.',
  refazer: 'Volver a intentarlo'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
