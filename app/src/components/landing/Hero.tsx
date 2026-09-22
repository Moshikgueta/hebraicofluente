'use client';

/* O hero, e a sequência de entrada.
 * ─────────────────────────────────────────────────────────────────────────
 * Cinco etapas encadeadas: título, parágrafo, botões, mockup, e por fim a
 * resposta do mockup virando acerto - com o +10 XP subindo e a sequência
 * passando de 6 para 7 dias. Não é enfeite: em cinco segundos a página conta
 * o que o produto faz, sem vídeo e sem uma linha de texto a mais.
 *
 * Com `prefers-reduced-motion`, todos os atrasos viram zero. A página chega
 * no estado final na hora, em vez de encenar - e o estado final é o mesmo.
 *
 * Os timers são limpos no desmonte. Um `setTimeout` que dispara depois de a
 * rota trocar chama `setState` num componente que não existe mais.
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Container, Check } from './base';
import { TEM_AUDIO } from './copy';
import { SEM_MIDIA, type HeroMedia } from './media';
import { course, totalLicoes } from '@/lib/content-publico';
import { flagship } from '@/lib/catalog';


const ETAPAS: readonly [number, number][] = [[1, 120], [2, 420], [3, 720], [4, 1000], [5, 1900]];


/* Os quatro fatos do produto, lidos do CURSO e do CATÁLOGO.
   ─────────────────────────────────────────────────────────────────────────
   Esta linha é a mais fácil de escrever à mão e a mais cara de errar: ela
   está acima da dobra, e um "21 lições" que vira 24 no dia em que um módulo
   entra é uma oferta que não bate com o produto. O mesmo motivo pelo qual a
   seção do método passou a contar o próprio array. */
function fatos(): string[] {
  return [
    /* Os dois números numa linha só, e não dois itens: a contagem de letras
       saiu do parágrafo de apoio quando ele foi reescrito, e ela é o número
       que responde «o que exatamente eu vou aprender?». Como item separado
       faria cinco fatos numa grade de dois - uma terceira linha com um item
       órfão no telefone. */
    `${course.totalLetters} letras em ${totalLicoes()} lições`,
    'exercícios interativos',
    'progresso salvo',
    `acesso por ${flagship().accessMonths} meses`
  ];
}

/* A mensagem central é em PORTUGUÊS, inteira.
 * ─────────────────────────────────────────────────────────────────────────
 * O título antes começava com uma letra hebraica, e lia bonito para quem já
 * sabe o que ela é. O problema é exatamente esse: quem chega aqui não sabe.
 * A primeira linha da página tem um trabalho só - dizer, na língua de quem
 * está lendo, o que a pessoa vai conseguir fazer -, e um caractere que ela
 * não consegue decifrar no meio da frase trabalha contra isso.
 *
 * O hebraico continua na página, e de sobra: ele está no mockup, na aula de
 * amostra, no fecho. Ali ele é DEMONSTRAÇÃO, que é o papel certo dele numa
 * página de venda - mostra o que se vai aprender em vez de exigir que já se
 * saiba.
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
  const [etapa, setEtapa] = useState(0);

  useEffect(() => {
    const reduz = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timers = ETAPAS.map(([v, ms]) => setTimeout(() => setEtapa(v), reduz ? 0 : ms));
    return () => timers.forEach(clearTimeout);
  }, []);

  const em = (n: number) => etapa >= n;
  const certo = em(5);

  return (
    <header className="relative overflow-hidden">
      {/* O brilho do canto superior direito. Sem eventos de ponteiro: ele
          cobre a coluna inteira e engoliria os cliques dos botões. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(120% 90% at 82% -10%, #EAF4F1 0%, rgba(234,244,241,0) 58%)' }}
      />
      <AtmosferaFundo midia={midia} />
      <Container className="relative pt-14 pb-16 sm:pt-[78px] sm:pb-24
                            grid gap-12 lg:gap-[60px] lg:grid-cols-[minmax(0,1.04fr)_minmax(0,1fr)] lg:items-center">
        <div>
          <div
            className="transition-[opacity,transform] duration-[600ms] ease-[var(--ease)]"
            style={{ opacity: em(1) ? 1 : 0, transform: em(1) ? 'none' : 'translateY(20px)' }}
          >
            {/* A pílula "Alfabetização Hebraica · turma aberta" saiu daqui.
                Ela dizia duas coisas que a página já diz melhor logo abaixo:
                o nome do curso está no título e na caixa de preço, e "turma
                aberta" sugeria justamente o que o produto NÃO é - não há
                turma, não há data de início, e o FAQ responde isso em uma
                linha. Um selo acima do título custa a primeira leitura da
                página inteira, e este não estava pagando por ela. */}
            {/* O título diz o RESULTADO, com o verbo que a pessoa procurou no
                Google: "ler hebraico". "Da primeira letra ao hebraico de
                verdade" era bonito e vago - quem chega aqui precisa saber, na
                primeira linha, o que vai conseguir fazer.

                ── e agora diz o que ela SENTE, primeiro ──────────────────
                O visitante brasileiro chega com uma frase na cabeça, e não é
                "quero aprender a ler hebraico": é "isso parece impossível". A
                primeira linha responde exatamente essa frase, e o resultado
                vem logo abaixo, na segunda.

                A promessa é de PERCURSO, não de prazo. "Aprenda hebraico em 7
                dias" converte melhor numa tarde e cobra o preço em reembolso
                na semana seguinte; esta diz uma coisa que o curso entrega
                mesmo - que o estranho vira legível - e deixa o tempo para o
                FAQ, onde ele está medido. */}
            {/* O tamanho é MEDIDO, não escolhido pelo efeito.
                ──────────────────────────────────────────────────────────
                A 62px uma frase mais curta que esta já ocupava quatro linhas
                no desktop e empurrava os botões para fora da primeira tela. A
                promessa só funciona se o convite estiver visível junto com
                ela - um título imponente que esconde o botão custa a conversão
                que ele foi escrito para criar. Esta frase é mais longa, então
                o corpo desce junto. */}
            <h1 className="font-display font-semibold text-[clamp(30px,3.35vw,42px)] leading-[1.07]
                           tracking-[-0.03em] text-balance m-0 mb-3.5">
              Dê seus primeiros passos até conseguir{' '}
              <span className="text-[var(--teal)]">ler e escrever hebraico com segurança.</span>
            </h1>
            <p className="font-display text-[clamp(18px,1.85vw,22px)] leading-[1.32] font-medium
                          tracking-[-0.02em] text-ink text-balance max-w-[36ch] m-0 mb-4">
              Aprenda do zero, uma letra de cada vez, até reconhecer os sons, formar
              palavras e começar a ler hebraico de verdade.
            </p>
          </div>

          <p
            className="font-ui text-[18px] sm:text-[19.5px] leading-[1.6] text-ink-muted max-w-[48ch] mb-5
                       transition-[opacity,transform] duration-[600ms] delay-[120ms] ease-[var(--ease)]"
            style={{ opacity: em(2) ? 1 : 0, transform: em(2) ? 'none' : 'translateY(16px)' }}
          >
            Um curso interativo criado especialmente para brasileiros, com prática em cada
            etapa e correção imediata para você saber exatamente quando está avançando.
          </p>

          {/* Os quatro fatos. Respondem "o que exatamente eu estou comprando?"
              antes do botão, que é onde a pergunta aparece.

              Grade de dois no celular, linha única com separadores a partir
              do sm. A primeira versão era sempre uma linha com um ponto ANTES
              de cada item, e ao quebrar no telefone o ponto ia junto - a
              segunda linha começava com "· progresso salvo", um marcador
              órfão. Separador que quebra tem de ser o do fim da linha, não o
              do começo da seguinte; num telefone estreito, não ter separador
              nenhum é mais limpo do que resolver isso. */}
          {/* Duas colunas em TODA largura, e sem os pontinhos.
              ──────────────────────────────────────────────────────────────
              A linha antes era flex com um separador ANTES de cada item, e
              isso funcionava enquanto os quatro fatos cabiam numa linha só.
              Quando o primeiro passou a dizer "22 letras em 21 lições" eles
              deixaram de caber, a linha quebrou, e o ponto foi junto: a
              segunda linha começava com "· acesso por 12 meses", um marcador
              órfão. A nota antiga deste arquivo já dizia a saída - separador
              que quebra tem de ser o do fim da linha, e num espaço estreito
              não ter separador nenhum é mais limpo do que resolver isso.

              Numa grade de duas colunas o problema não existe em largura
              nenhuma, e os quatro fatos ficam alinhados em vez de corridos. */}
          <ul
            className="grid grid-cols-2 gap-x-6 gap-y-1.5 max-w-[440px]
                       list-none p-0 m-0 mb-6 font-ui text-[14.5px] text-ink-body
                       transition-[opacity,transform] duration-[600ms] delay-[180ms] ease-[var(--ease)]"
            style={{ opacity: em(2) ? 1 : 0, transform: em(2) ? 'none' : 'translateY(12px)' }}
          >
            {fatos().map(f => (
              <li key={f} className="font-medium">{f}</li>
            ))}
          </ul>

          <div
            className="grid gap-2.5 justify-items-start mb-7
                       transition-[opacity,transform] duration-500 delay-[260ms] ease-[var(--ease)]"
            style={{ opacity: em(3) ? 1 : 0, transform: em(3) ? 'none' : 'translateY(14px)' }}
          >
            {/* Medido: a coluna tem 553px e os dois botões somavam 573.
                Cortar o respiro interno dos dois deixou 555 - dois pixels
                de fora, o que é a pior distância possível. Então o secundário
                cede meio ponto de corpo também, que é hierarquia normal para
                um botão secundário e traz a soma para 547. Se numa fonte de
                reserva eles voltarem a não caber, o `flex-wrap` empilha - que
                é a degradação certa, e não um defeito. */}
            <div className="flex flex-wrap gap-2.5">
              <Link
                href={primaryHref}
                className="group inline-flex items-center justify-center gap-2 rounded-[13px]
                           bg-[var(--navy)] text-white font-ui font-semibold text-[16.5px] px-5 py-[15px]
                           shadow-[var(--sh)] transition-[background-color,transform] duration-[180ms]
                           hover:bg-[var(--navy-2)] hover:-translate-y-[2px] active:translate-y-0"
              >
                {primaryLabel}
                {/* A seta anda 3px no hover. Micro-interação, não animação: o
                    botão responde ao ponteiro sem chamar atenção para si. */}
                <span aria-hidden
                      className="transition-transform duration-[180ms] group-hover:translate-x-[3px]">→</span>
              </Link>
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center rounded-[13px] bg-[var(--card)] text-ink
                           border border-line font-ui font-semibold text-[16px] px-4 py-[15px]
                           transition-[border-color,transform] duration-[180ms]
                           hover:border-[#C9C3B4] hover:-translate-y-[2px]"
              >
                {/* Leva à AULA ABERTA, e não a um texto sobre ela: o segundo
                    botão de um hero existe para quem quer experimentar antes
                    de decidir, e mandá-lo para mais copy desperdiça o clique.
                    "Saiba mais" seria o pior dos dois mundos - não diz o que
                    acontece e não promete nada. */}
                Experimentar uma aula grátis
              </Link>
            </div>
            {/* A microcópia responde a pergunta que trava o clique: "e o que
                acontece depois que eu clicar?". Fica embaixo do botão, no
                tamanho de nota de rodapé, porque é resposta e não promessa. */}
            <p className="font-ui text-[13.5px] text-ink-muted m-0">{primaryMicro}</p>
          </div>

          {/* Os quatro chips de confiança ("Acesso imediato", "No seu ritmo",
              "Feito para brasileiros", "Curso interativo") saíram daqui. Eram
              uma segunda lista de quatro itens dizendo quase o mesmo que a
              linha de fatos acima, e duas listas paralelas na primeira tela
              não somam confiança - elas dividem a atenção e empurram o
              produto para baixo da dobra no celular.

              O que elas diziam de único continua na página: "acesso imediato"
              está na microcópia do botão, e "feito para brasileiros" é a
              frase inteira do subtítulo. */}
        </div>

        <div
          className="relative transition-[opacity,transform] duration-700 delay-[340ms] ease-[var(--ease)]"
          style={{ opacity: em(4) ? 1 : 0, transform: em(4) ? 'none' : 'translateY(26px)' }}
        >
          {!midia.imagem && !midia.video && <HaloDesenhado />}
          <Mockup ativo={em(4)} certo={certo} />
          <CartaoFlutuante
            className="top-[-22px] right-[-6px] sm:right-[-14px]"
            style={{ animationDuration: '5.5s' }}
            icone={<Chama />}
            fundo="var(--gold-soft)"
            rotulo="Sequência"
            valor={`${certo ? 7 : 6} dias`}
          />
          {/* Abaixo do mockup, e não por cima dele.
              Em `bottom-[56px]` este cartão caía exatamente sobre a linha das
              alternativas e escondia o "SH ✓" - que é o desfecho da cena e o
              único lugar da primeira tela onde a página mostra uma resposta
              sendo corrigida. Um enfeite flutuante tapando o argumento. */}
          <CartaoFlutuante
            className="left-[-10px] sm:left-[-26px] bottom-[-26px]"
            style={{ animationDuration: '6.5s', animationDelay: '.8s' }}
            icone={<Check size={16} color="var(--teal)" />}
            fundo="var(--teal-soft)"
            rotulo="Lição concluída"
            valor="5 novas letras"
          />
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
   Fica preso à coluna do mockup, e não ao hero inteiro: ele foi composto
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

/* O mockup: a mesma questão que existe de verdade dentro do curso, parada no
   momento em que ela é respondida. */
function Mockup({ ativo, certo }: { ativo: boolean; certo: boolean }) {
  return (
    <div className="relative z-[2] rounded-[26px] bg-[var(--card)] border border-line
                    shadow-[var(--sh-mock)] p-6 pt-[26px]">
      <div className="flex items-center gap-3 mb-5">
        <span aria-hidden className="text-ink-muted text-[19px] leading-none">‹</span>
        <span className="flex-1 h-[7px] rounded-full bg-[var(--sand)] overflow-hidden">
          <span
            className="block h-full rounded-full transition-[width] duration-[1300ms] ease-[var(--ease-fill)]"
            style={{ width: ativo ? '72%' : '0%', background: 'linear-gradient(90deg,var(--teal),#2FB39F)' }}
          />
        </span>
        <span className="font-ui text-[13px] font-semibold text-[var(--teal)] tabular-nums min-w-[34px] text-right">
          {ativo ? '72%' : '0%'}
        </span>
      </div>

      <p className="font-ui text-[15px] text-ink-muted mb-3.5">Qual é o som desta letra?</p>

      <div className="rounded-[18px] bg-[var(--sand)] px-5 py-[26px] text-center mb-4">
        {/* A letra num bloco próprio: <He> é um span, e sem isto o botão
            "Ouvir" fica ao lado dela em vez de embaixo.

            E o botão só aparece quando há o que tocar. Esta é a PRIMEIRA tela
            do site, e um "Ouvir" aqui é a promessa mais visível que a página
            faz - enquanto o manifesto de áudio está vazio, é uma promessa que
            a lição não cumpre. A pergunta acima ("qual é o som desta letra?")
            continua valendo nos dois casos: ela é respondida pelas opções, e
            é exercício que existe hoje. Ver a nota em Fecho.tsx. */}
        <div><He size="plate" tone="navy" className="animate-pop">ש</He></div>
        {TEM_AUDIO && (
          <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--card)] border border-line
                           px-[17px] py-[9px] font-ui text-[14.5px] font-semibold text-ink">
            <span aria-hidden className="w-[9px] h-[9px] rounded-full bg-[var(--teal)] animate-pulse-dot" />
            Ouvir
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div
          className="rounded-[14px] border-[1.5px] p-[13px] text-center font-ui font-semibold text-[16px]
                     flex items-center justify-center gap-2 transition-all duration-[350ms]"
          style={{
            borderColor: certo ? 'var(--teal)' : 'var(--line)',
            background: certo ? 'var(--teal-soft)' : 'transparent',
            color: certo ? 'var(--teal-ink)' : 'var(--ink-muted)'
          }}
        >
          SH <span className="transition-opacity duration-300 delay-100" style={{ opacity: certo ? 1 : 0 }}>✓</span>
        </div>
        {['M', 'L', 'V'].map(t => (
          <div key={t} className="rounded-[14px] border-[1.5px] border-line p-[13px] text-center
                                  font-ui font-semibold text-[16px] text-ink-muted">
            {t}
          </div>
        ))}
      </div>

      {/* Sai POR CIMA da borda do cartão, subindo. Dentro dele não há canto
          livre: em `bottom-[96px]` pousava sobre a opção "M" e em
          `top-[52px]` pousava sobre o "72%" do progresso - nos dois casos
          um enfeite sujando um número que a página quer que seja lido. */}
      {certo && (
        <span className="absolute right-[22px] top-[-13px] z-[4] font-ui font-bold text-[17px]
                         text-[var(--teal)] pointer-events-none animate-xp">
          +10 XP
        </span>
      )}
    </div>
  );
}

function CartaoFlutuante({
  className, style, icone, fundo, rotulo, valor
}: {
  className: string; style?: React.CSSProperties; icone: React.ReactNode;
  fundo: string; rotulo: string; valor: string;
}) {
  return (
    <div
      className={`absolute z-[3] flex items-center gap-[11px] rounded-[16px] bg-[var(--card)]
                  border border-line shadow-[var(--sh)] px-4 py-3 animate-float ${className}`}
      style={style}
    >
      <span aria-hidden className="w-8 h-8 rounded-[9px] grid place-items-center shrink-0" style={{ background: fundo }}>
        {icone}
      </span>
      <span className="grid">
        <span className="font-ui text-[12.5px] leading-[1.3] text-ink-muted">{rotulo}</span>
        <span className="font-ui text-[15px] font-bold leading-[1.3] tabular-nums text-ink">{valor}</span>
      </span>
    </div>
  );
}

function Chama() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 1.8c1.5 2.4.6 3.6-.5 4.8-1 1.1-1.9 2.2-1.9 3.7a2.4 2.4 0 0 0 4.8 0c0-.7-.2-1.2-.5-1.8 1.6.8 2.6 2 2.6 3.6A4.5 4.5 0 0 1 8 14.3a4.5 4.5 0 0 1-4.5-4.5C3.5 6.3 6.6 5 8 1.8Z"
            stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
