import { asc, eq } from 'drizzle-orm';
import { INFO_SECTIONS } from '@content/info-templates';
import { Flash } from '@/components/panel/Flash';
import { SelectField, TextArea, TextField } from '@/components/panel/forms';
import { Button, Card, Notice, Tag } from '@/components/ui';
import { caravanInfoItems } from '@/lib/db/schema';
import { agencyTx, getPanelCaravan } from '@/lib/panel-data';
import { addInfoAction, deleteInfoAction, updateInfoAction } from '../../actions';

type Item = { id?: string; section: string; title: string; body: string; contactValue: string | null; contactKind: string | null; isTimeSensitive: boolean };

function ItemFields({ item, prefix }: { item?: Item; prefix: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SelectField label="Seção" name="section" id={`${prefix}-sec`} defaultValue={item?.section ?? 'contatos'}>
        {INFO_SECTIONS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </SelectField>
      <TextField label="Título" name="title" id={`${prefix}-t`} defaultValue={item?.title} required maxLength={140} />
      <TextArea label="Texto" name="body" id={`${prefix}-b`} defaultValue={item?.body} required maxLength={1500} rows={3} className="sm:col-span-2" />
      <SelectField label="Contato (opcional)" name="contactKind" id={`${prefix}-k`} defaultValue={item?.contactKind ?? ''}>
        <option value="">Sem contato</option>
        <option value="phone">Telefone</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="email">E-mail</option>
        <option value="url">Endereço (https://)</option>
      </SelectField>
      <TextField label="Valor do contato" name="contactValue" id={`${prefix}-v`} defaultValue={item?.contactValue ?? ''} maxLength={160} placeholder="+55 11 ..." />
      <label className="flex items-center gap-2 text-small sm:col-span-2">
        <input type="checkbox" name="isTimeSensitive" defaultChecked={item?.isTimeSensitive} className="h-4 w-4 accent-[#1f4a6b]" />
        Informação que pode mudar (mostra a data de atualização ao viajante)
      </label>
    </div>
  );
}

export default async function InfoStep({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const q = await searchParams;
  const { car, canEdit, staff } = await getPanelCaravan(id);
  const items = await agencyTx(staff, (tx) => tx.select().from(caravanInfoItems).where(eq(caravanInfoItems.caravanId, id)).orderBy(asc(caravanInfoItems.section), asc(caravanInfoItems.position)));
  return (
    <div className="max-w-3xl">
      <Flash ok={q.ok} erro={q.erro} />
      <Notice>
        Publique aqui só o que a agência confirmou: contatos oficiais, hotéis reservados, pontos de encontro. Regras de entrada no país, fronteiras e segurança mudam com frequência e
        não devem ser copiadas de fontes antigas. Avisos urgentes continuam pelos canais oficiais da agência.
      </Notice>
      <div className="mt-8 space-y-8">
        {INFO_SECTIONS.map((sec) => {
          const list = items.filter((i) => i.section === sec.id);
          if (!list.length) return null;
          return (
            <section key={sec.id}>
              <h2 className="font-display text-title font-medium">{sec.label}</h2>
              <ul className="mt-3 space-y-2">
                {list.map((i) => (
                  <li key={i.id}>
                    <Card>
                      <details>
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                          <span className="min-w-0">
                            <span className="block truncate text-small font-semibold">{i.title}</span>
                            <span className="block truncate text-micro text-stone-600">{i.body}</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            {i.isTimeSensitive && <Tag tone="warning">Pode mudar</Tag>}
                            <span className="text-micro font-semibold text-sea">Editar</span>
                          </span>
                        </summary>
                        <div className="border-t border-stone-200 p-4">
                          <form action={updateInfoAction}>
                            <input type="hidden" name="caravanId" value={car.id} />
                            <input type="hidden" name="itemId" value={i.id} />
                            <fieldset disabled={!canEdit}>
                              <ItemFields item={i} prefix={i.id} />
                              <Button type="submit" size="sm" variant="secondary" className="mt-3">
                                Salvar
                              </Button>
                            </fieldset>
                          </form>
                          {canEdit && (
                            <form action={deleteInfoAction} className="mt-2">
                              <input type="hidden" name="caravanId" value={car.id} />
                              <input type="hidden" name="itemId" value={i.id} />
                              <Button type="submit" size="sm" variant="danger">
                                Remover
                              </Button>
                            </form>
                          )}
                        </div>
                      </details>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      {canEdit && (
        <Card className="mt-10 p-5">
          <h2 className="font-display text-title font-medium">Adicionar informação</h2>
          <form action={addInfoAction} className="mt-4">
            <input type="hidden" name="caravanId" value={car.id} />
            <ItemFields prefix="novo" />
            <Button type="submit" className="mt-4">
              Adicionar
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
