# Banco de dados

PostgreSQL. Esquema em `src/lib/db/schema.ts`; migrações em `db/migrations/`:

- `0000_init.sql`: tabelas e índices, gerado pelo drizzle-kit.
- `0001_security.sql`: papéis, permissões por tabela e por coluna, RLS, chaves
  compostas e gatilhos. Escrito à mão e comentado.

## Modelo

```
plans
agencies ── branding_settings
   │ └── agency_memberships ── users ── sessions, user_tokens
   │
   └── caravans ──┬── caravan_days ── stops ──> destinations
                  ├── caravan_contents ──> destinations
                  ├── caravan_info_items
                  ├── caravan_publications (retratos versionados)
                  └── participant_access (convites) ──┬── participant_devices
                                                      ├── question_answers
                                                      ├── activity_completions
                                                      ├── participant_badges
                                                      └── content_views

biblioteca (da plataforma):
destinations ── cultural_contents ── cultural_content_revisions
hebrew_expressions ──> audio_assets
activities ── activity_questions
passport_badges
media_assets

rate_limits, audit_logs
```

| Tabela | Papel |
| --- | --- |
| `plans` | planos comerciais: preço, unidade (participante ou grupo), recursos |
| `agencies` | cliente; `is_demo` separa a demonstração; contrato padrão (plano, vagas por caravana, teto de caravanas ativas) |
| `branding_settings` | nome exibido, monograma, cores, mensagem padrão |
| `users`, `agency_memberships` | equipe; papéis `owner`, `admin`, `editor`, `viewer`; `is_platform_admin` |
| `sessions`, `user_tokens` | sessão da equipe e link de definir senha: só o sha256 fica no banco |
| `caravans` | uma viagem; `plan_id` e `seat_limit` são do contrato |
| `caravan_days`, `stops` | roteiro; horário opcional; parada liga a um destino por id |
| `caravan_contents` | destinos da biblioteca escolhidos |
| `caravan_info_items` | informações úteis, com `is_time_sensitive` |
| `caravan_publications` | retrato JSON de cada publicação, com versão |
| `participant_access` | convite: hash (HMAC) do código, código cifrado (AES-GCM), primeiro nome opcional, limite de aparelhos, validade |
| `participant_devices` | cada aparelho que entrou com um convite (sha256 do cookie) |
| `question_answers`, `activity_completions`, `participant_badges`, `content_views` | progresso |
| `destinations`, `cultural_contents`, `cultural_content_revisions` | biblioteca, com situação editorial e histórico de revisões |
| `hebrew_expressions`, `audio_assets` | hebraico; áudio com origem (`native_recording`) |
| `activities`, `activity_questions` | atividades; `key` estável por pergunta |
| `passport_badges` | selo = lista de atividades a concluir |
| `rate_limits` | freio por chave e janela (escrita atômica) |
| `audit_logs` | trilha de ações administrativas; só cresce |

Preparado para tradução: `cultural_contents.locale` (hoje `pt-BR`), único por destino e idioma.

## Isolamento entre agências

Três camadas, todas no banco:

1. **RLS por papel.** A aplicação troca de papel em cada transação
   (`SET LOCAL ROLE`) e grava `app.agency_id`, `app.caravan_id`, `app.access_id`.
   A política `agency_own` exige `agency_id = mcd_agency()`; `participant_own`
   exige caravana, agência e convite. Uma consulta sem filtro devolve só o que é
   da agência (teste `isolamento.test.ts`).
2. **Chaves compostas.** `(caravan_id, agency_id)` referencia `caravans (id, agency_id)`
   em dias, paradas, conteúdos, informações, publicações e convites; o progresso
   referencia `participant_access (id, caravan_id, agency_id)`. Mesmo mentindo o
   `agency_id`, uma linha não se pendura na caravana de outra agência.
3. **Permissão por coluna.** A agência não tem `UPDATE` em `caravans.plan_id`,
   `seat_limit` nem `agency_id`, nem lê `users`, `sessions` ou `user_tokens`.

## Gatilhos do contrato

- `caravans_contract`: caravana criada pela agência nasce com o plano e as vagas
  do contrato, seja o que for enviado, e respeita o teto de caravanas ativas;
  a agência não altera plano, vagas ou dono.
- `participant_access_seats`: convites ativos e dentro da validade nunca passam de
  `seat_limit`. A linha da caravana fica travada (`FOR UPDATE`) durante a contagem:
  dois pedidos simultâneos não passam juntos pela última vaga. Convite revogado não
  volta a valer.
- `audit_logs_append_only`: a trilha não aceita alteração nem exclusão (só o
  `SET NULL` de uma conta apagada).

## Retratos e versões

`caravan_publications` guarda o retrato completo de cada publicação, com número de
versão. `caravans.current_publication_id` aponta o que está no ar. Despublicar zera
o ponteiro; o histórico fica. A biblioteca versiona por revisão
(`cultural_contents.revision` + `cultural_content_revisions`): editar um texto
aprovado o devolve para revisão.

## Migrações: como mudar o esquema

1. Editar `src/lib/db/schema.ts`.
2. `npm run db:generate` e conferir o SQL gerado.
3. Política, papel ou gatilho: `npx drizzle-kit generate --custom --name=descricao` e escrever o SQL.
4. Tabela nova de agência: `agency_id` + política `agency_own` + chave composta.
5. Nunca apagar `db/migrations/`: o diário (`meta/_journal.json`) é o que o migrador segue.

Local, as migrações rodam ao abrir o banco. Produção: só `npm run db:migrate`.
Nenhuma migração destrutiva foi escrita; `db:reset` apaga só o PGlite local e
recusa se `DATABASE_URL` existir.
