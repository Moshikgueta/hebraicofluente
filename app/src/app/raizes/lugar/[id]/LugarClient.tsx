'use client';

/* A página de um lugar do Atlas (protótipo: Lisboa).
 * ─────────────────────────────────────────────────────────────────────────
 * Contexto com fonte em cada frase, cronologia, o que ainda existe (e o que
 * não), pessoas, documentos e como lê-los, a ligação com a diáspora e as
 * referências. Fotografia só com licença conferida: sem ela, a página diz que
 * falta, em vez de pôr uma imagem qualquer. A ilustração é desenhada dos
 * dados do Atlas e diz que é interpretativa. */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Guardar } from '@/components/raizes/Guardar';
import { useProgress } from '@/lib/state/store';
import { Heroi } from '@/components/raizes/Heroi';
import { PainelDeFonte, TextoComFontes } from '@/components/raizes/Texto';
import { ESTILO_DA_EVIDENCIA } from '@/components/raizes/AtlasMapa';
import { desenhoDoMapa, marcasDe, projetar, raizes, type PaginaDeLugar } from '@/lib/raizes';
import { caminhoDaRota, janelaDaVista } from '@/lib/raizes-atlas';
import { SemConteudo } from '@/app/raizes/RaizesHomeClient';

const ESTADO: Record<PaginaDeLugar['vestigios'][number]['estado'], { nome: string; icone: string }> = {
  existe: { nome: 'Existe hoje', icone: '●' },
  'nao-existe': { nome: 'Não existe mais', icone: '○' },
  incerto: { nome: 'Lugar incerto', icone: '◌' }
};

function Fontes({ ids }: { ids: string[] }) {
  const [aberta, setAberta] = useState(false);
  if (!ids.length) return null;
  return (
    <>
      <button type="button" onClick={() => setAberta(!aberta)} aria-expanded={aberta}
        className="rz-link !text-[13px] justify-self-start min-h-[40px] inline-flex items-center">
        {aberta ? 'Fechar as fontes' : 'Fontes'}
      </button>
      {aberta && <PainelDeFonte ids={ids} />}
    </>
  );
}

export function LugarClient({ id }: { id: string }) {
  const r = raizes();
  const p = r.lugares?.[id];
  const prog = useProgress();
  /* Visitar a página da cidade é descobrir o lugar (o mesmo do Atlas). */
  useEffect(() => { if (p) prog.descobrirRaizes(`lugar:${p.id}`); }, [p?.id]);
  if (r.semConteudo || !p || !r.atlas) return <SemConteudo />;

  /* Todas as afirmações citadas na página, para a lista de referências. */
  const citadas = [...new Set([
    ...p.secoes.flatMap(s => s.paragrafos.flatMap(marcasDe)),
    ...p.cronologia.flatMap(c => c.afirmacoes), ...p.vestigios.flatMap(v => v.afirmacoes),
    ...p.personagens.flatMap(x => x.afirmacoes), ...p.documentos.flatMap(x => x.afirmacoes),
    ...p.diaspora.flatMap(x => x.afirmacoes)
  ])];
  const fontesCitadas = [...new Set(citadas.flatMap(aid => r.afirmacoes.find(a => a.id === aid)?.fontes ?? []))]
    .map(fid => r.fontes.find(f => f.id === fid)).filter(f => !!f);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10">
      <Heroi kicker="Atlas · um lugar" titulo={p.nome} subtitulo={p.subtitulo} pontos={[{ lon: p.lon, lat: p.lat }]} compacto>
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <Link href="/raizes/atlas" prefetch={false} className="rz-credito underline">Voltar ao Atlas</Link>
          <Guardar chave={`lugar:${p.id}`} />
        </div>
      </Heroi>

      <p className="rz-entrada m-0">{p.abertura}</p>

      {p.secoes.map(s => (
        <section key={s.titulo} className="grid gap-4">
          <h2 className="rz-h2">{s.titulo}</h2>
          {s.paragrafos.map((t, i) => <TextoComFontes key={i} texto={t} />)}
        </section>
      ))}

      <section className="grid gap-3">
        <h2 className="rz-rot !text-[var(--titulo)] m-0 border-t-2 border-[var(--titulo)] pt-2">Cronologia</h2>
        <ol className="rz-ldt">
          {p.cronologia.map((c, i) => (
            <li key={i}>
              <span className="rz-numero block text-[15px]">{c.quando}</span>
              <span className="rz-serif block text-[17px] font-[480] leading-snug text-[var(--tinta)]">{c.titulo}</span>
              <span className="block font-ui text-[14.5px] leading-relaxed text-[var(--corpo)]">{c.texto}</span>
              <Fontes ids={c.afirmacoes} />
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-3">
        <h2 className="rz-h2">O que ainda existe</h2>
        <ul className="m-0 p-0 list-none">
          {p.vestigios.map(v => (
            <li key={v.nome} className="grid gap-1 border-t border-[var(--linha)] py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="rz-serif m-0 text-[19px] font-[480] text-[var(--titulo)]">{v.nome}</h3>
                <span className="rz-rot !text-[var(--mar)]"><span aria-hidden>{ESTADO[v.estado].icone} </span>{ESTADO[v.estado].nome}</span>
              </div>
              <p className="m-0 font-ui text-[14.5px] leading-relaxed text-[var(--corpo)]">{v.texto}</p>
              <Fontes ids={v.afirmacoes} />
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="rz-h2">{p.nome} e a diáspora</h2>
        <Ligacoes p={p} />
        <ul className="m-0 p-0 list-none">
          {p.diaspora.map((d, i) => (
            <li key={i} className="grid gap-1 border-t border-[var(--linha)] py-3">
              <p className="m-0 rz-corpo !text-[16.5px]">{d.texto}</p>
              {d.rota && <Link href="/raizes/atlas#atlas" prefetch={false} className="rz-link !text-[13px] justify-self-start min-h-[40px] inline-flex items-center">Ver nos Caminhos do Exílio</Link>}
              <Fontes ids={d.afirmacoes} />
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="rz-h2">Pessoas</h2>
        {p.personagens.map(x => (
          <div key={x.nome} className="grid gap-1 border-t border-[var(--linha)] py-3">
            <h3 className="rz-serif m-0 text-[19px] font-[480] text-[var(--titulo)]">{x.nome}</h3>
            <p className="m-0 rz-corpo !text-[16.5px]">{x.texto}</p>
            <Fontes ids={x.afirmacoes} />
          </div>
        ))}
      </section>

      <section className="grid gap-3">
        <h2 className="rz-h2">Documentos, e como lê-los</h2>
        {p.documentos.map(dc => (
          <div key={dc.titulo} className="rz-nota grid gap-2">
            <h3 className="rz-h3 !text-[19px]">{dc.titulo}</h3>
            <p className="m-0 font-ui text-[14.5px] leading-relaxed text-[var(--corpo)]">{dc.texto}</p>
            <p className="m-0 font-ui text-[14px] leading-relaxed text-[var(--tinta)]"><span className="font-semibold">Como ler:</span> {dc.leitura}</p>
            {dc.link && <a href={dc.link} target="_blank" rel="noopener noreferrer" className="rz-link justify-self-start min-h-[40px] inline-flex items-center">Consultar no arquivo</a>}
            <Fontes ids={dc.afirmacoes} />
          </div>
        ))}
      </section>

      <section className="rz-fundo grid gap-2">
        <p className="rz-rot m-0">Fotografias</p>
        {p.fotografias.length === 0
          ? <p className="m-0 font-ui text-[14px] leading-relaxed text-[var(--corpo)]">{p.fotografiasNota}</p>
          : p.fotografias.map(f => (
            <figure key={f.src} className="m-0 grid gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.src} alt={f.legenda} loading="lazy" className="w-full rounded-[8px]" />
              <figcaption className="font-ui text-[12.5px] text-[var(--suave)]">{f.legenda} · {f.autor} · {f.licenca}</figcaption>
            </figure>
          ))}
      </section>

      <section className="grid gap-2">
        <h2 className="rz-rot !text-[var(--titulo)] m-0 border-t-2 border-[var(--titulo)] pt-2">Referências desta página</h2>
        <ol className="m-0 pl-5 grid gap-2 font-ui text-[13.5px] leading-relaxed text-[var(--corpo)] [overflow-wrap:anywhere]">
          {fontesCitadas.map(f => <li key={f!.id}>{f!.abnt} <span className="text-[var(--suave)]">(nível {f!.nivel})</span></li>)}
        </ol>
        <Link href="/raizes/biblioteca" prefetch={false} className="rz-link justify-self-start min-h-[44px] inline-flex items-center">Todas as fontes, na biblioteca</Link>
      </section>
    </div>
  );
}

/** A ilustração: Lisboa e as rotas do Atlas que passam por ela. Interpretativa. */
function Ligacoes({ p }: { p: PaginaDeLugar }) {
  const r = raizes();
  const atlas = r.atlas!;
  const d = desenhoDoMapa('atlantico');
  const rotas = atlas.rotas.filter(rt => rt.pontos.includes(p.id));
  const j = janelaDaVista('atlantico', d, 1.25);
  const [x, y] = projetar(p.lon, p.lat, d);
  return (
    <figure className="rz-figura grid gap-0">
      <svg viewBox={`${j.x} ${j.y} ${j.w} ${j.h}`} className="w-full bg-[var(--rz-mar-claro)]" role="img"
        aria-label={`Ilustração: ${p.nome} ligada a ${rotas.map(rt => rt.titulo).join('; ')}`}>
        <path d={d.terra} fill="var(--rz-terra-mapa)" stroke="var(--pedra-escura)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        {rotas.map(rt => {
          const est = ESTILO_DA_EVIDENCIA[rt.evidencia]!;
          return <path key={rt.id} d={caminhoDaRota(rt, atlas, d)} fill="none" stroke={est.cor} strokeWidth={est.largura}
            strokeDasharray={est.traco || undefined} strokeLinecap="round" vectorEffect="non-scaling-stroke" />;
        })}
        <circle cx={x} cy={y} r={j.w / 90} fill="#B8862F" stroke="#0B2A31" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      </svg>
      <figcaption>
        <span className="font-semibold text-[var(--ouro-tinta)]">Ilustração interpretativa.</span> {p.ilustracao.legenda}
      </figcaption>
    </figure>
  );
}
