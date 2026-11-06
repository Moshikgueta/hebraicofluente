'use client';

/* "Como foi esta lição?" (05/10/2026, pedido do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * No fim da fixação, depois da nota: fácil, ok ou difícil, e um comentário
 * opcional. Vai para /api/avaliacao (worker/src/api/avaliacoes.js), que
 * guarda SEM a conta - por isso a tela diz que a resposta não fica ligada ao
 * aluno. Uma vez por lição neste aparelho (localStorage): refazer o teste não
 * pergunta de novo. Falhar ao enviar não atrapalha nada da lição.
 */

import { tx } from '@/i18n/telas/licao-avaliar-licao';
import { useEffect, useState } from 'react';
import { asset } from '@/lib/asset';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type Nota = 'facil' | 'ok' | 'dificil';
const NOTAS: readonly { id: Nota; rotulo: string; emoji: string }[] = [
  { id: 'facil', rotulo: tx.facil, emoji: '😊' },
  { id: 'ok', rotulo: tx.ok, emoji: '🙂' },
  { id: 'dificil', rotulo: tx.dificil, emoji: '😓' }
];
export const COMENTARIO_MAX = 600;
const chave = (licao: string) => `hf-avaliou-${licao}`;

function jaAvaliou(licao: string): boolean {
  try { return localStorage.getItem(chave(licao)) === '1'; } catch { return false; }
}
function marcarAvaliada(licao: string) {
  try { localStorage.setItem(chave(licao), '1'); } catch { /* sem armazenamento: pode perguntar de novo */ }
}

export function AvaliarLicao({ licao }: { licao: string }) {
  /* null até montar: no HTML estático não se sabe o que este aparelho já respondeu. */
  const [visivel, setVisivel] = useState<boolean | null>(null);
  const [nota, setNota] = useState<Nota | null>(null);
  const [comentario, setComentario] = useState('');
  const [estado, setEstado] = useState<'escolhendo' | 'enviando' | 'enviado' | 'erro'>('escolhendo');

  useEffect(() => { setVisivel(!jaAvaliou(licao)); }, [licao]);
  if (!visivel) return null;

  async function enviar() {
    if (!nota) return;
    setEstado('enviando');
    try {
      const r = await fetch(asset('/api/avaliacao'), {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licao, nota, comentario })
      });
      if (!r.ok) return setEstado('erro');
      marcarAvaliada(licao);
      setEstado('enviado');
    } catch { setEstado('erro'); }
  }

  if (estado === 'enviado') {
    return (
      <Card className="p-5">
        <p role="status" className="font-ui text-[15px] m-0">
          {tx.obrigado(t => <strong>{t}</strong>)}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5 grid gap-4">
      <div className="grid gap-1">
        <h2 className="font-display text-[18px] font-semibold m-0">{tx.pergunta}</h2>
        <p className="font-ui text-[13.5px] text-ink-muted m-0">
          {tx.opcional}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2.5" role="group" aria-label={tx.pergunta}>
        {NOTAS.map(n => (
          <button key={n.id} type="button" aria-pressed={nota === n.id}
                  onClick={() => setNota(n.id)}
                  className={`min-h-[64px] rounded-[14px] border-[1.5px] grid place-items-center gap-0.5 font-ui text-[15px] font-semibold
                    transition-colors duration-200
                    ${nota === n.id ? 'border-[var(--teal)] bg-[var(--teal-soft)]' : 'border-line bg-[var(--card)] hover:border-[#C9C3B4]'}`}>
            <span aria-hidden className="text-[22px] leading-none">{n.emoji}</span>
            {n.rotulo}
          </button>
        ))}
      </div>
      {nota && (
        <>
          <label className="grid gap-1.5 font-ui text-[14.5px]">
            {tx.contar}
            <textarea value={comentario} maxLength={COMENTARIO_MAX} rows={3}
                      onChange={e => setComentario(e.target.value)}
                      placeholder={tx.exemplo}
                      className="rounded-[12px] border border-line bg-[var(--card)] p-3 font-ui text-[15px] leading-relaxed" />
          </label>
          {estado === 'erro' && (
            <p role="alert" className="font-ui text-[14px] m-0">{tx.erro}</p>
          )}
          <div>
            <Button onClick={() => void enviar()} disabled={estado === 'enviando'}>
              {estado === 'enviando' ? tx.enviando : tx.enviar}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
