// Caravana de DEMONSTRACAO.
//
// Tudo aqui mora numa agencia marcada `is_demo`, separada de qualquer agencia
// real. O roteiro e ilustrativo: nao tem horarios, hoteis nem contatos de
// verdade, e a tela diz isso. Os numeros do painel da agencia de demonstracao
// saem de convites e respostas ficticios criados abaixo, e o painel avisa.

import type { InfoTemplate } from './info-templates';

export const DEMO_AGENCY = {
  slug: 'agencia-exemplo',
  name: 'Agência Exemplo',
  displayName: 'Agência Exemplo',
  logoText: 'AE',
  primaryColor: '#24496B',
  secondaryColor: '#B47A3C',
  welcomeMessage: null,
};

export const DEMO_CARAVAN = {
  slug: 'descubra-israel-2027',
  name: 'Caravana Descubra Israel 2027',
  description:
    'Dez dias entre a costa, a Galileia, o deserto e Jerusalém. Roteiro ilustrativo, criado para demonstrar a plataforma.',
  startDate: '2027-05-10',
  endDate: '2027-05-19',
  organizerName: 'Equipe Agência Exemplo',
  welcomeMessage:
    'Preparamos este espaço para você conhecer os lugares antes de chegar, aprender as primeiras palavras em hebraico e guardar as lembranças da viagem. Explore no seu ritmo: tudo fica aqui até depois da volta.',
  postTripMessage:
    'Foi uma alegria viajar com você. Os textos, as palavras e o seu passaporte continuam aqui sempre que quiser voltar a eles.',
  coverArt: 'jerusalem',
  seatLimit: 40,
};

export type DemoDay = {
  title: string;
  summary: string;
  art: string;
  practicalNotes?: string;
  stops: { title: string; description?: string; destination?: string; practicalNote?: string }[];
};

export const DEMO_DAYS: DemoDay[] = [
  {
    title: 'Chegada a Tel Aviv-Yafo',
    summary: 'Pouso, traslado e um primeiro passeio sem pressa pela cidade velha de Jaffa.',
    art: 'coast',
    practicalNotes: 'Dia de chegada: descanse e beba água. O ritmo da viagem começa amanhã.',
    stops: [
      { title: 'Chegada ao Aeroporto Ben Gurion', description: 'Encontro com a equipe e traslado.' },
      { title: 'Caminhada pela Velha Jaffa', description: 'Ruelas de pedra, o porto e a vista de Tel Aviv.', destination: 'jaffa' },
    ],
  },
  {
    title: 'Pela costa até a Galileia',
    summary: 'Ruínas romanas à beira do Mediterrâneo e a chegada ao Mar da Galileia.',
    art: 'coast',
    stops: [
      { title: 'Cesareia', description: 'A cidade portuária construída por Herodes.', destination: 'cesareia' },
      { title: 'Chegada à região do Kinéret', destination: 'mar-da-galileia' },
    ],
  },
  {
    title: 'Mar da Galileia',
    summary: 'Um dia à beira do lago, entre barcos, vilas antigas e paisagens dos Evangelhos.',
    art: 'galilee',
    stops: [
      { title: 'Travessia de barco', destination: 'mar-da-galileia' },
      { title: 'Cafarnaum', description: 'A vila de pescadores, a sinagoga branca e a casa de Pedro.', destination: 'cafarnaum', practicalNote: 'Lugar de culto: ombros e joelhos cobertos.' },
    ],
  },
  {
    title: 'Nazaré e o Rio Jordão',
    summary: 'A cidade da Anunciação e as margens do Jordão.',
    art: 'galilee',
    stops: [
      { title: 'Nazaré', destination: 'nazare' },
      { title: 'Rio Jordão', destination: 'rio-jordao' },
    ],
  },
  {
    title: 'Deserto da Judeia',
    summary: 'A fortaleza de Massada ao amanhecer e as águas do Mar Morto.',
    art: 'desert',
    practicalNotes: 'Dia de muito sol: chapéu, protetor solar e água o tempo todo.',
    stops: [
      { title: 'Massada', description: 'Subida de teleférico e visita à fortaleza de Herodes.', destination: 'massada' },
      { title: 'Mar Morto', description: 'Tempo para boiar no ponto mais baixo da Terra.', destination: 'mar-morto' },
    ],
  },
  {
    title: 'Chegada a Jerusalém',
    summary: 'A primeira vista da cidade, do alto do Monte das Oliveiras.',
    art: 'jerusalem',
    stops: [{ title: 'Monte das Oliveiras', description: 'O panorama da Cidade Antiga.', destination: 'monte-das-oliveiras' }],
  },
  {
    title: 'A Cidade Antiga',
    summary: 'Muralhas, bairros e o Muro Ocidental.',
    art: 'stone',
    stops: [
      { title: 'Cidade Antiga', description: 'Os quatro bairros dentro das muralhas.', destination: 'cidade-antiga' },
      { title: 'Muro Ocidental', destination: 'muro-ocidental', practicalNote: 'Roupa que cubra ombros e joelhos.' },
    ],
  },
  {
    title: 'Caminhos de Jerusalém',
    summary: 'Igrejas, mercados e tempo livre na cidade.',
    art: 'jerusalem',
    stops: [
      { title: 'Igreja do Santo Sepulcro', destination: 'santo-sepulcro' },
      { title: 'Tarde livre', description: 'Mercados e cafés da cidade nova.' },
    ],
  },
  {
    title: 'Tel Aviv',
    summary: 'A cidade nova à beira-mar e um último pôr do sol em Jaffa.',
    art: 'telaviv',
    stops: [
      { title: 'Tel Aviv', description: 'Orla, bairros e arquitetura.', destination: 'tel-aviv' },
      { title: 'Fim de tarde em Jaffa', destination: 'jaffa' },
    ],
  },
  {
    title: 'Partida',
    summary: 'Traslado ao aeroporto e voo de volta.',
    art: 'coast',
    stops: [{ title: 'Traslado ao Aeroporto Ben Gurion' }],
  },
];

export const DEMO_INFO: InfoTemplate[] = [
  {
    section: 'contatos',
    title: 'Atendimento da agência',
    body: 'Contato de demonstração. Numa caravana real, aqui aparecem o telefone, o WhatsApp e o e-mail oficiais da agência.',
  },
  {
    section: 'guia',
    title: 'Guia da caravana',
    body: 'Numa caravana real, a agência informa aqui o nome e o contato do guia licenciado.',
  },
  {
    section: 'hoteis',
    title: 'Hotéis',
    body: 'Os hotéis aparecem aqui quando a agência confirmar as reservas.',
    isTimeSensitive: true,
  },
  {
    section: 'encontro',
    title: 'Encontro no aeroporto',
    body: 'O ponto de encontro do embarque é informado pela agência antes da viagem.',
    isTimeSensitive: true,
  },
  {
    section: 'emergencia',
    title: 'Números de emergência em Israel',
    body: 'Polícia: 100. Atendimento médico de emergência (Magen David Adom): 101. Bombeiros: 102. Em caso de emergência, avise também o guia e a agência.',
  },
];

// Convites ficticios para o painel da demonstracao ter o que mostrar. Primeiros
// nomes inventados, sem sobrenome nem contato.
export const DEMO_TRAVELERS = [
  'Ana', 'Bruno', 'Carla', 'Daniel', 'Eliane', 'Fábio', 'Gabriela', 'Hélio', 'Irene', 'João',
  'Kátia', 'Luís', 'Marta', 'Nelson', 'Olga', 'Paulo', 'Raquel', 'Sérgio',
];
