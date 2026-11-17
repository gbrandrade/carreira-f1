/* Gráficos SVG leves: radar, anel, área de posições, barras horizontais, loader de pontos e traçados realistas de pistas. */
(function () {
  const ui = Game.ui, h = ui.h, cl = Game.utils.clamp;
  let gid = 0;
  const svgWrap = (cls, html) => h('div', { class: 'chart ' + (cls || ''), html });

  /* Traçados realistas dos circuitos (pontos normalizados no espaço 0..100 com margem segura para nunca cortar na box). */
  const TRACKS = {
    // F1 Calendário Principal (24)
    aus: { pts: [[24,68],[22,52],[28,36],[42,26],[54,28],[58,38],[68,36],[78,42],[76,56],[66,62],[70,74],[56,78],[44,72],[34,76]], closed: true },
    chn: { pts: [[26,64],[34,36],[46,24],[54,30],[44,42],[48,50],[62,44],[78,26],[80,34],[58,66],[68,74],[52,78],[34,74]], closed: true },
    jpn: { pts: [[76,54],[66,34],[56,38],[52,30],[46,36],[42,28],[34,34],[26,48],[22,64],[30,74],[44,66],[54,54],[64,68],[78,66]], closed: true },
    bhr: { pts: [[26,72],[26,30],[34,26],[46,42],[58,34],[74,38],[76,52],[60,56],[66,68],[50,74],[38,66]], closed: true },
    ksa: { pts: [[28,80],[24,62],[28,44],[24,26],[34,20],[44,32],[54,48],[68,64],[76,76],[64,80],[50,66],[38,74]], closed: true },
    mia: { pts: [[22,62],[26,42],[40,34],[54,36],[64,28],[78,34],[76,48],[62,54],[74,68],[52,72],[32,68]], closed: true },
    can: { pts: [[22,64],[26,46],[38,38],[50,42],[64,34],[78,28],[80,36],[62,52],[46,58],[32,66]], closed: true },
    mon: { pts: [[24,68],[26,44],[38,26],[54,24],[66,32],[76,28],[78,38],[64,46],[52,54],[44,64],[34,74]], closed: true },
    esp: { pts: [[24,66],[26,40],[38,28],[56,28],[68,38],[62,50],[76,56],[74,70],[54,74],[42,66],[32,72]], closed: true },
    aut: { pts: [[24,68],[28,32],[42,24],[68,30],[76,42],[62,52],[72,64],[54,74],[36,70]], closed: true },
    gbr: { pts: [[34,74],[24,58],[28,40],[42,26],[54,32],[62,24],[76,32],[74,52],[64,66],[52,60],[44,74]], closed: true },
    bel: { pts: [[30,74],[24,64],[32,54],[42,32],[58,24],[74,30],[78,44],[64,52],[70,66],[52,74],[38,76]], closed: true },
    hun: { pts: [[26,72],[24,42],[36,28],[52,32],[58,24],[72,32],[76,48],[62,56],[68,68],[50,74],[38,66]], closed: true },
    ned: { pts: [[30,74],[24,46],[34,26],[48,30],[54,44],[68,34],[78,46],[72,66],[54,60],[44,74]], closed: true },
    ita: { pts: [[26,72],[26,30],[36,24],[56,28],[74,36],[76,52],[64,64],[48,72]], closed: true },
    mad: { pts: [[24,66],[26,38],[42,26],[62,28],[76,40],[72,56],[58,54],[64,70],[44,74],[30,72]], closed: true },
    aze: { pts: [[24,74],[24,38],[38,38],[38,24],[56,24],[56,36],[72,36],[76,54],[64,68],[44,74]], closed: true },
    sgp: { pts: [[24,66],[24,40],[38,40],[38,26],[60,26],[60,42],[76,42],[76,64],[58,64],[58,74],[36,74]], closed: true },
    usa: { pts: [[24,68],[24,30],[34,38],[42,34],[48,42],[56,36],[64,44],[78,34],[76,52],[60,64],[66,74],[46,74],[34,68]], closed: true },
    mex: { pts: [[24,68],[24,32],[38,28],[46,42],[58,36],[70,44],[76,60],[64,72],[54,64],[44,72]], closed: true },
    bra: { pts: [[26,68],[24,44],[34,28],[52,24],[72,32],[76,48],[62,54],[52,44],[44,54],[56,64],[44,74],[32,72]], closed: true },
    lvs: { pts: [[24,66],[28,36],[46,24],[74,26],[78,44],[66,58],[74,72],[46,74],[30,68]], closed: true },
    qat: { pts: [[26,72],[26,30],[42,24],[58,32],[74,30],[76,48],[62,56],[72,68],[50,74],[36,68]], closed: true },
    abu: { pts: [[26,72],[24,34],[36,24],[56,28],[74,36],[64,52],[76,62],[62,74],[44,68]], closed: true },

    // F1 Reservas (8)
    imo: { pts: [[24,66],[28,44],[42,30],[58,26],[74,34],[76,50],[62,58],[52,68],[36,72]], closed: true },
    por: { pts: [[26,70],[24,36],[38,24],[54,32],[64,26],[76,38],[72,58],[56,56],[48,72]], closed: true },
    fra: { pts: [[24,66],[26,34],[48,26],[76,28],[76,44],[60,48],[72,64],[50,74],[32,70]], closed: true },
    ger: { pts: [[26,72],[26,36],[44,24],[76,30],[74,50],[60,58],[66,70],[46,74]], closed: true },
    tur: { pts: [[26,70],[24,44],[36,28],[54,24],[66,34],[58,48],[76,54],[72,70],[48,74]], closed: true },
    mug: { pts: [[24,66],[26,34],[40,26],[52,38],[64,28],[76,40],[72,62],[56,66],[42,74]], closed: true },
    mal: { pts: [[26,72],[26,32],[42,26],[56,40],[74,32],[76,52],[58,64],[44,74]], closed: true },
    rsa: { pts: [[26,68],[24,40],[38,26],[58,28],[74,40],[72,60],[56,56],[46,72]], closed: true },

    // F4 & Kart
    mis: { pts: [[26,68],[24,38],[40,26],[62,28],[76,42],[70,64],[52,60],[42,74]], closed: true },
    val: { pts: [[24,66],[28,34],[48,24],[72,32],[76,54],[60,68],[40,72]], closed: true },
    br1: { pts: [[24,66],[26,32],[56,26],[76,40],[74,64],[48,72]], closed: true },
    br2: { pts: [[26,70],[24,36],[46,26],[74,34],[72,64],[46,72]], closed: true },
    br3: { pts: [[24,62],[28,34],[54,28],[76,42],[72,66],[46,68]], closed: true },
    br4: { pts: [[24,66],[28,36],[52,26],[76,38],[72,66],[44,72]], closed: true },
    br5: { pts: [[26,70],[24,42],[38,26],[56,34],[72,28],[76,50],[62,68],[42,72]], closed: true },

    // Menu principal
    'menu-art': { pts: [[26,68],[24,44],[34,28],[52,24],[72,32],[76,48],[62,54],[52,44],[44,54],[56,64],[44,74],[32,72]], closed: true }
  };

  ui.radar = function (axes, series, o) {
    o = o || {}; const c = 100, R = 66, min = o.min != null ? o.min : 30, max = o.max || 100, n = axes.length;
    const ang = i => -Math.PI / 2 + i * 2 * Math.PI / n;
    const pt = (i, v) => { const r = R * cl((v - min) / (max - min), 0, 1); return [c + r * Math.cos(ang(i)), c + r * Math.sin(ang(i))]; };
    const poly = (vals) => vals.map((v, i) => pt(i, v).map(x => x.toFixed(1)).join(',')).join(' ');
    let s = `<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">`;
    [.25, .5, .75, 1].forEach(f => { s += `<polygon points="${axes.map((_, i) => [c + R * f * Math.cos(ang(i)), c + R * f * Math.sin(ang(i))].map(x => x.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="var(--line-strong)" stroke-width=".6"/>`; });
    axes.forEach((a, i) => {
      const x = c + R * Math.cos(ang(i)), y = c + R * Math.sin(ang(i)), lx = c + (R + 15) * Math.cos(ang(i)), ly = c + (R + 15) * Math.sin(ang(i)), cs = Math.cos(ang(i));
      s += `<line x1="${c}" y1="${c}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--line-strong)" stroke-width=".6"/>`;
      s += `<text x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" text-anchor="${Math.abs(cs) < .3 ? 'middle' : cs > 0 ? 'start' : 'end'}" font-size="8" font-family="var(--mono)" fill="var(--text-2)" letter-spacing=".5">${a.label}</text>`;
    });
    series.forEach(se => {
      const col = se.color || 'var(--accent)';
      s += `<polygon points="${poly(se.values)}" fill="${se.dashed ? 'none' : col}" fill-opacity="${se.dashed ? 0 : .18}" stroke="${col}" stroke-width="${se.dashed ? 1.1 : 1.8}" ${se.dashed ? 'stroke-dasharray="3 3"' : ''} stroke-linejoin="round"/>`;
      if (!se.dashed) se.values.forEach((v, i) => { const [x, y] = pt(i, v); s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4" fill="${col}"/>`; });
    });
    return svgWrap('radar', s + '</svg>');
  };

  ui.ring = function (value, max, o) {
    o = o || {}; const size = o.size || 84, r = 40, C = 2 * Math.PI * r, pct = cl(value / max, 0, 1), col = o.color || 'var(--accent)';
    let cap = '';
    if (o.cap != null) { const a = -Math.PI / 2 + cl(o.cap / max, 0, 1) * 2 * Math.PI; cap = `<line x1="${50 + (r - 6) * Math.cos(a)}" y1="${50 + (r - 6) * Math.sin(a)}" x2="${50 + (r + 6) * Math.cos(a)}" y2="${50 + (r + 6) * Math.sin(a)}" stroke="var(--text)" stroke-width="2"/>`; }
    const el = h('div', { class: 'ring', style: { width: size + 'px', height: size + 'px', flex: 'none' }, html: `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="9"/>
      <circle class="p" cx="50" cy="50" r="${r}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" transform="rotate(-90 50 50)" style="stroke-dasharray:0 ${C}"/>${cap}
      <text x="50" y="${o.sub ? 52 : 57}" text-anchor="middle" font-size="${o.fs || 26}" font-weight="700" fill="var(--text)" font-family="var(--sans)" letter-spacing="-1">${o.text != null ? o.text : Math.round(value)}</text>
      ${o.sub ? `<text x="50" y="66" text-anchor="middle" font-size="8" fill="var(--text-3)" font-family="var(--mono)" letter-spacing=".6">${o.sub}</text>` : ''}</svg>` });
    setTimeout(() => { const p = el.querySelector('.p'); if (p) p.style.strokeDasharray = `${pct * C} ${C}`; }, 40);
    return el;
  };

  ui.area = function (path, n, o) {
    o = o || {}; const id = 'g' + (++gid), W = 400, H = 150, L = 30, Rr = 10, T = 12, B = 20;
    const xs = i => L + (W - L - Rr) * i / 20, ys = p => T + (H - T - B) * (p - 1) / Math.max(1, n - 1);
    const pts = path.pts.map(q => [xs(q.x), ys(q.y)]);
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    const last = pts[pts.length - 1], first = pts[0], base = H - B;
    const col = path.dnfAt != null ? 'var(--bad)' : 'var(--accent)';
    let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".35"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>`;
    [1, Math.ceil(n / 2), n].forEach(p => { s += `<line x1="${L}" x2="${W - Rr}" y1="${ys(p)}" y2="${ys(p)}" stroke="var(--line)" stroke-width="1"/><text x="${L - 6}" y="${ys(p) + 3}" text-anchor="end" font-size="8" font-family="var(--mono)" fill="var(--text-3)">P${p}</text>`; });
    s += `<line x1="${L}" x2="${W - Rr}" y1="${first[1]}" y2="${first[1]}" stroke="var(--text-3)" stroke-width="1" stroke-dasharray="3 4"/><text x="${W - Rr}" y="${first[1] - 4}" text-anchor="end" font-size="7.5" font-family="var(--mono)" fill="var(--text-3)">largada</text>`;
    s += `<path d="${d} L${last[0].toFixed(1)},${base} L${first[0].toFixed(1)},${base} Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke="${col}" stroke-width="2.2" stroke-linecap="round"/>`;
    s += `<circle cx="${first[0]}" cy="${first[1]}" r="3.5" fill="var(--surface)" stroke="var(--text-2)" stroke-width="1.5"/><circle cx="${last[0]}" cy="${last[1]}" r="4.5" fill="${col}" stroke="var(--surface)" stroke-width="2"/>`;
    if (path.dnfAt != null) s += `<text x="${last[0] + 8}" y="${last[1] + 3}" font-size="9" font-family="var(--mono)" fill="var(--bad)">DNF</text>`;
    else s += `<text x="${last[0] - 8}" y="${last[1] - 8}" text-anchor="end" font-size="9" font-weight="700" font-family="var(--mono)" fill="var(--text)">P${path.pts[path.pts.length - 1].y}</text>`;
    s += `<text x="${L}" y="${H - 5}" font-size="7.5" font-family="var(--mono)" fill="var(--text-3)">volta 1</text><text x="${W - Rr}" y="${H - 5}" text-anchor="end" font-size="7.5" font-family="var(--mono)" fill="var(--text-3)">bandeira</text></svg>`;
    return svgWrap('area', s);
  };

  ui.hbars = function (rows, o) {
    const max = (o && o.max) || Math.max(1, ...rows.map(r => r.value));
    return h('div', { class: 'col', style: { gap: '.35rem' } }, rows.map(r => h('div', { class: 'hbar' + (r.me ? ' me' : '') }, h('span', null, r.label), h('div', { class: 't' }, h('div', { class: 'f', style: { width: (r.value / max * 100) + '%' } })), h('span', null, r.value))));
  };

  ui.dots = function () { const cells = []; for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) cells.push(h('i', { style: { animationDelay: ((Math.abs(x - 2) + Math.abs(y - 2)) * .12) + 's' } })); return h('div', { class: 'dots' }, cells); };

  ui.simulate = function (stages, done) {
    if (!ui.simDelay) { done(); return; }
    const label = h('div', { class: 'stage' }, stages[0]), el = h('div', { class: 'sim' }, ui.dots(), label);
    document.body.append(el);
    stages.forEach((t, i) => setTimeout(() => { label.textContent = t; }, i * (ui.simDelay / stages.length)));
    setTimeout(() => { el.remove(); done(); }, ui.simDelay);
  };
  ui.simDelay = 1500;

  /* Desenho realista de cada circuito, ajustado proporcionalmente para caber 100% dentro de qualquer box sem cortar. */
  ui.track = function (seed, o) {
    o = o || {};
    const key = String(seed || '').toLowerCase();
    let P;
    if (TRACKS[seed]) {
      P = TRACKS[seed].pts;
    } else if (TRACKS[key]) {
      P = TRACKS[key].pts;
    } else {
      // Kartódromos e circuitos secundários: gera traçado técnico realista dentro da área segura [24..76]
      let hs = 0;
      for (const ch of String(seed)) hs = (hs * 31 + ch.charCodeAt(0)) >>> 0;
      const rnd = Game.rng.seeded(hs || 1), N = 10;
      P = [];
      for (let i = 0; i < N; i++) {
        const a = i / N * 2 * Math.PI;
        const r = 18 + rnd() * 10;
        P.push([50 + r * 1.15 * Math.cos(a), 50 + r * 0.85 * Math.sin(a)]);
      }
    }

    const N = P.length;
    let d = '';
    for (let i = 0; i < N; i++) {
      const p0 = P[(i - 1 + N) % N], p1 = P[i], p2 = P[(i + 1) % N], p3 = P[(i + 2) % N];
      if (!i) d = `M${p1[0].toFixed(1)},${p1[1].toFixed(1)}`;
      d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }

    // Linha de largada/chegada perpendicular ao primeiro segmento
    const pStart = P[0], pNext = P[1];
    const dx = pNext[0] - pStart[0], dy = pNext[1] - pStart[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len * 3.8, ny = dx / len * 3.8;

    const s = `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;max-width:100%;max-height:100%;display:block">
      <path d="${d}Z" fill="none" stroke="var(--line-strong)" stroke-width="5.2" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="${d}Z" fill="none" stroke="var(--surface-2)" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="${d}Z" fill="none" stroke="var(--accent)" stroke-width="1.0" stroke-dasharray="2.4 2.2" stroke-linecap="round"/>
      <line x1="${(pStart[0] - nx).toFixed(1)}" y1="${(pStart[1] - ny).toFixed(1)}" x2="${(pStart[0] + nx).toFixed(1)}" y2="${(pStart[1] + ny).toFixed(1)}" stroke="var(--text)" stroke-width="1.4" stroke-linecap="round"/>
      <circle cx="${pStart[0].toFixed(1)}" cy="${pStart[1].toFixed(1)}" r="2.2" fill="var(--accent)"/>
    </svg>`;
    return svgWrap('track', s);
  };
})();
