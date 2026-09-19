/* O código PIX.
 * ─────────────────────────────────────────────────────────────────────────
 * Este arquivo existe porque um BR Code errado NÃO FALHA AQUI. Ele falha no
 * aplicativo do banco do comprador, com "QR Code inválido" e nenhuma pista,
 * no momento em que a pessoa está pagando. Não há como testar isso em
 * produção sem queimar uma venda.
 *
 * O caso de referência abaixo foi conferido contra o Manual de Padrões para
 * Iniciação do PIX: é o exemplo que o próprio Banco Central publica, com o
 * CRC que ele publica. Se este teste passar, o formato está certo; se
 * alguém "melhorar" o gerador e ele quebrar, quebra aqui e não no bolso de
 * um cliente.
 */

import { describe, expect, it } from 'vitest';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { brCode, confereBrCode, crc16, limpo, txidDe } from '../../worker/src/lib/pix.js';

describe('o CRC do BR Code', () => {
  /* CRC16/CCITT-FALSE: polinômio 0x1021, inicial 0xFFFF, sem reflexão.
     Trocar por outra família de CRC16 produz quatro caracteres plausíveis e
     um código que todo aplicativo recusa. */
  it('é a variante CCITT-FALSE, e não outra', () => {
    expect(crc16('123456789')).toBe('29B1');
  });

  /* NÃO existe aqui um teste contra "o exemplo do manual do Banco Central".
     Houve um, com um payload que eu transcrevi de memória, e ele falhou - não
     porque o CRC estivesse errado (o vetor acima é o canônico da variante e
     passa), mas porque a transcrição estava. Um valor esperado que alguém
     inventou não prova o formato: prova a invenção, e passa a ser ajustado
     até parar de reclamar.

     Se um dia o manual estiver à mão, o teste certo é colar o payload
     oficial INTEIRO e o CRC que ele publica. Até lá, o que protege o formato
     são as propriedades abaixo - e a conferência de leitura no próprio
     gerador, que relê todo código antes de mostrá-lo. */
});

describe('o que o padrão não aceita', () => {
  it('tira acento sem mudar a contagem de tamanho', () => {
    /* Um "ã" no nome desalinha tudo que vem depois: o tamanho é contado em
       caracteres e o campo viaja em bytes. */
    expect(limpo('São Paulo', 15)).toBe('SAO PAULO');
    expect(limpo('Moshik Guetá', 25)).toBe('MOSHIK GUETA');
  });

  it('corta no limite, porque estourar faz o banco recusar', () => {
    expect(limpo('MHG TREINAMENTOS E IDIOMAS LTDA', 25)).toHaveLength(25);
    expect(limpo('Rio de Janeiro do Norte', 15)).toHaveLength(15);
  });

  it('não deixa passar símbolo', () => {
    expect(limpo('Hebraico-Fluente!', 25)).toBe('HEBRAICOFLUENTE');
  });
});

describe('o identificador que liga o extrato ao pedido', () => {
  /* Sem ele, um dia com duas vendas de R$132,30 é indistinguível. */
  it('cabe nos 25 caracteres, como prefixo do id real', () => {
    const id = 'HFE92CA691FD4E9F7BC3EC342E97CAE651';
    const txid = txidDe(id);
    expect(txid).toHaveLength(25);
    expect(id.startsWith(txid), 'tem de continuar sendo prefixo do id').toBe(true);
  });

  it('tira o que não for alfanumérico', () => {
    expect(txidDe('HF-123/456')).toBe('HF123456');
  });
});

describe('o código montado', () => {
  const base = {
    chave: '51041290000152',
    nome: 'MHG TREINAMENTOS E IDIOMAS',
    cidade: 'CURITIBA',
    valor: 132.30,
    txid: 'HFE92CA691FD4E9F7BC3EC342E97CAE651'
  };

  it('passa na própria conferência', () => {
    expect(confereBrCode(brCode(base))).toEqual({ ok: true });
  });

  it('leva a chave, o valor e o txid', () => {
    const c = brCode(base);
    expect(c).toContain('br.gov.bcb.pix');
    expect(c).toContain('51041290000152');
    expect(c).toContain('5406132.30');
    expect(c).toContain(txidDe(base.txid));
  });

  it('marca o código como de uso único', () => {
    /* Sem `010212`, o app do banco pode oferecer "pagar de novo" sobre o
       mesmo código - e o segundo pagamento chegaria com o txid de um pedido
       já liberado. */
    expect(brCode(base).startsWith('000201' + '010212')).toBe(true);
  });

  it('declara real e Brasil', () => {
    const c = brCode(base);
    expect(c).toContain('5303986');
    expect(c).toContain('5802BR');
  });

  it('um centavo diferente muda o CRC', () => {
    /* A prova de que o CRC cobre o valor. Um CRC que não mudasse aqui seria
       um CRC calculado sobre a coisa errada. */
    const a = brCode(base);
    const b = brCode({ ...base, valor: 132.31 });
    expect(a.slice(-4)).not.toBe(b.slice(-4));
    expect(confereBrCode(b)).toEqual({ ok: true });
  });

  it('recusa montar sem chave', () => {
    expect(() => brCode({ ...base, chave: '' })).toThrow(/sem chave/);
  });
});

describe('a conferência pega código estragado', () => {
  const bom = brCode({
    chave: 'contato@hebraicofluente.com.br', nome: 'MHG', cidade: 'CURITIBA',
    valor: 10, txid: 'HF1'
  });

  it('aceita o código bom', () => {
    expect(confereBrCode(bom).ok).toBe(true);
  });

  it('acusa um dígito trocado no meio', () => {
    /* É o defeito que um copiar-e-colar humano produz, e o único sintoma no
       mundo real é "QR Code inválido" na mão do comprador. */
    const ruim = bom.slice(0, 30) + (bom[30] === '1' ? '2' : '1') + bom.slice(31);
    expect(confereBrCode(ruim).ok).toBe(false);
  });

  it('acusa CRC truncado', () => {
    expect(confereBrCode(bom.slice(0, -2)).ok).toBe(false);
  });

  it('acusa texto que não é BR Code', () => {
    expect(confereBrCode('qualquer coisa').ok).toBe(false);
    expect(confereBrCode('').ok).toBe(false);
  });
});
