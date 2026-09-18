# Hebraico Fluente — o curso interativo

O workbook impresso virou curso. Mesmos dados, dois produtos.

```bash
npm install
npm run dev        # exporta o conteúdo e sobe em :3000
npm run test       # 41 testes: regra da ordem, hebraico, XP, sequência, SRS
npm run build      # 45 páginas estáticas
```

## O que precisa ser entendido antes de mexer

**O conteúdo não mora aqui.** Ele mora em `../data/letters.json` e
`../data/modules.json`, junto com o livro, e entra neste app por
`tools/export-content.mjs` (`npm run export-content`, que o `dev` e o `build`
rodam sozinhos). Editar `content/` à mão é jogar trabalho fora: o próximo build
apaga. Para mudar uma palavra, mude nos dados — o livro e o curso mudam juntos,
ou nenhum dos dois muda.

**A regra da ordem é o produto.** Nenhuma palavra pode usar uma letra que o
aluno ainda não viu. No livro isso é a regra V1 do `validate.js`; aqui é o campo
`alphabetSoFar` de cada letra, que é a única coisa que o gerador de exercícios
recebe. `tests/order-rule.test.ts` enumera todos os exercícios que o curso é
capaz de gerar e falha se algum escapar.

**Hebraico só entra na tela por `<He>`.** Nada de `dir="rtl"` na página, nada de
`.split('').reverse()`, e pontuação nunca dentro do span. Os motivos estão em
`src/components/hebrew/He.tsx`, com os três bugs reais que o contrato evita.

## Estado atual

| | |
|---|---|
| Letras autoradas | 22 (as 7 unidades do plano de aulas) |
| Vertical slice implementado | Módulo 1 — מ ת א נ ה י + Checkpoint 1 |
| Áudio | **nenhum**. Ver ARCHITECTURE §6.3 |
| Persistência | localStorage. Supabase escrito, não conectado |
| Testes | 41 |

O motor é o mesmo para as 22 letras: as outras 16 lições já funcionam por
`/licao/<id>`, com o conteúdo completo. O que o slice fecha é o ciclo —
dashboard, mapa, lição, checkpoint, revisão, conquistas, progresso persistido.

Leia `ARCHITECTURE.md` antes de qualquer mudança estrutural.
