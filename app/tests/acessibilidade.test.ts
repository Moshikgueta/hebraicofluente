/* As preferências de acessibilidade.
 * ─────────────────────────────────────────────────────────────────────────
 * Há DOIS caminhos que carimbam os mesmos atributos no <html>: o script que
 * roda antes da primeira pintura, escrito como string, e o React, depois que
 * monta. Duas implementações da mesma regra é uma divergência esperando
 * acontecer - e a divergência aqui não quebra nada visivelmente: ela só faz
 * o alto contraste piscar na troca de página, que é o defeito que o script
 * existe para evitar.
 *
 * Então o caso principal deste arquivo EXECUTA a string, com um localStorage
 * e um documento de mentira, e compara o resultado com o do caminho do
 * React. Os dois têm de chegar exatamente aos mesmos atributos.
 */

import { describe, expect, it } from 'vitest';
import {
  ATRIBUTOS, CHAVE, PADRAO, SCRIPT_DE_ARRANQUE, TAMANHOS,
  aplicar, normalizar, type Prefs
} from '@/lib/acessibilidade';

/** Um <html> de mentira: só o que `aplicar` e o script usam. */
function elementoFalso() {
  const attrs = new Map<string, string>();
  return {
    setAttribute: (k: string, v: string) => { attrs.set(k, v); },
    removeAttribute: (k: string) => { attrs.delete(k); },
    getAttribute: (k: string) => attrs.get(k) ?? null,
    mapa: () => Object.fromEntries(attrs)
  };
}

/** Roda o script de arranque como o navegador rodaria, com o que estiver
 *  guardado - inclusive lixo. */
function rodarArranque(guardado: string | null) {
  const el = elementoFalso();
  const localStorage = { getItem: (k: string) => (k === CHAVE ? guardado : null) };
  const document = { documentElement: el };
  new Function('localStorage', 'document', SCRIPT_DE_ARRANQUE)(localStorage, document);
  return el.mapa();
}

function viaReact(p: Prefs) {
  const el = elementoFalso();
  aplicar(p, el as unknown as HTMLElement);
  return el.mapa();
}

describe('os dois caminhos carimbam a mesma coisa', () => {
  const CASOS: Prefs[] = [
    { ...PADRAO },
    { texto: 150, contraste: true, movimento: true, links: true, espaco: true },
    { texto: 115, contraste: true, movimento: false, links: false, espaco: false },
    { texto: 100, contraste: false, movimento: true, links: false, espaco: true },
    { texto: 130, contraste: false, movimento: false, links: true, espaco: false }
  ];

  for (const caso of CASOS) {
    it(`texto ${caso.texto}, contraste ${caso.contraste}, espaço ${caso.espaco}`, () => {
      expect(rodarArranque(JSON.stringify(caso))).toEqual(viaReact(caso));
    });
  }

  it('o tamanho normal não deixa atributo nenhum', () => {
    /* `data-a11y-texto="100"` faria a regra de zoom existir para todo mundo,
       e `zoom: 1` num contêiner cria contexto de empilhamento - o suficiente
       para mudar como um `position: fixed` lá dentro se comporta. O padrão
       tem de ser a AUSÊNCIA do atributo, nos dois caminhos. */
    expect(viaReact(PADRAO)).toEqual({});
    expect(rodarArranque(JSON.stringify(PADRAO))).toEqual({});
  });

  it('desligar uma preferência apaga o atributo', () => {
    const el = elementoFalso();
    aplicar({ ...PADRAO, contraste: true, texto: 130 }, el as unknown as HTMLElement);
    expect(el.getAttribute(ATRIBUTOS.contraste)).toBe('alto');
    /* Aplicar de novo com a preferência desligada tem de LIMPAR. Um `aplicar`
       que só acrescenta deixa o contraste ligado para sempre - e a pessoa
       conclui que o botão não funciona. */
    aplicar(PADRAO, el as unknown as HTMLElement);
    expect(el.mapa()).toEqual({});
  });
});

describe('o que estava guardado pode ser qualquer coisa', () => {
  it('lixo vira o padrão em vez de derrubar a página', () => {
    for (const cru of ['', 'nada disso', '[]', 'null', '{"texto":"enorme"}', '{"texto":999}']) {
      expect(() => rodarArranque(cru)).not.toThrow();
    }
    expect(normalizar(JSON.parse('{"texto":999}'))).toEqual(PADRAO);
    expect(normalizar(undefined)).toEqual(PADRAO);
    expect(normalizar('texto')).toEqual(PADRAO);
  });

  it('um campo novo não apaga as preferências antigas', () => {
    /* O caso da versão seguinte deste arquivo: quem tinha contraste alto não
       pode perdê-lo porque uma preferência nova entrou na lista. */
    const velho = { texto: 130, contraste: true };
    expect(normalizar(velho)).toEqual({
      texto: 130, contraste: true, movimento: false, links: false, espaco: false
    });
  });

  it('só aceita os tamanhos que o CSS conhece', () => {
    /* Um `data-a11y-texto="200"` não casa com regra nenhuma: o atributo
       ficaria lá, a página não mudaria, e o painel mostraria um estado que a
       tela não reflete. Os valores aceitos são exatamente os do CSS. */
    for (const t of TAMANHOS) expect(normalizar({ texto: t }).texto).toBe(t);
    expect(normalizar({ texto: 200 }).texto).toBe(100);
    expect(normalizar({ texto: 0 }).texto).toBe(100);
  });
});
