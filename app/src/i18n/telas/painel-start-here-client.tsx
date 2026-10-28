import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* app/inicio/StartHereClient.tsx - a Aula 0 ("Como o alfabeto hebraico
   funciona"). As perguntas das duas checagens moram em
   painel-start-here-perguntas.ts.

   Frase com um pedaço em <He> ou um link no meio é função: o hebraico entra
   como argumento, já dentro do <He>, e nunca é escrito aqui. `F` é o mesmo
   <strong> que a tela usava. */
const F = ({ children }: { children: ReactNode }) =>
  <strong className="font-semibold text-ink">{children}</strong>;

type Pedaco = ReactNode;
type Marca = (s: string) => ReactNode;

const pt = {
  voltarMapa: '← Mapa',
  badge: 'Aula 0 · antes da primeira letra',
  titulo: 'Como o alfabeto hebraico funciona?',
  lead: 'Dez minutos de leitura, sem nada para decorar. A ideia é você entender a lógica da escrita antes de aprender a primeira letra - depois disso, cada lição vai parecer muito mais simples.',
  indiceTitulo: 'O que tem nesta página?',
  abreComClique: 'Cada parte abre com um clique no título.',

  /* o índice; os mesmos textos dão título às partes onde eles coincidem */
  iSistema: 'Não é o mesmo sistema do português',
  iComparacao: 'Uma comparação para sentir a diferença',
  iVogais: 'Então onde estão as vogais?',
  iNikud: 'O nikud, os pontinhos das vogais',
  iChecagemNikud: 'Checagem: entendeu o nikud?',
  iQuatro: 'Quatro letras especiais',
  iDirecao: 'Da direita para a esquerda',
  iDuas: 'Quando a linha tem duas direções',
  iMaiuscula: 'Maiúscula, formas finais e "letra muda"',
  iCursiva: 'Impressa e cursiva: dois desenhos',
  iQueHebraico: 'Que hebraico é este?',
  iCaminho: 'O caminho, do início ao fim',
  iAtividade: 'Checagem final: dezessete perguntas',
  iComoFunciona: 'Como este curso funciona',

  /* 1 · o sistema */
  sistemaP1: 'Em português, consoantes e vogais são letras do mesmo tipo, e a gente escreve todas em fila:',
  palavraCasa: 'CASA',
  casaLegenda: (v: Marca) => <>C {v('A')} S{' '}{v('A')} - duas consoantes e duas vogais, todas escritas</>,
  sistemaP2: () => <>O hebraico organiza isso de outro jeito: <F>as letras representam principalmente as consoantes</F>, e os sons de vogal são marcados por fora delas - ou, em muitos textos, nem são marcados.</>,
  sistemaP3: () => <>Um sistema de escrita assim tem nome: <F>abjad</F>. A palavra não importa para ler nada - ela só é útil para você reconhecer o termo quando encontrar por aí. O que importa é a ideia: as letras são, em essência, as consoantes.</>,

  /* 2 · a analogia */
  comparacaoP1: () => <>Imagine que em português a gente escrevesse só <F>C S</F> e soubesse pelo contexto se ali está escrito <em>casa</em>, <em>coisa</em> ou <em>cisão</em>. Quem lê português reconheceria a palavra pelo resto da frase.</>,
  casaAria: 'CASA, que sem as vogais vira C S',
  /* As vogais passam por `v`, que as apaga e devolve na animação. */
  casaSome: (v: Marca) => <>C{v('A')}S{v('A')}</>,
  casaSobra: 'sem as vogais, sobra C S',
  comparacaoP2: () => <>Isto é só uma <F>analogia</F>, e não uma descrição do hebraico: o hebraico não é português sem vogais, e tem recursos próprios para marcar os sons - você vai ver os três logo abaixo. A comparação serve para uma coisa só: entender por que as vogais nem sempre aparecem escritas do mesmo jeito que aqui.</>,

  /* 3 · onde estão as vogais */
  vogaisP1: (shalom: Pedaco) => <>Esta é a primeira pergunta de quase todo mundo, e ela tem resposta. O hebraico <F>tem sons de vogal como qualquer língua</F> - as pessoas falam {shalom}{' '}com um &quot;a&quot; e um &quot;o&quot; bem audíveis. O que muda é a forma de representá-los na escrita, e há três:</>,
  vogal1T: 'Sinais de vogal',
  vogal1D: 'Pontos e traços colocados embaixo, dentro ou ao lado da consoante. É o nikud, explicado no quadro seguinte - e é com ele que este curso começa.',
  vogal2T: 'Algumas letras que ajudam',
  vogal2D: 'Quatro letras podem, dependendo da palavra, participar da representação de um som de vogal em vez de soar como consoante. Você as conhece daqui a pouco.',
  vogal3T: 'O contexto',
  vogal3D: 'Quem já conhece a palavra a reconhece sem nenhum sinal - que é como israelense lê jornal, placa e mensagem de celular todo dia.',
  cuidadoTitulo: 'Cuidado com esta frase',
  cuidadoP: () => <>Você vai ler por aí que <em>&quot;o hebraico não tem vogais&quot;</em>. É um resumo ruim, e atrapalha. O certo é: <F>a língua tem os sons de vogal</F>; o que o alfabeto básico não tem são letras independentes para todas elas, do jeito que o português tem A, E, I, O, U.</>,

  /* 4 · o nikud */
  tNikud: 'O nikud: os pontinhos que marcam as vogais',
  nikudP1: (nikud: Pedaco) => <><F>Nikud</F>{' '}({nikud}) é o sistema de pontos e traços colocados perto das letras para indicar os sons de vogal. A mesma palavra, com e sem eles:</>,
  comNikud: 'com nikud - dá para ler sem conhecer a palavra',
  semNikud: 'sem nikud - é assim que aparece na rua',
  nikudL1: 'Material para iniciante costuma trazer nikud - inclusive este curso, no começo.',
  nikudL2: 'Livro infantil, texto religioso e poesia também usam bastante.',
  nikudL3: 'No hebraico do dia a dia, a maior parte dos textos vem sem: placa, jornal, site, mensagem de celular.',
  gravacaoNikud: 'Consoantes, vogais e o nikud, lidos em voz alta.',
  nikudP2: 'Por isso o curso faz os dois, nesta ordem: primeiro você lê com os sinais, que é o que permite ler sem adivinhar; depois eles vão saindo aos poucos, até você ler como se lê de verdade.',
  ressalvaTitulo: 'Uma ressalva importante',
  ressalvaP: (bet: Pedaco, shin: Pedaco, sin: Pedaco, vav: Pedaco, shuruk: Pedaco) => <>Nem todo ponto que aparece dentro ou perto de uma letra é vogal. Há outros sinais que usam a mesma aparência e fazem outra coisa: o ponto dentro de{' '}{bet}, que muda o som da consoante, e o ponto que distingue {shin} de {sin}, que diz qual das duas letras está ali. Você aprende cada um no seu momento - por ora, só saiba que eles existem e não são vogais. A exceção, que você vai ver logo: o ponto no meio do {vav} ({shuruk}) é a vogal U.</>,

  /* a checagem do nikud */
  tChecagemNikud: 'Checagem: entendeu o nikud? Oito perguntas',
  checagemNikudTitulo: 'Entendeu o nikud? Oito perguntas',
  checagemNikudIntro: 'Não vale nota e não tranca nada - é só para confirmar que a ideia ficou de pé antes de seguir. Se errar, a explicação aparece na hora.',
  checagemNikudBom: 'Ótimo. Agora você já sabe o que é o nikud e por que ele aparece. Vamos entender como esses sinais funcionam na prática.',
  checagemNikudParcial: 'Vale reler o quadro acima antes de seguir - são duas ou três ideias, e elas voltam em toda lição do curso.',

  /* 6 · as quatro letras */
  tQuatro: 'Quatro letras se comportam de um jeito especial',
  quatroP1: 'Estas quatro merecem um aviso desde já:',
  quatroP2: 'Dependendo da palavra e da posição, elas podem soar como consoante, podem participar da representação de um som de vogal, ou podem aparecer sem um som consonantal claro. Não é exceção esquisita: é o resultado de a escrita hebraica ter uns bons milhares de anos, e essas letras terem sido as primeiras a ganhar essa segunda função.',
  quatroP3: () => <>Você não precisa de nenhuma regra agora. Isto está aqui para que, lá na frente, você não pense <em>&quot;mas você disse que todas as letras são consoantes&quot;</em>. Cada uma dessas quatro tem a sua lição, e é lá que o assunto é ensinado.</>,

  /* 7 · a direção */
  direcaoP1: 'O hebraico se lê e se escreve da direita para a esquerda. A primeira letra de uma palavra é a que está mais à direita - o contrário do português, e é a única coisa que você precisa desaprender.',
  bomDia: 'BOM DIA',
  comecaAquiEsq: 'começa aqui →',
  comecaAquiDir: '← começa aqui',
  direcaoP2: 'Só o hebraico corre ao contrário. A tela do curso continua em português, da esquerda para a direita: os botões, as explicações e as transliterações.',
  gravacaoDirecao: 'Como ler uma palavra da direita para a esquerda, com a palavra שָׁלוֹם.',
  direcaoP3: () => <>Os <F>números</F> são a exceção: continuam sendo escritos e lidos da esquerda para a direita, como aqui. É o que faz uma linha ter duas direções ao mesmo tempo - e o próximo quadro mostra isso acontecendo.</>,

  /* 7b · a linha com duas direções */
  duasP1: 'Número, preço, telefone, endereço de site: tudo isso continua correndo da esquerda para a direita dentro de uma linha hebraica. Não é mistura errada nem defeito - é assim que se escreve. Veja onde cada pedaço vai parar:',
  legendaTrecho: 'trecho que corre da esquerda para a direita',
  duasP2: () => <>A regra é uma só: <F>cada trecho mantém a sua própria direção</F>. O que a linha hebraica decide é a ORDEM em que os trechos entram nela - da direita para a esquerda. Por isso o número, que você lê normalmente, aparece na ponta que aqui pareceria a errada.</>,
  duasP3: 'Duas consequências práticas, para você não achar que quebrou alguma coisa. Digitando, o cursor pula de um lado para o outro quando você passa do hebraico para o número - é o normal. E copiando uma linha dessas para um lugar que não é hebraico, as peças podem aparecer noutra ordem na tela: o texto guardado continua o mesmo, só a montagem visual mudou.',
  linhaRua: 'Uma placa de rua. O nome começa na direita; o número da casa fica na ponta esquerda, e continua sendo quarenta e dois.',
  linhaOnibus: 'Um letreiro de ônibus: linha 18 para Tel Aviv. O número fica no meio, com hebraico dos dois lados - e cada lado corre para onde é dele.',
  linhaTelefone: 'Um telefone. O traço no meio não muda de lugar: o número inteiro é um bloco só, lido da esquerda para a direita.',

  /* 8, 9 e 10 · maiúscula, formas finais, letra muda */
  semMaiusculaT: 'Não existe maiúscula e minúscula',
  semMaiusculaP: 'Em português, a mesma letra tem duas formas: A e a, B e b. Em hebraico, não. Uma letra tem um desenho só, esteja ela no começo da frase, num nome próprio ou no meio de uma palavra qualquer.',
  finaisT: 'Mas {n} letras mudam de forma no fim da palavra',
  finaisP: 'É a mesma letra e normalmente o mesmo som. O que muda é o formato quando ela aparece no fim da palavra:',
  finaisNota: 'As regras completas ficam nas lições de cada uma. Por ora basta saber que a letra não virou outra letra.',
  mudaT: 'E o que é uma "letra muda"?',
  mudaP1: () => <>Você vai encontrar esse termo já na primeira lição, então vale defini-lo agora: <F>uma letra muda é uma letra que aparece escrita na palavra, mas que naquele caso não tem um som próprio perceptível na pronúncia.</F></>,
  mudaP2: () => <>Duas coisas importantes. Primeira: isso não quer dizer que ela esteja sobrando - ela segura o sinal de vogal, marca o início da palavra, ou está ali por história da língua. Segunda:{' '}<F>uma letra não é &quot;sempre muda&quot;</F>. O comportamento depende da palavra e da posição, e é por isso que cada caso é ensinado no seu lugar.</>,

  /* 10d · impressa e cursiva */
  tCursiva: 'A mesma letra tem dois desenhos: impressa e cursiva',
  cursivaP1: () => <>Tudo o que você viu até aqui está em <F>letra impressa</F> - a forma dos livros e das telas. Existe uma segunda forma, a{' '}<F>cursiva</F>, que é a que os israelenses usam para escrever à mão. Elas não se parecem muito:</>,
  impressa: 'impressa',
  cursiva: 'cursiva',
  impressaEm: 'A impressa aparece em',
  cursivaEm: 'A cursiva aparece em',

  /* 10b · que hebraico é este */
  tQueHebraico: 'Que hebraico é este que você vai aprender?',
  queP1: (n: number) => <>Talvez você tenha ouvido falar em &quot;hebraico bíblico&quot; e &quot;hebraico moderno&quot; e esteja se perguntando qual dos dois está nesta tela. A resposta começa pela parte que resolve quase tudo:{' '}<F>o alfabeto é o mesmo</F>. As{' '}{n} letras que aparecem num rolo da Torah são as mesmas{' '}{n} letras da placa de ônibus em Tel Aviv. Nenhuma foi criada, nenhuma se aposentou.</>,
  igualT: 'O que é igual?',
  igual1: 'As letras, o desenho delas e a direção da escrita.',
  igual2: 'O nikud, quando aparece.',
  igual3: 'A maior parte das raízes: as letras que carregam o sentido de uma família inteira de palavras.',
  mudouT: 'O que mudou?',
  mudou1: 'Milhares de palavras que o mundo antigo não tinha - avião, computador, eletricidade.',
  mudou2: 'O sistema dos verbos, que funciona de outro jeito.',
  mudou3: 'A pronúncia, que se acomodou numa forma padrão no último século.',
  queP2: () => <>Um e outro são a mesma língua em fases diferentes - como o português de Camões e o daqui, só que com um intervalo bem maior no meio.{' '}<F>Este curso ensina a LER</F>: as letras, os sinais, e a juntada delas em palavras. As palavras dos exercícios são do hebraico de hoje, porque são as que você vai encontrar - mas a leitura que você ganha serve para os dois textos, porque o alfabeto é um só.</>,
  queP3: () => <>Uma honestidade, para você não se decepcionar depois:{' '}<F>ler e entender são dois trabalhos</F>. Ao fim daqui você lê em voz alta o que estiver escrito - inclusive um versículo. Entender tudo o que leu é o passo seguinte, e a poesia bíblica é difícil até para quem nasceu falando hebraico - por isso as edições israelenses costumam vir com notas.</>,

  /* 10c · a história, fechada */
  historiaResumo: 'Quer saber mais? Como uma língua voltou a ser falada',
  historia1: 'Entre as duas fases há um intervalo de uns mil e setecentos anos em que ninguém crescia falando esta língua. Ela não sumiu: seguiu no livro, na reza e nas cartas entre comunidades distantes. O que ela não era é a língua em que se pede o almoço - essa era o iídiche, o ladino, o árabe ou o português, conforme o lugar.',
  historia2: 'A virada começa no fim do século XIX. O nome mais lembrado é o de Eliezer Ben-Yehuda (1858-1922), que se instalou em Jerusalém em 1881 e criou o próprio filho ouvindo hebraico e mais nada; Itamar entrou para a história como uma das primeiras crianças em séculos a ter o hebraico como primeira língua.',
  historia3: 'Só que uma língua não volta pela decisão de uma família. Voltou porque escolas resolveram dar aula assim, professores resolveram ensinar assim, jornais resolveram sair assim, e muita gente resolveu falar em casa um idioma que ninguém ali tinha como materno. Hoje há milhões de pessoas para quem ele é a primeira língua.',
  historia4: 'É daí que vem o que você leu no quadro de cima. A palavra para computador precisou ser inventada, porque não havia; as letras, não - ninguém desenhou um alfabeto novo, só voltou a falar em voz alta o que já estava escrito.',
  historiaLink: 'A história inteira, em cartas →',

  /* 11 · o caminho */
  caminho1: 'Entender o sistema',
  caminho2: 'Aprender as letras',
  caminho3: 'Ligar forma e som',
  caminho4: 'Entender o nikud',
  caminho5: 'Combinar letras',
  caminho6: 'Ler sílabas',
  caminho7: 'Ler palavras',
  caminho8: 'Reconhecer padrões',
  caminho9: 'Depender menos do nikud',
  caminho10: 'Ler hebraico de verdade',
  caminhoNota: 'O último passo é o que o curso persegue desde o primeiro: ler sem os sinais de apoio, como está escrito na rua.',
  estranhasT: 'Cinco coisas que parecem estranhas agora, e logo vão fazer sentido',
  estranha1: 'Ler da direita para a esquerda.',
  estranha2: 'Nem todas as vogais aparecerem como letras.',
  estranha3: 'Algumas letras mudarem de desenho no fim da palavra.',
  estranha4: 'Pontinhos pequenos mudarem a leitura.',
  estranha5: 'Uma letra poder ter mais de uma função.',
  estranhasP: 'Você não precisa dominar nada disso agora - nem é para dominar. Cada uma dessas ideias volta no momento certo, dentro da lição que precisa dela.',
  ordemP: (link: Marca) => <>As letras não vêm em ordem alfabética, e isso é de propósito:{' '}{link('o mapa explica por quê')}.</>,

  /* como o curso funciona */
  tComoFunciona: 'Como este curso funciona?',
  comoP1: 'São {licoes} lições em {modulos} módulos, e uma regra que vale do começo ao fim: nada aparece na tela antes de ter sido ensinado. Você nunca vê uma palavra com uma letra que ainda não conhece.',
  como1T: 'A lição',
  como1D: 'Uma letra por vez: o desenho, o som, como se escreve à mão e as primeiras palavras que ela forma. Dez minutos, mais ou menos.',
  como2T: 'Os exercícios',
  como2D: 'Corrigem na hora e dizem POR QUE, e não só "errou".',
  como3T: 'A revisão',
  como3D: 'O que escapa volta sozinho, no intervalo certo. Não é lição nova: é o que evita ter de recomeçar.',
  como4T: 'O fim de cada módulo',
  como4D: 'Uma verificação curta do que aquele módulo ensinou - para você saber que pode seguir, não para dar nota.',
  como5T: 'O fim do curso',
  como5D: 'Um desafio final com o alfabeto inteiro, e o certificado com o seu nome.',
  comoP2: 'Seu progresso fica salvo sozinho. Dá para parar no meio de uma lição, fechar o navegador e voltar semana que vem: a plataforma reabre onde você parou.',
  tPraticar: 'Como praticar de verdade?',
  praticar1: 'Leia em voz alta. Sempre. Ouvir o próprio som é metade do aprendizado.',
  praticar2: 'Pouco e todo dia bate muito de vez em quando.',
  praticar3: 'Errar faz parte: o que você erra volta na revisão, no dia certo.',
  praticar4: 'Escreva à mão. É o que fixa a forma da letra.',

  /* o quadro completo dos sinais */
  quadroResumo: 'Quer saber mais? O quadro completo dos sinais de vogal',
  quadroNota: 'Aprenda pelo SOM, não pelo nome: vários sinais diferentes fazem o mesmo som, e é essa a dificuldade de verdade.',
  somA: 'o som A',
  somE: 'o som E',
  somI: 'o som I',
  somO: 'o som O',
  somU: 'o som U',
  semVogal: 'sem vogal',
  ouvirSufixo: ': ouvir',
  irPrimeira: 'Ir para a primeira letra',

  /* a Aula 0 é obrigatória */
  situacaoFeita: 'Aula 0 concluída. As letras estão abertas, e esta página fica aqui para você voltar quando quiser.',
  situacaoObrigatoria: 'Esta aula é obrigatória: a primeira letra abre quando você terminar a checagem final, no fim da página, com pelo menos {minimo} acertos em {total}. Dá para refazer quantas vezes quiser.',

  /* a checagem final */
  finalTitulo: 'E o resto? Dezessete perguntas',
  finalIntro: 'A última conferência antes das letras, sobre tudo o que esta página explicou. Para abrir a primeira letra, acerte pelo menos {minimo} das {total}. Errar faz aparecer a explicação, e dá para refazer quantas vezes quiser.',
  finalBom: 'O mapa está na cabeça. Pode começar pelas letras.',
  finalParcial: 'O que escapou está explicado acima: dá para reler agora e refazer a checagem.',
  finalPassou: '{certas} de {total}. Aula 0 concluída: a primeira letra está aberta.',
  finalNaoPassou: '{certas} de {total}. Para abrir a primeira letra são {minimo}. Releia as partes que escaparam e refaça a checagem.',
  comecarAlef: 'Começar: a letra Álef',
  refazerChecagem: 'Refazer a checagem',

  /* a primeira e a última letra */
  letraPrimeiraNome: 'a primeira',
  letraUltimaNome: 'a última',
  toquePrimeira: 'Agora toque na PRIMEIRA letra de שָׁלוֹם.',
  toqueUltima: 'E agora na ÚLTIMA letra.',
  toqueFim: 'Isso. A primeira é a da direita, a última é a da esquerda.',
  setaLeitura: '← leitura',
  letrasAria: 'As letras de שָׁלוֹם, na ordem de leitura',
  letraAria: 'Letra {n} de {total}',
  aindaNao: 'Ainda não.',
  erroPrimeira: 'A primeira letra é a que está mais à DIREITA.',
  erroUltima: 'A última letra é a que está mais à ESQUERDA, onde a leitura termina.',
  fimComparacao: 'Em português, BOM DIA começa no B, à esquerda. Em hebraico, שָׁלוֹם começa no שׁ, à direita.',

  /* as mesmas consoantes, três palavras */
  mesmasT: 'As mesmas letras, três palavras',
  mesmasP1: (sfr: Pedaco) => <>Sem nikud, {sfr} são só três consoantes: S, F (ou P) e R. Com nikud, a leitura fica decidida:</>,
  sentidoLivro: 'livro',
  sentidoContou: 'contou',
  sentidoBarbeiro: 'barbeiro',
  mesmasP2: (pe: Pedaco, shalom: Pedaco) => <>Repare onde os sinais ficam: quase todos <F>embaixo</F> da letra; o ponto do {pe} fica <F>dentro</F> dela e muda o som de F para P; e há sinais que ficam <F>em cima</F>, como o O de {shalom}. Você não precisa decorar nada disso agora.</>,

  /* por onde começa */
  comecaPergunta: 'Rápido: por onde começa a leitura desta palavra?',
  comecaAriaEsq: 'Começa pela esquerda',
  comecaAriaDir: 'Começa pela direita',
  porAqui: 'por aqui',
  comecaCerto: 'Isso. Pela direita: a primeira letra é a que está mais à direita, e a leitura corre para a esquerda.',
  comecaErrado: 'Ainda não. Em hebraico a leitura começa pela DIREITA e corre para a esquerda - o contrário do português.',

  /* no caderno */
  cadernoPergunta: 'Rápido: qual forma você usaria para escrever no caderno?',
  cadernoCerto: 'Isso. Caderno, recado, formulário, lista: tudo o que é escrito à mão vai em cursiva.',
  cadernoErrado: 'A impressa é a forma de LER - livro, site, placa. Para escrever à mão, a forma é a cursiva.'
} as const;

const en: Traducao<typeof pt> = {
  voltarMapa: '← Map',
  badge: 'Lesson 0 · before the first letter',
  titulo: 'How does the Hebrew alphabet work?',
  lead: 'Ten minutes of reading, nothing to memorize. The idea is for you to understand how the writing works before you learn the first letter - after that, every lesson will feel much simpler.',
  indiceTitulo: 'What is on this page?',
  abreComClique: 'Each part opens when you tap its title.',

  iSistema: 'Not the same system as English',
  iComparacao: 'A comparison to feel the difference',
  iVogais: 'So where are the vowels?',
  iNikud: 'Nikud, the little vowel dots',
  iChecagemNikud: 'Check: did nikud make sense?',
  iQuatro: 'Four special letters',
  iDirecao: 'From right to left',
  iDuas: 'When a line runs in two directions',
  iMaiuscula: 'Capital letters, final forms and "silent letters"',
  iCursiva: 'Print and cursive: two shapes',
  iQueHebraico: 'Which Hebrew is this?',
  iCaminho: 'The path, from start to finish',
  iAtividade: 'Final check: seventeen questions',
  iComoFunciona: 'How this course works',

  sistemaP1: 'In English, consonants and vowels are letters of the same kind, and we write all of them in a row:',
  palavraCasa: 'HOUSE',
  casaLegenda: (v: Marca) => <>H {v('O')} {v('U')} S {v('E')} - two consonants and three vowels, all written</>,
  sistemaP2: () => <>Hebrew organizes this differently: <F>the letters mainly stand for the consonants</F>, and the vowel sounds are marked outside them - or, in many texts, not marked at all.</>,
  sistemaP3: () => <>A writing system like this has a name: <F>abjad</F>. You do not need the word to read anything - it is only useful so you recognize the term when you come across it. What matters is the idea: the letters are, at heart, the consonants.</>,

  comparacaoP1: () => <>Imagine that in English we wrote only <F>H S</F> and knew from context whether it said <em>house</em>, <em>hose</em> or <em>his</em>. Anyone who reads English would recognize the word from the rest of the sentence.</>,
  casaAria: 'HOUSE, which without the vowels becomes H S',
  casaSome: (v: Marca) => <>H{v('O')}{v('U')}S{v('E')}</>,
  casaSobra: 'without the vowels, H S is left',
  comparacaoP2: () => <>This is only an <F>analogy</F>, not a description of Hebrew: Hebrew is not English without vowels, and it has its own ways of marking the sounds - you will see all three just below. The comparison is here for one thing only: to understand why the vowels are not always written the way they are in English.</>,

  // etapa 3: pronúncia, rever
  vogaisP1: (shalom: Pedaco) => <>This is almost everyone&apos;s first question, and it has an answer. Hebrew <F>has vowel sounds like any language</F> - people say {shalom}{' '}with a clearly audible &quot;a&quot; and &quot;o&quot;. What changes is how they are shown in writing, and there are three ways:</>,
  vogal1T: 'Vowel signs',
  vogal1D: 'Dots and dashes placed under, inside or next to the consonant. This is nikud, explained in the next section - and it is where this course begins.',
  vogal2T: 'A few letters that help',
  vogal2D: 'Four letters can, depending on the word, help represent a vowel sound instead of sounding like a consonant. You will meet them in a moment.',
  vogal3T: 'Context',
  vogal3D: 'Someone who already knows the word recognizes it without any sign - which is how Israelis read newspapers, street signs and text messages every day.',
  cuidadoTitulo: 'Be careful with this sentence',
  cuidadoP: () => <>You will read here and there that <em>&quot;Hebrew has no vowels&quot;</em>. It is a bad summary, and it gets in the way. The accurate version is: <F>the language has vowel sounds</F>; what the basic alphabet lacks is separate letters for all of them, the way English has A, E, I, O, U.</>,

  tNikud: 'Nikud: the little dots that mark the vowels',
  nikudP1: (nikud: Pedaco) => <><F>Nikud</F>{' '}({nikud}) is the system of dots and dashes placed near the letters to show the vowel sounds. The same word, with and without them:</>,
  comNikud: 'with nikud - you can read it without knowing the word',
  semNikud: 'without nikud - this is how it looks on the street',
  nikudL1: 'Material for beginners usually has nikud - including this course, at the start.',
  nikudL2: 'Children\'s books, religious texts and poetry use it a lot too.',
  nikudL3: 'In everyday Hebrew, most texts come without it: street signs, newspapers, websites, text messages.',
  gravacaoNikud: 'Consonants, vowels and nikud, read aloud.',
  nikudP2: 'That is why the course does both, in this order: first you read with the signs, which is what lets you read without guessing; then they gradually come off, until you read the way people really read.',
  ressalvaTitulo: 'An important caveat',
  ressalvaP: (bet: Pedaco, shin: Pedaco, sin: Pedaco, vav: Pedaco, shuruk: Pedaco) => <>Not every dot that appears inside or near a letter is a vowel. Other signs look the same and do something else: the dot inside{' '}{bet}, which changes the sound of the consonant, and the dot that tells {shin} from {sin}, which says which of the two letters is there. You learn each one at the right moment - for now, just know that they exist and are not vowels. The exception, which you will see soon: the dot in the middle of {vav} ({shuruk}) is the vowel U.</>,

  tChecagemNikud: 'Check: did nikud make sense? Eight questions',
  checagemNikudTitulo: 'Did nikud make sense? Eight questions',
  checagemNikudIntro: 'It is not graded and it does not lock anything - it is only to confirm the idea stuck before moving on. If you get one wrong, the explanation shows up right away.',
  checagemNikudBom: 'Great. Now you know what nikud is and why it appears. Let\'s see how these signs work in practice.',
  checagemNikudParcial: 'It is worth rereading the section above before moving on - it is two or three ideas, and they come back in every lesson of the course.',

  tQuatro: 'Four letters behave in a special way',
  quatroP1: 'These four deserve a heads-up right away:',
  quatroP2: 'Depending on the word and the position, they can sound like a consonant, they can help represent a vowel sound, or they can appear without a clear consonant sound. It is not a strange exception: it is what happens when a writing system is a few thousand years old, and these letters were the first to take on that second job.',
  quatroP3: () => <>You do not need any rule now. This is here so that, later on, you do not think <em>&quot;but you said all the letters are consonants&quot;</em>. Each of these four has its own lesson, and that is where the topic is taught.</>,

  direcaoP1: 'Hebrew is read and written from right to left. The first letter of a word is the one furthest to the right - the opposite of English, and the only thing you need to unlearn.',
  bomDia: 'GOOD MORNING',
  comecaAquiEsq: 'starts here →',
  comecaAquiDir: '← starts here',
  direcaoP2: 'Only the Hebrew runs the other way. The course screen stays in English, from left to right: the buttons, the explanations and the transliterations.',
  gravacaoDirecao: 'How to read a word from right to left, with the word שָׁלוֹם.',
  direcaoP3: () => <><F>Numbers</F> are the exception: they are still written and read from left to right, as here. That is what gives a line two directions at once - and the next section shows it happening.</>,

  duasP1: 'Numbers, prices, phone numbers, web addresses: all of these keep running from left to right inside a Hebrew line. It is not a wrong mix or a glitch - this is how it is written. See where each piece ends up:',
  legendaTrecho: 'a stretch that runs from left to right',
  duasP2: () => <>There is only one rule: <F>each stretch keeps its own direction</F>. What the Hebrew line decides is the ORDER in which the stretches go into it - from right to left. That is why the number, which you read normally, ends up at the end that would look wrong in English.</>,
  duasP3: 'Two practical consequences, so you do not think you broke something. When typing, the cursor jumps from one side to the other as you go from Hebrew to the number - that is normal. And when you copy a line like this into a place that is not Hebrew, the pieces may show up in a different order on screen: the stored text is the same, only the visual layout changed.',
  linhaRua: 'A street sign. The name starts on the right; the house number sits at the left end, and it is still forty-two.',
  linhaOnibus: 'A bus sign: line 18 to Tel Aviv. The number is in the middle, with Hebrew on both sides - and each side runs its own way.',
  linhaTelefone: 'A phone number. The dash in the middle does not move: the whole number is a single block, read from left to right.',

  semMaiusculaT: 'There are no capital and lowercase letters',
  semMaiusculaP: 'In English, the same letter has two forms: A and a, B and b. In Hebrew, it does not. A letter has only one shape, whether it is at the start of a sentence, in a proper name or in the middle of any word.',
  finaisT: 'But {n} letters change shape at the end of a word',
  finaisP: 'It is the same letter and usually the same sound. What changes is the shape when it appears at the end of the word:',
  finaisNota: 'The full rules are in each letter\'s lesson. For now, it is enough to know the letter did not turn into another letter.',
  mudaT: 'And what is a "silent letter"?',
  mudaP1: () => <>You will meet this term in the very first lesson, so it is worth defining it now: <F>a silent letter is a letter that is written in the word but, in that case, has no sound of its own you can hear in the pronunciation.</F></>,
  mudaP2: () => <>Two important points. First: that does not mean it is extra - it holds the vowel sign, marks the start of the word, or is there because of the history of the language. Second:{' '}<F>a letter is not &quot;always silent&quot;</F>. How it behaves depends on the word and the position, and that is why each case is taught in its own place.</>,

  tCursiva: 'The same letter has two shapes: print and cursive',
  cursivaP1: () => <>Everything you have seen so far is in <F>print letters</F> - the shape used in books and on screens. There is a second shape, <F>cursive</F>, which is what Israelis use to write by hand. They do not look much alike:</>,
  impressa: 'print',
  cursiva: 'cursive',
  impressaEm: 'Print shows up in',
  cursivaEm: 'Cursive shows up in',

  tQueHebraico: 'Which Hebrew are you going to learn?',
  queP1: (n: number) => <>Maybe you have heard of &quot;Biblical Hebrew&quot; and &quot;Modern Hebrew&quot; and are wondering which of the two is on this screen. The answer starts with the part that settles almost everything:{' '}<F>the alphabet is the same</F>. The{' '}{n} letters in a Torah scroll are the same{' '}{n} letters on a bus sign in Tel Aviv. None was added, none retired.</>,
  igualT: 'What is the same?',
  igual1: 'The letters, their shapes and the direction of writing.',
  igual2: 'Nikud, when it appears.',
  igual3: 'Most of the roots: the letters that carry the meaning of a whole family of words.',
  mudouT: 'What changed?',
  mudou1: 'Thousands of words the ancient world did not have - airplane, computer, electricity.',
  mudou2: 'The verb system, which works differently.',
  mudou3: 'The pronunciation, which settled into a standard form over the last century.',
  queP2: () => <>Both are the same language at different stages - like Shakespeare&apos;s English and today&apos;s, only with a much longer gap in between.{' '}<F>This course teaches you to READ</F>: the letters, the signs, and how they join into words. The words in the exercises are from today&apos;s Hebrew, because those are the ones you will run into - but the reading you gain works for both kinds of text, because there is only one alphabet.</>,
  queP3: () => <>A word of honesty, so you are not disappointed later:{' '}<F>reading and understanding are two different jobs</F>. By the end of this course you will read aloud whatever is written - even a Bible verse. Understanding everything you read is the next step, and biblical poetry is hard even for people who grew up speaking Hebrew - that is why Israeli editions usually come with notes.</>,

  historiaResumo: 'Want to know more? How a language came to be spoken again',
  historia1: 'Between the two stages there is a gap of about seventeen hundred years in which nobody grew up speaking this language. It did not disappear: it lived on in books, in prayer and in letters between distant communities. What it was not was the language you ordered lunch in - that was Yiddish, Ladino, Arabic or Portuguese, depending on the place.',
  historia2: 'The turning point comes at the end of the 19th century. The best-remembered name is Eliezer Ben-Yehuda (1858-1922), who settled in Jerusalem in 1881 and raised his own son hearing Hebrew and nothing else; Itamar went down in history as one of the first children in centuries to have Hebrew as his first language.',
  historia3: 'But a language does not come back because one family decides it should. It came back because schools decided to teach in it, teachers decided to teach that way, newspapers decided to publish in it, and many people decided to speak at home a language that none of them had grown up with. Today there are millions of people for whom it is their first language.',
  historia4: 'That is where what you read in the section above comes from. The word for computer had to be invented, because there was none; the letters did not - nobody designed a new alphabet, people just started speaking aloud again what was already written.',
  historiaLink: 'The whole story, in cards →',

  caminho1: 'Understand the system',
  caminho2: 'Learn the letters',
  caminho3: 'Link shape and sound',
  caminho4: 'Understand nikud',
  caminho5: 'Combine letters',
  caminho6: 'Read syllables',
  caminho7: 'Read words',
  caminho8: 'Recognize patterns',
  caminho9: 'Rely less on nikud',
  caminho10: 'Read real Hebrew',
  caminhoNota: 'The last step is what the course has been working toward since the first: reading without the helper signs, the way it is written on the street.',
  estranhasT: 'Five things that feel strange now and will soon make sense',
  estranha1: 'Reading from right to left.',
  estranha2: 'Not every vowel showing up as a letter.',
  estranha3: 'Some letters changing shape at the end of a word.',
  estranha4: 'Tiny dots changing how a word is read.',
  estranha5: 'One letter having more than one job.',
  estranhasP: 'You do not need to master any of this now - you are not supposed to. Each of these ideas comes back at the right moment, inside the lesson that needs it.',
  ordemP: (link: Marca) => <>The letters do not come in alphabetical order, and that is on purpose:{' '}{link('the map explains why')}.</>,

  tComoFunciona: 'How does this course work?',
  comoP1: 'There are {licoes} lessons in {modulos} modules, and one rule that holds from start to finish: nothing appears on screen before it has been taught. You never see a word with a letter you do not know yet.',
  como1T: 'The lesson',
  como1D: 'One letter at a time: its shape, its sound, how to write it by hand and the first words it forms. About ten minutes.',
  como2T: 'The exercises',
  como2D: 'They correct you right away and tell you WHY, not just "wrong".',
  como3T: 'The review',
  como3D: 'What slips away comes back on its own, at the right interval. It is not a new lesson: it is what keeps you from having to start over.',
  como4T: 'The end of each module',
  como4D: 'A short check of what that module taught - so you know you can move on, not to give you a grade.',
  como5T: 'The end of the course',
  como5D: 'A final challenge with the whole alphabet, and the certificate with your name.',
  comoP2: 'Your progress saves on its own. You can stop in the middle of a lesson, close the browser and come back next week: the platform reopens where you left off.',
  tPraticar: 'How do you really practice?',
  praticar1: 'Read aloud. Always. Hearing your own voice is half the learning.',
  praticar2: 'A little every day beats a lot once in a while.',
  praticar3: 'Mistakes are part of it: what you get wrong comes back in the review, on the right day.',
  praticar4: 'Write by hand. That is what fixes the shape of the letter in your mind.',

  quadroResumo: 'Want to know more? The full chart of vowel signs',
  quadroNota: 'Learn by SOUND, not by name: several different signs make the same sound, and that is the real difficulty.',
  somA: 'the A sound',
  somE: 'the E sound',
  somI: 'the I sound',
  somO: 'the O sound',
  somU: 'the U sound',
  semVogal: 'no vowel',
  ouvirSufixo: ': listen',
  irPrimeira: 'Go to the first letter',

  situacaoFeita: 'Lesson 0 complete. The letters are open, and this page stays here for you to come back to whenever you like.',
  situacaoObrigatoria: 'This lesson is required: the first letter opens when you finish the final check, at the bottom of the page, with at least {minimo} right out of {total}. You can retake it as many times as you like.',

  finalTitulo: 'And the rest? Seventeen questions',
  finalIntro: 'The last check before the letters, covering everything this page explained. To open the first letter, get at least {minimo} of the {total} right. A wrong answer shows the explanation, and you can retake it as many times as you like.',
  finalBom: 'You have the map in your head. You can start on the letters.',
  finalParcial: 'Whatever slipped by is explained above: you can reread it now and retake the check.',
  finalPassou: '{certas} of {total}. Lesson 0 complete: the first letter is open.',
  finalNaoPassou: '{certas} of {total}. To open the first letter you need {minimo}. Reread the parts that slipped by and retake the check.',
  comecarAlef: 'Start: the letter Aleph',
  refazerChecagem: 'Retake the check',

  letraPrimeiraNome: 'the first',
  letraUltimaNome: 'the last',
  toquePrimeira: 'Now tap the FIRST letter of שָׁלוֹם.',
  toqueUltima: 'And now the LAST letter.',
  toqueFim: 'That\'s it. The first is the one on the right, the last is the one on the left.',
  setaLeitura: '← reading',
  letrasAria: 'The letters of שָׁלוֹם, in reading order',
  letraAria: 'Letter {n} of {total}',
  aindaNao: 'Not yet.',
  erroPrimeira: 'The first letter is the one furthest to the RIGHT.',
  erroUltima: 'The last letter is the one furthest to the LEFT, where the reading ends.',
  fimComparacao: 'In English, GOOD MORNING starts with the G, on the left. In Hebrew, שָׁלוֹם starts with שׁ, on the right.',

  mesmasT: 'The same letters, three words',
  // etapa 3: pronúncia, rever
  mesmasP1: (sfr: Pedaco) => <>Without nikud, {sfr} is just three consonants: S, F (or P) and R. With nikud, the reading is settled:</>,
  sentidoLivro: 'book',
  sentidoContou: 'counted, told',
  sentidoBarbeiro: 'barber',
  mesmasP2: (pe: Pedaco, shalom: Pedaco) => <>Notice where the signs go: almost all of them <F>under</F> the letter; the dot in {pe} goes <F>inside</F> it and changes the sound from F to P; and some signs go <F>on top</F>, like the O in {shalom}. You do not need to memorize any of this now.</>,

  comecaPergunta: 'Quick: where does the reading of this word start?',
  comecaAriaEsq: 'It starts on the left',
  comecaAriaDir: 'It starts on the right',
  porAqui: 'here',
  comecaCerto: 'That\'s it. On the right: the first letter is the one furthest to the right, and the reading runs to the left.',
  comecaErrado: 'Not yet. In Hebrew, reading starts on the RIGHT and runs to the left - the opposite of English.',

  cadernoPergunta: 'Quick: which shape would you use to write in a notebook?',
  cadernoCerto: 'That\'s it. Notebook, note, form, list: anything written by hand goes in cursive.',
  cadernoErrado: 'Print is the shape for READING - books, websites, signs. To write by hand, the shape is cursive.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
