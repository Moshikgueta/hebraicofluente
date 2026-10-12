/* O id de áudio de um texto em hebraico, num lugar só (12/10/2026).
 *
 * É o hash do texto pontuado ('he-' + 8 hex do sha256 do NFC), como sempre
 * foi - com uma exceção: quando o texto mudou só por perder um daguesh que
 * não muda o som (tools/daguesh.mjs), ele continua com o id antigo, lido de
 * data/audio-alias.json. É o que mantém tocando as gravações já feitas.
 * tools/gen-audio.mjs e tools/export-content.mjs usam esta mesma função. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = new URL('..', import.meta.url).pathname;
const NFC = s => String(s ?? '').normalize('NFC');

let ALIAS = {};
try { ALIAS = JSON.parse(readFileSync(join(ROOT, 'data/audio-alias.json'), 'utf8')).alias ?? {}; }
catch { /* sem apelidos */ }

export const hashDoTexto = he => 'he-' + createHash('sha256').update(NFC(he)).digest('hex').slice(0, 8);
export const audioIdFor = he => ALIAS[NFC(he)] ?? hashDoTexto(he);
