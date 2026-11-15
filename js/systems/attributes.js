/* Atributos e fórmula de GER. Cada piloto tem um 'peak' (valor no auge). A nota atual depende da idade:
   jovens ainda crescem (até ~27), veteranos caem depois dos ~34. EXP segue uma curva própria. */
(function () {
  const cl = Game.utils.clamp;
  const A = Game.systems.attributes = {
    young: a => Math.max(0, 27 - a) * 1.1,
    old: (a, k) => Math.max(0, a - 34) * k,
    E: a => 99 - 74 * Math.exp(-(a - 12) / 10),
    atAge(peak, age) {
      return {
        RIT: cl(peak.RIT - A.young(age) - A.old(age, .8), 20, 99),
        RAC: cl(peak.RAC - A.young(age) - A.old(age, .5), 20, 99),
        ATE: cl(peak.ATE - A.young(age) - A.old(age, .2), 20, 99),
        EXP: cl(A.E(age) + peak.EXPb, 15, 99)
      };
    },
    peakFrom(v, age) {
      return { RIT: Math.min(99, v.RIT + A.young(age) + A.old(age, .8)), RAC: Math.min(99, v.RAC + A.young(age) + A.old(age, .5)),
        ATE: Math.min(99, v.ATE + A.young(age) + A.old(age, .2)), EXPb: v.EXP - A.E(age) };
    },
    ger(a) { const w = Game.config.weights; return Math.round(w.EXP * a.EXP + w.RAC * a.RAC + w.ATE * a.ATE + w.RIT * a.RIT); },
    driverAttrs(d, year) { const a = A.atAge(d.peak, year - d.birth); a.GER = A.ger(a); return a; },
    // teto do jogador = atributos escolhidos + sorte + treino acumulado
    playerPeak(p) {
      const t = Math.min(p.train || 0, Game.config.trainCap) * 0.5;
      const f = k => Math.min(99, p.picks[k] + p.luck[k] + t);
      return { RIT: f('RIT'), RAC: f('RAC'), ATE: f('ATE'), EXPb: p.picks.EXP + p.luck.EXP - A.E(28) };
    },
    playerAttrs(p, year, opts) {
      const a = A.atAge(A.playerPeak(p), year - p.birth);
      if (p.phys < 40) a.RIT -= (40 - p.phys) / 8;
      if (p.mental < 40) a.ATE -= (40 - p.mental) / 8;
      if (opts && opts.injured) a.RIT -= 5;
      a.GER = A.ger(a);
      return a;
    },
    // teto (GER máximo) calculado a partir do que o jogador escolheu
    playerCapGer(p) { const pk = A.playerPeak(p); return A.ger({ EXP: Math.min(99, A.E(28) + pk.EXPb), RAC: pk.RAC, ATE: pk.ATE, RIT: pk.RIT }); },
    projected(picks) { return A.ger({ EXP: picks.EXP || 0, RAC: picks.RAC || 0, ATE: picks.ATE || 0, RIT: picks.RIT || 0 }); }
  };
})();
