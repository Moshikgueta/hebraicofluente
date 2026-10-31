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
import { desenhoDoMapa, janelaDoMapa, projetar, type Atividade } from '@/lib/raizes';
import { Moldura, Veredito, useAtividade } from './Atividades';
import { PainelDeFonte } from './Texto';

type Mapa = Extract<Atividade, { tipo: 'mapa' }>;

export function MapaHistorico({ modulo, id, a }: { modulo: number; id: string; a: Mapa }) {
  const { feita, registrar } = useAtividade(modulo, id);
  /* O desenho (a península, ou outro pelo nome, como o Mediterrâneo da
     diáspora) e a janela (inteiro, ou o recorte da atividade). */
  const desenho = desenhoDoMapa(a.desenho);
  const j = janelaDoMapa(a.recorte, desenho);
  const k = j.w / desenho.largura;
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
      <figure className="rz-figura">
        {/* O toque abre o ponto MAIS PRÓXIMO do dedo, até 36 px de distância.
            No celular, Sevilha e o Guadalete ficam a 20 px um do outro e quatro
            cidades portuguesas a menos de 34 px: alvos de 44 px cada se
            cobririam, e o de cima roubaria o toque do de baixo. Assim cada
            ponto ganha a maior área possível sem invadir a do vizinho. Os
            botões continuam ali para o teclado e o leitor de tela. */}
        <div className="relative w-full overflow-hidden bg-[var(--rz-mar-claro)] cursor-pointer"
          style={{ aspectRatio: `${j.w} / ${j.h}` }}
          onClick={e => {
            if ((e.target as HTMLElement).closest('button')) return;
            const caixa = e.currentTarget.getBoundingClientRect();
            let melhor: string | null = null, dist = 36;
            for (const l of a.lugares) {
              const [x, y] = projetar(l.lon, l.lat, desenho);
              const d = Math.hypot(caixa.left + ((x - j.x) / j.w) * caixa.width - e.clientX,
                caixa.top + ((y - j.y) / j.h) * caixa.height - e.clientY);
              if (d < dist) { dist = d; melhor = l.id; }
            }
            if (melhor) abrir(melhor);
          }}>
          <svg viewBox={`${j.x} ${j.y} ${j.w} ${j.h}`} className="absolute inset-0 h-full w-full" aria-hidden focusable="false">
            {/* "Papel recortado", o estilo da coleção: a mesma terra, deslocada, faz a sombra. */}
            <path d={desenho.terra} fill="var(--pedra-escura)" transform={`translate(${9 * k} ${11 * k})`} />
            <path d={desenho.terra} fill="var(--rz-terra-mapa)" stroke="var(--pedra-escura)" strokeWidth={1.2 * k} />
          </svg>
          {a.lugares.map(l => {
            const [x, y] = projetar(l.lon, l.lat, desenho);
            const ativo = aberto === l.id, visto = vistos.has(l.id);
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => abrir(l.id)}
                aria-pressed={ativo}
                data-visto={visto}
                aria-label={`${l.nome}${l.incerto ? ', localização incerta' : ''}${visto ? ', já explorado' : ''}`}
                className={`rz-ponto ${l.incerto ? 'incerto' : ''}`}
                style={{ left: `${((x - j.x) / j.w) * 100}%`, top: `${((y - j.y) / j.h) * 100}%` }}
              >
                <span aria-hidden />
                <span aria-hidden className={`pointer-events-none absolute left-[34px] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-[3px] px-1.5 py-[1px]
                  font-ui text-[11.5px] font-semibold text-[var(--tinta)] bg-[var(--branco)] shadow-[0_1px_0_var(--pedra-escura)] ${ativo ? 'block' : 'hidden sm:block'}`}>
                  {l.nome.replace(/ \(.*\)$/, '')}
                </span>
              </button>
            );
          })}
        </div>
        <figcaption>
          {a.legenda} <span className="tabular-nums">Explorados: {vistos.size} de {a.lugares.length} (mínimo {a.minimoExplorados}).</span>
        </figcaption>
      </figure>

      <div aria-live="polite">
        {lugar ? (
          <article className="rz-ficha">
            <header className="grid gap-0.5">
              <span className="rz-rot !text-[#8FD6C8]">{lugar.periodo}</span>
              <h4 className="rz-serif m-0 font-[440]">{lugar.nome}</h4>
            </header>
            <div className="grid gap-3 p-4">
              <p className="rz-corpo">{lugar.resumo}</p>
              {lugar.incerto && (
                <p className="m-0 font-ui text-[13.5px] text-[var(--ocre)]">O ponto marca um lugar provável, não uma localização comprovada.</p>
              )}
              <button type="button" onClick={() => setFonteAberta(!fonteAberta)} aria-expanded={fonteAberta}
                className="rz-link justify-self-start min-h-[44px] inline-flex items-center">
                {fonteAberta ? 'Fechar as fontes' : 'De onde vem isso?'}
              </button>
              {fonteAberta && <PainelDeFonte ids={lugar.afirmacoes} />}
            </div>
          </article>
        ) : (
          <p className="m-0 font-ui text-[14px] text-[var(--suave)]">Toque num ponto do mapa ou num lugar da lista.</p>
        )}
      </div>

      <details className="group border-y border-[var(--linha)]">
        <summary className="cursor-pointer list-none flex min-h-[48px] items-center gap-2 font-ui text-[14px] font-semibold text-[var(--tinta)]">
          <span aria-hidden className="inline-block transition-transform duration-150 group-open:rotate-90">›</span>
          Os lugares em lista
        </summary>
        <ul className="rz-lista pb-2">
          {a.lugares.map(l => (
            <li key={l.id}>
              <button type="button" onClick={() => abrir(l.id)} aria-pressed={aberto === l.id}
                className="grid w-full grid-cols-[22px_1fr] items-baseline gap-2 py-2.5 min-h-[44px] text-left">
                <span aria-hidden className="text-[var(--teal-ink)]">{vistos.has(l.id) ? '✓' : ''}</span>
                <span className="font-ui text-[15px] text-[var(--tinta)]">{l.nome} <span className="text-[13px] text-[var(--suave)]">· {l.periodo}</span></span>
              </button>
            </li>
          ))}
        </ul>
      </details>

      <div className="grid gap-4">
        <p className="rz-rot ocre m-0">Três perguntas</p>
        {!explorouOBastante && (
          <p className="m-0 font-ui text-[14px] text-[var(--suave)]">
            Explore mais {a.minimoExplorados - vistos.size} {a.minimoExplorados - vistos.size === 1 ? 'lugar' : 'lugares'} para liberar a conferência.
          </p>
        )}
        {a.perguntas.map(q => {
          const certo = respostas[q.id] === q.resposta;
          return (
            <div key={q.id} className="grid gap-1.5">
              <label className="rz-serif grid gap-1.5 text-[17px] leading-snug text-[var(--tinta)]">
                {q.enunciado}
                <select value={respostas[q.id] ?? ''} disabled={conferido}
                  onChange={e => setRespostas({ ...respostas, [q.id]: e.target.value })}
                  className="rz-campo">
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
            <button type="button" className="rz-botao justify-self-start" onClick={conferir}
              disabled={!explorouOBastante || a.perguntas.some(q => !respostas[q.id])}>Conferir</button>
          )}
          {conferido && !tudoCerto && (
            <button type="button" className="rz-botao claro pequeno justify-self-start" onClick={() => {
              setConferido(false);
              setRespostas(Object.fromEntries(a.perguntas.filter(q => respostas[q.id] === q.resposta).map(q => [q.id, q.resposta])));
            }}>Corrigir</button>
          )}
          {conferido && tudoCerto && <Veredito certo>As três certas, com {vistos.size} lugares explorados.</Veredito>}
        </div>
      </div>
    </Moldura>
  );
}
