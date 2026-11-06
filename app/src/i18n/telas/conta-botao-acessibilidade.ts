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
  sons: 'Sons do curso',
  sonsNota: 'Um plim curto no acerto. As gravações das palavras não mudam.',
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
  sons: 'Course sounds',
  sonsNota: 'A short chime on a right answer. The word recordings do not change.',
  movimento: 'Less animation',
  movimentoNota: 'Nothing slides in or keeps pulsing.',
  voltarAoNormal: 'Reset to default',
  fechar: 'Close',
  atalho: 'Shortcut: Alt + Shift + A.',
  tituloDoBotao: 'Accessibility (Alt + Shift + A)'
};

const es: Traducao<typeof pt> = {
  ajustes: 'Ajustes de accesibilidad',
  ajustesAtivos: (n: number) => `Ajustes de accesibilidad (${n} activo${n > 1 ? 's' : ''})`,
  titulo: 'Accesibilidad',
  guardado: 'Queda guardado en este dispositivo y vale en todas las páginas.',
  tamanhoDoTexto: 'Tamaño del texto',
  tema: 'Tema',
  temaAuto: 'Automático',
  temaClaro: 'Claro',
  temaEscuro: 'Oscuro',
  temaNota: 'Vale en las pantallas del curso. Las páginas de venta son siempre claras.',
  contraste: 'Más contraste',
  contrasteNota: 'Tinta más oscura y bordes visibles.',
  espaco: 'Más espacio entre líneas',
  espacoNota: 'Interlineado y espacio entre palabras más grandes.',
  links: 'Subrayar enlaces',
  linksNota: 'Todo enlace del texto queda subrayado.',
  /* O leitor de enunciados usa hoje a voz pt-BR do aparelho
     (lib/voz-instrucao.ts); a voz do site em espanhol fica para a etapa dele. */
  voz: 'Escuchar las instrucciones en voz alta',
  vozNota: 'Cada ejercicio recibe un botón que lee el enunciado en voz alta. No lee las respuestas.',
  vozIndisponivel: 'Este navegador no tiene voz para leerlas en voz alta.',
  sons: 'Sonidos del curso',
  sonsNota: 'Un tintineo corto al acertar. Las grabaciones de las palabras no cambian.',
  movimento: 'Menos animación',
  movimentoNota: 'Nada entra deslizándose ni queda latiendo.',
  voltarAoNormal: 'Volver a lo normal',
  fechar: 'Cerrar',
  atalho: 'Atajo: Alt + Shift + A.',
  tituloDoBotao: 'Accesibilidad (Alt + Shift + A)'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
