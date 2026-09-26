'use client';

/* "Achei um erro neste exercício."
 * ─────────────────────────────────────────────────────────────────────────
 * Aparece na folha de retorno, DEPOIS da resposta: é quando o aluno sabe o
 * que o curso considerou certo e pode discordar. Um toque abre o formulário
 * ali mesmo - motivo em um toque, comentário opcional -, sem sair da questão
 * e sem perder o lugar na lição.
 *
 * Vai junto a foto do exercício como ele apareceu (os exercícios são
 * sorteados; sem a foto o relato não aponta para nada). Não vai quem mandou:
 * ver worker/src/api/relatos.js.
 *
 * Só na plataforma de verdade. Na demonstração estática não há servidor para
 * receber, e um botão que sempre falha é pior do que botão nenhum.
 */

import { useState } from 'react';
import { asset } from '@/lib/asset';
import { CONTEUDO_DO_SERVIDOR } from '@/lib/content';
import type { Exercise } from '@/lib/engine/types';
import { fotoDoExercicio } from '@/lib/relato';

const MOTIVOS = [
  ['resposta', 'A resposta certa está errada'],
  ['hebraico', 'Erro no hebraico ou nos pontos'],
  ['audio', 'O áudio está errado'],
  ['confuso', 'O enunciado está confuso'],
  ['outro', 'Outro']
] as const;

type Estado = 'fechado' | 'aberto' | 'enviando' | 'enviado' | 'erro';

export function RelatarErro({ ex, escolhida, acertou }: {
  ex: Exercise; escolhida: number | null; acertou: boolean;
}) {
  const [estado, setEstado] = useState<Estado>('fechado');
  const [motivo, setMotivo] = useState<string | null>(null);
  const [comentario, setComentario] = useState('');

  if (!CONTEUDO_DO_SERVIDOR) return null;

  const enviar = async () => {
    if (!motivo) return;
    setEstado('enviando');
    try {
      const r = await fetch(asset('/api/relatos'), {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fotoDoExercicio(ex, escolhida, acertou), motivo, comentario,
          rota: typeof window !== 'undefined' ? window.location.pathname : ''
        })
      });
      setEstado(r.ok ? 'enviado' : 'erro');
    } catch {
      setEstado('erro');
    }
  };

  if (estado === 'fechado') {
    return (
      <button type="button" onClick={() => setEstado('aberto')}
              className="min-h-[44px] px-1 font-ui text-[13px] text-ink-muted underline underline-offset-2
                         hover:text-ink-body">
        Achei um erro neste exercício
      </button>
    );
  }

  if (estado === 'enviado') {
    return (
      <p role="status" className="w-full font-ui text-[14px] text-ink-body m-0">
        Obrigado! O relato chegou, e a questão vai ser conferida.
      </p>
    );
  }

  return (
    <div className="w-full grid gap-2.5 pt-3 border-t border-[color:var(--line-soft)]"
         role="group" aria-label="Relatar um erro neste exercício">
      <p className="font-ui text-[14px] font-semibold text-ink m-0">O que está errado?</p>
      <div className="flex flex-wrap gap-2">
        {MOTIVOS.map(([k, rotulo]) => (
          <button key={k} type="button" aria-pressed={motivo === k} onClick={() => setMotivo(k)}
                  className={`min-h-[40px] px-3 rounded-full border font-ui text-[13.5px]
                    ${motivo === k ? 'bg-[var(--navy)] border-[var(--navy)] text-white'
                                   : 'border-line bg-surface text-ink-body'}`}>
            {rotulo}
          </button>
        ))}
      </div>
      <label className="grid gap-1 font-ui text-[13px] text-ink-muted">
        Quer explicar? (opcional)
        <textarea value={comentario} onChange={e => setComentario(e.target.value.slice(0, 500))}
                  rows={2} maxLength={500}
                  className="rounded-[var(--r-md)] border border-line bg-surface px-3 py-2 font-ui text-[15px] text-ink" />
      </label>
      {estado === 'erro' && (
        <p role="alert" className="font-ui text-[13.5px] text-ink-body m-0">
          Não consegui enviar agora. Confira a internet e tente de novo.
        </p>
      )}
      <div className="flex items-center gap-3">
        <button type="button" onClick={enviar} disabled={!motivo || estado === 'enviando'}
                className="min-h-[44px] px-4 rounded-[var(--r-md)] bg-[var(--navy)] text-white font-ui
                           text-[14px] font-semibold disabled:opacity-50">
          {estado === 'enviando' ? 'Enviando…' : 'Enviar'}
        </button>
        <button type="button" onClick={() => setEstado('fechado')}
                className="min-h-[44px] px-2 font-ui text-[13.5px] text-ink-muted">
          Cancelar
        </button>
      </div>
      <p className="font-ui text-[12px] text-ink-muted m-0">
        Vai junto o exercício como apareceu para você. Seu nome e seu e-mail não vão.
      </p>
    </div>
  );
}
