'use client';

/* Confirmar a inscrição na lista de interessados, pelo link do e-mail.
 * ─────────────────────────────────────────────────────────────────────────
 * Abrir o link NÃO confirma: clientes de e-mail e antivírus abrem os links
 * sozinhos para gerar prévia, e uma confirmação no GET inscreveria quem não
 * pediu. Quem confirma é o botão, com um POST. Não exige login: a assinatura
 * no link é que prova de quem é a inscrição. Ver worker/src/api/interessados.js. */

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Aviso, Erro } from '@/components/platform/Campo';
import { tx } from '@/i18n/telas/conta-confirmar-lista';

const O_QUE: Record<string, string> = {
  curso: tx.oQueCurso,
  israel: tx.oQueIsrael,
  raizes: tx.oQueRaizes,
  a1: tx.oQueA1
};

export function ConfirmarLista() {
  const t = useSearchParams().get('t') ?? '';
  const [estado, setEstado] = useState<'pronto' | 'enviando' | 'ok' | 'invalido' | 'erro'>(t ? 'pronto' : 'invalido');
  const [interesses, setInteresses] = useState<string[]>([]);

  async function confirmar() {
    setEstado('enviando');
    try {
      const r = await fetch('/api/interessados/confirmar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t })
      });
      if (r.ok) {
        const d = await r.json().catch(() => ({})) as { interesses?: string[] };
        setInteresses(d.interesses ?? []);
        return setEstado('ok');
      }
      setEstado(r.status === 400 ? 'invalido' : 'erro');
    } catch {
      setEstado('erro');
    }
  }

  const lista = interesses.map(i => O_QUE[i]).filter(Boolean);

  return (
    <div className="focus-col grid gap-6 py-6">
      <h1 className="text-[27px] sm:text-[31px] font-bold leading-tight">{tx.titulo}</h1>
      <Card className="p-6 grid gap-4">
        {estado === 'ok' ? (
          <Aviso>
            {tx.confirmada(lista.length ? lista.join('; ') : tx.oQuePediu)}
          </Aviso>
        ) : estado === 'invalido' ? (
          <Erro>
            {tx.invalidoAntes}{' '}
            <Link href="/" className="underline">{tx.site}</Link>.
          </Erro>
        ) : (
          <>
            <p className="font-ui text-[15px] leading-relaxed text-ink-body m-0">
              {tx.toqueNoBotao}
            </p>
            {estado === 'erro' && <Erro>{tx.erro}</Erro>}
            <Button size="lg" onClick={() => void confirmar()} disabled={estado === 'enviando'}>
              {estado === 'enviando' ? tx.confirmando : tx.confirmar}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
