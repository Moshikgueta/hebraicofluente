# Hebraico Fluente — Workbook de Alfabetização

Gerador do workbook de alfabetização em hebraico moderno para **brasileiros
adultos**. Interface e explicações em português do Brasil; conteúdo-alvo em
hebraico **com nikud**.

Nada aqui é escrito à mão página a página. Os 22 módulos de letra saem de
`data/` + `templates/` através de `scripts/build.js`. Mudar um template muda as
22 letras de uma vez.

---

## Como construir

```bash
npm run build      # valida, gera dist/, valida de novo (agora o HTML)
npm run validate   # só as verificações de dados
npm run check-fit  # mede: toda folha cabe numa página A4?
npm run check      # as duas acima
npm run serve      # constrói e serve dist/ em http://127.0.0.1:8080
```

### Empacotamento

```bash
npm run pack       # mede as peças e decide o agrupamento
```

Dividir o conteúdo em folhas que cabem é só metade do trabalho: só isso deixava
o livro **69% cheio em média**, com dezenas de páginas pela metade — a tabela
"impressa e cursiva" ocupa 110mm numa página de 265mm.

Então o build **empacota**. Cada template emite *unidades*; o build corta cada
uma nos próprios `<h2>`, cartões de exercício e linhas de traçado — pontos
atômicos por construção — e preenche cada folha com as peças seguintes da mesma
seção, em ordem, até o limite. Uma peça que não abre a folha perde o badge e o
título, que o `<h2>` dela já substitui.

As alturas vêm de `data/layout.json`, medido por `npm run pack`. Sem esse
arquivo cada peça fica na sua própria folha: desperdiça papel, nunca erra — que
é como uma entrada ausente deve falhar.

**O empacotador é otimista de propósito.** Uma margem de segurança grande o
bastante para a pior junção encolhe todas as outras folhas e custa mais páginas
do que economiza. Em vez disso ele arrisca, e o `npm run pack` conserta o que
de fato estourou: mede o resultado empacotado e força uma quebra antes da peça
exata que passou do limite, repetindo até estabilizar (normalmente duas
rodadas). O resultado:

| | antes | depois |
|---|---|---|
| páginas A4 | 344 | **287** |
| ocupação média | 69% | **81%** |
| folhas abaixo de 60% | 93 | **16** |
| folhas que estouram | 0 | **0** |

### Uma folha é uma página impressa

Esse é o contrato do workbook, e tudo depende dele: se uma folha estoura a
página por três milímetros ela vira duas páginas em silêncio, o fólio para de
bater com o papel e o sumário passa a mentir.

Por isso nenhuma etapa transborda. Quando o conteúdo não cabe, a etapa ganha
uma **folha de continuação explícita** — o número da etapa continua o mesmo, a
contagem de folhas é que cresce — exatamente como o PDF de referência faz com
"PÁGINA 1 DE 5 — CONTINUAÇÃO".

E isso é **medido**, não presumido. `npm run check-fit` abre cada página no
Chromium com mídia de impressão emulada e a largura útil real, e compara a
altura de cada `.sheet` com os 265mm que o `@page` deixa:

```
  344 folhas medidas · limite 265mm de altura útil
  ✓ todas cabem em uma página A4
```

`npm run pdf` ainda confere o resultado: se a contagem de páginas do PDF não
bater com a de folhas do HTML, ele falha e manda rodar o `check-fit`.

As tabelas que crescem com o alfabeto — a da revisão vai de 4 a 22 linhas —
são fatiadas por `chunk()` em `templates/partials.js`, então elas continuam
cabendo à medida que o conteúdo aumenta.

Não há dependências de runtime. Node 20+ é suficiente; as fontes estão
versionadas em `assets/fonts/`.

O build **falha** (sai com código 1) antes de escrever qualquer arquivo se
alguma regra fatal for violada. `dist/` nunca contém uma página que quebre a
regra de ordem.

---

## A ordem das letras — e por que ela não é a alfabética

O workbook não ensina o alfabeto na ordem do dicionário, e também não inventa
uma ordem própria. Ele segue o plano de aulas do guia do docente
**«בא לי עברית!» (חוברת למורה)**: 22 lições de 1h30, reunidas em **7 unidades de
três lições**. Dentro de uma unidade, a lição 1 apresenta letras, a lição 2
apresenta letras e língua falada, e a lição 3 não traz letra nova — é a de
jogos, correção e leitura.

| Módulo | Lições | Letras | O que se destrava |
|---|---|---|---|
| 1 | 1–3 | מ ת א · נ ה י | אִמָּא, אֲנִי, מַיִם, אַתָּה |
| 2 | 4–6 | ג ד ש · ל ר | שֵׁם, אִשָּׁה, יֶלֶד, שֶׁמֶשׁ |
| 3 | 7–9 | ו ז · ח ט | שָׁלוֹם, תּוֹדָה, לֶחֶם |
| 4 | 10–12 | ס ע · צ ק | עִיר, אֶרֶץ, מָקוֹם |
| 5 | 13–15 | ב · כ פ | אַבָּא, בַּיִת, מֶלֶךְ, סֵפֶר |
| 6 | 16–18 | — | as formas sem daguesh e as 5 finais |
| 7 | 19–21 | — | os sons com gerech: צ׳ ג׳ ז׳ |

As unidades 6 e 7 não introduzem letra nenhuma, e por isso são as mais fáceis
de pular e as piores de pular: uma ensina a ler בּ כּ פּ **sem** o ponto, que é
como elas aparecem na rua; a outra, os três sons que o hebraico moderno
construiu sem inventar letra.

**Trocar esta ordem custa caro, de propósito.** `wordsToRead` de cada letra é
autorado contra o alfabeto acumulado até ali, e a V1 não deixa passar uma
palavra com letra que o leitor ainda não viu. Mexer na ordem obriga a
reescolher o vocabulário de quase todas as lições — que é exatamente a
salvaguarda que se quer ter.

### As palavras-ponte

O guia ensina cada letra dentro de uma palavra emprestada que o aluno já
conhece: o professor escreve *טרמינל* no quadro com a sílaba nova em branco, e
o aluno completa. Quem estuda sozinho não tem professor no quadro, então a
abertura de cada módulo faz isso impresso — a palavra, o que ela quer dizer, e
uma coluna em branco para a letra. As palavras-ponte ficam em `bridgeWords` e
são **reconhecimento, nunca leitura**: elas estão cheias de letras que o leitor
ainda não aprendeu, e é esse justamente o ponto. Por isso nunca entram em
`wordsToRead`, onde a V1 manda.

---

## Estrutura

```
data/
  letters.json      um objeto por letra — a única fonte do conteúdo
  modules.json      o plano de aulas: 7 unidades, 22 lições, quem ensina o quê
  translit.json     a única fonte das transliterações
  nikud.json        os seis sons vocálicos (Página 0) e o daguesh
templates/
  letter.js         as 5 etapas de uma letra; nunca cita uma letra específica
  module.js         a abertura de módulo e a lição de prática que o fecha
  extras.js         módulos 6 e 7 — daguesh/formas finais e os sons com gerech
  page-0.js         Os sinais de vogal, antes da letra 1
  review.js         as 5 revisões de módulo + a revisão final cumulativa
  appendix.js       alfabeto · nikud · transliteração · cursiva
  partials.js       badge, callout, tabela, exercício, documento
tools/
  gen-stroke-order.py   ferramenta de autoria; gera assets/stroke-order/*.svg
scripts/
  build.js          data + templates → dist/
  validate.js       as 17 regras
  lib/hebrew.js     codepoints: nikud, formas finais, normalização
  lib/render.js     o contrato de direção — he(), heList(), heCloze(), prose()
styles/
  tokens.css        extraído do PDF de referência, com a origem de cada valor
  components.css    o mobiliário da página
  print.css         geometria A4
assets/
  fonts/            woff2 + licenças
  stroke-order/     27 SVG de ordem de traçado (22 letras + 5 formas finais)
```

---

## As regras de validação

`scripts/validate.js` roda em todo build. Falhas param o build; avisos não.

| Regra | O que garante | Severidade |
|---|---|---|
| **V1** | **Nenhuma palavra de `wordsToRead` usa letra de ordem maior que a da lição.** Formas finais contam como a letra-base. | falha |
| V2 | Toda palavra tem nikud | falha |
| V3 | Uma palavra pontuada nunca é transliterada de dois jeitos | falha |
| V3b | Mesmas consoantes com pontuações diferentes (ex. שָׁם / שֵׁם) | aviso |
| V4 | `order` contíguo a partir de 1; `id`, `letter`, `order` únicos | falha |
| V5 | `finalForm` presente exatamente em מ נ כ פ צ | falha |
| V6 | 6 sílabas, na ordem a e i o u sheva, todas partindo da letra | falha |
| V7 | `confusableWith` só contém letras hebraicas reais | falha |
| V8 | Nenhum caractere hebraico fora de um span `.he` no HTML gerado | falha |
| V9 | Nenhuma pontuação bidi-neutra dentro de um span `.he` | falha |
| V10 | Revisão N só mostra letras já ensinadas | falha |
| V11 | SVG de traçado ausente ou ainda placeholder | aviso |
| V12 | `wordsToRead` vazio (esperado na letra 1) | aviso |
| V13 | Hebraico em campo de prosa sem marcação `{{…}}` | falha |
| V14 | Toda palavra de `wordsToRecognize` tem ilustração em `icons.json` | falha |
| **V15** | **Toda palavra-ponte contém a sua letra** — base ou forma final | falha |
| **V16** | **`modules.json` e `letters.json` contam a mesma história**: módulo, lição e blocos contínuos da ordem de leitura | falha |
| V17 | A letra tem menos de 2 palavras que a contenham — os exercícios de completar ficam curtos | aviso |

V1 é a razão de existir do arquivo. Para vê-la funcionando, adicione
`שָׁלוֹם` ao `wordsToRead` da letra ת (ordem 2) e rode o build:

```
✗ V1  tav (ת, ordem 2) — wordsToRead "שָׁלוֹם" (shalom) usa "ש" [ordem 9],
      "ל" [ordem 10], "ו" [ordem 12] — depois da ordem 2
```

V15 e V16 também foram provadas com casos negativos: pôr `רדיו` nas
palavras-ponte do sámech, ou mudar o `module` do guímel de 2 para 3, faz o
build sair com código 1 nomeando o problema — e, no caso do V16, as duas
faixas da ordem de leitura que deixaram de ser contínuas.

---

## O contrato de direção

A página é `<html lang="pt-BR" dir="ltr">`. **Todo** hebraico passa por
`he()` em `scripts/lib/render.js`, que produz:

```html
<span class="he" lang="he">שָׁלוֹם</span>
```

```css
.he { direction: rtl; unicode-bidi: isolate; font-family: var(--font-he); }
```

Três regras, todas verificadas por máquina:

1. **Pontuação nunca entra no span.** `he()` lança exceção se você tentar, e V9
   confere o HTML gerado.
2. **Spans não aninham.** Frases mistas são montadas com `mixed([...])` ou
   `prose('… {{hebraico}} …')`, nunca por concatenação.
3. **Marcas invisíveis** (U+200E/200F/061C e os overrides) são removidas na
   leitura dos dados. Elas são a causa clássica do bug de bidi que ninguém
   consegue reproduzir, porque são invisíveis em qualquer editor.

Isso existe porque o PDF de referência tem três defeitos reais de bidi:

- o título sai como `(מ Mem)` — o parêntese de fechamento troca de lado;
- `Encontre todas as letras מ: מים / בית / מה / שלום / מי` sai com a lista
  inteira invertida, porque os dois-pontos e as barras são neutros que se
  juntam à corrida RTL;
- pior: a atividade "Ligue corretamente" sai reemparelhada — `Mayim` acaba ao
  lado de `מי` e `Mi` ao lado de `מים`. É um artefato de bidi que **ensina a
  resposta errada**.

`unicode-bidi: isolate` resolve os dois primeiros. A regra "pontuação fora do
span" resolve o terceiro definitivamente.

---

## Ilustrações

Cada palavra de vocabulário tem um ícone, mapeado em `data/icons.json`:

```jsonc
"מַיִם": "droplet",       // ícone do conjunto Lucide
"אַרְבַּע": "#4"            // "#" = texto literal
```

Os números são texto de propósito: "4" ilustra *quatro* melhor do que quatro de
qualquer coisa. Palavras abstratas ganham o ícone que mais se aproxima —
{{מִי}} (*quem*) é uma pessoa, {{מָה}} (*o quê*) é um ponto de interrogação.

Os ícones vêm do **Lucide** (ISC), e `tools/gen-icons.mjs` vendoriza **só os
usados** — 61 de 2112 — em `assets/icons/`, com a licença ao lado. São
inseridos no HTML, não linkados: uma página impressa nunca deve depender de
um arquivo externo. Herdam `currentColor` e o tamanho vem do CSS, então o
mesmo arquivo serve o slot de 26px da tabela e o de 54px da galeria.

```bash
npm i -D lucide-static && node tools/gen-icons.mjs
```

A regra **V14** falha o build se uma palavra com slot ficar sem mapeamento ou
apontar para um arquivo ausente — o tipo de buraco que ninguém mais reportaria.

## Fontes

Todas auto-hospedadas em `assets/fonts/`, com a licença ao lado. Nada de CDN.

| Uso | Fonte | Licença | Por quê |
|---|---|---|---|
| Títulos | DM Sans 300–700 | OFL-1.1 | é a fonte de display do PDF |
| Corpo | Inter 400/500/700 | OFL-1.1 | é a fonte de texto do PDF |
| Hebraico impresso | **Noto Sans Hebrew** | OFL-1.1 | ver abaixo |
| Hebraico cursivo | **Gveret Levin AlefAlefAlef** | OFL-1.1 | ver abaixo |

**Por que Noto Sans Hebrew e não Open Sans.** O PDF compõe o hebraico em Open
Sans. Inspecionando os binários com `fontTools`:

| | nikud | finais | GPOS | GSUB |
|---|---|---|---|---|
| Open Sans Hebrew | 18 | 5/5 | `mark`, `mkmk` | `ccmp` |
| **Noto Sans Hebrew** | **55** | 5/5 | `mark`, `mkmk` | `ccmp` |

Mesma textura sans, mas com o repertório completo de pontuação. `mark` e `mkmk`
posicionam os sinais; `ccmp` é o que compõe שׁ + daguesh (שּׁ) e os hatafim sem
colisão. Um workbook que ensina pelo nikud não pode arriscar isso.

**Gveret Levin** é cursiva hebraica de verdade (o מ cursivo tem o traço em "N",
o ם final tem a volta fechada) e carrega os 21 sinais de nikud e as 5 formas
finais — combinação rara em fontes cursivas abertas. Ela tem `mark` mas **não
tem `mkmk`**, então dois sinais empilhados no mesmo caractere podem se
aproximar demais. Como a cursiva só é usada sem pontuação (modelo, traçado,
cópia), isso não afeta nenhuma página gerada hoje.

**Entrelinha.** O nikud desce abaixo da linha de base. Qualquer caixa que
contenha hebraico pontuado usa `--lh-he: 1.75` e nunca `overflow: hidden`.

---

## Traçado sem 66 imagens

Os três estados de escrita saem do **mesmo caractere**, em CSS:

```css
.glyph--model { color: var(--c-ink); }
.glyph--trace { color: transparent; -webkit-text-stroke: 1.4px var(--c-neutral-600); }
.glyph--ghost { color: var(--c-ink); opacity: .13; }
```

Verificado renderizando em Chromium: o contorno aparece corretamente na tela e
no PDF de impressão.

### Ordem dos traços

`assets/stroke-order/` traz **27 SVG** — as 22 letras e as 5 formas finais —
gerados por `tools/gen-stroke-order.py`. É uma ferramenta de autoria, roda uma
vez e os SVG vão versionados; **não faz parte de `npm run build`**:

```bash
pip install fonttools brotli
python3 tools/gen-stroke-order.py
```

O que é exato e o que é regra, porque a diferença importa:

| | |
|---|---|
| **Traçado da letra** | Exato. O contorno sai do próprio `gveret-levin-hebrew-400-normal.woff2`, a mesma face cursiva do modelo e das linhas de traçado — a forma que o aluno traça e a que ele vê aqui não podem divergir. |
| **Número de traços** | Derivado. O contorno é separado em partes; uma parte cujo retângulo cabe dentro de outro é um vazado (o buraco de um laço fechado como o {{ס}}), não um traço à parte. Contando só os contornos externos: **he, álef e qof com dois traços, todas as outras com um** — que é a contagem real da cursiva israelense. |
| **Ordem e ponto de partida** | Regra. O traço começa no alto, e quando há mais de um o da direita vem primeiro, porque o hebraico corre da direita para a esquerda. As duas regras concordam nas três letras de dois traços: he (corpo, depois a perna esquerda), álef (curva direita, depois o traço esquerdo), qof (cabeça, depois a haste). |
| **Seta** | Aponta do ponto de partida para o centro do traço — "comece aqui e siga para dentro da forma". Não afirma o sentido da curva, que é justamente o que o contorno não sabe dizer. |

Um revisor nativo ainda deve conferir a ordem antes da impressão. Nada disso é
crítico para o build: uma letra sem SVG, ou com um ainda marcado
`data-placeholder`, mostra a letra-modelo e a nota "em breve", e V11 avisa.

Licença: Gveret Levin é OFL-1.1, que permite derivar e embutir contornos.
`assets/fonts/LICENSE-gveret-levin.txt` acompanha o projeto.

---

## Desvios deliberados em relação ao PDF

Dois, ambos revertíveis com uma linha:

1. **Contraste do cabeçalho de tabela.** O PDF usa `#464646` sobre `#1A99BA` —
   2,75:1, reprovado no WCAG AA e o primeiro elemento a sumir numa fotocópia.
   A faixa foi escurecida para `--c-teal-band: #15788F` com texto branco
   (4,9:1). O teal de destaque dentro das palavras continua `#1A99BA`, idêntico
   à referência. Para reverter: `--c-teal-band: var(--c-teal)` e
   `--c-teal-on: #464646` em `styles/tokens.css`.
2. **Tamanho do hebraico inline.** `--t-he-inline: 1.15em`. Hebraico pontuado
   no mesmo corpo do latim ao redor fica pequeno demais para quem está
   aprendendo a distinguir os sinais.

---

## PDF

```bash
npm run pdf              # o livro inteiro → pdf/hebraico-moderno-workbook.pdf
npm run pdf -- 01-mem    # um módulo só
```

Precisa de Playwright + Chromium, e por isso **não faz parte de `npm run build`**
— o build em si não tem dependência nenhuma e continua assim:

```bash
npm i -D playwright && npx playwright install chromium
```

O livro sai de `dist/livro-completo.html` numa **única passada de impressão**, e
não de trinta arquivos juntados depois. A diferença é real: juntar reiniciaria a
paginação a cada módulo e não deixaria uma tabela quebrar entre duas páginas de
uma mesma seção. Num documento só, o Chromium pagina o livro como livro.

**A margem mora no `@page`, não no padding da folha.** Padding só vale no topo e
na base de uma caixa, então uma seção que passa de uma página começaria a
segunda colada na borda do papel. Várias passam — de propósito.

### Sumário com páginas reais

Um sumário não tem como saber em que página cada seção cai antes de o livro ser
paginado. Então `npm run pdf` imprime, mede e reconstrói:

1. imprime o livro;
2. `tools/page-map.py` lê o PDF e acha em que página cada seção começa;
3. grava `data/page-map.json`, reconstrói o `dist/` e imprime de novo.

Como a largura do número é fixa, a segunda passada não desloca nada e o laço
converge na primeira tentativa. Sem Python ou PyMuPDF o livro sai igual — o
sumário só fica com um traço no lugar do número, e a execução avisa.

O marcador que torna isso possível é um `<span class="secmark">` invisível. Duas
coisas nele são críticas, e cada uma esteve errada uma vez:

- **não é `position: absolute`** — em mídia paginada o Chromium ancora elementos
  absolutos na primeira página do documento, e todos os marcadores relatavam
  página 1;
- **não é `color: transparent` nem 1px** — o Chromium descarta texto totalmente
  transparente ou sub-pixel da camada de texto, e aí não há o que ler.

Ele também fica **entre o badge e o `<h1>`**, não no topo da seção: uma caixa de
altura zero logo depois de uma quebra de página forçada cai de um lado ou do
outro conforme o humor do motor, e várias seções saíam uma página adiantadas.

## Publicar

`dist/` é estático, qualquer host serve. O PDF pronto fica em `pdf/` (ignorado
pelo git — é artefato de build).
