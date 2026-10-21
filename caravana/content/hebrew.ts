// Hebraico para a viagem.
//
// `hebrew` e a forma das placas e cardapios, sem os sinais de vogal (nikud).
// `hebrewPointed` traz o nikud para quem quiser ler letra por letra.
// Transliteracao pensada para quem fala portugues: o acento marca a silaba
// forte, e "ch" soa como o "rr" de "carro".
//
// Todos os itens nascem 'pending_native_review'. O texto foi escrito para a
// demonstracao e so deve ir a uma caravana real depois da revisao de um falante
// nativo, que tambem grava o audio (audio_assets, source 'native_recording').

export type HebrewCategory = { id: string; label: string; intro: string };

export const hebrewCategories: HebrewCategory[] = [
  { id: 'cumprimentos', label: 'Cumprimentos', intro: 'Para chegar, se despedir e puxar conversa.' },
  { id: 'cortesia', label: 'Cortesia', intro: 'As palavras que abrem portas em qualquer lugar.' },
  { id: 'restaurante', label: 'Restaurante', intro: 'Do cardápio à conta.' },
  { id: 'compras', label: 'Compras e preços', intro: 'Para o mercado, a loja e a barraca de rua.' },
  { id: 'numeros', label: 'Números', intro: 'Nos preços e na contagem, usa-se a forma feminina dos números.' },
  { id: 'transporte', label: 'Transporte', intro: 'Ônibus, trem e táxi.' },
  { id: 'orientacao', label: 'Orientação', intro: 'Para perguntar o caminho e entender a resposta.' },
  { id: 'placas', label: 'Placas', intro: 'Palavras que você vai ver escritas pelas ruas.' },
  { id: 'lugares', label: 'Nomes de lugares', intro: 'Como os israelenses chamam os lugares do roteiro.' },
  { id: 'cotidiano', label: 'No dia a dia', intro: 'Expressões que você vai ouvir o tempo todo.' },
];

export type ExpressionSeed = {
  slug: string;
  category: string;
  hebrew: string;
  hebrewPointed?: string;
  transliteration: string;
  translation: string;
  exampleHe?: string;
  exampleTranslit?: string;
  exampleTranslation?: string;
  usageNote?: string;
};

export const expressions: ExpressionSeed[] = [
  // Cumprimentos
  { slug: 'shalom', category: 'cumprimentos', hebrew: 'שלום', hebrewPointed: 'שָׁלוֹם', transliteration: 'shalóm', translation: 'olá; tchau; paz', usageNote: 'Serve para chegar e para ir embora. A palavra também quer dizer "paz".' },
  { slug: 'boker-tov', category: 'cumprimentos', hebrew: 'בוקר טוב', hebrewPointed: 'בֹּקֶר טוֹב', transliteration: 'bóker tov', translation: 'bom dia', usageNote: 'Uma resposta comum é "bóker or", manhã de luz.' },
  { slug: 'erev-tov', category: 'cumprimentos', hebrew: 'ערב טוב', hebrewPointed: 'עֶרֶב טוֹב', transliteration: 'érev tov', translation: 'boa noite (ao chegar)', usageNote: 'Para cumprimentar à noite. Na despedida, antes de dormir, diz-se "láila tov".' },
  { slug: 'laila-tov', category: 'cumprimentos', hebrew: 'לילה טוב', hebrewPointed: 'לַיְלָה טוֹב', transliteration: 'láila tov', translation: 'boa noite (ao se despedir)' },
  { slug: 'ma-nishma', category: 'cumprimentos', hebrew: 'מה נשמע?', hebrewPointed: 'מָה נִשְׁמָע?', transliteration: 'ma nishmá?', translation: 'tudo bem? (literalmente: o que se ouve?)', usageNote: 'Informal. A resposta mais comum é "hakól bessêder", está tudo bem.' },
  { slug: 'lehitraot', category: 'cumprimentos', hebrew: 'להתראות', hebrewPointed: 'לְהִתְרָאוֹת', transliteration: 'lehitraót', translation: 'até logo' },
  { slug: 'shabat-shalom', category: 'cumprimentos', hebrew: 'שבת שלום', hebrewPointed: 'שַׁבָּת שָׁלוֹם', transliteration: 'shabát shalóm', translation: 'bom shabat', usageNote: 'De sexta à tarde até sábado à noite, é o cumprimento que você vai ouvir em toda parte.' },
  { slug: 'ani-mibrazil', category: 'cumprimentos', hebrew: 'אני מברזיל', hebrewPointed: 'אֲנִי מִבְּרָזִיל', transliteration: 'aní mibrazíl', translation: 'eu sou do Brasil' },

  // Cortesia
  { slug: 'toda', category: 'cortesia', hebrew: 'תודה', hebrewPointed: 'תּוֹדָה', transliteration: 'todá', translation: 'obrigado, obrigada' },
  { slug: 'toda-raba', category: 'cortesia', hebrew: 'תודה רבה', hebrewPointed: 'תּוֹדָה רַבָּה', transliteration: 'todá rabá', translation: 'muito obrigado, muito obrigada' },
  { slug: 'bevakasha', category: 'cortesia', hebrew: 'בבקשה', hebrewPointed: 'בְּבַקָּשָׁה', transliteration: 'bevakashá', translation: 'por favor; de nada; aqui está', usageNote: 'A mesma palavra serve para pedir, para responder a um obrigado e para entregar algo.' },
  { slug: 'slicha', category: 'cortesia', hebrew: 'סליחה', hebrewPointed: 'סְלִיחָה', transliteration: 'slichá', translation: 'com licença; desculpe', usageNote: 'Também serve para chamar a atenção de alguém antes de uma pergunta.' },
  { slug: 'ken', category: 'cortesia', hebrew: 'כן', hebrewPointed: 'כֵּן', transliteration: 'ken', translation: 'sim' },
  { slug: 'lo', category: 'cortesia', hebrew: 'לא', hebrewPointed: 'לֹא', transliteration: 'lo', translation: 'não' },
  { slug: 'ein-beaya', category: 'cortesia', hebrew: 'אין בעיה', hebrewPointed: 'אֵין בְּעָיָה', transliteration: 'ein beayá', translation: 'sem problema' },
  { slug: 'medaber-anglit', category: 'cortesia', hebrew: 'אתה מדבר אנגלית?', hebrewPointed: 'אַתָּה מְדַבֵּר אַנְגְּלִית?', transliteration: 'atá medabér ánglit?', translation: 'você fala inglês? (a um homem)', usageNote: 'A uma mulher: "at medabéret ánglit?".' },

  // Restaurante
  { slug: 'tafrit', category: 'restaurante', hebrew: 'תפריט', hebrewPointed: 'תַּפְרִיט', transliteration: 'tafrít', translation: 'cardápio' },
  { slug: 'mayim', category: 'restaurante', hebrew: 'מים', hebrewPointed: 'מַיִם', transliteration: 'máyim', translation: 'água' },
  { slug: 'kafe', category: 'restaurante', hebrew: 'קפה', hebrewPointed: 'קָפֶה', transliteration: 'kafé', translation: 'café' },
  { slug: 'cheshbon', category: 'restaurante', hebrew: 'החשבון, בבקשה', hebrewPointed: 'הַחֶשְׁבּוֹן, בְּבַקָּשָׁה', transliteration: 'hacheshbón, bevakashá', translation: 'a conta, por favor' },
  { slug: 'beteavon', category: 'restaurante', hebrew: 'בתיאבון', hebrewPointed: 'בְּתֵאָבוֹן', transliteration: 'beteavón', translation: 'bom apetite' },
  { slug: 'tsimchoni', category: 'restaurante', hebrew: 'צמחוני', hebrewPointed: 'צִמְחוֹנִי', transliteration: 'tsimchoní', translation: 'vegetariano' },

  // Compras
  { slug: 'kama-ze-ole', category: 'compras', hebrew: 'כמה זה עולה?', hebrewPointed: 'כַּמָּה זֶה עוֹלֶה?', transliteration: 'kamá ze olé?', translation: 'quanto custa?' },
  { slug: 'shekel', category: 'compras', hebrew: 'שקל', hebrewPointed: 'שֶׁקֶל', transliteration: 'shékel', translation: 'shekel, a moeda de Israel', usageNote: 'No plural: "shkalím".' },
  { slug: 'yakar', category: 'compras', hebrew: 'יקר', hebrewPointed: 'יָקָר', transliteration: 'yakár', translation: 'caro' },
  { slug: 'zol', category: 'compras', hebrew: 'זול', hebrewPointed: 'זוֹל', transliteration: 'zol', translation: 'barato' },

  // Numeros
  { slug: 'achat', category: 'numeros', hebrew: 'אחת', hebrewPointed: 'אַחַת', transliteration: 'achát', translation: 'um (1)' },
  { slug: 'shtayim', category: 'numeros', hebrew: 'שתיים', hebrewPointed: 'שְׁתַּיִם', transliteration: 'shtáyim', translation: 'dois (2)' },
  { slug: 'shalosh', category: 'numeros', hebrew: 'שלוש', hebrewPointed: 'שָׁלוֹשׁ', transliteration: 'shalósh', translation: 'três (3)' },
  { slug: 'eser', category: 'numeros', hebrew: 'עשר', hebrewPointed: 'עֶשֶׂר', transliteration: 'éser', translation: 'dez (10)' },
  { slug: 'esrim', category: 'numeros', hebrew: 'עשרים', hebrewPointed: 'עֶשְׂרִים', transliteration: 'esrím', translation: 'vinte (20)' },
  { slug: 'mea', category: 'numeros', hebrew: 'מאה', hebrewPointed: 'מֵאָה', transliteration: 'meá', translation: 'cem (100)' },

  // Transporte
  { slug: 'tachana', category: 'transporte', hebrew: 'תחנה', hebrewPointed: 'תַּחֲנָה', transliteration: 'tachaná', translation: 'estação; ponto de ônibus' },
  { slug: 'otobus', category: 'transporte', hebrew: 'אוטובוס', hebrewPointed: 'אוֹטוֹבּוּס', transliteration: 'ótobus', translation: 'ônibus' },
  { slug: 'monit', category: 'transporte', hebrew: 'מונית', hebrewPointed: 'מוֹנִית', transliteration: 'monít', translation: 'táxi' },
  { slug: 'rakevet', category: 'transporte', hebrew: 'רכבת', hebrewPointed: 'רַכֶּבֶת', transliteration: 'rakévet', translation: 'trem' },

  // Orientacao
  { slug: 'eifo', category: 'orientacao', hebrew: 'איפה?', hebrewPointed: 'אֵיפֹה?', transliteration: 'éifo?', translation: 'onde?', exampleHe: 'איפה השירותים?', exampleTranslit: 'éifo hasherutím?', exampleTranslation: 'onde fica o banheiro?' },
  { slug: 'yamina', category: 'orientacao', hebrew: 'ימינה', hebrewPointed: 'יָמִינָה', transliteration: 'yamína', translation: 'à direita' },
  { slug: 'smola', category: 'orientacao', hebrew: 'שמאלה', hebrewPointed: 'שְׂמֹאלָה', transliteration: 'smóla', translation: 'à esquerda' },
  { slug: 'yashar', category: 'orientacao', hebrew: 'ישר', hebrewPointed: 'יָשָׁר', transliteration: 'yashár', translation: 'em frente' },

  // Placas
  { slug: 'knisa', category: 'placas', hebrew: 'כניסה', hebrewPointed: 'כְּנִיסָה', transliteration: 'knissá', translation: 'entrada' },
  { slug: 'yetsia', category: 'placas', hebrew: 'יציאה', hebrewPointed: 'יְצִיאָה', transliteration: 'yetsiá', translation: 'saída' },
  { slug: 'sherutim', category: 'placas', hebrew: 'שירותים', hebrewPointed: 'שֵׁרוּתִים', transliteration: 'sherutím', translation: 'banheiros' },
  { slug: 'sagur', category: 'placas', hebrew: 'סגור', hebrewPointed: 'סָגוּר', transliteration: 'sagúr', translation: 'fechado' },
  { slug: 'patuach', category: 'placas', hebrew: 'פתוח', hebrewPointed: 'פָּתוּחַ', transliteration: 'patúach', translation: 'aberto' },

  // Lugares
  { slug: 'yerushalayim', category: 'lugares', hebrew: 'ירושלים', hebrewPointed: 'יְרוּשָׁלַיִם', transliteration: 'Yerushaláyim', translation: 'Jerusalém' },
  { slug: 'hakotel', category: 'lugares', hebrew: 'הכותל', hebrewPointed: 'הַכֹּתֶל', transliteration: 'HaKótel', translation: 'o Muro (Ocidental)' },
  { slug: 'kineret', category: 'lugares', hebrew: 'כנרת', hebrewPointed: 'כִּנֶּרֶת', transliteration: 'Kinéret', translation: 'Mar da Galileia' },
  { slug: 'yafo', category: 'lugares', hebrew: 'יפו', hebrewPointed: 'יָפוֹ', transliteration: 'Yáfo', translation: 'Jaffa' },
  { slug: 'metsada', category: 'lugares', hebrew: 'מצדה', hebrewPointed: 'מְצָדָה', transliteration: 'Metsadá', translation: 'Massada', usageNote: 'A palavra quer dizer "fortaleza".' },
  { slug: 'yam-hamelach', category: 'lugares', hebrew: 'ים המלח', hebrewPointed: 'יָם הַמֶּלַח', transliteration: 'Yam HaMélach', translation: 'Mar Morto', usageNote: 'Ao pé da letra, "Mar do Sal".' },

  // Cotidiano
  { slug: 'beseder', category: 'cotidiano', hebrew: 'בסדר', hebrewPointed: 'בְּסֵדֶר', transliteration: 'bessêder', translation: 'tudo bem; combinado' },
  { slug: 'hakol-beseder', category: 'cotidiano', hebrew: 'הכל בסדר', hebrewPointed: 'הַכֹּל בְּסֵדֶר', transliteration: 'hakól bessêder', translation: 'está tudo bem' },
  { slug: 'yofi', category: 'cotidiano', hebrew: 'יופי', hebrewPointed: 'יֹפִי', transliteration: 'yófi', translation: 'que ótimo!; que lindo!' },
  { slug: 'rega', category: 'cotidiano', hebrew: 'רגע', hebrewPointed: 'רֶגַע', transliteration: 'réga', translation: 'um momento' },
  { slug: 'sababa', category: 'cotidiano', hebrew: 'סבבה', transliteration: 'sabába', translation: 'beleza; combinado (gíria)' },
];
