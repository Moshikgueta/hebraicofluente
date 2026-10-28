/* Os cenários da aventura (28/10/2026, pedido do dono: "Illustrated
 * Hebrew Adventure", com ilustração em vetor no código).
 * ─────────────────────────────────────────────────────────────────────────
 * Um lugar por módulo, na ordem do curso, e o curso não muda por causa
 * deles: o cenário é a moldura do módulo, não o conteúdo.
 *
 * Cada lugar sai das PALAVRAS que o aluno já lê naquele módulo (as de
 * `wordsToRead`/`wordsToRecognize` das letras já ensinadas), e não o
 * contrário: a cidade só aparece no módulo 4, quando o Áyin de עִיר já
 * foi ensinado.
 *
 *   1 O mar         · יָם, מַיִם, תֵה: a praia, o barco, a cidade no morro
 *   2 O jardim      · גַן, הַר, נָהָר, אֲגַם, שֶׁמֶשׁ: a montanha, o rio, o lago
 *   3 A janela      · חַלוֹן, וֶרֶד, לֶחֶם, מִטְרִיָה: janelas, rosas, a padaria
 *   4 A cidade      · עִיר, עֵץ, צֵל, סַל: o portão de pedra, a árvore, a sombra
 *   5 O mercado     · פִּתָה, תַפּוּחַ, קָפֶה, כֶּסֶף: toldos e caixas de fruta
 *   6 A rua         · o módulo sem os pontos: prédios, ônibus e placas
 *   7 O telhado     · o pôr do sol, as caixas d'água com aquecedor solar
 *                     dos telhados de Israel e as luzes de festa
 *
 * Três regras, as mesmas das gravuras de Raízes e dos emblemas do portal:
 *   · NADA de hebraico dentro do desenho. Hebraico é texto de verdade, no
 *     <He>, com a fonte certa; uma placa desenhada seria hebraico sem nikud
 *     conferido e sem leitor de tela. As placas aqui são retângulos.
 *   · Nenhum rosto, nenhum símbolo religioso como enfeite, nenhum lugar
 *     sagrado reconhecível. São paisagens e objetos do dia a dia.
 *   · As cores são tokens (`--il-*`, styles/tokens.css), redefinidos no
 *     tema escuro: o desenho acompanha o tema como o resto da tela.
 *
 * O movimento (a água, as nuvens, as luzes) só roda no cenário `vivo` - o
 * módulo em que o aluno está -, e para com "reduzir movimento" pelas duas
 * regras de globals.css. Os outros cenários ficam parados: sete animações
 * ao mesmo tempo num Android médio é bateria gasta à toa.
 */

import type { ReactNode } from 'react';
import { tx } from '@/i18n/telas/academia-aventura';

export type IdDoCenario = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/* O nome do lugar (28/10/2026, aprovado pelo dono): em hebraico, e sempre
   uma palavra que o aluno JÁ LÊ naquele módulo - o nome do lugar é uma
   leitura. Sem o ponto que dobra a letra até o módulo 5 (como tudo o que se
   lê nos módulos 1 a 4); o do módulo 6 vem sem pontos nenhuns, que é o que
   o módulo ensina. Só הַשּׁוּק não é palavra do curso: as letras dela já foram
   todas ensinadas no módulo 5, e o dono a aprovou. O hebraico vai no <He>,
   fora do desenho. */
export const LUGAR: Record<IdDoCenario, { he: string; translit: string; pt: string }> = {
  /* A transliteração fica como está: o inglês terá sistema próprio (etapa 3). */
  1: { he: 'הַיָם', translit: 'hayám', pt: tx.lugar1 }, // i18n-ok transliteração
  2: { he: 'הַגַן', translit: 'hagán', pt: tx.lugar2 }, // i18n-ok transliteração
  3: { he: 'הַחַלוֹן', translit: 'hachalón', pt: tx.lugar3 }, // i18n-ok transliteração
  4: { he: 'הָעִיר', translit: "ha'ír", pt: tx.lugar4 }, // i18n-ok transliteração
  5: { he: 'הַשּׁוּק', translit: 'hashúk', pt: tx.lugar5 }, // i18n-ok transliteração
  6: { he: 'רחוב', translit: 'rechóv', pt: tx.lugar6 }, // i18n-ok transliteração
  7: { he: 'הַגַּג', translit: 'hagág', pt: tx.lugar7 } // i18n-ok transliteração
};

const W = 320, H = 120;

/* ── as peças ─────────────────────────────────────────────────────────── */

function Ceu({ id, de = 'var(--il-ceu)', ate = 'var(--il-ceu-2)' }: { id: string; de?: string; ate?: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`ceu-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={de} />
          <stop offset="1" stopColor={ate} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#ceu-${id})`} />
    </>
  );
}

const Sol = ({ x, y, r = 14 }: { x: number; y: number; r?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r + 7} fill="var(--il-sol)" opacity=".22" />
    <circle cx={x} cy={y} r={r} fill="var(--il-sol)" />
  </g>
);

const Nuvem = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g className="il-nuvem" transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 10 Q2 2 10 4 Q14 -3 22 2 Q30 0 30 8 Q36 9 34 14 L2 14 Q-4 13 0 10 Z"
          fill="var(--il-nuvem)" />
  </g>
);

const Cipreste = ({ x, y, h = 34 }: { x: number; y: number; h?: number }) => (
  <path d={`M${x} ${y - h} Q${x + 6} ${y - h * .55} ${x + 4.5} ${y} L${x - 4.5} ${y} Q${x - 6} ${y - h * .55} ${x} ${y - h} Z`}
        fill="var(--il-cipreste)" />
);

function Oliveira({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-2 0 Q-1 -10 -4 -18 M1 0 Q2 -9 6 -16" stroke="var(--il-tronco)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="-8" cy="-22" rx="12" ry="7" fill="var(--il-oliva)" />
      <ellipse cx="8" cy="-21" rx="11" ry="6.5" fill="var(--il-oliva)" />
      <ellipse cx="0" cy="-28" rx="11" ry="6.5" fill="var(--il-oliva-2)" />
    </g>
  );
}

function Palmeira({ x, y, h = 36 }: { x: number; y: number; h?: number }) {
  const t = y - h;
  return (
    <g>
      <path d={`M${x} ${y} Q${x + 3} ${y - h / 2} ${x + 1} ${t}`} stroke="var(--il-tronco)" strokeWidth="3" fill="none" />
      {([[-16, 4], [-12, -6], [0, -10], [12, -6], [16, 5]] as [number, number][]).map(([dx, dy], k) => (
        <path key={k} d={`M${x + 1} ${t} Q${x + 1 + dx * .6} ${t + dy - 6} ${x + 1 + dx} ${t + dy}`}
              stroke="var(--il-oliva)" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
}

/* Uma casa de pedra: bloco, janela em arco, às vezes porta. */
function Casa({ x, y, w, h, janela = true, porta = false, tom = 'var(--il-pedra)' }: {
  x: number; y: number; w: number; h: number; janela?: boolean; porta?: boolean; tom?: string;
}) {
  const cx = x + w / 2;
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} fill={tom} />
      <rect x={x} y={y - h} width={w} height={2.5} fill="var(--il-pedra-sombra)" />
      {janela && <path d={`M${cx - 4} ${y - h * .45} L${cx - 4} ${y - h * .7} Q${cx} ${y - h * .82} ${cx + 4} ${y - h * .7} L${cx + 4} ${y - h * .45} Z`}
                       fill="var(--il-janela)" />}
      {porta && <path d={`M${cx - 5} ${y} L${cx - 5} ${y - 11} Q${cx} ${y - 16} ${cx + 5} ${y - 11} L${cx + 5} ${y} Z`}
                      fill="var(--il-porta)" />}
    </g>
  );
}

/* A água: duas fileiras de ondas que deslizam (só no cenário vivo). */
function Mar({ y }: { y: number }) {
  const onda = (yy: number) => {
    let d = `M-40 ${yy}`;
    for (let x = -40; x < W + 40; x += 20) d += ` q5 -3 10 0 q5 3 10 0`;
    return d;
  };
  return (
    <g>
      <rect x="0" y={y} width={W} height={H - y} fill="var(--il-mar)" />
      <rect x="0" y={y + (H - y) * .55} width={W} height={H} fill="var(--il-mar-2)" />
      <path className="il-onda" d={onda(y + 6)} stroke="var(--il-espuma)" strokeWidth="1.4" fill="none" opacity=".75" />
      <path className="il-onda il-onda-2" d={onda(y + 15)} stroke="var(--il-espuma)" strokeWidth="1.2" fill="none" opacity=".5" />
    </g>
  );
}

const Colinas = ({ y1 = 78, y2 = 90 }: { y1?: number; y2?: number }) => (
  <>
    <path d={`M0 ${y1} Q60 ${y1 - 18} 120 ${y1 - 4} T240 ${y1 - 10} T320 ${y1 - 2} L320 ${H} L0 ${H} Z`} fill="var(--il-colina-1)" />
    <path d={`M0 ${y2} Q80 ${y2 - 14} 160 ${y2 - 2} T320 ${y2 - 8} L320 ${H} L0 ${H} Z`} fill="var(--il-colina-2)" />
  </>
);

/* ── os sete lugares ──────────────────────────────────────────────────── */

const CENAS: Record<IdDoCenario, (id: string) => ReactNode> = {
  /* 4 · A cidade (עִיר): o portão em arco no alto do caminho, a árvore e a
     sombra (עֵץ, צֵל). */
  4: id => (
    <>
      <Ceu id={id} />
      <Sol x={250} y={34} />
      <Nuvem x={40} y={18} /><Nuvem x={176} y={26} s={.8} />
      <Colinas y1={74} y2={92} />
      {/* O portão: duas torres e o arco. */}
      <g>
        <rect x="128" y="44" width="64" height="52" fill="var(--il-pedra)" />
        <rect x="120" y="38" width="16" height="58" fill="var(--il-pedra-sombra)" />
        <rect x="184" y="38" width="16" height="58" fill="var(--il-pedra-sombra)" />
        {[0, 1, 2, 3].map(k => <rect key={k} x={122 + k * 4} y="34" width="2.5" height="4" fill="var(--il-pedra-sombra)" />)}
        {[0, 1, 2, 3].map(k => <rect key={k} x={186 + k * 4} y="34" width="2.5" height="4" fill="var(--il-pedra-sombra)" />)}
        <path d="M146 96 L146 70 Q160 54 174 70 L174 96 Z" fill="var(--il-porta)" />
      </g>
      {/* O caminho que sobe até o portão. */}
      <path d="M150 120 Q156 108 152 100 L168 100 Q166 110 178 120 Z" fill="var(--il-caminho)" />
      <Cipreste x={104} y={96} h={40} /><Cipreste x={92} y={98} h={30} />
      <Cipreste x={216} y={96} h={38} />
      {/* A árvore e a sombra dela (עֵץ, צֵל). */}
      <ellipse cx="62" cy="108" rx="26" ry="4" fill="var(--il-sombra)" />
      <Oliveira x={58} y={104} s={1.1} />
      <Oliveira x={268} y={106} />
    </>
  ),

  /* 3 · A janela: janelas (חַלוֹן), rosas (וֶרֶד) e a padaria (לֶחֶם). */
  3: id => (
    <>
      <Ceu id={id} />
      <Sol x={44} y={30} r={11} />
      <Nuvem x={210} y={16} s={.9} />
      <Colinas y1={70} y2={96} />
      <Casa x={22} y={104} w={44} h={46} porta />
      <Casa x={66} y={104} w={36} h={60} tom="var(--il-pedra-2)" />
      <Casa x={102} y={104} w={50} h={40} porta />
      <Casa x={152} y={104} w={40} h={54} tom="var(--il-pedra-2)" />
      <Casa x={192} y={104} w={46} h={44} porta />
      <Casa x={238} y={104} w={38} h={58} tom="var(--il-pedra-2)" />
      {/* A buganvília sobre as portas. */}
      {([[30, 62], [36, 58], [42, 63], [196, 64], [204, 60], [212, 65], [110, 68], [118, 65]] as [number, number][]).map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r="4" fill="var(--il-flor)" />
      ))}
      {/* A padaria: o toldo e os pães na vitrine (לֶחֶם). */}
      {[0, 1, 2, 3, 4].map(j => (
        <rect key={j} x={104 + j * 9.2} y="72" width="9.2" height="7"
              fill={j % 2 ? 'var(--il-toldo-2)' : 'var(--il-toldo)'} />
      ))}
      {[0, 1, 2].map(j => <ellipse key={j} cx={113 + j * 8} cy="84" rx="3.6" ry="2.2" fill="var(--il-pao)" />)}
      {/* O guarda-chuva encostado (מִטְרִיָה). */}
      <path d="M170 104 L170 92 M162 92 Q170 82 178 92 Z" stroke="var(--il-ferro)" strokeWidth="1.4" fill="var(--il-toldo-3)" />
      {/* O poste de luz. */}
      <path d="M290 104 L290 66 Q290 60 296 60" stroke="var(--il-ferro)" strokeWidth="2" fill="none" />
      <circle cx="297" cy="63" r="3" fill="var(--il-sol)" className="il-luz" />
      <rect x="0" y="104" width={W} height="16" fill="var(--il-caminho)" />
      <Cipreste x={284} y={104} h={26} />
    </>
  ),

  /* 2 · O jardim: a montanha (הַר), o rio (נָהָר) que desce até o lago
     (אֲגַם), o sol (שֶׁמֶשׁ) e as árvores do jardim (גַן). */
  2: id => (
    <>
      <Ceu id={id} />
      <Sol x={70} y={30} r={15} />
      <Nuvem x={200} y={14} s={.9} />
      <path d="M150 86 L214 22 L276 86 Z" fill="var(--il-montanha)" />
      <path d="M200 36 L214 22 L229 37 L222 34 L214 40 L206 34 Z" fill="var(--il-nuvem)" />
      <path d="M96 86 L140 50 L184 86 Z" fill="var(--il-colina-1)" />
      <path d="M0 84 Q90 74 170 84 T320 82 L320 120 L0 120 Z" fill="var(--il-colina-2)" />
      {/* O rio desce da montanha e abre no lago. */}
      <path d="M212 84 Q196 92 206 98 Q218 104 190 110 L206 110 Q232 104 222 97 Q214 92 222 84 Z" fill="var(--il-mar)" />
      <ellipse cx="170" cy="112" rx="42" ry="6" fill="var(--il-mar)" />
      <path className="il-onda" d="M120 112 q5 -2 10 0 q5 2 10 0 q5 -2 10 0 q5 2 10 0 q5 -2 10 0 q5 2 10 0 q5 -2 10 0 q5 2 10 0 q5 -2 10 0"
            stroke="var(--il-espuma)" strokeWidth="1" fill="none" opacity=".7" />
      {/* O jardim: árvores redondas e a cerca baixa. */}
      <Oliveira x={44} y={106} s={1.05} />
      <Oliveira x={92} y={108} s={.85} />
      <Cipreste x={276} y={106} h={34} /><Cipreste x={292} y={108} h={26} />
      <path d="M8 110 L120 110" stroke="var(--il-tronco)" strokeWidth="1.6" />
      {Array.from({ length: 12 }, (_, k) => (
        <path key={k} d={`M${12 + k * 9.5} 110 L${12 + k * 9.5} 103`} stroke="var(--il-tronco)" strokeWidth="1.6" />
      ))}
      <g className="il-passaros">
        <path d="M120 26 q4 -4 8 0 q4 -4 8 0" stroke="var(--il-ferro)" strokeWidth="1.3" fill="none" />
        <path d="M142 18 q3 -3 6 0 q3 -3 6 0" stroke="var(--il-ferro)" strokeWidth="1.2" fill="none" />
      </g>
    </>
  ),

  /* 5 · O mercado: toldos e caixas de fruta (תַפּוּחַ). */
  5: id => (
    <>
      <Ceu id={id} />
      <rect x="0" y="30" width={W} height="70" fill="var(--il-pedra-2)" />
      {[0, 1, 2, 3, 4].map(k => (
        <path key={k} d={`M${12 + k * 62} 100 L${12 + k * 62} 54 Q${36 + k * 62} 34 ${60 + k * 62} 54 L${60 + k * 62} 100 Z`}
              fill="var(--il-pedra-sombra)" />
      ))}
      {/* Os toldos listrados. */}
      {[0, 1, 2, 3, 4].map(k => (
        <g key={k}>
          {[0, 1, 2, 3, 4, 5].map(j => (
            <rect key={j} x={8 + k * 62 + j * 9} y="56" width="9" height="12"
                  fill={j % 2 ? 'var(--il-toldo-2)' : k % 2 ? 'var(--il-toldo-3)' : 'var(--il-toldo)'} />
          ))}
          <path d={`M8 ${68} ${[0, 1, 2, 3, 4, 5].map(j => `q4.5 5 9 0`).join(' ')}`} transform={`translate(${k * 62} 0)`}
                fill={k % 2 ? 'var(--il-toldo-3)' : 'var(--il-toldo)'} />
        </g>
      ))}
      {/* As caixas e as frutas. */}
      {[0, 1, 2, 3, 4].map(k => (
        <g key={k}>
          <rect x={14 + k * 62} y="88" width="44" height="16" fill="var(--il-caixa)" />
          {[0, 1, 2, 3, 4, 5].map(j => (
            <circle key={j} cx={19 + k * 62 + j * 7} cy={86 - (j % 2) * 3} r="4"
                    fill={['var(--il-fruta-1)', 'var(--il-fruta-2)', 'var(--il-fruta-3)', 'var(--il-oliva)', 'var(--il-fruta-1)'][k]} />
          ))}
        </g>
      ))}
      <rect x="0" y="104" width={W} height="16" fill="var(--il-caminho)" />
      {/* As placas: retângulos, nunca letras. */}
      <rect x="88" y="40" width="24" height="9" rx="2" fill="var(--il-placa)" />
      <rect x="212" y="40" width="28" height="9" rx="2" fill="var(--il-placa)" />
    </>
  ),

  /* 1 · O mar (יָם, מַיִם): a praia, a cidade no morro e o barco. */
  1: id => (
    <>
      <Ceu id={id} />
      <Sol x={62} y={34} r={12} />
      <Nuvem x={150} y={14} s={1.1} /><Nuvem x={250} y={24} s={.7} />
      <path d="M180 74 Q220 44 280 50 Q310 54 320 62 L320 80 L180 80 Z" fill="var(--il-colina-1)" />
      <Casa x={214} y={70} w={18} h={16} janela={false} />
      <Casa x={232} y={68} w={16} h={22} />
      <Casa x={248} y={66} w={20} h={18} janela={false} tom="var(--il-pedra-2)" />
      <Casa x={268} y={70} w={16} h={20} />
      {/* O farol. */}
      <rect x="292" y="40" width="9" height="34" fill="var(--il-pedra)" />
      <rect x="290" y="36" width="13" height="6" fill="var(--il-telha)" />
      <circle cx="296.5" cy="39" r="2" fill="var(--il-sol)" className="il-luz" />
      <Mar y={78} />
      {/* O barco, que balança de leve. */}
      <g className="il-barco">
        <path d="M84 94 L132 94 L124 104 L92 104 Z" fill="var(--il-barco)" />
        <path d="M106 94 L106 66 L126 90 Z" fill="var(--il-vela)" />
        <path d="M104 94 L104 72 L90 90 Z" fill="var(--il-vela)" opacity=".85" />
      </g>
      <Palmeira x={22} y={80} h={34} />
    </>
  ),

  /* 6 · A rua: prédios, árvores, o ônibus, as placas. */
  6: id => (
    <>
      <Ceu id={id} />
      <Nuvem x={30} y={16} /><Nuvem x={220} y={10} s={.8} />
      {([[10, 34, 70], [46, 30, 52], [78, 40, 82], [120, 28, 60], [150, 36, 74], [188, 32, 56], [222, 42, 88], [266, 34, 64], [300, 26, 48]] as [number, number, number][]).map(([x, w, h], k) => (
        <g key={k}>
          <rect x={x} y={104 - h} width={w} height={h} fill={k % 2 ? 'var(--il-predio-2)' : 'var(--il-predio)'} />
          {Array.from({ length: Math.floor(h / 12) }, (_, r) => Array.from({ length: Math.floor(w / 9) }, (_, c) => (
            <rect key={`${r}-${c}`} x={x + 4 + c * 9} y={104 - h + 6 + r * 12} width="4" height="5" fill="var(--il-janela-predio)" />
          )))}
        </g>
      ))}
      <rect x="0" y="104" width={W} height="16" fill="var(--il-asfalto)" />
      <rect x="0" y="111" width={W} height="1.4" fill="var(--il-faixa)" opacity=".6" />
      {/* O ônibus. */}
      <g className="il-onibus">
        <rect x="130" y="90" width="58" height="18" rx="4" fill="var(--il-onibus)" />
        {[0, 1, 2, 3, 4].map(k => <rect key={k} x={135 + k * 10} y="94" width="7" height="6" rx="1" fill="var(--il-janela-predio)" />)}
        <circle cx="142" cy="109" r="3.4" fill="var(--il-ferro)" /><circle cx="176" cy="109" r="3.4" fill="var(--il-ferro)" />
      </g>
      <Oliveira x={40} y={108} s={.8} /><Oliveira x={262} y={108} s={.9} />
      <rect x="226" y="82" width="22" height="10" rx="2" fill="var(--il-placa)" />
      <path d="M237 92 L237 104" stroke="var(--il-ferro)" strokeWidth="1.6" />
    </>
  ),

  /* 7 · O telhado: o pôr do sol sobre os telhados, as caixas d'água com o
     aquecedor solar e as luzes de festa. */
  7: id => (
    <>
      <Ceu id={id} de="var(--il-tarde)" ate="var(--il-tarde-2)" />
      <Sol x={168} y={58} r={20} />
      <path d="M0 80 Q80 68 160 76 T320 72 L320 120 L0 120 Z" fill="var(--il-colina-noite)" />
      {([[0, 60, 30], [60, 50, 40], [110, 70, 26], [180, 48, 36], [228, 92, 30]] as [number, number, number][]).map(([x, w, h], k) => (
        <g key={k}>
          <rect x={x} y={120 - h - 14} width={w} height={h + 14} fill="var(--il-telhado)" />
          {/* As janelas acesas do fim de tarde. */}
          {Array.from({ length: Math.floor(w / 16) }, (_, c) => (
            <rect key={c} x={x + 6 + c * 16} y={120 - h + 2} width="6" height="7" rx="1" fill="var(--il-janela-acesa)" />
          ))}
          {/* A caixa d'água e o painel solar ("dud shemesh"). */}
          <rect x={x + w * .3} y={120 - h - 24} width="12" height="10" rx="2" fill="var(--il-ferro)" />
          <path d={`M${x + w * .3 + 14} ${120 - h - 14} L${x + w * .3 + 30} ${120 - h - 22} L${x + w * .3 + 30} ${120 - h - 14} Z`}
                fill="var(--il-painel)" />
        </g>
      ))}
      {/* As luzes de festa, num fio. */}
      <path d="M10 20 Q90 44 170 26 T316 30" stroke="var(--il-ferro)" strokeWidth="1" fill="none" />
      {Array.from({ length: 13 }, (_, k) => {
        const t = k / 12, x = 10 + t * 306;
        const y = 20 + Math.sin(t * Math.PI * 2) * 10 + 6 + (k % 2) * 2;
        return <circle key={k} cx={x} cy={y} r="2.6" fill="var(--il-sol)"
                       className="il-luz" style={{ animationDelay: `${(k % 4) * 300}ms` }} />;
      })}
    </>
  )
};

/**
 * O cenário de um módulo. Decorativo (`aria-hidden`): o nome do lugar e o
 * do módulo estão no texto do cartão. `trancado` dessatura e escurece um
 * pouco - o lugar existe, mas ainda não foi visitado.
 */
export function Cenario({ n, vivo = false, trancado = false, className = '' }: {
  n: IdDoCenario; vivo?: boolean; trancado?: boolean; className?: string;
}) {
  const id = `c${n}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false"
         className={`block w-full h-full ${vivo ? 'il-vivo' : ''} ${trancado ? 'il-trancado' : ''} ${className}`}>
      {CENAS[n](id)}
    </svg>
  );
}
