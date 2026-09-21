/* A camada cinematográfica do hero, e o contrato dela com o resto.
 * ─────────────────────────────────────────────────────────────────────────
 * O hero tem duas camadas: uma ATMOSFERA no fundo e o PRODUTO por cima. A
 * atmosfera é opcional por construção, e isso não é preguiça - é a única
 * forma de a primeira tela do site não depender de um arquivo que pode não
 * ter sido gerado, pode ter falhado no upload ou pode demorar três segundos
 * numa rede ruim de celular.
 *
 * Então a regra é uma só: **o hero tem de ficar bonito sem a mídia**. Quando
 * o arquivo existe, ele acrescenta profundidade; quando não existe, o mesmo
 * espaço recebe uma composição desenhada em CSS que foi feita para ser vista,
 * e não para ser um buraco esperando alguém.
 *
 * ── como trocar ─────────────────────────────────────────────────────────
 * Ponha o arquivo em `app/public/media/` com um destes nomes e nada mais
 * precisa ser editado - a página de servidor olha o disco na build e passa o
 * que achou:
 *
 *   hero.jpg   (ou .webp / .avif)  a imagem de fundo
 *   hero.webm  (ou hero.mp4)       o laço de 4 a 8 segundos
 *   hero-poster.jpg                o quadro parado do vídeo
 *
 * O vídeo só toca quando existe poster: sem ele, o primeiro quadro é um
 * retângulo cinza que aparece antes do vídeo decodificar, e isso é pior do
 * que não ter vídeo nenhum.
 *
 * ── o que NÃO vai na mídia gerada ───────────────────────────────────────
 * Hebraico. Nenhum gerador de imagem escreve hebraico corretamente, e uma
 * palavra errada na primeira tela de um curso de hebraico é o defeito mais
 * caro que esta página poderia ter. Todo caractere hebraico do hero é
 * desenhado em HTML, com a fonte do produto, por cima da mídia.
 */

export type HeroMedia = {
  /** Imagem de fundo, se houver. Caminho absoluto a partir de /public. */
  imagem: string | null;
  /** Laço de vídeo, se houver. Só é usado quando `poster` também existe. */
  video: string | null;
  /** Primeiro quadro do vídeo. Sem ele o vídeo não é renderizado. */
  poster: string | null;
};

export const SEM_MIDIA: HeroMedia = { imagem: null, video: null, poster: null };

/** Onde a página de servidor procura, em ordem de preferência. */
export const CANDIDATOS = {
  imagem: ['media/hero.avif', 'media/hero.webp', 'media/hero.jpg'],
  video: ['media/hero.webm', 'media/hero.mp4'],
  poster: ['media/hero-poster.avif', 'media/hero-poster.webp', 'media/hero-poster.jpg']
} as const;
