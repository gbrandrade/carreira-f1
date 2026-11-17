/* Recordes reais, rival histórico e conquistas. */
(function () {
  const ui = Game.ui, h = ui.h, S = Game.systems, A = S.attributes;
  const AX = [{ label: 'RIT' }, { label: 'RAC' }, { label: 'ATE' }, { label: 'EXP' }];
  ui.screens.records = {
    render() {
      const s = Game.state, p = s.player, prog = S.records.progress(s), rv = S.records.rival(s), pk = A.playerPeak(p);
      const me = [pk.RIT, pk.RAC, pk.ATE, Math.min(99, A.E(28) + pk.EXPb)];
      const rings = h('div', { class: 'ringrow' }, prog.map(r => h('div', { class: 'ringcell' }, ui.ring(r.value, r.record, { size: 64, fs: 22, text: r.value }), h('div', { class: 'tiny' }, r.label), h('div', { class: 'tiny dim mono' }, `rec. ${r.record}`))));
      const left = ui.panel({ title: 'Recordes da F1 (você x histórico)', cls: 'marks' }, rings,
        h('div', { class: 'row between small' }, h('span', { class: 'mut' }, 'Mais jovem campeão (recorde 23)'), ui.badge(p.f1.firstTitleAge ? p.f1.firstTitleAge + ' anos' : '—')),
        h('div', { class: 'row between small' }, h('span', { class: 'mut' }, 'Mais jovem vencedor (recorde 18)'), ui.badge(p.f1.firstWinAge ? p.f1.firstWinAge + ' anos' : '—')),
        rv ? h('div', { class: 'rivalbox' }, h('div', { class: 'chartcell' }, ui.radar(AX, [{ values: [rv.RIT, rv.RAC, rv.ATE, rv.EXP], color: 'var(--text-2)', dashed: true }, { values: me }], { min: 40 })),
          h('div', { class: 'col gap-s' }, h('span', { class: 'pt' }, 'Seu rival histórico'), h('b', { style: { fontSize: '1.1rem' } }, rv.name), h('div', { class: 'tiny mut' }, `Perfil de atributos mais parecido com o seu (GER ${rv.GER}).`))) : null);
      const ach = S.records.achievements, got = Object.keys(p.ach).length;
      const right = ui.panel({ title: `Conquistas · ${got}/${ach.length}` }, h('div', { class: 'achgrid' }, ach.map(a => h('div', { class: 'ach ' + (p.ach[a.id] ? 'on' : 'lock') }, ui.plate(p.ach[a.id] ? 'trophy' : 'lock', p.ach[a.id] ? 'var(--gold)' : null), h('div', { class: 'grow' }, h('b', { class: 'small' }, a.name), h('div', { class: 'tiny mut' }, a.desc)), p.ach[a.id] ? h('span', { class: 'tiny mono dim' }, p.ach[a.id]) : null))));
      return h('div', { class: 'screen' }, ui.head('Recordes e conquistas', 'Seu progresso na F1 contra os recordes reais'), h('div', { class: 'cols-3-2' }, left, right));
    }
  };
})();
