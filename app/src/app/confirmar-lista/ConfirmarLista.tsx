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

const O_QUE: Record<string, string> = {
  curso: 'as próximas letras do alfabeto e as novidades do curso',
  israel: 'o aviso de quando Israel Além do Óbvio abrir',
  raizes: 'o aviso de quando Raízes Sefarditas abrir',
  a1: 'o aviso de quando o curso Hebraico A1 abrir'
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
      <h1 className="text-[27px] sm:text-[31px] font-bold leading-tight">Confirmar inscrição</h1>
      <Card className="p-6 grid gap-4">
        {estado === 'ok' ? (
          <Aviso>
            Pronto, inscrição confirmada. Você vai receber {lista.length ? lista.join('; ') : 'o que pediu'}. Todo
            e-mail traz o link para sair da lista.
          </Aviso>
        ) : estado === 'invalido' ? (
          <Erro>
            Este link não está completo ou já não vale. Abra de novo pelo e-mail, ou peça outra vez no{' '}
            <Link href="/" className="underline">site</Link>.
          </Erro>
        ) : (
          <>
            <p className="font-ui text-[15px] leading-relaxed text-ink-body m-0">
              Toque no botão para confirmar que quer receber os e-mails que pediu no site do Hebraico Fluente. Você
              pode sair da lista quando quiser, pelo link de qualquer um deles.
            </p>
            {estado === 'erro' && <Erro>Não consegui agora. Tente de novo em instantes.</Erro>}
            <Button size="lg" onClick={() => void confirmar()} disabled={estado === 'enviando'}>
              {estado === 'enviando' ? 'Confirmando…' : 'Confirmar'}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
