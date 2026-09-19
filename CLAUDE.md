# Hebraico Fluente - notas do projeto

## Escrita: nada de travessão
O texto do site, dos comentários, dos commits e da documentação usa **hífen `-`**.
Nunca o travessão (U+2014) nem a meia-risca (U+2013), nem as formas escapadas
delas (`\u` seguido do código). Este arquivo cita os dois só pelo número de
propósito: escrever o caractere aqui faria a própria verificação abaixo
acusar o documento que explica a regra.

Travessão é a assinatura mais visível de texto gerado por IA, e este
projeto é vendido como material de um autor. A regra vale para:

- todo arquivo sob `app/`, `data/`, `worker/`, `scripts/`, `tools/`, `.github/`
- os `.md` da raiz, `wrangler.toml`, `.env.example`
- **os geradores**, não só a saída: `tools/export-content.mjs` escreve o cabeçalho
  de `app/src/lib/audio-manifest.ts`, então um travessão lá volta a cada
  `npm run export-content`

Verificação (o locale importa, senão a contagem sai em bytes):

```sh
LC_ALL=C.UTF-8 grep -rlP '\x{2014}|\x{2013}' \
  --exclude-dir={node_modules,.next,out,dist,.git,.wrangler} .
grep -rn 'u2014\|u2013' --exclude-dir={node_modules,.next,out,dist,.git,.wrangler} .
```

As duas linhas têm de sair vazias. As réguas de caixa (`─`, U+2500) dos
cabeçalhos de comentário não são travessões e ficam como estão.

## Onde mora o quê
- `data/*.json` é a fonte. `app/content/` e `app/src/lib/audio-manifest.ts` são
  **gerados** por `npm run export-content` - editar a saída é perder o trabalho no
  próximo build.
- `data/courses.json` é o catálogo: uma linha por curso, e é dele que saem
  `/cursos`, cada página de curso e **o preço cobrado**. O servidor lê o mesmo
  arquivo (`worker/src/lib/catalog.js`): preço nunca vem do corpo da requisição.
- `worker/` é a API (`/api/*`) e o portão do conteúdo pago. `IMPLEMENTATION` da
  camada de comércio: `DEPLOY-CLOUDFLARE.md` + `worker/schema.sql`.

## Invariantes que quebram o produto se forem ignorados
- **Noto Sans Hebrew é obrigatória** para todo hebraico: são 55 sinais de nikud e
  uma tabela `ccmp`. Fonte que posiciona vogal errado torna todo exercício de
  leitura errado.
- **`<He>` é a única porta de entrada para hebraico.** `unicode-bidi: isolate`,
  e pontuação nunca dentro do span hebraico.
- **Regra da ordem:** nenhuma palavra usa letra que ainda não foi ensinada.
  `npm run validate` cobra isso.
- **Limite de 10 ms de CPU** por requisição no plano gratuito do Workers. É por
  isso que o PBKDF2 roda 25.000 iterações (`worker/src/lib/crypto.js`) e não
  310.000. `wrangler dev` não aplica o limite: o erro só aparece em produção.

## Antes de commitar
```sh
cd app && npm test        # 212 testes
cd app && npm run build   # export estático
npm run validate          # ordem das letras, nikud, palavras
```
