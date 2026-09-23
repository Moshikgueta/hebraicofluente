# Rodada de 23/09 - palavras que se constroem, cursiva, digitação, vocabulário e nome

## 1. O que foi implementado

- **Montar a palavra letra por letra** (`build-letters`). O som na tela, as
  letras soltas da grafia na mesa, a primeira à direita. Três níveis pela
  posição da letra no curso: inicial (2-3 letras, sem distrator, com o
  significado), intermediário (3-5 letras, 1-2 distratores), avançado
  (palavras maiores, as **parecidas** como distratores, sem o significado).
  O erro diz em que posição está a primeira letra errada e qual deveria
  estar lá, e devolve as peças dali em diante para refazer. "Mostrar a
  resposta" só aparece na terceira tentativa. A nota é a da primeira
  tentativa, e a troca registrada é a do primeiro erro.
- **Cursiva em palavra** (`cursive-word`), em quatro modos que entram aos
  poucos: a letra destacada dentro da palavra à mão (a partir da letra 3),
  qual palavra impressa está escrita (5), da impressa para a cursiva (7), e
  o significado só pela cursiva (9). A quinta etapa, montar em cursiva,
  entra na letra 11. A palavra à mão aparece sem vogais, como se escreve de
  verdade.
- **Nas lições**: a prática passou de 14 para 16 itens a partir do Mem, com
  uma camada de montar e uma de cursiva em palavra. As camadas antigas
  continuam todas, e a revisão continua do mesmo tamanho. A fixação alterna
  montar por letras com as outras formas de montar, e a cursiva de letra com
  a de palavra.
- **Academia**: três modos novos. "Construir palavras", "Palavras à mão" e
  "Digitar em hebraico".
- **Teclado hebraico**: guia para iPhone, Android, Windows e Mac (onde abrir,
  como adicionar, como alternar, como saber que está ativo), com um campo de
  teste que confirma o hebraico chegando. A confirmação "Já adicionei o
  teclado hebraico" é exigida **só** antes do modo de digitação, e fica
  gravada na conta. Nenhuma lição pede teclado. Letra latina no campo gera o
  aviso "o teclado ainda está em português", e não conta como erro.
- **Meu vocabulário** (`/vocabulario`): as palavras que as letras concluídas
  leem, com transliteração, significado, as letras da palavra, a forma à mão,
  a imagem quando existir e o áudio quando houver gravação. Busca em
  hebraico, transliteração e português. As palavras ainda bloqueadas aparecem
  só como número.
- **"Você já consegue ler N palavras"**: uma conta só, feita sobre o
  vocabulário real do curso (139 palavras) e as letras concluídas. Aparece no
  fim de cada letra (com quantas palavras ela abriu), no fim de cada
  checkpoint, no painel e no glossário. Conquistas nos marcos de 10, 25, 50 e
  100 palavras, gravadas uma vez, com data.
- **Seu nome em hebraico** (`/meu-nome`): o transliterador sugere até três
  grafias e diz com clareza que existe mais de um jeito. O aluno edita por
  toque, sem teclado, e vê o nome em impressa e à mão. Ele confirma a
  grafia, que fica gravada na conta, e pratica a escrita no mesmo quadro das
  lições. A atividade só abre quando todas as letras da grafia já foram
  concluídas; antes disso, diz quantas faltam, sem revelar quais. O convite
  aparece no painel e no fim da letra que torna o nome escrevível.
- **Certificado**: opção "Adicionar meu nome em hebraico". A grafia vem
  preenchida, pode ser editada e só entra no desenho depois de o aluno marcar
  "Conferi". Os dois formatos foram conferidos em tamanho real.
- **Estrutura de imagens**: `image`, `imageAlt` e `imagePrompt` por palavra,
  num arquivo próprio, com um estilo comum. O exportador recusa entrada para
  palavra que não existe no curso e caminho para arquivo que não existe.

**Dois defeitos achados pelo navegador e corrigidos:** o componente de
resposta era reaproveitado entre dois itens seguidos do mesmo tipo, e as
peças ou o texto de um vazavam para o seguinte. E o glossário mostrava o ו
como letra antes de o Vav ser ensinado.

## 2. Arquivos alterados

`app/src/lib/engine/{exercises,types,gym}.ts` ·
`app/src/lib/state/{types,merge,migrate,rules,store}.ts(x)` ·
`app/src/components/learn/{Answers,ExercisePlayer,TraceBoard}.tsx` ·
`app/src/app/{academia,certificado,checkpoint,licao,meu-hebraico}/*Client.tsx` ·
`app/src/lib/{analytics,certificate,content-publico,seo}.ts` ·
`tools/export-content.mjs` · `worker/src/gate.js` ·
`app/{exercicios,varrer-curso,toque}.mjs` · `app/package.json` ·
`app/tests/{cobertura,full-course}.test.ts` · `PAINEL-ALUNOS.md`

## 3. Componentes e módulos novos

| arquivo | o quê |
|---|---|
| `lib/engine/palavras.ts` | vocabulário, as duas réguas (ler × montar), montar, cursiva, digitar |
| `lib/leitura.ts`, `lib/vocabulario.ts` | a conta de palavras legíveis e o hook que grava os marcos |
| `lib/nome-hebraico.ts` | o transliterador e a regra de quando a atividade abre |
| `components/learn/GuiaTeclado.tsx` | o guia dos quatro sistemas |
| `components/learn/ContadorDeLeitura.tsx` | o cartão "você consegue ler N palavras" |
| `components/learn/MeuNome.tsx` | o editor por toque e o cartão do nome |
| `BuildLetters`, `TypeHebrew` em `Answers.tsx` | montar por letras; digitar em hebraico |
| `app/vocabulario`, `app/meu-nome`, `app/teclado-hebraico` | as três telas |
| `data/imagens-vocabulario.json`, `DIRECAO-VISUAL-VOCABULARIO.md` | imagens e direção visual |
| `app/rodada2.mjs` | a verificação das telas novas no navegador |

## 4. Como cada atividade se integra

| atividade | habilidade | onde conta |
|---|---|---|
| montar por letras (impressa e cursiva) | `ler` | prática, fixação (vale nota), academia; troca do 1º erro vai para `confusions` |
| cursiva, letra destacada | `rec` | prática, academia; a troca vai para `confusions` |
| cursiva, palavra / significado | `ler` | prática, fixação, academia |
| digitar em hebraico | `escrever` | só academia, atrás do teclado |
| escrever o nome à mão | nenhuma habilidade por letra (é celebração, não avaliação) | conquista "Meu nome em hebraico" |
| todas | - | `state.kinds` guarda acerto e erro por tipo, para o painel de alunos |

A progressão pedida (ver, reconhecer, dentro da palavra, sílaba, palavra,
sentido, construir, reconstruir de memória, cursiva) está coberta: montar
entra no Mem, a cursiva em palavra no Tav, e digitar a palavra é a
reconstrução de memória.

## 5. Testes

- `tests/rodada2.test.ts`: 29 testes. Nenhuma letra futura nas atividades
  novas (todas as letras, cinco tentativas), a mesa de montar, os três
  níveis, as etapas de cursiva, a digitação, os modos da academia, a conta
  de palavras batendo com a regra de leitura, o transliterador, a abertura do
  nome, a migração e a fusão do estado novo.
- `app/rodada2.mjs`: as telas em 390px e 1280px, com 20 verificações por
  largura.
- A simulação do curso inteiro passou a gravar os marcos, como as telas
  fazem. `exercicios.mjs` aprendeu a montar e a desistir, e as varreduras de
  página e de alvos de toque passaram a incluir as três rotas novas.
- Suíte: 696 → 725. Verde também: tsc, os dois builds, e todas as
  verificações de navegador e de deploy.

## 6. O que precisa de conteúdo manual

- **Imagens**: as 47 entradas estão escritas (cena + texto alternativo);
  nenhuma imagem foi gerada. Veja `DIRECAO-VISUAL-VOCABULARIO.md`.
- **Áudio**: continua 0 de ~321. O glossário mostra o botão sozinho quando
  a gravação existir.
- **Revisão das transliterações de nomes**: as regras cobrem bem nomes
  comuns (Gabriel, Daniel, Mariana, Sofia, José), mas "João" sai ז׳ואו (em
  Israel também se vê ז׳ואאו), e nomes com h, x ou lh merecem um olhar de
  falante nativo. Como o aluno edita e confirma, o risco é baixo.
- **Guia do teclado**: os caminhos dos menus são os atuais; vale conferir num
  aparelho de cada sistema, porque os fabricantes mudam os nomes.

## 7. Sugestões (não implementadas)

- **Tamanho da lição**: a prática subiu para 16 itens. Se o tempo por lição
  incomodar, a primeira coisa a cortar é um dos dois itens de leitura, e não
  os de produção.
- **O nome no painel de alunos**: mostrar só se o aluno fez a atividade, e
  não a grafia. A grafia é dado pessoal e não ajuda a acompanhar o
  aprendizado.
- **Montar a partir do áudio** (ditado), quando as gravações chegarem: é o
  mesmo componente, com o som no lugar da transliteração.
- **Palavras no mapa**: cada letra do mapa poderia dizer quantas palavras ela
  abre, antes de ser feita. É o mesmo número, usado como motivação.
