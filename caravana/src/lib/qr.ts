import { renderSVG } from 'uqr';

// QR em SVG, gerado no servidor a partir de um endereco que a plataforma montou.
export function qrSvg(url: string): string {
  return renderSVG(url, { border: 1, ecc: 'M', blackColor: '#17283a', whiteColor: '#ffffff' });
}
