'use client';

/* O Atlas de Raízes Sefarditas (protótipo, 22/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Dois modos sobre o mesmo mapa: Lugares (filtrados pelo período e pelo
 * tipo) e os Caminhos do Exílio (rotas que se desenham com a linha do tempo,
 * cada uma no estilo do seu nível de evidência). Os dados vêm de
 * raizes/data/atlas.json; a geometria, de lib/raizes-atlas.ts. */

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Heroi } from '@/components/raizes/Heroi';
import { AtlasMapa, ESTILO_DA_EVIDENCIA, LegendaDasRotas } from '@/components/raizes/AtlasMapa';
import { PainelDeFonte } from '@/components/raizes/Texto';
import { desenhoDoMapa, fotosDe, raizes, type TipoDeLugar } from '@/lib/raizes';
import { Foto } from '@/components/raizes/Foto';
import { anosDosCaminhos, lugaresVisiveis, rotasAte, VISTAS } from '@/lib/raizes-atlas';
import { SemConteudo } from '@/app/raizes/RaizesHomeClient';
import { Guardar } from '@/components/raizes/Guardar';
import { useProgress } from '@/lib/state/store';

type Modo = 'lugares' | 'caminhos';

export function AtlasClient() {
  const r = raizes();
  const atlas = r.atlas;
  const desenho = desenhoDoMapa('atlantico');
  const [modo, setModo] = useState<Modo>('lugares');
  const [periodo, setPeriodo] = useState<string | null>(null);
  const [tipos, setTipos] = useState<Set<TipoDeLugar>>(new Set());
  const [sel, setSel] = useState<string | null>(null);
  const [fontes, setFontes] = useState(false);
  const limites = useMemo(() => (atlas ? anosDosCaminhos(atlas) : { de: 1490, ate: 1740 }), [atlas]);
  const [ano, setAno] = useState(limites.ate);
  const [tocando, setTocando] = useState(false);
  const quadro = useRef(0);
  const prog = useProgress();

  /* Links de outras telas (busca, coleção, personagens): ?lugar=, ?modo=caminhos, ?rota=. */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('modo') === 'caminhos' || q.get('rota')) setModo('caminhos');
    const alvo = q.get('rota') ?? q.get('lugar');
    if (alvo) { setSel(alvo); document.getElementById('atlas')?.scrollIntoView({ block: 'start' }); }
  }, []);

  /* Abrir um lugar ou uma rota é uma descoberta (vai para o passaporte). */
  useEffect(() => {
    if (!sel || !atlas) return;
    if (atlas.rotas.some(rt => rt.id === sel)) prog.descobrirRaizes(`rota:${sel}`);
    else if (atlas.lugares.some(l => l.id === sel && !l.area)) prog.descobrirRaizes(`lugar:${sel}`);
  }, [sel, atlas]);

  /* A linha do tempo dos Caminhos: cerca de 24 segundos do começo ao fim.
     Com movimento reduzido, o fim aparece de uma vez. */
  useEffect(() => {
    if (!tocando) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setAno(limites.ate); setTocando(false); return; }
    let antes = performance.now();
    const passo = (agora: number) => {
      const dt = (agora - antes) / 1000; antes = agora;
      setAno(a => {
        const prox = a + dt * ((limites.ate - limites.de) / 24);
        if (prox >= limites.ate) { setTocando(false); return limites.ate; }
        return prox;
      });
      quadro.current = requestAnimationFrame(passo);
    };
    quadro.current = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro.current);
  }, [tocando, limites]);

  if (r.semConteudo || !atlas || desenho === r.mapa) return <SemConteudo />;

  const lugares = modo === 'lugares'
    ? lugaresVisiveis(atlas, periodo, tipos)
    : atlas.lugares.filter(l => atlas.rotas.some(rt => rt.pontos.includes(l.id) && rt.de <= ano));
  const rotas = modo === 'caminhos' ? rotasAte(atlas, ano) : [];
  const lugar = atlas.lugares.find(l => l.id === sel) ?? null;
  const rota = atlas.rotas.find(rt => rt.id === sel) ?? null;
  const nomeDe = (id: string) => atlas.lugares.find(l => l.id === id)?.nome ?? id;
  const escolher = (id: string) => { setSel(id); setFontes(false); };
  const trocarTipo = (t: TipoDeLugar) => {
    const n = new Set(tipos);
    if (n.has(t)) n.delete(t); else n.add(t);
    setTipos(n);
  };
  const pontosPeninsula = atlas.lugares.filter(l => !l.area && l.lon > VISTAS.peninsula.oeste && l.lon < VISTAS.peninsula.leste && l.lat > VISTAS.peninsula.sul && l.lat < VISTAS.peninsula.norte);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-9">
      <Heroi kicker="Atlas histórico" titulo="O que a história dos sefarditas pode revelar sobre a história da sua família?"
        subtitulo="Lugares, tempos e caminhos, cada um com a sua fonte." pontos={pontosPeninsula}>
        <div className="flex flex-wrap gap-3 pt-3">
          <a href="#atlas" className="rz-botao !bg-white !text-[#0B2A31]" onClick={() => setModo('lugares')}>Explorar o Atlas</a>
          <a href="#atlas" className="rz-botao claro !text-white !border-white/60" onClick={() => { setModo('caminhos'); setAno(limites.de); setTocando(true); }}>Os Caminhos do Exílio</a>
        </div>
        <p className="rz-credito m-0 pt-2">Contorno: Natural Earth, domínio público. Sem fronteiras: os reinos da época não cabem nas de hoje.</p>
      </Heroi>

      <section id="atlas" className="grid gap-4 scroll-mt-20">
        <div role="tablist" aria-label="Modo do Atlas" className="flex flex-wrap gap-2">
          <button type="button" role="tab" aria-selected={modo === 'lugares'} className="rz-chip" aria-pressed={modo === 'lugares'}
            onClick={() => { setModo('lugares'); setSel(null); setTocando(false); }}>Lugares</button>
          <button type="button" role="tab" aria-selected={modo === 'caminhos'} className="rz-chip" aria-pressed={modo === 'caminhos'}
            onClick={() => { setModo('caminhos'); setSel(null); }}>Caminhos do Exílio</button>
        </div>

        {modo === 'lugares' ? (
          <>
            <div className="grid gap-2">
              <p className="rz-rot m-0">Período</p>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" role="group" aria-label="Período">
                <button type="button" className="rz-chip shrink-0" aria-pressed={periodo === null} onClick={() => setPeriodo(null)}>Todos</button>
                {atlas.periodos.map(p => (
                  <button key={p.id} type="button" className="rz-chip shrink-0" aria-pressed={periodo === p.id} onClick={() => setPeriodo(p.id)}>
                    {p.titulo}
                  </button>
                ))}
              </div>
              {periodo && (() => {
                const p = atlas.periodos.find(x => x.id === periodo)!;
                return <p className="m-0 font-ui text-[14px] leading-relaxed text-[var(--corpo)]"><span className="font-semibold text-[var(--tinta)]">{p.quando}.</span> {p.resumo}</p>;
              })()}
            </div>
            <div className="grid gap-2">
              <p className="rz-rot m-0">O que mostrar</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Tipos de lugar">
                {atlas.tipos.map(t => (
                  <button key={t.id} type="button" className="rz-chip" aria-pressed={tipos.has(t.id)} title={t.descricao} onClick={() => trocarTipo(t.id)}>{t.nome}</button>
                ))}
              </div>
              <p className="m-0 font-ui text-[12.5px] text-[var(--suave)]">Sem nenhum marcado, aparecem todos. Sede de tribunal e atos da Inquisição são coisas diferentes, e o Atlas não confunde as duas.</p>
            </div>
          </>
        ) : (
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="rz-botao pequeno" onClick={() => { if (ano >= limites.ate) setAno(limites.de); setTocando(!tocando); }}>
                {tocando ? 'Pausar' : ano >= limites.ate ? 'Tocar de novo' : 'Tocar'}
              </button>
              <span className="rz-numero text-[28px] tabular-nums" aria-live="off">{Math.floor(ano)}</span>
            </div>
            <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">
              Linha do tempo
              <input type="range" min={limites.de} max={limites.ate} step={1} value={Math.floor(ano)}
                onChange={e => { setTocando(false); setAno(Number(e.target.value)); }} className="w-full accent-[var(--mar)]" />
            </label>
            <LegendaDasRotas atlas={atlas} />
            <p className="m-0 font-ui text-[12.5px] leading-relaxed text-[var(--suave)]">
              Nem todos os sefarditas seguiram os mesmos caminhos. Cada linha liga lugares que as fontes dão; a curva entre eles não é estrada nem rota de navio.
            </p>
          </div>
        )}

        <AtlasMapa atlas={atlas} desenho={desenho} lugares={lugares} rotas={rotas} ano={ano}
          vistaInicial={modo === 'caminhos' ? 'atlantico' : 'peninsula'} selecionado={sel}
          onLugar={escolher} onRota={escolher} />

        <div aria-live="polite">
          {lugar && !lugar.area && (
            <article className="rz-ficha">
              <header className="grid gap-0.5">
                <span className="rz-rot !text-[#8FD6C8]">{lugar.tipos.map(t => atlas.tipos.find(x => x.id === t)?.nome).join(' · ')}</span>
                <h3 className="rz-serif m-0 font-[440]">{lugar.nome}</h3>
              </header>
              <div className="grid gap-3 p-4">
                {fotosDe(`lugar:${lugar.id}`)[0] && <Foto f={fotosDe(`lugar:${lugar.id}`)[0]!} compacta />}
                <p className="rz-corpo">{lugar.resumo}</p>
                <p className="m-0 font-ui text-[13px] text-[var(--suave)]">
                  Nos períodos: {lugar.periodos.map(id => atlas.periodos.find(p => p.id === id)?.titulo).join(', ')}.
                </p>
                <div className="flex flex-wrap gap-4">
                  {lugar.pagina && <Link href={`/raizes/lugar/${lugar.pagina}`} prefetch={false} className="rz-botao pequeno">Abrir a página de {lugar.nome}</Link>}
                  <button type="button" onClick={() => setFontes(!fontes)} aria-expanded={fontes} className="rz-link min-h-[44px] inline-flex items-center">
                    {fontes ? 'Fechar as fontes' : 'De onde vem isso?'}
                  </button>
                  <Guardar chave={`lugar:${lugar.id}`} />
                </div>
                {fontes && <PainelDeFonte ids={lugar.afirmacoes} />}
              </div>
            </article>
          )}
          {rota && (
            <article className="rz-ficha">
              <header className="grid gap-0.5">
                <span className="rz-rot !text-[#8FD6C8]">{rota.quando} · {atlas.grupos.find(g => g.id === rota.grupo)?.nome}</span>
                <h3 className="rz-serif m-0 font-[440]">{rota.titulo}</h3>
              </header>
              <div className="grid gap-3 p-4">
                <p className="m-0 font-ui text-[13.5px] font-semibold" style={{ color: ESTILO_DA_EVIDENCIA[rota.evidencia]!.cor }}>
                  {atlas.evidencias.find(e => e.id === rota.evidencia)?.nome}: {atlas.evidencias.find(e => e.id === rota.evidencia)?.descricao}
                </p>
                <p className="rz-corpo">{rota.resumo}</p>
                <p className="m-0 font-ui text-[13px] text-[var(--suave)]">Lugares, na ordem das fontes: {rota.pontos.map(nomeDe).join(' → ')}.</p>
                <div className="flex flex-wrap items-center gap-4">
                  <button type="button" onClick={() => setFontes(!fontes)} aria-expanded={fontes} className="rz-link min-h-[44px] inline-flex items-center">
                    {fontes ? 'Fechar as fontes' : 'De onde vem isso?'}
                  </button>
                  <Guardar chave={`rota:${rota.id}`} />
                </div>
                {fontes && <PainelDeFonte ids={rota.afirmacoes} />}
              </div>
            </article>
          )}
        </div>

        <details className="rz-nota grid gap-2">
          <summary className="cursor-pointer rz-rot min-h-[44px] inline-flex items-center">
            {modo === 'lugares' ? `Os ${lugares.filter(l => !l.area).length} lugares em lista` : `As ${rotas.length} rotas em lista`}
          </summary>
          <ul className="m-0 p-0 list-none">
            {modo === 'lugares'
              ? lugares.filter(l => !l.area).map(l => (
                <li key={l.id} className="border-t border-[var(--linha)]">
                  <button type="button" className="w-full text-left min-h-[44px] py-2 font-ui text-[14.5px] text-[var(--tinta)]" onClick={() => escolher(l.id)}>
                    <span className="font-semibold">{l.nome}</span> <span className="text-[var(--suave)]">{l.resumo}</span>
                  </button>
                </li>
              ))
              : rotas.map(rt => (
                <li key={rt.id} className="border-t border-[var(--linha)]">
                  <button type="button" className="w-full text-left min-h-[44px] py-2 font-ui text-[14.5px] text-[var(--tinta)]" onClick={() => escolher(rt.id)}>
                    <span className="font-semibold">{rt.titulo}</span> <span className="text-[var(--suave)]">{rt.quando} · {atlas.evidencias.find(e => e.id === rt.evidencia)?.nome}</span>
                  </button>
                </li>
              ))}
          </ul>
        </details>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rz-nota grid content-start gap-2">
          <p className="rz-rot m-0">Uma cidade por dentro</p>
          <h2 className="rz-h3">Lisboa</h2>
          <p className="m-0 font-ui text-[14.5px] leading-relaxed text-[var(--corpo)]">Da judiaria medieval ao memorial de 2008: cronologia, vestígios, pessoas e documentos.</p>
          <Link href="/raizes/lugar/lisboa" prefetch={false} className="rz-link justify-self-start min-h-[44px] inline-flex items-center">Abrir Lisboa</Link>
        </div>
        <div className="rz-nota teal grid content-start gap-2">
          <p className="rz-rot m-0">Minha história, minhas raízes</p>
          <h2 className="rz-h3">A árvore da família</h2>
          <p className="m-0 font-ui text-[14.5px] leading-relaxed text-[var(--corpo)]">Pessoas, lugares e o tipo de evidência de cada uma, com um exemplo fictício para começar.</p>
          <Link href="/raizes/familia" prefetch={false} className="rz-link justify-self-start min-h-[44px] inline-flex items-center">Abrir a árvore</Link>
        </div>
      </section>
    </div>
  );
}
