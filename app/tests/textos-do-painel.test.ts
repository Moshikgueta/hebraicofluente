/* Os desencontros achados no percurso de aluno de 30/09/2026. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const fonte = (p: string) => readFileSync(new URL(`../src/${p}`, import.meta.url), 'utf8');

describe('o que o painel promete bate com o curso', () => {
  it('conta todos os módulos, e não só os de letra', () => {
    const d = fonte('app/meu-hebraico/DashboardClient.tsx');
    /* O texto mora no dicionário da tela; o número vem do curso. */
    expect(fonte('i18n/telas/painel-dashboard-client.tsx')).toContain('em {modulos} módulos');
    expect(d).toContain('modulos: course.modules.length');
    expect(d).not.toContain('course.modules.filter(m => m.letterIds.length).length} módulos');
    expect(d).not.toContain('modulos: course.modules.filter(');
  });

  it('as perguntas do começo são as quatro do /onboarding, e a Aula 0 é de dez minutos nos dois lugares', () => {
    /* O painel e a Aula 0 com os seus dicionários (app/src/i18n/telas/). */
    const d = fonte('app/meu-hebraico/DashboardClient.tsx') + fonte('i18n/telas/painel-dashboard-client.tsx');
    /* O painel dizia "três" depois de o /onboarding ganhar a pergunta do nome
       (28/10/2026): o número do painel é o do contador "N de 4". */
    expect(fonte('app/onboarding/page.tsx')).toContain('fmt(tx.contador, { n: step + 1 })');
    expect(fonte('i18n/telas/painel-onboarding.ts')).toContain("contador: '{n} de 4'");
    expect(d).toContain('quatro perguntas rápidas');
    expect(d).not.toMatch(/(duas|três) perguntas/);
    expect(d).toContain('Dez minutos de leitura');
    expect(fonte('i18n/telas/painel-start-here-client.tsx')).toContain("lead: 'Dez minutos de leitura");
    expect(fonte('app/inicio/StartHereClient.tsx')).toContain('{tx.lead}');
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
    expect(fonte('app/checkout/[slug]/CheckoutClient.tsx'))
      .toContain('Pagamento único. Não há assinatura nem renovação automática');
  });
});
