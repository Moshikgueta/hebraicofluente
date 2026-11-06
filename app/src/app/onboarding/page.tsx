'use client';

/* Three questions, once.
 *
 * What they are for, and what they are NOT for: the answers personalise the
 * daily goal and the encouragement copy. They do not change the curriculum.
 * A beginner who says "reconheço algumas letras" still starts at letter 1 -
 * the order rule means every later lesson depends on the earlier ones, so
 * skipping ahead would break the reading progression, not accelerate it. */

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useProgress } from '@/lib/state/store';
import { useAccount } from '@/lib/account/store';
import { primeiroNome } from '@/components/learn/MeuNome';
import type { DailyGoalMinutes, Onboarding } from '@/lib/state/types';
import { fmt } from '@/i18n';
import { tx } from '@/i18n/telas/painel-onboarding';

const REASONS = [
  { id: 'viagem',   label: tx.motivoViagem },
  { id: 'familia',  label: tx.motivoFamilia },
  { id: 'morar',    label: tx.motivoMorar },
  { id: 'biblia',   label: tx.motivoBiblia },
  { id: 'idiomas',  label: tx.motivoIdiomas },
  { id: 'trabalho', label: tx.motivoTrabalho },
  { id: 'outro',    label: tx.motivoOutro }
] as const;

const GOALS: { m: DailyGoalMinutes; label: string; note: string }[] = [
  { m: 5,  label: tx.meta5,  note: tx.meta5Nota },
  { m: 10, label: tx.meta10, note: tx.meta10Nota },
  { m: 15, label: tx.meta15, note: tx.meta15Nota },
  { m: 20, label: tx.meta20, note: tx.meta20Nota }
];

const START = [
  { id: 'zero',            label: tx.inicioZero },
  { id: 'algumas-letras',  label: tx.inicioAlgumas },
  { id: 'leio-um-pouco',   label: tx.inicioUmPouco }
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { setOnboarding } = useProgress();
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState<Onboarding['reason'] | null>(null);
  const [goal, setGoal] = useState<DailyGoalMinutes | null>(null);
  const [start, setStart] = useState<Onboarding['startingPoint'] | null>(null);
  const [name, setName] = useState('');
  /* O cadastro já pediu o nome: aqui ele vem preenchido com o primeiro nome
     da conta, e o aluno só troca se quiser outro (UXQA-008). Uma vez só,
     para não apagar o que ele digitou. */
  const account = useAccount();
  const nomeDaConta = account.session?.account.name ?? '';
  const preenchido = useRef(false);
  useEffect(() => {
    if (preenchido.current || !nomeDaConta) return;
    preenchido.current = true;
    setName(n => n || primeiroNome(nomeDaConta));
  }, [nomeDaConta]);

  const finish = () => {
    setOnboarding({
      reason: reason ?? 'outro',
      goalMinutes: goal ?? 10,
      startingPoint: start ?? 'zero',
      name: name.trim() || undefined,
      completedAt: new Date().toISOString()
    });
    /* Para a explicação, e não direto para o painel.
       ──────────────────────────────────────────────────────────────────
       Quem acaba de responder as quatro perguntas está a um clique da
       primeira letra, e é exatamente aí que faltam cinco minutos de "como
       esta escrita funciona": para que lado se lê, por que as vogais não
       são letras, o que o curso vai fazer com ele. Mandado direto ao
       painel, o aluno encontra um "Começar a lição" e descobre a direção
       do texto errando.

       A página /inicio existia desde o começo e não era linkada de lugar
       nenhum: o único jeito de chegar nela era digitar o endereço. */
    router.push('/inicio');
  };

  return (
    <div className="grid gap-6 max-w-[560px] mx-auto">
      <header className="grid gap-2">
        <Badge tone="accent">{fmt(tx.contador, { n: step + 1 })}</Badge>
        <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
          {/* Por transform, e não width (a régua de movimento de 27/10). */}
          <div className="h-full w-full origin-left bg-[var(--accent)] transition-transform duration-300 ease-[var(--ease-out)]"
               style={{ transform: `scaleX(${(step + 1) / 4})` }} />
        </div>
      </header>

      {step === 0 && (
        <Question
          title={tx.porQueTitulo}
          /* Dizia "Isso muda o tom das mensagens ao longo do curso", e nada no
             curso lê esta resposta (28/10/2026): a frase prometia o que não
             existe. */
          hint={tx.porQueDica}
        >
          {REASONS.map(r => (
            <Choice key={r.id} selected={reason === r.id}
                    onClick={() => { setReason(r.id); setStep(1); }}>
              {r.label}
            </Choice>
          ))}
        </Question>
      )}

      {step === 1 && (
        <Question
          title={tx.tempoTitulo}
          hint={tx.tempoDica}
        >
          {GOALS.map(g => (
            <Choice key={g.m} selected={goal === g.m}
                    onClick={() => { setGoal(g.m); setStep(2); }}>
              <span className="grid gap-0.5 text-left">
                <span className="font-semibold">{g.label}</span>
                <span className="font-ui text-[13px] text-ink-muted">{g.note}</span>
              </span>
            </Choice>
          ))}
        </Question>
      )}

      {step === 2 && (
        <Question
          title={tx.sabeTitulo}
          hint={tx.sabeDica}
        >
          {START.map(s => (
            <Choice key={s.id} selected={start === s.id}
                    onClick={() => { setStart(s.id); setStep(3); }}>
              {s.label}
            </Choice>
          ))}
        </Question>
      )}

      {step === 3 && (
        <Question title={tx.nomeTitulo} hint={tx.nomeDica}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={tx.seuNome}
            autoComplete="given-name"
            className="w-full min-h-[56px] px-4 rounded-[var(--r-md)] border border-line
                       bg-surface text-ink text-[16px] font-ui
                       placeholder:text-ink-muted"
          />
          <Button size="lg" full onClick={finish}>{tx.comecarCurso}</Button>
        </Question>
      )}

      {step > 0 && (
        <button
          type="button"
          onClick={() => setStep(s => s - 1)}
          className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[14px] text-ink-muted hover:text-ink-body justify-self-start"
        >
          {tx.voltar}
        </button>
      )}
    </div>
  );
}

function Question({
  title, hint, children
}: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-5 animate-rise">
      <div className="grid gap-2">
        <h1 className="text-[25px] sm:text-[29px] font-bold leading-snug">{title}</h1>
        <p className="font-ui text-[14px] leading-relaxed text-ink-muted">{hint}</p>
      </div>
      <div className="grid gap-2.5">{children}</div>
    </div>
  );
}

function Choice({
  children, selected, onClick
}: { children: React.ReactNode; selected: boolean; onClick: () => void }) {
  return (
    <Card
      as="div"
      className={`transition-colors ${selected ? 'border-[var(--accent-soft)] bg-[var(--accent-wash)]' : ''}`}
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full min-h-[60px] px-5 py-3 flex items-center gap-3 text-left
                   text-[16px] text-ink hover:bg-surface-2 rounded-[var(--r-lg)] transition-colors"
      >
        <span aria-hidden
          className={`w-5 h-5 rounded-full border-2 shrink-0
            ${selected ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-line'}`} />
        {children}
      </button>
    </Card>
  );
}
