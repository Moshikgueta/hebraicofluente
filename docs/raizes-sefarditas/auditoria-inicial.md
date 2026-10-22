# Raízes Sefarditas: auditoria inicial

Data: 21-22/10/2026. Feita lendo o código deste repositório e o de
`Moshikgueta/hebraicofluente-editorial` (onde mora Israel Além do Roteiro).
Tudo abaixo cita arquivo; o que não foi achado está dito como não achado.

## 1. O que foi encontrado

### Plataforma (este repositório)

| Peça | Onde | Observação |
| --- | --- | --- |
| Front-end | `app/` (Next 15, React 19, Tailwind 4, export estático) | Rotas em `app/src/app`, componentes em `app/src/components`. |
| API e portão | `worker/` (Cloudflare Workers, D1) | `worker/src/gate.js` fecha as rotas pagas; `worker/src/api/content*.js` entrega o conteúdo pago. |
| Contas e sessão | `worker/src/api/auth.js`, `lib/session.js`, `lib/aparelhos.js` | Cookie `__Host-hf_session`, três aparelhos por conta. |
| Direito de acesso | tabela `entitlements`, `hasEntitlement` em `worker/src/lib/db.js` | Por `course_slug`. Concedido pela compra ou à mão (Actions → Acesso → `liberar`). |
| Catálogo e preço | `data/courses.json` + `worker/src/lib/catalog.js` | O preço sai só daqui. `isSellable` exige `status: available` e `engine`. |
| Checkout | `worker/src/api/pay.js`, Mercado Pago, PIX direto como reserva | Não foi alterado. |
| Progresso | `app/src/lib/state/*` | Um blob por conta (`/api/progress`), fusão monotônica em `merge.ts`, localStorage embrulhado. |
| Segundo curso já existente | Hebraico A1: `/a1`, `data/a1/`, `api/content-a1.js`, `lib/a1.ts`, `state/a1-estado.ts` | É o molde que Raízes seguiu: outro direito, outra rota de conteúdo, chave própria no estado. |
| Proteção do conteúdo | `api/content.js`, `pacote.mjs`, `tests/conteudo.test.ts`, marca invisível (`lib/marca.js`), marca d'água visível | O conteúdo pago nunca vai no pacote público. |
| Certificado | A1: `api/exame-a1.js` (corrigido e emitido no servidor), `/verificar-certificado` | Alfabetização: `/certificado`. |
| Design | `app/src/styles/tokens.css`, `components/ui/*` | Navy, teal, gold, creme; tema escuro só na plataforma (`data-plataforma`). |
| Acessibilidade | `BotaoAcessibilidade`, `a11y.mjs`, `escuro.mjs` | Alvos de 44 px, contraste medido. |
| Revisão espaçada | só nos cursos de hebraico (SRS por letra; Leitner no A1) | Amarrada a ids de letra e de item de hebraico. |

### Israel Além do Roteiro (`hebraicofluente-editorial`)

- É um e-book (PDF e versão web) com pipeline próprio: manuscrito em Markdown,
  `fontes/capNN.json`, `afirmacoes/capNN.json`, validador, gerador.
- `PROTOCOLO.md`: níveis de fonte A-E, status (VERIFICADO, CONTESTADO,
  PARCIALMENTE VERIFICADO, NÃO VERIFICADO), forma de acesso honesta
  (`trecho-de-busca`, `referencia-confirmada`, `texto-integral`).
- `redesenho/DESIGN-SYSTEM.md` e `templates/tokens-editorial.css`: a coleção
  editorial (pedra, mar, Neguev, oliveira), Literata nos títulos.
- `comercial/PROPOSTA-LOJA.md`: a integração com a loja é **só proposta**; o
  documento aponta o problema de enquadramento (seção 6 abaixo).
- O README do editorial cita `scripts/ebook-no-site.sh` neste repositório; o
  arquivo **não existe** na `main` de hoje. Não foi procurado em outros ramos.

## 2. O que foi reutilizado (sem duplicar)

- Conta, login, cookie, aparelhos, portão e o desenho de "conteúdo atrás de
  `/api/content/<produto>`": o mesmo do A1, com o direito `raizes-sefarditas`.
- `CourseGate` (generalizado para três produtos), marca invisível e marca
  d'água, `blindar()` (a rota nova passa pelo mesmo `worker.js`).
- O estado do aluno e a fusão entre aparelhos: chave nova e opcional `raizes`,
  com regra própria em `merge.ts` (exigência do `CLAUDE.md`).
- O protocolo editorial inteiro: formato de `fontes.json` e
  `afirmacoes.json`, níveis, status e forma de acesso.
- Tokens da marca e uma subidentidade emprestada da coleção editorial
  (`--rz-pedra`, `--rz-mar`, `--rz-terra`, com versão para o tema escuro).
- `components/ui/Button`, `<He>` (todo hebraico), `DemoNotice`, `SessaoCaiu`.

## 3. O que foi adaptado

- `worker/src/gate.js`: prefixo `/raizes` → `raizes-sefarditas`; sem o direito,
  vai para `/cursos/` (não há página de venda).
- `app/src/lib/seo.ts`: `/raizes` em `PAGAS` (noindex, fora do sitemap).
- `components/shell/Chrome.tsx`: `/raizes` tem casca própria (`RaizesShell`),
  sem o menu, o XP e a barra do curso de hebraico. Pedido do dono em
  22/10/2026: é um produto individual, comprado à parte, no mesmo site e com a
  mesma conta.
- `tools/export-content.mjs`: exporta `app/content/raizes.json` só com as
  afirmações que podem ir ao texto.
- `app/pacote.mjs`: a prosa do Raízes entra na conferência de vazamento.

## 4. O que foi desenvolvido

- `data/raizes/`: `curso.json` (os 10 módulos, conquistas, certificado),
  `modulos/m01.json`, `fontes.json` (46 fontes), `afirmacoes.json` (35),
  `mapa-peninsula.json` (gerado por `tools/raizes-mapa.mjs`, Natural Earth).
- `worker/src/api/content-raizes.js` e a rota `GET /api/content/raizes`.
- `app/src/lib/raizes.ts`, `app/src/lib/state/raizes-estado.ts`.
- `app/src/components/raizes/`: texto com fontes, atividades, mapa, blocos,
  casca.
- Rotas `/raizes`, `/raizes/modulo/1`, `/raizes/biblioteca`.
- `app/tests/raizes.test.ts` (30 casos) e `app/raizes.mjs` (navegador, 390 px).

## 5. Riscos técnicos

| Risco | Situação |
| --- | --- |
| Conteúdo pago vazar para o pacote | Coberto: import só no ramo local, teste e `pacote.mjs`. |
| Um produto abrir o outro | Coberto em teste nos dois sentidos. |
| Perder a conclusão de uma atividade ao recarregar logo depois | Achado no navegador: o gravador espera 250 ms e não descarrega ao sair. Corrigido **só para Raízes** (`gravador.agora()` ao registrar atividade). O mesmo risco existe no curso de hebraico e **não foi mexido**: ver pendências. |
| Cota de escrita do D1 | Visitar etapa só grava quando muda o lugar. Raízes usa o mesmo `PUT /api/progress`, que já tem freio. |
| Dados genealógicos (módulo 9) | Ainda não construído. Decisão: não entram no blob do servidor; só no aparelho. |
| Limite de 10 ms de CPU do Worker | A rota de conteúdo é igual à do A1 (molde montado uma vez). |
| `MarcaDagua` mostra o número da cópia lido do conteúdo do alfabeto | Para quem só tem Raízes, a marca sai sem número. Igual ao A1 hoje. |

## 6. Dependências e decisões que são do dono

1. **Vender: preço e catálogo.** O dono decidiu (22/10/2026) que Raízes é
   vendido à parte. Falta o preço. Até lá o produto **não está** em
   `data/courses.json` e ninguém consegue comprá-lo; o acesso só existe
   concedido à mão. Ligar a venda é uma linha no catálogo (com `tipo`/`engine`
   próprios) e testes de pagamento, sem mexer no checkout.
2. **Enquadramento (CLAUDE.md, "Enquadramento").** A empresa está em ensino de
   idiomas (CNAE 8593-7/00). Um curso de história e genealogia é serviço
   educacional, mas não de idioma. Isto é o aviso que a regra pede antes da
   venda: confirmar com o contador se o CNAE atual cobre, e como sai a nota.
   Os Termos dizem, no artigo 1, que o site oferece "cursos online de
   hebraico" (`app/src/app/termos/page.tsx`): precisam mudar antes da venda,
   com versão nova das políticas (`politicas.atualizadoEm`).
3. **Revisão humana.** Nenhuma afirmação foi conferida no texto integral (o
   ambiente só lê trechos de busca). Condição para vender.
4. **Hebraico.** `docs/raizes-sefarditas/hebraico-para-aprovar.md`.
5. **"Conteúdo só no presente"** (`CLAUDE.md`): a regra foi lida como regra do
   hebraico ensinado. O texto em português de um curso de história está no
   passado. Confirmar.
6. **Nacionalidade portuguesa ou espanhola**: o percurso não fala disso, de
   propósito. Se algum módulo for falar, precisa de consulta à legislação
   vigente, datada.

## 7. Plano de implementação

| Fase | Estado |
| --- | --- |
| 1. Auditoria técnica | Este documento. |
| 2. Dossiê acadêmico | `dossie-academico.md`, `data/raizes/fontes.json`, `afirmacoes.json`. Módulo 1 pesquisado; módulos 2-10 só com o plano. |
| 3. Arquitetura pedagógica | `plano-pedagogico.md`. |
| 4. Sistema de design | Tokens `--rz-*`, componentes em `components/raizes`, casca própria. |
| 5. Protótipo vertical | Módulo 1 completo e funcionando (conferido em navegador). |
| 6. Módulos 2-10 | Não feito. Cada um pede a mesma rodada: pesquisa, matriz, conteúdo, teste. |
| 7. Laboratório genealógico | Não feito (módulo 9). Desenho e regras de privacidade em `plano-pedagogico.md`. |
| 8. Integração comercial | Não feito: depende do preço e do item 6.2. |
| 9. Auditoria | Interna, parcial: `checklist-de-lancamento.md`. |
| 10. Entrega | Ramo `claude/sweet-hawking-8zj0le`, PR aberto, sem merge. |
