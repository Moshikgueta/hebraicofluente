/* Os cartões ilustrados (05/11/2026): as cenas dos jogos só desenham letras
 * que o aluno já aprendeu (components/ilustra/CenaDoJogo.tsx). */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CenaDoJogo, type JogoIlustrado } from '@/components/ilustra/CenaDoJogo';

const JOGOS: JogoIlustrado[] = ['caca', 'batalha', 'cursiva', 'match', 'blast', 'teste'];
const letrasHebraicas = (html: string) => new Set([...html].filter(c => /[א-ת]/u.test(c)));

describe('cena do jogo', () => {
  it('com uma letra só, nenhuma outra aparece', () => {
    for (const j of JOGOS) {
      const vistas = letrasHebraicas(renderToStaticMarkup(<CenaDoJogo jogo={j} letras={['א']} />));
      expect([...vistas].every(c => c === 'א'), j).toBe(true);
    }
  });
  it('só aparecem letras da lista do aluno', () => {
    const minhas = ['א', 'מ', 'ת'];
    for (const j of JOGOS) {
      const vistas = letrasHebraicas(renderToStaticMarkup(<CenaDoJogo jogo={j} letras={minhas} />));
      for (const c of vistas) expect(minhas, `${j}: ${c}`).toContain(c);
    }
  });
  it('a cena é decorativa para o leitor de tela', () => {
    for (const j of JOGOS) expect(renderToStaticMarkup(<CenaDoJogo jogo={j} letras={['א']} />)).toContain('aria-hidden="true"');
  });
});
