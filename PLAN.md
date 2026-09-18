# PLAN

## Pronto

`npm run build` → **31 arquivos em `dist/`**, validate com **0 violações**.

| | |
|---|---|
| Sumário | 2 folhas |
| Página 0 — Os sinais de vogal | 4 folhas |
| Letras 1–22 | 10–11 folhas cada |
| Revisões (após as letras 4, 8, 12, 16, 20) + final | 6 módulos |
| Apêndice (alfabeto · nikud · transliteração · cursiva) | 10 folhas |
| **Total** | **287 folhas = 287 páginas A4**, verificado |

**Uma folha é uma página impressa.** Nenhuma etapa transborda: quando não cabe,
ganha folha de continuação explícita. `npm run check-fit` mede todas e o
`npm run pdf` falha se a contagem do PDF não bater com a do HTML.

**E as folhas são preenchidas.** `npm run pack` mede as 764 peças e agrupa —
81% de ocupação média, contra 69% quando cada peça tinha a sua folha. O livro
encolheu 57 páginas sem perder nada e sem nenhuma folha estourando.

**As 22 letras estão autoradas**, na ordem pedida:
מ ש ל ב ת י ה ו ר א נ ק ד ח ס פ ג ע כ ז ט צ — com 78 entradas em
`wordsToRead`, todas passando pela regra V1.

- `scripts/validate.js` — 13 regras. **V1 e V10 provadas com casos negativos**:
  adicionar {{שָׁלוֹם}} à letra 2 faz o build sair com código 1 nomeando cada
  letra ofensora; injetar {{צ}} na Revisão 1 dispara V10.
- O contrato de direção (`lib/render.js`): `he()` é o único caminho do hebraico
  até a página, pontuação não entra em span, V8/V9 reconferem o HTML gerado.
- `gapParts()` apaga a **letra-alvo**, não a primeira: em {{מֶלֶךְ}} na lição do
  Kaf, o vão cai no {{ך}} final, não no {{מ}} inicial.
- `styles/tokens.css` extraído do PDF com PyMuPDF, cada token comentado com a
  origem.
- Fontes auto-hospedadas com licença; cursiva Gveret Levin conferida nas 22
  letras e nas 5 formas finais (ver Apêndice D).
- **PDF do livro inteiro** (`npm run pdf`): 318 páginas A4, numeração contínua
  no rodapé, sumário com as páginas reais medidas do próprio PDF e conferidas
  marcador a marcador.
- **27 SVG de ordem de traçado** (22 letras + 5 formas finais), gerados de
  `tools/gen-stroke-order.py` a partir do contorno real do glifo cursivo. As
  letras com forma final mostram o traçado das duas na página 3A.
- `data/translit.json` — 254 entradas, gerado a partir de `letters.json` e
  provado consistente pela V3.

## A seguir

1. **Sua revisão do conteúdo.** Vale olhar, em `data/letters.json`:
   - `wordsToRead` de cada letra — o vocabulário que o aluno lê de fato;
   - `brazilianMistake` — o erro típico de brasileiro por letra;
   - `didYouKnow` — a nota cultural.
2. **Três decisões pendentes:** a regra de acento na transliteração (implementada
   como "acentue pelas regras do português"), a aprovação da cursiva, e se o
   teal escurecido do cabeçalho fica.
3. **Conferência nativa da ordem de traçado.** Os 27 SVG estão prontos, com o
   contorno exato da cursiva e a contagem de traços derivada do próprio glifo
   (he, álef e qof com dois; as demais com um). O ponto de partida segue a
   regra "começa no alto, o da direita primeiro" — vale um olhar de quem
   escreve hebraico à mão antes de imprimir. Ver README §Ordem dos traços.
4. Ilustrações do vocabulário (os poços `.well`/`.well-sm` já reservam o espaço).

## Adiado de propósito

- **Áudio.** `audioIds` existe e está vazio nas 22 letras. A síntese `he-IL` do
  navegador é fraca e a maioria dos motores ignora o nikud — inútil num módulo
  cujo objetivo é "esta letra faz este som". São ~55 clipes: uma sessão curta.
- **Edição para público cristão.** `biblicalWord` existe em cada letra, `null`.

## Problemas conhecidos

- A Atividade 3 da P2 ("Ligue corretamente") põe leitura e palavra lado a lado,
  como na referência, o que a torna trivial. Duas colunas separadas seriam um
  exercício de verdade. Diga se prefere mudar.
- `V3b` sinaliza {{שָׁם}}/{{שֵׁם}}. Par legítimo do hebraico, só registrado.
- Algumas folhas terminam com bastante espaço em branco. Correto para impressão
  (cada folha é uma página A4 real), mas dá para densificar.
