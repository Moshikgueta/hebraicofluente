/* O sandbox do Paddle no site em inglês ainda sem domínio (29/10/2026,
 * decisão do dono): a publicação aceita a chave de teste enquanto o
 * SITE_ORIGIN é o workers.dev, e volta a parar com ela quando o domínio entra.
 * A conferência de produção (worker/e2e.sh) segue a mesma regra. */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const raiz = join(__dirname, '..', '..');
const script = readFileSync(join(raiz, 'scripts/pagamento-ativo.mjs'), 'utf8');
const e2e = readFileSync(join(raiz, 'worker/e2e.sh'), 'utf8');

/* A mesma expressão que o script usa, tirada do próprio arquivo. */
const fonte = script.match(/const semDominio = (\/.+\/m)\.test\(TOML\);/);
const semDominio = (toml: string) => {
  const [, corpo, flags] = fonte![1].match(/^\/(.+)\/(\w*)$/)!;
  return new RegExp(corpo, flags).test(toml);
};

describe('o sandbox do Paddle só sem domínio', () => {
  it('a regra existe no script', () => {
    expect(fonte).not.toBeNull();
    expect(script).toMatch(/if \(sandbox && semDominio\)/);
    expect(script).toMatch(/\} else if \(sandbox\) \{[\s\S]{0,900}process\.exit\(1\)/);
  });

  it('workers.dev é "sem domínio"; um domínio de verdade não é', () => {
    expect(semDominio('SITE_ORIGIN = "https://fluent-hebrew.moshikg10.workers.dev"')).toBe(true);
    expect(semDominio('SITE_ORIGIN = "https://fluenthebrew.com"')).toBe(false);
    expect(semDominio('# SITE_ORIGIN = "https://x.workers.dev"\nSITE_ORIGIN = "https://fluenthebrew.com"')).toBe(false);
  });

  it('a conferência de produção aceita o teste só no inglês e no workers.dev', () => {
    expect(e2e).toMatch(/\[ "\$EM_INGLES" = 1 \] && \[ "\$MODO" = teste \] && \[\[ "\$B" == \*\.workers\.dev\* \]\]/);
  });
});
