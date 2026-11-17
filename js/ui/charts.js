/* Gráficos SVG leves (inspirados no Bklit): radar, anel, área de posições, barras horizontais, loader de pontos e traçado de pista. */
(function () {
  const ui = Game.ui, h = ui.h, cl = Game.utils.clamp;
  let gid = 0;
  const svgWrap = (cls, html) => h('div', { class: 'chart ' + (cls || ''), html });

  // radar: axes=[{label}], series=[{values, color, dashed, fill}]
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

  // anel (gauge): valor/max com marcador opcional
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

  // área de posições volta a volta: path={pts:[{x,y}], dnfAt}, n=nº de carros
  ui.area = function (path, n, o) {
    o = o || {}; const id = 'g' + (++gid), W = 400, H = 150, L = 30, Rr = 10, T = 12, B = 20;
    const xs = i => L + (W - L - Rr) * i / 20, ys = p => T + (H - T - B) * (p - 1) / Math.max(1, n - 1);
    const pts = path.pts.map(q => [xs(q.x), ys(q.y)]);
    // curva suave (Catmull-Rom → Bézier)
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

  // barras horizontais: rows=[{label,value,me}]
  ui.hbars = function (rows, o) {
    const max = (o && o.max) || Math.max(1, ...rows.map(r => r.value));
    return h('div', { class: 'col', style: { gap: '.35rem' } }, rows.map(r => h('div', { class: 'hbar' + (r.me ? ' me' : '') }, h('span', null, r.label), h('div', { class: 't' }, h('div', { class: 'f', style: { width: (r.value / max * 100) + '%' } })), h('span', null, r.value))));
  };

  // loader de pontos
  ui.dots = function () { const cells = []; for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) cells.push(h('i', { style: { animationDelay: ((Math.abs(x - 2) + Math.abs(y - 2)) * .12) + 's' } })); return h('div', { class: 'dots' }, cells); };
  ui.simulate = function (stages, done) {
    if (!ui.simDelay) { done(); return; }
    const label = h('div', { class: 'stage' }, stages[0]), el = h('div', { class: 'sim' }, ui.dots(), label);
    document.body.append(el);
    stages.forEach((t, i) => setTimeout(() => { label.textContent = t; }, i * (ui.simDelay / stages.length)));
    setTimeout(() => { el.remove(); done(); }, ui.simDelay);
  };
  ui.simDelay = 1500;

  // traçado de pista decorativo, gerado a partir de um texto (sempre igual para o mesmo circuito)
  ui.track = function (seed, o) {
    o = o || {}; let hs = 0; for (const ch of String(seed)) hs = (hs * 31 + ch.charCodeAt(0)) >>> 0;
    const rnd = Game.rng.seeded(hs || 1), N = 9, P = [];
    for (let i = 0; i < N; i++) { const a = i / N * 2 * Math.PI, r = 28 + rnd() * 20; P.push([50 + r * 1.25 * Math.cos(a), 50 + r * .82 * Math.sin(a)]); }
    let d = ''; for (let i = 0; i < N; i++) {
      const p0 = P[(i - 1 + N) % N], p1 = P[i], p2 = P[(i + 1) % N], p3 = P[(i + 2) % N];
      if (!i) d = `M${p1[0].toFixed(1)},${p1[1].toFixed(1)}`;
      d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    const s = `<svg viewBox="-14 -14 128 128" preserveAspectRatio="xMidYMid meet"><path d="${d}Z" fill="none" stroke="var(--line-strong)" stroke-width="7" stroke-linejoin="round"/><path d="${d}Z" fill="none" stroke="var(--surface-2)" stroke-width="5.4" stroke-linejoin="round"/>
      <path d="${d}Z" fill="none" stroke="var(--accent)" stroke-width="1.1" stroke-dasharray="2.2 2.6" stroke-linecap="round"/><circle cx="${P[0][0].toFixed(1)}" cy="${P[0][1].toFixed(1)}" r="2.6" fill="var(--accent)"/></svg>`;
    return svgWrap('track', s);
  };
})();
