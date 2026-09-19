import { He } from '@/components/hebrew/He';

/* A marca.
 * ─────────────────────────────────────────────────────────────────────────
 * Quadrado navy, raio 10, com a letra ע em teal claro. Não há arquivo de
 * logotipo: a marca é composta tipograficamente, com a MESMA face hebraica
 * que o curso ensina - o que significa que o logo e a lição nunca divergem.
 *
 * A letra é ע, e a escolha tem três motivos, nesta ordem:
 *
 *   1. א é a marca de um concorrente. Esse é o motivo que decide.
 *   2. ע significa olho e também fonte, nascente - as duas coisas que um
 *      curso de leitura faz.
 *   3. É uma letra muda, que abre espaço para a vogal, e uma forma aberta:
 *      lê bem a 16px na aba e a 180px no atalho de celular.
 *
 * O `margin-top` negativo é centragem ÓPTICA: a caixa do glifo hebraico tem
 * folga embaixo para o nikud, e sem o ajuste a letra assenta baixa demais no
 * quadrado. (O mesmo valor está em app/icon.svg, que é o favicon.)
 */
export function Logo({ size = 34, words = true }: { size?: number; words?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 shrink-0">
      <span
        aria-hidden
        className="grid place-items-center rounded-[10px] bg-[var(--navy)] shrink-0"
        style={{ width: size, height: size }}
      >
        {/* 0.51 aqui vira 0.59 do quadrado, porque `size="inline"` é 1.15em -
            que é a proporção da especificação (20px num quadrado de 34). O
            deslocamento acompanha o tamanho em vez de ser fixo: -2px centram
            um glifo de 34px e entortam um de 64. */}
        <span style={{ fontSize: size * 0.51, marginTop: (-2 * size) / 34, lineHeight: 1 }}>
          <He size="inline" tone="lite" className="leading-none">ע</He>
        </span>
      </span>
      {words && (
        <span className="font-display font-semibold text-[18px] tracking-[-0.02em] text-ink">
          Hebraico Fluente
        </span>
      )}
    </span>
  );
}
