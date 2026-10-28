/* A auditoria de 01/10/2026 (audit/2026-10-01), na parte do curso: cada achado
 * consertado nesta rodada tem aqui a prova que faltava. Os ids (CONT-xxx,
 * UXQA-xxx, VIS-xxx, CONV-xxx) são os das fichas. */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { allLetters, course } from '@/lib/content';
import {
  assinatura, buildLessonQuiz, buildLetterPractice, buildMiniTest, contextFor
} from '@/lib/engine/exercises';
import { exLetterPosition, exMatchLetterSound } from '@/lib/engine/generators';
import { chavesDe, deLetras, montarBaralho, perguntasDe } from '@/lib/engine/deck';
import { buildExam, examReport } from '@/lib/engine/exam';
import { rng } from '@/lib/engine/rng';
import { typedIsCorrect } from '@/lib/engine/types';
import type { Exercise } from '@/lib/engine/types';
import { partesDaProse } from '@/lib/prose';
import { fonemasDe, SOM_PT, somEmComum, somPt } from '@/lib/som-pt';
import { soOLadoDoPonto } from '@/lib/sons';
import {
  acertosPara, FIXACAO_ITENS, LIBERA_MARK, MASTERY_MARK, REGRA_DO_DOMINIO, REGRA_DO_DOMINIO_CURTA
} from '@/lib/state/rules';
import { resumoDasLicoes } from '@/lib/resumo-licoes';
import { ACERTO_DO_TRACO, scoreTrace } from '@/lib/trace-score';
import { clusters } from '@/lib/hebrew';

const raiz = join(__dirname, '..', '..');
const fonte = (p: string) => readFileSync(join(__dirname, '../src', p), 'utf8');
const dado = (p: string) => readFileSync(join(raiz, 'data', p), 'utf8');

const letters = allLetters();
const historico = (order: number) => letters.filter(l => l.order <= order);

/* Todo exercício que uma letra pode gerar numa lição: prática, quiz e fixação,
   com a letra como a LIÇÃO a mostra (soOLadoDoPonto). */
function exerciciosDaLicao(seeds = 4): Exercise[] {
  const out: Exercise[] = [];
  for (const raw of letters) {
    const L = soOLadoDoPonto(raw);
    const h = historico(raw.order);
    for (let s = 0; s < seeds; s++) {
      out.push(...buildLetterPractice(L, h, { audioAvailable: true, seed: `a-${s}` }));
      out.push(...buildMiniTest(L, h, { audioAvailable: true, seed: `m-${s}` }));
      out.push(...buildLessonQuiz(L, h, { audioAvailable: true, count: 13, seed: `q-${s}` }));
    }
  }
  return out;
}

describe('CONT-002: dica e explicação nunca mostram {{ }} cru', () => {
  it('o player e as dicas passam o texto por <Prose>', () => {
    const a = fonte('components/learn/Answers.tsx');
    const p = fonte('components/learn/ExercisePlayer.tsx');
    expect(a).toContain('<Prose text={h} />');
    expect(p).toContain('<Prose text={settled.why} />');
    expect(p).toContain('<Prose text={ex.explainPt} />');
    expect(p).not.toMatch(/>\{ex\.explainPt\}</);
    expect(p).not.toMatch(/>\{settled\.why\}</);
  });

  it('nenhuma dica, porquê ou explicação renderizada contém "{{"', () => {
    const textos = new Set<string>();
    for (const ex of exerciciosDaLicao(2)) {
      for (const h of ex.hintsPt ?? []) textos.add(h);
      for (const w of (ex as { whyPt?: (string | null)[] }).whyPt ?? []) if (w) textos.add(w);
      if (ex.explainPt) textos.add(ex.explainPt);
    }
    expect(textos.size).toBeGreaterThan(100);
    const comChave = [...textos].filter(t => t.includes('{{'));
    expect(comChave.length, 'o dado usa a marcação, então o teste mede algo').toBeGreaterThan(0);
    for (const t of textos) {
      /* O que <Prose> põe na tela: o português como texto, o hebraico no <He>. */
      for (const p of partesDaProse(t)) {
        expect(p.texto, t).not.toContain('{{');
        expect(p.texto, t).not.toContain('}}');
      }
    }
  });
});

describe('CONT-001: "Ligue cada letra ao seu som" nunca tem duas cartas com o mesmo som', () => {
  it('1000 sementes, todas as letras, como a lição mostra e como o dado é', () => {
    let gerados = 0;
    for (const raw of letters) {
      for (const L of [raw, soOLadoDoPonto(raw)]) {
        const h = historico(raw.order);
        const ctx = contextFor(L, h);
        for (let s = 0; s < 1000; s++) {
          const ex = exMatchLetterSound(L, ctx, rng(`mls-${raw.id}-${s}`), s);
          if (!ex || ex.kind !== 'match') continue;
          gerados++;
          const direita = ex.pairs.map(p => p.right);
          expect(new Set(direita).size, `${raw.id}#${s}: ${direita.join(' | ')}`).toBe(direita.length);
          /* E nem som parcial em comum (Kaf "k ou raspado" ao lado de Kuf "k"). */
          const sons = ex.pairs.map(p => letters.find(x => x.letter === p.left.replace('\u05BC', ''))!)
            .map(x => (x.id === L.id ? L.sound : x.sound));
          for (let i = 0; i < sons.length; i++) {
            for (let j = i + 1; j < sons.length; j++) {
              expect(somEmComum(sons[i]!, sons[j]!), `${raw.id}#${s}: ${sons[i]} / ${sons[j]}`).toBe(false);
            }
          }
          expect(ex.pairs.some(p => p.left === (L.letraComPonto ?? L.letter))).toBe(true);
        }
      }
    }
    expect(gerados).toBeGreaterThan(10000);
  });
});

describe('CONT-003: o som da letra em português, não em IPA', () => {
  it('todo som do curso tem rótulo legível, sem as barras do IPA', () => {
    for (const L of letters) {
      for (const parte of [L.sound, soOLadoDoPonto(L).sound]) {
        const r = somPt(parte);
        expect(r, `${L.id}: ${parte}`).not.toMatch(/\//);
        expect(r).not.toMatch(/[ʁχʃɡ]/);
      }
    }
    expect(somPt('/j/')).toBe('i, como em "iate"');
    expect(Object.keys(SOM_PT).length).toBeGreaterThanOrEqual(21);
  });

  it('o cabeçalho da lição e o exercício de ligar usam o rótulo', () => {
    expect(fonte('components/learn/Blocks.tsx')).toContain('{somPt(letter.sound)}');
    expect(fonte('lib/engine/generators.ts')).toContain('right: somPt(x.sound)');
  });

  it('mudo é um som só, para Álef e Áyin', () => {
    expect(fonemasDe('(mudo)')).toEqual(['mudo']);
    expect(fonemasDe('(mudo para a maioria)')).toEqual(['mudo']);
    expect(fonemasDe('/b/ ou /v/')).toEqual(['/b/', '/v/']);
  });
});

describe('CONT-005: o Teste da Academia nunca tem duas respostas certas', () => {
  it('nenhum distrator diz o mesmo que a certa, nos dois sentidos', () => {
    const fontes = deLetras(letters, ['nome', 'som', 'silaba', 'palavra']);
    const porTexto = (q: { sentido: 'he' | 'pt'; tipo: string }, v: string) =>
      fontes.filter(f => f.tipo === q.tipo && (q.sentido === 'he' ? f.pt === v : f.he === v));
    let perguntas = 0;
    for (let s = 0; s < 150; s++) {
      const baralho = montarBaralho(fontes, { quantos: 40, semente: `t-${s}` });
      /* O baralho em si não tem dois pares com a mesma resposta. */
      const chaves = baralho.flatMap(p => chavesDe(p).map(k => `${p.tipo}:${k}`));
      expect(new Set(chaves).size).toBe(chaves.length);
      for (const sentido of ['pt', 'he', 'misto'] as const) {
        for (const q of perguntasDe(baralho, fontes, { semente: `t-${s}-${sentido}`, sentido })) {
          perguntas++;
          const certa = baralho.find(p => q.id.startsWith(`${p.id}:`))!;
          const daCerta = new Set(chavesDe(certa));
          q.opcoes.forEach((o, i) => {
            if (i === q.resposta) return;
            for (const f of porTexto(q, o)) {
              if (f.letterId === certa.letterId) continue;
              expect(chavesDe(f).some(k => daCerta.has(k)),
                `${q.enunciadoPt} ${q.alvo}: ${q.opcoes.join(' | ')}`).toBe(false);
            }
          });
        }
      }
    }
    expect(perguntas).toBeGreaterThan(5000);
  });
});

describe('CONT-006: "Onde está a letra?" só com a letra uma vez na palavra', () => {
  it('em toda letra e rodada, a letra (base ou final) aparece uma vez só', () => {
    let n = 0;
    for (const L of letters) {
      const ctx = contextFor(L, historico(L.order));
      for (let i = 0; i < 40; i++) {
        const ex = exLetterPosition(L, ctx, rng(`pos-${L.id}-${i}`), i);
        if (!ex) continue;
        n++;
        const vezes = clusters((ex as { he?: string }).he!).filter(c => c[0] === L.letter || (!!L.finalForm && c[0] === L.finalForm)).length;
        expect(vezes, `${L.id}: ${(ex as { he?: string }).he}`).toBe(1);
      }
    }
    expect(n).toBeGreaterThan(100);
  });
});

describe('CONT-004: Dt 6:9 no Shemá segue o texto massorético', () => {
  it('מְזֻזֹת (qubuts, sem vav), em NFC; a grafia com vav é a de Dt 11:20', () => {
    const b = dado('bonus.json');
    expect(b).toContain('עַל־מְזֻזֹת בֵּיתֶךָ'.normalize('NFC'));
    expect(b).not.toContain('מְזוּזֹת');
    const a = JSON.parse(dado('audio.json')) as { clips: { he: string; file: string }[] };
    const clipe = a.clips.find(c => c.he.includes('מְזֻזֹת'.normalize('NFC')));
    expect(clipe?.file).toBe('he-05cb039a.mp3');
  });
});

describe('UXQA-005 / CONT-007: concluída e dominada, com os números das constantes', () => {
  it('a regra sai das constantes reais', () => {
    expect(MASTERY_MARK).toBe(0.75);
    expect(LIBERA_MARK).toBe(0.8);
    expect(FIXACAO_ITENS).toBe(20);
    expect(acertosPara(MASTERY_MARK)).toBe(15);
    expect(acertosPara(LIBERA_MARK)).toBe(16);
    expect(REGRA_DO_DOMINIO_CURTA).toBe('15 de 20');
    expect(REGRA_DO_DOMINIO).toContain('15 de 20');
  });

  it('nenhuma tela escreve "6 de 8", "de 11" ou "Você já domina" à mão', () => {
    for (const f of ['app/loja/LojaClient.tsx', 'app/concluido/CompletionClient.tsx',
      'app/checkpoint/[n]/CheckpointClient.tsx', 'app/certificado/CertificadoClient.tsx']) {
      const s = fonte(f);
      expect(s, f).not.toContain('6 de 8');
      expect(s, f).not.toMatch(/de 11[`'"]/);
      expect(s, f).not.toContain('Você já domina');
    }
    const c = fonte('app/concluido/CompletionClient.tsx');
    expect(c).toContain('fmt(tx.conquistasDe, { n: conquistas.size, total: ACHIEVEMENTS.length })');
    expect(fonte('i18n/telas/painel-completion-client.tsx')).toContain("conquistasDe: '{n} de {total}'");
    expect(c).toContain('isLessonMastered(p.state, l.id)');
    /* Desde 12/10/2026 a regra antiga se chama "lição concluída" (REGRA_DA_CONCLUSAO);
       "dominada" é o domínio por habilidade (lib/dominio.ts). */
    expect(fonte('app/certificado/CertificadoClient.tsx'))
      .toContain('fmt(tx.requisitoLicoesDetalhe, { n: gate.lettersDone, total: course.totalLetters })} ${REGRA_DA_CONCLUSAO}');
    expect(fonte('i18n/telas/painel-certificado-client.tsx')).toContain("requisitoLicoesDetalhe: '{n} de {total} concluídas.'");
    expect(fonte('app/checkpoint/[n]/CheckpointClient.tsx')).toContain('isLessonMastered(p.state, l.id)');
  });
});

describe('UXQA-015: /concluido não afirma o que não aconteceu', () => {
  it('"Você está lendo hebraico" e a lista de competências só com o alfabeto dominado', () => {
    const c = fonte('app/concluido/CompletionClient.tsx');
    const dic = fonte('i18n/telas/painel-completion-client.tsx');
    expect(c).toMatch(/alfabetoDominado\s*\?\s*tx\.estaLendo/);
    expect(dic).toContain("estaLendo: 'Você está lendo hebraico.'");
    expect(c).toContain('alfabetoDominado');
    expect(c).toContain('{alfabetoDominado && (');
    expect(c).toContain('tx.faltam(faltam.length)');
    expect(dic).toContain('`Faltam ${n} ');
  });
});

describe('VIS-004: o painel e a revisão contam a mesma fila, e dizem "itens"', () => {
  it('a revisão aceita as letras que têm item na fila', () => {
    expect(fonte('app/revisao/ReviewClient.tsx')).toContain('Object.values(p.state.srs).some(i => i.letterId === l.id)');
    const painel = fonte('components/platform/Painel.tsx') + fonte('i18n/telas/conta-painel.ts');
    expect(painel).toContain('itens precisam de uma revisão rápida');
    expect(painel).not.toContain('letras precisam de uma revisão rápida');
  });
});

describe('UXQA-002: abaixo de 80% nada aponta para letra trancada', () => {
  it('a lição troca o botão principal, e o painel aponta "Terminar"', () => {
    const l = fonte('app/licao/[letterId]/LessonClient.tsx');
    /* O texto mora no dicionário da tela (i18n); a tela passa o número. */
    expect(l).toContain('tx.refazerPrecisa(Math.round(LIBERA_MARK * 100))');
    expect(fonte('i18n/telas/licao-lesson-client.tsx')).toContain('Refazer os exercícios (precisa de ${libera}%)');
    expect(l).toContain('const proximaTrancada = !!seguinte && !letraLiberada(p.state, ordemToda, seguinte);');
    const d = fonte('app/meu-hebraico/DashboardClient.tsx');
    expect(d).toContain('cta={fmt(tx.terminarCta, { nome: terminar.nome })}');
    expect(fonte('i18n/telas/painel-dashboard-client.tsx')).toContain("terminarCta: 'Terminar {nome}'");
    expect(d).toContain('porQueTrancada(p.state, ordem, id)');
  });
});

describe('CONV-020: no primeiro acesso, a Aula 0 é o botão principal', () => {
  it('enquanto a Aula 0 não foi aberta e nenhuma lição começou', () => {
    const d = fonte('app/meu-hebraico/DashboardClient.tsx');
    expect(d).toContain('const aula0Primeiro = !aula0Feita(p.state);');
    expect(d).toContain('cta={tx.aula0Cta}');
    expect(fonte('i18n/telas/painel-dashboard-client.tsx')).toContain("aula0Cta: 'Começar pela Aula 0'");
    expect(fonte('app/inicio/StartHereClient.tsx')).toContain("progresso.markFirst('aula-0')");
  });
});

describe('VIS-005, VIS-008, VIS-013: teclado e leitor de tela', () => {
  it('o ligar da lição tem aria-pressed, mantém o foco e anuncia cada par', () => {
    const a = fonte('components/learn/Answers.tsx');
    /* Os anúncios moram no dicionário da tela (i18n). */
    const anuncios = fonte('i18n/telas/licao-answers.tsx');
    expect(a).toContain('aria-pressed={isPicked}');
    expect(a).toContain('aria-disabled={settled || isMatched}');
    expect(a).not.toMatch(/\sdisabled=\{settled \|\| isMatched\}/);
    expect(a).toContain('<p role="status" aria-live="polite" className="sr-only">{anuncio}</p>');
    expect(a).toContain('setAnuncio(tx.parCerto(');
    expect(a).toContain('setAnuncio(tx.naoCombinam(');
    expect(anuncios).toContain('Par certo: ');
    expect(anuncios).toContain('Não combinam: ');
  });

  it('perguntas da etapa 1, jogos e dicas não jogam o foco no <body>', () => {
    const c = fonte('components/learn/Compreensao.tsx');
    expect(c).not.toMatch(/\sdisabled=\{feita/);
    expect(c).toContain('aria-disabled={feita}');
    for (const j of ['Batalha', 'ImpressaCursiva', 'Blast']) {
      const s = fonte(`components/game/${j}.tsx`);
      expect(s, j).toContain('useFocoDaRodada(i)');
      expect(s, j).toContain('foco.segurar()');
      expect(s, j).toContain('ref={foco.ref} tabIndex={-1}');
    }
    expect(fonte('components/learn/Answers.tsx')).toContain('ultimaRef.current?.focus(');
  });

  it('o Teste aceita 1-4 no teclado', () => {
    const t = fonte('components/game/TestRun.tsx');
    expect(t).toContain("window.addEventListener('keydown', onKey)");
    expect(t).toContain('setEscolha(n - 1)');
  });
});

describe('VIS-009 e UXQA-012: a Academia', () => {
  it('os jogos sem material dizem quando abrem, e o vazio tem título', () => {
    const a = fonte('app/academia/AcademiaClient.tsx');
    /* Os textos moram no dicionário da tela (i18n), lidos como tx.chave. */
    const d = fonte('i18n/telas/academia-academia-client.tsx');
    expect(a).toContain('fmt(tx.abreCom, { n: info.minimo })');
    expect(d).toContain("abreCom: 'Abre com {n} letras'");
    expect(a).toContain('disabled={!!fechados[jogo]}');
    expect(a).toContain('<h1 className="text-[23px] font-bold">{tx.semMaterialTitulo}</h1>');
    expect(d).toContain("semMaterialTitulo: 'Ainda não há material suficiente'");
  });

  it('o teclado da tela vem primeiro; o guia do sistema fica recolhido', () => {
    const a = fonte('app/academia/AcademiaClient.tsx');
    const d = fonte('i18n/telas/academia-academia-client.tsx');
    expect(d).toContain("usarTecladoTela: 'Usar o teclado da tela'");
    const tela = a.indexOf('{tx.usarTecladoTela}');
    const guia = a.indexOf('<GuiaTeclado');
    expect(tela).toBeGreaterThan(0);
    expect(guia).toBeGreaterThan(tela);
    expect(a).toContain('<details');
    expect(a).not.toContain('Este é o único exercício do curso que pede o teclado hebraico');
    expect(d).not.toContain('Este é o único exercício do curso que pede o teclado hebraico');
  });
});

describe('CONT-010: o exame cobra só o que o aluno estudou', () => {
  it('sem o módulo 6, sem "Sem os pontos"; sem o 7 (sem extras), sem o gerech', () => {
    const exame = buildExam(letters, [], { audioAvailable: false, attempt: 1, semPontos: false });
    const ids = exame.sections.map(s => s.part.id);
    expect(ids).not.toContain('sempontos');
    expect(ids).not.toContain('gerech');
    const completo = buildExam(letters, [], { audioAvailable: false, attempt: 1 });
    expect(completo.sections.map(s => s.part.id)).toContain('sempontos');
  });

  it('a faixa máxima não promete "palavras que não viu antes"', () => {
    const r = examReport([{ partId: 'letras', correct: 10, total: 10 }]);
    expect(r.bandPt.bodyPt).not.toContain('não viu antes');
    expect(fonte('lib/engine/exam.ts')).not.toContain('não viu antes');
    expect(fonte('i18n/telas/motor-exam.ts')).not.toContain('não viu antes');
  });
});

describe('UXQA-008: o nome é pedido uma vez', () => {
  it('onboarding, certificado e Meu nome reaproveitam o nome da conta', () => {
    /* A tela e o seu dicionário (app/src/i18n/telas/). */
    const o = fonte('app/onboarding/page.tsx') + fonte('i18n/telas/painel-onboarding.ts');
    expect(o).not.toContain('Fica só no seu navegador');
    expect(o).toContain('Fica na sua conta');
    expect(o).toContain('primeiroNome(nomeDaConta)');
    const c = fonte('app/certificado/CertificadoClient.tsx');
    expect(c).toContain('p.state.onboarding?.name?.trim() || nomeDaConta');
    expect(c).toContain('disabled={busy || semNome}');
    expect(fonte('app/meu-nome/MeuNomeClient.tsx')).toContain('nomeDoAluno(p.state.onboarding?.name, nomeDaConta)');
  });
});

describe('CONT-008: a página do módulo conta as lições dos dados', () => {
  it('sem "três lições" fixo', () => {
    expect(fonte('app/modulo/[n]/ModuleClient.tsx')).not.toContain('As três lições');
    const m5 = course.modules.find(m => m.n === 5)!;
    expect(resumoDasLicoes(m5.lessons)).toBe('Este módulo tem sete lições: três de letra nova e quatro de som.');
    const m1 = course.modules.find(m => m.n === 1)!;
    expect(resumoDasLicoes(m1.lessons)).toBe('Este módulo tem três lições: duas de letra nova e uma de prática, sem letra nova.');
    expect(dado('modules.json')).not.toContain('7 unidades de tres licoes cada');
  });
});

describe('CONT-011: uma grafia só', () => {
  it('nikud, daguesh e shalom nos dados e no curso', () => {
    const arquivos = ['letters.json', 'nikud.json', 'bonus.json', 'textos.json', 'sentences.json', 'extras.json', 'modules.json'];
    for (const f of arquivos) {
      const s = dado(f);
      expect(s, f).not.toMatch(/\bniqqud\b/i);
      /* Desde 06/10/2026 toda palavra de duas sílabas leva o acento tônico:
         "shalóm". "shalom" sem acento só como id ("shalom-ma-shlomcha"). */
      expect(s.replace(/"id": "shalom-[a-z-]+"/g, ''), f).not.toMatch(/(?<![A-Za-zÀ-ÿ])shalom(?![A-Za-zÀ-ÿ])/);
      /* "dagesh" só como chave ou id do JSON, nunca como texto. */
      expect(s.replace(/"dagesh":/g, '').replace(/"id": "dagesh"/g, ''), f).not.toMatch(/\bdagesh\b/);
    }
    /* As âncoras das partes (o-niqqud...) ficam como estão: são endereço. */
    const aula0 = (fonte('app/inicio/StartHereClient.tsx')
      + fonte('i18n/telas/painel-start-here-client.tsx')
      + fonte('i18n/telas/painel-start-here-perguntas.ts')
      + fonte('i18n/telas/painel-aula0-passos.ts'))
      .replace(/(['"])(o-niqqud|checagem-niqqud[-a-z]*)\1/g, '')
      .replace(/PERGUNTAS_NIQQUD/g, '');
    expect(aula0).not.toMatch(/niqqud/i);
  });
});

describe('CONT-012: grafias plausíveis da resposta digitada', () => {
  it('aceita ge/gi, geshem, todah, lehem', () => {
    expect(typedIsCorrect('ge', ['gue'])).toBe(true);
    expect(typedIsCorrect('gi', ['gui'])).toBe(true);
    expect(typedIsCorrect('geshem', ['guéshem'])).toBe(true);
    expect(typedIsCorrect('todah', ['todá'])).toBe(true);
    expect(typedIsCorrect('lehem', ['léchem'])).toBe(true);
    expect(typedIsCorrect('imah', ['imá'])).toBe(true);
    /* A convenção de 06/10/2026 (acento em toda palavra de 2+ sílabas, "ss"
       entre vogais) não cobra nada de quem digita: sem acento e com um s só
       continua certo. */
    expect(typedIsCorrect('shalom', ['shalóm'])).toBe(true);
    expect(typedIsCorrect('kise', ['kissé'])).toBe(true);
    expect(typedIsCorrect('osa', ['ossá'])).toBe(true);
    expect(typedIsCorrect('messiba', ['messibá'])).toBe(true);
  });

  it('e continua recusando o que é outro som', () => {
    expect(typedIsCorrect('chalom', ['shalom'])).toBe(false);
    expect(typedIsCorrect('salom', ['shalom'])).toBe(false);
    /* O h do curso (ה) escrito ch: ler ה como ח continua errado. */
    expect(typedIsCorrect('achava', ['ahavá'])).toBe(false);
    expect(typedIsCorrect('ga', ['gue'])).toBe(false);
  });
});

describe('CONT-015: dicas sem letra que ainda não foi ensinada', () => {
  it('as consoantes citadas no soundNotePt já foram ensinadas (ou são a própria letra)', () => {
    const base = (g: string) => g.normalize('NFD').replace(/[֑-ׇ]/g, '');
    for (const L of letters) {
      const vistas = new Set(historico(L.order).flatMap(x => [x.letter, x.finalForm ?? '']).filter(Boolean));
      for (const m of L.soundNotePt.matchAll(/\{\{([^}]*)\}\}/g)) {
        for (const ch of base(m[1]!).replace(/\s/g, '')) {
          expect(vistas.has(ch), `${L.id}: ${m[1]}`).toBe(true);
        }
        /* O ponto do Sin e o daguesh de outra letra também são "letra futura". */
        if (m[1]!.includes('ׂ')) expect(L.id, `${L.id}: ${m[1]}`).not.toBe('shin');
      }
    }
  });
});

describe('CONT-017: a assinatura vê o hebraico da pergunta', () => {
  it('duas sílabas diferentes com o mesmo enunciado não são "repetidas"', () => {
    const a = { id: 'a', kind: 'vowel-sound', letterId: 'mem', skill: 'ler', promptPt: 'Que vogal está escrita aqui?', he: 'מַ', options: ['a', 'e'], answer: 0, explainPt: '' } as unknown as Exercise;
    const b = { ...a, id: 'b', he: 'מֵ' } as unknown as Exercise;
    expect(assinatura(a)).not.toBe(assinatura(b));
  });
});

describe('CONT-018: o dado-fonte em NFC', () => {
  it('todo hebraico de letters.json está em NFC', () => {
    const d = dado('letters.json');
    for (const m of d.matchAll(/[֐-׿]+/g)) expect(m[0].normalize('NFC'), m[0]).toBe(m[0]);
  });
});

describe('CONT-014: meia letra não é "Muito bem"', () => {
  it('cobertura abaixo de 0,7 é "try", e a nota fica abaixo do acerto', () => {
    const W = 40, H = 40;
    const alpha = new Uint8ClampedArray(W * H);
    for (let y = 4; y < 36; y++) for (let x = 18; x < 22; x++) alpha[y * W + x] = 255;
    /* Metade de cima da barra, toda dentro do modelo. */
    const meia = Array.from({ length: 30 }, (_, i) => ({ x: 20, y: 4 + i * 0.5 }));
    const v = scoreTrace({ alpha, w: W, h: H, points: meia, near: 3 });
    expect(v.dentro).toBe(1);
    expect(v.cobertura).toBeLessThan(0.7);
    expect(v.tone).toBe('try');
    expect(v.score).toBeLessThan(ACERTO_DO_TRACO);
    const inteira = Array.from({ length: 64 }, (_, i) => ({ x: 20, y: 4 + i * 0.5 }));
    const w = scoreTrace({ alpha, w: W, h: H, points: inteira, near: 3 });
    expect(w.tone).toBe('good');
    expect(w.score).toBeGreaterThanOrEqual(ACERTO_DO_TRACO);
  });

  it('a vitrine promete a ordem MOSTRADA, não medida', () => {
    expect(dado('courses.json')).not.toContain('na ordem certa dos traços');
    expect(dado('courses.json')).toContain('com a ordem dos traços mostrada');
  });
});
