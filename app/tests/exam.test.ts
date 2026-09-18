/* The final exam and the certificate it issues.
 *
 * The exam is the one assessment whose result leaves the app — a learner posts
 * the certificate — so the things checked here are the things that would be
 * embarrassing in public: an exam that does not cover what it claims, a pass
 * mark that moves, a certificate issued to someone who did not pass. */

import { describe, expect, it } from 'vitest';
import { allLetters, course, scenesUpTo } from '@/lib/content';
import { buildExam, examReport, partsFor, EXAM_PASS, EXAM_PARTS } from '@/lib/engine/exam';
import { violatesOrderRule } from '@/lib/engine/exercises';
import { certificateReady, recordExam } from '@/lib/state/rules';
import { EMPTY_STATE, type LearnerState } from '@/lib/state/types';
import { certificateFileName, formatDate, FORMATS, SHARE_TEXT } from '@/lib/certificate';

const letters = allLetters();
const scenes = scenesUpTo(22).map(s => ({
  id: s.id, he: s.he, pt: s.pt, translit: s.translit,
  labelPt: s.labelPt, contextPt: s.contextPt, audioId: s.audioId, fromOrder: s.fromOrder
}));

describe('the exam covers what it says it covers', () => {
  it('builds every part it promises, with no recordings', () => {
    const exam = buildExam(letters, scenes, { audioAvailable: false });
    const promised = partsFor(false).map(p => p.id);
    expect(exam.sections.map(s => s.part.id)).toEqual(promised);
    for (const s of exam.sections) {
      expect(s.exercises.length, s.part.id).toBe(s.part.count);
    }
  });

  it('withholds the listening part until there are recordings, and says so', () => {
    expect(partsFor(false).some(p => p.id === 'escuta')).toBe(false);
    expect(partsFor(true).some(p => p.id === 'escuta')).toBe(true);
    const exam = buildExam(letters, scenes, { audioAvailable: false });
    for (const s of exam.sections) {
      for (const ex of s.exercises) expect(ex.skill).not.toBe('ouvir');
    }
  });

  it('tests each part with the skill that part is about', () => {
    const exam = buildExam(letters, scenes, { audioAvailable: true });
    for (const s of exam.sections) {
      /* `mundo` is reading, and so is `silabas` and `palavras` — what matters
         is that a part never quietly tests something else. */
      for (const ex of s.exercises) {
        expect(ex.skill, `${s.part.id} → ${ex.id}`).toBe(s.part.skill);
      }
    }
  });

  it('ends on real-world reading', () => {
    const exam = buildExam(letters, scenes, { audioAvailable: true });
    const last = exam.sections[exam.sections.length - 1]!;
    expect(last.part.id).toBe('mundo');
    for (const ex of last.exercises) expect(ex.kind).toBe('scene-reading');
  });

  it('never shows a word the course did not teach', () => {
    const alphabet = letters.flatMap(l => l.finalForm ? [l.letter, l.finalForm] : [l.letter]);
    for (const attempt of [1, 2, 3, 7]) {
      const exam = buildExam(letters, scenes, { audioAvailable: true, attempt });
      for (const s of exam.sections) {
        for (const ex of s.exercises) {
          expect(violatesOrderRule(ex, alphabet), `${attempt} ${ex.id}`).toEqual([]);
        }
      }
    }
  });

  it('is about thirty questions, not twelve and not ninety', () => {
    expect(buildExam(letters, scenes, { audioAvailable: false }).total).toBe(30);
    expect(buildExam(letters, scenes, { audioAvailable: true }).total).toBe(35);
  });
});

describe('a retry is a different exam', () => {
  it('asks different questions on the second sitting', () => {
    const a = buildExam(letters, scenes, { audioAvailable: true, attempt: 1 });
    const b = buildExam(letters, scenes, { audioAvailable: true, attempt: 2 });
    const idsA = a.sections.flatMap(s => s.exercises.map(e => e.id));
    const idsB = b.sections.flatMap(s => s.exercises.map(e => e.id));
    const shared = idsA.filter(id => idsB.includes(id)).length;
    /* Some overlap is unavoidable — there are only so many ways to ask about
       22 letters — but it must not be the same paper. */
    expect(shared).toBeLessThan(idsA.length * 0.75);
  });

  it('is deterministic within one attempt', () => {
    const a = buildExam(letters, scenes, { audioAvailable: true, attempt: 4 });
    const b = buildExam(letters, scenes, { audioAvailable: true, attempt: 4 });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe('the report', () => {
  const full = (score: number) => EXAM_PARTS
    .filter(p => p.id !== 'escuta')
    .map(p => ({ partId: p.id, correct: Math.round(p.count * score), total: p.count }));

  it('passes at 70% and not below', () => {
    expect(examReport(full(1)).passed).toBe(true);
    expect(examReport(full(0.7)).passed).toBe(true);
    expect(examReport(full(0.5)).passed).toBe(false);
  });

  it('names the weak parts, worst first', () => {
    const r = examReport([
      { partId: 'letras', correct: 8, total: 8 },
      { partId: 'sinais', correct: 1, total: 5 },
      { partId: 'silabas', correct: 3, total: 5 },
      { partId: 'palavras', correct: 7, total: 7 },
      { partId: 'mundo', correct: 5, total: 5 }
    ]);
    expect(r.weak.map(w => w.part.id)).toEqual(['sinais', 'silabas']);
    expect(r.weak[0]!.part.practiceMode).toBe('vogais');
  });

  it('says nothing is weak when nothing is', () => {
    expect(examReport(full(1)).weak).toEqual([]);
  });

  it('never uses the word reprovado', () => {
    /* A course that tells an adult beginner they failed has lost them. The
       failing band says what to fix and that the retry is free. */
    for (const s of [0, 0.3, 0.5, 0.69]) {
      const band = examReport(full(s)).bandPt;
      expect(`${band.titlePt} ${band.bodyPt}`.toLowerCase()).not.toContain('reprova');
    }
  });
});

describe('the certificate is issued for reading, not for finishing', () => {
  const allDone = (): LearnerState => ({
    ...EMPTY_STATE,
    lessons: Object.fromEntries(letters.map(l => [l.id, {
      letterId: l.id, stagesDone: [1, 2, 3, 4, 5], quizBest: 1, quizAttempts: 1,
      perfectBonusPaid: true, completedAt: '2026-09-01T00:00:00.000Z'
    }]))
  });

  it('is refused to someone who finished every lesson but never passed', () => {
    const gate = certificateReady(allDone(), course.totalLetters);
    expect(gate.lettersDone).toBe(course.totalLetters);
    expect(gate.examPassed).toBe(false);
    expect(gate.ready).toBe(false);
  });

  it('is refused to someone who passed the exam with letters missing', () => {
    let s: LearnerState = { ...EMPTY_STATE };
    s = recordExam(s, 1, {}, '2026-09-10', EXAM_PASS);
    expect(certificateReady(s, course.totalLetters).ready).toBe(false);
  });

  it('is issued when both are true', () => {
    let s = allDone();
    s = recordExam(s, 0.8, {}, '2026-09-10', EXAM_PASS);
    expect(certificateReady(s, course.totalLetters).ready).toBe(true);
  });

  it('keeps the day of the first pass even after a worse attempt', () => {
    let s = allDone();
    s = recordExam(s, 0.9, {}, '2026-09-10', EXAM_PASS);
    const first = s.finalChallenge.passedAt;
    s = recordExam(s, 0.4, {}, '2026-09-20', EXAM_PASS);
    expect(s.finalChallenge.passedAt).toBe(first);
    expect(s.finalChallenge.best).toBe(0.9);       // the best score is kept too
    expect(s.finalChallenge.attempts).toBe(2);
    expect(certificateReady(s, course.totalLetters).ready).toBe(true);
  });

  it('stores the LAST sitting part by part, not a best-of composite', () => {
    let s = allDone();
    s = recordExam(s, 1, { letras: { correct: 8, total: 8 } }, '2026-09-10', EXAM_PASS);
    s = recordExam(s, 0.5, { letras: { correct: 4, total: 8 } }, '2026-09-11', EXAM_PASS);
    expect(s.finalChallenge.parts?.['letras']).toEqual({ correct: 4, total: 8 });
  });
});

describe('the image', () => {
  it('offers the two shapes people actually post', () => {
    expect(FORMATS.square).toMatchObject({ w: 1080, h: 1080 });
    expect(FORMATS.wide).toMatchObject({ w: 1200, h: 630 });
  });

  it('writes the date the way a document does', () => {
    expect(formatDate(new Date(2026, 8, 18))).toBe('18 de setembro de 2026');
  });

  it('makes a file name that survives any filesystem', () => {
    expect(certificateFileName('Ana Júlia Gonçalves'))
      .toBe('certificado-hebraico-fluente-ana-julia-goncalves.png');
    expect(certificateFileName('')).toBe('certificado-hebraico-fluente-aluno.png');
    expect(certificateFileName('////')).toBe('certificado-hebraico-fluente-aluno.png');
  });

  it('suggests a post that claims only what is true', () => {
    const t = SHARE_TEXT.toLowerCase();
    expect(t).not.toContain('fluente em');
    expect(t).not.toContain('certificação');
    expect(t).not.toContain('diploma');
  });
});
