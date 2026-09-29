'use client';

/* Ouvir a instrução do exercício, em português (29/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Para quem tem dificuldade de leitura: com "Ouvir instruções em português"
 * ligado no menu de acessibilidade (lib/acessibilidade.ts, `voz`), cada
 * exercício ganha um botão que lê o ENUNCIADO com a voz do aparelho.
 *
 * Voz sintética aqui, e não no hebraico, de propósito: a recusa do topo de
 * AudioButton.tsx é sobre ensinar pronúncia de hebraico com uma máquina que
 * ignora o nikud. Ler "Qual destas se lê pa?" em português não ensina
 * pronúncia nenhuma - só tira a barreira da leitura.
 *
 * O que é lido é só o enunciado, nunca as alternativas, a resposta, a dica
 * ou a explicação. O hebraico que o enunciado cita entre {{ }} vira "o
 * hebraico mostrado": a voz em português leria as letras errado, e ouvir a
 * palavra certa é trabalho das gravações.
 */

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { textoParaVoz } from '@/lib/voz-instrucao';

const ATRIBUTO = 'data-a11y-voz';

function assinarVoz(aviso: () => void) {
  if (typeof MutationObserver === 'undefined') return () => {};
  const mo = new MutationObserver(aviso);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: [ATRIBUTO] });
  return () => mo.disconnect();
}
const vozLigada = () => document.documentElement.hasAttribute(ATRIBUTO);

/** A preferência, viva: muda na hora em que o menu muda. */
export function useVozDasInstrucoes(): boolean {
  return useSyncExternalStore(assinarVoz, vozLigada, () => false);
}

function vozPortuguesa(): SpeechSynthesisVoice | null {
  const vozes = window.speechSynthesis.getVoices();
  return vozes.find(v => v.lang === 'pt-BR') ?? vozes.find(v => v.lang.startsWith('pt')) ?? null;
}

export function OuvirInstrucao({ texto }: { texto: string }) {
  const ligada = useVozDasInstrucoes();
  const [estado, setEstado] = useState<'parado' | 'falando' | 'pausado'>('parado');
  const temVoz = typeof window !== 'undefined' && 'speechSynthesis' in window;

  /* Trocar de questão ou sair da tela cala a voz: a instrução velha não pode
     continuar falando por cima da nova. */
  useEffect(() => {
    setEstado('parado');
    return () => { if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel(); };
  }, [texto]);

  const alternar = useCallback(() => {
    const s = window.speechSynthesis;
    if (estado === 'falando') {
      s.pause();
      /* O Chrome do Android não pausa: ele para. Se não pausou, é parar. */
      if (!s.paused) { s.cancel(); setEstado('parado'); return; }
      setEstado('pausado');
      return;
    }
    if (estado === 'pausado' && s.paused) { s.resume(); setEstado('falando'); return; }
    s.cancel();
    const u = new SpeechSynthesisUtterance(textoParaVoz(texto));
    u.lang = 'pt-BR';
    const v = vozPortuguesa();
    if (v) u.voice = v;
    u.rate = 0.95;
    u.onend = () => setEstado('parado');
    u.onerror = () => setEstado('parado');
    s.speak(u);
    setEstado('falando');
  }, [estado, texto]);

  if (!ligada || !temVoz) return null;

  const rotulo = estado === 'falando' ? 'Pausar a instrução'
    : estado === 'pausado' ? 'Continuar a instrução' : 'Ouvir a instrução em português';

  return (
    <button type="button" onClick={alternar} aria-label={rotulo}
            className="justify-self-start inline-flex items-center gap-2 min-h-[44px] px-3.5 rounded-[var(--r-md)]
                       border border-line bg-surface font-ui text-[14px] font-semibold text-ink-body
                       hover:bg-surface-2">
      <span aria-hidden>{estado === 'falando' ? '❚❚' : '🔊'}</span>
      <span>{estado === 'falando' ? 'Pausar' : estado === 'pausado' ? 'Continuar' : 'Ouvir a instrução'}</span>
    </button>
  );
}
