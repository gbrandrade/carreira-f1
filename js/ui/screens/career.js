/* Carreira: gráfico de evolução ano a ano, estatísticas (GPs x Sprints separados), superlicença e linha do tempo. */
(function () {
  const ui = Game.ui, h = ui.h, S = Game.systems;
  ui.screens.career = {
    render() {
      const s = Game.state, p = s.player, st = p.stats;
      const tiles = [
        ['Corridas', st.races],
        ['Vitórias / Pódios', `${st.wins}V · ${st.podiums}P`],
        ['Sprints (V / P)', `${st.sprintWins || 0}V · ${st.sprintPodiums || 0}P`],
        ['Poles', st.poles],
        ['Voltas rápidas', st.fl],
        ['Pontos', st.points],
        ['Títulos', st.titles],
        ['Abandonos', st.dnfs],
        ['Temporadas', st.seasons]
      ];
      const stats = ui.panel({ title: 'Estatísticas' }, h('div', { class: 'tiles' }, tiles.map(([k, v]) => h('div', { class: 'tile', style: { padding: '.55rem .7rem', gap: '.1rem' } }, h('div', { class: 'tiny dim mono' }, k.toUpperCase()), h('div', { style: { fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-.03em' } }, v)))),
        h('div', { class: 'pt', style: { marginTop: '.3rem' } }, 'Pontos de superlicença'), h('div', { class: 'row', style: { flexWrap: 'wrap' } }, p.superPoints.filter(x => x.pts).map(x => ui.badge(`${x.year}: +${x.pts}`, 'acc')), p.superPoints.some(x => x.pts) ? null : h('span', { class: 'small dim' }, 'Ainda sem pontos.')),
        h('div', { class: 'grow' }), h('div', { class: 'row' }, ui.btn('Aposentar', () => ui.confirm('Aposentar?', 'A carreira será encerrada definitivamente.', () => { S.career.retire(); ui.go('ending'); }), 'sm', !S.career.canRetire(), 'flag'), ui.btn('Exportar save', () => Game.core.storage.exportFile(s), 'sm ghost', false, 'download')));

      const chartPanel = ui.panel({
        title: 'Evolução na Carreira (GER & Posição)',
        cls: 'marks',
        right: h('div', { class: 'legend' },
          h('span', null, h('i', { style: { background: 'var(--accent)' } }), 'GER'),
          h('span', null, h('i', { style: { background: 'var(--ok)' } }), 'Posição final')
        )
      }, h('div', { style: { height: '9.5rem', position: 'relative' } }, ui.careerChart(p.history || [])));

      const tl = ui.panel({ title: 'Linha do tempo', cls: 'grow' }, ui.paged('tl', s.timeline.slice().reverse(), 7, items => h('div', { class: 'tl' }, items.map(t => h('div', { class: 'tl-item' }, h('span', { class: 'y' }, `${t.year} · ${t.age}a`), t.text)))));
      const leftCol = h('div', { class: 'col', style: { gap: '.7rem' } }, chartPanel, tl);

      return h('div', { class: 'screen' }, ui.head('Carreira', `${p.name} · ${s.year - Game.config.startYear} ano(s) de estrada`), h('div', { class: 'cols-3-2' }, leftCol, stats));
    }
  };
})();
