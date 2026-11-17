/* Tabela de pilotos no estilo do jogo oficial (GER, EXP, RAC, ATE, RIT e Títulos). */
(function () {
  const ui = Game.ui, h = ui.h, D = Game.data, S = Game.systems, C = D.categories;
  ui.drvCat = null;
  const tint = v => h('span', { class: v >= 90 ? 'ok' : v >= 80 ? '' : 'dim', style: { fontWeight: v >= 90 ? 600 : 400 } }, Math.round(v));

  ui.screens.drivers = {
    render() {
      const s = Game.state, p = s.player, catId = ui.drvCat || p.catId;
      const entries = S.world.entries(s, catId, p.catId === catId).sort((a, b) => b.attrs.GER - a.attrs.GER), teams = s.world.teams[catId];
      const tn = id => (teams.find(t => t.id === id) || {}).name || '-';
      const nameCell = e => h('span', { class: 'row gap-s' },
        e.name,
        (catId === 'f1' && e.titles > 0) ? ui.badge(`${e.titles}x`, 'acc') : null
      );
      const rows = entries.map((e, i) => ({
        me: e.isPlayer,
        cells: [ui.posCell(i + 1), nameCell(e), ui.ccode(e.country), tn(e.teamId), ui.rate(e.attrs.GER), tint(e.attrs.EXP), tint(e.attrs.RAC), tint(e.attrs.ATE), tint(e.attrs.RIT)]
      }));
      const cols = [
        { h: '#', w: '2.6rem' }, { h: 'Piloto' }, { h: 'País', w: '3.6rem' }, { h: 'Equipe' },
        { h: 'GER', cls: 'n', w: '3.4rem' }, { h: 'EXP', cls: 'n', w: '3rem' }, { h: 'RAC', cls: 'n', w: '3rem' }, { h: 'ATE', cls: 'n', w: '3rem' }, { h: 'RIT', cls: 'n', w: '3rem' }
      ];
      const sel = h('select', { onchange: e => { ui.drvCat = e.target.value; ui.pg.drv = 0; ui.refresh(); } }, D.ladder.map(id => h('option', { value: id, selected: id === catId ? 'selected' : null }, C[id].name)));
      return h('div', { class: 'screen' }, ui.head('Pilotos', `${C[catId].name} · ${entries.length} pilotos`, sel), ui.panel({ cls: 'grow' }, ui.paged('drv', rows, 12, items => ui.table(cols, items))));
    }
  };
})();
