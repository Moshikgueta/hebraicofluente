# Arquitetura

## Decisão de stack

| Peça | Escolha | Por quê |
| --- | --- | --- |
| Linguagem | TypeScript estrito | tipos do banco à tela |
| Aplicação | Next.js 15 (App Router), React 19 | componentes de servidor leem o banco sem API intermediária; Server Actions dão formulários que funcionam sem JavaScript e já checam a origem |
| Estilo | Tailwind CSS 4 com tokens em `@theme` | tokens viram utilitários; a cor da agência entra por variável CSS em tempo de execução |
| Banco | PostgreSQL | relacional, multiagência com **Row-Level Security** nativa |
| ORM e migrações | Drizzle ORM + drizzle-kit | tipado, SQL legível, funciona com o driver `postgres` (produção) e com o PGlite (local) |
| Banco local e testes | PGlite | o próprio Postgres em WebAssembly: as mesmas políticas, papéis e gatilhos rodam no notebook e nos testes, sem instalar nada |
| Validação | zod | toda entrada de formulário é validada no servidor |
| QR code | uqr | gera SVG no servidor, sem dependências |
| Fontes | @fontsource (Newsreader, Hanken Grotesk, Frank Ruhl Libre, Noto Sans Hebrew) | servidas pela própria aplicação: sem chamada a terceiros, sem rastreamento |
| Testes | Vitest (integração com Postgres real) e Playwright Core (ponta a ponta) | |

Dependências deliberadamente ausentes: biblioteca de componentes, de ícones, de
autenticação e de animação. O design system é pequeno e próprio
(docs/DESIGN_SYSTEM.md); a autenticação é simples o bastante para ser auditada
em dois arquivos.

## Camadas

```
navegador
  │  formulários (Server Actions) e componentes de cliente pequenos
  ▼
src/app/**            páginas e ações: validam entrada (zod), conferem papel
  │
src/lib/auth/next.ts  cookies, cabeçalhos, redirecionamentos
src/lib/panel.ts      runAgency / runPlatform: papel + transação + mensagem
  │
src/lib/domain/*      regras de negócio, recebem uma transação já no papel certo
  │
src/lib/db/tenant.ts  withScope(escopo, fn): BEGIN; SET LOCAL ROLE; set_config(app.*)
  │
PostgreSQL            RLS por papel, chaves compostas, gatilhos do contrato
```

### Escopos

Toda operação de negócio passa por `withScope`:

| Escopo | Papel no banco | Vê |
| --- | --- | --- |
| `platform` | `mcd_platform` | tudo, menos sessões, tokens e freios |
| `agency` | `mcd_agency` | só linhas com `agency_id` da agência; lê a biblioteca |
| `participant` | `mcd_participant` | o retrato publicado da própria caravana e o próprio progresso |

`withSystem` (sem papel) existe só para o que precisa descobrir quem está pedindo:
achar sessão, achar convite, freio, criar conta. Ver docs/DATABASE.md.

## Rotas

| Caminho | Quem | O quê |
| --- | --- | --- |
| `/` | público | apresentação para agências |
| `/demo` | público | entrada na demonstração (viajante ou painel somente leitura) |
| `/entrar`, `/definir-senha` | equipe | login e definição de senha por link de uso único |
| `/c/[slug]/entrar` | viajante | código do convite (o GET não gasta vaga: só o botão entra) |
| `/c/[slug]` | viajante | boas-vindas, contagem, primeiro dia, destaque, palavra do dia, passaporte |
| `/c/[slug]/roteiro`, `/roteiro/[dia]` | viajante | dias com estados (anterior, hoje, próximo) e paradas |
| `/c/[slug]/descubra`, `/descubra/[destino]` | viajante | biblioteca da caravana e página editorial |
| `/c/[slug]/hebraico` | viajante | expressões por situação, nikud opcional, prática |
| `/c/[slug]/atividades`, `/atividades/[atividade]` | viajante | atividades com correção no servidor |
| `/c/[slug]/passaporte` | viajante | selos |
| `/c/[slug]/informacoes` | viajante | central de informações (permanentes e sujeitas a mudança) |
| `/c/[slug]/depois` | viajante | encerramento: agradecimento, resumo, selos, releitura |
| `/painel` | agência | indicadores agregados |
| `/painel/caravanas/...` | agência | 8 etapas: geral, identidade, roteiro, conteúdo, atividades, informações, publicação (com prévia), convites |
| `/painel/marca`, `/painel/biblioteca` | agência | identidade padrão e consulta da biblioteca |
| `/admin/...` | plataforma | indicadores, agências e contratos, biblioteca (edição com revisões), hebraico, atividades, planos, auditoria |

## Publicação e retratos

O viajante nunca lê as tabelas de edição. Ele lê `caravan_publications.snapshot`,
um JSON com tudo o que vê (`src/lib/domain/snapshot.ts`), montado por
`buildSnapshot` no momento de publicar:

- só destinos escolhidos, e com texto **aprovado** (agência real) ou aprovado e em
  revisão (demonstração);
- hebraico só **revisado** por falante nativo (agência real);
- atividades e selos só se o recurso estiver ligado **e** coberto pelo plano;
- paradas só apontam para destinos escolhidos;
- o gabarito fica no retrato, no servidor: a página entrega a pergunta sem ele
  (`publicQuestion`).

Antes de publicar, a tela mostra pendências (`publicationChecks`) e o que muda
para o viajante (`diffSnapshots`), destacando datas, dias, paradas e informações
práticas. A comparação ignora a ordem das chaves (o `jsonb` do Postgres reordena).

Editar a biblioteca cria uma revisão nova; a caravana publicada continua com a
antiga, e a tela de publicação da agência avisa "há versão nova" (`libraryUpdatesSince`).

## Datas e fuso

Datas de viagem são datas de calendário. "Hoje" é calculado no fuso da caravana
(`Asia/Jerusalem` por padrão). Um dia que passou é "anterior", nunca "concluído".
Na demonstração, um cookie simula os três momentos (antes, durante, depois).

## Cloudflare: avaliação e caminho de publicação

Não está publicado. O caminho avaliado:

- **Aplicação:** Next.js no Cloudflare Workers via `@opennextjs/cloudflare`. Todo o
  código de servidor usa WebCrypto (PBKDF2, HMAC, AES-GCM, SHA-256), que existe no
  Workers. O bundle de um app Next costuma passar do limite de 3 MB do plano
  gratuito do Workers: contar com o **Workers Paid** (US$ 5/mês, limite de 10 MB
  e CPU suficiente para 600 mil iterações de PBKDF2).
- **Banco:** Postgres gerenciado (Neon ou Supabase têm RLS e papéis) através do
  **Hyperdrive**, com o driver `postgres` (já usado quando `DATABASE_URL` existe).
  O PGlite é só local: não roda no Workers.
- **Papéis:** o usuário de conexão de produção precisa ser membro de
  `mcd_platform`, `mcd_agency` e `mcd_participant` (a migração 0001 tenta conceder)
  e **não pode** ser superusuário nem ter `BYPASSRLS`.
- **Migrações:** `DATABASE_URL=... npm run db:migrate`, por quem tem a credencial da
  dona do banco. A aplicação não migra sozinha em produção.
- **Arquivos (fotos, logos, áudios):** R2, ainda não ligado.

Nada disso foi configurado: exige contas e serviços pagos, que dependem de
autorização.

## Desempenho

- Páginas do viajante são componentes de servidor; JavaScript só no que interage
  (navegação, atividade, hebraico, rastreio de leitura). Primeira carga de ~106 kB.
- Ilustrações são SVG desenhado em código (sem imagens para baixar).
- O retrato publicado é uma leitura só por página.
- Cabeçalhos: `private, no-store` nas áreas autenticadas.

## Erros

- Ações do painel terminam em redirecionamento com `?ok=` ou `?erro=`; a página
  mostra a mensagem (`MESSAGES` em `src/lib/panel.ts`). Erro inesperado é logado
  no servidor (`[painel]`, `[admin]`) e a pessoa vê "nada foi salvo".
- Os gatilhos levantam `mcd:<codigo>`; `dbErrorCode` traduz.
