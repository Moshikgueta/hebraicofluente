# Auditoria interna: capítulo 7, Hebraico para compreender Israel

Data: 21/10/2026. Auditoria interna, feita por IA. Não é revisão acadêmica nem aprovação.

**Estado: rascunho parcial, não publicável.** A busca na web não pôde ser usada nesta execução: o limite de buscas da sessão, compartilhado entre os agentes, já estava esgotado antes da primeira consulta deste capítulo. Nenhuma fonte externa foi lida, e o protocolo (seção 1) não deixa afirmar o que não foi verificado. Por isso o capítulo saiu sem a abertura histórica, sem a seção de placas e sem nenhuma etimologia. O que foi feito é o trabalho que não depende da web: escolher e fixar as 41 palavras, a grafia, o nikud e a transliteração, conferidos contra os dados do curso e contra a regra de daguesh do curso.

## 1. Afirmações (contagem por status)

| Status | Quantas |
| --- | --- |
| VERIFICADO | 0 |
| PARCIALMENTE VERIFICADO | 0 |
| CONTESTADO | 0 |
| NÃO VERIFICADO | 34 |
| DESATUALIZADO | 0 |

As 34 são as afirmações que o capítulo pretende fazer (história da língua, placas, etimologias, um dado prático). Cada registro traz, em `limitacoes`, a pista de onde procurar. Os títulos de obras citados como pista vêm de memória e **não** foram confirmados; por isso não estão em `fontes/cap07.json`, que está vazio. O manuscrito não tem nenhum marcador `[[C07-...]]`.

Palavras no manuscrito: cerca de 1.500 (contando a marcação), contra as 2.600 previstas. A diferença são as duas seções pendentes e as etimologias.

## 2. Problemas encontrados

- **Lacunas por falta de pesquisa**: as seções "A língua que voltou a ser falada" e "Como ler uma placa trilíngue" existem só como título e comentário de pendência.
- **Contextos de vocabulário que são fatos simples sem registro**. Ficaram porque são sentido de dicionário ou geografia elementar, mas o revisor deve confirmar cada um num dicionário ou fonte: o Machtésh Ramón fica no Neguev; Tel Meguido e Tel Dan são nomes de sítios; o Shuk Machané Yehudá fica em Jerusalém e o Shuk HaKármel em Tel Aviv; o parlamento se chama Knéset; a definição de mezuzá, kipá, kibúts, mosháv, sherút e ulpán. Se o critério do livro exigir registro também para isso, essas frases precisam de afirmação própria na próxima rodada.
- **Juízos de uso que dependem do falante nativo**: chutspá "na maior parte das vezes uma crítica"; yálla "para encerrar uma conversa"; bevakashá como "aqui está" e "de nada"; ma nishmá "não pede relatório". São a percepção do autor que vale aqui.
- **Etimologia popular evitada**: nenhuma das explicações correntes (Kinéret e a lira, o tsabár "espinhoso por fora, doce por dentro", a origem árabe de sabába) entrou no texto. Estão registradas como NÃO VERIFICADO.
- **Contradição com outros capítulos**: não deu para conferir. Os capítulos 1, 5, 6 e 8 ainda não estão na pasta. Pontos de contato: Neguev e Machtésh Ramón (cap. 1), kibutz, moshav, dugri e a lei de 2018 (cap. 5), shuk e chesbón (cap. 6), sherut (cap. 8). A grafia e a transliteração destas palavras devem valer para o livro inteiro.

## 3. Correções feitas

- A coluna "sem nikud" da verificação começou como o hebraico sem os pontos. Foi trocada pela grafia plena, que é como as palavras aparecem sem nikud (<he>קיבוץ</he>, <he>כיפה</he>, <he>עלייה</he>, <he>בתיאבון</he>, <he>שירות</he>), e não por <he>קבוץ</he> ou <he>עליה</he>.
- Mar Morto: construto <he>יַם</he> (patach), e não <he>יָם</he>, em <he>יַם הַמֶלַח</he>.
- Removidos dos contextos: a história do nome Tel Aviv, a origem árabe, russa ou alemã de gírias, a comparação de chutspá com o inglês, a data do Dia da Independência e a circulação de sherut no Shabat. Tudo isso está nos registros, à espera de fonte.
- Tirei da lista inicial <he>יָפוֹ</he> (a tônica é incerta e Jafa volta na seção de placas), <he>חֲרֵדִי</he> (pede contexto sociológico com fonte), <he>חָלוּץ</he>, <he>עֵין</he>, <he>מַכֹּלֶת</he> e <he>טִיוּל</he>, para ficar perto de 40.

## 4. Fontes adicionais necessárias (para a próxima rodada e para a revisão humana)

Todas: ver `limitacoes` de cada registro em `afirmacoes/cap07.json`. As de maior peso:

- Academia da Língua Hebraica (hebrew-academy.org.il): história da instituição, regras de transliteração para o alfabeto latino, verbetes de neologismos.
- Klein, *A Comprehensive Etymological Dictionary of the Hebrew Language for Readers of English* (1987), para kibúts, tsímer, balagán, mezuzá, kótel e Kinéret. Confirmar a edição.
- Harshav (1993), Glinert (2017) e Zuckermann (2003; 2020), para a abertura.
- Katriel (1986), para dúgri; Almog (2000), para tsabár.
- Ministério dos Transportes e Comissão Governamental de Nomes (gov.il), para as placas.

## 5. Debates acadêmicos relevantes e como o texto os apresenta

Nenhum aparece no texto ainda. Os que a abertura terá de apresentar como debate: (a) "revivificação" ou "renascimento" do hebraico, e o que exatamente voltou a ser falado (Zuckermann contra autores que veem continuidade); (b) o peso de Ben-Yehuda contra o da escola e da comunidade (Harshav). Entre as etimologias, são debatidas ou incertas as de Yerushaláyim, Kinéret e sabába.

## 6. Pendências editoriais

1. **Todo o hebraico do capítulo precisa da aprovação do autor.** São 41 itens e 20 trechos de apoio nos contextos (contando as letras <he>בּ</he> e <he>ב</he> da explicação do daguesh). 11 itens coincidem inteiros com o curso, 2 coincidem em parte (Yam HaMélach e Yom HaAtsmaút) e 28 são novos.
2. **Convenção de daguesh.** O capítulo segue a regra do curso (`tools/daguesh.mjs`, decisão de 12/10/2026): o ponto só aparece em <he>בּ</he>, <he>כּ</he> e <he>פּ</he>. O protocolo do livro pede "grafia moderna padrão". O autor precisa decidir se o livro segue o curso (como está) ou o nikud tradicional completo; a forma tradicional de cada palavra que muda está na tabela abaixo.
3. Tônicas a confirmar com o autor: <he>עַכּוֹ</he> (Áko), <he>דוּגְרִי</he> (dúgri) e <he>יַאלְלָה</he> (yálla, escrita com dois L porque o hebraico escreve duas letras <he>ל</he>).
4. Grafia plena de <he>כִּנֶרֶת</he>: conferir se a forma das placas é <he>כנרת</he> ou <he>כינרת</he>.
5. <he>בְּסֵדֶר</he> existe no curso, mas sem transliteração gravada (aparece no "Você sabia?" do Samech); "beséder" aplica o padrão.
6. Refazer a pesquisa (40 a 80 buscas) e escrever as duas seções pendentes e as etimologias com fonte.
7. Caixas `voce-sabia` e `olhar-israelense pendente`: nenhuma foi escrita. Há candidatas boas para quando houver fonte: dúgri (Katriel) e o nome Tel Aviv (Sokolow e Herzl).

## Verificação linguística

Critérios: hebraico com nikud na convenção do curso, conferido com `semDagueshInutil` de `tools/daguesh.mjs` (nenhuma forma do manuscrito muda ao passar pela regra) e em NFC; transliteração `pt-BR-practical-v1` (`data/translit.json`), com acento agudo na tônica de toda palavra de duas sílabas ou mais e sem acento nos monossílabos; <he>ג</he> antes de e/i escrito "gu", como na tabela do padrão (<he>גֶשֶׁם</he> = guéshem). "No curso?" quer dizer que a palavra, com a mesma grafia e transliteração, já está em `data/*.json`, conferida pela busca do esqueleto consonantal nos pares hebraico/transliteração de todos os arquivos.

Formas de apoio que aparecem nos contextos (todas novas, menos <he>חָדָשׁ</he>, <he>תוֹדָה</he> e <he>בְּבַקָשָׁה</he>): <he>ירושלים</he>, <he>רחוב</he> (grafia de placa, sem nikud); <he>תֵל</he> e <he>אָבִיב</he> (as duas partes de Tel Avív); <he>מִדְבַּר יְהוּדָה</he> Midbár Yehudá; <he>מַכְתֵשׁ רָמוֹן</he> Machtésh Ramón; <he>עֵמֶק יִזְרְעֶאל</he> Émek Yizreél; <he>עוֹלֶה חָדָשׁ</he> olé chadásh; <he>קִבּוּצִים</he> kibutsím; <he>עַצְמָאוּת</he> atsmaút; <he>הַכֹּתֶל</he> HaKótel; <he>הַכֹּתֶל הַמַעֲרָבִי</he> HaKótel HaMaaraví; <he>כְּנֶסֶת</he> knésset; <he>כַּשְׁרוּת</he> kashrút; <he>שׁוּק מַחֲנֵה יְהוּדָה</he> Shuk Machané Yehudá; <he>שׁוּק הַכַּרְמֶל</he> Shuk HaKármel; <he>חֶשְׁבּוֹן בְּבַקָשָׁה</he> chesbón bevakashá; <he>תוֹדָה</he> todá.

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
| 26 | Comida e compras | <he>חֶשְׁבּוֹן</he> | <he>חשבון</he> | igual | chesbón | bon (ches-BÓN) | <he>ח</he> = ch; shva mudo some; <he>בּ</he> = b | NOVA: precisa da aprovação do autor |
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
