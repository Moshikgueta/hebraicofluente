import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { Artigo, LegalPage, Lista } from '@/components/legal/Legal';
import { empresa, prazoResposta } from '@/lib/empresa';
import { tx } from '@/i18n/telas/venda-acessibilidade';

export const metadata: Metadata = meta({
  rota: '/acessibilidade',
  title: tx.metaTitulo,
  description: tx.metaDescricao
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
  const { contato } = empresa;

  return (
    <LegalPage
      documento="acessibilidade"
      cta={false}
      titulo={tx.titulo}
      resumo={tx.resumo}
    >
      <Artigo n={1} titulo={tx.compromissoTitulo}>
        <p>
          {tx.compromisso}
        </p>
      </Artigo>

      <Artigo n={2} titulo={tx.ofereceTitulo}>
        <p>
          {tx.menu()}
        </p>
        <Lista itens={[
          tx.menu1,
          tx.menu2,
          tx.menu3,
          tx.menu4,
          tx.menu5,
          tx.menu6
        ]} />
        <p><strong>{tx.teclado}</strong></p>
        <Lista itens={[
          tx.teclado1,
          tx.teclado2,
          tx.teclado3,
          tx.teclado4,
          tx.teclado5
        ]} />
        <p><strong>{tx.audio}</strong></p>
        <Lista itens={[
          tx.audio1,
          tx.audio2,
          tx.audio3
        ]} />
        <p>
          {tx.escrever()}
        </p>
      </Artigo>

      <Artigo n={3} titulo={tx.verificamosTitulo}>
        {/* 01/10/2026 (auditoria, VIS-006): a frase dizia que a verificação
            automática conferia "o tamanho de texto em 150% e a navegação em
            telas de celular". Ela roda contra as páginas públicas e as
            telas do curso sem o conteúdo pago, então não via o que quebrava
            lá dentro. Agora diz o que ela faz. */}
        <p>
          {tx.verificamos}
        </p>
      </Artigo>

      <Artigo n={4} titulo={tx.faltaTitulo}>
        <Lista itens={[
          tx.falta1,
          tx.falta2,
          tx.falta3,
          tx.falta4,
          tx.falta5
        ]} />
      </Artigo>

      <Artigo n={5} titulo={tx.aviseTitulo}>
        <p>
          {tx.avise(
            <a href={`mailto:${contato.emailSuporte}?subject=${encodeURIComponent(tx.assunto)}`}
               className="font-semibold text-[var(--accent)] hover:underline break-all">
              {contato.emailSuporte}
            </a>,
            tx.assunto,
            prazoResposta()
          )}
        </p>
      </Artigo>
    </LegalPage>
  );
}
