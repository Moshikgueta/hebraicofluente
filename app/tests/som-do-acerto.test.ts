/* O som do acerto (28/10/2026) e do erro (29/10/2026): sintetizados, sem
   arquivo; calados pelo menu de acessibilidade e enquanto uma gravação do
   curso toca. O do erro é mais baixo e grave, nunca uma buzina. */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { PADRAO, normalizar, ATRIBUTOS } from '@/lib/acessibilidade';

const fonte = (f: string) => readFileSync(`src/${f}`, 'utf8');

describe('o som do acerto', () => {
  it('nasce ligado, e o menu tem a saída', () => {
    expect(PADRAO.semSons).toBe(false);
    expect(normalizar({ semSons: true }).semSons).toBe(true);
    expect(ATRIBUTOS.semSons).toBe('data-a11y-sons');
    expect(fonte('lib/som-do-acerto.ts')).toContain("hasAttribute('data-a11y-sons')");
    expect(fonte('components/shell/BotaoAcessibilidade.tsx')).toContain('mudar({ semSons: !v })');
  });
  it('é sintetizado: nenhum arquivo de som', () => {
    const s = fonte('lib/som-do-acerto.ts');
    expect(s).toContain('createOscillator');
    expect(s).not.toMatch(/\.(mp3|wav|ogg|m4a)\b/);
  });
  it('toca no acerto e no erro, e não por cima de uma gravação', () => {
    const p = fonte('components/learn/ExercisePlayer.tsx');
    expect(p).toMatch(/tocarSom\(correct \? .* : 'erro'\)/);
    const l = fonte('lib/som-do-acerto.ts');
    expect(l).toMatch(/erro: \.7/);
    for (const f of ['app/hebraico-na-rua/RuaClient.tsx', 'components/game/Batalha.tsx',
                     'components/landing/DemoAlef.tsx', 'components/landing/OuvirEFalar.tsx',
                     'components/learn/Compreensao.tsx']) {
      expect(fonte(f), f).toContain('tocarResposta(');
    }
    expect(fonte('lib/som-do-acerto.ts')).toContain('gravacaoTocando()) return;');
    for (const f of ['components/learn/AudioButton.tsx', 'components/learn/CompararSons.tsx', 'components/learn/LinhasDeLeitura.tsx']) {
      expect(fonte(f), f).toContain('vigiarGravacao(');
    }
  });
});
