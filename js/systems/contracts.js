/* Contratos e ofertas. Salário negativo = o piloto paga para correr (pay driver). */
(function () {
  const D = Game.data, R = Game.rng, U = Game.utils, C = D.categories, A = Game.systems.attributes, SL = Game.systems.superlicense, cl = U.clamp;
  const Con = Game.systems.contracts = {};
  const r1k = n => Math.round(n / 1000) * 1000;

  Con.ger = s => A.playerAttrs(s.player, s.year).GER;

  Con.valueFor = function (s, catId, team) {
    const c = C[catId], ger = Con.ger(s);
    if (catId === 'f1') return Math.round(Math.max(400000, 60000 * Math.pow(Math.max(0, ger - 66), 2)) * (.5 + .7 * team.prestige) / 10000) * 10000;
    const price = c.cost * (.6 + .8 * team.prestige), merit = cl((ger - (c.mean + 4)) / 14, -.5, 1.4);
    return r1k(merit < 1 ? -price * (1 - merit) : c.cost * (merit - 1));
  };

  Con.defaultTerms = function (s, catId, team) {
    const sal = Con.valueFor(s, catId, team), ref = Math.max(Math.abs(sal), C[catId].cost * .5, 50000);
    const rr = n => Math.round(n / 5000) * 5000;
    return { years: catId === 'f1' ? R.int(1, 3) : R.int(1, 2), salary: sal, bTitle: rr(ref * .4), bWin: rr(ref * .03), bPodium: rr(ref * .015), bPoint: rr(ref * .002), exit: false, option: false, img: 0 };
  };

  Con.termsValue = function (t, ref) {
    return t.salary + .15 * t.bTitle + 1.5 * t.bWin + 3 * t.bPodium + 20 * t.bPoint + (t.exit ? .08 * ref : 0) + (t.option ? .05 * ref : 0) - (t.img / 100) * ref * .5;
  };

  Con.attract = function (s) {
    const p = s.player, last = p.lastSeason || { pos: 12, champ: false };
    let a = 50 + (Con.ger(s) - C[p.catId].mean) * 1.2 + (p.popularity - 20) * .25;
    a += last.champ ? 20 : last.pos <= 3 ? 12 : last.pos <= 10 ? 4 : -4;
    if (p.fired) a -= 20;
    return cl(a, 5, 98);
  };

  Con.canAfford = (s, o) => o.terms.salary >= 0 || s.player.money + Game.systems.economy.nextSupport(s) >= -o.terms.salary;

  Con.generateOffers = function (s) {
    const p = s.player, cur = C[p.catId], y = s.year, age = y - p.birth, forced = !!p.forcedUp;
    const attract = Con.attract(s), offers = [];
    s.offers = [];
    if (p.contract && !forced && !p.contract.exit) return;
    if (Game.systems.world.syncF1Teams) Game.systems.world.syncF1Teams(s, false);

    const cats = [];
    if (!forced && !p.contract) cats.push(cur.id);
    D.nextOptions[cur.id].forEach(n => {
      const cn = C[n];
      if (age < cn.minAge) return;
      if (n === 'f1' && !SL.status(p, y).eligible) return;
      if (forced || p.contract || attract >= 28 + cn.level * 2) cats.push(n);
    });

    cats.forEach(catId => {
      const c = C[catId], diff = c.level - cur.level, teams = Game.systems.world.activeTeams(s, catId);
      const target = cl((attract - 10 * Math.max(0, diff)) / 100, .05, 1);
      const pick = R.shuffle(teams).map(t => ({ t, w: Math.exp(-Math.pow(t.prestige - target, 2) / (2 * .22 * .22)) })).sort((a, b) => b.w - a.w + R.normal(0, .15)).slice(0, catId === cur.id ? 3 : 2);
      pick.forEach(x => {
        if (catId === 'f1' && cur.id === 'f1' && attract < 18 && R.chance(.7)) return;
        const terms = Con.defaultTerms(s, catId, x.t);
        offers.push({ id: U.uid('o'), teamId: x.t.id, catId, teamName: x.t.name, car: Math.round(x.t.car), terms, base: Object.assign({}, terms), tried: false });
      });
    });

    // academia: jovens de bom nível recebem convite com custos pagos
    if (age <= 17 && cur.level >= 2 && cur.level <= 5 && Con.ger(s) >= cur.mean + 10 && R.chance(p.flags.academy ? .6 : .2)) {
      const catId = cur.level >= 4 ? cur.id : D.nextOptions[cur.id].slice(-1)[0], teams = Game.systems.world.activeTeams(s, catId);
      const t = teams.slice().sort((a, b) => b.prestige - a.prestige)[0];
      const terms = Con.defaultTerms(s, catId, t); terms.salary = 0; terms.years = 2; terms.bTitle = terms.bWin = terms.bPodium = terms.bPoint = 0;
      offers.push({ id: U.uid('o'), teamId: t.id, catId, teamName: t.name, car: Math.round(t.car), terms, base: Object.assign({}, terms), tried: true, academy: R.pick(D.academies) });
    }

    s.fallbackCat = cats[0] || cur.id;
    s.offers = offers.sort((a, b) => C[b.catId].level - C[a.catId].level);
    Con.ensureFallback(s);
  };

  Con.ensureFallback = function (s) {
    const p = s.player;
    if (p.contract || p.catId === 'f1' || s.phase === 'season') return;
    s.offers = s.offers.filter(o => o.note !== 'Vaga de reserva');
    if (s.offers.some(o => Con.canAfford(s, o))) return;
    const catId = s.fallbackCat || p.catId, t = Game.systems.world.activeTeams(s, catId).slice().sort((a, b) => a.prestige - b.prestige)[0];
    const terms = Con.defaultTerms(s, catId, t);
    const afford = p.money + Game.systems.economy.nextSupport(s);
    if (terms.salary < 0 && -terms.salary > afford) terms.salary = -Math.max(0, Math.floor(afford));
    s.offers.push({ id: U.uid('o'), teamId: t.id, catId, teamName: t.name, car: Math.round(t.car), terms, base: Object.assign({}, terms), tried: true, note: 'Vaga de reserva' });
  };

  Con.chance = function (s, offer, nt) {
    const ref = Math.max(Math.abs(offer.base.salary), C[offer.catId].cost * .5, 50000);
    const delta = Con.termsValue(nt, ref) - Con.termsValue(offer.base, ref);
    const tol = ref * (.12 + (s.player.agent ? .06 : 0));
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
    p.contract = Object.assign({ teamId: offer.teamId, catId: offer.catId, teamName: offer.teamName, yearsTotal: offer.terms.years, startYear: s.year }, offer.terms);
    if (offer.academy) { p.academy = offer.academy; Game.systems.news.both(`Você entrou na ${offer.academy}.`, 'good'); }
    s.offers = [];
    Game.systems.news.add(`Contrato assinado com a ${offer.teamName} (${C[offer.catId].short}).`, 'good');
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
