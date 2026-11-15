/* Calendários. F1: base de 24 corridas com variação por ano (seed fixa pelo ano). F2/F3 acompanham a F1. */
(function () {
  const D = Game.data, C = D.categories, cfg = Game.config;
  const mk = (circuit, i, total, sprint) => ({ idx: i, circuit, sprint: !!sprint, week: Math.round(4 + i * (44 / Math.max(1, total - 1))) });

  function f1Ids(year) {
    const r = Game.rng.seeded(year * 7919 + 13);
    let list = D.f1Base.slice();
    const swaps = 1 + Math.floor(r() * 3);
    for (let i = 0; i < swaps && year !== cfg.dataYear; i++) {
      const cand = list.filter(id => !D.f1Iconic.includes(id)), res = D.f1Reserve.filter(id => !list.includes(id));
      if (!res.length) break;
      list[list.indexOf(cand[Math.floor(r() * cand.length)])] = res[Math.floor(r() * res.length)];
    }
    const count = year === cfg.dataYear ? 24 : 22 + Math.floor(r() * 3);
    while (list.length > count) { const cand = list.filter(id => !D.f1Iconic.includes(id)); list.splice(list.indexOf(cand[Math.floor(r() * cand.length)]), 1); }
    return list;
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
        const ids = f1Ids(year), n = c.rounds;
        return Array.from({ length: n }, (_, i) => mk(D.circuits[ids[Math.floor(i * ids.length / n)]], i, n, false));
      }
      const set = D.circuitSets[catId];
      return Array.from({ length: c.rounds }, (_, i) => mk(set[i % set.length], i, c.rounds, false));
    }
  };
})();
