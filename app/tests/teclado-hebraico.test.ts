/* O teclado hebraico da tela (lib/teclado-hebraico.ts). */
import { describe, expect, it } from 'vitest';
import { FINAIS, LETRAS, NIKUD, apagar, inserir } from '@/lib/teclado-hebraico';
import { hebraicoDigitadoCerto } from '@/lib/engine/palavras';

describe('o teclado hebraico da tela', () => {
  it('tem as 22 letras, as 5 finais e os sinais que o curso ensina', () => {
    expect(LETRAS.map(t => t.ch).join(' ')).toBe('א ב ג ד ה ו ז ח ט י כ ל מ נ ס ע פ צ ק ר ש ת');
    expect(FINAIS.map(t => t.ch).join(' ')).toBe('ך ם ן ף ץ');
    for (const s of ['ַ', 'ָ', 'ֶ', 'ֵ', 'ִ', 'ֹ', 'ֻ', 'ְ', 'ּ', 'ׁ', 'ׂ']) {
      expect(NIKUD.some(t => t.ch === s)).toBe(true);
    }
    /* Todo botão tem nome para o leitor de tela. */
    for (const t of [...LETRAS, ...FINAIS, ...NIKUD]) expect(t.nome.length).toBeGreaterThan(1);
  });

  it('escreve na posição do cursor, e não só no fim', () => {
    let e = inserir('', { ini: 0, fim: 0 }, 'ש');
    e = inserir(e.valor, { ini: e.cursor, fim: e.cursor }, 'ם');
    /* Volta o cursor para depois do ש e põe o ל no meio. */
    e = inserir(e.valor, { ini: 1, fim: 1 }, 'ל');
    expect(e).toEqual({ valor: 'שלם', cursor: 2 });
  });

  it('combina letra e nikud: o sinal entra depois da letra', () => {
    let e = inserir('', { ini: 0, fim: 0 }, 'פ');
    e = inserir(e.valor, { ini: e.cursor, fim: e.cursor }, 'ּ');
    e = inserir(e.valor, { ini: e.cursor, fim: e.cursor }, 'ֶ');
    e = inserir(e.valor, { ini: e.cursor, fim: e.cursor }, 'ה');
    expect(e.valor.normalize('NFC')).toBe('פֶּה'.normalize('NFC'));
    expect(hebraicoDigitadoCerto(e.valor, ['פֶּה'])).toBe(true);
  });

  it('com letra final: כסף digitado com ף é aceito', () => {
    let v = '';
    for (const ch of ['כ', 'ס', 'ף']) v = inserir(v, { ini: v.length, fim: v.length }, ch).valor;
    expect(hebraicoDigitadoCerto(v, ['כֶּסֶף'])).toBe(true);
  });

  it('apagar tira um sinal de cada vez, e depois a letra', () => {
    /* פ + daguesh + segol + ה, na ordem em que o teclado os põe. */
    let e = apagar('פ\u05BC\u05B6ה', { ini: 3, fim: 3 });   // tira o segol
    expect(e.valor).toBe('פ\u05BCה');
    e = apagar(e.valor, { ini: e.cursor, fim: e.cursor }); // tira o daguesh
    expect(e.valor).toBe('פה');
    e = apagar(e.valor, { ini: e.cursor, fim: e.cursor }); // tira o פ
    expect(e).toEqual({ valor: 'ה', cursor: 0 });
    expect(apagar('ה', { ini: 0, fim: 0 })).toEqual({ valor: 'ה', cursor: 0 });
  });

  it('com um trecho selecionado, a tecla o substitui e apagar o remove', () => {
    expect(inserir('שלום', { ini: 1, fim: 3 }, 'ב')).toEqual({ valor: 'שבם', cursor: 2 });
    expect(apagar('שלום', { ini: 1, fim: 3 })).toEqual({ valor: 'שם', cursor: 1 });
  });

  it('um cursor fora do texto não quebra nada', () => {
    expect(inserir('אב', { ini: 9, fim: 9 }, 'ג')).toEqual({ valor: 'אבג', cursor: 3 });
  });
});
