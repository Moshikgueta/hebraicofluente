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

### 1. Despublicar a cópia do GitHub Pages - PELO JEITO JÁ FOI

Em 20/09/2026 a API do GitHub passou a responder `has_pages: false` para este
repositório, e a última publicação bem-sucedida no Pages foi em 19/09 às
23:07. Não fui eu: a API de Pages é barrada para mim. A explicação mais
provável é o repositório ter virado privado (item 2) - no plano gratuito o
Pages não serve repositório privado, então torná-lo privado derruba o site
junto.

**Confirme você**, numa janela anônima: `moshikgueta.github.io/hebraicofluente`
tem de dar 404. E vale apagar o `.github/workflows/deploy-app.yml`, que era o
único jeito de a cópia de demonstração voltar (ele só roda à mão, mas existe).

O que era o problema:

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

**E o repositório está privado** - a API responde `private: true`. Também não
fui eu; imagino que tenha sido você depois de ler o relatório. Com as duas
coisas, este item está fechado pelos dois lados: não há mais o que ler, e não
há mais quem leia.

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

### 3. Habilitar o PIX na Mercado Pago - AINDA NÃO ESTÁ VALENDO

Conferido às 14:19 de 20/09, com o token que está em produção. A resposta da
própria Mercado Pago:

```
✓ Mercado Pago autenticou.
  Habilitados na conta: cartão.
⚠ A conta NÃO tem habilitado: PIX.
```

Ou seja: as credenciais de produção estão certas e o cartão funciona, mas o
PIX não entrou. Isso é lido da API deles (`/v1/payment_methods`) a cada
publicação, então não é palpite nem cache nosso.

Causas, da mais comum para a menos: falta cadastrar a **chave PIX dentro da
conta Mercado Pago**; o PIX foi habilitado em **outra conta** que não a da
aplicação; ainda não propagou; ou o cadastro do CNPJ tem pendência de
validação.

**Enquanto isso, atenção:** o checkout oferece PIX primeiro. Um comprador que
escolher PIX hoje recebe erro. Dá para vender no cartão, mas não anuncie.

O que era o problema:

**O que é.** A conta hoje tem cartão habilitado e **PIX não**. O checkout
oferece PIX primeiro.

**Por que importa.** O caminho de compra que a maioria vai escolher falha com
"o problema é nosso", e você nem fica sabendo: não vira pedido, não vira
chamado, vira gente que desiste.

**Como fazer.** Mercado Pago → Seu negócio → Meios de pagamento → habilitar
PIX (pede a chave e a conta bancária de recebimento).

**Pronto quando.** O item 6 abaixo (compra de teste) passar com PIX.

### 4. Apontar o webhook da Mercado Pago para produção - FEITO em 20/09/2026

O simulador da Mercado Pago respondeu **200**, com o segredo novo no ar. Isso
prova a corrente inteira: a URL está certa, a notificação atravessa até o
Worker, e a assinatura confere - que é a única coisa que separa um aviso
legítimo de qualquer um batendo naquela rota.

Fica registrado o susto, porque ele vai se repetir: o primeiro teste deu 401
porque foi disparado **25 segundos antes** de a publicação instalar o segredo.
Trocar o segredo no GitHub não muda nada sozinho; é a publicação que o leva
até o Worker. Espere ela ficar verde antes de testar.

O que era o problema:

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

### 5. Verificar o domínio na Resend - FEITO, e conferido a cada publicação

A publicação de 20/09 às 04:16 passou no `✓ o e-mail de recuperação saiu`,
contra a produção. Esse item não é enfeite: ele lê `emailEntregue` em
`/api/health`, que só é `true` quando o último pedido de link virou
`forgot-enviado` na trilha - e isso só acontece quando a Resend ACEITOU a
mensagem. Domínio não verificado é 403 na hora, e viraria `forgot-falhou`.
Ou seja, a chave está válida e o `EMAIL_FROM` está verificado.

**O que isso ainda não prova:** que a mensagem cai na caixa de entrada e não
no spam. O e2e manda para `hf-e2e-…@example.invalid`, que a Resend aceita e
depois devolve. Vale pedir "esqueci minha senha" uma vez com um endereço seu
de verdade (um Gmail, de preferência) e ver onde a mensagem cai. Se cair no
spam, o conserto é DNS: um registro DMARC, que a Resend sugere na mesma tela
do SPF e do DKIM.

O que era o problema:

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

### 7. Endereço completo nos dados da empresa - FEITO em 20/09/2026

`Rua Bom Jesus, 434 · Curitiba, PR · 80350-010`, nas quatro páginas legais de
uma vez, porque as quatro leem `data/empresa.json`. O `check-legal` saiu de
três avisos para um.

O aviso que sobrou é `privacidade.encarregadoNome`, e **é opcional para
você**: a LGPD pede um encarregado (art. 41), mas a Resolução CD/ANPD nº
2/2022 dispensa agentes de tratamento de pequeno porte, desde que exista um
canal de comunicação com o titular - que existe, é o
`languageswithmoshik@gmail.com` na página de privacidade. Se um dia quiser
pôr um nome ali, é uma linha no JSON.

O que era o problema:

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

### 11. Três frases da política de privacidade - ESCRITAS, falta você ler

Estão no ar em `/privacidade/`. Cinco mudanças, nenhuma delas cosmética:

1. **A Resend passou a ser nomeada**, dizendo o que ela recebe: o seu endereço
   de e-mail e o seu primeiro nome. Ela estava fora da lista, e a política
   descrevia menos compartilhamento do que o sistema faz.
2. **A frase do cartão deixou de prometer demais.** Dizia que os dados do
   cartão "nunca passam pelos nossos servidores". A resposta da Mercado Pago a
   uma consulta nossa pode trazer os primeiros e os últimos dígitos e o nome
   impresso - eles são descartados antes de qualquer gravação, mas passam.
   Agora diz o que o código sustenta: **não guardamos nenhum deles**, e a
   resposta é filtrada antes de ser gravada. É a diferença entre uma promessa
   que alguém pode desmentir e uma que se pode conferir no código.
3. **O CPF.** Dizia "não pedimos documento", ponto. Continua sendo verdade
   para nós, mas a Mercado Pago pede o CPF na tela dela. Agora está escrito:
   nós não pedimos, ela pode pedir, e esse dado não chega aqui.
4. **Uma linha nova na tabela**: o que a Mercado Pago devolve e nós guardamos
   (situação, valor, moeda, forma e a referência do pedido - nada do pagador,
   nada de cartão).
5. **Transferência internacional**, que não estava lá de jeito nenhum: a
   Resend e a Cloudflare são de fora, e o art. 33 da LGPD manda dizer isso e
   em que base. Uma frase.

A data do rodapé foi para 20/09/2026, porque a própria política promete que
ela muda quando o texto muda.

**O que falta:** você ler `/privacidade/` e me dizer se concorda com o tom.
Nada aí é jurídico demais para você conferir - foi escrito para ser lido.

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

## Onde estamos (20/09/2026)

Fechados: **1** (Pages fora do ar, confirme o 404), **2** (execuções
apagadas, repositório privado), **4** (webhook, simulador em 200), **5**
(Resend verificada), **11** (privacidade reescrita), o **bloco 3** inteiro e
a correção do pagamento.

Fechado também: **7** (endereço completo).

Faltam: **3** o PIX, que a Mercado Pago ainda reporta como desabilitado;
**6** a compra de verdade com estorno; e as decisões **8** (conteúdo no
pacote), **9** (regras de borda) e **10** (branch protegida).

Nada do que falta é código. O caminho crítico é o PIX: sem ele, o item 6 só
dá para fazer no cartão, e o checkout continua oferecendo uma forma de
pagamento que falha.
