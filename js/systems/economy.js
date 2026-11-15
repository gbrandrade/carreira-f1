/* Economia: patrimônio, investimentos, patrocínios, residência, contas da temporada e falência. */
(function () {
  const D = Game.data, R = Game.rng, U = Game.utils, C = D.categories, cfg = Game.config;
  const E = Game.systems.economy = {};
  const lvScale = (def, lv) => def.staff ? 1 : 1 + .5 * (lv - 1);

  E.def = id => D.assets.find(a => a.id === id);
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
  // efeitos acumulados dos bens
  E.effects = function (s) {
    const f = { mental: 0, phys: 0, pop: 0, train: 0, media: 1 };
    s.player.assets.forEach(a => { const d = E.def(a.id), k = lvScale(d, a.lv); Object.keys(d.fx).forEach(x => { if (x === 'media') f.media *= d.fx[x]; else f[x] += d.fx[x] * k; }); });
    return f;
  };
  E.upkeep = s => U.sum(s.player.assets.map(a => { const d = E.def(a.id); return d.upkeep * (d.staff ? 1 : 1 + .3 * (a.lv - 1)); }));

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

  // patrocínios
  E.tiersFor = lv => lv <= 3 ? [1] : lv <= 6 ? [1, 2] : lv === 7 ? [2, 3] : [3, 4];
  E.sponsorPay = (s, sp) => Math.round(sp.pay * (.6 + s.player.popularity / 100) * (s.player.traits.includes('carismatico') ? 1.2 : 1) / 1000) * 1000;
  E.genSponsorOffers = function (s) {
    const lv = C[s.player.catId].level, tiers = E.tiersFor(lv), have = s.player.sponsors.map(x => x.id);
    s.sponsorOffers = R.shuffle(D.sponsors.filter(sp => tiers.includes(sp.tier) && !have.includes(sp.id))).slice(0, 4).map(sp => sp.id);
  };
  E.signSponsor = function (s, id) {
    const p = s.player, sp = D.sponsors.find(x => x.id === id);
    if (p.sponsors.length >= 4) return { ok: false, msg: 'Máximo de 4 patrocinadores.' };
    const conflict = p.sponsors.map(x => D.sponsors.find(y => y.id === x.id)).find(x => x.group === sp.group);
    if (conflict) return { ok: false, msg: `Conflito com ${conflict.name} (mesmo segmento).` };
    p.sponsors.push({ id }); s.sponsorOffers = (s.sponsorOffers || []).filter(x => x !== id);
    return { ok: true, msg: `Contrato assinado com ${sp.name}.` };
  };
  E.dropSponsor = (s, id) => { s.player.sponsors = s.player.sponsors.filter(x => x.id !== id); };
  E.goalMet = function (s, sp) {
    const st = s.player.season || {}, g = sp.goal;
    return g.k === 'top10' ? (st.top10 || 0) >= g.n : g.k === 'podio' ? (st.podiums || 0) >= g.n : g.k === 'pts' ? (st.points || 0) >= g.n : g.k === 'vitoria' ? (st.wins || 0) >= g.n : s.player.popularity >= g.n;
  };

  E.move = function (s, id) {
    const p = s.player, r = D.residences.find(x => x.id === id), cur = D.residences.find(x => x.id === p.residence);
    if (id === p.residence) return { ok: false, msg: 'Você já mora lá.' };
    if (p.money < 100000) return { ok: false, msg: 'A mudança custa US$ 100 mil.' };
    p.money -= 100000; p.residence = id; p.pressure.fans = U.clamp(p.pressure.fans + (r.fans - cur.fans), 0, 100);
    return { ok: true, msg: `Você agora mora em: ${r.name}.` };
  };

  E.nextSupport = s => { const p = s.player; return p.bankrupt ? 0 : Math.round(D.origins.find(o => o.id === p.origin).support * (p.pressure.family >= 25 ? 1 : .4)); };

  // custo de inscrição (quando o salário é negativo o piloto paga para correr)
  E.entryCost = s => { const c = s.player.contract; return c && c.salary < 0 ? -c.salary : 0; };
  E.payEntry = function (s) {
    const p = s.player, cost = E.entryCost(s);
    p.supportLeft = E.nextSupport(s);
    const fromFam = Math.min(p.supportLeft, cost);
    p.supportLeft -= fromFam; p.money -= (cost - fromFam);
    return { cost, fromFam, fromPocket: cost - fromFam };
  };

  // fechamento da temporada: receitas, despesas, impostos, investimentos
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
    p.sponsors.forEach(x => { const sp = D.sponsors.find(y => y.id === x.id), met = E.goalMet(s, sp); let pay = E.sponsorPay(s, sp) * (met ? 1 : .5); if (c) pay *= 1 - (c.img || 0) / 100; add(`${sp.name}${met ? '' : ' (meta não cumprida)'}`, pay); });
    p.invest.forEach(i => { const d = D.investments.find(x => x.id === i.id); const r = Math.max(-1, R.normal(d.mean, d.sd)); const delta = i.amount * r; i.amount = Math.max(0, i.amount + delta); add(`Investimento: ${d.name}`, delta); });
    p.invest = p.invest.filter(i => i.amount > 1);
    add('Manutenção de bens e equipe', -E.upkeep(s));
    const res = D.residences.find(x => x.id === p.residence);
    const taxable = Math.max(0, contractInc + U.sum(lines.filter(l => l.label.indexOf('Investimento') < 0 && l.amount > 0 && l.label !== 'Salário e bônus').map(l => l.amount)));
    add(`Impostos (${res.name})`, -taxable * res.tax);
    if (p.agent) add('Comissão do agente', -contractInc * .10);
    p.money += income - expense;
    return { lines, net: Math.round(income - expense) };
  };

  // 'ok' | 'debt' | 'bankrupt' | 'ruin'
  E.checkDebt = function (s) {
    const p = s.player;
    if (p.money >= 0) { p.debtYears = 0; return 'ok'; }
    p.debtYears++;
    if (p.debtYears < 2) return 'debt';
    // falência: vende tudo, família corta apoio
    p.assets.slice().forEach(a => E.sell(s, a.id));
    p.invest = []; p.sponsors = []; p.bankrupt = true; p.bankruptcies++; p.debtYears = 0;
    if (p.money < 0) p.money = 0;
    return p.bankruptcies >= 2 ? 'ruin' : 'bankrupt';
  };
})();
