/* Instalar no celular (28/10/2026): o manifesto aponta para ícones que
   existem e têm o tamanho que diz; o que a tela mostra em cada aparelho; e
   nenhum service worker, porque ele guardaria aula e áudio fora do portão. */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import manifest from '@/app/manifest';
import { comoInstalar, ehIos } from '@/lib/instalar';

const tamanhoDoPng = (arquivo: string) => {
  const b = readFileSync(arquivo);
  return `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`;
};

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1';
const IPAD = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15';
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36';

describe('o manifesto', () => {
  const m = manifest();
  it('abre o painel em tela cheia, com o nome do curso', () => {
    expect(m.display).toBe('standalone');
    expect(m.start_url).toBe('/meu-hebraico/');
    expect(m.name).toBe('Hebraico Fluente');
  });
  it('cada ícone existe e tem o tamanho declarado, com um para máscara', () => {
    for (const i of m.icons ?? []) {
      expect(tamanhoDoPng(new URL(`../public${i.src}`, import.meta.url).pathname)).toBe(i.sizes);
    }
    expect(m.icons?.some(i => i.purpose === 'maskable')).toBe(true);
    expect(m.icons?.some(i => i.sizes === '512x512' && i.purpose === 'any')).toBe(true);
  });
});

describe('o que a tela mostra', () => {
  it('instalado, botão do navegador, os toques do Safari ou o menu', () => {
    expect(comoInstalar({ ua: ANDROID, aberto: true, comPedido: true })).toBe('instalado');
    expect(comoInstalar({ ua: ANDROID, aberto: false, comPedido: true })).toBe('botao');
    expect(comoInstalar({ ua: IPHONE, aberto: false, comPedido: false })).toBe('ios');
    expect(comoInstalar({ ua: ANDROID, aberto: false, comPedido: false })).toBe('outro');
  });
  it('o iPad que diz ser Mac é iPad quando tem toque', () => {
    expect(ehIos(IPAD, 5)).toBe(true);
    expect(ehIos(IPAD, 0)).toBe(false);
  });
});

describe('sem service worker', () => {
  it('nada no código do app registra um', () => {
    const achados: string[] = [];
    const andar = (dir: string) => {
      for (const n of readdirSync(dir)) {
        const p = join(dir, n);
        if (statSync(p).isDirectory()) andar(p);
        else if (/\.(ts|tsx|js)$/.test(n) && /serviceWorker\.register/.test(readFileSync(p, 'utf8'))) achados.push(p);
      }
    };
    andar(new URL('../src', import.meta.url).pathname);
    expect(achados).toEqual([]);
  });
});
