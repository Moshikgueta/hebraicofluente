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

/* Sem acento e com o "ss" do curso (kissé) igual a um s: quem busca "kise"
   acha a palavra. */
const semAcento = (s: string) => normalizeTyped(s).replace(/ss/g, 's');

export function VocabularioClient() {
  const leitura = useLeitura();
  const [busca, setBusca] = useState('');
  const n = leitura.legiveis.length;
  const faltam = leitura.total - n;

  useEffect(() => { track('glossary_opened', { words: n }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const achadas = useMemo(() => {
    const q = busca.trim();
    if (!q) return leitura.legiveis;
    const qHe = stripNikud(q);
    const qLat = semAcento(q);
    return leitura.legiveis.filter(w =>
      (qHe && /[א-ת]/.test(qHe) && stripNikud(w.he).includes(qHe))
      || semAcento(w.translit).includes(qLat)
      || semAcento(w.pt).includes(qLat));
  }, [busca, leitura.legiveis]);

  return (
    <div className="grid gap-6 py-2">
      <header className="grid gap-2">
        <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted m-0">Meu vocabulário</p>
        <h1 className="text-[28px] font-bold m-0 text-balance">{fraseDeLeitura(n)}</h1>
        <p className="font-ui text-[15px] leading-relaxed text-ink-body m-0">
          São as palavras do curso escritas só com as {leitura.letras.length} letras que você
          já concluiu.{faltam > 0
            ? ` Mais ${faltam} chegam com as próximas letras.`
            : ' É o vocabulário inteiro do curso.'}
        </p>
        {/* A forma à mão de cada palavra está logo abaixo; aqui é onde se
            pratica escrevê-la. */}
        {n > 0 && (
          <Link href="/academia?treino=palavras-a-mao"
                className="inline-flex items-center min-h-[44px] w-fit font-ui text-[14px] font-medium
                           text-[var(--teal-ink)] underline">
            Praticar estas palavras à mão, em cursiva
          </Link>
        )}
        {n > 0 && (
          <Link href="/leitura"
                className="inline-flex items-center min-h-[44px] w-fit font-ui text-[14px] font-medium
                           text-[var(--teal-ink)] underline">
            Ler estas palavras sozinho, no Laboratório de Leitura
          </Link>
        )}
      </header>

      {n > 0 && (
        <div className="grid gap-1.5">
          <label htmlFor="busca-vocab" className="font-ui text-[14px] font-semibold text-ink">
            Procurar
          </label>
          <input
            id="busca-vocab"
            type="search"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="em hebraico, transliteração ou português"
            dir="auto"
            autoComplete="off" autoCapitalize="off" spellCheck={false}
            className="min-h-[48px] px-4 rounded-[var(--r-md)] border-2 border-line bg-surface
                       font-ui text-[16px] text-ink focus:border-[var(--accent-soft)]"
          />
          <p className="font-ui text-[13px] text-ink-muted m-0" role="status">
            {busca.trim() ? `${achadas.length} de ${n}` : `${n} palavras`}
          </p>
        </div>
      )}

      {n === 0 ? (
        <p className="font-ui text-[15px] text-ink-body">
          Conclua a lição do Mem e a primeira palavra aparece aqui.{' '}
          <Link href="/mapa" className="underline">Ir para o curso</Link>
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 list-none p-0 m-0" aria-label="Palavras" data-vocabulario>
          {achadas.map(w => (
            <li key={w.he} className="rounded-[var(--r-lg)] border border-line bg-surface p-4 grid gap-3">
              <div className="flex items-start gap-4">
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
                {hasAudio(w.audioId) && <AudioButton audioId={w.audioId} size="sm" ariaLabel={`Ouvir ${w.translit}`} />}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* As LETRAS que é preciso conhecer para ler a palavra - pela
                    mesma regra da leitura: o ו de לוֹ, antes do Vav, é vogal e
                    não entra aqui. Mostrá-lo como letra seria ensinar o Vav
                    antes da hora, que foi o que a primeira versão fez. */}
                <div className="flex items-center gap-2" aria-label="As letras desta palavra" data-letras>
                  <span className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">Letras</span>
                  <span className="he-seq">
                    {[...new Set(consonantsToKnow(w.he))].map(g => (
                      <span key={g} className="rounded-md bg-surface-2 px-1.5"><He size="inline">{g}</He></span>
                    ))}
                  </span>
                </div>
                {/* À mão, a palavra vai sem os sinais de vogal. Até 29/09/2026 a
                    forma cursiva só aparecia com TODAS as letras da grafia já
                    ensinadas, e toda palavra com o ו de vogal (יוֹם, שָׁלוֹם,
                    תּוֹדָה, הוּא) ficava sem ela até a lição do Vav - o dono do
                    curso notou. Ler a cursiva não pede o Vav como letra: o
                    traço do ו é o mesmo que o aluno já lê como O e U. Escrever
                    pede, e por isso a escrita de palavras (palavrasAcumuladas)
                    continua com a régua estrita. */}
                <div className="flex items-center gap-2" data-cursiva>
                  <span className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">À mão</span>
                  <He size="lg" cursive>{stripNikud(w.he)}</He>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {busca.trim() && n > 0 && achadas.length === 0 && (
        <p className="font-ui text-[15px] text-ink-body">
          Nenhuma palavra que você já lê tem “{busca}”. A palavra pode usar uma letra que
          ainda vem pela frente.
        </p>
      )}
    </div>
  );
}
