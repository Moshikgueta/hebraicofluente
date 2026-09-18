# Publicar o curso

O app é estático — 48 páginas pré-renderizadas, e o único estado é o do aluno,
no navegador dele. Não há servidor, não há banco, não há custo. Ele mora no
GitHub Pages e se republica sozinho a cada push.

**Endereço:** https://moshikgueta.github.io/hebraicofluente/

---

## Já está no ar

Não é preciso fazer nada para publicar uma mudança. O fluxo é este:

```
você edita  →  git push  →  Actions roda os testes  →  build  →  Pages
                                     ↓ (se falhar)
                               nada é publicado
```

O workflow (`.github/workflows/deploy-app.yml`) dispara quando um push mexe em
`app/`, `data/`, `assets/` ou no exportador. Editar só o livro (`templates/`,
`scripts/`) não republica o app, de propósito.

Leva cerca de **um minuto** do push ao ar.

---

## O passo a passo, do zero

Se um dia for preciso refazer isto — outro repositório, outra conta:

**1. Ligar o Pages, uma vez.**
Settings → Pages → Build and deployment → Source: **GitHub Actions**.

Este é o único passo manual que existe, e ele não dá para automatizar: o
`GITHUB_TOKEN` do workflow não tem permissão para criar o site. Enquanto o
Pages não estiver ligado, a execução falha em `configure-pages` com
*"Resource not accessible by integration"*. Depois de ligado, nunca mais.

**2. Conferir o caminho base.**
O Pages serve um repositório de projeto em `/<nome-do-repo>/`. Esse prefixo está
no workflow:

```yaml
env:
  NEXT_PUBLIC_BASE_PATH: /hebraicofluente
```

Se o repositório mudar de nome, mude aqui também. Se um dia o curso for para um
domínio próprio, deixe a variável **vazia**.

**3. Empurrar.** `git push`. Pronto.

---

## Ver o que aconteceu

- **Execuções:** https://github.com/Moshikgueta/hebraicofluente/actions
- **Republicar sem mudar nada:** Actions → *Deploy app to Pages* → *Run workflow*

Uma execução verde significa que os **72 testes passaram** antes do build. Isso
é de propósito: um deploy que pulasse os testes poderia pôr uma lição na frente
de alguém com uma letra que ela ainda não viu — que é exatamente o erro que este
curso existe para não cometer.

---

## Rodar na sua máquina

```bash
cd app
npm install
npm run dev      # http://localhost:3000
```

`npm run dev` regenera `app/content/` a partir de `data/` antes de subir, então
o que você vê local é o que vai ao ar.

Para testar exatamente como o Pages serve, com o prefixo:

```bash
NEXT_PUBLIC_BASE_PATH=/hebraicofluente npm run build
npx http-server app/out -p 8080   # e abra /hebraicofluente/
```

---

## Quando o áudio chegar

Largue os `.mp3` em `audio/`, confira e empurre:

```bash
npm run check-audio     # o que chegou, o que falta, o que tem nome errado
git add audio && git commit -m "Onda 1 do áudio" && git push
```

O build copia `audio/` para dentro do app e os botões viram play sozinhos. Não
há nada para configurar.

---

## Armadilhas já resolvidas — não as reintroduza

**Não adicione outro workflow de Pages.** O template *"Deploy Next.js site to
Pages"* que o GitHub oferece na aba Actions constrói a **raiz do repositório**,
onde o `package.json` é o do livro, não o do app. Ele falha, e pior: usa o mesmo
grupo de concorrência `pages`, então disputa a publicação com o workflow certo.
Um foi adicionado e removido; se aparecer de novo, apague.

**Fontes só por `next/font/local`.** Um `url('/fonts/…')` escrito à mão no CSS
não é reescrito para o caminho base e dá 404 no Pages — a página carrega, o
hebraico aparece numa fonte de sistema, e o nikud sai fora de lugar. É a falha
que mais importa e a menos visível.

**URLs montadas em código precisam de `asset()`.** Áudio e SVG de traçado são
concatenados em `src/lib/asset.ts`; o Next não reescreve string que este código
inventa.

**`trailingSlash` e `.nojekyll` são obrigatórios.** Sem o primeiro, `/licao/mem`
não encontra o `index.html`. Sem o segundo, o Jekyll engole a pasta `_next/`.

---

## O site é público

O repositório é público, então o Pages também é: qualquer pessoa com o endereço
abre o curso. Para testar no celular, tudo bem. Se um dia isso não servir, a
mesma pasta `app/out/` sobe em qualquer host estático — Cloudflare Pages,
Netlify, um bucket — com `NEXT_PUBLIC_BASE_PATH` vazio.
