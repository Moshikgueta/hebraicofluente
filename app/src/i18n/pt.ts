/* Os textos fixos da interface, em português: a FONTE. Cada chave nova entra
   aqui e em en.ts no mesmo commit (o tipo de en.ts recusa chave faltando).

   O texto daqui é o que a tela mostrava antes, palavra por palavra: tirar um
   texto do componente não pode mudar o site brasileiro. As chaves seguem a
   tela (`naoEncontrada.titulo`), e `{nome}` marca o que entra na hora. */
export const pt = {
  'marca': 'Hebraico Fluente',

  'site.titulo': 'Hebraico Fluente - a plataforma de hebraico para brasileiros',
  'site.descricao':
    'Hebraico para brasileiros, começando pelo alfabeto: aulas interativas, correção na ' +
    'hora e progresso que continua de onde você parou.',

  'naoEncontrada.tituloDaAba': 'Página não encontrada - Hebraico Fluente',
  'naoEncontrada.titulo': 'Esta página não existe',
  'naoEncontrada.texto': 'Talvez o link esteja antigo.',
  'naoEncontrada.voltar': 'Voltar ao início'
} as const;

export type Chave = keyof typeof pt;
