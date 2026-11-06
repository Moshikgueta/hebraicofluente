import { He } from '@/components/hebrew/He';
import { partesDaProse } from '@/lib/prose';

/* Prose from the data files marks Hebrew as {{…}}. Authors never write a
   direction span by hand; this wraps it, and everything outside the braces
   stays ordinary Portuguese - so the quotes and parentheses that bled into the
   reference PDF's Hebrew runs physically cannot get inside a span.

   Lives here, next to <He>, and not in components/learn/Blocks.tsx, so that a
   public page (the course page, /cursos/[slug]) can use it without pulling in
   the learner's state and the audio player. Rendering `{m.subPt}` as a plain
   string there put `{{בּ}} · {{כּ}} · {{פּ}}` on the sales page (audit of
   28/09/2026, UX-001). */
export function Prose({ text }: { text: string }) {
  return <>{partesDaProse(text).map((p, k) => p.he
    ? <He key={`he-${k}`} size="inline">{p.texto}</He>
    : p.texto)}</>;
}
