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
- **A fusão de progresso é monotônica** (`app/src/lib/state/merge.ts`). Todo
  campo tem um "mais adiantado dos dois" e é ele que fica; contagem é MÁXIMO e
  nunca soma, senão o mesmo dia sincronizado duas vezes dobra o XP. É essa
  propriedade que deixa o adaptador repetir a fusão depois de um 409 sem medo
  de desfazer alguma coisa. Um campo novo no estado precisa de uma regra aqui,
  e de um teste em `app/tests/merge.test.ts`.

## Progresso: onde mora
Três camadas, nesta ordem, e `createStore()` (`app/src/lib/state/store.tsx`)
escolhe:

1. **Worker + D1** (`NEXT_PUBLIC_PLATFORM_API=worker`, que é a build publicada).
   Tabela `progress`, uma linha por conta, o estado inteiro em JSON. O
   adaptador (`app/src/lib/state/worker.ts`) **embrulha** o localStorage em vez
   de substituí-lo: o curso continua funcionando sem sinal, e a sincronização
   é uma fusão nos dois sentidos.
2. **Supabase** - porta escrita e nunca ligada, só entra com as duas variáveis.
3. **localStorage** - o padrão do `npm run dev` e de qualquer export sem API.

A coluna `rev` é o que impede um aparelho de apagar o outro: toda escrita
declara a revisão que leu, o servidor recusa com 409 quem pisar numa revisão
vencida e devolve o estado atual junto, e o cliente funde e repete. `uid` volta
no GET para que um notebook compartilhado não funda o progresso de uma pessoa
na conta de outra.

## Antes de commitar
```sh
cd app && npm test        # 265 testes
cd app && npm run build   # export estático
npm run validate          # ordem das letras, nikud, palavras
```

Verificações em navegador de verdade (a 390px, com `HF_CHROMIUM` apontando
para o Chromium já instalado - nunca `playwright install`):

```sh
cd app && npm run varrer      # rolagem lateral e erros de console em todas as rotas
cd app && npm run ctas        # visitante vs aluno: quem já comprou não vê checkout
cd app && npm run trancado    # o cadeado do teste final nos três estados
cd app && npm run portao      # o portão de domínio da lição não tranca ninguém
cd app && npm run exame       # o exame final abre e responde (para nos pareamentos)

# a sincronia precisa do Worker no ar, com o D1 local:
npm run db:init:local
SESSION_SECRET=qualquer-coisa npx wrangler dev --port 8788 --local
cd app && npm run sincronia   # dois aparelhos, uma conta, ninguém perde trabalho
```
