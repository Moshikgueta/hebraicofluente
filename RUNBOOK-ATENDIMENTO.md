# Atendimento: os casos que se repetem

O passo a passo de cada caso com as ferramentas que existem hoje. Nenhum
passo aqui pede terminal, a não ser onde está escrito `wrangler`.

As ferramentas:

- **Actions → Acesso** (`.github/workflows/acesso.yml`): `consultar`,
  `listar`, `pedido`, `pagamento`, `envios`, `liberar`, `revogar`,
  `trocar-email`. Os e-mails saem mascarados no resumo.
- **/admin/estornos**: os estornos que dependem de você (PIX direto, pedido
  liberado à mão, estorno automático que falhou), com o botão "Já devolvi o
  dinheiro".
- **/admin/depoimentos**: os depoimentos, para aprovar ou recusar.
- **Painel da Mercado Pago**: o pagamento, o estorno total ou parcial.
- **wrangler**, na sua máquina, para consultas que o Actions não faz:
  `npx wrangler d1 execute hebraico-fluente --remote --command "..."`.

O prazo de resposta prometido em todo o site é o de
`atendimento.prazoRespostaUteis` em `data/empresa.json` (hoje, 2 dias
úteis). Dúvida sobre o conteúdo do curso também é respondida, no mesmo prazo
(texto em `DUVIDAS_DE_CONTEUDO`, `app/src/lib/empresa.ts`, aguardando sua
aprovação).

---

## 1. Comprou com outro e-mail

A pessoa pagou numa conta (e-mail B) e quer estudar na outra (e-mail A).
Desde 01/10/2026 existe a ação `mover-compra`, que move o acesso, o pedido
e a desistência (se houver) de uma conta para a outra.

1. Confirme pelo outro canal (WhatsApp ou respondendo do e-mail da compra)
   que as duas contas são da mesma pessoa.
2. Acesso → `consultar` com B: confira o pedido pago e a data de fim.
3. Acesso → `consultar` com A:
   - **A não existe:** Acesso → `trocar-email` (E-mail = B, `novo_email` =
     A). Compra, acesso e progresso continuam juntos. Pronto.
   - **A existe:** Acesso → `mover-compra` (E-mail = B, `novo_email` = A,
     curso). O acesso vai com a mesma data de fim, e o pedido passa a ser de
     A. O progresso não muda de conta: é de quem estudou. Se A já tiver o
     curso, a ação para sem mexer em nada.
4. Responda dizendo com que e-mail entrar.

## 2. Pagou duas vezes

Aparece como `pagamento-duplicado` na trilha (Acesso → `pagamento` ou
`consultar`), com os dois ids da Mercado Pago.

1. O acesso já está certo: vale o primeiro pagamento.
2. No painel da Mercado Pago, estorne o SEGUNDO (o id que vem depois de
   "e de novo por").
3. Não rode `revogar`: o pedido é um só e continua pago.
4. Responda ao aluno: o valor em dobro volta pela mesma forma de pagamento.

Se forem dois PEDIDOS pagos (duas compras), o segundo somou mais 12 meses.
Estorne um deles pela Mercado Pago; o acesso recua os 12 meses daquele
pedido sozinho, quando a Mercado Pago avisa.

## 3. Estorno parcial

Decisão registrada em `audit/README.md`: **estorno parcial fecha o acesso**
do pedido (recua os meses dele), como o total.

1. Antes de fazer um parcial no painel da Mercado Pago, decida se o acesso
   deve fechar. Se NÃO deve (por exemplo, devolução de diferença de preço),
   não use o estorno da Mercado Pago: devolva por fora (PIX) e anote.
2. Se fez o parcial e o acesso fechou sem querer: Acesso → `liberar` com os
   meses que faltavam.
3. Juros do parcelamento: ainda não se sabe se voltam no estorno
   (LEGAL-110). Até a compra real de teste responder, confira no painel o
   valor efetivamente devolvido e complete por fora se faltar.

## 4. Desistência por e-mail

O aluno escreveu pedindo o dinheiro de volta, sem usar o botão.

1. O prazo é contado da liberação do acesso, até o fim do 7º dia (horário de
   Brasília). **Vale a data em que ele escreveu**, não a da sua resposta.
2. Responda em até 2 dias úteis (é o que o site promete) confirmando o
   recebimento, com a data e a hora em que o e-mail chegou.
3. Confira que o pedido do e-mail é o mesmo e-mail da compra (Acesso →
   `consultar`). Se escreveu de outro endereço, peça para confirmar pelo da
   compra.
4. Devolva:
   - pedido da Mercado Pago: estorno total no painel dela. O acesso fecha
     sozinho quando ela avisa;
   - PIX direto ou pedido liberado à mão: devolva por PIX, depois
     /admin/estornos → "Já devolvi o dinheiro" (se o pedido estiver lá) ou
     Acesso → `revogar`.
5. Revogar é obrigatório: devolver o dinheiro NÃO tira o curso.

**Resposta automática (LEGAL-109).** Quem faz é o Worker
(`worker/src/email.js`), não o Gmail: a regra de `contato@` no Email Routing
da Cloudflare é "Send to a Worker" → `hebraico-fluente`. Ele encaminha TUDO
para `CONTATO_DESTINO` (wrangler.toml, hoje languageswithmoshik@gmail.com) e,
quando o assunto fala de reembolso, desistência, estorno, arrependimento,
cancelamento ou devolução, responde na hora ao remetente, com data e hora,
pela Resend. A trilha registra `autoresposta-enviada` / `autoresposta-falhou`.
Assunto sem nenhuma dessas palavras não recebe a confirmação: leia a caixa, e
se o pedido vier assim, confirme à mão o quanto antes.

O filtro do Gmail com "Enviar modelo" NÃO serve: a mensagem chega
encaminhada e o Gmail responde a um endereço técnico (`SRS0=...`) que
ninguém recebe (testado em 01/10/2026). No Gmail fica só o marcador.

## 5. 01/11/2026: o fim do pré-lançamento

O site anuncia "Preço de pré-lançamento até 31/10/2026. Depois, R$ 297"
(`data/courses.json`: `price.preLancamentoAte` e `price.listBrl`). Nada muda
o preço sozinho.

1. Decida ANTES de 31/10: subir para o preço cheio, estender a data ou tirar
   as duas coisas. Estender uma promoção anunciada com data é assunto para o
   advogado (`audit/2026-10-01/PARA-O-ADVOGADO.md`).
2. Para subir: em `data/courses.json`, `price.brl` = 297, `listBrl` = null,
   `preLancamentoAte` = null. Publique.
3. A partir de 21/10 o `check-legal` avisa; a partir de 01/11 ele falha.
4. Mudar o preço muda o texto dos Termos, e com ele a versão do contrato
   (`data/politicas-versoes/`): rode `npm run build:platform` e faça commit
   da cópia fixa nova junto.

## 6. Conta derrubada pelo limite de aparelhos

A conta fica conectada em até 3 aparelhos. No quarto, o mais antigo pede o
login de novo. Nada é bloqueado e nada se perde.

1. Explique isso ao aluno: é só entrar de novo, e o progresso volta.
2. Se ele usa mais de três aparelhos de verdade, sugira sair dos que não usa
   (sair da conta libera todas as vagas).
3. Acesso → `consultar` mostra os aparelhos e os dias com muitas entradas.
   Mais de 6 entradas em 24 h geram um e-mail diário para você. Isso NÃO é
   prova de compartilhamento: antes de qualquer suspensão, os Termos (art. 4)
   pedem aviso por e-mail e 5 dias úteis para a pessoa responder.

---

## A versão do contrato (para qualquer caso que cite os Termos)

Cada pedido guarda em `orders.termos_versao` o código dos Termos que valia na
compra. A cópia fixa fica em `https://hebraicofluente.com.br/termos/v/<código>/`
e em `data/politicas-versoes/termos-<código>.html`. Para ver a de um pedido:

```
npx wrangler d1 execute hebraico-fluente --remote --command \
  "SELECT id, termos_versao FROM orders WHERE id = 'HF-...'"
```

Pedidos anteriores a 01/10/2026 não têm código: para eles vale a data
gravada em `aceites` no cadastro.

**Se uma publicação gerou uma versão que não está no git** (o resumo do
Actions avisa; acontece quando a Mercado Pago responde formas de pagamento
diferentes das de `data/empresa.json`), a cópia fixa só existe naquela
publicação. Para guardá-la: ponha em `pagamento.formas` as mesmas formas que
a publicação usou, rode `npm run build:platform`, faça commit do arquivo novo
em `data/politicas-versoes/` e volte `pagamento.formas` ao que era.
