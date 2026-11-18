/* Orquestrador da carreira: novo jogo, início/fim de temporada, etapas, evolução dinâmica, H2H, reserva F1 e finais. */
(function () {
  const D = Game.data, R = Game.rng, U = Game.utils, C = D.categories, cfg = Game.config, cl = U.clamp;
  const S = Game.systems, Car = S.career = {};

  Car.save = () => { if (Game.state) Game.core.storage.save(Game.state); };
  const FOCUS_MAP = {
    'Aerodinâmica': 'aero',
    'Motor': 'power',
    'Confiabilidade': 'rel',
    'Chassi e pneus': 'chassis',
    'Ritmo de classificação': 'quali'
  };

  Car.applyDevFocusUpgrade = function (s) {
    const p = s.player, se = s.season;
    if (!p.devFocus || p.noSeat) return;
    const t = S.world.team(s, se.catId, p.teamId);
    if (!t) return;
    S.world.ensureCarParts(t);
    const partKey = FOCUS_MAP[p.devFocus] || 'aero';
    const b = cl((p.engineerRel / 100 * 2.2 + 1.2) * S.pressure.mult(s, 'dev'), 0.8, 5.5);
    const actual = S.world.upgradeCarPart(t, partKey, b);
    if (S.owner && S.owner.hasTeam(p) && p.ownedTeam.id === t.id) {
      p.ownedTeam.parts = Object.assign({}, t.parts);
      p.ownedTeam.car = t.car;
    }
    S.news.add(`Pacote de atualização (${p.devFocus}): +${actual.toFixed(1)} pts em ${p.devFocus} na ${t.name} (Carro OVR ${t.car.toFixed(1)}).`, 'good');
  };


  Car.newGame = function (setup) {
    const s = {
      v: 1, year: cfg.startYear, phase: 'offseason', player: null, world: null, season: null,
      offers: [], academyOffers: [], sponsorOffers: [], news: [], timeline: [], flags: {}, ending: null, summary: null
    };
    Game.state = s;
    const o = D.origins.find(x => x.id === setup.origin), L = cfg.luckRange;
    const lk = () => L[0] + (L[1] - L[0]) * R.float();
    s.player = {
      name: setup.name, country: setup.country, birth: s.year - cfg.startAge, origin: o.id, traits: setup.traits, picks: setup.picks, pickSrc: setup.pickSrc,
      luck: { EXP: lk(), RAC: lk(), ATE: lk(), RIT: lk() },
      capBonus: { RIT: 0, RAC: 0, ATE: 0, EXP: 0 },
      train: 0, catId: 'kartReg', teamId: null, contract: null,
      money: o.money, supportLeft: 0, debtYears: 0, bankrupt: false, bankruptcies: 0,
      phys: 85, mental: 80, popularity: 10, reputation: 45,
      pressure: { family: o.family }, injury: 0, assets: [], invest: [], sponsors: [], agent: false,
      engineerRel: 50, residence: 'BRA', devFocus: null, interviewDone: false, carBonus: 0,
      h2h: { qualiW: 0, qualiL: 0, raceW: 0, raceL: 0, mateId: null, mateName: '' },
      teamRole: 'Igualdade',
      stats: { races: 0, wins: 0, podiums: 0, poles: 0, fl: 0, points: 0, titles: 0, dnfs: 0, seasons: 0 },
      f1: { races: 0, wins: 0, podiums: 0, poles: 0, fl: 0, points: 0, titles: 0 }, titlesList: [], f1TeamsChamp: [], wonCircuits: [], history: [], superPoints: [], singleSeaterSeasons: 0, rival: null, ownedTeam: null,
      lastSeason: null, season: null, ach: {}, flags: {}, academy: null, fired: false, forcedUp: false, noSeat: false, firedCount: 0
    };
    S.world.init(s);
    S.news.both(`Início da carreira: ${setup.name} começa no kart aos ${cfg.startAge} anos.`);
    S.economy.genSponsorOffers(s);
    S.contracts.generateOffers(s);
    Car.save();
    return s;
  };

  Car.isReserve = p => !!(p && p.contract && p.contract.role === 'reserve');

  Car.startSeason = function () {
    const s = Game.state, p = s.player, c = p.contract;
    const bossOnly = S.owner && S.owner.isBossOnly(p);
    if (!c && !bossOnly) return null;

    if (S.owner) S.owner.syncCustomTeam(s);
    if (bossOnly) {
      p.catId = 'f1';
      p.teamId = p.ownedTeam.id;
    } else {
      p.catId = c.catId;
      p.teamId = c.teamId;
    }
    S.world.updateCars(s);

    const reserve = !bossOnly && Car.isReserve(p);
    const playerRacing = !bossOnly && !reserve;
    if (playerRacing) {
      S.world.seatPlayer(s);
    } else {
      S.world.fillSeats(s, p.catId);
    }

    const entries = S.world.entries(s, p.catId, playerRacing), names = {};
    entries.forEach(e => {
      const t = S.world.team(s, p.catId, e.teamId);
      names[e.id] = { name: e.name, country: e.country, teamId: e.teamId, teamName: t ? t.name : '-' };
    });
    if (reserve) {
      const t = S.world.team(s, p.catId, p.teamId);
      names.player = { name: p.name, country: p.country, teamId: p.teamId, teamName: t ? t.name : '-' };
    }

    const mate = entries.find(e => !e.isPlayer && e.teamId === p.teamId);
    p.h2h = { qualiW: 0, qualiL: 0, raceW: 0, raceL: 0, mateId: mate ? mate.id : null, mateName: mate ? mate.name : '' };
    if (bossOnly) {
      p.teamRole = 'Chefe de Equipe';
    } else if (reserve) {
      p.teamRole = 'Piloto Reserva';
    } else if (mate) {
      const myGer = S.contracts.ger(s);
      p.teamRole = myGer >= mate.attrs.GER + 3 ? '1º Piloto' : myGer <= mate.attrs.GER - 3 ? '2º Piloto' : 'Igualdade';
    } else {
      p.teamRole = 'Igualdade';
    }

    s.season = {
      year: s.year, catId: p.catId, cal: S.calendar.build(p.catId, s.year), round: 0,
      standings: { drivers: {}, teams: {} }, entries: names, last: null, finished: false,
      reserveCallUp: false,
      regConceptPending: p.catId === 'f1' && S.world.isRegYear(s.year)
    };
    p.season = { races: 0, rounds: 0, wins: 0, podiums: 0, poles: 0, points: 0, top10: 0, champion: false };
    p.devFocus = null; p.interviewDone = false; p.carBonus = 0; p.forcedUp = false; p.fired = false; p.noSeat = false;

    const paid = S.economy.payEntry(s);
    S.economy.genSponsorOffers(s);
    s.phase = 'season'; s.offers = []; s.summary = null;
    const teamLabel = bossOnly ? p.ownedTeam.name : c.teamName;
    S.news.add(`Temporada ${s.year} de ${C[p.catId].short} começa. Equipe: ${teamLabel}${bossOnly ? ' (Chefe de Equipe)' : reserve ? ' (Piloto Reserva)' : ''}.`);
    Car.save();
    return paid;
  };

  /* Prepara a simulação de uma etapa (permite decisão tática no meio da corrida em F2/F1 antes de finalizar). */
  Car.prepareRound = function (choices) {
    choices = choices || {};
    const s = Game.state, p = s.player, se = s.season, cat = C[se.catId], cal = se.cal[se.round];
    const injured = p.injury > 0;
    const reserve = Car.isReserve(p);
    const reserveRacing = reserve && !!se.reserveCallUp;
    const bossOnly = S.owner && S.owner.isBossOnly(p);
    const rest = !!choices.rest || bossOnly || p.noSeat || (reserve && !reserveRacing) || (injured && !choices.raceInjured);

    let entries = S.world.entries(s, se.catId, !rest, { injured: injured && !rest });
    // Se for piloto reserva chamado para substituir titular lesionado, substitui temporariamente o companheiro de menor GER
    if (reserveRacing && !rest) {
      const teamTitulars = entries.filter(e => !e.isPlayer && e.teamId === p.teamId).sort((a, b) => a.attrs.GER - b.attrs.GER);
      if (teamTitulars.length >= 2) {
        const replaced = teamTitulars[0];
        entries = entries.filter(e => e.id !== replaced.id);
      }
    }

    const week = S.race.simulateWeekend(s, entries, cat, cal, choices, {
      racingInjured: injured && !rest,
      allowMidRace: !rest && !!choices.interactive && cat.level >= 7,
      splitSprint: !rest && !!choices.interactive && cat.id === 'f1' && !!cal.sprint
    });
    week.rest = rest;
    week.reserveRacing = reserveRacing;
    return week;
  };


  Car.continueSplitGP = function (week, newChoices) {
    const s = Game.state, p = s.player;
    const injured = p.injury > 0;
    return S.race.appendMainGP(s, week, newChoices, {
      racingInjured: injured && !week.rest,
      allowMidRace: !week.rest && C[s.season.catId].level >= 7
    });
  };

  /* Consolida pontos, estatísticas, H2H e evolução dinâmica após o resultado final da etapa. */
  Car.commitRound = function (week) {
    const s = Game.state, p = s.player, se = s.season, cat = C[se.catId], cal = se.cal[se.round];
    const injured = p.injury > 0;
    const rest = week.rest;

    // Limpa referências internas antes de salvar no estado
    (week.results || []).forEach(r => { delete r._raw; delete r._spec; delete r._ctx; });
    delete week._entries;

    S.race.applyResults(se, week);

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
          if (o.pos === 1) { p.season.wins++; if (cat.id === 'f1') { if (!p.wonCircuits) p.wonCircuits = []; if (!p.wonCircuits.includes(cal.circuit.id)) p.wonCircuits.push(cal.circuit.id); } }
          if (o.pos <= 3) p.season.podiums++;
          if (o.pos <= 10) p.season.top10++;
        }
        if (o.pole) p.season.poles++;

        // Evolução dinâmica de teto conquistada na pista
        if (o.pole) S.attributes.growCap(p, 'RIT', 0.25);
        if (!o.dnf && (o.grid - o.pos) >= 3) S.attributes.growCap(p, 'RAC', 0.25);
        if (!o.dnf && r.wet && o.pos <= 3) S.attributes.growCap(p, 'ATE', 0.35);
      });

      // Atualiza confronto direto (H2H) com o companheiro de equipe
      if (p.h2h) {
        const qMe = week.quali.indexOf('player');
        const qMate = week.quali.findIndex(id => id !== 'player' && se.entries[id] && se.entries[id].teamId === p.teamId);
        if (qMe >= 0 && qMate >= 0) {
          if (qMe < qMate) p.h2h.qualiW++; else p.h2h.qualiL++;
        }
        const mainRes = week.results[week.results.length - 1];
        if (mainRes) {
          const rMe = mainRes.order.find(o => o.id === 'player');
          const rMate = mainRes.order.find(o => o.id !== 'player' && o.teamId === p.teamId);
          if (rMe && rMate && (!rMe.dnf || !rMate.dnf)) {
            if (!rMe.dnf && (rMate.dnf || rMe.pos < rMate.pos)) p.h2h.raceW++;
            else p.h2h.raceL++;
          }
        }
        const tot = p.h2h.raceW + p.h2h.raceL;
        if (tot >= 4 && !Car.isReserve(p)) {
          if (p.h2h.raceW >= p.h2h.raceL + 3) p.teamRole = '1º Piloto';
          else if (p.h2h.raceL >= p.h2h.raceW + 3) p.teamRole = '2º Piloto';
        }
      }

      if (cat.id === 'f1' && !s.flags.wasF1) {
        s.flags.wasF1 = true;
        if (p.academy && p.academy.name) {
          S.news.both(`Formado na ${p.academy.name}! Com a estreia na F1, você concluiu o programa de formação.`, 'good');
          p.academy = null;
        }
        s.academyOffers = [];
        S.news.both(`Estreia na F1 em ${cal.circuit.name}!`, 'good');
        if (s.year - p.birth <= 18) s.flags.prodigy = true;
      }
      if (injured) {
        const crashedWhileInj = week.results.some(r => r.player && r.player.dnf && r.player.crash);
        if (crashedWhileInj) {
          S.attributes.growCap(p, 'RIT', -1.5);
          S.attributes.growCap(p, 'ATE', -1.0);
          p.injury = 2;
          p.phys = cl(p.phys - 18, 0, 100);
          S.news.both(`AGRAVAMENTO DE LESÃO: Você bateu correndo lesionado em ${cal.circuit.name}! Sequela permanente no ritmo (-RIT/-ATE) e +2 etapas fora.`, 'bad');
        } else {
          p.injury = 0;
          p.phys = cl(p.phys - 8, 0, 100);
        }
      }
      S.pressure.afterRace(s, week);
      if (S.owner) S.owner.updateRival(s, week);
    } else {
      if (p.injury > 0) p.injury--;
      if (Car.isReserve(p)) {
        p.train = Math.min(cfg.trainCap + 2, p.train + 0.08);
      }
      S.pressure.regen(s);
    }

    se.last = { round: se.round, circuit: cal.circuit, week, rest };
    se.round++;
    se.reserveCallUp = false;
    if (se.round >= se.cal.length) se.finished = true;

    // Se for piloto reserva na F1, sorteia se será convocado para substituir um titular na próxima etapa
    if (!se.finished && Car.isReserve(p) && R.chance(0.22)) {
      se.reserveCallUp = true;
      const nextCirc = se.cal[se.round].circuit;
      S.news.add(`CONVOCAÇÃO F1: Um titular da ${p.contract.teamName} sentiu mal-estar e você correrá em ${nextCirc.name}!`, 'good');
    }

    S.records.check(s);
    Car.save();
    return week;
  };

  /* Mantém compatibilidade direta com chamadas síncronas e testes automáticos. */
  Car.playRound = function (choices) {
    const week = Car.prepareRound(choices);
    return Car.commitRound(week);
  };

  /* Verifica se a próxima etapa em categorias de base (Kart, F4, FREC, F3) é um momento-chave. */
  Car.isKeyJuniorRound = function (s) {
    const se = s.season, cat = C[se.catId];
    if (!se || se.finished) return true;
    // Parada obrigatória no meio da temporada para escolher foco de desenvolvimento do carro
    if (se.round === Math.floor(se.cal.length / 2)) return true;

    const rem = se.cal.length - se.round;
    if (rem > 2) return false;
    const ranked = S.race.ranked(se);
    const me = ranked.find(x => x.id === 'player');
    const lead = ranked[0];
    if (!me || !lead) return false;

    const maxPtsPerRace = Math.max(...cat.races.map(r => (r.pts && r.pts[0]) || 25));
    const maxPtsRound = maxPtsPerRace * cat.races.length;
    const gap = Math.max(0, lead.pts - me.pts);

    if (rem === 2 && me.pos <= 3 && gap <= maxPtsRound * 1.2) return true;
    if (rem === 1 && (me.pos <= 5 || gap <= maxPtsRound * 1.3)) return true;
    return false;
  };

  /* Simula etapas até o próximo momento-chave (Meio de temporada / Reta final) na base, ou até convocação como Reserva F1. */
  Car.fastForwardToMilestone = function (s, mode) {
    const se = s.season, p = s.player, cat = C[se.catId];
    if (!se || se.finished || p.noSeat) return null;
    mode = mode || 'balanced';

    const isRes = Car.isReserve(p);
    if (se.round >= se.cal.length - 1 && !isRes) return null;

    const fromRound = se.round + 1;
    const startPts = p.season.points, startWins = p.season.wins, startPod = p.season.podiums;
    let count = 0;

    while (!se.finished) {
      if (count > 0) {
        if (isRes && se.reserveCallUp) break;
        if (!isRes && Car.isKeyJuniorRound(s)) break;
      }
      const cal = se.cal[se.round];
      const circ = cal.circuit;
      const ffTyre = mode === 'safe' ? 0 : mode === 'push' ? 2 : 1;
      const ffRisk = mode === 'safe' ? 0 : mode === 'push' ? 2 : 1;
      Car.playRound({ tyre: ffTyre, setup: circ.prof, risk: ffRisk, raceInjured: false });
      count++;
      if (se.round === Math.floor(se.cal.length / 2)) {
        Car.applyDevFocusUpgrade(s);
        S.world.midSeasonSackings(s);
        if (S.contracts && S.contracts.checkMidSeasonRenewal) S.contracts.checkMidSeasonRenewal(s);
      }
    }

    if (!count) return null;
    const ranked = S.race.ranked(se);
    const me = ranked.find(x => x.id === 'player');
    const lead = ranked[0];
    const gap = me && lead ? Math.max(0, lead.pts - me.pts) : 0;
    const toRound = se.round;
    const isMid = !se.finished && se.round === Math.floor(se.cal.length / 2);

    const summary = {
      fromRound,
      toRound,
      count,
      pts: p.season.points - startPts,
      wins: p.season.wins - startWins,
      podiums: p.season.podiums - startPod,
      pos: me ? me.pos : '-',
      gap,
      isMid,
      callUp: isRes && !!se.reserveCallUp,
      decisive: !se.finished && !isMid && !isRes
    };
    const msg = summary.callUp
      ? `F1 Reserva: Etapas ${fromRound} a ${toRound} simuladas no simulador. Você foi convocado para correr a próxima etapa!`
      : summary.isMid
        ? `${cat.short}: Meio de temporada (etapas ${fromRound} a ${toRound}, +${summary.pts} pts). Você está em ${summary.pos}º.`
        : summary.decisive
          ? `${cat.short}: Etapas ${fromRound} a ${toRound} simuladas (+${summary.pts} pts). Você chega em ${summary.pos}º para a decisão!`
          : `${cat.short}: Etapas ${fromRound} a ${toRound} simuladas (+${summary.pts} pts, ${summary.wins}V, ${summary.podiums}P).`;
    S.news.add(msg, (summary.decisive || summary.callUp) ? 'good' : '');
    return summary;
  };

  Car.afterRound = function () {
    const s = Game.state, p = s.player, se = s.season, out = { events: [], fired: false };
    p.interviewDone = false;
    if (se.round === Math.floor(se.cal.length / 2)) {
      Car.applyDevFocusUpgrade(s);
      S.world.midSeasonSackings(s);
      if (S.contracts && S.contracts.checkMidSeasonRenewal) S.contracts.checkMidSeasonRenewal(s);
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
    const reserve = Car.isReserve(p);
    const champ = !!me && pos === 1 && played && !reserve;

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
      S.attributes.growCap(p, 'RIT', 0.8);
      S.attributes.growCap(p, 'RAC', 0.8);
      S.attributes.growCap(p, 'ATE', 0.5);
      if (cat.id === 'f1') {
        p.f1.titles++;
        if (!p.f1TeamsChamp) p.f1TeamsChamp = [];
        if (p.teamId && !p.f1TeamsChamp.includes(p.teamId)) p.f1TeamsChamp.push(p.teamId);
        if (!p.f1.firstTitleAge) p.f1.firstTitleAge = year - p.birth;
        if (D.f1Records && p.f1.titles > D.f1Records.titles.value) {
          D.f1Records.titles.value = p.f1.titles;
          D.f1Records.titles.holder = p.name;
        }
      }
    }

    if (cat.single && p.season.rounds >= se.cal.length * .8 && !reserve) p.singleSeaterSeasons++;
    const slPts = (played && !reserve) ? S.superlicense.pointsFor(cat.id, pos) : 0;
    p.superPoints.push({ year, catId: cat.id, pts: slPts });
    if (cat.id === 'f1' && p.h2h && p.h2h.raceW >= 10 && p.h2h.raceL === 0) {
      s.flags.unbeatenMate = true;
    }
    if (p.rival && me) {
      const rivRank = ranked.find(r => r.id === p.rival.id);
      if (rivRank && me.pos < rivRank.pos && p.rival.tension >= 45) {
        p.reputation = cl((p.reputation || 45) + 6, 0, 100);
        p.popularity = cl((p.popularity || 10) + 5, 0, 100);
        S.news.both(`RIVALIDADE VENCIDA: Você superou ${p.rival.name} no campeonato! (+6 Reputação)`, 'good');
      }
      p.rival = null;
    }
    const acct = S.economy.seasonEnd(s);
    const ownerAcct = S.owner ? S.owner.seasonEndPayout(s) : null;
    if (ownerAcct) {
      acct.lines.push({ label: `Escuderia ${ownerAcct.teamName} (${ownerAcct.cPos}º Constr.)`, amount: ownerAcct.net });
      acct.net += ownerAcct.net;
    }

    const statusLine = reserve
      ? `${year} F1 (Reserva): ${played ? played + ' GP(s) disputado(s), ' + (me ? me.pts : 0) + ' pts' : 'trabalho no simulador'}.`
      : `${year} ${cat.short}: ${played ? pos + 'º lugar, ' + (me ? me.pts : 0) + ' pts' : 'temporada perdida'}${champ ? ' · CAMPEÃO!' : ''}.`;
    S.news.both(statusLine, champ ? 'good' : '');
    p.lastSeason = { pos, champ, pts: me ? me.pts : 0, catId: cat.id, year, reserve };
    if (!p.history) p.history = [];
    p.history.push({
      year,
      ger: S.contracts.ger(s),
      pos: played ? pos : null,
      catShort: cat.short,
      pts: me ? me.pts : 0
    });

    if (p.nextContract) {
      p.contract = Object.assign({}, p.nextContract);
      p.nextContract = null;
      s.midSeasonOffers = [];
    } else if (p.contract) {
      if (S.owner && S.owner.hasTeam(p) && p.contract.teamId === p.ownedTeam.id) {
        p.contract.years = 5;
      } else {
        p.contract.years--;
        if (p.contract.years <= 0) p.contract = null;
      }
    }
    s.midSeasonOffers = [];
    const acad = S.contracts.ensureAcademy(p);
    if (acad) {
      // Penalidade se não cumpriu compromissos de mídia/propaganda da academia
      const missedAds = Math.max(0, (acad.mediaObligations || 1) - (acad.mediaDone || 0));
      if (missedAds > 0) {
        S.contracts.adjustAcademySat(s, -missedAds * 8, 'não cumprimento das campanhas publicitárias');
      }
      // Avaliação anual de desempenho na pista pela Academia
      if (S.contracts.ensureAcademy(p)) {
        if (!reserve && played && pos > Math.ceil(se.cal.length > 0 ? Object.keys(se.entries).length * 0.45 : 10)) {
          S.contracts.adjustAcademySat(s, -18, 'temporada muito abaixo das expectativas da academia');
        } else if (champ || pos <= 3) {
          S.contracts.adjustAcademySat(s, 10);
        }
      }
      const stillAcad = S.contracts.ensureAcademy(p);
      if (stillAcad) {
        stillAcad.years--;
        stillAcad.f1TestsLeft = stillAcad.f1TestsPerYear || 1;
        stillAcad.mediaDone = 0;
        if (stillAcad.years <= 0) {
          S.news.both(`Seu contrato de ${stillAcad.yearsTotal} anos com a ${stillAcad.name} chegou ao fim.`);
          p.academy = null;
        }
      }
    }
    const nextYear = year + 1, ageNext = nextYear - p.birth;
    p.forcedUp = !reserve && cat.level < 8 && (champ || ageNext > cat.maxAge);
    if (p.forcedUp) p.contract = null;

    const ef = S.economy.effects(s);
    const reserveTrainBonus = reserve ? 1.1 : 0;
    p.train = Math.min(cfg.trainCap + 2, p.train + ef.train * S.pressure.mult(s, 'train') + reserveTrainBonus + (pos <= 3 && !reserve ? .35 : .1));
    p.popularity = cl(p.popularity + ef.pop, 0, 100);
    if (reserve) p.reputation = cl((p.reputation || 45) + 4, 0, 100);
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
    s.summary = { year, catName: reserve ? 'Fórmula 1 (Piloto Reserva)' : cat.name, pos, champ, pts: me ? me.pts : 0, slPts, acct, debt, played, reserve };
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
    const maxAge = (S.owner && S.owner.hasTeam(p)) ? 70 : cfg.retireForcedAge;
    if (age >= maxAge) return { reason: 'aposentadoria', title: 'Aposentadoria', text: `Aos ${age} anos você encerra a carreira.` };
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
