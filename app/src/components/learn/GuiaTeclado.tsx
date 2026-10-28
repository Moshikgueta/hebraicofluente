'use client';

import { tx } from '@/i18n/telas/licao-guia-teclado';
import { Prose } from '@/components/hebrew/Prose';

/* Como pôr o teclado hebraico no aparelho.
 * ─────────────────────────────────────────────────────────────────────────
 * Aparece em dois lugares: na página /teclado-hebraico, para consulta, e como
 * ETAPA OBRIGATÓRIA antes do primeiro modo de digitação da academia - com o
 * botão "Já adicionei o teclado hebraico". Em nenhum outro lugar do curso o
 * aluno precisa trocar de teclado: ler, reconhecer e montar são por toque.
 *
 * O sistema do aparelho vem pré-selecionado pelo `userAgent`, e pode ser
 * trocado - quem estuda no computador e pratica no telefone precisa dos dois.
 *
 * ── e o campo de teste ──────────────────────────────────────────────────
 * O passo 4 de cada guia ("como saber que está ativo") descreve o que se vê
 * na tela, e isso muda de versão para versão do sistema. O campo abaixo
 * dispensa a descrição: se o que chega nele é uma letra hebraica, o teclado
 * está ativo, qualquer que seja o aparelho.
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

type Sistema = 'ios' | 'android' | 'windows' | 'mac';

const NOME: Record<Sistema, string> = {
  ios: tx.ios, android: tx.android, windows: tx.windows, mac: tx.mac
};

/* Os quatro passos do pedido, na mesma ordem para os quatro sistemas: onde
   abrir, como adicionar, como alternar, como saber que está ativo. Os nomes
   dos menus são os da interface em português. */
const passos = (s: Sistema) => ([1, 2, 3, 4] as const).map(n => ({
  titulo: tx[`${s}${n}t`],
  texto: tx[`${s}${n}x`]
}));
const PASSOS: Record<Sistema, { titulo: string; texto: string }[]> = {
  ios: passos('ios'), android: passos('android'), windows: passos('windows'), mac: passos('mac')
};

function sistemaProvavel(): Sistema {
  if (typeof navigator === 'undefined') return 'android';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  /* iPad recente se anuncia como Mac; o toque denuncia. */
  if (/Macintosh/.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Mac/.test(ua)) return 'mac';
  if (/Win/.test(ua)) return 'windows';
  return 'android';
}

export function GuiaTeclado({
  onConfirmar, confirmado = false
}: {
  /** Quando existe, o guia termina no botão "Já adicionei o teclado hebraico". */
  onConfirmar?: () => void;
  confirmado?: boolean;
}) {
  const [sistema, setSistema] = useState<Sistema>('android');
  const [teste, setTeste] = useState('');
  useEffect(() => { setSistema(sistemaProvavel()); }, []);

  const hebraico = /[א-ת]/.test(teste);
  const latino = /[A-Za-z]/.test(teste);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <div className="grid gap-2">
        <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted m-0">
          {tx.seuAparelho}
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label={tx.escolha}>
          {(Object.keys(NOME) as Sistema[]).map(s => (
            <button
              key={s}
              type="button"
              aria-pressed={sistema === s}
              onClick={() => setSistema(s)}
              className={`min-h-[44px] px-4 rounded-full font-ui text-[14px] font-medium border
                ${sistema === s
                  ? 'bg-[var(--accent-wash)] text-[var(--accent)] border-[var(--accent-soft)]'
                  : 'bg-surface text-ink-body border-line hover:bg-surface-2'}`}
            >
              {NOME[s]}
            </button>
          ))}
        </div>
      </div>

      <ol className="grid gap-3 list-none p-0 m-0">
        {PASSOS[sistema].map((passo, i) => (
          <li key={passo.titulo} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 items-start">
            <span aria-hidden className="w-8 h-8 rounded-full bg-surface-2 grid place-items-center
                                         font-ui text-[14px] font-semibold text-ink">
              {i + 1}
            </span>
            <div>
              <p className="font-ui text-[15px] font-semibold text-ink m-0">{passo.titulo}</p>
              <p className="font-ui text-[15px] leading-relaxed text-ink-body m-0"><Prose text={passo.texto} /></p>
            </div>
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-2 rounded-[var(--r-lg)] bg-surface-2 p-4">
        <label htmlFor="teste-teclado" className="font-ui text-[14px] font-semibold text-ink">
          {tx.teste}
        </label>
        <input
          id="teste-teclado"
          value={teste}
          onChange={e => setTeste(e.target.value)}
          dir="auto"
          autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
          className="w-full min-w-0 min-h-[52px] px-4 rounded-[var(--r-md)] border-2 border-line bg-surface
                     he text-[22px] text-ink"
        />
        <p role="status" className="font-ui text-[14px] m-0 min-h-[20px]">
          {hebraico
            ? <span className="text-[var(--mint-ink)]">{tx.ativo}</span>
            : latino
              ? <span className="text-[var(--amber)]">{tx.latino}</span>
              : ' '}
        </p>
      </div>

      <p className="font-ui text-[14px] leading-relaxed text-ink-muted m-0">
        {tx.soDigitacao}
      </p>

      {onConfirmar && (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={onConfirmar} size="md">{tx.jaAdicionei}</Button>
          {!hebraico && !confirmado && (
            <span className="font-ui text-[13px] text-ink-muted">
              {tx.dica}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
