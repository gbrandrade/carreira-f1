/* Economia: patrimônio, investimentos, patrocínios (com negociação), residência, contas da temporada e falência. */
(function () {
  const D = Game.data, R = Game.rng, U = Game.utils, C = D.categories, cfg = Game.config, cl = U.clamp;
  const E = Game.systems.economy = {};
  const lvScale = (def, lv) => def.staff ? 1 : 1 + .5 * (lv - 1);

  E.def = id => D.assets.find(a => a.id === id) || (D.staff || []).find(a => a.id === id);
  E.owned = (s, id) => s.player.assets.find(a => a.id === id);
  E.upgradeCost = (def, lv) => Math.round(def.price * .5 * lv);

  E.buy = function (s, id) {
    const p = s.player, def = E.def(id);
    if (E.owned(s, id)) return { ok: false, msg: 'Você já possui este item.' };
    if (p.money < def.price) return { ok: false, msg: 'Dinheiro insuficiente.' };
    p.money -= def.price; p.assets.push({ id, lv: 1 });
    return { ok: true, msg: `${def.name} adquirido.` };
  };

  E.upgrade = function (s, id) {
    const p = s.player, a = E.owned(s, id), def = E.def(id);
    if (!a || def.staff || a.lv >= 3) return { ok: false, msg: 'Não é possível melhorar.' };
    const cost = E.upgradeCost(def, a.lv);
    if (p.money < cost) return { ok: false, msg: 'Dinheiro insuficiente.' };
    p.money -= cost; a.lv++;
    return { ok: true, msg: `${def.name} melhorado para o nível ${a.lv}.` };
  };

  E.sell = function (s, id) {
    const p = s.player, a = E.owned(s, id), def = E.def(id);
    if (!a) return { ok: false, msg: '' };
    p.money += def.staff ? 0 : Math.round((def.price + (a.lv - 1) * def.price * .5) * cfg.assetSellRate);
    p.assets.splice(p.assets.indexOf(a), 1);
    return { ok: true, msg: `${def.name} ${def.staff ? 'dispensado' : 'vendido'}.` };
  };

  E.effects = function (s) {
    const f = { mental: 0, phys: 0, pop: 0, train: 0, media: 1 };
    s.player.assets.forEach(a => {
      const d = E.def(a.id); if (!d) return;
      const k = lvScale(d, a.lv);
      Object.keys(d.fx).forEach(x => { if (x === 'media') f.media *= d.fx[x]; else f[x] += d.fx[x] * k; });
    });
    return f;
  };

  E.lifestyleCost = s => {
    const p = s.player;
    if (!p || (p.catId !== 'f1' && !(s.flags && s.flags.wasF1))) return 0;
    const titles = (p.f1 && p.f1.titles) || 0;
    const pop = p.popularity || 10;
    return Math.round((350000 + pop * 12000 + titles * 450000) / 10000) * 10000;
  };
  E.upkeep = s => U.sum(s.player.assets.map(a => { const d = E.def(a.id); return d ? d.upkeep * (d.staff ? 1 : 1 + .3 * (a.lv - 1)) : 0; })) + E.lifestyleCost(s);

  E.invest = function (s, id, amount) {
    const p = s.player;
    if (amount <= 0 || p.money < amount) return { ok: false, msg: 'Dinheiro insuficiente.' };
    p.money -= amount; const i = p.invest.find(x => x.id === id);
    if (i) i.amount += amount; else p.invest.push({ id, amount });
    return { ok: true, msg: 'Investimento realizado.' };
  };

  E.withdraw = function (s, id) {
    const p = s.player, i = p.invest.find(x => x.id === id);
    if (!i) return { ok: false, msg: '' };
    p.money += i.amount; p.invest.splice(p.invest.indexOf(i), 1);
    return { ok: true, msg: 'Valor resgatado.' };
  };

  // ---- Patrocínios ----
  E.tiersFor = lv => lv <= 2 ? [1] : lv <= 4 ? [1, 2] : lv <= 6 ? [2, 3] : lv === 7 ? [2, 3, 4] : [3, 4];

  E.sponsorBasePay = (s, sp) => {
    const agMult = Game.systems.contracts ? Game.systems.contracts.agentMod(s.player, 'sponsorPay', 1) : 1;
    return Math.round(sp.pay * (.65 + s.player.popularity / 100) * (s.player.traits.includes('carismatico') ? 1.2 : 1) * agMult / 1000) * 1000;
  };

  E.sponsorPay = (s, spOrOffer) => {
    if (spOrOffer && spOrOffer.pay != null && spOrOffer.id && !spOrOffer.group) return Math.round(spOrOffer.pay);
    const sp = spOrOffer.group ? spOrOffer : D.sponsors.find(y => y.id === spOrOffer.id);
    return spOrOffer.customPay != null ? Math.round(spOrOffer.customPay) : E.sponsorBasePay(s, sp);
  };

  E.makeSponsorOffer = function (s, sp) {
    const pay = E.sponsorBasePay(s, sp);
    const goal = Object.assign({}, sp.goal);
    const bonus = Math.round(pay * .25 / 1000) * 1000;
    return {
      id: sp.id,
      pay,
      basePay: pay,
      years: 1,
      goal,
      baseGoal: Object.assign({}, goal),
      bonus,
      baseBonus: bonus,
      tried: false
    };
  };

  // Normaliza ofertas (compatível com saves antigos onde sponsorOffers era array de strings)
  E.normalizeSponsorOffers = function (s) {
    const list = (s.sponsorOffers || []).map(item => {
      if (typeof item === 'string') {
        const sp = D.sponsors.find(y => y.id === item);
        return sp ? E.makeSponsorOffer(s, sp) : null;
      }
      if (item && item.id) {
        const sp = D.sponsors.find(y => y.id === item.id);
        if (!sp) return null;
        if (item.basePay == null) return Object.assign(E.makeSponsorOffer(s, sp), item);
        return item;
      }
      return null;
    }).filter(Boolean);
    s.sponsorOffers = list;
    return list;
  };

  E.genSponsorOffers = function (s) {
    const lv = C[s.player.catId].level, tiers = E.tiersFor(lv);
    const have = new Set(s.player.sponsors.map(x => x.id));
    let pool = D.sponsors.filter(sp => tiers.includes(sp.tier) && !have.has(sp.id));
    if (pool.length < 6) {
      const nextTier = Math.min(4, Math.max(...tiers) + 1);
      const extra = D.sponsors.filter(sp => sp.tier === nextTier && !have.has(sp.id) && !pool.some(p => p.id === sp.id));
      pool = pool.concat(R.shuffle(extra).slice(0, 8 - pool.length));
    }
    s.sponsorOffers = R.shuffle(pool).slice(0, 7).map(sp => E.makeSponsorOffer(s, sp));
  };

  // Adiciona uma nova proposta específica (ex.: evento de marca querendo patrocinar) sem apagar as existentes
  E.addSpecificSponsorOffer = function (s) {
    const offers = E.normalizeSponsorOffers(s);
    const lv = C[s.player.catId].level, tiers = E.tiersFor(lv);
    const have = new Set(s.player.sponsors.map(x => x.id));
    const offered = new Set(offers.map(x => x.id));
    const activeGroups = new Set(s.player.sponsors.map(x => (D.sponsors.find(y => y.id === x.id) || {}).group).filter(Boolean));

    let cand = D.sponsors.filter(sp => tiers.includes(sp.tier) && !have.has(sp.id) && !offered.has(sp.id) && !activeGroups.has(sp.group));
    if (!cand.length) cand = D.sponsors.filter(sp => tiers.includes(sp.tier) && !have.has(sp.id) && !offered.has(sp.id));
    if (!cand.length) {
      const nextTier = Math.min(4, Math.max(...tiers) + 1);
      cand = D.sponsors.filter(sp => sp.tier <= nextTier && !have.has(sp.id) && !offered.has(sp.id));
    }
    if (!cand.length) return null;

    const sp = R.pick(cand);
    const off = E.makeSponsorOffer(s, sp);
    off.isEvent = true;
    if (offers.length >= 8) offers.shift();
    offers.push(off);
    s.sponsorOffers = offers;
    Game.systems.news.add(`Nova proposta de patrocínio recebida: ${sp.name} (${U.fmtMoney(off.pay)}/ano).`, 'good');
    return sp;
  };

  // Dificuldade relativa da meta (quanto maior, mais difícil para o piloto e mais atrativo para o patrocinador)
  E.goalDifficulty = function (g) {
    const weights = { top10: 1.0, pts: 0.25, pop: 0.4, podio: 2.2, vitoria: 4.5 };
    return (weights[g.k] || 1) * (g.n || 1);
  };

  E.sponsorChance = function (s, offer, nt) {
    const sp = D.sponsors.find(y => y.id === offer.id);
    const ref = Math.max(1000, offer.basePay || E.sponsorBasePay(s, sp));
    const payRatio = (nt.pay - ref) / ref;
    const bonusRatio = ((nt.bonus || 0) - (offer.baseBonus || 0)) / ref;
    const baseDiff = E.goalDifficulty(offer.baseGoal || sp.goal);
    const newDiff = E.goalDifficulty(nt.goal || sp.goal);
    const goalShift = (newDiff - baseDiff) / Math.max(1, baseDiff);
    const yearsPenalty = Math.max(0, (nt.years || 1) - 1) * 0.06;

    const p = s.player;
    const agSpo = Game.systems.contracts ? Game.systems.contracts.agentMod(p, 'sponsorChance', 0) : 0;
    const leverage = agSpo + (p.traits.includes('carismatico') ? 0.08 : 0) + Math.max(0, (p.popularity - 20) / 250);
    const demand = payRatio * 1.35 + bonusRatio * 0.65 + yearsPenalty - goalShift * 0.45;
    return cl(0.88 - demand + leverage, 0.05, 0.95);
  };

  E.negotiateSponsor = function (s, offer, nt) {
    const sp = D.sponsors.find(y => y.id === offer.id);
    const prob = E.sponsorChance(s, offer, nt);
    offer.tried = true;
    if (R.chance(prob)) {
      offer.pay = nt.pay;
      offer.years = nt.years;
      offer.goal = Object.assign({}, nt.goal);
      offer.bonus = nt.bonus;
      return { ok: true, msg: `${sp.name} aceitou os novos termos!` };
    }
    if (R.chance(.35)) {
      s.sponsorOffers = E.normalizeSponsorOffers(s).filter(o => o.id !== offer.id);
      return { ok: false, withdrawn: true, msg: `${sp.name} encerrou as negociações e retirou a proposta.` };
    }
    offer.pay = offer.basePay;
    offer.years = 1;
    offer.goal = Object.assign({}, offer.baseGoal);
    offer.bonus = offer.baseBonus;
    return { ok: false, msg: `${sp.name} recusou a contraproposta e manteve os termos originais.` };
  };

  E.signSponsor = function (s, id) {
    const p = s.player, sp = D.sponsors.find(x => x.id === id);
    if (!sp) return { ok: false, msg: 'Patrocinador não encontrado.' };
    if (p.sponsors.length >= 4) return { ok: false, msg: 'Máximo de 4 patrocinadores.' };
    const conflict = p.sponsors.map(x => D.sponsors.find(y => y.id === x.id)).find(x => x && x.group === sp.group);
    if (conflict) return { ok: false, msg: `Conflito com ${conflict.name} (mesmo segmento).` };

    const offers = E.normalizeSponsorOffers(s);
    const off = offers.find(x => x.id === id) || E.makeSponsorOffer(s, sp);
    p.sponsors.push({
      id,
      pay: off.pay,
      years: off.years || 1,
      goal: Object.assign({}, off.goal || sp.goal),
      bonus: off.bonus != null ? off.bonus : Math.round(off.pay * .25)
    });
    s.sponsorOffers = offers.filter(x => x.id !== id);
    Game.systems.news.add(`Patrocínio fechado com ${sp.name} (${U.fmtMoney(off.pay)}/ano).`, 'good');
    return { ok: true, msg: `Contrato assinado com ${sp.name}.` };
  };

  E.dropSponsor = (s, id) => { s.player.sponsors = s.player.sponsors.filter(x => x.id !== id); };

  E.goalMet = function (s, spOrContract) {
    const st = s.player.season || {};
    const g = spOrContract.goal || (D.sponsors.find(y => y.id === spOrContract.id) || {}).goal;
    if (!g) return true;
    return g.k === 'top10' ? (st.top10 || 0) >= g.n
      : g.k === 'podio' ? (st.podiums || 0) >= g.n
      : g.k === 'pts' ? (st.points || 0) >= g.n
      : g.k === 'vitoria' ? (st.wins || 0) >= g.n
      : s.player.popularity >= g.n;
  };

  E.move = function (s, id) {
    const p = s.player, r = D.residences.find(x => x.id === id), cur = D.residences.find(x => x.id === p.residence);
    if (id === p.residence) return { ok: false, msg: 'Você já mora lá.' };
    if (p.money < 100000) return { ok: false, msg: 'A mudança custa US$ 100 mil.' };
    p.money -= 100000; p.residence = id; p.popularity = U.clamp(p.popularity + (r.fans - cur.fans), 0, 100);
    return { ok: true, msg: `Você agora mora em: ${r.name}.` };
  };

  E.nextSupport = s => { const p = s.player; return p.bankrupt ? 0 : Math.round(D.origins.find(o => o.id === p.origin).support * (p.pressure.family >= 25 ? 1 : .4)); };
  E.entryCost = s => { const c = s.player.contract; return c && c.salary < 0 ? -c.salary : 0; };

  E.payEntry = function (s) {
    const p = s.player, cost = E.entryCost(s);
    const acad = Game.systems.contracts && Game.systems.contracts.ensureAcademy(p);
    const fromAcad = acad ? Math.min(cost, Math.round(cost * (acad.coverage || 0))) : 0;
    const remAfterAcad = Math.max(0, cost - fromAcad);
    p.supportLeft = E.nextSupport(s);
    const fromFam = Math.min(p.supportLeft, remAfterAcad);
    p.supportLeft -= fromFam;
    const fromPocket = remAfterAcad - fromFam;
    p.money -= fromPocket;
    if (fromAcad > 0) {
      Game.systems.news.add(`${acad.name} cobriu ${U.fmtMoney(fromAcad)} (${Math.round(acad.coverage * 100)}%) da sua inscrição.`);
    }
    return { cost, fromAcad, fromFam, fromPocket };
  };

  E.seasonEnd = function (s) {
    const p = s.player, c = p.contract, st = p.season, lines = [];
    let income = 0, expense = 0;
    const add = (label, v) => { if (Math.abs(v) < 1) return; lines.push({ label, amount: Math.round(v) }); v > 0 ? income += v : expense += -v; };
    let contractInc = 0;
    if (c) {
      if (c.salary > 0) contractInc += c.salary;
      contractInc += (st.champion ? c.bTitle : 0) + st.wins * c.bWin + st.podiums * c.bPodium + st.points * c.bPoint;
    }
    add('Salário e bônus', contractInc);
    const acad = Game.systems.contracts && Game.systems.contracts.ensureAcademy(p);
    if (acad && acad.stipend > 0) {
      add(`Bolsa ${acad.name}`, acad.stipend);
    }

    const remainingSponsors = [];
    p.sponsors.forEach(x => {
      const sp0 = D.sponsors.find(y => y.id === x.id);
      if (sp0 && (p.fired || ((p.reputation || 45) < 25 && R.chance(0.45)))) {
        Game.systems.news.both(`PATROCÍNIO ROMPIDO: A ${sp0.name} encerrou o contrato antecipadamente devido à crise de imagem.`, 'bad');
        return;
      }
      const sp = D.sponsors.find(y => y.id === x.id);
      if (!sp) return;
      const met = E.goalMet(s, x);
      const basePay = x.pay != null ? x.pay : E.sponsorBasePay(s, sp);
      const bonus = met ? (x.bonus || 0) : 0;
      let pay = basePay * (met ? 1 : .5) + bonus;
      if (c) pay *= 1 - (c.img || 0) / 100;
      add(`${sp.name}${met ? (bonus ? ' (+bônus)' : '') : ' (meta não cumprida)'}`, pay);
      const remYears = (x.years || 1) - 1;
      if (remYears > 0) {
        remainingSponsors.push(Object.assign({}, x, { years: remYears }));
      } else {
        Game.systems.news.add(`Contrato de patrocínio com ${sp.name} chegou ao fim.`);
      }
    });
    p.sponsors = remainingSponsors;

    p.invest.forEach(i => {
      const d = D.investments.find(x => x.id === i.id);
      const r = Math.max(-1, R.normal(d.mean, d.sd));
      const delta = i.amount * r; i.amount = Math.max(0, i.amount + delta);
      add(`Investimento: ${d.name}`, delta);
    });
    p.invest = p.invest.filter(i => i.amount > 1);
    add('Manutenção de bens e equipe', -E.upkeep(s));
    const res = D.residences.find(x => x.id === p.residence);
    const taxable = Math.max(0, contractInc + U.sum(lines.filter(l => l.label.indexOf('Investimento') < 0 && l.amount > 0 && l.label !== 'Salário e bônus').map(l => l.amount)));
    add(`Impostos (${res.name})`, -taxable * res.tax);
    const agObj = Game.systems.contracts ? Game.systems.contracts.ensureAgent(p) : null;
    if (agObj && contractInc > 0) add(`Comissão (${agObj.name} · ${Math.round(agObj.cut * 100)}%)`, -contractInc * agObj.cut);
    p.money += income - expense;
    return { lines, net: Math.round(income - expense) };
  };

  E.checkDebt = function (s) {
    const p = s.player;
    if (p.money >= 0) { p.debtYears = 0; return 'ok'; }
    p.debtYears++;
    if (p.debtYears < 2) return 'debt';
    p.assets.slice().forEach(a => E.sell(s, a.id));
    p.invest = []; p.sponsors = []; p.bankrupt = true; p.bankruptcies++; p.debtYears = 0;
    if (p.money < 0) p.money = 0;
    return p.bankruptcies >= 2 ? 'ruin' : 'bankrupt';
  };
})();
