# Minha Caravana Digital: notas para quem trabalha aqui

Produto SEPARADO do Hebraico Fluente, apesar de morar na pasta `caravana/` do
mesmo repositório. Não reutilizar marca, fontes, cores, textos ou código do
Hebraico Fluente. Responder ao dono em português.

- **Escrita sem travessão**: hífen `-` em todo texto, código, comentário e commit
  (a verificação do repositório, no CLAUDE.md da raiz, cobre esta pasta também).
- **Banco**: toda regra de negócio passa por `withScope` (papel + RLS). `withSystem`
  só em autenticação e scripts. Tabela nova de agência leva `agency_id`, política
  `agency_own` e chave composta com `caravans` (ver db/migrations/0001_security.sql).
- **Mudança de esquema**: editar `src/lib/db/schema.ts`, rodar `npm run db:generate`
  e conferir o SQL. Políticas e gatilhos vão em migração escrita à mão
  (`npx drizzle-kit generate --custom --name=...`). Nunca apagar a pasta de migrações.
- **PGlite aceita um processo só**: pare o `npm run dev` antes de `db:seed`,
  `db:reset` ou `user:create` (o cliente recusa abrir se outro processo estiver com o banco).
- **O viajante só lê o retrato publicado** (`caravan_publications.snapshot`).
  Campo novo que o viajante vê entra em `buildSnapshot` e em `diffSnapshots`.
- **Conteúdo**: fato, tradição e interpretação sempre separados; nada inventado;
  destino sem texto revisado fica "em preparação". Ver docs/CONTENT_GUIDELINES.md.
- **Hebraico escrito pelo Claude** nasce `pending_native_review` e só vai a uma
  caravana real depois da revisão de um falante nativo.
- **Demonstração** mora na agência `is_demo`; nunca misturar com dados reais e
  sempre rotular na tela.
- **Nenhum identificador de modelo** em commits, PRs ou arquivos.
- Antes de commitar: `npm run typecheck && npm run lint && npm test && npm run build && npm run e2e`.
