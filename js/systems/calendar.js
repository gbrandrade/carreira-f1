/* Calendários. F1: 24 corridas (2026 e 2027+ realistas). F2 (14) e F3 (10) coincidem com as etapas europeias/asiáticas oficiais da F1. */
(function () {
  const D = Game.data, C = D.categories, cfg = Game.config;
  const mk = (circuit, i, total, sprint) => ({ idx: i, circuit, sprint: !!sprint, week: Math.round(4 + i * (44 / Math.max(1, total - 1))) });

  function f1Ids(year) {
    if (year === cfg.dataYear) return D.f1Base.slice();
    if (year === 2027 && D.f12027) return D.f12027.slice();

    const r = Game.rng.seeded(year * 7919 + 13);
    let list = (year > 2027 && D.f12027 ? D.f12027 : D.f1Base).slice();
    const swaps = 1 + Math.floor(r() * 3);
    for (let i = 0; i < swaps; i++) {
      const cand = list.filter(id => !D.f1Iconic.includes(id));
      const res = D.f1Reserve.filter(id => !list.includes(id));
      if (!cand.length || !res.length) break;
      list[list.indexOf(cand[Math.floor(r() * cand.length)])] = res[Math.floor(r() * res.length)];
    }
    return list.slice(0, 24);
  }

  Game.systems.calendar = {
    build(catId, year) {
      const c = C[catId];
      if (catId === 'f1') {
        const ids = f1Ids(year), n = cfg.sprintsByYear[year] || cfg.sprintsByYear.default;
        const sprints = D.sprintOrder.filter(id => ids.includes(id)).slice(0, n);
        return ids.map((id, i) => mk(D.circuits[id], i, ids.length, sprints.includes(id)));
      }
      if (catId === 'f2' || catId === 'f3') {
        const f1List = f1Ids(year);
        const allowed = catId === 'f2' ? D.f2Tracks : D.f3Tracks;
        // Mantém exatamente as pistas da F1 daquele ano que coincidem com F2 / F3
        let shared = f1List.filter(id => allowed.includes(id));
        // Completa até c.rounds se alguma etapa de rotação tiver substituído uma pista clássica
        if (shared.length < c.rounds) {
          allowed.forEach(id => {
            if (shared.length < c.rounds && !shared.includes(id)) shared.push(id);
          });
        }
        shared = shared.slice(0, c.rounds);
        return shared.map((id, i) => mk(D.circuits[id], i, shared.length, false));
      }
      const set = D.circuitSets[catId];
      return Array.from({ length: c.rounds }, (_, i) => mk(set[i % set.length], i, c.rounds, false));
    }
  };
})();
