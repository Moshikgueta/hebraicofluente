import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { Artigo, LegalPage, Lista } from '@/components/legal/Legal';
import { empresa } from '@/lib/empresa';

export const metadata: Metadata = meta({
  rota: '/acessibilidade',
  title: 'Declaração de Acessibilidade - Hebraico Fluente',
  description:
    'O que a plataforma faz para ser usada por todas as pessoas, o que ainda não faz, ' +
    'como foi testada e como avisar de uma barreira.'
});

/* A Declaração de Acessibilidade (28/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * A Lei Brasileira de Inclusão (Lei 13.146/2015, art. 63) obriga o site a ser
 * acessível; esta página é onde isso fica dito e conferível, e onde a pessoa
 * encontra o canal para avisar de uma barreira (auditoria, LEGAL-026).
 *
 * A regra de sempre vale aqui: só o que o produto FAZ. Cada item da lista
 * existe no código (lib/acessibilidade.ts, components/shell/BotaoAcessibilidade,
 * as correções de foco e de contraste de 28/09) e cada limitação é real. Uma
 * declaração que promete mais do que a tela entrega é pior do que nenhuma: a
 * pessoa com deficiência descobre na primeira lição.
 *
 * Pública de propósito, como as outras páginas de confiança: quem mais
 * precisa dela é quem ainda está decidindo se consegue usar o curso.
 */
export default function Page() {
  const { contato, atendimento } = empresa;

  return (
    <LegalPage
      titulo="Declaração de Acessibilidade"
      resumo="O que fazemos para que a plataforma possa ser usada por todas as pessoas, o que ainda falta, e como nos avisar de uma barreira."
    >
      <Artigo n={1} titulo="Nosso compromisso">
        <p>
          Queremos que qualquer pessoa consiga aprender a ler hebraico aqui, com ou
          sem deficiência. A referência que seguimos é a das Diretrizes de
          Acessibilidade para Conteúdo Web (WCAG 2.1, nível AA), e a obrigação é a da
          Lei Brasileira de Inclusão (Lei 13.146/2015, art. 63). Ainda não cumprimos
          tudo; o que falta está listado no item 4.
        </p>
      </Artigo>

      <Artigo n={2} titulo="O que a plataforma oferece">
        <p>
          <strong>Menu de acessibilidade</strong>, no botão redondo do canto da tela ou
          pelo atalho <strong>Alt + Shift + A</strong>, em qualquer página. Os ajustes
          ficam guardados no seu aparelho e valem em todas as páginas:
        </p>
        <Lista itens={[
          'tamanho do texto em 100%, 115%, 130% ou 150%;',
          'tema claro, escuro ou o do seu aparelho;',
          'alto contraste;',
          'menos animação (também respeitamos o ajuste de "reduzir movimento" do seu sistema);',
          'links sublinhados;',
          'mais espaço entre letras e linhas nos textos em português.'
        ]} />
        <p><strong>Teclado e leitor de tela:</strong></p>
        <Lista itens={[
          'toda a plataforma pode ser usada só pelo teclado, com o foco sempre visível e um atalho "Pular para o conteúdo" no início de cada página;',
          'nas lições, as teclas 1 a 4 escolhem a resposta e Enter avança;',
          'os textos em hebraico são marcados como hebraico, para o leitor de tela trocar de idioma;',
          'os botões de áudio dizem o que tocam, e a correção de cada exercício é anunciada;',
          'nenhuma imagem importante fica sem descrição.'
        ]} />
        <p><strong>Áudio, tempo e tela:</strong></p>
        <Lista itens={[
          'as letras, as sílabas, as palavras, as frases e os textos têm áudio gravado, com opção de ouvir mais devagar; nada toca sozinho;',
          'nenhum exercício tem tempo limite; nos jogos, o cronômetro é opcional;',
          'a plataforma funciona no celular e no computador, e continua utilizável com o zoom do navegador em até 400%.'
        ]} />
        <p>
          <strong>Escrever à mão é opcional.</strong> A etapa em que você traça a letra
          com o dedo pode ser pulada sem bloquear o resto da lição.
        </p>
      </Artigo>

      <Artigo n={3} titulo="Como verificamos">
        <p>
          A cada publicação do site, uma verificação automática abre as páginas num
          navegador de verdade e confere o menu de acessibilidade, o contraste, o
          tamanho de texto em 150% e a navegação em telas de celular. Em 28/09/2026
          fizemos uma revisão manual completa: navegação por teclado, foco, nomes dos
          botões, contraste medido, textos em hebraico e telas de 320 pixels de
          largura. As correções dessa revisão já estão no ar. Em 29/09/2026 testamos
          também em celulares de verdade, um iPhone e um Android.
        </p>
      </Artigo>

      <Artigo n={4} titulo="O que ainda não está bom">
        <Lista itens={[
          'os exercícios de escuta dependem de ouvir, e ainda não têm uma alternativa para pessoas surdas; o restante do curso não depende de áudio;',
          '"Fale e seja corrigido" depende do reconhecimento de voz do navegador, que não existe em todos (o Firefox, por exemplo, não tem); é um recurso opcional, e "Gravar a minha" funciona em todos;',
          'o jogo "Caça à letra" treina o reconhecimento visual da forma das letras; com leitor de tela, ele anuncia o nome de cada letra, o que torna o jogo possível, mas muda o que ele treina;',
          'ainda não testamos a plataforma com leitores de tela reais (NVDA, VoiceOver, TalkBack).'
        ]} />
      </Artigo>

      <Artigo n={5} titulo="Encontrou uma barreira? Avise">
        <p>
          Escreva para{' '}
          <a href={`mailto:${contato.emailSuporte}?subject=${encodeURIComponent('Acessibilidade')}`}
             className="font-semibold text-[var(--accent)] hover:underline break-all">
            {contato.emailSuporte}
          </a>{' '}
          com o assunto <em>Acessibilidade</em>. Conte em que página você estava, o
          que tentou fazer e, se puder, qual aparelho, navegador e tecnologia assistiva
          usa. Respondemos em até {atendimento.prazoRespostaUteis} dias úteis, e, se a
          barreira impedir você de estudar, buscamos uma forma de você continuar
          enquanto a correção não sai.
        </p>
      </Artigo>
    </LegalPage>
  );
}
