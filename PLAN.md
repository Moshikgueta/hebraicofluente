# PLAN

## Pronto

**Gerador completo, ponta a ponta.** `npm run build` → 6 módulos em `dist/`,
`validate` com 0 violações.

- `scripts/lib/hebrew.js` — nikud, formas finais, normalização nikud-insensível
  por padrão, remoção das marcas invisíveis de direção.
- `scripts/lib/render.js` — o contrato de direção: `he()`, `heList()`,
  `heCloze()`, `pair()`, `mixed()`, `prose()`. Nenhum hebraico chega à página
  por outro caminho.
- `scripts/validate.js` — 13 regras, V1 provada com um caso negativo (build
  sai com código 1 e nomeia cada letra ofensora).
- `styles/tokens.css` — extraído do PDF com PyMuPDF, cada token comentado com a
  origem. Margem 13,6 mm, faixa de tabela 28 pt, badge 20,5 pt, régua verde
  1,21 pt, hairline `rgba(0,0,0,.078)`.
- `templates/letter.js` — as 5 etapas (7 folhas A4: P1, P2, 3A, 3B, 3C, P4,
  P5). Nenhuma letra citada pelo nome; embaralhamento determinístico.
- `templates/page-0.js` — Os sinais de vogal, por som e não por nome, com a
  correção ao "22 letras, todas consoantes".
- Fontes auto-hospedadas com licença, escolhidas por inspeção dos binários.
- Traçado em CSS a partir do mesmo caractere; 22 placeholders de SVG de ordem
  de traçado que não quebram o build.
- `data/letters.json` — **letras 1 a 5** (מ ש ל ב ת) com vocabulário autoral.
- `MIGRATION-REPORT.md` — auditoria do projeto de espanhol (contexto anterior).

**Módulo Mem renderizado e comparado com o PDF.** Os três defeitos de bidi da
referência não se reproduzem: os parênteses do título ficam no lugar, a lista
de sílabas lê da direita para a esquerda na ordem certa, e os pares
`leitura • palavra` não se reemparelham.

## A seguir

1. **Sua revisão do vocabulário das letras 1–5** — o brief pede essa parada.
   Ver `data/letters.json`. Pontos que merecem seu olho:
   - letra 1 (מ) não tem nenhuma palavra legível possível: `wordsToRead` está
     vazio e as páginas caem para prática silábica. É estrutural, não um vazio
     de autoria.
   - `brazilianMistake` de cada letra: nasalização antes de M, ש lido como S,
     L final virando U, ב sem daguesh, T palatalizado antes de I/E.
2. **Três decisões pendentes** — regra de acento na transliteração, aprovação
   da cursiva Gveret Levin por prova visual, e se o teal escurecido fica.
3. Letras 6–22 (י ה ו ר א נ ק ד ח ס פ ג ע כ ז ט צ).
4. Unidades de revisão após as letras 4, 8, 12, 16, 20 + revisão cumulativa
   final. Implementar V10 junto.
5. Apêndice: tabela do alfabeto, nomes dos sinais de nikud, chave de
   transliteração, quadro de cursiva.
6. Desenhar os 22 SVG de ordem de traçado.

## Adiado de propósito

- **Áudio.** `audioIds` existe e está vazio em todas as letras. A síntese de
  voz `he-IL` do navegador é fraca e a maioria dos motores ignora o nikud — num
  módulo cujo objetivo é "esta letra faz este som", isso não serve. São ~55
  clipes (22 letras + 5 finais + palavras-exemplo): uma sessão curta de
  gravação. Estrutura pronta, gravação depois.
- **Edição para público cristão.** `biblicalWord` existe em cada letra, `null`.
- **Imagens do vocabulário.** Os poços (`.well-sm`, `.well`) reservam o espaço
  para a arte não reflowar a tabela depois.
- **Parcelamento / camada de pagamento.** Fora do escopo deste repositório.

## Problemas conhecidos

- Atividade 3 da P2 ("Ligue corretamente") põe leitura e palavra lado a lado,
  como na referência — o que a torna trivial. Duas colunas separadas seriam um
  exercício de verdade. Não mexi porque é o desenho da referência; diga se
  prefere mudar.
- `V3b` sinaliza שָׁם/שֵׁם. É um par legítimo do hebraico, só está registrado.
- As folhas P1 e 3A ficam com bastante espaço em branco no rodapé. Correto para
  impressão (cada folha é uma página A4 real), mas dá para densificar se você
  preferir menos páginas.
