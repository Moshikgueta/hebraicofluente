'use client';

/* O fim do A1.
 * ─────────────────────────────────────────────────────────────────────────
 * Só aparece como celebração para quem passou no exame (a aprovação que o
 * app guarda depois da correção do servidor; o certificado, esse, só o
 * servidor emite). Os números são os do progresso, nada arredondado para
 * cima: palavras aprendidas, unidades, XP, habilidades, a nota do exame e as
 * conquistas. O A2 aparece como próximo passo, sem data: ele ainda não
 * existe, e o curso não promete o que não tem. */

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { useProgress } from '@/lib/state/store';
import { conquistasA1, cursoA1, palavrasAprendidas } from '@/lib/a1';
import { dominio, HABILIDADES_A1, NOME_DA_HABILIDADE, unidadeConcluida } from '@/lib/state/a1-estado';

export function ConcluidoA1Client() {
  const p = useProgress();
  const a1 = p.state.a1;
  const passou = !!a1.exame.passedAt;
  const ordem = cursoA1().modulos.flatMap(m => m.unidades);
  const feitas = ordem.filter(n => unidadeConcluida(a1, n)).length;
  const conquistas = conquistasA1(a1).filter(c => c.feita);

  if (!passou) {
    return (
      <div className="reading grid gap-5">
        <Link href="/a1" className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">← Hebraico A1</Link>
        <h1 className="text-[27px] font-bold m-0">Quase lá</h1>
        <p className="text-[16px] leading-relaxed text-ink-body m-0">
          Esta página abre quando você passa no exame final. Você já concluiu {feitas} de {ordem.length} unidades.
        </p>
        <LinkButton href="/a1/exame" className="justify-self-start">Ir para o exame</LinkButton>
      </div>
    );
  }

  return (
    <div className="reading grid gap-7">
      <section className="grid gap-4 text-center py-4">
        <p dir="rtl" lang="he" className="he text-[44px] text-[var(--accent)] m-0 leading-none animate-rise">כָּל הַכָּבוֹד!</p>
        <h1 className="text-[28px] sm:text-[34px] font-bold leading-tight m-0">Você concluiu o Hebraico A1.</h1>
        <p className="text-[17px] leading-relaxed text-ink-body m-0 max-w-[46ch] justify-self-center">
          Você começou olhando para símbolos que pareciam impossíveis. Agora você consegue ler, compreender e se comunicar em hebraico.
        </p>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2" aria-label="O seu A1 em números">
        <Numero v={String(palavrasAprendidas(a1).length)} r="palavras aprendidas" />
        <Numero v={`${feitas}/${ordem.length}`} r="unidades concluídas" />
        <Numero v={String(p.state.xp)} r="XP" />
        <Numero v={a1.exame.best != null ? `${Math.round(a1.exame.best * 100)}%` : 'aprovado'} r="no exame final" />
      </section>

      <section className="grid gap-2" aria-labelledby="t-hab">
        <h2 id="t-hab" className="font-display text-[20px] font-semibold m-0">Suas habilidades</h2>
        <ul className="grid gap-1.5 m-0 p-0 list-none font-ui text-[14.5px]">
          {HABILIDADES_A1.map(h => {
            const d = dominio(a1, h);
            return (
              <li key={h} className="flex justify-between border-b border-[color:var(--line-soft)] py-1.5">
                <span className="text-ink">{NOME_DA_HABILIDADE[h]}</span>
                <span className="text-ink-body">{d == null ? 'poucos dados' : `${Math.round(d * 100)}%`}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {conquistas.length > 0 && (
        <section className="grid gap-2" aria-labelledby="t-conq">
          <h2 id="t-conq" className="font-display text-[20px] font-semibold m-0">Conquistas</h2>
          <p className="font-ui text-[15px] text-ink-body m-0">{conquistas.map(c => c.tituloPt).join(' · ')}</p>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <LinkButton href="/a1/certificado">Ver o certificado</LinkButton>
        <LinkButton href="/a1/revisao" variant="secondary">Continuar revisando</LinkButton>
      </div>

      <Card tone="wash" className="p-5 grid gap-2">
        <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted m-0">Próximo passo</p>
        <h2 className="font-display text-[20px] font-semibold text-ink m-0">Hebraico A2</h2>
        <p className="text-[15px] leading-relaxed text-ink-body m-0">
          O A2 ainda está em preparação. Até lá, a revisão do dia mantém o seu A1 firme.
        </p>
        <LinkButton href="/cursos/hebraico-a2/" variant="secondary" className="justify-self-start">Saber do A2</LinkButton>
      </Card>
    </div>
  );
}

function Numero({ v, r }: { v: string; r: string }) {
  return (
    <Card className="p-4 grid gap-0.5 text-center">
      <span className="font-display text-[24px] font-bold text-ink">{v}</span>
      <span className="font-ui text-[12.5px] text-ink-muted">{r}</span>
    </Card>
  );
}
