# Minha Caravana Digital

Plataforma B2B que transforma caravanas para Israel em experiências digitais com a
marca de cada agência: roteiro, conteúdo cultural com fontes, hebraico prático,
atividades com correção e um passaporte de selos. Antes, durante e depois da viagem.

Marca independente. Mora nesta pasta (`caravana/`) do repositório
`hebraicofluente` só por enquanto: não compartilha código, banco, publicação nem
identidade visual com o Hebraico Fluente, e nenhum workflow do repositório a
publica. Ver "Mudar para um repositório próprio" abaixo.

## O que existe hoje

| Área | Situação |
| --- | --- |
| Experiência do viajante (8 telas) | Funcional, com dados do banco |
| Convites pessoais, aparelhos e vagas | Funcional, limite cobrado no banco |
| Quizzes, verdadeiro ou falso, reconhecimento, ligar pares | Funcional, correção no servidor |
| Passaporte digital | Funcional, selo por atividade concluída |
| Painel da agência (8 etapas) | Funcional: cria, edita, publica, convida |
| Superadministração | Agências, contratos, biblioteca, hebraico, atividades, planos, auditoria |
| Isolamento entre agências | RLS no Postgres + chaves compostas + gatilhos, testado |
| Demonstração | Caravana fictícia em agência marcada `is_demo`, separada das reais |
| Fotografias | Não há: ilustrações próprias no lugar (ver docs/CONTENT_GUIDELINES.md) |
| Áudio de falante nativo | Estrutura pronta, nenhuma gravação ainda |
| Cobrança | Não existe nesta etapa (só plano, limites e recursos) |
| Hospedagem | Não publicada. Ver docs/ARCHITECTURE.md, "Publicar" |

## Rodar localmente

Requisitos: Node 22. Não precisa de Postgres instalado: em desenvolvimento o banco
é o PGlite (o próprio Postgres em WebAssembly), gravado em `.data/pglite`.

```sh
cd caravana
npm install
npm run db:reset          # apaga o banco local, aplica migrações, carrega biblioteca e demonstração
npm run dev               # http://localhost:3100
```

- Demonstração: http://localhost:3100/demo (viajante ou painel da agência, somente leitura).
- Primeiro superadministrador (com o servidor PARADO, o PGlite aceita um processo só):

  ```sh
  npm run user:create -- --email voce@exemplo.com --name "Seu Nome" --platform
  ```

  O comando imprime um link de definir senha (vale uma vez, por 3 dias). Nenhuma
  senha passa pela linha de comando nem fica no código.

Variáveis de ambiente: ver `.env.example`.

## Verificações

```sh
npm run typecheck   # TypeScript
npm run lint        # ESLint (next/core-web-vitals)
npm test            # 51 testes de integração contra Postgres real (PGlite em memória)
npm run build       # build de produção
npm run e2e         # ponta a ponta num Chromium a 390 px (92 verificações)
E2E_PROD=1 npm run e2e   # o mesmo, contra a build de produção
```

O e2e monta o próprio banco em `.data/e2e`, sobe o servidor na porta 3200 e percorre:
superadministrador cria agência e acesso; a agência define senha, cria caravana,
monta roteiro, publica e convida; o viajante entra pelo convite; o visitante da
demonstração faz um quiz e ganha o selo; o painel da demonstração recusa escrita;
outra agência recebe 404 na caravana da primeira. Em cada tela confere rolagem
lateral e erros de console.

## Estrutura

```
content/            fonte do conteúdo: destinos, hebraico, atividades, planos, demonstração
db/migrations/      0000 (tabelas, gerado pelo drizzle-kit) e 0001 (papéis, RLS, gatilhos)
scripts/            migrate, seed, reset-local, create-user
src/lib/db/         esquema, conexão, escopos (withScope / withSystem)
src/lib/auth/       sessões da equipe, convites, freio (sessions.ts) e cola com o Next (next.ts)
src/lib/domain/     regras: publicação e retrato, agência, plataforma, viajante, diff, editorial
src/components/     design system (ui.tsx, icons.tsx, art/), viajante, painel
src/app/c/[slug]/   experiência do viajante
src/app/painel/     painel da agência
src/app/admin/      superadministração
tests/              integração (vitest)
e2e/                ponta a ponta e capturas de tela
docs/               visão, arquitetura, design, banco, conteúdo, segurança, roteiro
```

## Documentação

- [docs/PRODUCT_VISION.md](docs/PRODUCT_VISION.md): para quem é e por quê.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): stack, escopos, rotas, publicação, Cloudflare.
- [docs/DATABASE.md](docs/DATABASE.md): tabelas, RLS, gatilhos, retratos.
- [docs/SECURITY.md](docs/SECURITY.md): autenticação, convites, freios, LGPD.
- [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md): tokens, tipografia, componentes, layouts.
- [docs/CONTENT_GUIDELINES.md](docs/CONTENT_GUIDELINES.md): fato, tradição, interpretação, revisão.
- [docs/ROADMAP.md](docs/ROADMAP.md): o que falta para produção e a ordem sugerida.

## Mudar para um repositório próprio

A pasta é autocontida (tem o próprio `package.json`, lockfile e migrações). Para
levá-la com o histórico:

```sh
git subtree split --prefix=caravana -b caravana-only
# criar o repositório novo e enviar o ramo caravana-only como main
```
