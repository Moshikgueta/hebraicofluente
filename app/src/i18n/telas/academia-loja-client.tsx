import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* app/loja/LojaClient.tsx */
const pt = {
  localeNumero: 'pt-BR',
  motivoSaldo: 'Saldo insuficiente.',
  motivoLimite: (n: number) => `Você já tem ${n} folgas guardadas.`,
  motivoJaTem: 'Você já tem este item.',
  motivoSemAlvo: 'Não há carta fechada para abrir.',
  motivoSemNome: 'Confirme primeiro a grafia do seu nome.',
  pronto: 'Pronto!',

  titulo: 'Recompensas',
  intro: 'Troque o XP que você juntou estudando. O seu XP total é a sua conquista e nunca diminui - o que você gasta sai do saldo.',
  saldoParaTrocar: 'Saldo para trocar',
  xpTotal: 'XP total',
  jaTrocados: (n: string) => `${n} já trocados`,

  folgasGuardadas: (n: number) => `Você tem ${n} ${n === 1 ? 'folga guardada' : 'folgas guardadas'}.`,
  nenhumaFolga: 'Nenhuma folga guardada.',
  folgaFeito: 'Folga guardada. Se faltar um dia, ela protege a sua sequência.',
  proximaCarta: (titulo: string, n: number): ReactNode =>
    <>A próxima: <strong>{titulo}</strong> (abriria com {n} letras).</>,
  todasAbertas: 'Todas as cartas já estão abertas.',
  cartaFeito: 'Carta aberta! Leia em Viagem pela história.',
  lerCartas: 'Ler as cartas →',
  seuNome: (he: ReactNode): ReactNode => <>O seu nome: {he}</>,
  confirmeNome: (link: ReactNode): ReactNode => <>Antes, confirme como se escreve o seu nome em {link}.</>,
  meuNome: 'Meu nome',
  nomeFeito: 'Pronto! Escolha o formato e baixe a imagem.',
  leituraAberta: 'Leitura aberta! Ela está em Leituras bônus.',
  leituraGuardada: 'Leitura guardada em Leituras bônus. Volte a ela quando concluir as lições das letras do texto.',

  leiturasBonus: 'Leituras bônus',
  leiturasIntro: 'Trechos e versículos do Antigo Testamento, com transliteração, tradução e a leitura gravada, linha a linha.',
  cadaLeitura: (c: number) => `Cada leitura ◆ ${c}.`,
  textoEVersiculo: (texto: number, versiculo: number) => `Texto bíblico ◆ ${texto}, versículo ◆ ${versiculo}.`,
  podeTrocar: 'Você pode trocar qualquer leitura agora. Ela fica guardada em Leituras bônus, e já dá para ouvir e acompanhar pela transliteração e pela tradução.',
  lerSozinho: (mastered: number, totalLetras: number): ReactNode =>
    <>Ler sozinho, direto do hebraico, vem depois: cada leitura diz quantas lições de letras concluídas ela pede. Quando chegar lá, volte a ela. Você concluiu <strong>{mastered} de {totalLetras} lições de letras</strong>.</>,
  semDominioUma: (regra: string) => `Uma lição que você concluiu ficou abaixo de ${regra}. Refazer os exercícios dela já conta.`,
  semDominioVarias: (n: number, regra: string) => `${n} lições que você concluiu ficaram abaixo de ${regra}. Refazer os exercícios delas já conta.`,
  verLicoes: 'Ver as lições',
  guiaNikud: 'Guia opcional e gratuito: o nikud da Bíblia →',
  lerMinhas: 'Ler as minhas leituras →',
  paraLerSozinho: (after: number, faltam: number) =>
    `Para ler sozinho: ${after} lições de letras concluídas (${faltam === 1 ? 'falta 1' : `faltam ${faltam}`}).`,
  ler: 'Ler',
  trocarPor: (custo: number) => `Trocar por ◆ ${custo}`,

  nomeDecoradoTitulo: 'Seu nome em hebraico decorado',
  nomeDecoradoTexto: 'Já é seu. Escolha o formato e baixe quantas vezes quiser.',
  formato: 'Formato',
  nomeDecoradoAria: (nomeHe: string) => `O nome ${nomeHe} decorado`,
  baixarImagem: 'Baixar a imagem'
} as const;

const en: Traducao<typeof pt> = {
  localeNumero: 'en-US',
  motivoSaldo: 'Not enough balance.',
  motivoLimite: n => `You already have ${n} days off saved.`,
  motivoJaTem: 'You already have this item.',
  motivoSemAlvo: 'There is no locked card left to open.',
  motivoSemNome: 'First confirm how your name is spelled.',
  pronto: 'Done!',

  titulo: 'Rewards',
  intro: 'Trade the XP you have earned by studying. Your total XP is your achievement and never goes down - what you spend comes out of your balance.',
  saldoParaTrocar: 'Balance to trade',
  xpTotal: 'Total XP',
  jaTrocados: n => `${n} already traded`,

  folgasGuardadas: n => `You have ${n} ${n === 1 ? 'day off saved' : 'days off saved'}.`,
  nenhumaFolga: 'No days off saved.',
  folgaFeito: 'Day off saved. If you miss a day, it protects your streak.',
  proximaCarta: (titulo, n) =>
    <>Next up: <strong>{titulo}</strong> (it would open at {n} letters).</>,
  todasAbertas: 'All the cards are already open.',
  cartaFeito: 'Card opened! Read it in Journey through history.',
  lerCartas: 'Read the cards →',
  seuNome: he => <>Your name: {he}</>,
  confirmeNome: link => <>First, confirm how your name is written in {link}.</>,
  meuNome: 'My name',
  nomeFeito: 'Done! Choose the format and download the image.',
  leituraAberta: 'Reading opened! It is in Bonus readings.',
  leituraGuardada: 'Reading saved in Bonus readings. Come back to it when you finish the lessons for the letters in the text.',

  leiturasBonus: 'Bonus readings',
  leiturasIntro: 'Passages and verses from the Old Testament, with transliteration, translation and the recorded reading, line by line.',
  cadaLeitura: c => `Each reading ◆ ${c}.`,
  textoEVersiculo: (texto, versiculo) => `Biblical text ◆ ${texto}, verse ◆ ${versiculo}.`,
  podeTrocar: 'You can trade for any reading now. It stays saved in Bonus readings, and you can already listen and follow along with the transliteration and the translation.',
  lerSozinho: (mastered, totalLetras) =>
    <>Reading it on your own, straight from the Hebrew, comes later: each reading says how many completed letter lessons it needs. When you get there, come back to it. You have completed <strong>{mastered} of {totalLetras} letter lessons</strong>.</>,
  semDominioUma: regra => `One lesson you completed ended up below ${regra}. Redoing its exercises already counts.`,
  semDominioVarias: (n, regra) => `${n} lessons you completed ended up below ${regra}. Redoing their exercises already counts.`,
  verLicoes: 'See the lessons',
  guiaNikud: 'Optional free guide: the nikud of the Bible →',
  lerMinhas: 'Read my readings →',
  paraLerSozinho: (after, faltam) =>
    `To read on your own: ${after} completed letter lessons (${faltam === 1 ? '1 to go' : `${faltam} to go`}).`,
  ler: 'Read',
  trocarPor: custo => `Trade for ◆ ${custo}`,

  nomeDecoradoTitulo: 'Your decorated name in Hebrew',
  nomeDecoradoTexto: 'It is yours. Choose the format and download it as many times as you like.',
  formato: 'Format',
  nomeDecoradoAria: nomeHe => `The name ${nomeHe}, decorated`,
  baixarImagem: 'Download the image'
};

const es: Traducao<typeof pt> = {
  localeNumero: 'es-419',
  motivoSaldo: 'Saldo insuficiente.',
  motivoLimite: n => `Ya tienes ${n} días libres guardados.`,
  motivoJaTem: 'Ya tienes este artículo.',
  motivoSemAlvo: 'No queda ninguna tarjeta cerrada para abrir.',
  motivoSemNome: 'Primero confirma cómo se escribe tu nombre.',
  pronto: '¡Listo!',

  titulo: 'Recompensas',
  intro: 'Canjea el XP que juntaste estudiando. Tu XP total es tu logro y nunca baja - lo que gastas sale de tu saldo.',
  saldoParaTrocar: 'Saldo para canjear',
  xpTotal: 'XP total',
  jaTrocados: n => `${n} ya canjeados`,

  folgasGuardadas: n => `Tienes ${n} ${n === 1 ? 'día libre guardado' : 'días libres guardados'}.`,
  nenhumaFolga: 'Ningún día libre guardado.',
  folgaFeito: 'Día libre guardado. Si te falta un día, protege tu racha.',
  proximaCarta: (titulo, n) =>
    <>La siguiente: <strong>{titulo}</strong> (se abriría con {n} letras).</>,
  todasAbertas: 'Todas las tarjetas ya están abiertas.',
  cartaFeito: '¡Tarjeta abierta! Léela en Viaje por la historia.',
  lerCartas: 'Leer las tarjetas →',
  seuNome: he => <>Tu nombre: {he}</>,
  confirmeNome: link => <>Antes, confirma cómo se escribe tu nombre en {link}.</>,
  meuNome: 'Mi nombre',
  nomeFeito: '¡Listo! Elige el formato y descarga la imagen.',
  leituraAberta: '¡Lectura abierta! Está en Lecturas extra.',
  leituraGuardada: 'Lectura guardada en Lecturas extra. Vuelve a ella cuando termines las lecciones de las letras del texto.',

  leiturasBonus: 'Lecturas extra',
  leiturasIntro: 'Pasajes y versículos del Antiguo Testamento, con transliteración, traducción y la lectura grabada, línea por línea.',
  cadaLeitura: c => `Cada lectura ◆ ${c}.`,
  textoEVersiculo: (texto, versiculo) => `Texto bíblico ◆ ${texto}, versículo ◆ ${versiculo}.`,
  podeTrocar: 'Puedes canjear cualquier lectura ahora. Queda guardada en Lecturas extra, y ya puedes escucharla y seguirla con la transliteración y la traducción.',
  lerSozinho: (mastered, totalLetras) =>
    <>Leer por tu cuenta, directo del hebreo, viene después: cada lectura dice cuántas lecciones de letras terminadas pide. Cuando llegues ahí, vuelve a ella. Terminaste <strong>{mastered} de {totalLetras} lecciones de letras</strong>.</>,
  semDominioUma: regra => `Una lección que terminaste quedó por debajo de ${regra}. Rehacer sus ejercicios ya cuenta.`,
  semDominioVarias: (n, regra) => `${n} lecciones que terminaste quedaron por debajo de ${regra}. Rehacer sus ejercicios ya cuenta.`,
  verLicoes: 'Ver las lecciones',
  guiaNikud: 'Guía opcional y gratuita: el nikud de la Biblia →',
  lerMinhas: 'Leer mis lecturas →',
  paraLerSozinho: (after, faltam) =>
    `Para leer por tu cuenta: ${after} lecciones de letras terminadas (${faltam === 1 ? 'falta 1' : `faltan ${faltam}`}).`,
  ler: 'Leer',
  trocarPor: custo => `Canjear por ◆ ${custo}`,

  nomeDecoradoTitulo: 'Tu nombre en hebreo decorado',
  nomeDecoradoTexto: 'Ya es tuyo. Elige el formato y descárgalo las veces que quieras.',
  formato: 'Formato',
  nomeDecoradoAria: nomeHe => `El nombre ${nomeHe} decorado`,
  baixarImagem: 'Descargar la imagen'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
