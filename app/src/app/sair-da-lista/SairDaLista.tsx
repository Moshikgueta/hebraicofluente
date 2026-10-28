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
import { tx } from '@/i18n/telas/conta-sair-da-lista';

export function SairDaLista() {
  const t = useSearchParams().get('t') ?? '';
  /* Desde 23/10/2026 a página serve às duas listas: o token que começa com
     `i` é da lista de interessados (worker/src/api/interessados.js); os
     outros, do aviso do próximo curso para quem tem conta. */
  const interessado = t.startsWith('i');
  const [estado, setEstado] = useState<'pronto' | 'enviando' | 'saiu' | 'invalido' | 'erro'>(
    t ? 'pronto' : 'invalido'
  );

  async function sair() {
    setEstado('enviando');
    try {
      const r = await fetch(interessado ? '/api/interessados/sair' : '/api/novidades/sair', {
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
      <h1 className="text-[27px] sm:text-[31px] font-bold leading-tight">{tx.titulo}</h1>
      <Card className="p-6 grid gap-4">
        {estado === 'saiu' ? (
          interessado ? (
            <Aviso>{tx.saiuInteressado}</Aviso>
          ) : (
            <Aviso>
              {tx.saiuAviso}
            </Aviso>
          )
        ) : estado === 'invalido' ? (
          <Erro>
            {tx.invalidoAntes}<Link href="/perfil" className="underline">{tx.suaConta}</Link>.
          </Erro>
        ) : (
          <>
            <p className="font-ui text-[15px] leading-relaxed text-ink-body m-0">
              {interessado
                ? tx.confirmarInteressado
                : tx.confirmarAviso}
            </p>
            {estado === 'erro' && <Erro>{tx.erro}</Erro>}
            <Button size="lg" onClick={() => void sair()} disabled={estado === 'enviando'}>
              {estado === 'enviando' ? tx.saindo : tx.sair}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
