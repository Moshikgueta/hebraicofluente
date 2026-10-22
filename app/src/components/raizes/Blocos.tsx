'use client';

/* Os blocos do leitor de Raízes: o que cada `tipo` do dado vira na tela.
 * Um bloco novo nasce aqui e no tipo `Bloco` de lib/raizes.ts, juntos. */

import { useEffect, useState } from 'react';
import type { Bloco, ModuloRaizes } from '@/lib/raizes';
import { TextoComFontes, PainelDeFonte } from './Texto';
import { Associacao, Classificar, Escolha, Multipla, Ordenar } from './Atividades';
import { MapaHistorico } from './MapaHistorico';
import { Laboratorio } from './Laboratorio';
import { LeiaODocumento } from './arquivo/LeiaODocumento';
import { Artefatos, Curiosidades, Palpite, VerdadeiroOuFalso } from './Pecas';

export function BlocoRaizes({ b, m }: { b: Bloco; m: ModuloRaizes }) {
  switch (b.tipo) {
    case 'texto':
      return (
        <section className="grid gap-4">
          {b.titulo && <h2 className="rz-h2 pt-2">{b.titulo}</h2>}
          {b.paragrafos.map((p, i) => <TextoComFontes key={i} texto={p} />)}
        </section>
      );
    case 'caixa':
      return (
        <aside className="rz-nota grid gap-2">
          <p className="rz-rot m-0">{b.variante === 'metodo' ? 'Método' : 'Cuidado'}</p>
          <h3 className="rz-h3 !text-[20px]">{b.titulo}</h3>
          {b.paragrafos.map((p, i) => <TextoComFontes key={i} texto={p} />)}
        </aside>
      );
    case 'glossario':
      return <Glossario termos={b.termos} />;
    case 'linha-do-tempo':
      return <LinhaDoTempo titulo={b.titulo} eventos={b.eventos} />;
    case 'debate':
      return (
        <section className="grid gap-4">
          <h2 className="rz-h2">{b.titulo}</h2>
          {b.paragrafos.map((p, i) => <TextoComFontes key={i} texto={p} />)}
          <p className="rz-rot ocre m-0 pt-2">Três leituras</p>
          <ol className="m-0 p-0 list-none">
            {b.posicoes.map((pos, i) => (
              <li key={pos.nome} className="rz-curio">
                <span className="rz-numero">{i + 1}</span>
                <div className="grid gap-1 min-w-0">
                  <h3 className="rz-h3 !text-[20px]">{pos.nome}</h3>
                  <p className="rz-corpo">{pos.resumo}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="rz-italico m-0 text-[16px] text-[var(--suave)]">{b.nota}</p>
        </section>
      );
    case 'reflexao':
      return <Reflexao id={`m${m.n}:${b.id}`} pergunta={b.pergunta} apoio={b.apoio} />;
    case 'laboratorio':
      return <Laboratorio titulo={b.titulo} apresentacao={b.apresentacao} />;
    case 'palpite':
      return <Palpite b={b} />;
    case 'vf':
      return <VerdadeiroOuFalso b={b} />;
    case 'curiosidades':
      return <Curiosidades b={b} />;
    case 'artefatos':
      return <Artefatos b={b} />;
    case 'documento':
      return <LeiaODocumento b={b} />;
    case 'sintese':
      return (
        <section className="grid gap-2">
          <p className="rz-rot ocre m-0">O que fica</p>
          <ol className="m-0 p-0 list-none">
            {b.itens.map((t, i) => (
              <li key={i} className="rz-curio">
                <span className="rz-numero">{i + 1}</span>
                <p className="rz-serif m-0 text-[18px] leading-snug text-[var(--tinta)]">{t}</p>
              </li>
            ))}
          </ol>
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
      <div className="flex items-baseline justify-between border-t-2 border-[var(--titulo)] pt-2">
        <h2 className="rz-rot !text-[var(--titulo)] m-0">Glossário</h2>
        <span className="rz-rot tabular-nums">{vistos.length} termos</span>
      </div>
      <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">
        Procurar um termo
        <input type="search" value={busca} onChange={e => setBusca(e.target.value)} className="rz-campo font-normal" />
      </label>
      <dl className="m-0">
        {vistos.map(t => (
          <div key={t.termo} className="grid gap-1 border-b border-[var(--linha)] py-3">
            <dt className="rz-serif text-[19px] font-[480] text-[var(--titulo)]">{t.termo}</dt>
            <dd className="m-0 grid gap-1">
              <span className="rz-corpo !text-[16px]">{t.definicao}</span>
              {t.afirmacoes.length > 0 && (
                <button type="button" aria-expanded={aberto === t.termo} onClick={() => setAberto(aberto === t.termo ? null : t.termo)}
                  className="rz-link !text-[13px] justify-self-start min-h-[40px] inline-flex items-center">
                  {aberto === t.termo ? 'Fechar as fontes' : 'Fontes'}
                </button>
              )}
              {aberto === t.termo && <PainelDeFonte ids={t.afirmacoes} />}
            </dd>
          </div>
        ))}
        {vistos.length === 0 && <p className="m-0 py-3 font-ui text-[14px] text-[var(--suave)]">Nenhum termo com essa palavra.</p>}
      </dl>
    </section>
  );
}

function LinhaDoTempo({ titulo, eventos }: { titulo: string; eventos: { quando: string; titulo: string; texto: string; afirmacoes: string[] }[] }) {
  const [aberto, setAberto] = useState<number | null>(null);
  return (
    <section className="grid gap-3">
      <h2 className="rz-rot !text-[var(--titulo)] m-0 border-t-2 border-[var(--titulo)] pt-2">{titulo}</h2>
      <ol className="rz-ldt">
        {eventos.map((e, i) => (
          <li key={i} className={Number(e.quando.match(/\d{3,4}/)?.[0]) < 711 ? 'antes' : ''}>
            <span className="rz-numero block text-[15px]">{e.quando}</span>
            <span className="rz-serif block text-[17px] font-[480] leading-snug text-[var(--tinta)]">{e.titulo}</span>
            <span className="block font-ui text-[14.5px] leading-relaxed text-[var(--corpo)]">{e.texto}</span>
            <button type="button" aria-expanded={aberto === i} onClick={() => setAberto(aberto === i ? null : i)}
              className="rz-link !text-[12.5px] min-h-[36px] inline-flex items-center">
              {aberto === i ? 'Fechar as fontes' : 'Fontes'}
            </button>
            {aberto === i && <PainelDeFonte ids={e.afirmacoes} />}
          </li>
        ))}
      </ol>
      <p className="m-0 font-ui text-[12.5px] text-[var(--suave)]">
        <span aria-hidden className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[#B8862F] align-middle" /> antes de 711
        <span aria-hidden className="ml-4 mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[var(--teal)] align-middle" /> depois
      </p>
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
    <section className="rz-nota mar grid gap-2">
      <p className="rz-rot m-0">Sua resposta</p>
      <label htmlFor={`rf-${id}`} className="rz-h3">{pergunta}</label>
      <p className="m-0 font-ui text-[14px] leading-relaxed text-[var(--suave)]">{apoio}</p>
      <textarea id={`rf-${id}`} value={texto} onChange={e => guardar(e.target.value)} rows={5} maxLength={2000} className="rz-campo" />
      <p className="m-0 min-h-[18px] font-ui text-[12.5px] text-[var(--suave)]" aria-live="polite">{salvo ? 'Guardado neste aparelho.' : ''}</p>
    </section>
  );
}
