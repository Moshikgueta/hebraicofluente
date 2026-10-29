import type { Traducao } from '..';

/* components/learn/GuiaTeclado.tsx. Os nomes dos menus são os da interface
   do sistema no idioma do site. */
const pt = {
  ios: 'iPhone e iPad',
  android: 'Android',
  windows: 'Windows',
  mac: 'Mac',

  ios1t: 'Abra os ajustes do teclado',
  ios1x: 'Ajustes → Geral → Teclado → Teclados.',
  ios2t: 'Adicione o hebraico',
  ios2x: 'Toque em “Adicionar Novo Teclado…” e escolha “Hebraico” ({{עברית}}).',
  ios3t: 'Alterne entre os teclados',
  ios3x: 'No teclado, toque no globo 🌐 ao lado da barra de espaço. Segurando o globo, aparece a lista para escolher.',
  ios4t: 'Confira que está ativo',
  ios4x: 'As teclas mostram letras hebraicas - {{ק ר א ט}} na primeira linha - e a barra de espaço diz “{{עברית}}”.',

  android1t: 'Abra as configurações do teclado',
  android1x: 'Com o teclado aberto, toque na engrenagem ⚙ do Gboard. Ou: Configurações → Sistema → Teclado → Teclado na tela → Gboard (em aparelhos mais antigos, “Idiomas e entrada” no lugar de “Teclado”). Em Samsung, o teclado de fábrica é o Teclado Samsung: Configurações → Gerenciamento geral → Configurações do Teclado Samsung.',
  android2t: 'Adicione o hebraico',
  android2x: 'No Gboard: Idiomas → Adicionar teclado → procure “Hebraico” ({{עברית}}) → Concluído. No Teclado Samsung: Idiomas e tipos → Gerenciar idiomas de entrada → ative “{{עברית}}”.',
  android3t: 'Alterne entre os teclados',
  android3x: 'Toque no globo 🌐 do teclado, ou toque e segure a barra de espaço e escolha o idioma. No Teclado Samsung, segure a barra de espaço e deslize para o lado.',
  android4t: 'Confira que está ativo',
  android4x: 'A barra de espaço mostra “{{עברית}}” e as teclas trazem letras hebraicas.',

  windows1t: 'Abra as configurações de idioma',
  windows1x: 'Configurações → Hora e idioma → Idioma e região.',
  windows2t: 'Adicione o hebraico',
  windows2x: 'Em “Idiomas preferenciais”, clique em “Adicionar um idioma”, escolha “Hebraico” e instale. Pode desmarcar os extras - só o teclado é necessário.',
  windows3t: 'Alterne entre os teclados',
  windows3x: 'Tecla Windows + Barra de espaço. Ou clique na sigla do idioma (POR) na barra de tarefas, perto do relógio.',
  windows4t: 'Confira que está ativo',
  windows4x: 'A sigla perto do relógio muda para HEB.',

  mac1t: 'Abra os ajustes do teclado',
  mac1x: 'Menu Apple (a maçã, no canto) → Ajustes do Sistema → Teclado → em “Fontes de Entrada”, clique em “Editar…”.',
  mac2t: 'Adicione o hebraico',
  mac2x: 'Clique em “+”, escolha “Hebraico” na lista e depois o teclado “Hebraico”. Clique em “Adicionar”.',
  mac3t: 'Alterne entre os teclados',
  mac3x: 'Control + Barra de espaço, ou a tecla 🌐 (fn) nos Macs mais novos. Também dá para escolher no menu de fontes, no alto da tela.',
  mac4t: 'Confira que está ativo',
  mac4x: 'O ícone de idioma no alto da tela muda para o hebraico.',

  seuAparelho: 'O seu aparelho',
  escolha: 'Escolha o seu aparelho',
  teste: 'Teste aqui: troque para o hebraico e digite qualquer letra',
  ativo: '✓ O teclado hebraico está ativo.',
  latino: 'Isso é o teclado em português. Troque de teclado e tente de novo.',
  soDigitacao:
    'O teclado hebraico só é usado nos exercícios de digitação. Nas lições, nas leituras e nos jogos, tudo se faz tocando - você não precisa trocar de teclado.',
  jaAdicionei: 'Já adicionei o teclado hebraico',
  dica: 'Dica: faça o teste acima antes de confirmar.'
} as const;

const en: Traducao<typeof pt> = {
  ios: 'iPhone and iPad',
  android: 'Android',
  windows: 'Windows',
  mac: 'Mac',

  ios1t: 'Open the keyboard settings',
  ios1x: 'Settings → General → Keyboard → Keyboards.',
  ios2t: 'Add Hebrew',
  ios2x: 'Tap “Add New Keyboard…” and choose “Hebrew” ({{עברית}}).',
  ios3t: 'Switch between keyboards',
  ios3x: 'On the keyboard, tap the globe 🌐 next to the space bar. Hold the globe and a list appears to choose from.',
  ios4t: 'Check that it is on',
  ios4x: 'The keys show Hebrew letters - {{ק ר א ט}} on the top row - and the space bar says “{{עברית}}”.',

  android1t: 'Open the keyboard settings',
  android1x: 'With the keyboard open, tap the Gboard gear ⚙. Or: Settings → System → Keyboard → On-screen keyboard → Gboard (on older devices, “Languages & input” instead of “Keyboard”). On Samsung, the built-in keyboard is Samsung Keyboard: Settings → General management → Samsung Keyboard settings.',
  android2t: 'Add Hebrew',
  android2x: 'In Gboard: Languages → Add keyboard → search for “Hebrew” ({{עברית}}) → Done. In Samsung Keyboard: Languages and types → Manage input languages → turn on “{{עברית}}”.',
  android3t: 'Switch between keyboards',
  android3x: 'Tap the globe 🌐 on the keyboard, or tap and hold the space bar and choose the language. On Samsung Keyboard, hold the space bar and slide sideways.',
  android4t: 'Check that it is on',
  android4x: 'The space bar shows “{{עברית}}” and the keys show Hebrew letters.',

  windows1t: 'Open the language settings',
  windows1x: 'Settings → Time & language → Language & region.',
  windows2t: 'Add Hebrew',
  windows2x: 'Under “Preferred languages”, click “Add a language”, choose “Hebrew” and install it. You can uncheck the extras - only the keyboard is needed.',
  windows3t: 'Switch between keyboards',
  windows3x: 'Windows key + Space bar. Or click the language abbreviation (ENG) on the taskbar, near the clock.',
  windows4t: 'Check that it is on',
  windows4x: 'The abbreviation near the clock changes to HEB.',

  mac1t: 'Open the keyboard settings',
  mac1x: 'Apple menu (the apple, in the corner) → System Settings → Keyboard → under “Input Sources”, click “Edit…”.',
  mac2t: 'Add Hebrew',
  mac2x: 'Click “+”, choose “Hebrew” in the list and then the “Hebrew” keyboard. Click “Add”.',
  mac3t: 'Switch between keyboards',
  mac3x: 'Control + Space bar, or the 🌐 (fn) key on newer Macs. You can also choose it from the input menu at the top of the screen.',
  mac4t: 'Check that it is on',
  mac4x: 'The language icon at the top of the screen changes to Hebrew.',

  seuAparelho: 'Your device',
  escolha: 'Choose your device',
  teste: 'Test it here: switch to Hebrew and type any letter',
  ativo: '✓ The Hebrew keyboard is on.',
  latino: 'That is your English keyboard. Switch keyboards and try again.',
  soDigitacao:
    'The Hebrew keyboard is only used in the typing exercises. In the lessons, the readings and the games, everything is done by tapping - you do not need to switch keyboards.',
  jaAdicionei: 'I have added the Hebrew keyboard',
  dica: 'Tip: try the test above before confirming.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
