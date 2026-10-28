# Plano: a versão em inglês do curso de alfabetização

Decisões do dono (28/10/2026): domínio próprio em inglês, preço em dólar, revisão
por nativos que o dono conhece.

## A arquitetura

Um repositório só, um banco só, dois sites.

- **Mesmo código, duas builds.** `NEXT_PUBLIC_LOCALE=en` gera o export em
  inglês em `app/out-en/`; sem a variável, sai o português de hoje, igual.
  Nada do site brasileiro muda de comportamento.
- **Um segundo Worker** (`wrangler.en.toml`): o mesmo `worker/src/worker.js`,
  o mesmo D1, os ativos de `app/out-en/`, as rotas do domínio em inglês e as
  variáveis próprias (`SITE_ORIGIN`, `LOCALE=en`, o provedor de pagamento).
  Uma conta criada num site entra no outro; o curso comprado vale nos dois.
- **Conteúdo:** os campos `...Pt` de `data/*.json` continuam a fonte. O inglês
  mora em `data/en/*.json`, por id (`alef.ensino.funcaoPt` → texto em inglês),
  e o exportador junta os dois na build em inglês. Campo sem tradução faz a
  build em inglês FALHAR, para nunca sair português no site de fora.
- **Interface:** os textos fixos saem do código para dicionários
  (`app/src/i18n/pt.ts` e `en.ts`), tela por tela. O `pt.ts` guarda o texto de
  hoje palavra por palavra, então os testes atuais continuam valendo.
- **O hebraico não muda.** As 539 gravações servem aos dois sites. Nenhum
  hebraico novo entra por causa do inglês.

## O que é adaptação, não tradução

1. **Transliteração no padrão do inglês** (Aleph, Lamed, "ch" de ח, sílaba
   forte sem acento gráfico). Arquivo próprio, `data/en/translit.json`.
2. **Notas de pronúncia** (`paraBrasileiroPt`, `comoPt`): reescritas
   comparando com os sons do inglês.
3. **Leitura das instruções por voz:** voz en-US do aparelho.
4. **Legal:** Termos, Privacidade e Reembolso escritos para o público de fora
   (GDPR, leis dos EUA), com o advogado. Não são tradução dos brasileiros.
5. **Pagamento em dólar** por um "merchant of record" (Paddle ou Lemon
   Squeezy), que recolhe o imposto de cada país. O acesso continua sendo
   liberado pelo mesmo caminho (`applyPayment`), com um webhook novo.

## As etapas

| # | Etapa | Prazo | Quem |
|---|---|---|---|
| 1 | Estrutura de idiomas, segundo Worker, build em inglês | 1 a 2 semanas | Claude |
| 2 | Primeira versão da tradução (curso e interface) | 3 a 5 dias | Claude |
| 3 | Adaptação: transliteração e pronúncia | 1 a 2 semanas | Claude, aprovação do dono |
| 4 | Revisão por nativos | 1 a 3 semanas | revisores do dono |
| 5 | Pagamento em dólar | 1 a 2 semanas | Claude e contador |
| 6 | Termos e Privacidade de fora | 1 a 3 semanas | advogado |
| 7 | Página de venda, SEO e cartões do link | 1 semana | Claude |

## Para os revisores

Cada lote de tradução sai como uma planilha (id, português, inglês, coluna
de comentário), para revisar sem abrir código. O comentário volta para
`data/en/` e a build seguinte já mostra.

## Pendente com o contador

Venda ao exterior é exportação de serviço (ISS, câmbio, nota). Continua sendo
ensino de idiomas (CNAE 8593-7/00), mas a nota de cada venda em dólar precisa
ser confirmada antes da primeira cobrança.
