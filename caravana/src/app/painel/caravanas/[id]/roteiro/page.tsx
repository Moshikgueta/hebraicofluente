import type { ReactNode } from 'react';
import { asc, eq } from 'drizzle-orm';
import { REGION_LABEL } from '@content/destinations';
import { Flash } from '@/components/panel/Flash';
import { SelectField, TextArea, TextField } from '@/components/panel/forms';
import { IconArrowDown, IconArrowUp, IconTrash } from '@/components/icons';
import { Button, Card, EmptyState, Notice } from '@/components/ui';
import { addDays, daysBetween, formatShort, weekday } from '@/lib/dates';
import { caravanDays, destinations, stops } from '@/lib/db/schema';
import { agencyTx, getPanelCaravan } from '@/lib/panel-data';
import {
  addDayAction,
  addStopAction,
  deleteDayAction,
  deleteStopAction,
  moveDayAction,
  moveStopAction,
  updateDayAction,
  updateStopAction,
} from '../../actions';

type Dest = { id: string; namePt: string; region: string };

function DestinationOptions({ list }: { list: Dest[] }) {
  const regions = Object.keys(REGION_LABEL) as (keyof typeof REGION_LABEL)[];
  return (
    <>
      <option value="">Sem destino da biblioteca</option>
      {regions.map((r) => (
        <optgroup key={r} label={REGION_LABEL[r]}>
          {list
            .filter((d) => d.region === r)
            .map((d) => (
              <option key={d.id} value={d.id}>
                {d.namePt}
              </option>
            ))}
        </optgroup>
      ))}
    </>
  );
}

function IconSubmit({ action, fields, label, children, danger }: { action: (f: FormData) => Promise<void>; fields: Record<string, string>; label: string; children: ReactNode; danger?: boolean }) {
  return (
    <form action={action}>
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button type="submit" aria-label={label} title={label} className={`grid h-9 w-9 place-items-center rounded-full ring-1 ring-stone-300 hover:bg-stone-100 disabled:opacity-40 ${danger ? 'text-danger' : 'text-ink-soft'}`}>
        {children}
      </button>
    </form>
  );
}

export default async function ItineraryStep({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const q = await searchParams;
  const { car, canEdit, staff } = await getPanelCaravan(id);
  const { days, stopRows, dests } = await agencyTx(staff, async (tx) => ({
    days: await tx.select().from(caravanDays).where(eq(caravanDays.caravanId, id)).orderBy(asc(caravanDays.dayNumber)),
    stopRows: await tx.select().from(stops).where(eq(stops.caravanId, id)).orderBy(asc(stops.position)),
    dests: await tx.select({ id: destinations.id, namePt: destinations.namePt, region: destinations.region }).from(destinations).orderBy(asc(destinations.namePt)),
  }));
  const duration = daysBetween(car.startDate, car.endDate) + 1;
  const destName = new Map(dests.map((d) => [d.id, d.namePt]));
  const hidden = { caravanId: car.id };

  return (
    <div className="max-w-3xl">
      <Flash ok={q.ok} erro={q.erro} />
      <p className="text-small text-ink-soft">
        {days.length} de {duration} dias preenchidos. A data de cada dia sai das datas da caravana. Horários são opcionais: preencha só os confirmados.
      </p>
      <Notice className="mt-4">
        Ligue a parada a um destino da biblioteca escolhendo-o na lista: é isso que traz o texto cultural e o quiz daquele lugar. A ligação nunca é feita por nome parecido.
        Importar roteiros de PDF ou documento ainda não existe; está no roteiro do produto.
      </Notice>

      {days.length === 0 && (
        <div className="mt-8">
          <EmptyState title="Roteiro vazio">Adicione o primeiro dia abaixo.</EmptyState>
        </div>
      )}

      <ol className="mt-8 space-y-6">
        {days.map((d, i) => {
          const date = addDays(car.startDate, d.dayNumber - 1);
          const dayStops = stopRows.filter((s) => s.dayId === d.id);
          return (
            <li key={d.id} id={`dia-${d.id}`}>
              <Card className="overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-sand/40 px-4 py-3">
                  <p className="text-small">
                    <span className="font-semibold">Dia {d.dayNumber}</span>
                    <span className="text-stone-600">
                      {' '}
                      · {weekday(date)}, {formatShort(date)}
                    </span>
                  </p>
                  {canEdit && (
                    <div className="flex gap-1.5">
                      {i > 0 && (
                        <IconSubmit action={moveDayAction} fields={{ ...hidden, dayId: d.id, dir: 'up' }} label={`Mover o dia ${d.dayNumber} para cima`}>
                          <IconArrowUp size={18} />
                        </IconSubmit>
                      )}
                      {i < days.length - 1 && (
                        <IconSubmit action={moveDayAction} fields={{ ...hidden, dayId: d.id, dir: 'down' }} label={`Mover o dia ${d.dayNumber} para baixo`}>
                          <IconArrowDown size={18} />
                        </IconSubmit>
                      )}
                      <details className="relative">
                        <summary className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-full text-danger ring-1 ring-stone-300 hover:bg-danger-soft [&::-webkit-details-marker]:hidden" aria-label={`Remover o dia ${d.dayNumber}`}>
                          <IconTrash size={18} />
                        </summary>
                        <div className="absolute right-0 top-11 z-10 w-64 rounded-md bg-paper-raised p-3 text-small shadow-float ring-1 ring-stone-200">
                          <p>Remover o dia {d.dayNumber} e as {dayStops.length} paradas dele? Os dias seguintes sobem uma posição.</p>
                          <form action={deleteDayAction} className="mt-3">
                            <input type="hidden" name="caravanId" value={car.id} />
                            <input type="hidden" name="dayId" value={d.id} />
                            <Button type="submit" size="sm" variant="danger">
                              Remover dia
                            </Button>
                          </form>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
                <div className="space-y-5 p-4">
                  <form action={updateDayAction}>
                    <input type="hidden" name="caravanId" value={car.id} />
                    <input type="hidden" name="dayId" value={d.id} />
                    <fieldset disabled={!canEdit} className="space-y-3">
                      <TextField label="Título do dia" name="title" id={`t-${d.id}`} defaultValue={d.title} required maxLength={120} />
                      <TextArea label="Resumo" name="summary" id={`s-${d.id}`} defaultValue={d.summary ?? ''} maxLength={500} rows={2} />
                      <TextArea label="Orientações práticas do dia" name="practicalNotes" id={`p-${d.id}`} defaultValue={d.practicalNotes ?? ''} maxLength={500} rows={2} hint="Ex.: roupa, água, horário de saída confirmado." />
                      <Button type="submit" size="sm" variant="secondary">
                        Salvar dia
                      </Button>
                    </fieldset>
                  </form>

                  <div>
                    <p className="text-micro font-semibold uppercase tracking-[0.12em] text-stone-600">Paradas</p>
                    <ol className="mt-2 space-y-2">
                      {dayStops.map((s, k) => (
                        <li key={s.id} className="rounded-sm bg-paper ring-1 ring-stone-200">
                          <details>
                            <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
                              <span className="tabular grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-[0.7rem] font-semibold text-paper">{k + 1}</span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-small font-semibold">
                                  {s.timeLabel ? `${s.timeLabel} · ` : ''}
                                  {s.title}
                                </span>
                                <span className="block truncate text-micro text-stone-600">{s.destinationId ? `Destino: ${destName.get(s.destinationId)}` : 'Sem destino da biblioteca'}</span>
                              </span>
                              <span className="text-micro font-semibold text-sea">Editar</span>
                            </summary>
                            <div className="border-t border-stone-200 p-3">
                              <form action={updateStopAction}>
                                <input type="hidden" name="caravanId" value={car.id} />
                                <input type="hidden" name="stopId" value={s.id} />
                                <fieldset disabled={!canEdit} className="grid gap-3 sm:grid-cols-[1fr_9rem]">
                                  <TextField label="Parada" name="title" id={`st-${s.id}`} defaultValue={s.title} required maxLength={140} />
                                  <TextField label="Horário" name="timeLabel" id={`sh-${s.id}`} defaultValue={s.timeLabel ?? ''} maxLength={40} placeholder="opcional" />
                                  <SelectField label="Destino da biblioteca" name="destinationId" id={`sd-${s.id}`} defaultValue={s.destinationId ?? ''} className="sm:col-span-2">
                                    <DestinationOptions list={dests} />
                                  </SelectField>
                                  <TextArea label="Descrição" name="description" id={`sx-${s.id}`} defaultValue={s.description ?? ''} maxLength={600} rows={2} className="sm:col-span-2" />
                                  <TextField label="Orientação" name="practicalNote" id={`sp-${s.id}`} defaultValue={s.practicalNote ?? ''} maxLength={300} className="sm:col-span-2" />
                                  <div className="flex flex-wrap gap-2 sm:col-span-2">
                                    <Button type="submit" size="sm" variant="secondary">
                                      Salvar parada
                                    </Button>
                                  </div>
                                </fieldset>
                              </form>
                              {canEdit && (
                                <div className="mt-3 flex gap-1.5 border-t border-stone-200 pt-3">
                                  {k > 0 && (
                                    <IconSubmit action={moveStopAction} fields={{ ...hidden, stopId: s.id, dir: 'up' }} label="Mover parada para cima">
                                      <IconArrowUp size={18} />
                                    </IconSubmit>
                                  )}
                                  {k < dayStops.length - 1 && (
                                    <IconSubmit action={moveStopAction} fields={{ ...hidden, stopId: s.id, dir: 'down' }} label="Mover parada para baixo">
                                      <IconArrowDown size={18} />
                                    </IconSubmit>
                                  )}
                                  <IconSubmit action={deleteStopAction} fields={{ ...hidden, stopId: s.id }} label="Remover parada" danger>
                                    <IconTrash size={18} />
                                  </IconSubmit>
                                </div>
                              )}
                            </div>
                          </details>
                        </li>
                      ))}
                    </ol>
                    {canEdit && (
                      <details className="mt-3">
                        <summary className="cursor-pointer list-none text-small font-semibold text-sea [&::-webkit-details-marker]:hidden">+ Adicionar parada</summary>
                        <form action={addStopAction} className="mt-3 rounded-sm bg-paper p-3 ring-1 ring-stone-200">
                          <input type="hidden" name="caravanId" value={car.id} />
                          <input type="hidden" name="dayId" value={d.id} />
                          <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
                            <TextField label="Parada" name="title" id={`nt-${d.id}`} required maxLength={140} placeholder="Ex.: Massada" />
                            <TextField label="Horário" name="timeLabel" id={`nh-${d.id}`} maxLength={40} placeholder="opcional" />
                            <SelectField label="Destino da biblioteca" name="destinationId" id={`nd-${d.id}`} className="sm:col-span-2">
                              <DestinationOptions list={dests} />
                            </SelectField>
                            <TextArea label="Descrição" name="description" id={`nx-${d.id}`} maxLength={600} rows={2} className="sm:col-span-2" />
                            <TextField label="Orientação" name="practicalNote" id={`np-${d.id}`} maxLength={300} className="sm:col-span-2" />
                          </div>
                          <Button type="submit" size="sm" className="mt-3">
                            Adicionar parada
                          </Button>
                        </form>
                      </details>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          );
        })}
      </ol>

      {canEdit && days.length < duration && (
        <Card className="mt-8 p-5">
          <h2 className="font-display text-title font-medium">Adicionar o dia {days.length + 1}</h2>
          <form action={addDayAction} className="mt-4 space-y-3">
            <input type="hidden" name="caravanId" value={car.id} />
            <TextField label="Título do dia" name="title" id="nd-title" required maxLength={120} placeholder="Ex.: Jerusalém, a Cidade Antiga" />
            <TextArea label="Resumo" name="summary" id="nd-summary" maxLength={500} rows={2} />
            <TextArea label="Orientações práticas" name="practicalNotes" id="nd-notes" maxLength={500} rows={2} />
            <Button type="submit">Adicionar dia</Button>
          </form>
        </Card>
      )}
    </div>
  );
}
