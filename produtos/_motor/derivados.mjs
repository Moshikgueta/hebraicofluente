// O que sai do conteúdo além do PDF: o manifesto de gravação e o documento
// de revisão do hebraico. Os dois são GERADOS: editar à mão é perder no
// próximo `npm run pdf`.

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { RAIZ_REPO } from './dados.mjs';

const n3 = n => String(n).padStart(3, '0');
const slugTr = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export async function gerarDerivados(produto) {
  await mkdir(path.join(produto.dir, 'audio'), { recursive: true });
  await writeFile(path.join(produto.dir, 'audio/manifesto.json'), JSON.stringify(manifesto(produto), null, 2) + '\n');
  await writeFile(path.join(produto.dir, 'REVISAO.md'), await revisao(produto));
}

// ── manifesto de gravação ──────────────────────────────────────────────
// Um id por arquivo. O id É o caminho dentro de audio/, sem extensão:
// itens/shalom -> audio/itens/shalom.mp3. Variante, exemplo e fala de
// diálogo ganham sufixo, para que cada coisa dita no guia tenha a sua faixa.
function manifesto(produto) {
  const { itens, dialogos, capitulos } = produto;
  const faixa = (id, extra) => {
    const arquivo = `${id}.mp3`;
    return { id, arquivo, gravado: existsSync(path.join(produto.dir, 'audio', arquivo)), ...extra };
  };
  const faixas = [];
  for (const it of itens) {
    const cap = capitulos.find(c => c.id === it.categoria).n;
    const tipo = /[\s…?!]/.test(it.he.trim().replace(/[?!…]$/, '')) ? 'expressao' : 'palavra';
    faixas.push(faixa(it.audio, { tipo, capitulo: cap, item: it.n, he: it.nikud, tr: it.tr, pt: it.pt }));
    (it.variantes ?? []).forEach((v, k) => faixas.push(faixa(`${it.audio}--variante-${k + 1}`, { tipo: 'variante', capitulo: cap, item: it.n, quando: v.quando, he: v.nikud, tr: v.tr })));
    if (it.exemplo) faixas.push(faixa(`${it.audio}--exemplo`, { tipo: 'exemplo', capitulo: cap, item: it.n, he: it.exemplo.nikud, tr: it.exemplo.tr, pt: it.exemplo.pt }));
  }
  for (const c of capitulos) for (const q of c.quadros ?? []) for (const w of [...(q.palavras ?? []), ...(q.numeros ?? [])]) {
    faixas.push(faixa(`quadros/cap${String(c.n).padStart(2, '0')}-${slugTr(w.tr)}`, { tipo: 'quadro', capitulo: c.n, he: w.nikud, tr: w.tr, pt: w.pt }));
  }
  const capDialogos = capitulos.find(c => c.id === 'dialogos').n;
  for (const d of dialogos) {
    faixas.push(faixa(d.audio, { tipo: 'dialogo', capitulo: capDialogos, dialogo: d.id, titulo: d.titulo, falas: d.falas.length, nota: 'O diálogo inteiro, com as duas vozes.' }));
    d.falas.forEach((f, k) => faixas.push(faixa(`${d.audio}-${String(k + 1).padStart(2, '0')}`, { tipo: 'fala', capitulo: capDialogos, dialogo: d.id, quem: d.pessoas[f.quem], he: f.nikud, tr: f.tr, pt: f.pt })));
  }
  const secoes = capitulos.map(c => ({
    capitulo: c.n, titulo: c.titulo,
    pagina: produto.meta.audio.base ? `${produto.meta.audio.base}/capitulo-${String(c.n).padStart(2, '0')}` : null,
    faixas: faixas.filter(f => f.capitulo === c.n).map(f => f.id)
  })).filter(s => s.faixas.length);
  return {
    _nota: [
      'GERADO por produtos/_motor/derivados.mjs a partir do conteúdo. Não editar à mão.',
      'Grave cada faixa e salve em audio/<arquivo>. Ao rodar o gerador de novo, `gravado` vira true.',
      'As páginas de áudio por capítulo (secoes[].pagina) só existem quando produto.json tiver audio.base.',
      'Nenhum QR é gerado enquanto audio.status não for "disponivel".'
    ],
    produto: produto.slug,
    status: produto.meta.audio.status,
    total: faixas.length,
    gravadas: faixas.filter(f => f.gravado).length,
    secoes,
    faixas
  };
}

// ── documento de revisão ───────────────────────────────────────────────
async function revisao(produto) {
  const curso = await hebraicoDoCurso();
  const origem = nikud => {
    const k = chave(nikud);
    if (curso.aprovado.has(k)) return 'igual ao curso de alfabetização';
    if (curso.a1.has(k)) return 'igual ao rascunho do A1';
    return 'novo';
  };
  const { itens, capitulos, dialogos } = produto;
  const L = [];
  L.push(`# ${produto.meta.titulo}: revisão do hebraico e do português`, '');
  L.push('Gerado por `npm run pdf` (em produtos/) a partir do conteúdo. Não edite à mão: corrija nos JSON e gere de novo.', '');
  L.push('Como revisar: marque o que mudar, ou escreva a correção ao lado, e me mande. Um item aprovado vira `"revisao": "aprovado"` em conteudo/vocabulario.json. Quando tudo estiver aprovado, `produto.json` > `revisao` passa a `aprovado` e a faixa RASCUNHO sai do PDF.', '');
  const novos = itens.filter(i => origem(i.nikud) === 'novo').length;
  L.push(`**Situação:** ${itens.filter(i => i.revisao === 'aprovado').length} de ${itens.length} itens aprovados. ${itens.length - novos} aparecem iguais, com as mesmas vogais, no curso de alfabetização ou no rascunho do A1; ${novos} são hebraico novo, escrito para este guia. Todos precisam da sua aprovação: a coincidência só diz onde já existe um precedente.`, '');

  L.push('## Decisões que são suas', '');
  for (const d of DECISOES) L.push(`- ${d}`);
  L.push('', '## Fatos a conferir', '');
  for (const f of FATOS) L.push(`- ${f}`);

  for (const c of capitulos) {
    const doCap = itens.filter(i => i.categoria === c.id);
    const quadrosHe = (c.quadros ?? []).flatMap(q => [...(q.palavras ?? []), ...(q.numeros ?? [])]);
    const inlineHe = [...JSON.stringify({ q: c.quadros, s: c.secoes, a: c.abertura }).matchAll(/\{\{(.+?)\}\}/g)].map(m => m[1]);
    L.push('', `## ${c.n}. ${c.titulo}`, '');
    L.push(`Palavra da abertura: ${c.simbolo.nikud} · ${c.simbolo.tr} · ${c.simbolo.pt} (${origem(c.simbolo.nikud)})`, '');
    for (const it of doCap) {
      L.push(`**${n3(it.n)}. ${it.nikud}** · ${it.tr} · ${it.pt}  `);
      L.push(`sem vogais: ${it.he} · ${origem(it.nikud)} · ${it.revisao}  `);
      for (const v of it.variantes ?? []) L.push(`${v.quando}: ${v.nikud} · ${v.tr}  `);
      if (it.exemplo) L.push(`exemplo: ${it.exemplo.nikud} · ${it.exemplo.tr} · ${it.exemplo.pt}  `);
      L.push(`contexto: ${it.contexto}${it.nota ? `  \nnota: ${it.nota}` : ''}`, '');
    }
    if (quadrosHe.length || inlineHe.length) {
      L.push('Hebraico dos quadros e do texto:', '');
      for (const w of quadrosHe) L.push(`- ${w.nikud} · ${w.tr} · ${w.pt} (${origem(w.nikud)})`);
      for (const h of inlineHe) L.push(`- ${h} (${origem(h)})`);
    }
  }
  L.push('', '## Diálogos', '');
  for (const d of dialogos) {
    L.push(`### ${d.titulo}`, '', `_${d.cena}_`, '');
    for (const f of d.falas) L.push(`- **${d.pessoas[f.quem]}:** ${f.nikud} · ${f.tr} · ${f.pt} (${origem(f.nikud)})`);
    L.push('', `Comentário: ${d.comentario}`, '');
  }
  L.push('## Atividades', '');
  for (const a of produto.atividades) {
    const he = [...(a.questoes ?? []).flatMap(q => q.opcoesHe ? q.opcoes : []), ...(a.placas ?? []).map(p => p.he), ...(a.pares ?? []).map(p => p.nikud)];
    if (he.length) L.push(`- ${a.titulo}: ${he.join(' · ')}`);
  }
  return L.join('\n') + '\n';
}

const DECISOES = [
  'Nikud na convenção do curso de alfabetização: daguesh só em בּ כּ פּ (תוֹדָה, כַּמָה, הַשָׁעָה). Se preferir o nikud completo da norma (תּוֹדָה, כַּמָּה), é uma troca só no gerador.',
  'בֶּטַח, "claro": escrevi bétach, com a força no começo. O rascunho do A1 (unidade 20) traz בְּטַח, betách. Qual é a sua pronúncia?',
  'Preços na rua: o guia ensina que se ouve "shivím shékel" (número de contar e shékel no singular) e diz que a norma é outra. Confere com o que você ouve?',
  'הכול, com ו, como manda a Academia; o cartão avisa que também se vê הכל.',
  'Para "posso pagar com cartão?" escolhi אֶפְשָׁר בְּאַשְׁרַאי? (efshár beashrái), para fugir da dúvida bekartís/bechartís. Fica?',
  'Bombeiros: usei מְכַבֵּי אֵשׁ (mechabéi esh), o nome do dia a dia, em vez de כַּבָּאוּת.',
  'O ponto de partida do guia é o Brasil (bilhete GRU-TLV na capa). Caravanas saem de outras cidades; se preferir, a capa pode ter só TLV.',
  'O texto da introdução e do capítulo 12 fala em primeira pessoa, como você. Confira se a voz é a sua.'
];
const FATOS = [
  'Shabat: a maior parte dos ônibus e dos trens para da sexta à tarde ao sábado à noite; táxis funcionam; há sherút em algumas cidades.',
  'Trem liga o aeroporto Ben Gurion a Tel Aviv e a Jerusalém.',
  'Gorjeta em restaurante com mesa: costume, em torno de 10% a 15%, normalmente não incluída.',
  'Sacola cobrada à parte no supermercado.',
  'Água da torneira potável em Israel.',
  'Emergência: 100 polícia, 101 Maguén Davíd Adóm (ambulância), 102 bombeiros.',
  'Elevador de shabat em muitos hotéis.',
  'Placas de rua em hebraico, árabe e inglês.',
  'Taxímetro: o guia orienta a pedir a corrida "im moné".',
  'Dinheiro (figura do capítulo 7): moedas de 10 agorót, ½, 1, 2, 5 e 10 shekels; notas de 20, 50, 100 e 200. A figura avisa que cores e tamanhos são esquemáticos.',
  'Semana (figura do capítulo 2): domingo dia útil, sexta com comércio até a tarde.'
];

// Igualdade COM nikud (só a pontuação sai): "igual ao curso" quer dizer a
// mesma palavra, com as mesmas vogais, já escrita lá. Sem nikud, שְׁמוֹנֶה e
// שְׁמוֹנָה contariam como a mesma, e o dono pularia uma revisão que importa.
const chave = s => s.normalize('NFC').replace(/[?!.,…:"'\s]/g, '');

async function hebraicoDoCurso() {
  const aprovado = new Set(), a1 = new Set();
  const coletar = (o, alvo, soAprovado = true) => {
    if (typeof o === 'string') { if (/[א-ת]/.test(o)) { alvo.add(chave(o)); for (const w of o.split(/\s+/)) alvo.add(chave(w)); } return; }
    if (Array.isArray(o)) return o.forEach(x => coletar(x, alvo, soAprovado));
    if (o && typeof o === 'object') {
      if (soAprovado && o.revisado === false) return; // texto do curso ainda não aprovado
      Object.values(o).forEach(x => coletar(x, alvo, soAprovado));
    }
  };
  for (const f of ['letters.json', 'sentences.json', 'textos.json', 'real-world.json', 'extras.json', 'nikud.json']) {
    const p = path.join(RAIZ_REPO, 'data', f);
    if (existsSync(p)) coletar(JSON.parse(await readFile(p, 'utf8')), aprovado);
  }
  const dirA1 = path.join(RAIZ_REPO, 'data/a1/unidades');
  if (existsSync(dirA1)) for (const f of await readdir(dirA1)) coletar(JSON.parse(await readFile(path.join(dirA1, f), 'utf8')), a1, false);
  return { aprovado, a1 };
}
