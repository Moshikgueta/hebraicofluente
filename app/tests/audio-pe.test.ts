/* O som do Pe e do Fe (29/09/2026): toda palavra com פּ, פ ou ף que o curso
 * mostra com botão de áudio tem gravação, e cada leitura da letra toca o
 * exemplo certo - /p/ para פּ, /f/ para פ e ף. */
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { allLetters, extras } from '../src/lib/content';

const AUDIO = new URL('../../audio/', import.meta.url);
const gravado = (id: string) => existsSync(new URL(`${id}.mp3`, AUDIO));
const idDe = (he: string) => 'he-' + createHash('sha256').update(he.normalize('NFC')).digest('hex').slice(0, 8);
const temPe = (he: string) => /[פף]/.test(he);

describe('o som do Pe e do Fe', () => {
  const pe = allLetters().find(l => l.id === 'pe')!;

  it('as três leituras da letra tocam: פּ = "pa", פ = "fa", ף = uma palavra que termina em ף', () => {
    const por = Object.fromEntries(pe.variantes.map(v => [v.he, v]));
    expect(por['פּ']!.exemploHe).toBe('פַּ'.normalize('NFC'));
    expect(por['פ']!.exemploHe).toBe('פַ'.normalize('NFC'));
    expect(por['ף']!.exemploHe.replace(/[֑-ׇ]/g, '').endsWith('ף')).toBe(true);
    for (const v of pe.variantes) {
      expect(v.audioId).toBe(idDe(v.exemploHe));
      expect(gravado(v.audioId), `${v.he} → ${v.exemploHe}`).toBe(true);
    }
    /* A letra desenhada no quadro não muda: continua a forma, com o ponto
       ou sem ele. */
    expect(pe.variantes.map(v => v.he)).toEqual(['פּ', 'פ', 'ף'].map(s => s.normalize('NFC')));
  });

  it('toda letra com mais de uma leitura tem som em cada uma', () => {
    for (const L of allLetters()) {
      for (const v of L.variantes ?? []) expect(gravado(v.audioId), `${L.id} ${v.he}`).toBe(true);
    }
  });

  it('toda palavra e sílaba com פ/פּ/ף que tem botão de áudio tem gravação', () => {
    const itens: { he: string; audioId: string }[] = [];
    for (const L of allLetters()) {
      itens.push(...L.syllables, ...L.wordsToRead, ...L.wordsToRecognize);
    }
    for (const S of extras().sons) itens.push(...S.silabas, ...S.parSilabas, ...S.palavras, ...S.parPalavras);
    for (const D of extras().dagesh.letters) itens.push(...D.hardWords, ...D.softWords);
    extras().finals.forEach(F => itens.push({ he: F.word, audioId: F.audioId }));
    const comPe = itens.filter(i => temPe(i.he));
    expect(comPe.length).toBeGreaterThan(20);
    const sem = comPe.filter(i => !gravado(i.audioId)).map(i => i.he);
    expect(sem).toEqual([]);
    /* E o id é o do próprio texto mostrado, com o nikud: פּ e פ nunca
       dividem uma gravação. Desde 12/10/2026 um texto que só perdeu um
       daguesh sem som (tools/daguesh.mjs) guarda o id de antes, pelo
       apelido de data/audio-alias.json. */
    const alias = (JSON.parse(readFileSync(new URL('../../data/audio-alias.json', import.meta.url), 'utf8')) as
      { alias: Record<string, string> }).alias;
    for (const i of comPe) expect(i.audioId).toBe(alias[i.he.normalize('NFC')] ?? idDe(i.he));
  });

  it('com nikud e sem nikud: a palavra sem pontos toca a gravação da gêmea pontuada', () => {
    const semPontos = extras().unpointed.words.filter(u => temPe(u.bare));
    for (const u of semPontos) expect(gravado(u.audioId), u.bare).toBe(true);
  });

  it('פּ e פ são gravações diferentes, e o nome delas no roteiro diz qual é', () => {
    const roteiro = JSON.parse(readFileSync(new URL('../../data/audio.json', import.meta.url), 'utf8')) as {
      clips: { he: string; translit: string | null; file: string }[];
    };
    const de = (he: string) => roteiro.clips.find(c => c.he === he.normalize('NFC'));
    expect(de('פַּ')!.translit).toBe('pa');
    expect(de('פַ')!.translit).toBe('fa');
    expect(de('פַּ')!.file).not.toBe(de('פַ')!.file);
  });
});
