import type { Traducao } from '..';

/* lib/certificate.ts - os textos desenhados no certificado, a data por
   extenso, o nome do arquivo e o texto para compartilhar. */
const MESES_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];
const MESES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const pt = {
  titulo: 'Certificado de conclusão',
  curso: 'Curso de alfabetização em hebraico moderno',
  alunoPadrao: 'Aluno',
  feito1: 'leu as 22 letras do alfabeto hebraico,',
  feito2: 'os sinais de vogal e palavras inteiras -',
  feito3: 'sem transliteração para se apoiar.',
  exame: 'Exame final: {nota}%',
  honesto: 'Emitido pela plataforma. Não é um certificado oficial de proficiência.',
  data: (d: Date): string => `${d.getDate()} de ${MESES_PT[d.getMonth()]} de ${d.getFullYear()}`,
  arquivoPadrao: 'aluno',
  arquivo: 'certificado-hebraico-fluente-{nome}.png',
  compartilhar: 'Eu não sabia ler uma letra do alfabeto hebraico. Hoje leio as 22 - e palavras inteiras, sem transliteração. 🎉'
} as const;

const en: Traducao<typeof pt> = {
  titulo: 'Certificate of completion',
  curso: 'Modern Hebrew reading course',
  alunoPadrao: 'Student',
  feito1: 'read the 22 letters of the Hebrew alphabet,',
  feito2: 'the vowel signs and whole words -',
  feito3: 'with no transliteration to lean on.',
  exame: 'Final exam: {nota}%',
  honesto: 'Issued by the platform. This is not an official certificate of proficiency.',
  data: (d: Date): string => `${MESES_EN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
  arquivoPadrao: 'student',
  arquivo: 'certificate-hebraico-fluente-{nome}.png',
  compartilhar: 'I could not read a single letter of the Hebrew alphabet. Today I read all 22 - and whole words, without transliteration. 🎉'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
