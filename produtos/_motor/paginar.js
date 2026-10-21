// O paginador. Roda DENTRO do navegador, depois das fontes carregadas.
// ─────────────────────────────────────────────────────────────────────────
// Diagramação por MEDIDA, não por tentativa: cada bloco é medido na largura
// em que vai ficar, e a página é composta com as alturas na mão.
//
// A página tem uma grade de N colunas (2 no A4, 1 no celular). Os blocos
// chegam numa fila, de dois tipos:
//   · `.largo`: ocupa a largura toda (abertura de capítulo, tabela, figura
//     grande). Entra se couber no que resta da página; senão, página nova.
//   · os outros fluem em colunas, como num jornal: a primeira coluna enche
//     de cima para baixo, depois a segunda. Quando a sequência acaba no meio
//     da página (antes de um bloco largo, ou no fim do capítulo), as colunas
//     se EQUILIBRAM: o corte entre elas é escolhido para que fiquem com a
//     mesma altura, e o que vem depois começa logo abaixo, sem buraco.
//
// Regras que não se quebram: um bloco nunca é partido (cartão, quadro, fala,
// questão); um bloco `data-junto` (um título) nunca fica no pé de uma coluna
// sem o bloco seguinte; um bloco `data-nova-pagina` abre página.
//
// Devolve um relatório: estouros, páginas vazias, âncoras sem destino e a
// ocupação de cada página (para o gerador e para o relatório de paginação).
/* eslint-disable no-undef */
(() => {
  const rel = { estouros: [], vazias: [], ancorasSemDestino: [], paginas: 0, ocupacao: [] };
  const rascunho = document.body.dataset.rascunho === '1';
  const titulo = document.body.dataset.tituloCurto;
  const NCOL = +getComputedStyle(document.documentElement).getPropertyValue('--colunas') || 1;

  // ── medida ───────────────────────────────────────────────────────────
  // Uma página-modelo fora da tela dá a altura útil, a largura da coluna e
  // o espaço entre blocos, lidos do CSS (nada de número repetido aqui).
  // DENTRO do body: fora dele a página herda do <html> outra fonte e outra
  // entrelinha, e toda medida sai errada.
  const ancora = document.createElement('div');
  document.body.appendChild(ancora);
  const modelo = novaPagina('x', ancora);
  ancora.remove();
  const corpoModelo = modelo.querySelector('.corpo');
  // Altura útil com 3 px de folga: as medidas são fracionárias e o
  // clientHeight arredonda; sem folga, um bloco "cabe" por meio pixel e a
  // página transborda pelo arredondamento.
  const ALTURA = Math.floor(corpoModelo.getBoundingClientRect().height) - 3;
  const cs = getComputedStyle(corpoModelo);
  // O .corpo é flex em coluna: row-gap é o espaço entre blocos; column-gap
  // não tem efeito nele e só guarda o espaço entre colunas, para lermos aqui.
  const GAP = parseFloat(cs.rowGap) || 0;
  const GAPCOL = parseFloat(cs.columnGap) || 0;
  const LARGURA = corpoModelo.clientWidth;
  const LCOL = (LARGURA - GAPCOL * (NCOL - 1)) / NCOL;
  const medidor = document.createElement('div');
  medidor.className = 'medidor';
  corpoModelo.appendChild(medidor);
  const medir = (b, largura) => {
    medidor.style.width = `${largura}px`;
    medidor.appendChild(b);
    const h = b.getBoundingClientRect().height;
    medidor.removeChild(b);
    return h;
  };

  function novaPagina(cabeca, depoisDe) {
    const p = document.createElement('div');
    p.className = 'pagina';
    p.innerHTML = `<div class="cabeca"><b>${cabeca}</b><span>${titulo}</span></div><div class="corpo"></div>` +
      `<div class="pe"><span class="rascunho">${rascunho ? 'Rascunho · hebraico em revisão' : ''}</span><span class="num"></span></div>`;
    depoisDe.after(p);
    return p;
  }

  // ── colocação de uma sequência em colunas ────────────────────────────
  // Recebe a fila de blocos de coluna (com altura medida) e a altura
  // disponível. Devolve quantos cabem e o corte entre as colunas.
  const alturaDe = seq => seq.reduce((s, b, i) => s + b.h + (i ? GAP : 0), 0);
  function encher(fila, disponivel, equilibrar) {
    // Colunas cheias de cima para baixo: quantos blocos cabem?
    const cols = [];
    let i = 0;
    for (let c = 0; c < NCOL; c++) {
      const col = [];
      while (i < fila.length) {
        const prox = [...col, fila[i]];
        if (alturaDe(prox) > disponivel) break;
        col.push(fila[i]); i++;
      }
      // Título não fica no pé da coluna: desce junto com o que vem depois.
      while (col.length > 1 && col.at(-1).junto && i < fila.length) { col.pop(); i--; }
      if (col.length === 1 && col[0].junto && i < fila.length) { col.pop(); i--; }
      cols.push(col);
    }
    const n = cols.reduce((s, c) => s + c.length, 0);
    if (!equilibrar || NCOL === 1 || n < 2) return { n, cortes: cols.map(c => c.length) };
    // Equilíbrio: entre os cortes possíveis para os n blocos, o que deixa a
    // coluna mais alta mais baixa. Com duas colunas é uma varredura simples.
    const usados = fila.slice(0, n);
    let melhor = null;
    for (let k = 1; k < n; k++) {
      const a = usados.slice(0, k), b = usados.slice(k);
      if (a.at(-1).junto) continue;
      const alt = Math.max(alturaDe(a), alturaDe(b));
      if (alt > disponivel) continue;
      if (!melhor || alt < melhor.alt - 0.5) melhor = { alt, cortes: [k, n - k] };
    }
    return { n, cortes: melhor ? melhor.cortes : cols.map(c => c.length) };
  }

  // ── a composição ─────────────────────────────────────────────────────
  for (const secao of [...document.querySelectorAll('section.fluxo')]) {
    let cabeca = secao.dataset.cabeca;
    const blocos = [...secao.children].map(el => ({
      el, largo: el.classList.contains('largo'),
      junto: el.hasAttribute('data-junto'),
      // data-nova-pagina="" abre sempre; "0.42" abre se sobrar menos que 42%.
      quebra: el.hasAttribute('data-nova-pagina') ? (el.dataset.novaPagina === '' ? 1 : +el.dataset.novaPagina) : 0,
      cabeca: el.dataset.cabeca || null
    }));
    for (const b of blocos) { b.h = medir(b.el, b.largo ? LARGURA : LCOL); b.el.dataset.h = b.h.toFixed(1); }

    let pagina = novaPagina(cabeca, secao);
    if (secao.dataset.ancora) pagina.id = secao.dataset.ancora;
    let corpo = pagina.querySelector('.corpo');
    let resta = ALTURA;
    const abrir = () => { pagina = novaPagina(cabeca, pagina); corpo = pagina.querySelector('.corpo'); resta = ALTURA; };
    // Um bloco que traz cabeçalho novo (abertura de capítulo) troca o
    // cabeçalho das páginas seguintes, e o desta se ele a abre.
    const trocarCabeca = b => {
      if (!b.cabeca) return;
      cabeca = b.cabeca;
      if (!corpo.children.length) pagina.querySelector('.cabeca b').textContent = cabeca;
    };
    const usar = h => { resta -= h + (corpo.children.length > 1 ? GAP : 0); };

    let i = 0;
    while (i < blocos.length) {
      const b = blocos[i];
      if (b.quebra && corpo.children.length && resta < b.quebra * ALTURA) abrir();
      trocarCabeca(b);
      if (b.largo) {
        // Título largo desce com o que vem depois (basta caber o próximo).
        const prox = blocos[i + 1];
        const precisa = b.h + (b.junto && prox ? GAP + Math.min(prox.h, ALTURA / 3) : 0);
        const gapAntes = corpo.children.length ? GAP : 0;
        if (precisa + gapAntes > resta && corpo.children.length) abrir();
        corpo.appendChild(b.el);
        usar(b.h);
        if (b.h > ALTURA) { b.el.classList.add('estouro'); rel.estouros.push(rotulo(b.el)); }
        i++;
        continue;
      }
      // Uma sequência de blocos de coluna, até o próximo largo ou quebra.
      let j = i;
      while (j < blocos.length && !blocos[j].largo && !(j > i && (blocos[j].quebra || blocos[j].cabeca))) j++;
      let fila = blocos.slice(i, j);
      while (fila.length) {
        const gapAntes = corpo.children.length ? GAP : 0;
        let disp = resta - gapAntes;
        let { n, cortes } = encher(fila, disp, true);
        // Se os que cabem não esgotam a fila, a página fecha cheia: sem
        // equilíbrio, primeira coluna até o fim e a segunda até o fim.
        if (n < fila.length) ({ n, cortes } = encher(fila, disp, false));
        if (n === 0) {
          if (!corpo.children.length) { // nem numa página vazia
            fila[0].el.classList.add('estouro'); rel.estouros.push(rotulo(fila[0].el));
            n = 1; cortes = [1];
          } else { abrir(); continue; }
        }
        const regiao = document.createElement('div');
        regiao.className = `regiao col${NCOL}`;
        let k = 0;
        for (let c = 0; c < NCOL; c++) {
          const col = document.createElement('div');
          col.className = 'coluna';
          for (let t = 0; t < (cortes[c] ?? 0); t++) col.appendChild(fila[k++].el);
          regiao.appendChild(col);
        }
        corpo.appendChild(regiao);
        let k2 = 0;
        const altReg = Math.max(...cortes.map(q => { const h = alturaDe(fila.slice(k2, k2 + q)); k2 += q; return h; }));
        regiao.dataset.h = altReg.toFixed(1);
        usar(altReg);
        fila = fila.slice(n);
        if (fila.length) abrir();
      }
      i = j;
    }
    secao.remove();
  }
  modelo.remove();

  // ── conferência, numeração, ocupação ─────────────────────────────────
  const paginas = [...document.querySelectorAll('.pagina')];
  paginas.forEach((p, idx) => {
    const num = p.querySelector('.pe .num');
    if (num && !p.hasAttribute('data-sem-numero')) num.textContent = String(idx + 1);
    const corpo = p.querySelector('.corpo');
    if (!corpo || p.classList.contains('fixa')) { rel.ocupacao.push(null); return; }
    if (!corpo.children.length) rel.vazias.push(idx + 1);
    if (corpo.scrollHeight > corpo.clientHeight + 1) rel.estouros.push(`página ${idx + 1} transborda`);
    const topo = corpo.getBoundingClientRect().top;
    let fundo = topo;
    for (const el of corpo.querySelectorAll(':scope > *, :scope > .regiao > .coluna > *')) fundo = Math.max(fundo, el.getBoundingClientRect().bottom);
    rel.ocupacao.push(+((fundo - topo) / corpo.clientHeight).toFixed(2));
  });
  rel.paginas = paginas.length;

  const paginaDe = el => paginas.indexOf(el.closest('.pagina')) + 1;
  for (const alvo of document.querySelectorAll('[data-pagina-de]')) {
    const el = document.getElementById(alvo.dataset.paginaDe);
    if (!el) { rel.ancorasSemDestino.push(alvo.dataset.paginaDe); continue; }
    alvo.textContent = String(paginaDe(el));
  }
  for (const a of document.querySelectorAll('a[href^="#"]')) {
    if (!document.getElementById(a.getAttribute('href').slice(1))) rel.ancorasSemDestino.push(a.getAttribute('href'));
  }
  rel.externos = [...new Set([...document.querySelectorAll('a[href^="http"]')].map(a => a.href))];
  // Onde cada capítulo começa, para o relatório de paginação.
  rel.capitulos = [...document.querySelectorAll('[id^="cap-"]')].map(el => ({ id: el.id, pagina: paginaDe(el) }));
  // As âncoras das seções, para os marcadores do PDF.
  rel.ancoras = Object.fromEntries(['sumario', 'emergencia', 'introducao', 'gabarito', 'indice']
    .map(id => [id, document.getElementById(id)]).filter(([, el]) => el).map(([id, el]) => [id, paginaDe(el)]));
  return rel;

  function rotulo(el) { return (el.id || el.textContent.trim()).slice(0, 80); }
})();
