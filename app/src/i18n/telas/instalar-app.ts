import type { Traducao } from '..';

/* components/platform/InstalarApp.tsx */
const pt = {
  titulo: 'O curso no seu celular',
  texto: 'Instale o curso como um app: ele abre direto da tela de início, em tela cheia, sem procurar a página.',
  instalar: 'Instalar o app',
  iosAntes: 'No Safari, toque em',
  iosCompartilhar: 'Compartilhar',
  iosDepois: 'e depois em',
  iosAdicionar: 'Adicionar à Tela de Início',
  outro: 'No menu do navegador, escolha "Instalar app" ou "Adicionar à tela inicial".',
  instalado: 'Pronto: o curso já está na sua tela de início.',
  agoraNao: 'Agora não'
} as const;

const en: Traducao<typeof pt> = {
  titulo: 'The course on your phone',
  texto: 'Install the course as an app: it opens straight from your home screen, full screen, without looking for the page.',
  instalar: 'Install the app',
  iosAntes: 'In Safari, tap',
  iosCompartilhar: 'Share',
  iosDepois: 'and then',
  iosAdicionar: 'Add to Home Screen',
  outro: 'In the browser menu, choose "Install app" or "Add to home screen".',
  instalado: 'Done: the course is already on your home screen.',
  agoraNao: 'Not now'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
