/* Para onde voltar depois de entrar.
 * ─────────────────────────────────────────────────────────────────────────
 * O `?next=` do login é o único lugar em que uma URL vinda de fora decide
 * para onde o navegador vai depois de uma ação de verdade. É por isso que
 * mora num arquivo só dele, sem React: dá para testar contra a lista inteira
 * de truques sem montar componente nenhum.
 *
 * A regra é curta: só caminho interno. Tudo o mais vira o painel.
 */

const PAINEL = '/meu-hebraico';

export function safeNext(raw: string | null): string {
  if (!raw) return PAINEL;
  /* O analisador de URL do navegador APAGA tabulação e quebra de linha antes
     de resolver o endereço. "/\t/evil.example" passava na regra abaixo com a
     tabulação no lugar do segundo caractere, e virava "//evil.example" na
     hora de navegar - um link no nosso domínio que, depois de um login de
     verdade, entregava a pessoa a outro site. Então primeiro se apaga o que
     o navegador apagaria, e só então se julga. */
  const s = raw.replace(/[\u0000-\u001f\u007f]/g, '');
  /* Uma barra, e a segunda posição não pode ser barra nem contrabarra:
     "//evil.com" e "/\evil.com" são absolutas para o navegador. */
  if (!/^\/[^/\\]/.test(s)) return PAINEL;
  /* E a prova final, pelo mesmo analisador que vai navegar: resolvido contra
     uma origem qualquer, o destino tem de continuar nela. */
  try {
    if (new URL(s, 'https://x.invalid').origin !== 'https://x.invalid') return PAINEL;
  } catch {
    return PAINEL;
  }
  return s;
}
