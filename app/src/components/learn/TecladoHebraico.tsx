'use client';

/* O teclado hebraico na tela, nos exercícios de escrever em hebraico
 * (29/09/2026, pedido do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * Não substitui o teclado do aparelho: é um apoio embaixo do campo, para
 * quem ainda não instalou o hebraico ou não acha a letra. O campo continua
 * aceitando o teclado físico e o do celular.
 *
 * As teclas não roubam o foco (`preventDefault` no pointerdown): no
 * computador o cursor continua piscando no campo; no celular, tocar uma
 * tecla daqui não abre o teclado do sistema por cima. A posição do cursor é
 * lembrada a cada movimento no campo, e é ali que a tecla escreve.
 *
 * As letras vão da direita para a esquerda (א à direita), como no teclado
 * de verdade se lê a ordem do alfabeto. Os sinais aparecem sobre um círculo
 * pontilhado (◌ַ), a convenção para mostrar um sinal sem letra.
 */

import { tx } from '@/i18n/telas/licao-teclado-hebraico';
import { useEffect, useState, type RefObject } from 'react';
import { FINAIS, LETRAS, NIKUD, apagar, inserir, type Edicao, type Selecao, type Tecla } from '@/lib/teclado-hebraico';

const CHAVE = 'hf-teclado-hebraico-v1';

export function TecladoHebraico({ campo, valor, selecao, aoEditar, desligado }: {
  campo: RefObject<HTMLInputElement | null>;
  valor: string;
  selecao: RefObject<Selecao>;
  aoEditar: (e: Edicao) => void;
  desligado?: boolean;
}) {
  const [aberto, setAberto] = useState(true);
  useEffect(() => {
    try { if (localStorage.getItem(CHAVE) === 'fechado') setAberto(false); } catch { /* sem armazenamento */ }
  }, []);
  const alternar = () => {
    setAberto(a => {
      try { localStorage.setItem(CHAVE, a ? 'fechado' : 'aberto'); } catch { /* idem */ }
      return !a;
    });
  };

  const aplicar = (e: Edicao) => {
    selecao.current = { ini: e.cursor, fim: e.cursor };
    aoEditar(e);
    /* Com o campo em foco (computador, ou celular com o teclado aberto), o
       cursor vai para depois do que entrou. */
    requestAnimationFrame(() => {
      const el = campo.current;
      if (el && document.activeElement === el) el.setSelectionRange(e.cursor, e.cursor);
    });
  };
  /* Com o campo em foco, a posição vale a do próprio campo (setas, toque,
     seleção com o mouse); fora dele, a última que ele teve. */
  const onde = (): Selecao => {
    const el = campo.current;
    if (el && document.activeElement === el && el.selectionStart !== null) {
      return { ini: el.selectionStart, fim: el.selectionEnd ?? el.selectionStart };
    }
    return selecao.current;
  };
  const escrever = (t: Tecla) => aplicar(inserir(valor, onde(), t.ch));
  const voltar = () => aplicar(apagar(valor, onde()));

  const tecla = (t: Tecla, sinal = false) => (
    <button key={t.ch} type="button" disabled={desligado}
            onPointerDown={e => e.preventDefault()}
            onClick={() => escrever(t)}
            aria-label={t.nome} title={t.nome}
            className={`min-h-[44px] min-w-[40px] rounded-[var(--r-sm)] border border-line bg-surface
                        grid place-items-center he text-[22px] leading-none text-ink
                        hover:bg-surface-2 active:scale-[.96] disabled:opacity-50
                        ${sinal ? 'text-[24px]' : ''}`}>
      <span aria-hidden lang="he">{sinal ? `◌${t.ch}` : t.ch}</span>
    </button>
  );

  return (
    <div className="grid gap-2">
      <button type="button" onClick={alternar} aria-expanded={aberto} aria-controls="teclado-hebraico"
              className="justify-self-start min-h-[44px] font-ui text-[14px] font-semibold text-[var(--accent)]
                         underline underline-offset-4">
        {aberto ? tx.esconder : tx.mostrar}
      </button>
      {aberto && (
        <div id="teclado-hebraico" role="group" aria-label={tx.teclado}
             className="grid gap-2 rounded-[var(--r-md)] bg-surface-2 p-2 sm:p-3">
          <div dir="rtl" className="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-1.5">
            {LETRAS.map(t => tecla(t))}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 justify-between">
            <div dir="rtl" className="flex flex-wrap gap-1.5" role="group" aria-label={tx.finais}>
              {FINAIS.map(t => tecla(t))}
            </div>
            <div className="flex gap-1.5">
              <button type="button" disabled={desligado}
                      onPointerDown={e => e.preventDefault()}
                      onClick={() => aplicar(inserir(valor, onde(), ' '))}
                      aria-label={tx.espacoRotulo}
                      className="min-h-[44px] px-4 rounded-[var(--r-sm)] border border-line bg-surface font-ui text-[13px]
                                 hover:bg-surface-2 disabled:opacity-50">
                {tx.espaco}
              </button>
              <button type="button" disabled={desligado}
                      onPointerDown={e => e.preventDefault()}
                      onClick={voltar}
                      aria-label={tx.apagarRotulo}
                      className="min-h-[44px] px-4 rounded-[var(--r-sm)] border border-line bg-surface font-ui text-[15px]
                                 hover:bg-surface-2 disabled:opacity-50">
                <span aria-hidden>⌫</span> <span className="text-[13px]">{tx.apagar}</span>
              </button>
            </div>
          </div>
          <div dir="rtl" className="flex flex-wrap gap-1.5" role="group" aria-label={tx.sinais}>
            {NIKUD.map(t => tecla(t, true))}
          </div>
          <p className="font-ui text-[12px] text-ink-muted m-0">
            {tx.dica}
          </p>
        </div>
      )}
    </div>
  );
}
