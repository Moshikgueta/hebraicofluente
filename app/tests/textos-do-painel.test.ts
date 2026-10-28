/* Os desencontros achados no percurso de aluno de 30/09/2026. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const fonte = (p: string) => readFileSync(new URL(`../src/${p}`, import.meta.url), 'utf8');

describe('o que o painel promete bate com o curso', () => {
  it('conta todos os módulos, e não só os de letra', () => {
    const d = fonte('app/meu-hebraico/DashboardClient.tsx');
    expect(d).toContain('em {course.modules.length} módulos');
    expect(d).not.toContain('course.modules.filter(m => m.letterIds.length).length} módulos');
  });

  it('as perguntas do começo são as quatro do /onboarding, e a Aula 0 é de dez minutos nos dois lugares', () => {
    const d = fonte('app/meu-hebraico/DashboardClient.tsx');
    /* O painel dizia "três" depois de o /onboarding ganhar a pergunta do nome
       (28/10/2026): o número do painel é o do contador "N de 4". */
    expect(fonte('app/onboarding/page.tsx')).toContain('{step + 1} de 4');
    expect(d).toContain('quatro perguntas rápidas');
    expect(d).not.toMatch(/(duas|três) perguntas/);
    expect(d).toContain('Dez minutos de leitura');
    expect(fonte('app/inicio/StartHereClient.tsx')).toContain('Dez minutos de leitura');
  });

  it('botão para rota paga não pré-carrega a página', () => {
    expect(fonte('components/ui/Button.tsx')).toContain('prefetch={ehPaga(href) ? false : undefined}');
  });

  it('conta nova vê o preço antes do aviso de "já pagou com outro e-mail"', () => {
    const c = fonte('app/cursos/[slug]/CourseClient.tsx');
    expect(c).toContain('{!contaNova && aviso}');
    expect(c).toContain('{contaNova && aviso}');
  });

  it('o checkout diz que é pagamento único, sem renovação automática (CDC, art. 6º, III)', () => {
    expect(fonte('app/checkout/[slug]/CheckoutClient.tsx') + fonte('i18n/telas/conta-checkout-client.ts'))
      .toContain('Pagamento único. Não há assinatura nem renovação automática');
  });
});
