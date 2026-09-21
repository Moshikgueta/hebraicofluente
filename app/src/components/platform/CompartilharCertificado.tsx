'use client';

/* Publicar o certificado numa rede social.
 * ─────────────────────────────────────────────────────────────────────────
 * O botão "Compartilhar" que já existia usa a folha nativa do aparelho, e no
 * celular ela é insuperável: anexa a IMAGEM de verdade e deixa a pessoa
 * escolher o destino. Mas ela só existe no celular. No computador o botão
 * cai num download, e quem acabou de terminar o curso fica com um arquivo na
 * pasta e nenhuma ideia do que fazer com ele.
 *
 * ── a restrição que decide o desenho desta tela ─────────────────────────
 *
 * NENHUMA rede social permite que uma página publique uma imagem por link.
 * Os endereços de compartilhamento (wa.me, sharer.php, share-offsite) aceitam
 * TEXTO e URL, nunca um arquivo - e a nossa imagem nem sequer tem URL: ela é
 * desenhada no canvas, dentro do navegador da pessoa, e nunca sobe para
 * lugar nenhum. Isso é uma escolha de privacidade, não um esquecimento: o
 * certificado tem o nome de quem estudou, e ele não precisa existir num
 * servidor nosso para ser postado.
 *
 * Então estes botões NÃO fingem publicar. Cada um faz as três coisas que a
 * pessoa teria de fazer à mão, na ordem:
 *
 *   1. baixa a imagem;
 *   2. copia a legenda;
 *   3. abre a rede, já com o texto quando ela aceita texto.
 *
 * E a tela diz, em uma linha, o que sobrou para ela fazer: anexar. Um botão
 * que promete publicar e abre uma aba vazia é pior do que não ter botão.
 *
 * ── a ordem das operações não é estética ────────────────────────────────
 *
 * `window.open` tem de acontecer ANTES de qualquer `await`. Depois de um
 * await, o navegador já não considera a chamada como vinda do clique, e o
 * bloqueador de pop-up engole a aba - em silêncio, o que é o pior jeito de
 * falhar. Mesma regra para a área de transferência. Por isso abrir e copiar
 * vêm primeiro, e o download, que é o que demora, vem por último.
 */

import { useCallback, useState } from 'react';
import { track } from '@/lib/analytics';
import { ORIGEM } from '@/lib/seo';

type Rede = {
  id: string;
  nome: string;
  /** O endereço a abrir, ou `null` quando a rede não tem como receber nada. */
  destino: ((texto: string, link: string) => string) | null;
  /** O que ainda falta a pessoa fazer, dito em uma linha. */
  depois: string;
  cor: string;
  icone: string;
};

/* As quatro que importam para quem compra este curso, nesta ordem. O X ficou
   de fora por uso, não por gosto: quem termina um curso de hebraico no Brasil
   posta no WhatsApp e no Instagram. */
const REDES: Rede[] = [
  {
    id: 'whatsapp',
    nome: 'WhatsApp',
    destino: (t, l) => `https://wa.me/?text=${encodeURIComponent(`${t}\n${l}`)}`,
    depois: 'A imagem foi salva e o texto já vai na conversa - é só anexar a imagem.',
    cor: '#25D366',
    icone: 'M16.8 14.3c-.3-.1-1.6-.8-1.8-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-1.5-.8-2.6-1.4-3.6-3.1-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5 0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.7.8-1 1.7-.9 2.7.3 1.4 1.1 2.6 1.3 2.9.2.2 2.1 3.2 5.1 4.4 1.9.8 2.6.9 3.5.7.6-.1 1.6-.7 1.9-1.3.2-.7.2-1.2.1-1.3-.1-.2-.3-.2-.6-.3M10 1.7A8.3 8.3 0 0 0 2.9 14.3L1.7 18.3l4.2-1.1A8.3 8.3 0 1 0 10 1.7Z'
  },
  {
    id: 'instagram',
    nome: 'Instagram',
    /* O Instagram não tem endereço de publicação na web - nenhum, nem para
       texto. Abrir instagram.com daria uma aba de feed e a sensação de que o
       botão não funcionou. Então ele não abre nada, e diz o que fazer. */
    destino: null,
    depois: 'A imagem foi salva e o texto copiado. Abra o Instagram e publique.',
    cor: '#C13584',
    icone: 'M10 2.5c-2 0-2.3 0-3.1.05-.8.03-1.3.2-1.8.4-.5.2-.9.5-1.3.9-.4.4-.7.8-.9 1.3-.2.5-.3 1-.4 1.8C2.5 7.7 2.5 8 2.5 10s0 2.3.05 3.1c.03.8.2 1.3.4 1.8.2.5.5.9.9 1.3.4.4.8.7 1.3.9.5.2 1 .3 1.8.4.8.05 1.1.05 3.1.05s2.3 0 3.1-.05c.8-.03 1.3-.2 1.8-.4.5-.2.9-.5 1.3-.9.4-.4.7-.8.9-1.3.2-.5.3-1 .4-1.8.05-.8.05-1.1.05-3.1s0-2.3-.05-3.1c-.03-.8-.2-1.3-.4-1.8a3.6 3.6 0 0 0-.9-1.3 3.6 3.6 0 0 0-1.3-.9c-.5-.2-1-.3-1.8-.4-.8-.05-1.1-.05-3.1-.05Zm0 3.4a4.1 4.1 0 1 1 0 8.2 4.1 4.1 0 0 1 0-8.2Zm0 1.4a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4Zm4.2-2.5a1 1 0 1 1 0 1.9 1 1 0 0 1 0-1.9Z'
  },
  {
    id: 'linkedin',
    nome: 'LinkedIn',
    destino: (_t, l) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(l)}`,
    depois: 'A imagem foi salva e o texto copiado - cole na publicação e anexe a imagem.',
    cor: '#0A66C2',
    icone: 'M5 3.4a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2ZM3.6 7.8h2.8v8.8H3.6V7.8Zm4.6 0H11v1.2h.04c.4-.7 1.3-1.4 2.6-1.4 2.8 0 3.3 1.8 3.3 4.2v4.8h-2.8v-4.3c0-1 0-2.3-1.4-2.3-1.4 0-1.6 1.1-1.6 2.3v4.3H8.2V7.8Z'
  },
  {
    id: 'facebook',
    nome: 'Facebook',
    destino: (_t, l) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(l)}`,
    depois: 'A imagem foi salva e o texto copiado - cole na publicação e anexe a imagem.',
    cor: '#1877F2',
    icone: 'M17.5 10a7.5 7.5 0 1 0-8.7 7.4v-5.2H6.9V10h1.9V8.4c0-1.9 1.1-2.9 2.8-2.9.8 0 1.7.15 1.7.15v1.8h-1c-.9 0-1.2.6-1.2 1.2V10h2.1l-.3 2.2h-1.8v5.2A7.5 7.5 0 0 0 17.5 10Z'
  }
];

export function CompartilharCertificado({
  texto, baixar, formato
}: {
  /** A legenda sugerida. A mesma que a tela mostra em "Texto para o post". */
  texto: string;
  /** Gera e baixa o PNG. Devolve `true` quando o arquivo saiu. */
  baixar: () => Promise<boolean>;
  /** Quadrado ou paisagem - entra na trilha, para saber qual formato rende. */
  formato: string;
}) {
  const [aviso, setAviso] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const publicar = useCallback(async (rede: Rede) => {
    /* Abrir e copiar ANTES do await. Ver a nota no topo do arquivo: depois de
       um await o clique já não conta, e a aba morre sem aviso. */
    if (rede.destino) window.open(rede.destino(texto, ORIGEM), '_blank', 'noopener,noreferrer');
    try { await navigator.clipboard.writeText(texto); } catch { /* sem permissão */ }

    setOcupado(true);
    const ok = await baixar();
    setOcupado(false);

    track('certificate_shared', { mode: formato, id: rede.id });
    setAviso(ok
      ? rede.depois
      : 'Não consegui salvar a imagem aqui. Use o botão "Baixar PNG" acima.');
  }, [texto, baixar, formato]);

  return (
    <div className="grid gap-3">
      <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">
        Publicar numa rede
      </p>

      <div className="flex flex-wrap gap-2">
        {REDES.map(r => (
          <button
            key={r.id}
            type="button"
            disabled={ocupado}
            onClick={() => { void publicar(r); }}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-[var(--r-md)]
                       border border-line bg-surface font-ui text-[14.5px] font-medium text-ink
                       transition-colors hover:border-[var(--accent-soft)]
                       disabled:opacity-60 disabled:cursor-default"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden className="shrink-0">
              <path d={r.icone} fill={r.cor} />
            </svg>
            {r.nome}
          </button>
        ))}
      </div>

      {/* Dito uma vez, em vez de repetido em cada botão: a imagem não viaja
          sozinha, e saber disso antes de clicar evita a sensação de que o
          botão falhou. */}
      <p className="font-ui text-[13px] leading-relaxed text-ink-muted">
        A imagem é gerada no seu aparelho e não fica guardada em nenhum servidor -
        por isso ela vai anexada por você, e não pelo link.
      </p>

      <p aria-live="polite" className="font-ui text-[13px] text-ink-body min-h-[20px]">
        {ocupado ? 'Salvando a imagem…' : aviso}
      </p>
    </div>
  );
}
