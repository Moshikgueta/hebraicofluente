# Proposta de correção do pagamento - NÃO aplicada

Esta pasta é a metade da auditoria de segurança de 20/09/2026 que mexe em
regra de pagamento e de acesso, e que por isso NÃO foi publicada sozinha.
A regra combinada foi: o que é seguro consertar, consertado; o que muda como
o dinheiro vira acesso, explicado primeiro e aplicado depois de uma decisão.
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
   subir `session_version`, em todos os aparelhos.

## Como aplicar

```
git apply audit/pagamento-proposto.patch
cd app && npm run proposta        # os 10 testes passam
cd app && npm test                # a suíte inteira continua passando
git commit -am "..." && git push  # publica
```

Sem o patch, `npm run proposta` FALHA em 8 dos 10 testes. É o esperado, e é
a prova de que os defeitos existem hoje.

## O que conferir em produção depois de aplicar

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
  aparecer como `refunded`.
