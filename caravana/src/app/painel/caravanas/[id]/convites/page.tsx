import { Flash } from '@/components/panel/Flash';
import { CopyButton } from '@/components/panel/CopyButton';
import { TextArea, TextField } from '@/components/panel/forms';
import { IconQr } from '@/components/icons';
import { Button, Card, Notice, Progress, Tag } from '@/components/ui';
import { listInvites, seatUsage } from '@/lib/domain/agency';
import { publicUrl } from '@/lib/env';
import { agencyTx, getPanelCaravan } from '@/lib/panel-data';
import { qrSvg } from '@/lib/qr';
import { createInvitesAction, resetDevicesAction, revokeInviteAction } from '../../actions';

const STATUS: Record<string, { label: string; tone: 'success' | 'neutral' | 'danger' | 'warning' }> = {
  active: { label: 'Ativo', tone: 'success' },
  revoked: { label: 'Revogado', tone: 'danger' },
  expired: { label: 'Vencido', tone: 'warning' },
};

function message(caravan: string, agency: string, name: string | null, link: string, code: string) {
  return `${name ? `Olá, ${name}! ` : 'Olá! '}A sua experiência digital da ${caravan} já está disponível. Acesse pelo seu link pessoal: ${link}\nSe pedir um código, use ${code}. O convite é só seu e vale em até 3 aparelhos.\n${agency}`;
}

export default async function InvitesStep({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const q = await searchParams;
  const { car, canEdit, staff } = await getPanelCaravan(id);
  const { invites, seats } = await agencyTx(staff, async (tx) => ({ invites: await listInvites(tx, id), seats: await seatUsage(tx, id) }));
  const base = publicUrl();
  const entry = `${base}/c/${car.slug}/entrar`;
  const free = Math.max(0, seats.limit - seats.used);
  const fresh = Number(q.novos ?? 0);

  return (
    <div className="space-y-10">
      <Flash ok={q.ok} erro={q.erro} />
      {car.status !== 'published' && (
        <Notice tone="warning" className="max-w-3xl">
          A caravana ainda não está publicada. Os convites podem ser criados e enviados agora, mas só abrem depois da publicação.
        </Notice>
      )}

      <section className="grid gap-5 lg:grid-cols-[1fr_20rem] [&>*]:min-w-0">
        <Card className="p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-small text-stone-600">Vagas contratadas</p>
              <p className="tabular font-display text-display-m font-medium">
                {seats.used} <span className="text-title text-stone-500">de {seats.limit}</span>
              </p>
            </div>
            <p className="text-small text-stone-600">{free} livres</p>
          </div>
          <Progress value={seats.used} max={seats.limit} label="Vagas usadas" className="mt-3" />
          <p className="mt-3 text-micro text-stone-600">
            Cada convite ativo ocupa uma vaga, usado ou não. Revogar um convite libera a vaga. O limite é conferido no banco: nenhum convite passa do contrato.
          </p>
          {canEdit && free > 0 && (
            <form action={createInvitesAction} className="mt-5 grid gap-4 border-t border-stone-200 pt-5 sm:grid-cols-2">
              <input type="hidden" name="caravanId" value={car.id} />
              <TextArea
                label="Nomes dos viajantes (um por linha)"
                name="names"
                rows={4}
                hint="Só o primeiro nome, para a saudação. Em branco, use a quantidade ao lado."
                className="sm:col-span-2"
                placeholder={'Ana\nBruno'}
              />
              <TextField label="Ou quantidade de convites sem nome" name="count" type="number" min={1} max={Math.min(100, free)} id="inv-count" />
              <TextField label="Aparelhos por convite" name="maxDevices" type="number" min={1} max={5} defaultValue={3} id="inv-dev" />
              <div className="sm:col-span-2">
                <Button type="submit">Criar convites</Button>
              </div>
            </form>
          )}
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-1.5 font-semibold">
            <IconQr size={20} /> QR para material impresso
          </p>
          <p className="mt-1 text-micro text-stone-600">Leva à página de entrada da caravana, que pede o código do convite. Sozinho, não dá acesso a ninguém.</p>
          <div className="mx-auto mt-4 w-40" dangerouslySetInnerHTML={{ __html: qrSvg(entry) }} aria-label="QR code da página de entrada" role="img" />
          <p className="mt-3 break-all text-center text-micro text-stone-600">{entry}</p>
          <div className="mt-2 flex justify-center">
            <CopyButton text={entry} label="Copiar endereço" />
          </div>
        </Card>
      </section>

      <section>
        <h2 className="font-display text-title font-medium">Convites ({invites.length})</h2>
        {fresh > 0 && <p className="mt-1 text-small text-success">{fresh} convite(s) novo(s) no topo da lista.</p>}
        {invites.length === 0 ? (
          <p className="mt-3 text-small text-stone-600">Nenhum convite criado.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {invites.map((inv, i) => {
              const link = inv.code ? `${base}/c/${car.slug}/entrar?codigo=${inv.code}` : null;
              return (
                <li key={inv.id}>
                  <Card className={i < fresh ? 'ring-2 ring-sea' : undefined}>
                    <details>
                      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold">{inv.label ?? 'Convite sem nome'}</span>
                          <span className="tabular block text-micro text-stone-600">
                            final {inv.hint} · {inv.devices}/{inv.maxDevices} aparelhos · {inv.firstUsedAt ? `abriu em ${inv.firstUsedAt.toLocaleDateString('pt-BR')}` : 'ainda não abriu'}
                          </span>
                        </span>
                        <Tag tone={STATUS[inv.status]?.tone}>{STATUS[inv.status]?.label}</Tag>
                        <span className="text-micro font-semibold text-sea">Detalhes</span>
                      </summary>
                      <div className="grid gap-5 border-t border-stone-200 p-4 sm:grid-cols-[1fr_9rem]">
                        <div className="min-w-0 space-y-3 text-small">
                          {link ? (
                            <>
                              <div>
                                <p className="text-micro font-semibold uppercase tracking-[0.1em] text-stone-600">Código</p>
                                <p className="tabular font-mono text-[1.05rem] tracking-[0.15em]">{inv.code}</p>
                              </div>
                              <div>
                                <p className="text-micro font-semibold uppercase tracking-[0.1em] text-stone-600">Link pessoal</p>
                                <p className="break-all text-ink-soft">{link}</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <CopyButton text={link} label="Copiar link" />
                                <CopyButton text={message(car.name, staff.agencyName, inv.label, link, inv.code!)} label="Copiar mensagem pronta" />
                              </div>
                            </>
                          ) : (
                            <p className="text-stone-600">Convite fora de uso: o código não é mais exibido.</p>
                          )}
                          {canEdit && inv.status === 'active' && (
                            <div className="flex flex-wrap gap-2 border-t border-stone-200 pt-3">
                              {inv.devices > 0 && (
                                <form action={resetDevicesAction}>
                                  <input type="hidden" name="caravanId" value={car.id} />
                                  <input type="hidden" name="accessId" value={inv.id} />
                                  <Button type="submit" size="sm" variant="secondary">
                                    Liberar aparelhos
                                  </Button>
                                </form>
                              )}
                              <form action={revokeInviteAction}>
                                <input type="hidden" name="caravanId" value={car.id} />
                                <input type="hidden" name="accessId" value={inv.id} />
                                <Button type="submit" size="sm" variant="danger">
                                  Revogar
                                </Button>
                              </form>
                            </div>
                          )}
                        </div>
                        {link && <div className="w-36" role="img" aria-label="QR code do link pessoal" dangerouslySetInnerHTML={{ __html: qrSvg(link) }} />}
                      </div>
                    </details>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
