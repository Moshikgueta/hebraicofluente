'use client';

/* Teste: nota no fim, e a revisão do que escapou.
 * ─────────────────────────────────────────────────────────────────────────
 * A diferença entre isto e o Blast não é a velocidade - é O RETORNO. No
 * Blast a resposta certa aparece na hora, porque ali o objetivo é fixar. Num
 * teste o retorno vem no fim, porque o objetivo é MEDIR: saber se acertou na
 * hora muda a questão seguinte, e o número deixa de querer dizer alguma
 * coisa.
 *
 * Então: perguntas nos dois sentidos, sem correção durante, e no fim a nota,
 * o percentual, quantas foram e - a parte que importa - a lista do que foi
 * errado, com a resposta certa ao lado e um caminho de volta para a letra.
 *
 * Nada aqui reprova. O teste não tranca nem desconta; ele diz onde está o
 * buraco e oferece o caminho. Refazer é de graça e gera OUTRO teste, com a
 * semente da tentativa - decorar o gabarito não é a habilidade em jogo.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getLetter } from '@/lib/content';
import type { Pergunta } from '@/lib/engine/deck';

export type RespostaTeste = { q: Pergunta; escolhida: number };

export type ResultadoTeste = {
  acertos: number;
  total: number;
  score: number;
  erradas: RespostaTeste[];
  segundos: number;
};

export function TestRun({
  perguntas, onFim, onResposta, cronometro = false
}: {
  perguntas: readonly Pergunta[];
  onFim: (r: ResultadoTeste) => void;
  onResposta?: (a: { id: string; letterId: string; certo: boolean }) => void;
  /** Mostra o tempo correndo. Os modos `timed` da academia pedem isto. */
  cronometro?: boolean;
}) {
  const [i, setI] = useState(0);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [dadas, setDadas] = useState<RespostaTeste[]>([]);
  const [inicio] = useState(() => Date.now());

  /* ── A TRAVA, e o defeito que ela conserta ───────────────────────────
     Relato do aluno: «pressiono uma alternativa e o sistema registra ou
     avança como se eu tivesse respondido outra carta».

     A causa não era o índice nem o botão - era a guarda. `confirmar` lia
     `escolha` e `i` do FECHO do render em que foi criado, e dois toques
     dentro do mesmo quadro veem os dois o mesmo fecho: para o segundo,
     `escolha` ainda não é nula e `i` ainda é o anterior. Então ele passava
     pela guarda e fazia tudo de novo - gravava a MESMA pergunta duas vezes
     em `onResposta`, e chamava `setI(n => n + 1)` duas vezes, que é
     funcional e portanto avança DOIS. Uma pergunta era pulada, e a resposta
     que o aluno deu ficava contada na carta errada.

     Pior: `setDadas([...dadas, X])` não é funcional. Com o disparo duplo,
     as duas chamadas partem do mesmo `dadas` e a segunda sobrescreve a
     primeira - o teste perdia uma resposta inteira sem avisar.

     Estado de React não serve de trava porque ele é assíncrono por
     contrato. Um `ref` é síncrono: a segunda chamada, no mesmo quadro, já
     lê o valor que a primeira escreveu. A trava guarda o ÍNDICE já
     confirmado, e não um booleano, para que ela se solte sozinha na
     pergunta seguinte sem precisar de ninguém para limpá-la. */
  const confirmado = useRef(-1);

  /* O cronômetro, quando o modo pede um.
     ─────────────────────────────────────────────────────────────────────
     Um `setInterval` só, criado quando a rodada começa e desligado no
     desmonte - é o `return` do efeito que garante que ele não continua
     correndo depois de a tela fechar, e a lista de dependências vazia que
     garante que não nasce um segundo a cada render.

     A CONTA do tempo não vem do contador: vem de `Date.now() - inicio`, que
     é o relógio do sistema. Um contador incrementado a cada tique atrasa -
     o navegador suspende temporizadores em aba de fundo -, e um cronômetro
     que atrasa num exercício cujo nome é «contra o relógio» mede a atenção
     do navegador em vez da do aluno. O tique aqui serve só para redesenhar. */
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    if (!cronometro) return;
    const t = setInterval(() => setAgora(Date.now()), 250);
    return () => clearInterval(t);
  }, [cronometro]);

  const q = perguntas[i];

  const confirmar = useCallback(() => {
    if (escolha === null || !q) return;
    /* A trava, antes de qualquer efeito. */
    if (confirmado.current === i) return;
    confirmado.current = i;

    const certo = escolha === q.resposta;
    onResposta?.({ id: q.id, letterId: q.letterId, certo });
    const proximas = [...dadas, { q, escolhida: escolha }];
    setDadas(proximas);
    setEscolha(null);

    if (i + 1 >= perguntas.length) {
      const erradas = proximas.filter(r => r.escolhida !== r.q.resposta);
      onFim({
        acertos: proximas.length - erradas.length,
        total: proximas.length,
        score: proximas.length ? (proximas.length - erradas.length) / proximas.length : 0,
        erradas,
        segundos: Math.round((Date.now() - inicio) / 1000)
      });
      return;
    }
    setI(n => n + 1);
  }, [escolha, q, dadas, i, perguntas.length, onFim, onResposta, inicio]);

  if (!q) return null;
  const decorridos = Math.max(0, Math.round((agora - inicio) / 1000));
  const emHebraico = q.sentido === 'he';

  return (
    <div className="grid gap-5">
      <div className="flex items-center gap-3">
        <span className="flex-1 h-1.5 rounded-full bg-[var(--sand)] overflow-hidden">
          <span className="block h-full rounded-full bg-[var(--navy)] transition-[width] duration-300"
                style={{ width: `${(i / perguntas.length) * 100}%` }} />
        </span>
        <span className="font-ui text-[13px] tabular-nums text-ink-muted">
          {i + 1} / {perguntas.length}
        </span>
        {cronometro && (
          <span className="font-ui text-[13px] font-semibold tabular-nums text-ink shrink-0"
                aria-label={`Tempo decorrido: ${decorridos} segundos`}>
            {Math.floor(decorridos / 60)}:{String(decorridos % 60).padStart(2, '0')}
          </span>
        )}
      </div>

      <Card className="p-5 sm:p-7 grid gap-5">
        <p className="font-ui text-[17px] sm:text-[19px] font-semibold text-ink">{q.enunciadoPt}</p>

        <div className="rounded-[18px] bg-[var(--sand)] px-4 py-6 text-center">
          {emHebraico
            ? <He size="plate" tone="navy">{q.alvo}</He>
            : <span className="font-display text-[32px] sm:text-[38px] font-semibold
                               tracking-[-0.02em] text-[var(--navy)]">{q.alvo}</span>}
        </div>

        <ul className="grid gap-2.5 sm:grid-cols-2 list-none p-0 m-0">
          {q.opcoes.map((op, idx) => (
            <li key={`${q.id}-${idx}`}>
              <button
                type="button"
                onClick={() => setEscolha(idx)}
                aria-pressed={escolha === idx}
                className={`w-full min-h-[60px] rounded-[14px] border-2 px-4 py-3 text-left
                  flex items-center gap-3 transition-colors duration-[150ms]
                  ${escolha === idx
                    ? 'border-[var(--navy)] bg-[var(--teal-soft)]'
                    : 'border-line bg-[var(--card)] hover:border-[var(--teal)]'}`}
              >
                <span aria-hidden className={`w-6 h-6 rounded-md shrink-0 grid place-items-center
                  font-ui text-[12px] font-bold
                  ${escolha === idx ? 'bg-[var(--navy)] text-white' : 'bg-[var(--sand)] text-ink-muted'}`}>
                  {idx + 1}
                </span>
                {emHebraico
                  ? <span className="font-ui text-[16px] text-ink">{op}</span>
                  : <He size="word" tone="navy">{op}</He>}
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Button size="lg" full onClick={confirmar} disabled={escolha === null}>
        {escolha === null ? 'Escolha uma opção'
          : i + 1 >= perguntas.length ? 'Terminar o teste' : 'Confirmar e continuar'}
      </Button>
    </div>
  );
}

/* ── o relatório ────────────────────────────────────────────────────────── */

export function RelatorioTeste({
  r, onRefazer, children
}: { r: ResultadoTeste; onRefazer: () => void; children?: React.ReactNode }) {
  const pct = Math.round(r.score * 100);
  const forte = r.score >= 0.8;
  const meio = r.score >= 0.6;

  return (
    <div className="grid gap-5">
      <Card tone={forte ? 'mint' : 'ember'} className="p-6 sm:p-8 grid gap-3 text-center">
        <p className={`font-ui text-[13px] font-bold uppercase tracking-[.1em]
          ${forte ? 'text-[var(--teal-ink)]' : 'text-[var(--gold-ink)]'}`}>
          Teste concluído
        </p>
        <p className="font-display text-[40px] sm:text-[48px] font-semibold tracking-[-0.03em]
                      leading-none text-ink tabular-nums">
          {pct}%
        </p>
        <p className="font-ui text-[16px] text-ink-body">
          Você acertou {r.acertos} de {r.total}.
        </p>
        <p className="font-ui text-[14.5px] leading-relaxed text-ink-muted max-w-[46ch] mx-auto">
          {forte
            ? 'Isso é leitura firme. O que escapou volta sozinho na revisão, no dia certo.'
            : meio
              ? 'Boa base, com buracos localizados. A lista abaixo diz exatamente quais.'
              : 'Ainda é cedo para este conjunto, e isso não é um problema. Reveja as letras abaixo e refaça - não há limite de tentativas.'}
        </p>
      </Card>

      {r.erradas.length > 0 && (
        <Card className="p-5 sm:p-6 grid gap-3">
          <p className="font-display text-[18px] font-semibold tracking-[-0.018em] text-ink">
            O que escapou
          </p>
          <ul className="grid gap-2 list-none p-0 m-0">
            {r.erradas.map(({ q, escolhida }, k) => {
              const L = getLetter(q.letterId);
              const certa = q.opcoes[q.resposta] ?? '';
              const dada = q.opcoes[escolhida] ?? '';
              return (
                <li key={`${q.id}-${k}`}
                    className="flex items-center gap-3 rounded-[12px] border border-line px-3 py-2.5">
                  <span className="min-w-[34px] text-center">
                    <He size="word" tone="navy">{q.sentido === 'he' ? q.alvo : certa}</He>
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-ui text-[14.5px] text-ink">
                      {q.sentido === 'he' ? certa : q.alvo}
                    </span>
                    <span className="block font-ui text-[13px] text-[var(--gold-ink)]">
                      {q.sentido === 'he' ? `você marcou ${dada}` : 'você marcou outra letra'}
                    </span>
                  </span>
                  {L && (
                    <Link href={`/licao/${L.id}`}
                          className="font-ui text-[13px] text-[var(--teal-ink)] hover:underline shrink-0">
                      Rever {L.namePt}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Button variant={forte ? 'secondary' : 'primary'} onClick={onRefazer}>Refazer o teste</Button>
        {children}
      </div>
    </div>
  );
}
