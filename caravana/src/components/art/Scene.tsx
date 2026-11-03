// Ilustracoes da plataforma: paisagens em camadas, no espirito dos cartazes de
// viagem impressos. Sao desenho, nao fotografia, de proposito: enquanto nao ha
// fotos licenciadas (media_assets, kind 'photo'), nada na tela finge ser
// registro de um lugar real.
//
// Cada cena e um SVG 400x260 desenhado por codigo; os elementos repetidos
// (blocos de pedra, ameias, janelas) saem de um gerador com semente fixa, entao
// o desenho e o mesmo no servidor e no navegador.

import type { ReactNode } from 'react';

export const SCENES = ['jerusalem', 'stone', 'galilee', 'desert', 'coast', 'telaviv'] as const;
export type SceneName = (typeof SCENES)[number];

export const SCENE_LABEL: Record<SceneName, string> = {
  jerusalem: 'Muralhas e torres de Jerusalém',
  stone: 'Pedras talhadas',
  galilee: 'Mar da Galileia',
  desert: 'Deserto e Mar Morto',
  coast: 'Colina de Jaffa e o mar',
  telaviv: 'Tel Aviv à beira-mar',
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x6d2b79f5) >>> 0;
    return (s & 0xffff) / 0xffff;
  };
}

type Props = { name?: string | null; className?: string; title?: string; variant?: 'full' | 'band' };

export function Scene({ name, className, title, variant = 'full' }: Props) {
  const scene = (SCENES as readonly string[]).includes(name ?? '') ? (name as SceneName) : 'jerusalem';
  const label = title ?? SCENE_LABEL[scene];
  const viewBox = variant === 'band' ? '0 70 400 150' : '0 0 400 260';
  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label={`Ilustração: ${label}`}>
      {DRAW[scene]()}
    </svg>
  );
}

function Sky({ id, top, bottom }: { id: string; top: string; bottom: string }) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill={`url(#${id})`} />
    </>
  );
}

function cypress(x: number, base: number, h: number, fill: string) {
  return <path key={`c${x}`} d={`M${x} ${base} C${x - 7} ${base - h * 0.35} ${x - 5} ${base - h * 0.8} ${x} ${base - h} C${x + 5} ${base - h * 0.8} ${x + 7} ${base - h * 0.35} ${x} ${base}Z`} fill={fill} />;
}

function water(y: number, h: number, base: string, line: string, seed: number) {
  const r = rng(seed);
  const lines: ReactNode[] = [];
  for (let i = 0; i < 9; i++) {
    const ly = y + 6 + r() * (h - 10);
    const lx = r() * 360;
    lines.push(<rect key={i} x={lx} y={ly} width={18 + r() * 40} height="1.6" rx="0.8" fill={line} opacity={0.55} />);
  }
  return (
    <g>
      <rect x="0" y={y} width="400" height={h} fill={base} />
      {lines}
    </g>
  );
}

const DRAW: Record<SceneName, () => ReactNode> = {
  jerusalem: () => {
    const r = rng(7);
    const houses: ReactNode[] = [];
    for (let x = -6; x < 400; ) {
      const w = 22 + r() * 30;
      const h = 14 + r() * 24;
      houses.push(<rect key={`h${x}`} x={x} y={168 - h} width={w} height={h + 4} fill={r() > 0.5 ? '#dcc6a2' : '#d3bb95'} />);
      x += w - 2;
    }
    const merlons: ReactNode[] = [];
    for (let x = 0; x < 400; x += 15) merlons.push(<rect key={`m${x}`} x={x} y="164" width="8" height="8" fill="#c8ab7f" />);
    const blocks: ReactNode[] = [];
    for (let row = 0; row < 3; row++) {
      let x = row % 2 ? -20 : -4;
      while (x < 400) {
        const w = 34 + r() * 30;
        blocks.push(<rect key={`b${row}-${x}`} x={x + 1.5} y={207 + row * 18} width={w - 3} height="15" rx="1.5" fill={row === 0 ? '#bf9f74' : '#b39268'} />);
        x += w;
      }
    }
    return (
      <>
        <Sky id="sky-jlm" top="#f4e9d6" bottom="#ead6b5" />
        <circle cx="304" cy="82" r="34" fill="#dfa95e" opacity="0.85" />
        <path d="M0 150 C60 128 110 136 160 140 C220 146 262 126 322 130 C362 133 382 140 400 137 V260 H0Z" fill="#d9c4a2" />
        {houses}
        <rect x="174" y="120" width="52" height="30" fill="#cbb48c" />
        <path d="M168 121 A32 30 0 0 1 232 121 Z" fill="#c4913a" />
        <rect x="198.5" y="84" width="3" height="10" fill="#b17f2f" />
        <rect x="96" y="104" width="10" height="64" fill="#c5aa82" />
        <path d="M94 104 L101 90 L108 104Z" fill="#b8996d" />
        <rect x="278" y="98" width="20" height="70" fill="#c2a479" />
        <path d="M276 99 L288 80 L300 99Z" fill="#a98a60" />
        <rect x="285" y="110" width="6" height="10" rx="3" fill="#a3845c" />
        <rect x="0" y="170" width="400" height="90" fill="#cdb187" />
        {merlons}
        <rect x="186" y="182" width="28" height="30" rx="14" fill="#a5885f" />
        {cypress(52, 172, 44, '#5f6a40')}
        {cypress(64, 172, 34, '#6b7548')}
        {cypress(338, 172, 48, '#5f6a40')}
        {cypress(351, 172, 36, '#6b7548')}
        <rect x="0" y="203" width="400" height="57" fill="#a98a62" />
        {blocks}
      </>
    );
  },

  stone: () => {
    const r = rng(23);
    const rows: ReactNode[] = [];
    let y = 22;
    let row = 0;
    while (y < 262) {
      const h = row < 2 ? 26 : 34 + r() * 8;
      let x = -r() * 60;
      while (x < 400) {
        const w = h * (1.6 + r() * 1.6);
        const tone = 196 + Math.floor(r() * 18);
        const fill = `rgb(${tone + 14} ${tone - 4} ${tone - 40})`;
        rows.push(
          <g key={`s${row}-${Math.round(x)}`}>
            <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} rx="2" fill={fill} />
            {row >= 2 && <rect x={x + 9} y={y + 8} width={w - 18} height={h - 16} rx="2" fill="#fff" opacity="0.13" />}
          </g>,
        );
        x += w;
      }
      y += h;
      row++;
    }
    const tufts: ReactNode[] = [];
    for (let i = 0; i < 7; i++) {
      const tx = 20 + r() * 360;
      const ty = 30 + r() * 120;
      tufts.push(<path key={`t${i}`} d={`M${tx} ${ty} q-6 -10 -12 -8 q6 2 9 9 q-2 -12 4 -16 q-1 10 1 15 q4 -8 11 -8 q-7 3 -9 9Z`} fill="#6c7944" />);
    }
    return (
      <>
        <rect width="400" height="260" fill="#9c8462" />
        <rect width="400" height="22" fill="#efe2c8" />
        {rows}
        {tufts}
      </>
    );
  },

  galilee: () => (
    <>
      <Sky id="sky-gal" top="#eef0e8" bottom="#dfe6e2" />
      <circle cx="96" cy="78" r="26" fill="#f2d9a6" />
      <path d="M0 132 C50 118 92 112 140 120 C190 128 230 104 290 108 C340 111 372 120 400 116 V170 H0Z" fill="#9fb1b5" />
      <path d="M0 150 C70 138 120 146 180 142 C250 138 300 150 400 140 V170 H0Z" fill="#8a9e8f" />
      {water(158, 60, '#6d97a7', '#b8d3da', 5)}
      <path d="M196 182 h52 l-8 12 h-38z" fill="#6a4a2e" />
      <rect x="219" y="150" width="2.4" height="32" fill="#6a4a2e" />
      <path d="M221.5 152 L240 178 L221.5 178Z" fill="#efe6d4" />
      <path d="M0 214 C60 206 130 212 200 208 C270 204 330 214 400 208 V260 H0Z" fill="#4c4c47" />
      <path d="M0 230 C80 224 170 232 260 226 C320 222 360 228 400 226 V260 H0Z" fill="#66704a" />
      <path d="M332 226 C330 200 334 186 340 172" stroke="#5a4a36" strokeWidth="3" fill="none" />
      <path d="M340 172 c-16 -2 -26 6 -30 12 M340 172 c14 -6 24 -2 30 6 M340 172 c-6 -12 -18 -16 -26 -14 M340 172 c8 -12 20 -14 28 -10" stroke="#56633a" strokeWidth="5" strokeLinecap="round" fill="none" />
    </>
  ),

  desert: () => (
    <>
      <Sky id="sky-des" top="#f4e1c6" bottom="#ecc79c" />
      <circle cx="92" cy="78" r="38" fill="#e3a35a" opacity="0.9" />
      <path d="M0 150 C40 140 90 132 150 138 C210 144 260 128 330 132 C370 134 390 140 400 138 V180 H0Z" fill="#d6a487" />
      {water(166, 24, '#9fc4c1', '#d5ebe7', 11)}
      <path d="M128 260 L156 172 L168 158 L296 152 L312 166 L338 260Z" fill="#b97f57" />
      <path d="M296 152 L312 166 L338 260 L300 260 L290 170Z" fill="#9f6a48" />
      <path d="M168 158 L296 152 L294 160 L172 165Z" fill="#c98f66" />
      <path d="M0 206 C70 196 120 210 190 204 C260 198 320 212 400 200 V260 H0Z" fill="#dcb68b" />
      <path d="M0 232 C90 222 170 236 250 228 C320 222 360 232 400 228 V260 H0Z" fill="#cfa577" />
    </>
  ),

  coast: () => {
    const r = rng(41);
    const houses: ReactNode[] = [];
    const hill = (x: number) => 170 - 52 * Math.sin(Math.min(1, Math.max(0, x / 320)) * Math.PI);
    for (let x = 18; x < 300; ) {
      const w = 16 + r() * 18;
      const top = hill(x + w / 2) + 6;
      const h = 12 + r() * 16;
      houses.push(
        <g key={`j${x}`}>
          <rect x={x} y={top - h} width={w} height={h + 40} fill={r() > 0.4 ? '#e6d2ae' : '#dcc39a'} />
          <rect x={x + w / 2 - 2.5} y={top - h + 5} width="5" height="7" rx="2.5" fill="#b49567" />
        </g>,
      );
      x += w - 1;
    }
    return (
      <>
        <Sky id="sky-jaf" top="#f1e6d4" bottom="#e9d3b4" />
        <circle cx="330" cy="70" r="24" fill="#e6b26a" opacity="0.85" />
        {water(162, 98, '#4f7e95', '#9fc0cf', 17)}
        <path d="M0 176 C50 150 110 120 170 116 C230 112 280 138 330 176 Z" fill="#d1b083" />
        {houses}
        <rect x="186" y="74" width="14" height="46" fill="#cfb68c" />
        <path d="M184 75 L193 56 L202 75Z" fill="#a98a60" />
        <rect x="112" y="96" width="14" height="30" fill="#d8c19a" />
        <circle cx="119" cy="104" r="4" fill="#f4ead8" stroke="#a58660" strokeWidth="1.2" />
        <path d="M110 97 L119 88 L128 97Z" fill="#b39468" />
        <path d="M340 196 l10 -10 l12 4 l6 12 z" fill="#5a6066" />
        <path d="M358 200 l8 -14 l10 6 l2 10z" fill="#4c5258" />
        <path d="M250 206 h34 l-6 8 h-24z" fill="#6a4a2e" />
        <path d="M0 236 C120 230 260 240 400 232 V260 H0Z" fill="#c9ab7f" />
      </>
    );
  },

  telaviv: () => {
    const r = rng(59);
    const towers: ReactNode[] = [];
    for (let x = 6; x < 380; ) {
      const w = 14 + r() * 22;
      const h = 30 + r() * 70;
      towers.push(<rect key={`t${x}`} x={x} y={170 - h} width={w} height={h} fill={r() > 0.5 ? '#c9bfae' : '#b9b0a2'} />);
      x += w + 2 + r() * 6;
    }
    const bauhaus: ReactNode[] = [];
    for (let x = 0; x < 400; ) {
      const w = 30 + r() * 26;
      bauhaus.push(
        <g key={`bh${x}`}>
          <rect x={x} y="160" width={w} height="26" rx="3" fill="#f4eee2" />
          <rect x={x + 4} y="168" width={w - 8} height="3" fill="#d8ccb8" />
        </g>,
      );
      x += w + 3;
    }
    return (
      <>
        <Sky id="sky-tlv" top="#f2dfc9" bottom="#e8c1a0" />
        <circle cx="300" cy="196" r="44" fill="#e59a5a" opacity="0.9" />
        {towers}
        <rect x="150" y="70" width="22" height="100" rx="11" fill="#a9a196" />
        {bauhaus}
        <rect x="0" y="186" width="400" height="16" fill="#ead7b3" />
        {water(202, 58, '#557f98', '#a9c7d6', 3)}
      </>
    );
  },
};
