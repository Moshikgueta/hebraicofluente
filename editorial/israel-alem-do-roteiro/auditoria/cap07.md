# Auditoria interna: capítulo 7, Hebraico para compreender Israel

Data: 21/10/2026 (segunda rodada). Auditoria interna, feita por IA. Não é revisão acadêmica nem aprovação.

**Estado:** capítulo reescrito no padrão dos capítulos 1 e 2, com as duas seções que faltavam ("A língua que voltou a ser falada" e "Como ler uma placa trilíngue") escritas sobre fontes. Validador: 0 erros. PDF `saida/capitulo-07.pdf`: 18 páginas; `inspecionar.mjs --formato=capitulo-07`: nenhum transbordo, nenhuma página quase vazia; QR lidos de volta 2/2.

## 1. Afirmações (contagem por status)

| Status | Quantas | IDs |
| --- | --- | --- |
| VERIFICADO | 17 | C07-001, 002, 003, 004, 007, 010, 012, 014, 024, 031, 035 a 041 |
| CONTESTADO | 3 | C07-005 (Zuckermann e o "israeli"), C07-006 (data do Comitê da Língua), C07-011 (Q ou K para a letra qof) |
| NÃO VERIFICADO | 21 | C07-008, 009, 013, 015 a 023, 025 a 030, 032 a 034 (fora do texto) |
| Total | 41 | |

O texto também cita três registros de outros capítulos, todos VERIFICADO: C02-003 (Urusalim nas cartas de Amarna), C01-055 (o que é um makhtesh) e C05-013 (o "status especial" do árabe), além de C08-034 (sherut em Tel Aviv).

Fontes: 25 (`fontes/cap07.json`). Níveis: A 3 (Zuckermann; resenha no LDD; Glinert, só referência confirmada), B 12 (Academia da Língua Hebraica, ANU, UNESCO, Biblioteca Nacional de Israel, Universidade de Haifa para Katriel), C 2 (decisão HCJ 4112/99; Deuteronômio por concordância), D 4 (relatórios de Israel à ONU/UNGEGN, Ministério do Turismo), E 4 (Jewish Virtual Library, Mosaic, Encyclopaedia Judaica via Encyclopedia.com, Jerusalem Post). Nenhuma frase se apoia só em fonte E, menos o ulpan de 1949 (C07-007), fato datado com duas fontes E independentes, como o PROTOCOLO permite.

Buscas usadas neste capítulo: 20 (de 41 da rodada, somando o capítulo 8).

## 2. O que foi pesquisado e o que ficou fora

**Pesquisado e no texto:** Ben-Yehuda (datas, chegada, jornais, dicionário de 17 volumes e o intervalo 1908-1959 da Academia); o que a Academia diz sobre o hebraico deixar de ser falado no século V e seguir escrito; o Comitê da Língua (datas divergentes) e o papel do sindicato dos professores; o Mandato de 1922; a lei de 1953 e o episódio do nome "Academia"; o papel atual da Academia; o primeiro ulpan (1949); a comissão de nomes (sob o Gabinete do Primeiro-Ministro, início oficial em 1951 segundo os relatórios à ONU); a romanização e a troca anunciada de Q por K; Acre no dossiê da UNESCO; a decisão do Supremo de 2002 sobre o árabe nas placas; o nome Tel Aviv (Sokolow, votação, Achuzat Bayit); mezuzot em Dt 6:9; Katriel sobre o dúgri.

**Fora do texto, por falta de fonte de nível A a D na busca:**
- Ordem das três escritas nas placas (C07-009). O texto diz só "muitas placas vêm em três escritas".
- Origem da forma "Acre" (cruzados) e da forma "Jaffa" (C07-013); a forma "Caesarea/Qesarya" numa placa atual. O texto explica a variação pela regra do qof, que tem fonte, e não afirma qual grafia está em qual placa.
- Ezequiel 3:15 como fonte do nome Tel Aviv: só a Jewish Virtual Library (E) o disse.
- Todas as etimologias de palavras (Kinéret, Négev "sul", machtésh na geologia, tel em acádio, kibúts, aliyá, tsabár, dúgri, yálla, sabába, balagán, tsímer, chutspá, kótel, knésset, kipá/yarmulke): a única etimologia do texto é o sentido bíblico de mezuzot, que vem do próprio texto bíblico. Uma busca no site da Academia por "balagan" não trouxe nada.
- Data do Dia da Independência no calendário hebraico (C07-022).
- O debate Harshav sobre o peso da escola e da comunidade: a busca só confirmou a referência (Language in Time of Revolution, University of California Press, 1993), sem o conteúdo; não está em `fontes/`.

## 3. Problemas encontrados e correções feitas

- **Contradição com o capítulo 1, corrigida.** A linha de <he>מַכְתֵשׁ</he> traduzia "cratera de erosão"; o capítulo 1 diz que o Machtésh Ramón "costuma ser chamado de cratera, mas não é". A tradução virou "vale de erosão" e a nota cita C01-055. O hebraico não mudou.
- **Erro na tabela desta auditoria, corrigido:** a linha 26 trazia "chesbón"; o manuscrito sempre teve "cheshbón", que é o certo para <he>ש</he> com ponto à direita. Nenhuma mudança no hebraico.
- **"Única língua morta revivida":** o texto não repete a frase como fato. Diz o que a Academia afirma (não falado desde o século V, mas escrito e usado na reza) e apresenta a tese de Zuckermann como debate, atribuída.
- **Data do Comitê:** em vez de escolher 1890 ou 1889, o texto mostra as duas versões e diz quem dá cada uma (C07-006).
- **Q ou K:** os dois relatórios de Israel à ONU dizem coisas diferentes; o texto apresenta as duas e tira só a lição prática (não estranhar duas grafias).
- **Natsrat Illit:** é o nome usado na decisão de 2002. O nome atual da cidade não foi conferido e não aparece.
- **Datas que pedem conferência:** a de 1905 (forma institucional do Comitê) veio do resumo da página inicial da Academia; a de 1922 para o Mandato veio de um resumo que não isolou a página. Ambas estão marcadas em `limitacoes`.

## 4. Fontes adicionais necessárias (revisão humana)

1. Academia da Língua Hebraica: abrir "Our History", "Hebrew through the Ages", a página da instituição (id 527) e a de Ben-Yehuda, e conferir as frases citadas em `evidencia`.
2. Os documentos da UNGEGN (F07-016 a F07-018): conferir título, data e qual deles diz que a Academia decidiu não mudar a romanização.
3. A decisão HCJ 4112/99 no texto hebraico oficial (a tradução é da Adalah, parte no processo).
4. Zuckermann, Revivalistics (OUP, 2020) e uma resposta acadêmica nominal à tese, para que o quadro "Que língua é essa?" tenha os dois lados com autor.
5. Glinert, The Story of Hebrew (Princeton, 2017), e Harshav (1993), para a abertura.
6. Um dicionário etimológico (Klein, 1987, a confirmar) para decidir se alguma etimologia volta.

## 5. Debates acadêmicos e como o texto os apresenta

- **O que voltou a ser falado** (C07-005, CONTESTADO): Zuckermann (híbrido semítico-europeu, "israeli") contra o relato convencional, descrito pela resenha do LDD e seguido pela Academia. O texto diz que adota o nome "hebraico", como a Academia, e registra o debate.
- **Origem do Comitê da Língua** (C07-006, CONTESTADO): 1890 (Jewish Virtual Library) ou formação em etapas desde 1889 (Academia).
- **Romanização do qof** (C07-011, CONTESTADO): mudança para K anunciada e depois suspensa, conforme o relatório.

## 6. Pendências editoriais

1. **Todo o hebraico do capítulo precisa da aprovação do dono.** As 41 palavras e os trechos de apoio da tabela abaixo não mudaram de grafia. Hebraico novo nesta rodada, todo de apoio e já presente na tabela ou no curso: as letras soltas <he>ק</he>, <he>ו</he> e <he>י</he> (na explicação da placa e da escrita sem vogais) e <he>עכו</he> (grafia de placa de Acre, já na coluna "sem nikud" da tabela). Os quizzes reusam <he>תֵל</he>, <he>נַחַל</he>, <he>עֵמֶק</he>, <he>שׁוּק</he>, <he>חֶשְׁבּוֹן</he>, <he>סַבְלָנוּת</he> e <he>בְּתֵאָבוֹן</he>, com a mesma grafia das listas.
2. **Juízos de uso do falante nativo, para o dono confirmar** (sem fonte, ficam como estão): chutspá "na maior parte das vezes uma crítica"; yálla "para encerrar uma conversa"; bevakashá como "aqui está" e "de nada"; ma nishmá "não pede relatório"; beteavón "diz quem serve o prato"; kipá "uns o tempo todo, outros só na reza".
3. **Sentidos de dicionário sem registro próprio** (kibúts, mosháv, mezuzá como estojo, kipá, kashér, sherút "serviço", tsimer, tsabár "figo-da-índia"): a busca não chegou a dicionário ou à Academia dentro do orçamento. Conferir num dicionário antes de publicar.
4. **Convenção de daguesh, tônicas de Áko, dúgri e yálla, grafia plena de Kinéret:** pendências da rodada anterior, mantidas (ver tabela).
5. **Fotos** (`ativos/dados/fotos-candidatas-cap07.json`, 4 candidatas, todas "confirmar"): Comitê da Língua em 1912 e Ben-Yehuda à mesa (c. 1912), domínio público em Israel, falta a etiqueta dos EUA; retrato do GPO (data da busca, 1933, deve ser a da reprodução); placa trilíngue de Jafa (2021, licença não vista; conferir a ordem das escritas na imagem antes da legenda). Três estão no texto; o retrato do GPO é reserva. Recusado: o selo de 1957 (URAA).
6. **Links** (`ativos/dados/links-cap07.json`): Academia ("Hebrew through the Ages" e Ben-Yehuda) e UNESCO (Acre). Dois no texto; o de Ben-Yehuda é reserva.
7. **Figura que faria falta:** um quadro "uma placa, três escritas" (desenho esquemático de placa com o mesmo nome em hebraico, árabe e letras latinas, setas de leitura da direita para a esquerda nas duas primeiras). Só com uma placa real fotografada como modelo, para não inventar grafia.
8. Nenhuma caixa "O olhar de um israelense" (é do dono).

## Verificação linguística

Critérios: hebraico com nikud na convenção do curso, conferido com `semDagueshInutil` de `tools/daguesh.mjs` (nenhuma forma do manuscrito muda ao passar pela regra) e em NFC; transliteração `pt-BR-practical-v1` (`data/translit.json`), com acento agudo na tônica de toda palavra de duas sílabas ou mais e sem acento nos monossílabos; <he>ג</he> antes de e/i escrito "gu", como na tabela do padrão (<he>גֶשֶׁם</he> = guéshem). "No curso?" quer dizer que a palavra, com a mesma grafia e transliteração, já está em `data/*.json`, conferida pela busca do esqueleto consonantal nos pares hebraico/transliteração de todos os arquivos.

Formas de apoio que aparecem nos contextos (todas novas, menos <he>חָדָשׁ</he>, <he>תוֹדָה</he> e <he>בְּבַקָשָׁה</he>): <he>ירושלים</he>, <he>רחוב</he> (grafia de placa, sem nikud); <he>תֵל</he> e <he>אָבִיב</he> (as duas partes de Tel Avív); <he>מִדְבַּר יְהוּדָה</he> Midbár Yehudá; <he>מַכְתֵשׁ רָמוֹן</he> Machtésh Ramón; <he>עֵמֶק יִזְרְעֶאל</he> Émek Yizreél; <he>עוֹלֶה חָדָשׁ</he> olé chadásh; <he>קִבּוּצִים</he> kibutsím; <he>עַצְמָאוּת</he> atsmaút; <he>הַכֹּתֶל</he> HaKótel; <he>הַכֹּתֶל הַמַעֲרָבִי</he> HaKótel HaMaaraví; <he>כְּנֶסֶת</he> knésset; <he>כַּשְׁרוּת</he> kashrút; <he>שׁוּק מַחֲנֵה יְהוּדָה</he> Shuk Machané Yehudá; <he>שׁוּק הַכַּרְמֶל</he> Shuk HaKármel; <he>חֶשְׁבּוֹן בְּבַקָשָׁה</he> cheshbón bevakashá; <he>תוֹדָה</he> todá.

| # | Grupo | Hebraico com nikud (convenção do curso) | Grafia plena, sem nikud | Forma com daguesh tradicional, se difere | Transliteração | Tônica | Regras do padrão aplicadas | No curso? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Lugares | <he>יְרוּשָׁלַיִם</he> | <he>ירושלים</he> | igual | Yerushaláyim | la (paroxítona: Ye-ru-sha-LÁ-yim) | shva inicial pronunciado = e; <he>וּ</he> = u; <he>שׁ</he> = sh; <he>ַיִ</he> = áyi; <he>ם</he> = m sem nasalizar | coincide: data/sentences.json (Yerushaláyim) |
| 2 | Lugares | <he>תֵל אָבִיב</he> | <he>תל אביב</he> | <he>תֵּל אָבִיב</he> | Tel Avív | Tel: monossílabo; Avív: oxítona | monossílabo sem acento; <he>ב</he> sem daguesh = v; <he>א</he> sem letra | coincide: data/sentences.json (Tel Avív) |
| 3 | Lugares | <he>כִּנֶרֶת</he> | <he>כנרת</he> (conferir se <he>כינרת</he> também ocorre) | <he>כִּנֶּרֶת</he> | Kinéret | ne (Ki-NÉ-ret) | <he>כּ</he> com daguesh = k; segol = e | NOVA: precisa da aprovação do autor |
| 4 | Lugares | <he>יַם הַמֶלַח</he> | <he>ים המלח</he> | <he>יַם הַמֶּלַח</he> | Yam HaMélach | Yam: monossílabo; Mélach: paroxítona (MÉ-lach) | <he>ח</he> = ch; artigo <he>הַ</he> = ha, com h pronunciado | EM PARTE: <he>יָם</he> está no curso (data/translit.json: yam); o construto <he>יַם</he> e <he>הַמֶלַח</he> são novos e precisam da aprovação do autor |
| 5 | Lugares | <he>עַכּוֹ</he> | <he>עכו</he> | igual | Áko | a (Á-ko); conferir com o autor | <he>ע</he> sem letra; <he>כּ</he> = k; <he>וֹ</he> = o | NOVA: precisa da aprovação do autor |
| 6 | Geografia | <he>מִדְבָּר</he> | <he>מדבר</he> | igual | midbár | bar (mid-BÁR) | shva mudo some; <he>בּ</he> depois de sílaba fechada = b | NOVA: precisa da aprovação do autor |
| 7 | Geografia | <he>נֶגֶב</he> | <he>נגב</he> | igual | Néguev | ne (NÉ-guev) | <he>ג</he> antes de e = gue (como em guéshem); <he>ב</he> final sem daguesh = v | NOVA: precisa da aprovação do autor |
| 8 | Geografia | <he>נַחַל</he> | <he>נחל</he> | igual | náchal | na (NÁ-chal) | <he>ח</he> = ch, o R raspado | NOVA: precisa da aprovação do autor |
| 9 | Geografia | <he>תֵל</he> | <he>תל</he> | <he>תֵּל</he> | tel | monossílabo | monossílabo sem acento | coincide: em data/sentences.json só dentro de Tel Avív |
| 10 | Geografia | <he>מַכְתֵשׁ</he> | <he>מכתש</he> | <he>מַכְתֵּשׁ</he> | machtésh | tesh (mach-TÉSH) | <he>כ</he> sem daguesh = ch; shva mudo some; <he>שׁ</he> = sh | NOVA: precisa da aprovação do autor |
| 11 | Geografia | <he>עֵמֶק</he> | <he>עמק</he> | igual | émek | e (É-mek) | <he>ע</he> sem letra; <he>ק</he> = k | NOVA: precisa da aprovação do autor |
| 12 | História | <he>עֲלִיָה</he> | <he>עלייה</he> | <he>עֲלִיָּה</he> | aliyá | ya (a-li-YÁ) | <he>ע</he> sem letra; <he>ה</he> final mudo não se escreve | NOVA: precisa da aprovação do autor |
| 13 | História | <he>קִבּוּץ</he> | <he>קיבוץ</he> | igual | kibúts | buts (ki-BÚTS) | <he>בּ</he> com daguesh = b; <he>ץ</he> = ts | NOVA: precisa da aprovação do autor |
| 14 | História | <he>מוֹשָׁב</he> | <he>מושב</he> | igual | mosháv | shav (mo-SHÁV) | <he>וֹ</he> = o; <he>ב</he> final sem daguesh = v | NOVA: precisa da aprovação do autor |
| 15 | História | <he>אוּלְפָּן</he> | <he>אולפן</he> | igual | ulpán | pan (ul-PÁN) | <he>וּ</he> = u; <he>פּ</he> depois de sílaba fechada = p | NOVA: precisa da aprovação do autor |
| 16 | História | <he>יוֹם הָעַצְמָאוּת</he> | <he>יום העצמאות</he> | igual | Yom HaAtsmaút | Yom: monossílabo; Atsmaút: oxítona | <he>צ</he> = ts; <he>ע</he> sem letra; shva mudo some | EM PARTE: <he>יוֹם</he> no curso (yom); <he>הָעַצְמָאוּת</he> é nova e precisa da aprovação do autor |
| 17 | Tradições e religião | <he>שַׁבָּת שָׁלוֹם</he> | <he>שבת שלום</he> | igual | shabát shalóm | ambas oxítonas | como no curso | coincide: data/letters.json (shabát), data/audio.json (shabát shalóm) |
| 18 | Tradições e religião | <he>חַג שָׂמֵחַ</he> | <he>חג שמח</he> | igual | chag saméach | chag: monossílabo; saméach: paroxítona | como no curso; <he>שׂ</he> = s; <he>ח</he> final com patach = ach | coincide: data/sentences.json e data/audio.json (chag saméach) |
| 19 | Tradições e religião | <he>כֹּתֶל</he> | <he>כותל</he> | <he>הַכֹּתֶל הַמַּעֲרָבִי</he> (só o nome completo) | kótel | ko (KÓ-tel) | <he>כּ</he> com daguesh = k; holam = o | NOVA: precisa da aprovação do autor |
| 20 | Tradições e religião | <he>בֵּית כְּנֶסֶת</he> | <he>בית כנסת</he> | igual | beit knésset | beit: monossílabo; knésset: paroxítona | <he>ֵי</he> = ei; shva inicial mudo na fala de hoje; <he>ס</he> entre vogais = ss | NOVA: precisa da aprovação do autor |
| 21 | Tradições e religião | <he>מְזוּזָה</he> | <he>מזוזה</he> | igual | mezuzá | za (me-zu-ZÁ) | shva inicial pronunciado = e; <he>וּ</he> = u | NOVA: precisa da aprovação do autor |
| 22 | Tradições e religião | <he>כִּפָּה</he> | <he>כיפה</he> | igual | kipá | pa (ki-PÁ) | <he>כּ</he> = k; <he>פּ</he> = p; <he>ה</he> final mudo | NOVA: precisa da aprovação do autor |
| 23 | Tradições e religião | <he>כָּשֵׁר</he> | <he>כשר</he> | igual | kashér | sher (ka-SHÉR) | <he>כּ</he> = k; <he>שׁ</he> = sh | NOVA: precisa da aprovação do autor |
| 24 | Comida e compras | <he>שׁוּק</he> | <he>שוק</he> | igual | shuk | monossílabo | monossílabo sem acento | coincide: data/audio.json (shuk) |
| 25 | Comida e compras | <he>בְּתֵאָבוֹן</he> | <he>בתיאבון</he> | igual | beteavón | von (be-te-a-VÓN) | shva inicial pronunciado = e; <he>א</he> sem letra; <he>ב</he> sem daguesh = v | NOVA: precisa da aprovação do autor |
| 26 | Comida e compras | <he>חֶשְׁבּוֹן</he> | <he>חשבון</he> | igual | cheshbón | bon (chesh-BÓN) | <he>ח</he> = ch; <he>שׁ</he> = sh; shva mudo some; <he>בּ</he> = b | NOVA: precisa da aprovação do autor |
| 27 | Cotidiano | <he>רְחוֹב</he> | <he>רחוב</he> | igual | rechóv | chov (re-CHÓV) | como no curso | coincide: data/letters.json (rechóv) |
| 28 | Cotidiano | <he>שֵׁרוּת</he> | <he>שירות</he> | igual | sherút | rut (she-RÚT) | <he>שׁ</he> = sh; <he>וּ</he> = u | NOVA: precisa da aprovação do autor |
| 29 | Cotidiano | <he>תַחֲנָה מֶרְכָּזִית</he> | <he>תחנה מרכזית</he> | <he>תַּחֲנָה מֶרְכָּזִית</he> | tachaná merkazít | ambas oxítonas (ta-cha-NÁ mer-ka-ZÍT) | <he>ח</he> = ch; <he>ה</he> final mudo; shva mudo some | NOVA: precisa da aprovação do autor |
| 30 | Cotidiano | <he>בְּסֵדֶר</he> | <he>בסדר</he> | igual | beséder | se (be-SÉ-der) | shva inicial pronunciado = e; <he>ס</he> entre vogais = ss | coincide: data/letters.json (didYouKnow do Samech; sem transliteração lá) |
| 31 | Cotidiano | <he>מָה נִשְׁמָע</he> | <he>מה נשמע</he> | igual | ma nishmá | ma: monossílabo; nishmá: oxítona | como no curso | coincide: data/sentences.json e data/textos.json (ma nishmá) |
| 32 | Cotidiano | <he>תוֹדָה רַבָּה</he> | <he>תודה רבה</he> | <he>תּוֹדָה רַבָּה</he> | todá rabá | ambas oxítonas | como no curso | coincide: data/sentences.json (todá rabá) |
| 33 | Cotidiano | <he>בְּבַקָשָׁה</he> | <he>בבקשה</he> | <he>בְּבַקָּשָׁה</he> | bevakashá | sha (be-va-ka-SHÁ) | como no curso | coincide: data/sentences.json e data/translit.json (bevakashá) |
| 34 | Cultura | <he>צַבָּר</he> | <he>צבר</he> | igual | tsabár | bar (tsa-BÁR) | <he>צ</he> = ts; <he>בּ</he> = b | NOVA: precisa da aprovação do autor |
| 35 | Cultura | <he>דוּגְרִי</he> | <he>דוגרי</he> | <he>דּוּגְרִי</he> | dúgri | du (DÚG-ri); conferir com o autor | <he>וּ</he> = u; shva mudo some; <he>ִי</he> = i | NOVA: precisa da aprovação do autor |
| 36 | Cultura | <he>חוּצְפָּה</he> | <he>חוצפה</he> | igual | chutspá | pa (chuts-PÁ) | <he>ח</he> = ch; <he>צ</he> = ts; <he>פּ</he> = p | NOVA: precisa da aprovação do autor |
| 37 | Cultura | <he>בָּלָגָן</he> | <he>בלגן</he> | igual | balagán | gan (ba-la-GÁN) | <he>בּ</he> = b; <he>ג</he> = g | NOVA: precisa da aprovação do autor |
| 38 | Cultura | <he>סַבְלָנוּת</he> | <he>סבלנות</he> | igual | savlanút | nut (sav-la-NÚT) | <he>ב</he> sem daguesh depois de vogal = v; <he>וּ</he> = u | NOVA: precisa da aprovação do autor |
| 39 | Cultura | <he>יַאלְלָה</he> | <he>יאללה</he> | igual | yálla | yal (YÁL-la) | <he>א</he> sem letra; as duas <he>ל</he> escritas = ll | NOVA: precisa da aprovação do autor |
| 40 | Cultura | <he>סַבַּבָּה</he> | <he>סבבה</he> | igual | sabába | ba (sa-BÁ-ba) | <he>בּ</he> = b; <he>ה</he> final mudo | NOVA: precisa da aprovação do autor |
| 41 | Cultura | <he>צִימֶר</he> | <he>צימר</he> | igual | tsímer | tsi (TSÍ-mer) | <he>צ</he> = ts; <he>ִי</he> = i | NOVA: precisa da aprovação do autor |

## Fase 6 (21/10/2026)

### Visuais
- Abertura ilustrada própria: `abertura-hebraico` (nove letras isoladas em papel recortado, espalhadas e giradas para não formar palavra).
- `placa-trilingue` (figura): placa desenhada com עכו (grafia sem vogais do capítulo), a faixa do árabe SEM texto (o livro não registrou a grafia árabe; dito no desenho e na legenda) e "Akko"; o ו como vogal; os três nomes da cidade e 1191-1291 (C07-012). A ordem das faixas é ilustrativa (C07-009 segue NÃO VERIFICADO).
- `sabado-shabat` (figura): a comparação com o Brasil.
- `nikud-com-pontos` / `nikud-sem-pontos` (compare): Jerusalém com e sem os sinais de vogal, com o ו destacado.
- Fotos licenciadas candidatas já existentes: 3 (Ben-Yehuda, Comitê da Língua, placa em Jafa).

### Comparação com o Brasil (língua)
"Sábado" vem do latim sabbatum, que vem do hebraico (C07-042: Dicio e Etymonline); sabbatum vem do grego sabbaton e do hebraico shabbath, "dia de descanso"; em latim era o dia de descanso dos judeus e depois o sábado (C07-043: Etymonline e Lewis & Short, A Latin Dictionary). Conta derivada C07-044. Houaiss, Michaelis e Priberam não apareceram na busca: a revisão humana deve conferir num dicionário etimológico de referência do português (Cunha ou Houaiss).

### Interações
Compare, "História ou tradição?" com palpite ("Ben-Yehuda ressuscitou o hebraico", `resposta: as-duas`), pegadinha do guia ("língua morta", C07-004), quizzes e vf já existentes; as palavras já têm "Guardar" e "Gravar a minha" na web. Sem ficha: Acre é lugar do capítulo 4.

### Cortes pela decisão política
- Supremo de 2002: saiu a frase com os princípios invocados pela maioria (igualdade, liberdade de usar a própria língua, status do árabe), que era debate jurídico; ficaram a data, o placar, os municípios e os juízes (C07-040 não mudou).
- Remissão à Lei Básica de 2018: saiu "e o debate em torno"; ficou o fato (status especial do árabe) e a remissão ao capítulo 5.
- Não há "Cisjordânia" no capítulo.

### Buscas
4 das 10 do lote (etimologia de sábado x3, mais 1 tentativa sem resultado num dicionário do português).

### Pendências
- Hebraico para aprovação do dono (nada novo, tudo do capítulo): עכו, שַׁבָּת e שַׁבָּת שָׁלוֹם no texto novo, יְרוּשָׁלַיִם e ירושלים nos desenhos, e as letras soltas da abertura (א ש ב ק מ ע ל ת ר).
- A grafia árabe de Acre não está registrada; se o dono quiser a faixa preenchida, ela precisa de fonte.
- Problema de ferramenta (não mexido): em `templates/revista.css`, `.he { font-size: 1.1em }` vence o atributo `font-size` dos `<text class="he">` dentro dos SVG inline, e o hebraico das figuras sai minúsculo no PDF. Os módulos cap06 e cap07 contornam com `style="font-size:..px"`. O `monte-dois-nomes` do capítulo 3 (e qualquer desenho com hebraico) provavelmente tem o mesmo defeito.
- Testes que rodaram: validador 0 erros; PDF capitulo-07 com 22 páginas, 2/2 QR lidos; inspecionar sem transbordo nem página quase vazia; folha de contato olhada. A web não foi gerada.
