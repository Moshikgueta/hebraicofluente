import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Stamp } from '@/components/art/Stamp';
import { He, Progress } from '@/components/ui';
import { formatShort } from '@/lib/dates';
import { getTrip } from '@/lib/trip';

export const metadata = { title: 'Passaporte digital' };

export default async function PassportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { snapshot: s, base, progress, ctx } = await getTrip(slug);
  if (!s.caravan.features.passport) notFound();
  const earned = s.badges.filter((b) => progress.badges[b.slug]);
  return (
    <div className="mx-auto max-w-3xl px-4 pb-12 pt-8 sm:px-6">
      <div className="overflow-hidden rounded-lg bg-sea-deep text-paper shadow-float">
        <div className="flex items-start justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="text-micro font-semibold uppercase tracking-[0.18em] text-ochre-soft">Passaporte digital</p>
            <h1 className="mt-2 font-display text-display-m font-medium sm:text-display-l">{ctx.label ? `Passaporte de ${ctx.label}` : 'Meu passaporte'}</h1>
            <p className="mt-1 text-small text-stone-300">{s.caravan.name}</p>
          </div>
          <He display className="text-[2.2rem] leading-none text-ochre-soft">
            דַּרְכּוֹן
          </He>
        </div>
        <div className="border-t border-white/15 px-6 py-4 sm:px-8">
          <div className="flex items-center justify-between text-small">
            <span>
              {earned.length} de {s.badges.length} selos
            </span>
            <span className="text-stone-300">Darkón: passaporte, em hebraico</span>
          </div>
          <Progress value={earned.length} max={s.badges.length} label="Selos conquistados" className="mt-2 [&>div]:bg-white/20 [&>div>div]:bg-ochre-soft" />
        </div>
      </div>

      <p className="mt-6 text-small text-stone-600">
        Os selos marcam atividades concluídas, não lugares visitados: ninguém precisa ligar a localização. Cada um vem da{' '}
        <Link href={`${base}/atividades`} className="font-semibold text-brand-text underline-offset-2 hover:underline">
          atividade
        </Link>{' '}
        com o mesmo tema.
      </p>

      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
        {s.badges.map((b) => {
          const at = progress.badges[b.slug];
          return (
            <li key={b.slug} className="flex flex-col items-center text-center">
              <Stamp slug={b.slug} title={b.title} art={b.art} ink={b.ink} earned={Boolean(at)} date={at ? formatShort(at.slice(0, 10)).toUpperCase() : null} size={136} />
              <p className="mt-3 text-small font-semibold text-ink">{b.title}</p>
              <p className="mt-0.5 text-micro text-stone-600">{at ? b.description : 'Conclua a atividade para carimbar.'}</p>
              {!at && b.activities[0] && (
                <Link href={`${base}/atividades/${b.activities[0]}`} className="mt-2 text-micro font-semibold text-brand-text underline-offset-2 hover:underline">
                  Ir para a atividade
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
