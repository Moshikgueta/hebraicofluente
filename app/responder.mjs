/* Responder UMA tela de exercício, errando quando dá (23/10/2026).
   ────────────────────────────────────────────────────────────────────────
   Usado por portao.mjs e exame.mjs. Os dois roteiros respondiam cada um do
   seu jeito e pararam no mesmo lugar: o "Monte a palavra" (peças para tocar
   na ordem e depois Conferir), que entrou nos exercícios em 11/10/2026. O
   clique ia sempre na última peça, que depois de usada fica desabilitada, e
   o Playwright esperava 30 s por um botão que nunca mais ia habilitar.

   A regra é a dos roteiros: errar de propósito sempre que a tela deixa (o
   caminho da nota baixa é o que ninguém testa à mão). Onde a tela só fecha
   com a resposta certa (o "Ligue cada"), resolve por tentativa.

   Devolve 'seguiu' (clicou um Continuar), 'respondeu' (uma questão a menos)
   ou 'nada' (não reconheceu a tela: quem chama decide parar). */

/* Os rótulos nos dois idiomas: a build em inglês (NEXT_PUBLIC_LOCALE=en)
   escreve os mesmos botões em inglês (app/src/i18n/telas). */
const SEGUIR = /^(Continuar|Ver resultado|Próxima parte|Começar a parte|Começar|Continue|See result|Start)$/;
const LIGUE = /Ligue cada|Match each/;
const ENVIAR = /^(Responder|Conferir|Verificar|Answer|Check|Verify)$/;
const CONFERIR = /^(Conferir|Check)$/;
const MOSTRAR = /Mostrar a resposta|Show the answer/;

export async function responder(p) {
  const seguir = p.getByRole('button', { name: SEGUIR });
  if (await seguir.count()) { await seguir.first().click(); await p.waitForTimeout(260); return 'seguiu'; }

  /* "Ligue cada X ao seu Y": só fecha com todos os pares certos. O par
     ligado fica com aria-disabled (não `disabled`, para não perder o foco),
     e o resultado aparece embaixo com um Continuar, com o tabuleiro ainda
     na tela. */
  const tabuleiro = p.locator('div.grid-cols-2:has(li button)').last();
  if (await p.getByText(LIGUE).count() && await tabuleiro.count()) {
    const ligado = b => b.getAttribute('aria-disabled').then(v => v === 'true').catch(() => true);
    const esq = tabuleiro.locator('> div').nth(0).locator('li button');
    const dir = tabuleiro.locator('> div').nth(1).locator('li button');
    const n = await esq.count();
    for (let i = 0; i < n; i++) {
      if (await ligado(esq.nth(i))) continue;
      for (let j = 0; j < n; j++) {
        if (await ligado(dir.nth(j))) continue;
        await esq.nth(i).click({ timeout: 4000 }).catch(() => {});
        await p.waitForTimeout(70);
        await dir.nth(j).click({ timeout: 4000 }).catch(() => {});
        await p.waitForTimeout(120);
        if (await ligado(esq.nth(i))) break;
      }
    }
    await p.waitForTimeout(500);
    return (await seguir.count()) || !(await p.getByText(LIGUE).count()) ? 'respondeu' : 'nada';
  }

  /* Campo de escrever (sem `type`, por isso os dois seletores). */
  const campo = p.locator('input:not([type]):visible, input[type="text"]:visible');
  if (await campo.count()) {
    await campo.first().fill('xyz');
    const env = p.getByRole('button', { name: ENVIAR });
    if (await env.count() && await env.first().isEnabled()) {
      await env.first().click({ timeout: 3000 }); await p.waitForTimeout(300); return 'respondeu';
    }
  }

  /* "Monte a palavra": toca as peças livres de trás para frente (a ordem
     errada, quase sempre) até o Conferir habilitar. Errou duas vezes, a tela
     oferece "Mostrar a resposta", que fecha a questão. */
  const conferir = p.getByRole('button', { name: CONFERIR });
  const pecas = p.locator('ul li button:visible:enabled');
  if (await conferir.count() && await pecas.count()) {
    const mostrar = p.getByRole('button', { name: MOSTRAR });
    if (await mostrar.count()) { await mostrar.first().click(); await p.waitForTimeout(300); return 'respondeu'; }
    for (let k = 0; k < 12 && await conferir.first().isDisabled(); k++) {
      const livres = p.locator('ul li button:visible:enabled');
      const n = await livres.count();
      if (!n) break;
      await livres.nth(n - 1).click({ timeout: 3000 }).catch(() => {});
      await p.waitForTimeout(90);
    }
    if (await conferir.first().isEnabled()) {
      await conferir.first().click({ timeout: 3000 });
      await p.waitForTimeout(350);
      return 'respondeu';
    }
    return 'nada';
  }

  /* Escolha: a última alternativa ainda clicável. */
  const ops = p.locator('li button:visible:enabled, [role="listitem"] button:visible:enabled');
  const n = await ops.count();
  if (n) { await ops.nth(n - 1).click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(300); return 'respondeu'; }

  return 'nada';
}
