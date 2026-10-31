# HEBREW_LANGUAGE_AUDIT: אודיט לשוני מלא לקורסי העברית של Hebraico Fluente

תאריך: 6 באוקטובר 2026 · ענף: `claude/festive-turing-a4olfy` (כולל את A1 שעוד לא פורסם) · אודיט בלבד, שום קובץ לא שונה.

## איך לקרוא את הדוח

הממצאים מקובצים לפי חומרה, ובתוך כל רמת חומרה לפי אזור בקורס. לכל ממצא יש מספר קבוע (למשל C-01, M-07) כדי שיהיה קל להפנות אליו.
ממצאים מפורטים כתובים באנגלית עם ציטוט מדויק מהקובץ. הסיכום, הציונים, עשרת התיקונים החשובים והמסקנה נמצאים בסוף הדוח, בעברית.

| חומרה | מספר ממצאים | משמעות |
| --- | --- | --- |
| 🔴 CRITICAL | 4 | מלמד עברית לא נכונה או עובדה שגויה |
| 🟠 MAJOR | 31 | בעיה משמעותית בדקדוק, בהסבר, בתשובות או בטבעיות |
| 🟡 MINOR | 112 | כתיב, ניקוד, ניסוח, עקביות |
| 🔵 PEDAGOGICAL | 53 | לא בהכרח שגוי, אבל עלול לבלבל תלמיד |
| 🟢 OPTIONAL | 59 | שיפור אפשרי, לא טעות |

## מה נבדק

כל קובץ תוכן, כל רשומה, לא דוגמאות:
- **קורס האלפבית (באוויר ונמכר):** `data/letters.json` (22 האותיות, כל השדות), `nikud.json`, `translit.json`, `modules.json`, `sentences.json`, `textos.json`, `missoes.json`, `imagens-vocabulario.json`, `extras.json` (דגש, אותיות סופיות, טקסט בלי ניקוד, גרש, 7 שיעורי הצלילים).
- **מידע ותרבות:** `bonus.json` (21 קריאות, מול הנוסח המסורה), `biblia.json`, `culture.json`, `eras.json`, `real-world.json`, `courses.json`, `data/a1/historia.json`.
- **A1:** 21 היחידות (`data/a1/unidades/u00` עד `u20`), `curso.json`, `exame.json`.
- **קוד:** כל מחרוזת עברית ב-`app/src`, כולל מחוללי התרגילים (`lib/engine`), שמייצרים משוב והסברים אוטומטיים.

**מה לא נבדק:** ההקלטות עצמן (לא האזנו לאודיו), וטקסטים בפורטוגזית שאין בהם עברית (דפי מכירה, משפטי).

**הסתייגות חשובה:** את האודיט עשו מודלים של בינה מלאכותית שעבדו כבודקים מומחים, לא דובר עברית ילידי. ליד כל ממצא יש Confidence. ממצאים עם Medium או Low צריכים אישור של מורה לעברית לפני שמתקנים.

**הערה על בדיקת התשובות הכתובות:** בתדריך לבודקים נאמר שהמערכת מייצרת לבד את הצורה בכתיב מלא. הבודק של מבחן הסיום הראה שזה לא מדויק. בזמן ריצה, הבדיקה רק מסירה ניקוד ומשווה אות אחר אות. הצורות בכתיב מלא נכנסו לנתונים של A1 פעם אחת, בזמן הכתיבה (למשל `"פינה", "פנה"`). לכן כל רשימת תשובות שחסרה בה הצורה בכתיב מלא היא באג אמיתי. ייתכן שהבודקים של יחידות A1 לא סימנו את כל המקרים האלה, כי הסתמכו על התדריך. מומלץ להריץ בדיקה אוטומטית על כל רשימות התשובות (ראו תיקון 7 בסוף).

**ממצאים משותפים:** שני ממצאים שכמה בודקים מצאו בנפרד אוחדו לממצא אחד, עם כל המיקומים: ג׳ = "gelo" (C-01) ו-imá/abá (M-01). כמה ממצאים קטנים עדיין מופיעים ביותר מאזור אחד, למשל הכתיב "gerech" ותעתיק ה-"ch".

## 🔴 CRITICAL (4)

### כמה אזורים (ממצא משותף, אוחד)

#### C-01 · ג׳ is explained with "gelo" and "jipe", which in Brazilian Portuguese is the sound of ז׳
- Location: (found by three auditors, merged here)
    - data/extras.json, gerech.introPt and gerech.letters[1] (id "gimel-gerech").likePt. The likePt line is shown as feedback in the module 7 quiz (app/src/lib/engine/extras.ts, buildGerechQuiz).
    - data/modules.json, mod7.introPt.
- Original: introPt: "Mas o hebraico moderno precisou de três sons que ele não tinha - os do português \"tchau\", \"gelo\" e \"jarro\"" / likePt: "como o G de \"gelo\" ou o J de \"jipe\""
- Problem: In Brazilian (and European) Portuguese the G of "gelo" and the J of "jipe" are both [ʒ], the same sound as the J of "jarro". ז׳ is [ʒ], while ג׳ is [dʒ]. So the page teaches that ג׳ and ז׳ sound the same, and its list of "three sons" actually holds only two. The course contradicts itself: the later "dj" lesson in extras.json says it correctly ("o DJ de \"Djavan\"") and even warns against exactly this mistake.
- Correct version: introPt: "...os do português \"tchau\", \"Djavan\" e \"jarro\"..." / likePt: "como o DJ de \"Djavan\", ou o D de \"dia\" no sotaque brasileiro"
- Explanation: ג׳ = [dʒ] (ג׳ירפה, פיג׳מה, ג׳ינס); ז׳ = [ʒ] (ז׳רגון). A Brazilian has [dʒ] natively only in "di/de" (dia [dʒia]) and in loanwords, so the example word must contain that sound. As written, the page erases the very contrast module 7 exists to teach.
- Severity: Critical
- Confidence: High

### קורס האלפבית · האותיות 12 עד 22 (data/letters.json)

#### C-02 · מַזָּל טוֹב presented as "boa sorte" and as a greeting; it means "parabéns"
- Location: data/letters.json, zayin (order 13), didYouKnow
- Original: `"{{מַזָּל טוֹב}} - a saudação que atravessou para o português como \"mazel tov\" - é literalmente \"boa sorte\". ..."`
- Problem: (1) מַזָּל טוֹב is used to congratulate on something that has already happened (birth, wedding, birthday, new job), i.e. "parabéns". It is NOT used to wish good luck before an event; for that Israelis say בְּהַצְלָחָה. A learner told it "is literally boa sorte" will say מזל טוב before an exam or a trip, which is a classic learner error. (2) "mazel tov" is the Yiddish/Ashkenazi pronunciation and it entered English (and Jewish usage), not general Brazilian Portuguese. (3) It is not a "saudação" (greeting).
- Correct version: "{{מַזָּל טוֹב}} quer dizer \"parabéns\": é o que se diz num aniversário, casamento ou nascimento (palavra por palavra, \"boa sorte\", mas nunca se usa para desejar sorte antes de algo; para isso existe בְּהַצְלָחָה). A forma \"mazel tov\", que você talvez conheça, é a pronúncia ídiche."
- Explanation: Usage error with real social consequence; the literal gloss is acceptable only if the actual meaning is given first.
- Severity: Critical
- Confidence: High

### מידע על העברית, היסטוריה ותרבות (כולל extras.json והיסטוריית A1)

#### C-03 · The Masoretes were not native speakers of Hebrew
- Location: data/culture.json, card id "de-onde-vem-o-nikud", bodyPt[2]
- Original: "Então o nikud não é uma muleta para estrangeiros: foi inventado por falantes nativos, para preservar uma leitura que corria o risco de se perder."
- Problem: Between the 7th and 10th centuries (the dates the same card gives), Hebrew was nobody's native language. The Tiberian Masoretes spoke Aramaic and later Arabic. Hebrew was a language of reading, prayer and study, which is exactly why the reading "corria o risco de se perder". The sentence contradicts the card's own logic and the "ben-yehuda" card ("Por cerca de mil e setecentos anos o hebraico ... não era a língua do dia a dia de quase ninguém").
- Correct version: "Então o nikud não é uma muleta para estrangeiros: foi criado por sábios judeus que conheciam o texto de cor, para preservar uma leitura que corria o risco de se perder."
- Explanation: Historical fact; the point of the card (niqqud is not a crutch for foreigners) still stands without the false claim.
- Severity: Critical
- Confidence: High

### A1 · יחידות 0 עד 5

#### C-04 · The stress exception is defined by a false criterion ("two E vowels in a row")
- Location: u00.json, gramatica[6] ("A força da palavra"), textoPt; exercicios[5] (the בֹּקֶר item), "porque" and dicas["1"]
- Original: "A exceção que mais aparece no começo são as palavras com duas vogais E seguidas, como בֹּקֶר, עֶרֶב, רֶגַע, סֵדֶר: essas têm a força na penúltima (BÓ-ker, É-rev, RÉ-ga, be-SÉ-der)." / exercise: "בֹּקֶר é uma das palavras com dois E seguidos (ֶ ֶ): a força vai na penúltima." / dica: "palavras com dois E seguidos levam a força na penúltima, BÓ-ker."
- Problem: Two of the four examples do not have two E vowels. בֹּקֶר is O + E (cholam, segol). רֶגַע is E + A (segol, patach). The exercise explicitly shows "(ֶ ֶ)" for בֹּקֶר, which is factually wrong: the word has ֹ then ֶ. A learner who checks the niqqud will see the rule contradicted by its own example.
- Correct version: "A exceção mais comum são as palavras do tipo בֹּקֶר, עֶרֶב, סֵדֶר, רֶגַע: duas sílabas, a última com ֶ (ou com ַ quando há ח/ע/ה, como רֶגַע). Nessas, a força vai na penúltima: BÓ-ker, É-rev, SÉ-der, RÉ-ga." In the exercise: "בֹּקֶר é desse grupo: a última sílaba tem ֶ, e a força vai na penúltima."
- Explanation: these are the segolate nouns; the reliable cue for a beginner is "last vowel segol (or patach next to a guttural) in a two-syllable noun", not "two E's". The first vowel can be o, e, a or i (בֹּקֶר, סֵפֶר, יֶלֶד, נַעַר... and later חֶדֶר, לֶחֶם, which happen to be E+E).
- Severity: Critical
- Confidence: High

## 🟠 MAJOR (31)

### כמה אזורים (ממצא משותף, אוחד)

#### M-01 · אִמָּא and אַבָּא are transliterated with stress on the last syllable ("imá", "abá"); Israelis say ÍMA and ÁBA
- Location: (found by four auditors, merged here)
    - data/translit.json, words "אִמָּא": "imá" and "אַבָּא": "abá" (the course's canonical table).
    - data/letters.json:
        - mem: wordsToRead[0].translit ("imá"), while ensino.paraBrasileiroPt writes "ima".
        - bet: ensino.funcaoPt, ensino.checagem[1] (q, opcoes[0], porque), wordsToRecognize[3], wordsToRead[0], brazilianMistake.right ("abá").
    - data/textos.json: modulo 3 "Tem pão?" linha 1 ("imá, yesh léchem?"); modulo 6 "A caminho de casa" last line ("todá, imá!"); modulo 1 revisão linha 3; modulo 3 revisão linha 1.
    - data/a1/unidades/u02.json: palavras (אִמָּא "imá"); dialogo.linhas[5] ("zot imá. veze aba.").
    - The alphabet course exam (app strings): "abá".
- Original: "imá", "abá"
- Problem: In modern Israeli Hebrew both words are stressed on the first syllable: [ˈima], [ˈaba], just like סַבָּא "sába" and סָבְתָא "sávta", which the course already writes correctly. The course's own accent rule (translit.json notes) makes "imá" mean "stress the last syllable", so it actively teaches the wrong stress, in two of the very first words of the course.
- Inconsistencies: other places already write "aba" (no accent, read as ÁBA in Portuguese, which is right). u09 writes "íma", and a module 1 review question offers the answer option "Ima".
- Correct version: "íma" and "ába" everywhere ("ima" and "aba" without an accent also work, since Portuguese reads them as paroxytones). The V3 validation rule checks that letters.json and translit.json agree, so fix them together. Re-record any audio that follows the wrong stress.
- Explanation: Final stress (imá, abá) does exist as a prescriptive or old reading, but no Israeli says it for "mom" and "dad". I rate this Major, not Critical, because the word and its spelling are correct; only the stress mark is wrong. But it is one of the most visible errors in the course.
- Severity: Major
- Confidence: High

### קורס האלפבית · האותיות 1 עד 11 (data/letters.json)

#### M-02 · "ch" in transliteration means [χ], but the shin page teaches that CH is the sound of "chave"
- Location: data/letters.json, letter shin (order 9): soundNotePt, variantes[0].comoPt, ensino.funcaoPt, syllables[*].ptApprox; versus translit fields across the slice: alef wordsToRecognize ("óchel", "acharei"), mem wordsToRecognize ("mishpachá", "mélech"), nun wordsToRecognize ("nachon", "chalon", "nechmad"), lamed wordsToRecognize ("léchem"), resh wordsToRecognize ("rechov", "chaver")
- Original: shin: "Como o CH de \"chave\", \"chuva\", \"cachorro\"." / "{{ש}} é a letra do som CH de \"chave\"" / syllables: "como \"chá\"", "como \"chi\" de \"chique\"". Elsewhere: "translit": "óchel", "translit": "chaver", "translit": "léchem"
- Problem: For a Brazilian, "ch" is [ʃ] (chave, chuva). The shin page explicitly reinforces this ("CH de chave" = ש), while the same file transliterates ח and כ as "ch" (translit.json: "ch representa tanto ח quanto כ/ך - som de 'r' carioca raspado"). A learner who follows the shin page will read "chaver" as "shaver", "léchem" as "léshem", "óchel" as "óshel". The very first lesson (alef) already shows "óchel" and "acharei", before any warning about "ch" can have been given; I found no learner-facing explanation of the "ch" convention in the alphabet lessons in this slice.
- Correct version: Either (1) change the shin teaching to "o som de X em \"xícara\" / CH em \"chave\" (transliterado sh)" AND add, at the first appearance of a "ch" transliteration (alef lesson), a visible note: "Nas transliterações, ch NÃO é o ch de \"chave\": é o R raspado do carioca (ח/כ)". Or (2) use a different symbol for ח/כ for Brazilians, e.g. "kh" or "rr" style (e.g. "khaver"), which cannot be read as [ʃ].
- Explanation: Same two letters denote two different sounds on adjacent pages; for a self-study audience without a teacher this produces systematic mispronunciation of very frequent words.
- Severity: Major
- Confidence: High

#### M-03 · Mem "brazilianMistake" uses מִי, where nasalization cannot happen
- Location: letters.json, mem, brazilianMistake.wrong / right / why
- Original: "wrong": "Ler {{מִי}} como \"mĩ\", com a vogal anasalada." / "right": "Ler {{מִי}} como \"mi\", com a vogal limpa e aberta, como em \"milho\"." / "why": "Em português o M no fim da sílaba nasaliza a vogal antes dele"
- Problem: The "why" (correctly) says the M nasalizes the vowel BEFORE it, at the end of a syllable. In מִי the M is before the vowel and there is no nasal after it, so a Brazilian has no reason to say "mĩ" (Portuguese "mi" is oral). The example does not illustrate the rule it explains. Also "vogal limpa e aberta" for [i] is odd (i is a closed vowel).
- Correct version: use a word with a syllable-final mem, e.g. "Ler {{שָׁלוֹם}} como \"shalõ\"" or "{{אֵם}} como \"ẽ\"" / "{{יָם}} como \"iã\"", right: "\"shalom\", com o M pronunciado (lábios fechados no fim) e a vogal oral". Drop "aberta".
- Explanation: The box is meant to correct a real Brazilian habit; with this example it corrects a non-existent one and misses the real trap (shalom, gam, hem, yam, máyim).
- Severity: Major
- Confidence: High

#### M-04 · "No começo da palavra, ה sozinho funciona como o nosso artigo": overgeneralization
- Location: letters.json, he, didYouKnow
- Original: "No começo da palavra, {{ה}} sozinho funciona como o nosso artigo: {{בַּיִת}} é \"casa\" e {{הַבַּיִת}} é \"a casa\". Uma letra faz o trabalho de uma palavra inteira."
- Problem: As written it says that a word-initial ה is the article. In the same lesson the learner reads הֵם, הֵן, הִנֵּה, and later הוּא, הִיא, הַר, הָלַךְ... where the initial ה is part of the word. A learner reading הַר "har" (resh lesson) could analyse it as "ha + r". The article is a PREFIX ה added to a word (normally with patach and dagesh in the next letter).
- Correct version: "O artigo definido do hebraico é um {{ה}} grudado no começo da palavra: {{בַּיִת}} é \"casa\" e {{הַבַּיִת}} é \"a casa\". Atenção: nem todo {{ה}} inicial é artigo - em {{הֵם}} e {{הִנֵּה}} ele faz parte da palavra."
- Explanation: Grammar overgeneralization in a "curiosity" box that learners will remember as a rule.
- Severity: Major
- Confidence: High

#### M-05 · Final ה presented as marking "quase sempre a"
- Location: letters.json, he, ensino.funcaoPt, ensino.lembrePt, ensino.checagem[0].opcoes[0] and porque
- Original: funcaoPt: "é ela que indica que a palavra termina com som de vogal, quase sempre \"a\"" / lembrePt: "No fim, quase sempre é muda e marca o som de \"a\"." / checagem porque: "é o que indica o som de \"a\" no fim"
- Problem: Word-final silent ה very often marks "e": יָפֶה (yafé, in the yod lesson of this same file), מוֹרֶה (moré, mem lesson), and the whole class of present-tense masculine verbs רוֹצֶה, עוֹשֶׂה, קוֹנֶה, שׁוֹתֶה, plus adjectives קָשֶׁה. Also "o" in פֹּה. The dicaLeitura.notaPt correctly says "Não existe \"ה no fim significa sempre A\"", which contradicts the lembrePt summary the learner is told to remember.
- Correct version: lembrePt: "No começo da palavra, {{ה}} é um sopro. No fim, quase sempre é muda: a vogal é a que está embaixo da letra anterior (muitas vezes \"a\", mas também \"e\", como em {{יָפֶה}})." funcaoPt: "termina com som de vogal, geralmente \"a\" ou \"e\"".
- Explanation: The summary line contradicts the course's own nuance note and the words the learner meets two lessons later.
- Severity: Major
- Confidence: High

#### M-06 · יָם respelled as "iam" for Brazilians
- Location: letters.json, yod, ensino.funcaoPt and ensino.checagem[1].porque
- Original: "{{יָם}} é \"iam\" (mar)" / "o {{י}} soa como consoante: \"iam\"."
- Problem: "iam" is an existing Portuguese word (verb "ir", "eles iam") pronounced [ˈi.ɐ̃w̃]: two syllables, stress on the i, nasal diphthong, M not pronounced. It is exactly the opposite of the target [jam]: one syllable, consonantal y, oral a, audible m. The mem and nun pages warn against nasalization, and here the respelling invites it.
- Correct version: use the course's own transliteration "yam" with a note: "\"yam\", uma sílaba só, como \"iá\" + M com os lábios fechados (não como \"iam\" do verbo ir)".
- Explanation: Respelling with a real Portuguese word triggers that word's pronunciation.
- Severity: Major
- Confidence: High

#### M-07 · Nun: "a forma antiga da letra era justamente o desenho de um peixe"
- Location: letters.json, nun, didYouKnow
- Original: "Em aramaico {{נוּן}} quer dizer peixe, e a forma antiga da letra era justamente o desenho de um peixe. Daí vem também o nome Nun, pai de Josué."
- Problem: That nun means "fish" in Aramaic is correct. But the usual reconstruction of the Proto-Sinaitic/early Phoenician glyph for n is a snake (a wavy line), not a fish; the "fish" association comes from the letter's NAME, and the shape and name do not match. Stated as fact ("justamente"). Also "Daí vem também o nome Nun, pai de Josué" suggests the biblical name derives from the letter; at most both share the word nun "fish".
- Correct version: "Em aramaico {{נוּן}} quer dizer peixe. A forma antiga da letra parece ter sido uma cobrinha ondulada, e o nome peixe veio depois, segundo muitos estudiosos. O nome Nun, pai de Josué, é a mesma palavra."
- Explanation: Brief item 6: no folk etymologies presented as facts.
- Severity: Major
- Confidence: Medium

### קורס האלפבית · האותיות 12 עד 22 (data/letters.json)

#### M-08 · "אֶרֶץ יִשְׂרָאֵל termina com o ץ final" is false
- Location: data/letters.json, tsadi (order 18), didYouKnow
- Original: `"Mais uma forma final. {{אֶרֶץ יִשְׂרָאֵל}} - \"a terra de Israel\" - termina justamente com o {{ץ}} final, e é a primeira palavra que muitos iniciantes conseguem ler numa placa de rua."`
- Problem: The phrase ends in ל. Only its first word, אֶרֶץ, ends in ץ. The second claim (the first word beginners read on a street sign) is unsupported and implausible: "Eretz Israel" is not a typical street-sign text.
- Correct version: "{{אֶרֶץ}}, \"terra, país\", termina com o {{ץ}} final - e aparece na expressão {{אֶרֶץ יִשְׂרָאֵל}}, \"a terra de Israel\"." (drop the street-sign claim, or replace with a real sign word such as רְחוֹב or מִיץ on a menu).
- Explanation: Simple factual error in a "curiosity" box.
- Severity: Major
- Confidence: High

#### M-09 · "ch" for ח said to come "do alemão e do espanhol"
- Location: data/letters.json, het (order 14), ensino.detalhePt and brazilianMistake.why
- Original: `"Essa convenção vem do alemão e do espanhol, não do português"`; `"A transliteração \"ch\" vem do alemão e do espanhol, não do português."`
- Problem: In Spanish "ch" is [tʃ] (as in "chico"); the Spanish letter for this raspy sound is J ("jota"). The "ch" = [χ] convention comes from German (Bach, Buch) and is used in English-language transliteration of Hebrew. A Brazilian who knows some Spanish could be misled into reading it as "tch".
- Correct version: "Essa convenção vem do alemão (como em \"Bach\") e é usada nas transliterações em inglês, não do português. Em espanhol esse som se escreve com J."
- Explanation: Wrong fact, repeated twice.
- Severity: Major
- Confidence: High

#### M-10 · Zayin lesson says the S sound has a letter of its own "que você aprende daqui a algumas lições"; שׂ was already taught
- Location: data/letters.json, zayin (order 13), ensino.checagem[1].porque
- Original: `"Em hebraico o som de /z/ se mantém em qualquer posição da palavra - e o som de S tem uma letra só dele, que você aprende daqui a algumas lições."`
- Problem: The course taught שׂ (sin, /s/) in lesson 4 as a variant of shin (order 9, variantes[1]), before zayin (lesson 8). So /s/ does not have "uma letra só dele": it is written with ס or שׂ, and the learner already knows one of them. The samekh lesson also never mentions that שׂ has exactly the same sound, which is the same spelling problem as ט/ת and ק/כּ that the course explains elsewhere.
- Correct version (zayin): "... e o som de S se escreve com outras letras: o {{שׂ}}, que você já viu, e o {{ס}}, que vem daqui a algumas lições." Add one sentence to samekh ensino.detalhePt: "O {{ס}} soa exatamente como o {{שׂ}} (sin) que você já conhece: duas letras, um som, e a escolha é ortografia, como {{ט}} e {{ת}}."
- Explanation: Factual inconsistency with the course's own earlier lesson, and a missed merger that matters for writing.
- Severity: Major
- Confidence: High

#### M-11 · Zayin "brazilianMistake" example does not show the error it describes
- Location: data/letters.json, zayin (order 13), brazilianMistake
- Original: `"wrong": "Ensurdecer o Z no fim da sílaba: ler {{זַיִן}} como \"sáin\"."`
- Problem: In זַיִן the ז is at the very start of the word, not at the end of a syllable. Brazilians do not devoice an initial Z ("zebra" is never "sebra"), so the example is both inconsistent with the rule and an implausible mistake.
- Correct version: Use a word with ז at the end of a syllable or word, built only from letters already taught, e.g. `ler {{אָז}} (então) como \"as\"` with right: `"\"az\", com a garganta vibrando até o fim"`.
- Explanation: The box is meant to show the Portuguese final-devoicing habit; the current example contradicts it.
- Severity: Major
- Confidence: High

#### M-12 · Bridge words in the K lesson are pronounced with ח-like /χ/ in Hebrew
- Location: data/letters.json, kaf (order 21), bridgeWords[2], bridgeWords[3]
- Original: `{"he": "ארכיאולוגיה", "pt": "arqueologia"}`, `{"he": "פסיכולוגיה", "pt": "psicologia"}`
- Problem: Israelis pronounce these "arkheológya" and "psikhológya", with כ = /χ/ (raspado), following the Greek chi. This is the lesson whose rule is "ponto dentro, K"; a Brazilian will match "arqueologia/psicologia" to a K sound and learn the wrong pronunciation of two common words. (כולסטרול and כרום are indeed /k/ and are fine.)
- Correct version: Move ארכיאולוגיה and פסיכולוגיה to the Chaf lesson (17), where they are excellent examples, and keep only /k/ words here (כולסטרול, כרום). Avoid other Greek "ch" words such as כימיה or כריזמה, which are also read with /χ/.
- Explanation: Greek "ch" words in Hebrew are written with כ and read with /χ/; they are good bridge words for chaf, wrong ones for kaf.
- Severity: Major
- Confidence: High

#### M-13 · Qof lesson claims "A transliteração escreve ק como Q"; the course writes it as K everywhere
- Location: data/letters.json, qof (order 19), ensino.paraBrasileiroPt and ensino.checagem[0].porque
- Original: `"A transliteração escreve {{ק}} como Q, e aí mora a armadilha"`; `"O Q da transliteração não carrega U nenhum: é só o som /k/."`
- Problem: The entry's own translit is "k", all its words are "kol", "katan", "rak", "makom", and data/translit.json maps ק to "k". Only the letter name is written "Qof". The learner is warned about a Q they never see in the course's transliteration; the warning is only relevant to outside sources.
- Correct version: "O nome da letra às vezes aparece escrito com Q (\"Qof\"), e em outras transliterações você vai ver Q no lugar de K. Em português o Q quase sempre vem com U - \"quando\", \"quilo\". Em hebraico não existe U nenhum embutido na letra: {{קוֹל}} é \"kol\"."
- Explanation: Internal inconsistency that makes the explanation look wrong.
- Severity: Major
- Confidence: High

### קורס האלפבית · ניקוד, תעתיק, מודולים וטקסטים

#### M-14 · סָבָא pointed without dagesh, which contradicts its own transliteration
- Location: translit.json, words, key "סָבָא"
- Original: "סָבָא": "saba"
- Problem: The standard pointing is סַבָּא (patach + dagesh in ב), as in data/a1/unidades/u06.json ("סַבָּא") and like אַבָּא. With the course's own consonant table ("ב": "v"), סָבָא reads "sava", but the value given is "saba". (It is listed next to "סָבְתָא", which is correct.)
- Correct version: "סַבָּא": "saba"
- Explanation: The notes say words{} is the canonical table that the validator checks, so the wrong key can spread into other content.
- Severity: Major
- Confidence: High

#### M-15 · תָּא glossed as "caixa postal" and illustrated with a mailbox
- Location: imagens-vocabulario.json, palavras "תָּא"
- Original: "pt": "compartimento · caixa postal", "imageAlt": "Uma caixa de correio pequena, com a portinha aberta."
- Problem: תָּא means cell, compartment, booth, cubicle (תָּא טֶלֶפוֹן, תָּא מִטְעָן). A P.O. box is תָּא דֹּאַר, and a mailbox is תֵּבַת דֹּאַר. With the gloss and the picture, the learner will think תָּא alone means "mailbox".
- Correct version: "pt": "compartimento, cabine, cela"; an image of a booth or a set of lockers/compartments. Or drop the word, since it is rare at this level.
- Explanation: Wrong meaning taught through the picture-word association.
- Severity: Major
- Confidence: High

#### M-16 · The unpointed text shows the non-standard spelling "אכל" for "food"
- Location: textos.json, modulo 6 "A caminho de casa" (semPontos: true), linha 5
- Original: "מְעוּלֶה. יֵשׁ אֹכֶל בַּמְּקָרֵר."
- Problem: LinhasDeLeitura strips the niqqud for semPontos texts (stripNikud). The result is "יש אכל במקרר". In unpointed Hebrew (ktiv male) the word is אוכל, and "אכל" reads as the verb "ate". The modulo 6 revisão text in the same file spells it correctly for the unpointed view ("וְאוֹכֶל" -> "ואוכל"). This is the one module whose whole purpose is reading real unpointed text.
- Correct version: "מְעוּלֶה. יֵשׁ אוֹכֶל בַּמְּקָרֵר." (and novas "אוֹכֶל"), the same as the revisão text.
- Explanation: When a text is shown without niqqud, its pointed source must use plene spelling wherever ktiv male adds a vav or yod. All the other words in both semPontos texts survive stripping correctly (איפה, בדרך הביתה, מפתח, דקות, במקרר, בעיר, ברחוב).
- Severity: Major
- Confidence: High

### מידע על העברית, היסטוריה ותרבות (כולל extras.json והיסטוריית A1)

#### M-17 · The mezuzah does not contain only the last verse of the Shema passage
- Location: data/bonus.json, leituras id "shema", introPt
- Original: "As palavras que a mezuzá guarda no batente da porta estão no último versículo."
- Problem: Read naturally, this says the text inside the mezuzah is the last verse (6:9). In fact the mezuzah parchment contains the whole of Deuteronomy 6:4-9 (the passage shown here) plus Deuteronomy 11:13-21. Verse 6:9 is the commandment that gives rise to the mezuzah, not its content.
- Correct version: "O último versículo é a origem da mezuzá, no batente da porta: o pergaminho dela traz este trecho inteiro (e mais Deuteronômio 11:13-21)."
- Explanation: Wrong fact about a central Jewish practice, in a section aimed explicitly at a Jewish and Bnei Anusim audience who will notice.
- Severity: Major
- Confidence: High

#### M-18 · "Antes de existirem algarismos, as letras faziam esse trabalho" overstates the history of Hebrew numerals
- Location: data/culture.json, card id "numeros-com-letras", bodyPt[0]
- Original: "Antes de existirem algarismos, as letras faziam esse trabalho: as nove primeiras valem de 1 a 9, as seguintes de 10 a 90, e as últimas as centenas."
- Problem: (1) Alphabetic numerals are not the original Hebrew number system: First Temple Hebrew inscriptions (ostraca from Arad, Samaria, Lachish) write numbers with Egyptian hieratic signs; Hebrew letter numerals appear only in the Hellenistic/Hasmonean period (coins, 2nd to 1st c. BCE), probably on the Greek model. (2) "as últimas as centenas" covers only ק ר ש ת = 100 to 400; 500 to 900 need combinations (תק = 500 etc.).
- Correct version: "Por muitos séculos as letras também fizeram o papel de números: as nove primeiras valem de 1 a 9, as nove seguintes de 10 a 90, e ק, ר, ש, ת valem 100, 200, 300 e 400."
- Explanation: Myth-like overgeneralization presented as fact.
- Severity: Major
- Confidence: Medium

### A1 · יחידות 0 עד 5

#### M-19 · "Língua não leva preposição" is false, and the exercise has two correct options
- Location: u04.json, gramatica[2] textoPt; exercicios[11] ("Falo português"), opcoes and porque; contrast with exercicios[15] (ouvir)
- Original: "Língua não leva preposição: מְדַבֵּר עִבְרִית." / options "אֲנִי מְדַבֵּר פּוֹרְטוּגָזִית" (certa) and "אֲנִי מְדַבֵּר בְּפּוֹרְטוּגָזִית", porque "Língua não leva preposição." / ouvir item: "הוּא כּוֹתֵב בְּעִבְרִית"
- Problem: מְדַבֵּר בְּעִבְרִית is fully correct and very common Hebrew ("speaking in Hebrew", e.g. דַּבֵּר אִתִּי בְּעִבְרִית, הַשִּׁעוּר בְּעִבְרִית). The difference is nuance: מְדַבֵּר עִבְרִית = knows / speaks the language; מְדַבֵּר בְּעִבְרִית = is speaking in that language (now, in this conversation). The same unit then plays כּוֹתֵב בְּעִבְרִית, which with "escrever" requires בְּ, so the learner meets a direct contradiction of the rule. The escolha item marks a correct sentence as wrong.
- Correct version: Rule: "Para dizer que você FALA uma língua (sabe falar), não precisa de preposição: אֲנִי מְדַבֵּר עִבְרִית. Para dizer EM que língua algo é dito ou escrito, usa-se בְּ: כּוֹתֵב בְּעִבְרִית." Exercise: replace the wrong option with something really wrong (e.g. "אֲנִי מְדַבֶּרֶת פּוֹרְטוּגָזִית" for a man, or "אֲנִי פּוֹרְטוּגָזִית"), or change the porque to "Para dizer que você sabe a língua, o mais natural é sem בְּ."
- Explanation: overgeneralised rule that produces a false negative in the key and conflicts with the unit's own listening item.
- Severity: Major
- Confidence: High

#### M-20 · "A regra é uma só: אֶת só antes de הַ" overgeneralises the את rule
- Location: u05.json, gramatica[1] erroPt; also textoPt, exercicios[7] porque ("אֶת só antes de הַ."), exercicios[9] porque, autoavaliacao[2]
- Original: "A regra é uma só: אֶת só antes de הַ."
- Problem: אֶת goes before every DEFINITE direct object, not only before ones with הַ: proper names (אֲנִי מַכִּיר אֶת דָּנִי, אֲנִי אוֹהֵב אֶת יְרוּשָׁלַיִם), nouns with a possessive suffix, smichut whose second member is definite (אֶת בֵּית הַסֵּפֶר), and pronoun objects become אוֹתִי/אוֹתְךָ (these appear in u14/u17). Learners who memorise "only before הַ" will write *אֲנִי אוֹהֵב דָּנִי. It is a legitimate simplification to start with הַ, but "a regra é uma só" closes the door.
- Correct version: "Por enquanto: אֶת vem antes do objeto definido, e o caso mais comum é o objeto com הַ. Sem הַ (\"um pão\", \"pão\"), não há אֶת. Mais tarde você vai ver que nomes próprios também levam אֶת: אֲנִי מַכִּיר אֶת דָּנִי." vf porque: "Só antes do objeto definido (com הַ, por exemplo)."
- Explanation: dangerous simplification (not just incomplete): it states a false exclusivity.
- Severity: Major
- Confidence: High

### A1 · יחידות 6 עד 10

#### M-21 · u09 grammar says the feminine ending is "always ־ָה", contradicting the pattern taught in Unit 4 and the verbs of this same unit
- Location: u09.json, gramatica[0].textoPt
- Original: "Os verbos novos seguem as 4 formas da Unidade 4: homem, mulher, homens, mulheres. Alguns são curtos, de duas letras fortes: קָם, קָמָה, קָמִים, קָמוֹת; בָּא, בָּאָה, בָּאִים, בָּאוֹת. Mesmo curtos, o final é o de sempre: ־ָה, ־ִים, ־וֹת."
- Problem: The "usual" feminine singular ending taught in Unit 4 (u04 gramatica[1]: "_וֹ_ֶ_ֶת") is ־ֶת, not ־ָה. In this very unit, הוֹלֶכֶת and חוֹזֶרֶת end in ־ֶת, while קָמָה, בָּאָה, עוֹשָׂה, יְשֵׁנָה end in ־ָה. Calling ־ָה "o de sempre" is false and will push learners to produce *הוֹלְכָה / *חוֹזְרָה.
- Correct version: "Mesmo curtos, mudam do jeito de sempre no plural (־ִים, ־וֹת). No feminino singular, estes verbos curtos (קָמָה, בָּאָה) e os que terminam em ־ֶה (עוֹשָׂה) levam ־ָה; os verbos do desenho normal continuam com ־ֶת: הוֹלֶכֶת, חוֹזֶרֶת."
- Explanation: Present-tense feminine singular is ־ֶת for regular pa'al (and ל"א/ל"ע variants ־ַעַת/־ֵאת), but ־ָה for ע"ו (קָמָה), ל"ה (עוֹשָׂה) and stative/adjectival forms (יְשֵׁנָה). The rule must name both endings.
- Severity: Major
- Confidence: High

#### M-22 · בַּלַּיְלָה glossed as "de madrugada", and "à noite" accepts only בערב
- Location: u09.json, palavras (he "בַּלַּיְלָה"), exercicios ligar (pair "בַּלַּיְלָה" / "de madrugada"), exercicios escrever pt "à noite"
- Original: palavras: "pt": "de madrugada, tarde da noite"; ligar: ["בָּעֶרֶב", "à noite, no fim do dia"], ["בַּלַּיְלָה", "de madrugada"]; escrever: "pt": "à noite", "respostas": ["בערב"]
- Problem: בַּלַּיְלָה is the ordinary word for "at night / à noite" (אֲנִי יָשֵׁן בַּלַּיְלָה = "durmo à noite", not "de madrugada"). "Madrugada" (0h to 5h) is far too narrow and teaches a wrong meaning. Consequently a learner who writes בלילה for "à noite" is marked wrong, though it is a correct translation.
- Correct version: palavras: "à noite (já escuro, mais tarde que עֶרֶב); de madrugada". Ligar: "בָּעֶרֶב" = "no fim do dia, à noitinha"; "בַּלַּיְלָה" = "à noite, de madrugada". Escrever "à noite": respostas ["בערב", "בלילה"] (or change the prompt to "no fim do dia / à noitinha").
- Explanation: Portuguese "noite" covers both עֶרֶב (evening) and לַיְלָה (night). The useful contrast is evening vs night, not evening vs madrugada.
- Severity: Major
- Confidence: High

#### M-23 · Missing accepted answer that the item's own explanation calls correct
- Location: u09.json, exercicios, t "erro", errada "אֲנַחְנוּ בָּא מְאֻחָר."
- Original: "respostas": ["אנחנו באים מאוחר", "אנחנו באים מאחר"], "porque": "Com אֲנַחְנוּ, o verbo vai para o plural: בָּאִים (ou בָּאוֹת, se forem só mulheres)."
- Problem: A female learner (the course asks the learner's gender) who writes אנחנו באות מאוחר is marked wrong, although the feedback itself says בָּאוֹת is right.
- Correct version: add "אנחנו באות מאוחר" and "אנחנו באות מאחר".
- Severity: Major
- Confidence: High

#### M-24 · Model answer uses the wrong preposition: "בְּיוֹם שֵׁנִי עַד יוֹם חֲמִישִׁי"
- Location: u07.json, exercicios, last item (t "aberta"), exemplo
- Original: "אֲנִי עוֹבֵד בְּיוֹם שֵׁנִי עַד יוֹם חֲמִישִׁי, בְּשָׁעָה תֵּשַׁע."
- Problem: "From Monday to Thursday" is מִ... עַד, not בְּ... עַד. As written it reads "I work on Monday until Thursday, at nine". The task asks when the learner starts working, but the sentence never says "start".
- Correct version: "אֲנִי עוֹבֵד מִיּוֹם שֵׁנִי עַד יוֹם חֲמִישִׁי, מִתֵּשַׁע." or, keeping only taught material: "אֲנִי עוֹבֵד בְּיוֹם שֵׁנִי, בְּיוֹם שְׁלִישִׁי וּבְיוֹם רְבִיעִי, בְּתֵשַׁע בַּבֹּקֶר." (מִ... עַד would need one line of explanation, since מִ is otherwise only taught as "from a place").
- Explanation: The exemplo is the model learners copy; it should be grammatical. Also בְּשָׁעָה תֵּשַׁע is correct but stiff; Israelis say בְּתֵשַׁע.
- Severity: Major
- Confidence: High

#### M-25 · "montar" accepts only one word order where Hebrew allows two equally natural ones
- Location: u09.json exercicios montar "O Tom vai para a universidade todo dia." (palavras ["טוֹם", "הוֹלֵךְ", "לָאוּנִיבֶרְסִיטָה", "כָּל יוֹם"]); also u09 montar "Depois eu volto para casa. (fala uma mulher)" and u10 montar "Eu não posso hoje, porque trabalho. (fala um homem)"
- Original: ordering as given; A1Player.tsx Montar() marks right only if `usadas... join(' ') === item.palavras.join(' ')`.
- Problem: כָּל יוֹם טוֹם הוֹלֵךְ לָאוּנִיבֶרְסִיטָה is just as natural as the keyed order and will be marked wrong. Likewise אֲנִי חוֹזֶרֶת הַבַּיְתָה אַחַר כָּךְ, and הַיּוֹם אֲנִי לֹא יָכוֹל כִּי אֲנִי עוֹבֵד. Hebrew time adverbs move freely.
- Correct version: either support alternative orders in the data (e.g. an "outras" list of accepted orders) or pick sentences without a movable adverb. At minimum for "todo dia", since the Portuguese prompt gives no hint about where it goes.
- Severity: Major
- Confidence: High

### A1 · יחידות 16 עד 20

#### M-26 · Unit 20 "separar" with question words: three items fit more than one bucket
- Location: u20.json, exercicios, item 6 (t: "separar", q: "Qual palavra de pergunta completa?")
- Original: buckets "אֵיפֹה", "לְאָן", "מָתַי"; items `["… אַתָּה נוֹסֵעַ?", 1]`, `["… הִיא הוֹלֶכֶת?", 1]`, `["… הַשִּׁעוּר?", 2]`
- Problem: "מָתַי אַתָּה נוֹסֵעַ?" (when are you leaving/travelling?) and "מָתַי הִיא הוֹלֶכֶת?" (when is she going/leaving?) are perfectly natural, everyday questions, so the learner who drops them in מָתַי is marked wrong. Likewise "אֵיפֹה הַשִּׁעוּר?" (where is the class?) is at least as common as "מָתַי הַשִּׁעוּר?". Only הַבַּנְק, הַשֵּׁרוּתִים and יוֹם הַהֻלֶּדֶת שֶׁלְּךָ are unambiguous.
- Correct version: make each item admit only one bucket, e.g. "… אַתָּה נוֹסֵעַ? לְתֵל אָבִיב." / "… הִיא הוֹלֶכֶת? לַשּׁוּק." (answer gives the destination) and "… הַשִּׁעוּר? בְּשָׁלוֹשׁ." (answer gives the time); or replace with items such as "… אַתָּה נוֹסֵעַ מָחָר?" (לְאָן) and "… מַתְחִיל הַסֶּרֶט?" (מָתַי).
- Explanation: a sorting item must have one defensible bucket per item; here the key rejects correct, natural Hebrew in 3 of 6 items.
- Severity: Major
- Confidence: High

### מבחן הסיום של A1 ועברית בתוך קוד האפליקציה

#### M-27 · "Mesmo som" for final forms is false for Kaf and Pe
- Location: app/src/lib/engine/generators.ts, exFinalForm explainPt (line 161) and exFinalInWord explainPt (line 1029). Used in every letter lesson with a final form (exercises.ts line 663) and in the alphabet exam part "letras" (exam.ts line 128).
- Original: `explainPt: 'Mesmo som, outro desenho - e quase sempre descendo abaixo da linha.'` and `` `${alvo.pt} termina em ${L.finalForm}. Mesma letra, mesmo som - só o desenho muda no fim da palavra.` ``
- Problem: In the Kaf and Pe lessons the app deliberately shows only the dagesh side (sons.ts soOLadoDoPonto: Kaf = K, Pe = P). The final forms ך and ף are CH [χ] and F, never K and P (data/letters.json variantes: ך = /χ/, ף = /f/; ExtraLessonClient.tsx itself says "ך e ף ... são sempre CH e F"). So in those lessons the feedback tells the learner that ך sounds like כּ (k) and ף like פּ (p).
- Correct version: for Kaf/Pe: "Outro desenho, e no fim da palavra o som é sempre o suave: ך = CH, ף = F." Keep "mesmo som" only for מ/ם, נ/ן, צ/ץ.
- Explanation: Final kaf and final pe correspond to the dagesh-less letter; in modern Hebrew a word never ends in a [k] written ך or a [p] written ף.
- Severity: Major
- Confidence: High

#### M-28 · Dagesh quiz explanation wrong for אַבָּא, and "sem daguesh entre vogais" overgeneralized
- Location: app/src/lib/engine/extras.ts buildDageshQuiz, explainPt (lines 143-146); data/extras.json dagesh.letters[bet].hardWords includes `אַבָּא`; dagesh.rulePt.
- Original: `'Com daguesh: no começo da palavra ou depois de consoante.'` / `'Sem daguesh: entre vogais, ou no fim da palavra.'`; rulePt `"Ele aparece no começo da palavra e depois de consoante; some entre vogais e quase sempre no fim."`
- Problem: For the hard word אַבָּא the generated explanation says the dagesh is there because the letter is at the start or after a consonant, but בּ in אַבָּא is between two vowels (dagesh chazak). The learner is told a rule that the very example breaks. The soft-word line "Sem daguesh: entre vogais" is stated as a rule with no "quase", although many core words have בּ/כּ/פּ between vowels (אַבָּא, סַבָּא, תַּפּוּחַ, כִּפָּה, צִפּוֹר). posicao-do-ponto.ts already knows this ("as que a regra erra porque o ponto dobra a consoante depois de vogal (אַבָּא) vão para um quadro à parte").
- Correct version: either drop אַבָּא from hardWords for this quiz, or generate a per-word explanation: "Com daguesh. Aqui ele aparece depois de vogal: é o ponto que 'dobra' a letra, e acontece em palavras como אַבָּא, סַבָּא." And "Sem daguesh: quase sempre entre vogais e no fim."
- Explanation: dagesh kal (start of word, after shva nach) vs dagesh chazak (gemination, after a vowel) is the exact distinction this explanation erases.
- Severity: Major
- Confidence: High

#### M-29 · Reading rule "depois de consoante sem vogal (com shevá): com o ponto" ignores shva na
- Location: app/src/lib/engine/posicao-do-ponto.ts POSICAO_PT and header rule (lines 8-10, 41-45); app/src/app/extra/[slug]/ExtraLessonClient.tsx "Onde o ponto aparece", label `{POSICAO_PT[pos]} · ... 'com o ponto: B, K, P'`; data/extras.json dagesh.rulePt.
- Original: `'depois-de-consoante': 'depois de consoante sem vogal (com shevá)'` with the label `com o ponto: B, K, P`
- Problem: The rule is presented for reading unpointed text, but after a vocal shva (shva na, typically under the first letter of the word or a prefix) ב/כ/פ are soft: בְּבַקָּשָׁה (bevakashá, a word the course teaches from the start), כְּבָר (kvar), שְׁבִיל (shvil), לְבַד (levad), מְכוֹנִית (mechonit). In Israeli speech that shva is silent, so the learner sees "consonant without vowel" and will read "bebakasha", "kbar". The code silently drops these words from the exercise (analisar predicts dagesh, real has none, and they go neither to `certas` nor to `excecoes`), so the learner never sees a counterexample. Also not mentioned: word-initial F/V in loanwords (פֶסְטִיבָל, וִידֵאוֹ is ו anyway) where the "start of word = hard" rule fails.
- Correct version: "No começo da palavra e depois de uma consoante que FECHA a sílaba (מִשְׁפָּחָה): com o ponto. Depois de vogal, e também depois de uma letra com shevá no começo da palavra ou de um prefixo (בְּבַקָּשָׁה, כְּבָר): sem o ponto." And route the shva na words into the "quando a regra não basta" box instead of dropping them.
- Explanation: classical dagesh kal rule is "after shva nach", not "after any shva"; the distinction matters precisely for the word-initial shva that Israelis do not pronounce.
- Severity: Major
- Confidence: High

#### M-30 · No automatic plene (ktiv male) variants in the answer checker on this branch
- Location: app/src/lib/a1-prova.ts `soLetras` / `digitadoCerto` (lines 126-132, used by worker/src/api/exame-a1.js for the final exam); app/src/lib/engine/palavras.ts `hebraicoDigitadoCerto` (line 373, used by A1Player `Digitar` via TypeHebrew and re-exported in a1.ts line 309); tools/export-content.mjs (A1 export, lines 690-726).
- Original: `return d.length > 0 && aceitas.some(a => soLetras(a) === d);`
- Problem: Both checkers strip niqqud, spaces, punctuation and final-letter distinction and then demand the exact letter sequence of one accepted answer. Nothing in app/src, worker/src or tools generates plene variants (no "plena/cheia/male" variant code exists; the only ו/י tolerance is in lib/fala.ts, for speech recognition). The audit brief assumes that variants are generated, so an accepted answer written only in defective spelling (e.g. from menukad source "לִלְמֹד" → "ללמד") WILL reject the normal plene typing "ללמוד". For exame.json all `respostas` are already plene, and the author added variants by hand (איתי/אתי, לאכול/לאכל, שתיים/שתים), which confirms the variants are manual. Other auditors should treat a defective-only accepted answer in data/a1/unidades as a real bug.
- Correct version: either generate ktiv male variants at export or check time, or audit every `respostas`/`aceitas` list to contain the Academy plene spelling.
- Explanation: Brazilian learners on a phone keyboard type ktiv male; rejecting it penalizes the correct modern spelling.
- Severity: Major
- Confidence: High (for the code in this checkout; if variant generation lives elsewhere, it is not in these files)

#### M-31 · Exam writing items reject natural correct answers
- Location: data/a1/exame.json, partes[escrita].itens[0], [1], [3], [5]
- Original: `"pt": "Eu sou do Brasil", "respostas": ["אני מברזיל"]`; `"pt": "Eu tenho um irmão", "respostas": ["יש לי אח"]`; `"pt": "Quanto custa?", "respostas": ["כמה זה עולה"]`; `"pt": "São duas horas", "respostas": ["השעה שתיים", "השעה שתים"]`
- Problem: Matching is exact (see previous finding), so these perfectly correct answers are marked wrong: "אני בא מברזיל" / "אני באה מברזיל" (very common, taught in many A1 courses); "יש לי אח אחד"; "כמה עולה?" / "כמה זה?" (both everyday Israeli); "עכשיו שתיים", "שתיים". Each exam draws only 4 items per part, so one wrongly rejected item is 25% of the part.
- Correct version: add `"אני בא מברזיל", "אני באה מברזיל"`; `"יש לי אח אחד"`; `"כמה עולה", "כמה זה"`; `"עכשיו שתיים", "השעה עכשיו שתיים", "שתיים"`.
- Explanation: an exam must accept every natural correct rendering the course could have produced; the gender of the learner is also known (genero), so both בא/באה forms are needed.
- Severity: Major
- Confidence: Medium (the exact set the course taught for "sou do Brasil" should be checked against units 1 and 2)

## 🟡 MINOR (112)

### קורס האלפבית · האותיות 1 עד 11 (data/letters.json)

#### m-01 · אֶמֶת transliterated "emet" without stress mark (should be "émet")
- Location: letters.json, tav, wordsToRead[0].translit (same in translit.json words)
- Original: "he": "אֶמֶת", "translit": "emet"
- Problem: אֶמֶת is a segolate, stressed on the first syllable [ˈemet]. The course's declared rule (translit.json notes: "boker -> bóker (paroxitona terminada em consoante)") requires "émet", as it does for "érets", "délet", "yéled", "shémesh". Without the accent a Brazilian will stress the last syllable.
- Correct version: "translit": "émet"
- Explanation: Inconsistent with the course's own convention and leads to wrong stress.
- Severity: Minor
- Confidence: High

#### m-02 · אֲגַם "agam" will be read with penultimate stress by a Brazilian
- Location: letters.json, gimel, wordsToRead[3].translit
- Original: "translit": "agam"
- Problem: Portuguese words ending in -am are paroxytone ("falam", "andam"), so "agam" is read "Á-gam" (and nasal). Hebrew is agám. The course's own accent rule ("escreva de modo que um brasileiro lendo em voz alta pelas regras do portugues caia na silaba certa") requires an accent here.
- Correct version: "agám"
- Explanation: Application of the course's declared stress rule.
- Severity: Minor
- Confidence: High

#### m-03 · מָה transliterated "má" in one place and "ma" in others
- Location: letters.json, he, ensino.dicaLeitura.exemplos[0].translitPt vs he wordsToRead[0].translit and mem wordsToRecognize[1].translit
- Original: "translitPt": "má" / "translit": "ma"
- Problem: Inconsistent; translit.json gives "ma". Similarly the shin checagem option "\"shemesh\"" vs word list "shémesh", lamed brazilianMistake "shéu" vs checagem "sheu", mem ensino "ima" vs list "imá".
- Correct version: one form per word across the file ("ma", "shémesh").
- Explanation: Consistency.
- Severity: Minor
- Confidence: High

#### m-04 · Alef: "{{אָלֶף}} virou alpha em grego"
- Location: letters.json, alef, didYouKnow
- Original: "É a primeira letra e a origem de tudo: {{אָלֶף}} virou alpha em grego, e alpha mais beta deram \"alfabeto\"."
- Problem: The Greeks borrowed the Phoenician letter ʾalp, not the Hebrew one; Hebrew and Greek scripts are sister descendants of the Phoenician/Canaanite alphabet. "a origem de tudo" is also overstated.
- Correct version: "O nome é o mesmo da letra fenícia que os gregos adotaram como alpha - prima do nosso {{א}}. Alpha mais beta deram \"alfabeto\"."
- Explanation: Brief item 6 (letter origins).
- Severity: Minor
- Confidence: High

#### m-05 · Mem: speculative explanation for the final form ם
- Location: letters.json, mem, ensino.detalhePt
- Original: "só a forma muda, e muda por um motivo simples: a forma arredondada com a perna aberta foi ficando difícil de escrever no fim de uma palavra, e com o tempo a escrita à mão criou uma versão fechada para essa posição."
- Problem: Presented as a simple, known cause. The development of final forms in the Aramaic/Jewish script is usually described the other way round for most letters (the word-final form keeps the older shape with a long stroke, while the medial form developed a ligature stroke toward the next letter); for mem the details are debated. "difícil de escrever no fim" is not an established explanation.
- Correct version: "a forma final nasceu da escrita à mão, ao longo de séculos: no meio da palavra a letra se ligava à seguinte, no fim ela se fechava." or simply drop the cause.
- Explanation: Unverifiable historical claim stated as fact.
- Severity: Minor
- Confidence: Medium

#### m-06 · Tav: "Shabes" given as the Ashkenazi tradition form
- Location: letters.json, tav, ensino.detalhePt
- Original: "é por isso que a mesma palavra aparece como \"Shabat\" na pronúncia israelense e \"Shabes\" na tradição asquenazita."
- Problem: "Shabes" is the Yiddish form (with vowel reduction). In Ashkenazi Hebrew pronunciation (prayer, reading) the word is "Shabbos". Both show ת > s, so the point stands, but the label is imprecise.
- Correct version: "\"Shabat\" na pronúncia israelense e \"Shabbos\" na pronúncia asquenazita tradicional (\"Shabes\" em ídiche)."
- Explanation: Factual precision.
- Severity: Minor
- Confidence: High

#### m-07 · Tav contrast: direction of the foot
- Location: letters.json, tav, contrastes.ח
- Original: "O ת tem o pé esquerdo virado para dentro, como um ganchinho."
- Problem: In standard print (and in the he page's own wording "perna esquerda com pé virado"), the small foot at the bottom of the left leg of ת points outward, to the left, not inward.
- Correct version: "O ת tem um pezinho no fim da perna esquerda, virado para fora (para a esquerda)."
- Explanation: Visual description should match the glyph.
- Severity: Minor
- Confidence: Medium

#### m-08 · Dalet contrast calls the top-right overhang a "pezinho"
- Location: letters.json, dalet, contrastes.ר
- Original: "O ד tem um canto vivo no alto e um pezinho que avança para a direita."
- Problem: The distinguishing feature of ד is that the top stroke projects slightly to the right past the vertical leg (as dalet detalhePt and resh detalhePt correctly say: "um pedacinho do traço de cima ultrapassando a perna à direita"). "pezinho" (little foot) suggests something at the bottom. Contradicts the other two descriptions.
- Correct version: "O ד tem um canto vivo no alto, e o traço de cima passa um pouquinho da perna, para a direita. O ר é uma curva só."
- Explanation: Internal consistency of the key ד/ר contrast.
- Severity: Minor
- Confidence: High

#### m-09 · Dalet brazilianMistake: "djodá" is not a Brazilian error
- Location: letters.json, dalet, brazilianMistake.why
- Original: "Em hebraico o {{ד}} nunca muda: {{דּוֹדָה}} é \"dodá\", não \"djodá\"."
- Problem: Brazilian palatalization of D happens only before [i] (including final unstressed -e read as [i]), never before O. Nobody says "djodá". The example undercuts the explanation just before it.
- Correct version: drop the dodá clause, or replace it with a context where D precedes i: "{{דִּי}} é \"di\", não \"dji\"" (already in the box).
- Explanation: Example should illustrate the actual trap.
- Severity: Minor
- Confidence: High

#### m-10 · Gimel "vem de גָּמָל, camelo, e a forma antiga desenhava o pescoço do animal"
- Location: letters.json, gimel, didYouKnow
- Original: "{{גִּימֶל}} vem de {{גָּמָל}}, camelo, e a forma antiga desenhava o pescoço do animal."
- Problem: The gimel/gamal link is a traditional and popular explanation, but the origin is debated (many scholars see the early glyph as a throwing stick or a hook; "camel's neck" is speculative). Presented as fact.
- Correct version: "Uma explicação tradicional liga {{גִּימֶל}} a {{גָּמָל}}, camelo. ..." The dreidel part ("gantz", leve tudo) is correct.
- Explanation: Brief item 6.
- Severity: Minor
- Confidence: Medium

#### m-11 · גַּן glossed "jardim, creche" in one list and "jardim · jardim de infância" in the other
- Location: letters.json, gimel, wordsToRecognize[1].pt vs wordsToRead[1].pt
- Original: "pt": "jardim, creche" / "pt": "jardim · jardim de infância"
- Problem: Inconsistent, and "creche" in Brazil is daycare for babies/toddlers (in Hebrew מעון / פעוטון). גַּן (gan yeladim) is the 3 to 6 preschool, "jardim de infância / pré-escola".
- Correct version: "jardim · jardim de infância" in both.
- Explanation: Translation accuracy and consistency.
- Severity: Minor
- Confidence: High

#### m-12 · תָּא glossed "caixa postal"
- Location: letters.json, tav, wordsToRead[1].pt
- Original: "pt": "compartimento · caixa postal"
- Problem: תָּא alone is cell / compartment / booth / cabin. "Caixa postal" is תָּא דֹּאַר (or תָּא קוֹלִי for voicemail). Alone, "caixa postal" is not a meaning of the word.
- Correct version: "cabine, compartimento" (or "célula").
- Explanation: Translation accuracy.
- Severity: Minor
- Confidence: High

#### m-13 · Listed "confusableWith" letters without a matching contrast text
- Location: letters.json: tav confusableWith ["ח","ה"] but contrastes only ח; nun confusableWith ["ג","ו"] but contrastes only ן and ג; yod confusableWith ["ו","ן"] but contrastes only ן; gimel confusableWith ["נ","ז"] but contrastes only ז
- Original: e.g. tav "confusableWith": ["ח","ה"], "contrastes": {"ח": "..."}
- Problem: If the UI shows contrast cards from confusableWith, ת/ה, נ/ו, י/ו and ג/נ have no explanation on that page (ת/ה is covered from the he page, ג/נ from the nun page, but נ/ו and י/ו nowhere in this slice; ו comes in lesson 8).
- Correct version: add the missing contrast texts, e.g. yod "ו": "O י é curto, só um traço no alto. O ו desce até a linha de baixo."
- Explanation: Completeness/consistency of the data.
- Severity: Minor
- Confidence: Medium (depends on how the UI uses these fields)

#### m-14 · Alef letter-level "translit": "a"
- Location: letters.json, alef, field translit
- Original: "translit": "a", "sound": "(mudo)"
- Problem: The page insists "{{א}} não é a vogal A", and translit.json maps א to "". A letter-level translit "a" restates the exact misconception the lesson fights. I found no direct UI use of letter.translit in app/src (only somPt(letter.sound)), so impact may be low.
- Correct version: "translit": "" (or "-").
- Explanation: Data consistency with the course's own rules.
- Severity: Minor
- Confidence: Medium

#### m-15 · Resh: tongue-tip R "vai soar estrangeiro"; "R retroflexo ... porrrta"
- Location: letters.json, resh, ensino.paraBrasileiroPt, brazilianMistake.wrong and why, checagem[2]
- Original: "Quem fala com R de ponta de língua (o R caipira ou o R batido de \"caro\") também vai soar estrangeiro." / "ou o R retroflexo do interior, \"porrrta\"" / "o R de ponta de língua soa estrangeiro."
- Problem: Teaching the uvular R as the target is right. But an alveolar trill/tap is a native Israeli variant (older Mizrahi speakers, many Arabic-speaking citizens, and it was the prescribed norm in the early revival); it is perfectly intelligible and never confused with another phoneme, unlike the carioca [χ/h], which really does merge with ח. Putting both "errors" on the same level overstates the second. Also "porrrta" (triple r) suggests a rolled R, while the caipira R is a retroflex approximant, not a trill. Related: checagem[2] marks "\"har\", com R de ponta de língua" as wrong, which is a pronunciation choice, not a different word.
- Correct version: "O R de ponta de língua é entendido (alguns israelenses falam assim), mas o padrão de hoje é o R do fundo da boca. O que você precisa evitar de verdade é o R carioca soprado, porque ele é o som de outra letra." Write the caipira example without "rrr" (e.g. "o R do interior paulista, de \"porta\"").
- Explanation: Distinguish real error (merger with ח) from accent.
- Severity: Minor
- Confidence: Medium

### קורס האלפבית · האותיות 12 עד 22 (data/letters.json)

#### m-16 · Kaf contrast says ר has a straight upper corner; the course itself (dalet entry) says ר has no corner
- Location: data/letters.json, kaf (order 21), contrastes["ר"]
- Original: `"O כ é curvo no alto e na base. O ר tem o canto do alto reto."`
- Problem: ר is the letter with the ROUNDED top corner (that is how it differs from ד). The dalet entry says exactly that: `"O ר é uma curva só, sem canto e sem pé."` The real difference between כ and ר is the base: כ has one, ר does not.
- Correct version: "O כ tem base: a curva fecha embaixo e volta. O ר não tem base: é só o teto curvo e uma perna que desce."
- Severity: Minor
- Confidence: High

#### m-17 · Vav contrast: נ's foot goes to the left, not to the right
- Location: data/letters.json, vav (order 12), contrastes["נ"]
- Original: `"O ו é um traço reto de cima a baixo. O נ dobra no pé e sai para a direita."`
- Problem: In נ the vertical stroke is on the right and the base runs leftwards from it (like a narrow ב without the bet's tail). "Sai para a direita" points the learner the wrong way.
- Correct version: "O נ dobra no pé e a base corre para a esquerda."
- Severity: Minor
- Confidence: Medium

#### m-18 · Vav contrasts contradict each other on whether ו has a head
- Location: data/letters.json, vav contrastes["ז"] vs zayin ensino.detalhePt and checagem[0].porque
- Original (vav): `"O ו é um traço limpo, sem chapéu."`; (zayin): `"o {{ו}} tem um ganchinho que vira só para a esquerda"`
- Problem: Two descriptions of the same shape disagree. The zayin version is the accurate one (ו has a small head pointing left; ז's head projects on both sides).
- Correct version (vav): "O ז tem um chapéu que passa dos dois lados do traço. O ו tem só um ganchinho virado para a esquerda."
- Severity: Minor
- Confidence: High

#### m-19 · Het contrast: the foot of ת turns outward (left), not inward
- Location: data/letters.json, het (order 14), contrastes["ת"] (same wording in tav entry, outside this slice)
- Original: `"O ח é fechado em cima e tem as duas pernas retas. O ת tem o pé esquerdo virado para dentro."`
- Problem: In standard square type the left leg of ת ends in a small foot that projects to the LEFT, away from the letter. "Para dentro" describes the opposite.
- Correct version: "O ת tem um pezinho no fim da perna esquerda, virado para fora (para a esquerda)."
- Severity: Minor
- Confidence: Medium

#### m-20 · Het: "Você já lê as duas palavras" of בֵּית לֶחֶם, but ב comes in lesson 14
- Location: data/letters.json, het (order 14), didYouKnow
- Original: `"Belém, a cidade, é {{בֵּית לֶחֶם}} - \"casa do pão\". Você já lê as duas palavras, ..."`
- Problem: Het is lesson 9; בּ is taught in lesson 14. The learner can read לֶחֶם but not בֵּית yet.
- Correct version: "Você já lê {{לֶחֶם}}; a outra palavra chega com o {{ב}}, no módulo 5."
- Severity: Minor
- Confidence: High

#### m-21 · Samekh brazilianMistake: "right" examples do not match the "wrong" example
- Location: data/letters.json, samekh (order 16), brazilianMistake
- Original: `"wrong": "Sonorizar o S entre vogais: ler {{חָסָה}} (alface) como \"chazá\".", "right": "Manter o S surdo sempre: \"saba\", \"savta\"."`
- Problem: "saba" and "savta" have the S at the start of the word, where no Brazilian voices it; they do not illustrate intervocalic S. Also סַבָּא/סָבְתָא need ב, not yet taught (lesson 11 vs 14). The correct reading of the actual example is not given.
- Correct version: `"right": "Manter o S surdo: {{חָסָה}} é \"chassá\", como em \"assa\"; {{כִּסֵּא}} é \"kissé\"."`
- Severity: Minor
- Confidence: High

#### m-22 · Samekh: ם was taught in lesson 1, not "na segunda lição"
- Location: data/letters.json, samekh (order 16), ensino.detalhePt
- Original: `"o {{ם}} que você aprendeu na segunda lição é quadrado."`
- Problem: mem and its final ם are in lesson 1 (modules.json mod1 lesson 1: alef, mem, tav). Mem is the second LETTER, not the second lesson.
- Correct version: "o {{ם}} que você aprendeu na primeira lição" (or "junto com o {{מ}}").
- Severity: Minor
- Confidence: High

#### m-23 · Tsadi wordsToRecognize contains a word with no צ
- Location: data/letters.json, tsadi (order 18), wordsToRecognize[1]
- Original: `{"he": "בְּבַקָּשָׁה", "translit": "bevakashá", "pt": "por favor", "use": "Fórmula de cortesia"}`
- Problem: בְּבַקָּשָׁה has no tsadi (it belongs to qof, where it also appears). In the tsadi lesson it practises nothing and adds two unknown letters (ב).
- Correct version: Replace with a tsadi word, e.g. `{"he": "צָרִיךְ", "translit": "tsarich", "pt": "precisa", ...}` (already used in brazilianMistake) or `{"he": "רוֹצָה", "translit": "rotsá", "pt": "(ela) quer"}`.
- Severity: Minor
- Confidence: High

#### m-24 · Kaf didYouKnow says מֶלֶךְ "fica para a próxima", but it is in this lesson's wordsToRead
- Location: data/letters.json, kaf (order 21), didYouKnow vs wordsToRead[3]
- Original: `"E {{מֶלֶךְ}}, \"rei\", que apareceu lá na primeira lição, fica para a próxima: ele termina com a forma final, que é o outro som desta letra."` and wordsToRead `{"he": "מֶלֶךְ", "translit": "mélech", "pt": "rei", "som": "chaf"}`
- Problem: Self-contradiction. Same lesson also lists אֹכֶל, דֶּרֶךְ, לָלֶכֶת (chaf) although the text repeatedly says the chaf sound is "a próxima lição". Bet and pe have the same pattern (טוֹב, לֵב in bet; סֵפֶר, יָפֶה, כֶּסֶף, סוֹף in pe, 5 of 8 words). If the UI separates "som" items, fine, but the didYouKnow sentence is still wrong.
- Correct version: Either drop מֶלֶךְ from this lesson's wordsToRead, or change the didYouKnow to "e {{מֶלֶךְ}}, \"rei\", ... você já consegue ler: o {{ך}} do fim é sempre raspado, e ele é o assunto da próxima lição."
- Severity: Minor
- Confidence: High

#### m-25 · Transliterations ending in "-am" break the course's own stress rule
- Location: data/letters.json, vav wordsToRecognize[0] `"vegam"`; ayin wordsToRead[3] `"olam"` (also translit.json)
- Original: `"translit": "vegam"`, `"translit": "olam"`
- Problem: translit.json says to accent so that a Brazilian reading by Portuguese rules hits the right syllable. In Portuguese, words ending in -am are paroxytone with a nasal diphthong ("falam", "cantam"), so "vegam" is read VÉ-gãw and "olam" Ó-lãw. Israeli stress is ve-GAM, o-LAM. (-om/-on/-ol endings like "shalom", "makom", "gadol" are fine.)
- Correct version: "vegám", "olám" (or hyphenate "ve-gam").
- Severity: Minor
- Confidence: Medium

#### m-26 · "naim" will be read with a nasal vowel
- Location: data/letters.json, ayin (order 17), wordsToRead[4]
- Original: `{"he": "נָעִים", "translit": "naim", "pt": "agradável"}`
- Problem: A Brazilian reads "naim" like "Caim": na-ĩ, with a nasalised final vowel (and may run it into one syllable). Hebrew is [naˈim], two clear vowels and an oral i before a real m. Same issue, weaker, for "meat" (מְעַט), which also looks like the English word "meat".
- Correct version: "na-ím" / "me-át" (a hyphen or apostrophe "na'ím", "me'át" marking the place of ע would also teach that ע splits the vowels).
- Severity: Minor
- Confidence: Medium

#### m-27 · פִּתָּה as "pitá"; everyday Israeli stress is "píta"
- Location: data/letters.json, pe (order 22), wordsToRead[7]
- Original: `{"he": "פִּתָּה", "translit": "pitá", "pt": "pão sírio"}`
- Problem: Normative stress is final, but in everyday speech Israelis say PÍta. The course elsewhere follows colloquial stress ("láma", "ótobus", "télefon"), so "pitá" is inconsistent with its own choice.
- Correct version: "píta" (optionally note that the dictionary form is "pitá").
- Severity: Minor
- Confidence: Medium

#### m-28 · Zayin: "paiz" is not a Portuguese word
- Location: data/letters.json, zayin (order 13), ensino.paraBrasileiroPt
- Original: `"dizemos \"paiz\" como \"pais\", \"luz\" como \"lus\""`
- Problem: "paiz" does not exist (the word is "país", with s). The example confuses the point. The brazilianMistake box uses better examples ("paz", "luz", "rapaz").
- Correct version: "dizemos \"paz\" como \"pas\" (ou \"pash\"), \"luz\" como \"lus\"".
- Severity: Minor
- Confidence: High

#### m-29 · Vav: two different "wrong" readings of שָׁלוֹם
- Location: data/letters.json, vav (order 12), brazilianMistake.wrong vs ensino.checagem[1].porque
- Original: `"dizer \"shalvm\""` vs `"Por isso a palavra se lê \"shalom\", e não \"shalvom\"."`
- Problem: Inconsistent; "shalvm" is unpronounceable and not what a learner would say.
- Correct version: use "shalvom" in both.
- Severity: Minor
- Confidence: High

#### m-30 · Syllable rows ווֹ / ווּ: the ptApprox explains spelling, not sound, and calls a pointed form "sem nikud"
- Location: data/letters.json, vav (order 12), syllables[3], syllables[4]
- Original: `{"vowel": "o", "he": "ווֹ", "translit": "vo", "ptApprox": "com dois vav, como se escreve sem nikud: um consoante, um vogal"}`
- Problem: Every other row's ptApprox gives a pronunciation hint; these two give a spelling note, and say "como se escreve sem nikud" about a form that has nikud. It is a reasonable compromise (ktiv male style double vav), but the learner is left without the sound hint and with a confusing statement.
- Correct version: `"ptApprox": "V + O, como em \"vovó\". Escreve-se com dois vav: o primeiro é a consoante V, o segundo é a vogal."` (and "V + U, como em \"vulto\"..." for ווּ).
- Severity: Minor
- Confidence: Medium

### קורס האלפבית · ניקוד, תעתיק, מודולים וטקסטים

#### m-31 · Stress accents applied inconsistently, and some words lack a needed accent
- Location: textos.json and sentences.json throughout; translit.json words
- Original: "Dani" (textos, many lines), "atá bair?" (textos modulo 6 revisão), "naim" (translit.json) vs "naím" (textos modulo 4 revisão), "meat" (translit.json) vs "meát" (textos), "haotobus" (textos modulo 5 revisão) vs "ótobus" (translit.json), "loméd" (sentences) vs "medaber", "omer", "chaver" (unaccented), "tsadi" (modules.json mod4 title)
- Problem: By the declared rule (Portuguese reading rules), "Dani" and "tsadi" end in i and will be read with final stress (da-NÍ, tsa-DÍ), but Israelis say DÁ-ni and TSÁ-di. "bair" reads as one syllable [bajɾ] instead of ba-ÍR. "haotobus" reads ha-o-to-BÚS. "naim"/"naím" and "meat"/"meát" are the same words spelled two ways. "loméd" carries an accent the rule does not need (compare "medaber").
- Correct version: "Dáni", "tsádi", "baír", "naím", "meát", "haótobus"; drop the redundant accent in "loméd" (or accept it as harmless and use it consistently).
- Explanation: Consistency matters because the grader strips accents, so the accents only exist to teach stress.
- Severity: Minor
- Confidence: High

#### m-32 · Hyphenation of prefixes is inconsistent between files
- Location: sentences.json ("ha-yam", "ve-Sará", "mi-Yisraél", "ha-shaá") vs textos.json ("hahar", "bagan", "hakélev", "veYonatan", "leDani", "beTchile", "vegam")
- Original: "ha-yam gadol" / "aní al hahar."
- Problem: The same prefixes are written with a hyphen in one file and without one in another, and with internal capitals ("veYonatan") in a third style.
- Correct version: Pick one style. Hyphenating the prefixes (ha-, ve-, be-, le-, mi-) helps a beginner see that they are separate morphemes.
- Explanation: Consistency.
- Severity: Minor
- Confidence: High

#### m-33 · Same name spelled נוֹעָה and נֹעָה in the same module
- Location: textos.json modulo 4 "Uma mensagem da montanha" (linhas, novas: "נוֹעָה") vs modulo 4 revisão "Meio-dia na cidade" (linhas 3 and 6, novas: "נֹעָה")
- Original: "הַי נוֹעָה, מָה נִשְׁמָע?" / "אֲנִי נֹעָה."
- Problem: Both are valid pointings, but the name is always written נועה unpointed, and the course switches spellings within one module.
- Correct version: "נוֹעָה" in both texts.
- Explanation: Consistency; the cholam male form also matches the unpointed spelling.
- Severity: Minor
- Confidence: High

#### m-34 · "Eretz" presented as the opening of the country's name
- Location: modules.json, mod4, milestonePt
- Original: "No fim deste módulo você lê {{אֶרֶץ}} - \"terra\", \"país\" - a palavra que abre o nome do jornal e o do país."
- Problem: The newspaper is "הארץ" (Haaretz, "the land"), so the name begins with הָ, not with ארץ. The state's official name is מְדִינַת יִשְׂרָאֵל; אֶרֶץ יִשְׂרָאֵל is the Land of Israel (geographical/historical), not the country's name.
- Correct version: "...a palavra que está no nome do jornal {{הָאָרֶץ}} e na expressão {{אֶרֶץ יִשְׂרָאֵל}}, a Terra de Israel."
- Explanation: Imprecise fact.
- Severity: Minor
- Confidence: Medium

#### m-35 · "Chag sameach" for any Jewish holiday
- Location: sentences.json, "chag-sameach", notePt
- Original: "\"Festa alegre\". Serve para qualquer feriado judaico, como o nosso \"boas festas\"."
- Problem: It is not used for Yom Kippur (the greeting is גְּמַר חֲתִימָה טוֹבָה or צוֹם קַל), Tisha B'Av, or Yom HaShoah/Yom HaZikaron. For Rosh Hashana the usual greeting is שָׁנָה טוֹבָה.
- Correct version: "Serve para as festas alegres do calendário (Pessach, Sucot, Shavuot, Chanucá...). Em dias de jejum ou luto não se diz."
- Explanation: Overgeneralization that could cause an embarrassing mistake.
- Severity: Minor
- Confidence: High

#### m-36 · "רַק מְעַט" is literary; Israelis say "רַק קְצָת"
- Location: textos.json, modulo 4 revisão, linha 4
- Original: "רַק מְעַט, תּוֹדָה. אֲנִי רוֹצֶה מָקוֹם שֶׁקֶט."
- Problem: מְעַט is formal or written Hebrew. In conversation, "only a little" is "רק קצת", and קְצָת was already taught in the other module 4 text.
- Correct version: "רַק קְצָת, תּוֹדָה."
- Explanation: Naturalness. "אֲנִי רוֹצֶה מָקוֹם שֶׁקֶט" is acceptable, although "אֲנִי מְחַפֵּשׂ מָקוֹם שֶׁקֶט" would match the question "O que o Dani procura?" better.
- Severity: Minor
- Confidence: High

#### m-37 · Apostrophe in "le'at" is not part of the declared convention
- Location: sentences.json, "leat" (translit and words[0].translit)
- Original: "translit": "le'at"
- Problem: translit.json says alef and ayin get no letter. Elsewhere hiatus is unmarked ("meat"/"meát", "naim", "beod", "shaá"). The note also says the word is written on traffic signs. The usual road sign is "האט" ("slow down"); I am not aware of "לאט" as a standard sign.
- Correct version: "leát" (the accent also breaks the hiatus); rephrase the note to "Você vai ouvir isto o tempo todo" unless the sign claim can be sourced.
- Explanation: Consistency; the factual claim is doubtful.
- Severity: Minor
- Confidence: Low (for the sign claim), High (for the apostrophe inconsistency)

#### m-38 · Story inconsistencies in the module 7 texts
- Location: textos.json modulo 7 "No hotel" perguntas[2].porque; modulo 7 revisão introPt
- Original: "{{אֵין לִי!}}: não tenho - e ela vai comprar lá." / "A Maya vai viajar, e o Dani quer saber o que vai na mochila."
- Problem: She says "אֲנִי קוֹנָה פֹּה" (aqui), so "lá" contradicts the Hebrew. In the revisão, Maya is already in Chile ("הַיּוֹם אֲנִי בְּצ׳ילה"), not about to travel, and the item "A Maya levou um guarda-chuva" assumes she has already gone.
- Correct version: "...e ela vai comprar aí, no lugar." / "A Maya está viajando, e o Dani quer saber o que ela levou na mochila."
- Explanation: Wording.
- Severity: Minor
- Confidence: High

#### m-39 · "ואוצ׳ר" uses a W sound the course never teaches, with a less common spelling
- Location: missoes.json, modulo 7, passos[1]
- Original: "he": "ואוצ׳ר"
- Problem: The module teaches צ׳ ג׳ ז׳. The initial W of "voucher" is not taught, and in practice it is usually written with a double vav (וואוצ׳ר). Israelis also often use the Hebrew word שׁוֹבֵר. A learner reading by course rules gets "vaucher" at best.
- Correct version: Replace it with a word that uses only the taught sounds, e.g. "צ׳ק-אין" (already used in textos modulo 7), or "צ׳יפס", "סנדוויץ׳".
- Explanation: The item tests something outside what was taught.
- Severity: Minor
- Confidence: Medium

#### m-40 · ז׳סטה: usual meaning and spelling
- Location: missoes.json modulo 7 passos[3].erradas; imagens-vocabulario.json "ז׳סטה"
- Original: "ז׳סטה" | "gesto" | "Uma mão fazendo um gesto de \"ok\"."
- Problem: In Israeli Hebrew, ג׳סטה/ז׳סטה means a goodwill gesture (a nice act, "איזו ג׳סטה יפה"), not a hand movement (that is תְּנוּעַת יָד). It is commonly written ג׳סטה and pronounced with [dʒ]. As the example of ז׳ = [ʒ], it is a shaky choice.
- Correct version: Use a clear ז׳ word: ז׳קט, מסאז׳, בז׳ (already in the list), or ז׳ורנליסט. If you keep it, gloss it as "gentileza, gesto de boa vontade".
- Explanation: Meaning and image mismatch; doubtful model of the sound.
- Severity: Minor
- Confidence: Medium

#### m-41 · סְטוּדֶנְט (masculine) illustrated and described as a woman
- Location: imagens-vocabulario.json, "סְטוּדֶנְט"
- Original: "pt": "estudante", "imageAlt": "Uma estudante jovem de mochila, com livros nos braços."
- Problem: סְטוּדֶנְט is masculine; a female student is סְטוּדֶנְטִית. The prompt says "a young adult student", but the alt text (and presumably the image) shows a woman.
- Correct version: A male student in the image and alt text, or gloss "estudante (homem)".
- Explanation: Grammatical gender taught by the image contradicts the word.
- Severity: Minor
- Confidence: High

#### m-42 · Matres lectionis description: ה is not used inside the word
- Location: nikud.json, intro.correction
- Original: "Quatro delas - {{א}}, {{ה}}, {{ו}} e {{י}} - também funcionam como apoio de vogal, aparecendo dentro da palavra para indicar um som vocálico."
- Problem: As a vowel letter, ה appears only at the end of a word (מוֹרָה, יָפֶה). Also, in modern ktiv male only ו and י are added inside the word; א is mostly historical spelling, not an added vowel letter.
- Correct version: "...também funcionam como apoio de vogal: {{ו}} e {{י}} no meio da palavra, {{ה}} e {{א}} geralmente no fim."
- Explanation: Precision.
- Severity: Minor
- Confidence: High

#### m-43 · Non-normalized Unicode creates near-duplicate keys in translit.json
- Location: translit.json words, lines 197 to 210 and 294 to 302 ("כְּ", "כִּ", "כֶּ", "כַּ", "פְּ", "פִּ", "פֶּ", "פַּ" appear twice)
- Original: "כְּ": "k" (U+05DB U+05B0 U+05BC) and "כְּ": "k" (U+05DB U+05BC U+05B0)
- Problem: The two keys look identical but use different mark orders (vowel before dagesh vs dagesh before vowel). Any lookup that does not normalize will find one and miss the other. Meanwhile there are no keys at all for soft כ/פ + vowel (כְ, כִ, פִ...).
- Correct version: Normalize all Hebrew strings in the data (canonical order: dagesh U+05BC before the vowel, or NFC consistently) and remove the duplicates; add the soft-letter syllables if the table is meant to be complete.
- Explanation: A data hygiene issue that can silently break matching.
- Severity: Minor
- Confidence: High

### מידע על העברית, היסטוריה ותרבות (כולל extras.json והיסטוריית A1)

#### m-44 · Letters as numbers "em andares de prédio": doubtful example
- Location: data/culture.json, "numeros-com-letras", bodyPt[1]
- Original: "Você vai encontrar letras como números no calendário hebraico, na numeração de capítulos, em andares de prédio e em listas"
- Problem: Israeli elevators and buildings number floors with digits (the letter you do see is ק for קומת קרקע, ground floor, which is an abbreviation, not a numeral). The real everyday case is school grades (כִּתָּה א׳, ב׳...), sections of forms and lists, Hebrew dates.
- Correct version: "...no calendário hebraico, na numeração de capítulos, nas séries da escola (כיתה א׳ é o primeiro ano) e em listas"
- Explanation: Factual accuracy of a culture claim.
- Severity: Minor
- Confidence: Medium

#### m-45 · כֶּסֶף meaning "silver" is not "por acaso"
- Location: data/real-world.json, scene id "cambio-kesef", contextPt
- Original: "Dinheiro - e, por acaso, também é a palavra para prata."
- Problem: It is not a coincidence: the meaning "money" derives from "silver" (silver was the medium of payment, cf. Portuguese "dinheiro" / Spanish "plata"). Saying "por acaso" teaches a false etymological picture.
- Correct version: "Dinheiro - e também prata: o dinheiro de antigamente era prata, e a palavra ficou."
- Severity: Minor
- Confidence: High

#### m-46 · חָדָשׁ cannot describe "apartamento" or "carro" in that form
- Location: data/real-world.json, scene id "casa-nova", contextPt
- Original: "Aparece em anúncio de tudo: apartamento, carro, cardápio. Quer dizer \"novo\"."
- Problem: דִּירָה (apartamento) and מְכוֹנִית (carro) are feminine, so an ad says דִּירָה חֲדָשָׁה / מְכוֹנִית חֲדָשָׁה, not חָדָשׁ. A learner who later sees חדשה will not connect it. Also the scene label "Num anúncio de imóvel" makes the feminine the most likely form.
- Correct version: "Aparece em anúncio de tudo: prédio, carro (רֶכֶב), cardápio. Quer dizer \"novo\"; com palavra feminina, como דִּירָה, vira חֲדָשָׁה." (or keep it simple: "prédio, celular, cardápio")
- Severity: Minor
- Confidence: High

#### m-47 · Final ך is not "always" soft, and the course itself shows the exception
- Location: data/extras.json, dagesh.letters[1] (kaf).notePt; sons id "chaf" introPt, regraPt and checagem[1].porque
- Original: "Na forma final {{ך}} ele é sempre suave." ; "E ele tem forma final, {{ך}}, que é sempre raspada"
- Problem: Final ךּ with dagesh exists (pausal and suffixed forms ending in ־ךָּ), and the course's own bonus readings contain two: וִיחֻנֶּךָּ ("vichunéka", Numbers 6:25) and וְאֶעֱנֶךָּ ("veeenéka", Jeremiah 33:3), both read with K. A learner who believes "sempre" will be confused there.
- Correct version: "Na forma final {{ך}} ele é quase sempre raspado (só em alguns textos bíblicos aparece ךָּ, com ponto, e aí soa K)." In modern Hebrew the statement is effectively true, so "no hebraico de hoje, sempre" also works.
- Severity: Minor
- Confidence: High

#### m-48 · Patach furtivo under ה requires mappiq
- Location: data/bonus.json, guia.secoes id "patach-furtivo", textoPt
- Original: "Quando a palavra termina em {{ח}}, {{ע}} ou {{ה}} com um patach embaixo, o «a» se diz ANTES da letra"
- Problem: A plain final ה is a silent vowel letter and never carries patach furtivo; it happens only with הּ (with mappiq), e.g. גָּבֹהַּ, אֱלוֹהַּ.
- Correct version: "Quando a palavra termina em {{ח}}, {{ע}} ou {{הּ}} (com o ponto dentro) e há um patach embaixo..."
- Severity: Minor
- Confidence: High

#### m-49 · "gerech" spelling makes Brazilians say [ʒ]; inconsistent with "daguesh"
- Location: data/extras.json "gerech".signNamePt and all lessons of tipo "gerech"; also culture.json "sem-maiusculas" bodyPt[2], modules.json, audio.json glosses, textos.json introPt (outside slice, same word)
- Original: "signNamePt": "gerech" ; "ou pelo gerech de ג׳, צ׳ e ז׳"
- Problem: In Portuguese, G before E is [ʒ], so "gerech" is read "jérech". The sign is גֶּרֶשׁ [ˈgeʁeʃ] with hard G. The same course already writes "daguesh" (with GU) for דָּגֵשׁ, so the convention exists and is not applied here.
- Correct version: "guéresh" (matching the course's "sh" for שׁ elsewhere, e.g. "shalom") or at least "guerech". Apply globally.
- Severity: Minor
- Confidence: High

#### m-50 · ואוצ׳ר: unusual spelling of "voucher"
- Location: data/extras.json, gerech.letters[0].words[2] and sons id "tch" palavras[5]
- Original: "ואוצ׳ר" (translit "váutcher")
- Problem: The usual Israeli spelling is וָאוּצֶ׳ר written וואוצ׳ר (or ווצ׳ר), with a doubled ו for the initial [v]/[w] of a foreign word (Academy rules for transcription of foreign words write consonantal ו as וו in unpointed text). With a single ו the bare form looks odd and can be read "ve-..." by a learner taught that initial ו is "e".
- Correct version: "וואוצ׳ר"; or replace with a more common, less ambiguous word, e.g. "צ׳יפס" is already there, "צ׳ופר" (brinde), "קוּצ׳י".
- Severity: Minor
- Confidence: Medium

#### m-51 · Course catalog describes an A1 that no longer matches the A1 course
- Location: data/courses.json, courses[slug "hebraico-a1"].outcomesPt[1] and modules
- Original: "Conjugar verbos no presente nos quatro padrões e reconhecer a raiz de três letras." ; modules "A raiz de três letras", "Presente: Os quatro padrões, um de cada vez", "Sem nikud, de verdade"
- Problem: data/a1/curso.json (approved 06/10/2026) has 11 modules (0 to 10) over 21 units with different titles ("Eu e você", "Minha vida", ... "Consolidação A1"), and no unit uses the framework "quatro padrões" (no occurrence of padrão/binyan/pa'al/pi'el/hif'il in data/a1/unidades). The sales page promises a structure the buyer will not find. Not a Hebrew error but a factual claim about the content.
- Correct version: Regenerate the A1 module list and outcomes from data/a1/curso.json.
- Severity: Minor
- Confidence: Medium

#### m-52 · שֶׁ־ did not originate in Mishnaic Hebrew
- Location: data/a1/historia.json, capitulos n 3, textoPt
- Original: "Dela vêm muitas coisas do hebraico moderno, como o שֶׁ־ (\"que\") e o jeito de usar o presente."
- Problem: שֶׁ־ is already biblical (Song of Songs, Ecclesiastes, Judges 5:7, Psalms 133:2 "שֶׁיֹּרֵד", the verse right after the one in the bonus readings). What is true is that Mishnaic Hebrew made שֶׁ־ the normal relative/complementizer, replacing אֲשֶׁר. The present-tense use of the beinoni is correctly attributed.
- Correct version: "Dela vêm muitas coisas do hebraico moderno, como o uso constante do שֶׁ־ (\"que\") no lugar do bíblico אֲשֶׁר, e o jeito de usar o presente."
- Severity: Minor
- Confidence: High

#### m-53 · Final forms: "a forma estranha é a original" does not hold for all five, and an unreviewed source note
- Location: data/culture.json, card id "por-que-finais", leadPt, bodyPt[2], sources
- Original: "As formas finais não foram inventadas. Elas são as formas antigas." ; "Ou seja: a forma \"estranha\" é a original, e a comum é a abreviada." ; sources: "Explicação paleográfica corrente para as formas finais; conferir formulação antes de publicar."
- Problem: The explanation fits ך ן ף ץ (long downstroke kept at word end, bent in medial position in Aramaic cursive). It fits ם poorly: the closed final mem is itself a later development, not the older shape. Also Paleo-Hebrew had no final forms at all, so "formas antigas" means "older Aramaic-script shapes", not "the ancient Hebrew letters". The sources field still says "conferir formulação antes de publicar" although reviewStatus says reviewed; if the field is rendered, readers see an internal to-do.
- Correct version: lead: "Quatro das cinco formas finais guardam o traço mais antigo da letra." Body: "...ך, ן, ף e ץ guardam a perna longa que a letra tinha; no meio da palavra ela foi encurtada para emendar na próxima. O ם fechado tem uma história um pouco diferente." Remove the to-do from sources.
- Severity: Minor
- Confidence: Medium

#### m-54 · Transliteration slips in the bonus readings
- Location: data/bonus.json, leituras "rute-1" linhas[2].translit; "isaias-9" linhas[2].translit
- Original: "améch amí, velohá'yich Elohái" ; "péle yoéts, El guibór, Avíad, sar-shalom"
- Problem: (1) The apostrophe in "velohá'yich" is not used anywhere else in the readings (cf. "meacharáyich" in the same passage); simply write "veloháyich". (2) אֲבִיעַד is stressed on the last syllable (avi-ÁD, from אֲבִי־עַד), so "Avíad" puts the accent on the wrong syllable.
- Correct version: "veloháyich" ; "Aviád"
- Severity: Minor
- Confidence: Medium

#### m-55 · מִי is not "a pergunta que abre qualquer apresentação"
- Location: data/real-world.json, scene id "quem-e", labelPt
- Original: "A pergunta que abre qualquer apresentação"
- Problem: Introductions open with מַה שִּׁמְךָ / אֵיךְ קוֹרְאִים לְךָ, not with מִי. מִי is used for "who is it?" (at the door, on the phone: מִי זֶה?). The contextPt itself says correctly "serve para perguntar quem é alguém".
- Correct version: labelPt: "Quem bate na porta, quem liga" or "A pergunta de quem atende a porta: מִי זֶה?"
- Severity: Minor
- Confidence: Medium

#### m-56 · מוֹרֶה in the ulpan
- Location: data/real-world.json, scene id "aula-morá", labelPt, contextPt
- Original: id "aula-morá"; he "מוֹרֶה"; "Se você fizer um ulpan em Israel, é assim que vai chamar quem está na frente da sala."
- Problem: The id says "morá" but the word is the masculine מוֹרֶה "moré". Most ulpan teachers are women (מוֹרָה), and adult students in an ulpan normally call the teacher by first name; "המורה" as address is a school-children thing. The claim is overstated and the gender mismatch is confusing.
- Correct version: contextPt: "Professor. Se for professora, מוֹרָה. Na escola as crianças chamam assim quem está na frente da sala; no ulpan, quase sempre se usa o primeiro nome." Fix the id.
- Severity: Minor
- Confidence: Medium

### A1 · יחידות 0 עד 5

#### m-57 · פּוֹרְטוּגָזִית pointed with kamatz, but said (and transliterated) "portugezit"
- Location: u04.json, palavras (פּוֹרְטוּגָזִית / "portugezit"); exercicios[11] options; also u10.json and data/audio.json use the same pointing
- Original: "he": "פּוֹרְטוּגָזִית", "translit": "portugezit"
- Problem: the niqqud (ָ under ג) reads "portugAzit"; the transliteration, and the normal Israeli pronunciation, is "portugEzit". Niqqud and transliteration contradict each other in the same entry; a learner reading the pointing will say it wrong.
- Correct version: פּוֹרְטוּגֶזִית (segol under ג), keeping "portugezit"
- Explanation: the pointing should reflect the established pronunciation of the loanword.
- Severity: Minor
- Confidence: Medium

#### m-58 · מָה vs מַה pointed inconsistently
- Location: u01.json palavras "מָה שְׁלוֹמְךָ?", "מָה שְׁלוֹמֵךְ?" vs "מַה שִּׁמְךָ?", "מַה שְּׁמֵךְ?"; u02.json "מָה זֶה?" (palavras, dialogo, exercicios) vs u00 "מַה נִשְׁמָע?"
- Original: "מָה שְׁלוֹמְךָ?" next to "מַה שִּׁמְךָ?"
- Problem: the same word before the same letter ש is pointed two ways in one word list (with dagesh in the following letter after מַה, without it after מָה). Classical/Academy menukad uses מַה + dagesh chazak before ordinary consonants (מַה זֶּה, מַה שְּׁלוֹמְךָ), מָה before א/ר (so u03 "וּמָה אֵלֶּה" is fine).
- Correct version: מַה שְּׁלוֹמְךָ?, מַה שְּׁלוֹמֵךְ?, מַה זֶּה? (or adopt מָה everywhere as a deliberate simplified convention, but then not mixed)
- Explanation: consistency of the pointed standard. Pronunciation is unaffected.
- Severity: Minor
- Confidence: Medium

#### m-59 · בַּמְּקָרֵר: dagesh normally omitted in the participial מְ after the article
- Location: u05.json, dialogo.linhas[3] "הֶחָלָב בַּמְּקָרֵר."; exercicios[12] depois "מְּקָרֵר"
- Original: "הֶחָלָב בַּמְּקָרֵר."
- Problem: מְקָרֵר is a pi'el participle form (מְ prefix with shva). In standard pointing the article does not add dagesh to the prefix מְ of the participle (הַמְדַבֵּר, הַמְלַמֵּד), so בַּמְקָרֵר. Also, exercicios[12] shows the isolated fragment "מְּקָרֵר" with a dagesh that only makes sense after the article, which looks odd on screen.
- Correct version: הֶחָלָב בַּמְקָרֵר. ; depois "מְקָרֵר"
- Explanation: pointing detail; no effect on pronunciation. (הַמְּנוֹרָה in u03 is correctly pointed with dagesh.)
- Severity: Minor
- Confidence: Medium

#### m-60 · "te" for תֵּה will be read [tʃi] by most Brazilians
- Location: u05.json, palavras (תֵּה / "te"); dialogo.linhas[5] "aní shotá te."
- Original: "translit": "te"
- Problem: "te" is the Portuguese clitic pronoun, read [tʃi] in most of Brazil: exactly the palatalisation u00 warns against, plus the wrong vowel.
- Correct version: "tê" (or "té")
- Explanation: the transliteration should not trigger the habit the course itself flags.
- Severity: Minor
- Confidence: High

#### m-61 · "matana" lacks the accent the convention requires
- Location: u02.json, palavras (מַתָּנָה / "matana")
- Original: "translit": "matana"
- Problem: by Portuguese rules "matana" is paroxytone (ma-TA-na); the word is matanÁ. The course's rule writes oxytones in -a with an accent ("morá", "ishá", "yaldá" in the same list).
- Correct version: "mataná"
- Explanation: consistency with data/translit.json accent rule.
- Severity: Minor
- Confidence: High

#### m-62 · "brazilait" / "brazilái": the feminine will be read as a diphthong
- Location: u01.json, palavras (בְּרָזִילָאִי "brazilái", בְּרָזִילָאִית "brazilait")
- Original: "translit": "brazilái" / "translit": "brazilait"
- Problem: "brazilait" reads in Portuguese as bra-zi-LAIT (one syllable "lait"); the word is bra-zi-la-ÍT. "brazilái" matches the common colloquial Israeli pronunciation (diphthong, stress on la), so it is acceptable, but the pair is then inconsistent (colloquial m., unmarked f.).
- Correct version: "brazilaít" for the feminine (and optionally "brazilaí" for the masculine if the standard form is preferred)
- Explanation: stress/syllabification for Portuguese readers.
- Severity: Minor
- Confidence: Medium

#### m-63 · יִשְׂרְאֵלִי transliterated "isreelí", a spelling-pronunciation Israelis do not use in speech
- Location: u01.json, palavras (יִשְׂרְאֵלִי "isreelí", יִשְׂרְאֵלִית "isreelit")
- Original: "translit": "isreelí"
- Problem: the pointing is correct (standard), but everyday Israeli pronunciation is "yisraelí" / "israelí". "isreelí" sounds artificial and differs from "Israel" two lines above. Also the m. form has an accent and the f. form does not.
- Correct version: "israelí" / "israelít" (or "yisraelí" / "yisraelít"); optionally a note that the niqqud spells it יִשְׂרְאֵלִי but people say "israelí"
- Explanation: brief rule: where standard niqqud and real speech differ, say so; teach what Israelis say.
- Severity: Minor
- Confidence: Medium

#### m-64 · Completion items whose expected answer is a fragment, not a word
- Location: u01.json exercicios[10] (antes "אֲנִי סְטוּדֶנְט", respostas ["ית"]); u05.json exercicios[12] (antes "הַבֵּיצִים", depois "מְּקָרֵר", respostas ["ב"])
- Original: "respostas": ["ית"] / "respostas": ["ב"]
- Problem: (1) A learner who types the whole word סטודנטית is marked wrong. (2) In u05 the point being taught is בְּ + הַ = בַּ, but niqqud is stripped in comparison, so "ב" accepts בְּ and בַּ alike: the item cannot distinguish the right answer from the error the grammar box warns about. A learner who types the whole word במקרר is marked wrong.
- Correct version: (1) respostas ["ית", "סטודנטית"]. (2) Turn it into an escolha between "בַּמְקָרֵר" and "בְּהַמְקָרֵר" (as exercicios[11] does), or make the gap the whole word with respostas ["במקרר"].
- Explanation: answer-key completeness and item validity.
- Severity: Minor
- Confidence: Medium

#### m-65 · Free-writing key accepts only one wording
- Location: u01.json exercicios[19], pt "Eu sou estudante e sou do Brasil (fala um homem)"
- Original: "respostas": ["אני סטודנט ואני מברזיל"]
- Problem: natural equivalent answers are rejected: "אני סטודנט מברזיל", "אני סטודנט ומברזיל", "אני מברזיל ואני סטודנט".
- Correct version: add at least "אני סטודנט ומברזיל", "אני מברזיל ואני סטודנט", "אני סטודנט מברזיל"
- Explanation: answer-key completeness.
- Severity: Minor
- Confidence: High

#### m-66 · Shabat shalom: four different starting times in one unit
- Location: u00.json palavras (שַׁבָּת שָׁלוֹם pt "de sexta à tarde a sábado"); leitura.perguntas[1] porque ("a partir da sexta à tarde"); cultura[1] ("Desde a sexta de manhã"); exercicios[9] porque ("Na sexta, a partir da manhã")
- Original: as quoted
- Problem: the unit says both "from Friday afternoon" and "from Friday morning". In reality people say it from Thursday evening/Friday morning on, through Saturday.
- Correct version: one formula everywhere, e.g. "de sexta (já de manhã) até sábado"
- Explanation: consistency.
- Severity: Minor
- Confidence: High

#### m-67 · "Apagar o ה do começo muda a palavra" overstates
- Location: u00.json gramatica[2] erroPt; similarly gramatica[5] erroPt ("Em hebraico isso muda a palavra")
- Original: "Em hebraico, apagar o ה do começo muda a palavra: הִנֵּה é \"hiné\" (aqui está), não \"iné\"."
- Problem: "iné" is not another word; it is the same word with an accent. In fast Israeli speech ה is in fact often weakened or dropped (especially the article and unstressed ה). The same overstatement applies to TCH/DJ before I: it sounds foreign, it rarely produces another word.
- Correct version: "Apagar o ה soa estrangeiro e pode confundir: diga \"hiné\", não \"iné\". (Na fala rápida, o israelense às vezes engole o ה; mas quem aprende deve pronunciá-lo.)"
- Explanation: accuracy of the claim; the advice itself is good.
- Severity: Minor
- Confidence: Medium

#### m-68 · Key words used in dialogues are not in the word list or glossary
- Location: u03.json dialogo (glossario: []): הַבַּיִת (habáyit), הַכִּסְאוֹת (irregular plural of כִּסֵּא), מִנֹּעָה
- Original: "glossario": []
- Problem: בַּיִת is never taught in u00 to u03 but carries the first line of the dialogue and the "falar" model; the plural כִּסְאוֹת (stem change + ־וֹת on a masculine) appears in the grammar box but not in palavras.
- Correct version: add בַּיִת "casa" (báyit) to palavras or glossario, and כִּסְאוֹת to the glossary
- Explanation: level fit, unknown words in core material.
- Severity: Minor
- Confidence: High

#### m-69 · Reading question depends on a sender the text never names
- Location: u00.json leitura.perguntas[2] (vf "A Noa agradeceu.")
- Original: lines with no sender; "A Noa agradeceu." certa true
- Problem: the four group messages have no author; that the third one is from Noa is an inference supported only by the Portuguese "Muito obrigada!" (feminine). Answerable, but ambiguous for a self-study learner.
- Correct version: add "quem" to the leitura lines (e.g. Mãe, Noa, Mãe) or ask "Alguém agradeceu os parabéns?"
- Explanation: question clarity.
- Severity: Minor
- Confidence: Medium

#### m-70 · Transliteration of שָׁלוֹם is inconsistent
- Location: u00.json "shalóm" (dialogo, glossario, palavras "shabát shalóm"); u01.json "shalom" (palavras, dialogo)
- Original: "shalóm" / "shalom"
- Problem: same word, two spellings. data/translit.json explicitly says "shalom ... ficam sem acento".
- Correct version: "shalom" everywhere (per translit.json), and likewise check "shabát" vs the convention
- Explanation: consistency.
- Severity: Minor
- Confidence: High

#### m-71 · שָׁלוֹם glossed differently in u00 and u01
- Location: u00.json dialogo.glossario ("olá / tchau"); u01.json palavras ("olá / paz")
- Original: "pt": "olá / paz"
- Problem: u01 drops "tchau", the very use u00's note insists on.
- Correct version: "olá / tchau / paz"
- Explanation: consistency.
- Severity: Minor
- Confidence: High

### A1 · יחידות 6 עד 10

#### m-72 · notaPt says masculine counting is "do A2", but Unit 19 of this A1 teaches it
- Location: u07.json, notaPt
- Original: "A outra série, para contar coisas masculinas (שְׁנֵי אַחִים), é do A2."
- Problem: u19.json ("Os números que você sabe são os do feminino", "Um e dois têm regras próprias") teaches exactly this series in A1.
- Correct version: "...é da Unidade 19."
- Severity: Minor
- Confidence: High

#### m-73 · Overstated fact: shekel "o nome de dinheiro mais antigo em uso"
- Location: u07.json, cultura[0].textoPt
- Original: "O שֶׁקֶל é o nome de dinheiro mais antigo em uso: na Bíblia, era um peso de prata."
- Problem: The superlative is unverifiable and commonly disputed (the modern shekel exists only since 1980; other currency names derive from ancient weight units too, e.g. "libra/pound"). The rest (biblical weight, new shekel 1985, 100 אֲגוֹרוֹת) is correct.
- Correct version: "O שֶׁקֶל é um dos nomes de dinheiro mais antigos: na Bíblia, era uma unidade de peso, usada para pesar prata."
- Severity: Minor
- Confidence: Medium

#### m-74 · Wrong stress in transliteration "besháa"
- Location: u07.json, palavras, he "בְּשָׁעָה…"
- Original: "translit": "besháa…"
- Problem: שָׁעָה is stressed on the last syllable (the same file writes "hashaá"). "besháa" makes a Brazilian say be-SHÁ-a.
- Correct version: "beshaá…"
- Severity: Minor
- Confidence: High

#### m-75 · Transliteration stress by the course's own rule: shelo, shela, lachem, lahem, shelachem, shelahem
- Location: u06.json palavras "שֶׁלּוֹ" ("shelo"), "שֶׁלָּהּ" ("shela"); u08.json palavras "לָכֶם" ("lachem"), "לָהֶם" ("lahem"), "שֶׁלָּכֶם" ("shelachem"), "שֶׁלָּהֶם" ("shelahem")
- Original: "shelo", "shela", "lachem", "lahem", "shelachem", "shelahem"
- Problem: translit.json: "escreva de modo que um brasileiro lendo... pelas regras do portugues caia na silaba certa". By Portuguese rules, unaccented words ending in -o, -a and -em are paroxytone, so these read SHE-lo, SHE-la, LA-chem, LA-hem; Hebrew stresses the last syllable. The same unit correctly writes "shelánu", "lánu", "dodá".
- Correct version: "sheló", "shelá", "lachém", "lahém", "shelachém", "shelahém" (lachen, lahen, shelachen, shelahen are fine: unaccented -en reads oxytone).
- Severity: Minor
- Confidence: High

#### m-76 · Culture box contradicts the dialogue on how phone numbers are read
- Location: u08.json, cultura[0].textoPt vs dialogo.linhas[9]
- Original: cultura: "o israelense fala os dígitos um por um, em grupos: אֶפֶס חָמֵשׁ שְׁתַּיִם…"; dialogue: "אֶפֶס חֲמִשִּׁים וּשְׁתַּיִם…" ("Zero cinquenta e dois…")
- Problem: Both habits exist (reading the prefix 052 as אֶפֶס חֲמִשִּׁים וּשְׁתַּיִם is very common), but the box says "um por um" and the dialogue immediately does the opposite, without comment.
- Correct version: cultura: "...fala os dígitos um por um ou em pares: אֶפֶס חֲמִשִּׁים וּשְׁתַּיִם, ou אֶפֶס חָמֵשׁ שְׁתַּיִם…"
- Severity: Minor
- Confidence: High

#### m-77 · Dialogue line: present tense used for a future plan, and stiff invitation
- Location: u08.json, dialogo.linhas[5]
- Original: "אֲנַחְנוּ שׁוֹתוֹת קָפֶה. אַתָּה רוֹצֶה קָפֶה אִתָּנוּ?" / pt "Nós vamos tomar um café. Você quer café com a gente?"
- Problem: אֲנַחְנוּ שׁוֹתוֹת קָפֶה = "we are drinking / we drink coffee", not "we are going to". אַתָּה רוֹצֶה קָפֶה אִתָּנוּ is understandable but not what an Israeli says.
- Correct version: with present-tense only: "אֲנַחְנוּ הוֹלְכוֹת לְבֵית קָפֶה. רוֹצֶה לָבוֹא אִתָּנוּ?" If infinitives are not yet allowed in u08: "אֲנַחְנוּ הוֹלְכוֹת לְבֵית קָפֶה. אַתָּה בָּא אִתָּנוּ?" (הוֹלֵךְ/בָּא appear only in u09, so alternatively keep the Hebrew and change pt to "Nós estamos tomando um café. Quer um café com a gente?").
- Severity: Minor
- Confidence: Medium

#### m-78 · completar with a one-letter prefix shown as a separate blank, in a non-preferred word order
- Location: u06.json, exercicios, completar "\"Os meus pais têm um cachorro\""
- Original: "antes": "יֵשׁ כֶּלֶב", "depois": "הוֹרִים שֶׁלִּי", "respostas": ["ל"]
- Problem: (1) A1Player renders the blank with margins on both sides, so the learner sees "יֵשׁ כֶּלֶב ___ הוֹרִים שֶׁלִּי" and must type a single prefix letter that actually stands for לַ (לְ + הַ); the item reads as if "הוֹרִים" were a separate word without article. (2) The natural order, used in the dialogue, is לַהוֹרִים שֶׁלִּי יֵשׁ כֶּלֶב.
- Correct version: antes "", depois "שֶׁלִּי יֵשׁ כֶּלֶב", respostas ["להורים"].
- Severity: Minor
- Confidence: Medium

#### m-79 · Niqqud of פּוֹרְטוּגָזִית does not match its transliteration
- Location: u10.json, leitura.linhas[3]
- Original: "אֲנִי רוֹצָה לִלְמוֹד פּוֹרְטוּגָזִית..." / translit "portugezit"
- Problem: Kamatz under ג gives "portugazit"; the transliteration (and, as far as I know, Israeli speech) is "portugezit". One of them has to change.
- Correct version: פּוֹרְטוּגֶזִית (segol), matching "portugezit". Verify against the Academy / Even-Shoshan entry.
- Severity: Minor
- Confidence: Low

#### m-80 · Accepted answers include a different word and non-standard spellings
- Location: u10.json exercicios erro "אֲנִי אוֹהֵב לוֹמֵד עִבְרִית." (respostas include "אני אוהב ללמד עברית"); u10.json escrever "nadar" (respostas include "לישחות"); u08.json completar "...מָה ___ הַטֶּלֶפוֹן שֶׁלָּךְ?" (respostas include "מיספר")
- Original: "אני אוהב ללמד עברית"; "לישחות"; "מיספר"
- Problem: Unpointed ללמד is read as לְלַמֵּד "to teach", so the key accepts a sentence meaning "I like to teach Hebrew". לישחות and מיספר break the Academy ktiv male rule (no yod for chirik before a closed syllable / shva nach: לשחות, מספר). Accepting them is lenient, but the "correct answer" display could show them as valid spellings.
- Correct version: drop "אני אוהב ללמד עברית" (the plene generator already covers ללמוד); keep לישחות/מיספר only if the UI never displays them as the model answer.
- Severity: Minor
- Confidence: Medium

#### m-81 · Transliteration inconsistencies across the slice
- Location: u07 "shabat" vs u09/u10 "beshabát", "uveshabát"; u09 leitura "shalóm" (translit.json note says "shalom e katan ficam sem acento"); u08 "korim" vs u10 leitura "kor'im"; u09 "lif'amim" (apostrophe) vs u08 "beayá", u07 "baérev" (no apostrophe); u10 accents every final-stressed infinitive ("lilmód", "laavód", "ledabér", "sratím", "hayóm") while u06 writes "achim", "horim", "chatul" without accent
- Original: as quoted
- Problem: Not misleading for stress (the extra accents are harmless), but the system declared in translit.json says natural oxytones stay unaccented, and the apostrophe for ע/א is used only sometimes.
- Correct version: pick one convention (translit.json: no accent on natural oxytones; either always or never use an apostrophe for a glottal break) and normalise.
- Severity: Minor
- Confidence: High

### A1 · יחידות 11 עד 15

#### m-82 · March is pointed מַרְץ (patach) in three places, מֶרְץ in the word list
- Location: u15.json, gramatica[0].exemplos[0].he; exercicios[13] (montar) palavras[3]; palavras list has מֶרְץ
- Original: "יוֹם הַהֻלֶּדֶת שֶׁלִּי בְּמַרְץ." / "בְּמַרְץ" (montar) vs palavras: "מֶרְץ", translit "merts"
- Problem: the month is pronounced [merts] and pointed מֶרְץ (or מֵרְץ). מַרְץ reads "marts". The unit contradicts its own word list, and a learner reading the pointed sentence (or a TTS reading it) gets the wrong vowel.
- Correct version: יוֹם הַהֻלֶּדֶת שֶׁלִּי בְּמֶרְץ. / בְּמֶרְץ
- Explanation: consistency and pronunciation; the patach form does not exist for the month in Israeli usage.
- Severity: Minor
- Confidence: High

#### m-83 · Transliteration writes hard G before e/i as "ge/gi", against the course's own "gue/gui" convention
- Location: u15.json palavras (גֶּשֶׁם "géshem", יוֹרֵד גֶּשֶׁם "yored géshem"), dialogo linhas 5 and 6 ("veein géshem?", "yored géshem"), u12.json palavras (אֵיךְ מַגִּיעִים "eich magiím", בָּרֶגֶל "barégel"), u12 dialogo linhas 1 and 2 ("magiím", "barégel"), u12 leitura linha 4 ("barégel")
- Original: "géshem", "magiím", "barégel"
- Problem: a Brazilian reads "ge/gi" as [ʒe]/[ʒi]: "jéshem", "majiím", "baréjel". data/translit.json itself writes גֶּשֶׁם as "guéshem" and גִ as "gui", and normalizeLoose in the app was explicitly built around "gue/gui" being the course convention.
- Correct version: "guéshem", "yored guéshem", "maguiím", "barégel" -> "baréguel"
- Explanation: consistency across files and a real mispronunciation trap for the target audience.
- Severity: Minor
- Confidence: High

#### m-84 · חֵיפָה transliterated "Cheifa"
- Location: u15.json leitura.linhas[3].translit (also used across earlier units: beCheifa, meCheifa)
- Original: "Cheifa: géshem, esrim maalót"
- Problem: Israelis say [ˈχaifa] ("Cháifa"), not "Chêifa". The pointing חֵיפָה is the standard spelling, but the transliteration, which is meant to show real Israeli pronunciation, follows the vowel sign literally and does not match speech. The Portuguese side of the course even writes "Haifa".
- Correct version: "Cháifa" (keep חֵיפָה as the pointed form; optionally a note that the name is said "Haifa")
- Explanation: pronunciation accuracy; course-wide pattern.
- Severity: Minor
- Confidence: Medium

#### m-85 · חֲדַר שֵׁנָה transliterated "chadar sheiná"
- Location: u11.json palavras[2].translit
- Original: "chadar sheiná"
- Problem: שֵׁנָה is [shená]; there is no yod and no diphthong. translit.json maps tsere alone to "e" and only ֵי to "ei". Elsewhere the course writes יְשֵׁנָה "yeshená".
- Correct version: "chadar shená"
- Explanation: consistency with the declared table; "ei" makes the learner say a diphthong Israelis do not say here.
- Severity: Minor
- Confidence: High

#### m-86 · "demais" accepts מידי, which is a different word
- Location: u14.json exercicios[23] (escrever), respostas
- Original: "respostas": ["מידי", "מדי"]
- Problem: the Academy ktiv male of מִדַּי is מדי (chirik before a dagesh gets no yod). מידי is the plene spelling of מִיָּדִי "imediato". Accepting it rewards a very common Israeli misspelling and teaches it as correct.
- Correct version: "respostas": ["מדי"] (or keep מידי silently accepted but never shown as a model)
- Explanation: spelling standard; the same applies by analogy to מירפסת accepted in u11 exercicios[22] (Academy: מרפסת), which is a softer case because it is not a different word.
- Severity: Minor
- Confidence: High

#### m-87 · Natural word orders not accepted (montar is single-order; erro/escrever lists are short)
- Location: u11 exercicios[12]; u12 exercicios[14]; u14 exercicios[13]; u15 exercicios[12]; u15 exercicios[10] and [11]; u11 exercicios[10]
- Original: 
  - u11 [12] "בַּדִּירָה יֵשׁ מִרְפֶּסֶת גְּדוֹלָה"
  - u12 [14] "פּוֹנִים שְׂמֹאלָה בַּפִּנָּה"
  - u14 [13] "יֵשׁ מִדָּה יוֹתֵר קְטַנָּה?"
  - u15 [12] "בַּחֹרֶף קַר בִּירוּשָׁלַיִם"
  - u15 [10] "respostas": ["היום חם"]; u15 [11] "respostas": ["קר לי"]
  - u11 [10] "respostas": ["הוא על הכסא", "הוא על הכיסא"]
- Problem: A1Player's Montar compares the built sentence with the single stored order. Equally correct orders are marked wrong: יֵשׁ מִרְפֶּסֶת גְּדוֹלָה בַּדִּירָה; בַּפִּנָּה פּוֹנִים שְׂמֹאלָה; יֵשׁ מִדָּה קְטַנָּה יוֹתֵר? (arguably the more standard order); בִּירוּשָׁלַיִם קַר בַּחֹרֶף / קַר בִּירוּשָׁלַיִם בַּחֹרֶף. In the written items, the very common לי קר and חם היום, and התיק על הכסא, are rejected.
- Correct version: add the alternatives to respostas ("לי קר", "חם היום", "התיק על הכסא", "התיק על הכיסא"); for montar, either support an "aceitas" list of orders or choose sentences with only one natural order.
- Explanation: the system marks correct natural Hebrew as wrong, which teaches a false rigidity of word order.
- Severity: Minor
- Confidence: High

#### m-88 · Prompt says "Ela" but the sentence is in first person
- Location: u12.json exercicios[11] (erro)
- Original: "q": "Ela vai de ônibus. Ache o erro e escreva a frase certa.", "errada": "אֲנִי הוֹלֶכֶת לָעֲבוֹדָה בְּאוֹטוֹבּוּס."
- Problem: the sentence is אֲנִי (eu, mulher), not "ela". A careful learner may "fix" the pronoun.
- Correct version: "Uma mulher fala: ela vai de ônibus. Ache o erro..." or "Eu vou de ônibus (fala uma mulher)."
- Explanation: clarity of the item.
- Severity: Minor
- Confidence: High

#### m-89 · Fixed masculine verb with no speaker indicated
- Location: u11.json exercicios[8] (completar)
- Original: "q": "\"Hoje eu durmo na casa da vovó\"", "antes": "הַיּוֹם אֲנִי יָשֵׁן"
- Problem: the gender choice in curso.json only affects "aberta" items (A1Player). A female learner sees a masculine "eu durmo" without "(fala um homem)", while other units mark the speaker every time.
- Correct version: add "(fala um homem)" to q.
- Explanation: consistency with the rest of the course's prompts.
- Severity: Minor
- Confidence: High

#### m-90 · Pointing of סְוֶודֶר mixes the two standards
- Location: u14.json palavras ("סְוֶודֶר"), exercicios[27].exemplo ("הַסְּוֶודֶר"); u15.json exercicios[9] ("סְוֶודֶר וּמְעִיל")
- Original: "סְוֶודֶר"
- Problem: double vav is a ktiv male device; in ktiv menukad the consonantal vav is written once: סְוֶדֶר. Pointing the doubled form is a hybrid. (The unpointed answer סוודר in exercicios[22] is correct.)
- Correct version: סְוֶדֶר (pointed), סוודר (unpointed)
- Explanation: the brief's two-standard rule; pointed text should follow menukad.
- Severity: Minor
- Confidence: Medium

#### m-91 · "Misto de queijo" for טוֹסְט גְּבִינָה
- Location: u13.json leitura.linhas[2].pt and perguntas[1].opcoes[1]
- Original: "Misto de queijo: 39 shekels"
- Problem: in Brazil "misto (quente)" means ham and cheese. A טוֹסְט גְּבִינָה is cheese only (often with vegetables or sauce).
- Correct version: "Tosta de queijo" / "Queijo quente" / "Sanduíche quente de queijo"
- Explanation: false friend in the Portuguese.
- Severity: Minor
- Confidence: Medium

#### m-92 · "shalóm" with an accent
- Location: u14.json dialogo.linhas[0].translit
- Original: "shalóm! efshar laazor?"
- Problem: translit.json states that oxytones like shalom stay without accent, and every other A1 occurrence is "shalom".
- Correct version: "shalom! efshar laazor?"
- Explanation: consistency.
- Severity: Minor
- Confidence: High

#### m-93 · Origin of the final letters partly reversed
- Location: u11.json sabia[0].textoPt
- Original: "ך, ם, ן, ף e ץ vêm da escrita aramaica antiga. No fim da palavra, o escriba esticava o traço para baixo ou fechava a letra, e isso ajudava o leitor a ver onde a palavra acabava, numa época em que nem sempre se deixava espaço entre as palavras. O costume virou regra."
- Problem: for ך ן ף ץ the long descender is the OLDER shape; what changed was the medial form, which bent its stroke toward the next letter in fluent writing, while the word-final position kept the original form. Only ם is a genuinely "closed" innovation. The "no spaces between words" motivation is a popular explanation; the square script of the period generally did separate words.
- Correct version: "Na escrita aramaica, no meio da palavra o traço das letras se curvava em direção à letra seguinte; no fim da palavra, sem letra seguinte, ficava a forma antiga, comprida. Com o tempo, as duas formas viraram regra, e a forma final ajuda a ver onde a palavra acaba."
- Explanation: fact accuracy (brief item 6).
- Severity: Minor
- Confidence: Medium

#### m-94 · Asking for the bill in the same turn as ordering
- Location: u13.json dialogo.linhas[11]
- Original: "וְאַחַר כָּךְ… אֶפְשָׁר חֶשְׁבּוֹן, בְּבַקָּשָׁה?" / "E depois… pode trazer a conta, por favor?"
- Problem: Dani asks for the bill immediately after the order is taken, in the same exchange. Read literally it is odd (and a bit rude); the "depois" is meant as a time skip but nothing marks it.
- Correct version: split it: a narrator line / stage note "(Depois do jantar)" and then Dani: "אֶפְשָׁר חֶשְׁבּוֹן, בְּבַקָּשָׁה?"
- Explanation: naturalness of the scene.
- Severity: Minor
- Confidence: Medium

#### m-95 · Item depends only on the instruction; the "wrong" sentence is grammatical
- Location: u11.json exercicios[10] (erro)
- Original: "q": "תִּיק é masculino. Ache o erro e escreva a frase certa.", "errada": "הִיא עַל הַכִּסֵּא."
- Problem: הִיא עַל הַכִּסֵּא is a correct sentence; the bag is never mentioned in it. The "error" exists only in relation to the prompt. Works, but it is weak as an error-spotting item; and the most natural correction, הַתִּיק עַל הַכִּסֵּא, is rejected (see the answer-key finding above).
- Correct version: make it a dialogo: "אֵיפֹה הַתִּיק?" -> "הִיא עַל הַכִּסֵּא." and ask for the right reply.
- Explanation: item clarity.
- Severity: Minor
- Confidence: High

### A1 · יחידות 16 עד 20

#### m-96 · Unit 17: "הַטִּיסָה מְאֻחֶרֶת" for a delayed flight
- Location: u17.json, leitura linhas[3] and its vf porque; exercicios item 17 (t: "ouvir")
- Original: "הַטִּיסָה מְאֻחֶרֶת בְּשָׁעָה" / "הַטִּיסָה מְאֻחֶרֶת." / porque: "מְאֻחֶרֶת é o feminino de מְאֻחָר (Unidade 9), porque טִיסָה é feminina."
- Problem: מְאֻחָר/מְאֻחֶרֶת is the adjective "late (in the day/hour)": טִיסָה מְאֻחֶרֶת is "a late(-night) flight". For "the flight is delayed by an hour" Israelis say הַטִּיסָה מִתְעַכֶּבֶת בְּשָׁעָה, יֵשׁ עִכּוּב שֶׁל שָׁעָה, or (colloquially) הַטִּיסָה מְאַחֶרֶת בְּשָׁעָה. Boards show "עיכוב" / "נדחתה" / a new time. "הַטִּיסָה מְאֻחֶרֶת בְּשָׁעָה" is understandable but not the natural form. Note that Unit 20 itself teaches the right verb, מְאַחֵר / מְאַחֶרֶת (estar atrasado).
- Correct version: "הַטִּיסָה מְאַחֶרֶת בְּשָׁעָה" (consistent with u20) or, on a board, "עִכּוּב: שָׁעָה". Ouvir item: "הַטִּיסָה מְאַחֶרֶת." or "יֵשׁ עִכּוּב."
- Explanation: avoids teaching the adjective "late" where the verb "is late/delayed" is meant, and aligns u17 with u20.
- Severity: Minor
- Confidence: Medium

#### m-97 · Unit 16: "גַּם" at the end of the clause
- Location: u16.json, dialogo linhas[8]; exercicios item 25 (completar, "depois")
- Original: "כֵּן. וַאֲנִי חוֹשֶׁבֶת שֶׁנֹּעָה רוֹצָה לָבוֹא גַּם."
- Problem: sentence-final גַּם ("…to come, too") is a widespread colloquial calque (English "too", Russian), but standard and most natural Israeli Hebrew puts גַּם before the word it modifies: שֶׁגַּם נֹעָה רוֹצָה לָבוֹא. A model dialogue (and an exercise that copies it) should show the standard order, especially since u16 teaches שֶׁ־.
- Correct version: "כֵּן. וַאֲנִי חוֹשֶׁבֶת שֶׁגַּם נֹעָה רוֹצָה לָבוֹא." (translit: "ken. vaaní choshévet shegám Noa rotsá lavó.")
- Explanation: learners generalize model sentences; גַּם before the focused word is the rule taught everywhere else in the course (e.g. "גַּם אֲנִי בָּא" in the same unit's reading).
- Severity: Minor
- Confidence: High

#### m-98 · Unit 16: "כִּי" presented only as "porque"
- Location: u16.json, gramatica[0].erroPt; exercicios item 2 dica "2"
- Original: "E não confunda com כִּי, que é \"porque\"." / dica: "כִּי é \"porque\". \"Que\" é שֶׁ־."
- Problem: in formal/written Hebrew (news, official texts) כִּי is also the complementizer "that": "הוּא אָמַר כִּי…", "נִמְסַר כִּי…". So "אֲנִי חוֹשֵׁב כִּי הוּא בָּא" is formal/bookish, not wrong. The learner will meet it in news and signs.
- Correct version: "Na fala, \"que\" é שֶׁ־. כִּי, na conversa, é \"porque\" (em texto formal, como jornal, כִּי às vezes aparece também como \"que\")." The dica can say: "Na conversa, כִּי é \"porque\"; para \"que\", use שֶׁ־."
- Explanation: the item is still fine as a choice (option 0 is the natural one); only the absolute statement overgeneralizes.
- Severity: Minor
- Confidence: High

#### m-99 · Unit 16: "מָה קוֹרֶה?" translated as "O que houve?"
- Location: u16.json, dialogo linhas[2] (pt) and dialogo.glossario[0]
- Original: "בְּסֵדֶר. מָה קוֹרֶה?" pt "Tudo. O que houve?"; glossario pt "o que houve? o que manda?"
- Problem: after "מַה נִשְׁמָע? / בְּסֵדֶר", מָה קוֹרֶה? is the casual "what's up? / e aí, o que conta?". In Brazilian Portuguese "O que houve?" suggests something went wrong. "o que manda?" is right.
- Correct version: pt "Tudo. E aí, o que manda?"; glossario "e aí? o que manda? (literalmente: o que está acontecendo?)"
- Explanation: register/meaning mismatch in translation.
- Severity: Minor
- Confidence: High

#### m-100 · Montar items with only one accepted word order (Units 16, 20)
- Location: u20.json exercicios item 11 (montar "Todo dia eu vou de ônibus para o trabalho."); u16.json exercicios item 12 (montar "Sinto muito, hoje eu não posso.")
- Original: u20 palavras "כָּל יוֹם", "אֲנִי", "נוֹסֵעַ", "לָעֲבוֹדָה", "בְּאוֹטוֹבּוּס"; u16 palavras "אֲנִי", "מִצְטַעֶרֶת,", "הַיּוֹם", "אֲנִי", "לֹא", "יְכוֹלָה"
- Problem: A1Player's Montar compares the joined tiles with the data order exactly. For u20, "כָּל יוֹם אֲנִי נוֹסֵעַ בְּאוֹטוֹבּוּס לָעֲבוֹדָה" and "אֲנִי נוֹסֵעַ כָּל יוֹם לָעֲבוֹדָה בְּאוֹטוֹבּוּס" are equally correct and natural (the PT prompt even has "de ônibus" before "para o trabalho"). For u16, "אֲנִי מִצְטַעֶרֶת, אֲנִי לֹא יְכוֹלָה הַיּוֹם" is also correct.
- Correct version: either support a list of accepted orders for montar, or lock the order with the tile split (e.g. "בְּאוֹטוֹבּוּס לָעֲבוֹדָה" as one tile; "הַיּוֹם אֲנִי" as one tile).
- Explanation: a correct answer marked wrong. Other montar items in the slice (u17, u18, u19, u20 item 12) have only one natural order and are fine.
- Severity: Minor
- Confidence: High

#### m-101 · Unit 18: "כַּדּוּר ... é tudo o que é redondo"
- Location: u18.json, sabia[0].textoPt
- Original: "כַּדּוּר é \"bola\" (o כַּדּוּר de כַּדּוּרֶגֶל, Unidade 10) e também \"comprimido\": é tudo o que é redondo."
- Problem: overstatement: כַּדּוּר is a ball/sphere (and a pill, and also a bullet), not anything round (a round plate, wheel, ring are not כַּדּוּר; עִגּוּל is "circle").
- Correct version: "…e também \"comprimido\" (e até \"bala\" de arma): a ideia é a de uma coisa em forma de bola."
- Explanation: small factual overgeneralization in a curiosity box.
- Severity: Minor
- Confidence: High

#### m-102 · Unit 20 reading: "Às quatro as lojas estão fechadas" in Tel Aviv
- Location: u20.json, leitura linhas[3] and perguntas[2] porque
- Original: "בְּאַרְבַּע הַחֲנֻיּוֹת סְגוּרוֹת, וְכֻלָּם אוֹמְרִים \"שַׁבָּת שָׁלוֹם\"." / porque: "הַחֲנֻיּוֹת סְגוּרוֹת: estão fechadas, por causa do shabat."
- Problem: on Friday afternoon many shops close early, but in Tel Aviv specifically a lot of shops, kiosks, cafés and supermarkets stay open (some through Shabbat). As a blanket statement it is more true of Jerusalem than Tel Aviv.
- Correct version: "בְּאַרְבַּע הַרְבֵּה חֲנֻיּוֹת כְּבָר סְגוּרוֹת…" (muitas lojas já estão fechadas), and adjust the vf to "Às quatro, muitas lojas já estão fechadas."
- Explanation: cultural accuracy; also a nice reuse of הַרְבֵּה and כְּבָר from u17/u18.
- Severity: Minor
- Confidence: Medium

### מבחן הסיום של A1 ועברית בתוך קוד האפליקציה

#### m-103 · Listening question says "eles" for a sentence in "we"
- Location: data/a1/exame.json, partes[escuta].itens[7]
- Original: `"he": "אֲנַחְנוּ נוֹסְעִים בְּרַכֶּבֶת לִירוּשָׁלַיִם.", "q": "Como eles vão para Jerusalém?"`
- Problem: The speaker says אֲנַחְנוּ (we). An exam item about listening should not mislabel the person, especially when other items in the same part test exactly אנחנו vs הם ("nós moramos" vs "eles moram").
- Correct version: `"q": "Como eles (os que falam) vão para Jerusalém?"` or simply `"Como vão para Jerusalém?"`
- Explanation: consistency with item 5, which makes "nós/eles" the point being tested.
- Severity: Minor
- Confidence: High

#### m-104 · "Ela levanta" for a sentence in the first person
- Location: data/a1/exame.json, partes[escuta].itens[8]
- Original: `"he": "אֲנִי קָמָה בְּשֵׁשׁ וָחֵצִי.", "opcoes": ["Ela levanta às seis e meia", "Ele levanta às seis e meia", "Ela levanta às sete e meia"]`
- Problem: The speaker says "eu me levanto". The intended skill (recognizing the feminine קָמָה) is fine, but "Ela levanta" is not what was said; item 3 of the same part phrases it correctly ("uma mulher que não bebe café").
- Correct version: `["Uma mulher que se levanta às seis e meia", "Um homem que se levanta às seis e meia", "Uma mulher que se levanta às sete e meia"]`
- Explanation: clarity and consistency between items of one part; "se levanta" is also the standard form.
- Severity: Minor
- Confidence: High

#### m-105 · Accepted answer "איפוא" is not a spelling of איפה
- Location: data/a1/exame.json, partes[escrita].itens[4].respostas[1]
- Original: `"איפוא את גרה"`
- Problem: איפה has no variant "איפוא". (אֵפוֹא is a different, literary word, "então/pois"; the old spelling sometimes seen is "איפוא" for that word.) Accepting it rewards a misspelling and signals that it is a valid form.
- Correct version: `["איפה את גרה"]` (optionally also `"איפה את גרה בישראל"` is not needed).
- Explanation: accepted-answer lists should contain only valid spellings.
- Severity: Minor
- Confidence: Medium

#### m-106 · Inconsistent pointing of מה inside the exam (and across the course)
- Location: data/a1/exame.json, partes[comunicacao].itens[0] `"עֶרֶב טוֹב! מַה נִשְׁמָע?"` vs itens[4] `"מָה אַתְּ רוֹצָה לֶאֱכוֹל?"` and itens[5] `"מָה כּוֹאֵב לְךָ?"`. Across data/: 8 × `מַה נִשְׁמָע`, 6 × `מָה נִשְׁמָע`.
- Original: `מַה נִשְׁמָע`, `מָה כּוֹאֵב`
- Problem: Two systems are mixed. By the traditional rule, מה before a non-guttural takes patach plus dagesh in the next letter (מַה נִּשְׁמָע, מַה כּוֹאֵב); before א/ה/ע/ר it is מָה (so מָה אַתְּ is correct). The file uses patach without the dagesh in נ, and kamatz before כּ. Many modern textbooks simply write מָה everywhere, which is also acceptable as a simplification, but then it should be uniform.
- Correct version: pick one: either traditional (מַה נִּשְׁמָע, מַה כּוֹאֵב, מָה אַתְּ) or uniform מָה everywhere; do not mix within the same exam.
- Explanation: consistency of ktiv menukad; the pronunciation is "ma" in all cases.
- Severity: Minor
- Confidence: Medium

#### m-107 · Wrong niqqud in a code example for מה נשמע
- Location: app/src/lib/engine/textos.ts, comment lines 65-66
- Original: `A pontuação de fim sai: "מָה נִשְׁמַע?" entra como "מָה נִשְׁמַע".`
- Problem: נִשְׁמַע with patach under מ is the past tense nif'al ("foi ouvido") or qal future 1pl ("ouviremos"). "What's up" is the beinoni נִשְׁמָע (kamatz). It is only a comment, but comments in this repo are routinely copied into data.
- Correct version: `"מַה נִּשְׁמָע?"` (or `"מָה נִשְׁמָע?"` per the course's chosen convention).
- Explanation: patach/kamatz here changes the form, not just the spelling standard.
- Severity: Minor
- Confidence: High

#### m-108 · Letter and niqqud names in the on-screen keyboard differ from the course's names
- Location: app/src/lib/teclado-hebraico.ts LETRAS and NIKUD (lines 11-26); app/src/components/landing/DemoAlef.tsx line 193
- Original: `['ח', 'Chet']`, `['ס', 'Sâmech']`, `['ִ', 'chiriq (i)']`, `['ְ', 'shvá']`; DemoAlef `'Esta começa com Lamed, ...'`
- Problem: data/letters.json names them Het, Sámech, Lámed; data/nikud.json uses chirik and sheva. Same learner sees two spellings for the same letter. "Chet" is also read [ʃɛt] by a Brazilian (Portuguese ch = [ʃ]), the exact confusion the course fights (types.ts: "O 'ch' do português soa como o שׁ").
- Correct version: `['ח', 'Het']`, `['ס', 'Sámech']`, `['ִ', 'chirik (i)']`, `['ְ', 'sheva']`, and "Lámed" in DemoAlef.
- Explanation: consistency of terminology across files.
- Severity: Minor
- Confidence: High

#### m-109 · "gerech" breaks the course's own gue/gui convention
- Location: app/src (56 occurrences, e.g. app/src/components/learn/MeuNome.tsx line 100 `"Pôr o gerech, o sinal do J"`, app/src/lib/engine/extras.ts explainPt `Sem o gerech, ...`, exam.ts id 'gerech'); data/extras.json gerech.signNamePt.
- Original: `gerech`
- Problem: The course transliterates hard G before e/i as "gue/gui" (translit.json: גֶ = "gue", גֶּשֶׁם = "guéshem"; "daguesh" also follows it). "gerech" will be read [ʒeˈɾɛʃ] by a Brazilian, i.e. with the very ז׳ sound the sign is meant to distinguish.
- Correct version: "guéresh" (or "guerech"), and the same in every UI string.
- Explanation: the name of the sign is גֶּרֶשׁ [ˈgeʁeʃ], with a hard G.
- Severity: Minor
- Confidence: High

#### m-110 · "shalóm" with accent contradicts the declared transliteration rule
- Location: app/src/components/landing/Decisoes.tsx line 129 `tr: 'shalóm'`; app/src/components/landing/OuvirEFalar.tsx line 209 `translit="shalóm"`; vs app/src/components/landing/Fecho.tsx line 547 `tr: 'shalom'`.
- Original: `'shalóm'`
- Problem: data/translit.json: "shalom e katan ficam sem acento (oxitonas naturais)". The landing pages show both forms.
- Correct version: `'shalom'`
- Explanation: consistency with the course's own stated rule.
- Severity: Minor
- Confidence: High

#### m-111 · Gerech loanwords: spelling of "voucher" and probably "gesto"
- Location: data/extras.json gerech.letters[0].words[2] (line 146) and gerech.letters[2].words[1] (line 172), also lines 709 and 883; rendered by app/src/lib/engine/extras.ts buildGerechQuiz.
- Original: `{ "he": "ואוצ׳ר", "pt": "voucher" }`, `{ "he": "ז׳סטה", "pt": "gesto" }`
- Problem: Unpointed, a consonantal word-initial v is written וו in Israeli usage and in the Academy's ktiv male rules: וואוצ׳ר. "ואוצ׳ר" invites the reading "uotcher/vaotcher". The Hebrew loan for "gesture" is normally written and pronounced with ג׳ ([ˈdʒesta], ג׳סטה); with ז׳ it reads [ˈʒesta]. If the item is meant to illustrate ז׳, a safer word is ז׳קט, ז׳רגון (already there), מסאז׳, ביז׳ו... or בז׳ (beige).
- Correct version: `וואוצ׳ר`; replace `ז׳סטה` with `ז׳קט` ("jaqueta") or `בז׳` ("bege").
- Explanation: loanword spellings should match what the learner will actually see in Israel.
- Severity: Minor
- Confidence: Medium (voucher), Low (ג׳סטה vs ז׳סטה)

#### m-112 · Certificate line always masculine
- Location: data/a1/curso.json, certificado.linhaPt
- Original: `"{nome} concluiu o curso Hebraico A1 do Hebraico Fluente e foi aprovado no exame final."`
- Problem: The A1 asks the learner's gender (genero.perguntaPt) but the certificate says "aprovado" for everyone.
- Correct version: "aprovado/aprovada" by `genero`, or neutral: "{nome} concluiu o curso Hebraico A1 do Hebraico Fluente, com aprovação no exame final."
- Explanation: Portuguese wording; the data to choose the form already exists.
- Severity: Minor
- Confidence: High

## 🔵 PEDAGOGICAL (53)

### קורס האלפבית · האותיות 1 עד 11 (data/letters.json)

#### P-01 · He: initial /h/ "omiti-lo muda a palavra" without mentioning Israeli h-dropping
- Location: letters.json, he, brazilianMistake.why
- Original: "Em hebraico o {{ה}} no início da palavra é um som de verdade, e omiti-lo muda a palavra."
- Problem: In rapid colloquial Israeli speech /h/ is frequently weakened or dropped (hayom often sounds "ayom", especially after another word). Teaching the full /h/ is correct, but "omiti-lo muda a palavra" is overstated, and the learner will hear h-less forms in audio and real life and be confused.
- Correct version: "...é um som de verdade. Na fala rápida muitos israelenses o enfraquecem, mas pronuncie-o: é o padrão e é sempre entendido."
- Explanation: Brief item 2 (standard vs real Israeli pronunciation should be stated, not hidden).
- Severity: Pedagogical
- Confidence: High

#### P-02 · Shin/Sin called "letras diferentes" in a 22-letter course
- Location: letters.json, shin, ensino.lembrePt and ensino.detalhePt
- Original: "Mesmo desenho, letras diferentes." / "Ele está dizendo qual das duas letras aquele desenho representa"
- Problem: The course counts 22 letters with ש as one (one entry, id "shin"). Traditionally שׁ and שׂ are one letter with two values (the dot is a diacritic, like the dagesh in בּ/ב). Calling them "letras diferentes" here but "a mesma letra com/sem ponto" for בּ/ב (gimel detalhePt, modules intro) is inconsistent and may confuse learners counting letters.
- Correct version: "Mesmo desenho, dois sons: o ponto decide se é Shin ou Sin."
- Explanation: Consistent terminology.
- Severity: Pedagogical
- Confidence: Medium

#### P-03 · Examples using letters not yet taught inside the explanation text
- Location: letters.json, nun brazilianMistake (בֵּן, lesson 2; bet is order 20); he didYouKnow (בַּיִת / הַבַּיִת, lesson 2)
- Original: "Nasalizar a vogal antes do N: ler {{בֵּן}} como \"bẽ\"." / "{{בַּיִת}} é \"casa\" e {{הַבַּיִת}} é \"a casa\""
- Problem: wordsToRead obeys rule V1, but these boxes ask the learner to read words with ב in lesson 2. The nun example could use taught letters (אָמֵן, נֹתֵן, מִן already in the list).
- Correct version: nun: "ler {{אָמֵן}} como \"amẽ\"". he: keep בַּיִת with transliteration shown, or use a taught word.
- Explanation: Level fit.
- Severity: Pedagogical
- Confidence: High

### קורס האלפבית · האותיות 12 עד 22 (data/letters.json)

#### P-04 · Bet says it is "a primeira letra do curso em que um ponto dentro dela decide o som", but the vav lesson already taught that a dot inside ו decides its sound
- Location: data/letters.json, bet (order 20), ensino.funcaoPt; also vav brazilianMistake.why
- Original (bet): `"{{בּ}} é a primeira letra do curso em que um ponto dentro dela decide o som."`; (vav): `"Esta é a única letra do alfabeto com três funções."`
- Problem: In lesson 8 the learner was told וּ (dot inside) = "u". The shuruk dot is not a dagesh, but visually it is "um ponto dentro", and the learner will see the contradiction. Also the shin/sin dot changes the sound (taught in lesson 4). Separately, "a única letra ... com três funções" is overstated: י also works as consonant and as a vowel letter for i (ִי) and e (ֵי), and א/ה serve as vowel letters too.
- Correct version (bet): "{{בּ}} é a primeira letra em que o daguesh, o ponto dentro da consoante, muda o som da própria consoante. (No {{וּ}} o ponto dentro era outra coisa: um sinal de vogal.)" (vav): "É a letra com mais funções do alfabeto ..." or simply "uma letra com três funções".
- Severity: Pedagogical
- Confidence: High

#### P-05 · Bet: "o mesmo sinal que você viu no ג, no ד e no ת" ignores the many dots the learner has already met
- Location: data/letters.json, bet (order 20), ensino.detalhePt
- Original: `"Esse ponto tem nome, daguesh, e é o mesmo sinal que você viu no {{ג}}, no {{ד}} e no {{ת}} sem mudar nada."`
- Problem: Earlier lessons in this slice already show dagesh in many other letters: מַזָּל (ז), מִטָּה (ט), כִּסֵּא (ס), חַלּוֹן (ל), חֲמִשָּׁה (ש), טִיּוּל (י). Saying the sign was seen only in ג/ד/ת invites the question "and what was it doing in מַזָּל?". A half sentence would close the gap.
- Correct version: add: "Você também já viu esse ponto em outras letras (מַזָּל, כִּסֵּא): ali ele não muda nada na pronúncia de hoje. Só em {{ב}}, {{כ}} e {{פ}} ele troca o som."
- Severity: Pedagogical
- Confidence: High

#### P-06 · No rule of thumb for בכ"פ in unpointed text
- Location: data/letters.json, bet / kaf / pe (orders 20 to 22), ensino (all fields)
- Original: `"Por enquanto, a regra desta lição é uma só: ponto dentro, B."` (and the K and P equivalents)
- Problem: The three lessons teach only "look for the dot". The learner is never told the most useful fact for reading without nikud: at the start of a word, ב/כ/פ are almost always b/k/p (with exceptions after prefixes like וּ/בְּ/לְ/כְּ/שֶׁ, and in loanwords). This may be covered in lesson 20 ("contraste") in modules.json/extras.json, which is outside this slice; if not, it is a gap.
- Correct version: one line in padraoPt of pe: "Dica: no começo da palavra, quase sempre é B, K e P; no fim da palavra, quase sempre V, CH e F."
- Severity: Pedagogical
- Confidence: Medium (did not verify lesson 20 content)

#### P-07 · Bet and pe "Brazilian mistakes" are not Brazilian mistakes
- Location: data/letters.json, bet (order 20) brazilianMistake and ensino.paraBrasileiroPt; pe (order 22) brazilianMistake
- Original (bet): `"Deixar o B escorregar para um V e dizer \"avá\" em vez de {{אַבָּא}}."`; (pe): `"Soprar o P e ler {{פֶּה}} quase como \"fe\"."`
- Problem: Brazilian Portuguese has full stops [b] and [p] in all positions; it does not lenite B to V (that is a Spanish-speaker habit) or P to F. The real Brazilian risk in these lessons is reading by the letter shape and ignoring the dot (reading בּ as V or ב as B), or for P, aspiration is not an issue either. The box spends attention on a non-problem.
- Correct version (bet): `"wrong": "Ignorar o ponto e ler toda {{ב}} do mesmo jeito."`, `"right": "Ponto dentro: B (\"abá/ába\"). Sem ponto: o outro som, da próxima lição."` Similar for pe.
- Severity: Pedagogical
- Confidence: Medium

#### P-08 · Vav lesson: no wordsToRead word has a consonantal ו
- Location: data/letters.json, vav (order 12), wordsToRead
- Original: `שָׁלוֹם, תּוֹדָה, יוֹם, מוֹרֶה, גָּדוֹל, הוּא, הִיא`
- Problem: All seven are ו as a vowel (or no ו at all: הִיא). The lesson's own first function, "como consoante, ela é o V de vaca", is never practised in reading words (only in syllables and in wordsToRecognize וְגַם, וֶרֶד, עַכְשָׁיו). הִיא has no ו and does not belong in a vav reading list. Words with letters already taught and consonantal vav exist: וֶרֶד, וְגַם, וְלֹא? (לֹא yes), שָׁוֶה (shavé, "vale / igual"), עַכְשָׁיו needs ע and כ (later).
- Correct version: add וֶרֶד and וְגַם to wordsToRead (all letters known), and replace הִיא with a ו-word.
- Severity: Pedagogical
- Confidence: High

#### P-09 · Het: "o primeiro som que NÃO existe em português" vs "o mesmo som do R carioca"
- Location: data/letters.json, het (order 14), soundNotePt vs ensino.funcaoPt and checagem[2]
- Original: `"O mesmo som raspado do R carioca, mas mais forte e prolongado."` vs `"é o primeiro som deste curso que NÃO existe em português"`
- Problem: Contradictory framing in the same entry. In fact the voiceless uvular/velar fricative [χ]/[x] does exist in Brazilian Portuguese as the carioca (and many other regions') R of "rato", "carro". Israeli ח and Brazilian "rr" are very close; the honest message is "you already have it", which is also more encouraging. The vf item (`"O som do {{ח}} existe em português."`, certa false) teaches the opposite.
- Correct version: "Você já tem esse som: é o R de \"rato\" e \"carro\" na pronúncia carioca, só que mais forte e mais longo. O que não existe em português é escrever esse som com uma letra própria." Rephrase or remove the vf item.
- Severity: Pedagogical
- Confidence: Medium

#### P-10 · Het lesson does not say that ח and כ (chaf) are the same sound in Israeli Hebrew
- Location: data/letters.json, het (order 14), ensino
- Original: (absent)
- Problem: The course states the ט/ת, ק/כּ and א/ע mergers in their lessons, but the het lesson never anticipates that כ without dagesh will sound identical (it is said only later in kaf variantes and translit.json rules). One line here gives the full picture and also explains why both are transliterated "ch".
- Correct version: add to detalhePt: "Mais adiante você vai conhecer outra letra que, sem ponto, faz exatamente este som. No hebraico de hoje as duas soam igual." Optionally: "Falantes de origem mizrahi ainda pronunciam o {{ח}} mais fundo, na faringe."
- Severity: Pedagogical
- Confidence: High

### קורס האלפבית · ניקוד, תעתיק, מודולים וטקסטים

#### P-11 · "ch" for ח/כ will be read as "x" by Brazilians
- Location: translit.json consonants "ח": "ch", "כ": "ch", "ך": "ch"; rules[4]
- Original: "ch representa tanto ח quanto כ/ך - som de 'r' carioca raspado"
- Problem: In Portuguese "ch" is [ʃ] (chá, chave), the same sound the course writes as "sh". Unless the reader is told otherwise, "chaver", "léchem", "achshav" and "mishpachá" will come out as "xaver", "léxem", "axshav" and "mishpaxá". The app's own code says so (app/src/lib/engine/types.ts, normalizeLoose: "O \"ch\" do português soa como o שׁ"). "ch" is the traditional Jewish-Brazilian spelling (Pessach, Chanucá), so keeping it is defensible, but only with a very visible warning on every early appearance. Also, the typed-answer grader accepts "kh" and "rr" but not "h" ("mishpaha", "Hanuká" style), which many Brazilians use.
- Correct version: Keep "ch", but show a one-line reminder ("ch = r raspado, nunca o ch de chá") in the transliteration legend and on the first lessons with ח/כ. Consider also accepting "h" for ח in typed answers.
- Explanation: This is the single biggest risk of wrong pronunciation coming from the transliteration.
- Severity: Pedagogical
- Confidence: High

#### P-12 · The shva explanation says "very brief e", but the course's own words have a full [e]
- Location: nikud.json, sounds[5] (sheva), ptApprox + note; translit.json vowels "ְ": "" and rules[0]
- Original: "Não é uma vogal de verdade. Marca que a consoante vem sem vogal, ou com um apoio tão curto que quase não se ouve. Em {{מְנַהֵל}} soa como um \"e\" muito breve."
- Problem: In Israeli speech, the shva in מְנַהֵל, מְדַבֵּר, בְּבַקָּשָׁה, נְשִׁיקוֹת, מְקָרֵר and רְחוֹב is a full, normal [e], and the course itself writes "medaber", "bevakashá", "neshikot", "mekarer", "rechov". Words like "zman", "slichá", "glidá", "ktsat" and "shtáyim" have no vowel at all. Neither file gives the learner any way to predict which happens. The translit vowel table maps ְ to "" with no exception, and the only rule mentions shva at the end of a syllable. (bonus.json has a "sheva no começo soa e" tip, but that over-predicts: zman, slichá, glidá, ktsat.)
- Correct version: "O sheva às vezes não tem som nenhum (זְמַן zman, סְלִיחָה slichá) e às vezes soa como um E normal, principalmente nos prefixos {{בְּ}} {{וְ}} {{לְ}} {{מְ}}, e quando a letra seguinte é ר, ל, נ, מ ou uma gutural (מְדַבֵּר medaber, בְּבַקָּשָׁה bevakashá, רְחוֹב rechov). A transliteração mostra qual é o caso." Also add one sentence to translit.json rules saying that a pronounced shva is written "e".
- Explanation: The description is not wrong for every word, but "muito breve" and "quase não se ouve" mislead about modern pronunciation, and the rule set does not match the data.
- Severity: Pedagogical
- Confidence: High

#### P-13 · "Two signs, one sound" for kamatz with no kamatz katan caveat, while the course uses צָהֳרַיִם
- Location: nikud.json, sounds[0].note; translit.json vowels "ָ": "a"
- Original: "Dois sinais, um único som no hebraico moderno. Não se preocupe em distingui-los agora."
- Problem: Kamatz is pronounced "o" in kamatz katan words. The slice itself has צָהֳרַיִם ("tsohoráyim", translit.json and imagens-vocabulario.json), and כָּל is very frequent. A learner who follows this chart reads "tsaharáyim". bonus.json covers this later, but the core chart presents it as an absolute rule.
- Correct version: Add: "Em umas poucas palavras o {{ָ}} soa «o» (כָּל kol, צָהֳרַיִם tsohoráyim); a transliteração sempre avisa."
- Explanation: This is a legitimate simplification only if it is flagged as one.
- Severity: Pedagogical
- Confidence: High

#### P-14 · Core vowel chart omits the chataf vowels, patach gnuva and tsere + yod
- Location: nikud.json, sounds
- Original: (no entries for ֲ ֱ ֳ; no note on final חַ/עַ; no note on ֵי)
- Problem: From module 1 the learner meets ֲ (אֲנִי, a module 1 goal word), then חֲמִשָּׁה, צָהֳרַיִם, patach gnuva in תַּפּוּחַ, שָׂמֵחַ and מַפְתֵּחַ (pronounced "-ach" before the consonant), and tsere + yod as "ei" (אֵיפֹה eifo, אֵין ein, אַחֲרֵי acharei). translit.json handles all of these, but the chart that teaches the signs says nothing about them.
- Correct version: Add ֲ = a, ֱ = e, ֳ = o under their sounds ("sheva com vogal ao lado: soa como a vogal"), a note that final חַ/עַ is read "ach/a" (תַּפּוּחַ tapúach), and a note that ֵי is often "ei".
- Explanation: The chart is meant to be the reference, and the first word of the course (אֲנִי) already uses a sign that is not in it.
- Severity: Pedagogical
- Confidence: High

#### P-15 · "h" for ה will be silent for a Brazilian reader
- Location: translit.json consonants "ה": "h"; all texts ("hi", "hu", "hayom", "hai", "hiné", "hakélev", "hahar")
- Original: "ה": "h"
- Problem: In Portuguese, initial h is silent (hora, hoje). "hayom" -> "ayom", "hai" -> "ai", "hu" -> "u". In modern Israeli speech ה is often weak too, but in careful speech it is pronounced [h], and the course audio presumably has it.
- Correct version: Keep "h", and add to the legend: "h = som aspirado do inglês «house», como o rr carioca bem leve; nunca mudo como em «hora»."
- Explanation: The transliteration's stated goal is that a Brazilian reading aloud by Portuguese rules gets it right, and this letter breaks that goal.
- Severity: Pedagogical
- Confidence: Medium

#### P-16 · Final m/n nasalization, ti/di palatalization and unstressed final e
- Location: translit.json and all transliterations (e.g. "shalom", "yom", "makom", "Tom", "naim", "katan", "Natan"; "tiyul", "ti", "di", "student", "dakot"; textos.json modulo 5 revisão "vete")
- Original: "hiné kafé vete." (textos.json modulo 5 revisão, linha 1), "shalom", "naim"
- Problem: A Brazilian reads final -m/-n as nasal vowels ([ʃaˈlõ], [naˈĩ], [tõ]), "ti/di" as [tʃi]/[dʒi], consonant-final words with an epenthetic [i] ("dakotchi"), and unstressed final e as [i]. "vete" (וְתֵה) will be read [ˈvetʃi]; the stress is on the final syllable.
- Correct version: Add a short legend: "m e n no fim são consoantes de verdade, feche a boca/encoste a língua; t e d nunca viram tch/dj". For וְתֵה write "veté" (the accent rule already does this for moré, kafé).
- Explanation: These are predictable Portuguese reading habits that the declared convention does not address.
- Severity: Pedagogical
- Confidence: High

#### P-17 · Module 6 promises that position tells you the sound of ב/כ/פ in unpointed text
- Location: modules.json, mod6 introPt and milestonePt
- Original: "agora vai vê-las sem ele, no meio e no fim da palavra, onde o ponto quase nunca aparece." / "No fim deste módulo você lê uma palavra sem nikud e acerta o som das letras com ponto pelo lugar em que elas estão."
- Problem: Word-final position is reliable (ך ף = ch/f, final ב = v). Word-initial is mostly b/k/p, but not after a prefix: וְכֶסֶף vechésef, בְּבַקָּשָׁה bevakashá, both in this course. The middle of a word is not reliable at all: dagesh is very common there (אַבָּא, שַׁבָּת, מִשְׁפָּחָה, סַבָּא, כִּסֵּא, תַּפּוּחַ). The same unpointed ספר is séfer, sapár or sipér. So the claim that the dot "quase nunca aparece" in the middle is false, and the milestone over-promises.
- Correct version: "No começo da palavra, quase sempre b/k/p; no fim, sempre v/ch/f; no meio, depende da palavra, e é preciso conhecê-la."
- Explanation: This is a dangerous simplification because it builds a wrong reading strategy.
- Severity: Pedagogical
- Confidence: High

#### P-18 · Mission 6 asks for the reading of unpointed ספר and accepts only one answer
- Location: missoes.json, modulo 6, passos[2] (transliterar, semPontos)
- Original: "he": "סֵפֶר", "semPontos": true, "promptPt": "Na capa de um caderno, sem nenhum ponto. Escreva como esta palavra se lê."
- Problem: Unpointed ספר can be séfer (book), sapar (barber), sfar (frontier), safar/siper (verbs). The context "capa de um caderno" does not even fit "book" well. The engine (missao.ts) accepts only the single transliteration "séfer".
- Correct version: Use a word with only one reading (e.g. "סוף" or "כסף" in context), or change the context to "Na capa de um livro" and say that the context decides.
- Explanation: The item is fair only if the context leaves one reading.
- Severity: Pedagogical
- Confidence: Medium

#### P-19 · Number words in the picture vocabulary mix genders, and the four apples contradict the gender
- Location: imagens-vocabulario.json, "אֶחָד", "אַרְבַּע", "חֲמִשָּׁה"
- Original: "אַרְבַּע" | "quatro" | "exactly four red apples in a row"; "חֲמִשָּׁה" | "cinco"; "אֶחָד" | "um"
- Problem: אֶחָד and חֲמִשָּׁה are masculine forms and אַרְבַּע is feminine (translit.json also has שְׁתַּיִם, feminine). תַּפּוּחַ is masculine, so four apples are אַרְבָּעָה תַּפּוּחִים, not אַרְבַּע. Without a note, the learner absorbs one random form per number.
- Correct version: Either use the counting (feminine) series consistently (אַחַת, אַרְבַּע, חָמֵשׁ) with abstract images such as dots or fingers, or keep the apples and use the masculine forms (אֶחָד, אַרְבָּעָה, חֲמִשָּׁה), with a gloss note "(forma usada com palavras masculinas)".
- Explanation: Number gender is taught later (A1 Unit 19); the alphabet course should not lay down a contradiction first.
- Severity: Pedagogical
- Confidence: High

#### P-20 · Inconsistent description of the ח sound across files
- Location: modules.json mod3 introPt; translit.json rules[4]; modules.json mod2 introPt
- Original: "O {{ח}} traz o primeiro som que o português não tem - o raspado da garganta, como o J espanhol de \"Juan\"." vs "som de 'r' carioca raspado"
- Problem: One file says Portuguese lacks the sound; the other says it is the carioca R. For many Brazilians (Rio, much of the country) the initial R of "rato" or "carro" is [χ]/[x], which is a very good model for ח/כ, and the most useful hint for this audience. Meanwhile mod2 describes ר as "o R francês", which is uvular, so learners need to be told the two are different.
- Correct version: In mod3: "como o R de \"carro\" no sotaque carioca, ou o J espanhol de \"Juan\", só que mais raspado". Keep ר as "R francês, vibrando".
- Explanation: Use one consistent model, and the one that is closest for this audience.
- Severity: Pedagogical
- Confidence: Medium

#### P-21 · The module 1 text claims only the six module letters are used, but it contains ו
- Location: textos.json, modulo 1 revisão "Na praia", introPt and the last line; also the modulo 2 revisão (שָׁלוֹם, תּוֹדָה, דּוֹדָה, הוּא before vav is taught in module 3)
- Original: "Tudo aqui usa só as seis letras do módulo e as palavras que você já leu nas lições." / "הַיּוֹם יוֹם יָם!"
- Problem: יוֹם contains the letter ו. If the course deliberately treats וֹ/וּ as vowel signs (nikud.json lists them), the claim is defensible, but the intro says "seis letras".
- Correct version: "...só as seis letras do módulo, os sinais de vogal (incluindo {{וֹ}} e {{וּ}}) e as palavras..."
- Explanation: A learner who counts the letters will think something is wrong.
- Severity: Pedagogical
- Confidence: Low

#### P-22 · A true/false item that depends on an inference
- Location: textos.json, modulo 1 revisão, perguntas[2]
- Original: "q": "A Maya prefere o mar ao chá.", "certa": true
- Problem: The text only has "תֵּה? הִנֵּה הַיָּם!" ("Chá? Olha o mar ali!"). Whether this means she prefers the sea is an interpretation. A careful reader could answer "false/not stated".
- Correct version: "A Maya fala do mar." (true), or "A Maya pede chá." (false)
- Explanation: Comprehension items should be answerable from the text itself.
- Severity: Pedagogical
- Confidence: Medium

#### P-23 · Only masculine forms in the model sentences, without a note
- Location: sentences.json "ani-lomed", "ani-medaber-ivrit", "shalom-ma-shlomcha"
- Original: "אֲנִי לוֹמֵד", "אֲנִי מְדַבֵּר עִבְרִית", "מָה שְׁלוֹמְךָ"
- Problem: About half the buyers are women and will repeat "ani lomed". "ani-rotse-maim" has a gender note ("Uma mulher diz {{רוֹצָה}}, rotsá."), but these three do not.
- Correct version: Add notes: "Uma mulher diz {{לוֹמֶדֶת}}, lomédet"; "{{מְדַבֶּרֶת}}, medabéret"; "para uma mulher: {{מָה שְׁלוֹמֵךְ}}, ma shloméch".
- Explanation: This keeps the course consistent with its own good practice in "ani-rotse-maim".
- Severity: Pedagogical
- Confidence: High

### מידע על העברית, היסטוריה ותרבות (כולל extras.json והיסטוריית A1)

#### P-24 · "Um símbolo para cada som" and "não há uma letra para cada vogal" ignore how Hebrew actually spells
- Location: data/culture.json, "de-onde-vem" bodyPt[2]; "sem-maiusculas" bodyPt[1]; "de-onde-vem-o-nikud" bodyPt[0]
- Original: "mas a ideia por trás delas - um símbolo para cada som - é exatamente a mesma." ; "Não há uma letra para cada vogal: as vogais são os sinais, e na maior parte dos textos do dia a dia elas nem aparecem." ; "Durante a maior parte da sua história, o hebraico foi escrito só com consoantes."
- Problem: Hebrew script is an abjad: vowels are mostly unwritten, one letter can have two sounds (בּ/ב, כּ/כ, פּ/פ, שׁ/שׂ) and one sound has several letters (ט/ת, כ/ק, ח/כ, א/ע, ס/שׂ, ב/ו), which the course itself teaches in extras.json ("Duas letras, um som só"). Also ו, י (and א, ה) do serve as vowel letters (matres lectionis), already in biblical times, and they are exactly what makes the unpointed text of modules 6 and 7 readable (שלום, טוב, עיר). "Só com consoantes" and "as vogais são os sinais" set the learner up to be surprised by ktiv male.
- Correct version: "de-onde-vem": "...mas a ideia por trás delas - letras que representam sons, e não ideias - é a mesma." "sem-maiusculas": "Não há letras próprias para todas as vogais: elas são os sinais do nikud, que no dia a dia não aparecem. O que aparece são as letras ו e י, que fazem as vezes de O/U e de I." "nikud": "...foi escrito sem sinais de vogal, só com as letras (algumas delas, como ו e י, ajudando a indicar vogais)."
- Severity: Pedagogical
- Confidence: High

#### P-25 · The dagesh rule contradicts an example on the same page
- Location: data/extras.json, dagesh.rulePt and dagesh.letters[0].hardWords[1]
- Original: "Ele aparece no começo da palavra e depois de consoante; some entre vogais e quase sempre no fim." with hardWords[1] "אַבָּא" (abá)
- Problem: אַבָּא has the dagesh between two vowels (dagesh chazak), as do many common words (סַבָּא, and loanwords like אוֹטוֹבּוּס from the unpointed list, סוּפֶּר, פִּיצָה). The rule as stated ("some entre vogais") is broken by the page's own example, and the unpointed list then includes אוטובוס, where the rule would predict "otovus".
- Correct version: Add: "Há exceções: palavras como {{אַבָּא}} e muitas palavras de fora ({{אוֹטוֹבּוּס}}) têm o ponto mesmo entre vogais. Nelas, o som é sempre o duro."
- Severity: Pedagogical
- Confidence: High

### A1 · יחידות 0 עד 5

#### P-26 · "Força quase sempre na última sílaba" is contradicted by this unit's own word list
- Location: u00.json gramatica[6] textoPt
- Original: "Em hebraico, a sílaba forte é quase sempre a última"
- Problem: of the 17 palavras of u00, seven are stressed on the penultimate: beséder, sabába, yála, réga, yófi, érev, láila (plus bóker, mázal in speech). "Quase sempre" sets up the learner to mis-stress them. Other common penultimate groups are not mentioned: ־ַיִם/־ַיִת (máyim, báyit, Yerushaláyim), אֵיפֹה, slang and most loanwords (télefon).
- Correct version: "Na maioria das palavras, a força está na última sílaba (to-DÁ, sha-LOM). Mas muitas palavras do dia a dia têm a força na penúltima: as do tipo בֹּקֶר / עֶרֶב, as que terminam em ־ַיִם / ־ַיִת (máyim, báyit), gírias como yála, sabába e muitas palavras estrangeiras (télefon). A transliteração marca a sílaba forte com acento."
- Explanation: dangerous simplification for a pronunciation unit.
- Severity: Pedagogical
- Confidence: High

#### P-27 · Verb and adjective tables have no transliteration and no audio in units 3 to 5
- Location: u03.json, u04.json, u05.json palavras entries with "formas" (all verbs and adjectives); rendering in app/src/app/a1/unidade/[n]/UnidadeA1Client.tsx (Palavras: formas are shown with He + gender label only)
- Original: e.g. { "pt": "verde", "formas": ["יָרֹק", "יְרֻקָּה"] }
- Problem: the course promises transliteration "sempre" in units 0 to 4, but the core new grammar words (גְּדוֹלָה, יְרֻקָּה, לוֹמֶדֶת, מְדַבֶּרֶת, קוֹרֵאת...) have none, and shva na / stress (lomdím vs lomédet, korét) is exactly where learners go wrong.
- Correct version: add a "translit" array parallel to "formas" (e.g. ["lomed","lomédet","lomdim","lomdot"]) and show it with the same Translit mode
- Explanation: level fit for self-study learners.
- Severity: Pedagogical
- Confidence: High

#### P-28 · Plural rule does not mention the stem change that the exercises require
- Location: u03.json gramatica[0]; exercicios[0] (יֶלֶד → יְלָדִים), exercicios[2] (מַחְבָּרוֹת, יְלָדוֹת)
- Original: "Masculino ganha ־ִים, feminino ganha ־וֹת: תִּיק → תִּיקִים, מַתָּנָה → מַתָּנוֹת."
- Problem: the feminine ending ־ָה / ־ֶת is replaced, not kept (מַתָּנָה → מַתָּנוֹת, מַחְבֶּרֶת → מַחְבָּרוֹת), and vowels often change (יֶלֶד → יְלָדִים, כִּסֵּא → כִּסְאוֹת). The exercises use exactly these forms without warning.
- Correct version: add: "O ־ָה ou ־ֶת do feminino cai antes do ־וֹת (מַתָּנָה → מַתָּנוֹת, מַחְבֶּרֶת → מַחְבָּרוֹת), e as vogais de dentro podem mudar (יֶלֶד → יְלָדִים). Aprenda o plural junto com a palavra."
- Explanation: prevents *מַתָּנָהוֹת / *יֶלֶדִים type errors.
- Severity: Pedagogical
- Confidence: High

#### P-29 · The first-meeting dialogue uses textbook formulas, not what Israelis say
- Location: u01.json dialogo.linhas[0] and [1]; palavras (מַה שִּׁמְךָ?, מַה שְּׁמֵךְ?, שְׁמִי…)
- Original: "שָׁלוֹם! אֲנִי דָּנִי. מַה שְּׁמֵךְ?" / "שָׁלוֹם, דָּנִי. שְׁמִי נֹעָה. נָעִים מְאֹד."
- Problem: correct Hebrew, but in everyday speech Israelis ask אֵיךְ קוֹרְאִים לָךְ? / לְךָ? and answer קוֹרְאִים לִי נֹעָה (or just אֲנִי נֹעָה). מַה שְּׁמֵךְ / שְׁמִי sound formal or bookish in a university corridor. The everyday form only arrives in u08. Also, Noa is an Israeli at what appears to be an Israeli university, and answers אֲנִי מִיִּשְׂרָאֵל, which would be odd there (she would name a city).
- Correct version: keep מַה שְּׁמֵךְ for recognition but add a note "Na rua você vai ouvir mais אֵיךְ קוֹרְאִים לָךְ? (Unidade 8)"; let Noa answer "אֲנִי מִתֵּל אָבִיב" or set the scene outside Israel.
- Explanation: naturalness of the model dialogue.
- Severity: Pedagogical
- Confidence: High

#### P-30 · Transliteration habits that Brazilian readers will misread
- Location: across u00 to u05 translit fields
- Original: examples "beséder" (u00), "kisé" (u02), "hakisot" (u03); "shalom", "naim", "atem", "aten", "hem", "hen", "léchem", "iton", "beitsim" (u01 to u05); "chag", "chaver", "léchem" (ch); "réga", "rabá", "rofé" (initial r)
- Problem: (1) single "s" between vowels is [z] in Portuguese: "beséder" will be read "bezéder", "kisé" "kizé". (2) final -m/-n nasalise the vowel: "shalom" → "shalõ", "naim" → "naĩ", "aten" → "atẽ". (3) "ch" is [ʃ] in Portuguese ("chá"); without an explicit reminder "chaver" is read "shaver". (4) initial "r" is the Brazilian strong R ([h]/[χ]), which u00 itself says is the sound of ח, not ר.
- Correct version: not necessarily a change of system; at least a short, permanent note at the top of u00 (or in the A1 Translit component): "Na transliteração: s é sempre S (nunca Z); m e n no fim são consoantes, não nasalizam; ch é o ח (R carioca), nunca o CH de chá; r é sempre o R francês, mesmo no começo." Optionally write "ss" between vowels (besséder, kissé).
- Explanation: brief item 10.
- Severity: Pedagogical
- Confidence: Medium (for item 3, the alphabet course may already explain "ch"; Low on whether a reminder is needed)

#### P-31 · Bucket label "com ה no fim" contains a form without ה
- Location: u05.json exercicios[4] (separar "Qual desenho?")
- Original: baldes ["com ה no fim", "o da Unidade 4"], item ["שׁוֹתִים", 0]
- Problem: שׁוֹתִים does not end in ה; the bucket means "verbs whose masculine form ends in ה". A literal-minded learner will put it in the other bucket.
- Correct version: "verbo como שׁוֹתֶה (com ה no fim)"
- Explanation: question clarity.
- Severity: Pedagogical
- Confidence: High

#### P-32 · Comparing ח to the carioca R may lead some learners to [h]
- Location: u00.json gramatica[0] and exercicios[0]
- Original: "o R soprado que o carioca usa em \"rato\" e \"carro\""
- Problem: many Brazilian speakers (including many cariocas) realise this R as a glottal [h], which is the Hebrew ה, not ח. The erroPt partly covers this ("Não é ... um H fraco"), so this is mainly a reminder to keep the "raspado" description prominent.
- Correct version: "o R carioca BEM raspado, no fundo da boca (se o seu R de \"carro\" for só um sopro, como H, raspe mais)"
- Explanation: accuracy of the phonetic model.
- Severity: Pedagogical
- Confidence: Medium

### A1 · יחידות 6 עד 10

#### P-33 · Grammar says possessed noun must take הַ; "a friend of mine" (חָבֵר שֶׁלִּי) is correct and very common
- Location: u06.json, gramatica[2] (tituloPt and erroPt)
- Original: "\"Meu\" vem depois, e a coisa leva הַ" / "Pôr o \"meu\" antes (שֶׁלִּי בַּיִת) ou esquecer o הַ."
- Problem: Without הַ the phrase is grammatical and means "a ... of mine": זֶה חָבֵר שֶׁלִּי ("this is a friend of mine"), סֵפֶר שֶׁלִּי ("um livro meu"). Presenting the missing הַ as an error is an overgeneralization.
- Correct version: "Para dizer 'o meu ...', a coisa leva הַ: הַבַּיִת שֶׁלִּי. Sem הַ (חָבֵר שֶׁלִּי) é 'um amigo meu'."
- Severity: Pedagogical
- Confidence: High

#### P-34 · Price rule calls the plural an "error"
- Location: u07.json, gramatica[2].erroPt; exercicios escolha "Como se fala na rua: \"custa cinco shekels\""
- Original: "Dizer \"dez shekels\" no plural. Na rua, todo israelense diz עֶשֶׂר שֶׁקֶל."; distractor "זֶה עוֹלֶה חָמֵשׁ שְׁקָלִים"
- Problem: עֲשָׂרָה שְׁקָלִים is standard correct Hebrew (the textoPt even says so), so labelling the plural "erro" contradicts the box above it. "todo israelense" is an overstatement; plural forms are also heard. The distractor חָמֵשׁ שְׁקָלִים is neither the colloquial nor the standard form (standard is חֲמִשָּׁה שְׁקָלִים); fine as a distractor, but the feedback should not imply the plural itself is wrong.
- Correct version: erroPt: "Não é erro dizer שְׁקָלִים, mas na fala o normal é o singular: עֶשֶׂר שֶׁקֶל. (Exceções: 1 = שֶׁקֶל אֶחָד, 2 = שְׁנֵי שְׁקָלִים / שְׁתַּיִם שֶׁקֶל na fala.)"
- Severity: Pedagogical
- Confidence: High

#### P-35 · Ambiguous gender labels "(a ele)", "(a ela)", "(eles)", "(elas)"
- Location: u06.json palavras "שֶׁלְּךָ" ("seu, sua (a ele)"), "שֶׁלָּךְ" ("seu, sua (a ela)"); u08.json palavras "אֵיךְ קוֹרְאִים לְךָ?" ("(a ele)"), "לָכֶם" ("para vocês (eles)"), "לָכֶן" ("para vocês (elas)"), "שֶׁלָּכֶם" ("de vocês (eles)"); u10.json gramatica[1].exemplos "Você pode vir? (a ela)"
- Problem: "seu (a ele)" can be read as "dele", which is שֶׁלּוֹ, the very next entry. "para vocês (eles)" is odd Portuguese. The same lists use "(m)/(f)" for לְךָ/לָךְ, so labelling is also inconsistent.
- Correct version: "seu, sua (falando com um homem)" / "(falando com uma mulher)"; "para vocês (homens ou grupo misto)" / "(só mulheres)". Or "(m)" / "(f)" everywhere.
- Severity: Pedagogical
- Confidence: High

#### P-36 · אוֹהֵב "vem direto com a coisa" without mentioning אֶת before a definite object
- Location: u10.json, gramatica[2]
- Original: "אוֹהֵב vem direto com a coisa, sem \"de\": אֲנִי אוֹהֵב קָפֶה."
- Problem: אֶת was taught in u05. With a definite object, אוֹהֵב needs it: אֲנִי אוֹהֵב אֶת הַיָּם. A learner following "vem direto" will write *אֲנִי אוֹהֵב הַיָּם.
- Correct version: add: "Com 'o/a', entra o אֶת da Unidade 5: אֲנִי אוֹהֵב אֶת הַיָּם."
- Severity: Pedagogical
- Confidence: High

#### P-37 · Verb forms in u09/u10 "palavras" have no transliteration
- Location: u09.json and u10.json, palavras entries with "formas" (קָם..., הוֹלֵךְ..., אוֹהֵב..., צָרִיךְ..., יָכוֹל..., יוֹדֵעַ...)
- Original: e.g. {"pt": "saber", "formas": ["יוֹדֵעַ", "יוֹדַעַת", "יוֹדְעִים", "יוֹדְעוֹת"]}
- Problem: Units 5 to 12 are in "toque" mode (TranslitA1.tsx), yet these entries offer nothing to tap. Forms with traps for a Brazilian (patach gnuva in יוֹדֵעַ "yodéa", יוֹדַעַת "yodáat", stress of קָמָה "kamá" vs past-tense "káma", צְרִיכָה "tsrichá") get no help.
- Correct version: add a translit per form, or at least for the irregular ones.
- Severity: Pedagogical
- Confidence: Medium

#### P-38 · "mudam com quem fala"
- Location: u10.json, gramatica[1].textoPt
- Original: "רוֹצֶה, צָרִיךְ, יָכוֹל, יוֹדֵעַ e אוֹהֵב mudam com quem fala (4 formas, como sempre)."
- Problem: They agree with the subject (gender and number), not with the speaker; הוּא רוֹצֶה said by a woman stays רוֹצֶה. u04 phrased it correctly ("conjuga por quem é e quantos").
- Correct version: "mudam com o sujeito: homem, mulher, homens, mulheres (4 formas, como sempre)."
- Severity: Pedagogical
- Confidence: High

### A1 · יחידות 11 עד 15

#### P-39 · בְּכַרְטִיס: the pointing says "bechartis", the transliteration says "bekartís"
- Location: u14.json palavras ("בְּכַרְטִיס", "bekartís"), dialogo.linhas[11], exercicios[14], [27]
- Original: "בְּכַרְטִיס" / "bekartís"
- Problem: the pointing is the normative one (after the בְּ prefix the dagesh kal of כַּרְטִיס drops, so כ is spirant: "bechartis"). Most Israelis actually say "bekartis". Both are defensible, but the learner who reads the niqqud gets "becha-" and the transliteration says "beka-" with no explanation.
- Correct version: keep the pointing, add a one-line note: "Pela regra do nikud se lê 'bechartis'; na rua quase todo mundo diz 'bekartis'."
- Explanation: brief item 2, where standard niqqud and speech differ, say so.
- Severity: Pedagogical
- Confidence: High

#### P-40 · אֵילוּ taught as the plural "qual" without saying it is formal
- Location: u13.json gramatica[1]; exercicios[4] dicas; exercicios[5]
- Original: "\"Qual\" concorda com a coisa: אֵיזֶה קָפֶה? (masculino), אֵיזוֹ עוּגָה? (feminino), אֵילוּ מָנוֹת? (plural)." / dicas: "סָלָטִים é plural: אֵילוּ."
- Problem: in speech Israelis almost always say אֵיזֶה סָלָטִים יֵשׁ? / אֵילוּ is written or formal register. The box does warn about אֵיזֶה replacing אֵיזוֹ, but not that אֵילוּ is the marked form, and exercise 4's dica tells a learner who chose the natural spoken form that he is simply wrong.
- Correct version: add to erroPt: "No plural, na fala, quase sempre se diz אֵיזֶה: אֵיזֶה סָלָטִים יֵשׁ? אֵילוּ é mais de texto escrito." and soften dica 1 of exercicios[4] like the dica of exercicios[3] ("Na rua você ouve אֵיזֶה, mas com cuidado é אֵילוּ").
- Explanation: register accuracy; the course teaches a garçom dialogue but drills the formal form as the only right one.
- Severity: Pedagogical
- Confidence: High

#### P-41 · "A pé é הוֹלֵךְ; de veículo é נוֹסֵעַ" stated as absolute
- Location: u12.json gramatica[1]; exercicios[3] (separar)
- Original: "O português usa \"ir\" para tudo. O hebraico separa: a pé é הוֹלֵךְ; de ônibus, trem, táxi ou carro é נוֹסֵעַ."
- Problem: the split is right when the means is mentioned, but הוֹלֵךְ is also the general "ir" when the means is not the point: אֲנִי הוֹלֵךְ לָעֲבוֹדָה, הוֹלְכִים לַסֶּרֶט, הוֹלֵךְ לַסּוּפֶּר are said by people who drive. The separar item then puts "עַד הַפִּנָּה" and "לַיָּם, חָמֵשׁ דַּקּוֹת" in the הוֹלֵךְ bucket, although נוֹסְעִים עַד הַפִּנָּה (driving directions) and נוֹסְעִים לַיָּם, חָמֵשׁ דַּקּוֹת are perfectly normal.
- Correct version: "Quando você diz COMO vai: a pé é הוֹלֵךְ, de veículo é נוֹסֵעַ. Sem falar do meio, הוֹלֵךְ também é o 'ir' de todo dia (הוֹלֵךְ לָעֲבוֹדָה)." In the separar item, replace the two ambiguous items with ones that name the means.
- Explanation: overgeneralization (brief item 5) and an ambiguous key.
- Severity: Pedagogical
- Confidence: High

#### P-42 · The ־ַיִם ending "marca o que vem em par"
- Location: u14.json sabia[0].textoPt
- Original: "O final ־ַיִם marca o que vem em par: נַעֲלַיִם (sapatos), גַּרְבַּיִם (meias), מִכְנָסַיִם (calça, que tem duas pernas)..."
- Problem: true for the dual, but the learner already knows מַיִם and will meet שָׁמַיִם, צָהֳרַיִם, יְרוּשָׁלַיִם, which end in ־ַיִם and are not pairs. Also the dual is still productive for time and quantity (יוֹמַיִם, שְׁבוּעַיִם, פַּעֲמַיִם), so "o que sobrou" undersells it.
- Correct version: add: "Nem todo ־ַיִם é par: מַיִם (água) e שָׁמַיִם (céu) só têm essa forma. E o dual ainda vive em יוֹמַיִם (dois dias) e שְׁבוּעַיִם (duas semanas)."
- Explanation: avoids a false rule.
- Severity: Pedagogical
- Confidence: Medium

#### P-43 · מְבַקֵּשׁ glossed only as "pedir" in the restaurant unit
- Location: u13.json palavras (formas מְבַקֵּשׁ...), "pt": "pedir"; exercicios[9]
- Original: "pt": "pedir"
- Problem: in the restaurant context a Brazilian will take "pedir" as "fazer o pedido" (to order food). That is לְהַזְמִין; מְבַקֵּשׁ is "pedir, solicitar" and sounds formal when ordering (the unit itself correctly orders with אֶפְשָׁר and רוֹצֶה). The verb is drilled in a table but never used in the dialogue.
- Correct version: "pt": "pedir (solicitar, ex.: אֲנִי מְבַקֵּשׁ עֶזְרָה); para fazer o pedido no restaurante se usa אֶפְשָׁר… ou אֲנִי רוֹצֶה…"
- Explanation: false-friend-like gloss (brief item 9).
- Severity: Pedagogical
- Confidence: Medium

### A1 · יחידות 16 עד 20

#### P-44 · Unit 19: compound numbers with 1 and 2 break the "um vem depois / dois encurta" rule, and this is not said
- Location: u19.json, gramatica[1] ("Um e dois têm regras próprias") and gramatica[2] ("De 11 em diante")
- Original: "\"Um\" vem DEPOIS da coisa, como um adjetivo: יֶלֶד אֶחָד, יַלְדָּה אַחַת. \"Dois\", antes da coisa, encurta: שְׁנֵי יְלָדִים…" / "Só a unidade do fim muda: עֶשְׂרִים וְשִׁשָּׁה יְלָדִים, עֶשְׂרִים וְשֵׁשׁ יְלָדוֹת."
- Problem: in a compound number, 1 and 2 behave differently: the whole number comes BEFORE the noun and 2 keeps the long form: עֶשְׂרִים וְאֶחָד יְלָדִים, עֶשְׂרִים וְאַחַת יְלָדוֹת, עֶשְׂרִים וּשְׁנַיִם יְלָדִים, עֶשְׂרִים וּשְׁתַּיִם שָׁעוֹת (not *יְלָדִים עֶשְׂרִים וְאֶחָד, not *עֶשְׂרִים וּשְׁנֵי יְלָדִים). A learner applying the two taught rules literally to "21/22" will produce wrong forms.
- Correct version: add one line to gramatica[2]: "Atenção: em 21, 22, 31… o número inteiro vem antes, e o 2 fica na forma comprida: עֶשְׂרִים וְאַחַת שָׁעוֹת, עֶשְׂרִים וּשְׁנַיִם יְלָדִים."
- Explanation: a missing exception to a rule stated as general; it is exactly the kind of error A1 learners make with ages and class sizes ("26 children" in the same dialogue).
- Severity: Pedagogical
- Confidence: High

#### P-45 · Unit 19: "עֶשֶׂר שֶׁקֶל" left without the standard form
- Location: u19.json, gramatica[0].textoPt
- Original: "O preço, na rua, continua como na Unidade 7: עֶשֶׂר שֶׁקֶל."
- Problem: right after teaching that masculine nouns take the ־ָה series, the box keeps "עֶשֶׂר שֶׁקֶל" (feminine numeral, singular noun) without saying what the standard is. That is the real spoken form, but the learner is not told that שֶׁקֶל is masculine and that the standard/written form is עֲשָׂרָה שְׁקָלִים (or עֲשָׂרָה ש״ח on a price tag, read "shékel"). A learner who now applies the new rule might write "עֲשָׂרָה שֶׁקֶל", a hybrid.
- Correct version: "O preço, na rua, continua como na Unidade 7: עֶשֶׂר שֶׁקֶל. É assim que todo mundo fala; na forma padrão, escrita, שֶׁקֶל é masculino: עֲשָׂרָה שְׁקָלִים."
- Explanation: makes the colloquial/standard split explicit, as the unit already does for "שָׁלוֹשׁ יְלָדִים".
- Severity: Pedagogical
- Confidence: High

#### P-46 · Unit 17: an "erroPt" box that describes no error
- Location: u17.json, gramatica[3].erroPt
- Original: "No Brasil o \"primeiro andar\" fica acima do térreo; em Israel também: o térreo é קוֹמַת קַרְקַע, e a קוֹמָה רִאשׁוֹנָה fica em cima dele."
- Problem: the fact is correct, but it sits in the "Erro comum" slot while saying there is no difference. It reads as a trap the learner is warned about and then told does not exist. Also קוֹמַת קַרְקַע is a smichut form shown two units before smichut is explained (fine as a chunk, but worth a gloss).
- Correct version: move it to textoPt or reword as a positive note: "Boa notícia: é igual ao Brasil. O térreo é קוֹמַת קַרְקַע (\"andar do chão\") e a קוֹמָה רִאשׁוֹנָה fica em cima dele."
- Explanation: box type mismatch; minor learner confusion.
- Severity: Pedagogical
- Confidence: High

#### P-47 · Unit 18: "O que vem em par termina em ־ַיִם" with שִׁנַּיִם, and "partes do corpo em par são femininas"
- Location: u18.json, gramatica[1].textoPt; exercicios item 4 dica "2"
- Original: "O que vem em par termina em ־ַיִם (Unidade 14): עֵינַיִם, אָזְנַיִם, יָדַיִם, רַגְלַיִם, שִׁנַּיִם. Essas partes do corpo são femininas, mesmo sem o ־ָה" / dica: "Plural, sim, mas feminino: as partes do corpo em par são femininas. כּוֹאֲבוֹת."
- Problem: שִׁנַּיִם is a dual form but teeth are not a pair; the box lists it under "o que vem em par" without comment, and a sharp learner will notice. The dica's generalization ("as partes do corpo em par são femininas") holds for the five words taught, but not universally (e.g. שַׁד/שָׁדַיִם, נְחִירַיִם are masculine).
- Correct version: "As partes do corpo que vêm em par terminam em ־ַיִם: עֵינַיִם, אָזְנַיִם, יָדַיִם, רַגְלַיִם (e também שִׁנַּיִם, dentes, que não são um par mas usam a mesma forma). Estas são femininas, mesmo sem ־ָה." Dica: "Plural, sim, mas feminino: רֶגֶל é feminina. כּוֹאֲבוֹת."
- Explanation: keeps the useful heuristic but limits it to the listed words.
- Severity: Pedagogical
- Confidence: Medium

#### P-48 · Future-tense forms נִפָּגֵשׁ used without a gloss (Units 16)
- Location: u16.json, leitura linhas[3]; exercicios item 19 (ouvir); exercicios item 27 (aberta exemplo)
- Original: "מַיָּה: סַבָּבָּה. נִפָּגֵשׁ לְיַד הַקּוֹלְנוֹעַ." / "נִפָּגֵשׁ בְּעוֹד שָׁעָה." / "…נִפָּגֵשׁ לְיַד הַקּוֹלְנוֹעַ."
- Problem: the course declares present tense only. נִתְרָאֶה is glossed as a fixed expression, but נִפָּגֵשׁ (future, 1st plural, "we'll meet") is not glossed anywhere, and palavras only has the infinitive לְהִפָּגֵשׁ. The learner meets an unexplained verb form in a reading, in a listening item and in the model answer for the writing task (which invites copying).
- Correct version: add a glossario/palavras entry: "נִפָּגֵשׁ, nipaguésh, a gente se encontra / combinado: nos encontramos (expressão fixa, como נִתְרָאֶה)".
- Explanation: level fit; one gloss solves it.
- Severity: Pedagogical
- Confidence: High

### מבחן הסיום של A1 ועברית בתוך קוד האפליקציה

#### P-49 · Exam marks "כּוֹאֵב לִי הַבֶּטֶן" wrong although Israelis say it constantly
- Location: data/a1/exame.json, partes[gramatica].itens[14]
- Original: `"q": "\"Estou com dor de barriga\"", "opcoes": ["כּוֹאֶבֶת לִי הַבֶּטֶן", "כּוֹאֵב לִי הַבֶּטֶן", "אֲנִי כּוֹאֵב הַבֶּטֶן"], "certa": 0`
- Problem: The key is normatively right and matches what Unit 18 teaches (u18 exercicios[3] and [12] also treat כּוֹאֵב לִי הַבֶּטֶן as the error). But in spoken Israeli Hebrew the impersonal masculine "כואב לי הבטן / כואב לי הגב / כואב לי היד" is extremely common, so a learner who has heard Israelis is penalized, and the course never says that the form exists.
- Correct version: keep the item but replace distractor 2 with a clearly wrong form (e.g. "כּוֹאֲבִים לִי הַבֶּטֶן"), and add to Unit 18 a note: "Na fala você vai ouvir muito כּוֹאֵב לִי הַבֶּטֶן, no masculino; na escrita e no curso, concorde com a parte do corpo."
- Explanation: distinguish normative grammar from real usage instead of teaching the learner that common speech is an error.
- Severity: Pedagogical
- Confidence: Medium

#### P-50 · Demo vowel feedback contradicted two screens later
- Location: app/src/components/landing/DemoAlef.tsx, VOGAIS[0].opcoes[2].porque (line 143), VOGAIS[2].opcoes[1].porque (line 166), ACHAR[1] (line 195)
- Original: `'O «o» vem com um ו e um ponto em cima. ...'`; `'O «e» são três pontinhos embaixo. ...'`
- Problem: The same demo then shows אֹכֶל ("óchel"), whose «o» is a dot over the Álef with no ו (cholam chaser). And «e» is also written with two dots (tsere), as in לֵב, סֵפֶר. Stated as absolute rules on the first screen a buyer sees.
- Correct version: `'O «o» é um ponto em cima: em cima de um ו (אוֹ) ou da própria letra (אֹ). ...'`; `'O «e» são pontinhos embaixo, três (אֶ) ou dois (אֵ). ...'`
- Explanation: avoid teaching a rule that the next item breaks.
- Severity: Pedagogical
- Confidence: High

#### P-51 · "Daguesh ... muda o som da consoante" overgeneralized
- Location: app/src/app/inicio/StartHereClient.tsx, PERGUNTAS_NIQQUD item 7 porque (line 134) and the box "Uma ressalva importante" (lines 400-405)
- Original: `'... o daguesh, o ponto dentro da letra que muda o som da consoante, e o ponto que distingue שׁ de שׂ. Nenhum dos dois é vogal.'`
- Problem: In modern Hebrew the dagesh changes the sound only in ב, כ, פ; in all other letters it changes nothing audible (תּ, מּ, שּׁ, לּ...). And there IS a dot inside a letter that is a vowel: וּ (shuruk), which the course teaches as "u" one screen later in the demo. The learner who learns "dot inside = daguesh, not a vowel" will misread וּ.
- Correct version: "o daguesh, o ponto dentro da letra (em בּ, כּ, פּ ele muda o som; nas outras quase não se ouve) ... Atenção: o ponto dentro do ו (וּ) é outra coisa, é a vogal U."
- Explanation: precision at the very first contact with niqqud.
- Severity: Pedagogical
- Confidence: High

#### P-52 · Mem described with a "closed leg"
- Location: app/src/components/landing/DemoAlef.tsx, OPCOES[0].porque (line 80)
- Original: `'Este é o Mem. Ele tem uma "perna" fechada à esquerda.'`
- Problem: The printed מ is characterized by a small OPENING at the bottom left (that is what separates it from ם, which is fully closed). "Perna fechada" points the eye at the wrong feature.
- Correct version: `'Este é o Mem. Ele tem uma base reta e uma pequena abertura embaixo, à esquerda.'`
- Explanation: letter-shape feedback should name the distinctive feature.
- Severity: Pedagogical
- Confidence: Medium

#### P-53 · Listening option "o nome de uma mulher"
- Location: data/a1/exame.json, partes[escuta].itens[4]
- Original: `"he": "אֵיךְ קוֹרְאִים לָךְ?", "q": "O que a pessoa perguntou?", "opcoes": ["o nome de uma mulher", "onde ela mora"]`
- Problem: "o nome de uma mulher" can be read as "a woman's name (some woman)" rather than "asked a woman her name". The item tests לָךְ (feminine you), which the wording hides.
- Correct version: `["o nome dela (falando com uma mulher)", "onde ela mora"]`, or better three options: "perguntou o nome a uma mulher / perguntou o nome a um homem / perguntou onde ela mora".
- Explanation: the second option is too easy to reject; adding the masculine option makes the item test לָךְ vs לְךָ.
- Severity: Pedagogical
- Confidence: Medium

## 🟢 OPTIONAL IMPROVEMENT (59)

### קורס האלפבית · האותיות 1 עד 11 (data/letters.json)

#### O-01 · Mem and dalet origin stories could be hedged
- Location: letters.json, mem didYouKnow; dalet didYouKnow
- Original: mem: "O próprio nome vem de máyim - água - e a forma da letra foi desenhada, há milhares de anos, a partir do desenho de uma onda." / dalet: "a forma da letra é o batente visto de lado"
- Problem: Mem from "water" and dalet from "door" are the mainstream acrophonic reconstructions, so these are acceptable; but "o nome vem de máyim" (the letter name is an old Semitic word for water, not derived from the Hebrew plural máyim) and "batente visto de lado" are more precise than the evidence. A "provavelmente" would make them safe.
- Correct version: "O nome da letra é uma palavra semítica antiga para água, parente de {{מַיִם}}, e o desenho original provavelmente representava ondas."
- Severity: Optional
- Confidence: Medium

#### O-02 · Yod: the real reason Brazilians read Y/י as J
- Location: letters.json, yod, brazilianMistake.why
- Original: "A transliteração costuma usar Y, e o brasileiro lê Y como J por influência de nomes estrangeiros."
- Problem: The stronger source of the J reading is Portuguese itself: biblical names that begin with yod are written with J (José, Jacó, Jerusalém, Josué, Jonas). Mentioning this is more convincing and helps later.
- Correct version: "...em português os nomes bíblicos com {{י}} viraram J: José, Jacó, Jerusalém. Em hebraico o som continua sendo o I de \"ioiô\": Yosef, Yaakov, Yerushaláyim."
- Severity: Optional
- Confidence: Medium

#### O-03 · Alef: glottal stop "praticamente desapareceu"
- Location: letters.json, alef, ensino.detalhePt
- Original: "no hebraico falado hoje essa parada praticamente desapareceu"
- Problem: In careful speech Israelis still often produce a glottal stop for א/ע between vowels (e.g. מְאֹד, תֵּאַטְרוֹן, in emphatic speech). "frequentemente desaparece" would be more accurate. Fine as simplification.
- Severity: Optional
- Confidence: Medium

#### O-04 · אַרְבַּע: colloquial "árba"
- Location: letters.json, resh, wordsToRecognize[2].translit
- Original: "translit": "arbá"
- Problem: Correct standard stress. In everyday speech, counting and in many expressions Israelis commonly say "árba". Could be mentioned so audio/real speech does not confuse; not an error.
- Severity: Optional
- Confidence: Medium

#### O-05 · מְדַבֵּר glossed "falo, fala" without gender
- Location: letters.json, dalet, wordsToRecognize[1].pt
- Original: "pt": "falo, fala"
- Problem: מְדַבֵּר is masculine singular only (feminine מְדַבֶּרֶת). Same for "notén" "dá, está dando" and "omer" "diz". A "(masc.)" tag would prevent a learner from using it for a woman.
- Severity: Optional
- Confidence: High

#### O-06 · Lamed: "sou" para "sol"
- Location: letters.json, lamed, ensino.paraBrasileiroPt and brazilianMistake.why
- Original: "dizemos \"Brasiu\", \"sou\" para \"sol\", \"mau\" para \"mal\""
- Problem: "sol" [sɔw] and "sou" [so(w)] differ in vowel quality; only mau/mal is a true homophone. Harmless, but "mau/mal" and "Brasiu" alone are cleaner.
- Severity: Optional
- Confidence: High

#### O-07 · Nun contrast "como um L"
- Location: letters.json, nun, contrastes.ן
- Original: "O נ tem base, como um L."
- Problem: נ is a mirrored L (base goes to the left). "como um L virado ao contrário" avoids a learner drawing it the Latin way.
- Severity: Optional
- Confidence: High

#### O-08 · Yod: "é a que faz isso com mais frequência no hebraico inteiro"
- Location: letters.json, yod, ensino.detalhePt
- Original: "e é a que faz isso com mais frequência no hebraico inteiro"
- Problem: ו is at least as frequent a vowel letter (o/u) in unpointed text. The claim is unverified; "uma das que mais fazem isso" is safe.
- Severity: Optional
- Confidence: Low

### קורס האלפבית · האותיות 12 עד 22 (data/letters.json)

#### O-09 · ע (and א) are not always fully "mudos": they break the vowels apart
- Location: data/letters.json, ayin (order 17), sound, soundNotePt, ensino.lembrePt
- Original: `"{{ע}} é mudo no hebraico de hoje: leia só a vogal."`
- Problem: Fine as a beginner simplification. But in words like מְעַט, שָׁעָה, נָעִים the ע keeps the two vowels apart (often with a light glottal stop: me'at, sha'a, na'im), and never lets them fuse into a diphthong or a single vowel. Brazilians tend to fuse ("sha" for שָׁעָה). Also final ע with patach gnuva (שָׁבוּעַ "shavúa") will come up later.
- Correct version: add: "Mas ele separa as vogais: {{שָׁעָה}} é \"sha-á\", duas sílabas, e {{מְעַט}} é \"me-át\"."
- Severity: Optional
- Confidence: High

#### O-10 · וּ / וֹ are not always vowels
- Location: data/letters.json, vav (order 12), ensino.funcaoPt / detalhePt / lembrePt
- Original: `"Com um ponto EM CIMA ({{וֹ}}), ela não é consoante nenhuma: é a vogal \"o\". Com um ponto DENTRO ({{וּ}}), é a vogal \"u\"."`
- Problem: Legitimate simplification. In pointed text וּ with its own vowel sign under it is a consonant V with dagesh (צִוָּה "tsivá", מְקַוֶּה "mekavé"), and וֹ can be consonant + o (מִצְוֹת "mitsvot"). A one-line test helps: "Se o {{ו}} com ponto ainda tem outra vogal embaixo, ele é V."
- Severity: Optional
- Confidence: High

#### O-11 · "A forma final nunca leva ponto"
- Location: data/letters.json, kaf (order 21), variantes[2].ondePt, ensino.detalhePt, checagem[2]; pe (order 22), variantes[2].ondePt, ensino.detalhePt
- Original: `"no fim da palavra - e nunca leva ponto"`; vf `"A forma final {{ך}} pode aparecer com ponto dentro."` certa false
- Problem: True for practical modern reading. Rare exceptions exist (biblical forms such as וַיֵּבְךְּ). More practically, word-final /p/ in loanwords and names is often written with a non-final פ (for example ג'יפ, in Academy-style spelling of foreign words) rather than ף, so "word-final = always f" will meet exceptions in real signs.
- Correct version: keep, perhaps soften the vf to "Em palavras hebraicas, a forma final ... nunca leva ponto."
- Severity: Optional
- Confidence: Low

#### O-12 · Letter-origin claims
- Location: data/letters.json, ayin didYouKnow, bet didYouKnow, kaf didYouKnow, pe didYouKnow
- Original: `"{{בַּיִת}} quer dizer casa - e é a origem do nome da letra."`; `"{{כַּף}} é a palma da mão, e a letra desenha a mão aberta de lado."`; `"a letra desenha uma boca aberta, com um dente."`
- Problem: The names (bet "house", kaf "palm", pe "mouth", ayin "eye") are the standard acrophonic explanation and fine. "A letra desenha" is true of the Proto-Sinaitic/Phoenician ancestors, not of the modern square letter; "com um dente" is fanciful. A learner may think the modern כ looks like a hand.
- Correct version: "o nome vem de ... e o antepassado desta letra, há uns 3.500 anos, era um desenho de ...".
- Severity: Optional
- Confidence: High

#### O-13 · Ayin: "Falantes de origem mizrahi ... produzem esse som até hoje"
- Location: data/letters.json, ayin (order 17), soundNotePt, ensino.detalhePt
- Original: `"falantes de origem mizrahi e as comunidades de língua árabe produzem esse som até hoje, e você vai ouvi-lo em Israel."`
- Problem: Accurate for Arabic-speaking citizens and for older Mizrahi (especially Yemenite, Iraqi) speakers and some singers/broadcasters; among younger Mizrahi Israelis it is now uncommon. "Origem mizrahi" in general overstates it.
- Correct version: "alguns falantes de origem mizrahi, sobretudo os mais velhos, e os falantes de árabe ..."
- Severity: Optional
- Confidence: Medium

### קורס האלפבית · ניקוד, תעתיק, מודולים וטקסטים

#### O-14 · Naturalness of three short lines
- Location: textos.json modulo 4 linha 4; modulo 3 revisão linha 6 and modulo 7 revisão linha 5; modulo 4 linha 1
- Original: "קְצָת. אֲנִי עִם תֵּה חַם." / "לֹא. הַיּוֹם שֶׁמֶשׁ." / "הַי נוֹעָה, מָה נִשְׁמָע?"
- Problem: "אני עם תה חם" is a loose colloquial calque ("I'm with a hot tea"). "אֲנִי שׁוֹתָה תֵּה חַם" uses only letters already taught in module 4 and is unambiguous. "הַיּוֹם שֶׁמֶשׁ" is telegraphic; "הַיּוֹם יֵשׁ שֶׁמֶשׁ" is more standard. "הַי" is fine pointed, but the everyday spelling is "היי".
- Correct version: "קְצָת. אֲנִי שׁוֹתָה תֵּה חַם." / "לֹא. הַיּוֹם יֵשׁ שֶׁמֶשׁ."
- Explanation: These are not errors, just more natural or clearer models.
- Severity: Optional
- Confidence: Low

#### O-15 · Letter and sign names: "qof" and "sheva" vs Israeli "kuf" and "shva"
- Location: modules.json mod4 titlePt ("Sámech, áyin, tsadi e qof"); nikud.json sounds[5] namePt "sheva" vs translit.json rules "shva"
- Original: "Sámech, áyin, tsadi e qof"; "namePt": "sheva"
- Problem: Israelis say "kuf" (קוּף) and "shva" (שְׁוָא). "qof" is the academic/biblical name. "sheva" is fine in Portuguese, but the two files disagree with each other. "Sámech" also has the "ch" = [ʃ] problem.
- Correct version: "kuf"; one spelling of shva across files.
- Explanation: Consistency with modern usage.
- Severity: Optional
- Confidence: Medium

#### O-16 · Picture alt text disagrees with the image prompt in several entries
- Location: imagens-vocabulario.json: "יַלְדָּה" (alt: yellow dress; prompt: backpack, waving), "גַּן" (alt: playground; prompt: garden with bench), "מִטְרִיָּה" (alt: closed umbrella; prompt: open under rain), "סֵפֶר" (alt: closed; prompt: open), "טֶלֶפוֹן" (alt: dark screen; prompt: lit), "לֶחֶם" (alt: pão de forma; prompt: round loaf), "קָפֶה", "אִשָּׁה", "חַלּוֹן"
- Original: e.g. "גַּן" | "Um parquinho com árvore, escorregador, balanço e caixa de areia." | "a small garden with flowers and a wooden bench"
- Problem: At most one of the two describes the actual picture. Screen-reader users may get a wrong description.
- Correct version: Re-sync imageAlt with the shipped images.
- Explanation: Accessibility, not Hebrew.
- Severity: Optional
- Confidence: Medium

#### O-17 · Mission realism
- Location: missoes.json modulo 2 passos[1] ("יֶלֶד" as a form field), modulo 4 passos[0] ("שָׁעָה" on a shop's opening hours)
- Original: "ondePt": "O campo onde vai o nome do seu filho"; "ondePt": "No horário de funcionamento de uma loja"
- Problem: A real form would say "שם הילד" or "שם התלמיד", and shop hours say "שעות פתיחה". The single words work as a reading task, but the scenes over-promise realism.
- Correct version: Keep the words; soften the scene ("um campo com a palavra...") or accept this as a simplification.
- Explanation: Realism only.
- Severity: Optional
- Confidence: Medium

#### O-18 · Transliteration table lacks the geresh letters
- Location: translit.json consonants
- Original: (no "צ׳", "ג׳", "ז׳" entries)
- Problem: The texts use "tch", "dj" and "j" (Tchile, pidjama, djel), but the canonical table does not declare them, and there is no rule for W in loanwords.
- Correct version: Add "צ׳": "tch", "ג׳": "dj", "ז׳": "j".
- Explanation: Completeness of the declared convention.
- Severity: Optional
- Confidence: High

#### O-19 · Unverifiable claim about the teacher's guide
- Location: modules.json, mod5, introPt
- Original: "O guia ensina as formas COM ponto primeiro, porque são as que o brasileiro reconhece nas palavras emprestadas."
- Problem: The guide is Israeli and not written for Brazilians, so this cannot be its reason. The order is more plausibly about frequency at the start of words.
- Correct version: "O curso ensina as formas COM ponto primeiro: são as do começo da palavra, e as mais parecidas com o B, K e P que você já conhece."
- Explanation: Attribution accuracy.
- Severity: Optional
- Confidence: Low

### מידע על העברית, היסטוריה ותרבות (כולל extras.json והיסטוריית A1)

#### O-20 · "Pronúncia sefaradi": half true
- Location: data/a1/historia.json, capitulos n 8, textoPt
- Original: "A pronúncia escolhida seguiu, em boa parte, a tradição sefaradi."
- Problem: The official choice was Sephardi for the vowels (kamatz = a, no distinction of ת/ת׳ as s) and for word stress, but the consonants that won in practice (no pharyngeal ח/ע for most speakers, uvular ר) are those of the European, largely Ashkenazi, founding population. Chapter 10 already notes the merges, so one clause would make the picture accurate.
- Correct version: "A pronúncia escolhida seguiu a tradição sefaradi nas vogais e na sílaba tônica; nas consoantes, prevaleceu o jeito de falar dos imigrantes europeus."
- Severity: Optional
- Confidence: Medium

#### O-21 · "milhões de adultos" in the ulpan
- Location: data/a1/historia.json, capitulos n 9, textoPt
- Original: "Os ulpanim, as escolas intensivas, ensinaram a língua a milhões de adultos."
- Problem: Israel received about 3.3 million immigrants from 1948 to today and not all attended an ulpan; "milhões" may be right cumulatively but I cannot confirm it, and the file's own rule is "texto curto e verificável".
- Correct version: "...ensinaram a língua a centenas de milhares de imigrantes adultos." (or cite a source for "milhões")
- Severity: Optional
- Confidence: Low

#### O-22 · Itamar Ben-Avi: two files, two strengths of claim
- Location: data/culture.json "ben-yehuda" bodyPt[1] vs data/a1/historia.json capitulos n 7
- Original: culture: "Seu filho Itamar é lembrado como a primeira criança em séculos a ter o hebraico como língua materna." ; historia: "O filho dele foi uma das primeiras crianças a crescer com o hebraico como língua materna nos tempos modernos."
- Problem: The historia wording is the accurate one (the "first native speaker" label is part of the Ben-Yehuda legend; other families in the moshavot were doing the same in the 1880s to 1890s). The culture card hedges with "é lembrado como", which is acceptable, but aligning both on "uma das primeiras" is better.
- Severity: Optional
- Confidence: Medium

#### O-23 · "Nenhuma outra língua fez o que o hebraico fez"
- Location: data/culture.json, "ben-yehuda" leadPt
- Original: "Nenhuma outra língua fez o que o hebraico fez."
- Problem: Widely repeated and essentially defensible (only case of a language without native speakers becoming the national mother tongue of millions), but other revivals exist on a small scale (Cornish, Manx). A hedge keeps it accurate.
- Correct version: "Nenhuma outra língua fez o que o hebraico fez nessa escala."
- Severity: Optional
- Confidence: Medium

#### O-24 · Alphabet genealogy simplified twice
- Location: data/culture.json, "de-onde-vem" bodyPt[0] and "duas-escritas" bodyPt[1]
- Original: "O alfabeto hebraico descende do alfabeto fenício ... O mesmo alfabeto fenício deu origem ao grego, e do grego veio o latino" ; "Depois do exílio, os judeus passaram a usar a escrita aramaica quadrada"
- Problem: Accurate at popular level. Two nuances: the Latin alphabet came from a Western Greek alphabet through Etruscan; and the square script replaced Paleo-Hebrew gradually (about 5th to 3rd century BCE), while Paleo-Hebrew kept being used for some purposes (some Dead Sea Scrolls write the divine name in it, Hasmonean and Bar Kokhba coins, and the Samaritans still use a descendant of it). Card 2 could mention "aos poucos", which would also strengthen eras.json's warning.
- Severity: Optional
- Confidence: High

#### O-25 · Dead Sea Scrolls date
- Location: data/a1/historia.json, capitulos n 2
- Original: "Os Manuscritos do Mar Morto, achados em 1947"
- Problem: First found in 1946/47; the 11 caves were found between 1947 and 1956. "a partir de 1947" is exact.
- Severity: Optional
- Confidence: High

#### O-26 · Slang examples: say where they come from
- Location: data/a1/historia.json, capitulos n 10
- Original: "tem gíria (סַבָּבָּה, יַאלְלָה), palavras do inglês (בַּי, הַלּוֹ)"
- Problem: Not wrong. Both slang words are from Arabic, which is the more interesting fact and parallels "palavras do inglês". Note הַלּוֹ may have come via German/Yiddish "hallo" as well as English.
- Correct version: "tem gíria que veio do árabe (סַבָּבָּה, יַאלְלָה), palavras do inglês (בַּי)..."
- Severity: Optional
- Confidence: Medium

#### O-27 · Hyperbole in the real-world scenes
- Location: data/real-world.json, scenes "loja-shabat", "rua-hamelech", "horario-shaa", "porta-loja"
- Original: "Quase todo comércio de Israel fecha nesse dia." ; "Numa placa de rua, em quase toda cidade do país" ; "No ponto de ônibus, acima da tabela" ; "Em Israel você vai ouvi-la umas quarenta vezes por dia."
- Problem: Shabbat closure starts Friday afternoon and is far from universal (Tel Aviv, Eilat, Arab towns); "HaMelech ..." streets are common in big cities, not almost every city; regular Israeli bus stops show lines and destinations, not departure timetables, so שָׁעָה above a table is mostly at terminals. Harmless, but a buyer who lives in Israel will notice.
- Correct version: e.g. "Boa parte do comércio fecha da sexta à tarde até o sábado à noite."
- Severity: Optional
- Confidence: Low

#### O-28 · Bonus intros: two small claims
- Location: data/bonus.json, leituras "salmo-121" introPt; "isaias-40" introPt
- Original: "dos «cânticos das subidas» que se cantavam a caminho de Jerusalém" ; "três pares de verbos, subir, correr e caminhar, sem se cansar"
- Problem: (1) The pilgrimage reading is one traditional explanation; the Talmud (Sukkah 51b) links the 15 "songs of ascents" to the 15 Temple steps. "segundo uma tradição" would be honest. (2) The verse has subir (one verb) and then two pairs (correr/não se cansar, caminhar/não se fatigar).
- Correct version: "...que, segundo uma tradição, se cantavam a caminho de Jerusalém" ; "três imagens: subir como águias, correr e caminhar sem se cansar".
- Severity: Optional
- Confidence: Medium

#### O-29 · Bible niqqud guide: two simplifications
- Location: data/bonus.json guia.secoes "kamats-katan" and "yod"
- Original: "Em umas poucas palavras, o kamats ({{ָ}}) soa «o»" ; "Depois de um chirik ({{ִ}}), o {{י}} só alonga o «i»."
- Problem: Kamatz katan is not rare in the Bible (every unstressed closed syllable: חָכְמָה, יָכְלוּ, and in these readings יִשְׁמָרְךָ, יִשְׁמָר־, which the translit handles correctly). And in modern pronunciation the י after chirik lengthens nothing; it is simply silent.
- Correct version: "Em algumas palavras..." ; "Depois de um chirik, o י não se lê: o som é só «i»."
- Severity: Optional
- Confidence: Medium

#### O-30 · Smaller wording points
- Location: data/culture.json "numeros-com-letras" sources; data/extras.json gerech.signNotePt; data/courses.json alfabetizacao outcomesPt[1]
- Original: "Sistema numérico hebraico (gematria)." ; "Ele não é acento nem pontuação" ; "Ler qualquer palavra com nikud, mesmo sem saber o que ela significa."
- Problem: Gematria is the interpretive practice of summing letter values, not the numeral system itself. The geresh is also a punctuation/abbreviation mark (ה׳, and the numeral ג׳ in the culture card), so "não é pontuação" is true only of its use with צ ג ז. "Qualquer palavra" is a slight overpromise: niqqud does not mark stress, and shva na/nach and kamatz katan are not always visible.
- Severity: Optional
- Confidence: High

### A1 · יחידות 0 עד 5

#### O-31 · אַתֶּן / הֵן in real speech
- Location: u01.json palavras (marked "reconhecer"); u03.json gramatica[4] and exercicios[13]
- Original: "\"Vocês\" se divide: אַתֶּם (homens, ou grupo misto) e אַתֶּן (só mulheres)."
- Problem: correct as norm; in colloquial speech many Israelis use אַתֶּם / הֵם for women too. A one-line note helps listening comprehension. The u01 glosses "vocês (eles)" / "vocês (elas)" are also clearer as "vocês (m. ou misto)" / "vocês (só mulheres)".
- Correct version: add "Na fala informal, muita gente usa אַתֶּם e הֵם também para mulheres."
- Severity: Optional
- Confidence: High

#### O-32 · Small naturalness points in dialogues
- Location: u00.json dialogo.linhas[6] and [7]; u03.json dialogo.linhas[5]
- Original: "בְּבַקָּשָׁה. בְּתֵאָבוֹן!" (after handing over a coffee only) / "יוֹפִי. יַאלְלָה, שָׁלוֹם!" / "אֵלֶּה מַתָּנוֹת. הֵן מִנֹּעָה וּמִדָּנִי."
- Problem: בְּתֵאָבוֹן goes with food, a bit odd for just a coffee (add a croissant, or drop it); the customer closing with יַאלְלָה, בַּיי is more typical than יַאלְלָה, שָׁלוֹם (both possible). "הֵן מִנֹּעָה" is grammatical but more natural is "זֶה מִנֹּעָה וּמִדָּנִי" / "מַתָּנוֹת מִנֹּעָה וּמִדָּנִי".
- Severity: Optional
- Confidence: Medium

#### O-33 · Gender heuristic could warn about the exceptions the learner already met
- Location: u02.json gramatica[1]
- Original: "A maioria das femininas termina em ־ָה (מְנוֹרָה) ou ־ֶת (מַחְבֶּרֶת). As outras, em geral, são masculinas. Há exceções, como כּוֹס."
- Problem: correctly hedged; but לַיְלָה (u00) is masculine despite ־ָה, and ־ִית / ־וּת (עִבְרִית, סְטוּדֶנְטִית) are also feminine endings.
- Correct version: add "e também ־ִית (עִבְרִית). Atenção: לַיְלָה é masculino."
- Severity: Optional
- Confidence: High

#### O-34 · Accepting a misspelling as a correct answer
- Location: u02.json exercicios[20] respostas ["זואת", "זאת"]
- Original: "זואת"
- Problem: זואת is not a correct spelling in either standard; accepting it silently confirms an error. Lenience is a valid product choice; if kept, feedback could say "a grafia é זאת".
- Severity: Optional
- Confidence: Medium

#### O-35 · "mazál tov" vs everyday "mázal tov"
- Location: u00.json palavras (מַזָּל טוֹב "mazál tov"); leitura.linhas[1]
- Original: "translit": "mazál tov"
- Problem: the standard stress is mazál, but the overwhelmingly common Israeli pronunciation is MÁzal tov. Brief: mention, not an error.
- Correct version: keep "mazál tov" and add "(na fala: mázal tov)"
- Severity: Optional
- Confidence: Medium

#### O-36 · Table item whose answer is identical to the base without niqqud
- Location: u05.json exercicios[0] (tabela base "שׁוֹתֶה", mulher "שותה")
- Original: ["mulher", "שותה"]
- Problem: since answers are compared without niqqud, the learner can copy the base and score; the item does not test the ־ֶה / ־ָה contrast.
- Correct version: use קוֹנֶה/רוֹצֶה only for the plural rows, or make the feminine row an escolha with pointed options.
- Severity: Optional
- Confidence: High

#### O-37 · חֶדֶר glossed "quarto, sala"
- Location: u05.json palavras
- Original: "pt": "quarto, sala"
- Problem: חֶדֶר is "room / cômodo"; "sala" in Brazil usually means living room (סָלוֹן). "cômodo, quarto" is safer.
- Severity: Optional
- Confidence: Medium

### A1 · יחידות 6 עד 10

#### O-38 · וּלְךָ? and Israeli pronunciation
- Location: u06.json, dialogo.linhas[5]
- Original: "וּלְךָ?" / "ulechá?"
- Problem: Not an error (standard niqqud). In speech most Israelis say "velechá", and the more natural question here is "וְאַתָּה?". Worth a note so the audio and the translit match what learners will hear.
- Severity: Optional
- Confidence: High

#### O-39 · Spanish comparison in the u08 "sabia" box
- Location: u08.json, sabia[0].textoPt
- Original: "É a mesma ideia do espanhol \"¿cómo te llamas?\" e do português \"como você se chama?\""
- Problem: Spanish and Portuguese use a reflexive ("you call yourself"); Hebrew uses an impersonal plural ("they call to you"). The idea is related but not "a mesma"; a closer parallel is the colloquial Portuguese "como te chamam?".
- Correct version: "Parecido com o português \"como te chamam?\": quem chama são os outros."
- Severity: Optional
- Confidence: Medium

#### O-40 · אַחֲרֵי הַצָּהֳרַיִם vs אַחַר הַצָּהֳרַיִם
- Location: u09.json, palavras, dialogo.linhas[5], leitura.linhas[3], exercicios
- Original: "אַחֲרֵי הַצָּהֳרַיִם"
- Problem: Correct and very common. The standard fixed form, which learners will see on signs and in writing (e.g. opening hours), is אַחַר הַצָּהֳרַיִם (often written אחה"צ). One line mentioning it would help.
- Severity: Optional
- Confidence: High

#### O-41 · "אֲבָל לֹא טוֹב" translated as "mas não muito bem"
- Location: u10.json, dialogo.linhas[9]
- Original: "סַבָּבָּה! אֲנִי יוֹדֵעַ לִשְׂחוֹת, אֲבָל לֹא טוֹב…" / "Beleza! Eu sei nadar, mas não muito bem…"
- Problem: The Hebrew says "not well", the Portuguese "not very well". The natural Israeli hedge is "אֲבָל לֹא כָּל כָּךְ טוֹב".
- Correct version: "...אֲבָל לֹא כָּל כָּךְ טוֹב…" (keeps the Portuguese), or pt "mas não bem".
- Severity: Optional
- Confidence: Medium

#### O-42 · Colloquial שֶׁלָּכֶם for a group of women
- Location: u08.json, exercicios escolha "Falando com a Maya e a Noa: \"a casa de vocês\""
- Original: certa "הַבַּיִת שֶׁלָּכֶן"
- Problem: Key is correct for standard Hebrew. Worth a "porque" noting that in everyday speech many Israelis use שֶׁלָּכֶם / לָכֶם even to women, so learners are not confused when they hear it.
- Severity: Optional
- Confidence: High

#### O-43 · Translit "oi" for אוֹי
- Location: u10.json, dialogo.linhas[5] and glossario
- Original: "translit": "oi"
- Problem: For a Brazilian, "oi" is the greeting "hi". The pronunciation [oj] is right, and the gloss explains it; "ói" or "oy" would avoid the false friend.
- Severity: Optional
- Confidence: Medium

### A1 · יחידות 11 עד 15

#### O-44 · Surprise party revealed in the same breath
- Location: u15.json situacaoPt and dialogo.linhas[2]
- Original: "O Dani quer organizar uma festa surpresa para a Noa..." / "סְתָם… אֲנִי רוֹצֶה לַעֲשׂוֹת מְסִבָּה בַּיָּם."
- Problem: Dani hides the reason ("סְתָם") and then tells Noa he wants to throw a beach party right after hearing her birthday, which spoils the surprise the situacaoPt sets up.
- Correct version: e.g. "סְתָם… בְּיוּנִי חַם, נָכוֹן?" (keep the party out of what he says), or drop "surpresa" from situacaoPt.
- Severity: Optional
- Confidence: High

#### O-45 · "Os nomes dos meses são os mesmos do português"
- Location: u15.json gramatica[0].textoPt
- Original: "Os nomes dos meses são os mesmos do português, com sotaque israelense."
- Problem: they are the international European names (closer to German/Russian: יָנוּאָר, יוּנִי, יוּלִי, אוֹגוּסְט), so several do not look Portuguese at all.
- Correct version: "Os nomes dos meses são os internacionais, parecidos com os do português (e mais ainda com os do alemão)."
- Severity: Optional
- Confidence: High

#### O-46 · Intervocalic s in transliteration
- Location: across the slice: "mesibá", "nesiá", "laasót", "michnasáyim", "lasapá", "hasapá", "vesalat"
- Original: "mesibá"
- Problem: a Brazilian reads single s between vowels as [z] ("mezibá"). The alphabet course writes "kissé", "késsef" for exactly this reason, but the A1 transliteration never doubles. Not wrong as a system, but the two courses disagree.
- Correct version: either adopt "ss" between vowels in A1 (messibá, nessiá, laassót) or state once in A1 that "s" is always [s].
- Severity: Optional
- Confidence: Medium

#### O-47 · בְּיוּלִי קַר לִי בְּסָאוֹ פָּאוּלוֹ
- Location: u15.json dialogo.linhas[8]
- Original: "כֵּן. בְּיוּלִי קַר לִי בְּסָאוֹ פָּאוּלוֹ."
- Problem: grammatical; slightly odd as a statement about a city's climate. The model answer in exercicios[27] already uses the more natural בְּיוּלִי בְּסָאוֹ פָּאוּלוֹ קַר.
- Correct version: "כֵּן. בְּיוּלִי קַר בְּסָאוֹ פָּאוּלוֹ." (keep קַר לִי for a personal feeling)
- Severity: Optional
- Confidence: Low

#### O-48 · "Até que horas a loja abre na sexta?"
- Location: u14.json leitura.perguntas[1].q
- Original: "Até que horas a loja abre na sexta?"
- Problem: Portuguese wording; "abre" suggests opening time.
- Correct version: "Até que horas a loja fica aberta na sexta?"
- Severity: Optional
- Confidence: High

### A1 · יחידות 16 עד 20

#### O-49 · Unit 18: colloquial default "כּוֹאֵב לִי" with any body part
- Location: u18.json, gramatica[0]; exercicios item 12 (erro "כּוֹאֵב לִי הַבֶּטֶן.")
- Original: "o verbo concorda com a PARTE DO CORPO…"
- Problem: the rule taught is the standard one and correct. In speech, though, very many Israelis use the invariant כּוֹאֵב לִי as an impersonal ("כּוֹאֵב לִי הַבֶּטֶן", "כּוֹאֵב לִי הָרַגְלַיִם"). Unit 19 explicitly warns about the parallel colloquial habit with numbers; a one-line note here would prepare the learner for what he will hear.
- Correct version: add to erroPt: "Na rua você também vai ouvir כּוֹאֵב לִי para tudo (כּוֹאֵב לִי הַבֶּטֶן). Entenda, mas fale com a concordância."
- Severity: Optional
- Confidence: High

#### O-50 · Unit 19: construct numerals (שְׁלֹשֶׁת, שְׁנֵי ה־) not covered; link שְׁנֵי to smichut
- Location: u19.json, gramatica[1] and gramatica[3]
- Original: "\"Dois\", antes da coisa, encurta: שְׁנֵי יְלָדִים, שְׁתֵּי יְלָדוֹת."
- Problem: not an error. שְׁנֵי/שְׁתֵּי are themselves smichut forms (like בְּנֵי), which the unit could point out once it teaches smichut two boxes later. The definite construct numerals (שְׁנֵי הַיְּלָדִים, שְׁלֹשֶׁת הַיְּלָדִים, שָׁלֹשׁ הַבָּנוֹת, "the two/three children") are not taught; that is a defensible A1 choice, but a "recognize only" line would help, since they are frequent (e.g. שְׁנֵיהֶם, שְׁלֹשֶׁת הַיָּמִים).
- Correct version: in gramatica[3]: "Você já conhece uma סְמִיכוּת: שְׁנֵי, שְׁתֵּי (\"dois de\")." Optional recognition note: "Para \"os três filhos\": שְׁלוֹשֶׁת הַיְּלָדִים (forma grudada do número)."
- Severity: Optional
- Confidence: High

#### O-51 · Unit 19: also accept / mention common alternatives
- Location: u19.json palavras ("בֶּן דּוֹד / בַּת דּוֹדָה"); exercicios item 11 (escrever "suco de laranja", respostas ["מיץ תפוזים"])
- Original: "בֶּן דּוֹד / בַּת דּוֹדָה"; respostas "מיץ תפוזים"
- Problem: בַּת דּוֹד is at least as common as בַּת דּוֹדָה for "prima" (both correct). For the juice, "מיץ תפוזים" is the standard; "מיץ תפוז" is also heard and could be accepted.
- Correct version: palavras "בַּת דּוֹד / בַּת דּוֹדָה (as duas formas existem)"; respostas add "מיץ תפוז".
- Severity: Optional
- Confidence: Medium

#### O-52 · Unit 18: "עֶזְרָה!" as "socorro!"
- Location: u18.json, palavras (he "עֶזְרָה!")
- Original: "עֶזְרָה!" pt "socorro! ajuda!"
- Problem: correct, but the classic shout for "socorro!" is הַצִּילוּ! (and for a medical emergency, "צָרִיךְ אַמְבּוּלַנְס!"). עֶזְרָה is more "help (needed)".
- Correct version: add "הַצִּילוּ! hatsílu! socorro!" next to it.
- Severity: Optional
- Confidence: Medium

#### O-53 · Unit 17: מִ־ before gutturals (מֵ־)
- Location: u17.json, gramatica[2]
- Original: "Para horários: מִ־ grudado no começo e עַד no fim: מִשֶּׁבַע עַד עֶשֶׂר… É o mesmo מִ־ de מִבְּרָזִיל (Unidade 1)."
- Problem: not wrong. With times the learner will immediately need מֵאַחַת, מֵעֶשֶׂר, מֵהַבֹּקֶר, where the pointing and pronunciation are מֵ־ (me-). Worth one clause.
- Correct version: "…Antes de א, ע, ה e ר, ele vira מֵ־: מֵאַחַת עַד שְׁתַּיִם."
- Severity: Optional
- Confidence: High

#### O-54 · Unit 16: Portuguese claim "acho ele vem"
- Location: u16.json, gramatica[0].erroPt
- Original: "No português falado, o \"que\" às vezes cai (\"acho ele vem\")."
- Problem: dropping "que" after "acho" is not a typical Brazilian Portuguese pattern; the example may feel strange to the target reader. The real interference risk is more likely from English ("I think he's coming").
- Correct version: "Em hebraico o שֶׁ־ não cai nunca: sem ele a frase fica quebrada (como \"acho ele vem\")."
- Severity: Optional
- Confidence: Low

#### O-55 · Unit 16 reading question wording
- Location: u16.json, leitura perguntas[1]
- Original: "A que horas fica o cinema?"
- Problem: odd Portuguese, and the answer (9h30) requires inferring that סַבָּבָּה accepts Noa's proposal.
- Correct version: "No fim, a que horas eles vão ao cinema?"
- Severity: Optional
- Confidence: Medium

### מבחן הסיום של A1 ועברית בתוך קוד האפליקציה

#### O-56 · "בְּרַכֶּבֶת" vs the more natural "בָּרַכֶּבֶת"
- Location: data/a1/exame.json, partes[escuta].itens[7] (and 4 occurrences in units)
- Original: `"אֲנַחְנוּ נוֹסְעִים בְּרַכֶּבֶת לִירוּשָׁלַיִם."`
- Problem: Not an error; Israelis normally say "ba-rakevet" (generic definite: נוסעים ברכבת / באוטובוס is pronounced ba-). Since the item is audio, the recording will reveal which one the speaker says.
- Correct version: `בָּרַכֶּבֶת`
- Explanation: naturalness of the spoken model.
- Severity: Optional
- Confidence: Medium

#### O-57 · "אֶפְשָׁר לְדַבֵּר לְאַט?" when someone speaks too fast
- Location: data/a1/exame.json, partes[comunicacao].itens[7].opcoes[0]
- Original: `"סְלִיחָה, אֶפְשָׁר לְדַבֵּר לְאַט?"`
- Problem: Correct; when the context is "she speaks too fast", the natural request is "יוֹתֵר לְאַט".
- Correct version: `"סְלִיחָה, אֶפְשָׁר לְדַבֵּר יוֹתֵר לְאַט?"`
- Explanation: naturalness.
- Severity: Optional
- Confidence: Medium

#### O-58 · Mixed pointing of infinitives (לִלְמוֹד, לֶאֱכוֹל)
- Location: data/a1/exame.json, partes[gramatica].itens[12] `"לִלְמוֹד"`, partes[comunicacao].itens[4] `"לֶאֱכוֹל"`
- Original: `לִלְמוֹד`, `לֶאֱכוֹל`
- Problem: Strict ktiv menukad is לִלְמֹד, לֶאֱכֹל; the file uses the "ktiv male menukad" style common in Israeli ulpan books. Consistent with the units (u10 has it 14 times), so not an error.
- Correct version: leave, or switch globally to לִלְמֹד / לֶאֱכֹל.
- Explanation: only a consistency/standard choice.
- Severity: Optional
- Confidence: High

#### O-59 · On-screen Hebrew keyboard has no geresh key
- Location: app/src/lib/teclado-hebraico.ts (LETRAS, FINAIS, NIKUD)
- Original: no `׳` key
- Problem: The course teaches ז׳/ג׳/צ׳ and names with geresh (MeuNome), but a learner without a Hebrew system keyboard cannot type ׳. Harmless for grading (a1-prova strips it), but a learner who wants to write ג׳ cannot.
- Correct version: add `['׳', 'guéresh']` to NIKUD or a punctuation row.
- Explanation: completeness of the input aid.
- Severity: Optional
- Confidence: High

## סיכום

**מה חזק בקורס.** הניקוד כמעט נקי לגמרי. בכל 22 האותיות לא נמצאה אף מילה מנוקדת שגויה. כל טבלאות ההטיה של A1 בהווה נכונות, צורה אחר צורה. גם יחידה 19 (מספרים עם מין וסמיכות) נכונה לכל אורכה. בכל מבחן הסיום, המפתח של שאלות הבחירה נכון. התיאור של המיזוגים בהגייה הישראלית (ט/ת, ק/כּ, ח/כ, א/ע) מדויק ומודרני. הקטעים מהתנ"ך תואמים את נוסח המסורה. העברית בדיאלוגים טבעית ברובה.

**איפה הבעיות.** הבעיות לא נמצאות בניקוד ולא בהטיות. הן מתרכזות בארבעה מקומות:
1. **הסברים שמנוסחים ככלל גורף ונשברים מול הדוגמאות של הקורס עצמו.** למשל: "השפה לא מקבלת מילת יחס", "את רק לפני ה", "הסיומת של נקבה היא תמיד ־ָה", "צורה סופית = אותו צליל", וכלל השווא והדגש.
2. **תעתיק והגייה לדוברי פורטוגזית:**
   - "ch" מסמן גם את ח/כ וגם את הצליל של ש ב"chave";
   - טעויות הטעמה (imá, abá) ושבירה של כלל ההטעמה של הקורס עצמו;
   - ג׳ שמוסבר כמו ז׳.
3. **עובדות שגויות בתיבות "הידעת?":** מזל טוב, המסורנים, ארץ ישראל, המזוזה ועוד.
4. **בדיקת תשובות צרה מדי:**
   - תרגילי בניית משפט (montar) מקבלים רק סדר מילים אחד;
   - ברשימות של תשובות מקובלות חסרות צורות נכונות וטבעיות (באות, בלילה, "אני בא מברזיל").

## ציונים (0 עד 100)

הציונים משקללים את תשעת האזורים. הם מורידים קצת יותר על בעיות שחוזרות לאורך כל הקורס (תעתיק, הטעמה, קבלת תשובות) מאשר ממוצע פשוט.

| תחום | ציון |
| --- | --- |
| Grammar accuracy | 92 |
| Hebrew naturalness | 89 |
| Spelling accuracy | 95 |
| Niqqud accuracy | 96 |
| Pronunciation accuracy | 80 |
| Quality of grammar explanations | 80 |
| Exercise accuracy | 88 |
| Answer-key accuracy | 86 |
| Pedagogical accuracy | 83 |
| Consistency | 78 |
| Suitability for foreign learners | 87 |
| **Overall linguistic quality** | **86** |

## TOP 10 MOST IMPORTANT FIXES

הסדר נקבע לפי החומרה ולפי הנזק לתלמיד. **שלושת הראשונים נמצאים בקורס האלפבית, שכבר נמכר, ולכן כדאי לתקן אותם קודם.**

1. **ג׳ מוסבר כמו ז׳ (C-01).** "gelo" ו-"jipe" נשמעים בפורטוגזית כמו ז׳. צריך "Djavan" או "dia". זה מופיע ב-`extras.json` וב-`modules.json`.
2. **"מזל טוב" מוצג כ"בהצלחה" וכברכת שלום** (מקום: האות זין). במשמעות האמיתית זה "parabéns", ואת ההבדל מ"בהצלחה" צריך להסביר.
3. **"הניקוד הומצא על ידי דוברים ילידיים"** (`culture.json`). המסורנים דיברו ארמית וערבית.
4. **כלל ההטעמה ביחידה 0 של A1** ("שני E ברצף"). שתיים מארבע הדוגמאות לא מתאימות לכלל. צריך לנסח מחדש לפי דגם המילים המלעיליות (בֹּקֶר, סֵפֶר).
5. **התעתיק "ch":**
   - **הבעיה:** אותו צירוף מסמן את ח/כ (chaver, léchem), ושיעור ה-ש מלמד ש-"CH" הוא הצליל של "chave". ברזילאי יקרא "shaver".
   - **התיקון:** צריך החלטה אחת לכל הקורס. או אזהרה בולטת כבר בשיעור הראשון, או סימן אחר (למשל "kh").
6. **imá/abá במקום ÍMA/ÁBA (M-01).** צריך לתקן ב-`translit.json`, `letters.json`, `textos.json` וב-u02, ולבדוק את ההקלטות.
7. **בדיקת התשובות:**
   - לאפשר יותר מסדר מילים אחד בתרגילי montar (u09, u10, u15, u16, u20);
   - להוסיף צורות חסרות (באות, בלילה, "אני בא/באה מברזיל", "כמה עולה");
   - להריץ בדיקה אוטומטית שבכל רשימת תשובות יש גם כתיב מלא.

   במבחן הסיום נשלפות רק ארבע שאלות לכל חלק, כך שתשובה נכונה אחת שנדחית שווה 25% מהחלק.
8. **כללי דקדוק שגויים ב-A1:**
   - "השפה לא מקבלת מילת יחס" (u04);
   - "את רק לפני ה" (u05);
   - "הנקבה תמיד ־ָה" (u09);
   - "אותו צליל" לצורות הסופיות ך/ף, ושני כללי השווא והדגש שהקוד מייצר אוטומטית (`generators.ts`, `extras.ts`, `posicao-do-ponto.ts`).
9. **עובדות שגויות בתיבות על האותיות:**
   - "ארץ ישראל מסתיימת ב-ץ";
   - "ch בא מספרדית";
   - הנון כציור של דג;
   - "ה בתחילת מילה היא ה' הידיעה";
   - "ה סופית היא כמעט תמיד a";
   - המזוזה מכילה רק את הפסוק האחרון;
   - המספרים באותיות "לפני שהיו ספרות".
10. **פירושים שגויים:**
    - בלילה מתורגם "de madrugada" (u09);
    - תא מתורגם "caixa postal";
    - אֹכֶל בטקסט בלי ניקוד הופך ל-"אכל";
    - סָבָא בלי דגש;
    - מילות הגשר ארכיאולוגיה ופסיכולוגיה נמצאות בשיעור של כּ (K), אבל נהגות עם צליל של ח. הן מתאימות לשיעור של כ רפה.

## FINAL VERDICT

**Needs significant corrections**

הנימוק: ההחלטה לא נובעת מכמות העבודה אלא מסוג הטעויות. בסיס הקורס חזק: ניקוד, הטיות, מספרים, מפתח תשובות וטקסטים מקראיים. אבל יש ארבע טעויות קריטיות ועוד 31 טעויות משמעותיות, ומורה לעברית שיבדוק את הקורס ימצא אותן מהר:
- ג׳ שנשמע כמו ז׳;
- "מזל טוב" במשמעות "בהצלחה";
- ÍMA עם הטעמה בסוף;
- כללים מנוסחים כמוחלטים שהדוגמאות של הקורס עצמו סותרות.

שלוש מהטעויות הקריטיות נמצאות בקורס האלפבית, שכבר נמכר.

החדשות הטובות: כמעט כל התיקונים הם שינויים מקומיים בטקסט, בלי שינוי במבנה. עשרת התיקונים למעלה הם עבודה של ימים בודדים, לא שבועות. אחריהם, ואחרי עבירה של דובר עברית מקצועי על הממצאים עם Confidence בינוני ונמוך, הקורס יגיע לרמה של **Ready after minor corrections**. נשארים ה-MINOR, שחלקם ניסוח ועקביות.

## נספח: כיסוי, ציונים ודפוסים לפי אזור

### קורס האלפבית · האותיות 1 עד 11 (data/letters.json)
#### Coverage
Fully read, every field: data/letters.json entries with order 1 to 11 (alef, mem, tav, nun, he, yod, gimel, dalet, shin, lamed, resh): id/order/module/lesson, letter, finalForm, nameHe, namePt, translit, sound, soundNotePt, variantes, articulacao, ensino (funcaoPt, detalhePt, paraBrasileiroPt, padraoPt, dicaLeitura, lembrePt, checagem with keys), confusableWith, contrastes, syllables, wordsToRecognize, wordsToRead, didYouKnow, brazilianMistake, audioIds, biblicalWord, bridgeWords. All pointed strings were checked by Unicode code point.
Top-level non-letter fields: letters.json is a bare JSON array of 22 letter objects; there are no top-level non-letter fields.
Consulted for reference only (not audited): data/translit.json (conventions), data/modules.json (lesson order, V1 rule, sin lesson exists in lesson 6), data/nikud.json (cholam/cholam male taught), a grep of app/src for how letter-level fields are used.
Fields "exercises" do not exist in these entries (exercises live in ensino.checagem, all checked: every key is correct and has one right option). audioIds are empty and biblicalWord is null for all 11 letters. Not covered: actual audio, UI rendering of contrastes.

#### Scores (this slice)
- Grammar accuracy: 90
- Hebrew naturalness: 95
- Spelling accuracy: 99
- Niqqud accuracy: 100
- Pronunciation accuracy: 80
- Quality of grammar explanations: 80
- Exercise accuracy: 93
- Answer-key accuracy: 98
- Pedagogical accuracy: 82
- Consistency: 78
- Suitability for foreign learners: 82

#### Patterns
1. Transliteration "ch" for ח/כ is in direct conflict with the course's own teaching of "CH de chave" for ש; needs a global decision (different symbol or an explicit, early, repeated warning).
2. Stress marks: the declared accent rule is not applied everywhere (emet, agam; imá/abá have the wrong stress for Israeli speech). An automatic check against Portuguese default-stress rules (-am/-em/-en endings, final consonants, segolates) would catch these.
3. The same word is transliterated or glossed differently in different fields (ma/má, shemesh/shémesh, ima/imá, gan: creche/jardim de infância). The translit.json "words" table should be the single source for every field, including ensino and checagem text.
4. Letter-origin curiosities (alef, mem, nun, gimel, dalet) state acrophonic/pictographic origins as certain; add "provavelmente / segundo a explicação tradicional", and note that Greek letters come from Phoenician, not Hebrew.
5. Rule summaries (lembrePt, didYouKnow) are sometimes stronger than the nuanced body text (final ה = "a"; initial ה = article). Summaries are what learners memorize; they must carry the exceptions.
6. Brazilian-error examples sometimes do not exhibit the error (mi/mĩ, dodá/djodá). Each brazilianMistake example should be a context where the Portuguese habit actually fires (syllable-final m/n/l, d/t before i).


### קורס האלפבית · האותיות 12 עד 22 (data/letters.json)
#### Coverage
Fully read, every field (nameHe, namePt, translit, sound, variantes, soundNotePt, articulacao, ensino incl. funcaoPt/detalhePt/paraBrasileiroPt/padraoPt/dicaLeitura/lembrePt/checagem, confusableWith, contrastes, syllables, wordsToRecognize, wordsToRead, didYouKnow, brazilianMistake, audioIds, biblicalWord, bridgeWords) of data/letters.json entries vav, zayin, het, tet, samekh, ayin, tsadi, qof, bet, kaf, pe. Consulted for cross-checks only: data/translit.json (conventions and word table), data/modules.json (lesson order), letters.json entries mem, tav, nun, shin, dalet, resh, alef (contrastes, variantes, lesson numbers), extras.json grep for מֶלֶךְ. Not covered: content of lessons 15, 17, 19, 20 (vet/chaf/fe/contrast) in extras.json, which may already contain the בכ"פ rule of thumb; audioIds are all empty so no audio checked.

Niqqud of every pointed word in the slice was checked and found correct (e.g. וָו, זַיִן, חֵית, טֵית, סָמֶךְ, עַיִן, צָדִי, קוֹף, בֵּית, כַּף, פֵּא, צָהֳרַיִם, מִטְרִיָּה, טִיּוּל, כִּסֵּא, אוֹטוֹבּוּס, בְּבַקָּשָׁה, מִשְׁפָּחָה, לָלֶכֶת, צָרִיךְ, כִּתָּה, כַּדּוּר). Unpointed bridge-word spellings are standard. Translations are accurate.

#### Scores
- Grammar accuracy: N/A (no grammar taught in this slice beyond letters)
- Hebrew naturalness: 95
- Spelling accuracy: 98
- Niqqud accuracy: 100
- Pronunciation accuracy: 85 (אַבָּא stress, one pitá, otherwise accurate and correctly modern-Israeli on the ט/ת, ק/כּ, ח/כ, א/ע mergers)
- Quality of grammar explanations: 82 (letter/sound explanations; Spanish "ch", sin omission, dot-inside contradiction)
- Exercise accuracy: 90
- Answer-key accuracy: 92 (checagem keys right; "abá" in the bet key; het vf on "não existe em português" debatable)
- Pedagogical accuracy: 82
- Consistency: 78 (Q vs k, "próxima lição" vs words already listed, contrast descriptions disagreeing between entries, "ponto dentro" first vs vav)
- Suitability for foreign learners: 88

#### Patterns
1. Curiosity boxes (didYouKnow) carry most of the factual slips: מזל טוב meaning, אֶרֶץ יִשְׂרָאֵל ending, "you can already read both words" when a letter is still missing. Re-check every didYouKnow against (a) the facts and (b) which letters the learner has at that lesson.
2. Shape descriptions (contrastes) are written per entry and contradict each other across entries (ר corner, ו head, נ foot direction, ת foot). Write one canonical shape description per letter and reuse it.
3. Statements of "what you have/haven't learned yet" drift from the real lesson order (sin already taught, ם in lesson 1, מֶלֶךְ "next lesson" while listed now, בֵּית before ב). A build-time check of each Hebrew word in a lesson's prose against letters already taught would catch these.
4. Transliteration stress: the declared rule (Portuguese stress rules) is not applied to words ending in -am (vegam, olam), and colloquial vs normative stress is chosen inconsistently (láma/ótobus colloquial, abá/imá/pitá not). Decide on colloquial Israeli stress and re-run translit.json.
5. "Brazilian mistake" boxes sometimes describe Spanish-speaker errors (B to V, P to F) rather than Brazilian ones; the real Brazilian traps (intervocalic s to z, final z devoicing, ti/di palatalisation, nasalisation before m/n, ignoring the dot) are the ones to keep.


### קורס האלפבית · ניקוד, תעתיק, מודולים וטקסטים
#### Coverage

Fully read, every entry:
- nikud.json (intro, all 6 sound groups and 11 signs, dagesh)
- translit.json (system, notes, consonants, vowels, matres, rules, all words entries)
- modules.json (all 7 modules, 27 lessons, intros, goals, milestones)
- sentences.json (all 23 sentences and word breakdowns)
- textos.json (all 12 texts, every line, novas and pergunta)
- missoes.json (all 7 missions, all steps and distractors)
- imagens-vocabulario.json (all 102 words: Hebrew, pt, alt, prompt)

Checked as context only: app/src/components/learn/LinhasDeLeitura.tsx (stripNikud for semPontos), app/src/lib/engine/missao.ts and types.ts (transliteration grading), bonus.json (sheva, chataf, kamatz katan tips), to judge the findings above.

Verified as correct (not flagged): dagesh rule for בכפ; position and form of cholam (chaser above left, male on vav), shuruk and kubutz; segol/tsere and patach/kamatz merged in modern speech; שׁ/שׂ dot side; final forms; ד vs ר corner; dagesh omitted after a vowel prefix (וְתֵה, וְכֶסֶף, בְּבַקָּשָׁה); וְ (not וּ) before שׂ; article with compensatory lengthening (הָהָר, בָּעִיר, בָּרְחוֹב); מִיִּשְׂרָאֵל; שְׁלוֹמְךָ, לָךְ, לְךָ; patach gnuva transliterations (tapúach, saméach, maftéach); צָהֳרַיִם = tsohoráyim; all geresh loanword spellings except the two noted.

Not covered: the answer keys of the missions beyond what missao.ts derives from the data (accepted transliterations come from letters.json, which belongs to another slice).

#### Scores

- Grammar accuracy: 95
- Hebrew naturalness: 88
- Spelling accuracy: 90
- Niqqud accuracy: 93
- Pronunciation accuracy: 78
- Quality of grammar explanations: 74
- Exercise accuracy: 88
- Answer-key accuracy: 92
- Pedagogical accuracy: 76
- Consistency: 70
- Suitability for foreign learners: 78

#### Patterns

1. Stress is taught through Portuguese accent marks, but they are applied inconsistently (imá/aba/Ima, naim/naím, meat/meát, Dani, tsadi, bair, haotobus). One pass applying the declared rule to every transliteration would fix most of these.
2. The transliteration convention does not address the predictable Brazilian misreadings: ch = [ʃ], silent h, nasal final m/n, ti/di palatalization, unstressed final e. A short, always-visible legend would cover all of them.
3. The vowel chart in nikud.json and the rules in translit.json are simpler than the data they describe: shva na/nach, kamatz katan, chataf vowels, patach gnuva and tsere-yod are all handled in the data and in bonus.json, but not in the core reference.
4. Texts shown without niqqud must be authored in plene spelling (אוֹכֶל, not אֹכֶל), or the stripped text will contain non-standard forms. A validator rule could flag ֹ on a consonant other than ו inside semPontos texts.
5. Mixed spelling conventions for the same item: נוֹעָה/נֹעָה, prefix hyphenation, sheva/shva, Unicode mark order. Normalizing the data once would remove a whole class of matching bugs.
6. Default masculine forms without the feminine counterpart. "ani-rotse-maim" already shows the right practice.


### מידע על העברית, היסטוריה ותרבות (כולל extras.json והיסטוריית A1)
#### Coverage
Fully read, every entry: data/bonus.json (note, all 21 leituras, guia with all 9 secoes), data/extras.json (dagesh, finals, unpointed, gerech, all 7 sons lessons), data/culture.json (all 10 cards), data/eras.json, data/biblia.json, data/real-world.json (all 17 scenes), data/courses.json (linguistic and factual claims of all 4 courses), data/a1/historia.json (all 10 chapters).
Checked outside the slice only to verify claims: data/a1/curso.json module list and a grep of data/a1/unidades for binyan/pattern terminology; grep of "gerech" across data/.
Not covered: whether culture.json "sources" fields are rendered to users (affects the "conferir formulação" finding); the sentences in sentences.json referenced by eras.json (ids "shma-israel", "ma-nishma") were not opened.

#### Scores (this slice)
- Grammar accuracy: 97
- Hebrew naturalness: 93
- Spelling accuracy: 96
- Niqqud accuracy: 99
- Pronunciation accuracy: 85 (the ג׳ "gelo" error, "gerech" spelling)
- Quality of grammar explanations: 86
- Exercise accuracy: 97
- Answer-key accuracy: 98
- Pedagogical accuracy: 85
- Consistency: 84
- Suitability for foreign learners: 90
- (Factual/historical accuracy, extra score for this slice: 86)

#### Patterns
1. The course is careful with history (Ben-Yehuda not a lone hero, paleo-Hebrew vs square script, dates hedged) but occasionally slips into an absolute ("falantes nativos", "antes de existirem algarismos", "sempre", "quase todo", "qualquer"). A pass hunting for absolutes in culture/real-world texts would catch most of the remaining issues.
2. Portuguese reference words for sounds must be checked against Brazilian phonology: G/J before e/i are [ʒ], so "gelo", "jipe" and "gerech" all mislead. The course already knows this ("daguesh", the "dj" lesson); apply it everywhere.
3. Two files often tell the same fact with different strengths (Itamar "a primeira" vs "uma das primeiras"; ך "sempre suave" vs ךָּ in the bonus; dagesh rule vs אַבָּא). When a rule is stated in extras.json, grep the bonus and A1 for counterexamples.
4. Abjad vs alphabet: several cards present Hebrew as "one symbol per sound" and "consonants only", while the course's own unpointed module relies on ו/י as vowel letters. One consistent sentence about matres lectionis would fix three cards.
5. Gender agreement in culture blurbs (חָדָשׁ with feminine nouns, מוֹרֶה for ulpan teachers): blurbs written in Portuguese drift from the Hebrew form displayed.


### A1 · יחידות 0 עד 5
#### Coverage

Fully read, every field:
- data/a1/curso.json
- data/a1/unidades/u00.json (palavras, 7 gramatica blocks, dialogo + glossario + notaPt, leitura + 3 perguntas, cultura, sabia, autoavaliacao, 25 exercicios)
- data/a1/unidades/u01.json (37 palavras, 3 gramatica, dialogo, cultura, sabia, autoavaliacao, 24 exercicios)
- data/a1/unidades/u02.json (26 palavras, 3 gramatica, dialogo, cultura, sabia, autoavaliacao, 22 exercicios)
- data/a1/unidades/u03.json (adjective/colour tables + 9 palavras, 5 gramatica, dialogo, cultura, sabia, autoavaliacao, 24 exercicios)
- data/a1/unidades/u04.json (5 verb tables + 10 palavras, 3 gramatica, dialogo, cultura, sabia, autoavaliacao, 25 exercicios)
- data/a1/unidades/u05.json (5 verb tables + 16 palavras, 4 gramatica, dialogo, cultura, sabia, autoavaliacao, 23 exercicios)
For context: data/translit.json (header, rules, start of words{}), app/src/components/a1/TranslitA1.tsx, the Palavras renderer in UnidadeA1Client.tsx; grep checks across u06 to u20 for consistency (Maya spelling, "íma", את usage, איך קוראים לך).
Verified correct (no finding): all 10 present-tense tables (גָּר, לוֹמֵד, עוֹבֵד, כּוֹתֵב, מְדַבֵּר, אוֹכֵל, קוֹרֵא, שׁוֹתֶה, קוֹנֶה, רוֹצֶה and the tabela items), all 7 adjective tables and 5 colour pairs (including אֲדֻמָּה, כְּחֻלָּה, יְרֻקָּה, שְׁחֹרָה), article forms הֶחָדָשׁ / הַחֲדָשָׁה / הָאֲדֻמָּה, prefix forms בִּירוּשָׁלַיִם, בִּבְרָזִיל, מִיִּשְׂרָאֵל, מִנֹּעָה, וּמִדָּנִי, וּגְבִינָה, all "certa" indices, all separar buckets and ligar pairs. Cultural and historical notes (Ben-Yehuda, 1,700 years, Phoenician direction of writing, Jerusalem stone 1918, flag and tallit, Tel Aviv / Altneuland 1909, אַבָּא / אִמָּא from Aramaic, בֵּית לֶחֶם, kashrut) are accurate and appropriately hedged.
Not covered: audio files themselves (could not listen); how the "completar" checker treats a full word vs the gap fragment (judged from data only).

#### Scores

- Grammar accuracy: 90
- Hebrew naturalness: 85
- Spelling accuracy: 97
- Niqqud accuracy: 92
- Pronunciation accuracy: 80
- Quality of grammar explanations: 78
- Exercise accuracy: 90
- Answer-key accuracy: 92
- Pedagogical accuracy: 82
- Consistency: 82
- Suitability for foreign learners: 85

#### Patterns

1. Rules phrased as absolutes ("a regra é uma só", "língua não leva preposição", "quase sempre na última sílaba", "dois E seguidos"). Each is a fine starting simplification that becomes wrong when stated as exclusive. Global fix: phrase them as "por enquanto / na maioria dos casos" and name the main exception.
2. Transliteration stress and spelling drift: imá vs íma, shalóm vs shalom, missing accents (matana), ambiguous diphthongs (brazilait), and "te". A script that checks every translit against the accent rule in data/translit.json, plus a cross-file dictionary of translit per word, would catch these. data/translit.json itself has אִמָּא "imá" and אַבָּא "abá", both wrong stress.
3. Portuguese-reading traps in the transliteration (intervocalic s, final m/n nasalisation, "ch", initial r) need one explicit, always-visible legend in A1.
4. Mixed menukad conventions (מָה / מַה, dagesh after the article on participial מְ). Pick one standard and apply it mechanically.
5. "completar" items whose answer is a fragment (ית, ב) and free-writing items with a single accepted wording: accept the whole word and the common reorderings.
6. Grammar tables (formas) have no transliteration or audio, while single words do: the most important new forms are the least supported.


### A1 · יחידות 6 עד 10
#### Coverage

Fully read, every field: data/a1/unidades/u06.json, u07.json, u08.json, u09.json, u10.json (palavras and formas, gramatica with erroPt and exemplos, dialogo with glossario and notaPt, leitura and perguntas, cultura, sabia, autoavaliacao, every exercise with opcoes/certa/respostas/dicas/porque/exemplo). data/a1/curso.json read for context.
Consulted for cross-checks: u04.json gramatica, u05.json (vocabulary and the אֶת box), u19.json titles, data/translit.json notes, app/src/components/a1/TranslitA1.tsx, A1Player.tsx (Montar and completar rendering).
Not covered: audio files (no audio checked), how the plene-variant generator transforms accepted answers (assumed as described in the brief).

#### Scores (slice u06 to u10)

- Grammar accuracy: 90
- Hebrew naturalness: 88
- Spelling accuracy: 95
- Niqqud accuracy: 97
- Pronunciation accuracy: 90
- Quality of grammar explanations: 82
- Exercise accuracy: 86
- Answer-key accuracy: 87
- Pedagogical accuracy: 84
- Consistency: 80
- Suitability for foreign learners: 88

#### Patterns

1. Grammar boxes state a rule as absolute where Hebrew has a second, equally common case: feminine ending (u09), possessive with הַ (u06), plural shekels as "erro" (u07), אוֹהֵב without אֶת (u10). Add the second case in one line each.
2. montar grades a single fixed order; any sentence with a movable time adverb (כָּל יוֹם, הַיּוֹם, אַחַר כָּךְ) will reject correct answers. Fix in the engine (accepted alternative orders) or in item choice.
3. Accepted-answer lists miss the feminine variant even when the course knows the learner's gender (u09 באות), and occasionally miss a correct synonym (בלילה).
4. Gender labels in glosses mix "(m)/(f)", "(a ele)/(a ela)" and "(eles)/(elas)"; "(a ele)" next to "dele" is genuinely confusing. Standardise on "falando com homem / mulher".
5. Transliteration: the stress-accent rule from translit.json is applied unevenly (missing on final-stressed -o/-a/-em words, superfluous on infinitives), and the apostrophe for ע/א is used sporadically.
6. Small cross-file contradictions (u07 "A2" vs Unit 19; u08 cultura vs dialogue on phone numbers): worth a consistency pass once all units are final.


### A1 · יחידות 11 עד 15
#### Coverage
Fully read, every field (palavras/formas, gramatica with textoPt, erroPt, exemplos, dialogo with linhas, glossario, notaPt, leitura with linhas and perguntas, cultura, sabia, autoavaliacao, every exercicio with opcoes, certa, dicas, porque, respostas, pares, baldes, itens, falas, linhas, base, antes/depois, exemplo):
- data/a1/unidades/u11.json, u12.json, u13.json, u14.json, u15.json
Read for context: data/a1/curso.json; data/translit.json (conventions); app/src/components/a1/TranslitA1.tsx; app/src/components/a1/A1Player.tsx (Montar checker, gender use); app/src/lib/engine/types.ts (normalizeTyped/normalizeLoose); grammar boxes of u07, u08, u19 (price and number-gender policy, smichut), and grep checks across other units for Haifa, תִּיק, שֵׁנָה, מֶרְץ and transliteration patterns.
Not covered: audio files/TTS output (could not hear whether the March and Haifa forms are spoken correctly); the exact Hebrew answer-matching code for completar/erro/escrever (assumed, per the brief, to ignore niqqud, final letters and punctuation).

Verified correct (no finding): all present-tense tables and formas lists; colour pairs צָהֹב/צְהֻבָּה, וָרֹד/וְרֻדָּה, אָפֹר/אֲפֹרָה, חוּם/חוּמָה, כָּתֹם/כְּתֻמָּה; הַזֶּה/הַזֹּאת/הָאֵלֶּה with ha- on both words and the זֹאת הַחֻלְצָה contrast; עוֹלֶה/עוֹלָה/עוֹלִים/עוֹלוֹת agreement and the plural of מִכְנָסַיִם/נַעֲלַיִם; אֶת only before definite objects; קַר לִי vs אֲנִי קַר; יוֹרֵד גֶּשֶׁם; impersonal plural (מַגִּיעִים, פּוֹנִים); directional ה in יָמִינָה/שְׂמֹאלָה/הַבַּיְתָה; dates בְּעֶשְׂרִים בְּיוּנִי and d/m order; feminine numerals with מַעֲלוֹת (עֶשְׂרִים וּשְׁמוֹנֶה, שְׁלוֹשִׁים וְחָמֵשׁ); שְׁלוֹשָׁה חֲדָרִים; בִּירוּשָׁלַיִם, בִּרְחוֹב, וּבַמִּטְבָּח, וּבִבְרָזִיל; יוֹם הַהֻלֶּדֶת שֶׁלִּי; the Israeli room count and ממ"ד note; Rav-Kav, shabat transport, שירות taxis; hafuch, tipping, hamsin, rain season, lunisolar calendar; Semitic cognates and Arabic loans.

#### Scores (slice u11 to u15)
- Grammar accuracy: 96
- Hebrew naturalness: 90
- Spelling accuracy: 94
- Niqqud accuracy: 94
- Pronunciation accuracy (transliteration vs Israeli speech): 84
- Quality of grammar explanations: 88
- Exercise accuracy: 88
- Answer-key accuracy: 86
- Pedagogical accuracy: 87
- Consistency: 85
- Suitability for foreign learners: 90

#### Patterns
1. Single accepted word order: "montar" checks one stored order, and short respostas lists in erro/escrever omit natural variants (לי קר, חם היום, מידה קטנה יותר). Either add an alternatives field to montar or audit every montar sentence for alternative orders; add the common colloquial orders to respostas.
2. Transliteration drifts from the course's own conventions: "ge/gi" instead of "gue/gui" (géshem, magiím, barégel), stray accents (shalóm), "ei" for a plain tsere (sheiná), single intervocalic s vs the alphabet course's "ss". A scripted check of every A1 translit field against translit.json rules would catch all of these.
3. Where standard niqqud and Israeli speech diverge (בְּכַרְטִיס, חֵיפָה), the course shows one in the pointing and the other in the transliteration with no comment. A short "na rua se diz..." note each time fixes it without touching the niqqud.
4. A few rules stated as absolutes that are only "usually": הוֹלֵךְ = only on foot, ־ַיִם = pairs, אֵילוּ as the normal spoken plural. Each needs one line naming the exception or the register.
5. Lenient spelling acceptance sometimes accepts a different word (מידי for מדי); review the variant lists for homographs, not only for plene/defective spelling.


### A1 · יחידות 16 עד 20
#### Coverage

Fully read, every field and item:
- data/a1/unidades/u16.json (palavras, 4 gramatica boxes, dialogo + glossario, leitura + 4 perguntas, cultura, sabia, autoavaliacao, 28 exercicios)
- data/a1/unidades/u17.json (palavras, 4 gramatica, dialogo + glossario + notaPt, leitura + 3 perguntas, cultura, sabia, autoavaliacao, 27 exercicios)
- data/a1/unidades/u18.json (palavras, 4 gramatica, dialogo + glossario, leitura + 4 perguntas, cultura, sabia, autoavaliacao, 27 exercicios)
- data/a1/unidades/u19.json (palavras incl. all masculine numbers 1 to 10 and שְׁנֵי/שְׁתֵּי, 5 gramatica boxes, dialogo + glossario + notaPt, leitura (recipe) + 4 perguntas, cultura, sabia, autoavaliacao, 30 exercicios). Every number/noun pairing checked for gender (בָּנִים, יְלָדִים, יָמִים, אַחִים, סְפָרִים, אֲנָשִׁים m.; בָּנוֹת, שָׁעוֹת, דַּקּוֹת, בֵּיצִים, כּוֹסוֹת, אֲחָיוֹת f.), every smichut form checked (בֵּית, חֲדַר, אֲרוּחַת, תַּחֲנַת, עוּגַת, בְּנֵי, ha- placement, adjective agreement with ha-).
- data/a1/unidades/u20.json (palavras, 3 gramatica, dialogo + glossario + notaPt, leitura + 5 perguntas, cultura, sabia, autoavaliacao, 27 exercicios)
- Skimmed: data/a1/curso.json; data/translit.json (header/rules); A1Player.tsx Montar grading; TranslitA1.tsx.
- Checked as correct and not reported: all four-form verb/adjective paradigms in palavras (שׁוֹמֵעַ/שׁוֹמַעַת, שׁוֹלֵחַ/שׁוֹלַחַת with patach gnuva, מִצְטַעֵר, אַחֵר/אֲחֵרִים, מְחַכֶּה/מְחַכָּה, מוּכָן, כָּבֵד/כְּבֵדָה, כּוֹאֵב, מַרְגִּישׁ, חוֹלֶה, מֵבִין/מְבִינָה, מְאַחֵר), all tabela answer keys, prepositional לְ with עוֹזֵר/מְחַכֶּה, the dual forms, the emergency numbers 100/101/102, class letters א׳ to י״ב, the Semitic gender-polarity note.
- Not covered: audio files (ouvir/ditado audio was not listened to), rendering in the app.

#### Scores (units 16 to 20)

- Grammar accuracy: 95
- Hebrew naturalness: 90
- Spelling accuracy: 98
- Niqqud accuracy: 97
- Pronunciation accuracy: 95
- Quality of grammar explanations: 90
- Exercise accuracy: 90
- Answer-key accuracy: 91
- Pedagogical accuracy: 90
- Consistency: 92
- Suitability for foreign learners: 93

#### Patterns

1. Exercises with multiple correct answers that the engine cannot accept: "separar" buckets that overlap semantically (u20) and "montar" items whose words can be ordered more than one way (the engine accepts only the data order). Worth a pass over all units for both types; consider allowing alternative orders in montar.
2. Colloquial vs standard Hebrew: the course handles this well where it is explicit (u19 numbers, u19 הַבֵּית סֵפֶר), but the same treatment is missing in a few places: sentence-final גַּם (u16), invariant כּוֹאֵב לִי (u18), עֶשֶׂר שֶׁקֶל (u19). A consistent "Na rua você vai ouvir… / padrão:" line would cover all of them.
3. Rules stated as absolute that need one exception line: כִּי only "porque" (u16), "um vem depois" without compound numbers (u19), "partes do corpo em par são femininas" (u18), מִ־ without מֵ־ (u17).
4. Small level-fit leaks of non-present verb forms (נִפָּגֵשׁ) into readings and model answers; gloss them as fixed chunks the way נִתְרָאֶה already is.
5. Course-wide niqqud of מָה/מַה: the course uses מַה (with dagesh in the next letter) only in fixed greetings (מַה שִּׁמְךָ, but מַה נִשְׁמָע without dagesh) and מָה elsewhere (מָה קוֹרֶה, מָה זֶה). Not an error in modern pointing, but if a single standard is wanted, it should be chosen once for the whole A1.


### מבחן הסיום של A1 ועברית בתוך קוד האפליקציה
#### Coverage
Fully read:
- data/a1/exame.json (all 6 parts, every item, options, keys, accepted answers) and app/content/a1-exame.json (export check).
- data/a1/curso.json (all).
- All 519 lines of app/src (ts/tsx) containing Hebrew characters, with context where the string is user-facing.
- app/src/lib/a1-prova.ts (normalization and grading), a1.ts types and checker export, A1Player.tsx Hebrew parts, TranslitA1.tsx, GeneroA1.tsx, CertificadoA1.tsx, ExameA1Client.tsx Portuguese strings, ConcluidoA1Client.tsx.
- app/src/components/landing/DemoAlef.tsx (all exercise data and feedback), StartHereClient.tsx (niqqud, direction and comprehension sections), teclado-hebraico.ts and TecladoHebraico.tsx, lib/engine: posicao-do-ponto.ts, extras.ts (dagesh and gerech quizzes), generators.ts (all promptPt/explainPt/whyPt and the vowel-pair, variant, final-form generators), types.ts (typed-answer normalization), deck.ts, pares.ts, som-pt.ts, sons.ts, nome-hebraico.ts, ExtraLessonClient.tsx (dagesh page), BonusClient.tsx, LessonClient.tsx and SomLessonClient.tsx Hebrew parts.
- Cross-checked the data that these generators render: data/extras.json (dagesh, gerech), data/translit.json, data/letters.json names/variantes, data/nikud.json names, and the unit occurrences relevant to exam items (u07 שקל, u10 לִלְמוֹד, u18 כואב).
Not covered: Portuguese-only UI strings without Hebrew in app/src (beyond the files named above); data-driven texts in data/letters.json, nikud.json, modules.json and units, except where cross-checked (other auditors' slices); audio recordings (could not listen).

#### Scores (this slice)
- Grammar accuracy: 93
- Hebrew naturalness: 88
- Spelling accuracy: 90
- Niqqud accuracy: 90
- Pronunciation accuracy: 78 (ג׳ = [ʒ], final forms "mesmo som", shva na rule)
- Quality of grammar explanations: 75 (dagesh rule explanations)
- Exercise accuracy: 84
- Answer-key accuracy: 85 (all keys right; accepted-answer lists too narrow)
- Pedagogical accuracy: 80
- Consistency: 74
- Suitability for foreign learners: 85

#### Patterns
1. Absolute rules in feedback strings that the course's own examples break: "Mesmo som" for all final forms, "com daguesh depois de consoante" (shva na), "sem daguesh entre vogais" (dagesh chazak), "o «o» vem com ו", "daguesh muda o som". Generated explanations are static strings applied to every letter/word; they need per-case wording or a "quase sempre".
2. Typed answers are matched exactly after stripping niqqud, spaces and finals, with no generated plene variants. Every `respostas` list (exam and units) must be audited by hand for plene spelling, gendered variants (בא/באה) and common alternative phrasings.
3. Terminology drift between files: Het/Chet, Sámech/Sâmech, Lámed/Lamed, chirik/chiriq, sheva/shvá, shalom/shalóm, and "gerech" against the course's own gue/gui rule. A single source (letters.json, nikud.json, translit.json) should feed every UI string, including the keyboard.
4. Portuguese anchor words for sounds need a phonetic check against Brazilian pronunciation (gelo/jipe = [ʒ], not [dʒ]; "Chet" read [ʃ]; som-pt.ts says ח = carioca "rr" while modules.json says Portuguese has no such sound).
5. Exam items sometimes describe the speaker in the wrong person (eles/ela for אנחנו/אני); the listening part should phrase options as "a pessoa que fala".

