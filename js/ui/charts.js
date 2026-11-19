/* Gráficos SVG leves: radar, anel, área de posições, barras horizontais, loader de pontos e traçados 1:1 dos circuitos. */
(function () {
  const ui = Game.ui, h = ui.h, cl = Game.utils.clamp;
  let gid = 0;
  const svgWrap = (cls, html) => h('div', { class: 'chart ' + (cls || ''), html });

  /* Traçados 1:1 de alta fidelidade dos circuitos oficiais (F1, F2, F3, F4 e Kart),
     auto-normalizados preservando proporção exata, ângulos, hairpins, chicanes, setores e zonas de DRS. */
  const TRACKS = {
    // 1. Sakhir (Bahrain International)
    bhr: {
      pts: [[88,84],[18,84],[26,20],[32,20],[46,56],[30,56],[30,60],[56,54],[66,22],[72,22],[62,48],[74,54],[72,60],[58,64],[64,72],[88,80]],
      drs: [0, 1, 7], s1: 5, s2: 11
    },
    // 2. Jeddah Corniche
    ksa: {
      pts: [[20,78],[80,18],[88,16],[86,22],[74,36],[64,42],[56,52],[50,54],[44,64],[38,66],[32,74],[22,86],[16,84]],
      drs: [0, 4, 9], s1: 4, s2: 9
    },
    // 3. Albert Park (Melbourne)
    aus: {
      pts: [[18,68],[16,44],[22,42],[20,34],[28,22],[42,22],[48,34],[62,36],[76,36],[84,44],[88,48],[74,56],[66,52],[56,58],[38,60],[28,68]],
      drs: [0, 6, 13], s1: 5, s2: 10
    },
    // 4. Suzuka (traçado em 8)
    jpn: {
      pts: [[72,34],[54,48],[58,52],[52,54],[54,58],[48,60],[42,54],[36,56],[34,64],[38,66],[34,72],[28,68],[14,72],[10,68],[16,62],[44,50],[66,32],[76,26],[86,26],[88,30],[80,32],[76,30]],
      drs: [0], s1: 8, s2: 15
    },
    // 5. Shanghai (Xangai)
    chn: {
      pts: [[20,76],[84,76],[88,72],[82,68],[52,70],[40,56],[68,52],[72,46],[50,44],[46,34],[52,20],[62,22],[60,30],[52,28],[54,24],[44,26],[28,70]],
      drs: [0, 15], s1: 6, s2: 11
    },
    // 6. Miami International Autodrome
    mia: {
      pts: [[22,34],[74,34],[86,38],[88,44],[72,46],[64,54],[58,66],[42,66],[34,56],[22,58],[16,52],[26,48],[18,38]],
      drs: [0, 4], s1: 4, s2: 8
    },
    // 7. Montreal (Circuit Gilles Villeneuve)
    can: {
      pts: [[24,38],[16,32],[20,26],[28,26],[42,32],[52,38],[64,46],[76,56],[88,70],[84,74],[62,60],[42,48]],
      drs: [0, 7, 10], s1: 4, s2: 8
    },
    // 8. Mônaco (Monte Carlo)
    mon: {
      pts: [[22,74],[20,52],[22,46],[32,36],[44,36],[44,42],[38,44],[46,46],[54,46],[68,38],[84,38],[86,42],[74,44],[68,48],[54,48],[46,50],[38,50],[26,54],[24,62],[26,72]],
      drs: [0], s1: 6, s2: 13
    },
    // 9. Portimão (Autódromo Internacional do Algarve)
    por: {
      pts: [[22,32],[74,32],[86,38],[88,46],[78,52],[76,44],[66,44],[62,52],[46,52],[42,44],[32,42],[28,50],[36,58],[26,66],[16,56],[16,38]],
      drs: [0], s1: 5, s2: 10
    },
    // 10. Silverstone
    gbr: {
      pts: [[16,32],[24,24],[38,24],[42,32],[34,38],[52,24],[60,26],[54,36],[66,36],[74,44],[82,44],[86,52],[64,72],[54,74],[46,66],[36,58],[24,44]],
      drs: [0, 5, 11], s1: 6, s2: 11
    },
    // 11. Red Bull Ring (Spielberg)
    aut: {
      pts: [[28,56],[16,34],[22,28],[76,26],[82,30],[52,48],[56,54],[76,52],[84,58],[74,68],[52,72],[36,64]],
      drs: [0, 2, 4], s1: 3, s2: 7
    },
    // 12. Spa-Francorchamps
    bel: {
      pts: [[32,76],[20,66],[26,58],[34,46],[46,24],[52,22],[56,28],[64,26],[70,34],[60,42],[66,50],[78,50],[84,58],[74,68],[58,68],[44,72],[38,76],[36,72]],
      drs: [0, 3], s1: 5, s2: 12
    },
    // 13. Barcelona-Catalunya
    esp: {
      pts: [[22,68],[24,36],[30,32],[34,36],[46,30],[58,32],[62,42],[54,48],[56,54],[72,52],[82,56],[80,68],[66,72],[58,64],[50,66],[44,72],[30,72]],
      drs: [0, 8], s1: 5, s2: 11
    },
    // 14. Zandvoort
    ned: {
      pts: [[28,74],[24,42],[30,36],[36,44],[42,32],[50,24],[62,28],[60,38],[68,42],[76,34],[82,42],[78,58],[66,64],[54,60],[44,68],[36,76]],
      drs: [0, 13], s1: 5, s2: 10
    },
    // 15. Hungaroring
    hun: {
      pts: [[36,66],[22,46],[26,42],[44,52],[50,44],[46,32],[56,24],[68,28],[76,42],[70,56],[56,60],[54,68],[62,74],[52,78],[40,68]],
      drs: [0, 1], s1: 5, s2: 10
    },
    // 16. Monza (Templo da Velocidade)
    ita: {
      pts: [[26,56],[18,26],[22,24],[26,28],[34,42],[40,50],[44,52],[54,54],[62,56],[78,58],[88,62],[86,68],[54,68],[34,64]],
      drs: [0, 8, 12], s1: 4, s2: 9
    },
    // 17. Madrid (Madring)
    mad: {
      pts: [[22,74],[18,42],[26,38],[34,34],[44,34],[52,28],[62,28],[68,24],[78,26],[86,34],[82,46],[66,50],[62,60],[48,62],[44,70],[28,76]],
      drs: [0, 8, 13], s1: 5, s2: 11
    },
    // 18. Baku City
    aze: {
      pts: [[26,74],[86,32],[88,38],[80,46],[62,54],[48,58],[42,54],[36,58],[32,66],[22,60],[14,66],[18,76]],
      drs: [0, 3], s1: 4, s2: 8
    },
    // 19. Istanbul Park
    tur: {
      pts: [[20,46],[16,40],[26,36],[36,42],[48,42],[62,34],[76,36],[86,44],[88,52],[74,58],[68,52],[60,62],[46,56],[34,50]],
      drs: [0, 6], s1: 4, s2: 9
    },
    // 20. Marina Bay (Singapura)
    sgp: {
      pts: [[28,42],[16,54],[22,60],[36,48],[46,42],[66,42],[68,52],[84,52],[88,62],[76,66],[56,64],[48,66],[38,60],[32,46]],
      drs: [0, 4, 10], s1: 5, s2: 9
    },
    // 21. Circuit of the Americas (Austin)
    usa: {
      pts: [[38,74],[14,56],[24,52],[30,56],[36,48],[42,52],[48,44],[54,48],[86,32],[88,36],[74,44],[70,52],[60,50],[56,58],[46,60],[42,70]],
      drs: [0, 7], s1: 6, s2: 10
    },
    // 22. Cidade do México (Hermanos Rodríguez)
    mex: {
      pts: [[18,64],[72,32],[76,36],[72,42],[78,52],[64,56],[56,62],[46,60],[68,66],[74,74],[66,76],[62,68],[44,64],[24,68]],
      drs: [0, 3, 12], s1: 4, s2: 9
    },
    // 23. Interlagos (São Paulo)
    bra: {
      pts: [[46,76],[24,64],[16,46],[20,40],[26,42],[26,34],[40,26],[74,26],[84,34],[78,46],[62,46],[52,38],[44,44],[48,54],[66,58],[64,66],[52,72]],
      drs: [0, 6], s1: 5, s2: 11
    },
    // 24. Las Vegas Strip
    lvs: {
      pts: [[22,72],[84,72],[88,66],[84,44],[62,44],[44,48],[34,42],[32,28],[24,28],[24,48],[16,54],[18,68]],
      drs: [0, 3], s1: 4, s2: 8
    },
    // 25. Lusail (Qatar)
    qat: {
      pts: [[74,76],[60,26],[54,24],[48,44],[40,44],[38,28],[28,28],[26,48],[16,56],[18,66],[30,62],[26,74],[44,76]],
      drs: [0], s1: 4, s2: 9
    },
    // 26. Yas Marina (Abu Dhabi)
    abu: {
      pts: [[16,66],[22,44],[34,34],[38,30],[44,34],[64,48],[82,58],[80,62],[64,62],[52,62],[48,52],[38,52],[36,64],[22,68]],
      drs: [4, 7], s1: 5, s2: 9
    },

    // ---- Demais Circuitos Reservas ----
    imo: {
      pts: [[20,66],[28,54],[36,44],[44,32],[54,26],[64,30],[62,38],[72,42],[82,38],[84,48],[74,56],[64,54],[56,64],[44,70],[30,70]],
      drs: [0], s1: 5, s2: 10
    },
    fra: {
      pts: [[20,66],[22,38],[34,34],[42,26],[60,26],[64,30],[68,26],[84,28],[84,42],[68,48],[76,62],[62,72],[44,66],[32,72]],
      drs: [0, 3, 6], s1: 4, s2: 9
    },
    ger: {
      pts: [[24,74],[24,38],[38,24],[62,24],[82,30],[78,42],[64,48],[60,56],[72,62],[68,72],[52,70],[40,76]],
      drs: [0, 3], s1: 4, s2: 8
    },
    mug: {
      pts: [[22,68],[24,28],[34,24],[44,34],[54,28],[64,38],[76,32],[82,44],[74,58],[62,56],[54,66],[40,74],[28,72]],
      drs: [0], s1: 4, s2: 8
    },
    mal: {
      pts: [[24,74],[24,28],[34,26],[42,38],[56,34],[68,42],[82,32],[84,40],[62,58],[52,52],[44,62],[58,72],[44,76]],
      drs: [0, 7], s1: 4, s2: 8
    },
    rsa: {
      pts: [[24,68],[22,36],[34,24],[54,26],[72,34],[80,48],[72,62],[58,56],[48,66],[36,74]],
      drs: [0], s1: 3, s2: 6
    },

    // Circuitos F4 / Kart
    mis: { pts: [[24,68],[22,36],[38,24],[62,26],[78,40],[72,64],[52,58],[40,74]], drs: [], s1: 3, s2: 5 },
    val: { pts: [[22,66],[26,32],[48,22],[74,30],[78,54],[60,68],[38,72]], drs: [], s1: 2, s2: 5 },
    br1: { pts: [[22,66],[24,30],[56,24],[78,38],[76,64],[46,72]], drs: [], s1: 2, s2: 4 },
    br2: { pts: [[24,70],[22,34],[46,24],[76,32],[74,64],[44,72]], drs: [], s1: 2, s2: 4 },
    br3: { pts: [[22,62],[26,32],[54,26],[78,40],[74,66],[44,68]], drs: [], s1: 2, s2: 4 },
    br4: { pts: [[22,66],[26,34],[52,24],[78,36],[74,66],[42,72]], drs: [], s1: 2, s2: 4 },
    br5: { pts: [[24,70],[22,40],[38,24],[56,32],[74,26],[78,48],[62,68],[40,72]], drs: [], s1: 3, s2: 5 },
    'menu-art': {
      pts: [[46,76],[24,64],[16,46],[20,40],[26,42],[26,34],[40,26],[74,26],[84,34],[78,46],[62,46],[52,38],[44,44],[48,54],[66,58],[64,66],[52,72]],
      drs: [0, 6], s1: 5, s2: 11
    }
  };

  /* Normaliza pontos para caberem com margem segura [14..86] preservando a proporção exata do circuito. */
  function normalizePts(rawPts) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    rawPts.forEach(([x, y]) => {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    });
    const w = Math.max(1, maxX - minX);
    const h = Math.max(1, maxY - minY);
    const box = 72; // de 14 a 86
    const scale = box / Math.max(w, h);
    const ox = 50 - (w * scale) / 2;
    const oy = 50 - (h * scale) / 2;
    return rawPts.map(([x, y]) => [ox + (x - minX) * scale, oy + (y - minY) * scale]);
  }

  /* Constrói path SVG com retas nítidas e curvas precisas nos ápices (preserva hairpins e chicanes 1:1). */
  function roundedPolyPath(P, radius) {
    const N = P.length;
    if (N < 3) return '';
    let d = '';
    for (let i = 0; i < N; i++) {
      const prev = P[(i - 1 + N) % N];
      const curr = P[i];
      const next = P[(i + 1) % N];
      const v1x = prev[0] - curr[0], v1y = prev[1] - curr[1];
      const v2x = next[0] - curr[0], v2y = next[1] - curr[1];
      const l1 = Math.hypot(v1x, v1y) || 1;
      const l2 = Math.hypot(v2x, v2y) || 1;
      const r = Math.min(radius, l1 * 0.34, l2 * 0.34);
      const pA = [curr[0] + (v1x / l1) * r, curr[1] + (v1y / l1) * r];
      const pB = [curr[0] + (v2x / l2) * r, curr[1] + (v2y / l2) * r];
      if (i === 0) d += `M${pA[0].toFixed(2)},${pA[1].toFixed(2)}`;
      else d += ` L${pA[0].toFixed(2)},${pA[1].toFixed(2)}`;
      d += ` Q${curr[0].toFixed(2)},${curr[1].toFixed(2)} ${pB[0].toFixed(2)},${pB[1].toFixed(2)}`;
    }
    return d + ' Z';
  }


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
    return h('div', { class: 'col', style: { gap: '.35rem' } }, rows.map(r => h('div', { class: 'hbar' + (r.me ? ' me' : '') },
      h('span', null, r.label),
      h('div', { class: 't' }, h('div', { class: 'f', style: { width: (r.value / max * 100) + '%', background: r.color || (r.me ? 'var(--accent)' : 'var(--text-3)') } })),
      h('span', null, r.value)
    )));
  };

  ui.careerChart = function (history) {
    const list = (history || []).slice(-14);
    if (!list.length) return h('div', { class: 'empty small dim' }, 'Complete sua primeira temporada para visualizar o gráfico de evolução.');
    const W = 460, H = 145, L = 30, Rr = 16, T = 16, B = 22;
    const n = list.length;
    const xs = i => n === 1 ? (L + W - Rr) / 2 : L + (W - L - Rr) * i / (n - 1);
    const yGer = g => T + (H - T - B) * (100 - cl(g, 40, 100)) / 60;
    const pts = list.map((it, i) => [xs(i), yGer(it.ger)]);
    const poly = pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
    let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">`;
    [50, 75, 100].forEach(g => {
      s += `<line x1="${L}" x2="${W - Rr}" y1="${yGer(g)}" y2="${yGer(g)}" stroke="var(--line)" stroke-width="1"/>`;
      s += `<text x="${L - 5}" y="${yGer(g) + 3}" text-anchor="end" font-size="7.5" font-family="var(--mono)" fill="var(--text-3)">${g}</text>`;
    });
    if (pts.length > 1) {
      s += `<polyline points="${poly}" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    list.forEach((it, i) => {
      const [x, y] = pts[i];
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6" fill="var(--accent)" stroke="var(--surface)" stroke-width="1.5"/>`;
      s += `<text x="${x.toFixed(1)}" y="${(y - 7).toFixed(1)}" text-anchor="middle" font-size="7.5" font-weight="700" font-family="var(--mono)" fill="var(--text)">${it.ger}</text>`;
      if (it.pos != null) {
        s += `<text x="${x.toFixed(1)}" y="${(y + 12).toFixed(1)}" text-anchor="middle" font-size="6.8" font-family="var(--mono)" fill="var(--ok)">${it.pos}º</text>`;
      }
      s += `<text x="${x.toFixed(1)}" y="${H - 5}" text-anchor="middle" font-size="7" font-family="var(--mono)" fill="var(--text-3)">${String(it.year).slice(-2)}</text>`;
    });
    s += `</svg>`;
    return svgWrap('area', s);
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

  /* Desenho 1:1 realista dos circuitos com linha de chegada, seta de direção, setores S1/S2/S3 e zonas de DRS. */
  ui.track = function (seed, o) {
    o = o || {};
    const key = String(seed || '').toLowerCase();
    const spec = TRACKS[seed] || TRACKS[key];
    let rawPts, drs = [], s1 = null, s2 = null;

    if (spec) {
      rawPts = spec.pts;
      drs = spec.drs || [];
      s1 = spec.s1;
      s2 = spec.s2;
    } else {
      let hs = 0;
      for (const ch of String(seed)) hs = (hs * 31 + ch.charCodeAt(0)) >>> 0;
      const rnd = Game.rng.seeded(hs || 1), N = 12;
      rawPts = [];
      for (let i = 0; i < N; i++) {
        const a = i / N * 2 * Math.PI;
        const r = 18 + rnd() * 14;
        rawPts.push([50 + r * 1.25 * Math.cos(a), 50 + r * 0.85 * Math.sin(a)]);
      }
      drs = [0];
      s1 = 4;
      s2 = 8;
    }

    const P = normalizePts(rawPts);
    const N = P.length;
    const d = roundedPolyPath(P, 1.8);

    // Retas DRS em destaque paralelo sutil
    let drsSvg = '';
    drs.forEach(idx => {
      if (idx < 0 || idx >= N) return;
      const a = P[idx], b = P[(idx + 1) % N];
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      const nx = -uy * 2.4, ny = ux * 2.4;
      const p1x = a[0] + ux * (len * 0.14) + nx, p1y = a[1] + uy * (len * 0.14) + ny;
      const p2x = b[0] - ux * (len * 0.14) + nx, p2y = b[1] - uy * (len * 0.14) + ny;
      drsSvg += `<line x1="${p1x.toFixed(1)}" y1="${p1y.toFixed(1)}" x2="${p2x.toFixed(1)}" y2="${p2y.toFixed(1)}" stroke="var(--ok)" stroke-width="0.95" stroke-dasharray="1.8 1.4" stroke-linecap="round" opacity="0.88"/>`;
    });

    // Marcadores de divisão dos setores S1 e S2
    let secSvg = '';
    [s1, s2].forEach((idx, si) => {
      if (idx == null || idx <= 0 || idx >= N) return;
      const curr = P[idx], next = P[(idx + 1) % N];
      const dx = next[0] - curr[0], dy = next[1] - curr[1], len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len * 2.4, ny = dx / len * 2.4;
      secSvg += `<line x1="${(curr[0] - nx).toFixed(1)}" y1="${(curr[1] - ny).toFixed(1)}" x2="${(curr[0] + nx).toFixed(1)}" y2="${(curr[1] + ny).toFixed(1)}" stroke="var(--text-3)" stroke-width="0.9"/>`;
      secSvg += `<text x="${(curr[0] + nx * 2.1).toFixed(1)}" y="${(curr[1] + ny * 2.1 + 1.4).toFixed(1)}" text-anchor="middle" font-size="3.5" font-family="var(--mono)" fill="var(--text-3)">S${si + 2}</text>`;
    });

    // Linha de largada/chegada no meio da reta principal (segmento P[0] -> P[1]) e seta de sentido
    const p0 = P[0], p1 = P[1];
    const sdx = p1[0] - p0[0], sdy = p1[1] - p0[1], slen = Math.hypot(sdx, sdy) || 1;
    const ux = sdx / slen, uy = sdy / slen;
    const nx = -uy * 3.0, ny = ux * 3.0;
    const sfX = p0[0] + sdx * 0.42, sfY = p0[1] + sdy * 0.42;
    const arrX = sfX + ux * 4.2, arrY = sfY + uy * 4.2;
    const arrowPts = `${(arrX + ux * 2.0).toFixed(1)},${(arrY + uy * 2.0).toFixed(1)} ${(arrX - ux * 1.1 - uy * 1.4).toFixed(1)},${(arrY - uy * 1.1 + ux * 1.4).toFixed(1)} ${(arrX - ux * 1.1 + uy * 1.4).toFixed(1)},${(arrY - uy * 1.1 - ux * 1.4).toFixed(1)}`;

    const s = `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;max-width:100%;max-height:100%;display:block">
      <path d="${d}" fill="none" stroke="var(--line-strong)" stroke-width="3.8" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="${d}" fill="none" stroke="var(--surface-2)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="${d}" fill="none" stroke="var(--accent)" stroke-width="0.9" stroke-opacity="0.8" stroke-linejoin="round"/>
      ${drsSvg}
      ${secSvg}
      <line x1="${(sfX - nx).toFixed(1)}" y1="${(sfY - ny).toFixed(1)}" x2="${(sfX + nx).toFixed(1)}" y2="${(sfY + ny).toFixed(1)}" stroke="var(--text)" stroke-width="1.5" stroke-linecap="round"/>
      <polygon points="${arrowPts}" fill="var(--accent)"/>
    </svg>`;
    return svgWrap('track', s);
  };
})();
