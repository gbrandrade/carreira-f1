/* Regras de superlicença da FIA aplicadas ao jogador (40 pontos em 3 anos, idade 18, 2 temporadas de monoposto). */
(function () {
  const C = Game.data.categories;
  const S = Game.systems.superlicense = {
    pointsFor(catId, pos) { return (C[catId].sl && C[catId].sl[pos - 1]) || 0; },
    status(p, year) {
      const cfg = Game.config.superlicense;
      const kart = Math.min(cfg.kartMax, p.superPoints.filter(x => x.catId.startsWith('kart') && year - x.year <= cfg.kartValidYears).reduce((s, x) => s + x.pts, 0));
      const other = p.superPoints.filter(x => !x.catId.startsWith('kart') && year - x.year <= cfg.windowYears).reduce((s, x) => s + x.pts, 0);
      const total = kart + other, age = year - p.birth;
      const ageOk = age >= Game.config.f1MinAge || (age === 17 && !!(p.flags && p.flags.f1Waiver));
      const seasonsOk = p.singleSeaterSeasons >= cfg.minSeasons;
      return { total, need: cfg.points, age, ageOk, seasonsOk, eligible: total >= cfg.points && ageOk && seasonsOk };
    }
  };
})();
