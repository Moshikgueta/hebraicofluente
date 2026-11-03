import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/newsreader/opsz.css';
import '@fontsource-variable/newsreader/opsz-italic.css';
import '@fontsource-variable/hanken-grotesk/wght.css';
import '@fontsource-variable/frank-ruhl-libre/wght.css';
import '@fontsource-variable/noto-sans-hebrew/wght.css';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Minha Caravana Digital', template: '%s · Minha Caravana Digital' },
  description: 'Experiências digitais para caravanas a Israel: roteiro, cultura, hebraico e passaporte, com a marca da sua agência.',
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#faf6ee',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
