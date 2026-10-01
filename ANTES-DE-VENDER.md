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

**Confirme você**, numa janela anônima: abra
https://moshikgueta.github.io/hebraicofluente/licao/alef/ e tem de dar 404.
Se abrir a lição, é o curso inteiro no ar de graça: vá em **Settings → Pages →
Unpublish site** na hora. O `.github/workflows/deploy-app.yml`, que era o único
jeito de a cópia de demonstração voltar, foi apagado em 01/10/2026 (auditoria,
SEC-A-004): o build dele saía sem portão e com os JSON pagos dentro do pacote.

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

A publicação automática já foi desligada (o `deploy-app.yml` foi apagado em
01/10/2026, e o `nextjs.yml` duplicado tinha sido removido antes), então nada
vai republicar sozinho. O que resta é o site que ficou de pé.

**Pronto quando.** `moshikgueta.github.io/hebraicofluente/licao/alef/`
responde 404 numa janela anônima. Me avise quando fizer e eu confiro o que dá
para conferir daqui.

### 1b. Áudio no iPhone: conferir o 206 em produção (auditoria de 01/10/2026, PERF-002)

**O que é.** O Safari (todo iPhone e iPad) só toca um áudio se o servidor
responder a um pedido parcial (`Range: bytes=0-1`) com `206` e `Content-Range`.
Localmente o servidor de ativos devolve `200` inteiro e ignora o pedido; em
produção a Cloudflare costuma responder 206 sozinha, mas daqui não dá para
provar (o proxy barra o site).

**Por que importa.** O áudio é o centro do curso e a capa vende com "Ouça e
fale". Se a produção fizer como o local, quem usa iPhone aperta "Ouvir" e não
ouve nada; a onda seguinte é de reembolso.

**O que já está feito.** Os clipes das lições (`/audio/*.mp3`, atrás do
portão) passam pelo Worker, que fatia a resposta em 206 quando o servidor de
ativos devolve 200 (`worker/src/lib/range.js`, com teste). Os sete clipes da
capa (`/amostra-audio/*`) também, de propósito: ficaram fora da lista de
exceções do `run_worker_first` para que o 206 não dependa do servidor de
ativos. A publicação confere o 206 sozinha (`worker/e2e.sh`).

**Como conferir.** No seu computador:

```
curl -sI -H 'Range: bytes=0-1' https://hebraicofluente.com.br/amostra-audio/shalom.mp3
```

Espera-se `HTTP/2 206` e uma linha `content-range: bytes 0-1/11956`. Depois,
num iPhone de verdade, toque 3 clipes: um na capa ("Ouça e descubra a letra")
e dois dentro de uma lição, com a conta que comprou.

**Se vier 200.** Me avise: é defeito, e a publicação já deveria ter falhado.

**Pronto quando.** O curl devolve 206 e os três clipes tocam no iPhone.

### 1c. Web Analytics da Cloudflare: desligar na zona (auditoria de 28/09, LEGAL-001; reconferido em 01/10/2026)

**O que é.** A Política de Privacidade (art. 4) diz que o site não usa
"script de terceiros para medir audiência". No repositório isso é verdade:
nenhum arquivo carrega `static.cloudflareinsights.com` nem o beacon do
Cloudflare Web Analytics (procurado em 01/10/2026; o único `sendBeacon` do
código é o envio das estatísticas do curso para o próprio site). Mas a
auditoria de 28/09 viu a ZONA injetar esse beacon nas páginas, e quem liga
isso é uma chave no painel da Cloudflare, não o código. Hoje a CSP do site
(`script-src 'self'`) bloqueia o script, então ele não coleta nada; no dia
em que a CSP mudar, a frase da Política fica falsa.

**O que fazer (é com você, no painel; daqui não há acesso).**
1. dash.cloudflare.com → a conta → **Analytics & Logs → Web Analytics**.
2. Se `hebraicofluente.com.br` aparecer na lista, abra-o e desligue a
   medição (Disable, ou "Manage site" → desligar a instalação automática).
   Se ele não aparecer, nada a fazer aqui.
3. Confira também em Websites → `hebraicofluente.com.br` → **Speed →
   Observatory / RUM** (o nome muda de tempos em tempos): o "Real User
   Monitoring" deve estar desligado.
4. Prova: abra a capa numa janela anônima, F12 → aba Rede, recarregue e
   procure `cloudflareinsights`. Não pode aparecer nenhum pedido.

**Se você quiser MANTER a medição.** Aí a Política precisa dizer isso. O
texto para trocar a última frase do segundo parágrafo do art. 4 (no código,
`app/src/app/privacidade/page.tsx`; me peça e eu troco, junto com a CSP, que
hoje bloqueia o script):

> Não usamos cookies de publicidade nem rede de anúncio. Para medir o
> desempenho e o número de visitas das páginas, usamos o Cloudflare Web
> Analytics, da Cloudflare, Inc., o mesmo fornecedor que hospeda o site: ele
> não usa cookie nem guarda dado que identifique você, e conta as visitas de
> forma agregada (página, país, navegador e tempo de carregamento). A
> Cloudflare trata esses dados fora do Brasil, nas mesmas condições
> descritas no item sobre transferência internacional.

A frase sobre "fora do Brasil" deve conferir com o item de transferência
internacional da própria Política; vale passar pelo advogado junto com o
resto.

**Pronto quando.** O passo 4 não mostra nenhum `cloudflareinsights`, ou a
Política foi trocada pelo texto acima (e a CSP liberada para o script).

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

**O site já se protegeu disso** (20/09/2026): a publicação pergunta quais
meios a credencial enxerga e o site passa a oferecer só o que dá para cobrar.
Hoje, só cartão - no checkout, no rodapé de toda página, no preço da landing
e na página do curso. Ninguém mais escolhe uma forma que falha.

A lista que a credencial devolve hoje, útil para mostrar ao suporte deles
quando disserem que está tudo certo do lado de lá:

```
account_money, amex, bolbradesco, debelo, elo, master, mp_card, visa
```

Nenhum `pix` aí dentro. **Quando eles habilitarem, a publicação seguinte
religa o PIX sozinha** - não há nada comentado no código esperando alguém
lembrar de descomentar.

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

### 8b. O site vendia um áudio que não existe - CONSERTADO, mas a decisão é sua

**O que estava errado.** O manifesto de gravações está vazio: **321 clipes
planejados, zero gravados**. O curso lida bem com isso - desliga os exercícios
de escuta e mostra "áudio em breve" em vez de usar voz sintética -, e o FAQ
dizia a verdade, com duas versões da frase e o manifesto escolhendo qual sai.

A parte que vende, não. No ar, hoje de manhã:

- `Áudio gravado por falante nativo`, como item de uma lista de entregas
- `Múltipla escolha, digitação, associação, escuta e leitura` - cinco tipos,
  um deles desligado
- uma maquete `Lição 4 · Escuta` com o botão `Reproduzir áudio`
- um passo do método: `Ouça · O som gravado por falante nativo`
- e um botão `Ouvir` na **primeira tela** do site

Ou seja: o site se contradizia, e a parte que contradizia era justamente a que
vende. No Brasil a oferta vincula (CDC art. 30) - quem comprasse por causa
daquela lista e não achasse áudio teria razão em pedir o dinheiro de volta,
dentro da sua própria garantia de sete dias. Reembolso que não precisava
existir.

**O que foi feito.** Toda frase sobre gravação passou a ter duas versões, e
quem escolhe é o manifesto - nunca quem escreve. Com o manifesto vazio, o site
agora diz: quatro tipos de exercício, "o som comparado com um som do
português", cinco passos no método em vez de seis, a maquete mostra um
exercício de reconhecimento (que existe), e o "Ouvir" do herói não aparece.
No dia em que as gravações entrarem, tudo volta sozinho.

O texto de venda saiu de dentro do JSX e foi para `components/landing/copy.ts`,
um arquivo só, que dá para ler de uma vez - porque enquanto estava espalhado no
meio da marcação, ninguém conferia.

**Como fica provado, e o que o conserto NÃO cobre.** `npm run promessas` lê o
HTML publicado e falha se achar promessa de gravação sem gravação; roda no
deploy. Ele só vê o que renderiza, e o HTML da home traz apenas a primeira das
cinco abas - então `tests/vitrine.test.ts` cobre o texto das outras quatro e do
método, lendo os mesmos dados que a página usa. Os dois foram ensaiados pelo
avesso: com o texto antigo, o script acusa duas promessas e o teste reprova
três dos cinco casos.

Uma coisa que tentei e não deu: fazer as frases descartadas desaparecerem do
pacote de JavaScript. O empacotador não dobra `audioAvailable()` (chamada de
função), nem um booleano literal importado de outro módulo - os dois lados de
cada condicional sobrevivem no arquivo final. Ninguém vê uma string morta num
JavaScript minificado, e ela não é oferta; mas está escrito aqui para não
parecer descuido.

**A decisão que sobra é sua.** O conserto deixou o site honesto. Ele não deixou
o produto completo:

1. **Gravar a onda 1** (168 clipes: nomes das letras, sílabas, sinais de
   vogal). Só com ela, toda lição já tem áudio no que importa - o som da letra.
   É o caminho que faz o produto valer o que a página prometia antes.
2. **Vender assim, dizendo assim.** Custo zero, e agora é verdade: quem compra
   lê "o som comparado com um som do português" e é isso que recebe. O curso
   não fica mentiroso - fica menor do que vai ser.

Enquanto for (2), isto fica escrito aqui para não virar esquecimento.



### 8. O conteúdo do curso está dentro do pacote público - RESOLVIDO

**Estava assim.** Em 20/09/2026 eu medi, em vez de estimar. O que estava no
arquivo que a home carregava (`/_next/static/chunks/26-*.js`, 114 KB):

```
letters.json   58 KB no disco · 48 de 60 amostras presentes
course.json    10 KB          · 31 de 60
culture.json    7 KB          · 12 de 60
extras.json     5 KB          · 13 de 60
real-world      4 KB          · 10 de 60
```

Ou seja: o miolo do material estava lá, e um `curl` naquele endereço baixava
tudo, sem conta e sem pagar.

**O que foi feito.** O conteúdo saiu do pacote e passou a vir de
`GET /api/content`, que o Worker só responde a quem tem cookie de sessão E
direito de acesso ao curso no banco - lido a cada pedido, para que um estorno
feche a porta na hora.

A parte difícil era não reescrever o curso inteiro: `getLetter(id)` é chamado
de dentro da renderização, em vinte lugares. A solução foi manter a API
síncrona e transformar o dado num depósito que se enche uma vez, antes de
qualquer tela de aluno existir. Quem espera é o `CourseGate`, o ponto único por
onde toda rota paga passa - ele já esperava a sessão, agora espera também o
conteúdo, e mostra "Não consegui carregar a aula" (com botão de tentar de novo)
se a busca falhar. Nunca "entre para continuar": essa é a pior mensagem
possível para quem já pagou.

Três arquivos, três permissões:

| arquivo | o que traz | quem pode ler |
|---|---|---|
| `lib/content-publico.ts` | só a grade do curso | qualquer página |
| `lib/content-servidor.ts` | o curso inteiro | componente de SERVIDOR |
| `lib/content.ts` | nada; é o depósito | o navegador, depois de encher |

**Como fica provado.** `npm run pacote` abre o export PUBLICADO, procura 116
trechos do material em todo arquivo de `/_next/static/` e em todo HTML de rota
livre, e falha se achar um - e confere também o contrário, que o HTML pago
continua trazendo o curso, porque um conserto que esvazia a lição não é
conserto. Roda no deploy, depois do build e antes de publicar. Eu o validei
pelo avesso: reintroduzi o vazamento numa seção da home, e ele acusou os dois
lugares e parou a publicação.

`tests/conteudo.test.ts` cobre o resto: nenhum import estático dos seis JSONs
em `content.ts`, nenhum componente de cliente lendo `content-servidor`, o que o
Worker manda igual ao que o depósito espera, e a rota recusando sem sessão
(401), sem compra (403) e com o acesso vencido (403).

**O que isto muda para a venda.** Nada mais impede descrever o material como
protegido: ele agora exige conta e compra. O que continua verdade - e vale
dizer - é que nenhum conteúdo entregue a um navegador é inviolável; um aluno
pagante pode copiar o que ele mesmo vê. O que fechou foi o acesso de quem não
pagou nada.

---

### 9. Houve venda real antes de 29/09/2026? (auditoria de 01/10/2026, LEGAL-105)

**O que é.** Em 29 e 30/09 entraram, para todas as contas, o limite de 3
aparelhos, a marca invisível no conteúdo, a marca d'água com o começo do
e-mail e as estatísticas de aprendizagem. Os Termos (art. 9) dizem que
mudança que afete um acesso já comprado não retroage, e a Política de
Privacidade promete avisar por e-mail antes de mudar o tratamento de dados.

**SÓ VOCÊ SABE.** Confirme se alguém comprou de verdade (não teste seu)
antes de 29/09/2026.

- **Não houve:** me diga, e isso fica registrado aqui. A regra continua para
  as próximas mudanças (INCIDENTES.md, seção 9).
- **Houve:** um e-mail único a esses compradores, dizendo o que mudou e
  oferecendo a desistência ou as condições antigas, com o texto revisado pelo
  advogado. O procedimento está em INCIDENTES.md, seção 9.

**Pronto quando.** A resposta está escrita aqui.

### 10. O depoimento da Natália (auditoria de 01/10/2026, LEGAL-107)

**O que foi feito.** O corte na fala dela agora aparece marcado com "[...]"
na capa, e a página /depoimento diz a regra que se pratica: o texto sai como
o aluno escreveu, e todo corte aparece marcado.

**O que é seu.**
1. **Autorização por escrito**, guardada FORA do repositório: nome, cidade,
   que o texto pode ir para o site e para divulgação, e que ela concorda com
   o corte (o trecho "corrigindo e acompanhando até que você realmente
   compreenda"). Hoje ela existe só como comentário no código. O caminho mais
   simples é pedir que ela mesma registre o depoimento em /depoimento, que
   grava a autorização.
2. **"Imagens".** A citação diz que a plataforma tem "áudio, texto, imagens e
   exercícios". A fala dela não foi alterada (é citação). Confirme com ela, e
   para você mesmo, a que imagens ela se refere: o curso tem os diagramas de
   traçado das letras; se ela pensava em outra coisa, combine com ela um
   corte marcado ou um texto novo.
3. Se ela teve acesso gratuito ou foi aluna particular, isso precisa ser dito
   junto do depoimento (pergunta para o advogado).

O título da seção na capa é "Quem já está lendo.", que serve para um
depoimento ou vários; não precisou mudar.

**Pronto quando.** A autorização está guardada e a dúvida das imagens,
resolvida.

### 11. Textos para você aprovar (auditoria de 01/10/2026)

Estão no ar e foram escritos por mim; troque se não concordar:

- **Dúvidas de conteúdo (UXQA-016):** "Dúvidas sobre o conteúdo também são
  bem-vindas por e-mail, no mesmo prazo." Em /suporte e na FAQ
  (`DUVIDAS_DE_CONTEUDO`, app/src/lib/empresa.ts), e nos Termos, art. 1:
  "o atendimento por e-mail e WhatsApp é para problemas de acesso, pagamento
  e conta, e para dúvidas pontuais sobre o conteúdo". Se preferir NÃO
  responder dúvida de conteúdo, me diga e eu tiro dos três lugares.
- **O que o curso ensina (UXQA-010):** "Este curso ensina a ler e escrever
  em hebraico. Conversação começa no Hebraico A1, que é um curso à parte."
  Na página do curso e na FAQ (`O_QUE_O_CURSO_ENSINA`).

### 12. A versão do contrato em publicação rebaixada (LEGAL-104)

Cada versão dos Termos, do Reembolso e da Privacidade tem uma cópia fixa em
`data/politicas-versoes/`, publicada em `/<documento>/v/<código>/`, e o
recibo de cada compra linka a versão daquela compra. Quando a Mercado Pago
responde formas de pagamento diferentes das de `data/empresa.json` (por
exemplo, sem PIX), o texto dos Termos muda naquela publicação e nasce uma
versão que não está no git: ela fica no ar só até a próxima publicação. O
resumo do Actions avisa, e o conserto está em RUNBOOK-ATENDIMENTO.md. O mais
simples é deixar `pagamento.formas` em `data/empresa.json` igual ao que a
Mercado Pago de fato aceita.

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
    **Desde 28/09/2026 há também o backup automático diário no R2** (Action
    "Backup do banco", ver `.github/workflows/backup.yml`): a cópia manual
    passa a ser um extra, não a única.
    **A tabela `gravacoes` fica fora dessa cópia** (desde 01/10/2026): os
    áudios do painel não cabem num comando do SQLite e são conteúdo do curso,
    não dado de aluno; a casa deles é o git (`audio/<id>.mp3`). O resumo de
    cada execução diz quais gravações ainda não foram exportadas para lá:
    quando aparecer alguma, rode o deploy-worker.yml com "exportar_gravacoes"
    e aceite o PR. Depois de gravar, exporte; é a regra.

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
- Um pedido parado em `pending` ou `failed` por mais de uma hora é a única
  coisa que merece susto: confira no painel da Mercado Pago se foi pago e, se
  foi, libere por `Actions → Acesso → liberar`. (`failed` é o cartão recusado
  numa primeira tentativa; a segunda pode ter sido aprovada. Desde 27/09/2026
  a varredura pergunta por eles também, mas vale olhar.)
- Uma linha `pagamento-duplicado` na trilha é um comprador que pagou duas
  vezes: estorne o segundo pagamento. O acesso continua pelo primeiro.

---

## Onde estamos (20/09/2026)

Fechados: **1** (Pages fora do ar, confirme o 404), **2** (execuções
apagadas, repositório privado), **4** (webhook, simulador em 200), **5**
(Resend verificada), **11** (privacidade reescrita), o **bloco 3** inteiro e
a correção do pagamento.

Fechado também: **7** (endereço completo).

Feito também: a parte automatizável do **10** (`main` é o único ramo que
publica, provado por uma publicação verde vinda dele).

Faltam: **6** a compra de verdade com estorno; **3** o PIX, que a Mercado
Pago ainda não habilitou; **8**, medido e virou decisão sua; **9**, onde o
código está pronto e falta permissão ou três regras à mão; e dois cliques -
proteger o `main` e confirmar o 404 do Pages.

**O PIX deixou de ser o caminho crítico.** O site agora oferece só o que
consegue cobrar, e o cartão funciona ponta a ponta. Dá para fazer a compra
de verdade (item 6) hoje, no cartão, e vender. O PIX entra quando eles
liberarem, sozinho.
