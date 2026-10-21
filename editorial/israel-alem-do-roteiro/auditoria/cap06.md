# Auditoria interna: capítulo 6, Sabores de Israel

Data: 21/10/2026. Esta é uma auditoria interna feita por IA na releitura do
capítulo, não uma revisão acadêmica. Nada aqui foi revisado, validado ou
aprovado por especialista.

## Aviso que condiciona tudo o que segue

A pesquisa foi interrompida pela cota de buscas da sessão: ela é compartilhada
entre os agentes que trabalharam em paralelo e acabou depois de **17 buscas**
deste capítulo (o brief previa 30 a 60). O capítulo entregue cobre homus,
falafel, sabich, a moldura legal da kashrut e o vocabulário de restaurante. Os
temas que ficaram sem nenhuma busca estão registrados como `NÃO VERIFICADO` em
`afirmacoes/cap06.json` (C06-030 a C06-039) e **não aparecem no texto**. O
capítulo tem cerca de 1.630 palavras contra as 2.200 do orçamento, e **não
está pronto para publicação**: falta uma segunda rodada de pesquisa (ver
seção 4).

## 1. Afirmações por status

| Status | Quantidade | No texto? |
| --- | --- | --- |
| VERIFICADO | 10 | sim (C06-001 a 004, 006, 007, 010 a 013) |
| CONTESTADO | 3 | sim, apresentando o debate (C06-005, 008, 009) |
| PARCIALMENTE VERIFICADO | 4 | não (C06-014, 018, 020, 021) |
| NÃO VERIFICADO | 15 | não (C06-015, 016, 017, 019, 022, 030 a 039) |
| Total | 32 | |

Fontes: 23 (`fontes/cap06.json`). Nível A: 8 (duas só como
`referencia-confirmada`: Ariel 2012 e Stampfer 2015). Nível D: 1 (a lei de
1983 em gov.il, com trecho truncado). Nível E: 14. Nenhuma de nível B ou C.

## 2. Problemas encontrados na releitura

- **Peso de fontes E.** Sabich (C06-010), os julgamentos de 2016 e 2017
  (C06-012, C06-013) e o recorde de Abu Gosh (C06-007) se apoiam em
  jornalismo. Foram aceitos como fato jornalístico datado com dois ou mais
  veículos independentes, como o protocolo permite, mas o sabich não é bem um
  "fato datado": é a história de origem contada pela imprensa. O texto a
  apresenta como "reportagens ligam" e "o nome mais citado", sem afirmar quem
  inventou. Se a revisão humana achar que isso não basta, o trecho cai para
  uma frase só (ligação com o café da manhã de Shabat dos judeus iraquianos).
- **Falafel com base em revista de divulgação.** O debate (C06-008) usa a
  *History Today* (E) e, por ela, Balta e Mardam Bey, cuja obra não foi
  identificada. O texto atribui cada hipótese e não afirma origem. A hipótese
  de Stampfer (C06-009) tem só a referência do capítulo confirmada; o conteúdo
  vem de duas fontes E que o resumem.
- **Ano da decisão de 2017** é dedução (JTA diz "um ano depois" da de 2016; o
  Jewish News diz "em setembro"). O texto diz "no ano seguinte".
- **Afiliações** deduzidas de repositório institucional (Avieli na BGU) ou de
  jornalismo (Stampfer na Universidade Hebraica). Conferir.
- **Definição de kashrut** ("conjunto de regras alimentares do judaísmo") e de
  <he>כָּשֵׁר</he> estão sem marcador: tratadas como definição de glossário.
  Se o padrão do livro exigir registro, ligar a uma fonte B na segunda rodada.
- **Brief x sistema de transliteração.** O brief escreve "chesbón"; pelo
  `pt-BR-practical-v1` (ש = sh, בּ = b) a forma é **cheshbón**, e é a usada.
- **Falafel em hebraico ficou de fora** de propósito: o protocolo dá
  "falafél" como exemplo de tônica, e a pronúncia corrente em Israel parece
  ser paroxítona. O autor decide antes de a palavra entrar em qualquer caixa
  do livro (vale também para o capítulo 7).
- Generalizações: a releitura tirou "poucos alimentos carregam tanta
  conversa", "sociólogos e antropólogos passaram as últimas décadas" e uma
  frase que atribuía a Raviv e Hirsch uma conclusão sobre o sabich que eles
  não escreveram.
- Nenhum anacronismo, nenhuma etimologia e nenhum número sem fonte no texto
  final. As etimologias do nome "sabich" (C06-019) e de <he>בְּשָׂרִי</he> e
  <he>חָלָבִי</he> foram retiradas por falta de fonte linguística.

## 3. Correções feitas durante a escrita

- Tirado "o bolinho mudou de grão no caminho" (fava para grão-de-bico): só
  metade tinha fonte (C06-018).
- Tirado o recorde libanês de maio de 2010 (10.452 kg): um único veículo
  independente (C06-014).
- Tirado o pedido de registro do homus na União Europeia: só blog (C06-015).
- Tirados os itens atribuídos a Gil Marks (C06-016, C06-017): só citação de
  segunda mão.
- "Painel maior de sete juízes julgou" virou "nova audiência, marcada para um
  painel de sete juízes", que é o que a fonte diz.
- Comentários da caixa `em-hebraico` reescritos para não afirmar fato
  linguístico sem fonte ("só existe no plural", "também é o nome do
  grão-de-bico", derivações de raiz).

## 4. Fontes adicionais necessárias (segunda rodada e revisão humana)

Segunda rodada de busca, por prioridade, para fechar o brief:

1. **Kashrut básica** (C06-030, C06-031): carne e leite separados, restaurante
   de carne x de leite, por que estabelecimentos com certificado fecham no
   Shabat. Fontes: Rabinato-Chefe e gov.il (D), enciclopédia acadêmica (B), o
   texto bíblico como fonte C (Êx 23:19; 34:26; Dt 14:21).
2. **Guia de restaurante** (C06-032, C06-033): gorjeta (costume e percentual,
   dizendo que varia), água à mesa, horários no Shabat. Ministério do Turismo
   de Israel ou duas fontes E datadas. Registros `pratica` com `revisar_ate`.
3. **Pães e festas** (C06-035, C06-036): pita, chalá, lafa, jachnún, malawach;
   matsá em Pêssach, sufganiyót em Chanuká. Coordenar com o capítulo 5.
4. **Shakshuka** (C06-034), sem origem exclusiva.
5. **Mercados** (C06-037): Machane Yehuda e Shuk HaCarmel, pelas
   municipalidades de Jerusalém e Tel Aviv-Yafo.
6. **Influências e cozinha contemporânea** (C06-038, C06-039): fonte
   acadêmica para a síntese das influências (levantina, árabe, otomana,
   norte-africana, iemenita, iraquiana, do Leste Europeu) e para os cafés.
7. Segunda fonte para o recorde libanês de 2010 e para o caso da UE.

Abrir no texto integral, na revisão humana:

- Hirsch 2011 (*American Ethnologist* 38/4) e Hirsch 2026 (Indiana UP).
- Avieli 2015 (*Estudios de Asia y África* 50/3) e o capítulo de 2016.
- Ariel 2012 (*Gastronomica* 12/1): só a referência foi confirmada.
- Stampfer 2015 (*Jews and Their Foodways*, p. 177).
- Raviv 2015, para os capítulos sobre falafel e cozinhas do exército.
- A lei de 1983 em gov.il (o trecho veio truncado) e as decisões do Supremo de
  2016 e 2017, com a regra vigente hoje.
- A reportagem do Haaretz sobre o sabich citada pelo Jewish Independent.

## 5. Debates acadêmicos e como o texto os apresenta

- **De quem é o homus** (C06-005): o texto expõe a reivindicação libanesa de
  patrimônio (pela descrição de Avieli), o homus como símbolo nacional
  israelense, a leitura de Hirsch (apropriação, arabicidade ora suprimida,
  ora usada como autenticidade) e a de Avieli (posse e poder, não receita).
  Caixa `entenda-melhor` "De quem é o homus?". Nenhuma origem exclusiva é
  afirmada. Limite: nenhuma fonte libanesa ou palestina foi lida diretamente;
  a segunda rodada deve buscar uma.
- **Origem do falafel** (C06-008, C06-009): Egito/Alexandria com fava,
  primeiro registro escrito depois de 1882 e conjectura indiana (Balta e
  Mardam Bey, via *History Today*), parentesco com bolinhos de ervilha de
  judeus da Índia (Stampfer). A história copta da Quaresma vai numa caixa
  `historia-ou-tradicao` como tradição sem evidência. O texto fecha dizendo
  que nenhuma hipótese foi provada nem faz do prato propriedade de um povo.
- **Sabich**: versões concorrentes sobre o primeiro sanduíche, ditas como
  tal; a etimologia do nome ficou fora.

## 6. Pendências editoriais

- **Hebraico para aprovar (todo o capítulo):** <he>חוּמוּס</he>,
  <he>סַבִּיח</he>, <he>כַּשְׁרוּת</he>, <he>כָּשֵׁר</he>,
  <he>תְּעוּדַת כַּשְׁרוּת</he>, <he>תַּפְרִיט</he>, <he>מֶלְצַר</he>,
  <he>מֶלְצָרִית</he>, <he>מַיִם</he>, <he>חֶשְׁבּוֹן</he>,
  <he>בְּבַקָשָׁה</he>, <he>תוֹדָה</he>, <he>בְּשָׂרִי</he>,
  <he>חָלָבִי</he>, <he>מִסְעָדָה</he>, <he>לֶחֶם</he>, <he>פִּיתָה</he>,
  <he>קָפֶה</he>, <he>שׁוּק</he>, <he>בְּתֵאָבוֹן</he>. As formas de
  <he>מַיִם</he>, <he>לֶחֶם</he>, <he>קָפֶה</he>, <he>בְּבַקָשָׁה</he> e
  <he>תוֹדָה</he> seguem a grafia do curso (`data/translit.json`); as demais
  foram escritas para este capítulo.
- **Transliterações para conferir:** missadá (ס entre vogais vira ss, porque
  o ע não ganha letra), bsarí (shva inicial tratado como mudo, como se fala),
  beteavón (tônica na última), chúmus (tônica na primeira), sabích,
  teudát kashrút, meltsarít. O comentário "Dito ao servir ou ao começar" (bom
  apetite) é uso, não fato verificado: o autor confirma.
- **Seções que o brief pede e o capítulo ainda não tem:** shakshuka, pães,
  mercados, comida de rua em geral, tradições das festas, cafés, cozinha
  contemporânea, gorjeta, água e horários no Shabat no guia de restaurante.
- Nenhuma caixa "O olhar de um israelense" foi escrita.
- Nenhuma afirmação sobre o autor.
- Fotos: nenhuma prevista; se entrarem, sugestões são o balcão de homus, o
  quiosque de sabich e um certificado de kashrut (sem marca de terceiros
  identificável).
