# Auditoria interna do capítulo 4: Além de Jerusalém

Auditoria interna feita por IA, em 21/10/2026. Não é revisão acadêmica: é uma releitura adversária do próprio texto. Nada aqui foi "revisado", "validado" ou "aprovado".

## 0. Condição em que o capítulo foi escrito

A pesquisa parou em cerca de 37 buscas: a cota de buscas da sessão, compartilhada entre agentes, esgotou-se antes da meta de 50 a 100. Nenhuma busca extra foi feita por outro caminho. Consequência: o capítulo tem cerca de 3.200 palavras (meta: 4.200) e algumas seções (Mar Morto, Nazaré, Jafa) estão curtas, porque o texto só usa o que foi verificado. O protocolo não admite cota de palavras acima da verificação. A próxima rodada de pesquisa deve começar pela lista da seção 4.

## 1. Afirmações por status

| Status | Quantidade |
| --- | --- |
| VERIFICADO | 56 |
| CONTESTADO | 1 (C04-039, o suicídio coletivo em Massada) |
| PARCIALMENTE VERIFICADO | 3 (C04-032, C04-046, C04-052) |
| NÃO VERIFICADO | 25 |
| Total | 85 |

O manuscrito só cita VERIFICADO e o CONTESTADO (que aparece apresentando o debate, na caixa "Josefo, a arqueologia e o símbolo"). Conferido por script: nenhum marcador aponta para outro status.

Fontes: 40 registros (F04-001 a F04-040). Nível A: 6 (um deles é o artigo do século XIX, F04-040, que só sustenta um registro PARCIALMENTE VERIFICADO); B: 33; E: 1 (PBS Frontline, só como apoio ao debate de Massada). Acesso: 37 por trecho de busca, 3 só como referência confirmada (Cohen 1982, Magness 2019 em livro, Custódia).

## 2. Problemas encontrados

- **Brief não cumprido em pontos pedidos.** Ficaram fora por falta de verificação: queda anual do Mar Morto, dolinas e bacias (C04-049 a C04-051); Basílica da Anunciação e a distinção entre as tradições católica e ortodoxa (C04-012); as escavações franciscanas da "casa de Pedro" (C04-018); Ahuzat Bayit (C04-060); Napoleão em 1799 (C04-080); a diversidade de Haifa (C04-071). O texto não afirma nada sobre eles.
- **Registro do Pleiades para Cafarnaum incoerente.** O trecho do verbete Kefar Nahum/Kapharnaoum trazia, junto da frase usada, uma origem "c. 515 a.C.", os nomes romanos "Chaberis" e "Kamara" (que não parecem pertencer a Cafarnaum) e "Patrimônio Mundial em 1979" (Cafarnaum não é Patrimônio Mundial). Parece mistura de registros. Só a frase "aldeia hasmoneia na margem norte" foi usada (C04-015); a revisão deve abrir o verbete inteiro.
- **Data do fim de Massada.** A UNESCO usa 73 d.C.; parte da literatura prefere 74. O texto atribui o 73 à cronologia da UNESCO, sem resolver.
- **Número de mortos em Massada.** Os resumos divergem (960 e 967). Não entrou no texto.
- **Coordenada de Tel Aviv.** O resumo da busca trouxe "32,067, 34,783", que não bate com o grau-minuto-segundo da própria ficha (N32 04 40 E34 46 27 = 32,08, 34,77). Usada a conversão do grau-minuto-segundo.
- **Be'er Sheva.** A coordenada confirmada é do sítio de Tel Be'er Sheva (UNESCO), a leste da cidade moderna. O `destinos.json` diz isso no nome e no resumo.
- **Mar Morto e Eilat sem coordenada.** `destinos.json` traz o Mar Morto com `lat`/`lon` nulos; Eilat ficou fora do arquivo.
- **Cafarnaum: coordenada por ToposText**, gazetteer que remete ao Pleiades, mas não é instituição oficial. Conferir no Pleiades.
- **Votruba (2007): título do artigo não apareceu na busca.** O registro F04-025 está com o título entre colchetes. Não inventar: abrir o PDF e completar.
- **Cesareia: "fundada em 10 a.C."** O parque nacional dá 10 a.C. como data do estabelecimento; a obra começou antes. O texto atribui a data ao parque.
- **Inscrição de Pilatos: "procurador" e "prefeito".** A ficha do Museu de Israel usa "procurator" no título e "[Praef]ect" no texto reconstruído. O texto mostra a diferença em vez de escolher.

## 3. Correções feitas durante a escrita

- Retiradas, por falta de fonte A-D: "litoral sem enseada natural" e "porto em mar aberto" (Cesareia); "a pozolana permite que o concreto endureça debaixo d'água"; "categoria pouco comum" (bem misto); "Nazaré é antes de tudo uma cidade de santuários"; "uma razão rara" (Acre); "o Mar Morto é dividido entre", trocado por "as margens ficam em", que é o que o Pleiades diz.
- Retiradas duas notas de caixa escritas de memória: placas "Tel Aviv-Yafo" e o nome árabe de Haifa. Trocadas por notas linguísticas.
- "Traduz" (Mar Morto e thálassa nekrá) trocado por "tem o mesmo sentido": a derivação do nome português não foi verificada.
- Transliteração corrigida: <he>חֵיפָה</he> é Chéifa (tsere com yod = ei), não Cháifa.
- Marcadores tirados do meio da frase e postos depois da pontuação final.
- A réplica da pedra de Pilatos no teatro e o ano de 1961 ficaram fora (C04-032, só fontes E).
- Yigael Yadin não é nomeado como diretor das escavações (C04-046, só fontes E); o texto diz "as grandes escavações de 1963-1965".

## 4. Fontes adicionais necessárias (para a revisão humana abrir no texto integral)

Prioridade alta:
1. Mar Morto: Serviço Hidrológico de Israel / Autoridade da Água (nível atual, datado, e a queda anual), Instituto Geológico de Israel (dolinas), e uma fonte sobre a divisão entre a bacia norte e as bacias de evaporação ao sul.
2. Nazaré: Custódia da Terra Santa (Basílica da Anunciação: datas, arquiteto, sítio sob a igreja) e uma fonte da tradição ortodoxa (igreja de São Gabriel).
3. Cafarnaum: Custódia (F04-035) e a publicação das escavações franciscanas (Corbo; Loffreda); literatura sobre a datação da sinagoga.
4. Acre: o cerco de 1799 (fonte acadêmica sobre a campanha de Napoleão na Síria), al-Jazzar, o túnel dos Templários (Israel Antiquities Authority).
5. Tel Aviv: município de Tel Aviv-Yafo ou arquivo histórico sobre Ahuzat Bayit e o sorteio de 1909.
6. Massada: Cohen (1982) e Magness (2019) no texto integral; Josefo, Guerra dos Judeus, livro VII (passagem do cerco e do discurso de Eleazar); um texto que critique a tese de Ben-Yehuda, para o debate não ficar de um lado só.
7. Jafa: as menções bíblicas (Jonas 1,3; Atos 9-10) como fonte C; a história do porto (IAA).
8. Haifa: CBS ou município (composição da população, datada); Bahá'í World Centre como fonte institucional dos jardins.
9. Coordenadas: Mar Morto, Eilat e o centro da cidade de Be'er Sheva.
10. Verbete integral do Pleiades para Kefar Nahum/Kapharnaoum.

## 5. Debates acadêmicos e como o texto os apresenta

- **O suicídio coletivo em Massada (CONTESTADO).** A caixa "Josefo, a arqueologia e o símbolo" diz que Josefo é a única fonte; resume a crítica de Cohen (1982) e a posição de Magness (2019), que diz que muitos estudiosos consideram a descrição inventada e que a arqueologia não decide a questão. Limite: o argumento de Cohen chegou por citação em fonte E (PBS) mais o registro bibliográfico. Conferir.
- **Massada como símbolo nacional.** O texto atribui a Ben-Yehuda a tese do mito construído no século XX e mostra que a própria UNESCO usou o vocabulário do símbolo nos critérios de inscrição. Falta uma voz crítica à tese de Ben-Yehuda (não pesquisada).
- **"Casa de Pedro".** Apresentada como identificação da tradição, com a caixa "História ou tradição?" separando o que a escavação pode responder do que exige outro tipo de prova.
- **"Bauhaus" em Tel Aviv.** O texto mostra que a avaliação feita para a UNESCO acha o rótulo inadequado.

## 6. Pendências editoriais

- **Hebraico para o autor aprovar** (todas as ocorrências, com nikud): <he>כִּנֶּרֶת</he> Kinéret; <he>יָם</he> yam; <he>יַם כִּנֶּרֶת</he> Yam Kinéret; <he>אֲגַם</he> agám; <he>טְבֶרְיָה</he> Tvérya; <he>נָצְרַת</he> Natsrát; <he>כְּנֵסִיָּה</he> knessiyá; <he>כְּפַר נַחוּם</he> Kfar Nachúm; <he>כְּפַר</he> kfar; <he>בֵּית כְּנֶסֶת</he> beit knésset; <he>מִנְזָר</he> minzár; <he>קֵיסָרְיָה</he> Keisárya; <he>נָמָל</he> namál; <he>תֵּאַטְרוֹן</he> teatrón; <he>גַּן לְאֻמִּי</he> gan leumí; <he>מְצָדָה</he> Metsadá; <he>מִבְצָר</he> mivtsár; <he>סוֹלְלָה</he> solelá; <he>יַם הַמֶּלַח</he> Yam HaMélach; <he>מֶלַח</he> mélach; <he>תֵּל אָבִיב</he> Tel Avív; <he>תֵּל</he> tel; <he>אָבִיב</he> avív; <he>הָעִיר הַלְּבָנָה</he> haír halevaná; <he>לָבָן</he> laván; <he>כִּכַּר דִּיזֶנְגּוֹף</he> Kikár Dízengof; <he>כִּכָּר</he> kikár; <he>שְׂדֵרוֹת רוֹטְשִׁילְד</he> Sderót Rótshild; <he>שְׂדֵרוֹת</he> sderót; <he>יָפוֹ</he> Yáfo; <he>נְמַל יָפוֹ</he> Nemál Yáfo; <he>עִיר עַתִּיקָה</he> ir atiká; <he>חֵיפָה</he> Chéifa; <he>ח</he>; <he>הַר הַכַּרְמֶל</he> Har HaKármel; <he>הַר</he> har; <he>גַּנִּים</he> ganím; <he>גַּן</he> gan; <he>עַכּוֹ</he> Áko; <he>חוֹמָה</he> chomá; <he>צַלְבָנִים</he> tsalvaním; <he>צַלְבָן</he> tsalván. No `destinos.json`: Yerushaláyim, Beér Shéva.
  - Dúvidas específicas para o autor: a tônica de "Dízengof"; "solelá" como o termo que um israelense usa para a rampa de Massada; "Keisárya" e "Chéifa" como transliteração da fala de hoje.
- **Árabe transliterado a conferir:** al-Nasira (Nazaré), Yafa (Jafa), Akka (Acre). Foram escritos sem fonte registrada.
- **Caixa "O olhar de um israelense":** nenhuma neste capítulo.
- **Figura `mapa-destinos`:** dados em `ativos/dados/destinos.json` (12 pontos: os 10 destinos, com o Mar Morto sem coordenada, mais Jerusalém e Tel Be'er Sheva). Eilat ficou fora por falta de coordenada confirmada. O desenhista precisa decidir como mostrar o Mar Morto sem ponto (contorno do lago de base cartográfica, por exemplo).
- **Fotos:** nenhuma pedida. Se houver, as legendas precisam seguir os mesmos registros.
- **Informação prática com prazo:** C04-044 (acesso a Massada) vence em 21/04/2027; C04-026 (centro de visitantes de Cesareia), também.
- **Contradição a evitar com o capítulo 1:** o capítulo 4 remete ao 1 para o nível do Mar Morto. O capítulo 1 precisa trazer esse número, datado.
