# A aventura ilustrada: auditoria, inventário e sistema visual (28/10/2026)

Pedido do dono: o master prompt "The Illustrated Hebrew Adventure". O pedido é
transformar a experiência sem perder conteúdo. Decisão do dono, no mesmo dia:
ilustração em **vetor no código** (SVG), sem custo e sem risco de direitos.

Este documento é a etapa 1: o que existe, o que não pode sumir e o sistema
visual que as próximas etapas vão usar.

## 1. Como a plataforma é feita

- **Site:** Next.js com export estático (`app/`). **Servidor:** Cloudflare Worker
  com D1 (`worker/`). O conteúdo pago sai de `/api/content`, atrás do portão.
- **Conteúdo:** `data/*.json` é a fonte. `app/content/` e
  `app/src/lib/audio-manifest.ts` são gerados por `npm run export-content`.
- **Progresso:** `LearnerState` no aparelho e na conta, com fusão monotônica
  (`app/src/lib/state/merge.ts`). Esta etapa não cria campo novo no estado.
- **Visual:** os tokens ficam em `app/src/styles/tokens.css`: navy, teal, gold,
  creme e areia, com tema escuro e alto contraste. As fontes são Instrument
  Sans, Bricolage e Noto Sans Hebrew (obrigatória para o nikud). O movimento
  segue a escala `--dur-*` e `--ease-*`.
- **Ilustração antes desta etapa:** as gravuras em linha de Raízes
  (`components/raizes/ilustracoes/Gravuras.tsx`) e os emblemas do portal
  (`components/portal/Emblemas.tsx`). Nenhuma ilustração nas telas do curso.

## 2. Inventário: o que não pode sumir

Contado em 28/10/2026, nos dados:

| O quê | Quanto | Onde |
|---|---|---|
| Letras, com formas finais, cursiva, som, ensino e "Você sabia?" | 22 | `data/letters.json` |
| Módulos / lições | 7 / 27 | `data/modules.json` |
| Palavras para ler / para reconhecer | 106 / 71 | `wordsToRead`, `wordsToRecognize` |
| Frases | 33 (10 novas, das letras 6 a 10) | `data/sentences.json` |
| Mini-textos e leituras de revisão | 13 | `data/textos.json` |
| Missões de módulo | 7 | `data/missoes.json` |
| Leituras bônus | 22 | `data/bonus.json` |
| Itens no catálogo de áudio / mp3 no git | 976 / 535 | `data/audio.json`, `audio/` |
| Motores de exercício | 20 arquivos | `app/src/lib/engine/` |

**Funções que continuam iguais:**
- a Aula 0, agora em passos;
- a lição em cinco etapas (Conhecer, Palavras, Escrever, Praticar e Fixação);
- as lições de som e o contraste;
- as lições de prática;
- os checkpoints, as missões e os mini-textos;
- a Academia, com Caça à letra, Batalha, Impressa × cursiva, Match, Blast, Teste, Palavras à mão e Meu nome;
- o Laboratório de leitura, com os níveis guiada, menos ajuda e independente;
- a revisão espaçada;
- o vocabulário e o domínio por habilidade;
- a loja de XP, as leituras bônus e o guia do nikud bíblico;
- o exame final, o certificado e o desafio final;
- o teclado hebraico, gravar a própria leitura e comparar a pronúncia;
- o menu de acessibilidade e o tema escuro;
- a conta, o pagamento e o portão.

**Regras pedagógicas que valem para toda ilustração:**
- nenhuma palavra com letra ainda não ensinada (`npm run validate`);
- a ordem das lições e as travas não mudam;
- hebraico só como texto, pelo `<He>`, nunca dentro do desenho;
- hebraico novo escrito pelo Claude só vai ao ar com a aprovação do dono.

## 3. Os três erros da imagem de referência, e o que entra no lugar

A imagem que o dono trouxe como inspiração tem a direção certa: lugares,
palavras reais e progresso visível. Mas tem três erros de conteúdo:

| Erro na imagem | Por que não | O que entra no lugar |
|---|---|---|
| A "Unidade 3" ensina **עִיר** (cidade). | O Áyin é a letra 17 do curso. No módulo 3, עִיר quebra a regra de que nenhuma palavra usa letra ainda não ensinada. | עִיר vai para o **módulo 4**, o primeiro em que ela é legível. Ali o cenário é "A cidade". Em cada módulo, o cenário sai das palavras que o aluno já lê (tabela abaixo). |
| As "unidades" da imagem (Primeiros Passos, A Terra de Israel...) não são os módulos do curso. | Inventar unidades mudaria a progressão, que não está em discussão. | Os **7 módulos reais**, cada um com um lugar e um tema. |
| A capa mostra o **Domo da Rocha**. | É uma mesquita, num lugar disputado. Numa capa de curso de hebraico, isso é sensível e desvia do assunto. | Paisagens do dia a dia, sem lugar sagrado reconhecível: o mar, o jardim, a rua de casa, um portão de pedra genérico, o mercado, a cidade nova e o terraço. |

## 4. O sistema visual

### Os lugares, alinhados ao vocabulário de cada módulo

| Módulo | Lugar | Palavras que o aluno já lê ali |
|---|---|---|
| 1 · As seis primeiras letras | O mar | יָם, מַיִם, תֵה, אִמָא |
| 2 · Cinco consoantes familiares | O jardim | גַן, הַר, נָהָר, אֲגַם, שֶׁמֶשׁ, דָג, גְלִידָה |
| 3 · O vav, o zayin e os sons da garganta | A rua de casa | חַלוֹן, וֶרֶד, לֶחֶם, מִטְרִיָה, שָׁלוֹם |
| 4 · Sámech, áyin, tsádi e kuf | A cidade | עִיר, עֵץ, צֵל, סַל, מִיץ |
| 5 · As três letras com ponto | O mercado | פִּתָה, תַפּוּחַ, קָפֶה, כֶּסֶף, בַּיִת |
| 6 · Sem o ponto | A cidade nova | a leitura sem nikud, como nas placas da rua |
| 7 · Os sons modernos | O terraço | o hebraico de hoje, num fim de tarde |

As palavras desta tabela são do curso: nenhuma foi escrita para cá.

### Regras do desenho (`components/aventura/Cenarios.tsx`)

- **Vetor, chapado, luz quente.** Céu de areia, pedra clara, oliveira e
  cipreste, e o mar no teal da marca.
- **As cores são tokens `--il-*`** (`tokens.css`), com uma versão de entardecer
  no tema escuro. Nenhuma delas é cor de texto.
- **Sem hebraico, sem rosto, sem símbolo religioso** dentro do desenho. As placas
  são retângulos.
- **Decorativo** (`aria-hidden`): o nome do lugar e do módulo está no texto do
  cartão.

### Regras do movimento

- Só `transform` e `opacity`: água, nuvens, pássaros, barco, ônibus e luzes.
- Só no cenário **vivo**, que é o módulo atual. Os outros ficam parados, para não
  gastar bateria num Android médio.
- Com "reduzir movimento", tudo para, pelas duas regras de `globals.css`.
- **Trancado** é o cenário dessaturado: o lugar existe, mas ainda não foi visitado.
  **Concluído** ganha o selo dourado.

## 5. O que esta etapa entrega

- `components/aventura/Cenarios.tsx`, com os 7 lugares.
- Os tokens `--il-*` nos dois temas e o movimento em `globals.css`.
- O mapa de "Meu curso" com o lugar de cada módulo no alto do cartão. Os links,
  as letras, a porcentagem, o checkpoint e as travas ficam como estavam.

## 6. As próximas etapas, uma por PR

1. **Lição de referência (o Mem):** o lugar do módulo na etapa Descobrir, com o
   מַיִם do curso (palavra do Mem desde sempre), sem mudar texto nem exercício.
2. **Fim de lição com comemoração** e a **coleção de letras**: cada letra
   dominada vira uma carta com a forma impressa e a cursiva, o som e o domínio.
3. **Laboratório de leitura:** o mesmo conteúdo e os mesmos níveis, com o
   visual da aventura.
4. **Flashcards de letras e palavras** em Praticar (pedido do dono).
5. **Cenas interativas** (o mercado, com objetos que se tocam e mostram a
   palavra já ensinada e o áudio aprovado), reaproveitadas em escuta, leitura e
   revisão.

## 7. Limites honestos

- Vetor chapado não é pintura. O acabamento da imagem de referência pede um
  ilustrador ou imagens geradas, que é uma decisão de custo do dono.
- As cenas desta etapa são molduras: ainda não há objeto para tocar.
  Interatividade é o item 5 da seção 6.
- O teste com pessoas (um aluno real usando o mapa) não foi feito. As medidas
  aqui são de navegador: capturas a 390 px, contraste no tema escuro e as
  conferências de sempre (`varrer-curso`, `escuro`, `toque`).
