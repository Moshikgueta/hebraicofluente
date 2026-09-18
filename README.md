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
npm run validate   # só as verificações
npm run serve      # constrói e serve dist/ em http://127.0.0.1:8080
```

Não há dependências de runtime. Node 20+ é suficiente; as fontes estão
versionadas em `assets/fonts/`.

O build **falha** (sai com código 1) antes de escrever qualquer arquivo se
alguma regra fatal for violada. `dist/` nunca contém uma página que quebre a
regra de ordem.

---

## Estrutura

```
data/
  letters.json      um objeto por letra — a única fonte do conteúdo
  translit.json     a única fonte das transliterações
  nikud.json        os seis sons vocálicos (Página 0) e o daguesh
templates/
  letter.js         as 5 etapas de uma letra; nunca cita uma letra específica
  page-0.js         Os sinais de vogal, antes da letra 1
  partials.js       badge, callout, tabela, exercício, documento
scripts/
  build.js          data + templates → dist/
  validate.js       as 13 regras
  lib/hebrew.js     codepoints: nikud, formas finais, normalização
  lib/render.js     o contrato de direção — he(), heList(), heCloze(), prose()
styles/
  tokens.css        extraído do PDF de referência, com a origem de cada valor
  components.css    o mobiliário da página
  print.css         geometria A4
assets/
  fonts/            woff2 + licenças
  stroke-order/     22 SVG de ordem de traçado (placeholders por enquanto)
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
| V10 | Revisão N só usa letras de ordem ≤ 4N | falha *(pendente)* |
| V11 | SVG de traçado ausente ou ainda placeholder | aviso |
| V12 | `wordsToRead` vazio (esperado na letra 1) | aviso |
| V13 | Hebraico em campo de prosa sem marcação `{{…}}` | falha |

V1 é a razão de existir do arquivo. Para vê-la funcionando, adicione
`שָׁלוֹם` ao `wordsToRead` da letra ש e rode o build:

```
✗ V1  shin (ש, ordem 2) — wordsToRead "שָׁלוֹם" (shalom) usa "ל" [ordem 3],
      "ו" [não ensinada] — depois da ordem 2
```

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

## Publicar

`dist/` é estático. Qualquer host serve. Para PDF: abra `dist/index.html` no
Chrome e imprima em A4 — `styles/print.css` já remove cabeçalho e rodapé do
navegador e trata as quebras.
