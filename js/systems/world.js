/* Mundo: pilotos, equipes e a renovação dos grids a cada ano (aposentadorias, promoções, novatos, trocas). */
(function () {
  const D = Game.data, R = Game.rng, U = Game.utils, A = Game.systems.attributes, cfg = Game.config;
  const C = D.categories, L = D.ladder;
  const W = Game.systems.world = {};

  W.rating = (d, year) => A.driverAttrs(d, year).GER;
  W.isRegYear = y => (y - cfg.regulationBaseYear) % cfg.regulationCycle === 0;
  W.driver = (state, id) => state.world.drivers.find(d => d.id === id);
  W.team = (state, catId, teamId) => state.world.teams[catId].find(t => t.id === teamId);

  function makeName(state, country) {
    const key = D.names[country] ? country : (D.nameAlias[country] || 'BRA'), n = D.names[key];
    const used = new Set(state.world.drivers.concat(state.world.pending).map(d => d.name));
    let name, tries = 0;
    do { name = R.pick(n.f) + ' ' + R.pick(n.l); tries++; } while (used.has(name) && tries < 30);
    return used.has(name) ? name + ' Jr.' : name;
  }

  W.genDriver = function (state, catId, age) {
    const c = C[catId];
    age = age != null ? age : R.int(c.minAge, Math.min(c.maxAge - 1, c.minAge + 3));
    const mix = (c.level <= 1 || catId === 'f4br') ? D.countryMix.brazil : D.countryMix.world;
    const country = R.weighted(Object.keys(mix), k => mix[k]);
    const rate = m => m + R.normal(0, 6);
    const vals = { RIT: rate(c.mean), RAC: rate(c.mean), ATE: rate(c.mean - 4), EXP: A.E(age) + R.normal(0, 4) };
    return { id: U.uid('d'), name: makeName(state, country), country, birth: state.year - age, peak: A.peakFrom(vals, age),
      cat: catId, teamId: null, real: false, retireAge: R.int(36, 44), lastPos: null };
  };

  W.init = function (state) {
    const y = state.year;
    state.world = { drivers: [], teams: {}, pending: [] };
    L.forEach(id => { state.world.teams[id] = D.teams[id].map(t => Object.assign({}, t)); });
    const pool = D.realDrivers.map(r => ({ id: U.uid('r'), name: r[0], country: r[1], birth: r[2], real: true, lastPos: null,
      peak: A.peakFrom({ EXP: r[5], RAC: r[6], ATE: r[7], RIT: r[8] }, cfg.dataYear - r[2]), cat: null, teamId: null,
      retireAge: r[2] < 1985 ? 46 : R.int(38, 44), snap: { cat: r[3], team: r[4] } }));
    const free = [];
    pool.forEach(d => { const age = y - d.birth; if (age < 12) state.world.pending.push(d); else if (age < d.retireAge) free.push(d); });
    if (y === cfg.dataYear) {
      free.forEach(d => { d.cat = d.snap.cat; d.teamId = d.snap.team; state.world.drivers.push(d); });
    } else {
      [...L].reverse().forEach(id => {
        const c = C[id];
        free.filter(d => { const a = y - d.birth; return !d.cat && a >= c.minAge && a <= c.maxAge && (id !== 'f1' || a >= cfg.f1MinAge); })
          .sort((a, b) => W.rating(b, y) - W.rating(a, y)).slice(0, c.grid)
          .forEach(d => { d.cat = id; state.world.drivers.push(d); });
      });
    }
    L.forEach(id => W.fillSeats(state, id));
  };

  // garante que todas as equipes tenham pilotos; sobra de pilotos sem vaga sai do mundo
  W.fillSeats = function (state, catId) {
    const c = C[catId], teams = state.world.teams[catId], p = state.player, y = state.year;
    const inCat = state.world.drivers.filter(d => d.cat === catId);
    const valid = id => teams.some(t => t.id === id);
    const unseated = inCat.filter(d => !d.teamId || !valid(d.teamId)).sort((a, b) => W.rating(b, y) - W.rating(a, y));
    unseated.forEach(d => { d.teamId = null; });
    const reserved = t => (p && p.catId === catId && p.teamId === t.id) ? 1 : 0;
    const open = [];
    teams.forEach(t => {
      const n = inCat.filter(d => d.teamId === t.id).length + reserved(t);
      for (let i = n; i < c.seats; i++) open.push(t);
    });
    const keyed = open.map(t => ({ t, k: t.car + R.normal(0, 2) })).sort((a, b) => b.k - a.k).map(x => x.t);
    unseated.forEach(d => {
      const t = keyed.shift();
      if (t) d.teamId = t.id; else state.world.drivers.splice(state.world.drivers.indexOf(d), 1);
    });
    keyed.forEach(t => { const d = W.genDriver(state, catId); d.teamId = t.id; state.world.drivers.push(d); });
  };

  // coloca o jogador na equipe: retira o piloto mais fraco se a equipe estiver cheia
  W.seatPlayer = function (state) {
    const p = state.player, y = state.year;
    const mates = state.world.drivers.filter(d => d.cat === p.catId && d.teamId === p.teamId).sort((a, b) => W.rating(a, y) - W.rating(b, y));
    while (mates.length >= C[p.catId].seats) {
      const out = mates.shift();
      state.world.drivers.splice(state.world.drivers.indexOf(out), 1);
    }
    L.forEach(id => W.fillSeats(state, id));
  };

  // virada de ano: aposentadorias, novatos, promoções, trocas de equipe
  W.rollover = function (state) {
    const y = state.year, w = state.world;
    w.drivers = w.drivers.filter(d => {
      const age = y - d.birth, c = C[d.cat];
      if (age >= d.retireAge) { if (d.real && d.cat === 'f1') Game.systems.news.add(`${d.name} se aposenta da F1.`); return false; }
      if (age > c.maxAge) return false;
      if (d.cat === 'f1' && age > 30 && W.rating(d, y) < 66) return false;
      return true;
    });
    w.pending = w.pending.filter(d => { if (y - d.birth >= 12) { d.cat = 'kartReg'; d.teamId = null; w.drivers.push(d); return false; } return true; });
    [...L].reverse().forEach(id => {
      const c = C[id], cap = c.grid - (state.player.catId === id ? 1 : 0), feeders = D.feeders[id];
      const members = w.drivers.filter(d => d.cat === id);
      while (members.length < cap && feeders.length) {
        const cand = w.drivers.filter(d => feeders.includes(d.cat) && (y - d.birth) >= c.minAge && (id !== 'f1' || (y - d.birth) >= cfg.f1MinAge) && W.rating(d, y) >= c.mean - 8);
        if (!cand.length) break;
        const best = cand.map(d => ({ d, k: W.rating(d, y) + R.normal(0, 2) + (d.lastPos ? (10 - Math.min(d.lastPos, 20)) * .15 : 0) })).sort((a, b) => b.k - a.k)[0].d;
        best.cat = id; best.teamId = null; members.push(best);
      }
      if (members.length > cap) members.sort((a, b) => W.rating(a, y) - W.rating(b, y)).slice(0, members.length - cap).forEach(d => w.drivers.splice(w.drivers.indexOf(d), 1));
    });
    L.forEach(id => W.fillSeats(state, id));
    W.swaps(state);
  };

  // mercado: bons pilotos em carros ruins trocam com pilotos piores em carros melhores
  W.swaps = function (state) {
    const y = state.year, news = Game.systems.news;
    ['f1', 'f2', 'f3'].forEach(id => {
      const ds = state.world.drivers.filter(d => d.cat === id), teams = state.world.teams[id];
      let n = 0;
      for (let i = 0; i < 16 && n < (id === 'f1' ? 3 : 2); i++) {
        const a = R.pick(ds), b = R.pick(ds);
        if (!a || !b || a === b || a.teamId === b.teamId) continue;
        const ta = teams.find(t => t.id === a.teamId), tb = teams.find(t => t.id === b.teamId);
        if (!ta || !tb) continue;
        if (W.rating(a, y) - W.rating(b, y) >= 3 && tb.car - ta.car >= 4) {
          a.teamId = tb.id; b.teamId = ta.id; n++;
          if (id !== 'f3') news.add(`${id.toUpperCase()}: ${a.name} fecha com a ${tb.name}; ${b.name} vai para a ${ta.name}.`);
        }
      }
    });
  };

  // notas dos carros: reset em anos de regulamento novo, deriva leve nos demais
  W.updateCars = function (state) {
    const y = state.year;
    Object.keys(state.world.teams).forEach(id => {
      state.world.teams[id].forEach(t => {
        const base = D.teams[id].find(x => x.id === t.id);
        if (id === 'f1' && W.isRegYear(y)) t.car = U.clamp(R.normal(80, 6.5), 64, 95);
        else t.car = U.clamp(t.car + R.normal(0, 1.6) + (base.car - t.car) * .08, 55, 97);
      });
    });
    if (state.world.teams.f1 && W.isRegYear(y) && y > cfg.startYear) Game.systems.news.add(`Nova era técnica na F1 em ${y}: o equilíbrio entre as equipes foi embaralhado.`, 'good');
  };

  // lista de inscritos de uma categoria para a temporada/corrida (inclui o jogador se pedido)
  W.entries = function (state, catId, withPlayer, opts) {
    const y = state.year, p = state.player;
    const list = state.world.drivers.filter(d => d.cat === catId).map(d => {
      const t = W.team(state, catId, d.teamId);
      return { id: d.id, name: d.name, country: d.country, teamId: d.teamId, attrs: A.driverAttrs(d, y), car: t ? t.car : 60, isPlayer: false };
    });
    if (withPlayer) {
      const t = W.team(state, catId, p.teamId);
      list.push({ id: 'player', name: p.name, country: p.country, teamId: p.teamId, attrs: A.playerAttrs(p, y, opts), car: (t ? t.car : 60) + (p.carBonus || 0), isPlayer: true });
    }
    return list;
  };
})();
