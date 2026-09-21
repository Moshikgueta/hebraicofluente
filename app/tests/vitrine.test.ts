/* A vitrine não promete o que o curso não entrega.
 * ─────────────────────────────────────────────────────────────────────────
 * Em 21/09/2026 o site vendia um áudio que não existe. O manifesto estava
 * vazio - zero gravações -, o curso desligava os exercícios de escuta, e o FAQ
 * dizia a verdade sobre isso com duas versões da frase. O resto da landing,
 * não: listava "Áudio gravado por falante nativo" como coisa entregue, punha
 * "escuta" entre os cinco tipos de exercício, e o método tinha um passo
 * "Ouça · O som gravado por falante nativo".
 *
 * No Brasil a oferta vincula (CDC art. 30), então isto não é detalhe de texto:
 * é reembolso que o comprador tem razão em pedir.
 *
 * ── a divisão de trabalho com app/promessas.mjs ───────────────────────────
 * Aquele script lê o HTML PUBLICADO, que é a prova mais forte que existe -
 * contra o artefato, não contra a intenção. Mas o HTML só traz a PRIMEIRA aba
 * da demonstração: as outras quatro aparecem ao clicar, e o ensaio do script
 * mostrou exatamente esse furo.
 *
 * Então este teste cobre o que o HTML não alcança - o texto das cinco abas e
 * dos passos do método - lendo os mesmos arrays que a página renderiza.
 *
 * Por que não bastou olhar o pacote de JavaScript: porque `audioAvailable()` é
 * uma chamada de função sobre um array importado, e o empacotador não dobra
 * isso. Os DOIS lados de cada `TEM_AUDIO ? a : b` sobrevivem no arquivo final,
 * inclusive a frase que não vale. Tentei trocar por um booleano literal gerado
 * e o empacotador também não dobrou. Uma string morta no JavaScript minificado
 * não é oferta - ninguém a vê -, mas um verificador que não consegue distinguir
 * morta de viva é um verificador que alguém desliga. Daí a divisão: o script
 * prova o que RENDERIZA, este teste prova o que a interação pode mostrar.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ABAS, MAQUETE, PASSOS, TEM_AUDIO } from '@/components/landing/copy';

/* Trechos que só podem estar no ar quando existe gravação. */
const PROMESSAS = [
  'gravado por falante nativo',
  'gravada por falante nativo',
  'áudio',
  'escuta',
  'Ouça',
  'ouviu'
];

/** Todo texto que a demonstração e o método mostram, numa lista só. */
const textos = (): string[] => [
  ...ABAS.flatMap(a => [a.label, a.kicker, a.title, a.body, ...a.points]),
  ...PASSOS.flatMap(p => [p[0], p[1]])
];

describe('a landing e o áudio dizem a mesma coisa', () => {
  it('não promete gravação quando não há nenhuma', () => {
    if (TEM_AUDIO) return;
    const promete = textos().filter(t =>
      PROMESSAS.some(p => t.toLowerCase().includes(p.toLowerCase())));
    expect(promete).toEqual([]);
  });

  it('conta os tipos de exercício, em vez de chutar', () => {
    /* Cinco categorias com gravação (múltipla escolha, digitação, associação,
       escuta, leitura), quatro sem - a escuta é a única que o curso desliga.
       Anunciar cinco e entregar quatro é o mesmo erro, de tamanho menor. */
    const pratica = ABAS.find(a => a.label === 'Prática');
    expect(pratica).toBeDefined();
    expect(pratica!.title).toContain(TEM_AUDIO ? 'Cinco' : 'Quatro');
  });

  it('desenha uma maquete de exercício que existe hoje', () => {
    /* As duas telas que MOSTRAM um exercício em vez de descrevê-lo. Sem
       gravação, a de escuta não existe no curso - então a maquete vira a de
       reconhecimento, que faz a pergunta ao contrário e é o que o aluno
       encontra de verdade. */
    expect(MAQUETE.praticaRotulo).toBe(TEM_AUDIO ? 'Escuta' : 'Reconhecer');
    if (!TEM_AUDIO) {
      expect(MAQUETE.praticaPergunta).not.toMatch(/ouviu|áudio|escut/i);
      expect(MAQUETE.heroiPergunta).not.toMatch(/ouviu|áudio|escut/i);
    }
  });

  it('mantém o método com um passo por coisa que o curso faz', () => {
    /* Seis passos com gravação, cinco sem: o "Ouça" não tem como existir com o
       manifesto vazio. */
    expect(PASSOS).toHaveLength(TEM_AUDIO ? 6 : 5);
    expect(PASSOS.map(p => p[0])).toContain('Associe');
  });

  it('volta a prometer sozinha no dia em que a gravação entrar', () => {
    /* O que garante isso é a forma: cada frase tem duas versões e quem escolhe
       é o manifesto. Se alguém trocar o condicional por texto fixo, este teste
       continua passando hoje e falha no dia da gravação - que é tarde. Então a
       verificação é de FORMA: o arquivo tem de consultar o manifesto. */
    const fonte = readFileSync(
      new URL('../src/components/landing/copy.ts', import.meta.url), 'utf8');
    expect(fonte).toContain("from '@/lib/audio-manifest'");
    expect(fonte.match(/TEM_AUDIO/g)?.length ?? 0).toBeGreaterThan(6);
  });
});
