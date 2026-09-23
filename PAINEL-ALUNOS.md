# Acompanhamento de alunos - auditoria e proposta

**Hebraico Fluente · 23 de setembro de 2026**

Resposta ao item 16 do pedido de auditoria. **Nada aqui foi implementado.** É
a investigação do que existe e a arquitetura recomendada, na ordem que o pedido
definiu: primeiro como funciona hoje, depois o que muda.

O resumo cabe em três frases. **O progresso já pertence à conta e não ao
aparelho**, e quase tudo que o painel precisa mostrar já está sendo gravado. O
que falta é um jeito de ler isso de fora - hoje só o próprio aluno enxerga o
próprio progresso - e dois dados pequenos que não existem: o histórico de
sessões e o acerto por tipo de exercício. Não é preciso um sistema paralelo;
é preciso uma tabela de resumo, um registro de atividade e três telas.

---

## 1. Como o progresso funciona hoje

Todo o estado de aprendizagem de um aluno é **um objeto só**, o `LearnerState`
(`app/src/lib/state/types.ts:124`). Toda ação que conta - responder, terminar
uma etapa, escrever, jogar - passa por uma função pura em `rules.ts`, que
devolve um estado novo, e pelo `commit` do `store.tsx`, que grava.

A gravação tem duas camadas (`app/src/lib/state/worker.ts`):

1. **o aparelho primeiro**, em `localStorage`, sempre. É o que deixa o curso
   funcionar sem sinal;
2. **o servidor depois**, com `PUT /api/progress`, sempre que alguma coisa de
   verdade mudou. Trocar de tela sozinho não sobe nada.

Quando dois aparelhos escrevem ao mesmo tempo, o servidor recusa o segundo com
409 e devolve o estado atual; o aparelho funde (`merge.ts`, uma fusão que só
avança e nunca apaga) e tenta de novo. `AUDITORIA-PROGRESSO.md` testou isso com
duas contas reais e um navegador.

## 2. Onde ele está armazenado

| o quê | onde | observação |
|---|---|---|
| conta: nome, e-mail, data de cadastro | D1, tabela `accounts` | `created_at` em ms |
| acesso ao curso | D1, `entitlements` | uma linha por curso |
| **todo o progresso** | D1, `progress.state` | **um JSON por aluno**, com `rev` e `updated_at` |
| cópia local | `localStorage` do navegador | cache; marcada com o dono |
| eventos de análise | memória do navegador | **não saem do aparelho** - não há destino instalado (`analytics.ts:64`) |
| trilha de acesso | D1, `access_log` | só o que mexe em acesso, não em estudo |

## 3. As perguntas do pedido, uma a uma

| pergunta | resposta |
|---|---|
| onde ficam os usuários? | `accounts`, no D1 |
| onde ficam os exercícios concluídos? | Não como lista. Ficam como **contagem**: acertos e erros por letra e por habilidade (`state.skills`), respostas por dia (`state.days`), e só os ERRADOS como itens (`state.srs`) |
| como letras desbloqueadas são registradas? | Não são: são **calculadas**. Uma letra abre quando a anterior tem 5 etapas e fixação ≥ 80% (`rules.ts`, `liberaSeguinte`) |
| como resultados são salvos? | fixação em `lessons[id].quizBest` e `quizAttempts`; checkpoints em `checkpoints`; exame em `finalChallenge`; jogos em `gym[modo]` (melhor nota, tempos) |
| depende só do navegador? | **Não.** O servidor é a cópia que vale entre aparelhos; o navegador é cache |
| está vinculado à conta? | **Sim.** A linha de `progress` é da conta, e o cache local guarda de quem é para não misturar duas pessoas no mesmo notebook |
| o aluno vê o mesmo progresso em outro aparelho? | **Sim**, ao entrar. A fusão junta o que houver dos dois lados |
| existe risco de perder progresso? | Pequeno. Ver a seção 4 |
| inconsistências entre frontend e banco? | Uma conhecida e aceita. Ver 4.3 |

## 4. Limitações atuais

**4.1 - Ninguém além do aluno consegue ler o progresso.** Não existe rota de
administração, papel de administrador, nem consulta que atravesse contas. O
servidor guarda um JSON por aluno e, por desenho, "nunca pergunta quem domina o
Shin" (`worker/schema.sql`, comentário da tabela `progress`). Para o painel,
essa pergunta passa a existir.

**4.2 - Não há histórico, só totais.** O estado sabe que no dia 22/09 o aluno
respondeu 38 questões, e sabe a melhor nota de cada jogo. Não sabe que às 20h
ele jogou o Relâmpago e fez 18 de 20. O "histórico recente" pedido não pode ser
montado com o que existe - só aproximado a partir das datas de conclusão.

**4.3 - Letras concluídas antes de 22/09 aparecem como não concluídas.** O
defeito da nota de fixação (corrigido em `984a418`) deixou `quizBest: null` em
letras terminadas antes da correção. A migração foi recusada, então **o painel
vai mostrar esses alunos atrasados** em relação ao que eles realmente fizeram.
Não é defeito do painel; é bom saber antes de olhar para os números.

**4.4 - Várias habilidades pedidas não são separadas.** Os seis jogos gravam
tudo como `rec` (`AcademiaClient.tsx:194`), e "som → letra" e "letra → som"
caem na mesma conta `som`. Cursiva e impressa também não têm conta própria.
Ver 6.4.

**4.5 - Não existe "último acesso" de verdade.** `progress.updated_at` é a
última vez que algo MUDOU; quem entra, olha o mapa e sai não mexe nele.

**4.6 - Riscos de perder progresso, avaliados.**
- estudar deslogado e nunca entrar: o progresso fica só no aparelho. Baixo
  risco, porque o conteúdo pago exige login;
- "apagar meu progresso" no perfil: apaga no servidor, sem desfazer. Existe
  backup do D1 com restauração ensaiada (bloco 3.16);
- aba anônima: `localStorage` some ao fechar, mas o servidor já tem tudo que
  mudou. Sem risco real.

## 5. O que já pode ser reutilizado

Quase tudo. A tabela abaixo é cada campo pedido contra a fonte que já existe.

| campo pedido | fonte | pronto? |
|---|---|---|
| nome, e-mail, cadastro | `accounts` | sim |
| primeiro acesso | primeira chave de `state.days`, ou `onboarding.completedAt` | sim, calculado |
| último acesso | falta - ver 6.5 | **não** |
| última atividade | `state.lastRoute` | parcial - atrasa até a próxima mudança |
| última letra estudada | `lessons` + `lastRoute` | sim, calculado |
| letras desbloqueadas | regra `liberaSeguinte` sobre `lessons` | sim, calculado |
| letras concluídas | `lessons` com 5 etapas e `quizBest` ≥ 0,8 | sim, calculado |
| % do curso | `courseProgress()` em `rules.ts` | sim, calculado |
| módulos concluídos | `checkpoints[*].passedAt` | sim |
| exercícios concluídos | soma de `days[*].answered` | sim |
| testes e notas | `quizBest`, `checkpoints[*].best`, `finalChallenge` | sim |
| respostas, acertos, erros | soma de `skills[*][*].hits` e `misses` | sim |
| sequência atual e maior | `state.streak` | sim |
| tempo de estudo | soma de `days[*].units` × 20 s | sim, **aproximado** |
| última sessão | última chave de `state.days` | sim |
| mapa das 22 letras | `lessons` + regra de desbloqueio | sim |
| por letra: tentativas | `lessons[id].quizAttempts` | sim |
| por letra: acerto | `skills[id]` | sim |
| por letra: erros mais frequentes | `confusions` com aquela letra como certa | sim |
| por letra: última prática | maior `skills[id][*].lastOn` | sim |
| por habilidade | `skills[*]`, 5 habilidades | parcial - ver 4.4 |
| histórico recente | não existe | **não** |
| taxa de erro por exercício | não existe | **não** |
| taxa de abandono por exercício | eventos definidos, sem destino | **não** |

Três coisas reaproveitáveis que não estão na tabela e valem muito:

- **as funções de `rules.ts`**. O painel tem de usar `courseProgress`,
  `liberaSeguinte` e `letterMastery` - as MESMAS que o aluno vê. Um painel com
  uma segunda definição de "letra concluída" é um painel que um dia discorda da
  tela do aluno;
- **o vocabulário de `analytics.ts`**, que já tem `lesson_started`,
  `stage_completed`, `game_completed`, `checkpoint_completed` e outros, com
  regras de privacidade escritas no topo do arquivo;
- **`access_log`**, que já existe e serve para registrar quem abriu o painel.

## 6. O que precisa mudar

### 6.1 - Uma tabela de resumo, calculada na escrita

Ler e interpretar o JSON de cada aluno para montar uma lista funciona com dez
alunos e para de funcionar com algumas centenas: o plano do Workers dá pouco
tempo de CPU por requisição, e a lista precisaria abrir todos os estados de uma
vez.

A solução é o servidor calcular **um resumo pequeno** toda vez que aceita um
`PUT /api/progress` - ele já tem o estado aberto na mão nesse momento, então o
custo é quase zero - e guardá-lo numa linha própria.

```sql
CREATE TABLE progress_summary (
  account_id      INTEGER PRIMARY KEY REFERENCES accounts(id),
  updated_at      INTEGER NOT NULL,
  first_day       TEXT,              -- YYYY-MM-DD, primeira chave de days
  last_day        TEXT,              -- última chave de days
  letters_started INTEGER NOT NULL DEFAULT 0,
  letters_done    INTEGER NOT NULL DEFAULT 0,
  current_letter  TEXT,              -- a primeira não concluída
  course_pct      REAL    NOT NULL DEFAULT 0,  -- 0..1, courseProgress()
  answers         INTEGER NOT NULL DEFAULT 0,
  misses          INTEGER NOT NULL DEFAULT 0,
  study_units     INTEGER NOT NULL DEFAULT 0,  -- × 20 s = tempo aproximado
  streak_current  INTEGER NOT NULL DEFAULT 0,
  streak_longest  INTEGER NOT NULL DEFAULT 0,
  checkpoints     INTEGER NOT NULL DEFAULT 0,
  final_done      INTEGER NOT NULL DEFAULT 0,  -- 0/1
  quiz_attempts   INTEGER NOT NULL DEFAULT 0,  -- soma, para o alerta de repetição
  skills_json     TEXT    NOT NULL DEFAULT '{}', -- {rec:{h,m}, som:{h,m}, ...}
  kinds_json      TEXT    NOT NULL DEFAULT '{}', -- ver 6.4
  confusions_json TEXT    NOT NULL DEFAULT '[]'  -- as 5 maiores
);
CREATE INDEX summary_last_day ON progress_summary(last_day);
CREATE INDEX summary_pct      ON progress_summary(course_pct);
```

**Isto é redundante, e de propósito.** Tudo aqui pode ser recalculado do JSON a
qualquer momento. O resumo existe para uma coisa só: listar, ordenar e filtrar
centenas de alunos numa consulta. A seção 7 explica o critério.

**Quem calcula.** O servidor, e não o aparelho: um resumo enviado pelo app
poderia ser forjado pelo próprio aluno. Mas a regra de "letra concluída" mora
no app, e duplicá-la no Worker é o risco que o comentário de `progress.js`
aponta. As duas coisas se conciliam assim:

- o Worker calcula só **contagens** - somar acertos, contar etapas, ler datas;
- as três constantes que definem regra (`STAGE_COUNT`, `LIBERA_MARK`, a ordem
  das letras) saem do mesmo `export-content` que já gera o conteúdo, e o Worker
  as importa em vez de escrevê-las;
- um teste roda a função de resumo do Worker e as funções de `rules.ts` sobre
  os mesmos estados de exemplo e **exige números iguais**. Se alguém mudar a
  regra num lado só, a suíte cai.

E um comando local, `npm run recalcular-resumos`, preenche a tabela para quem
já tem progresso gravado antes dela existir.

### 6.2 - Um registro de atividade, por sessão e não por resposta

Para o "histórico recente" e para a taxa de abandono.

```sql
CREATE TABLE activity (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  at         INTEGER NOT NULL,
  kind       TEXT    NOT NULL,   -- lista fechada, ver abaixo
  ref        TEXT    NOT NULL DEFAULT '',  -- letra, jogo, checkpoint
  score      REAL,               -- 0..1, quando houver
  detail     TEXT    NOT NULL DEFAULT ''   -- "18/20", nunca texto livre
);
CREATE INDEX activity_conta ON activity(account_id, at DESC);
CREATE INDEX activity_tipo  ON activity(kind, at);
```

Uma linha por **sessão**, nunca por resposta. A lista fechada de `kind`:

`lesson_started` · `stage_completed` · `quiz_completed` · `checkpoint_started`
· `checkpoint_completed` · `review_completed` · `game_started` ·
`game_completed` · `gym_started` · `gym_completed` · `final_completed`

Todos já existem no vocabulário de `analytics.ts`. A mudança é **instalar o
destino** que hoje não existe (`setSink`), com uma lista branca: só esses tipos
sobem, em lote, com `POST /api/activity`. Tudo o resto continua sem sair do
navegador, como a política de privacidade diz hoje.

Com `*_started` e `*_completed` lado a lado, a taxa de abandono de um jogo é
uma subtração.

**Retenção: 180 dias**, apagados pela mesma varredura que já limpa `throttle` e
`password_resets`. Seis meses respondem "o que ele fez recentemente" e "onde a
turma trava"; guardar mais seria guardar por guardar.

### 6.3 - Último acesso

Uma coluna `last_seen_at` em `accounts`, gravada quando a sessão é conferida,
**no máximo uma vez por dia por conta**. Uma escrita por aluno por dia, e não
uma por clique.

### 6.4 - Acerto por tipo de exercício

Sem isto não dá para responder "este exercício tem 54% de erro", nem separar
cursiva, som → letra e memória. A forma mais barata é **uma contagem a mais no
próprio estado**:

```ts
kinds: Record<ExerciseKind, { h: number; m: number }>
```

São 28 tipos, dois números cada: menos de 1 KB por aluno, sem tráfego novo -
ela sobe junto com o resto. Somada entre os alunos pelo resumo, dá a taxa de
erro de cada exercício do curso.

Isto pede uma migração de estado (`STATE_VERSION` 2 → 3, com o passo em
`migrate.ts`), que começa vazia: não inventa passado.

E uma correção que a auditoria de exercícios já pediu: os jogos gravarem a
habilidade certa (`AUDITORIA-EXERCICIOS.md`, problema 5). Sem ela, a habilidade
`rec` do painel mente.

### 6.5 - O papel de administrador

Hoje não existe. Recomendo **não** usar um token na URL - um link que vaza
num print abre o painel de todos os alunos. Em vez disso:

- um segredo `ADMIN_EMAILS` no painel da Cloudflare (nunca no `wrangler.toml`);
- o administrador entra com a própria conta, pelo login normal;
- toda rota `/api/admin/*` confere a sessão E o e-mail na lista;
- toda abertura de ficha individual grava uma linha em `access_log`
  (`admin_view`, com o id do aluno). É o que responde, meses depois, "quem
  olhou os dados desta pessoa".

## 7. O que guardar e o que calcular

A regra que usei, e que recomendo manter:

> **Guarde o que aconteceu. Calcule o que se conclui disso.**

| dado | guardar ou calcular | por quê |
|---|---|---|
| etapas feitas, nota da fixação, tentativas | **guardar** | é fato; não dá para reconstruir |
| acertos e erros por habilidade e tipo | **guardar** (contagem) | idem |
| letras desbloqueadas | **calcular** | é regra; se a régua mudar, o número muda sozinho |
| letras concluídas | **calcular** | idem |
| % do curso | **calcular** | idem - guardar `67%` congelaria a regra do dia em que foi gravado |
| precisão | **calcular** | é uma divisão |
| status (ativo, inativo...) | **calcular** | depende de "hoje" |
| alertas | **calcular** | idem |
| resumo da lista | **guardar como cache** | só porque a lista precisa ordenar centenas; recalculável a qualquer hora |

O resumo é a única exceção, e ela é explícita: é um cache com comando para
refazer, não uma segunda fonte de verdade.

## 8. A arquitetura recomendada

```
aparelho do aluno
  LearnerState em localStorage
  │  PUT /api/progress  (já existe)
  │  POST /api/activity (novo: só eventos de sessão, em lote)
  ▼
Worker
  progress         ← JSON, fonte da verdade (já existe)
  progress_summary ← calculado a cada PUT aceito (novo)
  activity         ← uma linha por sessão, 180 dias (novo)
  accounts.last_seen_at ← uma vez por dia (novo)
  │
  │  /api/admin/alunos          lista, a partir do resumo
  │  /api/admin/alunos/:id      ficha, a partir do JSON + atividade
  │  /api/admin/turma           visão geral, agregando o resumo
  ▼
/admin (página estática, fora do sitemap, noindex, atrás do mesmo portão)
```

Nenhuma tabela das sete sugeridas no pedido (`course_progress`,
`lesson_progress`, `letter_progress`, `exercise_attempts`...) é necessária.
Todas elas seriam a normalização do JSON que já existe, e normalizar teria dois
custos sem retorno: uma segunda migração em SQL que precisa concordar com a do
app, e uma escrita por tabela por resposta. `exercise_attempts` em particular -
uma linha por resposta - é o sistema de vigilância que o pedido diz não querer.

## 9. O painel

Os três desenhos abaixo usam **números e nomes inventados**, só para mostrar a
forma da tela.

### 9.1 - A lista

```
Alunos · 143                        [ buscar nome ou e-mail        ]
Filtros: (todos) (ativos 7d) (inativos) (com dificuldade) (concluíram)

Aluno              Progresso        Precisão  Letra atual  Última atividade      Último acesso  Status
─────────────────────────────────────────────────────────────────────────────────────────────────────
Ana Souza          ███████░░░ 68%   84%       ק Qof        Fixação ק · 90%        hoje           em progresso
Bruno Lima         ██░░░░░░░░ 18%   58% ⚠     ד Dálet      Batalha · 61%          há 3 dias      dificuldade
Carla Mendes       ░░░░░░░░░░  0%    -        -            -                      há 21 dias     não começou
Diego Alves        ██████████ 100%  91%       -            Desafio final · 88%    há 2 dias      concluído
```

- clicar no cabeçalho ordena; o padrão é **última atividade**, mais recente
  primeiro;
- a precisão ganha ⚠ abaixo de 60% com pelo menos 50 respostas - menos do que
  isso não é evidência;
- "com dificuldade" é o filtro dos alertas da seção 10;
- a linha inteira abre a ficha.

**Status**, calculado nesta ordem (o primeiro que servir):

| status | regra |
|---|---|
| curso concluído | `finalChallenge.completedAt` preenchido |
| ainda não começou | nenhuma etapa feita em letra nenhuma |
| inativo | começou, e a última sessão foi há mais de 14 dias |
| começou recentemente | primeira sessão há 7 dias ou menos |
| quase concluindo | 18 letras ou mais concluídas |
| em progresso | todo o resto |

### 9.2 - A ficha do aluno

```
Ana Souza · ana@...                     cadastro 02/09 · 1º estudo 03/09 · último acesso hoje

 Progresso 68%       Precisão 84%        Sequência 6 dias (máx. 11)     ~4 h 20 min de estudo
 ███████░░░          ████████▌░

 A jornada
 Introdução ✓   א ✓  מ ✓  ת ✓  נ ✓  ה ✓  י ✓  ג ✓  ד ✓  ש ✓  ל ✓  ר ✓  ו ✓  ז ✓  ח ✓  ט ✓
                ס ✓  ע ✓  צ ✓  ק ●  ב 🔒  כ 🔒  פ 🔒      ✓ concluída  ● em andamento  🔒 bloqueada

 Por habilidade                              Onde ela trava
 Reconhecer     ████████▉ 92%                ד → ר   trocou 7 vezes, última há 2 dias
 Som            ███████▋  81%                ב → כ   4 vezes
 Leitura        ███████▎  77%
 Escrita        █████████ 95%
 Audição        -  (sem gravações)

 Atividade recente
 23/09  Fixação ק ........................ 90%
 23/09  Batalha das parecidas ............ 76%
 22/09  Letra צ concluída
 21/09  Revisão · א ב ג .................. 90%
```

Tocar numa letra do mapa abre o detalhe dela: etapas feitas e pendentes,
tentativas de fixação e melhor nota, acerto por habilidade, as trocas em que
ela é a letra certa, e a última vez que foi praticada.

**Progresso e desempenho ficam sempre lado a lado e sempre separados.** Nenhum
número do painel mistura os dois.

### 9.3 - A visão da turma

```
Turma                                      143 alunos · 61 ativos em 7 dias · 98 em 30 dias
                                           12 não começaram · 9 concluíram
                                           progresso médio 41% · precisão média 79%

 Onde param                                 Letras que mais custam
 א ████████████████████ 131                 ר   31% de erro
 ...                                        ד   28%
 ד ███████████ 74                           ז   24%
 ש ████████ 52   ← queda de 30%
 ...

 Trocas mais comuns                         Exercícios com mais erro
 ד → ר   37% dos que chegaram ao ר           ache a intrusa        41%
 ב → כ   29% dos que chegaram ao כ           letra dentro da palavra 33%
                                            média do curso        18%

 Abandono: começaram e não terminaram
 Batalha das parecidas   22%
 Fixação (média)          9%
```

"Onde param" é um histograma de `current_letter` entre os alunos inativos. A
seta marca a maior queda entre duas letras seguidas - é o "18 alunos chegaram
ao ט e não continuaram" do pedido, dito por um gráfico em vez de uma frase.

**Visualizações, e só estas:** barra de progresso, mapa das 22 letras, barras
por habilidade, histograma de onde param, e listas ordenadas. Nenhum gráfico de
pizza, nenhuma série temporal na primeira versão. A evolução da precisão ao
longo do tempo é o único gráfico que eu acrescentaria depois, e só quando
houver três meses de `activity` para desenhar.

## 10. Alertas

Poucos, e cada um responde a uma pergunta que muda o que você faz.

| alerta | regra | o que ele sugere |
|---|---|---|
| sumiu | começou, e 14 dias sem sessão | mensagem pessoal; é o alerta que mais recupera aluno |
| preso numa letra | a mesma letra atual há 7 dias ou mais, com 3 fixações abaixo de 80% | o problema é a letra ou o aluno? ver a ficha |
| precisão baixa | abaixo de 60% com 50 respostas ou mais | dificuldade real, não azar |
| rápido demais | 5 letras concluídas em 7 dias com precisão abaixo de 70% | está passando por tentativa; a trava de 80% está sendo vencida no insistir |
| repetindo | 6 tentativas de fixação na mesma letra | a fixação daquela letra pode estar difícil demais para todos - conferir na turma |
| queda coletiva | mais de 25% dos alunos que chegam a uma letra não passam dela | **alerta do curso, não do aluno** - é o que diz onde melhorar o conteúdo |

Os alertas aparecem **no painel**, como filtro e como marca na linha. Nenhum
e-mail, nenhuma notificação. Se um dia houver aviso por e-mail, que seja um
resumo semanal, e só do alerta coletivo.

## 11. Privacidade e LGPD

**O que o painel mostra:** nome, e-mail, datas de estudo e dados de
aprendizagem. **O que não mostra:** IP, aparelho, navegador, localização, e
nenhuma linha do tempo resposta por resposta.

Pontos que precisam de atenção antes de ligar:

1. **A finalidade declarada não cobre o painel.** A tabela de dados da
   política (`privacidade/page.tsx`, a lista `DADOS`) diz que o progresso serve
   para "mostrar onde você parou, escolher a próxima revisão e emitir o
   certificado". Acompanhamento pelo professor e melhoria do curso com dados da
   turma não estão ali, e a LGPD amarra o uso à finalidade informada
   (art. 6º, I). **A política tem de mudar antes do painel ir ao ar**,
   acrescentando essas duas finalidades e dizendo com todas as letras que **o
   professor pode ver o seu progresso**. Aluno que descobre isso sozinho sente
   que foi vigiado; aluno que leu antes sente que foi acompanhado.
2. **O registro de atividade é dado novo.** O código foi escrito com a
   promessa de que os eventos de análise não saem do navegador (o comentário do
   topo da página diz isso). Com `POST /api/activity`, os eventos de sessão
   passam a sair. A política ganha uma linha na tabela: o quê (início e fim de
   lições, jogos e provas, com a nota), por quanto tempo (180 dias) e para quê.
   A base legal continua sendo a execução do contrato (art. 7º, V), que a
   política já usa para o progresso.
3. **O motivo do estudo não entra no painel.** O onboarding pergunta por que a
   pessoa estuda hebraico, e uma das respostas é "família". Para parte dos
   alunos isso aponta para origem ou religião - dado sensível na LGPD
   (art. 5º, II). O painel individual não deve mostrar esse campo. Na visão da
   turma, só agregado.
4. **Apagar a conta tem de apagar o novo também.** `deleteAccount`
   (`worker/src/lib/db.js:627`) apaga `progress`, `entitlements` e outros;
   `progress_summary` e `activity` precisam entrar na mesma lista, com o teste
   de `tests/apagar-conta.test.ts` cobrando as duas.
5. **Acesso restrito e registrado.** Só e-mails da lista, e cada ficha aberta
   vai para `access_log`.
6. **Direito de acesso do aluno (art. 18).** Ele já vê o próprio progresso. Um
   botão "baixar meus dados" no perfil, com o JSON e a atividade, fecha o
   ciclo e custa pouco.

## 12. Lista de tarefas técnicas, em ordem

| # | tarefa | depende de | esforço |
|---|---|---|---|
| 1 | Jogos gravam a habilidade certa (pré-requisito de qualquer número de habilidade) | - | trivial |
| 2 | Atualizar a política de privacidade e o texto da coleta | - | pequeno |
| 3 | `ADMIN_EMAILS` + guarda de rota `/api/admin/*` + registro em `access_log` | - | pequeno |
| 4 | Tabela `progress_summary` + cálculo no `PUT` + teste de concordância com `rules.ts` | 1 | médio |
| 5 | `npm run recalcular-resumos` para quem já tem progresso | 4 | pequeno |
| 6 | `GET /api/admin/alunos` (lista, busca, ordem, filtros) | 3, 4 | pequeno |
| 7 | Página `/admin` com a lista | 6 | médio |
| 8 | `GET /api/admin/alunos/:id` e a ficha com o mapa das 22 letras | 3 | médio |
| 9 | `accounts.last_seen_at`, uma vez por dia | - | trivial |
| 10 | Tabela `activity` + destino de eventos com lista branca + `POST /api/activity` | 2 | médio |
| 11 | Histórico recente na ficha | 8, 10 | pequeno |
| 12 | `kinds` no estado (v2 → v3, com migração) e no resumo | 4 | médio |
| 13 | `GET /api/admin/turma` e a visão geral | 4, 12 | médio |
| 14 | Alertas, como filtros e marcas | 6, 10 | pequeno |
| 15 | `deleteAccount` apaga as tabelas novas, com teste | 4, 10 | trivial |
| 16 | Varredura de retenção de `activity` (180 dias) | 10 | trivial |
| 17 | "Baixar meus dados" no perfil | 10 | pequeno |

**O que dá para ter numa primeira entrega** (tarefas 1 a 9 e 15): a lista com
busca, ordem, filtros e status, a ficha com o mapa das letras e o desempenho
por habilidade. Sem histórico e sem visão da turma - essas precisam de
`activity` e de `kinds` acumulando por algumas semanas antes de mostrarem
alguma coisa útil, então começar a coletar cedo importa mais do que desenhar a
tela cedo.

A tarefa 15 está na primeira entrega de propósito: uma tabela nova que a
exclusão de conta esquece é um vazamento, não um detalhe.
