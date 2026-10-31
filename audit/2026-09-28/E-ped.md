# AGENTE E - PEDAGOGY & CONTENT · Hebraico Fluente · 28/09/2026 (somente leitura)

Evidência de base: `npm run validate` → 0 violações, 4 avisos (V12 alef sem wordsToRead; V3b מורה/שם/פה homógrafos). `node tools/check-audio.mjs` → 526/526 clipes (5 ondas, 100%). `cd app && npx vitest run` → 63 arquivos, 930/930 testes verdes. Varredura por script (scratchpad/audit-cov.js): 645 referências hebraicas → 508 únicas, todas com clipe exceto nomes próprios/prefixos (filtrados por design). Sonda temporária `tests/zz-audit-soft.test.ts` criada e removida (árvore limpa).

## LETRAS (data/letters.json - 22/22 letras, todos os campos lidos)
PED-001 | P3 | letters.json tet.didYouKnow | Promete leitura impossível na ordem do curso | "Com ט você lê טוֹב - e portanto בֹּקֶר טוֹב, עֶרֶב טוֹב e מַזָּל טוֹב inteiros" na letra 15; ב é a 20ª, ק a 19ª, ע a 17ª. O próprio qof.didYouKnow diz "Falta uma letra só, o ב" | Trocar por palavra legível (מִטָּה, טִיּוּל) ou "daqui a cinco letras você lê טוֹב"
PED-002 | P3 | letters.json zayin.didYouKnow | Idem | "מַזָּל טוֹב … As duas palavras você já lê inteiras" na letra 13 (ט=15, ב=20) | "…a primeira você já lê; a segunda chega no módulo 5"
PED-003 | P3 | letters.json tsadi.didYouKnow; sentences.json ani-rotse-kafe.notePt; letters tav.didYouKnow | "Última letra" dita três vezes para três letras | tsadi (18ª): "Você chegou à última letra"; kafé (pe, 22ª do curso): "A última letra do alfabeto está aqui dentro"; tav: "ת é a última letra do alfabeto" (a única verdadeira) | tsadi: "a última forma final"; pe: "a última letra do curso"
PED-004 | P4 | letters.json vav.didYouKnow | Conta errada | "Oito letras foi tudo o que ela [שָׁלוֹם] exigiu" - o vav é a 12ª letra (lição 8) | "Doze letras" ou "oito lições"
PED-005 | P3 | letters.json resh (soundNotePt, articulacao, paraBrasileiroPt, didYouKnow) e qof.detalhePt | Referências de distância erradas após a inserção das lições de som | resh é lição 5 e ח lição 9 ("daqui a três lições" ×4); qof (lição 12) diz "a letra que você aprende na próxima lição com o ponto dentro" - a próxima com letra é bet (14), kaf é a 16 | Trocar por "no próximo módulo" / "no módulo 5"
PED-006 | P2 | data/modules.json mod2.introPt | Explicação fonética contradiz a lição do ר e o teste garganta | "R de "caro"" para ר; a lição do resh diz "R francês… Quem fala com … o R batido de "caro" também vai soar estrangeiro"; tests/garganta.test.ts: "o ר é o R francês, e não o R carioca" | "…o R do fundo da garganta, com voz (o R francês)"
PED-007 | P3 | letters.json qof.paraBrasileiroPt + brazilianMistake | Fala de uma convenção que o curso não usa | "A transliteração escreve ק como Q… "quando", "quilo"" - translit.json ק:"k"; todas as palavras (kol, katan, rak, makom) usam k; o aluno nunca vê Q | Reescrever a armadilha (ex.: "não há U embutido: קוֹל é kol") ou remover
PED-008 | P4 | letters.json dalet.didYouKnow | Nome ≠ palavra | "O nome da letra é דֶּלֶת, que significa porta" - nameHe é דָּלֶת (dálet); דֶּלֶת (délet) é "porta" | "O nome vem de דֶּלֶת, porta"
PED-009 | P4 | letters.json samekh.brazilianMistake | Exemplo não ilustra o erro descrito | "Sonorizar o S entre vogais: ler סָבָא como "zaba"" - o ס é inicial, não intervocálico | Usar כִּסֵּא → "kizé" ou סוּס → "suz"
PED-010 | P4 | letters.json zayin.paraBrasileiroPt | Erro de português | '"luz" como "luis"' | '"luz" como "lus"'
PED-011 | P4 | letters.json bridgeWords | Glosas/grafias | yod: בריטניה = "Grã-Bretanha/Britânia" (não "Bretanha"); qof: רקטה = "foguete" (raquete = מחבט); kaf: תורכיה - grafia corrente é טורקיה; het מחנה e ayin מעגל/עיניים/נעים não são empréstimos (seção de palavras-ponte) | Corrigir glosas; trocar por empréstimos reais (ayin: עומלט? não há - aceitar a exceção com nota)
PED-012 | P4 | letters.json resh.wordsToRecognize אַרְבַּע; lamed לַיְלָה | Sistema de acento e de y inconsistentes consigo | "arba" (brasileiro lê ÁR-ba; hebraico ar-BÁ; a regra do translit.json manda "arbá"); "láila" vs "máyim"/"yaldá" (yod consonantal = y → "láyla") | "arbá", "láyla"
PED-013 | P4 | letters.json vav.syllables ווֹ/ווּ | Simplificação: "precisa de dois vav" é regra do ktiv malê (sem nikud); em texto apontado וֹ com consoante v é ambíguo e o aluno vê dois vavs apontados que não aparecem assim em dicionário | Nota curta: "sem nikud escreve-se com dois vav"
PASS | letras: nikud de todas as ~100 palavras (wordsToRead/Recognize), nomes das letras, sílabas | conferido palavra a palavra; nenhum erro de ponto, daguesh, shva ou forma final
PASS | explicações fonéticas | ר uvular sonoro vs ח surdo (mão no pescoço), R carioca ≈ ח, א/ע mudos, ו três papéis, י mater, ה final, kamats=patach, ש/שׂ pelo lado do ponto, ת/ט e ק/כּ homófonos - todas corretas para o hebraico israelense

## NIKUD (data/nikud.json 6 sons + daguesh; textos; extras; bônus)
PED-014 | P3 | data/textos.json módulo 4 (linha "הַי נוֹעָה, מָה נִשְׁמַע?" e `novas`) | Nikud errado, e discorda de sentences.json | נִשְׁמַע (patach) - particípio nif'al é נִשְׁמָע (kamats), como em sentences.json ma-nishma e audio.json #330 | Corrigir para נִשְׁמָע; ver PED-040 (o clipe do vocabulário está atrelado ao hash do texto errado)
PED-015 | P3 | data/bonus.json shema, Dt 6:9 | Ketiv diverge do massorético | מְזֻזֹת → Dt 6:9 traz מְזוּזֹת (grafia plena com vav; מְזֻזוֹת/מְזוּזוֹת em Dt 11:20) | "עַל־מְזוּזֹת בֵּיתֶךָ"
PED-016 | P4 | data/extras.json finals[kaf].nameHe | Daguesh faltando | "כַף סוֹפִית" vs letters.json "כַּף" | "כַּף סוֹפִית"
PASS | nikud.json | tabela dos sinais, posições, sheva, daguesh: corretos; guia bíblico (chataf, kamats katan, patach furtivo, maqaf, te'amim, vav consecutivo) correto
PASS | textos m7 | palavras com gerech sem nikud dentro de linha apontada é regra declarada (tests/textos "menos as emprestadas com gerech")

## TRANSLITERAÇÃO (translit.json 294 entradas; cruzamento de 645 usos)
PED-019 | P2 | sentences.json, bonus.json vs letters.json/translit.json | A mesma palavra transliterada de dois jeitos na tela | שָׁלוֹם "shalom" (letters, translit.json, cenas) vs "shalóm" (frase shalom-ma-shlomcha, bônus ×3); גָּדוֹל gadol/gadól; עִבְרִית ivrit/ivrít; מְדַבֵּר medaber/medabér; אָבִיב aviv/avív; מָה ma/má (dicaLeitura do ה). translit.json declara "shalom e katan ficam sem acento (oxítonas naturais)"; frases e bônus acentuam toda oxítona | Escolher UMA regra e regenerar; a correção é tolerante a acento, então não há rejeição - o problema é o aluno ver duas grafias
PED-020 | P3 | bonus.json (négued, guibór, guedolót, tifgueí, aguída) vs letters/sentences (géshem, réga, gadol) | Duas convenções para G antes de E/I | A lição do gimel ensina "não existe um "u" escondido"; o bônus usa o "gu" português. Pior: pela regra declarada ("um brasileiro lendo pelas regras do português cai certo"), "géshem" e "réga" serão lidos com J | Decidir (gu- consistente, ou g- com nota) e aplicar aos 4 arquivos
PED-021 | P3 | translit.json (kisé, Yisraél, esrim, éser, nasí, yosíf) vs textos m7 "ossá" | S intervocálico | Pela regra do sistema, "kisé"/"Yisraél" viram "kizé"/"Yizraél" na boca do brasileiro; textos.json dobra o s em "ossá" para evitar isso - inconsistente | "ss" entre vogais em todo o sistema (kissé, Yissraél, essrim) ou nota fixa na Aula 0
PED-022 | P3 | letters.json het.checagem + app/src/lib/engine/types.ts normalizeLoose | O curso propõe uma grafia que o próprio corretor rejeita | A checagem do ח oferece "lerrem" como leitura; o item digitado aceita só ch/kh ("lerrem", "lehem" → errado). Também "c" por k ("col" para קוֹל) não é aceito | Aceitar "rr"→"ch" e "h"→"ch" antes de vogal? (ambíguo com ה) - ao menos "rr"; e "c" antes de a/o/u → "k"
PED-023 | P4 | textos.json m6 "mafteach"; m4 "nishma"; bonus salmo-133 "hinéi"; extras j.irmaoPt "jaquet" | Acentos/grafias fora do padrão | maftéach (cf. tapúach); nishmá; hiné (salmo 121, letters); jakét (palavras) | Alinhar
PED-024 | P4 | data/translit.json words | Chaves duplicadas (כְּ כִּ כֶּ כַּ, פְּ פִּ פֶּ פַּ) | JSON.parse fica com a última; sinal de gerador que emite duas vezes | Dedupe no gerador
PASS | tabela consonantal/vocálica de translit.json | ch=ח/כ, ts=צ, sh/s pelo ponto, y=י, v=ו/ב, matres - coerente com o uso nas letras (script: só os 6 conflitos acima)

## PALAVRAS · FRASES · TEXTOS · MUNDO REAL
PED-025 | P2 | data/sentences.json (after), data/real-world.json (fromOrder), app/src/lib/content.ts sentencesUpTo/scenesUpTo, engine/generators.ts exSentenceReading | A separação Bet→Vet, Kaf→Chaf, Pe→Fe (26/09) vaza pelas frases e cenas | Sonda executada: na lição do Kaf (16) a prática e a fixação trazem "שָׁלוֹם, מָה שְׁלוֹמְךָ" (ך = chaf, ensinado na lição 17); na do Bet (14) as cenas "בֹּקֶר טוֹב"/"שַׁבָּת" e as frases after=20 "bóker tov", "Tel Avív", "aní medabér ivrít" (ב suave) já estão no pool; na do Pe (18) "aní rotsé kafé" (פ = fe) e as cenas כֶּסֶף/סֵפֶר. sons.ts promete: "a tela e os exercícios da lição da letra não usam essas palavras, porque o som delas ainda não foi ensinado" | Dar às frases/cenas um campo `som` (como as palavras) e filtrar em contextFor/scenesUpTo até a lição de som; ou mover `after`/`fromOrder` para "depois do som"
PED-027 | P3 | real-world.json rua-hamelech.contextPt | Glosa errada | '"Do rei"' - הַמֶּלֶךְ é "o rei" (o próprio `pt` diz "o rei"; nas placas é רחוב המלך ג'ורג' = King George) | "O rei"
PED-028 | P4 | real-world.json jornal-haaretz | Mostra אֶרֶץ mas o texto fala do cabeçalho "Haaretz" (הָאָרֶץ); ה já é conhecido desde a letra 5 | he: "הָאָרֶץ", pt "a terra"
PED-029 | P4 | textos.json m4 última linha | Tempo verbal na tradução | "אֲנִי רוֹצָה עוֹד יוֹם!" → "Queria mais um dia!" (curso é só presente) | "Quero mais um dia!"
PASS | sentences.json 22/22 | `after` correto para todas (conferido letra a letra); notas gramaticais corretas (ve-, ha-, mi-, adjetivo depois)
PASS | textos.json 5/5 (25 linhas, 41 novas, 20 perguntas) | hebraico correto, respostas das perguntas conferidas com o texto; apenas PED-014/023/029
PASS | missoes.json 7/7 (28 passos) | todas as palavras existem no léxico; distratores sem pontos distintos (כסף/סוף/דרך/ספר); tests/missoes garante ordem

## EXERCÍCIOS · MOTOR (exercises/generators/palavras/pares/sons/extras/missao, types.normalizeTyped)
PED-032 | P3 | app/src/app/inicio/StartHereClient.tsx PERGUNTAS_NIQQUD[2] | Feedback discorda da alternativa | opções ['◌ַ','ב'], porque: "A letra é בּ" (com daguesh) | "A letra é ב"
PED-033 | P3 | StartHereClient.tsx PERGUNTAS_GERAIS "O alfabeto do hebraico antigo é diferente do alfabeto do hebraico de hoje" → certa:false | Contradiz culture.json "O hebraico já teve outro desenho" (paleo-hebraico) e a nota de eras.json que chama exatamente essa frase de falsa | Reformular: "As letras de um rolo da Torá são as mesmas de uma placa de hoje" (verdadeiro: escrita quadrada)
PED-036 | P4 | engine/exam.ts comentário | "são 23 frases no curso" - há 22 | cosmético
PASS | normalizeTyped/typedIsCorrect | acento-insensível, caixa, hífen/geresh, kh→ch, tz→ts, y→i, consoante dobrada; sh≠s≠ch preservado (tests/p0-exercicios)
PASS | geradores | ≥3 alternativas; distratores de confusableWith; forma final nunca como "errada" da própria letra (mesmaLetra); variante do ש/ב/כ/פ cobrada na prática e na fixação; regra da ordem provada por tests/order-rule em todos os construtores
PASS | missão | lê/acha/translitera a partir do léxico (nunca hebraico duplicado); `semPontos` só no módulo 6

## ÁUDIO (data/audio.json 526 clipes; audio/ 531 arquivos)
PASS | catálogo ↔ arquivos | 0 faltando, 0 nomes duplicados, 0 frases duplicadas; 5 órfãos são README/roteiros/room-tone.wav (não .mp3, avisado pelo tool)
PASS | cobertura | toda palavra, sílaba, nome de letra, sinal, frase, linha de texto, palavra de texto, linha bônus e cena tem clipe (script); nomes próprios e prefixos (דָּנָה, בַּ־…) sem clipe por design
PED-040 | P4 | audio.json #330/#417/#449 | Mesma expressão gravada duas vezes por pontuação diferente | "מָה נִשְׁמָע" (frase) e "מָה נִשְׁמַע" (palavra do texto 4) - consequência de PED-014; corrigir o nikud muda o hash e deixa um clipe órfão | Após corrigir, `npm run audio-manifest` e mapear o clipe antigo ou regravar
NOT TESTED | conteúdo gravado = texto exibido; pronúncia "Hashém" nas 93 linhas bônus | impossível ouvir neste contêiner; tamanhos plausíveis (6-116 KB, coerentes com o comprimento)

## JOGOS (jogos.ts, deck.ts, gym.ts)
PASS | Caça/Batalha/Cursiva | só letras liberadas; par só com as duas ensinadas; alvo ≤ metade da grade; 4 formatos; relâmpago 900 ms; peso por domínio (revisar 6 > forte 1); tests/jogos 25 casos
PASS | Academia | 11 modos; modos de palavra em rodízio sobre o vocabulário acumulado (não repete אמא); `digitar` atrás da confirmação do teclado; comparação ignora vogais e forma final
PED-053 | P4 | gym.ts | modo `ouvir` tem só 3 geradores (sílaba/palavra/digitar) - sem frase ouvida (exListenSentence/exListenMeaning existem e entram no exame) | acrescentar os dois ao modo

## EXAME (exam.ts 8 partes = 40 itens, corte 70%) · CERTIFICADO
PED-042 | P3 | engine/exam.ts GENS/EXAM_PARTS | O exame não mede o que os módulos 6 e 7 ensinam nem o que courses.json promete | nenhuma parte sem nikud (buildSemPontos/unpointed existem), nenhuma de gerech, nenhuma de palavra em cursiva; `letras` só testa letra↔cursiva isolada | Parte "Sem os pontos" (3 itens de buildSemPontos) e 2 itens de gerech
PED-043 | P2 | data/courses.json outcomesPt[3]; modules.json goalsPt mod1-5 | Promessa de escrita à mão "em letra de forma e cursiva" / "em letra de imprensa e em cursiva" | O traçado (TraceBoard, EscreverPalavras, stroke-paths gerados da fonte cursiva Gveret Levin) é SÓ cursivo; culture.json diz "as etapas de escrita deste curso treinam a cursiva, e não a impressa" | Reescrever: "Escrever as letras à mão em cursiva, na ordem certa dos traços" - HANDOFF → COM
PASS | exame | semente por tentativa (retry ≠ mesma prova), relatório por parte, `escuta` só com gravação, palavras só do curso (tests/exam); corte 70% coerente com checkpoint (70%), domínio (75%) e trava (80%, 10 itens)
PASS | certificado | "Registro de conclusão do curso. Não é um certificado oficial de proficiência." presente; emitido só com 22 dominadas + exame aprovado; afirmação ("leu … sem transliteração") corresponde ao que o exame mede

## BÔNUS BÍBLICO (bonus.json 22 leituras / 60 linhas + guia 9 seções; biblia.json)
PASS | hebraico bíblico | 59/60 linhas idênticas ao texto massorético (BHS) sem te'amim; Tetragrama escrito יְהוָה e lido "Hashém" de forma consistente nas 30 ocorrências e explicado no guia; Gn 1:1 público correto
PED-045 | P3 | bonus.json isaias-9 pt | Tradução teologicamente contestada para público misto (judeu + evangélico + Bnei Anusim) | "e o seu nome é chamado: Maravilhoso, Conselheiro, Deus Forte, Pai Eterno, Príncipe da Paz" é a leitura cristã; a leitura judaica tradicional (Rashi/JPS) faz de פֶּלֶא יוֹעֵץ אֵל גִּבּוֹר אֲבִיעַד o sujeito que nomeia, e "Príncipe da Paz" o nome | Nota "há mais de uma leitura tradicional" ou tradução literal neutra; idem intro "mais lidos no Natal"
PED-046 | P4 | bonus.json jeremias-33 pt | Mistura de tratamento | "e te anunciarei … que você não conhece" | "que tu não conheces"
PED-047 | P4 | bonus.json salmo-121.introPt; eclesiastes-3.introPt | Imprecisões | "A palavra que mais se repete é שֹׁמֵר" - é a raiz שׁ־מ־ר (a palavra exata aparece 1×); "עֵת … se repete 28 vezes" - 28 nos pares (v.2-8), 29 com o v.1 | "a raiz … guarda"; "28 vezes nos pares"
PASS | guia do nikud bíblico | sheva, chataf, kamats katan (כָּל), patach furtivo, maqaf, daguesh, yod, vav consecutivo, te'amim/sof pasuq/פ ס - todos corretos; exemplos recortados das leituras (tests/loja)

## PROGRESSÃO · CULTURA · PROMESSAS
PASS | ordem das letras | segue o guia do docente «בא לי עברית!»; parecidas ensinadas em lições vizinhas com contraste explícito (ד lição 4 → ר lição 5; ב 14 → כ 16; ה 2 vs ח 9); toda letra volta em n+1, n+2, n+4, n+8, n+16 (tests/p0-exercicios P0-6); fixação 10 itens com 1 de recuperação ativa; checkpoint 12 itens em 3-4 dimensões; trava por nota
PED-049 | P3 | data/culture.json shekel; reviewStatus | Data errada num arquivo que se declara rascunho e mesmo assim é exportado (/historia) | "moeda israelense adotada em 1986" - o novo shekel entrou em circulação em 4/9/1985; `reviewStatus: "rascunho - conferir datas…"` | 1985; retirar a flag após revisão ou não exportar até lá
PED-051 | P4 | data/modules.json note | Nota desatualizada | "22 licoes de 1h30" - o plano do app tem 27 lições (sons); tests/licoes-de-som cobra 27 | atualizar a nota
PED-052 | P3 | data/imagens-vocabulario.json | 46/46 `image: null` - nenhuma imagem de vocabulário existe; se algum material de venda mostra vocabulário ilustrado, é promessa vazia | HANDOFF → UX/COM
PASS | courses.json outcomes 1, 2, 5 | reconhecer 22 + finais (exame `letras`/`dificeis`), ler qualquer palavra com nikud (motor), decodificar placas (cenas + `mundo`) - cobertos; outcome 3 "ler sem nikud as palavras mais frequentes" coberto pelo módulo 6 (24 palavras + rampa nos checkpoints 3-5) mas não pelo exame (PED-042)
PASS | Aula 0 | abjad, "hebraico não tem vogais" desmontado, 4 letras especiais, direção e linha mista, finais, letra muda, cursiva, bíblico vs moderno - tudo correto; 25 perguntas com gabarito conferido (apenas PED-032/033)

## HANDOFFS
HANDOFF → COM: PED-043 (escrita "letra de forma" não é ensinada), PED-042 (exame não cobre "sem nikud"), PED-052 (sem imagens de vocabulário) - conferir landing/cursos.
HANDOFF → UX: PED-019/021 (duas grafias da mesma palavra na tela), PED-052.
HANDOFF → QA: PED-025 é reproduzível com a sonda em scratchpad/soft.test.ts (buildLetterPractice/buildMiniTest do kaf).

## CONTAGEM
P0: 0 · P1: 0 · P2: 4 (PED-006, 019, 025, 043) · P3: 17 (001-003, 005, 007, 014, 015, 020-022, 027, 032, 033, 042, 045, 049, 052) · P4: 17 (004, 008-013, 016, 023, 024, 028, 029, 036, 040, 046, 047, 051, 053)

## COBERTURA
letters.json: 22 de 22 letras (todos os campos, 3.887 linhas) · nikud.json: 6 sons + daguesh de 7 · translit.json: 294 de 294 entradas (cruzadas por script) · sentences.json: 22 de 22 · textos.json: 5 de 5 (25 linhas, 41 novas, 20 perguntas) · extras.json: daguesh 3/3 (16 palavras), finais 5/5, sem-nikud 24+2, gerech 3/3 (9 palavras), sons 7/7 lições · missoes.json: 7 de 7 (28 passos) · real-world.json: 17 de 17 cenas · culture.json: 10 de 10 cartas · eras.json: 1 de 1 · bonus.json: 22 de 22 leituras (60 linhas) + guia 9/9 · biblia.json: 1 de 1 · courses.json: 4 de 4 (outcomes do curso 1 cruzados com o conteúdo) · modules.json: 7 de 7 · audio.json: 526 de 526 clipes ↔ arquivos · imagens-vocabulario.json: 46 de 46 · engine: exercises, generators, gym, jogos, exam, palavras, deck, missao, textos, extras, types, sons, hebrew, cursiva, rules, certificate, nome-hebraico, fala - lidos integralmente (pares.ts, bonus.ts, leitura.ts, vocabulario.ts: só via testes) · Aula 0 (StartHereClient): 1.311 linhas lidas · testes pedagógicos: 23 arquivos listados por título, 930/930 verdes.
NOT TESTED: escuta dos 526 clipes; telas das lições/som/extra em navegador (só as strings extraídas); tsc.
