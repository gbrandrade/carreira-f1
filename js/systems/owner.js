/* Modo Dono de Equipe (Escuderia Própria de F1), Rivalidade Direta e Ciclos de Regulamento. */
(function () {
  const D = Game.data, R = Game.rng, U = Game.utils, C = D.categories, S = Game.systems, W = S.world, cl = U.clamp;
  const Own = Game.systems.owner = {};

  Own.FOUND_COST = 500000000; // US$ 500 mi

  Own.ENGINES = [
    { id: 'mer', name: 'Mercedes-AMG HPP',     cost: 20000000, bonus: { power: 3, rel: 4, quali: 2 }, desc: 'Referência em confiabilidade e potência híbrida' },
    { id: 'fer', name: 'Ferrari Power Units',  cost: 18000000, bonus: { power: 4, rel: 1, quali: 3 }, desc: 'Motor explosivo em classificação e retas' },
    { id: 'rbpt', name: 'Honda / RBPT',        cost: 19000000, bonus: { power: 5, rel: 0, aero: 2 },  desc: 'Empacotamento compacto que favorece a aerodinâmica' },
    { id: 'aud', name: 'Audi F1 Powertrain',   cost: 14000000, bonus: { power: 2, rel: 3, chassis: 1 }, desc: 'Projeto oficial equilibrado e custo menor' },
    { id: 'ren', name: 'Alpine / Renault E-Tech', cost: 12000000, bonus: { power: 1, rel: 2, chassis: 1 }, desc: 'Opção econômica para investir mais no chassi' }
  ];

  Own.PARTS_META = [
    { key: 'aero',    name: 'Aerodinâmica',           short: 'AERO', desc: 'Downforce em curvas rápidas e eficiência' },
    { key: 'power',   name: 'Motor & Unidade de Potência', short: 'MOT',  desc: 'Velocidade final e aceleração em retas' },
    { key: 'rel',     name: 'Confiabilidade',         short: 'CONF', desc: 'Reduz falhas mecânicas e abandonos' },
    { key: 'chassis', name: 'Chassi & Pneus',         short: 'CHAS', desc: 'Tração mecânica e conservação de pneus' },
    { key: 'quali',   name: 'Ritmo de Classificação', short: 'CLAS', desc: 'Desempenho em volta lançada no Q3' }
  ];

  Own.COLORS = [
    ['Vermelho Corsa', '#E80020'],
    ['Azul Imperial', '#2563EB'],
    ['Verde Esmeralda', '#10B981'],
    ['Papaia Racing', '#FF8000'],
    ['Ouro & Preto', '#EAB308'],
    ['Roxo Ultravioleta', '#9333EA']
  ];

  Own.hasTeam = p => !!(p && p.ownedTeam && p.ownedTeam.id);
  Own.isBossOnly = p => Own.hasTeam(p) && !!p.ownedTeam.bossOnly;

  Own.getTeamObj = function (s) {
    const p = s.player;
    if (!Own.hasTeam(p) || !s.world || !s.world.teams || !s.world.teams.f1) return null;
    return s.world.teams.f1.find(t => t.id === p.ownedTeam.id) || null;
  };

  /* Garante que a equipe customizada exista em Game.data.teams.f1 e state.world.teams.f1 (inclusive após load). */
  Own.syncCustomTeam = function (s) {
    const p = s.player;
    if (!Own.hasTeam(p)) return null;
    const ot = p.ownedTeam;
    if (!D.teams.f1.some(t => t.id === ot.id)) {
      D.teams.f1.push({ id: ot.id, name: ot.name, car: ot.car || 78, prestige: ot.prestige || 0.60, minYear: 2000, color: ot.color, isCustom: true });
    }
    if (s.world && s.world.teams && s.world.teams.f1) {
      let wt = s.world.teams.f1.find(t => t.id === ot.id);
      if (!wt) {
        wt = { id: ot.id, name: ot.name, car: ot.car || 78, prestige: ot.prestige || 0.60, minYear: 2000, color: ot.color, active: true, isCustom: true, parts: ot.parts ? Object.assign({}, ot.parts) : null };
        s.world.teams.f1.push(wt);
      }
      wt.name = ot.name;
      wt.color = ot.color;
      wt.isCustom = true;
      W.ensureCarParts(wt);
      W.recalcCar(wt);
      ot.parts = Object.assign({}, wt.parts);
      ot.car = wt.car;
      return wt;
    }
    return null;
  };

  /* Funda uma nova escuderia de F1 com o patrimônio do jogador. */
  Own.foundTeam = function (s, opts) {
    const p = s.player;
    if (Own.hasTeam(p)) return { ok: false, msg: 'Você já é dono de uma escuderia de F1.' };
    if (p.money < Own.FOUND_COST) return { ok: false, msg: `São necessários ${U.fmtMoney(Own.FOUND_COST)} para fundar uma equipe de F1.` };
    const name = String(opts.name || '').trim();
    if (!name || name.length < 3) return { ok: false, msg: 'Digite um nome válido para sua escuderia.' };

    const eng = Own.ENGINES.find(e => e.id === opts.engineId) || Own.ENGINES[0];
    const color = opts.color || '#E80020';
    const driveSelf = opts.driveSelf !== false;

    p.money -= Own.FOUND_COST;
    const baseParts = {
      aero:    75 + (eng.bonus.aero || 0),
      power:   75 + (eng.bonus.power || 0),
      rel:     75 + (eng.bonus.rel || 0),
      chassis: 75 + (eng.bonus.chassis || 0),
      quali:   75 + (eng.bonus.quali || 0)
    };

    const teamId = 'own_f1';
    const teamObj = {
      id: teamId,
      name,
      car: 78,
      prestige: 0.62,
      minYear: 2000,
      color,
      active: true,
      isCustom: true,
      parts: baseParts,
      seasonStartParts: Object.assign({}, baseParts)
    };
    W.recalcCar(teamObj);

    if (!D.teams.f1.some(t => t.id === teamId)) D.teams.f1.push(Object.assign({}, teamObj));
    if (s.world && s.world.teams && s.world.teams.f1) {
      s.world.teams.f1 = s.world.teams.f1.filter(t => t.id !== teamId);
      s.world.teams.f1.push(teamObj);
    }

    p.ownedTeam = {
      id: teamId,
      name,
      color,
      engineId: eng.id,
      car: teamObj.car,
      parts: Object.assign({}, teamObj.parts),
      prestige: 0.62,
      factoryLv: 1,
      windTunnelLv: 1,
      titleCount: 0,
      bossOnly: !driveSelf
    };

    // Contrata pilotos iniciais para preencher os 2 assentos da nova equipe
    if (driveSelf) {
      p.catId = 'f1';
      p.teamId = teamId;
      p.contract = {
        teamId,
        catId: 'f1',
        teamName: name,
        years: 5,
        yearsTotal: 5,
        startYear: s.year,
        role: 'main',
        salary: 0,
        bTitle: 0,
        bWin: 0,
        bPodium: 0,
        bPoint: 0,
        exit: true,
        option: true,
        img: 0
      };
      s.offers = [];
      W.fillSeats(s, 'f1');
    } else {
      p.contract = null;
      W.fillSeats(s, 'f1');
    }

    S.news.both(`HISTÓRICO: ${p.name} funda a escuderia ${name} com motores ${eng.name} e entra no grid da Fórmula 1!`, 'good');
    S.records.check(s);
    S.career.save();
    return { ok: true, msg: `Escuderia ${name} fundada com sucesso!` };
  };

  /* Custo para evoluir um subsistema do carro da sua escuderia. */
  Own.partUpgradeCost = function (currentVal, factoryLv) {
    const base = 12000000 + Math.max(0, currentVal - 74) * 3200000;
    const disc = 1 - Math.min(0.25, ((factoryLv || 1) - 1) * 0.08);
    return Math.round(base * disc / 500000) * 500000;
  };

  Own.upgradeSubsystem = function (s, partKey) {
    const p = s.player;
    const t = Own.syncCustomTeam(s);
    if (!t || !p.ownedTeam) return { ok: false, msg: 'Você não possui uma escuderia de F1.' };
    const pt = W.ensureCarParts(t);
    const cur = pt[partKey];
    if (cur >= 99) return { ok: false, msg: 'Este departamento já atingiu o nível máximo (99).' };

    const cost = Own.partUpgradeCost(cur, p.ownedTeam.factoryLv);
    if (p.money < cost) return { ok: false, msg: `Caixa insuficiente (${U.fmtMoney(cost)} necessários).` };

    p.money -= cost;
    const gain = 2.0 + ((p.ownedTeam.windTunnelLv || 1) - 1) * 0.5;
    const actual = W.upgradeCarPart(t, partKey, gain);
    p.ownedTeam.parts = Object.assign({}, t.parts);
    p.ownedTeam.car = t.car;

    const meta = Own.PARTS_META.find(x => x.key === partKey);
    S.news.add(`${t.name}: pacote de evolução em ${meta ? meta.name : partKey} (+${actual.toFixed(1)} OVR).`, 'good');
    S.career.save();
    return { ok: true, msg: `${meta ? meta.name : partKey} evoluiu +${actual.toFixed(1)} (Carro: ${t.car.toFixed(1)})!` };
  };

  Own.facilityUpgradeCost = lv => lv === 1 ? 80000000 : lv === 2 ? 180000000 : 350000000;

  Own.upgradeFacility = function (s, kind) {
    const p = s.player;
    if (!Own.hasTeam(p)) return { ok: false, msg: 'Sem escuderia.' };
    const ot = p.ownedTeam;
    const key = kind === 'wind' ? 'windTunnelLv' : 'factoryLv';
    const curLv = ot[key] || 1;
    if (curLv >= 4) return { ok: false, msg: 'Instalação já está no nível máximo (4).' };
    const cost = Own.facilityUpgradeCost(curLv);
    if (p.money < cost) return { ok: false, msg: `Necessário ${U.fmtMoney(cost)}.` };

    p.money -= cost;
    ot[key] = curLv + 1;
    ot.prestige = cl((ot.prestige || 0.62) + 0.06, 0.3, 1.0);
    const t = Own.syncCustomTeam(s);
    if (t) t.prestige = ot.prestige;

    const label = kind === 'wind' ? 'Túnel de Vento' : 'Fábrica & Simulador';
    S.news.add(`${ot.name}: ${label} modernizado para o Nível ${ot[key]}!`, 'good');
    S.career.save();
    return { ok: true, msg: `${label} agora está no Nível ${ot[key]}!` };
  };

  /* Lista pilotos titulares atuais da escuderia própria. */
  Own.teamLineup = function (s) {
    const p = s.player;
    if (!Own.hasTeam(p)) return [];
    const tid = p.ownedTeam.id;
    const list = [];
    if (!Own.isBossOnly(p) && p.teamId === tid && p.catId === 'f1') {
      list.push({ id: 'player', name: p.name, country: p.country, ger: S.contracts.ger(s), isPlayer: true, salary: 0 });
    }
    (s.world.drivers || []).filter(d => d.cat === 'f1' && d.teamId === tid).forEach(d => {
      const ger = W.rating(d, s.year);
      const sal = Math.round(Math.max(800000, Math.pow(Math.max(0, ger - 70), 2) * 55000) / 100000) * 100000;
      list.push({ id: d.id, name: d.name, country: d.country, ger, isPlayer: false, salary: sal });
    });
    return list;
  };

  /* Contrata um piloto real/IA para a sua escuderia de F1 (substituindo o piloto escolhido). */
  Own.hireDriver = function (s, candidateId, replaceId) {
    const p = s.player;
    const t = Own.syncCustomTeam(s);
    if (!t || !p.ownedTeam) return { ok: false, msg: 'Sem escuderia.' };

    const cand = (s.world.drivers || []).find(d => d.id === candidateId);
    if (!cand) return { ok: false, msg: 'Piloto não encontrado.' };
    if ((s.year - cand.birth) < 18) return { ok: false, msg: 'Piloto precisa ter 18+ anos para correr na F1.' };

    const ger = W.rating(cand, s.year);
    const buyout = Math.round(Math.max(2000000, (ger - 72) * 1200000) / 500000) * 500000;
    if (p.money < buyout) return { ok: false, msg: `Multa de transferência: ${U.fmtMoney(buyout)}.` };

    if (replaceId && replaceId !== 'player') {
      const oldDrv = (s.world.drivers || []).find(d => d.id === replaceId);
      if (oldDrv) {
        oldDrv.teamId = cand.teamId || null;
        if (!oldDrv.teamId) oldDrv.cat = 'f1_ret';
      }
    }

    p.money -= buyout;
    cand.cat = 'f1';
    cand.teamId = t.id;

    if (s.season && s.season.catId === 'f1') {
      if (replaceId && s.season.entries[replaceId]) delete s.season.entries[replaceId];
      s.season.entries[cand.id] = { name: cand.name, country: cand.country, teamId: t.id, teamName: t.name };
    }
    W.fillSeats(s, 'f1');

    S.news.both(`MERCADO F1: ${t.name} contrata ${cand.name} (GER ${ger}) por ${U.fmtMoney(buyout)}!`, 'good');
    S.career.save();
    return { ok: true, msg: `${cand.name} contratado para a ${t.name}!` };
  };

  /* Alterna entre correr como Piloto-Proprietário ou atuar apenas como Chefe de Equipe (Boss). */
  Own.toggleBossOnly = function (s) {
    const p = s.player;
    const t = Own.syncCustomTeam(s);
    if (!t || !p.ownedTeam) return { ok: false, msg: 'Sem escuderia.' };
    if (s.phase === 'season') return { ok: false, msg: 'Só é possível alterar sua função de piloto na entressafra.' };

    p.ownedTeam.bossOnly = !p.ownedTeam.bossOnly;
    if (p.ownedTeam.bossOnly) {
      p.contract = null;
      p.teamId = null;
      W.fillSeats(s, 'f1');
      S.news.add(`${p.name} assume exclusivamente o cargo de Chefe de Equipe na ${t.name}.`);
    } else {
      p.catId = 'f1';
      p.teamId = t.id;
      p.contract = {
        teamId: t.id, catId: 'f1', teamName: t.name,
        years: 5, yearsTotal: 5, startYear: s.year, role: 'main',
        salary: 0, bTitle: 0, bWin: 0, bPodium: 0, bPoint: 0, exit: true, option: true, img: 0
      };
      W.seatPlayer(s);
      S.news.add(`${p.name} volta ao cockpit como Piloto-Proprietário da ${t.name}!`, 'good');
    }
    S.career.save();
    return { ok: true, msg: p.ownedTeam.bossOnly ? 'Modo Chefe de Equipe ativado.' : 'Modo Piloto-Proprietário ativado.' };
  };

  /* Balanço financeiro anual da escuderia própria (premiação de construtores, patrocinadores da equipe, motor e salários). */
  Own.seasonEndPayout = function (s) {
    const p = s.player;
    if (!Own.hasTeam(p)) return null;
    const t = Own.syncCustomTeam(s);
    const ot = p.ownedTeam;
    const eng = Own.ENGINES.find(e => e.id === ot.engineId) || Own.ENGINES[0];

    let cPos = 6;
    if (s.season && s.season.catId === 'f1' && s.season.standings && s.season.standings.teams) {
      const sortedTeams = Object.keys(s.season.standings.teams)
        .map(id => ({ id, pts: s.season.standings.teams[id] }))
        .sort((a, b) => b.pts - a.pts);
      const idx = sortedTeams.findIndex(x => x.id === ot.id);
      if (idx >= 0) cPos = idx + 1;
    }

    if (cPos === 1) {
      ot.titleCount = (ot.titleCount || 0) + 1;
      S.news.both(`TÍTULO DE CONSTRUTORES: A ${ot.name} é campeã mundial da Fórmula 1!`, 'good');
    }

    const prizeTable = [145000000, 130000000, 118000000, 106000000, 96000000, 86000000, 78000000, 70000000, 64000000, 58000000, 52000000];
    const prize = prizeTable[Math.min(prizeTable.length - 1, cPos - 1)];
    const teamSponsors = Math.round((45000000 + (ot.prestige || 0.6) * 65000000) / 100000) * 100000;
    const lineup = Own.teamLineup(s);
    const driverSalaries = U.sum(lineup.map(d => d.salary || 0));
    const factoryUpkeep = (ot.factoryLv || 1) * 14000000 + (ot.windTunnelLv || 1) * 12000000;
    const engineCost = eng.cost;

    const net = prize + teamSponsors - driverSalaries - factoryUpkeep - engineCost;
    p.money += net;

    // Evolução passiva anual da fábrica própria
    if (t) {
      const passiveGain = 0.4 + (ot.factoryLv || 1) * 0.35;
      ['aero', 'power', 'rel', 'chassis', 'quali'].forEach(k => {
        W.upgradeCarPart(t, k, passiveGain);
      });
      ot.parts = Object.assign({}, t.parts);
      ot.car = t.car;
    }

    return {
      teamName: ot.name,
      cPos,
      prize,
      teamSponsors,
      driverSalaries,
      factoryUpkeep,
      engineCost,
      net
    };
  };

  /* ---- Sistema de Rivalidade Direta no Campeonato ---- */
  Own.updateRival = function (s, week) {
    const p = s.player, se = s.season;
    if (!se || C[se.catId].level < 6 || week.rest) return;

    const ranked = S.race.ranked(se);
    const me = ranked.find(r => r.id === 'player');
    if (!me) return;

    // Escolhe o adversário mais próximo no topo da tabela (fora o próprio jogador)
    const contenders = ranked.filter(r => r.id !== 'player');
    if (!contenders.length) return;
    const topRival = me.pos === 1 ? contenders[0] : (contenders.find(r => r.pos === me.pos - 1) || contenders[0]);

    if (!p.rival || p.rival.id !== topRival.id) {
      p.rival = {
        id: topRival.id,
        name: topRival.name,
        teamId: topRival.teamId,
        teamName: topRival.teamName,
        tension: 25,
        clashes: 0
      };
    }

    const lastRes = week.results[week.results.length - 1];
    const rMe = lastRes && lastRes.order.find(o => o.id === 'player');
    const rRiv = lastRes && lastRes.order.find(o => o.id === topRival.id);

    if (rMe && rRiv && !rMe.dnf && !rRiv.dnf) {
      const posGap = Math.abs(rMe.pos - rRiv.pos);
      if (posGap === 1 && (rMe.pos <= 3 || rRiv.pos <= 3)) {
        p.rival.tension = cl(p.rival.tension + 11, 0, 100);
        p.rival.clashes++;
      } else if (posGap <= 2) {
        p.rival.tension = cl(p.rival.tension + 5, 0, 100);
      } else {
        p.rival.tension = cl(p.rival.tension - 2, 0, 100);
      }
    }
  };

  /* ---- Conceito Técnico Secreto nos Ciclos de Regulamento (2026, 2030, 2034...) ---- */
  Own.applyRegConcept = function (s, choiceId) {
    const p = s.player;
    const t = Own.getTeamObj(s) || (p.teamId ? W.team(s, 'f1', p.teamId) : null);
    if (!t) return;
    W.ensureCarParts(t);

    if (choiceId === 'radical') {
      const hit = R.chance(0.58);
      if (hit) {
        W.upgradeCarPart(t, 'aero', 7);
        W.upgradeCarPart(t, 'quali', 6);
        W.upgradeCarPart(t, 'chassis', 4);
        W.upgradeCarPart(t, 'rel', -3);
        S.news.both(`CONCEITO RADICAL: O projeto extremo da ${t.name} acertou em cheio na aerodinâmica!`, 'good');
      } else {
        W.upgradeCarPart(t, 'aero', 2);
        W.upgradeCarPart(t, 'rel', -5);
        W.upgradeCarPart(t, 'chassis', -4);
        S.news.both(`CONCEITO RADICAL: O carro da ${t.name} sofre com quiques (porpoising) e quebras no início da era!`, 'bad');
      }
    } else if (choiceId === 'conservative') {
      W.upgradeCarPart(t, 'power', 4);
      W.upgradeCarPart(t, 'rel', 6);
      W.upgradeCarPart(t, 'chassis', 3);
      S.news.add(`CONCEITO CONSERVADOR: A ${t.name} apostou em motor robusto e confiabilidade.`);
    } else {
      W.upgradeCarPart(t, 'aero', 3.5);
      W.upgradeCarPart(t, 'power', 3);
      W.upgradeCarPart(t, 'chassis', 3.5);
      W.upgradeCarPart(t, 'quali', 3);
      S.news.add(`CONCEITO EQUILIBRADO: A ${t.name} apresentou um pacote sólido para o novo regulamento.`);
    }

    t.seasonStartParts = Object.assign({}, t.parts);
    if (Own.hasTeam(p) && p.ownedTeam.id === t.id) {
      p.ownedTeam.parts = Object.assign({}, t.parts);
      p.ownedTeam.car = t.car;
    }
    S.career.save();
  };
})();
