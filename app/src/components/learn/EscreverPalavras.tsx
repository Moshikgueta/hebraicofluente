'use client';

/* Palavras à mão: escrever em cursiva as palavras que o aluno já aprendeu.
 * ─────────────────────────────────────────────────────────────────────────
 * O treino de escrita da academia era de letra solta, e ninguém escreve
 * letra solta: escreve palavra. Na palavra aparece o que a letra sozinha
 * esconde - o tamanho de uma perto da outra, a final no lugar da base, a mão
 * indo da direita para a esquerda sem voltar.
 *
 * Cada palavra passa pelas mesmas três etapas da escrita de letra, com o
 * apoio saindo aos poucos: por cima do modelo, modelo fraco, sem modelo.
 * O quadro é o mesmo das lições e do "meu nome" (TraceBoard); o modelo é a
 * palavra SEM vogais, que é como ela se escreve à mão de verdade.
 *
 * As palavras vêm de `palavrasParaEscrever`: só as que têm TODA letra da
 * grafia já ensinada, a mesma régua que decide quando o vocabulário mostra a
 * forma à mão.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { He } from '@/components/hebrew/He';
import { AudioButton, hasAudio } from './AudioButton';
import { TraceBoard, type QuadroHandle, type Veredito } from './TraceBoard';
import type { Letter } from '@/lib/content';
import { palavrasParaEscrever, type PalavraDoCurso } from '@/lib/engine/palavras';
import { rng } from '@/lib/engine/rng';
import { stripNikud } from '@/lib/hebrew';
import { escolherRodada, registrarRodada } from '@/lib/rodadas';

const ETAPAS = [
  { guia: 0.22, rotulo: 'Por cima do modelo', dica: 'Passe o dedo por cima da palavra, começando pela direita.' },
  { guia: 0.08, rotulo: 'Modelo fraco', dica: 'O modelo quase sumiu. Siga assim mesmo.' },
  { guia: 0, rotulo: 'Sem modelo', dica: 'Agora sozinho. Escreva a palavra de memória.' }
] as const;

export function EscreverPalavras({ letras, semente, extras = [] }: {
  letras: readonly Letter[]; semente: string;
  /** As palavras dos mini-textos já lidos. */
  extras?: readonly PalavraDoCurso[];
}) {
  const [rodada, setRodada] = useState(0);
  const palavras = useMemo(
    /* Cada rodada completa manda as suas palavras para o fim da fila: a
       seguinte - agora ou noutro dia - traz outras (lib/rodadas.ts). */
    () => escolherRodada('escrever-palavras', seed => palavrasParaEscrever(letras, rng(seed), undefined, extras), w => w.he).itens,
    /* Pela CHAVE das palavras, e não pela lista: quem chama monta a lista a
       cada render, e depender dela sortearia outra rodada no meio da
       escrita - o defeito que a academia já teve com os jogos. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [letras, semente, rodada, extras.map(w => w.he).join('|')]
  );
  const [qual, setQual] = useState(0);
  const [etapa, setEtapa] = useState(0);
  const [tinta, setTinta] = useState(false);
  const [veredito, setVeredito] = useState<Veredito | null>(null);
  /* A nota da etapa SEM modelo de cada palavra: é a que diz se a mão sabe. */
  const [notas, setNotas] = useState<number[]>([]);
  const completa = palavras.length > 0 && qual >= palavras.length;
  useEffect(() => {
    if (completa) registrarRodada('escrever-palavras', palavras, w => w.he);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completa]);
  const quadro = useRef<QuadroHandle>(null);

  if (!palavras.length) {
    return (
      <Card tone="amber" className="p-6">
        <p className="text-[15px] leading-relaxed text-ink-body m-0">
          Ainda não há palavra inteira para escrever: elas chegam quando todas as letras
          de uma palavra já foram ensinadas. Continue as lições e volte aqui.
        </p>
      </Card>
    );
  }

  if (qual >= palavras.length) {
    const boas = notas.filter(n => n >= 0.6).length;
    return (
      <Card tone="mint" className="p-6 grid gap-4">
        <p className="font-ui text-[13px] uppercase tracking-[.07em] text-[var(--mint-ink)] m-0">
          Rodada completa
        </p>
        <p className="text-[18px] font-semibold text-ink m-0">
          Você escreveu {palavras.length} palavras à mão
          {boas ? `, ${boas} delas sem modelo e bem parecidas com o original` : ''}.
        </p>
        <ul className="flex flex-wrap gap-3 list-none p-0 m-0" aria-label="As palavras desta rodada">
          {palavras.map(w => (
            <li key={w.he} className="rounded-[var(--r-md)] border border-line bg-surface px-3 py-2">
              <He size="lg" cursive>{stripNikud(w.he)}</He>
            </li>
          ))}
        </ul>
        <Button className="justify-self-start" onClick={() => {
          setRodada(r => r + 1); setQual(0); setEtapa(0); setNotas([]); setVeredito(null); setTinta(false);
        }}>
          Mais cinco palavras
        </Button>
      </Card>
    );
  }

  const w = palavras[qual]!;
  const escrita = stripNikud(w.he);
  const atual = ETAPAS[etapa]!;
  const ultimaEtapa = etapa === ETAPAS.length - 1;
  const limpar = () => { quadro.current?.limpar(); setVeredito(null); };

  const avancar = () => {
    if (!ultimaEtapa) { setEtapa(e => e + 1); limpar(); return; }
    setNotas(ns => [...ns, veredito?.score ?? 0]);
    setQual(q => q + 1); setEtapa(0); limpar();
  };

  return (
    <div className="grid gap-4">
      <p className="font-ui text-[13px] text-ink-muted m-0" aria-live="polite">
        Palavra {qual + 1} de {palavras.length} · {atual.rotulo}
      </p>

      {/* Compacto de propósito: no telefone o quadro tem de aparecer sem
          rolar, e é ele o exercício. A palavra impressa e o sentido são só
          a lembrança do que se vai escrever. */}
      <Card className="p-4 flex items-center gap-4 flex-wrap">
        <He size="xl">{w.he}</He>
        <div className="grid gap-0.5 min-w-0 flex-1">
          <p className="font-ui text-[15px] text-ink m-0">
            <span className="font-semibold">{w.translit}</span>
            <span className="text-ink-muted"> · {w.pt}</span>
          </p>
          <p className="font-ui text-[13px] text-ink-muted m-0">À mão, sem os pontinhos das vogais.</p>
        </div>
        {hasAudio(w.audioId) && <AudioButton audioId={w.audioId} size="sm" />}
      </Card>

      <div className="rounded-[var(--r-lg)] border border-line overflow-hidden">
        <TraceBoard
          ref={quadro}
          glyph={escrita}
          guia={atual.guia}
          label={`${escrita}, ${w.pt}`}
          onTinta={setTinta}
          /* Medido na fonte cursiva: a mais larga das candidatas (sete
             letras) ocupa ~258px no corpo `display`, e o quadro de um
             telefone de 360px tem 326. Letra grande é mais fácil de
             escrever com o dedo, então só as de duas letras vão maiores. */
          tamanhoGuia={escrita.length <= 2 ? 'hero' : 'display'}
          alturaClass="h-[220px] sm:h-[280px]"
        />
      </div>

      <p className="font-ui text-[14px] text-ink-muted m-0">{atual.dica}</p>

      {veredito && (
        <p role="status" className={`rounded-[var(--r-md)] px-4 py-3 font-ui text-[14px] m-0
          ${veredito.tone === 'good' ? 'bg-mint text-[var(--mint-ink)]' : 'bg-[var(--amber-wash)] text-[var(--amber)]'}`}>
          {veredito.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        {veredito ? (
          <Button size="md" onClick={avancar}>
            {!ultimaEtapa ? 'Próxima etapa' : qual + 1 < palavras.length ? 'Próxima palavra' : 'Terminar'}
          </Button>
        ) : (
          <Button size="md" disabled={!tinta} onClick={() => setVeredito(quadro.current?.conferir() ?? null)}>
            Conferir
          </Button>
        )}
        <Button variant="secondary" size="sm" disabled={!tinta} onClick={limpar}>
          {veredito ? 'Tentar de novo' : 'Limpar'}
        </Button>
      </div>
    </div>
  );
}
