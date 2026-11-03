# Design system

Direção: **caderno de viagem editorial**. Papel quente, tinta azul profunda, pedra,
ocre. Tipografia de revista nos títulos, sans de interface no resto, e o hebraico
sempre na fonte certa. Pouca sombra, nenhum gradiente decorativo, movimento só
onde informa (entrada da página, carimbo do selo).

Tokens em `src/app/globals.css` (`@theme`); componentes em `src/components/ui.tsx`,
`icons.tsx` e `art/`.

## Cor

| Token | Valor | Uso |
| --- | --- | --- |
| `paper` | #FAF6EE | fundo da página (branco quente) |
| `paper-raised` | #FFFDF8 | cartões |
| `sand` / `sand-deep` | #EFE6D4 / #E2D5BC | blocos de apoio (onde fica, palavra do dia) |
| `stone-100…700` | #EBE5DA … #554C3F | bordas, texto secundário, estados inativos |
| `ink` / `ink-soft` | #17283A / #3B4A59 | texto |
| `sea` / `sea-deep` | #1F4A6B / #14324A | marca da plataforma |
| `ochre` / `ochre-soft` | #A8702B / #F1E1C4 | destaque, demonstração |
| `terracotta`, `olive` | #9E4F2D, #56633A | rótulos de interpretação e de dica |
| `success`, `danger`, `warning` (+ `-soft`) | | estados |

### Cor da agência

A agência escolhe qualquer cor. `brandTheme()` (`src/lib/theme.ts`) deriva:

- `--brand` fundo de botão e marcador ativo; escurecido se nem branco nem tinta
  chegam a 4,5:1 sobre ele;
- `--brand-ink` texto sobre `--brand` (branco ou tinta, o de maior contraste);
- `--brand-text` a cor como texto sobre o papel, escurecida até 4,5:1;
- `--brand-tint` fundo suave (a cor misturada com branco);
- `--accent` / `--accent-text` o mesmo para a cor secundária.

Os utilitários `bg-brand`, `text-brand-text` etc. leem essas variáveis. Testado com
amarelo, branco, preto e azul claro (`tests/theme.test.ts`). O editor de
identidade mostra a prévia com o ajuste já aplicado.

## Tipografia

| Papel | Fonte | Onde |
| --- | --- | --- |
| Display | Newsreader (variável, com tamanho óptico e itálico) | títulos, números grandes, citações |
| Interface | Hanken Grotesk (variável) | texto corrido, botões, rótulos |
| Hebraico de texto | Noto Sans Hebrew | expressões, nikud (posiciona os sinais corretamente) |
| Hebraico de título | Frank Ruhl Libre | nomes de lugares em destaque |

Escala (`text-*`): `micro` 12, `small` 14, `body` 17, `title` 20, `display-m` 28,
`display-l` 36, `display-xl` 48. Rótulos em caixa alta com `tracking 0.12-0.14em`
(`Eyebrow`). Números em `tabular`.

## Hebraico e RTL

`<He>` é a única porta de entrada para texto em hebraico: `lang="he"`, `dir="rtl"`,
`unicode-bidi: isolate` e a fonte certa. A interface continua da esquerda para a
direita; só o trecho em hebraico muda de direção. Nikud é opcional na tela de
hebraico (no dia a dia o hebraico aparece sem vogais).

## Espaço, forma, sombra

- Base de 4 px. Coluna de leitura do viajante: `max-w-xl` (cerca de 36 rem), margem
  lateral de 16 px no celular.
- Raios: `sm` 6, `md` 12 (cartões), `lg` 20 (cartão de embarque, folhas).
- Sombras: `shadow-card` (quase plana) e `shadow-float` (o que fica por cima).
- Alvos de toque: botões de 44 px (`md`) ou 52 px (`lg`); itens da barra inferior
  com 58 px de altura.

## Componentes

`Button` / `LinkButton` (primary, secondary, ghost, quiet, danger; sm, md, lg),
`Card`, `Tag` (tons), `Notice` (borda lateral por tom), `EmptyState`, `Progress`,
`Stat`, `Field` + `inputClass`, `Eyebrow`, `SectionTitle`, `He`, `PlatformMark`,
`Wordmark`. Viajante: `DayCard`, `DestinationCard`, `TripNav` (barra inferior e
abas), `HebrewBrowser`, `ActivityPlayer`, `Stamp`, `Scene`. Painel: `PanelShell`,
`PageHeader`, `Flash`, `StepNav`, campos (`TextField`, `TextArea`, `SelectField`),
`BrandEditor`, `CopyButton`.

### Ilustrações (`Scene`)

Seis cenas em SVG desenhadas em código, no espírito de cartaz de viagem:
`jerusalem`, `stone`, `galilee`, `desert`, `coast`, `telaviv`. Repetições (pedras,
ameias, janelas) saem de um gerador com semente fixa, então o desenho é igual no
servidor e no navegador. São ilustração assumida, não foto: quando houver
fotografias licenciadas, entram por `media_assets` com crédito e licença.

### Carimbos (`Stamp`)

Borda dupla, título em arco e um desenho por tema. Conquistado: na cor da tinta,
girado 6 graus; com animação de carimbo na hora da conquista (desligada com
`prefers-reduced-motion`). Pendente: contorno tracejado em pedra.

## Layouts

| Área | Celular | Telas largas |
| --- | --- | --- |
| Viajante | cabeçalho fixo fino + barra inferior de 5 itens | abas no cabeçalho; mesma coluna de leitura, cartões em grade |
| Painel | cabeçalho com menu | barra lateral de 16 rem |
| Editor de caravana | faixa de etapas rolável (a atual fica à vista) | faixa inteira |
| Formulários | uma coluna | duas colunas quando os campos são curtos |

Grades com colunas fixas levam `[&>*]:min-w-0` para nada estourar a largura no
celular (o e2e confere rolagem lateral em todas as telas a 390 px).

## Diretrizes

- Uma ação principal por tela. O resto é secundário ou link.
- Estado vazio sempre explica o que falta e quem resolve.
- Texto de interface curto e no presente; nada de "em breve" para o que não existe.
- Demonstração e conteúdo em revisão sempre rotulados.
- Animação só de entrada (420 ms) e do carimbo; nada que repita.
- Acessibilidade: rótulo visível ligado a todo campo, `aria-current` na navegação,
  `aria-live` no retorno das atividades, foco visível na cor da marca, "Pular para
  o conteúdo", contraste mínimo de 4,5:1.
- Tema escuro: não há nesta etapa.
