// O paginador. Roda DENTRO do navegador, depois das fontes carregadas.
// ─────────────────────────────────────────────────────────────────────────
// Cada seção `.fluxo` vira uma sequência de páginas: os blocos entram um a
// um no corpo da página corrente e, quando o próximo não cabe, abre-se outra.
// Um bloco nunca é partido (é isso que impede cartão cortado, linha órfã
// e título sozinho no pé), e um bloco marcado `data-junto` (um título)
// desce junto com o bloco seguinte.
//
// Devolve um relatório que o gerador confere: bloco que não cabe numa
// página inteira, página que sobrou vazia, âncora sem destino.
/* eslint-disable no-undef */
(() => {
  const relatorio = { estouros: [], vazias: [], ancorasSemDestino: [], paginas: 0, sobraMedia: 0 };
  const rascunho = document.body.dataset.rascunho === '1';
  const titulo = document.body.dataset.tituloCurto;

  const novaPagina = (cabeca, depoisDe) => {
    const p = document.createElement('div');
    p.className = 'pagina';
    p.innerHTML = `<div class="cabeca"><b>${cabeca}</b><span>${titulo}</span></div><div class="corpo"></div>` +
      `<div class="pe"><span class="rascunho">${rascunho ? 'Rascunho · hebraico em revisão' : ''}</span><span class="num"></span></div>`;
    depoisDe.after(p);
    return p;
  };
  const transborda = corpo => corpo.scrollHeight > corpo.clientHeight + 0.5;

  for (const secao of [...document.querySelectorAll('section.fluxo')]) {
    const blocos = [...secao.children];
    const cabeca = secao.dataset.cabeca;
    let ultima = secao;
    let pagina = novaPagina(cabeca, ultima);
    if (secao.dataset.ancora) pagina.id = secao.dataset.ancora;
    let corpo = pagina.querySelector('.corpo');
    for (const b of blocos) {
      corpo.appendChild(b);
      if (!transborda(corpo)) continue;
      corpo.removeChild(b);
      const mover = [b];
      while (corpo.lastElementChild && corpo.lastElementChild.hasAttribute('data-junto')) {
        mover.unshift(corpo.lastElementChild);
        corpo.removeChild(corpo.lastElementChild);
      }
      if (!corpo.children.length) {
        // Nem a página vazia comporta: entra assim mesmo e vira erro.
        mover.forEach(m => corpo.appendChild(m));
        b.classList.add('estouro');
        relatorio.estouros.push((b.id || b.textContent).slice(0, 80));
        continue;
      }
      pagina = novaPagina(cabeca, pagina);
      corpo = pagina.querySelector('.corpo');
      mover.forEach(m => corpo.appendChild(m));
      if (transborda(corpo)) { b.classList.add('estouro'); relatorio.estouros.push((b.id || b.textContent).slice(0, 80)); }
    }
    secao.remove();
  }

  // Numeração: toda página conta; capa, rosto e contracapa não mostram.
  const paginas = [...document.querySelectorAll('.pagina')];
  let sobra = 0, contadas = 0;
  paginas.forEach((p, i) => {
    const num = p.querySelector('.pe .num');
    if (num && !p.hasAttribute('data-sem-numero')) num.textContent = String(i + 1);
    const corpo = p.querySelector('.corpo');
    if (corpo && !p.classList.contains('fixa')) {
      if (!corpo.children.length) relatorio.vazias.push(i + 1);
      const fim = corpo.lastElementChild ? corpo.lastElementChild.getBoundingClientRect().bottom : corpo.getBoundingClientRect().top;
      const livre = corpo.getBoundingClientRect().bottom - fim;
      sobra += livre / corpo.getBoundingClientRect().height; contadas++;
      p.dataset.sobra = (livre / corpo.getBoundingClientRect().height).toFixed(2);
    }
  });
  relatorio.paginas = paginas.length;
  relatorio.sobraMedia = contadas ? +(sobra / contadas).toFixed(3) : 0;

  // Sumário e índice: o número da página de cada destino.
  const paginaDe = el => paginas.indexOf(el.closest('.pagina')) + 1;
  for (const alvo of document.querySelectorAll('[data-pagina-de]')) {
    const el = document.getElementById(alvo.dataset.paginaDe);
    if (!el) { relatorio.ancorasSemDestino.push(alvo.dataset.paginaDe); continue; }
    alvo.textContent = String(paginaDe(el));
  }
  for (const a of document.querySelectorAll('a[href^="#"]')) {
    if (!document.getElementById(a.getAttribute('href').slice(1))) relatorio.ancorasSemDestino.push(a.getAttribute('href'));
  }
  relatorio.externos = [...new Set([...document.querySelectorAll('a[href^="http"]')].map(a => a.href))];
  relatorio.sobraPorPagina = paginas.map(p => p.dataset.sobra ? +p.dataset.sobra : null);
  return relatorio;
})();
