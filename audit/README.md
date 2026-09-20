# Correção do pagamento - APLICADA em 20/09/2026

Esta pasta é a metade da auditoria de segurança de 20/09/2026 que mexe em
regra de pagamento e de acesso, e que por isso NÃO foi publicada sozinha.
A regra combinada foi: o que é seguro consertar, consertado; o que muda como
o dinheiro vira acesso, explicado primeiro e aplicado depois de uma decisão.
A decisão veio no mesmo dia, e a correção está no código: o patch que vivia
aqui foi aplicado e apagado (está no histórico do git), e os testes que o
provavam moram agora em `app/tests/pagamento.test.ts`, na suíte normal - um
deles falhando é uma regressão em quem recebe o curso. O que segue é o
registro do que mudou e do que conferir em produção.
O relatório inteiro está em `../SECURITY-AUDIT.md`.

## O que a proposta corrige

Cinco defeitos, todos confirmados contra o código real por mais de um agente
independente, todos reproduzidos em `pagamento.test.ts`:

1. **Um PIX visto pendente nunca é liberado.** `payment_events.event_id` é o
   id do pagamento, e a primeira vez que o sistema vê um pagamento - a tela
   do checkout consultando três segundos depois de o QR aparecer - gasta a
   única vaga dele. A aprovação que chega depois bate no UNIQUE e é
   descartada. A varredura ainda conta isso como "liberado". Com PIX
   habilitado na Mercado Pago, é todo PIX pago. A chave passa a ser
   `pagamento:estado`, e a trava contra liberar duas vezes é o status do
   pedido, que sempre esteve lá.
2. **Estorno e chargeback não fecham o acesso.** Depois de pago, um
   `refunded` ou `charged_back` não fazia nada - nem revogava, nem marcava,
   nem registrava. Passa a revogar, marcar o pedido `refunded` e registrar
   `estorno` na trilha.
3. **Uma liberação que cai no meio fica presa para sempre.** O pedido era
   marcado `paid` ANTES de o direito ser gravado; se o banco caísse entre os
   dois, todo reenvio parava em "já está pago". O direito passa a ser gravado
   primeiro e o pedido depois; um `await` que faltava faz a falha ser pega e
   registrada; o webhook responde 500 para falha NOSSA (a Mercado Pago
   reenvia) e 200 para pagamento que não é nosso (ela para).
4. **Não dava para renovar antes de vencer.** O botão "Renovar acesso"
   aparece nos últimos 30 dias e levava a um checkout que respondia 409. Um
   pedido novo passa a ser aceito nos últimos 45 dias, com o código
   `already-owned` (e a frase certa) fora deles. `grantAccess` já estendia a
   partir do vencimento, então pagar cedo não perde dia nenhum.
5. **Sair não invalidava o cookie.** Só o navegador esquecia; o valor
   continuava válido por sete dias para quem o tivesse copiado. Sair passa a
   subir `session_version`, em todos os aparelhos. É uma decisão de produto
   embutida: sair num aparelho derruba os outros. A alternativa (uma tabela de
   sessões, para derrubar só a atual) é mais código do que esta proposta
   inteira; se preferir manter "sair só aqui", tire o `bumpSessionVersion` do
   `logout` e o teste do bloco 5.

E quatro que a verificação independente encontrou na PRIMEIRA versão desta
proposta, também reproduzidos (blocos 6 a 9 do teste):

6. **A retomada de uma liberação interrompida dava vinte e quatro meses.** Com
   o direito gravado antes do pedido (item 3), uma queda ENTRE os dois fazia o
   reenvio chamar `grantAccess` de novo - e `grantAccess` estende. Agora, se a
   linha de acesso já aponta para este pedido e ele ainda está pendente, só o
   pedido é marcado.
7. **O estorno de uma renovação apagava tudo.** Quem tinha um mês da compra
   anterior e estornava a renovação perdia também esse mês. `rollbackAccess`
   recua os meses DAQUELE pedido; a linha só some se não sobrar nada.
8. **Estorno parcial passava batido.** Na Mercado Pago um estorno parcial não
   muda o status: o pagamento fica `approved` com `transaction_amount_refunded`
   maior que zero. A regra agora é a mesma do valor a menor: se o que ficou é
   menos do que o curso custa, o curso não está pago, e o acesso fecha.
   **Isto é uma decisão sua:** um "desconto de cortesia" devolvido pelo painel
   fecha o acesso do aluno. Se quiser devolver parte do valor sem fechar,
   libere de novo por Actions → Acesso → liberar depois do estorno.
9. **Um pagamento que a Mercado Pago não conhece virava reenvio eterno.** O
   404 dela (o simulador do painel, um pagamento de outra conta) respondia 500,
   e 500 pede reenvio; cada tentativa gravava uma linha na trilha. Agora o 404
   responde 200, e a trilha de `settle-error` tem teto de vinte por minuto.

## Como foi aplicada

`git apply` do patch, os 16 testes movidos para `app/tests/pagamento.test.ts`,
a suíte inteira (378 testes), o typecheck, o build, a CSP no navegador e a
varredura de páginas, e o deploy com o e2e de produção. Antes de aplicar,
14 dos 16 testes falhavam no código de então - a prova de que os defeitos
existiam.

## O que conferir em produção

- Os pedidos já presos: `SELECT o.id FROM orders o JOIN payment_events e ON
  e.order_id = o.id WHERE o.status <> 'paid' AND e.status = 'pending'`. Cada
  um é um comprador que pode ter pago. Confira no painel da Mercado Pago e
  libere por Actions → Acesso → liberar os que pagaram. As linhas antigas de
  `payment_events` (chave só com o id) não colidem com as novas
  (`id:status`), então o reenvio da Mercado Pago passa a funcionar para eles
  também, se ela ainda reenviar.
- Uma compra de teste real, com a tela aberta: pendente, pagar, ver o acesso
  abrir. É o teste que a publicação não faz de propósito (não cria cobrança
  com token de produção).
- Um estorno de teste no painel: o acesso tem de fechar sozinho e o pedido
  aparecer como `refunded`. Um estorno PARCIAL faz o mesmo (item 8).
- O estorno só fecha a porta quando a Mercado Pago avisa. O webhook dela
  cobre `refunded` e `charged_back` para o mesmo id de pagamento; confira no
  painel (Suas integrações → Webhooks) que o evento `payment` está marcado, e
  faça o teste acima com o webhook ligado. A varredura NÃO revisita pedidos
  pagos, então sem o aviso o estorno continua sendo o `revogar` à mão.
