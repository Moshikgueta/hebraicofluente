# Design system: coleção editorial Hebraico Fluente

Fase 2 do redesenho. Implementado em:
`editorial/templates/tokens-editorial.css` (tokens comuns),
`templates/revista.css` (PDF), `templates/web.css` e `templates/web-app.js`
(experiência digital). O site do curso não muda.

## 1. Direção

**Publicação de museu com ritmo de revista de viagem.** O ponto de partida é a
direção editorial que a capa do site já adotou (a letra hebraica como
protagonista, rubricas com letras hebraicas, fios e versalete no lugar de
selos e cartões). O livro leva isso para o papel e acrescenta o que uma revista
de viagem tem e o rascunho não tinha: imagem grande, mapa como página,
número grande, respiro.

Evitado de propósito: cartão com sombra para tudo, gradiente decorativo,
ícone infantil, emoji, foto ilustrativa genérica, imagem gerada por IA
apresentada como documento.

## 2. Cor

Os quatro valores da marca ficam iguais (navy, teal, gold, creme). A coleção
acrescenta quatro cores de paisagem, usadas em mapa, dado e acento, nunca
como fundo de página inteira de texto:

| Token | Valor | Inspiração | Uso |
| --- | --- | --- | --- |
| `--navy` | #0E3B43 | azul profundo da marca | títulos, abertura, fio de vocabulário |
| `--noite` | #0B2A31 | o mesmo azul, mais fundo | páginas sangradas escuras |
| `--mar` | #1E5A73 | Mediterrâneo | links, "Entenda melhor", mapas |
| `--pedra` | #EFE7D6 | calcário de Jerusalém | fundo de "História ou tradição?" |
| `--neguev` / `--neguev-tinta` | #B9773E / #8C5426 | arenito do Neguev | números em destaque, rótulos de dado |
| `--oliveira` / `--oliveira-tinta` | #6B7444 / #4E5530 | oliveiras da Galileia | reservado a gastronomia e natureza |
| `--ouro` | #B8862F | dourado discreto da marca | fio, letra de rubrica; **nunca texto pequeno** |

Contraste medido (WCAG): sobre o papel, toda cor de texto passa de 5:1;
`--ouro-tinta` sobre `--pedra` dá 4,3:1 e não é usado em texto pequeno; o
dourado sobre navy (3,8:1) só em título grande e fio. Os números estão no
cabeçalho de `tokens-editorial.css`.

## 3. Tipografia

| Papel | Fonte | Corpo (PDF / web) | Por quê |
| --- | --- | --- | --- |
| Título de capítulo | Literata, tamanho óptico de display, peso ~380 | 40 pt / 40-64 px | serifa de alto contraste, a sensação de revista |
| Título de seção | Literata display, ~420 | 19 pt / 27-34 px | mesma família, menos contraste |
| Rubrica, rótulo, legenda, interface | Instrument Sans (da marca), versalete espaçado | 6-7 pt / 11-13 px | a voz "institucional" da marca |
| Corpo | Literata, tamanho óptico de texto | 10,1 pt / 17 px | desenhada para leitura longa em tela |
| Número e estatística | Bricolage Grotesque 700 (a fonte de títulos da marca), algarismos tabulares | 30 pt / 44 px | o dado como imagem |
| Hebraico | Noto Serif Hebrew (a do curso) | 1,1 em no texto; 19 pt / 30 px no vocabulário | nikud bem posicionado; sempre `unicode-bidi: isolate` |
| Citação | Literata itálico display | 15 pt | |
| Referência | Instrument Sans | 6,1 pt, duas colunas | aparato discreto |

Todas sob SIL Open Font License (podem ser embutidas no PDF vendido).

## 4. Grid

- **PDF digital** (148 x 210 mm): margens 16/13/17/13 mm, uma coluna de texto;
  figuras "largas" vão de borda a borda (sangria lateral); páginas visuais e
  aberturas são sangradas nos quatro lados.
- **PDF A4** (impressão, fase 5): a mesma folha, com coluna de margem para as
  notas laterais.
- **Web**: coluna de leitura de até 680 px, 16 px de margem no celular;
  figuras e caixas com fundo vão de borda a borda no celular.

## 5. As dez composições

| # | Composição | No manuscrito | PDF | Web |
| --- | --- | --- | --- | --- |
| 1 | Abertura cinematográfica | `abertura_imagem` e `abertura_frase` no cabeçalho | página sangrada, título sobre a imagem | herói de 78% da tela |
| 2 | Narrativa ilustrada | `::: foto <id>` ou `::: figura <id>` no meio do texto | figura larga com legenda numerada | figura de borda a borda |
| 3 | Infográfico | `::: figura <id>` (SVG gerado de dado verificado) | figura larga ou página visual | figura com pontos tocáveis |
| 4 | Linha do tempo | `::: linha-do-tempo` | lista cronológica com fio | (fase 5: linha explorável) |
| 5 | Descoberta cultural | `::: voce-sabia`, `::: observar`, `::: entenda-melhor`, `::: dado` | nota com fio colorido, sem caixa; número grande | idem |
| 6 | História ou tradição? | `::: historia-ou-tradicao` | uma das três caixas com fundo (pedra) | fundo de borda a borda |
| 7 | Hebraico na vida real | `::: em-hebraico` | faixa tipográfica, hebraico grande à direita | idem, com botão de áudio |
| 8 | Explore o lugar | `::: link <id>` (+ foto) | bloco com QR code que leva à fonte oficial | cartão de link |
| 9 | Perguntas e descobertas | `::: quiz`, `::: vf`, `::: observacao` | página de perguntas, respostas invertidas no pé | quiz com explicação, desafio marcável |
| 10 | Experiência visual | `::: visual <id> [escuro]` | página inteira dominada pela imagem | figura grande |

Regras de uso:
- no máximo uma caixa com fundo por página de texto;
- toda figura tem título, legenda, fonte dos dados e limitação;
- o espaço em branco vem da composição, não de quebra acidental: o gerador
  falha se a paginação truncar, e `tools/inspecionar.mjs` lista as páginas
  com menos de 40% de ocupação.

## 6. Componentes digitais

Em `templates/web-app.js`, sem biblioteca: rotas (início, capítulo,
glossário, diário), barra de progresso de leitura, "continuar de onde parou",
favoritos por seção, mapa com pontos tocáveis e folha inferior, botão de
áudio (só gravação humana; sem gravação, desligado), quiz de múltipla
escolha e verdadeiro ou falso com explicação sempre visível, desafio de
observação marcável, checklist, glossário pesquisável (português,
transliteração ou hebraico), diário com download, fontes por seção.

Acessibilidade: alvos de toque de 44 px, foco visível, `aria-pressed` nos
favoritos e respostas, `aria-live` na explicação do quiz, folha fecha com
Esc e devolve o foco, `lang="he" dir="rtl"` em todo hebraico, respeito a
`prefers-reduced-motion`, nenhuma informação só por cor (acerto e erro têm
palavra).

## 7. Responsividade

Mobile first. Testado a 390 px (largura de referência do repositório): sem
rolagem lateral em nenhuma rota. Títulos com `clamp()`; a partir de 720 px,
figuras e caixas voltam para a coluna.

## 8. Estilo de ilustração (fase 6, proposta para aprovação)

Nome de trabalho: **papel recortado**. Pranchas de teste em
`ativos/pranchas/` (gerador: `tools/pranchas.mjs`).

- **Forma:** figuras chapadas, sem gradiente nem textura fotográfica. Cada
  forma principal tem uma "sombra" da mesma forma, deslocada uns 6 px para
  baixo e para a direita, em `pedra-escura`: parece papel recortado sobre
  papel. É a assinatura do estilo.
- **Traço:** contorno navy de 2 px, cantos arredondados, linha tracejada
  pontilhada (traço 2, espaço 8) para trilhas, rotas e setas ilustrativas.
- **Cor:** a paleta da marca e da coleção, sem cor nova. Mar em `mar-claro`
  com ondas desenhadas; terra vizinha em `pedra`; Israel em branco ou navy;
  áreas de status disputado sempre com a hachura dourada dos mapas do
  capítulo 1 e a mesma legenda; destaque de número em `neguev-tinta`; caixa
  de comparação em `ouro-suave`.
- **Ícones:** um pictograma por lugar, branco sobre círculo navy, numa grade
  de 24 px; são desenho, não símbolo religioso nem logotipo.
- **Tipografia dentro da ilustração:** Literata Display para títulos,
  Instrument Sans para rótulos e legendas, Bricolage Grotesque para números;
  hebraico sempre em Noto Serif Hebrew, com a transliteração embaixo.
- **Rodapé de toda prancha:** de onde vêm os contornos e os números, o que é
  conta nossa ("em linha reta, calculado das coordenadas") e o que é só
  desenho.
- **Formato:** 1080 x 1350 (4:5), que serve à página do PDF, à web e ao
  cartão de compartilhar; o 9:16 é um recorte da mesma prancha.
- **Ilustração de cena** (mercado, Shabat, aeroporto): no mesmo estilo,
  desenhada em SVG. Ilustração feita com ferramenta generativa só se o dono
  aprovar, e sempre com o rótulo "ilustração".
