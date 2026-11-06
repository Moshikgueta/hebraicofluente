'use client';

/* A pergunta do gênero, uma vez, no começo do A1 (decisão 9 do dono).
   O hebraico muda o verbo, o adjetivo e a profissão conforme quem fala; nos
   exercícios em que o aluno fala de si, o curso precisa saber a forma dele.
   Fica guardada no progresso (state.a1.genero) e pode ser trocada depois. */

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useProgress } from '@/lib/state/store';
import { cursoA1 } from '@/lib/a1';

export function GeneroA1() {
  const p = useProgress();
  const atual = p.state.a1.genero?.valor ?? null;
  return (
    <Card tone="wash" className="p-5 grid gap-3">
      <p className="font-display text-[18px] font-semibold text-ink m-0">{cursoA1().genero.perguntaPt}</p>
      <p className="font-ui text-[14px] leading-relaxed text-ink-body m-0">
        Em hebraico, o verbo e a profissão mudam conforme quem fala. Nos exercícios em que você fala
        de si, o curso usa a forma que você escolher. Dá para trocar quando quiser.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant={atual === 'm' ? 'primary' : 'secondary'} onClick={() => p.setGeneroA1('m')}>No masculino</Button>
        <Button variant={atual === 'f' ? 'primary' : 'secondary'} onClick={() => p.setGeneroA1('f')}>No feminino</Button>
      </div>
    </Card>
  );
}
