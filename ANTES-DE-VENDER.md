# Antes de vender

A lista do que falta para a primeira venda de verdade, em ordem de quem
atrapalha mais. Saiu da auditoria de 20/09/2026 (`SECURITY-AUDIT.md`), do que
os testes não alcançam (conta da Mercado Pago, painel da Cloudflare, ajustes
de texto) e do que a lei brasileira pede de quem vende pela internet.

Cada item diz **o que é**, **por que importa**, **como fazer** e **como saber
que ficou pronto**. Os que dependem só de código eu faço; os que dependem de
uma conta sua, só você.

O que já está resolvido não está aqui. O portão, os cabeçalhos, os freios, a
liberação de acesso, o estorno, a CSRF, os vazamentos de dado pessoal: tudo
fechado, testado (378 testes) e no ar.

---

## Bloco 1 - sem isto não dá para vender

### 1. Despublicar a cópia do GitHub Pages

**O que é.** `moshikgueta.github.io/hebraicofluente` tem o curso inteiro no
modo de demonstração: conta no próprio navegador, checkout que se aprova
sozinho em três segundos e libera doze meses.

**Por que importa.** É o produto inteiro de graça, num endereço indexável.
Qualquer pessoa que encontre o link nunca vai precisar pagar.

**Como fazer. SÓ VOCÊ CONSEGUE.** Tentei daqui e não dá: a API de Pages do
GitHub é barrada para mim, e nenhum outro caminho despublica um site que já
está de pé. São dois cliques:

> GitHub → o repositório → **Settings** → **Pages** → role até o fim →
> **Unpublish site** → confirmar.

Se não aparecer o botão, a fonte do site está em "GitHub Actions": troque
**Source** para **Deploy from a branch** → **None**, salve, e o botão aparece.

A publicação automática já foi desligada (o `deploy-app.yml` só roda à mão,
e o `nextjs.yml` duplicado foi removido), então nada vai republicar sozinho.
O que resta é o site que ficou de pé.

**Pronto quando.** `moshikgueta.github.io/hebraicofluente` responde 404. Me
avise quando fizer e eu confiro o que dá para conferir daqui.

### 2. Fechar o que os logs públicos já mostraram - FEITO em 20/09/2026

**As catorze execuções foram apagadas** (a execução inteira, não só o arquivo
de log: o e-mail aparecia no RESUMO da execução, e apagar só os logs deixaria
o resumo de pé). `Actions → Acesso` está vazio. As execuções de publicação
continuam lá e foram conferidas: só carregam o endereço sintético
`hf-e2e-…@example.invalid`, que é criado e apagado pela própria publicação.

Continua valendo decidir se o repositório fica público: nada de cliente sai
mais nos resumos, mas o código, os segredos que NÃO estão nele e a estrutura
do banco são legíveis por qualquer pessoa. Isso é escolha, não risco aberto.

O que era o problema:

**O que é.** O repositório é público, e o resumo de cada execução do Actions
também. Catorze execuções antigas da ação `Acesso` escreveram e-mails de
clientes nesses resumos.

**Por que importa.** Dado pessoal de cliente num endereço público é assunto de
LGPD, não só de segurança. As execuções novas já saem mascaradas.

**Como fazer.** Dois caminhos, escolha um: tornar o repositório privado
(Settings → General → Danger Zone → Change visibility), que fecha tudo de uma
vez; ou apagar os logs das catorze execuções (Actions → Acesso → cada execução
→ os três pontinhos → Delete logs). Eu apago se você pedir.

**Pronto quando.** Abrir uma execução antiga de `Acesso` numa janela anônima e
não ver nenhum endereço de e-mail.

### 3. Habilitar o PIX na Mercado Pago

**O que é.** A conta hoje tem cartão habilitado e **PIX não**. O checkout
oferece PIX primeiro.

**Por que importa.** O caminho de compra que a maioria vai escolher falha com
"o problema é nosso", e você nem fica sabendo: não vira pedido, não vira
chamado, vira gente que desiste.

**Como fazer.** Mercado Pago → Seu negócio → Meios de pagamento → habilitar
PIX (pede a chave e a conta bancária de recebimento).

**Pronto quando.** O item 6 abaixo (compra de teste) passar com PIX.

### 4. Apontar o webhook da Mercado Pago para produção

**O que é.** O aviso que a Mercado Pago manda quando um pagamento muda de
estado.

**Por que importa.** É por ele que o acesso abre em segundos depois do
pagamento, e é **o único** caminho pelo qual um estorno fecha o acesso. A
varredura de cinco em cinco minutos cobre o pagamento que não avisou, mas ela
não revisita pedido já pago: sem webhook, todo estorno volta a ser revogação
na mão.

**Como fazer.** Mercado Pago → Suas integrações → a aplicação → Webhooks →
URL `https://hebraicofluente.com.br/api/pay/webhook`, evento **Pagamentos**
(`payment`). O segredo que ela mostra tem de ser o mesmo que está em
`MP_WEBHOOK_SECRET` no painel da Cloudflare; se você gerar um novo, atualize
lá.

**Pronto quando.** O teste do próprio painel da Mercado Pago responde 200, e
`Actions → Acesso → pedido` mostra o pagamento de teste do item 6.

### 5. Verificar o domínio na Resend

**O que é.** O e-mail de "esqueci minha senha" sai de
`contato@hebraicofluente.com.br`.

**Por que importa.** Sem o domínio verificado, a Resend recusa a entrega e o
sintoma é o pior possível: tudo funciona, menos o e-mail, e quem perdeu a
senha some sem reclamar.

**Como fazer.** Resend → Domains → adicionar `hebraicofluente.com.br` → colar
os registros DNS que ela pede no painel da Cloudflare (SPF, DKIM e o DMARC
que ela sugere). Leva de minutos a algumas horas para propagar.

**Pronto quando.** Pedir "esqueci minha senha" com um e-mail seu e o link
chegar na caixa de entrada, não no spam.

### 6. Uma compra de verdade, ponta a ponta

**O que é.** Comprar o curso você mesmo, com dinheiro de verdade, e depois
estornar.

**Por que importa.** É o único teste que a publicação não faz de propósito (o
e2e não cria cobrança com credencial de produção). Tudo o mais é simulação.

**Como fazer.** Crie uma conta nova (um e-mail que não seja o seu de sempre),
compre por PIX com a tela do checkout aberta, veja o pedido sair de
"aguardando" e o curso abrir. Depois: Mercado Pago → o pagamento → estornar.
Confira em `Actions → Acesso → pedido` que o pedido ficou `refunded` e que o
acesso fechou. Repita a compra com cartão.

**Pronto quando.** As duas formas de pagamento abriram o acesso, e o estorno
fechou sozinho, sem você tocar em nada.

### 7. Endereço completo nos dados da empresa

**O que é.** `data/empresa.json` está sem logradouro e sem CEP (o checador
`npm run check-legal` avisa). Cidade, UF, CNPJ e razão social já estão lá.

**Por que importa.** O Decreto 7.962/2013, que regula a venda pela internet,
exige endereço físico e eletrônico do vendedor em lugar visível. Hoje o
rodapé mostra "Curitiba, PR" e para por aí. Vale conferir com seu contador o
que exatamente ele quer que apareça.

**Como fazer.** Preencher `endereco.logradouro` e `endereco.cep` no JSON. Eu
faço em dois minutos, é só você me passar os valores. As quatro páginas legais
leem tudo desse arquivo, então não há texto a caçar.

**Pronto quando.** `npm run check-legal` roda sem avisos de endereço.

---

## Bloco 2 - decisões suas, cada uma com um custo

### 8. O conteúdo do curso está dentro do pacote público

**O que é.** As 22 letras, os módulos, os exercícios e as cartas de cultura
viajam num arquivo JavaScript que a home carrega. Um `curl` num endereço de
`/_next/static/chunks/` baixa tudo, sem conta.

**Por que importa.** É o único jeito que sobrou de pegar o material sem pagar.
Não é o app, não é a plataforma, não é o progresso: é a matéria-prima.

**As duas saídas.** (a) Aceitar, sabendo, e nunca descrever o produto como
"conteúdo protegido" em nenhum anúncio. (b) Tirar o conteúdo do pacote e
servi-lo por `/api/content/*` atrás do cookie. É trabalho de verdade, uns
dois ou três dias, e mexe em como as lições carregam.

**Minha leitura.** Para vender a 147 reais com garantia de sete dias, (a) é
uma decisão defensável: quem baixa o JSON bruto não tem o caminho, os
exercícios corrigidos, o progresso nem o certificado. Mas é uma decisão, e
precisa ser tomada de olho aberto, não por esquecimento.

### 9. Freio na borda da Cloudflare

**O que é.** Todo caminho da API tem freio dentro do Worker. Na borda, nada:
o Bot Fight Mode foi desligado de propósito (ele barrava a própria API do
site) e nada entrou no lugar.

**Por que importa.** O freio do Worker gasta uma execução e uma escrita no
banco para dizer "não". O freio da borda recusa antes de custar.

**Como fazer.** Cloudflare → Security → WAF → Rate limiting rules. Sugestão,
na ordem: `/api/pay/webhook` 20/min por IP (bloquear), `/api/auth/*` 30/min
por IP (desafio), `/api/auth/signup` 10/hora por IP, `/api/auth/forgot` 5/hora
por IP, `/api/pay/*` 30/min por IP, `/api/*` 300/min por IP. Deixe em modo de
registro por um dia antes de ligar o bloqueio.

**Pronto quando.** As regras aparecem ativas e o site continua funcionando
normalmente para você.

### 10. Uma branch de produção protegida

**O que é.** Hoje a publicação sai da branch de desenvolvimento, que é a
única. Quem tem escrita no repositório publica em produção e alcança o banco.

**Por que importa.** Enquanto é você sozinho, é conveniência. No dia em que
houver mais alguém, é o caminho mais curto entre um engano e o ar.

**Como fazer.** Criar `main`, proteger (Settings → Branches), apontar o
`deploy-worker.yml` para ela e passar a publicar por merge. Eu faço. A ação
`Acesso` já roda no ambiente `producao`: basta adicionar revisores em
Settings → Environments para que ela peça aprovação.

### 11. Três frases da política de privacidade

**O que é.** A política diz menos do que o sistema faz: não nomeia a Resend
(que recebe e-mail e primeiro nome, nos Estados Unidos), e a frase sobre dados
de cartão está absoluta demais.

**Por que importa.** Política que não bate com o código é o tipo de detalhe
que só aparece quando alguém reclama, e aí aparece do pior jeito.

**Como fazer.** Acrescentar a Resend em "Com quem compartilhamos" e uma linha
sobre o que a Mercado Pago devolve e nós guardamos (status, valor, moeda,
referência; nada do pagador). Eu escrevo, você lê e aprova.

---

## Bloco 3 - FEITO

Os cinco saíram numa tacada, com testes, e estão no ar. Ficam registrados
aqui porque dois deles mudam o que você vê acontecer.

12. **`__proto__` na fusão de progresso** (F-41). O app descarta as três
    chaves ao fundir, e o servidor recusa um progresso que as contenha em
    qualquer profundidade. Nada muda para o aluno.
13. **O convite deixou de virar curso sozinho** (F-18). Era o furo: bastava
    saber que um endereço tinha presente reservado para se cadastrar com ele
    e levar o curso. Agora, quando alguém se cadastra num endereço
    presenteado, **você recebe um e-mail** e roda `liberar` de novo - aí a
    conta existe e o acesso é concedido direto. A pessoa não é avisada de que
    havia um presente (é a confirmação que um impostor usaria). Sem provedor
    de e-mail configurado, o aviso fica na trilha e o presente espera:
    ninguém ganha acesso porque um e-mail não saiu.
    **O que muda para você:** presentear alguém passou a ter dois passos.
14. **`MP_SANDBOX` foi para "0".** Continua sendo só o desempate (quem manda é
    o prefixo do token), mas agora, com um token de forma estranha, a falha é
    alta - a Mercado Pago recusa na hora - em vez de calada, mandando o
    comprador para um checkout que não cobra.
15. **`workers.dev` desligado.** O site respondia também em
    `hebraico-fluente.<conta>.workers.dev`, fora da zona onde as regras do
    item 9 valem. Agora só o domínio próprio responde. Se um dia precisar
    conferir uma publicação com o DNS em dúvida, é uma linha no
    `wrangler.toml` para religar.
16. **Backup do banco, com a restauração ensaiada.** `npm run db:backup`
    escreve um `.sql` da produção em `backups/` (fora do git, só você lê);
    `npm run db:backup:ensaio` restaura essa cópia num banco local e conta as
    linhas que voltaram, porque backup que nunca foi restaurado é esperança,
    não backup. **Esse arquivo é segredo**: tem o e-mail de todo aluno e o
    hash da senha de cada um. Guarde-o como guardaria a carteira, e nunca num
    repositório ou num artefato do Actions.
    Rode uma vez agora, com o `--ensaiar`, para saber que funciona.

**De brinde**, um defeito que apareceu ao fazer o item 13: o freio de
requisições apagava sozinho a própria contagem em toda janela maior que duas
horas, então um limite "uma vez por dia" nunca limitava nada. Os limites em
uso eram todos de um minuto ou de uma hora, e por isso nenhum estava
quebrado - mas o primeiro limite diário teria nascido sem efeito. Consertado,
com teste.

---

## Na primeira semana, olhe isto todo dia

- `Actions → Acesso → pedido`: os pedidos do dia, com o que a Mercado Pago
  disse de cada um.
- `Actions → Acesso → senha`: os e-mails de recuperação que saíram, e o motivo
  dos que não saíram.
- Um pedido parado em `pending` por mais de uma hora é a única coisa que
  merece susto: confira no painel da Mercado Pago se foi pago e, se foi,
  libere por `Actions → Acesso → liberar`.

---

## A ordem que eu seguiria

Hoje: 1, 2, 7 (me passe o endereço), 11.
Amanhã: 5 (o DNS demora), 3, 4.
Depois que o DNS propagar: 6, a compra de verdade.
Antes de anunciar: decidir o 8 e ligar o 9.
Quando houver tempo: 10.

O bloco 3 está feito.
