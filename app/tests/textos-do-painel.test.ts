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

  it('as perguntas do começo são três, e a Aula 0 é de dez minutos nos dois lugares', () => {
    const d = fonte('app/meu-hebraico/DashboardClient.tsx');
    expect(d).toContain('três perguntas rápidas');
    expect(d).not.toContain('duas perguntas');
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
});
