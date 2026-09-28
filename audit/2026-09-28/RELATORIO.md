# Auditoria de pré-lançamento: Hebraico Fluente

Data: 28/09/2026 · Base: `main` @ 4380711 (PR #49) · Método: 1 orquestrador + 8 agentes
especializados (QA, Segurança, Pagamento, Jurídico/LGPD, Pedagogia, UX/Acessibilidade,
Infraestrutura, Comercial) sobre um contexto compartilhado (`AUDIT_CONTEXT.md`), com
provas contra uma cópia local da build de produção (Worker + D1 local + Chromium), 930
testes automatizados, sondas próprias e a API do GitHub. Toda afirmação P0/P1 e os P2
decisivos foram reconferidos no código pelo orquestrador. Nenhum arquivo do projeto foi
alterado. Os relatórios de cada agente estão nesta mesma pasta (A-qa.md a H-com.md).

Limite importante: **o site em produção não era alcançável deste ambiente** (proxy).
Tudo que só existe em produção (DNS, TLS, WAF, Mercado Pago real, Resend real, D1
remoto, painel Cloudflare) está em "N. Não testado" e não foi convertido em aprovação.

---

## A. Resumo executivo

O produto está tecnicamente sólido onde mais importa: **ninguém consegue baixar o curso
sem pagar, ninguém consegue ver dados de outra conta, o preço nunca vem do navegador, o
webhook é assinado e reconsultado, e o conteúdo pedagógico está correto no essencial**
(22 letras, nikud, 526 áudios, 930 testes verdes). A segurança não tem nenhum achado
P0/P1.

O que impede a venda hoje não é código quebrado, é **operação e coerência**:

1. Não existe backup automático nem restore provado. Se o banco sumir, somem contas,
   compras e progresso de todos os alunos.
2. A FAQ publicada diz que o curso **não tem áudio de verdade** ("sintetizador… voz de
   espanhol latino"), enquanto a capa vende as gravações do professor. Um texto herdado
   que contradiz o produto.
3. A página de vendas mostra marcação crua (`{{בּ}} · {{כּ}} · {{פּ}}`) no módulo 5 e 7.
4. A desistência em 7 dias funciona pelo site, mas o estorno depende de o dono ler um
   e-mail e abrir o painel do Mercado Pago; nada lista, lembra ou alerta.
5. A política de privacidade promete "nenhum terceiro", mas a zona da Cloudflare injeta
   o beacon do Web Analytics (bloqueado pela CSP hoje, mas configurado).
6. Ninguém é avisado quando algo quebra: sem health check, sem alerta, sem log durável.
7. O deploy publica antes de verificar e não desfaz nada se a verificação falhar; a
   branch `main` não é protegida e nem é a branch padrão do repositório.

Nada disso leva mais que alguns dias. Com esses itens fechados, o produto está pronto
para um lançamento controlado; a venda pública em escala ainda pede o plano pago do
Workers e uma compra real com estorno feita de ponta a ponta.

## B. Status de lançamento

**🟠 CORRIGIR BLOQUEADORES ANTES DE VENDER**

P0 = 1 · P1 = 7 · P2 = 24 · P3 = 52 · P4 = 40 (após deduplicação). Não é garantia
jurídica; veja O e P.

---

## C. Bloqueadores (P0 e P1)

**INFRA-001 · P0 · Sem backup automático nem restore provado.**
Localização: `scripts/backup-d1.sh` (manual, para pasta local gitignored); 4 workflows,
nenhum com `schedule`. Evidência: nenhuma pasta `backups/`, nenhum registro de ensaio,
`SECURITY-AUDIT.md:492` já apontava. Time Travel do D1 (30 dias) não sobrevive a apagar
o banco ou a conta e não foi verificado. Impacto: perda total e irreversível de contas,
compras, direitos de acesso e progresso. Correção: Action semanal (ou diária)
`wrangler d1 export` para um bucket R2/S3 cifrado (nunca como artefato de Action);
restaurar num banco `hebraico-fluente-ensaio` remoto e registrar a data; documentar em
`DEPLOY-CLOUDFLARE.md`. Validação: um restore feito e datado, contagem de linhas
conferida.

**COM-003 · P1 · A FAQ diz que não há áudio.**
`app/src/app/faq/page.tsx:110-116`, publicado em `app/out/faq/index.html`: "Ainda não.
Hoje a pronúncia é falada pelo sintetizador do próprio navegador, com voz de espanhol
latino". O produto tem 526 clipes gravados pelo professor e a capa e a caixa de preço
vendem isso. Impacto: comprador que lê a FAQ compra com expectativa errada ou desconfia
do site; propaganda contraditória (CDC art. 30/37). Correção: reescrever condicionado a
`TEM_AUDIO`, como `Fecho.tsx:464-467`; acrescentar a `promessas.mjs` a regra inversa
(com manifesto cheio, nenhuma página pode dizer "ainda não"/"sintetizador").
Validação: `node app/promessas.mjs` falha antes e passa depois.

**UX-001 · P1 · Marcação crua na página de vendas.**
`app/src/app/cursos/[slug]/CourseClient.tsx:129` renderiza `{m.subPt}` como string;
`/mapa` e `/modulo` usam `<Prose>`. Em `/cursos/alfabetizacao` aparecem `{{בּ}} · {{כּ}}
· {{פּ}}` e `{{צ׳}} · {{ג׳}}`. Impacto: aparência de site quebrado na página lida antes do
checkout. Correção: `<Prose text={m.subPt} />`. Validação: grep de `{{` em
`app/out/cursos/**/index.html` vazio (acrescentar a `varrer-site.mjs`).

**LEGAL-013 / PAY-003 · P1 · Desistência sem processo de estorno.**
`worker/src/api/pay.js:336-374`: `desistir` grava `arrependimentos`, loga e envia
e-mail ao dono. Não estorna, não fecha acesso, não tem estado "resolvido", nenhuma ação
`Acesso` lista desistências, nada alerta se passar o prazo de 10 dias úteis prometido em
`/reembolso`. Se o Resend falhar, o pedido some (`mailReady` false). O CDC art. 49 exige
devolução imediata. Impacto: reclamação, PROCON, chargeback. Correção mínima: ação
`Acesso → desistencias` + coluna `resolvido_em` + lembrete diário via cron/Action;
ideal: estorno automático `POST /v1/payments/{id}/refunds` (o webhook então revoga).
Validação: pedir desistência num pedido de teste e ver a lista/alerta.

**LEGAL-001 / INFRA-008 · P1 · Política afirma "nenhum terceiro"; a zona injeta o beacon
do Cloudflare Web Analytics.** `privacidade/page.tsx:212-215`; log do deploy #153:
"violates CSP", `/` deu timeout no browser-check. Hoje a CSP bloqueia; a promessa
continua falsa e a página inicial sofre. Correção: desligar Web Analytics/RUM na zona
(preferido) ou listar na política com finalidade e retenção. Validação: nenhum script
`static.cloudflareinsights.com` no HTML servido em produção.

**INFRA-002 · P1 · Zero observabilidade.** Sem health check externo, sem notificação
Cloudflare, sem Action agendada, `console.error` efêmero, cron sem heartbeat. Login
quebrado, 500, D1 fora, webhook parado: só quando o cliente reclamar. Correção: uptime
check externo em `/api/health` exigindo `ok:true` e `payments:true` (5 min);
Cloudflare Notifications (Workers errors, D1); cron grava heartbeat e alerta se ausente.
Validação: desligar o segredo de teste e receber o alerta.

**INFRA-003 · P1 · Deploy publica antes de verificar, sem rollback.**
`scripts/cloudflare-setup.sh` (deploy no passo 6, e2e no passo 9);
`deploy-worker.yml:434-466`. Runs #152 e #154 subiram com verificação falhando; #154
(a `main` atual) só passou na re-execução manual. Correção: `wrangler versions upload`
+ e2e contra a preview URL + `versions deploy` só se passar; senão `wrangler rollback`
automático. Validação: forçar uma falha no e2e e ver a versão anterior continuar no ar.

**INFRA-004 · P1 · `main` sem proteção e não é a branch padrão.** API do GitHub:
`protected:false`, default branch `claude/practical-babbage-veufcz`, repositório
privado no plano Free (branch protection indisponível), 1 colaborador. Um push errado em
`main` publica em produção. Correção: tornar `main` padrão; GitHub Pro (ou repo público)
para bloquear force-push e exigir PR; 2FA nas três contas. Validação: tentativa de
force-push recusada.

---

## D. Top 10 riscos (por impacto real)

1. Perda total do banco sem backup (INFRA-001).
2. Site quebrado ou pagamento parado sem ninguém saber (INFRA-002 + INFRA-003).
3. Desistência pedida e não estornada no prazo (LEGAL-013): PROCON/chargeback.
4. Chargeback ou estorno que só chega no tópico `chargebacks`/`merchant_order` e não
   fecha o acesso; cron nunca revisita pedidos pagos (PAY-002, P2).
5. Token de teste publicado por engano passaria despercebido: comprador real vai ao
   sandbox e ninguém é cobrado (PAY-001, P2).
6. Contradições comerciais visíveis antes da compra: FAQ sem áudio, `{{}}` na página
   de vendas, og.jpg "21 lições" (COM-003, UX-001, COM-001).
7. Preço riscado "de R$ 297" nunca praticado e sem data de fim (LEGAL-014, P2).
8. Aluno que digita o e-mail errado no cadastro e paga: sem recibo, sem recuperação de
   senha, sem como corrigir; só SQL manual do dono (OPS-001, P2, achado da 2ª passagem).
9. Plano gratuito do Workers: 100k req/dia e 10 ms de CPU; uma campanha ou 6 IPs hostis
   derrubam vendas até 00:00 UTC (INFRA-007, P2).
10. Depoimento único, editado, com autorização só em comentário de código; credenciais
    do professor sem prova arquivada (LEGAL-023, LEGAL-024, COM-009).

---

## E. Segurança (SEC)

Sem P0/P1. **Aprovado com provas**: portão cobre 100% das pastas pagas de `app/out`
(302 documento / 403 asset, inclusive `/%6Cicao`, `//licao`, `index.txt`); conteúdo pago
ausente dos chunks públicos; IDOR (pedido/progresso de outra conta → 404); sessão
`__Host-`, HttpOnly, Secure, SameSite=Lax, HMAC, versão por conta, troca de senha derruba
sessões; reset uso único com TTL; CSRF por Origin/Sec-Fetch-Site (403); sem CORS; CSP,
HSTS, nosniff, X-Frame DENY; SQL 100% `bind()`; XSS escapado (React, canvas, e-mails);
webhook fail-closed; segredos fora do git e do histórico; `npm audit` 0 vulnerabilidades;
todas as correções do `SECURITY-AUDIT.md` de 20/09 confirmadas no código.

- SEC-001 · P3 · PBKDF2 25k iterações (limite 10 ms do plano Free). Ao ir para Paid:
  `cpu_ms=200` + `PBKDF2_ITERATIONS=310000`.
- SEC-002 / QA-002 · P3 · `PUT /api/progress` aceita qualquer estado: XP, exame,
  certificado e loja são forjáveis pelo aluno (provado: certificado "aprovado" com 0
  letras; `xp:5000` aceito e gasto na loja). Sem impacto financeiro; integridade do
  certificado "não oficial". Decidir e documentar; se o certificado passar a valer,
  assinar no servidor.
- SEC-003 · P3 · `script-src 'unsafe-inline'` (mitigado; trocar por hashes na build).
- SEC-004 · P4 · Enumeração de e-mail no signup (409, decisão documentada) e um write
  a mais no login de conta existente.
- SEC-005 · P4 · `/api/ab` lê o corpo sem teto antes do freio.
- SEC-006 · P4 · Upload admin materializa corpo chunked antes do teto de 1,5 MB.
- SEC-007 · P4 · Cookie legado aceito até 15/10/2026; remover depois.
- SEC-008 · P4 · 30 falhas/min por e-mail de vários IPs trancam o login por 1 min.
- SEC-009 · P4 · Admin = conta comum em `ADMIN_EMAILS` (gmail), sem exigir e-mail
  confirmado nem 2FA; comprometer o gmail permite trocar a pronúncia de todos.
- SEC-010 · P4 · `/api/health` público expõe `email:false`, `vendedor` etc.
- SEC-011 · P4 · Replay de webhook legítimo em 5 min (inócuo pela idempotência).
- HANDOFF de UX (registrado): freio de cadastro 10/h por IP barrou o checkout num NAT
  durante a auditoria; escola/empresa com 3 alunos pode bloquear o terceiro (P3).

## F. Pagamento e acesso (PAY)

Cenários críticos: (1) paga e não recebe: PASS no código (webhook + verify + cron 5 min,
e-mail só após o acesso), NOT TESTED com MP real; (2) acesso sem pagar: PASS (preço,
meses e curso só do catálogo; `pending` não abre portão; webhook reconsulta; valor/moeda
conferidos); (3) duplicado: PARTIAL; (4) reembolso e acesso continua: PARTIAL.
`tests/pagamento.test.ts` 25/25, `concessao.mjs` (6 caminhos simultâneos → 1 concessão),
47 asserções da sonda própria.

- PAY-001 · P2 · Token `TEST-` em produção passa em `pagamento-ativo.mjs` e no e2e;
  comprador real vai ao sandbox e ninguém é cobrado, sem sintoma. Barrar `TEST-` quando
  `modo=mercadopago`; e2e de produção exigir `modo:producao`.
- PAY-002 · P2 · Só `type=payment` fecha acesso; `chargebacks`/`merchant_order` são
  descartados; o cron nunca revisita pedidos pagos. Tratar `chargebacks` e varrer pagos
  dos últimos 120 dias diariamente.
- PAY-003 · P1 · ver LEGAL-013.
- PAY-004 · P3 · Dois pedidos pendentes do mesmo curso podem ser pagos: 24 meses e
  nenhuma trilha.
- PAY-005 · P3 · Pedido `expired` após 24 h só é liberado via webhook; preference de
  cartão não expira (`expires:true` na preference ou incluir `expired` no verify).
- PAY-006 · P3 · Só 404 da MP vira "não é nosso"; 400/403 viram 500 e reenvios.
- PAY-007 · P3 · Action `liberar` em conta ativa SUBSTITUI a validade (cortesia de 1
  mês apaga 10 restantes). Usar `MAX(expires_at, agora) + M`.
- PAY-008 · P3 · Quem tem escrita no repo libera/revoga; `environment: producao` com
  reviewers não verificado.
- PAY-009 · P3 · Rebaixamento para `pix-direto` só no resumo da Action; `/api/health`
  não expõe; pedidos pix-direto expiram em 24 h e o aluno vê "Expirado".
- PAY-010 · P4 · "juros da operadora do seu cartão": são da Mercado Pago (ver
  LEGAL-015).
- PAY-011 · P4 · Estorno parcial abaixo do preço fecha o acesso (decisão; registrar em
  runbook; nunca usar estorno parcial como cortesia).

## G. Funcional (QA)

Aprovado no navegador: cadastro/login/logout/senha errada/duplo clique/freio; esqueci
senha (resposta igual, link inválido tratado); conta sem compra (portão 302/403,
checkout passo 1→2, erro 502 com mensagem digna, nenhum pedido criado); aluno pago em
todas as 18 rotas (0 erros de console, estados vazios corretos); lição completa com
refresh e back; sync localStorage ↔ API com relogin e 409; sessão expirada não grava;
usuário expirado; desistência UI+API; apagar conta; certificado (download PNG); 106
links internos 200; mobile 360 (menu, jogos por toque, meu-nome); `clique.mjs` e
`varrer-site.mjs` limpos.

- QA-001 · P2 · URL inexistente nunca mostra 404 a visitante/conta sem compra: o shell
  trata tudo fora de `PUBLIC_PREFIXES` como curso e redireciona para `/entrar`.
- QA-003 · P3 · Refresh no meio do exame final perde as 40 questões; nada persiste.
- QA-004 · P3 · Sessão morta no meio do estudo é silenciosa (PUT 401, sem aviso).
- QA-005 · P4 · Ruído no console: `/api/me` 401 em toda página pública; prefetch de
  `/meu-hebraico` 403 sem entitlement (esconde erros reais).
- QA-006 · P4 · Tela afirma "a confirmação foi para <e-mail>" mesmo com e-mail desligado.
- OPS-001 · P2 (2ª passagem) · Compra não exige e-mail confirmado; não há troca de
  e-mail no perfil nem na Action `Acesso`. E-mail com erro de digitação = sem recibo,
  sem reset, sem correção. Adicionar `trocar-email` à Action (e, depois, self-service
  com confirmação).

## H. Jurídico (LEGAL)

Aprovado: identificação do fornecedor completa no rodapé (razão social, CNPJ,
endereço, e-mail; `check-legal.mjs`); sumário do contrato e aceite antes de pagar;
e-mail de confirmação com versão dos Termos; arrependimento pela mesma ferramenta com
confirmação imediata; foro do consumidor; sem cobrança recorrente; certificado "não
oficial"; crédito ao método de origem; sem "fluência/garantia/comprovado" nas páginas
livres; sem escassez falsa.

- LEGAL-013 · P1 · ver C.
- LEGAL-014 · P2 · "de R$ 297" riscado para preço nunca praticado, sem data de fim
  (CDC art. 37). Tirar o traço, manter "depois passa a custar", fixar data.
- LEGAL-015 · P2 · Juros do parcelamento são da Mercado Pago, não "da operadora"; o site
  nunca mostra total com juros (CDC art. 52). Confirmar na compra real.
- LEGAL-016 · P2 · Estorno de parcelado: juros voltam? Estorno parcial fecha acesso sem a
  política dizer.
- LEGAL-023 · P2 · Depoimento: autorização só em comentário de código, texto editado sem
  marca de corte, selo de resultado dado pelo dono. Guardar autorização fora do repo.
- LEGAL-017 · P3 · Em `pix-direto` a tela promete "alguns minutos" para liberação manual.
- LEGAL-018 · P3 · Suspensão "sem aviso prévio" sem critério/contestação (art. 51).
- LEGAL-019 · P3 · "Alunos avisados primeiro quando o A1 abre" é e-mail promocional; a
  política diz que não manda; sem opt-in/descadastro.
- LEGAL-020 · P3 · Sem cláusula de encerramento antecipado da plataforma (pro rata).
- LEGAL-022 · P3 · Menores: sem verificação de idade; ECA Digital (Lei 15.211/2025) pode
  alcançar produto "provavelmente acessado" por adolescentes → ADVOGADO.
- LEGAL-024 · P3 · Credenciais do professor sem comprovação arquivada (ônus do fornecedor).
- LEGAL-026 · P3 · Sem Declaração de Acessibilidade nem canal de barreiras (LBI art. 63).
- LEGAL-009 · P3 · Cadastro sem link para Termos/Política (aceite só no checkout).
- LEGAL-021 · P4 · Preços "provisórios" de cursos inexistentes no catálogo.

## I. LGPD

Data map completo no relatório D (nome, e-mail, hash, IP em 4 tabelas, progresso,
pagamento sem CPF/cartão, voz nunca sai do navegador, analytics inexistente, A/B só
contadores, 1 cookie). Aprovado: base legal declarada; exclusão self-service atômica;
Marco Civil (190 dias); sem CPF no D1; banner de cookies desnecessário (só cookie
necessário).

- LEGAL-001 · P1 · beacon Cloudflare (ver C).
- LEGAL-002 · P2 · Retenções omitidas: `access_log` 180 d e `arrependimentos.ip` sem
  purga, ambos sobrevivem à exclusão.
- LEGAL-003 · P2 · Operadores omitidos: GitHub (Actions leem D1 nos EUA), Gmail/WhatsApp
  do dono; transferência internacional incompleta (art. 33).
- LEGAL-004 · P2 · Política diz "primeiro nome" para o Resend; o código manda o nome
  inteiro (e à MP no cartão).
- LEGAL-005 · P2 · Direitos do titular: só exclusão é self-service; sem correção de
  nome/e-mail, sem acesso/portabilidade (art. 18/19).
- LEGAL-006 · P3 · Encarregado null: dispensa depende de enquadramento não documentado.
- LEGAL-007 · P3 · Backups (quando existirem) fora da política; exclusão não os alcança.
- LEGAL-008 · P3 · Sem procedimento de incidente (Res. ANPD 15/2024: 3 dias úteis).
- LEGAL-010 · P3 · "Fale e seja corrigido" na capa manda voz do VISITANTE ao Google/Apple;
  política só fala do curso.
- LEGAL-011/012 · P4 · Prazo fiscal sem número; `invites` e localStorage extra não
  descritos.

## J. Pedagogia (PED)

Cobertura total: 22 letras, nikud, 294 transliterações, 22 frases, 5 textos, 7 missões,
17 cenas, 22 leituras bíblicas + guia, 526 áudios (0 faltando), 18 arquivos do motor,
Aula 0. `npm run validate` 0 violações; 930 testes verdes. Hebraico das palavras e das
59/60 linhas bíblicas correto; explicações fonéticas corretas; certificado só com 22
letras + exame ≥ 70%.

- PED-006 · P2 · `modules.json` mód. 2: "R de caro" para ר contradiz a lição do ר (R
  francês) e o teste `garganta`.
- PED-019 · P2 · Mesma palavra transliterada de dois jeitos na tela (shalom/shalóm,
  gadol/gadól, ivrit/ivrít…): letras vs. frases/bônus.
- PED-025 · P2 · Bet/Vet, Kaf/Chaf, Pe/Fe: frases e cenas com o som ainda não ensinado
  vazam para a prática da lição da letra (contradiz `sons.ts`).
- PED-043 · P2 · Promessa "escrever em letra de forma e cursiva": só cursiva é ensinada
  (= COM-002).
- P3 (17): didYouKnow que promete palavra ilegível na ordem (טוֹב na letra 15, מַזָּל טוֹב
  na 13); "última letra" dita 3 vezes; distâncias "daqui a três lições" erradas após as
  lições de som; convenção "Q" que o curso não usa; נִשְׁמַע→נִשְׁמָע (textos m4, e clipe
  duplicado #330/#417); Dt 6:9 מְזֻזֹת→מְזוּזֹת; gu/g antes de e/i em duas convenções;
  s/ss intervocálico; "lerrem" sugerido e rejeitado pelo corretor; "Do rei"→"O rei";
  Aula 0: feedback "בּ" vs opção "ב", pergunta sobre alfabeto antigo contradiz
  culture/eras; exame não mede sem-nikud, gerech nem cursiva; Is 9 tradução
  teologicamente contestada para público misto; shekel 1986→1985; 46/46 imagens de
  vocabulário nulas.
- P4 (17): glosas (Britânia, foguete), acentos (arbá, láyla, maftéach, hiné),
  "luis"→"lus", chaves duplicadas em translit.json, "Queria"→"Quero", "22 lições" na
  nota, modo `ouvir` sem frases, etc. Lista completa em E-ped.

## K. UX e acessibilidade (UX)

Aprovado: 1 h1 por página, landmarks, skip link, foco visível em ~300 elementos, sem
armadilhas, labels em todos os inputs, erros com `role=alert`, imagens com alt, botões
de áudio nomeados nas lições, sem autoplay, jogos por teclado, RTL isolado com `lang=he`,
Noto Serif Hebrew self-hosted com nikud de avanço zero, reflow até 320 px em 22/23
rotas, alvos ≥ 24 px, reduced-motion, modo escuro medido, sem-JS entrega conteúdo,
`a11y.mjs`/`toque.mjs`/`capa.mjs`/`ctas.mjs` limpos, LCP ~300 ms, CLS 0.

- UX-001 · P1 · `{{}}` na página de vendas (ver C).
- UX-002 · P2 · Foco cai no `<body>` a cada etapa/resposta; nos jogos pula para o rodapé.
- UX-003 · P2 · Diálogo de acessibilidade abre sem foco e Tab sai dele.
- UX-004 · P2 · Menu móvel não fecha com Escape; scroll fica travado.
- UX-005 · P2 · Caça à letra: todas as células `aria-label="letra"` (injogável sem visão).
- UX-006 · P2 · Teal #1F8A7D como texto/botão falha 4,5:1 (3,7 a 4,2) na capa, FAQ, mapa.
- UX-007 · P2 · Dica da sidebar 3,76:1.
- UX-008/009 · P3 · `--ink-muted` sobre fundos tingidos 4,4; "Em breve" 2,1:1.
- UX-010 · P3 · `/teclado-hebraico` rola 15 px a 320 px.
- UX-011 · P3 · 32 botões "Ouvir" iguais no vocabulário.
- UX-012 · P3 · Falha de áudio engolida, sem estado visível.
- UX-013/014 · P3 · Jogos sem heading e sem `aria-live`; atalho "1-4" prometido só
  funciona em lições e Blast.
- UX-015/016/017 · P3 · Hebraico fora de `lang=he` em 3 lugares; login sem
  `aria-invalid`; botão flutuante cobre texto a 360 px.
- UX-018..023 · P4 · toast sobre a instrução, skip target sem tabindex, checkout nunca
  atinge networkidle, 401 no console público.
- COM-014 · P4 · Certificado: título 40-52 px, ressalva 13 px (recorte no LinkedIn).

## L. Infraestrutura (INFRA)

Aprovado: pipeline barra antes de publicar (7 provas + vitest); só `main` publica;
`concurrency` serializa; freio na borda confirmado; headers via `blindar()`; e2e prova
D1/schema/portão/conta/senha/webhook a cada deploy; trilha com retenção e purga.

- INFRA-001 · P0, INFRA-002/003/004 · P1 (ver C).
- INFRA-005 · P1→P2 · Sem migrações: só `CREATE IF NOT EXISTS`; coluna nova nunca chega;
  `pass_iter DEFAULT 310000` vs código 25.000. Adotar `wrangler d1 migrations`.
- INFRA-006 · P2 · SPF/DKIM/DMARC não verificáveis; sem DMARC o e-mail de senha cai em
  spam. NOT TESTED.
- INFRA-007 · P2 · Plano Free: 100k req/dia, 100k escritas D1/dia, 10 ms CPU. 1.000
  alunos ≈ 300-400k req/dia → site fora até 00:00 UTC. Paid (US$ 5) antes de campanha.
- INFRA-009 · P2 · Limpeza pós-deploy = DELETE em 9 tabelas por `LIKE` com token de
  escrita total, sem `environment`; e2e gasta 2 envios Resend por deploy.
- INFRA-010 · P2 · Segredos sem runbook de rotação; SESSION_SECRET só no painel.
- INFRA-011 · P2 · Sem procedimento de incidente (= LEGAL-008).
- INFRA-012 · P2 · Bus factor 1: gmail pessoal é suporte, admin e SUPPORT_EMAIL; GitHub
  e Cloudflare pessoais.
- INFRA-013..016 · P3 · Cron sem heartbeat; docs contraditórios (DEPLOY.md/Pages);
  HSTS sem preload; Actions em Node 20 deprecado.

## M. Comercial (COM)

Matriz de promessas (H-com): 27 lições, 22 letras, nikud, áudio do professor, correção
imediata, revisão espaçada, 12 meses sem mensalidade, certificado moderado, sem
escassez falsa, sem "fluência/garantia": PASS. Copyright: fontes OFL com licença
vendorizada, traçados derivados da Gveret Levin (OFL), áudios próprios, traduções
bíblicas próprias (não cópia literal de ARA/NVI), design próprio: PASS.

- COM-003 · P1 · FAQ sem áudio (ver C).
- COM-001 · P2 · `og.jpg` (21/09) diz "21 lições"; site diz 27 desde 26/09. Regerar com
  `tools/og.mjs` e conferir no CI.
- COM-002 · P2 · "letra de forma e cursiva" (= PED-043).
- COM-004 · P3 · "Questão real da Lição 3" na capa usa Shin (lição 4), Lámed (5), Bet
  (14): viola a "regra nº 1" vendida em /metodo.
- COM-005 · P3 · Três estimativas de tempo incompatíveis e "a maioria termina" sem
  aluno para sustentar.
- COM-006 · P3 · "faltar um dia não zera nada": a sequência zera (só XP e recorde ficam).
- COM-007 · P3 · O que NÃO está incluído (sem aula ao vivo, sem professor, sem A1)
  só nos Termos.
- COM-008 · P3 · Meta de /cursos anuncia "A1, A2 e B1. A trilha completa" e "à
  conversa" com 1 curso existente.
- COM-009 · P3 · Depoimento único, sem foto, de aluna presencial, sob título coletivo.
- COM-010..013 · P4 · Hero sem ressalva "letras, não entender"; sem cena de cardápio;
  "gabarito e transcrição" do exame não localizados (HANDOFF QA); "dificuldade sobe"
  só nos jogos.
- Imagens hero/og geradas por IA (Higgsfield): guardar comprovante dos termos fora do
  repo. Marca "Hebraico Fluente" no INPI: NOT TESTED → ADVOGADO.

---

## N. Não testado (nunca convertido em aprovação)

- Produção ao vivo: TLS/HSTS/headers reais, WAF e rate limit da zona, redirect www,
  Bot Fight Mode, Time Travel, Logpush, notificações, 2FA, validade do domínio,
  SPF/DKIM/DMARC, Pages antigo despublicado.
- Mercado Pago real: cobrança PIX e cartão, webhook real e sua assinatura, tópico de
  chargeback, total com juros na tela da MP, estorno de parcelado, reconciliação.
- Resend real: entrega de reset, confirmação, compra, desistência.
- Restore de backup (não existe backup).
- Reviewers do `environment: producao`; nomes dos segredos.
- Safari/iOS (VoiceOver, getUserMedia, áudio Range 206, teclado virtual), Firefox
  (Web Speech, nikud no Gecko), Android real (TalkBack, Gboard hebraico), leitor de
  tela real, zoom 400% real.
- 10 scripts `app/*.mjs` que exigem build demo (licao, exercicios, jogos, exame, portao,
  escrita, toque em modo demo, varrer-curso, apagar-conta, trava, tom, trancado, senha).
- Escuta dos 526 clipes (conteúdo gravado = texto exibido; "Hashém" nas 30 ocorrências).
- Teclado virtual nos exercícios de digitação; impressão do certificado.
- Fontes oficiais de legislação (planalto/ANPD bloqueados): redações citadas de memória.

## O. Advogado

1. ECA Digital (Lei 15.211/2025): aplicabilidade a produto "provavelmente acessado" por
   adolescentes; basta a autodeclaração 18+? Consentimento parental (LGPD art. 14)?
2. Enquadramento como agente de pequeno porte (Res. CD/ANPD 2/2022) e dispensa de
   encarregado; documentar.
3. Transferência internacional (Cloudflare, Resend, GitHub, Google) após a Res. CD/ANPD
   19/2024: instrumento para operadores de infraestrutura.
4. Direito autoral: obra derivada comercial do livro de Damián Dzienciarsky, há licença
   escrita?
5. Devolução em 10 dias úteis (PIX) e devolução de juros de parcelado vs. CDC art. 49
   parágrafo único.
6. Preço riscado nunca praticado: redação e data-fim (LEGAL-014).
7. Cláusula de suspensão sem aviso vs. art. 51 (LEGAL-018).
8. Certificado com nome livre e progresso forjável: o disclaimer basta?
9. Forma mínima de autorização do depoimento (LEGAL-023).
10. Busca de anterioridade da marca "Hebraico Fluente" (classes 41/9).

## P. Contador (VALIDAÇÃO COM CONTADOR NECESSÁRIA)

1. Enquadramento de Mhg Treinamentos e Idiomas (CNPJ 51.041.290/0001-52): MEI, ME
   Simples ou outro? CNAE para curso on-line (8593-7/00 ou 8599-6/04)? ISS em Curitiba?
2. NFS-e obrigatória a cada venda, inclusive para pessoa física? Sistema (Nacional/
   Curitiba)? Prazo após o pagamento? Precisa do CPF do comprador (o site não pede)?
3. Lei 12.741/2012: valor aproximado dos tributos no documento fiscal e/ou no checkout?
4. Prazo legal de guarda de `orders`/`payment_events` (para a Política): 5 anos?
5. Tratamento fiscal de estornos, desconto PIX, taxas da MP e juros repassados.
6. Comprador fora do Brasil pagando em BRL: incidência diferente?
7. O e-mail de compra "é o comprovante da sua compra": vale como recibo ou só a NFS-e?

## Q. Plano de correção

**ANTES DA PRIMEIRA VENDA (dias)**
1. Backup automático + restore provado e datado (INFRA-001).
2. FAQ do áudio reescrita e regra inversa em `promessas.mjs` (COM-003).
3. `<Prose>` na página de vendas + grep de `{{` no CI (UX-001).
4. Processo de desistência: lista/alerta/`resolvido_em`, ou estorno automático
   (LEGAL-013/PAY-003).
5. Desligar Web Analytics na zona ou declarar na política (LEGAL-001).
6. Health check externo + notificações Cloudflare + heartbeat do cron (INFRA-002).
7. `main` como branch padrão e protegida; 2FA em GitHub/Cloudflare/Gmail (INFRA-004).
8. Barrar token `TEST-` em `pagamento-ativo.mjs` e exigir `modo:producao` no e2e
   (PAY-001).
9. `og.jpg` regerado (COM-001); "de R$ 297" sem traço e com data (LEGAL-014).
10. Autorização do depoimento arquivada fora do repo (LEGAL-023); comprovantes das
    credenciais guardados (LEGAL-024).
11. Ação `trocar-email` na Action `Acesso` (OPS-001).
12. **Compra real de ponta a ponta (PIX e cartão) com estorno**, no celular, conferindo
    e-mail de compra, total com juros, liberação, revogação (LEGAL-015/016, N).

**ANTES DO LANÇAMENTO PÚBLICO (semanas)**
- Deploy com preview + rollback automático (INFRA-003); migrações D1 (INFRA-005).
- Tratar `chargebacks` e varrer pedidos pagos (PAY-002); `expires` na preference
  (PAY-005); `liberar` estende em vez de substituir (PAY-007).
- Workers Paid + PBKDF2 310k (INFRA-007, SEC-001); DMARC verificado (INFRA-006).
- Política de privacidade: retenções, operadores, nome inteiro, direitos, backups,
  capa com voz (LEGAL-002..005, 007, 010); link para Termos no cadastro (LEGAL-009).
- Pedagogia P2: "R de caro" (PED-006), transliteração unificada (PED-019), filtro de
  som nas frases/cenas (PED-025), promessa "forma e cursiva" (PED-043/COM-002).
- UX P2: foco nas etapas e jogos, diálogo de acessibilidade, Escape no menu, Caça à
  letra acessível, teal e dica da sidebar com contraste (UX-002..007).
- QA-001 (404 real), QA-003 (exame sobrevive a refresh), QA-004 (aviso de sessão).
- Comercial: tempo único derivado (COM-005), sequência (COM-006), "o que não inclui"
  (COM-007), meta de /cursos (COM-008), questão "real" da lição 3 (COM-004).
- Procedimento de incidente + runbook de rotação de segredos (INFRA-010/011, LEGAL-008).
- Declaração de acessibilidade fora do paywall (LEGAL-026).
- Perguntas ao contador (P) respondidas; decisão sobre NFS-e implementada.

**PRIMEIROS 30 DIAS**
- Pedagogia P3/P4 (34 itens); UX P3/P4; PAY-004/006/009; SEC P4; INFRA-009/012/013.
- Segundo administrador e e-mail de domínio como recuperação (INFRA-012).
- 3-5 depoimentos de alunos da plataforma com autorização (COM-009).
- Cláusulas: suspensão, encerramento, e-mail promocional com opt-in (LEGAL-018/019/020).
- Remover cookie legado após 15/10 (SEC-007).

**DEPOIS**
- Certificado assinado no servidor, se passar a valer algo (SEC-002/QA-002).
- Exame com parte sem nikud e gerech (PED-042); imagens de vocabulário (PED-052).
- CSP com hashes (SEC-003); autoatendimento de dados LGPD (LEGAL-005).
- Registro da marca (INPI).

## R. Checklist de go-live

- [ ] P0 = 0 (backup automático + restore provado)
- [ ] P1 = 0 (FAQ áudio, `{{}}`, desistência, beacon, alertas, rollback, `main`)
- [ ] Compra real PIX aprovada, liberada, e-mail recebido
- [ ] Compra real cartão aprovada, total com juros visto na MP
- [ ] Estorno real feito e acesso revogado pelo webhook
- [ ] Desistência pelo site → estorno dentro do prazo, com registro
- [ ] Token de produção confirmado (`/api/health` `modo:producao`, `vendedor` real)
- [ ] Controle de acesso reprovado (e2e de produção verde 3 vezes seguidas)
- [ ] Backup restaurado em teste, com data
- [ ] Health check externo e notificação Cloudflare disparando num teste
- [ ] Política de privacidade revisada (retenções, operadores, beacon, capa)
- [ ] Termos revisados (suspensão, encerramento, o que não inclui)
- [ ] Preço "de R$ 297" sem traço e com data de fim
- [ ] og.jpg com 27 lições
- [ ] Depoimento com autorização arquivada
- [ ] Fluxo mobile validado num iPhone e num Android reais (áudio, gravador, teclado)
- [ ] Conteúdo: 4 P2 pedagógicos corrigidos
- [ ] Certificado: decisão documentada sobre integridade
- [ ] DMARC publicado; e-mail de senha chega na caixa de entrada do Gmail
- [ ] Contador: NFS-e decidida; advogado: itens 1, 4, 5 e 6 respondidos
- [ ] `main` protegida e padrão; 2FA nas três contas
- [ ] Suporte: quem responde em 2 dias úteis quando o dono estiver fora

## S. Respostas diretas

1. **Posso começar a vender?** Ainda não. Um P0 e sete P1, todos de operação e
   coerência, não de código quebrado.
2. **O que absolutamente precisa ser corrigido antes?** A lista "Antes da primeira venda"
   (12 itens), com a compra real de ponta a ponta como prova final.
3. **Qual é o risco se eu não corrigir?** Perda irreversível de todos os alunos (backup);
   reclamação/PROCON por estorno atrasado; propaganda contraditória visível a quem vai
   comprar; incidente sem ninguém saber; push errado publicado em produção sem volta.
4. **O que ainda não foi possível verificar?** Seção N: tudo que só existe em produção
   (MP real, Resend real, DNS/TLS, painel) e os navegadores reais (iOS, Android,
   Firefox, leitores de tela).
5. **Ordem de correção?** Seção Q, na ordem em que está.
