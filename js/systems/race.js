/* Simulação de fim de semana: classificação, corridas (sprint/principal), pontos oficiais e resumo textual para o jogador. */
(function () {
  const R = Game.rng, U = Game.utils, C = Game.data.categories, cl = U.clamp;
  const Race = Game.systems.race = {};
  const CAUSES = [['falha mecânica', false], ['falha no motor', false], ['problema de freios', false], ['batida na primeira curva', true], ['rodada e abandono', true], ['toque com um rival', true]];

  const drvScore = (e, m) => { const a = e.attrs; return m === 'q' ? a.RIT * .78 + a.EXP * .08 + a.ATE * .14 : a.RIT * .5 + a.RAC * .28 + a.ATE * .12 + a.EXP * .10; };
  const perf = (e, cat, m) => cat.carW * e.car + (1 - cat.carW) * drvScore(e, m);
  const setupBonus = (s, circ) => !s ? 0 : s === 'bal' ? .2 : (s === circ.prof ? 1.0 : -.6);
  const traitMult = (state, k) => (state.player.traits || []).reduce((m, id) => { const t = Game.data.traits.find(x => x.id === id); return m * ((t && t.mod[k]) || 1); }, 1);

  Race.quali = function (entries, cat, circ, ctx) {
    return entries.map(e => ({ id: e.id, v: perf(e, cat, 'q') + R.normal(0, 1.6) + (e.isPlayer ? setupBonus(ctx.choices.setup, circ) : 0) }))
      .sort((a, b) => b.v - a.v).map(x => x.id);
  };

  // posição esperada do jogador (sem sorte) para medir cobrança de equipe/mídia
  Race.expected = function (entries, cat) {
    const s = entries.map(e => ({ id: e.id, v: perf(e, cat, 'r') })).sort((a, b) => b.v - a.v);
    return s.findIndex(x => x.id === 'player') + 1;
  };

  function lapPath(grid, pos, n, dnf) {
    const pts = []; let w = 0;
    const end = dnf ? Math.max(2, Math.floor(R.float() * 18) + 1) : 20;
    for (let i = 0; i <= end; i++) {
      const t = i / 20, s = t * t * (3 - 2 * t);
      w = w * .7 + R.normal(0, .8) * (1 - t);
      let p = i === 20 ? pos : Math.round(grid + (pos - grid) * s + w);
      if (i === 0) p = grid;
      pts.push({ x: i, y: cl(p, 1, n) });
    }
    return { pts, dnfAt: dnf ? end : null };
  }

  Race.simRace = function (state, entries, cat, circ, spec, grid, ctx) {
    const n = entries.length, ch = ctx.choices || {}, wet = ctx.wet, sc = R.chance(wet ? .5 : .3);
    const tyre = ch.tyre != null ? ch.tyre : 1, risk = ch.risk != null ? ch.risk : 1;
    const sig = 2.4 + (wet ? 2 : 0) + (sc ? .8 : 0);
    const res = entries.map(e => {
      const gp = grid.indexOf(e.id) + 1;
      let v = perf(e, cat, 'r') + (n - gp) / n * circ.q * 2.2 + R.normal(0, sig);
      let dnfP = cat.dnf * (1 + (82 - e.attrs.ATE) / 70) * (1 + (80 - e.car) / 110) * (wet ? 1.5 : 1);
      let pen = false;
      if (e.isPlayer) {
        v += (tyre - 1) * .8 + (risk - 1) * .5 + setupBonus(ch.setup, circ) + (tyre === 2 ? R.normal(0, 1) : 0) + traitMult(state, 'race') - 1 + (ctx.racingInjured ? -2.5 : 0);
        dnfP *= (1 + .45 * (risk - 1)) * traitMult(state, 'dnf');
        if (R.chance(.06 * (1 + (risk - 1) * .8) * (1 + (80 - e.attrs.ATE) / 80))) { pen = true; v -= 2; }
      }
      const dnf = R.chance(cl(dnfP, .01, .4));
      const cause = dnf ? R.pick(CAUSES) : null;
      return { id: e.id, e, gp, v, dnf, dnfLap: dnf ? R.int(1, cat.laps) : 0, pen, cause };
    });
    const fin = res.filter(r => !r.dnf).sort((a, b) => b.v - a.v);
    const out = res.filter(r => r.dnf).sort((a, b) => b.dnfLap - a.dnfLap);
    const order = fin.concat(out);
    const flC = fin.slice(0, 10).map(r => ({ r, v: perf(r.e, cat, 'r') + R.normal(0, 2.5) })).sort((a, b) => b.v - a.v)[0];
    const flId = spec.fl && flC ? flC.r.id : null;
    const poleId = spec.pole ? ctx.poleId : null;
    const rows = order.map((r, i) => {
      const classified = !r.dnf;
      let pts = classified ? (spec.pts[i] || 0) : 0;
      if (poleId === r.id) pts += spec.pole;
      if (flId === r.id && i < 10 && classified) pts += spec.fl;
      return { id: r.id, teamId: r.e.teamId, pos: i + 1, grid: r.gp, dnf: r.dnf, dnfLap: r.dnfLap, pts, fl: flId === r.id, pole: poleId === r.id, pen: r.pen };
    });
    const out2 = { id: spec.id, name: spec.name, grid, order: rows, wet, sc, flId, poleId, player: null };
    const me = rows.find(r => r.id === 'player');
    if (me) out2.player = Race.playerSummary(state, entries, rows, me, res.find(r => r.id === 'player'), ctx, circ, tyre, sc);
    return out2;
  };

  Race.playerSummary = function (state, entries, rows, me, raw, ctx, circ, tyre, sc) {
    const n = rows.length, lines = [], e = raw.e;
    const p1 = cl(Math.round(me.grid - (e.attrs.RAC - 78) / 18 + R.normal(0, 1.4)), 1, n);
    lines.push(p1 < me.grid ? `Largada excelente: saiu de ${me.grid}º e fechou a 1ª volta em ${p1}º.` : p1 > me.grid ? `Largada ruim: caiu para ${p1}º na 1ª volta (largou em ${me.grid}º).` : `Largou em ${me.grid}º e manteve a posição na 1ª volta.`);
    if (ctx.wet) lines.push('Pista molhada: a corrida foi imprevisível e exigiu atenção.');
    if (sc) lines.push('Safety car embolou o pelotão no meio da prova.');
    if (me.pen) lines.push('Você levou punição por incidente de pista, o que custou posições.');
    let crash = false;
    if (me.dnf) { lines.push(`ABANDONO na volta ${me.dnfLap}: ${raw.cause[0]}.`); crash = raw.cause[1]; }
    else {
      const gain = me.grid - me.pos;
      lines.push(gain >= 3 ? `Corrida de recuperação: ganhou ${gain} posições com ultrapassagens decisivas.` : gain <= -3 ? `Perdeu ${-gain} posições: ritmo abaixo do esperado.` : 'Corrida controlada, sem grandes mudanças de posição.');
      if (tyre === 2 && gain < 0) lines.push('A estratégia agressiva de pneus cobrou a conta no final.');
      if (tyre === 0 && gain >= 0) lines.push('Os pneus duros garantiram constância até a bandeirada.');
    }
    if (me.fl) lines.push('Você marcou a volta mais rápida da prova.');
    if (me.pole) lines.push('Pole position conquistada na classificação.');
    const mate = rows.find(r => r.id !== 'player' && r.teamId === me.teamId);
    if (mate) { const m = entries.find(x => x.id === mate.id); lines.push(`Companheiro ${m.name} terminou em ${mate.dnf ? 'abandono' : mate.pos + 'º'}.`); }
    lines.push(me.dnf ? 'Resultado final: sem pontos.' : `Resultado final: ${me.pos}º (+${me.pts} pts).`);
    return { pos: me.pos, grid: me.grid, pts: me.pts, dnf: me.dnf, crash, pen: me.pen, fl: me.fl, pole: me.pole, lines, path: lapPath(me.grid, me.pos, n, me.dnf), n };
  };

  Race.simulateWeekend = function (state, entries, cat, cal, choices, opts) {
    const circ = cal.circuit, wet = R.chance(circ.rain / 100);
    const ctx = { choices: choices || {}, wet, racingInjured: opts && opts.racingInjured };
    const q1 = Race.quali(entries, cat, circ, ctx), q2 = Race.quali(entries, cat, circ, ctx);
    ctx.poleId = q1[0];
    const specs = cat.races.slice(); if (cat.id === 'f1' && cal.sprint) specs.unshift(cat.sprint);
    const results = [];
    specs.forEach(spec => {
      let grid;
      if (spec.grid === 'quali') grid = q1.slice();
      else if (spec.grid === 'quali2') grid = q2.slice();
      else {
        const base = spec.grid.rev === 'prev' ? results[results.length - 1].order.map(o => o.id) : q1;
        const top = base.slice(0, spec.grid.n).reverse();
        grid = top.concat(q1.filter(id => !top.includes(id)));
      }
      results.push(Race.simRace(state, entries, cat, circ, spec, grid, ctx));
    });
    return { circuit: circ, wet, sprint: cal.sprint, quali: q1, results, expected: Race.expected(entries, cat) };
  };

  // acumula pontos na classificação da temporada
  Race.applyResults = function (season, week) {
    const S = season.standings;
    week.results.forEach(r => r.order.forEach(o => {
      const s = S.drivers[o.id] || (S.drivers[o.id] = { pts: 0, wins: 0, podiums: 0, poles: 0, fl: 0, racePts: [], races: 0, dnfs: 0 });
      s.pts += o.pts; s.racePts.push(o.pts); s.races++;
      if (o.dnf) s.dnfs++; else { if (o.pos === 1) s.wins++; if (o.pos <= 3) s.podiums++; }
      if (o.pole) s.poles++; if (o.fl) s.fl++;
      S.teams[o.teamId] = (S.teams[o.teamId] || 0) + o.pts;
    }));
  };

  // classificação ordenada (final=true aplica descartes quando a categoria tem)
  Race.ranked = function (season, final) {
    const cat = C[season.catId];
    return Object.keys(season.entries).map(id => {
      const s = season.standings.drivers[id] || { pts: 0, wins: 0, podiums: 0, poles: 0, fl: 0, racePts: [], races: 0 };
      let pts = s.pts;
      if (final && cat.discard && s.racePts.length > cat.discard) pts -= s.racePts.slice().sort((a, b) => a - b).slice(0, cat.discard).reduce((x, y) => x + y, 0);
      return Object.assign({ id, pts, raw: s.pts }, season.entries[id], { wins: s.wins, podiums: s.podiums, poles: s.poles, fl: s.fl, races: s.races });
    }).sort((a, b) => b.pts - a.pts || b.wins - a.wins || b.podiums - a.podiums || b.fl - a.fl)
      .map((r, i) => Object.assign(r, { pos: i + 1 }));
  };
})();
