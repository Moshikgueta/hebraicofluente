import { eq } from 'drizzle-orm';
import { Flash } from '@/components/panel/Flash';
import { BrandEditor } from '@/components/panel/BrandEditor';
import { TextArea } from '@/components/panel/forms';
import { Button } from '@/components/ui';
import { brandingSettings } from '@/lib/db/schema';
import { agencyTx, getPanelCaravan } from '@/lib/panel-data';
import { updateBrandingAction } from '../../actions';

export default async function IdentityStep({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const q = await searchParams;
  const { car, canEdit, staff } = await getPanelCaravan(id);
  const brand = await agencyTx(staff, async (tx) => (await tx.select().from(brandingSettings).where(eq(brandingSettings.agencyId, staff.agencyId)))[0]);
  const ap = brand?.primaryColor ?? '#1f4a6b';
  const as = brand?.secondaryColor ?? '#a8702b';
  return (
    <div>
      <Flash ok={q.ok} erro={q.erro} />
      <form action={updateBrandingAction}>
        <input type="hidden" name="caravanId" value={car.id} />
        <fieldset disabled={!canEdit} className="space-y-8">
          <BrandEditor
            primary={car.primaryColor ?? ap}
            secondary={car.secondaryColor ?? as}
            agencyPrimary={ap}
            agencySecondary={as}
            usesAgency={!car.primaryColor}
            coverArt={car.coverArt}
            logoText={brand?.logoText ?? 'AG'}
            agencyName={brand?.displayName ?? staff.agencyName}
          />
          <div className="grid max-w-3xl gap-5">
            <TextArea label="Mensagem de boas-vindas" name="welcomeMessage" defaultValue={car.welcomeMessage ?? ''} maxLength={700} rows={4} hint="Aparece na primeira tela, assinada pelo organizador. Vazia, usa a mensagem padrão da agência." />
            <TextArea label="Mensagem depois da viagem" name="postTripMessage" defaultValue={car.postTripMessage ?? ''} maxLength={700} rows={3} hint="Aparece na tela de encerramento, depois da volta." />
          </div>
          <Button type="submit">Salvar identidade visual</Button>
        </fieldset>
      </form>
    </div>
  );
}
