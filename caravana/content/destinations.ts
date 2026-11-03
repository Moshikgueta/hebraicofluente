// Biblioteca cultural inicial.
//
// Quatro destinos tem texto completo (Muro Ocidental, Cafarnaum, Jaffa e
// Massada). Os demais sao registros 'placeholder': nome, nome em hebraico e
// regiao, sem historia escrita, e a tela diz "conteudo em preparacao". Nada de
// texto inventado para preencher espaco.
//
// Cada bloco diz o que e:
//   fact            fato historico ou arqueologico documentado
//   tradition       o que uma tradicao religiosa ou um texto antigo conta
//   interpretation  leitura de pesquisadores, debate, significado atribuido
//   tip             orientacao pratica de visita
//
// Status editorial: 'in_review'. Os textos foram escritos para a demonstracao e
// precisam da revisao de um editor (e de um guia licenciado) antes de irem a uma
// caravana real. A publicacao de agencia real so aceita 'approved'.

import type { ContentReference, ContentSection, EditorialStatus } from '../src/lib/db/schema';

export type DestinationSeed = {
  slug: string;
  region: 'jerusalem' | 'galileia' | 'deserto' | 'costa';
  namePt: string;
  nameHe: string;
  transliteration: string;
  pronunciation?: string;
  latitude: number;
  longitude: number;
  art: string;
  status: EditorialStatus;
  content?: {
    title: string;
    summary: string;
    geography: string;
    sections: ContentSection[];
    observe: string[];
    references: ContentReference[];
  };
};

export const REGION_LABEL: Record<DestinationSeed['region'], string> = {
  jerusalem: 'Jerusalém',
  galileia: 'Galileia',
  deserto: 'Deserto da Judeia e Mar Morto',
  costa: 'Costa do Mediterrâneo',
};

export const destinations: DestinationSeed[] = [
  {
    slug: 'muro-ocidental',
    region: 'jerusalem',
    namePt: 'Muro Ocidental',
    nameHe: 'הכותל המערבי',
    transliteration: 'HaKótel HaMaaraví',
    pronunciation: 'ha-KÓ-tel ha-ma-a-ra-VÍ',
    latitude: 31.7767,
    longitude: 35.2345,
    art: 'stone',
    status: 'in_review',
    content: {
      title: 'Muro Ocidental',
      summary:
        'O trecho mais conhecido do muro de contenção que sustentava a esplanada do Segundo Templo, ampliada por Herodes. Hoje é o principal lugar de oração do judaísmo.',
      geography:
        'Na Cidade Antiga de Jerusalém, junto ao lado oeste do Monte do Templo (Har HaBáyit), entre o Bairro Judeu e o Bairro Muçulmano.',
      sections: [
        {
          id: 'historia',
          title: 'História resumida',
          blocks: [
            {
              kind: 'fact',
              text: 'No fim do século I a.C., Herodes, o Grande, ampliou a plataforma do Monte do Templo. Para nivelar o terreno, cercou o monte com enormes muros de contenção. O Muro Ocidental é o lado oeste dessa estrutura, e não uma parede do Templo em si.',
            },
            {
              kind: 'fact',
              text: 'Em 70 d.C., durante a Grande Revolta judaica, o exército romano tomou Jerusalém e destruiu o Segundo Templo. Os muros de contenção ficaram de pé em grande parte.',
              source: 'Flávio Josefo, A Guerra dos Judeus, livro VI',
            },
            {
              kind: 'fact',
              text: 'As fiadas de baixo, com blocos grandes de calcário e uma moldura rebaixada em volta de cada pedra, são do período herodiano. As fiadas mais altas, de pedras menores, foram acrescentadas em épocas posteriores.',
            },
            {
              kind: 'fact',
              text: 'Até 1967 havia apenas um corredor estreito diante do muro, entre as casas do Bairro Mughrabi. Depois da Guerra dos Seis Dias o bairro foi demolido e a praça atual foi aberta.',
            },
            {
              kind: 'fact',
              text: 'O trecho visível na praça é uma pequena parte do muro, que continua para o norte, por baixo de construções da Cidade Antiga. Parte dele pode ser vista nos Túneis do Muro Ocidental, em visita guiada com reserva.',
            },
          ],
        },
        {
          id: 'significado',
          title: 'Importância religiosa e cultural',
          blocks: [
            {
              kind: 'tradition',
              text: 'No judaísmo, o Muro é venerado por ser o vestígio mais próximo do antigo Templo onde se pode rezar. Um midrash antigo diz que a Presença Divina (Shechiná) nunca se afastou dele.',
              source: 'Midrash Shemot Rabá 2:2',
            },
            {
              kind: 'tradition',
              text: 'Há séculos, visitantes deixam pedidos escritos em papel nas fendas entre as pedras. Duas vezes por ano os bilhetes são recolhidos e enterrados no Monte das Oliveiras, como se faz com textos sagrados.',
            },
            {
              kind: 'tradition',
              text: 'Na tradição islâmica, o mesmo muro é chamado de Muro de al-Buraq, ligado ao relato da Viagem Noturna do profeta Maomé.',
            },
            {
              kind: 'fact',
              text: 'O apelido "Muro das Lamentações", comum em português, vem do lamento pela destruição do Templo. Em hebraico, o nome usado no dia a dia é simplesmente HaKótel, "o muro".',
            },
          ],
        },
        {
          id: 'curiosidades',
          title: 'Curiosidades',
          blocks: [
            {
              kind: 'fact',
              text: 'A praça funciona como uma sinagoga ao ar livre, com uma área para homens e outra para mulheres. Ao sul, junto ao Arco de Robinson, há uma área para oração mista.',
            },
            {
              kind: 'fact',
              text: 'Muitas cerimônias de bar mitsvá acontecem ali às segundas e quintas de manhã, dias em que a Torá é lida na reza.',
            },
          ],
        },
        {
          id: 'visita',
          title: 'Para a visita',
          blocks: [
            {
              kind: 'tip',
              text: 'Vista roupa que cubra ombros e joelhos. Homens cobrem a cabeça perto do muro; costuma haver quipás de papel na entrada.',
            },
            {
              kind: 'tip',
              text: 'No Shabat (de sexta ao pôr do sol até a noite de sábado) e nos feriados judaicos, não se fotografa nem se usa o celular na praça.',
            },
            { kind: 'tip', text: 'Há controle de segurança na entrada. Siga sempre as orientações do seu guia.' },
          ],
        },
      ],
      observe: [
        'Procure as pedras herodianas da parte de baixo: a moldura rebaixada em volta de cada bloco é a marca do período.',
        'Repare nas plantas que crescem nas fendas mais altas e nos pássaros que fazem ninho entre as pedras.',
        'Observe as diferentes formas de rezar: em pé, balançando o corpo, com o livro aberto ou de olhos fechados.',
      ],
      references: [
        { label: 'Flávio Josefo, A Guerra dos Judeus', detail: 'livro VI, sobre a destruição do Templo em 70 d.C.' },
        { label: 'Midrash Shemot Rabá', detail: '2:2' },
        { label: 'Fundação do Patrimônio do Muro Ocidental', detail: 'orientações de visita' },
      ],
    },
  },
  {
    slug: 'cafarnaum',
    region: 'galileia',
    namePt: 'Cafarnaum',
    nameHe: 'כפר נחום',
    transliteration: 'Kfar Nachum',
    pronunciation: 'kfar na-CHUM (o "ch" soa como o "rr" de "carro")',
    latitude: 32.8803,
    longitude: 35.5753,
    art: 'galilee',
    status: 'in_review',
    content: {
      title: 'Cafarnaum',
      summary:
        'Vila de pescadores à beira do Mar da Galileia onde, segundo os Evangelhos, Jesus morou e ensinou. As ruínas mostram uma sinagoga de pedra branca e a casa venerada como a de Pedro.',
      geography:
        'Na margem noroeste do Mar da Galileia (Kinéret), cerca de 200 metros abaixo do nível do mar, perto de Tabgha e do Monte das Bem-aventuranças.',
      sections: [
        {
          id: 'historia',
          title: 'História resumida',
          blocks: [
            {
              kind: 'fact',
              text: 'O nome hebraico, Kfar Nachum, quer dizer "aldeia de Naum". Era uma vila judaica de pescadores e agricultores, com casas de basalto negro, a pedra vulcânica da região.',
            },
            {
              kind: 'tradition',
              text: 'Os Evangelhos contam que Jesus fez de Cafarnaum a base do seu ministério na Galileia, chamando-a de "sua cidade", e que ensinou na sinagoga local.',
              source: 'Mateus 4:13 e 9:1; Marcos 1:21',
            },
            {
              kind: 'tradition',
              text: 'Também segundo os Evangelhos, ali morava Pedro, e Jesus curou a sogra dele em casa.',
              source: 'Marcos 1:29-31',
            },
            {
              kind: 'fact',
              text: 'Escavações conduzidas por arqueólogos franciscanos a partir de 1968 revelaram uma casa que, já nos primeiros séculos, foi transformada em local de culto e, no século V, recebeu por cima uma igreja octogonal.',
            },
            {
              kind: 'fact',
              text: 'A peregrina Egéria, que percorreu a região no fim do século IV, descreveu a casa de Pedro já transformada em igreja.',
            },
            {
              kind: 'interpretation',
              text: 'A identificação da casa com a de Pedro se apoia nessa tradição antiga e nos grafites deixados por peregrinos nas paredes. Não há inscrição que a comprove.',
            },
          ],
        },
        {
          id: 'sinagoga',
          title: 'A sinagoga branca',
          blocks: [
            {
              kind: 'fact',
              text: 'A sinagoga que se vê hoje, de calcário branco trazido de fora da região, é posterior à época de Jesus: a datação mais aceita a coloca entre os séculos IV e V.',
            },
            {
              kind: 'interpretation',
              text: 'Sob ela há alicerces de basalto negro. Parte dos pesquisadores entende que pertencem a uma sinagoga mais antiga, talvez a do século I citada nos Evangelhos; a questão segue em debate.',
            },
          ],
        },
        {
          id: 'hoje',
          title: 'O sítio hoje',
          blocks: [
            {
              kind: 'fact',
              text: 'A área principal pertence à Custódia Franciscana da Terra Santa. Em 1990 foi inaugurada uma igreja moderna suspensa sobre as ruínas da casa, com piso de vidro para vê-las de cima.',
            },
            {
              kind: 'fact',
              text: 'Um pouco a leste fica uma igreja greco-ortodoxa, fácil de reconhecer pelas cúpulas vermelhas.',
            },
            { kind: 'tip', text: 'É um lugar de culto: ombros e joelhos cobertos para entrar.' },
          ],
        },
      ],
      observe: [
        'Compare as duas pedras: o basalto negro das casas e o calcário branco da sinagoga.',
        'Nos relevos expostos em volta da sinagoga, procure a estrela de seis pontas, a de cinco pontas e um carro com rodas que muitos interpretam como a Arca da Aliança.',
        'Do piso de vidro da igreja moderna dá para ver o octógono da igreja bizantina e, no centro, as paredes da casa.',
      ],
      references: [
        { label: 'Evangelhos de Mateus e Marcos', detail: 'Mateus 4:13; 9:1. Marcos 1:21-31' },
        { label: 'Stanislao Loffreda, Recovering Capharnaum', detail: 'Franciscan Printing Press, Jerusalém' },
        { label: 'Itinerário de Egéria', detail: 'fim do século IV' },
      ],
    },
  },
  {
    slug: 'jaffa',
    region: 'costa',
    namePt: 'Jaffa',
    nameHe: 'יפו',
    transliteration: 'Yáfo',
    pronunciation: 'YÁ-fo',
    latitude: 32.0543,
    longitude: 34.7516,
    art: 'coast',
    status: 'in_review',
    content: {
      title: 'Jaffa',
      summary:
        'Um dos portos mais antigos do Mediterrâneo, citado na Bíblia e em textos egípcios. Hoje é o bairro histórico de Tel Aviv-Yafo, com ruelas de pedra, galerias e o porto ainda em uso.',
      geography:
        'Numa colina à beira-mar, no sul de Tel Aviv. O antigo morro (Tel Yafo) guarda camadas de ocupação de mais de três mil anos.',
      sections: [
        {
          id: 'historia',
          title: 'História resumida',
          blocks: [
            {
              kind: 'fact',
              text: 'Escavações no morro de Jaffa revelaram vestígios desde a Idade do Bronze, entre eles um portão do período em que a cidade esteve sob domínio egípcio.',
            },
            {
              kind: 'tradition',
              text: 'Um conto egípcio antigo narra a tomada de Jope por um general do faraó Tutmés III, que teria escondido soldados dentro de cestos para entrar na cidade.',
              source: 'Papiro Harris 500, Museu Britânico',
            },
            {
              kind: 'tradition',
              text: 'Na Bíblia, é de Jope que o profeta Jonas embarca para fugir da sua missão, e é por esse porto que chegam os cedros do Líbano para o Templo de Jerusalém.',
              source: 'Jonas 1:3; 2 Crônicas 2; Esdras 3:7',
            },
            {
              kind: 'tradition',
              text: 'No livro de Atos, Pedro ressuscita Tabita em Jope e se hospeda na casa de Simão, o curtidor, onde tem a visão que o leva a Cesareia.',
              source: 'Atos 9:36-43 e 10',
            },
            {
              kind: 'fact',
              text: 'A cidade foi conquistada e reconstruída muitas vezes. Em 1799, Napoleão a sitiou e tomou durante a campanha do Egito e da Síria.',
            },
            {
              kind: 'fact',
              text: 'No fim do período otomano, Jaffa era a principal porta de entrada de peregrinos e imigrantes, e suas laranjas ficaram famosas na exportação com o nome da cidade.',
            },
            {
              kind: 'fact',
              text: 'Em 1909, famílias judias que viviam em Jaffa fundaram um bairro nas dunas ao norte, que deu origem a Tel Aviv. As duas cidades foram unidas em 1950, com o nome oficial de Tel Aviv-Yafo.',
            },
          ],
        },
        {
          id: 'significado',
          title: 'Uma cidade de muitas camadas',
          blocks: [
            {
              kind: 'fact',
              text: 'Jaffa é uma cidade de convivência entre judeus e árabes, cristãos e muçulmanos, com igrejas, mesquitas e sinagogas a poucas quadras umas das outras.',
            },
            {
              kind: 'tradition',
              text: 'A mitologia grega situa diante de Jaffa o rochedo onde Andrômeda foi acorrentada antes de ser salva por Perseu. As pedras na entrada do porto ainda levam esse nome.',
            },
          ],
        },
        {
          id: 'curiosidades',
          title: 'Curiosidades',
          blocks: [
            {
              kind: 'fact',
              text: 'A Torre do Relógio, na entrada da cidade velha, foi construída no início do século XX em homenagem ao sultão otomano Abdul Hamid II.',
            },
            {
              kind: 'fact',
              text: 'A Igreja de São Pedro, franciscana, fica no alto da colina; sua torre é um dos pontos mais visíveis da orla.',
            },
            {
              kind: 'fact',
              text: 'O Mercado das Pulgas (Shuk HaPishpeshim) reúne antiquários, móveis antigos, ateliês e restaurantes.',
            },
          ],
        },
      ],
      observe: [
        'Do alto da colina, olhe para o norte: a orla e os prédios de Tel Aviv mostram, de uma vez, a cidade antiga e a nova.',
        'Repare nas placas das ruelas da cidade velha: muitas levam o nome de um signo do zodíaco.',
        'No porto, veja os barcos de pesca que ainda trabalham ao lado dos restaurantes.',
      ],
      references: [
        { label: 'Bíblia', detail: 'Jonas 1:3; 2 Crônicas 2; Esdras 3:7; Atos 9:36-43 e 10' },
        { label: '"A tomada de Jope"', detail: 'conto egípcio conservado no Papiro Harris 500, Museu Britânico' },
      ],
    },
  },
  {
    slug: 'massada',
    region: 'deserto',
    namePt: 'Massada',
    nameHe: 'מצדה',
    transliteration: 'Metsadá',
    pronunciation: 'me-tsa-DÁ',
    latitude: 31.3156,
    longitude: 35.3536,
    art: 'desert',
    status: 'in_review',
    content: {
      title: 'Massada',
      summary:
        'Fortaleza de Herodes no alto de um platô isolado diante do Mar Morto. Foi o último reduto de rebeldes judeus contra Roma e é Patrimônio Mundial da UNESCO desde 2001.',
      geography:
        'No Deserto da Judeia, na borda oeste do vale do Mar Morto. O topo é um platô cercado de penhascos, com acesso por teleférico ou pela Trilha da Serpente, no lado leste.',
      sections: [
        {
          id: 'historia',
          title: 'História resumida',
          blocks: [
            { kind: 'fact', text: 'O nome hebraico, Metsadá, quer dizer "fortaleza".' },
            {
              kind: 'fact',
              text: 'Herodes, o Grande, transformou o platô numa fortaleza-palácio no século I a.C.: muralha, armazéns, cisternas que guardavam a água das chuvas, termas e um palácio em três terraços na ponta norte.',
            },
            {
              kind: 'fact',
              text: 'No início da Grande Revolta contra Roma, em 66 d.C., um grupo de rebeldes judeus tomou Massada. Depois da queda de Jerusalém, a fortaleza resistiu até que a Décima Legião romana a cercou e construiu uma enorme rampa no lado oeste. A queda é datada de 73 ou 74 d.C.',
            },
            {
              kind: 'fact',
              text: 'O principal relato do cerco é do historiador Flávio Josefo. Segundo ele, os 960 defensores, liderados por Elazar ben Yair, escolheram morrer a ser escravizados, e sobreviveram apenas duas mulheres e cinco crianças.',
              source: 'Flávio Josefo, A Guerra dos Judeus, livro VII',
            },
            {
              kind: 'interpretation',
              text: 'Historiadores discutem até que ponto o relato de Josefo é exato. As escavações confirmaram o cerco, a rampa e os acampamentos romanos, mas parte dos detalhes do fim da história não tem como ser verificada.',
            },
            {
              kind: 'fact',
              text: 'As grandes escavações foram dirigidas pelo arqueólogo Yigael Yadin entre 1963 e 1965, com voluntários de vários países.',
            },
          ],
        },
        {
          id: 'significado',
          title: 'Um símbolo em debate',
          blocks: [
            {
              kind: 'interpretation',
              text: 'No Israel moderno, Massada se tornou símbolo de resistência e de liberdade, e durante décadas recebeu cerimônias de juramento de unidades do exército. O sentido do episódio também é discutido: há quem o leia como heroísmo e quem o leia como um alerta.',
            },
          ],
        },
        {
          id: 'curiosidades',
          title: 'Curiosidades',
          blocks: [
            {
              kind: 'fact',
              text: 'Os acampamentos romanos e o muro de cerco que contornava a montanha ainda são visíveis do alto, como desenhos de pedra no deserto.',
            },
            {
              kind: 'fact',
              text: 'Na sinagoga da fortaleza, uma das mais antigas conhecidas, foram encontrados fragmentos de rolos com textos bíblicos.',
            },
          ],
        },
        {
          id: 'visita',
          title: 'Para a visita',
          blocks: [
            {
              kind: 'tip',
              text: 'Vá cedo e leve água, chapéu e protetor solar: o calor no deserto é intenso, e em dias muito quentes a Trilha da Serpente pode fechar mais cedo.',
            },
          ],
        },
      ],
      observe: [
        'Do lado oeste, procure a rampa romana: é por ela que se entende o tamanho do cerco.',
        'No palácio do norte, veja como as construções descem a encosta em três níveis.',
        'Repare na linha preta pintada nas paredes: abaixo dela está o que foi encontrado de pé; acima, o que foi reconstruído.',
      ],
      references: [
        { label: 'Flávio Josefo, A Guerra dos Judeus', detail: 'livro VII' },
        { label: "Yigael Yadin, Masada: Herod's Fortress and the Zealots' Last Stand", detail: '1966' },
        { label: 'UNESCO, Lista do Patrimônio Mundial', detail: 'Masada, inscrição de 2001' },
      ],
    },
  },

  // ─── Registros em preparacao: so identificacao, sem texto historico ──────
  { slug: 'jerusalem', region: 'jerusalem', namePt: 'Jerusalém', nameHe: 'ירושלים', transliteration: 'Yerushaláyim', latitude: 31.7683, longitude: 35.2137, art: 'jerusalem', status: 'placeholder' },
  { slug: 'cidade-antiga', region: 'jerusalem', namePt: 'Cidade Antiga de Jerusalém', nameHe: 'העיר העתיקה', transliteration: 'HaÍr HaAtiká', latitude: 31.7767, longitude: 35.2317, art: 'jerusalem', status: 'placeholder' },
  { slug: 'monte-das-oliveiras', region: 'jerusalem', namePt: 'Monte das Oliveiras', nameHe: 'הר הזיתים', transliteration: 'Har HaZeitím', latitude: 31.7781, longitude: 35.2441, art: 'jerusalem', status: 'placeholder' },
  { slug: 'santo-sepulcro', region: 'jerusalem', namePt: 'Igreja do Santo Sepulcro', nameHe: 'כנסיית הקבר', transliteration: 'Knessiyát HaKéver', latitude: 31.7785, longitude: 35.2296, art: 'stone', status: 'placeholder' },
  { slug: 'belem', region: 'jerusalem', namePt: 'Belém', nameHe: 'בית לחם', transliteration: 'Beit Léchem', latitude: 31.7054, longitude: 35.2024, art: 'stone', status: 'placeholder' },
  { slug: 'mar-da-galileia', region: 'galileia', namePt: 'Mar da Galileia', nameHe: 'ים כנרת', transliteration: 'Yam Kinéret', latitude: 32.8231, longitude: 35.5878, art: 'galilee', status: 'placeholder' },
  { slug: 'nazare', region: 'galileia', namePt: 'Nazaré', nameHe: 'נצרת', transliteration: 'Natsrát', latitude: 32.6996, longitude: 35.3035, art: 'galilee', status: 'placeholder' },
  { slug: 'rio-jordao', region: 'galileia', namePt: 'Rio Jordão', nameHe: 'נהר הירדן', transliteration: 'Nehár HaYardén', latitude: 32.7106, longitude: 35.5712, art: 'galilee', status: 'placeholder' },
  { slug: 'mar-morto', region: 'deserto', namePt: 'Mar Morto', nameHe: 'ים המלח', transliteration: 'Yam HaMélach', latitude: 31.5, longitude: 35.5, art: 'desert', status: 'placeholder' },
  { slug: 'tel-aviv', region: 'costa', namePt: 'Tel Aviv', nameHe: 'תל אביב', transliteration: 'Tel Avív', latitude: 32.0853, longitude: 34.7818, art: 'telaviv', status: 'placeholder' },
  { slug: 'cesareia', region: 'costa', namePt: 'Cesareia', nameHe: 'קיסריה', transliteration: 'Keisária', latitude: 32.5, longitude: 34.8917, art: 'coast', status: 'placeholder' },
];
