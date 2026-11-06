'use client';

/* O selo de lacre do "Arquivo Aberto": o mesmo da folha do édito, sozinho.
 * Aparece quando um módulo se conclui, e assenta uma vez (com movimento
 * reduzido, já está lá). Não é símbolo religioso nem brasão: só anéis e
 * raios em relevo, como a cera marcada por um sinete qualquer. */

export function Selo({ tamanho = 72, rotulo }: { tamanho?: number; rotulo?: string }) {
  return (
    <svg viewBox="0 0 60 60" width={tamanho} height={tamanho} className="rz-selo-solto" role={rotulo ? 'img' : undefined}
      aria-label={rotulo} aria-hidden={rotulo ? undefined : true}>
      <path d="M30 3 C38 2 46 6 51 12 C57 19 58 28 56 36 C54 45 47 53 38 56 C29 59 19 57 12 51 C5 45 2 36 3 27 C4 17 11 8 20 5 C23 4 27 3 30 3 Z" className="rz-selo-cera" />
      <circle cx="30" cy="30" r="19" fill="none" className="rz-selo-relevo" />
      <circle cx="30" cy="30" r="14" fill="none" className="rz-selo-relevo" />
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i * Math.PI) / 8;
        return <line key={i} x1={30 + Math.cos(a) * 5} y1={30 + Math.sin(a) * 5} x2={30 + Math.cos(a) * 11} y2={30 + Math.sin(a) * 11} className="rz-selo-relevo" />;
      })}
    </svg>
  );
}
