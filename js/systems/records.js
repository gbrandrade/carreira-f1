/* Recordes, conquistas e rival histórico. */
(function () {
  const D = Game.data, U = Game.utils;
  const Rec = Game.systems.records = {};
  Rec.achievements = [
    { id: 'win1', name: 'Primeira vitória', desc: 'Vença uma corrida', ok: s => s.player.stats.wins >= 1 },
    { id: 'kartchamp', name: 'Campeão de kart', desc: 'Seja campeão em qualquer categoria de kart', ok: s => s.player.titlesList.some(t => t.startsWith('kart')) },
    { id: 'f4champ', name: 'Campeão de F4', desc: 'Seja campeão de F4', ok: s => s.player.titlesList.some(t => t.startsWith('f4')) },
    { id: 'license', name: 'Superlicença', desc: 'Obtenha a superlicença da FIA', ok: s => !!s.flags.hadLicense },
    { id: 'f2champ', name: 'Campeão de F2', desc: 'Seja campeão da F2', ok: s => s.player.titlesList.includes('f2') },
    { id: 'f1debut', name: 'Estreia na F1', desc: 'Dispute uma corrida de F1', ok: s => s.player.f1.races >= 1 },
    { id: 'f1podium', name: 'Pódio na F1', desc: 'Suba ao pódio na F1', ok: s => s.player.f1.podiums >= 1 },
    { id: 'f1win', name: 'Vitória na F1', desc: 'Vença um GP de F1', ok: s => s.player.f1.wins >= 1 },
    { id: 'f1pole', name: 'Pole na F1', desc: 'Conquiste uma pole na F1', ok: s => s.player.f1.poles >= 1 },
    { id: 'f1champ', name: 'Campeão mundial', desc: 'Seja campeão de F1', ok: s => s.player.f1.titles >= 1 },
    { id: 'seven', name: 'Lenda', desc: 'Seja heptacampeão de F1', ok: s => s.player.f1.titles >= 7 },
    { id: 'rich', name: 'Milionário', desc: 'Acumule US$ 10 milhões', ok: s => s.player.money >= 10e6 },
    { id: 'billion', name: 'Magnata', desc: 'Acumule US$ 100 milhões', ok: s => s.player.money >= 100e6 },
    { id: 'idol', name: 'Ídolo', desc: 'Chegue a 80 de popularidade', ok: s => s.player.popularity >= 80 },
    { id: 'broke', name: 'Falido', desc: 'Declare falência', ok: s => s.player.bankruptcies >= 1 },
    { id: 'young', name: 'Prodígio', desc: 'Estreie na F1 com 18 anos ou menos', ok: s => !!s.flags.prodigy }
  ];
  Rec.check = function (s) {
    Rec.achievements.forEach(a => {
      if (!s.player.ach[a.id] && a.ok(s)) { s.player.ach[a.id] = s.year; Game.systems.news.both(`Conquista: ${a.name}`, 'good'); if (Game.ui.toast) Game.ui.toast(`Conquista: ${a.name}`); }
    });
  };
  // progresso do jogador na F1 contra os recordes reais
  Rec.progress = function (s) {
    const f = s.player.f1, R = D.f1Records;
    return [['titles', f.titles], ['wins', f.wins], ['poles', f.poles], ['podiums', f.podiums], ['fl', f.fl]].map(([k, v]) => ({ key: k, label: R[k].label, value: v, record: R[k].value, holder: R[k].holder }));
  };
  // piloto lendário mais parecido com o perfil de atributos do jogador
  Rec.rival = function (s) {
    const a = Game.systems.attributes.playerPeak(s.player), me = { EXP: Math.min(99, Game.systems.attributes.E(28) + a.EXPb), RAC: a.RAC, ATE: a.ATE, RIT: a.RIT };
    let best = null, bd = 1e9;
    D.cards.filter(c => c.tier === 'lendario' || c.tier === 'prime').forEach(c => {
      const d = Math.pow(c.EXP - me.EXP, 2) * .3 + Math.pow(c.RAC - me.RAC, 2) + Math.pow(c.ATE - me.ATE, 2) + Math.pow(c.RIT - me.RIT, 2);
      if (d < bd) { bd = d; best = c; }
    });
    return best;
  };
})();
