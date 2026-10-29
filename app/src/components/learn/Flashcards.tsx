'use client';

/* Flashcards de letras e de palavras (28/10/2026, pedido do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * A frente mostra o hebraico; tocar vira a carta e mostra o resto (o nome e
 * o som da letra, ou a leitura e o sentido da palavra), com o áudio quando há
 * gravação. Depois o aluno diz se sabia. Quem disse "ainda não" volta no fim
 * da rodada, até todas saírem como "sabia".
 *
 * Só o que já foi ensinado: as letras com lição começada, e as palavras do
 * curso que essas letras leem (`palavrasLegiveis`, a mesma régua do contador
 * "palavras que você lê"). Nada é gravado no progresso e não paga XP: é a
 * autoavaliação do aluno, e ela não decide nada - a revisão e o domínio
 * continuam saindo dos exercícios.
 *
 * A virada é uma rotação em Y de 360 ms; com movimento reduzido, a troca é
 * na hora (as duas regras de globals.css). O conteúdo das duas faces está no
 * HTML, e a de trás fica `inert` enquanto não aparece.
 */

import { tx } from '@/i18n/telas/licao-flashcards';
import { useMemo, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Button } from '@/components/ui/Button';
import { AudioButton } from '@/components/learn/AudioButton';
import type { Letter } from '@/lib/content';
import { somPt } from '@/lib/som-pt';
import { alfabetoDe, palavrasLegiveis, vocabularioDoCurso } from '@/lib/engine/palavras';
import { rng, shuffled } from '@/lib/engine/rng';
import { palavrasDoCaderno, type Caderno } from '@/lib/caderno';

/** `caderno`: só as palavras do caderno do aluno (lib/caderno.ts). */
export type Baralho = 'letras' | 'palavras' | 'caderno';

type Carta = { id: string; frente: string; titulo: string; detalhe: string; audioId: string | null; cursiva?: string };

const POR_RODADA = 12;

export function cartasDoBaralho(baralho: Baralho, letras: readonly Letter[], todas: readonly Letter[], caderno?: Caderno): Carta[] {
  if (baralho === 'letras') {
    return letras.map(l => ({
      id: l.id, frente: l.letraComPonto ?? l.letter, titulo: l.namePt,
      detalhe: somPt(l.sound), audioId: l.audioId ?? null, cursiva: l.letter
    }));
  }
  const legiveis = palavrasLegiveis(vocabularioDoCurso(todas), alfabetoDe(letras));
  return (baralho === 'caderno' ? palavrasDoCaderno(caderno, legiveis) : legiveis).map(w => ({
    id: w.he, frente: w.he, titulo: w.translit, detalhe: w.pt, audioId: w.audioId ?? null
  }));
}

export function Flashcards({ baralho, letras, todas, semente, onBack, caderno }: {
  baralho: Baralho;
  caderno?: Caderno;
  letras: readonly Letter[];
  todas: readonly Letter[];
  semente: string;
  onBack: () => void;
}) {
  const [rodada, setRodada] = useState(0);
  const inicial = useMemo(
    () => shuffled(cartasDoBaralho(baralho, letras, todas, caderno), rng(`${semente}-${baralho}-${rodada}`)).slice(0, POR_RODADA),
    [baralho, letras, todas, semente, rodada, caderno]
  );
  const [fila, setFila] = useState<Carta[] | null>(null);
  const [virada, setVirada] = useState(false);
  const [sabia, setSabia] = useState(0);
  const [vistas, setVistas] = useState(0);

  const atual = (fila ?? inicial)[0];
  const restantes = (fila ?? inicial).length;

  if (inicial.length === 0) {
    return (
      <div className="grid gap-3 rounded-[var(--r-lg)] border border-line bg-[var(--card)] p-6">
        <p className="m-0 font-ui text-[15px] text-ink-body">
          {baralho === 'letras'
            ? tx.semLetras
            : baralho === 'caderno' ? tx.semCaderno
            : tx.semPalavras}
        </p>
        <Button variant="secondary" onClick={onBack}>{tx.voltar}</Button>
      </div>
    );
  }

  if (!atual) {
    return (
      <div className="grid gap-4 justify-items-center text-center rounded-[var(--r-lg)] bg-[var(--accent-bg)]
                      text-white px-6 py-9 shadow-[var(--sh)]">
        <span aria-hidden className="animate-pop grid place-items-center w-16 h-16 rounded-full bg-white
                                     text-[var(--navy)] text-[30px] font-bold">✓</span>
        <h2 className="m-0 text-white text-[24px] font-bold">{tx.completa}</h2>
        <p className="m-0 font-ui text-[15.5px] text-white max-w-[36ch]">
          {tx.todasSabidas(inicial.length)}
          {vistas > inicial.length ? tx.voltaram(vistas - inicial.length) : tx.nenhumaVoltou}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <button type="button" onClick={() => { setRodada(r => r + 1); setFila(null); setVirada(false); setSabia(0); setVistas(0); }}
                  className="min-h-[48px] px-5 rounded-[var(--r-md)] bg-white font-ui text-[15px] font-semibold text-[var(--navy)] active:scale-[.97]">
            {tx.outraRodada}
          </button>
          <button type="button" onClick={onBack}
                  className="min-h-[48px] px-5 rounded-[var(--r-md)] border border-white/40 font-ui text-[15px] text-white">
            {tx.voltar}
          </button>
        </div>
      </div>
    );
  }

  const responder = (sabe: boolean) => {
    const resto = (fila ?? inicial).slice(1);
    setFila(sabe ? resto : [...resto, atual]);
    if (sabe) setSabia(n => n + 1);
    setVistas(n => n + 1);
    setVirada(false);
  };

  return (
    <div className="grid gap-4 max-w-[440px] w-full mx-auto">
      <div className="flex items-center gap-3">
        <span aria-hidden className="flex-1 h-2 rounded-full bg-[var(--line)] overflow-hidden">
          <span className="block h-full bg-[var(--teal)] origin-left transition-transform duration-300"
                style={{ transform: `scaleX(${sabia / inicial.length})` }} />
        </span>
        <span className="font-ui text-[13px] font-semibold text-ink-muted tabular-nums">
          {sabia}/{inicial.length}
        </span>
      </div>

      {/* A carta: tocar vira. As duas faces ficam no HTML. */}
      <button type="button" onClick={() => setVirada(v => !v)}
              aria-label={virada ? tx.mostrarFrente : tx.virarEVer}
              className="relative h-[300px] [perspective:1200px] rounded-[20px] focus-visible:outline-offset-4">
        <span className={`hf-carta absolute inset-0 grid [transform-style:preserve-3d] ${virada ? 'hf-carta-virada' : ''}`}>
          <span className="absolute inset-0 grid place-items-center content-center gap-3 rounded-[20px] border border-line
                           bg-[var(--card)] shadow-[var(--sh)] [backface-visibility:hidden]">
            <He size={baralho === 'letras' ? 'display' : 'xl'}>{atual.frente}</He>
            <span className="font-ui text-[13px] text-ink-muted">{tx.toqueParaVirar}</span>
          </span>
          <span inert={!virada}
                className="absolute inset-0 grid place-items-center content-center gap-2 rounded-[20px] border border-[var(--teal)]
                           bg-[var(--teal-soft)] px-5 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="flex items-baseline gap-3">
              <He size="lg">{atual.frente}</He>
              {atual.cursiva && <He size="lg" cursive>{atual.cursiva}</He>}
            </span>
            <span className="font-display text-[24px] font-semibold text-ink">{atual.titulo}</span>
            <span className="font-ui text-[15.5px] text-[var(--teal-ink)]">{atual.detalhe}</span>
          </span>
        </span>
      </button>

      {/* O áudio fica fora da carta: um botão dentro de outro não é válido. */}
      <div className="flex justify-center min-h-[48px]">
        {virada && <AudioButton audioId={atual.audioId} label={tx.ouvir} />}
      </div>

      {virada ? (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="lg" onClick={() => responder(false)}>{tx.aindaNao}</Button>
          <Button size="lg" onClick={() => responder(true)}>{tx.sabia}</Button>
        </div>
      ) : (
        <Button size="lg" full onClick={() => setVirada(true)}>{tx.virar}</Button>
      )}
      <p className="m-0 text-center font-ui text-[13px] text-ink-muted tabular-nums">
        {tx.restantes(restantes)}
      </p>
    </div>
  );
}
