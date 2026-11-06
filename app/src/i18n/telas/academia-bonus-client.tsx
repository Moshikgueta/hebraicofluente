import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* app/bonus/BonusClient.tsx */
const pt = {
  naoESua: 'Esta leitura ainda não é sua. Ela se abre com XP, em Recompensas.',
  naoExiste: 'Esta leitura não existe.',
  irRecompensas: 'Ir para Recompensas',
  voltarBonus: '← Leituras bônus',
  aFrente: 'Este texto ainda está à sua frente',
  aFrenteTexto: (after: number, mastered: number) =>
    `Para ler este texto sozinho, você precisa dominar ${after} letras, e hoje domina ${mastered}. Por enquanto, ouça cada linha e acompanhe pela transliteração e pela tradução. Quando dominar as letras, volte aqui e leia direto do hebraico. Ele continua guardado em Leituras bônus.`,
  porQueHashem: 'Por que a gravação diz «Hashém»?',
  hashemTexto: (nome: ReactNode, link: ReactNode): ReactNode =>
    <>Onde está escrito {nome}, o nome de Deus, a gravação diz «Hashém», «o Nome». É um costume judaico: o Nome não se pronuncia, e fora da reza muitos evitam até «Adonái», que é como se lê na reza e na sinagoga. A transliteração mostra o que se ouve.{' '}{link}.</>,
  maisNoGuia: 'Mais no guia',
  leiaEmVozAlta: 'Leia em voz alta',
  leiaInstrucao: 'Leia devagar, uma linha de cada vez, grave e se ouça. Depois compare com a gravação de cada linha.',
  traducaoLiteral: 'A tradução é literal, para acompanhar o hebraico linha a linha.',

  titulo: 'Leituras bônus',
  intro: 'Trechos e versículos do Antigo Testamento, com transliteração, tradução e a leitura gravada. Você abre cada uma com XP, em Recompensas.',
  nenhuma: 'Você ainda não abriu nenhuma leitura.',
  verRecompensas: 'Ver em Recompensas',

  guiaOpcional: 'Guia opcional · sem XP',
  guiaSeta: (titulo: string) => `${titulo} →`,
  guiaTexto: 'O Nome, o shva, as vogais rápidas e os outros pontos que a Bíblia usa além do curso.'
} as const;

const en: Traducao<typeof pt> = {
  naoESua: 'This reading is not yours yet. It opens with XP, in Rewards.',
  naoExiste: 'This reading does not exist.',
  irRecompensas: 'Go to Rewards',
  voltarBonus: '← Bonus readings',
  aFrente: 'This text is still ahead of you',
  aFrenteTexto: (after, mastered) =>
    `To read this text on your own, you need to master ${after} letters, and today you master ${mastered}. For now, listen to each line and follow along with the transliteration and the translation. When you master the letters, come back and read it straight from the Hebrew. It stays saved in Bonus readings.`,
  porQueHashem: 'Why does the recording say «Hashem»?',
  hashemTexto: (nome, link) =>
    <>Where the text has {nome}, the name of God, the recording says «Hashem», «the Name». It is a Jewish custom: the Name is not pronounced, and outside of prayer many people avoid even «Adonai», which is how it is read in prayer and in the synagogue. The transliteration shows what you hear.{' '}{link}.</>,
  maisNoGuia: 'More in the guide',
  leiaEmVozAlta: 'Read aloud',
  leiaInstrucao: 'Read slowly, one line at a time, record yourself and listen. Then compare with the recording of each line.',
  traducaoLiteral: 'The translation is literal, so you can follow the Hebrew line by line.',

  titulo: 'Bonus readings',
  intro: 'Passages and verses from the Old Testament, with transliteration, translation and the recorded reading. You open each one with XP, in Rewards.',
  nenhuma: 'You have not opened any reading yet.',
  verRecompensas: 'See in Rewards',

  guiaOpcional: 'Optional guide · no XP',
  guiaSeta: titulo => `${titulo} →`,
  guiaTexto: 'The Name, the shva, the quick vowels and the other marks the Bible uses beyond the course.'
};

const es: Traducao<typeof pt> = {
  naoESua: 'Esta lectura todavía no es tuya. Se abre con XP, en Recompensas.',
  naoExiste: 'Esta lectura no existe.',
  irRecompensas: 'Ir a Recompensas',
  voltarBonus: '← Lecturas extra',
  aFrente: 'Este texto todavía está más adelante',
  aFrenteTexto: (after, mastered) =>
    `Para leer este texto por tu cuenta, necesitas dominar ${after} letras, y hoy dominas ${mastered}. Por ahora, escucha cada línea y síguela con la transliteración y la traducción. Cuando domines las letras, vuelve aquí y léelo directo del hebreo. Sigue guardado en Lecturas extra.`,
  porQueHashem: '¿Por qué la grabación dice «Hashém»?',
  hashemTexto: (nome, link) =>
    <>Donde está escrito {nome}, el nombre de Dios, la grabación dice «Hashém», «el Nombre». Es una costumbre judía: el Nombre no se pronuncia, y fuera del rezo muchos evitan incluso «Adonái», que es como se lee en el rezo y en la sinagoga. La transliteración muestra lo que se oye.{' '}{link}.</>,
  maisNoGuia: 'Más en la guía',
  leiaEmVozAlta: 'Lee en voz alta',
  leiaInstrucao: 'Lee despacio, una línea a la vez, grábate y escúchate. Después compara con la grabación de cada línea.',
  traducaoLiteral: 'La traducción es literal, para seguir el hebreo línea por línea.',

  titulo: 'Lecturas extra',
  intro: 'Pasajes y versículos del Antiguo Testamento, con transliteración, traducción y la lectura grabada. Abres cada una con XP, en Recompensas.',
  nenhuma: 'Todavía no abriste ninguna lectura.',
  verRecompensas: 'Ver en Recompensas',

  guiaOpcional: 'Guía opcional · sin XP',
  guiaSeta: titulo => `${titulo} →`,
  guiaTexto: 'El Nombre, el shvá, las vocales rápidas y los otros signos que la Biblia usa más allá del curso.'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
