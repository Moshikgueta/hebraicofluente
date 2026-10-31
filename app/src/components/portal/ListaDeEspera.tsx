'use client';

/* "Me avise quando abrir" nas páginas dos produtos "Em breve" (23/10/2026,
 * plano de marketing, decisão 1). A caixa de consentimento começa
 * desmarcada e o servidor a exige; a inscrição só vale depois do clique no
 * link do e-mail. A resposta é a mesma para quem já estava na lista: a tela
 * não diz quem está nela. Ver worker/src/api/interessados.js.
 *
 * Fica nas páginas leves (lib/rotas.ts): não importa nada além de asset e
 * origem. */

import { useState } from 'react';
import { asset } from '@/lib/asset';
import { origemAtual } from '@/lib/origem';

export type InteresseDaLista = 'israel' | 'raizes' | 'a1';

export function ListaDeEspera({ interesse, produto }: { interesse: InteresseDaLista; produto: string }) {
  const [email, setEmail] = useState('');
  const [aceito, setAceito] = useState(false);
  const [estado, setEstado] = useState<'pronto' | 'enviando' | 'ok' | 'invalido' | 'aceite' | 'erro'>('pronto');
  const id = `lista-${interesse}`;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (estado === 'enviando') return;
    if (!aceito) return setEstado('aceite');
    setEstado('enviando');
    try {
      const r = await fetch(asset('/api/interessados'), {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, interesse, consentiu: true, origem: origemAtual()?.fonte })
      });
      if (r.ok) return setEstado('ok');
      const { error } = await r.json().catch(() => ({ error: '' })) as { error?: string };
      setEstado(error === 'email-invalido' ? 'invalido' : 'erro');
    } catch { setEstado('erro'); }
  };

  return (
    <div className="w-full max-w-[520px] rounded-[18px] border border-line bg-[var(--card)] px-5 py-4 grid gap-3">
      <div className="grid gap-1">
        <p className="font-display text-[18px] font-semibold text-ink m-0">Quer saber quando {produto} abrir?</p>
        <p className="font-ui text-[14px] leading-[1.55] text-ink-muted m-0">
          Deixe o seu e-mail e avisamos quando abrir. Sem data marcada, e sem outros e-mails por causa disto.
        </p>
      </div>
      {estado === 'ok' ? (
        <p role="status" className="font-ui text-[15px] leading-[1.55] text-[var(--teal-ink)] m-0">
          <span aria-hidden className="font-bold mr-1.5">✓</span>
          Quase lá: mandamos um e-mail para <strong className="break-all">{email}</strong>. Toque em
          &quot;Confirmar&quot; nele para entrar na lista. Se não chegar, olhe a caixa de spam.
        </p>
      ) : (
        <form onSubmit={enviar} className="grid gap-2" noValidate>
          <label htmlFor={`${id}-email`} className="font-ui text-[14px] font-semibold text-ink">Seu e-mail</label>
          <div className="flex flex-wrap gap-2">
            <input
              id={`${id}-email`} type="email" required autoComplete="email" inputMode="email"
              value={email} onChange={ev => { setEmail(ev.target.value); if (estado !== 'enviando') setEstado('pronto'); }}
              className="flex-1 min-w-[200px] min-h-[48px] rounded-[12px] border border-line bg-[var(--card)] px-3.5
                         font-ui text-[16px] text-ink
                         focus-visible:outline focus-visible:outline-2
                         focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]"
            />
            <button
              type="submit" disabled={estado === 'enviando'}
              className="min-h-[48px] px-5 rounded-[12px] bg-[var(--accent-bg)] text-white font-ui text-[15.5px] font-semibold
                         disabled:opacity-60 focus-visible:outline focus-visible:outline-2
                         focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]"
            >
              {estado === 'enviando' ? 'Enviando…' : 'Me avise'}
            </button>
          </div>
          <label htmlFor={`${id}-aceito`} className="flex items-start gap-2.5 font-ui text-[14px] leading-[1.5] text-ink-body">
            <input
              id={`${id}-aceito`} type="checkbox" checked={aceito}
              onChange={ev => { setAceito(ev.target.checked); if (estado === 'aceite') setEstado('pronto'); }}
              className="mt-[3px] h-[18px] w-[18px] shrink-0 accent-[var(--teal)]"
            />
            <span>
              Quero receber por e-mail o aviso de quando {produto} abrir. Posso sair quando quiser.{' '}
              <a href="/privacidade/" target="_blank" rel="noopener" className="underline">Privacidade</a>
            </span>
          </label>
          <div aria-live="polite" className="min-h-[20px]">
            {estado === 'aceite' && (
              <p className="font-ui text-[14px] text-[var(--gold-ink)] m-0">Marque a caixa acima para entrar na lista.</p>
            )}
            {estado === 'invalido' && (
              <p className="font-ui text-[14px] text-[var(--gold-ink)] m-0">Confira o e-mail: parece que falta alguma coisa.</p>
            )}
            {estado === 'erro' && (
              <p className="font-ui text-[14px] text-[var(--gold-ink)] m-0">Não consegui agora. Tente de novo daqui a pouco.</p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
