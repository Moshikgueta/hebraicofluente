/* Um selo quer dizer uma coisa só.
 * ─────────────────────────────────────────────────────────────────────────
 * Esta suíte existe porque a inconsistência que ela impede JÁ ACONTECEU, e
 * ninguém percebeu por semanas: 🇧🇷 marcava dois blocos diferentes - a
 * comparação com o português e a caixa do erro típico -, enquanto ⚠️, 🧠 e
 * 📖 não existiam em lugar nenhum, com o conteúdo de dois deles já escrito
 * nas 22 letras.
 *
 * Nada quebra quando isso acontece. A tela monta, o texto está lá, e o
 * preço é só que o aluno para de confiar no símbolo - que era a única
 * função dele.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { allLetters } from '@/lib/content';
import { EMOJIS_DE_SELO, SELOS } from '@/lib/selos';

describe('os cinco selos', () => {
  it('cada símbolo e cada título aparece uma vez só', () => {
    const emojis = Object.values(SELOS).map(s => s.emoji);
    const titulos = Object.values(SELOS).map(s => s.titulo);
    expect(new Set(emojis).size, 'dois selos com o mesmo símbolo').toBe(emojis.length);
    expect(new Set(titulos).size, 'dois selos com o mesmo título').toBe(titulos.length);
    expect(emojis.length).toBe(5);
  });

  it('e nenhum deles é escrito à mão numa tela', () => {
    /* A regra que mantém a promessa. Um `<span>⚠️ Erro comum</span>` solto
       numa tela nova é como a colisão anterior nasceu: alguém precisou de
       um aviso, achou um emoji razoável, e pronto - dois donos. */
    const raiz = join(__dirname, '..', 'src');
    const arquivos: string[] = [];
    const andar = (dir: string) => {
      for (const nome of readdirSync(dir)) {
        const p = join(dir, nome);
        if (statSync(p).isDirectory()) andar(p);
        else if (/\.tsx?$/.test(p)) arquivos.push(p);
      }
    };
    andar(raiz);

    /* Comentário não é tela, e as notas deste projeto citam os símbolos
       justamente para explicar a regra. Tirar os comentários de VERDADE em
       vez de olhar o começo da linha: um `{/* ⚠️ …` de JSX e a segunda
       linha de um bloco `/* … *​/` não começam com nenhuma marca, e um
       filtro por prefixo os trata como código. */
    const semComentario = (txt: string) =>
      txt.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');

    const fora: string[] = [];
    for (const f of arquivos) {
      if (f.endsWith(join('lib', 'selos.ts'))) continue;
      const linhas = semComentario(readFileSync(f, 'utf8')).split('\n');
      linhas.forEach((linha, i) => {
        for (const e of EMOJIS_DE_SELO) {
          if (linha.includes(e)) {
            fora.push(`${f.split('/src/')[1]}:${i + 1} ${linha.trim().slice(0, 60)}`);
          }
        }
      });
    }
    expect(fora, 'selo escrito à mão - use <TituloComSelo>').toEqual([]);
  });
});

describe('a dica de leitura', () => {
  const comDica = allLetters().filter(l => l.ensino.dicaLeitura);

  it('existe onde há um padrão de leitura de verdade', () => {
    /* O {{ה}} do fim e o {{וֹ}} do vav. Se um dia sobrar zero, o bloco
       virou código morto e o selo 💡 deixou de existir na prática. */
    expect(comDica.length).toBeGreaterThanOrEqual(2);
  });

  it('e todo exemplo dela é legível com as letras já ensinadas', () => {
    /* O validador cobra isso na FONTE; aqui se cobra no que o exportador
       de fato entregou - um campo pode existir no JSON e não estar na
       lista do exportador, e aí some sem ninguém ver. */
    const letras = allLetters();
    const ordemDe = new Map<string, number>();
    for (const l of letras) {
      ordemDe.set(l.letter, l.order);
      if (l.finalForm) ordemDe.set(l.finalForm, l.order);
    }
    const fora: string[] = [];
    for (const l of comDica) {
      for (const ex of l.ensino.dicaLeitura!.exemplos) {
        /* O ו de וֹ/וּ é sinal de vogal, não a consoante - mesma exceção
           da regra de ordem no validador. */
        for (const c of [...ex.he.replace(/ו[ֹּ]/g, '')]) {
          const o = ordemDe.get(c);
          if (o !== undefined && o > l.order) fora.push(`${l.id}: "${ex.he}" usa "${c}"`);
        }
      }
    }
    expect(fora).toEqual([]);
  });

  it('e nunca é apresentada como lei', () => {
    /* A ressalva é o bloco inteiro: sem ela, "{{ה}} no fim é sempre A"
       é o que fica, e é falso. */
    for (const l of comDica) {
      expect(l.ensino.dicaLeitura!.notaPt.length, l.id).toBeGreaterThan(40);
      expect(l.ensino.dicaLeitura!.passos.length, l.id).toBeGreaterThanOrEqual(3);
      expect(l.ensino.dicaLeitura!.exemplos.length, l.id).toBeGreaterThanOrEqual(2);
    }
  });
});
