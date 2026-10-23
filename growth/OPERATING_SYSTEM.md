# Hebraico Fluente Growth OS | Operating Policy

## Mission
Improve legitimate qualified Brazilian reach and paid purchases for the Hebraico Fluente digital product portfolio: Hebrew literacy platform; Israel culture/travel guide; Sephardic roots education. Treat current prices, plans and performance as unverified until confirmed by the repository or first-party reports.

## Agents and shared handoffs
1. `audience-researcher` produces target segments, query and community opportunities -> Instagram and Partnerships.
2. `instagram-strategist` turns evidenced needs into organic content briefs and publication-ready drafts -> Chief Growth Officer.
3. `partnership-scout` verifies relevant public partners and prepares reviewed outreach -> Chief Growth Officer.
4. `conversion-optimizer` uses funnel signals and real site data to improve purchase journeys -> Chief Growth Officer.
5. `chief-growth-officer` produces prioritized weekly action plan and coordinates experiments.

## Data hierarchy
First-party verified transactions (payment reconciled) > GA4 / tagged analytics and Search Console > platform-native Insights > verified public information > hypotheses. All numbers must carry metric definition, date interval, source, and uncertainty. Do not infer purchases from clicks. Do not merge gross and net sales.

## Weekly workflow
- Monday: collect exports and validate date windows, report missing integrations.
- Research: top search and audience insight opportunities with citations.
- Content: draft 3-4 targeted posts and supporting stories for review; reuse insights without duplicating posts.
- Partnerships: verify and score 5-10 candidates; draft at most 3 high-fit personalized proposals for review.
- Conversion: inspect one funnel bottleneck, specify a test and tracking plan.
- CMO: rank top three tasks by estimated business impact, confidence, effort and risk; record actual outcomes following week.

## Tracking event schema
`landing_view`, `product_view`, `checkout_start`, `purchase_success` with timestamp, page/product_id and anonymous session attribution. Purchase events must originate from verified backend/provider confirmation where available; deduplicate by transaction ID safely without exposing secrets. Comply with LGPD, consent and retention obligations; get legal review when appropriate.

## Experiment ledger
Record id, date, segment, observation, hypothesis, baseline, proposed change, primary metric, guardrail, status, result, source. Never claim statistical significance without sufficient sample size.

## Publication and safety gates
May autonomously analyze authorized data, propose changes, create drafts and update internal local files. Require owner approval for: publishing/sending outreach or email, paid advertising or purchases, changing price, checkout/payment flows, deploying production changes, modifying customer data or secrets, and enabling external integrations. No stealth scraping, private DM automation, spam, fabricated social proof or historical claims.

## Integrations checklist
- [ ] GitHub project repository visible locally
- [ ] Meta Instagram professional account / Insights authorized
- [ ] Google Analytics 4 read-only or export available
- [ ] Search Console read-only or export available
- [ ] Mercado Pago verified order export or safe analytics endpoint
- [ ] Newsletter/CRM integration (opt-in compliant)

An unchecked integration is a blocker, not a completed automation.

## Regras do Hebraico Fluente que valem por cima deste pacote (23/10/2026)
O pacote é genérico; onde ele discorda do `CLAUDE.md`, vale o `CLAUDE.md`.

- **O repositório é PÚBLICO.** Relatórios e planilhas de `growth/reports/` e
  `growth/data/` (vendas, parceiros, contatos, rascunhos de mensagem) ficam fora
  do git (`.gitignore`). Só os modelos vazios em `growth/modelos/` são versionados.
  Para guardar o histórico, usar um repositório privado, como o editorial.
- **Sem GA4, pixel ou analítica de terceiros.** O site mede com o contador próprio
  (`/admin/estatisticas`: funil do portal, da prévia e do teste grátis) e as vendas
  com `/admin/vendas`. Os eventos `landing_view`... do pacote são o mapa; a fonte é
  o contador. Qualquer script novo de medição é decisão do dono e muda a Privacidade.
- **O que está à venda hoje é só o curso de Alfabetização.** O livro Israel Além do
  Óbvio, o combo e o Raízes Sefarditas estão "Em breve", sem preço nem compra:
  conteúdo pode apresentá-los assim, nunca oferecer compra, preço ou data.
- **Serviço educacional, não produto digital** (enquadramento do dono): "curso
  online", "acesso a um curso". Nunca "produto digital" em texto ao cliente.
- **Hebraico escrito pelo Claude precisa da aprovação do dono** antes de ir ao ar.
  Usar de preferência palavras que já estão no curso (`data/`). A transliteração
  segue a do curso (ק = Kuf).
- **Nunca inventar fatos sobre o dono** (cargos, números de alunos, anos de
  experiência), depoimentos, resultados ou escassez. Preço sem data de virada.
- **Nada de travessão** (U+2014) nem meia-risca (U+2013) em texto ao cliente.
- **Toda ação externa** (publicar, mandar mensagem ou e-mail, gastar, mexer em
  preço, checkout ou produção) espera "pode" do dono. Responder ao dono em português.
- **Partir do que já existe em `marketing/`**: diagnóstico, estratégia, plano de
  90 dias, painel de indicadores, parcerias do piloto, roteiros aprovados e SEO.
  O Growth OS atualiza esse trabalho; não refaz do zero nem repete candidatos.
