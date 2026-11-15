/* Temporada: classificação de pilotos e equipes, calendário e gráfico de pontos. */
(function () {
  const ui = Game.ui, h = ui.h, U = Game.utils, C = Game.data.categories, S = Game.systems;
  ui.seasonTab = 'pilotos';
  ui.screens.season = {
    render() {
      const s = Game.state, se = s.season;
      if (!se) return h('div', { class: 'screen' }, ui.head('Temporada'), ui.panel({ cls: 'grow' }, h('div', { class: 'empty' }, ui.plate('calendar', null, true), h('h3', null, 'A temporada ainda não começou'), h('div', null, 'Assine um contrato e inicie o ano.'), ui.btn('Ir para Contrato', () => ui.go('contract'), 'primary', false, 'doc'))));
      const tab = ui.seasonTab, cat = C[se.catId], r = S.race.ranked(se), me = r.find(x => x.id === 'player');
      const nm = x => h('span', { class: 'row gap-s' }, ui.ccode(x.country), x.name);
      let body;
      if (tab === 'pilotos') {
        const top = r.slice(0, 12), rows = top.map(x => ({ me: x.id === 'player', cells: [ui.posCell(x.pos), nm(x), x.teamName, h('b', null, x.pts), x.wins, x.podiums] }));
        if (me && me.pos > 12) rows.push({ me: true, cells: [ui.posCell(me.pos), nm(me), me.teamName, h('b', null, me.pts), me.wins, me.podiums] });
        body = ui.table([{ h: '#', w: '2.4rem' }, { h: 'Piloto' }, { h: 'Equipe' }, { h: 'Pts', cls: 'n', w: '3.2rem' }, { h: 'V', cls: 'n', w: '2.2rem' }, { h: 'P', cls: 'n', w: '2.2rem' }], rows);
      } else if (tab === 'equipes') {
        const teams = Object.keys(se.standings.teams).map(id => ({ id, pts: se.standings.teams[id], name: (S.world.team(s, se.catId, id) || {}).name || id })).sort((a, b) => b.pts - a.pts);
        body = ui.table([{ h: '#', w: '2.4rem' }, { h: 'Equipe' }, { h: 'Pts', cls: 'n', w: '3.5rem' }], teams.slice(0, 13).map((t, i) => ({ me: t.id === s.player.teamId, cells: [ui.posCell(i + 1), t.name, h('b', null, t.pts)] })));
      } else body = ui.paged('cal', se.cal, 10, items => ui.table([{ h: '#', w: '2.4rem' }, { h: 'Mês', w: '3.6rem' }, { h: 'Circuito' }, { h: 'Situação', w: '6.5rem' }],
        items.map(c => ({ me: c.idx === se.round && !se.finished, cells: [c.idx + 1, U.monthOfWeek(c.week), h('span', null, c.circuit.name, c.sprint ? ui.badge('sprint', 'acc') : null), c.idx < se.round ? ui.badge('disputada', 'ok') : c.idx === se.round ? ui.badge('próxima', 'acc') : h('span', { class: 'dim' }, '—')] }))));
      const lead = r[0], top8 = r.slice(0, 8);
      const right = h('div', { class: 'col', style: { gap: '.7rem' } },
        ui.panel({ title: 'Você no campeonato', cls: 'marks' }, h('div', { class: 'row between' }, h('div', null, h('div', { style: { fontSize: '2.4rem', fontWeight: 700, letterSpacing: '-.04em', lineHeight: 1 } }, me ? me.pos + 'º' : '—'), h('div', { class: 'small mut' }, me ? `${me.pts} pontos` : '')), h('div', { class: 'col', style: { alignItems: 'flex-end' } }, h('span', { class: 'tiny dim mono' }, 'DIFERENÇA P/ LÍDER'), h('b', { class: 'mono' }, me && lead ? `-${lead.pts - me.pts}` : '—'))),
          h('div', { class: 'row' }, ui.badge(`Etapa ${Math.min(se.round + 1, se.cal.length)}/${se.cal.length}`), me ? ui.badge(`${me.wins} vitórias`) : null, me ? ui.badge(`${me.podiums} pódios`) : null)),
        ui.panel({ title: 'Pontos (top 8)', cls: 'grow' }, ui.hbars(top8.map(x => ({ label: x.name, value: x.pts, me: x.id === 'player' })), { max: Math.max(1, lead ? lead.pts : 1) })));
      return h('div', { class: 'screen' }, ui.head(`${cat.name} ${se.year}`, `${se.cal.length} etapas · ${Object.keys(se.entries).length} pilotos`, ui.tabs([['pilotos', 'Pilotos'], ['equipes', 'Equipes'], ['cal', 'Calendário']], tab, t => { ui.seasonTab = t; ui.refresh(); })),
        h('div', { class: 'cols-3-2' }, ui.panel({ cls: 'grow' }, body), right));
    }
  };
})();
