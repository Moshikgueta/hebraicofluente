'use client';

/* A lição de prática do módulo (29/09/2026). O motor está em
 * lib/engine/pratica.ts, e a nota de lá explica o porquê: nada aqui é
 * conteúdo novo, é o módulo inteiro de novo, com foco no que o aluno errou.
 *
 * Três partes que se abrem em qualquer ordem, e as portas para o texto, a
 * missão e o checkpoint. Não tranca nada.
 */

import { tx } from '@/i18n/telas/licao-pratica-client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, Badge } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { Milestone } from '@/components/game/Game';
import { He } from '@/components/hebrew/He';
import { ExercisePlayer } from '@/components/learn/ExercisePlayer';
import { CompararPronuncia } from '@/components/learn/CompararPronuncia';
import { GravarLeitura } from '@/components/learn/GravarLeitura';
import { audioAvailable, hasAudio, useRegistroDeAudio } from '@/components/learn/AudioButton';
import { useProgress } from '@/lib/state/store';
import { weakLetters } from '@/lib/state/rules';
import { allLetters, extras, missaoDoModulo, revisaoDoModulo, textoDoModulo, type CourseModule } from '@/lib/content';
import { missaoId } from '@/lib/engine/missao';
import {
  correcaoDoModulo, licaoDePratica, palavrasParaLer, parecidasDoModulo, praticaId
} from '@/lib/engine/pratica';
import { escolherRodada, registrarRodada } from '@/lib/rodadas';

type Parte = 'menu' | 'correcao' | 'parecidas' | 'ler';

export function PraticaClient({ module: mod }: { module: CourseModule }) {
  const p = useProgress();
  const versaoAudio = useRegistroDeAudio();
  const [parte, setParte] = useState<Parte>('menu');
  const [rodada, setRodada] = useState(0);
  const [feitas, setFeitas] = useState<Set<Parte>>(new Set());
  const [fim, setFim] = useState<{ parte: Parte; certas: number; total: number } | null>(null);

  const letras = useMemo(() => allLetters(), []);
  const byGlyph = useMemo(() => {
    const m = new Map<string, string>();
    for (const L of letras) { m.set(L.letter, L.id); if (L.finalForm) m.set(L.finalForm, L.id); }
    return m;
  }, [letras]);

  const correcao = useMemo(() => {
    const fracas = weakLetters(p.state, p.day, 10, byGlyph);
    let dosErros = false;
    const { itens } = escolherRodada(`pratica-correcao-${mod.n}`, seed => {
      const r = correcaoDoModulo(mod, letras, extras(), fracas, { audioAvailable: audioAvailable(), seed });
      dosErros = r.dosErros;
      return r.exercicios;
    });
    return { itens, dosErros };
    /* O estado entra só pela rodada: refazer recalcula com os erros novos,
       mas uma resposta dada no meio não troca as perguntas debaixo do aluno. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mod, letras, byGlyph, rodada, versaoAudio]);

  const parecidas = useMemo(
    () => {
      let par: ReturnType<typeof parecidasDoModulo> = null;
      const { itens } = escolherRodada(`pratica-parecidas-${mod.n}`, seed => {
        par = parecidasDoModulo(mod, letras, { audioAvailable: audioAvailable(), seed });
        return par?.exercicios ?? [];
      });
      const r = par as ReturnType<typeof parecidasDoModulo>;
      return r && itens.length ? { par: r.par, itens } : null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mod, letras, rodada, versaoAudio]
  );

  const palavras = useMemo(() => palavrasParaLer(mod, letras, extras()), [mod, letras]);
  const texto = textoDoModulo(mod.n);
  const revisao = revisaoDoModulo(mod.n);
  const missao = missaoDoModulo(mod.n);
  const numero = licaoDePratica(mod);
  const concluida = !!p.state.firsts[praticaId(mod.n)];
  const correcaoFeita = feitas.has('correcao');
  const parecidasFeita = feitas.has('parecidas');

  const terminar = (qual: Parte, itens: readonly { id: string }[], certas: number, total: number) => {
    registrarRodada(`pratica-${qual}-${mod.n}`, itens as never);
    setFeitas(s => new Set(s).add(qual));
    /* markFirst já registra o evento `first_reached` na primeira vez. */
    if (qual === 'correcao') p.markFirst(praticaId(mod.n));
    setFim({ parte: qual, certas, total });
    setRodada(n => n + 1);
  };

  if (parte === 'correcao' && !fim) {
    return (
      <ExercisePlayer
        key={`correcao-${rodada}`}
        exercises={correcao.itens}
        title={`${tx.prefixo(numero)} · ${tx.correcao}`}
        repetirErros
        onDone={r => terminar('correcao', correcao.itens, r.correct, r.total)}
      />
    );
  }
  if (parte === 'parecidas' && parecidas && !fim) {
    return (
      <ExercisePlayer
        key={`parecidas-${rodada}`}
        exercises={parecidas.itens}
        title={`${tx.prefixo(numero)} · ${tx.par(parecidas.par[0].namePt, parecidas.par[1].namePt)}`}
        repetirErros
        onDone={r => terminar('parecidas', parecidas.itens, r.correct, r.total)}
      />
    );
  }
  if (fim) {
    return (
      <div className="focus-col grid gap-5">
        <Milestone
          tone="bom"
          kicker={fim.parte === 'correcao' ? tx.correcaoConcluida : tx.parecidasConcluidas}
          title={tx.voltou}
          body={tx.quandoQuiser}
        >
          <Button onClick={() => { setFim(null); setParte('menu'); }}>{tx.voltarPratica}</Button>
        </Milestone>
      </div>
    );
  }

  if (parte === 'ler') {
    return (
      <div className="grid gap-5 reading">
        <button type="button" onClick={() => setParte('menu')}
                className="justify-self-start inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">
          {tx.voltarPraticaSeta}
        </button>
        <div className="grid gap-1">
          <h2 className="text-[21px] font-bold">{tx.lerEmVozAlta}</h2>
          <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
            {tx.palavrasDoModulo}
          </p>
        </div>
        <Card className="p-5 grid gap-2">
          {palavras.map(w => (
            <div key={w.he} className="flex items-center gap-3 rounded-[var(--r-md)] bg-surface-2 px-3 py-2">
              <He size="word">{w.he}</He>
              <span className="grid min-w-0">
                {w.translit && <span className="font-ui text-[14px] font-semibold text-ink">{w.translit}</span>}
                <span className="font-ui text-[12.5px] text-ink-muted">{w.pt}</span>
              </span>
            </div>
          ))}
        </Card>
        {palavras.some(w => hasAudio(w.audioId)) && (
          <CompararPronuncia itens={palavras} titulo={tx.compare} />
        )}
        <GravarLeitura
          titulo={tx.leiaALista}
          instrucao={tx.leiaInstrucao}
          maxSegundos={90}
        />
        <Button size="lg" full onClick={() => { setFeitas(s => new Set(s).add('ler')); setParte('menu'); }}>
          {tx.termineiDeLer}
        </Button>
      </div>
    );
  }

  const Item = ({ qual, titulo, texto: t, rotulo, onClick }: {
    qual: Parte; titulo: string; texto: string; rotulo: string; onClick: () => void;
  }) => (
    <Card className="p-5 grid gap-3 sm:flex sm:items-center sm:justify-between sm:gap-5">
      <div className="grid gap-1 min-w-0">
        <p className="font-display text-[17px] font-semibold text-ink m-0">
          {titulo}{feitas.has(qual) ? ' ✓' : ''}
        </p>
        <p className="text-[14.5px] leading-relaxed text-ink-body m-0">{t}</p>
      </div>
      <Button variant={feitas.has(qual) ? 'secondary' : 'primary'} className="shrink-0" onClick={onClick}>{rotulo}</Button>
    </Card>
  );

  return (
    <div className="grid gap-6 reading">
      <header className="grid gap-3">
        <Link href={`/modulo/${mod.n}`}
              className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">
          {tx.modulo(mod.n)}
        </Link>
        <Badge tone="accent">{tx.badge(mod.n, numero)}{concluida ? tx.feita : ''}</Badge>
        <h1 className="text-[27px] sm:text-[32px] font-bold leading-tight">{tx.titulo(mod.n)}</h1>
        <p className="text-[16px] leading-relaxed text-ink-body">
          {tx.intro}
        </p>
      </header>

      <div className="grid gap-3">
        <Item qual="correcao" titulo={tx.item1}
              texto={correcao.dosErros
                ? tx.dosErros
                : mod.letterIds.length
                  ? tx.semErros
                  : tx.perguntasMisturadas}
              rotulo={correcaoFeita ? tx.fazerDeNovo : tx.comecar}
              onClick={() => setParte('correcao')} />
        {parecidas && (
          <Item qual="parecidas" titulo={tx.item2(parecidas.par[0].namePt, parecidas.par[1].namePt)}
                texto={tx.ladoALado}
                rotulo={parecidasFeita ? tx.fazerDeNovo : tx.comecar}
                onClick={() => setParte('parecidas')} />
        )}
        <Item qual="ler" titulo={tx.itemLer(parecidas ? 3 : 2)}
              texto={tx.palavrasParaLer(palavras.length)}
              rotulo={tx.abrir} onClick={() => setParte('ler')} />
      </div>

      <Card tone="wash" className="p-5 grid gap-3">
        <p className="font-display text-[17px] font-semibold text-ink m-0">{tx.fechar}</p>
        <div className="flex flex-wrap gap-2">
          {revisao && <LinkButton href={`/modulo/${mod.n}/revisao`} variant="secondary">{tx.leituraDeRevisao}</LinkButton>}
          {texto && <LinkButton href={`/modulo/${mod.n}/texto`} variant="secondary">{tx.lerTexto}</LinkButton>}
          {missao && (
            <LinkButton href={`/modulo/${mod.n}/missao`} variant="secondary">
              {p.state.firsts[missaoId(mod.n)] ? tx.missaoFeita : tx.fazerMissao}
            </LinkButton>
          )}
          {mod.checkpoint && <LinkButton href={`/checkpoint/${mod.n}`}>{tx.checkpoint(mod.n)}</LinkButton>}
          <LinkButton href="/academia" variant="ghost">{tx.maisJogos}</LinkButton>
        </div>
      </Card>
    </div>
  );
}
