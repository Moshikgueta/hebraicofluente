'use client';

/* O certificado.
 * ─────────────────────────────────────────────────────────────────────────
 * Earned by two facts and nothing else: every letter finished, and the final
 * exam passed. No payment, no e-mail, no account. A certificate issued for
 * anything less is worth nothing — including to the person holding it.
 *
 * It is drawn in the browser as a PNG, so it never leaves the device unless
 * the learner posts it. Web Share carries the FILE on a phone, which is the
 * one place this is actually shared from; everywhere else it downloads, which
 * is what a desktop expects anyway.
 *
 * The name is editable here even though onboarding asked for one — people put
 * "Mo" into an onboarding field and their full name on a certificate, and
 * making them re-run onboarding to fix it would be absurd.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, Badge } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { He } from '@/components/hebrew/He';
import { useProgress } from '@/lib/state/store';
import { allLetters, course } from '@/lib/content';
import { certificateReady } from '@/lib/state/rules';
import { EXAM_PASS } from '@/lib/engine/exam';
import {
  canvasToBlob, certificateFileName, drawCertificate, formatDate, FORMATS, SHARE_TEXT,
  type CertificateFormat
} from '@/lib/certificate';
import { track } from '@/lib/analytics';

export function CertificadoClient() {
  const p = useProgress();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [format, setFormat] = useState<CertificateFormat>('square');
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState<string | null>(null);

  const gate = certificateReady(p.state, course.totalLetters);
  const letters = allLetters().map(l => l.letter);
  const passedAt = p.state.finalChallenge.passedAt;
  const date = passedAt ? new Date(passedAt) : new Date();
  const score = p.state.finalChallenge.best;

  /* Prefill from onboarding once state has loaded, and then stop touching it —
     a learner who cleared the field means it. */
  useEffect(() => {
    if (!touched && p.ready) setName(p.state.onboarding?.name?.trim() ?? '');
  }, [p.ready, p.state.onboarding?.name, touched]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gate.ready) return;
    void drawCertificate(canvas, { name, date, letters, score, format });
  }, [name, date, letters, score, format, gate.ready]);

  useEffect(() => { redraw(); }, [redraw]);

  const download = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    const blob = await canvasToBlob(canvas);
    setBusy(false);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = certificateFileName(name);
    a.click();
    /* Revoked on the next tick rather than immediately: Safari has been known
       to cancel the download when the URL dies in the same frame. */
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    track('certificate_downloaded', { mode: format });
    setSaid('Imagem salva.');
  }, [name, format]);

  const share = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    const blob = await canvasToBlob(canvas);
    setBusy(false);
    if (!blob) return;
    const file = new File([blob], certificateFileName(name), { type: 'image/png' });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({ files: [file], text: SHARE_TEXT, title: 'Hebraico Fluente' });
        track('certificate_shared', { mode: format });
        return;
      } catch {
        /* The learner cancelled the sheet, or the platform refused. Falling
           through to a download is better than an error nobody can act on. */
      }
    }
    await download();
  }, [name, format, download]);

  const copyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SHARE_TEXT);
      setSaid('Texto copiado.');
    } catch {
      setSaid('Não deu para copiar — selecione o texto acima.');
    }
  }, []);

  if (!p.ready) return null;

  /* ── not yet ──────────────────────────────────────────────────────── */
  if (!gate.ready) {
    return (
      <div className="focus-col grid gap-5">
        <header className="grid gap-3">
          <Badge tone="neutral">Certificado</Badge>
          <h1 className="text-[27px] sm:text-[33px] font-bold">Ainda falta um pouco</h1>
          <p className="font-ui text-[15px] leading-relaxed text-ink-muted">
            O certificado sai quando as duas coisas estiverem feitas. Elas não têm prazo.
          </p>
        </header>

        <Card className="overflow-hidden">
          <ul className="divide-y divide-[color:var(--line-soft)]">
            <Requirement
              done={gate.lettersDone >= course.totalLetters}
              titlePt="As 22 letras"
              detailPt={`${gate.lettersDone} de ${course.totalLetters} concluídas`}
              href="/mapa"
              ctaPt="Ir para o mapa"
            />
            <Requirement
              done={gate.examPassed}
              titlePt="O exame final"
              detailPt={
                p.state.finalChallenge.best != null
                  ? `Melhor resultado: ${Math.round(p.state.finalChallenge.best * 100)}% — aprovação a partir de ${Math.round(EXAM_PASS * 100)}%`
                  : `Aprovação a partir de ${Math.round(EXAM_PASS * 100)}%`
              }
              href="/desafio-final"
              ctaPt="Fazer o exame"
            />
          </ul>
        </Card>

        <p className="font-ui text-[13px] leading-relaxed text-ink-muted">
          Um certificado por participação não vale nada — nem para quem o recebe.
          Por isso este depende de ler, e não de terminar.
        </p>
      </div>
    );
  }

  /* ── earned ───────────────────────────────────────────────────────── */
  return (
    <div className="grid gap-6">
      <header className="grid gap-3 reading">
        <Badge tone="mint">Aprovado em {formatDate(date)}</Badge>
        <h1 className="text-[27px] sm:text-[33px] font-bold">Seu certificado</h1>
        <p className="font-ui text-[15px] leading-relaxed text-ink-muted">
          A imagem é gerada aqui no seu aparelho. Escolha o formato, confira o nome
          e baixe ou compartilhe.
        </p>
      </header>

      <Card className="p-4 sm:p-5 grid gap-4">
        {/* The preview. `max-w-full` plus the intrinsic canvas size keeps it
            sharp on a phone and never wider than the screen. */}
        <div className="rounded-[var(--r-md)] bg-surface-2 p-3 grid place-items-center">
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-w-[520px] rounded-[var(--r-sm)] shadow-[var(--shadow-1)]"
            role="img"
            aria-label={
              `Certificado de conclusão do curso Hebraico Fluente em nome de ` +
              `${name || 'aluno'}, ${formatDate(date)}.`
            }
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="cert-name" className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">
            Nome no certificado
          </label>
          <input
            id="cert-name"
            value={name}
            onChange={e => { setTouched(true); setName(e.target.value.slice(0, 48)); }}
            placeholder="Como você quer aparecer"
            autoComplete="name"
            className="min-h-[52px] px-4 rounded-[var(--r-md)] border-2 border-line bg-surface
                       font-ui text-[17px] text-ink placeholder:text-ink-muted
                       focus:border-[var(--accent-soft)]"
          />
        </div>

        <fieldset className="grid gap-2">
          <legend className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted mb-1">
            Formato
          </legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(FORMATS) as CertificateFormat[]).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                aria-pressed={format === f}
                className={`min-h-[52px] px-4 rounded-[var(--r-md)] border-2 text-left
                  transition-colors grid
                  ${format === f
                    ? 'border-[var(--accent-soft)] bg-[var(--accent-wash)]'
                    : 'border-line bg-surface hover:border-[var(--accent-soft)]'}`}
              >
                <span className="font-ui text-[14px] font-medium text-ink">
                  {FORMATS[f].labelPt}
                </span>
                <span className="font-ui text-[12px] text-ink-muted">
                  {FORMATS[f].w}×{FORMATS[f].h} · {FORMATS[f].hintPt}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-3 pt-1">
          <Button size="lg" onClick={share} disabled={busy}>
            {busy ? 'Gerando…' : 'Compartilhar'}
          </Button>
          <Button variant="secondary" onClick={download} disabled={busy}>
            Baixar PNG
          </Button>
        </div>
        <p aria-live="polite" className="font-ui text-[13px] text-ink-muted min-h-[20px]">
          {said}
        </p>
      </Card>

      <Card className="p-5 grid gap-3">
        <h2 className="font-display text-[16px] font-bold text-ink">Texto para o post</h2>
        <p className="text-[15px] leading-relaxed text-ink-body">{SHARE_TEXT}</p>
        <Button variant="secondary" size="sm" onClick={copyText} className="justify-self-start">
          Copiar texto
        </Button>
      </Card>

      <Card tone="wash" className="p-5 grid gap-2 reading">
        <p className="font-ui text-[13.5px] leading-relaxed text-ink-body">
          <strong>O que este certificado é:</strong> o registro de que você concluiu as
          22 letras e foi aprovado no exame final deste curso, com {' '}
          {score != null ? `${Math.round(score * 100)}%` : 'nota de aprovação'}.
        </p>
        <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted">
          <strong>O que ele não é:</strong> um certificado oficial, um diploma ou uma
          avaliação de proficiência reconhecida. Isso está escrito na própria imagem —
          quem recebe merece saber, e você também.
        </p>
      </Card>

      <div className="flex flex-wrap gap-3">
        <LinkButton href="/concluido" variant="secondary">O que você conquistou</LinkButton>
        <LinkButton href="/academia" variant="ghost">Continuar praticando</LinkButton>
      </div>
    </div>
  );
}

function Requirement({
  done, titlePt, detailPt, href, ctaPt
}: { done: boolean; titlePt: string; detailPt: string; href: string; ctaPt: string }) {
  return (
    <li className="px-5 py-4 flex flex-wrap items-center gap-3">
      <span
        aria-hidden
        className={`w-7 h-7 rounded-full grid place-items-center text-[13px] shrink-0
          ${done ? 'bg-mint text-[var(--mint-ink)]' : 'bg-surface-2 text-ink-muted'}`}
      >
        {done ? '✓' : '○'}
      </span>
      <span className="grid gap-0.5 min-w-0 flex-1">
        <span className="font-ui text-[15px] font-medium text-ink">{titlePt}</span>
        <span className="font-ui text-[13px] text-ink-muted">{detailPt}</span>
      </span>
      {!done && (
        <LinkButton href={href} variant="secondary" size="sm">{ctaPt}</LinkButton>
      )}
    </li>
  );
}

/** The card the completion page shows once the certificate exists. */
export function CertificateCallout() {
  const p = useProgress();
  const gate = certificateReady(p.state, course.totalLetters);
  if (!gate.ready) return null;
  return (
    <Card tone="mint" className="p-6 grid gap-3">
      <Badge tone="mint">Certificado</Badge>
      <h2 className="font-display text-[20px] font-bold leading-snug">
        Você tem um certificado para compartilhar.
      </h2>
      <p className="text-[15px] leading-relaxed text-ink-body">
        Com o seu nome, a data da aprovação e as 22 letras{' '}
        <He size="inline">א</He> — em quadrado ou paisagem.
      </p>
      <LinkButton href="/certificado" className="justify-self-start">
        Ver o certificado
      </LinkButton>
    </Card>
  );
}
