'use client';

/* Os blocos do leitor de Raízes: o que cada `tipo` do dado vira na tela.
 * Um bloco novo nasce aqui e no tipo `Bloco` de lib/raizes.ts, juntos. */

import { useEffect, useState } from 'react';
import type { Bloco, ModuloRaizes } from '@/lib/raizes';
import { TextoComFontes, PainelDeFonte } from './Texto';
import { Associacao, Classificar, Escolha, Multipla, Ordenar } from './Atividades';
import { MapaHistorico } from './MapaHistorico';

export function BlocoRaizes({ b, m }: { b: Bloco; m: ModuloRaizes }) {
  switch (b.tipo) {
    case 'texto':
      return (
        <section className="grid gap-3">
          {b.titulo && <h2 className="font-display text-[22px] sm:text-[26px] font-bold leading-tight m-0">{b.titulo}</h2>}
          {b.paragrafos.map((p, i) => <TextoComFontes key={i} texto={p} />)}
        </section>
      );
    case 'caixa':
      return (
        <aside className="grid gap-2 rounded-[var(--r-lg)] border-l-4 border-[var(--rz-terra)] bg-[var(--rz-pedra)] p-4 sm:p-5">
          <p className="m-0 font-ui text-[11px] font-semibold uppercase tracking-[.08em] text-[var(--rz-terra)]">
            {b.variante === 'metodo' ? 'Método' : 'Cuidado'}
          </p>
          <h3 className="m-0 font-display text-[18px] font-bold">{b.titulo}</h3>
          {b.paragrafos.map((p, i) => <TextoComFontes key={i} texto={p} className="text-[15px]" />)}
        </aside>
      );
    case 'glossario':
      return <Glossario termos={b.termos} />;
    case 'linha-do-tempo':
      return <LinhaDoTempo titulo={b.titulo} eventos={b.eventos} />;
    case 'debate':
      return (
        <section className="grid gap-4">
          <h2 className="font-display text-[22px] sm:text-[26px] font-bold leading-tight m-0">{b.titulo}</h2>
          {b.paragrafos.map((p, i) => <TextoComFontes key={i} texto={p} />)}
          <ul className="grid gap-3 sm:grid-cols-3 m-0 p-0 list-none">
            {b.posicoes.map(pos => (
              <li key={pos.nome} className="grid content-start gap-1.5 rounded-[var(--r-md)] border border-[var(--rz-pedra-borda)] bg-[var(--rz-pedra)] p-4">
                <h3 className="m-0 font-display text-[16px] font-bold">{pos.nome}</h3>
                <p className="m-0 font-ui text-[14px] leading-relaxed text-ink-body">{pos.resumo}</p>
              </li>
            ))}
          </ul>
          <p className="m-0 font-ui text-[14px] italic text-ink-muted">{b.nota}</p>
        </section>
      );
    case 'reflexao':
      return <Reflexao id={`m${m.n}:${b.id}`} pergunta={b.pergunta} apoio={b.apoio} />;
    case 'sintese':
      return (
        <section className="grid gap-3">
          <h2 className="font-display text-[22px] font-bold m-0">O que fica</h2>
          <ul className="grid gap-2 m-0 pl-5">
            {b.itens.map((t, i) => <li key={i} className="font-ui text-[15.5px] leading-relaxed text-ink-body">{t}</li>)}
          </ul>
        </section>
      );
    case 'atividade': {
      const a = m.atividades[b.id];
      if (!a) return null;
      switch (a.tipo) {
        case 'escolha': return <Escolha modulo={m.n} id={b.id} a={a} />;
        case 'multipla': return <Multipla modulo={m.n} id={b.id} a={a} />;
        case 'mapa': return <MapaHistorico modulo={m.n} id={b.id} a={a} />;
        case 'associacao': return <Associacao modulo={m.n} id={b.id} a={a} />;
        case 'ordenar': return <Ordenar modulo={m.n} id={b.id} a={a} />;
        case 'classificar': return <Classificar modulo={m.n} id={b.id} a={a} />;
      }
    }
  }
  return null;
}

function Glossario({ termos }: { termos: { termo: string; definicao: string; afirmacoes: string[] }[] }) {
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState<string | null>(null);
  const q = busca.trim().toLocaleLowerCase('pt-BR');
  const vistos = q ? termos.filter(t => (t.termo + ' ' + t.definicao).toLocaleLowerCase('pt-BR').includes(q)) : termos;
  return (
    <section className="grid gap-3">
      <h2 className="font-display text-[22px] font-bold m-0">Glossário</h2>
      <label className="grid gap-1 font-ui text-[13px] font-semibold text-ink">
        Procurar um termo
        <input type="search" value={busca} onChange={e => setBusca(e.target.value)}
          className="min-h-[44px] rounded-[var(--r-md)] border border-line bg-[var(--card)] px-3 font-ui text-[15px] font-normal text-ink" />
      </label>
      <dl className="grid gap-2 m-0">
        {vistos.map(t => (
          <div key={t.termo} className="grid gap-1 rounded-[var(--r-md)] border border-line bg-[var(--card)] p-3">
            <dt className="font-display text-[16px] font-bold text-ink">{t.termo}</dt>
            <dd className="m-0 grid gap-2 font-ui text-[14.5px] leading-relaxed text-ink-body">
              <span>{t.definicao}</span>
              {t.afirmacoes.length > 0 && (
                <button type="button" aria-expanded={aberto === t.termo} onClick={() => setAberto(aberto === t.termo ? null : t.termo)}
                  className="justify-self-start font-ui text-[12.5px] font-semibold text-[var(--rz-mar)] underline underline-offset-2 min-h-[32px]">
                  {aberto === t.termo ? 'Fechar as fontes' : 'Fontes'}
                </button>
              )}
              {aberto === t.termo && <PainelDeFonte ids={t.afirmacoes} />}
            </dd>
          </div>
        ))}
        {vistos.length === 0 && <p className="m-0 font-ui text-[14px] text-ink-muted">Nenhum termo com essa palavra.</p>}
      </dl>
    </section>
  );
}

function LinhaDoTempo({ titulo, eventos }: { titulo: string; eventos: { quando: string; titulo: string; texto: string; afirmacoes: string[] }[] }) {
  const [aberto, setAberto] = useState<number | null>(null);
  return (
    <section className="grid gap-3">
      <h2 className="font-display text-[22px] font-bold m-0">{titulo}</h2>
      <ol className="relative m-0 grid gap-0 p-0 list-none border-l-2 border-[var(--rz-pedra-borda)] ml-2">
        {eventos.map((e, i) => (
          <li key={i} className="relative grid gap-1 pb-4 pl-5">
            <span aria-hidden className="absolute -left-[7px] top-[6px] h-3 w-3 rounded-full bg-[var(--rz-terra)] ring-4 ring-[var(--cream)]" />
            <p className="m-0 font-display text-[15px] font-bold tabular-nums text-[var(--rz-terra)]">{e.quando}</p>
            <p className="m-0 font-ui text-[15px] font-semibold text-ink">{e.titulo}</p>
            <p className="m-0 font-ui text-[14px] leading-relaxed text-ink-body">{e.texto}</p>
            <button type="button" aria-expanded={aberto === i} onClick={() => setAberto(aberto === i ? null : i)}
              className="justify-self-start font-ui text-[12.5px] font-semibold text-[var(--rz-mar)] underline underline-offset-2 min-h-[32px]">
              {aberto === i ? 'Fechar as fontes' : 'Fontes'}
            </button>
            {aberto === i && <PainelDeFonte ids={e.afirmacoes} />}
          </li>
        ))}
      </ol>
    </section>
  );
}

/* A reflexão é do aluno e fica no aparelho: não vai ao servidor, não tem
   nota, não entra no progresso (lib/state/raizes-estado.ts). */
const CHAVE_REFLEXAO = 'hf-raizes-reflexao-v1';

function Reflexao({ id, pergunta, apoio }: { id: string; pergunta: string; apoio: string }) {
  const [texto, setTexto] = useState('');
  const [salvo, setSalvo] = useState(false);
  useEffect(() => {
    try {
      const todas = JSON.parse(localStorage.getItem(CHAVE_REFLEXAO) || '{}') as Record<string, string>;
      setTexto(todas[id] ?? '');
    } catch { /* aparelho sem armazenamento: a caixa funciona, só não lembra */ }
  }, [id]);
  const guardar = (v: string) => {
    setTexto(v);
    setSalvo(false);
    try {
      const todas = JSON.parse(localStorage.getItem(CHAVE_REFLEXAO) || '{}') as Record<string, string>;
      todas[id] = v.slice(0, 2000);
      localStorage.setItem(CHAVE_REFLEXAO, JSON.stringify(todas));
      setSalvo(true);
    } catch { /* idem */ }
  };
  return (
    <section className="grid gap-2 rounded-[var(--r-lg)] border border-line bg-[var(--card)] p-4 sm:p-5">
      <label htmlFor={`rf-${id}`} className="font-display text-[18px] font-bold text-ink">{pergunta}</label>
      <p className="m-0 font-ui text-[13.5px] leading-relaxed text-ink-muted">{apoio}</p>
      <textarea id={`rf-${id}`} value={texto} onChange={e => guardar(e.target.value)} rows={5} maxLength={2000}
        className="w-full rounded-[var(--r-md)] border border-line bg-[var(--cream)] p-3 font-ui text-[15px] leading-relaxed text-ink" />
      <p className="m-0 font-ui text-[12px] text-ink-muted" aria-live="polite">{salvo ? 'Guardado neste aparelho.' : ' '}</p>
    </section>
  );
}
