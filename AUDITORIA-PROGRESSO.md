# Auditoria do sistema de progresso

**Hebraico Fluente · 21 de setembro de 2026**

Feita contra o Worker de verdade rodando com D1 local, duas contas de aluno
(ids 9 e 10) e um navegador Chromium controlado. Nenhuma conclusão aqui vem
só de leitura de código: cada uma tem o comando que a produziu e a resposta
que voltou.

---

## 1. VEREDITO

### READY WITH MINOR FIXES

O núcleo está certo e foi provado no ambiente real. O progresso vive numa
linha por conta no D1, é recuperado por conta e não por aparelho, sobrevive a
F5, a fechar o navegador, a logout/login e a trocar de máquina. Um aluno não
consegue ler nem escrever o progresso de outro - tentei forjar `account_id`,
`uid` e `accountId` no corpo e os três foram ignorados, porque a conta vem do
cookie assinado e de mais lugar nenhum.

O que impede um "READY" limpo são três coisas, nenhuma delas capaz de perder
progresso:

1. **o progresso de quem sai continua no navegador** até outra conta entrar;
2. **o destravamento do teste final é decidido no cliente** - editar o
   `localStorage` abre o exame;
3. **a sincronização com o servidor é muda** - quando falha, o aluno não vê
   nada.

Nenhuma delas bloqueia o lançamento. A primeira é de privacidade em
computador compartilhado, a segunda é o aluno enganando a si mesmo num
autoteste sem valor externo, e a terceira só morde quem estuda offline e nunca
mais abre o app naquele aparelho.

**Um aluno pagante não vai perder o progresso dele.** Isso está provado, não
suposto.

---

## 2. COMO O PROGRESSO FUNCIONA HOJE

Três camadas, e a ordem entre elas é a decisão de projeto mais importante do
sistema:

```
  ação do aluno
    ↓
  regras puras            app/src/lib/state/rules.ts
    ↓
  provedor React          app/src/lib/state/store.tsx
    ↓
  gravador (quando)       app/src/lib/state/gravador.ts
    ↓
  adaptador               app/src/lib/state/worker.ts
    ├──→ localStorage     app/src/lib/state/local.ts     ← SEMPRE, e primeiro
    └──→ PUT /api/progress worker/src/api/progress.js
              ↓
          putProgress      worker/src/lib/db.js
              ↓
          tabela progress  worker/schema.sql:183
```

**O aparelho grava primeiro, sempre.** O servidor vem depois. É o que faz o
curso funcionar no ônibus, e é por isso que uma falha de rede não custa nada.

**A leitura funde, não substitui.** `load()` lê o aparelho e o servidor e
roda `mergeStates` (`app/src/lib/state/merge.ts`), que é monotônica e
idempotente: nunca desfaz, e repetir não muda nada. É isso que faz o celular e
o notebook somarem em vez de se apagarem.

**O conflito é resolvido por `rev`.** Toda escrita declara a revisão que leu.
Quem escrever por cima de uma revisão vencida leva 409 com o estado atual
junto, funde e tenta de novo.

### O mapa que você pediu

| etapa | onde mora | arquivo |
|---|---|---|
| Aluno | `accounts.id` | `worker/schema.sql:14` |
| Curso | `entitlements(account_id, course_slug)` | `worker/schema.sql:36` |
| Módulo | derivado dos dados, não persistido | `data/modules.json` |
| Aula (letra) | `state.lessons[letterId]` | `rules.ts:126` |
| Exercício | `state.srs[itemId]` e `state.skills` | `rules.ts` |
| Resposta | não guardada individualmente - ver §4 | `store.tsx:184` |
| Progresso salvo | um JSON em `progress.state` | `progress.js:86` |
| Banco | D1, uma linha por conta | `schema.sql:183` |
| Restaurado | `load()` + `mergeStates` | `worker.ts:110` |

**Por que um JSON e não vinte tabelas.** O servidor nunca pergunta "quem
domina o Shin"; ele guarda e devolve. Normalizar pagaria o custo de um esquema
sem comprar nenhuma consulta, e criaria uma segunda migração em SQL que teria
de concordar com a que já existe no app. A decisão está documentada em
`schema.sql:167`.

---

## 3. O QUE É SALVO

Tudo dentro de `progress.state`, por conta:

| campo | o que guarda |
|---|---|
| `lessons[letterId]` | etapas feitas, melhor nota da fixação, tentativas, data de conclusão |
| `srs[itemId]` | caixa de Leitner, acertos, erros, quando vence, qual habilidade |
| `skills[letterId]` | domínio por habilidade: reconhecer, som, ler, ouvir, escrever |
| `confusions` | qual letra foi trocada por qual, e quantas vezes |
| `checkpoints[id]` | melhor nota, tentativas, quando passou |
| `exam` | melhor nota, tentativas, nota por parte |
| `gym[modeId]` | melhor nota e melhor tempo |
| `days[YYYY-MM-DD]` | itens respondidos, unidades, XP, se bateu a meta |
| `streak` | corrente, recorde, último dia |
| `xp` | total |
| `achievements` | conquistas e quando saíram |
| `firsts` | marcos que só acontecem uma vez |
| `lastRoute` | a última tela aberta |
| `onboarding` | nome e minutos por dia |

No banco, ao redor disso: `version` (a migração de quem gravou), `rev` e
`updated_at`, este último com relógio do servidor.

---

## 4. O QUE NÃO É SALVO

**Cada resposta individual.** O sistema guarda o efeito de responder - a
caixa do SRS mudou, a habilidade subiu, o dia contou - e não o evento. Não há
histórico de "às 14h32 respondeu C na questão 7".

Isto é decisão, e eu a endosso: o que ensina é o estado, não o log. Guardar
cada resposta multiplicaria por vinte o tamanho da linha e não responderia
nenhuma pergunta que o curso faça. Se um dia você quiser análise de
dificuldade por item, aí sim vale uma tabela separada - mas não antes de ter
alunos.

**A nota de uma tentativa que não foi a melhor.** `recordQuiz` guarda o
máximo. Refazer uma fixação e ir pior não estraga o que já foi conquistado.

**O que não terminou.** Uma etapa começada e abandonada no meio não deixa
rastro: o registro acontece na conclusão da etapa, não a cada clique.

---

## 5. TESTES EXECUTADOS

| # | teste | resultado | evidência |
|---|---|---|---|
| 1 | Parte de uma aula + F5 | **PASS** | `{alef:[1,2,3], mem:[1,2,3]}` antes e depois |
| 2 | Fechar o navegador e entrar de novo | **PASS** | contexto novo, sem cookie nem localStorage, recuperou as duas letras |
| 3 | Outro dispositivo | **PASS** | mesmo teste acima: o estado veio do servidor |
| 4 | Dois alunos no mesmo computador | **PASS** | A saiu com `dono:9`; B entrou e o cache virou `xp:0, dono:10` |
| 5 | Errar e depois acertar | **PASS** | `recordQuiz` guarda o máximo (`rules.test.ts`) |
| 6 | Fazer a mesma atividade duas vezes | **PASS** | `completeStage` devolve o mesmo objeto; XP não dobra |
| 7 | Perder a internet no meio | **PARTIAL** | nada se perde e sincroniza ao voltar, mas a tela não avisa |
| 8 | Isolamento entre contas na API | **PASS** | `account_id`/`uid`/`accountId` forjados ignorados |
| 9 | Sem sessão | **PASS** | GET/PUT/DELETE → 401 |
| 10 | Dois aparelhos gravando | **PASS** | o segundo leva 409 com o estado atual |
| 11 | Clique duplo | **PASS** | segunda escrita recusada, uma linha só, `rev 3` |
| 12 | Logout e login | **PASS** | 401 no meio, `xp 500` de volta depois |
| 13 | Voltar para uma aula anterior | **PASS** | nenhuma etapa perdida |
| 14 | Porcentagem do curso | **PASS** | 19 casos novos em `progresso-auditoria.test.ts` |
| 15 | Sequência de dias | **PASS** | mesmos 19 casos |
| 16 | Destravar o exame pelo cliente | **FAIL** | editar o `localStorage` abre o teste final |
| 17 | Certificado pelo cliente | **PARTIAL** | exige o exame, que também é forjável |

Suíte completa: **455 provas, 25 arquivos, todas verdes.** `tsc` limpo.

---

## 6. PROBLEMAS CRÍTICOS

**Nenhum.**

Não encontrei caminho para perder progresso, para ver o progresso de outra
pessoa, nem para corromper a linha de outra conta. Os três testes que mais me
preocupavam - forjar identidade na API, dois alunos no mesmo navegador, e
queda de rede no meio de uma atividade - passaram.

---

## 7. PROBLEMAS IMPORTANTES

### 7.1 O progresso de quem sai continua no navegador

Medido: depois do logout de A, o `localStorage` ainda tinha `xp: 800` e
`hf-progresso-dono: "9"`. Ele só é substituído quando outra conta entra.

Num computador compartilhado, quem senta depois pode abrir o console e ler os
dados de estudo de quem sentou antes. Não há senha nem token ali - é dado de
aprendizagem - mas é dado de outra pessoa.

**Conserto:** o logout deve chamar `#local.clear()` e `gravarDono(null)`, sem
tocar no servidor. São duas linhas, e o `clear()` que já existe faz demais
(apaga o servidor também, porque é o "apagar meu progresso" do perfil).

### 7.2 O destravamento é decidido no cliente

Medido: entrei como B, o teste final dizia "Faltam 22 letras"; escrevi as 22
letras no `localStorage` pelo console e a página abriu.

O servidor guarda o estado e nunca o julga - por projeto. A consequência é que
toda regra de aprendizagem é do cliente: exame final, página de conclusão,
conquistas. O certificado resiste um degrau a mais, porque exige o exame
aprovado, mas o exame aprovado também se forja.

**Avaliação honesta:** isto é o aluno enganando a si mesmo. Não há credencial
de valor externo em jogo - a própria página do certificado diz que um
certificado por participação não vale nada. Ninguém ganha acesso, dinheiro ou
diploma com isso. **Não é motivo para segurar o lançamento.**

**Conserto, se um dia o certificado virar algo que pese:** o servidor recalcula
a condição a partir do estado que ele guarda, numa rota própria, e o cliente
pergunta. Não antes disso.

### 7.3 A sincronização é muda

Medido: com `/api/progress` cortado, o aluno completou três etapas, o
`localStorage` subiu de 800 para 815, e a tela não disse absolutamente nada.
Ao voltar a rede e recarregar, o servidor recebeu 815.

O comportamento é o certo. A comunicação é que falta. Note que a interface
**não mente**: ela nunca diz "salvo no servidor". Mostra o progresso, que de
fato está salvo - no aparelho.

O risco real: alguém estuda uma hora no avião, nunca mais abre o app naquele
celular, e abre no notebook esperando encontrar aquilo.

**Conserto:** um indicador discreto quando houver trabalho não sincronizado.
O `WorkerProgressStore` já sabe disso (`#enviado` contra o estado atual) -
falta expor.

### 7.4 A sequência de dias usa o relógio do aparelho

`today()` usa a data local, de propósito: quem estuda às 22h em São Paulo tem
de ganhar o dia certo. O preço é que adiantar o relógio do celular infla a
sequência.

**Avaliação:** o custo de consertar é alto (data do servidor em toda regra de
dia, e o fuso do aluno de volta ao problema) e o ganho é impedir alguém de
inflar um número que só ele vê. **Deixaria como está.**

---

## 8. BANCO DE DADOS

```sql
CREATE TABLE IF NOT EXISTS progress (
  account_id INTEGER PRIMARY KEY REFERENCES accounts(id),
  state      TEXT    NOT NULL,
  version    INTEGER NOT NULL DEFAULT 2,
  rev        INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL
);
```

| item | estado |
|---|---|
| Chave primária | `account_id` - **uma linha por aluno, por construção** |
| Foreign key | `REFERENCES accounts(id)` |
| Duplicação | impossível: a PK recusa a segunda linha |
| Registros órfãos | impossíveis pela FK |
| Índice | a PK é o índice, e é a única consulta que existe |
| Timestamp | `updated_at` com relógio do servidor |
| Troca atômica | `UPDATE ... WHERE account_id = ? AND rev = ?` |

Conferido no banco depois de onze escritas, entre elas dois cliques duplos e
duas gravações concorrentes: **uma linha, `rev 3`, 285 bytes**.

A atomicidade não depende de transação: a comparação e a escrita estão no
mesmo comando. Ou o `UPDATE` casa a revisão e grava, ou não casa e não grava.

Limite de corpo: 512 KB (`progress.js:30`). Chaves `__proto__`, `constructor`
e `prototype` são recusadas antes de gravar, em pilha e com teto de 50 mil
nós.

---

## 9. TESTE ENTRE DISPOSITIVOS

**SIM, o progresso acompanha a conta.**

Provado com um contexto de navegador **novo** - sem cookie, sem
`localStorage`, sem cache -, que é exatamente um segundo aparelho:

```
   guardado antes:  {"alef":[1,2,3],"mem":[1,2,3]}
   navegador novo:  {"alef":[1,2,3],"mem":[1,2,3]}
```

E quando os dois aparelhos escrevem, o segundo não apaga o primeiro: leva 409
com o estado atual, funde e regrava.

---

## 10. TESTE LOGOUT/LOGIN

**SIM, o progresso volta.**

```
   depois do logout, GET progresso -> 401
   depois do login   xp 500 rev 1
```

---

## 11. TESTE DE ATUALIZAÇÃO

**SIM, o F5 mantém tudo.** Inclusive uma aula pela metade:
`{alef:[1,2,3], mem:[1,2,3]}` antes e depois.

Vale registrar que **isto não era verdade hoje de manhã**. Até o commit
`8a7dd0e`, desta mesma sessão, o site apagava o progresso a cada troca de
página - uma gravação agendada carregava uma cópia do estado VAZIO e a
escrevia por cima do progresso real 400 ms depois de a página abrir. Está
consertado, publicado e com oito provas em `gravador.test.ts`.

---

## 12. TESTE DE FALHA DE INTERNET

```
   antes:   local 800 | servidor 800
   offline: local 815   (o trabalho continua)
            a tela avisa? NAO
   depois:  local 815 | servidor 815
```

O aluno continua estudando, nada se perde, e a sincronização acontece sozinha
quando a rede volta. A tentativa de subida tem duas rodadas e desiste em
silêncio; a próxima leitura funde e leva.

Falta o aviso. Ver §7.3.

---

## 13. PROGRESSO GERAL

A porcentagem sai de `courseProgress` (`rules.ts:714`) e conta **etapas
feitas**, não aulas concluídas nem pontuação:

```
  (soma das letras + soma dos módulos extras) / (22 + nº de módulos extras)
```

onde cada letra vale `min(5, etapas) / 5` e cada módulo extra `min(3, etapas) / 3`.

Provado com 19 casos novos:

| situação | resultado |
|---|---|
| nada feito | 0 |
| 1 letra de 22 | 1/22 |
| 11 letras | exatamente 0,5 |
| 22 letras | exatamente 1 |
| 40 letras num curso de 22 | 1 - **não passa de 100%** |
| 8 etapas repetidas na mesma letra | 1/22 - **não passa de 100%** |
| curso sem letras | 0 - **não divide por zero** |
| refazer uma letra inteira | não muda |

Nunca negativa, nunca acima de 1, e não sobe por repetição.

---

## 14. SEGURANÇA

**Um aluno NÃO consegue modificar o progresso de outro.** Provado contra o
Worker real:

```
1) A grava xp 500                        {"ok":true,"rev":1}
2) A lê o próprio                        uid 9  rev 1  xp 500
3) B lê                                  uid 10 rev 0  state null
4) B forja account_id:9, uid:9,
   accountId:9 no corpo                  {"error":"conflito"} - foi para a linha de B
5) o progresso de A                      uid 9 rev 1 xp 500 - intacto
6) sem cookie: GET/PUT/DELETE            401 / 401 / 401
```

A razão é estrutural: `requireAccount` deriva a conta do cookie assinado, e
`getProgress(env, account.id)` usa esse id. **O corpo da requisição não tem
campo de usuário nenhum**, então não há o que forjar. Não é uma verificação
que pode ser esquecida um dia: é a ausência do parâmetro.

Não há Supabase nem RLS aqui - o isolamento não depende de política de banco,
depende de o id vir de um lugar que o cliente não escreve.

Escritas exigem mesma origem (`Sec-Fetch-Site` e `Origin`), e há freio de 60
gravações por minuto por conta.

---

## 15. MELHORIAS RECOMENDADAS

Em ordem de retorno sobre esforço:

1. **Limpar o progresso local no logout** (§7.1). Duas linhas. Fecha a única
   questão de privacidade encontrada.
2. **Indicador de "ainda não sincronizado"** (§7.3). O dado já existe no
   adaptador; falta mostrá-lo.
3. **Avisar quando a sincronização falhar repetidamente.** Hoje desiste em
   silêncio depois de duas tentativas.
4. **Recalcular o destravamento no servidor** (§7.2) - e só no dia em que o
   certificado passar a valer alguma coisa para fora.
5. Não fazer nada sobre o relógio da sequência (§7.4).

O que **não** recomendo: normalizar o progresso em tabelas, guardar cada
resposta, ou trocar o local-first por escrita síncrona. Os três resolveriam
problemas que este sistema não tem e criariam problemas que ele não tem.

---

## 16. TESTES QUE DEVEM EXISTIR

Já existem, e foram conferidos um a um:

| fluxo | arquivo |
|---|---|
| gravar e recuperar no servidor | `progresso-servidor.test.ts` (9 casos) |
| revisão, conflito e reenvio | `progresso-servidor.test.ts` |
| isolamento entre contas | `progresso-servidor.test.ts` + `auditoria.test.ts` |
| fusão entre aparelhos | `merge.test.ts` (23 casos) |
| quando gravar, e quando não | `gravador.test.ts` (8 casos) |
| conclusão contra domínio | `rules.test.ts`, `mastery.test.ts` |
| desbloqueio do exame | `exam.test.ts`, `full-course.test.ts` |

Criados nesta auditoria - eram o vão real:

| fluxo | arquivo |
|---|---|
| porcentagem: 0, 1, metade, tudo, acima de tudo, zero letras | `progresso-auditoria.test.ts` |
| XP não paga duas vezes | idem |
| sequência: mesmo dia, dias seguidos, dia pulado, zerar sozinha | idem |

**19 casos novos, 455 no total.**

---

## 17. CHECKLIST PRÉ-LANÇAMENTO

- [x] progresso salvo no servidor
- [x] refresh mantém progresso
- [x] logout/login mantém progresso
- [x] outro dispositivo recupera progresso
- [x] usuários não compartilham estado
- [x] conclusão de aula funciona
- [x] porcentagem correta
- [ ] teste final desbloqueia corretamente - **destrava pelo cliente** (§7.2)
- [~] erro de rede tratado - **não perde nada, mas não avisa** (§7.3)
- [x] requisições duplicadas não quebram progresso
- [x] banco impede registros inconsistentes
- [x] políticas de segurança verificadas
- [x] progresso nunca ultrapassa 100%

Um item em aberto e um parcial, ambos descritos acima, nenhum deles capaz de
fazer um aluno perder o que estudou.

---

## A pergunta final

> Posso confiar que um aluno pagante do Hebraico Fluente não vai perder seu
> progresso?

**Sim.**

Não por impressão: porque um navegador novo, sem cookie e sem cache, entrou
com a conta e encontrou as duas letras exatamente como foram deixadas; porque
a rede foi cortada no meio de uma lição e o trabalho continuou e depois subiu
sozinho; porque duas escritas simultâneas produziram uma linha e não duas; e
porque o banco tem chave primária por conta, o que torna a duplicação
impossível em vez de improvável.

A ressalva que eu faria, e que não muda o veredito: **o defeito que apagava o
progresso de todo aluno a cada troca de página existia hoje de manhã**, e foi
encontrado por acaso, porque você reclamou. Ele não teria sido pego por
nenhum teste que existia. Os oito casos de `gravador.test.ts` e os 19 desta
auditoria existem para que a próxima vez seja diferente.
