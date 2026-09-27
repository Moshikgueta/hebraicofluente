'use client';

/* O mini-texto do módulo: ler um bilhete, uma mensagem, um cartão inteiro.
 * ─────────────────────────────────────────────────────────────────────────
 * O texto e as ajudas de leitura moram em components/learn/LinhasDeLeitura
 * (as mesmas das leituras bônus).
 *
 * Depois, perguntas de compreensão em português, no mesmo componente das
 * checagens da lição: não vale nota, não tranca nada, e o motivo aparece
 * sempre. O motor e a regra da revisão estão em lib/engine/textos.ts. */

import Link from 'next/link';
import { Badge, Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { He } from '@/components/hebrew/He';
import { Compreensao } from '@/components/learn/Compreensao';
import { GravarLeitura } from '@/components/learn/GravarLeitura';
import { AudioButton, hasAudio, useRegistroDeAudio } from '@/components/learn/AudioButton';
import { LinhasDeLeitura } from '@/components/learn/LinhasDeLeitura';
import { textoDoModulo, type CourseModule } from '@/lib/content';
import { useProgress } from '@/lib/state/store';
import { textoLidoId } from '@/lib/engine/textos';

export function TextoClient({ module: mod }: { module: CourseModule }) {
  const texto = textoDoModulo(mod.n);
  const p = useProgress();
  /* A lista de palavras novas pergunta `hasAudio`: sem assinar, ela não
     redesenha quando o registro das gravações chega. */
  useRegistroDeAudio();
  if (!texto) {
    return (
      <div className="focus-col grid gap-5">
        <p className="text-[16px] text-ink-body m-0">Este módulo ainda não tem texto de leitura.</p>
        <LinkButton href={`/modulo/${mod.n}`} variant="secondary" className="justify-self-start">
          Voltar ao módulo
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="focus-col grid gap-6">
      <header className="grid gap-3">
        <Link href={`/modulo/${mod.n}`}
              className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">
          ← Módulo {mod.n}
        </Link>
        <Badge tone="accent">Leitura do módulo {mod.n}</Badge>
        <h1 className="text-[27px] sm:text-[33px] font-bold leading-tight m-0">{texto.tituloPt}</h1>
        <p className="text-[16px] leading-relaxed text-ink-body m-0">{texto.introPt}</p>
      </header>

      <LinhasDeLeitura linhas={texto.linhas} rotulo={texto.tipoPt} semPontos={!!texto.semPontos} />

      {/* Ler o texto inteiro em voz alta é a leitura corrida de verdade: sem
          parar em cada palavra. Gravar e se ouvir mostra onde a voz travou. */}
      <GravarLeitura
        titulo="Leia o texto em voz alta"
        instrucao="Leia o texto inteiro, sem parar em cada palavra, grave e se ouça. Depois leia de novo e compare."
      />

      {texto.novas.length > 0 && (
        <Card tone="wash" className="p-5 grid gap-3">
          <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted m-0">
            Palavras novas neste texto
          </p>
          <ul className="grid gap-2 list-none p-0 m-0">
            {texto.novas.map(w => (
              <li key={w.he} className="flex items-baseline gap-3 flex-wrap">
                <He size="word">{w.he}</He>
                {hasAudio(w.audioId) && <AudioButton audioId={w.audioId!} ariaLabel={`Ouvir ${w.translit}`} size="sm" />}
                <span className="font-ui text-[14px] text-ink">
                  <span className="font-semibold">{w.translit}</span>
                  <span className="text-ink-muted"> · {w.pt}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Compreensao
        id={`texto-${mod.n}`}
        titulo="Você entendeu?"
        intro="Responda pelo que leu. Não vale nota: o motivo aparece a cada resposta."
        perguntas={texto.perguntas}
        fecho={{
          bom: 'Você leu um texto inteiro em hebraico e entendeu. É para isto que o alfabeto serve.',
          parcial: 'Volte ao texto e toque nas linhas que travaram. Na segunda leitura ele fica mais fácil.'
        }}
        /* Respondidas as perguntas, o texto conta como lido, e as palavras
           novas dele passam a fazer parte do vocabulário do aluno. */
        aoCompletar={() => p.markFirst(textoLidoId(mod.n))}
      />
      {p.state.firsts[textoLidoId(mod.n)] && texto.novas.length > 0 && (
        <p className="font-ui text-[14px] text-[var(--teal-ink)] m-0">
          ✓ As palavras novas deste texto entraram no seu vocabulário e no treino de palavras à mão.
        </p>
      )}

      <LinkButton href={`/modulo/${mod.n}`} variant="secondary" className="justify-self-start">
        Voltar ao módulo
      </LinkButton>
    </div>
  );
}
