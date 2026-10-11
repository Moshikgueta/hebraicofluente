'use client';

/* Uma explicação gravada pelo professor, no lugar da lição a que ela serve.
 * ─────────────────────────────────────────────────────────────────────────
 * Sem gravação, NÃO aparece nada: nem botão que não toca, nem voz sintética
 * no lugar do professor (data/gravacoes-professor.json). O painel
 * /admin/gravar lista o que falta gravar. Quando a gravação chega, o quadro
 * aparece sozinho, sem mexer em nenhuma lição. Tocar de novo é tocar no
 * mesmo botão. */
import { AudioButton, hasAudio, useRegistroDeAudio } from '@/components/learn/AudioButton';
import { gravacaoDoProfessor } from '@/lib/gravacoes-professor';

export function GravacaoDoProfessor({ id, textoPt }: {
  id: string;
  /** Uma frase sobre o que ouvir e por quê. */
  textoPt?: string;
}) {
  useRegistroDeAudio();
  const g = gravacaoDoProfessor(id);
  if (!g || !hasAudio(g.audioId)) return null;
  return (
    <div className="rounded-[var(--r-md)] border border-[color:var(--accent-soft)] bg-[var(--accent-wash)]
                    px-4 py-3 flex items-center gap-4 flex-wrap" data-gravacao-professor={id}>
      <div className="grid gap-0.5 min-w-0 flex-1">
        <p className="font-ui text-[14.5px] font-semibold text-ink m-0">{g.tituloPt}</p>
        {textoPt && <p className="font-ui text-[13.5px] leading-snug text-ink-body m-0">{textoPt}</p>}
      </div>
      <AudioButton audioId={g.audioId} label="Ouvir" ariaLabel={g.tituloPt} />
    </div>
  );
}
