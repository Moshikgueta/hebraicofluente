'use client';

/* O objeto de cada unidade (22/10/2026, pedido do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * Cada módulo tem um objeto ligado ao tema dele (a estante de Sefarad, o baú
 * da expulsão, o maço do arquivo, a arca do navio, o fichário dos
 * sobrenomes...). No fim de cada seção, a folha do caderno de viagem daquela
 * seção voa para dentro dele, e os artefatos examinados e os documentos lidos
 * também entram. Tocar no objeto abre o que ele guarda.
 *
 * O que é guardado é progresso de estudo (descobertas `secao:`, `artefato:` e
 * `documento:`), nunca dado de família. A folha não é documento histórico: é a
 * anotação do aluno, e diz isso. Os objetos são desenhos genéricos, sem rosto
 * e sem símbolo religioso. Com movimento reduzido, nada voa nem balança: a
 * contagem muda e o texto diz que guardou. */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { ModuloRaizes } from '@/lib/raizes';
import { useProgress } from '@/lib/state/store';
import { Gravura, VINHETA_DA_SECAO } from './ilustracoes/Gravuras';

type Estilo = 'folhas' | 'livros' | 'pilha' | 'fichas' | 'cartas';
type Desenho = {
  nome: string; artigo: 'o' | 'a'; verbo: string; frase: string; estilo: Estilo;
  /** Onde os itens aparecem: canto esquerdo, base e largura. */
  area: { x: number; y: number; w: number };
  fundo?: ReactNode; frente: ReactNode | ((quantos: number) => ReactNode); tampa?: ReactNode;
  /** Ponto em volta do qual a tampa gira (em unidades do desenho). */
  dobra?: [number, number];
};

const tinta = { stroke: 'var(--rz-objeto-tinta)', strokeWidth: 1.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const P = (d: string, fill = 'none', extra: object = {}) => <path d={d} fill={fill} {...tinta} {...extra} />;

/** Um objeto por módulo. O número é o do módulo. */
export const RECIPIENTES: Record<number, Desenho> = {
  1: {
    nome: 'estante', artigo: 'a', verbo: 'Guardar na estante', estilo: 'livros',
    frase: 'Uma estante para um capítulo de livros, escolas e sábios.',
    area: { x: 16, y: 44, w: 64 },
    frente: <>
      {P('M10 12 H86 V74 H10 Z', 'var(--rz-madeira)')}
      {P('M15 17 H81 V44 H15 Z', 'var(--rz-madeira-fundo)')}
      {P('M15 48 H81 V70 H15 Z', 'var(--rz-madeira-fundo)')}
      {P('M10 44 H86 M10 48 H86', 'none')}
      {P('M6 74 H90', 'none')}
      {P('M22 66 h8 v4 h-8 z M36 64 h6 v6 h-6 z M70 62 l8 -2 l1 10 h-8 z', 'var(--rz-papel-objeto)')}
    </>
  },
  2: {
    nome: 'baú de viagem', artigo: 'o', verbo: 'Guardar no baú', estilo: 'folhas',
    frase: 'Um baú de viagem, para um capítulo de partidas.',
    area: { x: 20, y: 40, w: 56 }, dobra: [12, 38],
    fundo: P('M14 38 H82 V44 H14 Z', 'var(--rz-madeira-fundo)'),
    frente: <>
      {P('M12 38 H84 V72 Q84 74 82 74 H14 Q12 74 12 72 Z', 'var(--rz-madeira)')}
      {P('M26 38 V74 M70 38 V74', 'none', { strokeWidth: 3.2, stroke: 'var(--rz-metal)' })}
      {P('M26 38 V74 M70 38 V74', 'none')}
      {P('M43 46 H53 V58 H43 Z', 'var(--rz-metal)')}
      <circle cx="48" cy="52" r="1.6" fill="var(--rz-objeto-tinta)" />
      {P('M12 60 H84', 'none', { strokeDasharray: '2 3', strokeWidth: 1 })}
    </>,
    tampa: <>
      {P('M12 38 Q12 22 48 22 Q84 22 84 38 Z', 'var(--rz-madeira)')}
      {P('M26 25 Q26 32 26 38 M70 25 Q70 32 70 38', 'none', { strokeWidth: 3.2, stroke: 'var(--rz-metal)' })}
      {P('M43 38 V33 H53 V38', 'var(--rz-metal)')}
    </>
  },
  3: {
    nome: 'maço do arquivo', artigo: 'o', verbo: 'Pôr no maço', estilo: 'pilha',
    frase: 'Um maço de papéis amarrados, como os de um arquivo.',
    area: { x: 18, y: 62, w: 60 },
    fundo: <>
      {P('M14 70 H82 L80 76 H16 Z', 'var(--rz-papel-escuro)')}
      {P('M17 62 H79 V70 H17 Z', 'var(--rz-papel-objeto)')}
      {P('M22 65 H60 M22 67.5 H50', 'none', { strokeWidth: 0.7 })}
    </>,
    frente: (q: number) => {
      const topo = 62 - Math.min(q, 8) * 5;
      return <>
        {P(`M48 ${topo - 1} V76`, 'none', { stroke: 'var(--rz-corda)', strokeWidth: 3 })}
        {P(`M48 ${topo - 1} V76`, 'none', { strokeWidth: 0.8 })}
        {P(`M40 ${topo - 3} Q44 ${topo - 9} 48 ${topo - 1} Q52 ${topo - 9} 56 ${topo - 3} Q52 ${topo + 1} 48 ${topo - 1} Q44 ${topo + 1} 40 ${topo - 3} Z`, 'var(--rz-corda)')}
        {P(`M46 ${topo - 1} L41 ${topo + 8} M50 ${topo - 1} L55 ${topo + 8}`, 'none', { stroke: 'var(--rz-corda)', strokeWidth: 2.4 })}
      </>;
    }
  },
  4: {
    nome: 'pasta de documentos', artigo: 'a', verbo: 'Guardar na pasta', estilo: 'folhas',
    frase: 'Uma pasta de papéis, para um capítulo feito de registros.',
    area: { x: 20, y: 38, w: 56 },
    fundo: P('M12 30 H40 L44 26 H84 V74 H12 Z', 'var(--rz-couro-escuro)'),
    frente: <>
      {P('M12 40 H84 V74 H12 Z', 'var(--rz-couro)')}
      {P('M12 40 L48 56 L84 40', 'none')}
      <circle cx="48" cy="56" r="3.4" fill="var(--rz-metal)" {...tinta} />
      {P('M48 59 C46 66 54 66 52 72', 'none', { stroke: 'var(--rz-corda)', strokeWidth: 1.8 })}
    </>
  },
  5: {
    nome: 'arca do navio', artigo: 'a', verbo: 'Guardar na arca', estilo: 'folhas',
    frase: 'Uma arca de bordo, para um capítulo de rotas pelo mar.',
    area: { x: 18, y: 40, w: 60 }, dobra: [10, 38],
    fundo: P('M12 38 H84 V44 H12 Z', 'var(--rz-madeira-fundo)'),
    frente: <>
      {P('M10 38 H86 L82 74 H14 Z', 'var(--rz-madeira)')}
      {P('M11 50 H85 M12.5 62 H83.5', 'none', { strokeWidth: 1 })}
      {P('M10 38 h8 v8 h-8 z M78 38 h8 v8 h-8 z M14 66 h8 v8 h-8 z M74 66 h8 v8 h-8 z', 'var(--rz-metal)')}
      {P('M2 50 Q4 58 11 56 M94 50 Q92 58 85 56', 'none', { stroke: 'var(--rz-corda)', strokeWidth: 2.6 })}
    </>,
    tampa: <>
      {P('M8 38 H88 V28 Q88 26 86 26 H10 Q8 26 8 28 Z', 'var(--rz-madeira)')}
      {P('M30 32 a6 3 0 1 0 12 0 a6 3 0 1 0 -12 0 M33 32 a3 1.5 0 1 0 6 0 a3 1.5 0 1 0 -6 0', 'none', { stroke: 'var(--rz-corda)', strokeWidth: 1.8 })}
      {P('M60 26 V38 M66 26 V38', 'none', { stroke: 'var(--rz-metal)', strokeWidth: 2.4 })}
    </>
  },
  6: {
    nome: 'caixa de cartas', artigo: 'a', verbo: 'Guardar na caixa de cartas', estilo: 'cartas',
    frase: 'Uma caixa de cartas, para um capítulo entre margens do oceano.',
    area: { x: 18, y: 48, w: 60 },
    fundo: P('M14 34 H82 V48 H14 Z', 'var(--rz-madeira-fundo)'),
    frente: <>
      {P('M10 46 H86 V74 H10 Z', 'var(--rz-madeira)')}
      {P('M10 46 H86', 'none', { strokeWidth: 2.4 })}
      {P('M36 56 H60 V66 H36 Z', 'var(--rz-papel-objeto)')}
      {P('M39 60 H57 M39 63 H51', 'none', { strokeWidth: 0.9 })}
    </>
  },
  7: {
    nome: 'fichário', artigo: 'o', verbo: 'Arquivar no fichário', estilo: 'fichas',
    frase: 'Um fichário, para um capítulo de nomes, registros e cuidado com o que eles provam.',
    area: { x: 22, y: 46, w: 52 },
    fundo: P('M16 34 H80 V46 H16 Z', 'var(--rz-madeira-fundo)'),
    frente: <>
      {P('M14 44 H82 V74 H14 Z', 'var(--rz-madeira)')}
      {P('M36 52 H60 V60 H36 Z', 'var(--rz-metal)')}
      {P('M39 55 H57', 'none', { strokeWidth: 0.9 })}
      {P('M42 66 Q48 70 54 66', 'none', { strokeWidth: 2.4, stroke: 'var(--rz-metal)' })}
      {P('M42 66 Q48 70 54 66', 'none', { strokeWidth: 0.8 })}
    </>
  },
  8: {
    nome: 'caderno de anotações', artigo: 'o', verbo: 'Anotar no caderno', estilo: 'folhas',
    frase: 'Um caderno, para um capítulo de línguas, canções e costumes.',
    area: { x: 24, y: 34, w: 48 },
    fundo: P('M18 30 H80 V72 H18 Z', 'var(--rz-papel-escuro)'),
    frente: <>
      {P('M14 32 H78 Q82 32 82 36 V70 Q82 74 78 74 H14 Z', 'var(--rz-couro)')}
      {P('M14 32 V74', 'none', { strokeWidth: 3.2, stroke: 'var(--rz-couro-escuro)' })}
      {P('M22 38 H74 V68 H22 Z', 'none', { strokeDasharray: '1.5 3', strokeWidth: 0.9, stroke: 'var(--rz-papel-escuro)' })}
      {P('M70 32 V74', 'none', { strokeWidth: 2.6, stroke: 'var(--rz-couro-escuro)' })}
      {P('M30 48 H62 V58 H30 Z', 'var(--rz-papel-objeto)')}
      {P('M34 52 H58 M34 55 H50', 'none', { strokeWidth: 0.8 })}
      {P('M58 74 L60 84 L62.5 80 L65 84 L63 74', 'var(--rz-ocre-objeto)')}
    </>
  },
  9: {
    nome: 'caixa de arquivo', artigo: 'a', verbo: 'Guardar na caixa de arquivo', estilo: 'folhas',
    frase: 'Uma caixa de arquivo, para a sua própria investigação.',
    area: { x: 20, y: 40, w: 56 }, dobra: [12, 32],
    fundo: P('M14 36 H82 V44 H14 Z', 'var(--rz-papel-escuro)'),
    frente: <>
      {P('M12 36 H84 V74 H12 Z', 'var(--rz-papelao)')}
      {P('M38 46 H58 V58 H38 Z', 'var(--rz-papel-objeto)')}
      {P('M41 50 H55 M41 54 H51', 'none', { strokeWidth: 0.9 })}
      {P('M42 66 Q48 62 54 66 Q48 70 42 66 Z', 'var(--rz-papel-escuro)')}
    </>,
    tampa: P('M10 30 H86 V37 H10 Z', 'var(--rz-papelao)')
  },
  10: {
    nome: 'caixa de memórias', artigo: 'a', verbo: 'Guardar na caixa de memórias', estilo: 'folhas',
    frase: 'Uma caixa de lembranças, para um capítulo sobre o que se herda e o que se escolhe guardar.',
    area: { x: 20, y: 42, w: 56 }, dobra: [12, 40],
    fundo: P('M14 40 H82 V46 H14 Z', 'var(--rz-madeira-fundo)'),
    frente: <>
      {P('M12 40 H84 V74 H12 Z', 'var(--rz-ocre-objeto)')}
      {P('M48 40 V74', 'none', { stroke: 'var(--rz-papel-objeto)', strokeWidth: 4 })}
      {P('M48 40 V74', 'none', { strokeWidth: 0.8 })}
      {P('M16 44 H80 V70 H16 Z', 'none', { strokeDasharray: '1.5 3', strokeWidth: 1 })}
    </>,
    tampa: <>
      {P('M10 40 H86 V31 H10 Z', 'var(--rz-ocre-objeto)')}
      {P('M48 31 V40', 'none', { stroke: 'var(--rz-papel-objeto)', strokeWidth: 4 })}
      {P('M41 28 Q44 23 48 30 Q52 23 55 28 Q52 32 48 30 Q44 32 41 28 Z', 'var(--rz-papel-objeto)')}
    </>
  }
};

export const recipienteDo = (n: number): Desenho => RECIPIENTES[n] ?? RECIPIENTES[2]!;
export const nomeDoRecipiente = (n: number) => { const r = recipienteDo(n); return `${r.artigo} ${r.nome}`; };

/* Tons fixos das folhas e lombadas: são objetos, não texto. */
const CORES = ['var(--rz-papel-objeto)', '#EFE4CC', '#F6EEDC', '#E9DDC2'];
const LOMBADAS = ['#8E2B1F', '#1D545E', '#8A6420', '#4E5B3A', '#6B4329', '#2E4A6B', '#7A3E5A', '#3B5B4F'];

/** Os itens dentro do objeto: até 8 desenhados, do jeito que o objeto guarda. */
function Itens({ d, quantos }: { d: Desenho; quantos: number }) {
  const n = Math.min(quantos, 8);
  const { x, y, w } = d.area;
  const lista = Array.from({ length: n }, (_, i) => i);
  switch (d.estilo) {
    case 'livros': {
      /* Quatro na prateleira de cima, depois quatro embaixo. */
      return <>{lista.map(i => {
        const linha = i < 4 ? 0 : 1, k = i % 4;
        const alt = 20 - ((i * 5) % 6), larg = 8 + (i % 3);
        const bx = x + 2 + k * 15 + (linha ? 0 : 1), by = (linha ? 70 : 44) - alt;
        return (
          <g key={i} className="rz-item" style={{ ['--i' as string]: i }}>
            <rect x={bx} y={by} width={larg} height={alt} rx={1} fill={LOMBADAS[i]} {...tinta} />
            <path d={`M${bx + 2} ${by + 4} H${bx + larg - 2} M${bx + 2} ${by + alt - 4} H${bx + larg - 2}`} stroke="#F3E6C8" strokeWidth={0.9} />
          </g>
        );
      })}</>;
    }
    case 'pilha':
      return <>{lista.map(i => (
        <rect key={i} className="rz-item" style={{ ['--i' as string]: i }} x={x + ((i * 3) % 5) - 2} y={y - 5 - i * 5} width={w} height={5} rx={0.6}
          fill={CORES[i % CORES.length]} {...tinta} strokeWidth={1.1} />
      ))}</>;
    case 'fichas':
      return <>{lista.map(i => {
        const fx = x + i * (w / 9);
        return (
          <g key={i} className="rz-item" style={{ ['--i' as string]: i }}>
            <path d={`M${fx} ${y} V${y - 18} H${fx + 3} V${y - 22 - (i % 2) * 2} H${fx + 9} V${y - 18} H${fx + 12} V${y}`} fill={CORES[i % CORES.length]} {...tinta} strokeWidth={1.1} />
          </g>
        );
      })}</>;
    case 'cartas':
      return <>{lista.map(i => {
        const cx = x + (i % 4) * 14 + (i > 3 ? 7 : 0), cy = y - 12 - (i > 3 ? 6 : 0), rot = ((i * 7) % 11) - 5;
        return (
          <g key={i} className="rz-item" style={{ ['--i' as string]: i }} transform={`rotate(${rot} ${cx + 9} ${cy + 7})`}>
            <rect x={cx} y={cy} width={18} height={13} rx={0.8} fill={CORES[i % CORES.length]} {...tinta} strokeWidth={1.1} />
            <path d={`M${cx} ${cy} L${cx + 9} ${cy + 7} L${cx + 18} ${cy}`} fill="none" {...tinta} strokeWidth={1} />
          </g>
        );
      })}</>;
    default:
      return <>{lista.map(i => {
        const fx = x + ((i * 13) % Math.max(1, w - 24)), rot = ((i * 5) % 9) - 4;
        return (
          <g key={i} className="rz-item" style={{ ['--i' as string]: i }} transform={`rotate(${rot} ${fx + 12} ${y})`}>
            <rect x={fx} y={y - 14 - (i % 3) * 2} width={24} height={18} rx={0.8} fill={CORES[i % CORES.length]} {...tinta} strokeWidth={1.1} />
            <path d={`M${fx + 4} ${y - 9 - (i % 3) * 2} H${fx + 18} M${fx + 4} ${y - 6 - (i % 3) * 2} H${fx + 15}`} stroke="var(--rz-objeto-tinta)" strokeWidth={0.8} />
          </g>
        );
      })}</>;
  }
}

/** O desenho do objeto, com o que ele já guarda. `recebendo` abre a tampa e balança. */
export function Recipiente({ n, quantos, recebendo = false, className = '' }: { n: number; quantos: number; recebendo?: boolean; className?: string }) {
  const d = recipienteDo(n);
  const [ox, oy] = d.dobra ?? [48, 40];
  return (
    <svg viewBox="0 0 96 80" className={`rz-recipiente ${recebendo ? 'recebendo' : ''} ${className}`} aria-hidden>
      <ellipse cx="48" cy="76" rx="40" ry="3" fill="var(--rz-objeto-sombra)" />
      <g className="rz-recipiente-corpo">
        {d.fundo}
        <Itens d={d} quantos={quantos} />
        {typeof d.frente === 'function' ? d.frente(quantos) : d.frente}
        {d.tampa && <g className="rz-tampa" style={{ transformOrigin: `${ox}px ${oy}px` }}>{d.tampa}</g>}
      </g>
    </svg>
  );
}

/* ── o que o objeto do módulo guarda ─────────────────────────────────── */

const mm = (n: number) => `m${String(n).padStart(2, '0')}`;
export const chaveDaFolha = (n: number, etapa: string) => `secao:${mm(n)}:${etapa}`;

export type Guardado = { chave: string; tipo: 'folha' | 'artefato' | 'documento'; titulo: string; detalhe: string; etapa: string; gravura: string };

/** Tudo o que o módulo PODE guardar: uma folha por seção, os artefatos e os documentos para ler. */
export function guardaveis(m: ModuloRaizes): Guardado[] {
  const lista: Guardado[] = [];
  m.etapas.forEach((e, k) => {
    lista.push({ chave: chaveDaFolha(m.n, e.id), tipo: 'folha', titulo: e.pergunta, detalhe: `Folha ${String(k + 1).padStart(2, '0')} · ${e.titulo}`, etapa: e.id, gravura: e.vinheta ?? VINHETA_DA_SECAO[e.id] ?? 'documento' });
    for (const b of e.blocos) {
      if (b.tipo === 'artefatos') for (const a of b.itens) lista.push({ chave: `artefato:${mm(m.n)}:${a.id}`, tipo: 'artefato', titulo: a.nome, detalhe: `Artefato · ${a.quando}`, etapa: e.id, gravura: a.gravura });
      if (b.tipo === 'documento') lista.push({ chave: `documento:${b.id}`, tipo: 'documento', titulo: b.titulo, detalhe: 'Documento lido por inteiro', etapa: e.id, gravura: 'documento' });
    }
  });
  return lista;
}

/* ── a folha do fim de cada seção ────────────────────────────────────── */

/** O evento que diz ao objeto do módulo que algo acabou de entrar. */
const EVENTO = 'rz-guardou';

/** A folha do caderno de viagem: aparece no fim da seção e, vista, voa para o objeto. */
export function FolhaDaSecao({ m, etapa, numero }: { m: ModuloRaizes; etapa: ModuloRaizes['etapas'][number]; numero: number }) {
  const p = useProgress();
  const chave = chaveDaFolha(m.n, etapa.id);
  const guardada = !!p.state.raizes?.descobertas?.[chave];
  const folha = useRef<HTMLDivElement>(null);
  const [voando, setVoando] = useState(false);
  const d = recipienteDo(m.n);

  useEffect(() => {
    const el = folha.current;
    if (!el || guardada || !p.ready) return;
    const ob = new IntersectionObserver(([en]) => {
      if (!en?.isIntersecting) return;
      ob.disconnect();
      /* Espera um instante com a folha à vista, para o gesto ser visto. */
      window.setTimeout(() => voar(), 650);
    }, { threshold: 0.75 });
    ob.observe(el);
    return () => ob.disconnect();
  }, [guardada, p.ready]);

  function voar() {
    const el = folha.current;
    const alvo = document.getElementById('rz-objeto-do-modulo');
    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!el || !alvo || reduzir || !el.animate) { p.descobrirRaizes(chave); window.dispatchEvent(new Event(EVENTO)); return; }
    const a = el.getBoundingClientRect(), b = alvo.getBoundingClientRect();
    const copia = el.cloneNode(true) as HTMLElement;
    Object.assign(copia.style, { position: 'fixed', left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`, margin: '0', zIndex: '60', pointerEvents: 'none' });
    copia.setAttribute('aria-hidden', 'true');
    document.body.appendChild(copia);
    setVoando(true);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height * 0.35 - (a.top + a.height / 2);
    const fim = Math.max(0.06, (b.width * 0.5) / a.width);
    const anima = copia.animate([
      { transform: 'translate(0,0) rotate(0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.35}px, ${dy * 0.35 - 70}px) rotate(-8deg) scale(.62)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) rotate(-16deg) scale(${fim})`, opacity: 0.2 }
    ], { duration: 900, easing: 'cubic-bezier(.45,.05,.3,1)', fill: 'forwards' });
    anima.onfinish = () => {
      copia.remove();
      setVoando(false);
      p.descobrirRaizes(chave);
      window.dispatchEvent(new Event(EVENTO));
    };
  }

  return (
    <aside className="rz-folha-secao grid gap-2" aria-label={`Folha ${numero} do seu caderno de viagem`}>
      <div ref={folha} className={`rz-folha ${guardada ? 'guardada' : ''} ${voando ? 'some' : ''}`}>
        <div className="flex items-start gap-3">
          <Gravura nome={etapa.vinheta ?? VINHETA_DA_SECAO[etapa.id] ?? 'documento'} className="h-[44px] w-[58px] shrink-0 text-[var(--rz-objeto-tinta)]" />
          <div className="grid min-w-0 gap-0.5">
            <span className="rz-rot !text-[10px] !text-[var(--rz-objeto-tinta-suave)]">Caderno de viagem · folha {String(numero).padStart(2, '0')} · {etapa.titulo}</span>
            <span className="rz-serif text-[16.5px] leading-snug text-[var(--rz-objeto-tinta)]">{etapa.pergunta}</span>
          </div>
        </div>
        {guardada && <span className="rz-folha-carimbo" aria-hidden>guardada</span>}
      </div>
      <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-[13px] text-[var(--suave)]" aria-live="polite">
        {guardada
          ? <><span className="font-semibold text-[var(--teal-ink)]">✓ Guardada {d.artigo === 'a' ? 'na' : 'no'} {d.nome}.</span></>
          : <>
              <span>Ao terminar a seção, esta folha vai para {d.artigo} {d.nome}.</span>
              <button type="button" className="rz-link !text-[13px] min-h-[40px]" onClick={voar}>{d.verbo} agora</button>
            </>}
      </p>
    </aside>
  );
}

/* ── o objeto flutuante e o que ele guarda ───────────────────────────── */

export function ObjetoDoModulo({ m }: { m: ModuloRaizes }) {
  const p = useProgress();
  const d = recipienteDo(m.n);
  const todos = guardaveis(m);
  const descobertas = p.state.raizes?.descobertas ?? {};
  const dentro = todos.filter(g => descobertas[g.chave]);
  const [recebendo, setRecebendo] = useState(false);
  const dialogo = useRef<HTMLDialogElement>(null);
  const antes = useRef(dentro.length);

  /* Balança quando entra algo (pelo voo da folha ou por um artefato aberto). */
  useEffect(() => {
    if (dentro.length > antes.current) {
      setRecebendo(true);
      const t = window.setTimeout(() => setRecebendo(false), 950);
      antes.current = dentro.length;
      return () => window.clearTimeout(t);
    }
    antes.current = dentro.length;
  }, [dentro.length]);
  useEffect(() => {
    const f = () => { setRecebendo(true); window.setTimeout(() => setRecebendo(false), 950); };
    window.addEventListener(EVENTO, f);
    return () => window.removeEventListener(EVENTO, f);
  }, []);

  const ir = (etapa: string) => {
    dialogo.current?.close();
    requestAnimationFrame(() => document.getElementById(`secao-${etapa}`)?.scrollIntoView({ block: 'start' }));
  };
  const grupos: { tipo: Guardado['tipo']; titulo: string }[] = [
    { tipo: 'folha', titulo: 'Folhas do caderno de viagem' },
    { tipo: 'artefato', titulo: 'Artefatos examinados' },
    { tipo: 'documento', titulo: 'Documentos lidos' }
  ];

  return (
    <>
      <button type="button" id="rz-objeto-do-modulo" onClick={() => dialogo.current?.showModal()}
        aria-label={`${d.artigo === 'a' ? 'A' : 'O'} ${d.nome}: ${dentro.length} de ${todos.length} guardados. Abrir.`}
        className={`rz-objeto-flutuante ${recebendo ? 'recebendo' : ''}`}>
        <Recipiente n={m.n} quantos={dentro.filter(g => g.tipo === 'folha').length + dentro.filter(g => g.tipo !== 'folha').length} recebendo={recebendo} className="h-[46px] w-[56px]" />
        <span className="rz-objeto-conta tabular-nums">{dentro.length}/{todos.length}</span>
      </button>

      <dialog ref={dialogo} className="rz-folha-de-baixo" aria-labelledby="objeto-titulo"
        onClick={e => { if (e.target === e.currentTarget) e.currentTarget.close(); }}>
        <div className="grid gap-4 p-5">
          <header className="grid grid-cols-[96px_1fr] items-center gap-3">
            <Recipiente n={m.n} quantos={dentro.length} className="h-[80px] w-[96px]" />
            <div className="grid gap-1">
              <p className="rz-rot ocre m-0">Módulo {m.n} · {dentro.length} de {todos.length}</p>
              <h2 id="objeto-titulo" className="rz-h3 first-letter:uppercase">{d.artigo} {d.nome}</h2>
              <p className="m-0 font-ui text-[13px] leading-snug text-[var(--suave)]">{d.frase}</p>
            </div>
          </header>
          {grupos.map(gr => {
            const itens = todos.filter(g => g.tipo === gr.tipo);
            if (!itens.length) return null;
            return (
              <section key={gr.tipo} className="grid gap-1">
                <h3 className="rz-rot m-0">{gr.titulo} · {itens.filter(g => descobertas[g.chave]).length} de {itens.length}</h3>
                <ul className="m-0 grid gap-1 p-0 list-none">
                  {itens.map(g => {
                    const tem = !!descobertas[g.chave];
                    return (
                      <li key={g.chave}>
                        <button type="button" onClick={() => ir(g.etapa)} className={`rz-guardado ${tem ? 'tem' : ''}`}>
                          <Gravura nome={g.gravura} className="h-[30px] w-[40px] shrink-0 text-[var(--ocre)]" />
                          <span className="grid min-w-0 gap-0.5 text-left">
                            <span className="font-ui text-[11.5px] text-[var(--suave)]">{tem ? g.detalhe : `${g.detalhe} · ainda não`}</span>
                            <span className="rz-serif text-[15.5px] leading-snug text-[var(--titulo)] line-clamp-2">{g.titulo}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
          <p className="m-0 font-ui text-[12.5px] leading-relaxed text-[var(--suave)]">
            As folhas são anotações do seu caderno, não documentos da época. O que está aqui é o que você estudou; não diz nada sobre a sua família.
          </p>
          <button type="button" className="rz-botao claro justify-self-start" onClick={() => dialogo.current?.close()}>Fechar</button>
        </div>
      </dialog>
    </>
  );
}
