/* validate.js - the build gate.
   Runs before every build. Collects ALL violations, prints them together,
   exits non-zero if any are fatal. Warnings never fail the build.

   V1 is the reason this file exists: a learner must never be shown a word
   containing a letter they have not been taught. Everything else is support. */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  consonantsOf, hasNikud, hasHebrew, clean, stripNikud, FINAL_TO_BASE
} from './lib/hebrew.js';
import { unmarkedHebrew } from './lib/render.js';

const ROOT = new URL('..', import.meta.url).pathname;
const read = p => readFileSync(join(ROOT, p), 'utf8');
const readJson = p => JSON.parse(read(p));

const fails = [];
const warns = [];
const fail = (rule, where, detail) => fails.push({ rule, where, detail });
const warn = (rule, where, detail) => warns.push({ rule, where, detail });

export function validate({ checkDist = true } = {}) {
  fails.length = 0; warns.length = 0;

  const letters = readJson('data/letters.json');
  const translit = readJson('data/translit.json');

  /* ── V4 - identity and ordering ────────────────────────────────────── */
  const orders = letters.map(l => l.order);
  const ids = letters.map(l => l.id);
  const chars = letters.map(l => l.letter);
  orders.slice().sort((a, b) => a - b).forEach((o, i) => {
    if (o !== i + 1) fail('V4', `order ${o}`, `orders must be contiguous from 1 - expected ${i + 1}`);
  });
  [['id', ids], ['letter', chars], ['order', orders]].forEach(([name, arr]) => {
    const seen = new Set();
    arr.forEach(v => {
      if (seen.has(v)) fail('V4', String(v), `duplicate ${name}`);
      seen.add(v);
    });
  });
  if (letters.length !== 22) {
    warn('V4', 'data/letters.json', `${letters.length} of 22 letters authored`);
  }

  /* ── V16 - the teaching plan and the letters agree ──────────────────
     data/modules.json says which letters a unit of «בא לי עברית!» covers;
     data/letters.json stamps each letter with its module and lesson. Two
     files, one fact - so they are checked against each other. The build
     reads BOTH (the opener from one, the letter pages from the other), and
     a drift between them would print a module whose contents page and whose
     letters disagree. */
  let modules = null;
  try { modules = readJson('data/modules.json').modules; } catch { /* not authored */ }
  if (!modules) {
    warn('V16', 'data/modules.json', 'ausente - o livro sai sem aberturas de módulo');
  } else {
    const claimed = new Map();      // letter id -> module n
    for (const M of modules) {
      for (const id of M.letters || []) claimed.set(id, M.n);
      for (const ls of M.lessons || []) {
        for (const id of ls.letters || []) {
          if (!(M.letters || []).includes(id)) {
            fail('V16', `módulo ${M.n}`, `a lição ${ls.n} traz "${id}", que não está em letters do módulo`);
          }
        }
      }
    }
    for (const L of letters) {
      if (L.module == null) { fail('V16', L.id, 'sem módulo'); continue; }
      const M = modules.find(m => m.n === L.module);
      if (!M) { fail('V16', L.id, `módulo ${L.module} não existe em modules.json`); continue; }
      if (claimed.get(L.id) !== L.module) {
        fail('V16', L.id, `diz ser do módulo ${L.module}, que não o lista`);
      }
      if (!(M.lessons || []).some(ls => (ls.letters || []).includes(L.id))) {
        fail('V16', L.id, `nenhuma lição do módulo ${L.module} o apresenta`);
      }
      const ls = (M.lessons || []).find(x => (x.letters || []).includes(L.id));
      if (ls && ls.n !== L.lesson) {
        fail('V16', L.id, `lesson ${L.lesson} não bate com a lição ${ls.n} do plano`);
      }
    }
    /* A module must be a contiguous run of the reading order, or the opener
       page ("as letras do módulo") describes a set the book never delivers
       in one go. */
    let prev = 0;
    for (const M of modules) {
      const own = letters.filter(l => l.module === M.n).sort((a, b) => a.order - b.order);
      if (!own.length) continue;
      if (own[0].order !== prev + 1 || own[own.length - 1].order !== prev + own.length) {
        fail('V16', `módulo ${M.n}`,
          `as ordens ${own.map(l => l.order).join(', ')} não formam um bloco contínuo a partir de ${prev + 1}`);
      }
      prev = own[own.length - 1].order;
    }
  }

  /* Order lookup, finals folded to their base letter. */
  const orderOf = new Map();
  letters.forEach(l => {
    orderOf.set(l.letter, l.order);
    if (l.finalForm) orderOf.set(l.finalForm, l.order);
  });

  const EXPECTED_FINALS = { 'מ': 'ם', 'נ': 'ן', 'כ': 'ך', 'פ': 'ף', 'צ': 'ץ' };

  for (const L of letters) {
    const at = `${L.id} (${L.letter}, ordem ${L.order})`;

    /* ── V5 - final forms ────────────────────────────────────────────── */
    const expected = EXPECTED_FINALS[L.letter] || null;
    if ((L.finalForm || null) !== expected) {
      fail('V5', at, `finalForm should be ${expected ? JSON.stringify(expected) : 'null'}, got ${JSON.stringify(L.finalForm)}`);
    }

    /* ── V6 - syllable table ─────────────────────────────────────────── */
    /* א, ה, י e ע não levam o cartão do sheva. No א e no ע ele virava um
       hataf ("a" ultrabreve) que o aluno lia como mais um A; no ה, um som que
       não se pronuncia; no י, um "y" sozinho que ninguém diz - o som do Yod é
       o da letra com a vogal (pedido do dono do curso, 26/09/2026). As quatro
       ficam com as cinco vogais. */
    const SEM_SHEVA = new Set(['א', 'ה', 'י', 'ע']);
    const WANT = SEM_SHEVA.has(L.letter) ? ['a', 'e', 'i', 'o', 'u'] : ['a', 'e', 'i', 'o', 'u', 'sheva'];
    if (!Array.isArray(L.syllables) || L.syllables.length !== WANT.length) {
      fail('V6', at, `expected ${WANT.length} syllables, got ${L.syllables ? L.syllables.length : 0}`);
    } else {
      L.syllables.forEach((s, i) => {
        if (s.vowel !== WANT[i]) fail('V6', at, `syllable ${i} should be "${WANT[i]}", got "${s.vowel}"`);
        if (!stripNikud(s.he).includes(L.letter)) {
          fail('V6', at, `syllable "${s.he}" does not start from ${L.letter}`);
        }
      });
    }

    /* ── V7 - confusables are real letters ───────────────────────────── */
    (L.confusableWith || []).forEach(c => {
      if (!orderOf.has(c) && !FINAL_TO_BASE[c] && !/[א-ת]/.test(c)) {
        fail('V7', at, `confusableWith contains "${c}", which is not a Hebrew letter`);
      }
    });

    /* ── V1 - THE ORDER RULE ─────────────────────────────────────────── */
    (L.wordsToRead || []).forEach(w => {
      const used = consonantsOf(w.he);
      const unknown = used.filter(ch => {
        const o = orderOf.get(ch);
        return o === undefined || o > L.order;
      });
      if (unknown.length) {
        fail('V1', at,
          `wordsToRead "${w.he}" (${w.translit}) uses ${unknown.map(c => `"${c}"` +
            (orderOf.has(c) ? ` [ordem ${orderOf.get(c)}]` : ' [não ensinada]')).join(', ')} ` +
          `- depois da ordem ${L.order}`);
      }
    });

    /* ── V2 - pointing present ───────────────────────────────────────── */
    [...(L.wordsToRead || []), ...(L.wordsToRecognize || [])].forEach(w => {
      if (!hasNikud(w.he)) fail('V2', at, `"${w.he}" has no nikud`);
    });
    if (L.nameHe && !hasNikud(L.nameHe)) fail('V2', at, `nameHe "${L.nameHe}" has no nikud`);

    /* ── V12 - empty reading list (expected for letter 1) ────────────── */
    if (!L.wordsToRead || !L.wordsToRead.length) {
      warn('V12', at, 'wordsToRead is empty - the templates fall back to syllable-only practice');
    }

    /* ── V13 - Hebrew in prose must be marked {{…}} ──────────────────
       An unmarked Hebrew run in a prose field reaches the page with no
       direction span, which is exactly how the reference PDF ends up with
       "(מ Mem)" and reversed exercise lines. */
    const proseFields = [
      ['soundNotePt', L.soundNotePt],
      ['didYouKnow', L.didYouKnow],
      ['brazilianMistake.wrong', L.brazilianMistake && L.brazilianMistake.wrong],
      ['brazilianMistake.right', L.brazilianMistake && L.brazilianMistake.right],
      ['brazilianMistake.why', L.brazilianMistake && L.brazilianMistake.why]
    ];
    for (const [fname, val] of proseFields) {
      if (!val) continue;
      const bad = unmarkedHebrew(val);
      if (bad.length) {
        fail('V13', at, `${fname}: hebraico sem {{ }} - ${bad.slice(0, 3).map(b => JSON.stringify(b)).join(', ')}`);
      }
    }

    /* ── V17 - the letter has something to gap ─────────────────────────
       The "complete a palavra" exercises need words that CONTAIN the target
       letter. wordsToRead may legitimately hold a word that does not - אַתְּ
       belongs on the He page as the partner of אַתָּה and has no he - so the
       templates filter, and this warns when the filter leaves too little to
       build an exercise from. */
    {
      const gappable = [...(L.wordsToRead || []), ...(L.wordsToRecognize || [])]
        .filter(w => w.he.includes(L.letter) || (L.finalForm && w.he.includes(L.finalForm)));
      if (gappable.length < 2) {
        warn('V17', at, `só ${gappable.length} palavra(s) contendo a própria letra - os exercícios de completar ficam curtos`);
      }
    }

    /* ── V15 - bridge words actually contain their letter ──────────────
       The whole point of a bridge word is that the reader finds the new
       letter inside a word they already know. קרם carries its mem only as
       the final ם, so a check on the base letter alone is not enough - and
       without this rule the page silently printed a word with nothing
       highlighted in it. */
    (L.bridgeWords || []).forEach(w => {
      const hasBase = w.he.includes(L.letter);
      const hasFinal = !!L.finalForm && w.he.includes(L.finalForm);
      if (!hasBase && !hasFinal) {
        fail('V15', at, `bridgeWords "${w.he}" (${w.pt}) não contém ${JSON.stringify(L.letter)}`);
      }
    });

    /* ── V11 - stroke-order artwork ──────────────────────────────────── */
    const svg = join(ROOT, 'assets/stroke-order', `${L.id}.svg`);
    if (!existsSync(svg)) warn('V11', at, `no stroke-order SVG - the page shows "em breve"`);
    else if (readFileSync(svg, 'utf8').includes('data-placeholder="true"')) {
      warn('V11', at, `stroke-order SVG is still the placeholder`);
    }

    /* ── V24 - as leituras de uma letra que tem mais de uma ────────────
       {{שׁ}} e {{שׂ}} são o mesmo desenho com o ponto de lados diferentes, e
       o curso ensinava isso em prosa sem NUNCA dar ao aluno os dois sons
       separados: um botão de áudio só, para uma letra que tem duas
       leituras. O mesmo valia para o daguesh de {{בּ}}, {{כּ}} e {{פּ}}.

       Cada variante vira um `audioId` próprio no exportador, derivado do
       próprio texto hebraico - então a regra aqui é sobre o DADO existir e
       ser coerente. Sem ela, uma letra de dois sons volta a ter um botão
       só e ninguém percebe até um aluno perguntar. */
    {
      const V = L.variantes || [];
      const doisSons = / ou /.test(String(L.sound || ''));
      if (doisSons && V.length < 2) {
        fail('V24', at, `o som é "${L.sound}" e não há variantes descritas`);
      }
      const vistos = new Set();
      V.forEach((v, i) => {
        const onde = `${at} variante[${i}]`;
        for (const campo of ['he', 'nomePt', 'som', 'translit', 'comoPt', 'ondePt']) {
          if (!v[campo]) fail('V24', onde, `sem ${campo}`);
        }
        /* A variante tem de ser ESTA letra: ou a forma base, ou a final. */
        const base = [...String(v.he || '')].some(c => c === L.letter || c === L.finalForm);
        if (!base) fail('V24', onde, `"${v.he}" não contém ${JSON.stringify(L.letter)}`);
        if (vistos.has(v.he)) fail('V24', onde, `"${v.he}" repetida`);
        vistos.add(v.he);
        /* A transliteração desta leitura entra numa sílaba montada pelo
           exercício - "sh" + "a" = "sha". Uma maiúscula ou um espaço aqui
           sai impresso na alternativa, e ninguém confere alternativa. */
        if (!/^[a-z]{1,3}$/.test(String(v.translit || ''))) {
          fail('V24', onde, `translit "${v.translit}" não é letra minúscula nossa`);
        }
        /* O hebraico no texto continua precisando de chaves. */
        for (const campo of ['comoPt', 'ondePt']) {
          if (unmarkedHebrew(v[campo] || '').length) {
            fail('V24', onde, `${campo}: hebraico sem {{ }}`);
          }
        }
      });
      /* Duas variantes com o mesmo desenho E o mesmo som não são duas
         leituras: são uma linha duplicada. */
      if (V.length >= 2 && new Set(V.map(v => v.som)).size === 1) {
        warn('V24', at, 'todas as variantes têm o mesmo som - confira se elas são mesmo duas leituras');
      }
    }

    /* ── V23 - a camada pedagógica da letra ────────────────────────────
       O curso sempre disse QUAL É O SOM de cada letra. O bloco `ensino`
       diz o que a letra FAZ dentro do sistema de escrita, que é a pergunta
       que o aluno realmente tem, e fecha com uma checagem de compreensão.

       A regra existe porque conteúdo pela metade não quebra nada: uma
       letra sem `funcaoPt` renderiza uma tela sem o quadro, ninguém vê
       erro, e a lição fica pior do que as vizinhas sem que nada avise. */
    const E = L.ensino;
    if (!E || typeof E !== 'object') {
      fail('V23', at, 'sem bloco `ensino` - a lição fica sem a explicação do que a letra faz');
    } else {
      for (const campo of ['funcaoPt', 'lembrePt']) {
        if (!E[campo] || String(E[campo]).trim().length < 40) {
          fail('V23', at, `ensino.${campo} ausente ou curto demais para explicar algo`);
        }
      }

      /* Onde a ausência é OMISSÃO, e não economia: uma letra com forma
         final ou com dois sons tem uma particularidade que o aluno vai
         encontrar na leitura, e não explicá-la é deixá-lo descobrir
         sozinho que a mesma letra "mudou". */
      const doisSons = /\bou\b/.test(String(L.sound || '')) || /\//.test(String(L.namePt || ''));
      if ((L.finalForm || doisSons) && !E.detalhePt) {
        fail('V23', at,
          `tem ${L.finalForm ? 'forma final' : 'mais de um som'} e não tem ensino.detalhePt`);
      }

      /* O hebraico em prosa continua precisando de {{ }} - mesma razão da
         V13. As alternativas de uma pergunta `visual` são a exceção: ali o
         hebraico É o conteúdo, renderizado pelo <He>, e marcá-lo com
         chaves poria as chaves na tela. */
      const prosa = [
        ['funcaoPt', E.funcaoPt], ['detalhePt', E.detalhePt],
        ['paraBrasileiroPt', E.paraBrasileiroPt], ['lembrePt', E.lembrePt],
        ['padraoPt', E.padraoPt]
      ];
      for (const [nome, val] of prosa) {
        if (!val) continue;
        const bad = unmarkedHebrew(val);
        if (bad.length) {
          fail('V23', at, `ensino.${nome}: hebraico sem {{ }} - ${bad.slice(0, 3).map(b => JSON.stringify(b)).join(', ')}`);
        }
      }

      /* A REGRA DE ORDEM VALE AQUI TAMBÉM, e é o erro mais fácil de
         cometer escrevendo esta camada: a explicação mais clara do mundo
         não serve se ela usa, de exemplo, uma letra que o aluno só vai
         conhecer daqui a nove lições. O mesmo princípio da V1, agora
         sobre a prosa de ensino e as alternativas em hebraico. */
      /* O {{ו}} de {{וֹ}} e {{וּ}} NÃO conta como consoante aqui.
         ──────────────────────────────────────────────────────────────
         Nesses dois casos ele não é a letra vav: é parte do SINAL de
         vogal - "o" e "u" -, e o curso mostra essas vogais desde a
         primeira lição, na tabela de sílabas de toda letra. Tratá-lo como
         consoante faria a regra acusar {{אוֹ}} na lição 1, que é
         exatamente o que o curso ensina ali.

         A letra vav de verdade continua valendo: {{ו}} sozinho, ou com
         outro sinal, é a letra da ordem 12 e não pode aparecer antes. */
      const semVogalVav = txt => String(txt || '').replace(/ו[ֹּ]/g, '');
      const foraDeOrdem = txt => consonantsOf(semVogalVav(txt)).filter(ch => {
        const o = orderOf.get(ch);
        return o === undefined || o > L.order;
      });
      for (const [nome, val] of prosa) {
        if (!val) continue;
        /* Só o hebraico marcado: o resto é português. */
        const runs = [...String(val).matchAll(/\{\{(.+?)\}\}/g)].map(m => m[1]).join(' ');
        const tarde = foraDeOrdem(runs);
        if (tarde.length) {
          fail('V23', at, `ensino.${nome}: usa ${tarde.map(c => `"${c}"`).join(', ')} antes de ensiná-la(s)`);
        }
      }

      /* ── V25 · a dica de leitura ────────────────────────────────────
         Um bloco 💡 diz "você vai encontrar isto, e é assim que se lê" -
         e a parte que mais importa é o LIMITE dele. Uma pista de leitura
         sem ressalva vira lei na cabeça de quem está começando: "{{ה}} no
         fim é sempre A" é falso, e quem acredita nisso lê errado e não
         descobre por quê. Por isso `notaPt` é obrigatória.

         E os exemplos passam pela regra de ordem como todo o resto - com
         um agravante: aqui o exemplo é a única coisa que o aluno vai
         LER de verdade no quadro. Um exemplo com letra que ele ainda não
         tem é uma palavra que ele não consegue decifrar, bem no lugar
         onde o curso prometeu que ele conseguiria. */
      const D = E.dicaLeitura;
      if (D !== undefined) {
        if (!D || typeof D !== 'object') {
          fail('V25', at, 'ensino.dicaLeitura existe mas não é um bloco');
        } else {
          if (!D.tituloPt) fail('V25', at, 'dicaLeitura sem tituloPt');
          if (!D.notaPt || String(D.notaPt).trim().length < 40) {
            fail('V25', at, 'dicaLeitura sem a ressalva (notaPt) - uma dica sem limite vira regra falsa');
          }
          const passos = Array.isArray(D.passos) ? D.passos : [];
          if (passos.length < 3 || passos.length > 5) {
            fail('V25', at, `dicaLeitura tem ${passos.length} passo(s) - o card pede de 3 a 5`);
          }
          const exemplos = Array.isArray(D.exemplos) ? D.exemplos : [];
          if (exemplos.length < 2) {
            fail('V25', at, `dicaLeitura tem ${exemplos.length} exemplo(s) - um só não mostra padrão nenhum`);
          }
          for (const [nome, val] of [['tituloPt', D.tituloPt], ['notaPt', D.notaPt], ...passos.map((p, i) => [`passos[${i}]`, p])]) {
            const bad = unmarkedHebrew(val || '');
            if (bad.length) fail('V25', at, `dicaLeitura.${nome}: hebraico sem {{ }}`);
            const runs = [...String(val || '').matchAll(/\{\{(.+?)\}\}/g)].map(m => m[1]).join(' ');
            const tarde = foraDeOrdem(runs);
            if (tarde.length) {
              fail('V25', at, `dicaLeitura.${nome}: usa ${tarde.map(c => `"${c}"`).join(', ')} antes de ensiná-la(s)`);
            }
          }
          exemplos.forEach((ex, i) => {
            const onde = `${at} dicaLeitura.exemplos[${i}]`;
            for (const campo of ['he', 'translitPt', 'ptPt']) {
              if (!ex?.[campo]) fail('V25', onde, `sem ${campo}`);
            }
            const tarde = foraDeOrdem(ex?.he || '');
            if (tarde.length) {
              fail('V25', onde, `"${ex.he}" usa ${tarde.map(c => `"${c}"`).join(', ')}, que o aluno ainda não viu`);
            }
          });
        }
      }

      const C = Array.isArray(E.checagem) ? E.checagem : [];
      if (C.length < 2) {
        fail('V23', at, `ensino.checagem tem ${C.length} pergunta(s) - o mínimo é 2`);
      }
      C.forEach((p, i) => {
        const ondeP = `${at} checagem[${i}]`;
        if (!p.q || !p.porque) {
          fail('V23', ondeP, 'sem enunciado ou sem o motivo da resposta');
        }
        /* "Incorreto" sozinho não é dito em lugar nenhum do curso: o motivo
           aparece sempre, inclusive no acerto. Um motivo de meia dúzia de
           palavras é um "incorreto" disfarçado. */
        if (p.porque && String(p.porque).trim().length < 40) {
          fail('V23', ondeP, 'o motivo é curto demais para explicar o erro');
        }
        for (const [nome, val] of [['q', p.q], ['porque', p.porque]]) {
          const bad = unmarkedHebrew(val || '');
          if (bad.length) fail('V23', ondeP, `${nome}: hebraico sem {{ }}`);
        }
        for (const [nome, val] of [['q', p.q], ['porque', p.porque]]) {
          const runs = [...String(val || '').matchAll(/\{\{(.+?)\}\}/g)].map(m => m[1]).join(' ');
          const tarde = foraDeOrdem(runs);
          if (tarde.length) {
            fail('V23', ondeP, `${nome}: usa ${tarde.map(c => `"${c}"`).join(', ')} antes de ensiná-la(s)`);
          }
        }
        if (p.t === 'escolha' || p.t === 'visual') {
          const n = Array.isArray(p.opcoes) ? p.opcoes.length : 0;
          if (n < 2) fail('V23', ondeP, `só ${n} alternativa(s)`);
          /* Numa pergunta `visual` as alternativas SÃO hebraico, sem chaves
             - mas continuam sujeitas à ordem. */
          if (p.t === 'visual') {
            const tarde = foraDeOrdem((p.opcoes || []).join(' '));
            if (tarde.length) {
              fail('V23', ondeP, `alternativas usam ${tarde.map(c => `"${c}"`).join(', ')} antes de ensiná-la(s)`);
            }
          }
          if (!(p.certa >= 0 && p.certa < n)) {
            fail('V23', ondeP, `certa=${p.certa} fora das ${n} alternativas`);
          }
          if (new Set(p.opcoes || []).size !== n) fail('V23', ondeP, 'alternativas repetidas');
        } else if (p.t === 'vf') {
          if (typeof p.certa !== 'boolean') fail('V23', ondeP, 'verdadeiro/falso sem `certa` booleano');
        } else {
          fail('V23', ondeP, `tipo "${p.t}" desconhecido`);
        }
      });
    }
  }

  /* ── V14 - every word with an image slot has an illustration ────────
     wordsToRecognize is what fills the picture slots, so an unmapped word
     leaves a hole on the page that nothing else would report. */
  let icons = null;
  try { icons = readJson('data/icons.json').words; } catch { /* not authored yet */ }
  if (icons) {
    for (const L of letters) {
      for (const w of L.wordsToRecognize || []) {
        const v = icons[w.he];
        if (v === undefined) {
          fail('V14', L.id, `"${w.he}" (${w.translit}) não tem ilustração em data/icons.json`);
        } else if (v && !v.startsWith('#') &&
                   !existsSync(join(ROOT, 'assets/icons', `${v}.svg`))) {
          fail('V14', L.id, `"${w.he}" aponta para o ícone "${v}", que não existe em assets/icons/`);
        }
      }
    }
  } else {
    warn('V14', 'data/icons.json', 'ausente - os slots de imagem ficam vazios');
  }

  /* ── V3 - one spelling per word, everywhere ────────────────────────
     Keyed on the POINTED string. Nikud is meaningful here: שָׁם (sham, "lá")
     and שֵׁם (shem, "nome") are different words that differ only by pointing,
     and must be allowed to transliterate differently. What must never differ
     is the same pointed word read two ways.

     Letter NAMES are excluded: L.namePt is a name ("Bet / Vet"), not a
     transliteration of L.nameHe, so it is not comparable to word data. */
  const seenTranslit = new Map();   // pointed hebrew -> { translit, where }
  const record = (he_, tr, where, isSyllable = false) => {
    if (!he_ || !tr) return;
    const key = clean(he_).normalize('NFC');
    const prev = seenTranslit.get(key);
    if (prev && prev.translit.toLowerCase() !== String(tr).toLowerCase()) {
      fail('V3', key,
        `transliterado como "${prev.translit}" em ${prev.where} e "${tr}" em ${where}`);
    } else if (!prev) {
      seenTranslit.set(key, { translit: tr, where, isSyllable });
    }
  };
  for (const L of letters) {
    const at = L.id;
    (L.syllables || []).forEach(s => record(s.he, s.translit, `${at}.syllables`, true));
    (L.wordsToRead || []).forEach(w => record(w.he, w.translit, `${at}.wordsToRead`));
    (L.wordsToRecognize || []).forEach(w => record(w.he, w.translit, `${at}.wordsToRecognize`));
  }
  Object.entries(translit.words || {}).forEach(([h, t]) => record(h, t, 'translit.json'));

  /* ── V18 - «Hebraico no mundo real» obeys the order rule ───────────
     A scene is the reward for having learned the letters. A scene the reader
     cannot decode is the opposite of a reward, so each one declares the
     earliest point it may appear and this checks the claim. Spaces are
     ignored: a two-word sign is still just its consonants. */
  let realWorld = null;
  try { realWorld = readJson('data/real-world.json').scenes; } catch { /* not authored */ }
  if (realWorld) {
    for (const s of realWorld) {
      const allowed = new Set();
      letters.filter(l => l.order <= s.fromOrder).forEach(l => {
        allowed.add(l.letter);
        if (l.finalForm) allowed.add(l.finalForm);
      });
      const unknown = consonantsOf(s.he).filter(ch => {
        const base = FINAL_TO_BASE[ch] || ch;
        return ![...allowed].some(a => (FINAL_TO_BASE[a] || a) === base);
      });
      if (unknown.length) {
        fail('V18', `real-world/${s.id}`,
          `"${s.he}" usa ${[...new Set(unknown)].map(c => JSON.stringify(c)).join(', ')} - ` +
          `depois da ordem ${s.fromOrder}`);
      }
      if (!hasNikud(s.he)) fail('V18', `real-world/${s.id}`, `"${s.he}" sem nikud`);
      const bad = unmarkedHebrew(s.contextPt);
      if (bad.length) {
        fail('V18', `real-world/${s.id}`, `contextPt: hebraico sem {{ }} - ${bad.slice(0, 2).join(', ')}`);
      }
    }
  } else {
    warn('V18', 'data/real-world.json', 'ausente - a seção «no mundo real» fica vazia');
  }

  /* ── V20 - as frases só aparecem depois das letras que usam ────────
     Mesma regra da V1, e pelo mesmo motivo: uma frase mostrada antes da hora
     não é desafio, é parede.

     A diferença é que aqui o `after` é CALCULADO e comparado com o que está
     escrito, em vez de apenas conferido. Um número folgado passaria numa
     verificação como a V1 - uma frase declarada para a letra 17 que só
     precisa da 11 não mostra nada errado ao aluno, apenas o faz esperar seis
     letras à toa. Das dezesseis frases escritas à mão, DUAS tinham esse erro.

     E a soma das `words` tem de reconstruir a frase: é ela que a leitura
     palavra a palavra percorre, e uma palavra esquecida ali some da tela sem
     avisar ninguém. */
  let sentences = null;
  try { sentences = readJson('data/sentences.json').sentences; } catch { /* not authored */ }
  if (sentences) {
    const ordemDe = new Map();
    for (const l of letters) {
      ordemDe.set(l.letter, l.order);
      if (l.finalForm) ordemDe.set(l.finalForm, l.order);
    }
    const igual = t => clean(t).replace(/[,.;!?]/g, '').replace(/\s+/g, ' ').trim();
    for (const s of sentences) {
      const at = `sentences/${s.id}`;
      const cs = consonantsOf(s.he);
      const fora = cs.filter(c => !ordemDe.has(c));
      if (fora.length) {
        fail('V20', at,
          `"${s.he}" usa ${[...new Set(fora)].map(c => JSON.stringify(c)).join(', ')} - não é letra do curso`);
        continue;
      }
      const real = Math.max(...cs.map(c => ordemDe.get(c)));
      if (real !== s.after) {
        fail('V20', at, `after declarado ${s.after}, mas a letra mais tardia é a de ordem ${real}`);
      }
      if (!hasNikud(s.he)) fail('V20', at, `"${s.he}" sem nikud`);

      const junta = (s.words || []).map(w => w.he).join(' ');
      if (igual(junta) !== igual(s.he)) {
        fail('V20', at, `as words não reconstroem a frase: "${junta}" ≠ "${s.he}"`);
      }
      const bad = unmarkedHebrew(s.notePt || '');
      if (bad.length) fail('V20', at, `notePt: hebraico sem {{ }} - ${bad.slice(0, 2).join(', ')}`);
    }
    if (!sentences.some(s => s.era === 'antigo')) {
      warn('V20', 'data/sentences.json',
        'nenhuma frase marcada «antigo» - a leitura paralela do fim fica sem o lado bíblico');
    }
  } else {
    warn('V20', 'data/sentences.json', 'ausente - o curso volta a não ter nenhuma frase inteira');
  }

  /* ── V21 - a raiz compartilhada entre as duas eras é DE VERDADE ─────
     `data/eras.json` põe uma linha bíblica ao lado de uma frase de rua e diz
     que as duas têm a mesma raiz. É a afirmação mais forte que o curso faz
     sobre a língua, e a mais fácil de inventar: basta escolher duas frases
     bonitas e declarar um parentesco.

     Então aqui a afirmação é conferida letra por letra. Cada consoante da
     raiz tem de aparecer NAS DUAS frases; se não aparecer, o par não entra.
     A ordem não é exigida - raiz hebraica é um esqueleto, não uma sequência
     literal - mas a presença é. */
  let eras = null;
  try { eras = readJson('data/eras.json').pairs; } catch { /* not authored */ }
  if (eras && sentences) {
    const porId = new Map(sentences.map(s => [s.id, s]));
    for (const p of eras) {
      const at = `eras/${p.id}`;
      const A = porId.get(p.antigo);
      const M = porId.get(p.moderno);
      if (!A) { fail('V21', at, `"${p.antigo}" não é uma frase de sentences.json`); continue; }
      if (!M) { fail('V21', at, `"${p.moderno}" não é uma frase de sentences.json`); continue; }
      if (A.era !== 'antigo') fail('V21', at, `"${p.antigo}" não está marcada «antigo»`);
      if (M.era !== 'moderno') fail('V21', at, `"${p.moderno}" não está marcada «moderno»`);

      const raiz = [...new Set(consonantsOf(p.raiz))];
      if (raiz.length < 2) fail('V21', at, `a raiz "${p.raiz}" não tem consoantes suficientes`);
      for (const [rotulo, s] of [['antiga', A], ['moderna', M]]) {
        const tem = new Set(consonantsOf(s.he));
        const falta = raiz.filter(c => !tem.has(c));
        if (falta.length) {
          fail('V21', at,
            `a raiz ${p.raiz} não está na frase ${rotulo} "${s.he}" - falta ${falta.join(', ')}`);
        }
      }
      if (!p.fontePt) fail('V21', at, 'citação antiga sem fonte');
      const bad = unmarkedHebrew(p.notePt || '');
      if (bad.length) fail('V21', at, `notePt: hebraico sem {{ }} - ${bad.slice(0, 2).join(', ')}`);
    }
  } else if (!eras) {
    warn('V21', 'data/eras.json', 'ausente - a página de história perde o lado a lado das duas eras');
  }

  /* ── V22 - o versículo da página «vou conseguir ler a Bíblia?» ──────
     Esta página é pública, e é a única do site onde um visitante que ainda
     não comprou vê um texto antigo palavra por palavra. Um erro de grafia
     aqui é um erro na vitrine, na frente de gente que conhece o versículo de
     cor - e um erro de grafia num texto sagrado não é um typo qualquer.

     Confere o mesmo que a V20 confere numa frase, pelos mesmos motivos: toda
     consoante é letra do curso, o texto tem nikud, e a soma das palavras
     reconstrói o versículo (é ela que a tela percorre - uma palavra esquecida
     ali some da tela sem avisar ninguém). */
  let biblia = null;
  try { biblia = readJson('data/biblia.json').verses; } catch { /* not authored */ }
  if (biblia) {
    const doCurso = new Set();
    for (const l of letters) {
      doCurso.add(l.letter);
      if (l.finalForm) doCurso.add(l.finalForm);
    }
    const igual = t => clean(t).replace(/[,.;!?]/g, '').replace(/\s+/g, ' ').trim();
    for (const v of biblia) {
      const at = `biblia/${v.id}`;
      const fora = [...new Set([...clean(v.he)].filter(c => /[א-ת]/.test(c)))]
        .filter(c => !doCurso.has(c));
      if (fora.length) {
        fail('V22', at, `"${v.he}" usa ${fora.map(c => JSON.stringify(c)).join(', ')} - não é letra do curso`);
      }
      if (!hasNikud(v.he)) fail('V22', at, `"${v.he}" sem nikud`);
      if (!v.fontePt) fail('V22', at, 'versículo sem fonte - capítulo e verso');
      if (!v.pt) fail('V22', at, 'versículo sem tradução');

      const junta = (v.words || []).map(w => w.he).join(' ');
      if (igual(junta) !== igual(v.he)) {
        fail('V22', at, `as words não reconstroem o versículo: "${junta}" ≠ "${v.he}"`);
      }
      for (const w of v.words || []) {
        if (!hasNikud(w.he)) fail('V22', at, `a palavra "${w.he}" está sem nikud`);
        if (!w.translit || !w.pt) fail('V22', at, `a palavra "${w.he}" está sem transliteração ou sem glosa`);
      }
    }
  } else {
    warn('V22', 'data/biblia.json', 'ausente - a página «vou conseguir ler a Bíblia?» fica sem o versículo');
  }

  /* ── V19 - modules 6 and 7 are consistent with the alphabet ────────
     The dagesh pairs and the final forms are claims about the language, and
     they are now shared by the book and the app. A typo here would be printed
     in one and taught in the other. */
  let extras = null;
  try { extras = readJson('data/extras.json'); } catch { /* not authored */ }
  if (extras) {
    const byChar2 = new Map(letters.map(l => [l.letter, l]));
    for (const D of extras.dagesh.letters) {
      const L = letters.find(l => l.id === D.id);
      if (!L) { fail('V19', `extras/${D.id}`, 'não existe em letters.json'); continue; }
      if (stripNikud(D.soft) !== L.letter) {
        fail('V19', `extras/${D.id}`, `soft "${D.soft}" não é a letra ${L.letter}`);
      }
      if (stripNikud(D.hard) !== L.letter) {
        fail('V19', `extras/${D.id}`, `hard "${D.hard}" não é a letra ${L.letter}`);
      }
      for (const w of [...D.hardWords, ...D.softWords]) {
        if (!hasNikud(w.he)) fail('V19', `extras/${D.id}`, `"${w.he}" sem nikud`);
        record(w.he, w.translit, `extras.${D.id}`);
      }
    }
    const EXPECT_FIN = { 'מ': 'ם', 'נ': 'ן', 'כ': 'ך', 'פ': 'ף', 'צ': 'ץ' };
    if (extras.finals.length !== 5) {
      fail('V19', 'extras.finals', `${extras.finals.length} formas finais, esperadas 5`);
    }
    for (const F of extras.finals) {
      if (EXPECT_FIN[F.base] !== F.fin) {
        fail('V19', 'extras.finals', `${F.base} → ${F.fin} está errado`);
      }
      if (!byChar2.has(F.base)) fail('V19', 'extras.finals', `${F.base} não é uma letra ensinada`);
      if (!F.word.includes(F.fin)) {
        fail('V19', 'extras.finals', `o exemplo "${F.word}" não contém ${F.fin}`);
      }
      record(F.word, F.translit, 'extras.finals');
    }
    /* ── ler sem nikud ───────────────────────────────────────────────
       A lista tinha oito palavras, que se liam em menos de um minuto. São 24,
       em três grupos, e a fonte agora traz só a forma APONTADA - a nua, a
       transliteração e a glosa saem de letters.json no exportador.

       O que se confere aqui é a frase que o próprio módulo diz ao aluno:
       "você já conhece todas elas". Ela é uma promessa verificável, e uma
       palavra que ninguém ensinou transformaria a etapa final do módulo 6
       numa adivinhação. Também se confere o par ambíguo: as duas leituras
       precisam MESMO ter o mesmo desenho sem os pontos, ou a lição sobre
       ambiguidade está ensinando uma ambiguidade que não existe. */
    {
      const U = extras.unpointed;
      const vocab = new Map();
      for (const L of letters) {
        for (const w of [...L.wordsToRead, ...L.wordsToRecognize]) vocab.set(clean(w.he), w);
      }
      const confere = (pointed, onde) => {
        const p = clean(pointed);
        const w = vocab.get(p);
        if (!w) {
          fail('V19', onde, `"${p}" não foi ensinada em lição nenhuma - o módulo 6 promete que foi`);
          return null;
        }
        record(p, w.translit, onde);
        return p;
      };

      const grupos = U.groups || [];
      const total = grupos.reduce((n, g) => n + (g.words?.length || 0), 0);
      if (!grupos.length) fail('V19', 'extras.unpointed', 'sem grupos');
      /* Um piso, e não um número exato: o ponto é que oito era pouco. */
      if (total < 18) {
        fail('V19', 'extras.unpointed', `${total} palavras sem nikud - poucas para fechar o módulo`);
      }
      const vistas = new Set();
      for (const g of grupos) {
        if (!g.id || !g.titlePt || !g.notePt) fail('V19', `extras.unpointed/${g.id}`, 'grupo sem id, título ou nota');
        for (const pointed of g.words || []) {
          const p = confere(pointed, `extras.unpointed/${g.id}`);
          if (!p) continue;
          if (vistas.has(p)) fail('V19', `extras.unpointed/${g.id}`, `"${p}" aparece em dois grupos`);
          vistas.add(p);
        }
      }

      const A = U.ambiguous;
      if (!A || (A.readings || []).length < 2) {
        fail('V19', 'extras.unpointed.ambiguous', 'sem o par que mostra a ambiguidade');
      } else {
        const nuas = new Set();
        for (const pointed of A.readings) {
          const p = confere(pointed, 'extras.unpointed.ambiguous');
          if (p) nuas.add(stripNikud(p));
        }
        if (nuas.size !== 1) {
          fail('V19', 'extras.unpointed.ambiguous',
            `as leituras não têm o mesmo desenho sem os pontos: ${[...nuas].join(' ≠ ')}`);
        }
        const pontuadas = new Set(A.readings.map(clean));
        if (pontuadas.size !== A.readings.length) {
          fail('V19', 'extras.unpointed.ambiguous', 'as leituras são a mesma palavra apontada');
        }
      }
    }
    const GERESH = '׳';
    for (const g of extras.gerech.letters) {
      if (g.he !== g.base + GERESH) {
        fail('V19', `extras.gerech/${g.id}`, `"${g.he}" deveria ser ${g.base} + gerech U+05F3`);
      }
      for (const w of g.words) {
        if (!w.he.includes(g.he)) {
          fail('V19', `extras.gerech/${g.id}`, `"${w.he}" não contém ${g.he}`);
        }
      }
    }
  } else {
    warn('V19', 'data/extras.json', 'ausente - os módulos 6 e 7 ficam sem conteúdo');
  }

  /* ── V26 - as lições de som (Vet, Chaf, Fe, Tch, Dj, J) ────────────
     Cada uma promete três coisas que dá para conferir: toda palavra TEM o
     som da lição (a letra sem daguesh, a final, ou a letra com gerech); toda
     palavra de Vet/Chaf/Fe só usa letras já ensinadas até ali (a regra V1 das
     letras, na posição da lição); e o plano de aulas (modules.json) põe a
     lição no número e no módulo que ela diz ter. */
  if (extras?.sons) {
    const DAGUESH = 'ּ';
    const GERESH = '׳';
    const plano = new Map();
    for (const M of modules || []) for (const ls of M.lessons || []) if (ls.som) plano.set(ls.som, { M, ls });
    const ids = new Set();
    for (const S of extras.sons.licoes) {
      const onde = `extras.sons/${S.id}`;
      if (ids.has(S.id)) fail('V26', onde, 'id repetido');
      ids.add(S.id);
      const p = plano.get(S.id);
      if (!p) fail('V26', onde, 'nenhuma lição de modules.json aponta para este som');
      else if (p.ls.n !== S.licao || p.M.n !== S.modulo) {
        fail('V26', onde, `diz ser a lição ${S.licao} do módulo ${S.modulo}; o plano diz ${p.ls.n} do módulo ${p.M.n}`);
      }
      if (S.tipo === 'daguesh') {
        const L = letters.find(l => l.id === S.depoisDe);
        if (!L) { fail('V26', onde, `depoisDe "${S.depoisDe}" não é uma letra`); continue; }
        if (S.he !== L.letter) fail('V26', onde, `"${S.he}" não é a letra ${L.letter}`);
        /* A letra sem ponto em algum lugar da palavra, ou a forma final. */
        const temSom = he => [...he.normalize('NFC')].some((c, i, a) =>
          (c === L.letter && !a.slice(i + 1).join('').match(/^[֑-ׇ]*ּ/)) || c === L.finalForm);
        for (const s of S.silabas) {
          /* O daguesh proibido é o da consoante; o do וּ (shuruk) é vogal. */
          const consoante = s.he.normalize('NFC').match(/^.[\u0591-\u05C7]*/)[0];
          if (consoante.includes(DAGUESH) || stripNikud(s.he).replace(/ו/g, '') !== L.letter) {
            fail('V26', onde, `a sílaba "${s.he}" não é ${L.letter} sem ponto`);
          }
        }
        for (const w of S.palavras) {
          if (!hasNikud(w.he)) fail('V26', onde, `"${w.he}" sem nikud`);
          if (!temSom(w.he)) fail('V26', onde, `"${w.he}" não tem ${L.letter} sem ponto`);
          for (const c of stripNikud(w.he)) {
            const o = orderOf.get(c);
            if (o == null || o > L.order) fail('V26', onde, `"${w.he}" usa ${c}, que ainda não foi ensinada`);
          }
          record(w.he, w.translit, onde);
        }
      } else if (S.tipo === 'gerech') {
        const L = letters.find(l => l.id === S.parId);
        if (!L) { fail('V26', onde, `parId "${S.parId}" não é uma letra`); continue; }
        if (S.he !== L.letter + GERESH) fail('V26', onde, `"${S.he}" deveria ser ${L.letter} + gerech U+05F3`);
        const final = L.finalForm ? L.finalForm + GERESH : null;
        for (const w of S.palavras) {
          if (!w.he.includes(S.he) && !(final && w.he.includes(final))) {
            fail('V26', onde, `"${w.he}" não contém ${S.he}`);
          }
        }
      } else {
        fail('V26', onde, `tipo "${S.tipo}" desconhecido`);
      }
      if (!S.palavras.length || !S.checagem?.length) fail('V26', onde, 'sem palavras ou sem checagem');
      /* As alternativas da checagem saem como texto puro: um {{…}} ali
         aparece para o aluno com as chaves. Só o enunciado passa pelo Prose. */
      for (const q of S.checagem || []) {
        for (const o of q.opcoes || []) if (o.includes('{{')) fail('V26', onde, `alternativa com {{…}}: "${o}"`);
      }
    }
  }


  /* V3b - a word written with two DIFFERENT pointings is usually a typo in one
     of them. Not fatal (שָׁם/שֵׁם are a real pair), but worth surfacing.

     ATENÇÃO antes de "consertar" um aviso destes apagando uma das duas: o par
     שָׁם/שֵׁם é conteúdo, e o módulo 6 o usa para ensinar que, sem os pontos, o
     contexto é que decide (`extras.unpointed.ambiguous`). Apagar um dos dois
     derruba a V19, que exige que as leituras tenham o mesmo desenho nu. */
  const byConsonants = new Map();
  for (const [pointed, rec] of seenTranslit) {
    if (rec.isSyllable) continue;   // a consonant + each vowel is not a clash
    const bare = stripNikud(pointed);
    if (!byConsonants.has(bare)) byConsonants.set(bare, []);
    byConsonants.get(bare).push({ pointed, ...rec });
  }
  for (const [bare, group] of byConsonants) {
    if (group.length > 1) {
      warn('V3b', bare,
        `mesma consoante, pontuações diferentes: ${group.map(g => `${g.pointed} = ${g.translit}`).join(' · ')}`);
    }
  }

  /* ── V8 / V9 / V10 - checked on the built output ──────────────────── */
  if (checkDist) {
    const dist = join(ROOT, 'dist');
    if (existsSync(dist)) {
      for (const f of readdirSync(dist).filter(f => f.endsWith('.html'))) {
        const src = readFileSync(join(dist, f), 'utf8');
        checkBidi(src, f);

        /* V10 - a review unit may only show letters already taught. The
           content is derived from the letters in range so this should hold by
           construction; it is checked anyway, because "by construction" is
           exactly the kind of claim that stops being true after an edit. */
        const rm = /^r(\d+)-revisao-(\d+|final)\.html$/.exec(f);
        if (rm) {
          const upTo = rm[2] === 'final' ? 22 : Number(rm[2]);
          const allowed = new Set();
          letters.filter(l => l.order <= upTo).forEach(l => {
            allowed.add(l.letter);
            if (l.finalForm) allowed.add(l.finalForm);
          });
          const used = new Set();
          for (const m of src.matchAll(/<span class="he[^"]*"[^>]*>([\s\S]*?)<\/span>/g)) {
            for (const ch of m[1].replace(/<[^>]*>/g, '')) {
              if (/[\u05D0-\u05EA]/.test(ch)) used.add(ch);
            }
          }
          const over = [...used].filter(c => !allowed.has(c));
          if (over.length) {
            fail('V10', f,
              `mostra letras ainda não ensinadas na revisão até a ordem ${upTo}: ${over.map(c => JSON.stringify(c)).join(', ')}`);
          }
        }
      }
    }
  }

  return { fails: fails.slice(), warns: warns.slice() };
}

/* The bidi contract, checked against the built HTML.

   V8 - every Hebrew codepoint sits inside an element whose class list contains
        the bare token `he` (the leaf Hebrew holder). Containers like .he-list
        and .he-cloze do not count: their Hebrew lives in .he children.
   V9 - no bidi-neutral punctuation inside such a leaf span.

   Spans nest (.he-list > .he, .he > b.he-mark), so this walks the tag stream
   and matches closings by depth rather than regexing for the nearest </span>. */
function checkBidi(src, file) {
  const HEB = /[֐-׿יִ-ﭏ]/;
  const NEUTRAL = /[()\[\]{}:;/,<>«»|]/;

  /* Regions that hold no rendered body text. */
  const blanked = src
    .replace(/<!--[\s\S]*?-->/g, m => ' '.repeat(m.length))
    .replace(/<style[\s\S]*?<\/style>/g, m => ' '.repeat(m.length))
    .replace(/<script[\s\S]*?<\/script>/g, m => ' '.repeat(m.length));

  /* Every leaf `he` span, with depth-matched closing tags. */
  const tagRe = /<(\/?)span\b([^>]*)>/g;
  const stack = [];
  const leaves = [];
  let t;
  while ((t = tagRe.exec(blanked))) {
    if (t[1] !== '/') {
      const cm = /class="([^"]*)"/.exec(t[2]);
      const isLeaf = !!cm && cm[1].split(/\s+/).includes('he');
      stack.push({ isLeaf, start: t.index, innerStart: t.index + t[0].length });
    } else {
      const open = stack.pop();
      if (open && open.isLeaf) {
        leaves.push({ start: open.start, end: tagRe.lastIndex, innerStart: open.innerStart, innerEnd: t.index });
      }
    }
  }

  /* V9 - punctuation inside a leaf span (nested <b class="he-mark"> stripped). */
  for (const lf of leaves) {
    const inner = blanked.slice(lf.innerStart, lf.innerEnd).replace(/<[^>]*>/g, '');
    if (NEUTRAL.test(inner)) {
      fail('V9', file, `pontuacao dentro de um span .he: ${JSON.stringify(inner.slice(0, 40))}`);
    }
  }

  /* V8 - blank every leaf span; anything Hebrew still standing is a violation. */
  const arr = blanked.split('');
  for (const lf of leaves) for (let i = lf.start; i < lf.end; i++) arr[i] = ' ';
  let rest = arr.join('');

  /* <title> and <meta content> cannot carry a direction span at all, so Hebrew
     must simply not be put there. Reported with its own message. */
  const headRe = /<title>([\s\S]*?)<\/title>|<meta[^>]*content="([^"]*)"/g;
  let h;
  while ((h = headRe.exec(rest))) {
    const text = h[1] || h[2] || '';
    if (HEB.test(text)) {
      fail('V8', file, `Hebraico em <title>/<meta>, que nao aceita span de direcao: ${JSON.stringify(text.slice(0, 50))}`);
    }
  }
  rest = rest.replace(headRe, m => ' '.repeat(m.length));

  rest.split('\n').forEach((l, i) => {
    if (HEB.test(l)) {
      const found = l.match(/[֐-׿]+/g) || [];
      fail('V8', `${file}:${i + 1}`,
        `Hebraico fora de um span .he: ${found.slice(0, 3).map(s => JSON.stringify(s)).join(', ')}`);
    }
  });
}

export function report({ fails, warns }) {
  for (const w of warns) console.log(`  ! ${w.rule}  ${w.where} - ${w.detail}`);
  for (const f of fails) console.log(`  ✗ ${f.rule}  ${f.where} - ${f.detail}`);
  if (fails.length) console.log(`\n  ${fails.length} violação(ões), ${warns.length} aviso(s)`);
  else console.log(`  ✓ validate: 0 violações, ${warns.length} aviso(s)`);
  return fails.length === 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = validate({ checkDist: true });
  process.exit(report(r) ? 0 : 1);
}
