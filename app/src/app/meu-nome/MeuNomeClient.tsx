'use client';

/* Seu nome em hebraico - a atividade bônus.
 * ─────────────────────────────────────────────────────────────────────────
 * Quatro passos, e nenhum grava nada sem o aluno pedir:
 *
 *   1. o nome em português (vem do começo do curso, e pode ser trocado);
 *   2. as grafias possíveis - dita com todas as letras que não há uma só -, e
 *      o editor por toque para ajustar;
 *   3. o nome em impressa e à mão, lado a lado;
 *   4. escrever o nome à mão, no mesmo quadro das lições.
 *
 * A confirmação ("é assim que eu escrevo o meu nome") é o que grava a grafia
 * na conta - é ela que o certificado oferece no fim do curso - e marca a
 * conquista. Praticar a escrita é opcional e pode ser repetido sempre.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { Button } from '@/components/ui/Button';
import { TraceBoard, type QuadroHandle, type Veredito } from '@/components/learn/TraceBoard';
import { EditorDeNome, disponibilidade, nomeDoAluno } from '@/components/learn/MeuNome';
import { useProgress } from '@/lib/state/store';
import { useAccount } from '@/lib/account/store';
import { letrasConcluidas } from '@/lib/leitura';
import { letrasDoNome } from '@/lib/nome-hebraico';
import { stripNikud } from '@/lib/hebrew';
import { track } from '@/lib/analytics';
import { tx } from '@/i18n/telas/academia-meu-nome-client';

export function MeuNomeClient() {
  const p = useProgress();
  const account = useAccount();
  const nomeDaConta = account.session?.account.name ?? null;
  const aprendidas = useMemo(() => letrasConcluidas(p.state), [p.state]);
  const [nome, setNome] = useState('');
  const [grafia, setGrafia] = useState('');
  const [editado, setEditado] = useState(false);
  const iniciado = useRef(false);

  /* O nome e a grafia de partida chegam quando o progresso carrega - uma vez,
     para não apagar o que o aluno já digitou. */
  useEffect(() => {
    if (!p.ready || !account.ready || iniciado.current) return;
    iniciado.current = true;
    setNome(nomeDoAluno(p.state.onboarding?.name, nomeDaConta));
    if (p.state.nomeHebraico) { setGrafia(p.state.nomeHebraico.texto); setEditado(true); }
  }, [p.ready, account.ready, nomeDaConta, p.state.onboarding?.name, p.state.nomeHebraico]);

  const disp = useMemo(() => disponibilidade(nome, aprendidas.map(l => l.letter)), [nome, aprendidas]);
  /* Enquanto o aluno não mexeu na grafia, ela acompanha o nome digitado. */
  useEffect(() => {
    if (!editado && disp.escrevivel) setGrafia(disp.escrevivel);
  }, [disp.escrevivel, editado]);

  const conhecidas = new Set(aprendidas.map(l => l.letter));
  const escreviveis = disp.sugestoes.filter(s => letrasDoNome(s).every(l => conhecidas.has(l)));
  const confirmada = p.state.nomeHebraico?.texto === grafia.trim() && !!grafia.trim();

  const confirmar = () => {
    p.setNomeHebraico(grafia);
    if (!p.state.firsts['meu-nome']) p.markFirst('meu-nome');
    track('name_completed', {});
  };

  return (
    <div className="focus-col grid gap-7 py-2">
      <header className="grid gap-2">
        <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted m-0">{tx.bonus}</p>
        <h1 className="text-[28px] font-bold m-0 text-balance">{tx.titulo}</h1>
        <p className="font-ui text-[16px] leading-relaxed text-ink-body m-0">
          {tx.intro}
        </p>
      </header>

      <section className="grid gap-2" aria-labelledby="passo-nome">
        <h2 id="passo-nome" className="text-[18px] font-bold m-0">{tx.passoNome}</h2>
        <label htmlFor="nome-pt" className="font-ui text-[14px] text-ink-body">
          {tx.comoSeChama}
        </label>
        <input
          id="nome-pt" value={nome}
          onChange={e => { setNome(e.target.value); setEditado(false); }}
          autoComplete="given-name"
          className="min-h-[52px] px-4 rounded-[var(--r-md)] border-2 border-line bg-surface
                     font-ui text-[17px] text-ink focus:border-[var(--accent-soft)]"
        />
      </section>

      {nome.trim() && !disp.escrevivel && !editado && (
        <p className="font-ui text-[15px] leading-relaxed text-ink-body rounded-[var(--r-lg)] bg-surface-2 p-4 m-0">
          {Number.isFinite(disp.faltam) && disp.faltam > 0
            ? tx.faltamLetras(disp.faltam, nome.trim())
            : tx.semSugestao}
        </p>
      )}

      {(disp.escrevivel || editado) && (
        <>
          <section className="grid gap-3" aria-labelledby="passo-grafia">
            <h2 id="passo-grafia" className="text-[18px] font-bold m-0">{tx.passoGrafia}</h2>
            {escreviveis.length > 1 && (
              <div className="grid gap-2">
                <p className="font-ui text-[14px] text-ink-body m-0">
                  {tx.maisDeUmJeito}
                </p>
                <div className="flex flex-wrap gap-2" role="group" aria-label={tx.grafiasSugeridas}>
                  {escreviveis.map(s => (
                    <button key={s} type="button" aria-pressed={grafia === s}
                            onClick={() => { setGrafia(s); setEditado(true); }}
                            className={`min-h-[52px] px-4 rounded-[var(--r-md)] border-2
                              ${grafia === s ? 'border-[var(--accent-soft)] bg-[var(--accent-wash)]' : 'border-line bg-surface'}`}>
                      <He size="lg">{s}</He>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="font-ui text-[14px] text-ink-muted m-0">
              {tx.querAjustar}
            </p>
            <EditorDeNome valor={grafia} onChange={v => { setGrafia(v); setEditado(true); }} letras={aprendidas} />
          </section>

          {grafia.trim() && (
            <section className="grid gap-3" aria-labelledby="passo-ver">
              <h2 id="passo-ver" className="text-[18px] font-bold m-0">{tx.passoVer}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <figure className="m-0 rounded-[var(--r-lg)] border border-line bg-surface p-5 grid gap-2 justify-items-center">
                  <He size="display">{grafia}</He>
                  <figcaption className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">{tx.impressa}</figcaption>
                </figure>
                <figure className="m-0 rounded-[var(--r-lg)] border border-line bg-surface p-5 grid gap-2 justify-items-center">
                  <He size="display" cursive>{stripNikud(grafia)}</He>
                  <figcaption className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">{tx.aMao}</figcaption>
                </figure>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={confirmar} disabled={confirmada} size="md">
                  {confirmada ? tx.confirmado : tx.confirmar}
                </Button>
                <span className="font-ui text-[13px] text-ink-muted">
                  {tx.ficaGuardado}
                </span>
              </div>
            </section>
          )}

          {confirmada && <PraticarNome grafia={grafia.trim()} />}
        </>
      )}

      <p className="font-ui text-[14px] text-ink-muted m-0">
        <Link href="/meu-hebraico" className="underline">{tx.voltarPainel}</Link>
      </p>
    </div>
  );
}

/* O mesmo quadro das lições, com o nome como modelo. Uma palavra por vez: um
   nome e sobrenome juntos não cabem num telefone em corpo legível. */
function PraticarNome({ grafia }: { grafia: string }) {
  const palavras = grafia.split(/\s+/).filter(Boolean);
  const [qual, setQual] = useState(0);
  const [guia, setGuia] = useState(0.22);
  const [tinta, setTinta] = useState(false);
  const [veredito, setVeredito] = useState<Veredito | null>(null);
  const quadro = useRef<QuadroHandle>(null);
  const palavra = stripNikud(palavras[Math.min(qual, palavras.length - 1)] ?? '');
  const tamanho = palavra.length > 5 ? 'xl' : 'display';

  const limpar = () => { quadro.current?.limpar(); setVeredito(null); };

  return (
    <section className="grid gap-3" aria-labelledby="passo-escrever">
      <h2 id="passo-escrever" className="text-[18px] font-bold m-0">{tx.passoEscrever}</h2>
      {palavras.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label={tx.qualPalavra}>
          {palavras.map((w, i) => (
            <button key={w + i} type="button" aria-pressed={qual === i} onClick={() => { setQual(i); limpar(); }}
                    className={`min-h-[44px] px-3 rounded-full border ${qual === i ? 'bg-[var(--accent-wash)] border-[var(--accent-soft)]' : 'border-line'}`}>
              <He size="word">{w}</He>
            </button>
          ))}
        </div>
      )}
      <div className="rounded-[var(--r-lg)] border border-line overflow-hidden">
        <TraceBoard ref={quadro} glyph={palavra} guia={guia} label={tx.escrevaAMao(palavra)}
                    onTinta={setTinta} tamanhoGuia={tamanho} alturaClass="h-[220px] sm:h-[280px]" />
      </div>
      <p className="font-ui text-[14px] text-ink-muted m-0">
        {tx.comecePelaDireita} {guia > 0 ? tx.passeODedo : tx.semModelo}
      </p>
      {veredito && (
        <p role="status" className={`rounded-[var(--r-md)] px-4 py-3 font-ui text-[14px] m-0
          ${veredito.tone === 'good' ? 'bg-mint text-[var(--mint-ink)]' : 'bg-[var(--amber-wash)] text-[var(--amber)]'}`}>
          {veredito.message}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2.5">
        <Button size="md" disabled={!tinta} onClick={() => setVeredito(quadro.current?.conferir() ?? null)}>{tx.conferir}</Button>
        <Button variant="secondary" size="sm" disabled={!tinta} onClick={limpar}>{tx.limpar}</Button>
        <Button variant="ghost" size="sm" onClick={() => { setGuia(g => (g > 0 ? 0 : 0.22)); limpar(); }}>
          {guia > 0 ? tx.tentarSemModelo : tx.voltarModelo}
        </Button>
      </div>
    </section>
  );
}
