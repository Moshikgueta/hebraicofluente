/* As gravações públicas da landing (lib/amostra-audio.ts). O exportador as
 * copia para app/public/amostra-audio/; a capa as toca no "Ouça e fale". */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AMOSTRA_AUDIO } from '@/lib/amostra-audio';

describe('a amostra de áudio da capa', () => {
  const dir = join(__dirname, '../public/amostra-audio');
  it('todo nome da lista foi publicado, e nada além deles', () => {
    for (const nome of Object.keys(AMOSTRA_AUDIO)) expect(existsSync(join(dir, `${nome}.mp3`)), nome).toBe(true);
    expect(readdirSync(dir).sort()).toEqual(Object.keys(AMOSTRA_AUDIO).map(n => `${n}.mp3`).sort());
  });
});
