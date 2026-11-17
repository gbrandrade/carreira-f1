/* Contratos de equipe, saltos de categoria em carreiras extraordinárias, Agentes e Academia de Pilotos. */
(function () {
  const D = Game.data, R = Game.rng, U = Game.utils, C = D.categories, A = Game.systems.attributes, SL = Game.systems.superlicense, cl = U.clamp;
  const Con = Game.systems.contracts = {};
  const r1k = n => Math.round(n / 1000) * 1000;

  Con.ger = s => A.playerAttrs(s.player, s.year).GER;

  /* Normaliza agente (compatível com saves antigos onde p.agent era boolean). */
  Con.ensureAgent = function (p) {
    if (!p || !p.agent) return null;
    if (p.agent === true) {
      p.agent = 'andrade';
    }
    const id = typeof p.agent === 'string' ? p.agent : p.agent.id;
    return (D.agents || []).find(a => a.id === id) || null;
  };

  Con.agentMod = function (p, key, defVal) {
    const ag = Con.ensureAgent(p);
    if (!ag || !ag.mod || ag.mod[key] == null) return defVal;
    return ag.mod[key];
  };

  /* Normaliza estrutura da Academia (compatível com saves antigos onde era string). */
  Con.ensureAcademy = function (p) {
    if (!p || !p.academy) return null;
    // Ao chegar na F1, o piloto se forma da academia júnior (não faz mais sentido ter programa de base)
    if (p.catId === 'f1') {
      p.academy = null;
      return null;
    }
    if (typeof p.academy === 'string') {
      const meta = (D.academies || []).find(a => a.name === p.academy) || { id: 'acad', name: p.academy, f1Teams: ['rbs', 'haa'], color: '#f03a3a' };
      p.academy = {
        id: meta.id,
        name: meta.name,
        f1Teams: meta.f1Teams || [],
        color: meta.color || '#f03a3a',
        active: true,
        years: 2,
        yearsTotal: 2,
        coverage: 0.85,
        stipend: 30000,
        f1TestsPerYear: 1,
        f1TestsLeft: 1,
        mediaObligations: 1,
        mediaDone: 0,
        satisfaction: 70
      };
    }
    return p.academy.active ? p.academy : null;
  };

  /* Avalia se o piloto teve uma campanha extraordinária capaz de pular categorias (ex.: F3 -> F1, F4 -> F3). */
  Con.isExtraordinary = function (s) {
    const p = s.player, cur = C[p.catId], ger = Con.ger(s), last = p.lastSeason;
    const rep = p.reputation != null ? p.reputation : 45;
    if (!last || last.reserve) return false;
    const dominantChamp = last.champ && ger >= cur.mean + 5 && rep >= 62;
    const generational = last.pos <= 2 && ger >= cur.mean + 9 && rep >= 68;
    return dominantChamp || generational;
  };

  /* Valores salariais realistas: sem contratos multimilionários precoces na base ou no 1º ano de F1. */
  Con.valueFor = function (s, catId, team, role) {
    const p = s.player, c = C[catId], ger = Con.ger(s);
    const salBoost = Con.agentMod(p, 'salaryBoost', 1);
    const seatDisc = Con.agentMod(p, 'seatDiscount', 0);

    if (role === 'reserve') {
      return Math.round((150000 + 250000 * team.prestige) * salBoost / 10000) * 10000;
    }
    if (catId === 'f1') {
      const f1Races = (p.f1 && p.f1.races) || 0;
      const f1Seasons = Math.floor(f1Races / 18);
      const f1Wins = (p.f1 && p.f1.wins) || 0;
      const f1Titles = (p.f1 && p.f1.titles) || 0;
      const rep = p.reputation != null ? p.reputation : 45;

      if (f1Seasons === 0) {
        if (team.prestige < 0.45 && rep < 55 && !(p.academy && p.academy.active && p.academy.f1Teams.includes(team.id))) {
          return -Math.round((600000 + (55 - rep) * 25000) * (1 - seatDisc) / 50000) * 50000;
        }
        const rookieSal = (450000 + Math.max(0, ger - 78) * 65000) * (0.65 + 0.65 * team.prestige) * salBoost;
        return Math.round(cl(rookieSal, 400000, 2100000) / 25000) * 25000;
      }

      if (f1Seasons <= 2 && f1Titles === 0 && f1Wins < 3) {
        const midSal = (1100000 + Math.max(0, ger - 80) * 220000 + f1Wins * 450000) * (0.65 + 0.65 * team.prestige) * salBoost;
        return Math.round(cl(midSal, 900000, 7500000) / 50000) * 50000;
      }

      const starBase = (4500000 + Math.pow(Math.max(0, ger - 82), 2) * 145000 + f1Wins * 280000 + f1Titles * 3500000) * salBoost;
      return Math.round(cl(starBase * (0.6 + 0.65 * team.prestige), 5000000, 45000000) / 100000) * 100000;
    }

    const price = c.cost * (.6 + .8 * team.prestige) * (1 - seatDisc);
    const merit = cl((ger - (c.mean + 4)) / 14, -.5, 1.35);
    if (merit < 1) return r1k(-price * (1 - merit));
    const stipendCap = c.level >= 6 ? 160000 : c.level >= 4 ? 60000 : 15000;
    return r1k(Math.min(stipendCap, c.cost * 0.08 * (merit - 1)));
  };

  Con.defaultTerms = function (s, catId, team, role) {
    const sal = Con.valueFor(s, catId, team, role);
    const isF1 = catId === 'f1';
    const f1Races = (s.player.f1 && s.player.f1.races) || 0;
    const isRookieF1 = isF1 && f1Races < 18;
    const ref = isF1
      ? (isRookieF1 ? Math.max(Math.abs(sal), 600000) : Math.max(Math.abs(sal), 2500000))
      : Math.max(Math.abs(sal), C[catId].cost * .35, 25000);
    const rr = n => Math.max(1000, Math.round(n / 5000) * 5000);

    if (role === 'reserve') {
      return { years: 1, salary: sal, bTitle: 0, bWin: rr(ref * .15), bPodium: rr(ref * .08), bPoint: rr(ref * .015), exit: true, option: false, img: 0 };
    }
    if (isRookieF1) {
      return { years: R.int(1, 2), salary: sal, bTitle: rr(ref * .8), bWin: rr(ref * .18), bPodium: rr(ref * .07), bPoint: rr(ref * .01), exit: false, option: true, img: 0 };
    }
    return { years: isF1 ? R.int(1, 3) : R.int(1, 2), salary: sal, bTitle: rr(ref * .35), bWin: rr(ref * .04), bPodium: rr(ref * .018), bPoint: rr(ref * .003), exit: false, option: false, img: 0 };
  };

  Con.termsValue = function (t, ref) {
    return t.salary + .15 * t.bTitle + 1.5 * t.bWin + 3 * t.bPodium + 20 * t.bPoint + (t.exit ? .08 * ref : 0) + (t.option ? .05 * ref : 0) - (t.img / 100) * ref * .5;
  };

  Con.attract = function (s) {
    const p = s.player, last = p.lastSeason || { pos: 12, champ: false };
    const rep = (p.reputation != null ? p.reputation : 45) + Con.agentMod(p, 'prestigeHelp', 0);
    let a = 45 + (Con.ger(s) - C[p.catId].mean) * 1.15 + (rep - 45) * 0.45 + (p.popularity - 20) * 0.15;
    a += last.champ ? 20 : last.pos <= 3 ? 12 : last.pos <= 10 ? 4 : -4;
    if (p.h2h && (p.h2h.raceW + p.h2h.raceL) >= 4) {
      const diff = p.h2h.raceW - p.h2h.raceL;
      a += cl(diff * 1.5, -8, 12);
    }
    if (p.contract && p.contract.role === 'reserve') a += 10;
    if (Con.ensureAcademy(p)) a += 8;
    if (p.fired) a -= 20;
    return cl(a, 5, 98);
  };

  Con.effectiveCost = function (s, rawSalary) {
    if (rawSalary >= 0) return 0;
    const cost = -rawSalary;
    const acad = Con.ensureAcademy(s.player);
    const acadCover = acad ? Math.round(cost * (acad.coverage || 0)) : 0;
    return Math.max(0, cost - acadCover);
  };

  Con.canAfford = (s, o) => o.terms.salary >= 0 || s.player.money + Game.systems.economy.nextSupport(s) >= Con.effectiveCost(s, o.terms.salary);

  Con.generateOffers = function (s) {
    const p = s.player, cur = C[p.catId], y = s.year, age = y - p.birth, forced = !!p.forcedUp;
    const attract = Con.attract(s), rep = (p.reputation != null ? p.reputation : 45) + Con.agentMod(p, 'prestigeHelp', 0);
    const offers = [];
    const sponsorPower = U.sum((p.sponsors || []).map(x => x.pay || 0));
    const acad = Con.ensureAcademy(p);
    const extraordinary = Con.isExtraordinary(s);

    s.offers = [];
    if (p.contract && !forced && !p.contract.exit) return;
    if (Game.systems.world.syncF1Teams) Game.systems.world.syncF1Teams(s, false);

    if (age === 17 && extraordinary && SL.status(p, y).total >= 28 && Con.ger(s) >= 82) {
      if (!p.flags.f1Waiver) {
        p.flags.f1Waiver = true;
        Game.systems.news.both('EXCEÇÃO DA FIA: Por desempenho extraordinário na base, você recebeu autorização especial para estrear na F1 aos 17 anos!', 'good');
      }
    }

    const slStatus = SL.status(p, y);
    const slEligible = slStatus.eligible || (extraordinary && age >= 17 && slStatus.total >= 30 && Con.ger(s) >= 82);

    const cats = [];
    if (!forced && !p.contract) cats.push(cur.id);
    D.nextOptions[cur.id].forEach(n => {
      const cn = C[n];
      const skipLevels = cn.level - cur.level;

      if (n === 'f1' && cur.id !== 'f2') {
        if (!extraordinary || !slEligible) return;
        if (cur.id === 'frec' && Con.ger(s) < 85) return;
      } else if (skipLevels >= 2 && n !== 'f1') {
        if (!extraordinary || Con.ger(s) < cn.mean - 4) return;
      }

      if (age < cn.minAge && !(n === 'f1' && slEligible)) return;
      if (n === 'f1' && !slEligible) return;
      if (forced || p.contract || attract >= 26 + cn.level * 2) cats.push(n);
    });

    cats.forEach(catId => {
      const c = C[catId], diff = c.level - cur.level;
      let teams = Game.systems.world.activeTeams(s, catId);

      if (catId === 'f1') {
        teams = teams.filter(t => {
          const isAcadTeam = acad && (acad.f1Teams || []).includes(t.id);
          if (isAcadTeam) return true;
          if (t.prestige >= 0.85) return rep >= 72 && Con.ger(s) >= 84;
          if (t.prestige >= 0.55) return rep >= 56 || sponsorPower >= 4000000;
          return true;
        });
      }

      const target = cl((attract - 10 * Math.max(0, diff)) / 100, .05, 1);
      let sorted = R.shuffle(teams).map(t => {
        const isAcadTeam = (catId === 'f1' && acad && (acad.f1Teams || []).includes(t.id)) ? 0.5 : 0;
        return { t, w: Math.exp(-Math.pow(t.prestige - target, 2) / (2 * .22 * .22)) + isAcadTeam };
      }).sort((a, b) => b.w - a.w + R.normal(0, .12));

      const pick = sorted.slice(0, catId === cur.id ? 3 : 2);

      pick.forEach(x => {
        if (catId === 'f1' && cur.id === 'f1' && attract < 18 && R.chance(.6)) return;
        const terms = Con.defaultTerms(s, catId, x.t, 'main');
        const isSkip = diff >= 2;
        const isAcadTeam = catId === 'f1' && acad && (acad.f1Teams || []).includes(x.t.id);
        let note = null;
        if (isSkip && catId === 'f1') note = `Salto direto (${cur.short} → F1)`;
        else if (isSkip) note = `Promoção acelerada (${cur.short} → ${c.short})`;
        else if (isAcadTeam) note = `Via ${acad.name}`;

        offers.push({
          id: U.uid('o'),
          teamId: x.t.id,
          catId,
          teamName: x.t.name,
          car: Math.round(x.t.car),
          terms,
          base: Object.assign({}, terms),
          tried: false,
          role: 'main',
          note
        });
      });
    });

    if (slEligible && (cur.id === 'f2' || cur.id === 'f3' || cur.id === 'f1')) {
      const f1Pool = Game.systems.world.activeTeams(s, 'f1');
      const preferred = acad ? f1Pool.filter(t => (acad.f1Teams || []).includes(t.id)) : [];
      const f1Teams = (preferred.length ? preferred : R.shuffle(f1Pool)).slice(0, 2);
      f1Teams.forEach(t => {
        const terms = Con.defaultTerms(s, 'f1', t, 'reserve');
        offers.push({
          id: U.uid('o'), teamId: t.id, catId: 'f1', teamName: t.name, car: Math.round(t.car),
          terms, base: Object.assign({}, terms), tried: false, role: 'reserve', note: 'Piloto Reserva F1'
        });
      });
    }

    s.fallbackCat = cats[0] || cur.id;
    s.offers = offers.sort((a, b) => {
      const la = C[a.catId].level - (a.role === 'reserve' ? 0.4 : 0);
      const lb = C[b.catId].level - (b.role === 'reserve' ? 0.4 : 0);
      return lb - la;
    });
    Con.ensureFallback(s);
    Con.genAcademyOffers(s);
  };

  Con.buildAcademyOffer = function (s, meta) {
    const p = s.player, cur = C[p.catId], ger = Con.ger(s);
    const agBonus = Con.agentMod(p, 'academyBonus', 0);
    const diff = ger - cur.mean;
    const coverage = (diff >= 8 || agBonus > 0.1) ? 0.90 : diff >= 4 ? 0.80 : 0.65;
    const stipend = cur.level >= 6 ? 60000 : cur.level >= 4 ? 30000 : 15000;
    const tests = cur.level >= 5 ? 2 : 1;
    const terms = {
      years: 3,
      coverage,
      stipend,
      f1TestsPerYear: tests,
      mediaObligations: 2
    };
    return {
      id: U.uid('ac'),
      acadId: meta.id,
      name: meta.name,
      f1Teams: meta.f1Teams || [],
      color: meta.color || '#f03a3a',
      terms,
      base: Object.assign({}, terms),
      tried: false
    };
  };

  /* Gera ofertas espontâneas de Academia de Pilotos em qualquer fase da base (antes da F1). */
  Con.genAcademyOffers = function (s, forceAdd) {
    const p = s.player, cur = C[p.catId], y = s.year, age = y - p.birth;
    if (!s.academyOffers) s.academyOffers = [];

    // Nunca oferece academia na F1
    if (cur.id === 'f1' || (s.flags && s.flags.wasF1)) {
      s.academyOffers = [];
      return;
    }

    const acad = Con.ensureAcademy(p);
    if (acad && acad.years > 1) {
      s.academyOffers = [];
      return;
    }

    if (cur.level < 1 || age > 22) {
      if (!forceAdd) s.academyOffers = [];
      return;
    }

    const ger = Con.ger(s);
    const hasBaseAgent = Con.agentMod(p, 'academyBonus', 0) > 0;
    const qualified = forceAdd || ger >= cur.mean + 2 || hasBaseAgent || (p.lastSeason && p.lastSeason.pos <= 4);
    if (!qualified) {
      if (!forceAdd) s.academyOffers = [];
      return;
    }

    const pool = (D.academies || []).filter(a => (!acad || a.id !== acad.id) && !s.academyOffers.some(o => o.acadId === a.id));
    if (!pool.length) return;

    const count = forceAdd ? 1 : (ger >= cur.mean + 7 ? 2 : 1);
    const picked = R.shuffle(pool).slice(0, count);

    if (forceAdd) {
      const off = Con.buildAcademyOffer(s, picked[0]);
      s.academyOffers.push(off);
      Game.systems.news.add(`ACADEMIA: A ${off.name} enviou um convite oficial para seu programa de desenvolvimento!`, 'good');
    } else {
      s.academyOffers = picked.map(m => Con.buildAcademyOffer(s, m));
    }
  };

  /* Permite que o jogador busque proativamente contato com Academias de Pilotos a qualquer momento (exceto na F1). */
  Con.seekAcademy = function (s) {
    const p = s.player, cur = C[p.catId], age = s.year - p.birth;
    if (cur.id === 'f1' || (s.flags && s.flags.wasF1)) {
      return { ok: false, msg: 'Você já chegou à Fórmula 1 e não precisa mais de academia de base.' };
    }
    const acad = Con.ensureAcademy(p);
    if (acad) {
      return { ok: false, msg: `Você já possui contrato ativo com a ${acad.name}.` };
    }
    if (age > 23) {
      return { ok: false, msg: 'As academias buscam pilotos até 23 anos.' };
    }
    if (!s.academyOffers) s.academyOffers = [];
    if (s.academyOffers.length >= 3) {
      return { ok: false, msg: 'Você já tem propostas de academias aguardando resposta.' };
    }

    const pool = (D.academies || []).filter(a => !s.academyOffers.some(o => o.acadId === a.id));
    if (!pool.length) return { ok: false, msg: 'Nenhuma outra academia disponível no momento.' };

    const ger = Con.ger(s);
    const rep = p.reputation != null ? p.reputation : 45;
    const agBonus = Con.agentMod(p, 'academyBonus', 0);
    const chance = cl(0.45 + (ger - cur.mean) * 0.04 + (rep - 45) * 0.008 + agBonus, 0.25, 0.92);

    if (R.chance(chance)) {
      const meta = R.pick(pool);
      const off = Con.buildAcademyOffer(s, meta);
      s.academyOffers.push(off);
      Game.systems.news.add(`Prospecção: A ${off.name} aceitou abrir negociações com você!`, 'good');
      Game.systems.career.save();
      return { ok: true, msg: `${off.name} respondeu ao contato e enviou uma proposta!` };
    }
    Game.systems.career.save();
    return { ok: false, msg: 'As academias pediram mais resultados na pista antes de abrir vaga.' };
  };

  Con.academyChance = function (s, offer, nt) {
    const b = offer.base;
    const covDiff = (nt.coverage - b.coverage) * 1.4;
    const stipDiff = (nt.stipend - b.stipend) / 100000;
    const testDiff = (nt.f1TestsPerYear - b.f1TestsPerYear) * 0.22;
    const mediaHelp = (nt.mediaObligations - b.mediaObligations) * 0.14;
    const yearHelp = (nt.years - b.years) * 0.05;
    const ger = Con.ger(s), cur = C[s.player.catId];
    const agBonus = Con.agentMod(s.player, 'academyBonus', 0) + Con.agentMod(s.player, 'contractTol', 0);
    const talentBonus = Math.max(0, (ger - cur.mean) * 0.02) + agBonus;
    const demand = covDiff + stipDiff + testDiff - mediaHelp - yearHelp;
    return cl(0.85 - demand + talentBonus, 0.08, 0.95);
  };

  Con.negotiateAcademy = function (s, offer, nt) {
    const prob = Con.academyChance(s, offer, nt);
    offer.tried = true;
    if (R.chance(prob)) {
      offer.terms = Object.assign({}, nt);
      return { ok: true, msg: `${offer.name} aceitou os termos do programa!` };
    }
    if (R.chance(0.35)) {
      s.academyOffers = (s.academyOffers || []).filter(o => o.id !== offer.id);
      return { ok: false, withdrawn: true, msg: `${offer.name} encerrou as conversas e retirou o convite.` };
    }
    offer.terms = Object.assign({}, offer.base);
    return { ok: false, msg: `${offer.name} recusou a contraproposta e manteve a oferta base.` };
  };

  Con.acceptAcademy = function (s, offer) {
    const p = s.player;
    if (p.catId === 'f1' || (s.flags && s.flags.wasF1)) {
      return { ok: false, msg: 'Pilotos titulares da F1 não assinam contratos de academia júnior.' };
    }
    const t = offer.terms;
    p.academy = {
      id: offer.acadId,
      name: offer.name,
      f1Teams: offer.f1Teams || [],
      color: offer.color || '#f03a3a',
      active: true,
      years: t.years,
      yearsTotal: t.years,
      coverage: t.coverage,
      stipend: t.stipend,
      f1TestsPerYear: t.f1TestsPerYear,
      f1TestsLeft: t.f1TestsPerYear,
      mediaObligations: t.mediaObligations,
      mediaDone: 0,
      satisfaction: 75
    };
    s.academyOffers = [];
    Game.systems.news.both(`Contrato assinado com a ${offer.name} (${t.years} anos, ${Math.round(t.coverage * 100)}% dos custos cobertos)!`, 'good');
    return { ok: true, msg: `Você agora é piloto oficial da ${offer.name}!` };
  };

  Con.runAcademyF1Test = function (s) {
    const p = s.player;
    if (p.catId === 'f1') return { ok: false, msg: 'Você já corre na Fórmula 1!' };
    const acad = Con.ensureAcademy(p);
    if (!acad) return { ok: false, msg: 'Você não pertence a uma academia.' };
    if ((acad.f1TestsLeft || 0) <= 0) return { ok: false, msg: 'Sem sessões de teste de F1 restantes neste ano.' };
    if (p.phys < 25) return { ok: false, msg: 'Físico muito desgastado para testar um F1.' };

    acad.f1TestsLeft--;
    p.phys = cl(p.phys - 6, 0, 100);
    p.train = Math.min(Game.config.trainCap + 2, (p.train || 0) + 0.55);
    const growAttr = R.chance(0.5) ? 'RIT' : 'ATE';
    A.growCap(p, growAttr, 0.35);
    p.reputation = cl((p.reputation || 45) + 3, 0, 100);
    acad.satisfaction = cl(acad.satisfaction + 4, 0, 100);

    const yearTestPts = p.superPoints.filter(x => x.year === s.year && x.catId === 'f1_test').reduce((a, b) => a + b.pts, 0);
    let slMsg = '';
    if (yearTestPts < 10) {
      p.superPoints.push({ year: s.year, catId: 'f1_test', pts: 2 });
      slMsg = ' · +2 pts superlicença';
    }

    const msg = `Teste privado de F1 (${acad.name}): telemetria excelente (+${growAttr} teto, +Reputação${slMsg}).`;
    Game.systems.news.add(msg, 'good');
    Game.systems.career.save();
    return { ok: true, msg };
  };

  Con.runAcademyAd = function (s) {
    const p = s.player, acad = Con.ensureAcademy(p);
    if (!acad) return { ok: false, msg: 'Você não pertence a uma academia.' };
    if ((acad.mediaDone || 0) >= (acad.mediaObligations || 1)) return { ok: false, msg: 'Compromissos de mídia do ano já cumpridos.' };

    acad.mediaDone = (acad.mediaDone || 0) + 1;
    const fee = Math.round((15000 + C[p.catId].level * 8000) * (1 + p.popularity / 100) / 1000) * 1000;
    p.money += fee;
    p.popularity = cl((p.popularity || 10) + 4, 0, 100);
    p.mental = cl(p.mental - 3, 0, 100);
    acad.satisfaction = cl(acad.satisfaction + 6, 0, 100);

    const msg = `Campanha da ${acad.name} gravada! Cachê de ${U.fmtMoney(fee)} e +4 Popularidade.`;
    Game.systems.news.add(msg, 'good');
    Game.systems.career.save();
    return { ok: true, msg };
  };

  Con.adjustAcademySat = function (s, delta, reason) {
    const p = s.player, acad = Con.ensureAcademy(p);
    if (!acad || !delta) return;
    acad.satisfaction = cl((acad.satisfaction || 70) + delta, 0, 100);
    if (acad.satisfaction <= 15) {
      Con.fireFromAcademy(s, reason || 'resultados e comportamento incompatíveis com o programa');
    }
  };

  Con.fireFromAcademy = function (s, reason) {
    const p = s.player, acad = Con.ensureAcademy(p);
    if (!acad) return;
    const name = acad.name;
    p.academy = null;
    p.reputation = cl((p.reputation || 45) - 8, 0, 100);
    Game.systems.news.both(`DEMITIDO DA ACADEMIA: A ${name} rompeu seu contrato (${reason})! Você perdeu a bolsa e a cobertura de custos.`, 'bad');
    if (Game.ui && Game.ui.toast) Game.ui.toast(`Você foi demitido da ${name}!`);
  };

  Con.ensureFallback = function (s) {
    const p = s.player;
    if (p.contract || p.catId === 'f1' || s.phase === 'season') return;
    s.offers = s.offers.filter(o => o.note !== 'Vaga de reserva');
    if (s.offers.some(o => Con.canAfford(s, o))) return;
    const catId = s.fallbackCat || p.catId, t = Game.systems.world.activeTeams(s, catId).slice().sort((a, b) => a.prestige - b.prestige)[0];
    const terms = Con.defaultTerms(s, catId, t, 'main');
    const afford = p.money + Game.systems.economy.nextSupport(s);
    const eff = Con.effectiveCost(s, terms.salary);
    if (terms.salary < 0 && eff > afford) {
      const acad = Con.ensureAcademy(p);
      const cov = acad ? (acad.coverage || 0) : 0;
      const maxGross = cov < 1 ? Math.floor(afford / (1 - cov)) : Math.abs(terms.salary);
      terms.salary = -Math.max(0, maxGross);
    }
    s.offers.push({ id: U.uid('o'), teamId: t.id, catId, teamName: t.name, car: Math.round(t.car), terms, base: Object.assign({}, terms), tried: true, note: 'Vaga de reserva', role: 'main' });
  };

  Con.chance = function (s, offer, nt) {
    const ref = Math.max(Math.abs(offer.base.salary), C[offer.catId].cost * .5, 50000);
    const delta = Con.termsValue(nt, ref) - Con.termsValue(offer.base, ref);
    const isJunior = C[offer.catId].level <= 7;
    const agBonus = Con.agentMod(s.player, 'contractTol', 0) + (isJunior ? Con.agentMod(s.player, 'juniorOffer', 0) : 0);
    const tol = ref * (.12 + agBonus);
    return delta <= tol ? .92 : cl(.92 - (delta - tol) / (ref * .5), 0, .92);
  };

  Con.negotiate = function (s, offer, nt) {
    const prob = Con.chance(s, offer, nt);
    offer.tried = true;
    if (R.chance(prob)) { offer.terms = nt; return { ok: true, msg: 'A equipe aceitou os termos.' }; }
    if (R.chance(.4)) { s.offers = s.offers.filter(o => o !== offer); return { ok: false, withdrawn: true, msg: 'A equipe retirou a oferta.' }; }
    offer.terms = Object.assign({}, offer.base);
    return { ok: false, msg: 'A equipe manteve a proposta original.' };
  };

  Con.accept = function (s, offer) {
    const p = s.player;
    if (!Con.canAfford(s, offer)) return { ok: false, msg: 'Sem fundos para a inscrição.' };
    p.contract = Object.assign({
      teamId: offer.teamId,
      catId: offer.catId,
      teamName: offer.teamName,
      yearsTotal: offer.terms.years,
      startYear: s.year,
      role: offer.role || 'main'
    }, offer.terms);
    s.offers = [];
    const roleTxt = offer.role === 'reserve' ? ' como Piloto Reserva' : '';
    Game.systems.news.add(`Contrato assinado com a ${offer.teamName} (${C[offer.catId].short})${roleTxt}.`, 'good');
    return { ok: true, msg: 'Contrato assinado!' };
  };

  Con.terminate = function (s) {
    const p = s.player, c = p.contract; if (!c) return { ok: false };
    const fee = c.exit ? 0 : Math.round(Math.abs(c.salary) * .5);
    if (p.money < fee) return { ok: false, msg: 'Sem dinheiro para a multa de rescisão.' };
    p.money -= fee; p.contract = null;
    return { ok: true, msg: fee ? `Contrato rescindido (multa ${U.fmtMoney(fee)}).` : 'Contrato encerrado pela cláusula de saída.' };
  };
})();
