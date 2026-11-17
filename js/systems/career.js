/* Orquestrador da carreira: novo jogo, início/fim de temporada, etapas, simulação rápida da base, aposentadoria e finais. */
(function () {
  const D = Game.data, R = Game.rng, U = Game.utils, C = D.categories, cfg = Game.config, cl = U.clamp;
  const S = Game.systems, Car = S.career = {};

  Car.save = () => { if (Game.state) Game.core.storage.save(Game.state); };

  Car.newGame = function (setup) {
    const s = {
      v: 1, year: cfg.startYear, phase: 'offseason', player: null, world: null, season: null,
      offers: [], sponsorOffers: [], news: [], timeline: [], flags: {}, ending: null, summary: null
    };
    Game.state = s;
    const o = D.origins.find(x => x.id === setup.origin), L = cfg.luckRange;
    const lk = () => L[0] + (L[1] - L[0]) * R.float();
    s.player = {
      name: setup.name, country: setup.country, birth: s.year - cfg.startAge, origin: o.id, traits: setup.traits, picks: setup.picks, pickSrc: setup.pickSrc,
      luck: { EXP: lk(), RAC: lk(), ATE: lk(), RIT: lk() }, train: 0, catId: 'kartReg', teamId: null, contract: null,
      money: o.money, supportLeft: 0, debtYears: 0, bankrupt: false, bankruptcies: 0, phys: 85, mental: 80, popularity: 10,
      pressure: { team: 60, media: 45, fans: 35, family: o.family }, injury: 0, assets: [], invest: [], sponsors: [], agent: false,
      engineerRel: 50, residence: 'BRA', devFocus: null, interviewDone: false, carBonus: 0,
      stats: { races: 0, wins: 0, podiums: 0, poles: 0, fl: 0, points: 0, titles: 0, dnfs: 0, seasons: 0 },
      f1: { races: 0, wins: 0, podiums: 0, poles: 0, fl: 0, points: 0, titles: 0 }, titlesList: [], superPoints: [], singleSeaterSeasons: 0,
      lastSeason: null, season: null, ach: {}, flags: {}, academy: null, fired: false, forcedUp: false, noSeat: false, firedCount: 0
    };
    S.world.init(s);
    S.news.both(`Início da carreira: ${setup.name} começa no kart aos ${cfg.startAge} anos.`);
    S.economy.genSponsorOffers(s);
    S.contracts.generateOffers(s);
    Car.save();
    return s;
  };

  Car.startSeason = function () {
    const s = Game.state, p = s.player, c = p.contract;
    if (!c) return null;
    p.catId = c.catId; p.teamId = c.teamId;
    S.world.updateCars(s);
    S.world.seatPlayer(s);
    const entries = S.world.entries(s, p.catId, true), names = {};
    entries.forEach(e => { const t = S.world.team(s, p.catId, e.teamId); names[e.id] = { name: e.name, country: e.country, teamId: e.teamId, teamName: t ? t.name : '-' }; });
    s.season = {
      year: s.year, catId: p.catId, cal: S.calendar.build(p.catId, s.year), round: 0,
      standings: { drivers: {}, teams: {} }, entries: names, last: null, finished: false
    };
    p.season = { races: 0, rounds: 0, wins: 0, podiums: 0, poles: 0, points: 0, top10: 0, champion: false };
    p.devFocus = null; p.interviewDone = false; p.carBonus = 0; p.forcedUp = false; p.fired = false; p.noSeat = false;
    const paid = S.economy.payEntry(s);
    S.economy.genSponsorOffers(s);
    s.phase = 'season'; s.offers = []; s.summary = null;
    S.news.add(`Temporada ${s.year} de ${C[p.catId].short} começa. Equipe: ${c.teamName}.`);
    Car.save();
    return paid;
  };

  Car.playRound = function (choices) {
    choices = choices || {};
    const s = Game.state, p = s.player, se = s.season, cat = C[se.catId], cal = se.cal[se.round];
    const injured = p.injury > 0;
    const rest = !!choices.rest || p.noSeat || (injured && !choices.raceInjured);
    const entries = S.world.entries(s, se.catId, !rest, { injured: injured && !rest });
    const week = S.race.simulateWeekend(s, entries, cat, cal, choices, { racingInjured: injured && !rest });
    S.race.applyResults(se, week);
    week.rest = rest;
    if (!rest) {
      p.season.rounds++;
      week.results.forEach(r => {
        const o = r.order.find(x => x.id === 'player'); if (!o) return;
        const add = t => {
          t.races++; t.points += o.pts;
          if (o.dnf) { if (t.dnfs != null) t.dnfs++; }
          else { if (o.pos === 1) t.wins++; if (o.pos <= 3) t.podiums++; }
          if (o.pole) t.poles++; if (o.fl) t.fl++;
        };
        add(p.stats);
        if (cat.id === 'f1') {
          add(p.f1);
          if (o.pos === 1 && !o.dnf && !p.f1.firstWinAge) p.f1.firstWinAge = s.year - p.birth;
        }
        p.season.races++; p.season.points += o.pts;
        if (!o.dnf) {
          if (o.pos === 1) p.season.wins++;
          if (o.pos <= 3) p.season.podiums++;
          if (o.pos <= 10) p.season.top10++;
        }
        if (o.pole) p.season.poles++;
      });
      if (cat.id === 'f1' && !s.flags.wasF1) {
        s.flags.wasF1 = true;
        S.news.both(`Estreia na F1 em ${cal.circuit.name}!`, 'good');
        if (s.year - p.birth <= 18) s.flags.prodigy = true;
      }
      if (injured) { p.injury = 0; p.phys = cl(p.phys - 8, 0, 100); }
      S.pressure.afterRace(s, week);
    } else {
      if (p.injury > 0) p.injury--;
      S.pressure.regen(s);
    }
    se.last = { round: se.round, circuit: cal.circuit, week, rest };
    se.round++;
    if (se.round >= se.cal.length) se.finished = true;
    S.records.check(s);
    Car.save();
    return week;
  };

  /* Verifica se a próxima etapa em categorias de base (Kart, F4, FREC, F3) é decisiva na disputa de título/pódio. */
  Car.isTitleDecisiveRound = function (s) {
    const se = s.season, cat = C[se.catId];
    if (!se || se.finished || cat.level >= 7) return true;
    const rem = se.cal.length - se.round;
    if (rem > 2) return false;
    const ranked = S.race.ranked(se);
    const me = ranked.find(x => x.id === 'player');
    const lead = ranked[0];
    if (!me || !lead) return false;

    const maxPtsPerRace = Math.max(...cat.races.map(r => (r.pts && r.pts[0]) || 25));
    const maxPtsRound = maxPtsPerRace * cat.races.length;
    const gap = Math.max(0, lead.pts - me.pts);

    // Pára na reta final se o piloto estiver no Top 3 ou matematicamente vivo na briga pelo título
    if (rem === 2 && me.pos <= 2 && gap <= maxPtsRound) return true;
    if (rem === 1 && (me.pos <= 3 || gap <= maxPtsRound * 1.15)) return true;
    return false;
  };

  /* Simula automaticamente as etapas intermediárias nas categorias de base (Kart a F3), parando em decisões de título. */
  Car.fastForwardJuniorRounds = function (s) {
    const se = s.season, p = s.player, cat = C[se.catId];
    if (!se || se.finished || cat.level >= 7 || p.noSeat) return null;

    const fromRound = se.round + 1;
    const startPts = p.season.points, startWins = p.season.wins, startPod = p.season.podiums;
    let count = 0;

    while (!se.finished) {
      if (Car.isTitleDecisiveRound(s)) break;
      const cal = se.cal[se.round];
      const circ = cal.circuit;
      Car.playRound({ tyre: 1, setup: circ.prof, risk: 1, raceInjured: false });
      count++;
      // aplica desenvolvimento no meio do ano se passar pela metade da temporada
      if (se.round === Math.floor(se.cal.length / 2) && p.devFocus && !p.noSeat) {
        const t = S.world.team(s, se.catId, p.teamId);
        const b = cl((p.engineerRel / 100 * 1.2 + .5) * S.pressure.mult(s, 'dev'), 0, 3);
        if (t) { t.car += b; S.news.add(`Desenvolvimento (${p.devFocus}): o carro da ${t.name} ganhou ${b.toFixed(1)} pontos.`, 'good'); }
      }
    }

    if (!count) return null;
    const ranked = S.race.ranked(se);
    const me = ranked.find(x => x.id === 'player');
    const lead = ranked[0];
    const gap = me && lead ? Math.max(0, lead.pts - me.pts) : 0;
    const toRound = se.round;

    const summary = {
      fromRound,
      toRound,
      count,
      pts: p.season.points - startPts,
      wins: p.season.wins - startWins,
      podiums: p.season.podiums - startPod,
      pos: me ? me.pos : '-',
      gap,
      decisive: !se.finished
    };
    const msg = summary.decisive
      ? `${cat.short}: Etapas ${fromRound} a ${toRound} simuladas (+${summary.pts} pts). Você chega em ${summary.pos}º para a decisão do título!`
      : `${cat.short}: Etapas ${fromRound} a ${toRound} simuladas (+${summary.pts} pts, ${summary.wins}V, ${summary.podiums}P).`;
    S.news.add(msg, summary.decisive ? 'good' : '');
    return summary;
  };

  // depois da etapa: desenvolvimento, simulação rápida da base e eventos
  Car.afterRound = function () {
    const s = Game.state, p = s.player, se = s.season, out = { events: [], fired: false, simSummary: null };
    p.interviewDone = false;
    if (se.round === Math.floor(se.cal.length / 2) && p.devFocus && !p.noSeat) {
      const t = S.world.team(s, se.catId, p.teamId);
      const b = cl((p.engineerRel / 100 * 1.2 + .5) * S.pressure.mult(s, 'dev'), 0, 3);
      if (t) { t.car += b; S.news.add(`Desenvolvimento (${p.devFocus}): o carro da ${t.name} ganhou ${b.toFixed(1)} pontos.`, 'good'); }
    }

    // Nas categorias até F3 (level <= 6), após a 1ª corrida simula etapas intermediárias até decisões de título
    if (C[se.catId].level <= 6 && se.round === 1 && !se.finished && !p.noSeat) {
      out.simSummary = Car.fastForwardJuniorRounds(s);
    }

    if (!p.noSeat) out.events = S.pressure.rollEvents(s);
    Car.save();
    return out;
  };

  Car.fire = function () {
    const s = Game.state, p = s.player, se = s.season;
    S.news.both(`${p.name} encerrou sua participação na temporada.`, 'bad');
    p.contract = null; p.fired = true; p.noSeat = true; p.firedCount++;
    while (!se.finished) Car.playRound({ rest: true });
  };

  Car.endSeason = function () {
    const s = Game.state, p = s.player, se = s.season, cat = C[se.catId], year = s.year;
    const ranked = S.race.ranked(se, true);
    const me = ranked.find(r => r.id === 'player');
    const pos = me ? me.pos : ranked.length, played = p.season.rounds > 0;
    const champ = !!me && pos === 1 && played;

    ranked.forEach(r => {
      const d = S.world.driver(s, r.id);
      if (d) {
        d.lastPos = r.pos;
        if (cat.id === 'f1' && r.pos === 1) {
          d.titles = (d.titles || 0) + 1;
          if (D.f1Records && d.titles > D.f1Records.titles.value) {
            D.f1Records.titles.value = d.titles;
            D.f1Records.titles.holder = d.name;
          }
        }
      }
    });

    p.season.champion = champ;
    p.stats.seasons++;
    if (champ) {
      p.stats.titles++;
      p.titlesList.push(cat.id);
      if (cat.id === 'f1') {
        p.f1.titles++;
        if (!p.f1.firstTitleAge) p.f1.firstTitleAge = year - p.birth;
        if (D.f1Records && p.f1.titles > D.f1Records.titles.value) {
          D.f1Records.titles.value = p.f1.titles;
          D.f1Records.titles.holder = p.name;
        }
      }
    }

    if (cat.single && p.season.rounds >= se.cal.length * .8) p.singleSeaterSeasons++;
    const slPts = played ? S.superlicense.pointsFor(cat.id, pos) : 0;
    p.superPoints.push({ year, catId: cat.id, pts: slPts });
    const acct = S.economy.seasonEnd(s);
    S.news.both(`${year} ${cat.short}: ${played ? pos + 'º lugar, ' + (me ? me.pts : 0) + ' pts' : 'temporada perdida'}${champ ? ' · CAMPEÃO!' : ''}.`, champ ? 'good' : '');
    p.lastSeason = { pos, champ, pts: me ? me.pts : 0, catId: cat.id, year };

    if (p.contract) { p.contract.years--; if (p.contract.years <= 0) p.contract = null; }
    const nextYear = year + 1, ageNext = nextYear - p.birth;
    p.forcedUp = cat.level < 8 && (champ || ageNext > cat.maxAge);
    if (p.forcedUp) p.contract = null;

    const ef = S.economy.effects(s);
    p.train = Math.min(cfg.trainCap + 2, p.train + ef.train * S.pressure.mult(s, 'train') + (pos <= 3 ? .3 : .1));
    p.popularity = cl(p.popularity + ef.pop, 0, 100);
    p.phys = cl(p.phys + 15, 0, 100); p.mental = cl(p.mental + 15, 0, 100); p.injury = 0;
    if (p.devFocus) p.engineerRel = cl(p.engineerRel + 3, 0, 100);

    s.year = nextYear;
    const st = S.superlicense.status(p, s.year);
    if (st.eligible && !s.flags.hadLicense) { s.flags.hadLicense = true; S.news.both('Você obteve a superlicença da FIA!', 'good'); }
    if (ageNext === 17 && st.total >= cfg.superlicense.points && S.contracts.ger(s) >= 88 && R.chance(.3)) {
      p.flags.f1Waiver = true;
      S.news.both('A FIA analisa uma exceção de idade para você correr na F1 aos 17 anos.', 'good');
    }
    const debt = S.economy.checkDebt(s);
    if (debt === 'bankrupt' || debt === 'ruin') S.news.both('FALÊNCIA: seus bens foram vendidos e a família cortou o apoio.', 'bad');

    S.world.rollover(s);
    p.noSeat = false;
    s.summary = { year, catName: cat.name, pos, champ, pts: me ? me.pts : 0, slPts, acct, debt, played };
    s.phase = 'offseason';

    const end = Car.checkEnd();
    if (end) Car.endCareer(end);
    else {
      S.economy.genSponsorOffers(s);
      S.contracts.generateOffers(s);
      if (!p.contract && !s.offers.length) {
        Car.endCareer({ reason: 'semvaga', title: 'Sem vaga na F1', text: 'Nenhuma equipe de F1 quis contratar você para a próxima temporada. A porta da F1 se fechou.' });
      }
    }
    S.records.check(s);
    Car.save();
    return s.summary;
  };

  Car.checkEnd = function () {
    const s = Game.state, p = s.player, age = s.year - p.birth, st = S.superlicense.status(p, s.year);
    if (p.bankruptcies >= 2) return { reason: 'falencia', title: 'Falência definitiva', text: 'Duas falências encerraram a sua carreira nas pistas.' };
    if (age >= cfg.retireForcedAge) return { reason: 'aposentadoria', title: 'Aposentadoria', text: `Aos ${age} anos você encerra a carreira.` };
    if (!s.flags.wasF1 && p.catId !== 'f1' && ((age >= cfg.frustratedAge && !st.eligible) || age >= cfg.neverF1QuitAge)) {
      return { reason: 'frustrada', title: 'Carreira frustrada', text: `Aos ${age} anos, a F1 não vai acontecer. Você encerra a carreira sem realizar o sonho.` };
    }
    return null;
  };

  Car.canRetire = () => { const s = Game.state; return s.phase !== 'ended' && s.year - s.player.birth >= cfg.retireOptionalAge; };
  Car.retire = () => Car.endCareer({ reason: 'aposentadoria', title: 'Aposentadoria', text: `${Game.state.player.name} decide se aposentar.` });
  Car.endCareer = function (e) {
    const s = Game.state; s.ending = e; s.phase = 'ended';
    S.news.log(`FIM DE CARREIRA: ${e.title}.`);
    S.records.check(s);
    Car.save();
  };
})();
