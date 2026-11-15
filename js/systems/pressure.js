/* Pressão, mídia, saúde, lesões e eventos aleatórios. */
(function () {
  const D = Game.data, R = Game.rng, U = Game.utils, C = D.categories, cl = U.clamp;
  const P = Game.systems.pressure = {};
  const BARS = ['team', 'media', 'fans', 'family', 'mental', 'phys'];
  const LABEL = { money: 'Dinheiro', team: 'Equipe', media: 'Mídia', fans: 'Fãs', family: 'Família', mental: 'Mente', phys: 'Físico', pop: 'Popularidade', train: 'Evolução' };

  P.mult = (s, k) => s.player.traits.reduce((m, id) => { const t = D.traits.find(x => x.id === id); return m * ((t && t.mod[k]) || 1); }, 1);

  // aplica efeitos (fx) e devolve um texto resumindo
  P.apply = function (s, fx) {
    const p = s.player, parts = [];
    Object.keys(fx).forEach(k => {
      let v = fx[k];
      if (k === 'money') { p.money += v; parts.push(`${LABEL.money} ${v > 0 ? '+' : ''}${U.fmtMoney(v)}`); }
      else if (BARS.includes(k)) {
        if (k === 'media' || k === 'fans') v = v > 0 ? v * P.mult(s, 'mediaGain') * (k === 'media' ? Game.systems.economy.effects(s).media : 1) : v * P.mult(s, 'pressureLoss');
        else if (v < 0) v *= P.mult(s, 'pressureLoss') * (k === 'mental' ? P.mult(s, 'mentalDrain') : 1);
        else if (k === 'mental') v *= P.mult(s, 'mentalGain');
        v = Math.round(v);
        if (k === 'mental' || k === 'phys') p[k] = cl(p[k] + v, 0, 100); else p.pressure[k] = cl(p.pressure[k] + v, 0, 100);
        if (v) parts.push(`${LABEL[k]} ${v > 0 ? '+' : ''}${v}`);
      } else if (k === 'pop') { p.popularity = cl(p.popularity + v, 0, 100); parts.push(`${LABEL.pop} ${v > 0 ? '+' : ''}${v}`); }
      else if (k === 'train') { p.train = Math.min(Game.config.trainCap + 2, p.train + v * P.mult(s, 'train')); parts.push(`${LABEL.train} +${v}`); }
      else if (k === 'injury') { p.injury = Math.max(p.injury, v); parts.push(`Lesão: ${v} etapa(s) fora`); }
      else if (k === 'sponsor') { Game.systems.economy.genSponsorOffers(s); parts.push('Nova proposta de patrocínio'); }
      else if (k === 'flag') { p.flags[v] = true; }
    });
    return parts.join(' · ');
  };

  // recuperação entre etapas
  P.regen = function (s) {
    const p = s.player, f = Game.systems.economy.effects(s);
    p.mental = cl(p.mental + (1 + f.mental) * P.mult(s, 'mentalGain'), 0, 100);
    p.phys = cl(p.phys + 1.5 + f.phys, 0, 100);
    p.popularity = cl(p.popularity + f.pop / 8, 0, 100);
    ['media', 'fans'].forEach(k => { p.pressure[k] += (45 - p.pressure[k]) * .04; });
  };

  // impacto da corrida nas barras
  P.afterRace = function (s, week) {
    const p = s.player, last = week.results[week.results.length - 1], me = last.player;
    if (!me) { P.apply(s, { team: -2 }); return; }
    let delta = week.expected - me.pos;
    if (me.dnf) delta = me.crash ? -5 : -1;
    const fx = { team: cl(delta * .9, -6, 5), media: cl(delta * .6, -5, 4), fans: cl(delta * .5, -4, 4), mental: delta >= 0 ? .5 : cl(delta * .6, -4, 0) };
    if (me.pos === 1 && !me.dnf) { fx.media += 4; fx.fans += 4; fx.pop = 1.5; } else if (me.pos <= 3 && !me.dnf) fx.pop = .6;
    P.apply(s, fx);
    if (me.dnf && me.crash && R.chance(.22)) {
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
    const scale = fx => { const o = {}; Object.keys(fx).forEach(k => { o[k] = fx[k] * (fx[k] < 0 || tone === 'humilde' ? 1 : vol); }); return o; };
    let text = t.text + ' ' + P.apply(s, scale(t.fx)), extra = '';
    if (t.risk && R.chance(t.risk.p)) extra = t.risk.text + ' ' + P.apply(s, t.risk.fx);
    s.player.interviewDone = true;
    return { text, extra };
  };
})();
