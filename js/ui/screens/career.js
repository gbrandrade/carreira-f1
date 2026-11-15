/* Carreira: estatísticas, superlicença e linha do tempo. */
(function () {
  const ui = Game.ui, h = ui.h, S = Game.systems;
  ui.screens.career = {
    render() {
      const s = Game.state, p = s.player, st = p.stats;
      const tiles = [['Corridas', st.races], ['Vitórias', st.wins], ['Pódios', st.podiums], ['Poles', st.poles], ['Voltas rápidas', st.fl], ['Pontos', st.points], ['Títulos', st.titles], ['Abandonos', st.dnfs], ['Temporadas', st.seasons]];
      const stats = ui.panel({ title: 'Estatísticas' }, h('div', { class: 'tiles' }, tiles.map(([k, v]) => h('div', { class: 'tile', style: { padding: '.55rem .7rem', gap: '.1rem' } }, h('div', { class: 'tiny dim mono' }, k.toUpperCase()), h('div', { style: { fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-.03em' } }, v)))),
        h('div', { class: 'pt', style: { marginTop: '.3rem' } }, 'Pontos de superlicença'), h('div', { class: 'row', style: { flexWrap: 'wrap' } }, p.superPoints.filter(x => x.pts).map(x => ui.badge(`${x.year}: +${x.pts}`, 'acc')), p.superPoints.some(x => x.pts) ? null : h('span', { class: 'small dim' }, 'Ainda sem pontos.')),
        h('div', { class: 'grow' }), h('div', { class: 'row' }, ui.btn('Aposentar', () => ui.confirm('Aposentar?', 'A carreira será encerrada definitivamente.', () => { S.career.retire(); ui.go('ending'); }), 'sm', !S.career.canRetire(), 'flag'), ui.btn('Exportar save', () => Game.core.storage.exportFile(s), 'sm ghost', false, 'download')));
      const tl = ui.panel({ title: 'Linha do tempo' }, ui.paged('tl', s.timeline.slice().reverse(), 10, items => h('div', { class: 'tl' }, items.map(t => h('div', { class: 'tl-item' }, h('span', { class: 'y' }, `${t.year} · ${t.age}a`), t.text)))));
      return h('div', { class: 'screen' }, ui.head('Carreira', `${p.name} · ${s.year - Game.config.startYear} ano(s) de estrada`), h('div', { class: 'cols-3-2' }, tl, stats));
    }
  };
})();
