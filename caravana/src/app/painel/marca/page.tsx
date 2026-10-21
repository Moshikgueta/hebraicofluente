import { eq } from 'drizzle-orm';
import { Flash } from '@/components/panel/Flash';
import { TextArea, TextField } from '@/components/panel/forms';
import { PageHeader } from '@/components/panel/PanelShell';
import { Button, Card, Notice } from '@/components/ui';
import { requireAgency } from '@/lib/auth/next';
import { roleAtLeast } from '@/lib/auth/sessions';
import { brandingSettings } from '@/lib/db/schema';
import { agencyTx } from '@/lib/panel-data';
import { updateAgencyBrandingAction } from '../actions';

export const metadata = { title: 'Identidade da agência' };

export default async function AgencyBrandPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const staff = await requireAgency('viewer');
  const b = await agencyTx(staff, async (tx) => (await tx.select().from(brandingSettings).where(eq(brandingSettings.agencyId, staff.agencyId)))[0]);
  const can = roleAtLeast(staff.role, 'admin');
  return (
    <div className="max-w-2xl">
      <Flash ok={q.ok} erro={q.erro} />
      <PageHeader title="Identidade da agência" description="O padrão de todas as caravanas. Cada caravana pode trocar as cores e a mensagem na etapa Identidade visual." />
      <Notice className="mt-6">O envio do arquivo de logo depende do armazenamento de imagens, que ainda não está ligado. Por enquanto a marca aparece como monograma.</Notice>
      <Card className="mt-6 p-5">
        <form action={updateAgencyBrandingAction}>
          <fieldset disabled={!can} className="space-y-5">
            <TextField label="Nome exibido" name="displayName" defaultValue={b?.displayName ?? staff.agencyName} required maxLength={80} />
            <TextField label="Monograma (até 3 letras)" name="logoText" defaultValue={b?.logoText ?? ''} required maxLength={3} />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Cor principal" name="primaryColor" type="color" defaultValue={b?.primaryColor ?? '#1f4a6b'} className="[&_input]:h-11 [&_input]:p-1" />
              <TextField label="Cor de destaque" name="secondaryColor" type="color" defaultValue={b?.secondaryColor ?? '#a8702b'} className="[&_input]:h-11 [&_input]:p-1" />
            </div>
            <TextArea label="Mensagem de boas-vindas padrão" name="welcomeMessage" defaultValue={b?.welcomeMessage ?? ''} maxLength={700} rows={4} />
            <Button type="submit">Salvar</Button>
            {!can && <p className="text-micro text-stone-600">Só administradores da agência alteram a identidade.</p>}
          </fieldset>
        </form>
      </Card>
    </div>
  );
}
