'use client';

/* As peças do Israel Além do Roteiro, trazidas para Raízes (22/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Quatro formas de pôr o aluno para fazer alguma coisa no meio da leitura:
 *   · Palpite: chute antes, a resposta (com fonte) depois. Não vale nota.
 *   · Verdadeiro ou falso: rodada curta, com placar e a explicação de cada.
 *   · Curiosidades: numeradas, cada uma com fonte e um "copiar para enviar".
 *   · Artefatos: a vitrine de objetos, documentos e lugares; tocar abre a
 *     ficha, com a gravura, o que se sabe e de onde vem.
 * Nenhuma conta para concluir o módulo (quem conclui são as atividades), e
 * nenhuma grava no servidor: o placar fica na tela. Todo texto factual tem a
 * marca da afirmação, como o resto do módulo (o teste confere). */

import { useMemo, useState } from 'react';
import type { Bloco } from '@/lib/raizes';
import { embaralhar } from '@/lib/raizes';
import { TextoComFontes } from './Texto';
import { Gravura } from './ilustracoes/Gravuras';

type De<T extends Bloco['tipo']> = Extract<Bloco, { tipo: T }>;
const semMarcas = (t: string) => t.replace(/\[\[[^\]]*\]\]/g, '').replace(/\s+([.,;:!?])/g, '$1').trim();

/* ── palpite ──────────────────────────────────────────────────────────── */

export function Palpite({ b }: { b: De<'palpite'> }) {
  const [chute, setChute] = useState<number | null>(null);
  const opcoes = useMemo(() => embaralhar(b.opcoes.map((o, i) => ({ ...o, i })), b.id), [b]);
  const escolhido = chute === null ? null : b.opcoes[chute]!;
  return (
    <section className="rz-peca rz-palpite grid gap-3" aria-labelledby={`pal-${b.id}`}>
      <p className="rz-rot ocre m-0">Dê o seu palpite</p>
      <h3 id={`pal-${b.id}`} className="rz-h3">{b.pergunta}</h3>
      <div role="group" aria-label="Palpites" className="flex flex-wrap gap-2">
        {opcoes.map(o => (
          <button key={o.i} type="button" aria-pressed={chute === o.i} disabled={chute !== null && chute !== o.i}
            onClick={() => setChute(o.i)} className="rz-chip">{o.texto}</button>
        ))}
      </div>
      <div aria-live="polite">
        {escolhido && (
          <div className="rz-revelado grid gap-2">
            <p className="m-0 font-ui text-[14px] font-semibold text-[var(--tinta)]">
              {escolhido.correta === undefined ? 'Agora, o que as fontes dizem:' : escolhido.correta ? 'Bom palpite. O que as fontes dizem:' : 'Não era esse. O que as fontes dizem:'}
            </p>
            <TextoComFontes texto={b.resposta} />
            <button type="button" className="rz-link justify-self-start min-h-[40px]" onClick={() => setChute(null)}>Chutar de novo</button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── verdadeiro ou falso ──────────────────────────────────────────────── */

export function VerdadeiroOuFalso({ b }: { b: De<'vf'> }) {
  const [resp, setResp] = useState<Record<number, boolean>>({});
  const feitas = Object.keys(resp).length;
  const certas = b.itens.filter((it, i) => i in resp && resp[i] === it.verdadeira).length;
  return (
    <section className="rz-peca grid gap-4" aria-labelledby={`vf-${b.id}`}>
      <div className="grid gap-1">
        <p className="rz-rot ocre m-0">Verdadeiro ou falso</p>
        <h3 id={`vf-${b.id}`} className="rz-h3">{b.titulo}</h3>
      </div>
      <ol className="m-0 grid gap-4 p-0 list-none">
        {b.itens.map((it, i) => {
          const r = resp[i];
          const respondida = r !== undefined;
          return (
            <li key={i} className="grid gap-2 border-t border-[var(--linha)] pt-3">
              <p className="rz-serif m-0 grid grid-cols-[28px_1fr] gap-2 text-[17px] leading-snug text-[var(--tinta)]">
                <span className="rz-numero text-[18px]">{i + 1}</span><span>{it.afirmacao}</span>
              </p>
              <div role="group" aria-label={`Afirmação ${i + 1}`} className="flex gap-2 pl-[36px]">
                {[true, false].map(v => (
                  <button key={String(v)} type="button" aria-pressed={r === v} disabled={respondida}
                    onClick={() => setResp({ ...resp, [i]: v })} className="rz-chip min-w-[104px] justify-center">
                    {v ? 'Verdadeiro' : 'Falso'}
                  </button>
                ))}
              </div>
              {respondida && (
                <div className="rz-revelado grid gap-1 pl-[36px]">
                  <p className={`m-0 font-ui text-[14px] font-semibold ${r === it.verdadeira ? 'text-[var(--teal-ink)]' : 'text-[var(--ouro-tinta)]'}`}>
                    <span aria-hidden>{r === it.verdadeira ? '✓ ' : '↺ '}</span>
                    {r === it.verdadeira ? 'Certo' : 'Não'}: é {it.verdadeira ? 'verdadeiro' : 'falso'}.
                  </p>
                  <TextoComFontes texto={it.explicacao} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <p className="m-0 font-ui text-[14px] text-[var(--corpo)]" aria-live="polite">
        {feitas === b.itens.length
          ? <><span className="font-semibold text-[var(--tinta)]">{certas} de {b.itens.length}</span> certas. <button type="button" className="rz-link" onClick={() => setResp({})}>Jogar de novo</button></>
          : <>Respondidas: {feitas} de {b.itens.length}</>}
      </p>
    </section>
  );
}

/* ── curiosidades ─────────────────────────────────────────────────────── */

export function Curiosidades({ b }: { b: De<'curiosidades'> }) {
  const [copiada, setCopiada] = useState<number | null>(null);
  const copiar = (i: number) => {
    const it = b.itens[i]!;
    const texto = `${it.titulo}. ${semMarcas(it.texto)} (Raízes Sefarditas, Hebraico Fluente)`;
    try { navigator.clipboard.writeText(texto).then(() => setCopiada(i), () => setCopiada(null)); } catch { setCopiada(null); }
  };
  return (
    <section className="grid gap-2" aria-labelledby={`cu-${b.titulo}`}>
      <p className="rz-rot ocre m-0">Curiosidades</p>
      <h3 id={`cu-${b.titulo}`} className="rz-h3">{b.titulo}</h3>
      <ol className="m-0 p-0 list-none">
        {b.itens.map((it, i) => (
          <li key={i} className="rz-curio">
            <span className="rz-numero">{i + 1}</span>
            <div className="grid gap-1.5">
              <h4 className="rz-serif m-0 text-[18.5px] font-[480] leading-snug text-[var(--titulo)]">{it.titulo}</h4>
              <TextoComFontes texto={it.texto} />
              <p className="m-0">
                <button type="button" className="rz-link !text-[13px] min-h-[36px]" onClick={() => copiar(i)}>Copiar para enviar</button>
                <span className="font-ui text-[12.5px] text-[var(--suave)]" aria-live="polite">{copiada === i ? ' Copiado.' : ''}</span>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ── artefatos ────────────────────────────────────────────────────────── */

const TIPO_DO_ARTEFATO: Record<string, string> = { documento: 'Documento', objeto: 'Objeto', lugar: 'Lugar', livro: 'Livro' };

export function Artefatos({ b }: { b: De<'artefatos'> }) {
  const [aberto, setAberto] = useState<string | null>(null);
  const a = b.itens.find(x => x.id === aberto);
  return (
    <section className="grid gap-3" aria-labelledby={`ar-${b.titulo}`}>
      <p className="rz-rot ocre m-0">Vitrine de artefatos</p>
      <h3 id={`ar-${b.titulo}`} className="rz-h3">{b.titulo}</h3>
      <ul className="-mx-4 m-0 flex snap-x gap-3 overflow-x-auto px-4 pb-2 list-none [scrollbar-width:thin]">
        {b.itens.map(x => (
          <li key={x.id} className="snap-start shrink-0">
            <button type="button" onClick={() => setAberto(aberto === x.id ? null : x.id)} aria-expanded={aberto === x.id}
              aria-controls={`ficha-${x.id}`} className={`rz-vitrine ${aberto === x.id ? 'aberta' : ''}`}>
              <Gravura nome={x.gravura} className="h-[74px] w-full text-[var(--tinta)]" />
              <span className="rz-rot !text-[10.5px]">{TIPO_DO_ARTEFATO[x.tipo] ?? x.tipo} · {x.quando}</span>
              <span className="rz-serif text-[16px] leading-snug text-[var(--titulo)]">{x.nome}</span>
            </button>
          </li>
        ))}
      </ul>
      {a && (
        <article id={`ficha-${a.id}`} className="rz-ficha rz-revelado" aria-label={`Ficha: ${a.nome}`}>
          <header className="grid gap-0.5">
            <span className="rz-rot !text-[#8FD6C8]">{TIPO_DO_ARTEFATO[a.tipo] ?? a.tipo} · {a.quando}</span>
            <h4 className="rz-serif m-0 text-[22px] font-[440]">{a.nome}</h4>
          </header>
          <div className="grid gap-3 p-4">
            <figure className="m-0 grid gap-1">
              <Gravura nome={a.gravura} className="mx-auto h-[150px] w-full max-w-[240px] text-[var(--tinta)]" />
              <figcaption className="font-ui text-[12px] leading-snug text-[var(--suave)]">{a.legenda}</figcaption>
            </figure>
            <p className="rz-corpo m-0 !text-[16.5px] font-[480]">{a.resumo}</p>
            <TextoComFontes texto={a.texto} />
            <button type="button" className="rz-link justify-self-start min-h-[40px]" onClick={() => setAberto(null)}>Fechar a ficha</button>
          </div>
        </article>
      )}
    </section>
  );
}
