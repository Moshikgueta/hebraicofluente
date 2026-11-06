# G · CONTEÚDO DO CURSO, PEDAGOGIA, HEBRAICO E PORTUGUÊS · Hebraico Fluente · 01/10/2026

Repositório: /home/user/hebraicofluente @ 6d6302d. Nada no repositório foi alterado. Scripts em
scratchpad/audit2/G/ (fuzz/, heb.py, dica2.mjs, mod.mjs).

## Evidência de base

* `node scripts/validate.js`: 0 violações, 4 avisos (V12 álef sem wordsToRead; V3b מורה, שם, פה homógrafos).
* `cd app && npx vitest run` dos arquivos pedagógicos (conteudo, engine, p0-exercicios, exam, order-rule,
  mastery, rules, trace, fala, biblia, sem-nikud, forma-final, teclado-hebraico, dominio, curriculo, ensino):
  16 arquivos, 245/245 verdes. Não existem arquivos `*ped*` nem `*exerc*` além de p0-exercicios.
* `node tools/check-audio.mjs`: 539/539 clipes gravados.
* Varredura dos geradores (scratchpad/audit2/G/fuzz/tests/fuzz.test.ts, vitest com o mesmo depósito
  hidratado que o app usa): prática e fixação de cada uma das 22 letras (com `soOLadoDoPonto` e
  `semPalavrasDeSom`, como a LessonClient faz), checkpoints 1 a 5 com rampa sem pontos, revisão em cada
  prefixo do alfabeto, os 11 modos da Academia, os jogos Blast e Teste (baralho real), o exame (720
  tentativas, com e sem áudio), módulo 6 (daguesh), módulo 7 (gerech), lições de som e contraste, as 7
  missões. 44.974 exercícios gerados na rodada de 20 sementes; rodadas dirigidas de 1.000 sementes para
  medir frequência. Checagens: gabarito no intervalo, alternativas duplicadas, alternativas homófonas,
  sinônimos, letra ambígua na posição, palavras com a letra entre as "erradas", pares de ligar repetidos,
  texto com `{{`, `undefined` etc., regra da ordem, repetição imediata, aceitação da resposta digitada.
* Navegador (Playwright, conta de teste local): /modulo/5 e Academia > Letras com o botão de dica.
* Varredura de todo hebraico de data/*.json (heb.py): NFC, formas de apresentação, final fora do fim,
  shin sem ponto, בכפ inicial sem daguesh, dois sinais de vogal numa letra.
* Leitura palavra por palavra das 60 linhas bíblicas de data/bonus.json contra o texto massorético
  (de memória, sem acesso externo: sefaria.org bloqueado pelo proxy).

Resultado geral: o motor está muito bem guardado (regra da ordem, NFC na exportação, gabaritos calculados,
nenhuma alternativa duplicada fora do "ache a intrusa", que é por desenho). Os defeitos reais estão nas
bordas: o que a tela mostra fora do enunciado (dicas, explicações, rótulo de som), as perguntas com mais de
uma resposta certa em situações específicas, e textos alterados depois de revisados.

---

## ACHADOS

ID: CONT-001 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/lib/engine/generators.ts:455-468 (exMatchLetterSound) + app/src/lib/sons.ts:327 (soOLadoDoPonto) + app/src/components/learn/Answers.tsx:402-413 (Match compara por índice)
Problema: na prática da lição do Kaf, o exercício "Ligue cada letra ao seu som" põe duas cartas "/k/" na coluna da direita (כ e ק). A tela da lição troca o som do Kaf de "/k/ ou /χ/" para "/k/" (soOLadoDoPonto), e o histórico traz o Qof com "/k/". O Match corrige por índice (`l === r`), então ligar ק ao "/k/" do כ conta como erro.
Evidência: fuzz `kaf-mls-76: ק=/k/ , כ=/k/ , צ=/ts/ , ע=(mudo para a maioria)`; rodada dirigida (tests/freq.test.ts): 417 de 1.000 rodadas de prática do Kaf têm esse item. O teste existente (engine.test.ts:187 "pairs are unique on both sides") usa a letra crua, sem soOLadoDoPonto, e uma semente só: por isso não pega.
Por que importa / Impacto: em 4 de cada 10 rodadas o aluno tem 50% de chance de ser marcado errado acertando. O erro vai para a fila de revisão e para o modelo de confusões (ק↔כ), ensinando ao sistema uma confusão que não existe. É exatamente o par que o curso diz ser homófono.
Correção sugerida: no exMatchLetterSound, descartar letras cujo `sound` normalizado já esteja no conjunto (como montarBaralho faz); e rodar o teste de unicidade sobre a letra como a lição a mostra, com várias sementes.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: CONT-002 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/components/learn/Answers.tsx:566 (Hints renderiza `{h}`), app/src/components/learn/ExercisePlayer.tsx:338-340 (`{settled.why}` e `{ex.explainPt}` crus); dados: letters.json soundNotePt de 11 letras, sentences.json notePt, real-world.json contextPt
Problema: dicas e explicações vêm do conteúdo com a marcação `{{…}}` e são impressas como texto, sem passar por `<Prose>`. O aluno vê as chaves.
Evidência: navegador, Academia > Letras > "Precisa de uma dica?": `Não tem som próprio. {{א}} é um apoio: existe para segurar a vogal...` (captura scratchpad/audit2/G/dica-chaves.png). Fuzz: 23 textos distintos atingidos, entre eles as dicas de Álef, Nun, Shin, Vav, Tet, Áyin, Tsadi, Qof, Bet, Kaf, Pe e as explicações de 9 frases (ex.: "הַמֶּלֶךְ ... Termina com o {{ך}} final") e de cenas. O mesmo defeito já foi consertado em Compreensao.tsx (comentário da linha 43), mas não no player.
Por que importa / Impacto: aparece em toda lição com essas letras e depois de toda frase lida; parece código quebrado e a letra entre chaves sai sem a fonte e a direção do hebraico.
Correção sugerida: renderizar hint, why e explainPt com `<Prose text=…/>` (e conferir os outros consumidores de explainPt: TestRun, jogos).
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: CONT-003 | Prioridade: P2 | Confiança: CONFIRMADO
Local: data/letters.json campo `sound`; exibido em components/learn/Blocks.tsx:305 (cabeçalho da lição), app/modulo/[n]/ModuleClient.tsx:110, meu-hebraico/DashboardClient.tsx:174, generators.ts:130 e 965 (explicações) e no exercício de ligar letra e som
Problema: o som da letra é mostrado em IPA cru para um público leigo: Yod "/j/", Resh "/ʁ/", Het "/χ/", Shin "/ʃ/", Guímel "/ɡ/", Kaf "/k/ ou /χ/". Um brasileiro lê "/j/" como o J de "janela", que é justamente o erro que a própria nota do Yod proíbe ("Nunca como o J do português"). Nenhuma tela explica o que são as barras.
Evidência: `yod /j/ | Como o I de "ioiô"... Nunca como o J do português`; /modulo/5 mostra "Kaf /k/ ou /χ/"; o match pede "Ligue cada letra ao seu som" com essas cartas.
Por que importa / Impacto: o rótulo grande da lição contradiz a explicação logo abaixo; no exercício de ligar, o aluno precisa associar י a "/j/".
Correção sugerida: um campo `somPt` legível (y, r francês, ch raspado, x/ch de chave, g de gato) para a tela e os exercícios; deixar o IPA só como detalhe opcional.
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes

ID: CONT-004 | Prioridade: P2 | Confiança: PRECISA VERIFICAÇÃO MANUAL (alta probabilidade)
Local: data/bonus.json:109 (shema, Dt 6:9) e data/audio.json:6158; alterado no commit 8410a28
Problema: a linha agora diz "עַל־מְזוּזֹת בֵּיתֶךָ". Pelo texto massorético (Códice de Leningrado/BHS) e pela regra dos escribas da mezuzá, Dt 6:9 é escrito defectivo, מְזֻזֹת (sem vav), e a grafia com vav é a de Dt 11:20 (מְזוּזוֹת). A auditoria de 28/09 (PED-015) pediu a troca na direção oposta, e ela foi aplicada: a "correção" provavelmente introduziu o erro.
Evidência: `git log -S'מְזוּזֹת' -- data/bonus.json` → 8410a28 "as correções pequenas da auditoria". Não consegui consultar Sefaria (proxy 403/EGRESS_BLOCKED).
Por que importa / Impacto: é o versículo da mezuzá, no texto mais conhecido do público judeu do curso; quem tem um sofer na família nota. As outras 59 linhas conferem com o massorético (Gn 1:1-5, Sl 23, 121, 133, Rt 1:16-17, Ec 3:1-8, Is 6:3, 9:5, 40:31, 41:10, 53:5, Jr 29:11, 33:3, Js 1:9, 24:15, Pv 3:5-6, Sl 91:1-2, 119:105, Lm 3:22-23, Nm 6:24-26, Lv 19:18), inclusive os daguesh lene ausentes por regra (בַדֶּרֶךְ, בְמַעְגְּלֵי, בַשֶּׁמֶן, כֹחַ, כָל־הָאָרֶץ) e o לְּךָ com daguesh em Jr 33:3.
Correção sugerida: conferir num Tanakh massorético; se confirmado, voltar a "מְזֻזֹת", regravar ou remapear o clipe.
Complexidade: Mínima | Claude corrige sozinho?: Revisar antes

ID: CONT-005 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/lib/engine/deck.ts:190-243 (perguntasDe, sentido 'pt'); usado pelo Teste da Academia (AcademiaClient.tsx:220, sentido 'misto')
Problema: quando a pergunta mostra o latino e pede a letra ("Qual letra faz este som? t"), o deduplicador olha só o lado hebraico, então entram duas respostas certas: ת e ט para "t"; א e ע para "mudo"/"mudo para a maioria"; קִ e כִּ para "ki"; אוּ e עוּ para "u"; תּוֹ e טוֹ para "to".
Evidência: tests/freq.test.ts, 500 partidas com o alfabeto inteiro: 19 de 5.000 perguntas (cerca de 4% das partidas de 10) ambíguas, ex.: `som alvo=t certa=ת opcoes=ת ר ט ל`, `silaba alvo=ti certa=טִ opcoes=טִ קוּ קְ תִּ`.
Por que importa / Impacto: o Teste "sem correção durante" dá a nota e a lista do que escapou; o aluno que escolhe ט para "t" vê um erro que não cometeu e o modelo de domínio registra.
Correção sugerida: no sentido 'pt', descartar distratores cujo `pt` (normalizado, e "mudo*" como um só) seja igual ao do par, e para sílabas comparar a leitura.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: CONT-006 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/lib/engine/generators.ts:887-923 (exLetterPosition)
Problema: "Onde está a letra X nesta palavra?" com palavras em que a letra aparece mais de uma vez; o gabarito é sempre a primeira ocorrência.
Evidência: fuzz: שֶׁמֶשׁ (Shin no começo e no fim, certa só "No começo"), נֹתֵן (נ no começo, ן no fim), הִנֵּה, גַּג, סוּס, לַיְלָה (ל no começo e no meio). Aparece na prática, na fixação e no exame (parte "As letras difíceis"). Quem responde "No fim" para שֶׁמֶשׁ ainda lê a explicação "O hebraico se lê da direita para a esquerda", que é falsa como correção.
Por que importa / Impacto: pergunta com duas respostas certas, inclusive em item que conta nota.
Correção sugerida: excluir do pool palavras com a letra (base ou final) em mais de uma posição, ou aceitar qualquer posição presente.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: CONT-007 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/app/loja/LojaClient.tsx:144-150; app/src/lib/state/rules.ts:221 e 248; LessonClient.tsx:781 (comentário "Seis questões")
Problema: a tela de Recompensas diz "Dominar uma letra é ... acertar pelo menos 6 de 8 na fixação", mas a fixação tem 10 itens (buildMiniTest, count=10; tests/p0-exercicios "a fixação continua com dez itens"); 75% de 10 exige 8 acertos, e destravar a letra seguinte exige 80% (8 de 10).
Por que importa / Impacto: o aluno que fez 7 de 10 (70%) lê que bastam 6 e não entende por que a leitura bônus não abre.
Correção sugerida: "8 de 10" (ou derivar o texto de MASTERY_MARK e do tamanho da fixação).
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: CONT-008 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/app/modulo/[n]/ModuleClient.tsx:51-55; data/modules.json `note`
Problema: a página de todo módulo diz "As três lições" e "duas lições com conteúdo novo e uma terceira de prática", mas o módulo 2 tem 4 lições (4 a 7), o 5 tem 7 (14 a 20, nenhuma "de prática") e o 7 tem 4. A nota de modules.json repete "7 unidades de tres licoes cada" ao lado de "27 licoes".
Evidência: /modulo/5 no navegador: título "As três lições" seguido da lista Lição 14 ... Lição 20.
Por que importa / Impacto: a primeira frase que orienta o estudo do módulo está errada justamente no módulo mais denso.
Correção sugerida: título "As lições" e texto gerado a partir de `mod.lessons` (quantas novas, quais de som, qual de prática).
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: CONT-009 | Prioridade: P3 | Confiança: CONFIRMADO
Local: data/textos.json (5 textos, todos `revisado: true`); TEXTOS-PARA-REVISAR.md
Problema: os cinco mini-textos foram aprovados pelo dono em 25/09 (c630df6) e reescritos por inteiro em 27/09 (143b21e "viram conversas de verdade", fa2db2a) mantendo `revisado: true`. O documento de revisão ainda descreve os textos antigos (ex.: "הַיּוֹם יוֹם גָּדוֹל!", "נִשְׁמַע" com patach). Não há registro de que os textos atuais passaram por um falante de hebraico.
Evidência: diff entre TEXTOS-PARA-REVISAR.md e data/textos.json; texto 4, pergunta 4: tradução da linha "Quero mais um dia!" e justificativa "{{אֲנִי רוֹצָה עוֹד יוֹם!}}: queria mais um dia!" (resto do PED-029). Li os cinco: o hebraico atual está correto e natural (נִשְׁמָע corrigido, בַּדֶּרֶךְ הַבַּיְתָה, אֵין לִי, יֵשׁ לָךְ); gabaritos das 20 perguntas conferem com o texto.
Por que importa / Impacto: a regra declarada do projeto ("nenhum aparece até ser aprovado") deixou de ser verdade sem ninguém notar; da próxima vez o texto alterado pode ter erro.
Correção sugerida: atualizar TEXTOS-PARA-REVISAR.md com os textos atuais, pedir a aprovação de novo, e fazer o validate comparar um hash do texto aprovado; trocar "queria" por "quero" na justificativa.
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes

ID: CONT-010 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/lib/engine/exam.ts (band, faixa ≥ 90%) e app/src/app/desafio-final/FinalChallengeClient.tsx:142
Problema: (a) a faixa máxima diz "você decodificou palavras que não viu antes", mas todas as partes usam vocabulário, frases e cenas do curso (tests/exam garante "palavras só do curso"). (b) O exame abre com as 22 letras dominadas e cobra "Sem os pontos" e "Os sons de fora" (gerech), conteúdo dos módulos 6 e 7, que não são exigidos (a trava só olha as letras; o painel sugere os módulos antes, mas a rota abre).
Por que importa / Impacto: (a) promessa falsa no momento de maior orgulho; (b) quem vai direto ao exame é cobrado por 5 itens que ainda não estudou.
Correção sugerida: "palavras que você aprendeu, sem transliteração"; exigir as lições de som do módulo 7 e as do módulo 6 para abrir o exame, ou tirar as duas partes para quem não as fez.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: CONT-011 | Prioridade: P3 | Confiança: CONFIRMADO
Local: data/bonus.json (shalóm ×4), app/src/components/landing/Transformacao.tsx:139 ("lê-se shalóm") vs data/letters.json e translit.json ("shalom"); translit.json Yisraél, esrim; StartHereClient.tsx ("niqqud" ×39) vs resto ("nikud" ×96); "daguesh" ×41 vs "dagesh" ×33 (bonus.json guia, nikud.json)
Problema: a mesma palavra e o mesmo termo aparecem com duas grafias: PED-019 (shalom/shalóm) continua na landing e no bônus; PED-021 resolvido só em parte (kissé ganhou ss, Yisraél e esrim não, e o brasileiro lê "Yizraél", "ezrim"); "niqqud" na Aula 0 e "nikud" nas lições; "daguesh" nas lições e "dagesh" no guia bíblico e na tabela do nikud.
Por que importa / Impacto: o aluno não sabe se são coisas diferentes; a própria regra de translit.json diz que shalom fica sem acento.
Correção sugerida: escolher nikud/daguesh/shalom e aplicar com um teste de vocabulário proibido.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: CONT-012 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/lib/engine/types.ts:243-265 (normalizeLoose)
Problema: respostas digitadas plausíveis são rejeitadas: "ge"/"gi" para גֶ/גִ (o curso escreve "gue"/"gui"), "geshem" para גֶּשֶׁם (curso "guéshem"), "todah" para תּוֹדָה, "lehem" para לֶחֶם (o "h" é a grafia mais comum do ח em português, embora ambígua com ה).
Evidência: tests/probe.test.ts: `geshem -> guéshem false`, `ge -> gue false`, `gi -> gui false`, `todah -> todá false`, `lehem -> léchem false` (e `rrra`, `col`, `bait`, `eretz`, `imma`, `israel` aceitos).
Por que importa / Impacto: o "gue" é convenção do curso para o leitor brasileiro, não do som; marcar "ge" como errado ensina que o aluno leu mal quando leu certo. É o item digitado obrigatório da fixação (conta nota).
Correção sugerida: no normalizeLoose, "gu" antes de e/i vira "g"; "h" final depois de vogal some.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: CONT-013 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/lib/engine/extras.ts buildDageshQuiz (módulo 6), app/src/lib/sons.ts bancoDoSom/exerciciosDeContraste, app/src/lib/engine/posicao-do-ponto.ts:141 (comOpcoes com 2)
Problema: as lições 6 (Sin), 15/17/19 (Vet, Chaf, Fe), 20 (contraste), 21 (onde o ponto aparece) e 24 a 26 (gerech) são feitas quase só de perguntas de duas alternativas (p/f, שֶׂ/שֶׁ, smol/shmol). O próprio motor recusa itens de 50% nas lições de letra ("um item de 50% não mede nada", generators.ts); aqui eles medem a fixação das lições de som (75% domina).
Evidência: fuzz: 143 itens distintos de 2 opções, todos nessas lições.
Por que importa / Impacto: chutar dá 50%, e com 10 itens a chance de dominar uma lição de som no chute é de cerca de 5%; o domínio dessas lições conta na trava.
Correção sugerida: o formato de quatro sílabas (duas leituras × duas vogais) que exVariantSyllable já usa.
Complexidade: Média | Claude corrige sozinho?: Revisar antes

ID: CONT-014 | Prioridade: P3 | Confiança: ALTA CONFIANÇA (letra sintética, não desenhada no aparelho)
Local: app/src/lib/trace-score.ts; app/src/lib/state/store.tsx:367 (`score >= 0.5` vira acerto de `escrever`)
Problema: meia letra recebe "Muito bem! A forma está lá." (dentro 1, cobertura 0,64) e cinco pontos no meio do modelo somam 0,61, que o modelo de habilidade registra como acerto de escrita mesmo com o aviso "Faltou parte da letra". A ordem e a direção dos traços não são medidas, mas courses.json promete "Escrever as letras à mão em cursiva, na ordem certa dos traços".
Evidência: tests/probe.test.ts: `TRACE half {"score":0.78,...,"tone":"good"}`, `TRACE tiny {"score":0.607,...,"tone":"try"}`.
Por que importa / Impacto: a escrita não trava nada (correto), mas o selo "forte" em escrever e a promessa de "ordem certa" não têm medição por trás.
Correção sugerida: usar `tone === 'good'` (e não score ≥ 0,5) como acerto; exigir cobertura ≥ 0,7; ou reescrever a promessa para "seguindo a ordem dos traços mostrada".
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes

ID: CONT-015 | Prioridade: P4 | Confiança: CONFIRMADO
Local: data/letters.json qof.soundNotePt (e shin.soundNotePt) usados como dica de letter-recognition
Problema: a dica do Qof cita {{כּ}} (Kaf vem duas lições depois) e a do Shin cita {{שׂ}} antes da lição do Sin. A Aula 0 afirma "nada aparece na tela antes de ter sido ensinado"; o teste da ordem só olha `readingUsedBy`, não dicas nem explicações.
Correção sugerida: dicas sem letras futuras, ou o teste da ordem cobrir hintsPt/explainPt.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: CONT-016 | Prioridade: P4 | Confiança: CONFIRMADO (lógica) / PRECISA VERIFICAÇÃO MANUAL (comportamento do reconhecedor)
Local: app/src/lib/fala.ts conferirFala
Problema: o esqueleto sem ו/י aceita palavras diferentes (alvo עִיר, transcrição "ער" → certo) e não unifica homófonos que o reconhecedor troca (alvo קוֹל, transcrição "כל" → "Quase"). O reconhecedor do navegador escreve a palavra mais provável da língua, então mede inteligibilidade para o Google, não a pronúncia (um ח dito como h tende a sair "לחם" igual).
Por que importa / Impacto: baixo, a fala não dá nota; mas "Certo!" e "Quase" são ditos com autoridade.
Correção sugerida: texto do resultado mais modesto ("o reconhecedor entendeu …"), e aceitar homófonos por som (ק=כּ, ט=ת, ע=א).
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: CONT-017 | Prioridade: P4 | Confiança: CONFIRMADO
Local: app/src/lib/engine/exercises.ts assinatura() e buildMiniTest (`ditos`)
Problema: a assinatura de conteúdo usa só tipo + enunciado + opções. Em vowel-sound ("Que vogal está escrita aqui?" com a/e/i/o/u) e type-answer sem opções, sílabas diferentes têm a mesma assinatura e são descartadas como "repetidas"; a fixação nunca tem duas vogais nem dois digitados.
Correção sugerida: incluir `he`/`audioId`/`target` na assinatura.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: CONT-018 | Prioridade: P4 | Confiança: CONFIRMADO
Local: data/letters.json[20] e [21] syllables
Problema: 8 sílabas de Kaf e Pe (כַּ כֶּ כִּ כְּ פַּ פֶּ פִּ פְּ) não estão em NFC no dado-fonte (daguesh antes da vogal). O exportador normaliza (app/content é NFC, áudio 0 fora de NFC), então o aluno não é afetado; o comentário de generators.ts ("o dado do curso está em NFC") é falso para o dado-fonte.
Correção sugerida: normalizar data/letters.json e uma regra V no validate.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: CONT-019 | Prioridade: P4 | Confiança: CONFIRMADO
Local: app/src/lib/loja.ts ITENS; data/imagens-vocabulario.json; app/src/lib/engine/gym.ts:65
Problema: (a) 22 leituras bônus × 200 XP = 4.400 XP, e o próprio arquivo estima o curso inteiro em "uns 2.000": quem termina o curso abre cerca de metade (não é conteúdo essencial nem prometido na venda, então não fere a regra; vale avisar no texto da loja). (b) PED-052 continua: 47/47 imagens null. (c) PED-053 continua: modo "Ouvir e escolher" sem as frases ouvidas.
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes

NÃO REPRODUZIDO: "Ler e e" no módulo 5. O dado é "Ler e escrever {{ב כ פ}} e as formas finais {{ך}} e {{ף}}" e a página /modulo/5 mostra "Ler e escrever ב כ פ e as formas finais ך e ף". Nenhuma ocorrência de "e e" no dado, no código ou no HTML gerado; o único lugar que apaga o hebraico é voz-instrucao.ts, que o troca por "o hebraico mostrado". Se a captura veio de leitor de tela ou de um navegador sem a fonte hebraica, o efeito é esse; peço o caminho exato.

---

## Verificações que passaram (resumo)

* Hebraico das letras, nomes, finais, daguesh, shin/sin, vav vogal: nenhum erro na varredura (heb.py); "בכפ inicial sem daguesh" só nos casos bíblicos corretos e nas sílabas soltas de Vet/Chaf/Fe; finais só no fim (as duas exceções, קטשופ e מיקרוסקופ em bridgeWords, são grafia corrente de empréstimo).
* Pronúncia moderna: ר uvular sonoro, ח raspado (≈ R carioca), א/ע mudos com nota mizrahi, צ = ts, ק = כּ, ת = ט, kamats = patach: corretos.
* Frases (23) e textos (5): hebraico correto e natural, traduções certas; gabaritos dos 20 itens de compreensão conferem.
* Português de data/*.json e das strings da interface: varredura de duplicações, espaço antes de pontuação, crase, aspas e parênteses desbalanceados: limpo (só notas internas). Texto claro, natural, sem travessões.
* Motor: nenhuma alternativa duplicada (fora do "ache a intrusa", por desenho), gabarito sempre no intervalo, montar sílaba/palavra sempre fecha, regra da ordem válida em todos os construtores (inclui Academia e exame), resposta digitada sempre aceita a própria transliteração, nenhuma pergunta de significado com sinônimo.
* Domínio, trava e certificado: domínio = 5 etapas + 75% na fixação (10 itens); trava 80%; exame 45 itens (40 sem áudio) com 70%; certificado só com 22 letras dominadas + exame aprovado, e declara não ser oficial. Chutar 70% em 40 itens de 3 a 4 alternativas é improvável. O estado é do cliente (localStorage + /api/progress sem validação de regra), então quem edita o próprio progresso emite o certificado; como o certificado é gerado no aparelho e não é verificável, isso é aceitável, mas não deve ser vendido como comprovante.
* XP e loja: nada essencial atrás de XP (loja.ts: folga, carta antecipada, nome decorado, leituras bônus); o guia do nikud bíblico e a história abrem sem XP.

## O que os testes cobrem e o que não cobrem

Cobrem: regra da ordem (order-rule, 40 sementes), variedade de gestos e sem gesto repetido, sílaba e palavra que remontam, normalização da resposta digitada, revisão n+1/2/4/8/16, fixação de 10 com um digitado, exame (partes, semente por tentativa, só palavras do curso), domínio e trava, conteúdo pago fora do bundle, Bíblia (o versículo da página pública reconstrói e tem nikud), jogos (caça, batalha, cursiva).
Não cobrem: a letra como a LIÇÃO a mostra (soOLadoDoPonto) no teste de unicidade do ligar (CONT-001); o sentido 'pt' do Teste (CONT-005); letra em mais de uma posição (CONT-006); chaves em dicas e explicações (CONT-002); letras futuras em dicas (CONT-015); texto massorético dos 22 trechos do bônus (CONT-004); textos alterados depois de aprovados (CONT-009); coerência dos números ditos na interface com as constantes (CONT-007, CONT-008).

## (1) Auditoria de 28/09 (E-ped) na minha área

Resolvidos: PED-001 a 010, 011 (Grã-Bretanha, foguete, טורקיה), 012, 014 (נִשְׁמָע; resta só o comentário de textos.ts:60), 016, 020 (guéshem, gue/gui), 022 (rr e c aceitos), 023, 024, 025 (semOSomDe), 027, 028, 032, 033, 036 (agora são 23 frases), 042 (partes "Sem os pontos" e "gerech"), 043, 045 (nota "há mais de uma leitura"), 046, 047, 049 (1985), 051 em parte.
Continuam: PED-019 (shalóm/shalom, CONT-011), PED-021 em parte (Yisraél, esrim), PED-029 em parte ("queria" na justificativa), PED-051 em parte (nota "7 unidades de três lições"), PED-052 (imagens), PED-053 (ouvir sem frases).
Regrediu: PED-015, aplicado ao contrário do massorético (CONT-004, a verificar).

## (2) Notas

* Conteúdo pedagógico: 80/100. Sequência, revisão espaçada, trava por nota e exame em partes são de bom nível. O que impede subir: perguntas com duas respostas certas em pontos específicos (CONT-001, 005, 006), lições de som medidas com itens de 50% (CONT-013) e números de domínio e lições ditos errado ao aluno (CONT-007, 008).
* Exatidão do hebraico: 90/100. Nikud, finais, daguesh e pronúncia corretos em tudo que foi varrido; 59 de 60 linhas bíblicas conferem. O que impede: Dt 6:9 provavelmente alterado para a grafia errada (CONT-004) e o som mostrado em IPA (/j/) que contradiz a pronúncia ensinada (CONT-003).
* Qualidade do português: 90/100. Texto natural e limpo. O que impede: chaves de marcação visíveis em dicas e explicações (CONT-002) e terminologia e transliteração com duas grafias (CONT-011).

## (3) Os 5 maiores problemas

1. CONT-002 (P2): dicas e explicações mostram `{{א}}` cru ao aluno (confirmado no navegador).
2. CONT-001 (P2): na prática do Kaf, 42% das rodadas têm um "ligue letra e som" com duas cartas "/k/", e acertar pode contar como erro.
3. CONT-004 (P2, verificar): Dt 6:9 do Shemá trocado para מְזוּזֹת pela correção de 28/09; o massorético é מְזֻזֹת.
4. CONT-003 (P2): o som da letra aparece em IPA ("/j/" para Yod), contradizendo a nota "nunca como o J do português".
5. CONT-005 + CONT-006 (P2/P3): perguntas com duas respostas certas no Teste (ת/ט, א/ע, קִ/כִּ) e em "onde está a letra" (שֶׁמֶשׁ, נֹתֵן), inclusive no exame.

Contagem: P0 0 · P1 0 · P2 5 (001-005) · P3 9 (006-014) · P4 5 (015-019).
