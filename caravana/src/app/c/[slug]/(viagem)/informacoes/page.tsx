import { INFO_SECTIONS } from '@content/info-templates';
import { IconClock, IconPhone } from '@/components/icons';
import { Eyebrow, Notice } from '@/components/ui';
import { getTrip } from '@/lib/trip';

export const metadata = { title: 'Informações úteis' };

function contactHref(kind: string | null, value: string | null): string | null {
  if (!value) return null;
  if (kind === 'phone') return `tel:${value.replace(/[^\d+]/g, '')}`;
  if (kind === 'whatsapp') return `https://wa.me/${value.replace(/\D/g, '')}`;
  if (kind === 'email') return `mailto:${value}`;
  if (kind === 'url' && /^https:\/\//.test(value)) return value;
  return null;
}

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { snapshot: s } = await getTrip(slug);
  const sections = INFO_SECTIONS.filter((sec) => s.info.some((i) => i.section === sec.id));
  const published = new Date(s.publishedAt).toLocaleDateString('pt-BR', { timeZone: s.caravan.timezone });
  return (
    <div className="mx-auto max-w-xl px-4 pb-12 pt-8 sm:px-6">
      <Eyebrow>Central da viagem</Eyebrow>
      <h1 className="mt-2 font-display text-display-l font-medium tracking-[-0.02em]">Informações úteis</h1>
      <Notice tone="brand" title="Avisos urgentes chegam pelos canais oficiais" className="mt-5">
        Mudança de horário, ponto de encontro ou qualquer aviso urgente é enviado pela {s.agency.displayName} pelos canais de sempre. Esta página complementa esses canais.
      </Notice>
      {sections.length === 0 && <p className="mt-8 text-stone-600">A agência ainda não publicou informações práticas.</p>}
      <div className="mt-8 space-y-10">
        {sections.map((sec) => (
          <section key={sec.id}>
            <h2 className="font-display text-title font-medium text-stone-700">{sec.label}</h2>
            <ul className="mt-3 space-y-3">
              {s.info
                .filter((i) => i.section === sec.id)
                .map((i, k) => {
                  const href = contactHref(i.contactKind, i.contactValue);
                  return (
                    <li key={k} className="rounded-md bg-paper-raised p-4 ring-1 ring-stone-200">
                      <p className="font-semibold text-ink">{i.title}</p>
                      <p className="mt-1 whitespace-pre-line text-small text-ink-soft">{i.body}</p>
                      {href && (
                        <a href={href} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-small font-semibold text-brand-ink" rel="noopener noreferrer">
                          <IconPhone size={16} /> {i.contactValue}
                        </a>
                      )}
                      {i.isTimeSensitive && (
                        <p className="mt-3 inline-flex items-center gap-1 text-micro font-semibold text-warning">
                          <IconClock size={14} /> Sujeito a mudança. Atualizado em {new Date(i.updatedAt).toLocaleDateString('pt-BR', { timeZone: s.caravan.timezone })}.
                        </p>
                      )}
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-10 text-micro text-stone-600">
        Versão {s.version} publicada em {published}. Regras de entrada no país, fronteiras e segurança mudam: confirme sempre com a agência e com os canais oficiais.
      </p>
    </div>
  );
}
