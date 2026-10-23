# O sistema visual do site público

Escrito em 23/10/2026, com o portal das três jornadas. A amostra viva de tudo
que está aqui é `/admin/sistema` (fora da busca, como todo `/admin`). Uma página
pública nova monta a sua cara com estas peças; estilo fora delas é o que faz o
site falar dois dialetos.

## Tokens (app/src/app/globals.css)

As cores são sempre variáveis, nunca um hexadecimal solto num componente.

| Token | Uso |
|---|---|
| `--paper`, `--card`, `--sand`, `bg-surface-2` | fundo da página, cartão, faixa alternada |
| `--ink`, `--ink-body`, `--ink-muted` | título, texto corrido, texto de apoio |
| `--line`, `--line-soft` | fios e bordas |
| `--navy`, `--navy-2` | bloco escuro e botão principal (texto branco) |
| `--teal`, `--teal-ink`, `--teal-soft`, `--teal-lite` | a cor da marca: anel de foco, tinta de link, fundo claro, tinta sobre navy |
| `--gold`, `--gold-ink`, `--gold-soft` | o segundo tom: marcadores, selo "Em breve" |
| `--r-md`, `--dur`, `--ease` | raio dos botões, duração e curva das transições |

Cuidado já pago uma vez: `h1` a `h4` têm `color: var(--ink)` no globals.css.
Título dentro de bloco navy precisa de `text-white` explícito.

## Os tons das jornadas

Cada jornada tem um fundo e uma tinta, e só eles (`TOM` em `PortalClient.tsx`,
`FUNDO` em `Jornada.tsx`):

| Jornada | Fundo | Tinta | Letra |
|---|---|---|---|
| Aprender hebraico | `--teal-soft` | `--teal-ink` | א |
| Descobrir Israel | `--gold-soft` | `--gold-ink` | מ |
| Raízes sefarditas | `--sand` | `--navy` | ת |

A letra é só ilustração, sempre por `<He>`, e nunca "explicada" como símbolo.

## Peças

| Peça | Onde mora | Quando usar |
|---|---|---|
| `Rubrica` | `components/landing/base.tsx` | o rótulo acima de todo título de seção; com `letra` no portal |
| `H2`, `Lead`, `Container` | `components/landing/base.tsx` | título de seção, parágrafo de abertura, largura e margens |
| `PageHead` | `components/platform/Section.tsx` | o topo das páginas de texto (/metodo, /faq, /biblia), com `trilha` |
| `Migalhas`, `TrilhaNoTopo` | `components/portal/Migalhas.tsx` | "Início › Jornada › Página" em toda página que mora numa jornada |
| `Abertura` | `components/portal/Jornada.tsx` | o topo de uma página de jornada ou de produto, com o emblema |
| `SeloDoStatus`, `AvisoEmBreve` | `components/portal/Jornada.tsx` | o status que o catálogo dá; nunca escrito à mão |
| `CartaoDeProduto`, `ProdutosDaJornada` | `components/portal/Jornada.tsx` | os produtos de uma jornada, lidos de `lib/ecossistema.ts` |
| `Ponte` | `components/portal/Jornada.tsx` | o bloco navy "Enquanto isso": o que dá para fazer hoje |
| `BotaoDoCurso` | `components/portal/BotaoDoCurso.tsx` | todo link para o curso numa página de servidor: vira "Continuar" para quem já é aluno |
| `Emblema` | `components/portal/Emblemas.tsx` | a ilustração de cada jornada; sem hebraico dentro do SVG |
| `PalavraDescoberta` | `components/portal/PalavraDescoberta.tsx` | a demonstração da capa (שָׁלוֹם do curso) |

## Botões

- Principal: `bg-[var(--navy)] text-white`, `min-h-[52px]` ou `[56px]`, `rounded-[var(--r-md)]`.
- Secundário: `bg-[var(--card)] text-ink border border-line`.
- Sobre navy: `bg-white text-[var(--navy)]`.
- Toque: `active:scale-[.97]`; transição só das propriedades que mudam, nunca `transition: all`.
- Alvo de toque de 44 px no mínimo.

## Regras que valem para toda peça

- Produto fora de venda não tem preço, botão de compra nem checkout (`tests/portal.test.ts`).
- Nenhum número de alunos, nota, selo ou depoimento que não exista (`lib/testimonials.ts`).
- Hífen, nunca travessão.
