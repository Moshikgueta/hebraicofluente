'use client';

/* Three questions, once.
 *
 * What they are for, and what they are NOT for: the answers personalise the
 * daily goal and the encouragement copy. They do not change the curriculum.
 * A beginner who says "reconheço algumas letras" still starts at letter 1 —
 * the order rule means every later lesson depends on the earlier ones, so
 * skipping ahead would break the reading progression, not accelerate it. */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useProgress } from '@/lib/state/store';
import type { DailyGoalMinutes, Onboarding } from '@/lib/state/types';

const REASONS = [
  { id: 'viagem',   label: 'Viajar para Israel' },
  { id: 'familia',  label: 'Família ou relacionamento' },
  { id: 'morar',    label: 'Morar em Israel' },
  { id: 'idiomas',  label: 'Interesse em idiomas' },
  { id: 'trabalho', label: 'Trabalho' },
  { id: 'outro',    label: 'Outro motivo' }
] as const;

const GOALS: { m: DailyGoalMinutes; label: string; note: string }[] = [
  { m: 5,  label: '5 minutos',  note: 'Uma etapa por dia. Devagar e sempre.' },
  { m: 10, label: '10 minutos', note: 'O ritmo da maioria. Uma letra a cada dois dias.' },
  { m: 15, label: '15 minutos', note: 'Uma letra por dia, com folga.' },
  { m: 20, label: '20 minutos', note: 'Intenso. O alfabeto em três semanas.' }
];

const START = [
  { id: 'zero',            label: 'Estou começando do zero' },
  { id: 'algumas-letras',  label: 'Reconheço algumas letras' },
  { id: 'leio-um-pouco',   label: 'Já consigo ler um pouco' }
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { setOnboarding } = useProgress();
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState<Onboarding['reason'] | null>(null);
  const [goal, setGoal] = useState<DailyGoalMinutes | null>(null);
  const [start, setStart] = useState<Onboarding['startingPoint'] | null>(null);
  const [name, setName] = useState('');

  const finish = () => {
    setOnboarding({
      reason: reason ?? 'outro',
      goalMinutes: goal ?? 10,
      startingPoint: start ?? 'zero',
      name: name.trim() || undefined,
      completedAt: new Date().toISOString()
    });
    router.push('/meu-hebraico');
  };

  return (
    <div className="grid gap-6 max-w-[560px] mx-auto">
      <header className="grid gap-2">
        <Badge tone="teal">{step + 1} de 4</Badge>
        <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
          <div className="h-full bg-[var(--teal-band)] transition-[width] duration-300"
               style={{ width: `${((step + 1) / 4) * 100}%` }} />
        </div>
      </header>

      {step === 0 && (
        <Question
          title="Por que você quer aprender hebraico?"
          hint="Isso muda o tom das mensagens ao longo do curso, não o conteúdo."
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
          title="Quanto tempo por dia?"
          hint="É a sua meta diária. Dá para mudar depois — e ninguém é punido por não bater."
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
          title="Você já sabe alguma coisa em hebraico?"
          hint="Todo mundo começa pela primeira letra: cada lição se apoia nas anteriores, e é isso que permite ler palavras inteiras tão cedo."
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
        <Question title="Como podemos te chamar?" hint="Opcional. Fica só no seu navegador.">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Seu nome"
            autoComplete="given-name"
            className="w-full min-h-[56px] px-4 rounded-[var(--r-md)] border border-line
                       bg-surface text-ink text-[16px] font-ui
                       placeholder:text-ink-muted"
          />
          <Button size="lg" full onClick={finish}>Começar o curso</Button>
        </Question>
      )}

      {step > 0 && (
        <button
          type="button"
          onClick={() => setStep(s => s - 1)}
          className="font-ui text-[13px] text-ink-muted hover:text-ink-body justify-self-start"
        >
          ← Voltar
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
      className={`transition-colors ${selected ? 'border-[var(--teal)] bg-[var(--teal-wash)]' : ''}`}
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full min-h-[60px] px-5 py-3 flex items-center gap-3 text-left
                   text-[16px] text-ink hover:bg-surface-2 rounded-[var(--r-lg)] transition-colors"
      >
        <span aria-hidden
          className={`w-5 h-5 rounded-full border-2 shrink-0
            ${selected ? 'border-[var(--teal-band)] bg-[var(--teal-band)]' : 'border-line'}`} />
        {children}
      </button>
    </Card>
  );
}
