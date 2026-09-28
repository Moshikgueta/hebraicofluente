'use client';

/* Como pôr o teclado hebraico no aparelho.
 * ─────────────────────────────────────────────────────────────────────────
 * Aparece em dois lugares: na página /teclado-hebraico, para consulta, e como
 * ETAPA OBRIGATÓRIA antes do primeiro modo de digitação da academia - com o
 * botão "Já adicionei o teclado hebraico". Em nenhum outro lugar do curso o
 * aluno precisa trocar de teclado: ler, reconhecer e montar são por toque.
 *
 * O sistema do aparelho vem pré-selecionado pelo `userAgent`, e pode ser
 * trocado - quem estuda no computador e pratica no telefone precisa dos dois.
 *
 * ── e o campo de teste ──────────────────────────────────────────────────
 * O passo 4 de cada guia ("como saber que está ativo") descreve o que se vê
 * na tela, e isso muda de versão para versão do sistema. O campo abaixo
 * dispensa a descrição: se o que chega nele é uma letra hebraica, o teclado
 * está ativo, qualquer que seja o aparelho.
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

type Sistema = 'ios' | 'android' | 'windows' | 'mac';

const NOME: Record<Sistema, string> = {
  ios: 'iPhone e iPad', android: 'Android', windows: 'Windows', mac: 'Mac'
};

/* Os quatro passos do pedido, na mesma ordem para os quatro sistemas: onde
   abrir, como adicionar, como alternar, como saber que está ativo. Os nomes
   dos menus são os da interface em português. */
const PASSOS: Record<Sistema, { titulo: string; texto: string }[]> = {
  ios: [
    { titulo: 'Abra os ajustes do teclado',
      texto: 'Ajustes → Geral → Teclado → Teclados.' },
    { titulo: 'Adicione o hebraico',
      texto: 'Toque em “Adicionar Novo Teclado…” e escolha “Hebraico” (עברית).' },
    { titulo: 'Alterne entre os teclados',
      texto: 'No teclado, toque no globo 🌐 ao lado da barra de espaço. Segurando o globo, aparece a lista para escolher.' },
    { titulo: 'Confira que está ativo',
      texto: 'As teclas mostram letras hebraicas - ק ר א ט na primeira linha - e a barra de espaço diz “עברית”.' }
  ],
  android: [
    { titulo: 'Abra as configurações do teclado',
      texto: 'Com o teclado aberto, toque na engrenagem ⚙ do Gboard. Ou: Configurações → Sistema → Teclado → Teclado na tela → Gboard (em aparelhos mais antigos, “Idiomas e entrada” no lugar de “Teclado”). Em Samsung, o teclado de fábrica é o Teclado Samsung: Configurações → Gerenciamento geral → Configurações do Teclado Samsung.' },
    { titulo: 'Adicione o hebraico',
      texto: 'No Gboard: Idiomas → Adicionar teclado → procure “Hebraico” (עברית) → Concluído. No Teclado Samsung: Idiomas e tipos → Gerenciar idiomas de entrada → ative “עברית”.' },
    { titulo: 'Alterne entre os teclados',
      texto: 'Toque no globo 🌐 do teclado, ou toque e segure a barra de espaço e escolha o idioma. No Teclado Samsung, segure a barra de espaço e deslize para o lado.' },
    { titulo: 'Confira que está ativo',
      texto: 'A barra de espaço mostra “עברית” e as teclas trazem letras hebraicas.' }
  ],
  windows: [
    { titulo: 'Abra as configurações de idioma',
      texto: 'Configurações → Hora e idioma → Idioma e região.' },
    { titulo: 'Adicione o hebraico',
      texto: 'Em “Idiomas preferenciais”, clique em “Adicionar um idioma”, escolha “Hebraico” e instale. Pode desmarcar os extras - só o teclado é necessário.' },
    { titulo: 'Alterne entre os teclados',
      texto: 'Tecla Windows + Barra de espaço. Ou clique na sigla do idioma (POR) na barra de tarefas, perto do relógio.' },
    { titulo: 'Confira que está ativo',
      texto: 'A sigla perto do relógio muda para HEB.' }
  ],
  mac: [
    { titulo: 'Abra os ajustes do teclado',
      texto: 'Menu Apple (a maçã, no canto) → Ajustes do Sistema → Teclado → em “Fontes de Entrada”, clique em “Editar…”.' },
    { titulo: 'Adicione o hebraico',
      texto: 'Clique em “+”, escolha “Hebraico” na lista e depois o teclado “Hebraico”. Clique em “Adicionar”.' },
    { titulo: 'Alterne entre os teclados',
      texto: 'Control + Barra de espaço, ou a tecla 🌐 (fn) nos Macs mais novos. Também dá para escolher no menu de fontes, no alto da tela.' },
    { titulo: 'Confira que está ativo',
      texto: 'O ícone de idioma no alto da tela muda para o hebraico.' }
  ]
};

function sistemaProvavel(): Sistema {
  if (typeof navigator === 'undefined') return 'android';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  /* iPad recente se anuncia como Mac; o toque denuncia. */
  if (/Macintosh/.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Mac/.test(ua)) return 'mac';
  if (/Win/.test(ua)) return 'windows';
  return 'android';
}

export function GuiaTeclado({
  onConfirmar, confirmado = false
}: {
  /** Quando existe, o guia termina no botão "Já adicionei o teclado hebraico". */
  onConfirmar?: () => void;
  confirmado?: boolean;
}) {
  const [sistema, setSistema] = useState<Sistema>('android');
  const [teste, setTeste] = useState('');
  useEffect(() => { setSistema(sistemaProvavel()); }, []);

  const hebraico = /[א-ת]/.test(teste);
  const latino = /[A-Za-z]/.test(teste);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <div className="grid gap-2">
        <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted m-0">
          O seu aparelho
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Escolha o seu aparelho">
          {(Object.keys(NOME) as Sistema[]).map(s => (
            <button
              key={s}
              type="button"
              aria-pressed={sistema === s}
              onClick={() => setSistema(s)}
              className={`min-h-[44px] px-4 rounded-full font-ui text-[14px] font-medium border
                ${sistema === s
                  ? 'bg-[var(--accent-wash)] text-[var(--accent)] border-[var(--accent-soft)]'
                  : 'bg-surface text-ink-body border-line hover:bg-surface-2'}`}
            >
              {NOME[s]}
            </button>
          ))}
        </div>
      </div>

      <ol className="grid gap-3 list-none p-0 m-0">
        {PASSOS[sistema].map((passo, i) => (
          <li key={passo.titulo} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 items-start">
            <span aria-hidden className="w-8 h-8 rounded-full bg-surface-2 grid place-items-center
                                         font-ui text-[14px] font-semibold text-ink">
              {i + 1}
            </span>
            <div>
              <p className="font-ui text-[15px] font-semibold text-ink m-0">{passo.titulo}</p>
              <p className="font-ui text-[15px] leading-relaxed text-ink-body m-0">{passo.texto}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-2 rounded-[var(--r-lg)] bg-surface-2 p-4">
        <label htmlFor="teste-teclado" className="font-ui text-[14px] font-semibold text-ink">
          Teste aqui: troque para o hebraico e digite qualquer letra
        </label>
        <input
          id="teste-teclado"
          value={teste}
          onChange={e => setTeste(e.target.value)}
          dir="auto"
          autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
          className="w-full min-w-0 min-h-[52px] px-4 rounded-[var(--r-md)] border-2 border-line bg-surface
                     he text-[22px] text-ink"
        />
        <p role="status" className="font-ui text-[14px] m-0 min-h-[20px]">
          {hebraico
            ? <span className="text-[var(--mint-ink)]">✓ O teclado hebraico está ativo.</span>
            : latino
              ? <span className="text-[var(--amber)]">Isso é o teclado em português. Troque de teclado e tente de novo.</span>
              : ' '}
        </p>
      </div>

      <p className="font-ui text-[14px] leading-relaxed text-ink-muted m-0">
        O teclado hebraico só é usado nos exercícios de digitação. Nas lições, nas
        leituras e nos jogos, tudo se faz tocando - você não precisa trocar de teclado.
      </p>

      {onConfirmar && (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={onConfirmar} size="md">Já adicionei o teclado hebraico</Button>
          {!hebraico && !confirmado && (
            <span className="font-ui text-[13px] text-ink-muted">
              Dica: faça o teste acima antes de confirmar.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
