/* Todo alerta ao dono diz de qual site veio (29/10/2026): o site em inglês
   roda o mesmo código com banco próprio e manda para o mesmo e-mail. */
import { describe, expect, it } from 'vitest';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { comOrigem } from '../../worker/src/alertas.js';
// @ts-expect-error - idem
import { mensagemDeAlerta } from '../../worker/src/lib/mail.js';

describe('a origem do alerta', () => {
  const msg = mensagemDeAlerta({ assunto: 'backup do banco sem cópia nova', linhas: ['x'] });
  it('o assunto e o corpo levam o endereço do site', () => {
    const m = comOrigem({ SITE_ORIGIN: 'https://hebraicofluente.com.br/' }, msg);
    expect(m.subject).toBe('[Hebraico Fluente · hebraicofluente.com.br] backup do banco sem cópia nova');
    expect(m.text).toContain('Enviado por: https://hebraicofluente.com.br');
    expect(m.html).toContain('Enviado por: https://hebraicofluente.com.br');
  });
  it('sem SITE_ORIGIN, sai como antes', () => {
    expect(comOrigem({}, msg)).toEqual(msg);
  });
});
