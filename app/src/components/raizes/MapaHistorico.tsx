'use client';

/* O mapa explorável do módulo.
 * ─────────────────────────────────────────────────────────────────────────
 * O contorno é a terra da Natural Earth, sem fronteira nenhuma (ver
 * tools/raizes-mapa.mjs): desenhar a Espanha e Portugal de hoje sobre o
 * califado de Córdoba ensinaria um anacronismo. Os pontos são as cidades de
 * hoje, e o lugar de localização incerta tem círculo tracejado.
 *
 * Os pontos são botões HTML por cima do desenho, e não elementos do SVG:
 * assim cada um tem o tamanho de um dedo e o foco do teclado de qualquer
 * botão. A lista embaixo do mapa é a alternativa acessível: os mesmos
 * lugares, na ordem do texto, para quem não vê o mapa ou prefere a lista.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { projetar, raizes, type Atividade } from '@/lib/raizes';
import { Moldura, Veredito, useAtividade } from './Atividades';
import { PainelDeFonte } from './Texto';

type Mapa = Extract<Atividade, { tipo: 'mapa' }>;

export function MapaHistorico({ modulo, id, a }: { modulo: number; id: string; a: Mapa }) {
  const { feita, registrar } = useAtividade(modulo, id);
  const desenho = raizes().mapa;
  const [aberto, setAberto] = useState<string | null>(null);
  const [vistos, setVistos] = useState<Set<string>>(new Set());
  const [fonteAberta, setFonteAberta] = useState(false);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [conferido, setConferido] = useState(false);

  const lugar = a.lugares.find(l => l.id === aberto) ?? null;
  const explorouOBastante = vistos.size >= a.minimoExplorados;
  const certas = a.perguntas.filter(q => respostas[q.id] === q.resposta).length;
  const tudoCerto = certas === a.perguntas.length;

  const abrir = (lid: string) => {
    setAberto(lid);
    setFonteAberta(false);
    if (!vistos.has(lid)) setVistos(new Set([...vistos, lid]));
  };
  const conferir = () => {
    setConferido(true);
    registrar(certas / a.perguntas.length, tudoCerto && explorouOBastante);
  };

  return (
    <Moldura rotulo="Mapa explorável" objetivo={a.objetivo} enunciado={a.enunciado} criterio={a.criterio} concluida={!!feita?.concluidaEm}>
      <figure className="m-0 grid gap-2">
        <div className="relative w-full overflow-hidden rounded-[var(--r-md)] border border-line"
          style={{ aspectRatio: `${desenho.largura} / ${desenho.altura}` }}>
          <svg viewBox={`0 0 ${desenho.largura} ${desenho.altura}`} className="absolute inset-0 h-full w-full" aria-hidden focusable="false">
            <rect width={desenho.largura} height={desenho.altura} fill="var(--rz-mar-claro)" />
            <path d={desenho.terra} fill="var(--rz-terra-mapa)" stroke="var(--rz-pedra-borda)" strokeWidth={1.5} />
          </svg>
          {a.lugares.map(l => {
            const [x, y] = projetar(l.lon, l.lat);
            const esq = (x / desenho.largura) * 100, topo = (y / desenho.altura) * 100;
            const ativo = aberto === l.id, visto = vistos.has(l.id);
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => abrir(l.id)}
                aria-pressed={ativo}
                aria-label={`${l.nome}${l.incerto ? ', localização incerta' : ''}${visto ? ', já explorado' : ''}`}
                className="group absolute -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full"
                style={{ left: `${esq}%`, top: `${topo}%` }}
              >
                <span aria-hidden className={`block rounded-full transition-transform group-hover:scale-125
                  ${l.incerto ? 'h-5 w-5 border-2 border-dashed border-[var(--rz-terra)] bg-transparent'
                    : `h-3.5 w-3.5 border-2 border-[var(--card)] ${visto ? 'bg-[var(--rz-mar)]' : 'bg-[var(--rz-terra)]'}`}
                  ${ativo ? 'ring-4 ring-[var(--rz-mar)]/40 scale-125' : ''}`} />
                <span aria-hidden className={`pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 whitespace-nowrap rounded px-1
                  font-ui text-[11px] font-semibold text-ink bg-[var(--card)]/85 ${ativo ? 'block' : 'hidden sm:block'}`}>
                  {l.nome.replace(/ \(.*\)$/, '')}
                </span>
              </button>
            );
          })}
        </div>
        <figcaption className="font-ui text-[12px] leading-relaxed text-ink-muted">
          {a.legenda} Lugares explorados: {vistos.size} de {a.lugares.length} (mínimo {a.minimoExplorados}).
        </figcaption>
      </figure>

      <div aria-live="polite">
        {lugar ? (
          <article className="grid gap-2 rounded-[var(--r-md)] border border-[var(--rz-pedra-borda)] bg-[var(--rz-pedra)] p-4">
            <p className="m-0 font-ui text-[11px] font-semibold uppercase tracking-[.08em] text-[var(--rz-terra)]">{lugar.periodo}</p>
            <h4 className="m-0 font-display text-[18px] font-bold">{lugar.nome}</h4>
            <p className="m-0 font-ui text-[14.5px] leading-relaxed text-ink-body">{lugar.resumo}</p>
            {lugar.incerto && (
              <p className="m-0 font-ui text-[13px] text-[var(--rz-terra)]">O ponto marca um lugar provável, não uma localização comprovada.</p>
            )}
            <button type="button" onClick={() => setFonteAberta(!fonteAberta)} aria-expanded={fonteAberta}
              className="justify-self-start font-ui text-[13px] font-semibold text-[var(--rz-mar)] underline underline-offset-2 min-h-[32px]">
              {fonteAberta ? 'Fechar as fontes' : 'De onde vem isso?'}
            </button>
            {fonteAberta && <PainelDeFonte ids={lugar.afirmacoes} />}
          </article>
        ) : (
          <p className="m-0 font-ui text-[14px] text-ink-muted">Toque num ponto do mapa ou num lugar da lista.</p>
        )}
      </div>

      <details className="rounded-[var(--r-md)] border border-line p-3">
        <summary className="cursor-pointer font-ui text-[14px] font-semibold text-ink min-h-[32px]">Os lugares em lista</summary>
        <ul className="mt-2 grid gap-1.5 m-0 p-0 list-none">
          {a.lugares.map(l => (
            <li key={l.id}>
              <button type="button" onClick={() => abrir(l.id)} aria-pressed={aberto === l.id}
                className="w-full rounded-[var(--r-md)] px-3 py-2 min-h-[44px] text-left font-ui text-[14px] text-ink hover:bg-[var(--sand)]">
                {vistos.has(l.id) ? '✓ ' : ''}{l.nome} <span className="text-ink-muted">({l.periodo})</span>
              </button>
            </li>
          ))}
        </ul>
      </details>

      <div className="grid gap-3 border-t border-line pt-4">
        <h4 className="m-0 font-display text-[16px] font-bold">Três perguntas</h4>
        {!explorouOBastante && (
          <p className="m-0 font-ui text-[13.5px] text-ink-muted">
            Explore mais {a.minimoExplorados - vistos.size} {a.minimoExplorados - vistos.size === 1 ? 'lugar' : 'lugares'} para liberar a conferência.
          </p>
        )}
        {a.perguntas.map(q => {
          const certo = respostas[q.id] === q.resposta;
          return (
            <div key={q.id} className="grid gap-1.5">
              <label className="grid gap-1 font-ui text-[14px] text-ink">
                {q.enunciado}
                <select value={respostas[q.id] ?? ''} disabled={conferido}
                  onChange={e => setRespostas({ ...respostas, [q.id]: e.target.value })}
                  className="min-h-[48px] rounded-[var(--r-md)] border border-line bg-[var(--card)] px-3 font-ui text-[14px] text-ink">
                  <option value="">Escolha o lugar</option>
                  {a.lugares.filter(l => !l.incerto).map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
                </select>
              </label>
              {conferido && <Veredito certo={certo}>{certo ? q.explicacao : 'Abra os cartões dos lugares e procure de novo.'}</Veredito>}
            </div>
          );
        })}
        <div aria-live="polite" className="grid gap-3">
          {!conferido && (
            <Button className="justify-self-start" onClick={conferir}
              disabled={!explorouOBastante || a.perguntas.some(q => !respostas[q.id])}>Conferir</Button>
          )}
          {conferido && !tudoCerto && (
            <Button variant="secondary" size="sm" className="justify-self-start" onClick={() => {
              setConferido(false);
              setRespostas(Object.fromEntries(a.perguntas.filter(q => respostas[q.id] === q.resposta).map(q => [q.id, q.resposta])));
            }}>Corrigir</Button>
          )}
          {conferido && tudoCerto && <Veredito certo>As três certas, com {vistos.size} lugares explorados.</Veredito>}
        </div>
      </div>
    </Moldura>
  );
}
