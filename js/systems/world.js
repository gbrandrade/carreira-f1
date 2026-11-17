/* Mundo: pilotos, equipes e a renovação dos grids a cada ano (histórico realista da F1 até o jogador chegar lá). */
(function () {
  const D = Game.data, R = Game.rng, U = Game.utils, A = Game.systems.attributes, cfg = Game.config;
  const C = D.categories, L = D.ladder;
  const W = Game.systems.world = {};

  W.rating = (d, year) => A.driverAttrs(d, year).GER;
  W.isRegYear = y => (y - cfg.regulationBaseYear) % cfg.regulationCycle === 0;
  W.driver = (state, id) => state.world.drivers.find(d => d.id === id);
  W.team = (state, catId, teamId) => (state.world.teams[catId] || []).find(t => t.id === teamId);
  W.activeTeams = (state, catId) => (state.world.teams[catId] || []).filter(t => t.active !== false);

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
    return {
      id: U.uid('d'), name: makeName(state, country), country, birth: state.year - age,
      peak: A.peakFrom(vals, age), cat: catId, teamId: null, real: false,
      retireAge: R.int(36, 44), lastPos: null, titles: 0
    };
  };

  /* Atualiza nomes, presença (ex: Cadillac em 2026) e força das equipes de F1 conforme o ano histórico. */
  W.syncF1Teams = function (state, announce) {
    const y = state.year, f1Teams = state.world.teams.f1 || [], hist = D.f1History || {};
    f1Teams.forEach(t => {
      const base = D.teams.f1.find(x => x.id === t.id) || t;
      const wasActive = t.active !== false;
      t.active = y >= (base.minYear || 2000);
      if (!wasActive && t.active && announce) {
        Game.systems.news.add(`F1: ${t.name} estreia no grid da Fórmula 1 em ${y}.`, 'good');
      }
      const eras = hist[t.id];
      if (!eras) return;
      const era = eras.find(e => y >= e.from && y <= e.to) || eras[eras.length - 1];
      if (!era) return;
      if (t.name && t.name !== era.name && announce && t.active) {
        Game.systems.news.add(`F1: ${t.name} passa a competir como ${era.name}.`);
      }
      t.name = era.name;
      if (era.prestige != null) t.prestige = era.prestige;
      if (era.cars && era.cars[y] != null && y <= cfg.dataYear) {
        t.car = era.cars[y];
      }
    });
  };

  /* Aplica as escalações e transferências reais da F1 (2018-2026) até o jogador entrar na F1. */
  W.syncF1Lineups = function (state, announce) {
    const y = state.year, p = state.player;
    const playerInF1 = (state.flags && state.flags.wasF1) || (p && p.catId === 'f1');
    const lineup = D.f1Lineups && D.f1Lineups[y];
    if (playerInF1 || !lineup || y > cfg.dataYear) return;

    const allPool = state.world.drivers.concat(state.world.pending);
    const prevF1 = new Map();
    state.world.drivers.filter(d => d.cat === 'f1').forEach(d => prevF1.set(d.name, d.teamId));

    // Move atuais pilotos de F1 não presentes na escalação do ano para reserva/aposentados
    const targetNames = new Set(Object.values(lineup).flat());
    state.world.drivers.forEach(d => {
      if (d.cat === 'f1' && !targetNames.has(d.name)) {
        d.cat = 'f1_ret';
        d.teamId = null;
      }
    });

    Object.keys(lineup).forEach(teamId => {
      const team = W.team(state, 'f1', teamId);
      if (!team || team.active === false) return;
      const names = lineup[teamId];
      names.forEach(name => {
        let d = allPool.find(x => x.name === name);
        if (!d) {
          const raw = D.realDrivers.find(r => r[0] === name);
          if (raw) {
            d = {
              id: U.uid('r'), name: raw[0], country: raw[1], birth: raw[2], real: true, lastPos: null,
              peak: A.peakFrom({ EXP: raw[5], RAC: raw[6], ATE: raw[7], RIT: raw[8] }, cfg.dataYear - raw[2]),
              cat: 'f1', teamId, retireAge: raw[2] < 1985 ? 46 : 43, snap: { cat: raw[3], team: raw[4] },
              titles: raw[9] || 0
            };
            state.world.drivers.push(d);
            allPool.push(d);
          }
        }
        if (!d) return;
        const pIdx = state.world.pending.indexOf(d);
        if (pIdx >= 0) {
          state.world.pending.splice(pIdx, 1);
          state.world.drivers.push(d);
        }
        const oldTeam = prevF1.get(d.name);
        if (announce && oldTeam && oldTeam !== teamId) {
          Game.systems.news.add(`F1: ${d.name} assina com a ${team.name}.`);
        } else if (announce && !oldTeam && y > cfg.startYear) {
          Game.systems.news.add(`F1: ${d.name} assume vaga titular na ${team.name}.`);
        }
        d.cat = 'f1';
        d.teamId = teamId;
      });
    });
  };

  W.init = function (state) {
    const y = state.year;
    state.world = { drivers: [], teams: {}, pending: [] };
    L.forEach(id => { state.world.teams[id] = D.teams[id].map(t => Object.assign({ active: true }, t)); });
    W.syncF1Teams(state, false);

    const pool = D.realDrivers.map(r => ({
      id: U.uid('r'), name: r[0], country: r[1], birth: r[2], real: true, lastPos: null,
      peak: A.peakFrom({ EXP: r[5], RAC: r[6], ATE: r[7], RIT: r[8] }, cfg.dataYear - r[2]),
      cat: null, teamId: null, retireAge: r[2] < 1985 ? 46 : R.int(39, 44),
      snap: { cat: r[3], team: r[4] }, titles: r[9] || 0
    }));

    // Ajusta títulos iniciais caso o jogo comece antes de 2026 (ex: em 2018 Hamilton tinha 4, Verstappen 0, Norris 0)
    if (y < cfg.dataYear && D.f1HistoricalChampions) {
      pool.forEach(d => {
        let futureTitles = 0;
        Object.keys(D.f1HistoricalChampions).forEach(yr => {
          if (+yr >= y && D.f1HistoricalChampions[yr] === d.name) futureTitles++;
        });
        d.titles = Math.max(0, (d.titles || 0) - futureTitles);
      });
    }

    const free = [];
    pool.forEach(d => {
      const age = y - d.birth;
      if (d.snap.cat === 'f1_ret') {
        d.cat = 'f1_ret';
        state.world.drivers.push(d);
      } else if (age < 12) {
        state.world.pending.push(d);
      } else if (age < d.retireAge) {
        free.push(d);
      }
    });

    if (y === cfg.dataYear) {
      free.forEach(d => {
        if (C[d.snap.cat]) {
          d.cat = d.snap.cat;
          d.teamId = d.snap.team;
          state.world.drivers.push(d);
        } else {
          d.cat = d.snap.cat;
          state.world.drivers.push(d);
        }
      });
    } else {
      // Primeiro aplica a escalação histórica da F1 se existir para o ano inicial
      W.syncF1Lineups(state, false);
      const alreadyIn = new Set(state.world.drivers.filter(d => d.cat === 'f1').map(d => d.name));
      [...L].reverse().forEach(id => {
        if (id === 'f1' && D.f1Lineups && D.f1Lineups[y]) return;
        const c = C[id];
        free.filter(d => {
          const a = y - d.birth;
          return !d.cat && !alreadyIn.has(d.name) && a >= c.minAge && a <= c.maxAge && (id !== 'f1' || a >= cfg.f1MinAge);
        })
          .sort((a, b) => W.rating(b, y) - W.rating(a, y))
          .slice(0, c.grid)
          .forEach(d => { d.cat = id; state.world.drivers.push(d); });
      });
    }
    L.forEach(id => W.fillSeats(state, id));
  };

  // garante que todas as equipes ativas tenham pilotos; sobra de pilotos sem vaga sai do mundo
  W.fillSeats = function (state, catId) {
    const c = C[catId], teams = W.activeTeams(state, catId), p = state.player, y = state.year;
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
      if (t) d.teamId = t.id;
      else if (d.real) { d.cat = 'f1_ret'; d.teamId = null; }
      else state.world.drivers.splice(state.world.drivers.indexOf(d), 1);
    });
    keyed.forEach(t => { const d = W.genDriver(state, catId); d.teamId = t.id; state.world.drivers.push(d); });
  };

  // coloca o jogador na equipe: retira o piloto mais fraco se a equipe estiver cheia
  W.seatPlayer = function (state) {
    const p = state.player, y = state.year;
    const mates = state.world.drivers.filter(d => d.cat === p.catId && d.teamId === p.teamId).sort((a, b) => W.rating(a, y) - W.rating(b, y));
    while (mates.length >= C[p.catId].seats) {
      const out = mates.shift();
      if (out.real) { out.cat = 'f1_ret'; out.teamId = null; }
      else state.world.drivers.splice(state.world.drivers.indexOf(out), 1);
    }
    L.forEach(id => W.fillSeats(state, id));
  };

  // registra o campeão mundial da F1 de um ano encerrado quando o jogador não estava na F1
  W.awardF1ChampionForYear = function (state, completedYear) {
    const p = state.player;
    if (p && p.catId === 'f1') return;
    let champ = null;
    const histName = D.f1HistoricalChampions && D.f1HistoricalChampions[completedYear];
    if (histName) {
      champ = state.world.drivers.find(d => d.name === histName);
    }
    if (!champ) {
      const f1Drivers = state.world.drivers.filter(d => d.cat === 'f1');
      if (f1Drivers.length) {
        champ = f1Drivers.map(d => {
          const t = W.team(state, 'f1', d.teamId);
          const score = 0.6 * (t ? t.car : 75) + 0.4 * W.rating(d, completedYear) + R.normal(0, 1.8);
          return { d, score };
        }).sort((a, b) => b.score - a.score)[0].d;
      }
    }
    if (champ) {
      champ.titles = (champ.titles || 0) + 1;
      Game.systems.news.add(`F1 ${completedYear}: ${champ.name} conquista o título mundial (${champ.titles}º título).`, 'good');
      if (D.f1Records && champ.titles > D.f1Records.titles.value) {
        D.f1Records.titles.value = champ.titles;
        D.f1Records.titles.holder = champ.name;
      }
    }
  };

  // virada de ano: títulos históricos, aposentadorias, novatos, promoções, trocas de equipe
  W.rollover = function (state) {
    const completedYear = state.year - 1;
    W.awardF1ChampionForYear(state, completedYear);

    const y = state.year, w = state.world, p = state.player;
    const playerInF1 = (state.flags && state.flags.wasF1) || (p && p.catId === 'f1');
    const keepHistoricalF1 = !playerInF1 && D.f1Lineups && D.f1Lineups[y];

    W.syncF1Teams(state, true);

    w.drivers = w.drivers.filter(d => {
      if (d.cat === 'f1_ret' || d.cat === 'f2_pool') return true;
      const age = y - d.birth, c = C[d.cat];
      if (!c) return false;
      if (d.cat === 'f1' && keepHistoricalF1) return true;
      if (age >= d.retireAge) {
        if (d.real && d.cat === 'f1') Game.systems.news.add(`${d.name} se aposenta da F1.`);
        return false;
      }
      if (age > c.maxAge) return false;
      if (d.cat === 'f1' && age > 30 && W.rating(d, y) < 66) return false;
      return true;
    });

    w.pending = w.pending.filter(d => {
      if (y - d.birth >= 12) {
        d.cat = 'kartReg'; d.teamId = null; w.drivers.push(d);
        return false;
      }
      return true;
    });

    if (keepHistoricalF1) {
      W.syncF1Lineups(state, true);
    }

    [...L].reverse().forEach(id => {
      if (id === 'f1' && keepHistoricalF1) return;
      const c = C[id], activeTeams = W.activeTeams(state, id);
      const maxGrid = activeTeams.length * c.seats;
      const cap = maxGrid - (state.player.catId === id ? 1 : 0), feeders = D.feeders[id];
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
    W.swaps(state, keepHistoricalF1);
  };

  // mercado: bons pilotos em carros ruins trocam com pilotos piores em carros melhores
  W.swaps = function (state, skipF1) {
    const y = state.year, news = Game.systems.news;
    const cats = skipF1 ? ['f2', 'f3'] : ['f1', 'f2', 'f3'];
    cats.forEach(id => {
      const ds = state.world.drivers.filter(d => d.cat === id), teams = W.activeTeams(state, id);
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

  // notas dos carros: usa curva histórica na F1 até 2026; depois reset em anos de regulamento novo e deriva leve
  W.updateCars = function (state) {
    const y = state.year;
    W.syncF1Teams(state, false);
    Object.keys(state.world.teams).forEach(id => {
      state.world.teams[id].forEach(t => {
        if (id === 'f1' && y <= cfg.dataYear && D.f1History && D.f1History[t.id]) {
          const era = D.f1History[t.id].find(e => y >= e.from && y <= e.to);
          if (era && era.cars && era.cars[y] != null) {
            t.car = era.cars[y];
            return;
          }
        }
        const base = D.teams[id].find(x => x.id === t.id) || t;
        if (id === 'f1' && W.isRegYear(y)) t.car = U.clamp(R.normal(80, 6.5), 64, 95);
        else t.car = U.clamp(t.car + R.normal(0, 1.6) + (base.car - t.car) * .08, 55, 97);
      });
    });
    if (state.world.teams.f1 && W.isRegYear(y) && y > cfg.startYear) {
      Game.systems.news.add(`Nova era técnica na F1 em ${y}: o equilíbrio entre as equipes foi embaralhado.`, 'good');
    }
  };

  // lista de inscritos de uma categoria para a temporada/corrida (inclui o jogador se pedido)
  W.entries = function (state, catId, withPlayer, opts) {
    const y = state.year, p = state.player;
    const list = state.world.drivers.filter(d => d.cat === catId).map(d => {
      const t = W.team(state, catId, d.teamId);
      return { id: d.id, name: d.name, country: d.country, teamId: d.teamId, attrs: A.driverAttrs(d, y), car: t ? t.car : 60, isPlayer: false, titles: d.titles || 0 };
    });
    if (withPlayer) {
      const t = W.team(state, catId, p.teamId);
      list.push({ id: 'player', name: p.name, country: p.country, teamId: p.teamId, attrs: A.playerAttrs(p, y, opts), car: (t ? t.car : 60) + (p.carBonus || 0), isPlayer: true, titles: p.f1.titles || 0 });
    }
    return list;
  };
})();
