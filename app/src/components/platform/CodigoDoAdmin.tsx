'use client';

/* O segundo fator do administrador, na tela (30/09/2026). Os painéis de
 * /admin mostram isto quando a API responde 403 `admin-codigo`: a senha já
 * foi, falta o código de seis dígitos mandado ao e-mail da conta. Com o
 * código certo, o painel recarrega e vale por 12 horas neste aparelho.
 * Ver worker/src/lib/admin.js. */

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { asset } from '@/lib/asset';

const ERROS: Record<string, string> = {
  'codigo-invalido': 'Código errado. Confira os seis números do e-mail.',
  'codigo-vencido': 'Este código venceu ou foi errado vezes demais. Peça outro.',
  'sem-email': 'O envio de e-mail do site não está funcionando agora, então o código não pode sair.',
  'rate-limited-hora': 'Muitos códigos pedidos na última hora. Espere um pouco e tente de novo.'
};

/** A resposta 403 é o pedido de código? Lê o corpo sem consumir o original. */
export async function pedeCodigo(r: Response): Promise<boolean> {
  if (r.status !== 403) return false;
  try { return (await r.clone().json() as { error?: string }).error === 'admin-codigo'; } catch { return false; }
}

export function CodigoDoAdmin({ onPronto }: { onPronto: () => void }) {
  const [enviado, setEnviado] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const post = async (caminho: string, body?: unknown) => {
    const r = await fetch(asset(caminho), {
      method: 'POST', credentials: 'same-origin', cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {})
    });
    const j = await r.json().catch(() => ({})) as { error?: string };
    return { ok: r.ok, erro: j.error };
  };

  const enviar = async () => {
    setOcupado(true); setErro(null);
    try {
      const r = await post('/api/admin/codigo');
      if (r.ok) setEnviado(true);
      else setErro(ERROS[r.erro ?? ''] ?? 'Não deu para mandar o código agora. Tente de novo.');
    } catch { setErro('Sem conexão. Tente de novo.'); }
    finally { setOcupado(false); }
  };

  const conferir = async (e: FormEvent) => {
    e.preventDefault();
    setOcupado(true); setErro(null);
    try {
      const r = await post('/api/admin/codigo/conferir', { codigo });
      if (r.ok) onPronto();
      else setErro(ERROS[r.erro ?? ''] ?? 'Não deu para conferir agora. Tente de novo.');
    } catch { setErro('Sem conexão. Tente de novo.'); }
    finally { setOcupado(false); }
  };

  return (
    <section className="rounded-lg border border-[var(--line)] bg-surface p-5 grid gap-3 max-w-[460px]">
      <h2 className="text-[19px] font-semibold m-0">Confirme que é você</h2>
      <p className="font-ui text-[15px] leading-relaxed text-ink-body m-0">
        Os painéis de administrador pedem, além da senha, um código de seis números mandado ao e-mail desta
        conta. Ele abre os painéis por 12 horas, só neste aparelho.
      </p>
      {!enviado ? (
        <Button onClick={enviar} disabled={ocupado}>{ocupado ? 'Enviando…' : 'Mandar o código para o meu e-mail'}</Button>
      ) : (
        <form onSubmit={conferir} className="grid gap-3">
          <label className="grid gap-1 font-ui text-[14px] font-semibold">
            Código recebido por e-mail (vale 10 minutos)
            <input value={codigo} onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                   inputMode="numeric" autoComplete="one-time-code" autoFocus
                   className="min-h-[52px] rounded-md border border-[var(--line)] bg-surface px-4 font-ui text-[20px] tracking-[.3em]" />
          </label>
          <Button type="submit" disabled={ocupado || codigo.length !== 6}>{ocupado ? 'Conferindo…' : 'Entrar no painel'}</Button>
          <button type="button" onClick={enviar} disabled={ocupado}
                  className="justify-self-start min-h-[44px] font-ui text-[14px] text-[var(--accent)] underline">
            Mandar outro código
          </button>
        </form>
      )}
      {erro && <p role="alert" className="font-ui text-[14px] text-[var(--ember)] m-0">{erro}</p>}
    </section>
  );
}
