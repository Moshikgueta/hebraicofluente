/* Os nomes organizados dos arquivos de áudio.
 * ─────────────────────────────────────────────────────────────────────────
 * O id de um clipe é o hash do hebraico pontuado (`he-3c3ac3e3`, ver
 * tools/gen-audio.mjs), e é ele que o curso usa para achar o som - não muda
 * quando uma lição é reordenada, e um clipe gravado para o livro toca aqui.
 * Para uma pessoa, porém, `he-3c3ac3e3.mp4` não diz nada. O painel de
 * gravação mostra e baixa cada arquivo com um nome legível: `alef.mp4`,
 * `shalom.mp4`.
 *
 * O nome é derivado do CATÁLOGO inteiro de uma vez, e não da ordem em que as
 * gravações chegam: o mesmo item tem sempre o mesmo nome. A regra:
 *
 *   1. a transliteração sem acentos (`Álef` → `alef`); sem transliteração,
 *      o sentido (`girafa`);
 *   2. quando dois itens caem no mesmo nome (o `a` do Álef e o do Áyin), o
 *      nome de letra fica simples e os outros ganham o lugar onde estão:
 *      `a-alef`, `a-ayin`, `ta-modulo-3`;
 *   3. se ainda empatar, o número do roteiro de gravação.
 *
 * O nome é só rótulo. O arquivo continua guardado e servido pelo id.
 */

export const slug = s => String(s || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

/** O lugar do item, para desempatar: `alef`, `modulo-7`, `vogais`. */
function contexto(clip, letras) {
  const onde = String((clip.where || [])[0] || '');
  const m = onde.match(/^letra (\d+)$/);
  if (m) return letras[Number(m[1]) - 1] || `letra-${m[1]}`;
  if (/sinais de vogal/.test(onde)) return 'vogais';
  return slug(onde) || `n${clip.num}`;
}

/**
 * `{ [audioId]: 'alef' }` - sem extensão, que depende do formato gravado.
 * @param clips    data/audio.json → clips (com `file` = `<id>.mp3`)
 * @param letras   os ids das letras na ordem do curso (`['alef', 'mem', …]`)
 */
export function nomesOrganizados(clips, letras) {
  const base = new Map();
  for (const c of clips) base.set(c, slug(c.translit) || slug(c.gloss) || `clipe-${c.num}`);

  const porNome = new Map();
  for (const [c, b] of base) porNome.set(b, [...(porNome.get(b) || []), c]);

  const nome = new Map();
  for (const [b, grupo] of porNome) {
    if (grupo.length === 1) { nome.set(grupo[0], b); continue; }
    const nomes = grupo.filter(c => c.kind === 'nome');
    for (const c of grupo) {
      nome.set(c, nomes.length === 1 && c.kind === 'nome' ? b : `${b}-${contexto(c, letras)}`);
    }
  }

  /* O desempate final: o número do roteiro, que é único. */
  const vistos = new Map();
  for (const n of nome.values()) vistos.set(n, (vistos.get(n) || 0) + 1);
  const out = {};
  for (const [c, n] of nome) {
    out[idDoClipe(c)] = vistos.get(n) > 1 ? `${n}-${c.num}` : n;
  }
  return out;
}

export const idDoClipe = c => String(c.file || '').replace(/\.mp3$/, '');

/* O formato decide a extensão. `audio/mp4` e AAC (Safari, iPhone, Chrome
   recente) saem `.mp4`, como o dono do curso pediu; o WAV é o formato de
   reserva do painel, para navegadores que só gravam WebM/Ogg. */
export const EXTENSAO = {
  'audio/mp4': 'mp4',
  'audio/aac': 'aac',
  'audio/wav': 'wav',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg'
};
