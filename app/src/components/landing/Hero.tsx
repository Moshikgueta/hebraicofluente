'use client';

/* O hero.
 * ─────────────────────────────────────────────────────────────────────────
 * À esquerda, a promessa em português; à direita, uma LÂMINA: a letra Shin
 * como ela aparece na lição, grande, com o som, o traçado da cursiva e a
 * frase que explica o ponto. É o produto mostrado pelo que ele ensina, e não
 * pela moldura de app.
 *
 * Até 20/10/2026 a coluna da direita era a maquete de um exercício com dois
 * cartões flutuantes ("Sequência 7 dias", "Lição concluída · 5 novas
 * letras") e um +10 XP subindo. Saiu por três motivos: era a composição que
 * todo app de idioma usa, e por isso não dizia nada desta marca; os números
 * não eram de ninguém; e "5 novas letras" desmentia, ao lado, o "uma letra
 * por vez" do subtítulo. A demonstração de verdade, clicável, está na seção
 * logo abaixo (#experimente).
 *
 * A entrada é curta (menos de meio segundo, só opacidade e translação) e
 * acontece uma vez por sessão: quem volta à capa na mesma visita encontra a
 * página parada. Com `prefers-reduced-motion`, nada se move.
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { course, licaoDaLetra } from '@/lib/content-publico';
import { Container, Rubrica } from './base';
import { DiagramaDeTracado } from './DiagramaDeTracado';
import { SEM_MIDIA, type HeroMedia } from './media';
import { tx } from '@/i18n/telas/venda-hero';

/* A entrada do hero é CSS (`hero-entra` em globals.css), não estado do React
   (23/10/2026, velocidade no celular). Com o estado, o título nascia com
   opacidade zero e só aparecia depois de o JavaScript chegar e rodar: no
   celular era a maior pintura da página esperando o pacote inteiro. Agora o
   texto (etapas 1 a 3) aparece na primeira pintura e só sobe uns pixels; a
   lâmina (etapa 4) ainda chega com um fade, sem segurar o texto. */

/* Os três desejos de quem chega (a versão "híbrida" do hero, escolhida pelo
   dono do curso em 28/09/2026). Eram selos com borda; viraram uma linha
   corrida com separadores, que diz o mesmo sem disputar com os botões. */
const DESEJOS = [tx.desejoIsrael, tx.desejoBiblia, tx.desejoAlfabeto];

/* A mensagem central é em PORTUGUÊS, inteira.
 * ─────────────────────────────────────────────────────────────────────────
 * O título antes começava com uma letra hebraica, e lia bonito para quem já
 * sabe o que ela é. O problema é exatamente esse: quem chega aqui não sabe.
 * A primeira linha da página tem um trabalho só - dizer, na língua de quem
 * está lendo, o que a pessoa vai conseguir fazer -, e um caractere que ela
 * não consegue decifrar no meio da frase trabalha contra isso.
 *
 * O hebraico continua na primeira tela, como DEMONSTRAÇÃO: a lâmina mostra o
 * que se vai aprender em vez de exigir que já se saiba.
 */
export function Hero({
  primaryHref, primaryLabel, primaryMicro, secondaryHref, midia = SEM_MIDIA
}: {
  primaryHref: string;
  primaryLabel: string;
  /** A linha curta embaixo do botão: o que se leva ao clicar. */
  primaryMicro: string;
  secondaryHref: string;
  /** A camada de atmosfera, quando o arquivo existe. Ver ./media.ts. */
  midia?: HeroMedia;
}) {
  const entra = (n: number) => ({ animationDelay: `${[0, 40, 110, 180, 240][n]}ms` });

  return (
    <header className="relative overflow-hidden">
      <AtmosferaFundo midia={midia} />
      <Container className="relative pt-9 pb-16 sm:pt-[76px] sm:pb-24
                            grid gap-12 lg:gap-16 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:items-center">
        <div>
          {/* A mensagem do hero: o resultado claro no título e os três
              desejos logo abaixo. De 28/09 a 01/10/2026 ela disputou um teste
              A/B com uma versão feita de perguntas; ficou esta, que diz em
              uma linha o que se aprende (CLAUDE.md, "Teste A/B do hero"). */}
          <div className="hero-entra" data-entrada style={entra(1)}>
            <Rubrica className="mb-5 sm:mb-6">
              <span className="sm:hidden">{tx.rubricaCurta}</span>
              <span className="hidden sm:inline">{tx.rubricaLonga}</span>
            </Rubrica>
            <h1 className="font-display font-semibold text-[clamp(38px,4.6vw,60px)] leading-[1.02]
                           tracking-[-0.038em] m-0 mb-5">
              {tx.tituloA} <span className="text-[var(--teal-ink)]">{tx.tituloB}</span>
            </h1>
            <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 list-none p-0 m-0 mb-7
                           font-ui text-[15px] sm:text-[16px] font-medium text-ink-body"
                aria-label={tx.paraQuem}>
              {DESEJOS.map(t => (
                <li key={t} className="inline-flex items-center gap-2.5 mr-2">
                  <span aria-hidden className="w-[5px] h-[5px] rounded-full bg-[var(--gold)]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="hero-entra" data-entrada style={entra(2)}>
            <p className="font-display text-[clamp(21px,2.1vw,26px)] leading-[1.32] font-medium tracking-[-0.02em]
                          text-ink max-w-[30ch] m-0 mb-2">
              {tx.mesmoQue}
            </p>
            <p className="font-ui text-[16.5px] sm:text-[18px] leading-[1.55] text-ink-muted max-w-[46ch] m-0 mb-8">
              {tx.umaLetraPorVez}
            </p>
          </div>

          <div className="grid gap-3 hero-entra" data-entrada style={entra(3)}>
            {/* Os dois botões com a mesma altura e o mesmo raio: no celular,
                os dois ocupam a largura toda (antes o secundário ficava com a
                largura do texto, torto embaixo de um primário cheio). */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Link
                href={primaryHref}
                className="group inline-flex items-center justify-center gap-2.5 rounded-[12px] min-h-[54px]
                           text-center leading-[1.3] bg-[var(--navy)] text-white
                           font-ui font-semibold text-[16.5px] px-6
                           shadow-[0_1px_0_rgba(255,255,255,.08)_inset,0_1px_2px_rgba(14,59,67,.2),0_8px_20px_-10px_rgba(14,59,67,.55)]
                           transition-[background-color,transform] duration-150 ease-out
                           hover:bg-[var(--navy-2)] active:scale-[.98]"
              >
                {primaryLabel}
                {/* A seta anda 3px no hover. Micro-interação, não animação: o
                    botão responde ao ponteiro sem chamar atenção para si. */}
                <span aria-hidden
                      className="transition-transform duration-150 ease-out group-hover:translate-x-[3px]">→</span>
              </Link>
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center rounded-[12px] min-h-[54px] px-5
                           bg-[var(--card)] text-ink font-ui font-semibold text-[16px]
                           shadow-[0_0_0_1px_var(--line),0_1px_2px_rgba(27,33,31,.05)]
                           transition-[box-shadow,transform] duration-150 ease-out
                           hover:shadow-[0_0_0_1px_#C9C3B4,0_1px_2px_rgba(27,33,31,.08)] active:scale-[.98]"
              >
                {/* Leva ao TESTE, e não a um texto sobre ele, e é «teste», não
                    «aula»: o curso não vende aula ao vivo nem videoaula. */}
                {tx.teste}
              </Link>
            </div>
            {/* A microcópia responde a pergunta que trava o clique: "e o que
                acontece depois que eu clicar?". */}
            <p className="font-ui text-[13.5px] text-ink-muted m-0 tabular-nums">{primaryMicro}</p>
          </div>
        </div>

        {/* Até 1024px a lâmina fica embaixo do texto; sem o teto de 540px,
            num tablet em pé ela ocupava a largura toda e a letra virava
            cartaz. */}
        <div className="relative w-full max-w-[540px] lg:max-w-none hero-entra-lamina" data-entrada style={entra(4)}>
          {!midia.imagem && !midia.video && <HaloDesenhado />}
          <Lamina />
        </div>
      </Container>
    </header>
  );
}

/* A camada de atmosfera: a foto atrás de TODO o hero.
 * ─────────────────────────────────────────────────────────────────────────
 * A primeira versão punha a foto só em volta do mockup, num anel de 50px.
 * Não funcionou, e o motivo é instrutivo: a imagem foi composta em 16:9 com
 * o meio vazio de propósito - parede clara à esquerda, luz de cortina e
 * xícara à direita, tampo de madeira embaixo. Espremida num anel estreito e
 * cortada pelo `object-cover`, o que sobrava não era uma mesa: eram manchas
 * cinzentas nos cantos, com a aresta reta do retângulo aparecendo.
 *
 * Então ela ocupa o hero inteiro, que é para o que foi feita - e a
 * composição da foto cai exatamente em cima da composição da página:
 *
 *   à esquerda   parede vazia, onde fica o texto. O creme cobre quase tudo,
 *                e o título continua com o contraste que tinha;
 *   à direita    a luz e a xícara, atrás do mockup, onde a profundidade é
 *                bem-vinda;
 *   embaixo      a madeira, que dissolve na faixa seguinte.
 *
 * Sem o arquivo, entra a composição desenhada - dois halos e um א gigante
 * cortado pela borda. Não é placeholder esperando alguém: enquanto não houve
 * foto, foi isso que o site mostrou, e foi desenhado para ser visto.
 *
 * O hebraico NUNCA vem do arquivo gerado. Ele é desenhado aqui, com a fonte
 * do produto - um gerador de imagem erra a grafia, e uma palavra errada na
 * primeira tela de um curso de hebraico é o pior defeito possível.
 */
function AtmosferaFundo({ midia }: { midia: HeroMedia }) {
  const [move, setMove] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const fino = window.matchMedia?.('(min-width: 1024px)');
    setMove(!mq?.matches && !!fino?.matches);
  }, []);

  const temVideo = !!midia.video && !!midia.poster && move;
  if (!temVideo && !midia.imagem) return null;

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {temVideo ? (
        <video
          className="w-full h-full object-cover object-[68%_50%] opacity-[.55]"
          src={midia.video!}
          poster={midia.poster!}
          autoPlay muted loop playsInline preload="none"
        />
      ) : (
        /* `<picture>` e não `<img>` sozinho: o recorte de 640px pesa 4,7 KB
           contra 15 KB do grande, e esta imagem está acima da dobra - é o
           tipo de byte que atrasa a primeira tela num 4G. Sem o arquivo
           pequeno o `<source>` não é emitido e todo mundo recebe o grande.

           `object-[68%_50%]`: quando a janela é mais alta que 16:9, o corte
           tem de puxar para a direita, onde estão a cortina e a xícara. No
           centro a foto é parede, e parede cortada é um fundo liso. */
        <picture>
          {midia.imagemMobile && <source media="(max-width: 700px)" srcSet={midia.imagemMobile} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={midia.imagem!}
            alt=""
            width={1280}
            height={725}
            className="w-full h-full object-cover object-[68%_50%] opacity-[.55]"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      )}

      {/* O creme por cima, em duas passadas. A primeira é horizontal e existe
          para o TEXTO: à esquerda ela é quase sólida, e o título fica com o
          mesmo contraste que tinha sem foto nenhuma. A segunda é vertical e
          existe para as BORDAS: sem ela a faixa teria uma aresta reta contra
          o cabeçalho em cima e contra a seção seguinte embaixo. */}
      <div className="absolute inset-0"
           style={{
             background: 'linear-gradient(95deg, var(--cream) 0%, rgba(251,249,245,.97) 30%, ' +
                         'rgba(251,249,245,.72) 48%, rgba(251,249,245,.42) 70%, rgba(251,249,245,.6) 100%)'
           }} />
      <div className="absolute inset-0"
           style={{
             background: 'linear-gradient(to bottom, var(--cream) 0%, rgba(251,249,245,0) 22%, ' +
                         'rgba(251,249,245,0) 58%, var(--cream) 100%)'
           }} />
    </div>
  );
}

/* O halo desenhado, quando não há arquivo de mídia.
   Fica preso à coluna da lâmina, e não ao hero inteiro: ele foi composto
   para transbordar do cartão, com o א entrando pela borda direita. */
function HaloDesenhado() {
  return (
    <div
      aria-hidden
      className="absolute -inset-x-6 -inset-y-10 sm:-inset-x-12 sm:-inset-y-14 z-[1]
                 rounded-[36px] overflow-hidden pointer-events-none select-none"
    >
      {/* Dois halos que se cruzam: o teal do produto e a areia do papel.
          Dão profundidade sem desenhar nada que precise ser explicado. */}
      <div className="absolute inset-0"
           style={{ background: 'radial-gradient(70% 60% at 78% 18%, #DCEDE8 0%, rgba(220,237,232,0) 64%)' }} />
      <div className="absolute inset-0"
           style={{ background: 'radial-gradient(60% 55% at 12% 92%, #F1EADA 0%, rgba(241,234,218,0) 62%)' }} />
      <span
        className="he absolute -right-[6%] top-[-8%] leading-none select-none
                   text-[clamp(200px,26vw,340px)] text-[var(--navy)] opacity-[.055]"
      >
        א
      </span>
      {/* O creme volta nas bordas para o retângulo não ter arestas: o halo
          dissolve no papel em vez de virar uma caixa. */}
      <div className="absolute inset-0"
           style={{ background: 'radial-gradient(75% 65% at 50% 45%, rgba(251,249,245,0) 0%, var(--cream) 88%)' }} />
    </div>
  );
}

/* A lâmina: uma letra do curso apresentada como num livro de tipos.
 * ─────────────────────────────────────────────────────────────────────────
 * Tudo aqui já existe no curso e na página pública: a letra e a frase do
 * ponto vêm do painel "Aula" da demonstração, o som é o que a lição diz, e o
 * diagrama é o da amostra pública (/tracado-amostra/shin.svg). Nada de
 * hebraico novo.
 *
 * O Shin, e não o Álef: ele carrega a ideia que mais surpreende quem começa
 * (um ponto muda o som) e tem forma desenhada o bastante para ser o assunto
 * da tela. O Álef é a letra do teste grátis, logo abaixo; repetir a mesma
 * letra duas vezes na primeira rolagem desperdiçaria a vitrine.
 *
 * `data-a11y-desvia`: o botão de acessibilidade sai de cima dela (CONV-021).
 */
function Lamina() {
  const shin = course.letters.find(l => l.id === 'shin');
  const licao = shin ? licaoDaLetra(shin.order) : null;
  return (
    <figure data-a11y-desvia
            className="relative z-[2] m-0 rounded-[20px] bg-[var(--card)] overflow-hidden
                       shadow-[0_0_0_1px_var(--line),0_2px_4px_rgba(27,33,31,.04),0_30px_60px_-30px_rgba(14,59,67,.35)]">
      <div className="flex items-baseline justify-between gap-4 px-5 sm:px-6 py-4 border-b border-line">
        <span className="font-ui text-[12px] font-semibold uppercase tracking-[.12em] text-ink-muted tabular-nums">
          {licao ? tx.licao(licao) : tx.laminaSemLicao}
        </span>
        <span className="font-ui text-[12px] font-semibold uppercase tracking-[.12em] text-[var(--teal-ink)]">
          {tx.shin}
        </span>
      </div>

      <div className="relative grid place-items-center bg-[var(--sand)] py-5 sm:py-7 select-none">
        <MarcasDeCorte />
        <He size="hero" tone="navy" className="!text-[150px] sm:!text-[210px] !leading-[1.05]">שׁ</He>
      </div>

      <div className="grid grid-cols-2 border-t border-line">
        <div className="px-5 sm:px-6 py-5 border-r border-line">
          <p className="font-ui text-[11.5px] font-semibold uppercase tracking-[.12em] text-ink-muted m-0 mb-2">{tx.som}</p>
          <p className="font-display text-[26px] leading-none font-semibold tracking-[-0.02em] text-ink m-0 mb-1.5">{tx.somSh}</p>
          <p className="font-ui text-[14.5px] leading-[1.45] text-ink-body m-0">{tx.comoXicara}</p>
        </div>
        <div className="px-3 sm:px-5 py-4 grid justify-items-center content-center gap-1 text-center">
          <p className="font-ui text-[11.5px] font-semibold uppercase tracking-[.12em] text-ink-muted m-0">{tx.aMao}</p>
          <DiagramaDeTracado letterId="shin" label={tx.shin} movimentos={1}
                             className="[&_img]:w-[92px] sm:[&_img]:w-[104px]" />
        </div>
      </div>

      <figcaption className="px-5 sm:px-6 py-4 border-t border-line font-ui text-[14.5px] leading-[1.5] text-ink-body">
        {tx.ponto}
      </figcaption>
    </figure>
  );
}

/* As marcas de corte nos quatro cantos da área da letra: a referência é a
   prova de gráfica, onde a letra é conferida antes de ir para o papel. Fio
   de 1px na cor das divisórias; decorativo, fora do leitor de tela. */
function MarcasDeCorte() {
  const canto = 'absolute w-3 h-3 border-[var(--locked)] opacity-60';
  return (
    <span aria-hidden className="pointer-events-none">
      <span className={`${canto} left-3 top-3 border-l border-t`} />
      <span className={`${canto} right-3 top-3 border-r border-t`} />
      <span className={`${canto} left-3 bottom-3 border-l border-b`} />
      <span className={`${canto} right-3 bottom-3 border-r border-b`} />
    </span>
  );
}
