# Auditoria linguística: versão 0.2.0

**Método.** As 100 expressões, as variantes, os exemplos, as 38 falas dos diálogos e o hebraico novo dos quadros foram revistos em três frentes:

1. **Revisão por item:** grafia sem nikud, nikud, pronúncia, sílaba tônica, transliteração, tradução, gênero e número, registro e naturalidade.
2. **Verificação automática** (`_motor/conferir.mjs`):
   - exatamente 100 itens, sem id nem hebraico repetido;
   - a grafia sem vogais é compatível com a forma com nikud;
   - sem caractere estranho e com o hebraico em NFC;
   - a transliteração segue a convenção: acento na sílaba forte, monossílabo sem acento.
3. **Consulta a dicionários na web**, limitada: `pealim.com` e `en.wiktionary.org` não abriram por DNS no ambiente da sessão. Só duas formas foram confirmadas em fonte; as demais repousam no conhecimento de hebraico israelense do revisor e estão marcadas como tal.

**Nada aqui substitui a revisão do autor**, falante nativo. Todas as 100 expressões continuam com `revisao: "rascunho"` até a aprovação dele, e o PDF sai com a faixa RASCUNHO.

## Correções feitas

| Local | Original | Corrigido | Justificativa | Confiança | Fonte |
| --- | --- | --- | --- | --- | --- |
| 093 (expressão) | אֶפְשָׁר לְדַבֵּר לְאַט? efshár ledabér leát? | אֶפְשָׁר לְדַבֵּר יוֹתֵר לְאַט? efshár ledabér yotér leát? | A tradução é "mais devagar". Sem יוֹתֵר, a frase pede "devagar". As duas existem; esta corresponde ao português. | média-alta | conhecimento do revisor |
| 090 (contexto) | עֶזְרָה! apresentado como "Socorro! Ajuda!" | Sentido "Ajuda!"; o contexto ensina que, em perigo, o grito é הַצִילוּ! (hatsílu!) | עזרה se entende, mas הצילו é o grito usual de socorro. O item foi mantido para não mexer na numeração; a troca do item é decisão do autor. | média | hebrewpod101.com/lesson/survival-phrases-48-help-in-hebrew ; blogs.transparent.com/hebrew/when-an-emergency-arises/ |
| 099 (contexto) | רוֹפְאָה (rofeá) | rofá | O shva sob פ é mudo: rof-'á. Pela convenção, o álef não se escreve. | alta | conhecimento do revisor (o plural רוֹפְאִים, "rof'ím", tem o mesmo shva mudo) |
| 043, 079 (contexto) | éin, éin knissá | ein, ein knissá | Monossílabo não leva acento (regra da própria convenção). | alta | convenção do guia |
| 019 (nota) | shmí | shmi | Monossílabo. | alta | convenção do guia |
| 012 (contexto) | bái | bai | Monossílabo (ditongo). | média | convenção do guia |
| 062 (contexto) | taksí | táksi | Em Israel se diz TÁK-si (טקסי). | média | conhecimento do revisor |
| 065 (exemplo) | זֶה נוֹסֵעַ לְתֵל אָבִיב? ze nosséa leTél Avív? | זֶה נוֹסֵעַ לִירוּשָׁלַיִם? ze nosséa lirushaláyim? | "leTél" acentuava um monossílabo. O exemplo passou a Jerusalém, destino mais provável de uma caravana. לְ + יְרוּשָׁלַיִם = לִירוּשָׁלַיִם. | alta | regra de prefixo diante de יְ |
| 038 (contexto) | só "lakáchat o lashévet?" | acrescenta a ordem inversa (lashévet o lakáchat?) | No balcão as duas ordens são ouvidas. | baixa (é só nota) | conhecimento do revisor |
| 029 (contexto) | "Em hebraico não soa rude como pode soar em português." | "Com bevakashá no fim, soa educado; para um pedido ainda mais suave, use efshár." | A frase original generalizava. A nova dá a regra de uso. | alta | editorial |
| 032 (nota) | "Hafúch quer dizer virado: primeiro vai o leite, depois o café." | "A explicação mais repetida: no hafúch o leite vai primeiro e o café, por cima." | A origem do nome é disputada (ver VERIFICACAO-FACTUAL.md). | alta | forward.com/articles/11165/ |
| 010 (sentido) | "Boa noite (ao chegar)." | "Boa tarde, no fim do dia. Boa noite, ao chegar." | עֶרֶב começa no fim da tarde; em português isso ainda é "boa tarde". | alta | uso |
| diálogo "conversa" | revisado | mantido: וּלְךָ? (ulechá?) | A dúvida era trocar por וְאַתָּה?. A revisão concluiu que ulechá é natural e idiomático; as duas servem. | média | conhecimento do revisor |

## Conferido e mantido

- **Pronúncias:**
  - בֶּטַח: bétach, com a força na primeira sílaba (segolado);
  - יְצִיאַת חֵרוּם: yetsiát cherúm (confirmado em pealim.com/dict/5199-cherum);
  - chúmus, faláfel, ótobus, tishá, shivá, shtáyim.
- **Grafias:** הכול, como a Academia recomenda (o cartão avisa que הכל também aparece); הפוך; אשראי; אין כניסה (entrada proibida).
- **Naturalidade:** מָה בִּשְׁבִילְךָ? no balcão, אֶפְשָׁר בְּאַשְׁרַאי? para pagar com cartão, וּלְךָ? depois de dizer o nome.
- **Gênero nos diálogos:**
  - mistakélet (quem fala é mulher);
  - "Muito obrigada" na fala dela;
  - atá dirigido ao morador;
  - lach e ulechá na conversa;
  - hafúch echád (café é masculino).
- **Acentos coloquiais escolhidos de propósito** (o normativo vem entre parênteses): súkar (sukár), shmóne (shmoné), árba (arbá). São os que o viajante ouve.

## Hebraico novo desta versão (para a revisão do autor)

Escrito para as situações reais e para os quadros "Você vai ouvir". Não faz parte das 100 expressões. Fora o primeiro, que já existe no rascunho do A1, nada disso aparece igual no curso:

- מָה בִּשְׁבִילְךָ? / בִּשְׁבִילֵךְ (já no rascunho do A1)
- עוֹד מַשֶׁהוּ?
- הַכֹּל בְּסֵדֶר?
- בְּאַשְׁרַאי אוֹ בִּמְזֻמָן?
- צָרִיךְ שַׂקִית?
- רוֹצֶה קַבָּלָה? / רוֹצָה
- הַתַחֲנָה הַבָּאָה
- לְאָן?
- אֵין בְּעָיָה!
- כַּמָה זֶה?
- עֶשְׂרִים וְחָמֵשׁ שֶׁקֶל
- גְבָרִים, נָשִׁים
- הַצִילוּ!

A lista completa, com transliteração e onde cada frase aparece, está em `REVISAO.md`.

## Pendências linguísticas (decisão humana)

1. **Nikud:** continua na convenção do curso de alfabetização (daguesh só em בּ כּ פּ), agora explicada ao leitor no capítulo 1. Normativamente, o nikud completo teria daguesh também em תּ, no מּ de כַּמָּה e assim por diante. É uma escolha didática, não um erro, mas é decisão do autor.
2. **090:** manter עֶזְרָה! como item ou trocar por הַצִילוּ!.
3. **Preços falados:** o guia afirma que se ouve com frequência o número de contar mais shékel no singular. A frase evita "todo mundo diz", mas o autor deve confirmar.
4. **Alinhar o A1:** o rascunho do A1 (unidade 20) traz בְּטַח betách. Se bétach é a pronúncia certa, o A1 deve mudar.
