'use client';

/* Meu vocabulário: as palavras que você já consegue ler.
 * ─────────────────────────────────────────────────────────────────────────
 * Só aparece palavra que as letras CONCLUÍDAS leem - a mesma conta do número
 * no painel (lib/vocabulario.ts). As outras existem só como um número: "mais
 * N chegam com as próximas letras". Mostrar a palavra trancada seria mostrar
 * letras que o aluno ainda não viu, que é a regra que o curso inteiro guarda.
 *
 * Cada palavra traz o que ajuda a lembrar dela: a transliteração, o sentido,
 * as letras que a formam, a forma à mão (sem vogais, como se escreve de
 * verdade), a ilustração quando existe e o áudio quando houver gravação.
 *
 * A busca aceita as três escritas: o hebraico (com ou sem vogais), a
 * transliteração (sem acento, como no teclado do telefone) e o português.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { AudioButton, hasAudio } from '@/components/learn/AudioButton';
import { useLeitura, fraseDeLeitura } from '@/lib/vocabulario';
import { consonantsToKnow } from '@/lib/hebrew';
import { normalizeTyped } from '@/lib/engine/types';
import { stripNikud } from '@/lib/hebrew';
import { track } from '@/lib/analytics';
import { tx } from '@/i18n/telas/academia-vocabulario-client';
import { useProgress } from '@/lib/state/store';
import { noCaderno, palavrasDoCaderno } from '@/lib/caderno';
import { DesafiarAmigo } from '@/components/learn/DesafiarAmigo';

/* Sem acento e com o "ss" do curso (kissé) igual a um s: quem busca "kise"
   acha a palavra. */
const semAcento = (s: string) => normalizeTyped(s).replace(/ss/g, 's');

export function VocabularioClient() {
  const leitura = useLeitura();
  const p = useProgress();
  const [busca, setBusca] = useState('');
  /* Meu caderno (lib/caderno.ts): a estrela guarda a palavra, e o filtro
     mostra só as guardadas. Guardar não muda nada no curso: é para rever. */
  const [soCaderno, setSoCaderno] = useState(false);
  const guardadas = palavrasDoCaderno(p.state.caderno, leitura.legiveis).length;
  const n = leitura.legiveis.length;
  const faltam = leitura.total - n;

  useEffect(() => { track('glossary_opened', { words: n }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const achadas = useMemo(() => {
    const q = busca.trim();
    const base = soCaderno ? palavrasDoCaderno(p.state.caderno, leitura.legiveis) : leitura.legiveis;
    if (!q) return base;
    const qHe = stripNikud(q);
    const qLat = semAcento(q);
    return base.filter(w =>
      (qHe && /[א-ת]/.test(qHe) && stripNikud(w.he).includes(qHe))
      || semAcento(w.translit).includes(qLat)
      || semAcento(w.pt).includes(qLat));
  }, [busca, leitura.legiveis, soCaderno, p.state.caderno]);

  return (
    <div className="grid gap-6 py-2">
      <header className="grid gap-2">
        <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted m-0">{tx.meuVocabulario}</p>
        <h1 className="text-[28px] font-bold m-0 text-balance">{fraseDeLeitura(n)}</h1>
        <p className="font-ui text-[15px] leading-relaxed text-ink-body m-0">
          {tx.intro(leitura.letras.length, faltam)}
        </p>
        {/* A forma à mão de cada palavra está logo abaixo; aqui é onde se
            pratica escrevê-la. */}
        {n > 0 && (
          <Link href="/academia?treino=palavras-a-mao"
                className="inline-flex items-center min-h-[44px] w-fit font-ui text-[14px] font-medium
                           text-[var(--teal-ink)] underline">
            {tx.praticarAMao}
          </Link>
        )}
        {n > 0 && (
          <Link href="/leitura"
                className="inline-flex items-center min-h-[44px] w-fit font-ui text-[14px] font-medium
                           text-[var(--teal-ink)] underline">
            {tx.praticarLeitura}
          </Link>
        )}
      </header>

      {/* O desafio com um amigo: cinco destas palavras num link (28/10/2026). */}
      <DesafiarAmigo palavras={leitura.legiveis} />

      {n > 0 && (
        <div className="grid gap-1.5">
          <label htmlFor="busca-vocab" className="font-ui text-[14px] font-semibold text-ink">
            {tx.procurar}
          </label>
          <input
            id="busca-vocab"
            type="search"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder={tx.placeholder}
            dir="auto"
            autoComplete="off" autoCapitalize="off" spellCheck={false}
            className="min-h-[48px] px-4 rounded-[var(--r-md)] border-2 border-line bg-surface
                       font-ui text-[16px] text-ink focus:border-[var(--accent-soft)]"
          />
          <p className="font-ui text-[13px] text-ink-muted m-0" role="status">
            {busca.trim() || soCaderno ? tx.achadas(achadas.length, n) : tx.nPalavras(n)}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <button type="button" aria-pressed={soCaderno} onClick={() => setSoCaderno(v => !v)}
                    className={`inline-flex items-center gap-1.5 min-h-[44px] rounded-full border px-3.5 font-ui text-[14px] font-semibold
                                ${soCaderno ? 'border-[var(--gold-solid)] bg-[var(--gold-solid)] text-white' : 'border-line bg-surface text-ink'}`}>
              <span aria-hidden>★</span>{tx.soOCaderno(guardadas)}
            </button>
            {guardadas > 0 && (
              <Link href="/academia?treino=flashcards-caderno"
                    className="inline-flex items-center min-h-[44px] font-ui text-[14px] font-medium text-[var(--teal-ink)] underline">
                {tx.treinarCaderno}
              </Link>
            )}
          </div>
          {guardadas === 0 && <p className="font-ui text-[13px] text-ink-muted m-0">{tx.cadernoDica}</p>}
        </div>
      )}

      {n === 0 ? (
        <p className="font-ui text-[15px] text-ink-body">
          {tx.vazio}{' '}
          <Link href="/mapa" className="underline">{tx.irCurso}</Link>
        </p>
      ) : (
        <ul className="grid gap-3 grid-cols-[minmax(0,1fr)] sm:grid-cols-2 list-none p-0 m-0" aria-label={tx.palavras} data-vocabulario>
          {achadas.map(w => (
            <li key={w.he} className="rounded-[var(--r-lg)] border border-line bg-surface p-4 grid gap-3">
              {/* flex-wrap: uma palavra longa no tamanho grande (מִשְׁפָּחָה) não
                  cabe ao lado do botão de ouvir num telefone de 390 px, e o
                  cartão empurrava a página para o lado. O botão desce. */}
              <div className="flex flex-wrap items-start gap-4">
                {w.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={w.image} alt={w.imageAlt ?? ''} width={72} height={72}
                       loading="lazy" decoding="async"
                       className="w-[72px] h-[72px] rounded-[var(--r-md)] bg-surface-2 object-cover shrink-0" />
                ) : null}
                <div className="grid gap-1 min-w-0 flex-1">
                  <He size="xl">{w.he}</He>
                  <p className="font-ui text-[15px] text-ink m-0">
                    <span className="font-semibold">{w.translit}</span>
                    <span className="text-ink-muted"> · {w.pt}</span>
                  </p>
                </div>
                {/* O nome no botão: eram 32 botões "Ouvir" iguais para o leitor
                    de tela (auditoria de 28/09, UX-011). */}
                <div className="grid gap-2 justify-items-end shrink-0">
                {hasAudio(w.audioId) && <AudioButton audioId={w.audioId} size="sm" ariaLabel={tx.ouvir(w.translit)} />}
                {(() => {
                  const guardada = noCaderno(p.state.caderno, w.he);
                  return (
                    <button type="button" aria-pressed={guardada} onClick={() => p.alternarCaderno(w.he)}
                            aria-label={guardada ? tx.tirarDoCaderno(w.translit) : tx.porNoCaderno(w.translit)}
                            className={`grid place-items-center w-11 h-11 shrink-0 rounded-full border text-[20px] leading-none
                                        transition-transform duration-150 active:scale-90
                                        ${guardada ? 'border-[var(--gold-solid)] bg-[var(--gold-solid)] text-white' : 'border-line bg-surface text-ink-muted'}`}>
                      <span aria-hidden>{guardada ? '★' : '☆'}</span>
                    </button>
                  );
                })()}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* As LETRAS que é preciso conhecer para ler a palavra - pela
                    mesma regra da leitura: o ו de לוֹ, antes do Vav, é vogal e
                    não entra aqui. Mostrá-lo como letra seria ensinar o Vav
                    antes da hora, que foi o que a primeira versão fez. */}
                <div className="flex items-center gap-2" aria-label={tx.letrasDaPalavra} data-letras>
                  <span className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">{tx.letras}</span>
                  <span className="he-seq">
                    {[...new Set(consonantsToKnow(w.he))].map(g => (
                      <span key={g} className="rounded-md bg-surface-2 px-1.5"><He size="inline">{g}</He></span>
                    ))}
                  </span>
                </div>
                {/* À mão, a palavra vai sem os sinais de vogal. Até 29/09/2026 a
                    forma cursiva só aparecia com TODAS as letras da grafia já
                    ensinadas, e toda palavra com o ו de vogal (יוֹם, שָׁלוֹם,
                    תוֹדָה, הוּא) ficava sem ela até a lição do Vav - o dono do
                    curso notou. Ler a cursiva não pede o Vav como letra: o
                    traço do ו é o mesmo que o aluno já lê como O e U. Escrever
                    pede, e por isso a escrita de palavras (palavrasAcumuladas)
                    continua com a régua estrita. */}
                <div className="flex items-center gap-2" data-cursiva>
                  <span className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">{tx.aMao}</span>
                  <He size="lg" cursive>{stripNikud(w.he)}</He>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {soCaderno && !busca.trim() && n > 0 && achadas.length === 0 && (
        <p className="font-ui text-[15px] text-ink-body">{tx.cadernoVazio}</p>
      )}
      {busca.trim() && n > 0 && achadas.length === 0 && (
        <p className="font-ui text-[15px] text-ink-body">
          {tx.nenhuma(busca)}
        </p>
      )}
    </div>
  );
}
