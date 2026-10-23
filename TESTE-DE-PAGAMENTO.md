# Testar os três pagamentos no modo de teste da Mercado Pago

Roteiro para o dono (23/10/2026). Prova, antes de abrir a venda do Israel Além
do Óbvio e do combo, que cada opção cobra o preço certo e libera o que deve.
Roda na sua máquina: a publicação recusa token de teste em produção (um
`MP_ACCESS_TOKEN` com `TEST-` faz `scripts/pagamento-ativo.mjs` parar antes do
build), de propósito.

O que já está provado sem você, nos testes automáticos (`app/tests/ebook-produto.test.ts`,
"os três fluxos"), contra uma Mercado Pago simulada e o banco com o schema de
produção: o preço de cada opção, o valor do navegador ignorado, o combo pago a
menos sem liberar, pendente e recusado sem liberar, aviso sem assinatura
recusado e aviso repetido concedendo uma vez só. O que falta é a Mercado Pago
de verdade, no modo de teste.

## 1. Preparar

1. No painel da Mercado Pago (Suas integrações → a aplicação → Credenciais),
   copie o **Access Token de teste** (começa com `TEST-`).
2. Em Suas integrações → **Contas de teste**, crie (ou use) um **comprador de
   teste**. Os pagamentos de teste só funcionam com ele, nunca com a sua conta.
3. Na pasta do projeto:

   ```bash
   cp .env.example .dev.vars
   # em .dev.vars: SESSION_SECRET=qualquer-coisa e MP_ACCESS_TOKEN=TEST-...
   npm run db:init:local
   ```

4. Ligue a venda **só na sua cópia** (não faça commit): em `data/courses.json`,
   apague a linha `"aVenda": false,` do `israel-alem-do-roteiro` e do
   `alfabetizacao-e-israel`.
5. Monte e suba:

   ```bash
   npm run build:platform
   npx wrangler dev --local --port 8787
   ```

## 2. As três compras

Para cada uma, use uma conta nova no site (e-mails diferentes) e pague com o
comprador de teste:

| Opção | Endereço | Cartão | PIX (10% a menos) |
|---|---|---:|---:|
| Alfabetização em Hebraico | `http://localhost:8787/checkout/alfabetizacao/` | R$ 147 | R$ 132,30 |
| Israel Além do Óbvio | `http://localhost:8787/checkout/israel-alem-do-roteiro/` | R$ 197 | R$ 177,30 |
| Combo Descubra Israel + Aprenda Hebraico | `http://localhost:8787/checkout/alfabetizacao-e-israel/` | R$ 297 | R$ 267,30 |

Em cada uma, confira:

- [ ] O valor na tela da Mercado Pago é o da tabela.
- [ ] Com o cartão de teste aprovado (nome do titular `APRO`), o acesso aparece
      em `http://localhost:8787/minha-biblioteca/` sem você fazer nada.
- [ ] No combo, aparecem **os dois**: o curso e o Israel Além do Óbvio.
- [ ] Com o titular `OTHE` (recusado), nada é liberado e o checkout diz que não passou.
- [ ] Voltar da Mercado Pago sem pagar não libera nada.

Os nomes de titular que forçam cada resultado estão na documentação da Mercado
Pago ("Cartões de teste"). No modo local o webhook não chega até a sua
máquina; quem confirma é a volta do comprador (`/api/pay/verify`) e a
varredura de 5 em 5 minutos, que consultam a Mercado Pago. O webhook com
assinatura já é testado nos testes automáticos e é conferido em produção.

## 3. Estorno

- [ ] Em Sua conta → Compras, use "Desistir da compra" no combo. O estorno é
      pedido à Mercado Pago na hora; quando ela confirma, **os dois** acessos
      fecham.

## 4. Depois

Desfaça a mudança do passo 1.4 (`git checkout data/courses.json`). Abrir a
venda de verdade é outra decisão: tirar as duas linhas `aVenda`, subir
`politicas.atualizadoEm` em `data/empresa.json` e publicar, depois do contador
e do advogado (CLAUDE.md, "E-book").
