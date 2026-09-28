'use client';

/* "Fale a palavra": o aluno diz, o curso confere (27/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * A transcrição é do navegador (lib/fala.ts), e a decisão - bateu ou não -
 * é de `conferirFala`. Aparece só onde faz sentido: em PALAVRAS e frases,
 * nunca em sílaba solta, e só em navegador que transcreve (o Firefox não; aí
 * ficam a gravação e a comparação de ondas, que não somem).
 *
 * O aviso de que a voz vai para o Google ou a Apple fica ao lado do botão,
 * sempre: é diferente do "Gravar a minha", cuja gravação não sai do aparelho,
 * e o aluno precisa saber qual das duas está usando.
 */

import { useEffect, useRef, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { conferirFala, falaDisponivel, ouvirHebraico, type Veredito } from '@/lib/fala';

type Estado =
  | { t: 'parado' } | { t: 'ouvindo' } | { t: 'veredito'; v: Veredito }
  | { t: 'nada' } | { t: 'negado' } | { t: 'sem-hebraico' } | { t: 'erro' };

export function FalarECorrigir({ alvo, translit, nota }: {
  alvo: string; translit?: string | null;
  /** O aviso de privacidade, quando o da lição não serve (a capa não tem "a gravação acima"). */
  nota?: string;
}) {
  const [disponivel, setDisponivel] = useState(false);
  const [estado, setEstado] = useState<Estado>({ t: 'parado' });
  const [acertos, setAcertos] = useState(0);
  const parar = useRef<(() => void) | null>(null);

  /* Só depois de montar: no servidor não há `window`, e o HTML estático não
     pode prometer um botão que o navegador do aluno talvez não tenha. */
  useEffect(() => { setDisponivel(falaDisponivel()); }, []);
  /* Outra palavra, outra tentativa. */
  useEffect(() => { setEstado({ t: 'parado' }); }, [alvo]);
  useEffect(() => () => parar.current?.(), []);

  if (!disponivel) return null;

  const falar = async () => {
    setEstado({ t: 'ouvindo' });
    const { resultado, parar: p } = ouvirHebraico();
    parar.current = p;
    const r = await resultado;
    parar.current = null;
    if (r.tipo === 'ouvido') {
      const v = conferirFala(alvo, r.alternativas);
      if (v.certo) setAcertos(n => n + 1);
      setEstado({ t: 'veredito', v });
    } else if (r.tipo === 'nada') setEstado({ t: 'nada' });
    else if (r.tipo === 'negado') setEstado({ t: 'negado' });
    else if (r.tipo === 'sem-hebraico') setEstado({ t: 'sem-hebraico' });
    else setEstado({ t: 'erro' });
  };

  return (
    <div className="grid gap-2 rounded-[var(--r-md)] border border-line bg-surface p-3" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2.5">
        {estado.t === 'ouvindo' ? (
          <button type="button" onClick={() => parar.current?.()}
                  className="min-h-[44px] px-4 rounded-[var(--r-md)] bg-[#D93025] text-white font-ui text-[14px] font-semibold">
            ■ Pronto
          </button>
        ) : (
          <button type="button" onClick={falar} disabled={estado.t === 'sem-hebraico'}
                  className="min-h-[44px] px-4 rounded-[var(--r-md)] bg-[var(--teal)] text-white font-ui text-[14px] font-semibold disabled:opacity-50">
            🎤 Fale e seja corrigido
          </button>
        )}
        {acertos > 0 && (
          <span className="font-ui text-[13px] text-[var(--teal-ink)]">✓ {acertos} {acertos === 1 ? 'acerto' : 'acertos'}</span>
        )}
      </div>

      {estado.t === 'ouvindo' && (
        <p role="status" className="font-ui text-[14px] text-ink-body m-0">
          Ouvindo… diga <He size="inline">{alvo}</He>{translit ? <> ({translit})</> : null}.
        </p>
      )}
      {estado.t === 'veredito' && estado.v.certo && (
        <p className="font-ui text-[15px] font-semibold text-[var(--teal-ink)] m-0">
          ✓ Certo! Ouvi <He size="inline">{estado.v.ouvi}</He>.
        </p>
      )}
      {estado.t === 'veredito' && !estado.v.certo && (
        <p className="font-ui text-[14.5px] text-ink-body m-0">
          <span className="font-semibold text-[var(--gold-ink,#8A6520)]">Quase.</span>{' '}
          {estado.v.ouvi ? <>Ouvi <He size="inline">{estado.v.ouvi}</He>. </> : null}
          Ouça o modelo e tente de novo, devagar.
        </p>
      )}
      {estado.t === 'nada' && (
        <p className="font-ui text-[14px] text-ink-body m-0">Não ouvi nada. Toque de novo e fale logo em seguida, perto do microfone.</p>
      )}
      {estado.t === 'negado' && (
        <p role="alert" className="font-ui text-[14px] text-ink-body m-0">
          O navegador não deixou usar o microfone. Permita o microfone para este site e tente de novo.
        </p>
      )}
      {estado.t === 'sem-hebraico' && (
        <p role="alert" className="font-ui text-[14px] text-ink-body m-0">
          O reconhecimento de fala deste navegador não entende hebraico. Use a gravação e a comparação acima.
        </p>
      )}
      {estado.t === 'erro' && (
        <p role="alert" className="font-ui text-[14px] text-ink-body m-0">
          O reconhecimento de fala não respondeu. Confira a internet e tente de novo.
        </p>
      )}
      <p className="font-ui text-[12px] text-ink-muted m-0">
        {nota ?? 'Para corrigir, a sua voz vai para o serviço de fala do navegador (Google ou Apple). A gravação acima não sai do aparelho.'}
      </p>
    </div>
  );
}
