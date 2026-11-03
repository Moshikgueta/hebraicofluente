// Informacoes gerais que toda caravana nova recebe como ponto de partida. A
// agencia revisa, edita ou apaga cada item. So entram aqui orientacoes
// permanentes e gerais: nada de regra de entrada no pais, fronteira ou
// seguranca, que mudam e precisam vir da agencia com data.

export type InfoTemplate = {
  section: string;
  title: string;
  body: string;
  contactValue?: string;
  contactKind?: 'phone' | 'whatsapp' | 'email' | 'url';
  isTimeSensitive?: boolean;
};

export const INFO_SECTIONS: { id: string; label: string }[] = [
  { id: 'contatos', label: 'Contatos da agência' },
  { id: 'guia', label: 'Guia' },
  { id: 'hoteis', label: 'Hotéis' },
  { id: 'encontro', label: 'Pontos de encontro' },
  { id: 'bagagem', label: 'Bagagem' },
  { id: 'moeda', label: 'Moeda' },
  { id: 'etiqueta', label: 'Etiqueta cultural' },
  { id: 'comunicacao', label: 'Comunicação' },
  { id: 'emergencia', label: 'Emergência' },
];

export const infoTemplates: InfoTemplate[] = [
  {
    section: 'bagagem',
    title: 'Roupas para o clima e para os lugares sagrados',
    body: 'Roupa leve para o dia e um agasalho para a noite: em Jerusalém e no deserto a temperatura cai depois do pôr do sol. Leve ao menos uma peça que cubra ombros e joelhos para igrejas, sinagogas e mesquitas.',
  },
  {
    section: 'bagagem',
    title: 'Calçado',
    body: 'Muitas visitas são a pé, em pedra e com subidas. Prefira um calçado fechado, confortável e já usado.',
  },
  {
    section: 'moeda',
    title: 'Novo shekel israelense',
    body: 'A moeda é o novo shekel (ILS, símbolo ₪), dividido em 100 agorot. Cartões são aceitos na maior parte das lojas e restaurantes; tenha algum dinheiro para mercados e pequenas compras.',
  },
  {
    section: 'etiqueta',
    title: 'Shabat',
    body: 'O Shabat vai do pôr do sol de sexta até o anoitecer de sábado. Em boa parte do país, muito comércio fecha e o transporte público para. Os horários da caravana já levam isso em conta.',
  },
  {
    section: 'etiqueta',
    title: 'Fotografias',
    body: 'Peça licença antes de fotografar pessoas, principalmente em oração. Em alguns lugares sagrados, fotos não são permitidas em certos dias ou áreas: siga a orientação do guia.',
  },
  {
    section: 'comunicacao',
    title: 'Avisos urgentes',
    body: 'Mudanças de horário e avisos urgentes chegam pelos canais oficiais da agência, como o grupo de mensagens da caravana. Este espaço complementa esses canais e não os substitui.',
  },
];
