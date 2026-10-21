// Conferência do conteúdo de um guia, ANTES de qualquer PDF.
// ─────────────────────────────────────────────────────────────────────────
// Um guia pago com um item a mais, um hebraico repetido ou um travessão no
// meio do texto é um defeito que o olho não pega em 80 páginas. Tudo o que
// dá para cobrar de máquina é cobrado aqui, e o gerador não roda sem isto.
//
// Uso: node produtos/_motor/conferir.mjs sobrevivencia-israel

import { carregar } from './dados.mjs';

const HEBRAICO = /[\u0590-\u05FF]/;
// Letras hebraicas, nikud, maqaf, geresh; mais o que pode cercar uma frase.
const SO_HEBRAICO = /^[\u05B0-\u05C7\u05D0-\u05EA\u05F3\u05F4\u05BE\s?!.,…'"]+$/u;
const NIKUD = /[\u05B0-\u05BC\u05C1\u05C2\u05C7]/;
// Travessão e meia-risca pelo código, sem escrever o caractere nem a forma
// escapada: a verificação do CLAUDE.md acusaria este arquivo.
const TRACOS = new RegExp(`[${String.fromCharCode(0x2013, 0x2014)}]`);

export function conferir(produto) {
  const erros = [];
  const avisos = [];
  const { itens, capitulos, dialogos, atividades, textos } = produto;

  // ── 1. exatamente 100 itens, ids e hebraico únicos ─────────────────────
  if (itens.length !== produto.meta.totalItens) {
    erros.push(`O guia tem ${itens.length} itens; o critério pede exatamente ${produto.meta.totalItens}.`);
  }
  const ids = new Set();
  const hes = new Map();
  for (const it of itens) {
    if (ids.has(it.id)) erros.push(`id repetido: ${it.id}`);
    ids.add(it.id);
    // Distinto = outra palavra. A chave é a forma com nikud: קָפֶה e קֻפָּה
    // são palavras diferentes, mesmo que sem vogais se pareçam.
    const chave = it.nikud.replace(/[?!.,…]/g, '').trim();
    if (hes.has(chave)) erros.push(`hebraico repetido: ${it.id} e ${hes.get(chave)} (${chave})`);
    hes.set(chave, it.id);

    for (const campo of ['id', 'categoria', 'he', 'nikud', 'tr', 'pt', 'contexto', 'audio', 'revisao']) {
      if (!it[campo] || typeof it[campo] !== 'string') erros.push(`${it.id}: falta o campo ${campo}`);
    }
    if (it.audio !== `itens/${it.id}`) erros.push(`${it.id}: audio deveria ser itens/${it.id}`);
    if (!['rascunho', 'aprovado'].includes(it.revisao)) erros.push(`${it.id}: revisao inválida (${it.revisao})`);

    // he é como se escreve em Israel: sem nikud. nikud tem de ter nikud.
    if (NIKUD.test(it.he)) erros.push(`${it.id}: o campo he não pode ter nikud`);
    if (!NIKUD.test(it.nikud)) erros.push(`${it.id}: o campo nikud está sem nikud`);
    for (const [rot, v] of [['he', it.he], ['nikud', it.nikud]]) {
      if (!SO_HEBRAICO.test(v)) erros.push(`${it.id}: ${rot} tem caractere que não é hebraico: ${v}`);
    }
    // A grafia sem vogais do campo `nikud` tem de bater com `he`, tirando as
    // letras de apoio (ו, י) que a escrita sem vogais acrescenta.
    if (!grafiaCompativel(it.nikud, it.he)) {
      erros.push(`${it.id}: ${it.he} não é a grafia sem vogais de ${it.nikud}`);
    }
    for (const v of it.variantes ?? []) {
      for (const campo of ['quando', 'he', 'nikud', 'tr']) {
        if (!v[campo]) erros.push(`${it.id}: variante sem ${campo}`);
      }
      if (v.nikud && !grafiaCompativel(v.nikud, v.he)) erros.push(`${it.id}: variante ${v.he} não bate com ${v.nikud}`);
    }
    if (it.exemplo && !(it.exemplo.nikud && it.exemplo.tr && it.exemplo.pt)) erros.push(`${it.id}: exemplo incompleto`);
    conferirTranslit(it.tr, it.id, erros);
  }

  // ── 2. categorias = capítulos, na ordem ────────────────────────────────
  const ordem = capitulos.map(c => c.id);
  let anterior = -1;
  for (const it of itens) {
    const i = ordem.indexOf(it.categoria);
    if (i < 0) erros.push(`${it.id}: categoria sem capítulo (${it.categoria})`);
    if (i < anterior) erros.push(`${it.id}: fora da ordem dos capítulos`);
    anterior = Math.max(anterior, i);
  }
  for (const c of capitulos) {
    for (const q of c.quadros ?? []) {
      if (q.apos && !ids.has(q.apos)) erros.push(`cap. ${c.n}: quadro "${q.titulo}" depois de item inexistente ${q.apos}`);
      if (q.apos && itens.find(x => x.id === q.apos)?.categoria !== c.id) erros.push(`cap. ${c.n}: quadro "${q.titulo}" aponta para item de outro capítulo`);
    }
    for (const id of c.resumo?.itens ?? []) {
      if (!ids.has(id)) erros.push(`cap. ${c.n}: resumo cita item inexistente ${id}`);
    }
    for (const p of c.galeria?.placas ?? []) if (!ids.has(p.ref)) erros.push(`placa cita item inexistente ${p.ref}`);
  }

  // ── 3. diálogos e atividades só citam o que existe ─────────────────────
  if (dialogos.length < 5) erros.push(`São ${dialogos.length} diálogos; o mínimo é 5.`);
  for (const d of dialogos) {
    for (const id of d.usa) if (!ids.has(id)) erros.push(`diálogo ${d.id}: usa item inexistente ${id}`);
    for (const f of d.falas) {
      if (!f.nikud || !f.tr || !f.pt) erros.push(`diálogo ${d.id}: fala incompleta`);
      if (!d.pessoas[f.quem]) erros.push(`diálogo ${d.id}: falante desconhecido ${f.quem}`);
      conferirTranslit(f.tr, `diálogo ${d.id}`, erros);
    }
  }
  for (const a of atividades) {
    const refs = [a.ref, ...(a.questoes ?? []).map(q => q.ref), ...(a.pares ?? []).map(p => p.ref), ...(a.placas ?? []).map(p => p.ref)].flat().filter(Boolean);
    for (const id of refs) if (!ids.has(id)) erros.push(`atividade ${a.id}: cita item inexistente ${id}`);
    for (const q of a.questoes ?? []) {
      if (q.opcoes && !(q.resposta >= 0 && q.resposta < q.opcoes.length)) erros.push(`atividade ${a.id}: resposta fora das opções`);
    }
    if (a.tipo === 'completar') {
      const lacunas = a.falas.reduce((n, f) => n + (f.texto.match(/____/g) ?? []).length, 0);
      if (lacunas !== a.resposta.length || lacunas !== a.banco.length) erros.push(`atividade ${a.id}: lacunas, banco e respostas não batem`);
    }
    if (a.tipo === 'associar') {
      const e = [...a.embaralhar].sort();
      if (e.join() !== a.pares.map((_, i) => i).join()) erros.push(`atividade ${a.id}: embaralhar não é uma permutação`);
    }
  }
  const tipos = new Set(atividades.map(a => a.tipo));
  for (const t of ['escolha', 'associar', 'placas', 'completar', 'situacoes']) if (!tipos.has(t)) erros.push(`falta atividade do tipo ${t}`);

  // ── 4. a regra do travessão e o NFC, em todo texto ─────────────────────
  for (const [onde, txt] of todasAsStrings({ itens, dialogos, atividades, textos })) {
    if (TRACOS.test(txt)) erros.push(`travessão ou meia-risca em ${onde}: ${txt.slice(0, 60)}`);
    if (/\\u20(13|14)/i.test(txt)) erros.push(`travessão escapado em ${onde}`);
    if (HEBRAICO.test(txt) && txt.normalize('NFC') !== txt) erros.push(`hebraico fora de NFC em ${onde}`);
  }

  // ── 5. o que não bloqueia, mas o dono precisa saber ────────────────────
  const pendentes = itens.filter(i => i.revisao !== 'aprovado').length;
  if (pendentes) avisos.push(`${pendentes} de ${itens.length} itens aguardam a revisão do dono (revisao: rascunho).`);
  if (produto.meta.audio.status !== 'disponivel') avisos.push('Áudios ainda não gravados: o PDF sai sem códigos QR e diz isso na introdução.');

  return { erros, avisos };
}

export function semNikud(s) {
  return s.normalize('NFD').replace(/[\u0591-\u05C7]/g, '').normalize('NFC');
}

// A escrita sem vogais (ktiv male) acrescenta ו e י de apoio e dobra o ו e o
// י consonantais. Então comparamos tirando ו/י dos dois lados: o resto das
// letras tem de ser idêntico, na mesma ordem.
function grafiaCompativel(nikud, he) {
  const esqueleto = s => semNikud(s).replace(/[וי]/g, '').replace(/[?!.,…\s]/g, '');
  return esqueleto(nikud) === esqueleto(he);
}

// Duas regras da convenção que dá para cobrar sem um dicionário: palavra de
// duas sílabas ou mais leva acento (salvo as exceções de monossílabo
// gráfico), e não há letra que a convenção não use.
function conferirTranslit(tr, onde, erros) {
  if (/[ç]|ph|th|kh|\bx/i.test(tr)) erros.push(`${onde}: transliteração fora da convenção (${tr})`);
  for (const palavra of tr.toLowerCase().replace(/[^a-záéíóúãõâêô\s-]/g, ' ').split(/[\s-]+/).filter(Boolean)) {
    const silabas = (palavra.match(/[aeiouáéíóú]+/g) ?? []).reduce((n, g) => n + contarVogais(g), 0);
    const acentos = (palavra.match(/[áéíóú]/g) ?? []).length;
    if (acentos > 1) erros.push(`${onde}: "${palavra}" tem dois acentos`);
    if (silabas >= 2 && acentos === 0 && !SEM_ACENTO.has(palavra)) erros.push(`${onde}: "${palavra}" sem acento na sílaba forte`);
    if (silabas <= 1 && acentos === 1 && !ACENTO_OK.has(palavra)) erros.push(`${onde}: "${palavra}" é monossílabo e não leva acento`);
  }
}
// "ei" e "ai" são uma sílaba só (éifo, láyla); o resto, cada vogal é uma.
function contarVogais(grupo) {
  return grupo.replace(/[eé][i]|[aá][i]|[oó][i]|[uú][i]/g, 'X').length;
}
// Prefixos e palavras curtas que a convenção escreve sem acento.
const SEM_ACENTO = new Set(['le', 'ba', 've', 'ha', 'be', 'mi', 'la']);
const ACENTO_OK = new Set([]);

function* todasAsStrings(obj, caminho = '') {
  if (typeof obj === 'string') { yield [caminho, obj]; return; }
  if (Array.isArray(obj)) { for (let i = 0; i < obj.length; i++) yield* todasAsStrings(obj[i], `${caminho}[${i}]`); return; }
  if (obj && typeof obj === 'object') for (const [k, v] of Object.entries(obj)) yield* todasAsStrings(v, caminho ? `${caminho}.${k}` : k);
}

// ── uso direto ───────────────────────────────────────────────────────────
if (import.meta.url === `file://${process.argv[1]}`) {
  const slug = process.argv[2];
  if (!slug) { console.error('uso: node produtos/_motor/conferir.mjs <slug>'); process.exit(2); }
  const { erros, avisos } = conferir(await carregar(slug));
  for (const a of avisos) console.log(`aviso: ${a}`);
  for (const e of erros) console.error(`ERRO: ${e}`);
  console.log(erros.length ? `\n${erros.length} erro(s).` : '\nConteúdo conferido: nenhum erro.');
  process.exit(erros.length ? 1 : 0);
}
