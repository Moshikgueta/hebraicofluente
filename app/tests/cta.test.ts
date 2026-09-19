/* A regra que decide o que a plataforma pede a quem.
 * ─────────────────────────────────────────────────────────────────────────
 * Um teste só importa de verdade aqui, e é o primeiro: quem já comprou
 * nunca, em lugar nenhum, recebe um botão de compra. É a coisa que dá errado
 * quando alguém escreve o CTA à mão numa tela nova, e é exatamente por isso
 * que a regra é uma função pura em vez de um trecho de JSX repetido oito
 * vezes.
 */

import { describe, expect, it } from 'vitest';
import { proximoCurso, proximoPasso, type Conta } from '../src/lib/cta';
import { allCourses, FLAGSHIP } from '../src/lib/catalog';

const conta = (donos: string[], ready = true, signedIn = true): Conta => ({
  ready, signedIn, can: slug => donos.includes(slug)
});

const visitante = conta([], true, false);
const logadoSemCurso = conta([]);
const aluno = conta([FLAGSHIP]);

describe('o passo que a plataforma oferece', () => {
  it('nunca vende um curso que a pessoa já tem', () => {
    const passo = proximoPasso(aluno, FLAGSHIP);
    expect(passo.vende).toBe(false);
    expect(passo.href).not.toContain('checkout');
  });

  it('manda o aluno para o painel, não para a página de vendas', () => {
    expect(proximoPasso(aluno, FLAGSHIP).href).toBe('/meu-hebraico');
  });

  it('leva visitante e logado sem curso ao checkout', () => {
    for (const c of [visitante, logadoSemCurso]) {
      const passo = proximoPasso(c, FLAGSHIP);
      expect(passo.vende).toBe(true);
      expect(passo.href).toBe(`/checkout/${FLAGSHIP}`);
    }
  });

  it('enquanto a sessão não respondeu, vale o passo de visitante', () => {
    /* E não o do aluno: oferecer /meu-hebraico a quem não está logado dá um
       portão na cara. O caminho contrário custa um clique. */
    const passo = proximoPasso(conta([FLAGSHIP], false, false), FLAGSHIP);
    expect(passo.href).toBe(`/checkout/${FLAGSHIP}`);
  });

  it('não vende curso que ainda não abriu', () => {
    const naoAbriu = allCourses().find(c => c.status !== 'available');
    expect(naoAbriu, 'o catálogo precisa ter um curso "em breve"').toBeTruthy();
    const passo = proximoPasso(visitante, naoAbriu!.slug);
    expect(passo.vende).toBe(false);
    expect(passo.href).toBe(`/cursos/${naoAbriu!.slug}`);
  });

  it('a microcópia diz o prazo de acesso do catálogo', () => {
    const meses = allCourses().find(c => c.slug === FLAGSHIP)!.accessMonths;
    expect(proximoPasso(visitante, FLAGSHIP).micro).toContain(String(meses));
  });
});

describe('o curso seguinte', () => {
  it('é o próximo da trilha para quem só tem a alfabetização', () => {
    const c = proximoCurso(aluno, FLAGSHIP);
    expect(c?.n).toBe(2);
  });

  it('pula o que a pessoa já comprou', () => {
    const cursos = allCourses();
    const dois = cursos.find(c => c.n === 2)!;
    const c = proximoCurso(conta([FLAGSHIP, dois.slug]), FLAGSHIP);
    expect(c?.slug).not.toBe(dois.slug);
    expect(c?.n).toBe(3);
  });

  it('não oferece nada quando não sobrou curso', () => {
    const tudo = allCourses().map(c => c.slug);
    expect(proximoCurso(conta(tudo), FLAGSHIP)).toBeNull();
  });

  it('não decide nada antes de a sessão responder', () => {
    expect(proximoCurso(conta([], false, false), FLAGSHIP)).toBeNull();
  });
});
