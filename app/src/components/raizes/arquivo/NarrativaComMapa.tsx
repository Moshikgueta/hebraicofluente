'use client';

/* A etapa Contextualizar como narrativa com o mapa (protótipo, módulo 3).
 * ─────────────────────────────────────────────────────────────────────────
 * Uma ficha fica fixa no alto: o mapa do módulo e o ano. Conforme o aluno lê,
 * o passo que está no meio da tela acende no mapa os lugares que ELE nomeia
 * (o teste confere que o nome está no texto), e a janela do mapa se move até
 * eles. O texto é o mesmo do módulo, com as mesmas marcas de fonte; os blocos
 * que não são passos (o documento, a caixa) seguem no meio, como sempre.
 *
 * Acessível sem o mapa: cada passo diz, em texto, o ano e os lugares que
 * acendem. A ficha é decorativa para o leitor de tela. Com movimento reduzido,
 * a janela pula em vez de deslizar e nada pulsa. */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Bloco, ExperienciaDoModulo, ModuloRaizes } from '@/lib/raizes';
import { desenhoDoMapa, janelaDoMapa, projetar, raizes } from '@/lib/raizes';
import { curvaEntre, encaixar, type Janela } from '@/lib/raizes-atlas';
import { TextoComFontes } from '../Texto';
import { BlocoRaizes } from '../Blocos';

type Passo = NonNullable<ExperienciaDoModulo['narrativa']>['passos'][number];
type Lugar = { id: string; nome: string; lat: number; lon: number };
const PROPORCAO = 0.9;

const listar = (nomes: string[]) =>
  nomes.length <= 1 ? nomes.join('') : `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;

export function NarrativaComMapa({ m, blocos, passos }: { m: ModuloRaizes; blocos: Bloco[]; passos: Passo[] }) {
  const r = raizes();
  const mapa = Object.values(m.atividades).find(a => a.tipo === 'mapa');
  const d = desenhoDoMapa(mapa && 'desenho' in mapa ? mapa.desenho : undefined);

  /* Os lugares vêm do mapa do próprio módulo e, na falta, do Atlas. */
  const lugares = useMemo(() => {
    const porId = new Map<string, Lugar>();
    for (const l of r.atlas?.lugares ?? []) porId.set(l.id, l);
    if (mapa?.tipo === 'mapa') for (const l of mapa.lugares) porId.set(l.id, l);
    return porId;
  }, [r.atlas, mapa]);
  const nome = (id: string) => (lugares.get(id)?.nome ?? id).replace(/ \(.*\)$/, '');

  /* Até onde vão os passos: o que vem depois (glossário, linha do tempo) sai da narrativa. */
  const titulos = new Set(passos.map(p => p.bloco));
  const ultimo = blocos.reduce((k, b, i) => ('titulo' in b && b.titulo && titulos.has(b.titulo) ? i : k), -1);
  const dentro = blocos.slice(0, ultimo + 1);
  const depois = blocos.slice(ultimo + 1);

  /* A janela de cada passo: os lugares (e reinos) dele, com folga, na proporção da ficha. */
  const janelas = useMemo(() => passos.map(p => {
    const ids = [...p.lugares, ...(p.areas ?? [])];
    const pts = ids.map(id => lugares.get(id)).filter((l): l is Lugar => !!l).map(l => projetar(l.lon, l.lat, d));
    /* Passo sem cidade, ou só com o reino: a janela é o recorte do mapa do módulo. */
    if (pts.length < 2 && !p.lugares.length) return encaixar(janelaDoMapa(mapa?.tipo === 'mapa' ? mapa.recorte : undefined, d), PROPORCAO, d);
    const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]);
    const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
    const lado = Math.max(w, h, d.largura * 0.16);
    const folga = lado * 0.45;
    return encaixar({ x: Math.min(...xs) - folga, y: Math.min(...ys) - folga, w: w + 2 * folga, h: h + 2 * folga }, PROPORCAO, d);
  }), [passos, lugares, d]);

  const [ativo, setAtivo] = useState(0);
  const [janela, setJanela] = useState<Janela>(() => janelas[0]!);
  const raiz = useRef<HTMLDivElement>(null);
  const atual = useRef(janela);

  /* O passo no meio da tela é o ativo; cada passo visto uma vez fica visto. */
  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduzir) el.classList.add('rz-com-movimento');
    const secoes = [...el.querySelectorAll<HTMLElement>('[data-passo]')];
    const ver = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.setAttribute('data-visto', ''); }),
      { rootMargin: '0px 0px -12% 0px' });
    /* O passo ativo é o último cujo título já passou da metade da tela. Medido na
       rolagem (e não por interseção) para não perder passos num salto. */
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      const linha = window.innerHeight * 0.5;
      let k = 0;
      for (const sec of secoes) if (sec.getBoundingClientRect().top < linha) k = Number(sec.getAttribute('data-passo'));
      setAtivo(k);
    };
    const pedir = () => { if (!quadro) quadro = requestAnimationFrame(medir); };
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    medir();
    secoes.forEach(s => ver.observe(s));
    return () => { ver.disconnect(); cancelAnimationFrame(quadro); window.removeEventListener('scroll', pedir); window.removeEventListener('resize', pedir); };
  }, []);

  /* A janela desliza até o passo novo (ou pula, com movimento reduzido). */
  useEffect(() => {
    const alvo = janelas[ativo]!;
    const de = atual.current;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { atual.current = alvo; setJanela(alvo); return; }
    let q = 0;
    const t0 = performance.now();
    const passo = (t: number) => {
      const k = Math.min(1, (t - t0) / 700);
      const e = 1 - Math.pow(1 - k, 3);
      const j = { x: de.x + (alvo.x - de.x) * e, y: de.y + (alvo.y - de.y) * e, w: de.w + (alvo.w - de.w) * e, h: de.h + (alvo.h - de.h) * e };
      atual.current = j;
      setJanela(j);
      if (k < 1) q = requestAnimationFrame(passo);
    };
    q = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(q);
  }, [ativo, janelas]);

  const p = passos[ativo]!;
  const acesos = new Set(p.lugares);
  const todos = [...new Set(passos.flatMap(x => x.lugares))].map(id => lugares.get(id)).filter((l): l is Lugar => !!l);
  const raio = janela.w / 34;
  const rota = p.rota ? r.atlas?.rotas.find(x => x.id === p.rota) : undefined;
  const pontosDaRota = rota?.pontos.map(id => lugares.get(id)).filter((l): l is Lugar => !!l) ?? [];

  return (
    <>
      <div ref={raiz} className="grid gap-7">
        <div className="rz-ficha-mapa -mx-4 px-4 py-2.5" aria-hidden>
          <div className="flex items-center gap-4">
            <svg viewBox={`${janela.x} ${janela.y} ${janela.w} ${janela.h}`} className="h-[132px] w-[119px] shrink-0 rounded-[8px] border border-[var(--linha)] bg-[var(--rz-mar-claro)]">
              <path d={d.terra} fill="var(--rz-terra-mapa)" stroke="var(--pedra-escura)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              {(p.areas ?? []).map(id => {
                const l = lugares.get(id);
                if (!l) return null;
                const [x, y] = projetar(l.lon, l.lat, d);
                return <text key={id} x={x} y={y} textAnchor={x > janela.x + janela.w / 2 ? 'end' : 'start'} fontSize={janela.w / 13} fontStyle="italic" fill="var(--suave)" className="rz-serif">{l.nome.replace(/^Reinos? (de )?/, '')}</text>;
              })}
              {pontosDaRota.length > 1 && (
                <path key={`${p.rota}-${ativo}`} pathLength={1} className="rz-mapa-rota" fill="none" stroke="var(--ocre)" strokeWidth={2.4} strokeLinecap="round" vectorEffect="non-scaling-stroke"
                  d={pontosDaRota.slice(1).map((l, i) => curvaEntre(projetar(pontosDaRota[i]!.lon, pontosDaRota[i]!.lat, d), projetar(l.lon, l.lat, d))).join('')} />
              )}
              {todos.map(l => {
                const [x, y] = projetar(l.lon, l.lat, d);
                const aceso = acesos.has(l.id);
                return (
                  <g key={l.id}>
                    {aceso && <circle key={`a-${ativo}`} cx={x} cy={y} r={raio} className="rz-mapa-anel" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />}
                    <circle cx={x} cy={y} r={aceso ? raio : raio * 0.55} className={`rz-mapa-ponto ${aceso ? 'aceso' : ''}`} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
                  </g>
                );
              })}
            </svg>
            <div className="grid min-w-0 gap-1">
              <span key={p.ano} className="rz-ano rz-ano-troca text-[clamp(30px,9vw,42px)]">{p.ano}</span>
              <span className="font-ui text-[13px] leading-snug text-[var(--corpo)]">
                {p.lugares.length ? listar(p.lugares.map(nome)) : rota ? rota.titulo : 'Portugal'}
              </span>
              <ol className="m-0 flex gap-1 p-0 list-none pt-1">
                {passos.map((_, i) => <li key={i} className={`h-1 w-4 rounded-full ${i <= ativo ? 'bg-[var(--lacre)]' : 'bg-[var(--linha)]'}`} />)}
              </ol>
            </div>
          </div>
        </div>

        {dentro.map((b, i) => {
          const k = 'titulo' in b && b.titulo ? passos.findIndex(x => x.bloco === b.titulo) : -1;
          if (k < 0 || b.tipo !== 'texto') return <BlocoRaizes key={i} b={b} m={m} />;
          const ps = passos[k]!;
          return (
            <section key={i} data-passo={k} className="rz-passo grid gap-4 scroll-mt-[220px]">
              <div className="grid gap-1">
                <h2 className="rz-h2 pt-2">{b.titulo}</h2>
                <p className="m-0 font-ui text-[12.5px] font-semibold uppercase tracking-[.14em] text-[var(--suave)]">
                  No mapa · {ps.ano}{ps.lugares.length ? ` · ${listar(ps.lugares.map(nome))}` : ''}
                </p>
              </div>
              {b.paragrafos.map((t, j) => <TextoComFontes key={j} texto={t} />)}
            </section>
          );
        })}
      </div>
      {depois.map((b, i) => <BlocoRaizes key={`d-${i}`} b={b} m={m} />)}
    </>
  );
}
