/* Reputação no Paddock, Popularidade, Família, Saúde, Lesões e Eventos Aleatórios. */
(function () {
  const D = Game.data, R = Game.rng, U = Game.utils, C = D.categories, cl = U.clamp;
  const P = Game.systems.pressure = {};
  const LABEL = { money: 'Dinheiro', rep: 'Reputação', pop: 'Popularidade', family: 'Família', mental: 'Mente', phys: 'Físico', train: 'Evolução' };

  P.mult = (s, k) => s.player.traits.reduce((m, id) => { const t = D.traits.find(x => x.id === id); return m * ((t && t.mod[k]) || 1); }, 1);

  P.ensure = function (p) {
    if (p.reputation == null) p.reputation = 45;
    if (p.popularity == null) p.popularity = 10;
    if (!p.pressure) p.pressure = { family: 65 };
  };

  P.apply = function (s, fx) {
    const p = s.player, parts = [];
    P.ensure(p);
    let popDelta = 0;

    Object.keys(fx).forEach(k => {
      if (k === 'team') return;
      let v = fx[k];
      if (k === 'money') {
        p.money += v;
        parts.push(`${LABEL.money} ${v > 0 ? '+' : ''}${U.fmtMoney(v)}`);
      } else if (k === 'media' || k === 'fans' || k === 'pop') {
        popDelta += v;
      } else if (k === 'rep') {
        v = v < 0 ? v * P.mult(s, 'pressureLoss') : v;
        v = Math.round(v);
        p.reputation = cl(p.reputation + v, 0, 100);
        if (v) parts.push(`${LABEL.rep} ${v > 0 ? '+' : ''}${v}`);
      } else if (k === 'family') {
        v = v < 0 ? v * P.mult(s, 'pressureLoss') : v;
        v = Math.round(v);
        p.pressure.family = cl(p.pressure.family + v, 0, 100);
        if (v) parts.push(`${LABEL.family} ${v > 0 ? '+' : ''}${v}`);
      } else if (k === 'mental' || k === 'phys') {
        if (v < 0) v *= P.mult(s, 'pressureLoss') * (k === 'mental' ? P.mult(s, 'mentalDrain') : 1);
        else if (k === 'mental') v *= P.mult(s, 'mentalGain');
        v = Math.round(v);
        p[k] = cl(p[k] + v, 0, 100);
        if (v) parts.push(`${LABEL[k]} ${v > 0 ? '+' : ''}${v}`);
      } else if (k === 'train') {
        p.train = Math.min(Game.config.trainCap + 2, p.train + v * P.mult(s, 'train'));
        parts.push(`${LABEL.train} +${v}`);
      } else if (k === 'injury') {
        p.injury = Math.max(p.injury, v);
        parts.push(`Lesão: ${v} etapa(s) fora`);
      } else if (k === 'sponsor') {
        const sp = Game.systems.economy.addSpecificSponsorOffer(s);
        parts.push(sp ? `Nova proposta de patrocínio: ${sp.name}` : 'Nova proposta de patrocínio disponível');
      } else if (k === 'flag') {
        p.flags[v] = true;
      }
    });

    if (popDelta) {
      let pv = popDelta > 0
        ? popDelta * P.mult(s, 'mediaGain') * Game.systems.economy.effects(s).media
        : popDelta * P.mult(s, 'pressureLoss');
      pv = Math.round(pv);
      if (pv) {
        p.popularity = cl(p.popularity + pv, 0, 100);
        parts.push(`${LABEL.pop} ${pv > 0 ? '+' : ''}${pv}`);
      }
    }

    return parts.join(' · ');
  };

  // recuperação entre etapas
  P.regen = function (s) {
    const p = s.player, f = Game.systems.economy.effects(s);
    P.ensure(p);
    p.mental = cl(p.mental + (1 + f.mental) * P.mult(s, 'mentalGain'), 0, 100);
    p.phys = cl(p.phys + 1.5 + f.phys, 0, 100);
    p.popularity = cl(p.popularity + f.pop / 8, 0, 100);
  };

  // impacto da corrida nas barras (Reputação no Paddock + Popularidade)
  P.afterRace = function (s, week) {
    const p = s.player, last = week.results[week.results.length - 1], me = last.player;
    P.ensure(p);
    if (!me) { P.regen(s); return; }

    let delta = week.expected - me.pos;
    if (me.dnf) delta = me.crash ? -5 : -1;

    let repDelta = cl(delta * 0.75, -5, 4);
    let popDelta = cl(delta * 0.5, -3, 3);
    if (me.pen) repDelta -= 2;
    if (me.pos === 1 && !me.dnf) { repDelta += 2; popDelta += 4; }
    else if (me.pos <= 3 && !me.dnf) { repDelta += 1; popDelta += 2; }

    // Duelo direto com o companheiro na corrida
    const mateRow = last.order.find(o => o.id !== 'player' && o.teamId === me.teamId);
    if (mateRow && !me.dnf) {
      if (mateRow.dnf || me.pos < mateRow.pos) repDelta += 1.2;
      else if (me.pos > mateRow.pos + 2) repDelta -= 1.0;
    }

    const fx = {
      rep: repDelta,
      pop: popDelta,
      mental: delta >= 0 ? .5 : cl(delta * .5, -3, 0)
    };
    if (week.risk === 2) { fx.phys = -2; fx.mental = (fx.mental || 0) - 1.5; }

    P.apply(s, fx);
    if (me.dnf && me.crash && R.chance(.2)) {
      const rounds = R.int(1, 3);
      p.injury = rounds; p.phys = cl(p.phys - 10, 0, 100);
      Game.systems.news.both(`Acidente em ${week.circuit.name}: lesão, ${rounds} etapa(s) fora.`, 'bad');
    }
    P.regen(s);
  };

  P.rollEvents = function (s) {
    const lv = C[s.player.catId].level, cfg = Game.config.eventsPerRound;
    let n = R.int(cfg[0], cfg[1]); if (R.chance(.15)) n = Math.max(0, n - 1);
    const pool = D.events.filter(e => lv >= (e.minLv || 0) && (e.maxLv == null || lv <= e.maxLv) && (!e.cond || e.cond(s)));
    const out = [];
    for (let i = 0; i < n && pool.length; i++) {
      const e = R.weighted(pool, x => (x.w === 0 ? 6 : x.w) * (x.party ? P.mult(s, 'partyW') : 1));
      pool.splice(pool.indexOf(e), 1); out.push(e);
    }
    return out;
  };

  P.resolve = function (s, ev, idx) {
    const ch = ev.choices[idx];
    let text = P.apply(s, ch.fx || {}), extra = '';
    if (ch.risk && R.chance(ch.risk.p)) { extra = ch.risk.text + ' ' + P.apply(s, ch.risk.fx); }
    return { text, extra };
  };

  P.interview = function (s, tone) {
    const t = D.interview.find(x => x.id === tone), vol = tone === 'humilde' ? 1 : P.mult(s, 'mediaVol');
    const scale = fx => {
      const o = {};
      Object.keys(fx).forEach(k => {
        if (k === 'team') return;
        o[k] = fx[k] * (fx[k] < 0 || tone === 'humilde' ? 1 : vol);
      });
      return o;
    };
    let text = t.text + ' ' + P.apply(s, scale(t.fx)), extra = '';
    if (t.risk && R.chance(t.risk.p)) extra = t.risk.text + ' ' + P.apply(s, t.risk.fx);
    s.player.interviewDone = true;
    return { text, extra };
  };
})();
