/* Gráficos SVG leves: radar, anel, área de posições, barras horizontais, loader de pontos e traçados 1:1 dos circuitos. */
(function () {
  const ui = Game.ui, h = ui.h, cl = Game.utils.clamp;
  let gid = 0;
  const svgWrap = (cls, html) => h('div', { class: 'chart ' + (cls || ''), html });

  /* Traçados 1:1 de alta fidelidade dos 32 circuitos reais (auto-normalizados com preservação de proporção).
     pts = vértices reais do traçado (primeiro segmento = reta principal / largada);
     drs = índices dos segmentos de reta com zona de DRS;
     s1, s2 = índices de divisão dos setores 1, 2 e 3. */
  const TRACKS = {
    // 1. Albert Park (Melbourne) - sentido horário
    aus: {
      pts: [[18,72],[14,48],[18,45],[22,48],[26,24],[34,20],[40,26],[46,24],[58,18],[74,22],[84,34],[88,48],[82,56],[74,52],[68,62],[76,72],[68,80],[54,74],[42,78],[30,76]],
      drs: [0, 3, 7, 17], s1: 5, s2: 12
    },
    // 2. Xangai (Shanghai) - reta oposta gigantesca + caracol T1-T3
    chn: {
      pts: [[34,68],[56,52],[62,48],[60,42],[52,44],[54,52],[46,56],[36,48],[38,34],[48,26],[64,22],[86,20],[88,24],[44,74],[48,80],[36,80],[26,74]],
      drs: [0, 12], s1: 6, s2: 12
    },
    // 3. Suzuka - formato em 8 único, Essos, Degner, Hairpin, Spoon, 130R e Chicane
    jpn: {
      pts: [[72,56],[88,44],[86,38],[78,40],[74,34],[68,36],[64,30],[58,34],[54,28],[48,24],[44,30],[48,38],[42,46],[36,42],[34,48],[42,56],[34,66],[22,74],[14,72],[16,64],[26,60],[44,54],[58,64],[64,62],[66,66]],
      drs: [0], s1: 9, s2: 18
    },
    // 4. Sakhir (Bahrein) - 4 longas retas e hairpins fechados
    bhr: {
      pts: [[26,78],[26,22],[32,20],[38,34],[48,36],[62,24],[72,26],[68,38],[54,44],[56,52],[74,50],[78,56],[60,62],[52,58],[48,66],[66,74],[62,80],[38,76],[32,80]],
      drs: [0, 4, 14], s1: 5, s2: 12
    },
    // 5. Jeddah Corniche - circuito urbano ultra rápido à beira-mar
    ksa: {
      pts: [[26,84],[22,68],[26,64],[22,56],[26,46],[20,34],[24,22],[28,16],[34,18],[32,28],[38,38],[44,48],[52,58],[62,68],[74,76],[82,82],[76,86],[64,78],[54,70],[46,74],[38,82]],
      drs: [0, 12, 16], s1: 7, s2: 14
    },
    // 6. Miami International Autodrome - retas longas + setor travado sob viaduto
    mia: {
      pts: [[20,66],[22,48],[32,42],[44,44],[54,36],[62,26],[70,26],[68,34],[62,38],[64,44],[78,44],[88,48],[86,54],[56,64],[52,70],[42,68],[30,70]],
      drs: [0, 12], s1: 6, s2: 12
    },
    // 7. Montreal (Circuit Gilles Villeneuve) - ilha longa, hairpins e Muro dos Campeões
    can: {
      pts: [[16,66],[22,56],[18,48],[28,44],[40,46],[46,42],[56,44],[68,36],[84,24],[88,28],[74,42],[58,52],[42,58],[28,64],[24,62],[20,68]],
      drs: [0, 7, 9], s1: 5, s2: 10
    },
    // 8. Mônaco (Monte Carlo) - Sainte-Dévote, Casino, Mirabeau, Loews Hairpin, Túnel, Chicane, Piscina, Rascasse
    mon: {
      pts: [[22,74],[24,48],[34,34],[42,24],[52,22],[56,28],[50,32],[58,36],[64,32],[74,26],[86,28],[84,34],[66,42],[62,48],[54,48],[48,54],[44,58],[40,56],[36,64],[32,72],[28,76]],
      drs: [0], s1: 6, s2: 13
    },
    // 9. Barcelona-Catalunya - reta principal longa, Elf, Campsa e últimas curvas rápidas
    esp: {
      pts: [[22,68],[24,36],[30,32],[34,36],[46,30],[58,32],[62,42],[54,48],[56,54],[72,52],[82,56],[80,68],[66,72],[58,64],[50,66],[44,72],[30,72]],
      drs: [0, 8], s1: 5, s2: 11
    },
    // 10. Red Bull Ring (Spielberg) - 3 retas em aclive/declive e curvas angulares
    aut: {
      pts: [[22,72],[26,28],[32,24],[66,22],[72,26],[56,42],[62,48],[78,48],[84,54],[74,68],[56,74],[40,70]],
      drs: [0, 2, 4], s1: 3, s2: 7
    },
    // 11. Silverstone - Hamilton Straight, Abbey, Loop, Wellington, Brooklands, Copse, Maggotts-Becketts, Stowe
    gbr: {
      pts: [[34,74],[24,62],[28,54],[36,56],[34,48],[22,34],[26,24],[38,26],[46,34],[54,24],[68,22],[74,28],[70,38],[76,44],[72,50],[78,56],[74,66],[56,68],[48,62],[42,74]],
      drs: [0, 5, 15], s1: 6, s2: 13
    },
    // 12. Spa-Francorchamps - La Source, Eau Rouge/Raidillon, Kemmel, Les Combes, Pouhon, Blanchimont, Bus Stop
    bel: {
      pts: [[32,76],[20,66],[26,58],[34,46],[46,24],[52,22],[56,28],[64,26],[70,34],[60,42],[66,50],[78,50],[84,58],[74,68],[58,68],[44,72],[38,76],[36,72]],
      drs: [0, 3], s1: 5, s2: 12
    },
    // 13. Hungaroring - travado e técnico
    hun: {
      pts: [[24,76],[24,34],[32,30],[42,42],[48,38],[46,26],[54,22],[64,28],[62,38],[72,42],[78,50],[68,58],[56,56],[54,64],[66,70],[62,76],[36,76]],
      drs: [0, 1], s1: 5, s2: 11
    },
    // 14. Zandvoort - Tarzan, Hugenholtz, Scheivlak, curvas inclinadas
    ned: {
      pts: [[28,74],[24,42],[30,36],[36,44],[42,32],[50,24],[62,28],[60,38],[68,42],[76,34],[82,42],[78,58],[66,64],[54,60],[44,68],[36,76]],
      drs: [0, 13], s1: 5, s2: 10
    },
    // 15. Monza - Templo da Velocidade (retas longas + 3 chicanes + Lesmos + Ascari + Parabolica)
    ita: {
      pts: [[22,74],[22,26],[26,24],[28,28],[44,24],[54,28],[58,36],[68,42],[78,46],[82,52],[76,62],[62,68],[42,74]],
      drs: [0, 7, 11], s1: 4, s2: 8
    },
    // 16. Madrid (Madring) - traçado híbrido rápido com curva parabólica inclinada
    mad: {
      pts: [[22,68],[24,38],[34,26],[52,24],[68,28],[78,40],[74,52],[60,50],[56,58],[68,68],[56,76],[38,72],[28,74]],
      drs: [0, 3, 10], s1: 4, s2: 8
    },
    // 17. Baku - retas de 90 graus na cidade + seção estreita do castelo + reta de 2,2km
    aze: {
      pts: [[20,76],[20,56],[36,56],[36,38],[54,38],[54,22],[68,22],[68,36],[78,36],[82,46],[76,56],[72,66],[56,74],[36,76]],
      drs: [0, 1, 12], s1: 4, s2: 9
    },
    // 18. Singapura (Marina Bay) - circuito urbano de 90° à beira da baía
    sgp: {
      pts: [[22,68],[22,46],[30,42],[36,46],[36,32],[46,24],[64,24],[64,38],[76,38],[82,46],[82,62],[70,62],[70,70],[54,70],[48,76],[32,76]],
      drs: [0, 5, 13], s1: 5, s2: 10
    },
    // 19. Austin (COTA) - subida íngreme T1, sequência de Essos, reta oposta longa e estádio
    usa: {
      pts: [[22,68],[22,26],[28,32],[34,28],[40,36],[46,32],[52,40],[58,36],[64,44],[84,32],[86,38],[68,54],[62,52],[58,60],[68,68],[62,74],[46,72],[38,66],[30,70]],
      drs: [0, 8], s1: 7, s2: 12
    },
    // 20. Cidade do México (Hermanos Rodríguez) - reta gigantesca + Foro Sol
    mex: {
      pts: [[22,72],[22,26],[28,24],[32,30],[44,26],[48,38],[58,36],[66,44],[76,52],[80,64],[68,72],[62,64],[56,64],[52,72],[36,74]],
      drs: [0, 3, 13], s1: 4, s2: 9
    },
    // 21. Interlagos (São Paulo) - S do Senna, Curva do Sol, Reta Oposta, Descida do Lago, Miolo, Junção e Subida dos Boxes
    bra: {
      pts: [[34,76],[20,56],[26,48],[22,38],[34,24],[52,22],[76,28],[82,38],[70,48],[56,46],[52,38],[44,44],[48,54],[62,58],[58,66],[44,72]],
      drs: [0, 5], s1: 5, s2: 11
    },
    // 22. Las Vegas Strip - longas retas de alta velocidade e chicanes
    lvs: {
      pts: [[22,68],[24,44],[36,36],[38,24],[52,24],[82,26],[84,36],[72,48],[78,66],[72,74],[46,72],[32,74]],
      drs: [4, 9], s1: 4, s2: 7
    },
    // 23. Lusail (Qatar) - curvas fluidas de média/alta velocidade e reta longa
    qat: {
      pts: [[24,74],[24,26],[34,24],[42,34],[54,28],[64,34],[76,28],[82,36],[74,48],[64,46],[62,56],[74,64],[68,74],[48,70],[36,76]],
      drs: [0], s1: 5, s2: 10
    },
    // 24. Yas Marina (Abu Dhabi) - hairpins, retas longas e setor do hotel
    abu: {
      pts: [[26,74],[22,44],[30,36],[36,24],[46,24],[66,30],[82,38],[80,44],[62,50],[66,58],[78,62],[74,72],[60,74],[54,66],[44,68],[36,76]],
      drs: [4, 7], s1: 5, s2: 10
    },

    // ---- 8 Circuitos Reservas ----
    // 25. Ímola - Tamburello, Villeneuve, Tosa, Piratella, Acque Minerali, Variante Alta, Rivazza
    imo: {
      pts: [[20,66],[28,54],[36,44],[44,32],[54,26],[64,30],[62,38],[72,42],[82,38],[84,48],[74,56],[64,54],[56,64],[44,70],[30,70]],
      drs: [0], s1: 5, s2: 10
    },
    // 26. Portimão (Algarve) - montanha-russa técnica
    por: {
      pts: [[24,72],[24,32],[34,24],[46,32],[56,26],[66,34],[78,30],[82,42],[70,52],[58,48],[54,58],[66,66],[56,74],[38,74]],
      drs: [0], s1: 4, s2: 9
    },
    // 27. Paul Ricard - Reta Mistral dividida por chicane e Signes
    fra: {
      pts: [[20,66],[22,38],[34,34],[42,26],[60,26],[64,30],[68,26],[84,28],[84,42],[68,48],[76,62],[62,72],[44,66],[32,72]],
      drs: [0, 3, 6], s1: 4, s2: 9
    },
    // 28. Hockenheim - Parabolika e Motodrom
    ger: {
      pts: [[24,74],[24,38],[38,24],[62,24],[82,30],[78,42],[64,48],[60,56],[72,62],[68,72],[52,70],[40,76]],
      drs: [0, 3], s1: 4, s2: 8
    },
    // 29. Istambul Park - Curva 8 de 4 ápices + reta oposta
    tur: {
      pts: [[24,72],[22,48],[32,36],[46,24],[56,26],[62,36],[54,44],[62,52],[82,48],[84,58],[70,68],[50,74],[36,70]],
      drs: [0, 7], s1: 4, s2: 8
    },
    // 30. Mugello - San Donato, Casanova-Savelli, Arrabbiata 1 & 2, Bucine
    mug: {
      pts: [[22,68],[24,28],[34,24],[44,34],[54,28],[64,38],[76,32],[82,44],[74,58],[62,56],[54,66],[40,74],[28,72]],
      drs: [0], s1: 4, s2: 8
    },
    // 31. Sepang (Malásia) - duas retas paralelas ligadas por hairpin
    mal: {
      pts: [[24,74],[24,28],[34,26],[42,38],[56,34],[68,42],[82,32],[84,40],[62,58],[52,52],[44,62],[58,72],[44,76]],
      drs: [0, 7], s1: 4, s2: 8
    },
    // 32. Kyalami (África do Sul)
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
      pts: [[34,76],[20,56],[26,48],[22,38],[34,24],[52,22],[76,28],[82,38],[70,48],[56,46],[52,38],[44,44],[48,54],[62,58],[58,66],[44,72]],
      drs: [0, 5], s1: 5, s2: 11
    }
  };

  /* Normaliza pontos para caberem com margem segura [16..84] preservando a proporção exata do circuito. */
  function normalizePts(rawPts) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    rawPts.forEach(([x, y]) => {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    });
    const w = Math.max(1, maxX - minX);
    const h = Math.max(1, maxY - minY);
    const box = 68; // de 16 a 84
    const scale = box / Math.max(w, h);
    const ox = 50 - (w * scale) / 2;
    const oy = 50 - (h * scale) / 2;
    return rawPts.map(([x, y]) => [ox + (x - minX) * scale, oy + (y - minY) * scale]);
  }

  /* Constrói path SVG com retas fiéis e curvas suaves nos ápices (chamfer + quadratic Bézier). */
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
      const r = Math.min(radius, l1 * 0.36, l2 * 0.36);
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
    const d = roundedPolyPath(P, 2.8);

    // Retas DRS em destaque paralelo sutil
    let drsSvg = '';
    drs.forEach(idx => {
      if (idx < 0 || idx >= N) return;
      const a = P[idx], b = P[(idx + 1) % N];
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      const nx = -uy * 2.5, ny = ux * 2.5;
      const p1x = a[0] + ux * (len * 0.14) + nx, p1y = a[1] + uy * (len * 0.14) + ny;
      const p2x = b[0] - ux * (len * 0.14) + nx, p2y = b[1] - uy * (len * 0.14) + ny;
      drsSvg += `<line x1="${p1x.toFixed(1)}" y1="${p1y.toFixed(1)}" x2="${p2x.toFixed(1)}" y2="${p2y.toFixed(1)}" stroke="var(--ok)" stroke-width="0.95" stroke-dasharray="1.8 1.4" stroke-linecap="round" opacity="0.85"/>`;
    });

    // Marcadores de divisão dos setores S1 e S2
    let secSvg = '';
    [s1, s2].forEach((idx, si) => {
      if (idx == null || idx <= 0 || idx >= N) return;
      const curr = P[idx], next = P[(idx + 1) % N];
      const dx = next[0] - curr[0], dy = next[1] - curr[1], len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len * 2.6, ny = dx / len * 2.6;
      secSvg += `<line x1="${(curr[0] - nx).toFixed(1)}" y1="${(curr[1] - ny).toFixed(1)}" x2="${(curr[0] + nx).toFixed(1)}" y2="${(curr[1] + ny).toFixed(1)}" stroke="var(--text-3)" stroke-width="0.9"/>`;
      secSvg += `<text x="${(curr[0] + nx * 2.1).toFixed(1)}" y="${(curr[1] + ny * 2.1 + 1.5).toFixed(1)}" text-anchor="middle" font-size="3.6" font-family="var(--mono)" fill="var(--text-3)">S${si + 2}</text>`;
    });

    // Linha de largada/chegada no meio da reta principal (segmento P[0] -> P[1]) e seta de sentido
    const p0 = P[0], p1 = P[1];
    const sdx = p1[0] - p0[0], sdy = p1[1] - p0[1], slen = Math.hypot(sdx, sdy) || 1;
    const ux = sdx / slen, uy = sdy / slen;
    const nx = -uy * 3.2, ny = ux * 3.2;
    const sfX = p0[0] + sdx * 0.42, sfY = p0[1] + sdy * 0.42;
    const arrX = sfX + ux * 4.5, arrY = sfY + uy * 4.5;
    const arrowPts = `${(arrX + ux * 2.2).toFixed(1)},${(arrY + uy * 2.2).toFixed(1)} ${(arrX - ux * 1.2 - uy * 1.5).toFixed(1)},${(arrY - uy * 1.2 + ux * 1.5).toFixed(1)} ${(arrX - ux * 1.2 + uy * 1.5).toFixed(1)},${(arrY - uy * 1.2 - ux * 1.5).toFixed(1)}`;

    const s = `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;max-width:100%;max-height:100%;display:block">
      <path d="${d}" fill="none" stroke="var(--line-strong)" stroke-width="4.4" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="${d}" fill="none" stroke="var(--surface-2)" stroke-width="2.9" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="${d}" fill="none" stroke="var(--accent)" stroke-width="0.85" stroke-opacity="0.7" stroke-linejoin="round"/>
      ${drsSvg}
      ${secSvg}
      <line x1="${(sfX - nx).toFixed(1)}" y1="${(sfY - ny).toFixed(1)}" x2="${(sfX + nx).toFixed(1)}" y2="${(sfY + ny).toFixed(1)}" stroke="var(--text)" stroke-width="1.5" stroke-linecap="round"/>
      <polygon points="${arrowPts}" fill="var(--accent)"/>
    </svg>`;
    return svgWrap('track', s);
  };
})();
