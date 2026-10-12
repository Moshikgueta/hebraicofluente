/* Meu domínio das letras (lib/dominio.ts) e os dias de acerto em
 * `recordSkill` (11/10/2026). */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dominioDaLetra, HABILIDADES, nivelDaHabilidade, NIVEL_PT, resumoDoDominio, LIMIARES } from '@/lib/dominio';
import { recordSkill } from '@/lib/state/rules';
import { mergeStates } from '@/lib/state/merge';
import { EMPTY_STATE } from '@/lib/state/types';
import type { LearnerState, SkillStat } from '@/lib/state/types';

const st = (hits: number, misses: number, streak: number, dias?: number): SkillStat =>
  ({ hits, misses, streak, lastOn: '2026-10-10', ...(dias !== undefined ? { diasDeAcerto: dias } : {}) });

describe('o nível de uma habilidade', () => {
  it('com poucas respostas não inventa nível', () => {
    expect(nivelDaHabilidade(null)).toBe('poucos-dados');
    expect(nivelDaHabilidade(st(3, 0, 3, 1))).toBe('poucos-dados');
  });

  it('dominada pede acertos seguidos, boa taxa e dois dias', () => {
    expect(nivelDaHabilidade(st(8, 1, 4, 2))).toBe('dominada');
    /* Tudo certo, mas num dia só: quase. */
    expect(nivelDaHabilidade(st(8, 1, 4, 1))).toBe('quase');
  });

  it('não é só porcentagem: um erro recente derruba', () => {
    expect(nivelDaHabilidade(st(20, 1, 0, 5))).toBe('aprendendo');
    expect(nivelDaHabilidade(st(20, 1, 1, 5))).toBe('desenvolvimento');
  });

  it('registro antigo, sem dias, não é rebaixado pelo critério novo', () => {
    expect(nivelDaHabilidade(st(8, 1, 4))).toBe('dominada');
  });

  it('os limites estão num lugar só', () => {
    expect(LIMIARES.minimoDeRespostas).toBeGreaterThan(1);
  });
});

describe('a letra inteira', () => {
  const comSkills = (skills: LearnerState['skills']): LearnerState =>
    ({ ...EMPTY_STATE, skills, lessons: { mem: { letterId: 'mem', stagesDone: [1, 2, 3, 4, 5], quizBest: 1, quizAttempts: 1, perfectBonusPaid: false, completedAt: null } } } as LearnerState);

  it('é a habilidade mais fraca com dados, e diz qual praticar', () => {
    const d = dominioDaLetra(comSkills({ mem: { rec: st(9, 0, 9, 3), ler: st(4, 3, 1, 2) } }), 'mem');
    expect(d.habilidades.forma).toBe('dominada');
    expect(d.habilidades.som).toBe('poucos-dados');
    expect(d.geral).toBe('desenvolvimento');
    expect(d.praticar).toBe('leitura');
  });

  it('o som junta as duas fontes (som e ouvir)', () => {
    const d = dominioDaLetra(comSkills({ mem: { som: st(2, 0, 2, 1), ouvir: st(3, 0, 5, 2) } }), 'mem');
    expect(d.habilidades.som).not.toBe('poucos-dados');
  });

  it('o resumo só lista letras começadas', () => {
    const r = resumoDoDominio(comSkills({ mem: { rec: st(9, 0, 9, 3) } }), ['alef', 'mem', 'tav']);
    expect(r.letras.map(l => l.letterId)).toEqual(['mem']);
    expect(r.contagem.dominada).toBe(1);
  });
});

describe('os dias de acerto', () => {
  it('contam uma vez por dia, só com acerto', () => {
    let s = EMPTY_STATE as LearnerState;
    s = recordSkill(s, 'mem', 'rec', true, '2026-10-10');
    s = recordSkill(s, 'mem', 'rec', true, '2026-10-10');
    s = recordSkill(s, 'mem', 'rec', false, '2026-10-11');
    expect(s.skills.mem!.rec!.diasDeAcerto).toBe(1);
    s = recordSkill(s, 'mem', 'rec', true, '2026-10-11');
    expect(s.skills.mem!.rec!.diasDeAcerto).toBe(2);
  });

  it('um registro antigo continua sem o campo', () => {
    const antigo = { ...EMPTY_STATE, skills: { mem: { rec: st(5, 0, 5) } } } as LearnerState;
    const s = recordSkill(antigo, 'mem', 'rec', true, '2026-10-12');
    expect(s.skills.mem!.rec!.diasDeAcerto).toBeUndefined();
    expect(s.skills.mem!.rec!.hits).toBe(6);
  });

  it('a fusão entre aparelhos guarda o maior', () => {
    const a = { ...EMPTY_STATE, skills: { mem: { rec: { ...st(5, 0, 5, 3), ultimoAcerto: '2026-10-09' } } } } as LearnerState;
    const b = { ...EMPTY_STATE, skills: { mem: { rec: { ...st(6, 0, 6, 2), lastOn: '2026-10-11', ultimoAcerto: '2026-10-11' } } } } as LearnerState;
    const m = mergeStates(a, b);
    expect(m.skills.mem!.rec!.diasDeAcerto).toBe(3);
    expect(m.skills.mem!.rec!.ultimoAcerto).toBe('2026-10-11');
  });
});

/* "Letras dominadas" e "lições concluídas" nunca com o mesmo nome
 * (12/10/2026). "Dominada" é só o domínio por habilidade (lib/dominio.ts);
 * a regra antiga das cinco etapas com 75% se chama "lição concluída". */
describe('cada número com o seu nome', () => {
  const fonte = (p: string) => readFileSync(join(__dirname, '..', 'src', p), 'utf8');

  it('no painel, "letras dominadas" vem do domínio e "lições concluídas" da regra antiga', () => {
    const d = fonte('app/meu-hebraico/DashboardClient.tsx');
    expect(d).toMatch(/n=\{dominio\.contagem\.dominada\} rotulo=\{[^}]*'letras dominadas'/);
    expect(d).toMatch(/n=\{p\.mastered\} rotulo=\{[^}]*'lições concluídas'/);
    expect(d).not.toMatch(/n=\{p\.mastered\} rotulo=\{[^}]*dominad/);
  });

  it('as telas que contam pela regra antiga não dizem "dominada"', () => {
    for (const f of ['components/game/AlphabetGrid.tsx', 'app/concluido/CompletionClient.tsx',
      'app/desafio-final/FinalChallengeClient.tsx', 'app/certificado/CertificadoClient.tsx',
      'app/loja/LojaClient.tsx', 'app/checkpoint/[n]/CheckpointClient.tsx']) {
      const visivel = fonte(f).split('\n').filter(l => !/^\s*(\*|\/\/|\/\*|\{\/\*)/.test(l)).join('\n');
      expect(visivel, f).not.toMatch(/letras dominadas|Letras dominadas|· dominada|Dominar (é|uma)|Domine as/);
    }
    expect(fonte('components/game/AlphabetGrid.tsx')).toContain('lições concluídas');
  });

  it('os níveis do domínio têm os nomes combinados', () => {
    expect(NIVEL_PT['poucos-dados']).toBe('Dados insuficientes');
    expect(HABILIDADES.map(h => h.tituloPt)).toEqual(['Reconhecimento visual', 'Reconhecimento sonoro', 'Leitura em palavras']);
  });
});
