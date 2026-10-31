/* Põe uma imagem do vocabulário no curso.
 *
 *   node tools/imagem-vocabulario.mjs <arquivo> <número>
 *
 * O número é o da lista entregue ao dono (01 = a primeira palavra de
 * data/imagens-vocabulario.json, na ordem do arquivo). A imagem vira
 * 1024x1024 WebP ~80% (DIRECAO-VISUAL-VOCABULARIO.md) em
 * app/public/media/vocabulario/<palavra>-<hash>.webp, e o `image` da palavra
 * passa a apontar para ela. Rodar de novo com outra imagem troca a anterior.
 *
 * Em /media e não em /vocabulario: /vocabulario é rota paga, e cada imagem
 * passaria pelo Worker (47 invocações por abertura da tela). /media sai do
 * servidor de ativos com cache de um ano, por isso o hash no nome: imagem
 * nova é arquivo novo, e nenhum cache serve a velha. A imagem não é o
 * conteúdo pago; a palavra e o áudio são.
 */
import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const sharp = createRequire(join(ROOT, 'app/package.json'))('sharp');

const [arquivo, numero] = process.argv.slice(2);
if (!arquivo || !numero) { console.error('uso: node tools/imagem-vocabulario.mjs <arquivo> <número>'); process.exit(2); }

const caminho = join(ROOT, 'data/imagens-vocabulario.json');
const dados = JSON.parse(readFileSync(caminho, 'utf8'));
const chaves = Object.keys(dados.palavras);
const he = chaves[Number(numero) - 1];
if (!he) { console.error(`não há palavra número ${numero} (são ${chaves.length})`); process.exit(2); }

const slug = dados.palavras[he].pt.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
mkdirSync(join(ROOT, 'app/public/media/vocabulario'), { recursive: true });
const webp = await sharp(arquivo).resize(1024, 1024, { fit: 'cover' }).webp({ quality: 80 }).toBuffer();
const hash = createHash('sha256').update(webp).digest('hex').slice(0, 8);
const destino = `/media/vocabulario/${slug}-${hash}.webp`;
const anterior = dados.palavras[he].image;
if (anterior && anterior !== destino && existsSync(join(ROOT, 'app/public', anterior))) unlinkSync(join(ROOT, 'app/public', anterior));
writeFileSync(join(ROOT, 'app/public', destino), webp);

dados.palavras[he].image = destino;
writeFileSync(caminho, JSON.stringify(dados, null, 1) + '\n');
console.log(`${numero}. ${dados.palavras[he].pt} (${he}) -> ${destino}`);
