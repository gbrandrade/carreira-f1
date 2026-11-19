/* Simulação de fim de semana: classificação, Sprint separada do GP, clima dinâmico, telemetria por setores e gaps. */
(function () {
  const R = Game.rng, U = Game.utils, C = Game.data.categories, cl = U.clamp;
  const Race = Game.systems.race = {};
  const CAUSES = [
    ['falha mecânica', false], ['falha no motor', false], ['problema de freios', false],
    ['batida na primeira curva', true], ['rodada e abandono', true], ['toque com um rival', true]
  ];

  const drvScore = (e, m) => {
    const a = e.attrs;
    return m === 'q' ? a.RIT * .78 + a.EXP * .08 + a.ATE * .14 : a.RIT * .5 + a.RAC * .28 + a.ATE * .12 + a.EXP * .10;
  };
  const carPartScore = (e, circ, m) => {
    const pt = e.parts;
    if (!pt) return e.car;
    if (m === 'q') return 0.45 * pt.quali + 0.30 * pt.aero + 0.25 * pt.power;
    if (circ && circ.prof === 'dw') return 0.42 * pt.aero + 0.26 * pt.chassis + 0.20 * pt.power + 0.12 * pt.quali;
    if (circ && circ.prof === 'pw') return 0.44 * pt.power + 0.26 * pt.aero + 0.18 * pt.chassis + 0.12 * pt.quali;
    return 0.34 * pt.aero + 0.32 * pt.power + 0.22 * pt.chassis + 0.12 * pt.quali;
  };
  const perf = (e, cat, m, circ) => cat.carW * carPartScore(e, circ, m) + (1 - cat.carW) * drvScore(e, m);

  const setupBonus = (s, circ, weatherMode, isQuali, engBonus) => {
    if (!s) return 0;
    let b = engBonus || 0;
    if (s === 'bal') b += 0.6;
    else if (s === circ.prof) b += isQuali ? 2.9 : 3.4;
    else b += isQuali ? -2.2 : -2.6;

    if (weatherMode === 'wet') {
      if (s === 'dw') b += 2.0;
      else if (s === 'pw') b -= 1.8;
    } else if (weatherMode === 'mixed' && s === 'dw') {
      b += 1.0;
    }
    return b;
  };

  function tyreEffect(tyre, circ, weatherMode, sc, ate) {
    const mgmt = (ate - 50) / 100;
    const wet = weatherMode === 'wet';
    const mixed = weatherMode === 'mixed';
    if (tyre === 2) {
      let pace = 2.8 + (circ.q >= 1.3 ? 1.0 : 0);
      if (sc) pace += 2.2;
      else pace -= cl(2.1 - mgmt * 1.1, 0.7, 2.3);
      if (wet) pace -= 1.5;
      if (mixed) pace -= 1.8; // macio desgasta/superaquece na transição
      return { pace, dnfMult: (wet || mixed) ? 1.35 : 1.15 };
    }
    if (tyre === 0) {
      let pace = -1.4;
      if (!sc) pace += 2.6;
      if (wet) pace += 1.8;
      if (mixed) pace += 2.1; // estratégico para janela de transição
      return { pace, dnfMult: (wet || mixed) ? 0.76 : 0.88 };
    }
    return { pace: mixed ? 1.2 : 0.6, dnfMult: 1.0 };
  }

  function riskEffect(risk, circ, weatherMode) {
    const wet = weatherMode === 'wet' || weatherMode === 'mixed';
    if (risk === 2) return { pace: 2.5 + (circ.q >= 1.4 ? 1.0 : 0), dnfMult: 1.85, penMult: 2.1 };
    if (risk === 0) return { pace: wet ? 0.8 : -1.8, dnfMult: 0.40, penMult: 0.25 };
    return { pace: 0, dnfMult: 1.0, penMult: 1.0 };
  }

  const traitMult = (state, k) => (state.player.traits || []).reduce((m, id) => {
    const t = Game.data.traits.find(x => x.id === id);
    return m * ((t && t.mod[k]) || 1);
  }, 1);

  const engRelBonus = state => {
    const rel = (state && state.player && state.player.engineerRel) || 50;
    return rel >= 70 ? ((rel - 65) / 35) * 1.4 : rel < 35 ? -0.6 : 0;
  };

  function tyreCodeFor(tyre, weatherMode, wetLikely) {
    if (weatherMode === 'wet') return tyre === 0 ? 'W' : 'I';
    if (weatherMode === 'mixed') return tyre === 1 ? 'I' : tyre === 0 ? 'H' : 'S';
    if (wetLikely && tyre === 0) return 'H';
    return tyre === 2 ? 'S' : tyre === 0 ? 'H' : 'M';
  }

  Race.quali = function (entries, cat, circ, ctx) {
    const ch = ctx.choices || {};
    const tyreQ = ch.tyre === 2 ? 1.2 : ch.tyre === 0 ? -0.9 : 0.2;
    const riskQ = ch.risk === 2 ? 1.1 : ch.risk === 0 ? -0.8 : 0;
    const wMode = ctx.weatherMode || (ctx.wet ? 'wet' : 'dry');
    return entries.map(e => ({
      id: e.id,
      v: perf(e, cat, 'q', circ) + R.normal(0, 1.5) + (e.isPlayer ? (setupBonus(ch.setup, circ, wMode, true, ctx.engBonus) + tyreQ + riskQ) : 0)
    })).sort((a, b) => b.v - a.v).map(x => x.id);
  };

  Race.expected = function (entries, cat, circ) {
    const s = entries.map(e => ({ id: e.id, v: perf(e, cat, 'r', circ) })).sort((a, b) => b.v - a.v);
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

  function buildRows(order, entries, cat, circ, spec, ctx, tyre, risk) {
    const fin = order.filter(r => !r.dnf).sort((a, b) => b.v - a.v);
    const out = order.filter(r => r.dnf).sort((a, b) => b.dnfLap - a.dnfLap);
    const sorted = fin.concat(out);

    const flC = fin.slice(0, 10).map(r => ({
      r,
      v: perf(r.e, cat, 'r', circ) + (r.id === 'player' && tyre === 2 ? 1.8 : 0) + (r.id === 'player' && risk === 2 ? 1.2 : 0) + R.normal(0, 2.3)
    })).sort((a, b) => b.v - a.v)[0];
    const hasFl = spec.id !== 'sprint';
    const hasPole = spec.grid === 'quali' || spec.grid === 'quali2';
    const flId = hasFl && flC ? flC.r.id : null;
    const poleId = hasPole ? (spec.grid === 'quali2' ? (ctx.poleId2 || ctx.poleId) : ctx.poleId) : null;

    const leadV = fin.length ? fin[0].v : 0;
    const wMode = ctx.weatherMode || (ctx.wet ? 'wet' : 'dry');
    let cumGap = 0;

    return sorted.map((r, i) => {
      const classified = !r.dnf;
      let pts = classified ? (spec.pts[i] || 0) : 0;
      if (poleId === r.id && spec.pole) pts += spec.pole;
      if (flId === r.id && i < 10 && classified && spec.fl) pts += spec.fl;

      let gap = 'DNF';
      if (classified) {
        if (i === 0) {
          gap = 'Líder';
        } else {
          const diffV = Math.max(0.08, (leadV - r.v) * 2.35 + R.float() * 0.35);
          cumGap = Math.max(cumGap + 0.18 + R.float() * 0.45, diffV);
          gap = `+${cumGap.toFixed(3)}s`;
        }
      }

      const tCode = r.id === 'player'
        ? tyreCodeFor(tyre, wMode, circ.rain >= 35)
        : (wMode === 'wet' ? (R.chance(0.6) ? 'I' : 'W') : wMode === 'mixed' ? (R.chance(0.5) ? 'I' : 'M') : R.pick(['S', 'M', 'M', 'H']));

      return { id: r.id, teamId: r.e.teamId, pos: i + 1, grid: r.gp, dnf: r.dnf, dnfLap: r.dnfLap, pts, fl: flId === r.id, pole: poleId === r.id, pen: r.pen, gap, tyre: tCode };
    });
  }

  function buildSectorTelemetry(e, circ, pos, n, fl) {
    const pt = e.parts || { aero: e.car, power: e.car, chassis: e.car, quali: e.car };
    const baseSec = circ.prof === 'pw' ? 27.4 : circ.prof === 'dw' ? 29.8 : 28.6;
    const defs = [
      { label: 'S1', score: 0.55 * pt.power + 0.45 * e.attrs.RIT, base: baseSec },
      { label: 'S2', score: 0.55 * pt.aero + 0.45 * e.attrs.RAC, base: baseSec + 3.2 },
      { label: 'S3', score: 0.55 * pt.chassis + 0.45 * e.attrs.ATE, base: baseSec - 1.4 }
    ];
    return defs.map((s, idx) => {
      const status = (fl && idx === 1) || (pos === 1 && s.score >= 86) ? 'purple'
        : (pos <= Math.ceil(n * 0.45) || s.score >= 78) ? 'green'
        : 'yellow';
      const delta = status === 'purple' ? -0.25 : status === 'green' ? 0.12 : 0.65;
      const t = (s.base + (85 - s.score) * 0.04 + delta + R.float() * 0.15).toFixed(3);
      return { label: s.label, status, time: t + 's' };
    });
  }

  Race.simRace = function (state, entries, cat, circ, spec, grid, ctx) {
    const n = entries.length, ch = ctx.choices || {}, wMode = ctx.weatherMode || (ctx.wet ? 'wet' : 'dry');
    const wet = wMode === 'wet', mixed = wMode === 'mixed';
    const sc = R.chance(wet ? .52 : mixed ? .48 : .28);
    const tyre = ch.tyre != null ? ch.tyre : 1, risk = ch.risk != null ? ch.risk : 1;
    const sig = 2.2 + (wet ? 1.8 : mixed ? 1.5 : 0) + (sc ? .7 : 0);

    const rawRes = entries.map(e => {
      const gp = grid.indexOf(e.id) + 1;
      let v = perf(e, cat, 'r', circ) + (n - gp) / n * circ.q * 2.2 + R.normal(0, sig);
      const relScore = e.parts ? e.parts.rel : e.car;
      let dnfP = cat.dnf * (1 + (82 - e.attrs.ATE) / 70) * (1 + (80 - relScore) / 95) * (wet ? 1.5 : mixed ? 1.25 : 1);
      let pen = false;
      let stratInfo = null;

      if (e.isPlayer) {
        const sBonus = setupBonus(ch.setup, circ, wMode, false, ctx.engBonus);
        const chassisBonus = e.parts ? (e.parts.chassis - 75) * 0.25 : 0;
        const tFx = tyreEffect(tyre, circ, wMode, sc, e.attrs.ATE + chassisBonus);
        const rFx = riskEffect(risk, circ, wMode);
        const totalStrat = sBonus + tFx.pace + rFx.pace;
        v += totalStrat + traitMult(state, 'race') - 1 + (ctx.racingInjured ? -2.5 : 0);
        dnfP *= rFx.dnfMult * tFx.dnfMult * traitMult(state, 'dnf');
        stratInfo = { sBonus, tPace: tFx.pace, rPace: rFx.pace, setup: ch.setup, tyre, risk, weatherMode: wMode };
        if (R.chance(.06 * rFx.penMult * (1 + (80 - e.attrs.ATE) / 80))) { pen = true; v -= 2.2; }
      }

      const dnf = R.chance(cl(dnfP, .008, .42));
      const cause = dnf ? R.pick(CAUSES) : null;
      return { id: e.id, e, gp, v, dnf, dnfLap: dnf ? R.int(1, cat.laps) : 0, pen, cause, stratInfo };
    });

    const rows = buildRows(rawRes, entries, cat, circ, spec, ctx, tyre, risk);
    const out2 = { id: spec.id, name: spec.name, grid, order: rows, wet, mixed, weatherMode: wMode, sc, player: null, _raw: rawRes, _spec: spec, _ctx: ctx };
    const me = rows.find(r => r.id === 'player');
    if (me) out2.player = Race.playerSummary(state, entries, rows, me, rawRes.find(r => r.id === 'player'), ctx, circ, tyre, sc, risk);
    return out2;
  };

  /* Gera decisão tática de rádio para corridas principais de F2 e F1 (Safety Car ou mudança climática dinâmica). */
  Race.buildMidRaceEvent = function (cat, circ, mainRace) {
    if (!mainRace || !mainRace.player || mainRace.player.dnf || cat.level < 7) return null;
    const midLap = Math.max(8, Math.round(cat.laps * 0.52));
    if (mainRace.mixed) {
      return {
        type: 'rain',
        title: `Rádio da equipe · Volta ${midLap}/${cat.laps}`,
        text: `CLIMA INSTÁVEL em ${circ.name}! Nuvens pesadas cruzam o setor 2 enquanto o trilho começa a mudar. Qual é a chamada nos boxes?`,
        options: [
          { id: 'inter', label: 'Trocar para pneus Intermediários agora', sub: 'Ganha aderência imediata se a chuva apertar' },
          { id: 'slick', label: 'Arriscar e permanecer com pneus de pista seca', sub: 'Evita parada extra se o sol voltar rápido' }
        ]
      };
    }
    if (mainRace.sc) {
      return {
        type: 'sc',
        title: `Rádio da equipe · Volta ${midLap}/${cat.laps}`,
        text: `Safety Car na pista em ${circ.name}! O engenheiro pergunta se você entra nos boxes para colocar pneus macios novos ou mantém a posição de pista.`,
        options: [
          { id: 'box', label: 'Entrar nos boxes (pneus novos)', sub: 'Perde posição na parada, mas ganha ritmo forte na relargada' },
          { id: 'stay', label: 'Ficar na pista (ganhar posição)', sub: 'Assume a frente no pelotão, mas precisa segurar com pneus usados' }
        ]
      };
    }
    if (mainRace.wet || R.chance(0.30)) {
      return {
        type: 'rain',
        title: `Rádio da equipe · Volta ${midLap}/${cat.laps}`,
        text: `Nuvens carregadas sobre ${circ.name} e garoa começando no setor 2! Qual é a chamada estratégica?`,
        options: [
          { id: 'inter', label: 'Parar agora para intermediários', sub: 'Aposta segura se a chuva apertar' },
          { id: 'slick', label: 'Segurar mais voltas na pista', sub: 'Arriscado: ganha tempo se secar, escorrega se molhar' }
        ]
      };
    }
    return null;
  };

  /* Aplica a decisão de rádio no meio da corrida (F2/F1) antes de consolidar os pontos da etapa. */
  Race.applyMidRaceChoice = function (state, week, choiceId) {
    if (!week || !week.midEvent || !choiceId) return week;
    const mainRace = week.results[week.results.length - 1];
    if (!mainRace || !mainRace._raw || !mainRace.player || mainRace.player.dnf) return week;

    const pRaw = mainRace._raw.find(r => r.id === 'player');
    if (!pRaw || pRaw.dnf) return week;

    const circ = week.circuit;
    const evType = week.midEvent.type;
    const engHelp = ((state.player.engineerRel || 50) - 50) / 350; // até +0.14 de precisão com engenheiro top
    let deltaV = 0;
    let note = '';

    if (evType === 'sc') {
      if (choiceId === 'box') {
        const success = R.chance(cl((circ.q >= 1.5 ? 0.40 : 0.72) + engHelp, 0.2, 0.92));
        deltaV = success ? 2.7 : -1.8;
        note = success
          ? 'Chamada de rádio certeira: pneus novos no Safety Car renderam ultrapassagens na relargada.'
          : 'Parada no Safety Car custou posições difíceis de recuperar no tráfego.';
      } else {
        const success = R.chance(cl((circ.q >= 1.4 ? 0.70 : 0.44) + engHelp, 0.2, 0.92));
        deltaV = success ? 2.3 : -2.1;
        note = success
          ? 'Você segurou a posição na relargada e administrou os pneus até o fim.'
          : 'Ficar na pista sem parar cobrou o preço nas últimas voltas com pneus gastos.';
      }
    } else if (evType === 'rain') {
      if (choiceId === 'inter') {
        const heavyRain = mainRace.wet || mainRace.mixed || R.chance(0.58 + engHelp);
        deltaV = heavyRain ? 3.1 : -1.9;
        note = heavyRain
          ? 'A chuva apertou logo em seguida e a troca imediata para intermediários foi genial.'
          : 'A garoa passou rápido e a parada antecipada custou tempo precioso.';
      } else {
        const dryHold = !mainRace.wet && R.chance(0.54 + engHelp);
        deltaV = dryHold ? 2.6 : -2.7;
        note = dryHold
          ? 'Você segurou o carro na pista seca enquanto rivais pararam à toa!'
          : 'A pista encharcou e você perdeu muito tempo escorregando antes de parar.';
      }
    }

    pRaw.v += deltaV;
    const cat = Game.data.categories[state.season.catId];
    const ch = (mainRace._ctx && mainRace._ctx.choices) || {};
    const rows = buildRows(mainRace._raw, week._entries, cat, circ, mainRace._spec, mainRace._ctx, ch.tyre != null ? ch.tyre : 1, ch.risk != null ? ch.risk : 1);
    mainRace.order = rows;
    const me = rows.find(r => r.id === 'player');
    if (me) {
      mainRace.player = Race.playerSummary(state, week._entries, rows, me, pRaw, mainRace._ctx, circ, ch.tyre != null ? ch.tyre : 1, mainRace.sc, ch.risk != null ? ch.risk : 1);
      mainRace.player.lines.splice(1, 0, note);
    }
    week.midEvent = null;
    return week;
  };

  Race.playerSummary = function (state, entries, rows, me, raw, ctx, circ, tyre, sc, risk) {
    const n = rows.length, lines = [], e = raw.e, st = raw.stratInfo || {};
    const wMode = st.weatherMode || (ctx.wet ? 'wet' : 'dry');
    const p1 = cl(Math.round(me.grid - (e.attrs.RAC - 78) / 18 - (risk === 2 ? 1 : risk === 0 ? -1 : 0) + R.normal(0, 1.3)), 1, n);
    lines.push(p1 < me.grid ? `Largada excelente: saiu de ${me.grid}º e fechou a 1ª volta em ${p1}º.` : p1 > me.grid ? `Largada ruim: caiu para ${p1}º na 1ª volta (largou em ${me.grid}º).` : `Largou em ${me.grid}º e manteve a posição na 1ª volta.`);

    if (st.setup && st.setup !== 'bal') {
      if (st.setup === circ.prof) lines.push('Setup ideal para o traçado garantiu vantagem clara de ritmo.');
      else lines.push('Setup desajustado ao perfil da pista comprometeu a velocidade.');
    }
    if (wMode === 'wet') lines.push(st.setup === 'dw' ? 'Pista molhada: o ajuste de alta carga aerodinâmica deu excelente aderência.' : 'Pista molhada: a corrida exigiu máxima atenção.');
    else if (wMode === 'mixed') lines.push('Clima variável: mudança de tempo exigiu leitura rápida de pneus e aderência.');
    if (sc) lines.push('Safety car embolou o pelotão no meio da prova.');

    if (tyre === 2) {
      lines.push(sc ? 'Estratégia agressiva de pneus funcionou perfeitamente com o Safety Car.' : 'Pneus agressivos deram ritmo forte no início, mas exigiram gestão no final.');
    } else if (tyre === 0) {
      lines.push(!sc ? 'Estratégia conservadora de pneus rendeu ritmo superior nas voltas finais.' : 'Pneus conservadores seguraram o ritmo, mas o Safety Car neutralizou a vantagem de desgaste.');
    }

    if (risk === 2 && !me.dnf) lines.push('Pilotagem agressiva rendeu ultrapassagens decisivas no limite.');
    else if (risk === 0 && (wMode === 'wet' || wMode === 'mixed') && !me.dnf) lines.push('Postura cautelosa evitou erros sob clima instável e ganhou posições.');

    if (me.pen) lines.push('Você levou punição por incidente de pista, o que custou posições.');
    let crash = false;
    if (me.dnf) {
      lines.push(`ABANDONO na volta ${me.dnfLap}: ${raw.cause[0]}.`);
      crash = raw.cause[1];
    } else {
      const gain = me.grid - me.pos;
      lines.push(gain >= 3 ? `Corrida de recuperação: ganhou ${gain} posições com ultrapassagens decisivas.` : gain <= -3 ? `Perdeu ${-gain} posições: ritmo abaixo do esperado.` : 'Corrida controlada, sem grandes mudanças de posição.');
    }
    if (me.fl) lines.push('Você marcou a volta mais rápida da prova.');
    if (me.pole) lines.push('Pole position conquistada na classificação.');
    const mate = rows.find(r => r.id !== 'player' && r.teamId === me.teamId);
    if (mate) {
      const m = entries.find(x => x.id === mate.id);
      if (m) lines.push(`Companheiro ${m.name} terminou em ${mate.dnf ? 'abandono' : mate.pos + 'º'}.`);
    }
    lines.push(me.dnf ? 'Resultado final: sem pontos.' : `Resultado final: ${me.pos}º (+${me.pts} pts).`);
    const sectors = buildSectorTelemetry(e, circ, me.pos, n, me.fl);
    return { pos: me.pos, grid: me.grid, pts: me.pts, dnf: me.dnf, crash, pen: me.pen, fl: me.fl, pole: me.pole, lines, sectors, path: lapPath(me.grid, me.pos, n, me.dnf), n };
  };

  /* Executa apenas uma corrida específica (usado para Sprint separada do GP principal). */
  Race.simSingleStage = function (state, entries, cat, circ, spec, grid, choices, opts, q1, q2) {
    const rainRoll = R.float();
    const rainProb = circ.rain / 100;
    const weatherMode = rainRoll < rainProb * 0.7 ? 'wet' : rainRoll < rainProb * 1.35 ? 'mixed' : 'dry';
    const ctx = {
      choices: choices || {},
      wet: weatherMode === 'wet',
      weatherMode,
      racingInjured: opts && opts.racingInjured,
      engBonus: engRelBonus(state),
      poleId: q1[0],
      poleId2: q2[0]
    };
    return Race.simRace(state, entries, cat, circ, spec, grid, ctx);
  };

  Race.simulateWeekend = function (state, entries, cat, cal, choices, opts) {
    const circ = cal.circuit;
    const rainRoll = R.float();
    const rainProb = circ.rain / 100;
    const weatherMode = rainRoll < rainProb * 0.7 ? 'wet' : rainRoll < rainProb * 1.35 ? 'mixed' : 'dry';
    const wet = weatherMode === 'wet';
    const ctx = {
      choices: choices || {},
      wet,
      weatherMode,
      racingInjured: opts && opts.racingInjured,
      engBonus: engRelBonus(state)
    };
    const q1 = Race.quali(entries, cat, circ, ctx), q2 = Race.quali(entries, cat, circ, ctx);
    ctx.poleId = q1[0]; ctx.poleId2 = q2[0];

    // Em fim de semana de Sprint na F1 com modo interativo, executa primeiro apenas a Sprint
    // para que o jogador possa reajustar pneus/setup antes da Corrida Principal!
    if (cat.id === 'f1' && cal.sprint && opts && opts.splitSprint) {
      const sprintRes = Race.simSingleStage(state, entries, cat, circ, cal.sprint, q1.slice(), choices, opts, q1, q2);
      return {
        circuit: circ,
        wet,
        weatherMode,
        sprint: cal.sprint,
        quali: q1,
        results: [sprintRes],
        pendingMainGP: true,
        expected: Race.expected(entries, cat, circ),
        risk: (choices && choices.risk != null) ? choices.risk : 1,
        midEvent: null,
        _entries: entries,
        _q1: q1,
        _q2: q2
      };
    }

    const specs = cat.races.slice();
    if (cat.id === 'f1' && cal.sprint) specs.unshift(cat.sprint);
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
    const mainRace = results[results.length - 1];
    const midEvent = (opts && opts.allowMidRace) ? Race.buildMidRaceEvent(cat, circ, mainRace) : null;
    return {
      circuit: circ,
      wet,
      weatherMode,
      sprint: cal.sprint,
      quali: q1,
      results,
      pendingMainGP: false,
      expected: Race.expected(entries, cat, circ),
      risk: (choices && choices.risk != null) ? choices.risk : 1,
      midEvent,
      _entries: entries
    };
  };

  /* Completa a Corrida Principal após o jogador ajustar o carro pós-Sprint. */
  Race.appendMainGP = function (state, week, newChoices, opts) {
    if (!week || !week.pendingMainGP) return week;
    const cat = C[state.season.catId];
    const gpSpec = cat.races[0];
    const q1 = week._q1 || week.quali;
    const q2 = week._q2 || week.quali;
    const gpRes = Race.simSingleStage(state, week._entries, cat, week.circuit, gpSpec, q1.slice(), newChoices, opts, q1, q2);
    week.results.push(gpRes);
    week.pendingMainGP = false;
    week.risk = (newChoices && newChoices.risk != null) ? newChoices.risk : week.risk;
    week.midEvent = (opts && opts.allowMidRace) ? Race.buildMidRaceEvent(cat, week.circuit, gpRes) : null;
    delete week._q1;
    delete week._q2;
    return week;
  };

  Race.applyResults = function (season, week) {
    const S = season.standings;
    week.results.forEach(r => {
      const isSprint = r.id === 'sprint';
      r.order.forEach(o => {
        const s = S.drivers[o.id] || (S.drivers[o.id] = { pts: 0, wins: 0, podiums: 0, sprintWins: 0, sprintPodiums: 0, poles: 0, fl: 0, racePts: [], races: 0, dnfs: 0 });
        s.pts += o.pts; s.racePts.push(o.pts); s.races++;
        if (o.dnf) {
          s.dnfs++;
        } else if (isSprint) {
          if (o.pos === 1) s.sprintWins = (s.sprintWins || 0) + 1;
          if (o.pos <= 3) s.sprintPodiums = (s.sprintPodiums || 0) + 1;
        } else {
          if (o.pos === 1) s.wins++;
          if (o.pos <= 3) s.podiums++;
        }
        if (o.pole) s.poles++; if (o.fl) s.fl++;
        S.teams[o.teamId] = (S.teams[o.teamId] || 0) + o.pts;
      });
    });
  };

  Race.ranked = function (season, final) {
    const cat = C[season.catId];
    return Object.keys(season.entries).map(id => {
      const s = season.standings.drivers[id] || { pts: 0, wins: 0, podiums: 0, sprintWins: 0, sprintPodiums: 0, poles: 0, fl: 0, racePts: [], races: 0 };
      let pts = s.pts;
      if (final && cat.discard && s.racePts.length > cat.discard) pts -= s.racePts.slice().sort((a, b) => a - b).slice(0, cat.discard).reduce((x, y) => x + y, 0);
      return Object.assign({ id, pts, raw: s.pts }, season.entries[id], {
        wins: s.wins,
        podiums: s.podiums,
        sprintWins: s.sprintWins || 0,
        sprintPodiums: s.sprintPodiums || 0,
        poles: s.poles,
        fl: s.fl,
        races: s.races
      });
    }).sort((a, b) => b.pts - a.pts || b.wins - a.wins || b.podiums - a.podiums || (b.sprintWins || 0) - (a.sprintWins || 0) || b.fl - a.fl)
      .map((r, i) => Object.assign(r, { pos: i + 1 }));
  };
})();
