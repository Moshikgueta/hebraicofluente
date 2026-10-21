/* Experiência digital de Israel Além do Roteiro (protótipo).
   Sem biblioteca: lê o JSON da base editorial embutido na página e desenha
   início, capítulo, glossário e diário. O estado do leitor (progresso,
   favoritos, respostas, desafios, diário) fica no aparelho; toda leitura e
   escrita passa por `guardar`, que tolera navegador sem armazenamento. */
(function () {
  'use strict';
  var D = JSON.parse(document.getElementById('dados').textContent);
  var main = document.getElementById('conteudo');
  var folha = document.getElementById('folha');
  var barra = document.querySelector('.progresso i');

  /* ── estado no aparelho ─────────────────────────────────────────────── */
  var CHAVE = 'iar-estado-v1';
  var memoria = {};
  function ler() { try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return memoria; } }
  function guardar(f) { var s = ler(); f(s); try { localStorage.setItem(CHAVE, JSON.stringify(s)); } catch (e) { memoria = s; } return s; }
  function estado() { var s = ler(); s.lidas = s.lidas || {}; s.fav = s.fav || {}; s.resp = s.resp || {}; s.desafios = s.desafios || {}; s.diario = s.diario || {}; s.check = s.check || {}; s.roteiro = s.roteiro || {}; s.palavras = s.palavras || {}; s.palpites = s.palpites || {}; s.exerc = s.exerc || {}; s.abertas = s.abertas || {}; s.mapa = s.mapa || {}; s.mapa.lugares = s.mapa.lugares || {}; s.mapa.meus = s.mapa.meus || []; return s; }

  /* ── utilidades ─────────────────────────────────────────────────────── */
  function el(tag, attrs, html) { var e = document.createElement(tag); for (var k in (attrs || {})) { if (attrs[k] != null) e.setAttribute(k, attrs[k]); } if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var ICONE = {
    fav: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
    favOn: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
    som: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
    fechar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };
  function porId(id) { for (var i = 0; i < D.capitulos.length; i++) if (D.capitulos[i].id === id) return D.capitulos[i]; return null; }
  function pct(cap) { var s = estado(); var n = 0; cap.secoes.forEach(function (x) { if (s.lidas[x.id]) n++; }); return Math.round(100 * n / Math.max(1, cap.secoes.length)); }

  /* ── folha inferior (mapa, figura) ──────────────────────────────────── */
  var origemFolha = null;
  function abrirFolha(titulo, html, origem) {
    origemFolha = origem || null;
    folha.innerHTML = '<button class="icone fechar" aria-label="Fechar">' + ICONE.fechar + '</button><h4 id="folha-t">' + titulo + '</h4>' + html;
    folha.hidden = false; folha.querySelector('.fechar').addEventListener('click', fecharFolha); folha.querySelector('.fechar').focus();
  }
  function fecharFolha() { folha.hidden = true; if (origemFolha) { origemFolha.setAttribute('aria-expanded', 'false'); origemFolha.focus(); } }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !folha.hidden) fecharFolha(); });

  /* ── áudio: só gravação humana ──────────────────────────────────────── */
  var tocando = null;
  function tocar(src) { if (tocando) { tocando.pause(); } tocando = new Audio(src); tocando.play().catch(function () {}); }

  /* ── blocos ─────────────────────────────────────────────────────────── */
  function figura(b) {
    var f = el('figure');
    var alvo = el('div', { class: 'alvo' }, b.svg ? D.svgs[b.svg] : '<div class="foto-pendente"><b>Figura pendente</b><span>' + esc(b.id) + '</span></div>');
    f.appendChild(alvo);
    var pts = D.pontos[b.id];
    if (pts && pts.length) {
      pts.forEach(function (p) {
        var bt = el('button', { class: 'ponto' + (p.ficha ? ' ponto-ficha' : ''), style: 'left:' + p.x + '%;top:' + p.y + '%', 'aria-label': p.nome + ': ver detalhes', 'aria-expanded': 'false' }, '<span></span>');
        bt.addEventListener('click', function () {
          bt.setAttribute('aria-expanded', 'true');
          var f = p.ficha ? fichaPorId(p.ficha) : null;
          if (f) { abrirFolha(esc(f.nome), '', bt); folha.appendChild(fichaEl(f, true)); }
          else abrirFolha(esc(p.nome), '<p>' + p.texto + '</p>', bt);
        });
        alvo.appendChild(bt);
      });
    }
    var cap = (b.ativo ? '<b>' + esc(b.ativo.titulo) + '.</b> ' : '') + (b.legenda || '') + (pts && pts.length ? ' <em>Toque nos pontos para ver ' + (pts[0].ficha ? 'a ficha de cada lugar.' : 'cada região.') + '</em>' : '') + (b.ativo ? '<span class="credito">' + esc(b.ativo.credito_curto || '') + '</span>' : '');
    f.appendChild(el('figcaption', null, cap));
    return f;
  }
  function bloco(b, cap) {
    switch (b.tipo) {
      case 'p': return el('p', null, b.html);
      case 'h3': return el('h3', null, b.html);
      case 'lista': return el('ul', null, b.itens.map(function (i) { return '<li>' + i + '</li>'; }).join(''));
      case 'citacao': return el('blockquote', null, b.html);
      case 'figura': case 'visual': return figura(b);
      case 'foto': {
        var c = b.candidata; var f = el('figure');
        f.innerHTML = '<div class="foto-pendente"><b>Fotografia a inserir</b><span>' + esc(c ? c.assunto : b.id) + '</span>' + (c ? '<small>' + esc(c.titulo_arquivo) + ' · ' + esc(c.licenca_declarada || 'licença a confirmar') + '</small>' : '') + '</div><figcaption>' + (b.legenda || '') + '</figcaption>';
        return f;
      }
      case 'dado': return el('div', { class: 'dado' }, '<span class="numero">' + esc(b.numero) + '</span><span class="rotulo">' + b.rotulo + (b.nota ? '<span class="nota-d">' + b.nota + '</span>' : '') + '</span>');
      case 'vocabulario': {
        var v = el('div', { class: 'vocab' }, '<div class="cab"><span>' + esc(b.titulo || 'Em hebraico') + '</span><span>Toque para ouvir</span></div>');
        var ol = el('ol');
        b.itens.forEach(function (i) {
          var li = el('li');
          var bt = el('button', { class: 'icone ouvir', 'aria-label': i.audio ? 'Ouvir ' + i.translit : 'Gravação ainda não disponível para ' + i.translit }, ICONE.som);
          if (i.audio) bt.addEventListener('click', function () { tocar(i.audio.src); }); else bt.disabled = true;
          li.appendChild(bt);
          li.appendChild(el('span', { class: 'p-tr' }, esc(i.translit) + ' <em>' + esc(i.pt) + '</em>'));
          li.appendChild(el('span', { class: 'p-he', lang: 'he', dir: 'rtl' }, esc(i.he)));
          if (i.nota) li.appendChild(el('span', { class: 'p-nota' }, i.nota));
          li.appendChild(acoesPalavra(i));
          ol.appendChild(li);
        });
        v.appendChild(ol); return v;
      }
      case 'caixa': {
        if (b.resposta) return palpite(b, cap);
        var fundo = ['historia-ou-tradicao', 'aviso', 'olhar-israelense'].indexOf(b.variante) >= 0;
        var cx = el('aside', { class: (fundo ? 'fundo ' : 'nota ') + b.variante + (b.pendente ? ' pendente' : '') }, '<span class="rot">' + esc(b.rotulo) + '</span>' + (b.titulo ? '<span class="tit">' + b.titulo + '</span>' : ''));
        b.blocos.forEach(function (x) { cx.appendChild(bloco(x, cap)); });
        return cx;
      }
      case 'link':
        if (!b.link || !b.link.url) return el('span');
        return el('a', { class: 'link', href: b.link.url, target: '_blank', rel: 'noopener' }, '<span class="inst">' + esc(b.link.instituicao || '') + '</span><span class="tit">' + esc(b.link.titulo) + '</span><span class="desc">' + (b.texto || esc(b.link.para_que_serve || '')) + '</span><span class="vis-oculto"> (abre em outra aba)</span>');
      case 'quiz': return quiz(b);
      case 'vf': return vf(b);
      case 'observacao': return desafio(b);
      case 'checklist': return checklist(b);
      case 'curiosidade': {
        var c = el('article', { class: 'curio' }, '<span class="curio-n">' + b.n + '</span><div><h3 class="curio-t">' + b.titulo + '</h3></div>');
        var dv = c.querySelector('div'); b.blocos.forEach(function (x) { dv.appendChild(bloco(x, cap)); });
        if (b.remete) dv.appendChild(el('p', { class: 'curio-r' }, b.remete));
        /* Copiar para enviar: o texto da curiosidade, sem dado pessoal. */
        var cp = el('button', { type: 'button', class: 'mini' }, 'Copiar para enviar'); var av = el('span', { class: 'curio-r', 'aria-live': 'polite' });
        cp.addEventListener('click', function () {
          var tx = (b.titulo + '. ' + dv.querySelector('p') .textContent + ' (Israel Além do Roteiro)').replace(/<[^>]+>/g, '');
          var ok = function () { av.textContent = ' Copiado.'; };
          try { navigator.clipboard.writeText(tx).then(ok, function () { av.textContent = ' Selecione o texto para copiar.'; }); } catch (e) { av.textContent = ' Selecione o texto para copiar.'; }
        });
        var lin = el('p'); lin.appendChild(cp); lin.appendChild(av); dv.appendChild(lin);
        return c;
      }
      case 'linha-do-tempo': return linhaDoTempo(b);
      case 'ficha': return fichaEl(b, false);
      case 'associe': return associe(b);
      case 'complete': return complete(b);
      case 'ordene': return ordene(b);
      case 'aberta': return aberta(b);
      case 'compare': return compare(b);
      default: return el('div', null, b.html || '');
    }
  }

  /* ── fase 6: fichas, roteiro, compare, palpite, gravar ─────────────── */
  function fichaPorId(id) { for (var i = 0; i < D.fichas.length; i++) if (D.fichas[i].id === id) return D.fichas[i]; return null; }
  function botaoRoteiro(f) {
    var s = estado(); var on = !!s.roteiro[f.id];
    var b = el('button', { type: 'button', class: 'botao-roteiro', 'aria-pressed': on ? 'true' : 'false' }, on ? 'No meu roteiro' : 'Quero ver');
    b.addEventListener('click', function () { var v = b.getAttribute('aria-pressed') !== 'true'; guardar(function (st) { st.roteiro = st.roteiro || {}; if (v) st.roteiro[f.id] = true; else delete st.roteiro[f.id]; }); b.setAttribute('aria-pressed', String(v)); b.textContent = v ? 'No meu roteiro' : 'Quero ver'; });
    return b;
  }
  function fichaEl(f, naFolha) {
    var a = el('article', { class: 'ficha' + (naFolha ? ' na-folha' : ''), id: naFolha ? null : 'ficha-' + f.id });
    var cab = el('header', null, '<span class="f-n">' + f.n + '</span><span class="f-nome">' + esc(f.nome) + '</span>');
    if (f.he) {
      var he = el('span', { class: 'f-he' }, '<span class="he" lang="he" dir="rtl">' + esc(f.he) + '</span><small>' + esc(f.translit || '') + '</small>');
      var ouvir = el('button', { class: 'icone ouvir', type: 'button', 'aria-label': f.audio ? 'Ouvir ' + (f.translit || f.nome) : 'Gravação ainda não disponível' }, ICONE.som);
      if (f.audio) ouvir.addEventListener('click', function () { tocar(f.audio.src); }); else ouvir.disabled = true;
      he.appendChild(ouvir); cab.appendChild(he);
    }
    a.appendChild(cab);
    if (f.regiao) a.appendChild(el('div', { class: 'f-reg' }, esc(f.regiao)));
    a.appendChild(el('p', { class: 'f-res' }, f.resumo));
    if (f.dados && f.dados.length) a.appendChild(el('div', { class: 'f-dados' }, f.dados.map(function (d) { return '<div><b>' + esc(d.n) + '</b><span>' + d.l + '</span></div>'; }).join('')));
    if (f.observar) a.appendChild(el('p', { class: 'f-obs' }, '<span>O que observar</span>' + f.observar));
    if (f.regras) a.appendChild(el('p', { class: 'f-reg2' }, '<span>Antes de ir</span>' + f.regras));
    var pe = el('div', { class: 'f-acoes' }); pe.appendChild(botaoRoteiro(f));
    if (naFolha) pe.appendChild(el('a', { href: '#' + (f.cap || ''), 'data-ficha': f.id, class: 'link-ficha' }, 'Ler no capítulo'));
    a.appendChild(pe); return a;
  }
  /* Compare: os dois desenhos empilhados; o controle mostra mais de um ou do outro. */
  function compare(b) {
    var f = el('figure', { class: 'compare' });
    var caixa = el('div', { class: 'cmp' }, '<div class="cmp-b">' + (b.b.svg ? D.svgs[b.b.svg] : '') + '</div><div class="cmp-a">' + (b.a.svg ? D.svgs[b.a.svg] : '') + '</div><span class="cmp-linha" aria-hidden="true"></span>');
    var r = el('input', { type: 'range', min: '0', max: '100', value: '50', 'aria-label': 'Comparar: ' + b.a.rotulo + ' e ' + b.b.rotulo });
    function pos() { caixa.querySelector('.cmp-a').style.clipPath = 'inset(0 ' + (100 - r.value) + '% 0 0)'; caixa.querySelector('.cmp-linha').style.left = r.value + '%'; }
    r.addEventListener('input', pos);
    f.appendChild(caixa);
    var ctl = el('div', { class: 'cmp-ctl' }, '<span>' + esc(b.a.rotulo) + '</span>'); ctl.appendChild(r); ctl.appendChild(el('span', null, esc(b.b.rotulo)));
    f.appendChild(ctl); f.appendChild(el('figcaption', null, b.legenda + ' <em>Arraste para comparar.</em>'));
    setTimeout(pos, 0); return f;
  }
  /* "História ou tradição?": o palpite vem antes da caixa. */
  function palpite(b, cap) {
    var s = estado(); var id = 'p-' + (b.titulo || '').replace(/<[^>]+>/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    var box = el('section', { class: 'atividade palpite' }, '<span class="rot">História ou tradição? Dê o seu palpite</span><div class="q">' + (b.titulo || '') + '</div>');
    var ops = el('div', { class: 'opcoes', role: 'group' });
    var corpo = el('aside', { class: 'fundo historia-ou-tradicao' }); corpo.hidden = true;
    b.blocos.forEach(function (x) { corpo.appendChild(bloco(x, cap)); });
    var nomes = { historia: 'História', tradicao: 'Tradição', 'as-duas': 'As duas coisas' };
    function mostrar(k) {
      [].forEach.call(ops.children, function (bt) { var v = bt.getAttribute('data-v'); bt.setAttribute('data-estado', v === b.resposta ? 'certa' : (v === k ? 'errada' : '')); bt.setAttribute('aria-pressed', v === k ? 'true' : 'false'); });
      corpo.hidden = false;
    }
    Object.keys(nomes).forEach(function (k) { var bt = el('button', { type: 'button', 'data-v': k }, nomes[k]); bt.addEventListener('click', function () { guardar(function (st) { st.palpites = st.palpites || {}; st.palpites[id] = k; }); mostrar(k); }); ops.appendChild(bt); });
    box.appendChild(ops); box.appendChild(corpo);
    if (s.palpites[id]) mostrar(s.palpites[id]);
    return box;
  }
  /* Palavra: guardar em "Minha viagem" e gravar a própria voz (fica no aparelho). */
  function acoesPalavra(i) {
    var w = el('span', { class: 'p-acoes' });
    var s = estado(); var on = !!s.palavras[i.he];
    var g = el('button', { type: 'button', class: 'mini', 'aria-pressed': on ? 'true' : 'false' }, on ? 'Guardada' : 'Guardar');
    g.addEventListener('click', function () { var v = g.getAttribute('aria-pressed') !== 'true'; guardar(function (st) { st.palavras = st.palavras || {}; if (v) st.palavras[i.he] = { translit: i.translit, pt: i.pt }; else delete st.palavras[i.he]; }); g.setAttribute('aria-pressed', String(v)); g.textContent = v ? 'Guardada' : 'Guardar'; });
    w.appendChild(g);
    if (window.MediaRecorder && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      var rec = el('button', { type: 'button', class: 'mini' }, 'Gravar a minha'); var gravador = null; var minha = null;
      rec.addEventListener('click', function () {
        if (gravador && gravador.state === 'recording') { gravador.stop(); return; }
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function (st) {
          var partes = []; gravador = new MediaRecorder(st);
          gravador.ondataavailable = function (e) { partes.push(e.data); };
          gravador.onstop = function () { st.getTracks().forEach(function (t) { t.stop(); }); minha = URL.createObjectURL(new Blob(partes)); rec.textContent = 'Gravar de novo'; ouvir.hidden = false; };
          gravador.start(); rec.textContent = 'Parar';
        }).catch(function () { rec.textContent = 'Microfone indisponível aqui'; rec.disabled = true; });
      });
      var ouvir = el('button', { type: 'button', class: 'mini' }, 'Ouvir a minha'); ouvir.hidden = true;
      ouvir.addEventListener('click', function () { if (minha) tocar(minha); });
      w.appendChild(rec); w.appendChild(ouvir);
    }
    return w;
  }
  /* Monte seu roteiro: todas as fichas do livro, por região. */
  function roteiro() {
    var s = estado();
    main.innerHTML = cabPagina('Monte seu roteiro', 'mapa', '') + '<p>Marque os lugares que você quer ver. A lista fica em "Minha viagem", agrupada por região, com o que conferir antes de ir. Nada aqui é recomendação de agência: é o seu roteiro.</p>';
    var porReg = {}; D.fichas.forEach(function (f) { var r = f.regiao || 'Outros lugares'; (porReg[r] = porReg[r] || []).push(f); });
    Object.keys(porReg).forEach(function (r) {
      main.appendChild(el('h2', { class: 'pagina', style: 'font-size:22px' }, esc(r)));
      var ul = el('ul', { class: 'lista-roteiro' });
      porReg[r].forEach(function (f) {
        var li = el('li'); li.appendChild(el('span', { class: 't' }, '<b>' + esc(f.nome) + '</b><small>' + esc(f.capTitulo || '') + '</small>'));
        li.appendChild(botaoRoteiro(f));
        var ver = el('button', { type: 'button', class: 'mini', 'aria-expanded': 'false' }, 'Ver ficha');
        ver.addEventListener('click', function () { ver.setAttribute('aria-expanded', 'true'); abrirFolha(esc(f.nome), '', ver); folha.appendChild(fichaEl(f, true)); });
        li.appendChild(ver); ul.appendChild(li);
      });
      main.appendChild(ul);
    });
  }
  function viagem() {
    var s = estado();
    main.innerHTML = cabPagina('Minha viagem', 'mala', '');
    var escolhidas = D.fichas.filter(function (f) { return s.roteiro[f.id]; });
    main.appendChild(el('h2', { class: 'pagina', style: 'font-size:22px' }, 'Meu roteiro'));
    if (!escolhidas.length) main.appendChild(el('p', null, 'Nenhum lugar ainda. <a href="#roteiro">Monte seu roteiro</a>.'));
    var porReg = {}; escolhidas.forEach(function (f) { var r = f.regiao || 'Outros lugares'; (porReg[r] = porReg[r] || []).push(f); });
    Object.keys(porReg).forEach(function (r) {
      main.appendChild(el('h3', { class: 'reg-tit' }, esc(r) + ' · ' + porReg[r].length + (porReg[r].length === 1 ? ' lugar' : ' lugares')));
      porReg[r].forEach(function (f) { main.appendChild(fichaEl(f, true)); });
    });
    if (escolhidas.length) main.appendChild(el('aside', { class: 'fundo aviso' }, '<span class="rot">Shabat</span><p>O Shabat vai do pôr do sol de sexta à noite de sábado: os trens param, e lugares sagrados têm regras próprias. Confira cada ficha e o capítulo 8.</p>'));
    var pal = Object.keys(s.palavras);
    main.appendChild(el('h2', { class: 'pagina', style: 'font-size:22px' }, 'Palavras guardadas'));
    main.appendChild(pal.length ? el('ul', { class: 'lista-roteiro' }, pal.map(function (h) { return '<li><span class="t"><b>' + esc(s.palavras[h].translit) + '</b><small>' + esc(s.palavras[h].pt) + '</small></span><span class="he" lang="he" dir="rtl">' + esc(h) + '</span></li>'; }).join('')) : el('p', null, 'Toque em "Guardar" ao lado de uma palavra em hebraico.'));
    var favs = Object.keys(s.fav).filter(function (k) { return s.fav[k]; });
    main.appendChild(el('h2', { class: 'pagina', style: 'font-size:22px' }, 'Seções guardadas'));
    if (!favs.length) main.appendChild(el('p', null, 'Use o marcador no alto de cada seção.'));
    var fl = el('ul', { class: 'lista-roteiro' });
    favs.forEach(function (id) { D.capitulos.forEach(function (c) { c.secoes.forEach(function (x) { if (x.id === id) fl.appendChild(el('li', null, '<a href="#' + c.id + '" data-secao="' + x.id + '"><b>' + (x.titulo || c.titulo) + '</b><small>' + esc(c.titulo) + '</small></a>')); }); }); });
    main.appendChild(fl);
  }

  /* ── Compreensão da leitura ─────────────────────────────────────────── */
  function embaralha(arr, id) { var r = 0; for (var i = 0; i < id.length; i++) r = (r * 31 + id.charCodeAt(i)) >>> 0; var v = arr.map(function (x, i) { return { x: x, i: i }; }); for (var j = v.length - 1; j > 0; j--) { r = (r * 1103515245 + 12345) >>> 0; var k = r % (j + 1); var t = v[j]; v[j] = v[k]; v[k] = t; } if (v.length > 1 && v.every(function (o, i) { return o.i === i; })) v.push(v.shift()); return v; }
  function marcar(id, certo) { guardar(function (s) { s.exerc = s.exerc || {}; s.exerc[id] = certo; }); atualizarPlacar(); }
  var corrigiveis = ['quiz', 'vf', 'associe', 'complete', 'ordene'];
  function contaCap(cap) { var s = estado(); var tot = 0, feitos = 0, certos = 0; cap.atividades.forEach(function (a) { if (corrigiveis.indexOf(a.tipo) < 0) return; tot++; if (s.exerc[a.id] != null) { feitos++; if (s.exerc[a.id]) certos++; } }); return { tot: tot, feitos: feitos, certos: certos }; }
  var placarAtual = null;
  function placar(cap) { var p = el('p', { class: 'placar', 'aria-live': 'polite' }); placarAtual = { el: p, cap: cap }; setTimeout(atualizarPlacar, 0); return p; }
  function atualizarPlacar() { if (!placarAtual || !document.body.contains(placarAtual.el)) return; var c = contaCap(placarAtual.cap); placarAtual.el.innerHTML = '<b>Seu resultado: ' + c.certos + ' de ' + c.tot + '</b> exercícios certos neste capítulo' + (c.feitos < c.tot ? ' (faltam ' + (c.tot - c.feitos) + ')' : '') + '.'; }
  function caixaExerc(rot, q) { return el('section', { class: 'atividade exercicio' }, '<span class="rot">' + rot + '</span><div class="q">' + q + '</div>'); }
  function retorno(box) { var r = el('div', { class: 'explicacao', 'aria-live': 'polite' }); box.appendChild(r); return r; }
  function associe(a) {
    var s = estado(); var box = caixaExerc('Associe', a.titulo); var dir = embaralha(a.pares.map(function (p) { return p.b; }), a.id);
    var sels = a.pares.map(function (p, i) {
      var lin = el('label', { class: 'assoc-lin' }, '<span>' + p.a + '</span>');
      var sel = el('select', null, '<option value="">escolha</option>' + dir.map(function (d, k) { return '<option value="' + d.i + '">' + d.x.replace(/<[^>]+>/g, '') + '</option>'; }).join(''));
      lin.appendChild(sel); box.appendChild(lin); return sel;
    });
    var bt = el('button', { type: 'button', class: 'botao-roteiro' }, 'Conferir'); box.appendChild(bt); var r = retorno(box);
    bt.addEventListener('click', function () { var n = 0; sels.forEach(function (sel, i) { var ok = sel.value === String(i); sel.setAttribute('data-estado', ok ? 'certa' : 'errada'); if (ok) n++; }); var tudo = n === sels.length; r.innerHTML = tudo ? '<b>Isso.</b> Todos os pares estão certos.' : '<b>' + n + ' de ' + sels.length + '.</b> Os pares certos: ' + a.pares.map(function (p) { return p.a.replace(/<[^>]+>/g, '') + ' = ' + p.b.replace(/<[^>]+>/g, ''); }).join('; ') + '.'; marcar(a.id, tudo); });
    if (s.exerc[a.id] === true) r.innerHTML = '<b>Feito.</b> Você acertou todos os pares.';
    return box;
  }
  function normal(t) { return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function complete(a) {
    var s = estado(); var box = caixaExerc('Complete', a.frase.replace(/_{3,}/g, '____'));
    var inp = el('input', { type: 'text', class: 'busca', 'aria-label': 'Sua resposta', autocomplete: 'off' }); box.appendChild(inp);
    var bt = el('button', { type: 'button', class: 'botao-roteiro' }, 'Conferir'); box.appendChild(bt); var r = retorno(box);
    bt.addEventListener('click', function () { var ok = a.respostas.some(function (x) { return normal(x) === normal(inp.value); }); r.innerHTML = (ok ? '<b>Isso.</b> ' : '<b>A resposta é: ' + esc(a.respostas[0]) + '.</b> ') + (a.explicacao || ''); marcar(a.id, ok); });
    if (s.exerc[a.id] === true) r.innerHTML = '<b>Feito.</b> Resposta: ' + esc(a.respostas[0]) + '.';
    return box;
  }
  function ordene(a) {
    var s = estado(); var box = caixaExerc('Ponha em ordem', a.titulo + ' <small>Use as setas para mover.</small>'); var ol = el('ol', { class: 'ordene' });
    var v = embaralha(a.itens, a.id);
    function desenhar() { ol.innerHTML = ''; v.forEach(function (o, k) { var li = el('li', null, '<span class="t">' + o.x + '</span>'); var up = el('button', { type: 'button', class: 'mini', 'aria-label': 'Subir' }, '↑'); var dn = el('button', { type: 'button', class: 'mini', 'aria-label': 'Descer' }, '↓'); up.disabled = k === 0; dn.disabled = k === v.length - 1; up.addEventListener('click', function () { var t = v[k - 1]; v[k - 1] = v[k]; v[k] = t; desenhar(); ol.children[k - 1].querySelector('button').focus(); }); dn.addEventListener('click', function () { var t = v[k + 1]; v[k + 1] = v[k]; v[k] = t; desenhar(); ol.children[k + 1].querySelectorAll('button')[1].focus(); }); li.appendChild(up); li.appendChild(dn); ol.appendChild(li); }); }
    desenhar(); box.appendChild(ol);
    var bt = el('button', { type: 'button', class: 'botao-roteiro' }, 'Conferir'); box.appendChild(bt); var r = retorno(box);
    bt.addEventListener('click', function () { var ok = v.every(function (o, k) { return o.i === k; }); r.innerHTML = ok ? '<b>Isso.</b> A ordem está certa.' : '<b>Ainda não.</b> A ordem certa: ' + a.itens.map(function (x, i) { return (i + 1) + '. ' + x.replace(/<[^>]+>/g, ''); }).join(' '); marcar(a.id, ok); });
    if (s.exerc[a.id] === true) r.innerHTML = '<b>Feito.</b> Ordem certa.';
    return box;
  }
  function aberta(a) {
    var s = estado(); var box = caixaExerc('Responda com as suas palavras', a.pergunta);
    var ta = el('textarea', { 'aria-label': 'Sua resposta' }); ta.value = s.abertas[a.id] || ''; ta.addEventListener('input', function () { guardar(function (st) { st.abertas = st.abertas || {}; st.abertas[a.id] = ta.value; }); });
    box.appendChild(ta);
    var bt = el('button', { type: 'button', class: 'mini', 'aria-expanded': 'false' }, 'Ver a resposta sugerida'); var sug = el('div', { class: 'explicacao' }, '<b>Resposta sugerida:</b> ' + a.resposta); sug.hidden = true;
    bt.addEventListener('click', function () { sug.hidden = !sug.hidden; bt.setAttribute('aria-expanded', String(!sug.hidden)); });
    box.appendChild(bt); box.appendChild(sug); return box;
  }
  function cabPagina(titulo, vin, texto) { return '<div class="sec-cab"><h1 class="pagina">' + titulo + '</h1>' + (D.vinhetas[vin] ? '<div class="vinheta" aria-hidden="true">' + D.vinhetas[vin] + '</div>' : '') + '</div>' + (texto ? '<p>' + texto + '</p>' : ''); }
  function exercicios() {
    main.innerHTML = cabPagina('Exercícios', 'lupa', 'A compreensão da leitura de cada capítulo, para fazer depois de ler. O resultado fica guardado neste aparelho.');
    var ul = el('ul', { class: 'lista-roteiro' });
    D.capitulos.forEach(function (c) {
      var sec = c.secoes.filter(function (x) { return x.compreensao; })[0]; var k = contaCap(c); if (!k.tot) return;
      var li = el('li', null, '<a href="#' + c.id + '"' + (sec ? ' data-secao="' + sec.id + '"' : '') + '><b>' + String(c.numero).padStart(2, '0') + '. ' + esc(c.titulo) + '</b><small>' + k.certos + ' de ' + k.tot + ' certos' + (k.feitos === k.tot ? ' · completo' : '') + '</small></a>');
      var barra2 = el('span', { class: 'mini-barra' }, '<i style="width:' + Math.round(100 * k.certos / k.tot) + '%"></i>'); li.appendChild(barra2); ul.appendChild(li);
    });
    main.appendChild(ul);
  }

  /* Pergunta de múltipla escolha: a resposta fica guardada e a explicação
     aparece sempre, certa ou não. */
  function quiz(q) {
    var s = estado(); var box = el('section', { class: 'atividade', 'aria-labelledby': q.id + '-q' });
    box.innerHTML = '<span class="rot">' + (q.pegadinha ? 'Pegadinha do guia' : 'Teste o olhar') + '</span><div class="q" id="' + q.id + '-q">' + q.pergunta + '</div>';
    var ops = el('div', { class: 'opcoes', role: 'group', 'aria-labelledby': q.id + '-q' });
    var exp = el('div', { class: 'explicacao', 'aria-live': 'polite' });
    function mostrar(k) {
      [].forEach.call(ops.children, function (b, j) { b.setAttribute('data-estado', q.opcoes[j].certa ? 'certa' : (j === k ? 'errada' : '')); b.setAttribute('aria-pressed', j === k ? 'true' : 'false'); });
      var certa = q.opcoes.filter(function (o) { return o.certa; })[0];
      exp.innerHTML = (q.opcoes[k].certa ? '<b>Isso.</b> ' : '<b>Quase.</b> A resposta é: ' + certa.texto + '. ') + (certa.explicacao || '');
    }
    q.opcoes.forEach(function (o, k) { var b = el('button', { type: 'button' }, o.texto); b.addEventListener('click', function () { guardar(function (s) { s.resp = s.resp || {}; s.resp[q.id] = k; s.exerc = s.exerc || {}; s.exerc[q.id] = !!o.certa; }); mostrar(k); atualizarPlacar(); }); ops.appendChild(b); });
    box.appendChild(ops); box.appendChild(exp);
    if (s.resp[q.id] != null) mostrar(s.resp[q.id]);
    return box;
  }
  function vf(q) {
    return quiz({ id: q.id, pergunta: q.afirmacao, opcoes: [{ texto: 'Verdadeiro', certa: q.resposta, explicacao: q.explicacao }, { texto: 'Falso', certa: !q.resposta, explicacao: q.explicacao }] });
  }
  function desafio(o) {
    var s = estado(); var box = el('section', { class: 'atividade desafio' });
    box.innerHTML = '<span class="rot">Desafio de observação</span><div class="q">' + o.titulo + '</div><p>' + o.texto + '</p>';
    var lab = el('label', null, '<input type="checkbox"> Observei isto na viagem');
    var inp = lab.querySelector('input'); inp.checked = !!s.desafios[o.id];
    inp.addEventListener('change', function () { guardar(function (s) { s.desafios = s.desafios || {}; s.desafios[o.id] = inp.checked; }); });
    box.appendChild(lab); return box;
  }
  /* Linha do tempo explorável: filtros por época; a escolha é só da tela. */
  function linhaDoTempo(b) {
    var epoca = function (d) { var t = d.replace(/<[^>]+>/g, ''); if (/a\.\s?C\./.test(t)) return 'antiguidade'; var m = t.match(/(\d{3,4})/); var n = m ? +m[1] : 0; if (/s[ée]c/i.test(t) && !/\d{3,4}/.test(t)) return 'antiguidade'; return n >= 1800 ? 'moderna' : 'medieval'; };
    var nomes = { todas: 'Tudo', antiguidade: 'Antes de Cristo', medieval: 'Até 1800', moderna: 'Desde 1800' };
    var box = el('section', { class: 'ldt' }, (b.titulo ? '<div class="ldt-tit">' + esc(b.titulo) + '</div>' : ''));
    var presentes = { todas: 1 }; b.itens.forEach(function (i) { presentes[epoca(i.data)] = 1; });
    var filtros = el('div', { class: 'ldt-filtros', role: 'group', 'aria-label': 'Filtrar por época' });
    var ol = el('ol');
    b.itens.forEach(function (i) { var li = el('li', { 'data-epoca': epoca(i.data) }, '<span class="ldt-data">' + i.data + '</span><span class="ldt-ev">' + i.evento + '</span>'); ol.appendChild(li); });
    Object.keys(nomes).filter(function (k) { return presentes[k]; }).forEach(function (k) {
      var bt = el('button', { type: 'button', 'aria-pressed': k === 'todas' ? 'true' : 'false' }, nomes[k]);
      bt.addEventListener('click', function () { [].forEach.call(filtros.children, function (x) { x.setAttribute('aria-pressed', x === bt ? 'true' : 'false'); }); [].forEach.call(ol.children, function (li) { li.hidden = k !== 'todas' && li.getAttribute('data-epoca') !== k; }); });
      filtros.appendChild(bt);
    });
    if (filtros.children.length > 2) box.appendChild(filtros);
    box.appendChild(ol); return box;
  }
  function checklist(b) {
    var s = estado(); var box = el('section', { class: 'atividade desafio' }, '<span class="rot">Checklist</span><div class="q">' + esc(b.titulo || '') + '</div>');
    b.itens.forEach(function (t, k) {
      var id = 'ck-' + String(b.titulo || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + k; var lab = el('label', null, '<input type="checkbox"> ' + t); var inp = lab.querySelector('input'); inp.checked = !!s.check[id];
      inp.addEventListener('change', function () { guardar(function (s) { s.check = s.check || {}; s.check[id] = inp.checked; }); });
      box.appendChild(lab);
    });
    return box;
  }

  /* ── páginas ────────────────────────────────────────────────────────── */
  function arte(id) { return id && D.svgs[id] ? D.svgs[id].replace(/preserveAspectRatio="[^"]*"/, 'preserveAspectRatio="xMidYMax slice"') : ''; }
  function inicio() {
    var s = estado(); var c1 = D.capitulos[0];
    main.innerHTML = '';
    var h = el('section', { class: 'heroi' }, '<div class="arte">' + arte(c1.abertura.imagem) + '</div><div class="veu"></div><div class="txt"><div class="kicker"><span>Hebraico Fluente</span><span class="he" lang="he">ישראל</span></div><h1>' + esc(D.titulo) + '</h1><p>' + esc(D.subtitulo) + '.</p></div>');
    main.appendChild(h);
    var prontos = D.indice.filter(function (c) { return c.disponivel && !c.especial; }).length;
    main.appendChild(el('p', { class: 'aviso-prototipo' }, 'Protótipo para aprovação: ' + (prontos === 1 ? 'só o capítulo 1 está aqui' : prontos + ' capítulos estão aqui') + '. O progresso e o diário ficam guardados neste aparelho.'));
    if (s.ultima) { var u = porId(s.ultima.cap); if (u) main.appendChild(el('p', null, '<a class="botao" href="#' + u.id + '" data-secao="' + s.ultima.secao + '">Continuar de onde parou</a>')); }
    else main.appendChild(el('p', null, '<a class="botao" href="#' + c1.id + '">Começar pelo capítulo 1</a>'));
    var lista = el('ol', { class: 'capitulos', 'aria-label': 'Capítulos' });
    D.indice.forEach(function (c) {
      var li = el('li');
      li.innerHTML = c.especial
        ? '<a href="#' + c.id + '"><span class="n">' + String(c.n).padStart(2, '0') + '</span><span class="t">' + esc(c.titulo) + '<small>Para escrever</small></span><span></span></a>'
        : c.disponivel
        ? '<a href="#' + c.id + '"><span class="n">' + String(c.n).padStart(2, '0') + '</span><span class="t">' + esc(c.titulo) + '</span><span class="pct">' + pct(porId(c.id)) + '%</span></a>'
        : '<div class="off"><span class="n">' + String(c.n).padStart(2, '0') + '</span><span class="t">' + esc(c.titulo || 'Capítulo ' + c.n) + '<small>Em produção</small></span><span></span></div>';
      lista.appendChild(li);
    });
    main.appendChild(el('h2', { class: 'pagina', style: 'font-size:26px' }, 'Capítulos'));
    main.appendChild(lista);
    var favs = Object.keys(s.fav).filter(function (k) { return s.fav[k]; });
    if (favs.length) {
      main.appendChild(el('h2', { class: 'pagina', style: 'font-size:26px' }, 'Favoritos'));
      var fl = el('ol', { class: 'capitulos' });
      favs.forEach(function (id) { D.capitulos.forEach(function (c) { c.secoes.forEach(function (x) { if (x.id === id) fl.appendChild(el('li', null, '<a href="#' + c.id + '" data-secao="' + x.id + '"><span class="n">' + (x.rubrica ? '<span class="he">' + x.rubrica + '</span>' : '') + '</span><span class="t">' + (x.titulo || c.titulo) + '<small>' + esc(c.titulo) + '</small></span><span></span></a>')); }); }); });
      main.appendChild(fl);
    }
  }

  var observador = null;
  function capitulo(cap, alvo) {
    main.innerHTML = '';
    main.appendChild(el('section', { class: 'heroi' }, '<div class="arte">' + arte(cap.abertura.imagem) + '</div><div class="veu"></div><div class="txt"><div class="kicker"><span>Capítulo ' + String(cap.numero).padStart(2, '0') + '</span></div><h1>' + esc(cap.titulo) + '</h1><p>' + (cap.abertura.frase || esc(cap.subtitulo || '')) + '</p>' + (cap.abertura.credito ? '<div class="credito">' + esc(cap.abertura.credito) + '</div>' : '') + '</div>'));
    var s = estado();
    cap.secoes.forEach(function (sec) {
      var art = el('section', { class: 'secao' + (sec.titulo ? '' : ' entrada'), id: sec.id });
      if (sec.titulo) {
        var rub = el('div', { class: 'rubrica' }, '<span class="he" lang="he">' + sec.rubrica + '</span><span>' + esc(cap.titulo) + '</span>');
        var acoes = el('span', { class: 'acoes' });
        var fav = el('button', { class: 'icone', 'aria-pressed': s.fav[sec.id] ? 'true' : 'false', 'aria-label': 'Guardar esta seção nos favoritos' }, s.fav[sec.id] ? ICONE.favOn : ICONE.fav);
        fav.addEventListener('click', function () { var on = fav.getAttribute('aria-pressed') !== 'true'; guardar(function (st) { st.fav = st.fav || {}; st.fav[sec.id] = on; }); fav.setAttribute('aria-pressed', String(on)); fav.innerHTML = on ? ICONE.favOn : ICONE.fav; });
        acoes.appendChild(fav); rub.appendChild(acoes); art.appendChild(rub);
        if (sec.vinheta && D.vinhetas[sec.vinheta]) { var cabv = el('div', { class: 'sec-cab' }); cabv.appendChild(el('h2', null, sec.titulo)); cabv.appendChild(el('div', { class: 'vinheta', 'aria-hidden': 'true' }, D.vinhetas[sec.vinheta])); art.appendChild(cabv); }
        else art.appendChild(el('h2', null, sec.titulo));
        if (sec.compreensao) art.appendChild(placar(cap));
      }
      sec.blocos.forEach(function (b) { art.appendChild(bloco(b, cap)); });
      if (sec.fontes.length) art.appendChild(el('details', { class: 'fontes' }, '<summary>Fontes desta seção (' + sec.fontes.length + ')</summary><ol>' + sec.fontes.map(function (f) { return '<li>' + (f.url ? '<a href="' + esc(f.url) + '" target="_blank" rel="noopener">' + esc(f.abnt) + '</a>' : esc(f.abnt)) + '</li>'; }).join('') + '</ol>' + (sec.revisado_em ? '<p>Consultadas até ' + sec.revisado_em.split('-').reverse().join('/') + '.</p>' : '') + '</details>'));
      main.appendChild(art);
    });
    if (observador) observador.disconnect();
    observador = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { var id = e.target.id; guardar(function (st) { st.lidas = st.lidas || {}; st.lidas[id] = true; st.ultima = { cap: cap.id, secao: id }; }); barra.style.width = pct(cap) + '%'; } });
    }, { rootMargin: '0px 0px -60% 0px' });
    [].forEach.call(main.querySelectorAll('.secao'), function (x) { observador.observe(x); });
    barra.style.width = pct(cap) + '%';
    if (alvo) { var a = document.getElementById(alvo); if (a) a.scrollIntoView(); } else window.scrollTo(0, 0);
  }

  function glossario() {
    main.innerHTML = cabPagina('Glossário', 'letras', 'As palavras em hebraico deste material. Toque no alto-falante para ouvir a gravação, quando houver.');
    var busca = el('input', { class: 'busca', type: 'search', placeholder: 'Buscar em português, transliteração ou hebraico', 'aria-label': 'Buscar no glossário' });
    main.appendChild(busca);
    var itens = []; D.capitulos.forEach(function (c) { c.vocabulario.forEach(function (v) { itens.push(v); }); });
    var vistos = {}; itens = itens.filter(function (v) { if (vistos[v.he]) return false; vistos[v.he] = 1; return true; }).sort(function (a, b) { return a.translit.localeCompare(b.translit, 'pt'); });
    var caixa = el('div'); main.appendChild(caixa);
    function filtrar() {
      var t = busca.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      var achados = itens.filter(function (v) { return !t || (v.translit + ' ' + v.pt + ' ' + v.he + ' ' + String(v.nota || '').replace(/<[^>]+>/g, '')).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').indexOf(t) >= 0; });
      caixa.innerHTML = '';
      caixa.appendChild(bloco({ tipo: 'vocabulario', titulo: achados.length + ' palavra' + (achados.length === 1 ? '' : 's'), itens: achados }));
    }
    busca.addEventListener('input', filtrar); filtrar();
  }

  /* Onde eu estive: o leitor marca no mapa os lugares do livro por onde
     passou (com a data) e põe alfinetes próprios onde tocar. Tudo fica no
     aparelho, em estado.mapa; "Copiar meu diário" leva junto. */
  function mapaMarcar(b) {
    var pts = D.pontos['mapa-marcar-web'] || [];
    var sec = el('section', { class: 'secao marcar', id: 'onde-estive' });
    sec.innerHTML = '<div class="rubrica"><span>Diário</span></div><h2>Onde eu estive</h2><div class="instrucao"><p>Toque num lugar do livro para marcar que você passou por lá e anote a data. Esteve em outro lugar? Toque em "Marcar outro lugar" e depois no ponto do mapa.</p></div>';
    var placar = el('p', { class: 'placar-mapa', 'aria-live': 'polite' }); sec.appendChild(placar);
    var fig = el('figure'); var alvo = el('div', { class: 'alvo mapa-marcar' }, D.svgs['mapa-marcar-web']); fig.appendChild(alvo);
    if (b.ativo) fig.appendChild(el('figcaption', null, '<span class="credito">' + esc(b.ativo.credito_curto || '') + '</span>'));
    var acoes = el('div', { class: 'marcar-acoes' });
    var novo = el('button', { class: 'botao-roteiro', type: 'button', 'aria-pressed': 'false' }, 'Marcar outro lugar');
    var dica = el('span', { class: 'marcar-dica', 'aria-live': 'polite' });
    acoes.appendChild(novo); acoes.appendChild(dica);
    var form = el('form', { class: 'marcar-form' }, '<label>Nome do lugar<input name="nome" maxlength="60" autocomplete="off" required></label><div class="marcar-botoes"><button class="botao" type="submit">Salvar alfinete</button><button class="botao claro" type="button" data-cancelar>Cancelar</button></div>');
    form.hidden = true;
    var lista = el('ul', { class: 'marcar-lista' });
    sec.appendChild(acoes); sec.appendChild(fig); sec.appendChild(form); sec.appendChild(lista);
    var escolhendo = false, provisorio = null;

    function mudar(f) { guardar(function (st) { st.mapa = st.mapa || {}; st.mapa.lugares = st.mapa.lugares || {}; st.mapa.meus = st.mapa.meus || []; f(st.mapa); }); desenhar(); }
    function data(valor, onde) {
      var i = el('input', { type: 'date', 'aria-label': 'Data da visita: ' + onde }); i.value = valor || ''; return i;
    }
    function modo(ligado) {
      escolhendo = ligado; novo.setAttribute('aria-pressed', ligado ? 'true' : 'false'); alvo.classList.toggle('escolhendo', ligado);
      dica.textContent = ligado ? 'Toque no mapa onde você esteve.' : '';
      if (!ligado && provisorio) { provisorio.remove(); provisorio = null; form.hidden = true; }
    }
    function desenhar() {
      var m = estado().mapa;
      [].forEach.call(alvo.querySelectorAll('.alfinete'), function (x) { if (x !== provisorio) x.remove(); });
      lista.innerHTML = '';
      pts.forEach(function (p, i) {
        var on = !!m.lugares[p.id];
        var bt = el('button', { class: 'alfinete' + (on ? ' on' : ''), type: 'button', style: 'left:' + p.x + '%;top:' + p.y + '%', 'aria-pressed': on ? 'true' : 'false', 'aria-label': p.nome + (on ? ': marcado' : ': marcar') }, '<span>' + (on ? '✓' : i + 1) + '</span>');
        bt.addEventListener('click', function (e) { e.stopPropagation(); mudar(function (mm) { if (mm.lugares[p.id]) delete mm.lugares[p.id]; else mm.lugares[p.id] = { data: '' }; }); });
        alvo.appendChild(bt);
        var li = el('li', { class: on ? 'on' : null });
        var rot = el('label', { class: 'marcar-item' }, '<input type="checkbox"' + (on ? ' checked' : '') + '><span>' + (i + 1) + '. ' + esc(p.nome) + '</span>');
        rot.querySelector('input').addEventListener('change', function () { bt.click(); });
        li.appendChild(rot);
        if (on) { var d = data(m.lugares[p.id].data, p.nome); d.addEventListener('change', function () { guardar(function (st) { st.mapa.lugares[p.id] = { data: d.value }; }); }); li.appendChild(d); }
        lista.appendChild(li);
      });
      m.meus.forEach(function (p, k) {
        var bt = el('button', { class: 'alfinete meu on', type: 'button', style: 'left:' + p.x + '%;top:' + p.y + '%', 'aria-label': p.nome + ': lugar marcado por você' }, '<span>★</span>');
        bt.addEventListener('click', function (e) { e.stopPropagation(); var item = lista.querySelector('[data-meu="' + k + '"] input'); if (item) item.focus(); });
        alvo.appendChild(bt);
        var li = el('li', { class: 'on meu', 'data-meu': k }, '<span class="marcar-item"><span class="estrela" aria-hidden="true">★</span><span>' + esc(p.nome) + '</span></span>');
        var d = data(p.data, p.nome); d.addEventListener('change', function () { guardar(function (st) { if (st.mapa.meus[k]) st.mapa.meus[k].data = d.value; }); });
        var tirar = el('button', { class: 'marcar-tirar', type: 'button', 'aria-label': 'Tirar ' + p.nome + ' do mapa' }, 'Tirar');
        tirar.addEventListener('click', function () { mudar(function (mm) { mm.meus.splice(k, 1); }); });
        li.appendChild(d); li.appendChild(tirar); lista.appendChild(li);
      });
      var n = Object.keys(m.lugares).filter(function (id) { return pts.some(function (p) { return p.id === id; }); }).length;
      placar.innerHTML = '<b>' + n + '</b> de ' + pts.length + ' lugares do livro' + (m.meus.length ? ' e <b>' + m.meus.length + '</b> ' + (m.meus.length === 1 ? 'lugar seu' : 'lugares seus') : '') + ' no seu mapa';
    }
    novo.addEventListener('click', function () { modo(!escolhendo); });
    alvo.addEventListener('click', function (e) {
      if (!escolhendo) return;
      var r = alvo.getBoundingClientRect();
      var x = +(100 * (e.clientX - r.left) / r.width).toFixed(2), y = +(100 * (e.clientY - r.top) / r.height).toFixed(2);
      if (provisorio) provisorio.remove();
      provisorio = el('span', { class: 'alfinete meu provisorio', style: 'left:' + x + '%;top:' + y + '%' }, '<span>★</span>');
      provisorio.dataset.x = x; provisorio.dataset.y = y; alvo.appendChild(provisorio);
      form.hidden = false; dica.textContent = 'Agora dê um nome ao lugar.'; form.nome.focus();
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault(); var nome = form.nome.value.trim(); if (!nome || !provisorio) return;
      var x = +provisorio.dataset.x, y = +provisorio.dataset.y;
      form.nome.value = ''; modo(false);
      mudar(function (mm) { mm.meus.push({ x: x, y: y, nome: nome, data: '' }); });
    });
    form.querySelector('[data-cancelar]').addEventListener('click', function () { form.nome.value = ''; modo(false); });
    desenhar();
    return sec;
  }
  function textoDoMapa() {
    var m = estado().mapa; var pts = D.pontos['mapa-marcar-web'] || [];
    var linhas = pts.filter(function (p) { return m.lugares[p.id]; }).map(function (p) { return '- ' + p.nome + (m.lugares[p.id].data ? ' (' + m.lugares[p.id].data.split('-').reverse().join('/') + ')' : ''); })
      .concat(m.meus.map(function (p) { return '- ' + p.nome + (p.data ? ' (' + p.data.split('-').reverse().join('/') + ')' : ''); }));
    return linhas.length ? '## Onde eu estive\n\n' + linhas.join('\n') + '\n' : '';
  }

  function diario() {
    var s = estado();
    main.innerHTML = '<h1 class="pagina">Diário de descobertas</h1><p>Escreva antes, durante e depois da viagem. O texto fica guardado neste aparelho; use "Copiar meu diário" para levar uma cópia.</p>';
    var blocos = D.diario ? D.diario.secoes.reduce(function (a, x) { return a.concat(x.blocos); }, []) : [];
    if (D.diario && D.diario.abertura.imagem) main.insertBefore(el('section', { class: 'heroi' }, '<div class="arte">' + arte(D.diario.abertura.imagem) + '</div><div class="veu"></div><div class="txt"><div class="kicker"><span>Capítulo 10</span></div><h1>Diário de descobertas</h1></div>'), main.firstChild);
    var kd = 0;
    blocos.forEach(function (b) {
      if (b.tipo === 'figura' && b.id === 'mapa-para-marcar' && D.svgs['mapa-marcar-web']) { main.appendChild(mapaMarcar(b)); return; }
      if (b.tipo === 'figura') { main.appendChild(figura(b)); return; }
      if (b.tipo === 'checklist') { main.appendChild(checklist(b)); return; }
      if (b.tipo !== 'diario') return;
      var id = 'd' + (kd++); var sec = el('section', { class: 'secao' });
      sec.innerHTML = '<div class="rubrica"><span>Diário</span></div><h2>' + esc(b.titulo) + '</h2>' + (b.instrucao ? '<div class="instrucao">' + b.instrucao + '</div>' : '');
      var ta = el('textarea', { 'aria-label': b.titulo }); ta.value = s.diario[id] || '';
      ta.addEventListener('input', function () { guardar(function (st) { st.diario = st.diario || {}; st.diario[id] = ta.value; }); });
      sec.appendChild(ta); main.appendChild(sec);
    });
    /* Copiar, não baixar: funciona também dentro de páginas publicadas, onde
       download iniciado por script é bloqueado. */
    var baixar = el('button', { class: 'botao claro', type: 'button' }, 'Copiar meu diário');
    var aviso = el('span', { 'aria-live': 'polite', style: 'margin-left:12px;font-family:var(--f-rotulo);font-size:14px' });
    baixar.addEventListener('click', function () {
      var st = estado(); var txt = blocos.filter(function (b) { return b.tipo === 'diario'; }).map(function (b, k) { return '## ' + b.titulo + '\n\n' + (st.diario['d' + k] || '') + '\n'; }).join('\n');
      txt += (textoDoMapa() ? '\n' + textoDoMapa() : '');
      var ok = function () { aviso.textContent = 'Copiado. Cole no seu aplicativo de notas.'; };
      var falha = function () { var ta = el('textarea', { 'aria-label': 'Seu diário, para copiar' }); ta.value = txt; main.appendChild(ta); ta.select(); aviso.textContent = 'Selecionado abaixo: copie pelo menu do aparelho.'; };
      try { navigator.clipboard.writeText(txt).then(ok, falha); } catch (e) { falha(); }
    });
    var linhaB = el('p', { style: 'margin-top:24px' }); linhaB.appendChild(baixar); linhaB.appendChild(aviso); main.appendChild(linhaB);
  }

  /* ── rotas ──────────────────────────────────────────────────────────── */
  /* Rotas com uma palavra só (#cap01, #glossario, #diario): é o que uma
     página publicada aceita. A seção para onde rolar vai em memória. */
  var rolarPara = null;
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-secao], a[data-ficha]'); if (!a) return;
    rolarPara = a.getAttribute('data-secao') || 'ficha-' + a.getAttribute('data-ficha');
    if (a.getAttribute('href') === location.hash) { fecharFolha(); var alvo = document.getElementById(rolarPara); if (alvo) alvo.scrollIntoView(); }
  });
  function rota() {
    fecharFolha();
    var t = location.hash.replace(/^#\/?/, '').split('/')[0];
    [].forEach.call(document.querySelectorAll('.topo nav a'), function (a) { a.removeAttribute('aria-current'); });
    var marcar = function (h) { var a = document.querySelector('.topo nav a[href="' + h + '"]'); if (a) a.setAttribute('aria-current', 'page'); };
    barra.style.width = '0';
    if (t === 'glossario') { marcar('#glossario'); glossario(); }
    else if (t === 'diario') { marcar('#diario'); diario(); }
    else if (t === 'roteiro') { marcar('#roteiro'); roteiro(); }
    else if (t === 'viagem') { marcar('#viagem'); viagem(); }
    else if (t === 'exercicios') { marcar('#exercicios'); exercicios(); }
    else if (porId(t)) capitulo(porId(t), rolarPara);
    else { marcar('#inicio'); inicio(); }
    rolarPara = null;
    main.focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', rota);
  rota();
})();
