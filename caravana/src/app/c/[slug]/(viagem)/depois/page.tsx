import Link from 'next/link';
import { Scene } from '@/components/art/Scene';
import { Stamp } from '@/components/art/Stamp';
import { Eyebrow, He, LinkButton, Stat } from '@/components/ui';
import { getTrip } from '@/lib/trip';

export const metadata = { title: 'Depois da viagem' };

export default async function AfterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { snapshot: s, progress, base, phase, ctx } = await getTrip(slug);
  const read = s.destinations.filter((d) => progress.viewed.includes(d.slug));
  const earned = s.badges.filter((b) => progress.badges[b.slug]);
  const completed = s.activities.filter((a) => progress.completed[a.slug]).length;
  return (
    <div>
      <div className="relative h-52 overflow-hidden sm:h-72">
        <Scene name="coast" className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-60% to-paper" aria-hidden />
      </div>
      <div className="mx-auto -mt-12 max-w-xl px-4 pb-12 sm:px-6">
        <Eyebrow className="relative">
          <He className="normal-case tracking-normal text-brand-text">תּוֹדָה</He> · Todá
        </Eyebrow>
        <h1 className="relative mt-2 font-display text-display-l font-medium tracking-[-0.02em]">{ctx.label ? `Obrigado por viajar conosco, ${ctx.label}.` : 'Obrigado por viajar conosco.'}</h1>
        {phase.phase !== 'after' && <p className="mt-2 text-small text-stone-600">Esta página ganha vida depois da volta. Por enquanto, ela mostra o que você já explorou.</p>}
        {s.caravan.postTripMessage && (
          <blockquote className="mt-6 border-l-2 border-accent pl-5">
            <p className="font-display text-[1.25rem] italic leading-relaxed">{s.caravan.postTripMessage}</p>
            {s.caravan.organizerName && <footer className="mt-2 text-small font-semibold text-stone-600">{s.caravan.organizerName}</footer>}
          </blockquote>
        )}

        <div className="mt-10 grid grid-cols-3 gap-3">
          <Stat label="Lugares lidos" value={read.length} />
          <Stat label="Atividades" value={completed} />
          <Stat label="Selos" value={earned.length} />
        </div>

        {earned.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-title font-medium">Seu passaporte</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {earned.map((b) => (
                <Stamp key={b.slug} slug={`fim-${b.slug}`} title={b.title} art={b.art} ink={b.ink} earned size={104} />
              ))}
            </div>
          </section>
        )}

        {read.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-title font-medium">Para reler</h2>
            <ul className="mt-3 divide-y divide-stone-200 rounded-md bg-paper-raised ring-1 ring-stone-200">
              {read.map((d) => (
                <li key={d.slug}>
                  <Link href={`${base}/descubra/${d.slug}`} className="flex items-center justify-between px-4 py-3 hover:bg-stone-100/60">
                    <span className="text-small font-semibold">{d.namePt}</span>
                    <He display className="text-[1.15rem] text-stone-700">
                      {d.nameHe}
                    </He>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <LinkButton href={`${base}/roteiro`} variant="secondary">
            Rever o roteiro
          </LinkButton>
          {s.hebrew && (
            <LinkButton href={`${base}/hebraico`} variant="secondary">
              Revisar o hebraico
            </LinkButton>
          )}
        </div>
      </div>
    </div>
  );
}
