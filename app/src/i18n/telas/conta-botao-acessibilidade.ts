import type { Traducao } from '..';

/* components/shell/BotaoAcessibilidade.tsx */
const pt = {
  ajustes: 'Ajustes de acessibilidade',
  ajustesAtivos: (n: number) => `Ajustes de acessibilidade (${n} ativo${n > 1 ? 's' : ''})`,
  titulo: 'Acessibilidade',
  guardado: 'Fica guardado neste aparelho, e vale em todas as páginas.',
  tamanhoDoTexto: 'Tamanho do texto',
  tema: 'Tema',
  temaAuto: 'Automático',
  temaClaro: 'Claro',
  temaEscuro: 'Escuro',
  temaNota: 'Vale nas telas do curso. As páginas de venda são claras sempre.',
  contraste: 'Mais contraste',
  contrasteNota: 'Tinta mais escura e bordas visíveis.',
  espaco: 'Mais espaço entre linhas',
  espacoNota: 'Entrelinha e espaço entre palavras maiores.',
  links: 'Sublinhar links',
  linksNota: 'Todo link do texto fica sublinhado.',
  voz: 'Ouvir instruções em português',
  vozNota: 'Cada exercício ganha um botão que lê o enunciado em voz alta. Não lê as respostas.',
  vozIndisponivel: 'Este navegador não tem voz para ler em português.',
  movimento: 'Menos animação',
  movimentoNota: 'Nada entra deslizando nem fica pulsando.',
  voltarAoNormal: 'Voltar ao normal',
  fechar: 'Fechar',
  atalho: 'Atalho: Alt + Shift + A.',
  tituloDoBotao: 'Acessibilidade (Alt + Shift + A)'
} as const;

const en: Traducao<typeof pt> = {
  ajustes: 'Accessibility settings',
  ajustesAtivos: (n: number) => `Accessibility settings (${n} on)`,
  titulo: 'Accessibility',
  guardado: 'Saved on this device, and applies to every page.',
  tamanhoDoTexto: 'Text size',
  tema: 'Theme',
  temaAuto: 'Automatic',
  temaClaro: 'Light',
  temaEscuro: 'Dark',
  temaNota: 'Applies to the course screens. The sales pages are always light.',
  contraste: 'More contrast',
  contrasteNota: 'Darker ink and visible borders.',
  espaco: 'More space between lines',
  espacoNota: 'Larger line height and word spacing.',
  links: 'Underline links',
  linksNota: 'Every link in the text is underlined.',
  /* O leitor de enunciados usa hoje a voz pt-BR do aparelho
     (lib/voz-instrucao.ts); a voz do site em inglês fica para a etapa dele. */
  voz: 'Hear the instructions read aloud',
  vozNota: 'Each exercise gets a button that reads the instructions aloud. It does not read the answers.',
  vozIndisponivel: 'This browser has no voice to read them aloud.',
  movimento: 'Less animation',
  movimentoNota: 'Nothing slides in or keeps pulsing.',
  voltarAoNormal: 'Reset to default',
  fechar: 'Close',
  atalho: 'Shortcut: Alt + Shift + A.',
  tituloDoBotao: 'Accessibility (Alt + Shift + A)'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
