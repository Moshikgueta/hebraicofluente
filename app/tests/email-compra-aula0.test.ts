/* O e-mail de compra aponta o primeiro passo (05/10/2026, pedido do dono).
 * Ver mensagemDeCompra em worker/src/lib/mail.js.
 *
 *   · na primeira compra, o link de começar é a Aula 0, com o que ela é,
 *     e o painel vem logo abaixo;
 *   · na renovação, quem já estuda volta para o painel, como antes;
 *   · o tempo prometido é o da própria página da Aula 0.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { mensagemDeCompra } from '../../worker/src/lib/mail.js';

const SITE = 'https://hebraicofluente.com.br';
const base = {
  nome: 'Ana', curso: 'Alfabetização', valor: 'R$ 147,00', pedido: 'p1', expiraEm: '05/10/2027',
  link: `${SITE}/meu-hebraico/`, aula0: `${SITE}/inicio/`, marca: 'Hebraico Fluente', suporte: '',
  arrependimentoDias: 7
};

describe('o primeiro passo no e-mail de compra', () => {
  it('na primeira compra, leva à Aula 0 e diz o que ela é', () => {
    const m = mensagemDeCompra(base);
    expect(m.text).toContain('Seu primeiro passo: a Aula 0.');
    expect(m.text).toContain(`Comece por aqui: ${SITE}/inicio/`);
    expect(m.text).not.toContain(`Comece por aqui: ${SITE}/meu-hebraico/`);
    expect(m.text).toContain(`Depois, o curso inteiro fica no seu painel: ${SITE}/meu-hebraico/`);
    expect(m.html).toContain(`<a href="${SITE}/inicio/">Começar pela Aula 0</a>`);
    expect(m.html).not.toContain('Começar o curso');
  });

  it('na renovação, volta para o painel, sem a Aula 0', () => {
    const m = mensagemDeCompra({ ...base, renovacao: true });
    expect(m.text).not.toContain('Aula 0');
    expect(m.text).toContain(`Comece por aqui: ${SITE}/meu-hebraico/`);
    expect(m.html).toContain('Começar o curso');
  });

  it('o tempo prometido é o que a página da Aula 0 promete', () => {
    const pagina = readFileSync(new URL('../src/app/inicio/StartHereClient.tsx', import.meta.url), 'utf8');
    expect(pagina).toContain('Dez minutos de leitura');
    expect(mensagemDeCompra(base).text).toContain('uns dez minutos de leitura');
  });
});
