# C-legal: conformidade jurídica brasileira (Hebraico Fluente)

Auditoria somente-leitura de 01/10/2026, repositório /home/user/hebraicofluente @ 6d6302d.
Escopo: LGPD, CDC, Decreto 7.962/2013, Marco Civil, Lei 9.610/1998, ECA Digital (Lei 15.211/2025),
LBI (Lei 13.146/2015), marketing e consentimento.

**Aviso de papel.** Este relatório é de um auditor técnico, não de advogado. Ele compara o que os
documentos dizem com o que o código e as páginas exportadas fazem, aponta contradições e riscos
práticos e separa o que exige parecer jurídico profissional (seção 4). Nada aqui garante
conformidade. Os sites planalto.gov.br e gov.br/anpd não foram consultados ao vivo (proxy); onde a
redação exata da norma importa, está marcado [FNC] (fonte não consultada).

Premissas recebidas do orquestrador e respeitadas: a empresa é ME (dispensa de encarregado pela
Res. CD/ANPD 2/2022 já está na Política); o objeto é SERVIÇO educacional (CNAE 8593-7/00), não
produto digital; o site não emite nota fiscal (pendência do dono, fora do código); a declaração de
idade mora só nos Termos, art. 3, por decisão do dono.

Método: leitura do texto RENDERIZADO no export (`app/out/{termos,privacidade,reembolso,
acessibilidade,faq,sobre,suporte}/index.html`, extraído para texto em
`scratchpad/audit2/C/*.txt`), do código-fonte correspondente, do Worker, do D1 local, e
renderização real no navegador (Playwright, `scratchpad/audit2/C/chk.mjs`) de /criar-conta,
/checkout/alfabetizacao e /perfil em http://127.0.0.1:8787. `node app/check-legal.mjs` passa
("Camada de confiança completa").

---

## 1. Achados

ID: LEGAL-101 | Prioridade: P1 | Confiança: ALTA CONFIANÇA (código) / PRECISA VERIFICAÇÃO MANUAL (caixa postal)
Local: worker/src/lib/mail.js:58-63 (corpo do envio), :321, :331, :357, :368, :419; wrangler.toml:103-107
- Problema: todos os e-mails transacionais saem de `contato@hebraicofluente.com.br` (EMAIL_FROM) e
  o corpo enviado à Resend tem só `from, to, subject, text, html`: não há `reply_to`. O e-mail de
  compra diz "Para desistir, abra ... ou **responda este e-mail**" (mail.js:321/357) e todos dizem
  "Qualquer dúvida, **responda esta mensagem**" (mail.js:331/368/419). A resposta vai para
  `contato@hebraicofluente.com.br`, e não para o Gmail que o site declara como canal oficial
  (`languageswithmoshik@gmail.com`). Nada no repositório mostra que esse endereço tenha caixa
  postal ou encaminhamento (sem menção a MX/Email Routing; ANTES-DE-VENDER.md item 5 trata só da
  verificação de ENVIO na Resend; G-infra de 28/09 deixou MX "NOT TESTED").
- Evidência: `sendMail` monta `{ from: mailFrom(env), to, subject, text, html }` (mail.js:58-63);
  o Resend falso em /tmp/claude-0/emails.jsonl registra exatamente as chaves `from, subject, text, to`.
  `dig`/`nslookup` não existem neste ambiente; produção inalcançável.
- Por que importa: a desistência do art. 49 do CDC é exercida pelo meio que o fornecedor oferece
  (Decreto 7.962, art. 5º, §1º [FNC]). Se o aluno responde ao recibo dentro dos 7 dias e ninguém lê,
  o direito foi exercido e o estorno não acontece: é descumprimento do art. 49 com prova escrita
  na mão do consumidor (o e-mail enviado). Vale também para pedidos LGPD feitos por resposta.
- Impacto no cliente: pedido de desistência ou de suporte que some sem resposta.
- Correção sugerida: (a) acrescentar `reply_to: env.SUPPORT_EMAIL` no corpo do envio (1 linha) e
  (b) confirmar no painel Cloudflare que `contato@` tem Email Routing para a caixa do dono, ou
  trocar o texto para "escreva para <suporte>" em vez de "responda".
Complexidade: Mínima | Claude corrige sozinho?: Sim (código); a caixa postal é do dono

ID: LEGAL-102 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/app/checkout/[slug]/CheckoutClient.tsx:299-300, :324-325, :630-633; app/src/components/shell/PublicShell.tsx:310-315; capa (Fecho/preço)
- Problema: no ponto de escolha do pagamento o checkout diz "Cartão de crédito · R$ 147 à vista,
  ou parcelado em até 12x." e o resumo "ou em até 12x no cartão", sem dizer que há juros. A
  informação de juros só existe nos Termos art. 1 e na FAQ ("No parcelamento há juros, cobrados pela
  Mercado Pago"). O rodapé de 26 páginas diz "Pagamento por PIX ou cartão, em até 12x" e a capa
  "R$ 147 ou em até 12× no cartão", também sem "com juros".
- Evidência: texto renderizado do checkout (Playwright): "Cartão de crédito | R$ 147 à vista, ou
  parcelado em até 12x. | ... | R$ 147 | ou em até 12x no cartão"; `grep -o "12x" app/out` → 26
  ocorrências do rodapé.
- Por que importa: CDC art. 52 e Decreto 5.903/2006 [FNC] pedem que, na oferta parcelada, o
  consumidor saiba que há acréscimo e quanto; "em até 12x" sem qualificação é lido no varejo
  brasileiro como "sem juros". A tela da Mercado Pago mostra o total (não verificado em produção,
  LEGAL-015 de 28/09), mas a oferta é feita aqui.
- Impacto no cliente: escolhe o parcelado esperando 12 × R$ 12,25 e descobre o total maior só na MP.
- Correção sugerida: "parcelado em até 12x **com juros da Mercado Pago** (o total aparece antes de
  confirmar)" no checkout, rodapé e capa.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: LEGAL-103 | Prioridade: P2 | Confiança: CONFIRMADO (código) / PRECISA VERIFICAÇÃO MANUAL (estado do PIX em produção)
Local: app/src/app/termos/page.tsx:63-74 e :82; app/src/app/faq/page.tsx:73-84; app/src/lib/cta.ts:74; ANTES-DE-VENDER.md:89-99
- Problema: os Termos (art. 1 e 2) e a FAQ só olham `soPix()` (modo pix-direto). No modo
  `mercadopago` com PIX desabilitado na conta (estado registrado em ANTES-DE-VENDER item 3, "AINDA
  NÃO ESTÁ VALENDO", e que `scripts/pagamento-ativo.mjs` aplica na build reescrevendo
  `formas.pix=false`), o rodapé, a capa (Fecho.tsx:422) e o checkout escondem o PIX, mas os Termos
  continuam dizendo "R$ 147 à vista, **R$ 132,30 no PIX**" e "No PIX, o acesso é liberado ...
  normalmente em minutos", e a FAQ "PIX, cartão ... ou R$ 132,30 no PIX". No modo pix-direto, o
  micro-texto de todos os CTAs continua "**Acesso imediato** · 12 meses" (cta.ts:74) e os Termos
  art. 2 "normalmente em minutos", enquanto o checkout promete liberação manual "em até 2 dias úteis".
- Evidência: termos/page.tsx:63 `{soPix() ? ... : <> à vista, {brl(pix)} no PIX, ...}` (sem
  `temPix()`); faq/page.tsx:73-81 idem; PublicShell e Fecho usam `temPix()`.
- Por que importa: oferta vincula (CDC art. 30 e 35): um desconto de 10% escrito no contrato e não
  disponível no checkout pode ser exigido; e o próprio contrato desmente o checkout.
- Impacto no cliente: lê nos Termos um preço que não consegue pagar, ou espera liberação imediata
  que é manual.
- Correção sugerida: usar `temPix()`/`confirmaSozinho()` nos Termos (art. 1 e 2), na FAQ e em
  `cta.ts`; um teste em `consumidor.test.ts` que gere os Termos com `formas.pix=false`.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: LEGAL-104 | Prioridade: P2 | Confiança: CONFIRMADO
Local: worker/src/api/auth.js:238-254; worker/schema.sql:447-456; data/empresa.json `politicas.atualizadoEm`; worker/src/lib/mail.js:325-329; git log
- Problema: a "versão" aceita é só a data `politicas.atualizadoEm`, comum a Termos, Privacidade,
  Reembolso e Acessibilidade, e ela não está ligada ao texto. (a) Os Termos mudaram depois de a
  versão ser fixada no mesmo dia: `4b83dde` (29/09 02:10) pôs "2026-09-29"; `8a68e80` (12:17,
  limite de 3 aparelhos e marca invisível) e `7530c76` (12:30, marca d'água visível e Código Penal)
  mudaram o art. 2 e o art. 5 sem mudar a versão, então há dois textos diferentes com a mesma
  versão "2026-09-29" gravada em `aceites`. (b) O texto dos Termos depende de dados de build
  (preço, `soPix`, parcelas de courses.json e empresa.json): mudar o preço ou o modo muda o contrato
  sem mudar a versão. (c) Não existe arquivo das versões antigas: o recibo diz "As condições que
  valem para ela são as dos Termos ... na versão de DD/MM/AAAA" mas o link é `/termos/`, que mostra
  sempre a versão ATUAL. (d) O aceite da compra não é gravado (o checkout é "Ao continuar você
  concorda", sem registro); só o do cadastro.
- Evidência: `git log -- app/src/app/termos/page.tsx` × histórico de `atualizadoEm`; D1 local:
  `aceites` tem versões 2026-09-29/30 e 10-01; `check-legal.mjs` não confere versão × texto.
- Por que importa: Decreto 7.962 art. 4º, IV [FNC] pede o contrato "em meio que permita sua
  conservação e reprodução"; e o art. 9 dos Termos ("vale o que estava escrito no dia da sua
  compra") só é cumprível se der para mostrar o que estava escrito. Numa disputa, o fornecedor não
  consegue provar o texto aceito.
- Impacto no cliente: não consegue guardar o contrato que aceitou; o link do recibo muda sozinho.
- Correção sugerida: versão = hash (ou data + sufixo) do TEXTO renderizado de /termos e /reembolso,
  calculada na build e conferida por `check-legal` (falha se o texto mudou e a versão não); publicar
  cada versão em `/termos/v/<versao>/` (estática, imutável) e linkar ESSA no recibo; gravar em
  `orders` a versão vigente no pagamento.
Complexidade: Média | Claude corrige sozinho?: Revisar antes

ID: LEGAL-105 | Prioridade: P2 | Confiança: CONFIRMADO (código) / PRECISA VERIFICAÇÃO MANUAL (se há compradores anteriores a 29/09)
Local: worker/src/lib/aparelhos.js (limite aplicado a toda conta); termos/page.tsx art. 9 (:216-222); privacidade/page.tsx:366-369; worker/src/api/estatisticas.js
- Problema: os Termos dizem "Mudança que afete um acesso já comprado não retroage: vale o que estava
  escrito no dia da sua compra", e a Política diz "Alteração relevante no tratamento dos seus dados é
  avisada por e-mail antes de valer". Desde 29-30/09 entraram, para TODAS as contas, o limite de 3
  aparelhos (restrição de uso), a marca invisível e a marca d'água visível com parte do e-mail
  (novo tratamento), e o envio de estatísticas de aprendizagem. Não há código que distinga quem
  comprou antes, nem nenhuma rotina ou e-mail de "a política mudou" (grep sem resultado). Contas
  anteriores a 29/09 também não têm registro em `aceites` (D1 local: 12 contas ativas sem aceite).
- Por que importa: o próprio contrato proíbe a retroação, e a própria Política promete o aviso.
  Se houver comprador anterior (ANTES-DE-VENDER fala em "primeira venda de verdade", então talvez
  não haja), é descumprimento literal de cláusula do fornecedor (CDC art. 30/48).
- Correção sugerida: o dono confirma se houve venda real antes de 29/09. Se houve: e-mail único a
  esses compradores informando as mudanças (e oferecendo o limite antigo ou a desistência), e
  criar a rotina de "aviso de mudança" que a Política promete. Se não houve: registrar isso em
  CLAUDE.md e manter a regra para as próximas mudanças.
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes

ID: LEGAL-106 | Prioridade: P2 | Confiança: CONFIRMADO
Local: worker/src/api/depoimentos.js:111-120 (retirar), :13-14; worker/src/lib/db.js:1092-1095 (deleteAccount); worker/src/alertas.js:130-141; app/src/app/depoimento/DepoimentoClient.tsx:206-208, :224; privacidade (tabela, linha Depoimento)
- Problema: a página e a Política prometem "Se você retirar a autorização, o depoimento sai de onde
  estiver publicado em até 7 dias". A publicação é manual (editar `testimonials.ts` e publicar), e
  retirar (`DELETE /api/depoimento`) ou apagar a conta só apagam a linha e gravam
  `depoimento-retirado`/`conta-apagada` na trilha: o dono NÃO recebe aviso. O alerta diário
  (alertas.js:130) conta só depoimentos novos ou editados.
- Por que importa: revogação de consentimento (LGPD art. 8º §5º, art. 18 IX) e uso de nome em
  publicidade sem autorização vigente (direito de imagem/nome, CC art. 18 e 20 [FNC]); a promessa
  de 7 dias depende de o dono lembrar de olhar a trilha.
- Correção sugerida: em `retirar` e no `deleteAccount`, quando a linha removida tinha
  `estado='aprovado'`, mandar e-mail ao dono na hora ("retirar da vitrine até DD/MM"); idealmente a
  vitrine ler os aprovados do banco em vez de um arquivo.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: LEGAL-107 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/lib/testimonials.ts:31-50; app/out/index.html (seção "Quem já está lendo."); DepoimentoClient.tsx:206
- Problema: o único depoimento publicado (Natália, Búzios) foi CORTADO a pedido do dono (comentário
  em testimonials.ts: sai o fim da segunda frase) e o texto é exibido entre aspas sem marca de
  supressão ("[...]"). Ao mesmo tempo, a página /depoimento promete a todos os alunos "O texto não é
  editado por ninguém: ou sai como você escreveu, ou não sai". A autorização da Natália continua
  existindo só como comentário de código (LEGAL-023 de 28/09): ela não passou pelo fluxo novo, que
  grava `publicar=1`. O conteúdo ("encontrei no Moshik uma abordagem diferente", "já havia estudado
  com outros professores") sugere ex-aluna de aulas com o professor; se ela recebeu acesso gratuito
  ou foi aluna particular, isso não está dito. O selo "Lê e escreve em hebraico" é afirmação
  confirmada pelo dono, não escrita por ela.
- Por que importa: CONAR, Anexo Q / art. 27 §9º [FNC] e CDC art. 37: depoimento deve ser real,
  autorizado e não pode ser editado de modo a mudar o sentido; o corte removeu justamente a
  referência a acompanhamento individual, que é o que o curso NÃO tem, o que é defensável, mas
  precisa estar sinalizado. A contradição com a regra pública do próprio site é o ponto mais fácil
  de explorar.
- Correção sugerida: mostrar "[...]" no corte; guardar fora do repositório a mensagem original e
  uma autorização expressa (nome, cidade, uso, corte); ou pedir que ela registre o depoimento pelo
  /depoimento. Se houve acesso gratuito ou relação de aluna particular, considerar a menção.
Complexidade: Mínima | Claude corrige sozinho?: Revisar antes

ID: LEGAL-108 | Prioridade: P2 | Confiança: CONFIRMADO
Local: data/courses.json:54 (`preLancamentoAte: "2026-10-31"`); app/src/lib/catalog.ts:166-180; capa, /cursos/alfabetizacao, checkout, FAQ
- Problema: a urgência "Preço de pré-lançamento até 31/10/2026. Depois, o curso passa a custar
  R$ 297" está em 5 lugares, mas nada a faz valer: nem a build nem o Worker olham a data; não há
  alerta (grep em alertas.js, workflows e checks: nada). No dia 01/11 o site continua anunciando
  "até 31/10/2026" e cobrando R$ 147, a não ser que o dono lembre de editar courses.json e publicar.
- Por que importa: prazo de promoção anunciado e não cumprido é publicidade enganosa por indução
  (CDC art. 37 §1º; CONAR [FNC]): se a promoção for estendida, a urgência anterior era falsa; se o
  texto ficar vencido, a oferta diz uma coisa e o checkout outra. Faltam 30 dias.
- Correção sugerida: (a) `check-legal`/build falharem se `preLancamentoAte` < hoje com
  `listBrl` presente; (b) o Worker cobrar `listBrl` depois da data (ou o dono decidir por escrito,
  antes, o que acontece em 01/11); (c) alerta ao dono 7 dias antes.
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes (decisão de preço é do dono)

ID: LEGAL-109 | Prioridade: P2 | Confiança: CONFIRMADO (texto) / PRECISA VERIFICAÇÃO MANUAL (auto-resposta do Gmail)
Local: termos/page.tsx:204-209 (art. 8); reembolso/page.tsx:86-92 (item 2); suporte
- Problema: os Termos (art. 8) dizem que a desistência "se faz pelo próprio site ... ou por e-mail,
  e a **confirmação de recebimento chega na hora**". A Política de Reembolso, para o e-mail, diz
  "Respondemos confirmando **em até 2 dias úteis**". Só o canal do site confirma na hora (e-mail
  automático em pay.js). Pelo e-mail, o que existe é a caixa Gmail do dono.
- Por que importa: Decreto 7.962 art. 5º §4º [FNC]: o fornecedor deve enviar ao consumidor
  confirmação IMEDIATA do recebimento da manifestação de arrependimento; o art. 4º, parágrafo
  único, dá até 5 dias para a resposta às demandas. Os documentos se contradizem e o canal por
  e-mail não cumpre o "imediato" que os Termos prometem.
- Correção sugerida: auto-resposta no Gmail (e no `contato@`, ver LEGAL-101) para assuntos com
  "reembolso"/"desistência" confirmando o recebimento com data e hora; alinhar o texto do Reembolso
  ("a confirmação automática chega na hora; a resposta pessoal em até 2 dias úteis").
Complexidade: Mínima | Claude corrige sozinho?: Revisar antes (configuração do Gmail é do dono)

ID: LEGAL-110 | Prioridade: P2 | Confiança: PRECISA VERIFICAÇÃO MANUAL
Local: reembolso/page.tsx item 3 ("Parcelado: o estorno é do valor total ... o saldo final é zero"); resumo "Devolvemos 100% do valor"; mail.js:318 "o valor volta integral"
- Problema: continua aberto o LEGAL-016 de 28/09. Os juros do parcelamento são cobrados pela
  Mercado Pago ao comprador; o estorno automático (`refundPayment`) devolve o pagamento, mas não há
  confirmação de que os juros pagos ao emissor/MP voltam. A promessa "100%" e "saldo final zero"
  depende disso. Não houve compra real com estorno (ANTES-DE-VENDER item 6 pendente).
- Por que importa: CDC art. 49, parágrafo único: devolução de "valores eventualmente pagos, a
  qualquer título". Juros não devolvidos tornam a promessa falsa e o fornecedor responde por ela.
- Correção sugerida: fazer a compra real parcelada + desistência; se os juros não voltarem,
  devolver a diferença ou mudar o texto (com parecer).
Complexidade: Pequena | Claude corrige sozinho?: Não

ID: LEGAL-111 | Prioridade: P2 | Confiança: PRECISA VERIFICAÇÃO MANUAL
Local: app/out/index.html e /sobre ("O conteúdo do livro dele é a base do que esta plataforma ensina"); termos/page.tsx:144 ("O conteúdo é nosso, o aprendizado é seu"); CLAUDE.md:445 ("A autorização do autor de Ba Li Ivrit existe (o dono a tem por escrito)")
- Problema: o site afirma publicamente que o conteúdo do livro de terceiro é a base do curso, e o
  art. 5 dos Termos se intitula "O conteúdo é nosso" e ameaça com Lei 9.610 e Código Penal art. 184
  quem copiar. A autorização do autor é afirmada em CLAUDE.md, mas não está no repositório nem em
  lugar verificável por esta auditoria, e não se sabe o escopo (obra derivada, uso comercial,
  território, prazo, exclusividade, crédito exigido).
- Por que importa: se a licença não cobrir uso comercial derivado, a frase da capa é confissão de
  uso da obra (Lei 9.610 arts. 29 e 102-104 [FNC]); e a titularidade afirmada no art. 5 fica
  imprecisa.
- Correção sugerida: advogado ler a autorização; ajustar o art. 5 para "O conteúdo é protegido"
  ("parte dele usada sob autorização de Dr. Damián Dzienciarsky") conforme o que ela permitir.
Complexidade: Mínima (texto) | Claude corrige sozinho?: Não (depende do documento)

ID: LEGAL-112 | Prioridade: P3 | Confiança: CONFIRMADO
Local: termos/page.tsx:101-110 (art. 3); privacidade/page.tsx:357-362 (item 7); AuthForm.tsx:115-131
- Problema: os documentos divergem sobre menores. Termos: menores "só podem usar a plataforma com a
  autorização e o acompanhamento de um pai, mãe ou responsável legal" (admite uso por menor).
  Política: "A plataforma é feita para adultos. Não direcionamos conteúdo a menores ... nem
  coletamos dados deles conscientemente. Se identificarmos uma conta criada por menor sem o
  consentimento dos responsáveis, ela será removida" (sem dizer se há reembolso). Se o uso por
  menor com responsável é permitido, dados de adolescentes (progresso, nome no certificado, voz no
  reconhecimento do navegador) são coletados conscientemente. A declaração de idade é feita por uma
  caixa que mostra só "Li e aceito os Termos de Uso" (renderizado); o servidor grava `idade` a
  partir do mesmo clique (decisão do dono).
- Por que importa: LGPD art. 14 (melhor interesse; consentimento parental para criança) e ECA
  Digital (Lei 15.211/2025) [FNC] para produto "provavelmente acessado" por adolescentes. Exposição
  baixa (sem publicidade, perfilamento, chat, geolocalização, push ou loot box: grep sem resultado;
  a "loja" troca XP sem aleatoriedade), mas a contradição é documental.
- Correção sugerida: escolher uma regra e escrever igual nos dois documentos (ex.: "a conta é sempre
  do adulto responsável; o menor estuda na conta dele") e dizer que a remoção de conta comprada gera
  reembolso; parecer sobre ECA Digital (seção 4).
Complexidade: Mínima | Claude corrige sozinho?: Revisar antes

ID: LEGAL-113 | Prioridade: P3 | Confiança: CONFIRMADO
Local: worker/src/lib/db.js:1088-1091 (deleteAccount apaga `aceites`); privacidade (linha "Aceite dos Termos": "enquanto a conta existir")
- Problema: apagar a conta apaga a prova do aceite dos Termos e da declaração de idade, mas os
  pedidos (anonimizados), o pedido de desistência e os estornos ficam. Se houver contestação de
  cobrança (chargeback) ou ação depois da exclusão, o fornecedor não tem mais como provar o contrato.
- Por que importa: LGPD art. 16 permite conservar para cumprimento de obrigação legal e o art. 7º VI
  para exercício regular de direitos em processo [FNC]; hoje a Política e o código escolheram apagar.
- Correção sugerida: decisão com o advogado; se mantido, guardar `aceites` ligado ao `order_id` pelo
  prazo prescricional (CDC art. 27: 5 anos [FNC]) e dizer isso na tabela da Política.
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes

ID: LEGAL-114 | Prioridade: P3 | Confiança: CONFIRMADO
Local: privacidade/page.tsx:81 (linha "Marca da sua cópia"); termos art. 5; app/src/lib/marca-dagua.ts:4-5; worker/src/lib/aparelhos.js
- Problema: (a) a Política descreve só a marca INVISÍVEL ("um número aleatório, sem relação com o seu
  nome ou e-mail"); não diz que as aulas mostram na margem `ab•••@dominio` + "cópia XXXXXXXX", que
  é exatamente o que liga número e pessoa num print. Os Termos dizem. (b) A base legal escrita na
  Política cobre "registros de segurança e cópias de segurança" por legítimo interesse; marca
  d'água, limite de aparelhos com detecção de "rodízio" (mais de 6 entradas/24 h → aviso ao dono) e
  estatísticas não estão mapeados a nenhuma base. Legítimo interesse exige teste de balanceamento
  documentado (LGPD art. 10 e §3º [FNC]).
- Correção sugerida: uma linha na tabela para a marca d'água visível; um parágrafo de base legal
  ("legítimo interesse: proteção do conteúdo e da conta pessoal") e um LIA de uma página guardado
  internamente.
Complexidade: Mínima | Claude corrige sozinho?: Sim (texto); LIA: Revisar antes

ID: LEGAL-115 | Prioridade: P3 | Confiança: CONFIRMADO
Local: privacidade/page.tsx:252-258
- Problema: transferência internacional: lista Resend, Cloudflare, GitHub, Google e Meta e diz
  "amparada no art. 33 da LGPD", sem inciso e sem mecanismo. A Mercado Pago, que recebe nome e
  e-mail (seção 3), não aparece na frase; se o processamento dela ocorre fora do Brasil (grupo
  argentino), não está dito.
- Correção sugerida: citar o inciso que se quer usar (provavelmente art. 33, IX c/c art. 7º, V, ou
  cláusulas-padrão da Res. CD/ANPD 19/2024 [FNC]) e incluir a Mercado Pago ou dizer que ela trata
  no Brasil; parecer (seção 4).
Complexidade: Mínima | Claude corrige sozinho?: Revisar antes

ID: LEGAL-116 | Prioridade: P3 | Confiança: CONFIRMADO
Local: privacidade/page.tsx:42 e :51; db.js (nenhum purge de `orders`/`payment_events`)
- Problema: "Dados do pedido / Resultado do pagamento: pelo prazo legal de guarda fiscal", sem
  número, e o código não apaga nunca. Como o site não emite NFS-e (pendência do dono), "cumprir
  obrigação fiscal" ainda não tem documento fiscal correspondente.
- Correção sugerida: o contador dá o prazo (5 anos é o usual [validar]); escrever o número e criar
  a purga correspondente.
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes

ID: LEGAL-117 | Prioridade: P3 | Confiança: CONFIRMADO
Local: data/empresa.json:28-33; rodapé; /suporte; todas as políticas
- Problema: o canal oficial (atendimento, privacidade, desistência por e-mail) é um Gmail pessoal com
  outra marca (`languageswithmoshik@gmail.com`), enquanto o domínio próprio já existe e envia e-mails
  (`contato@hebraicofluente.com.br`). O mesmo Gmail recebe os avisos de compra e de desistência com
  o e-mail do aluno.
- Por que importa: Decreto 7.962 art. 2º exige um endereço eletrônico (cumprido), mas o canal
  compartilhado com outra atividade do dono mistura dados de alunos com outra operação, dificulta
  o controle de acesso (LGPD art. 46) e passa pouca formalidade num documento contratual. Somado ao
  LEGAL-101, o consumidor tem dois endereços e só um é lido.
- Correção sugerida: um endereço do domínio (ex.: `atendimento@` ou o próprio `contato@`) com
  encaminhamento para a caixa que o dono lê, e trocar em empresa.json e no SUPPORT_EMAIL.
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes (DNS/caixa são do dono)

ID: LEGAL-118 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/out (80 de 114 páginas sem CNPJ: /perfil, /licao/*, /modulo/*, /certificado, /depoimento, /inicio...)
- Problema: a identificação completa do fornecedor (razão social, CNPJ, endereço) está no rodapé das
  páginas públicas, no cadastro e no checkout, mas não nas páginas da plataforma logada, inclusive
  /perfil, onde fica o botão "Desistir da compra" e "Apagar minha conta". Ali há só links para
  Termos, Privacidade, Reembolso e Acessibilidade.
- Por que importa: Decreto 7.962 art. 2º pede a identificação "em local de destaque e de fácil
  visualização" no sítio [FNC]; a exigência mira a oferta (cumprida), então o risco é baixo.
- Correção sugerida: uma linha com razão social e CNPJ no rodapé do AppShell, ou o bloco
  `Identificacao` em /perfil.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: LEGAL-119 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/components/legal/Legal.tsx:56-75; termos/page.tsx:217-219 (art. 9); worker/src/lib/mercadopago.js:267-273
- Problema: qualidade e coerência dos documentos. (a) Todas as políticas, inclusive a Política de
  Privacidade e a Declaração de Acessibilidade, terminam com um bloco de venda "Tudo isso
  respondido? Então comece." + "Começar a aprender" + "Acesso imediato": soa pouco profissional num
  documento legal e, na Declaração de Acessibilidade, deslocado. (b) Os Termos art. 9 falam em
  "mudanças no **produto**", contra o enquadramento de serviço do art. 1. (c) A navegação ao pé das
  políticas lista Termos, Privacidade, Reembolso e FAQ, mas não Acessibilidade. (d) Pequenas
  divergências de prazo: Política diz "seis meses" para a trilha (código 180 dias) e para o registro
  de acesso (código 190 dias); FAQ diz "12 meses a partir da compra", Termos e checkout "contados
  da confirmação do pagamento"; FAQ conta a desistência "a partir do acesso", Reembolso "da compra
  ou da liberação, o que for mais favorável", e-mail "a partir de agora" (o código conta do
  `paid_at`, gravado na liberação: coerente, mas três redações).
- Correção sugerida: tirar o CTA de /privacidade e /acessibilidade (manter em Reembolso, se o dono
  quiser); "mudanças no serviço"; acrescentar Acessibilidade à navegação; unificar as redações de
  prazo ("da liberação do acesso").
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: LEGAL-120 | Prioridade: P3 | Confiança: CONFIRMADO
Local: termos/page.tsx:112-125 (art. 4) e :160-168 (art. 5)
- Problema: a cláusula de suspensão melhorou muito (aviso, 5 dias úteis, devolução do tempo), mas
  ainda (a) não diz o que acontece com o valor pago se o compartilhamento se confirmar (perda total
  do acesso sem reembolso proporcional é a leitura implícita); (b) o critério "quantidade de entradas
  ... muito acima do normal" é vago e não diz que o limite técnico é 6 em 24 h; (c) o art. 5 cita o
  Código Penal art. 154-A ("acessar ou tentar acessar dados da plataforma") para conduta que nem
  sempre é invasão de dispositivo; num contrato de consumo, tipificação penal genérica pode ser lida
  como intimidação.
- Correção sugerida: advogado redigir as consequências (proporcionalidade, reembolso), e manter só
  as referências legais que se aplicam.
Complexidade: Mínima | Claude corrige sozinho?: Não (redação jurídica)

ID: LEGAL-121 | Prioridade: P3 | Confiança: CONFIRMADO
Local: termos (ausente); worker/src/api/pay.js:148-151; db.js:496-538 (grantAccess estende do vencimento)
- Problema: a renovação existe (nova compra nos últimos 45 dias estende a partir do vencimento atual)
  e o checkout diz "Renovar é uma compra nova", mas os Termos não descrevem a renovação, nem como a
  desistência de uma renovação recua o prazo (db.js:559-596).
- Correção sugerida: um parágrafo no art. 1 ou 8 dos Termos.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: LEGAL-122 | Prioridade: P3 | Confiança: CONFIRMADO
Local: privacidade/page.tsx (item 6); app/src/app/perfil/PerfilClient.tsx:73-80
- Problema: continua o LEGAL-005 em parte: não há "baixar meus dados" (portabilidade/acesso em
  formato estruturado), o nome não é editável pelo aluno, o e-mail só por pedido; a Política promete
  "até 15 dias" sem mencionar o formato simplificado imediato do art. 19, I [FNC].
- Correção sugerida: procedimento interno escrito para pedidos LGPD (quem atende, como confirma a
  identidade, o que entrega: JSON de `progress` + lista de pedidos); idealmente um botão em /perfil.
Complexidade: Média | Claude corrige sozinho?: Sim (botão); procedimento: Revisar antes

ID: LEGAL-123 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/check-legal.mjs
- Problema: o check cobre identificação, links e checkout, mas não cobre: /acessibilidade gerada e
  linkada; versão × texto (LEGAL-104); data do pré-lançamento vencida (LEGAL-108); Termos e FAQ
  coerentes com `formas` (LEGAL-103).
- Correção sugerida: acrescentar essas quatro verificações.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: LEGAL-124 | Prioridade: P3 | Confiança: PRECISA VERIFICAÇÃO MANUAL
Local: app/out/sobre e capa (Fecho/Trajetoria): "Gerente Pedagógico da New School, em Tel Aviv", "professor na Universidad Isaac Abarbanel", "Formação CELTA e Letras" (o texto longo diz "estudos em Letras - Inglês (UNINTER)")
- Problema: continua LEGAL-024: credenciais que sustentam a venda, sem prova verificável; "Formação
  ... Letras" no cartão pode ser lido como graduação concluída, e o texto longo diz "estudos".
- Correção sugerida: o dono guardar comprovantes; se a graduação não estiver concluída, usar
  "estudos em Letras" também no cartão (CDC art. 37 e 38: ônus da prova é do anunciante).
Complexidade: Mínima | Claude corrige sozinho?: Revisar antes

ID: LEGAL-125 | Prioridade: P3 | Confiança: ALTA CONFIANÇA
Local: worker/src/api/auth.js (registrarAcesso só em cadastro, login, senha redefinida); db.js:236-256
- Problema: o "registro de acesso" do Marco Civil é gravado só nas entradas na conta, não no uso
  (a sessão vale 7 dias e é renovada por /api/me). O art. 5º, VIII define registro de acesso a
  aplicação como data e hora de USO a partir de um IP [FNC]. A prática de registrar só o login é
  comum, mas a suficiência é questão jurídica.
- Correção sugerida: parecer; se necessário, gravar também a renovação de sessão (1 por dia por conta).
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes

---

## 2. Contradições entre documentos e comportamento (resumo)

| Tema | Onde diz o quê | Estado |
|---|---|---|
| Desistência por e-mail | Termos art. 8: confirmação "na hora"; Reembolso: "em até 2 dias úteis"; recibo: "responda este e-mail" (vai para `contato@`, não para o Gmail) | Contradição + risco (LEGAL-101, 109) |
| Preço PIX | Termos/FAQ mostram R$ 132,30 no PIX mesmo quando a build desliga o PIX; rodapé, capa e checkout escondem | Contradição condicional (LEGAL-103) |
| Liberação | CTA "Acesso imediato" e Termos art. 2 "em minutos" × checkout pix-direto "até 2 dias úteis, à mão" | Contradição condicional (LEGAL-103) |
| Parcelamento | Termos/FAQ: "há juros"; checkout, capa, rodapé: "em até 12x" sem juros | LEGAL-102 |
| Versão do contrato | recibo "versão de DD/MM" com link para a versão atual; mesma versão para textos diferentes | LEGAL-104 |
| Não retroação | Termos art. 9 × limite de aparelhos e marcas aplicados a todas as contas; Política promete aviso por e-mail, não implementado | LEGAL-105 |
| Depoimento | "O texto não é editado por ninguém" × depoimento da Natália cortado sem "[...]"; "sai em até 7 dias" sem gatilho | LEGAL-106, 107 |
| Menores | Termos admitem uso com responsável; Política "não coletamos conscientemente" | LEGAL-112 |
| Conteúdo | "O conteúdo é nosso" × "O conteúdo do livro dele é a base" | LEGAL-111 |
| Serviço × produto | Termos art. 1 "serviço/cursos online" × art. 9 "mudanças no produto" | LEGAL-119 |
| 12 meses | FAQ "a partir da compra"; Termos/checkout "da confirmação do pagamento"; código: da liberação, e renovação estende do vencimento (não descrita) | LEGAL-119, 121 |
| Prazos de guarda | Política "seis meses" × código 180 d (trilha) e 190 d (Marco Civil, IP da desistência) | Coerente na prática; redação |
| Marca d'água | Termos descrevem a visível com e-mail; Política só a invisível "sem relação com o e-mail" | LEGAL-114 |
| Canal oficial | Gmail pessoal de outra marca como canal; domínio próprio só envia | LEGAL-117 |
| Cookies | Política: "um cookie de sessão" | Verdadeiro: renderizado só `__Host-hf_session` (HttpOnly, 7 d); `__Host-hf_admin` só para o dono. PASS |
| Analytics | Política: sem script de terceiros; estatísticas só em contagens | Verdadeiro no código (estatisticas.js sem conta/IP/horário, 365 d; ab.js só totais; analytics.ts sem sink; CSP aplicada `script-src 'self'` bloqueia beacon). PASS, com a ressalva do LEGAL-001 |

## 3. O que está bem (PASS verificado)

- Identificação do fornecedor no rodapé de todas as páginas públicas, no cadastro e no checkout
  (razão social, CNPJ, endereço, e-mail, WhatsApp, horário, prazo); `check-legal` passa.
- Checkout (renderizado): "Condições desta compra" com o que leva, 12 meses, pagamento único sem
  renovação automática, o que não vem junto, quando abre (condicionado ao modo), 7 dias e links.
- Desistência pelo site com confirmação imediata e estorno automático via Mercado Pago
  (pay.js:355-389, 404-463), painel /admin/estornos para os manuais e lembrete diário. Prazo contado
  da liberação até 23:59 do 7º dia (mais favorável).
- Aceite dos Termos no cadastro por caixa desmarcada, conferido no servidor (auth.js:318-329), com
  data e versão em `aceites`; Política apenas informada (base legal correta: não é consentimento).
- Marketing: opt-in desmarcado em /perfil, link de saída assinado sem expiração, POST em página
  própria (não descadastra por prefetch), sem freio para sair, apagado com a conta; Política com
  base em consentimento.
- Retenções agora escritas e implementadas: trilha 180 d, Marco Civil 190 d, IP da desistência
  zerado em 190 d, backups 90 d (regra de ciclo de vida no R2, scripts/backup-nuvem.sh:41-42,
  168-170), estatísticas 365 d; tudo chamado em reconcile.js:107-111.
- Exclusão de conta self-service, atômica, cobrindo progress, entitlements, convites, verificações,
  novidades, aceites, depoimentos, marcas e aparelhos.
- Sem dado sensível: onboarding pergunta motivo entre viagem, família, morar, idiomas, trabalho,
  outro (sem religião); voz não sai do aparelho na gravação; reconhecimento de voz informado.
- Certificado diz na imagem "Não é um certificado oficial de proficiência"; Termos e FAQ idem.
- Declaração de Acessibilidade publicada, fora do portão, com limitações e canal (LBI art. 63).
- Plano de incidentes (INCIDENTES.md) com ANPD em 3 dias úteis.
- Áudio "gravado por falante nativo": 539 clipes no catálogo, 0 sem arquivo em app/public/audio.
- Cursos A1/A2/B1 sem preço e "Ainda não está à venda" (renderizado).
- Preço cheio sem traço, com data de fim ("Pré-lançamento até 31/10/2026 · depois, R$ 297").

## 4. Para o advogado (só o que exige análise profissional)

1. LEGAL-101/109: se a desistência por resposta ao recibo, enviada a um endereço sem leitura, conta
   como exercida; redação do canal de e-mail e da confirmação imediata (Decreto 7.962 art. 5º §4º).
2. LEGAL-110 e PIX "em até 10 dias úteis": se atendem ao art. 49 parágrafo único ("de imediato");
   juros do parcelamento no estorno.
3. LEGAL-111: escopo da autorização do Dr. Damián Dzienciarsky (obra derivada comercial, prazo,
   território, crédito) e redação do art. 5 dos Termos.
4. LEGAL-112: ECA Digital (Lei 15.211/2025, vigência e deveres) e LGPD art. 14 para um curso "para
   adultos" que admite uso de menor com responsável; validade da declaração de idade embutida no
   aceite dos Termos (decisão do dono) como prova.
5. Res. CD/ANPD 2/2022: confirmar que nenhum tratamento é de alto risco (o que tiraria a dispensa de
   encarregado); o limite de aparelhos com detecção de rodízio e a marca por aluno são monitoramento?
6. LEGAL-114: legítimo interesse para marca d'água, limite de aparelhos e estatísticas (LIA).
7. LEGAL-115: instrumento de transferência internacional para Cloudflare, Resend, GitHub, Google,
   Meta e (se aplicável) Mercado Pago após a Res. CD/ANPD 19/2024.
8. LEGAL-113: guardar a prova do aceite após a exclusão da conta (art. 7º VI / art. 16).
9. LEGAL-120: cláusula de suspensão (consequência financeira) e menção ao Código Penal.
10. LEGAL-125: suficiência do registro de acesso só nas entradas (Marco Civil art. 15).
11. LEGAL-107: forma mínima da autorização do depoimento e do corte.
12. LEGAL-108: o que fazer em 01/11/2026 se o preço não subir.

## 5. Pendências fora do código (registradas, sem ID novo)

- Nota fiscal: o site não emite NFS-e (pendência do dono com o contador). O recibo se chama
  "comprovante da sua compra", o que é correto como comprovante comercial, mas não substitui a NFS-e;
  a Política fala em "cumprir obrigação fiscal". Perguntas ao contador: as 8 do §8 de 28/09
  continuam abertas, em especial NFS-e por venda a pessoa física em Curitiba e prazo de guarda.
- Razão social e endereço: conferir que "Mhg Treinamentos e Idiomas" e "Rua Bom Jesus, 434" batem
  exatamente com o cartão CNPJ (não verificável daqui).
- Compra real ponta a ponta com desistência (ANTES-DE-VENDER item 6): é o único teste que prova
  LEGAL-102 (tela da MP com total), LEGAL-110 (juros) e o recibo.

---

## 6. Estado da auditoria de 28/09 (D-legal)

| Item | Estado hoje | Evidência |
|---|---|---|
| LEGAL-001 beacon Cloudflare | CONTINUA NÃO VERIFICADO (configuração da zona); a promessa da Política segue verdadeira enquanto a CSP aplicada (`script-src 'self'`) bloquear | worker.js:265; sem acesso ao painel |
| LEGAL-002 retenções omitidas | RESOLVIDO | tabela da Política; db.js:278 purga IP da desistência; reconcile.js:111 |
| LEGAL-003 operadores | RESOLVIDO (GitHub, Google, Meta); resta MP na frase de transferência | LEGAL-115 |
| LEGAL-004 "primeiro nome" | RESOLVIDO ("o nome da sua conta") | privacidade seção 3 |
| LEGAL-005 direitos | PARCIAL | LEGAL-122 |
| LEGAL-006 encarregado | RESOLVIDO no texto (ME); falta parecer de alto risco | seção 4, item 5 |
| LEGAL-007 backups | RESOLVIDO (90 d, R2 privado); conferir a regra no bucket | backup-nuvem.sh |
| LEGAL-008 incidentes | RESOLVIDO | INCIDENTES.md:112-120 |
| LEGAL-009 aceite no cadastro | RESOLVIDO (caixa + registro); novos problemas de versão | LEGAL-104 |
| LEGAL-010 voz na capa | RESOLVIDO | Política, "Correção da pronúncia" |
| LEGAL-011 prazo fiscal / convites | PARCIAL (convites listados; prazo sem número) | LEGAL-116 |
| LEGAL-012 localStorage | RESOLVIDO (frase genérica de preferências) | Política seção 4 |
| LEGAL-013 processo de estorno | RESOLVIDO em grande parte (estorno automático MP, /admin/estornos, lembrete); novo risco no canal de e-mail | LEGAL-101 |
| LEGAL-014 preço riscado | RESOLVIDO (sem traço, com data); novo risco de prazo | LEGAL-108 |
| LEGAL-015 juros | PARCIAL (Termos/FAQ corretos; checkout, capa, rodapé não) | LEGAL-102 |
| LEGAL-016 juros no estorno / parcial | CONTINUA | LEGAL-110 |
| LEGAL-017 pix-direto "minutos" | RESOLVIDO no checkout/FAQ/rodapé; resta Termos art. 2 e CTA | LEGAL-103 |
| LEGAL-018 suspensão sem aviso | RESOLVIDO (aviso, 5 dias úteis, devolução do tempo); resta consequência financeira | LEGAL-120 |
| LEGAL-019 e-mail promocional | RESOLVIDO (opt-in, saída, Política) | novidades.js |
| LEGAL-020 encerramento | RESOLVIDO (art. 7, 30 dias, pro rata) | Termos |
| LEGAL-021 preço de curso inexistente | RESOLVIDO | /cursos/hebraico-a1 "Ainda não está à venda" |
| LEGAL-022 ECA Digital | CONTINUA (parecer) + contradição nova | LEGAL-112 |
| LEGAL-023 autorização do depoimento | PARCIAL (fluxo novo bom; Natália continua sem prova e com corte não sinalizado) | LEGAL-106, 107 |
| LEGAL-024 credenciais | CONTINUA | LEGAL-124 |
| LEGAL-025 puffery | OK | sem mudança |
| LEGAL-026 declaração de acessibilidade | RESOLVIDO | /acessibilidade |

Resumo: dos 26 itens de 28/09, 17 resolvidos (ao menos no essencial), 1 sem ação necessária (025), 4 parciais, 3 continuam e 1 não verificável daqui.

## 7. Nota da área: 76/100

O trabalho desde 28/09 foi grande e na direção certa: os documentos estão claros, coerentes com o
código na maior parte, as retenções existem de fato, a desistência é automática e o marketing tem
opt-in de verdade. O que impede subir:
- LEGAL-101: o recibo manda "responder" para um endereço que pode não ser lido (P1, verificação de 5
  minutos e correção de 1 linha);
- a oferta parcelada sem "com juros" no checkout e na capa (LEGAL-102);
- textos de preço e liberação que não acompanham as formas ativas (LEGAL-103);
- versão do contrato que não prova o texto aceito e link do recibo que muda (LEGAL-104);
- promessas sem mecanismo: retirada de depoimento em 7 dias, aviso de mudança de política, fim do
  pré-lançamento em 31/10 (LEGAL-105, 106, 108).

## 8. Os 5 maiores problemas da área

1. LEGAL-101 (P1): e-mails sem `reply_to` mandam "responda este e-mail" (inclusive para desistir)
   para `contato@hebraicofluente.com.br`, cuja caixa não está comprovada.
2. LEGAL-102 (P2): checkout, capa e rodapé anunciam "em até 12x" sem dizer que há juros.
3. LEGAL-104 (P2): a versão aceita é uma data comum a todas as políticas, já gravada para dois
   textos diferentes, sem arquivo das versões; o recibo linka a versão atual.
4. LEGAL-103 (P2): Termos e FAQ prometem R$ 132,30 no PIX e liberação em minutos mesmo quando a build
   desliga o PIX ou está em pix-direto.
5. LEGAL-108 + LEGAL-106 (P2): prazos públicos sem mecanismo: pré-lançamento "até 31/10/2026" sem
   nada que o faça valer, e "o depoimento sai em até 7 dias" sem aviso ao dono quando o aluno retira.
