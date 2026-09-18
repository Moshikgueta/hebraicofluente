# PLAN

## Pronto

`npm run build` → **37 seções em `dist/`**, validate com **0 violações**.

| | |
|---|---|
| Sumário | 3 folhas |
| Página 0 — Os sinais de vogal | 3 folhas |
| 5 aberturas de módulo (plano de aulas) | 4–5 folhas cada |
| Letras 1–22 | 11–12 folhas cada |
| Revisões (uma por módulo) + revisão final | 5–7 folhas cada |
| Módulo 6 — sem daguesh e as 5 finais | 9 folhas |
| Módulo 7 — os sons com gerech | 4 folhas |
| Apêndice (alfabeto · nikud · transliteração · cursiva) | 10 folhas |
| **Total** | **331 folhas = 331 páginas A4**, verificado |

**A ordem das letras é a do plano de aulas**, não a alfabética e não uma ordem
inventada: as 7 unidades de «בא לי עברית!» — חוברת למורה, 22 lições de 1h30.

```
módulo 1  lições 1–3    מ ת א · נ ה י
módulo 2  lições 4–6    ג ד ש · ל ר
módulo 3  lições 7–9    ו ז · ח ט
módulo 4  lições 10–12  ס ע · צ ק
módulo 5  lições 13–15  ב · כ פ
módulo 6  lições 16–18  sem daguesh · as 5 formas finais
módulo 7  lições 19–21  os sons com gerech — צ׳ ג׳ ז׳
```

Cada módulo abre com a sua própria página (o que cobre, em que lição, o que
você vai conseguir ler ao fim) e fecha com uma revisão que carrega a lição de
prática da unidade. **O vocabulário foi reautorado contra a nova ordem** e
depois revisado palavra a palavra: 99 entradas em `wordsToRead`, todas passando
pela V1.

**Uma folha é uma página impressa.** Nenhuma etapa transborda: quando não cabe,
ganha folha de continuação explícita. `npm run check-fit` mede todas e o
`npm run pdf` falha se a contagem do PDF não bater com a do HTML.

**E as folhas são preenchidas.** `npm run pack` mede as 860 peças e agrupa —
81% de ocupação média, contra 69% quando cada peça tinha a sua folha.

- `scripts/validate.js` — 17 regras. **V1, V10, V15 e V16 provadas com casos
  negativos**: adicionar שָׁלוֹם à letra 2, injetar צ na Revisão 1, pôr
  רדיו nas palavras-ponte do sámech ou mudar o módulo do guímel faz o build
  sair com código 1 nomeando o problema.
- **Palavras-ponte** (`bridgeWords`): o método do guia — encontrar a letra nova
  dentro de uma palavra emprestada que o brasileiro já conhece. 89 palavras,
  uma tabela por letra na abertura do módulo. A V15 garante que cada uma
  realmente contém a sua letra, em forma base ou final.
- O contrato de direção (`lib/render.js`): `he()` é o único caminho do hebraico
  até a página, pontuação não entra em span, V8/V9 reconferem o HTML gerado.
- `gapParts()` apaga a **letra-alvo**, não a primeira.
- `styles/tokens.css` extraído do PDF com PyMuPDF, cada token comentado com a
  origem.
- Fontes auto-hospedadas com licença; cursiva Gveret Levin conferida nas 22
  letras e nas 5 formas finais (ver Apêndice D).
- **PDF do livro inteiro** (`npm run pdf`): 331 páginas A4, numeração contínua
  no rodapé, sumário com as páginas reais medidas do próprio PDF.
- **Ilustrações do vocabulário**: 68 palavras mapeadas em `data/icons.json`,
  61 ícones Lucide (ISC) vendorizados. V14 falha o build se faltar alguma.
- **27 SVG de ordem de traçado** (22 letras + 5 formas finais), gerados de
  `tools/gen-stroke-order.py` a partir do contorno real do glifo cursivo.
- `data/translit.json` — 294 entradas, gerado a partir de `letters.json` e
  provado consistente pela V3.

## A seguir

1. **Sua revisão do conteúdo.** Vale olhar, em `data/letters.json`:
   - `wordsToRead` de cada letra — todo o vocabulário foi reescolhido na
     reordenação, e é a parte mais nova do livro;
   - `bridgeWords` — as palavras emprestadas, tiradas do guia do docente;
   - `brazilianMistake` e `didYouKnow`.
2. **Três decisões pendentes:** a regra de acento na transliteração, a
   aprovação da cursiva, e se o teal escurecido do cabeçalho fica.
3. **Conferência nativa da ordem de traçado.** Ver README §Ordem dos traços.
4. Trocar algum ícone que não convença: é uma linha em `data/icons.json`.

## Adiado de propósito

- **Áudio.** `audioIds` existe e está vazio nas 22 letras; `tools/gen-audio.mjs`
  já monta a lista de clipes, mas não está ligado ao build. Parado a pedido.
- **Edição para público cristão.** `biblicalWord` existe em cada letra, `null`.

## Problemas conhecidos

- As letras 1 e 2 (מ e ת) não têm palavra inteira para ler: com duas
  consoantes não fecha nenhuma. A etapa 2 cai na tabela de cópia de sílabas e
  a página diz isso ao leitor. A partir da letra 3 (א) há palavras.
- A Atividade 3 da P2 ("Ligue corretamente") põe leitura e palavra lado a lado,
  como na referência, o que a torna trivial. Duas colunas separadas seriam um
  exercício de verdade. Diga se prefere mudar.
- `V3b` sinaliza שָׁם/שֵׁם. Par legítimo do hebraico, só registrado.
- A lição 5 do guia também apresenta שׂ (sin) ao lado de ל e ר. Como
  שׂ não é uma letra separada — é o mesmo ש com o ponto do outro lado —
  ela é tratada na própria letra 9 e na abertura do módulo 2, não como uma
  23ª lição.
