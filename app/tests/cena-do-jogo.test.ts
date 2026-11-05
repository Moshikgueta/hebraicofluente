/* Os cartões ilustrados (05/11/2026): as cenas dos jogos e os símbolos dos
 * assuntos só desenham letras que o aluno já aprendeu
 * (components/ilustra/CenaDoJogo.tsx). */
import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CenaDoJogo, simboloComLetrasDoAluno, type JogoIlustrado } from '@/components/ilustra/CenaDoJogo';

const JOGOS: JogoIlustrado[] = ['caca', 'batalha', 'cursiva', 'match', 'blast', 'teste'];
const cena = (jogo: JogoIlustrado, letras: string[]) => renderToStaticMarkup(createElement(CenaDoJogo, { jogo, letras }));
const letrasHebraicas = (html: string) => new Set([...html].filter(c => /[א-ת]/u.test(c)));

describe('cena do jogo', () => {
  it('com uma letra só, nenhuma outra aparece', () => {
    for (const j of JOGOS) expect([...letrasHebraicas(cena(j, ['א']))].every(c => c === 'א'), j).toBe(true);
  });
  it('só aparecem letras da lista do aluno', () => {
    const minhas = ['א', 'מ', 'ת'];
    for (const j of JOGOS) for (const c of letrasHebraicas(cena(j, minhas))) expect(minhas, `${j}: ${c}`).toContain(c);
  });
  it('a cena é decorativa para o leitor de tela', () => {
    for (const j of JOGOS) expect(cena(j, ['א'])).toContain('aria-hidden="true"');
  });
});

describe('símbolo do assunto', () => {
  it('troca a consoante ainda não ensinada pela primeira letra do aluno, e mantém a vogal', () => {
    expect(simboloComLetrasDoAluno('מַ', ['א'])).toBe('אַ');
    expect(simboloComLetrasDoAluno('מַ', ['א', 'מ'])).toBe('מַ');
    expect(simboloComLetrasDoAluno('ָ', ['א'])).toBe('ָ');
    expect(simboloComLetrasDoAluno('◉', ['א'])).toBe('◉');
  });
});
