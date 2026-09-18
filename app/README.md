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
| Letras | 22, nas 7 unidades do plano de aulas |
| Módulos | 5 de letras + 6 (sem daguesh e as finais) + 7 (o gerech) |
| Checkpoints | 5 de módulo + os fechos de 6 e 7 + o desafio final |
| Cenas «no mundo real» | 17, cada uma com a letra a partir da qual aparece |
| Páginas estáticas | 48 |
| Áudio | **nenhum gravado**; o kit de produção está pronto — ARCHITECTURE §6.3 |
| Persistência | localStorage. Supabase escrito, não conectado |
| Testes | 71, incluindo o curso inteiro jogado do começo ao fim |

O curso está completo: `/` → onboarding → `/inicio` → 22 lições → 5 checkpoints
→ módulos 6 e 7 → desafio final → `/concluido`. `tests/full-course.test.ts`
percorre tudo isso e confere o estado final.

## Publicar

O curso vai para o GitHub Pages por `.github/workflows/deploy-app.yml`, a cada
push que toque `app/`, `data/`, `assets/` ou o exportador. O workflow roda os
testes antes de construir — um deploy verde que os pulasse poderia colocar uma
lição na frente de alguém com uma letra que ela ainda não viu.

**É preciso ligar o Pages uma vez, à mão:** Settings → Pages → Build and
deployment → Source: **GitHub Actions**. O `GITHUB_TOKEN` do workflow não tem
permissão para criar o site, então a primeira execução falha em
`configure-pages` até que a chave seja virada. Depois disso, todo push publica.

Endereço: **https://moshikgueta.github.io/hebraicofluente/**

O repositório é público, então o site também é. Se isso não for desejado, o
mesmo `out/` serve em qualquer host estático — é só `NEXT_PUBLIC_BASE_PATH`
vazio e apontar para a pasta.

Leia `ARCHITECTURE.md` antes de qualquer mudança estrutural.
