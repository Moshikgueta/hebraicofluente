'use client';

/* Sair da lista do aviso do próximo curso, pelo link do e-mail.
 * ─────────────────────────────────────────────────────────────────────────
 * Abrir o link NÃO tira ninguém da lista: clientes de e-mail e antivírus
 * abrem os links sozinhos para gerar prévia, e um descadastro no GET tiraria
 * gente que não pediu. Quem tira é o botão, com um POST. Não exige login -
 * a assinatura no link é que prova de quem é a inscrição. Ver
 * worker/src/api/novidades.js. */

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Aviso, Erro } from '@/components/platform/Campo';

export function SairDaLista() {
  const t = useSearchParams().get('t') ?? '';
  const [estado, setEstado] = useState<'pronto' | 'enviando' | 'saiu' | 'invalido' | 'erro'>(
    t ? 'pronto' : 'invalido'
  );

  async function sair() {
    setEstado('enviando');
    try {
      const r = await fetch('/api/novidades/sair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ t })
      });
      setEstado(r.ok ? 'saiu' : r.status === 400 ? 'invalido' : 'erro');
    } catch {
      setEstado('erro');
    }
  }

  return (
    <div className="focus-col grid gap-6 py-6">
      <h1 className="text-[27px] sm:text-[31px] font-bold leading-tight">Sair da lista</h1>
      <Card className="p-6 grid gap-4">
        {estado === 'saiu' ? (
          <Aviso>
            Pronto: você não vai mais receber o aviso do próximo curso. Sua conta e seu
            acesso continuam iguais.
          </Aviso>
        ) : estado === 'invalido' ? (
          <Erro>
            Este link não está completo. Abra de novo pelo e-mail, ou desmarque o aviso
            em <Link href="/perfil" className="underline">Sua conta</Link>.
          </Erro>
        ) : (
          <>
            <p className="font-ui text-[15px] leading-relaxed text-ink-body m-0">
              Você não vai mais receber o e-mail que avisa quando o próximo curso abrir.
              Isso não muda nada na sua conta nem no seu acesso.
            </p>
            {estado === 'erro' && <Erro>Não consegui agora. Tente de novo em instantes.</Erro>}
            <Button size="lg" onClick={() => void sair()} disabled={estado === 'enviando'}>
              {estado === 'enviando' ? 'Saindo…' : 'Sair da lista'}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
