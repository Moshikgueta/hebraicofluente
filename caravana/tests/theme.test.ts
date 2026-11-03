import { describe, expect, it } from 'vitest';
import { brandTheme, contrast, PAPER } from '@/lib/theme';
import { formatRange, tripPhase, dayState } from '@/lib/dates';
import { normalizeInviteCode, formatInviteCode, generateInviteCode } from '@/lib/domain/codes';
import { stableShuffle } from '@/lib/domain/snapshot';

describe('tema da agencia', () => {
  for (const cor of ['#24496B', '#F5D90A', '#FFFFFF', '#7FB3D5', '#000000', '#E4572E']) {
    it(`${cor}: texto do botao e texto da marca com 4,5:1`, () => {
      const t = brandTheme(cor, '#B47A3C');
      expect(contrast(t['--brand-ink'], t['--brand'])).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t['--brand-text'], PAPER)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t['--accent-text'], PAPER)).toBeGreaterThanOrEqual(4.5);
    });
  }
  it('cor invalida cai no padrao', () => {
    expect(brandTheme('vermelho', 'x')['--brand']).toBe('#1f4a6b');
  });
});

describe('datas da viagem', () => {
  it('fases', () => {
    expect(tripPhase('2027-05-10', '2027-05-19', '2027-05-01')).toEqual({ phase: 'before', daysToGo: 9 });
    expect(tripPhase('2027-05-10', '2027-05-19', '2027-05-13')).toEqual({ phase: 'during', dayNumber: 4 });
    expect(tripPhase('2027-05-10', '2027-05-19', '2027-05-25')).toEqual({ phase: 'after', daysSince: 6 });
    expect(dayState('2027-05-12', '2027-05-13')).toBe('past');
  });
  it('intervalo por extenso', () => {
    expect(formatRange('2027-05-10', '2027-05-19')).toBe('10 a 19 de maio de 2027');
    expect(formatRange('2027-05-28', '2027-06-06')).toBe('28 de maio a 6 de junho de 2027');
  });
});

describe('codigo de convite', () => {
  it('normaliza o que a pessoa digita', () => {
    const c = generateInviteCode();
    expect(normalizeInviteCode(formatInviteCode(c).toLowerCase())).toBe(c);
    expect(normalizeInviteCode('0000 1111 2222')).toBe('000011112222');
    expect(normalizeInviteCode('OOOO-IIII-LLLL')).toBe('000011111111');
    expect(normalizeInviteCode('abc')).toBeNull();
    expect(normalizeInviteCode('UUUU-UUUU-UUUU')).toBeNull();
  });
  it('embaralhamento estavel e nunca na ordem original', () => {
    const a = ['sim', 'nao', 'agua', 'cafe'];
    expect(stableShuffle(a, 'k')).toEqual(stableShuffle(a, 'k'));
    expect(stableShuffle(a, 'k')).not.toEqual(a);
    expect([...stableShuffle(a, 'k')].sort()).toEqual([...a].sort());
  });
});
