/* Tabela de pilotos com cores oficiais das equipes e comparativo radar interativo (você x rival). */
(function () {
  const ui = Game.ui, h = ui.h, D = Game.data, S = Game.systems, A = S.attributes, C = D.categories;
  ui.drvCat = null;
  ui.drvSel = null;
  const AX = [{ label: 'RIT' }, { label: 'RAC' }, { label: 'ATE' }, { label: 'EXP' }];
  const tint = v => h('span', { class: v >= 90 ? 'ok' : v >= 80 ? '' : 'dim', style: { fontWeight: v >= 90 ? 600 : 400 } }, Math.round(v));

  ui.screens.drivers = {
    render() {
      const s = Game.state, p = s.player, catId = ui.drvCat || p.catId;
      const entries = S.world.entries(s, catId, p.catId === catId).sort((a, b) => b.attrs.GER - a.attrs.GER), teams = s.world.teams[catId];
      const tn = id => (teams.find(t => t.id === id) || {}).name || '-';

      if (!ui.drvSel || !entries.some(e => e.id === ui.drvSel)) {
        const defaultPick = entries.find(e => !e.isPlayer) || entries[0];
        ui.drvSel = defaultPick ? defaultPick.id : null;
      }
      const picked = entries.find(e => e.id === ui.drvSel) || entries[0];
      const myNow = A.playerAttrs(p, s.year);

      const nameCell = e => h('span', { class: 'row gap-s' },
        e.name,
        (catId === 'f1' && e.titles > 0) ? ui.badge(`${e.titles}x`, 'acc') : null
      );

      const rows = entries.map((e, i) => ({
        me: e.isPlayer,
        pick: true,
        sel: picked && e.id === picked.id,
        onclick: () => { ui.drvSel = e.id; ui.refresh(); },
        cells: [
          ui.posCell(i + 1),
          nameCell(e),
          ui.ccode(e.country),
          ui.teamChip(tn(e.teamId), e.teamId, catId),
          ui.rate(e.attrs.GER),
          tint(e.attrs.EXP),
          tint(e.attrs.RAC),
          tint(e.attrs.ATE),
          tint(e.attrs.RIT)
        ]
      }));

      const tableEl = h('table', null,
        h('thead', null, h('tr', null, [
          { h: '#', w: '2.4rem' }, { h: 'Piloto' }, { h: 'País', w: '3.4rem' }, { h: 'Equipe' },
          { h: 'GER', cls: 'n', w: '3.2rem' }, { h: 'EXP', cls: 'n', w: '2.8rem' }, { h: 'RAC', cls: 'n', w: '2.8rem' }, { h: 'ATE', cls: 'n', w: '2.8rem' }, { h: 'RIT', cls: 'n', w: '2.8rem' }
        ].map(c => h('th', { class: c.cls || '', style: c.w ? { width: c.w } : null }, c.h)))),
        h('tbody', null, rows.map(r => h('tr', {
          class: (r.me ? 'me ' : '') + 'pick' + (r.sel ? ' sel' : ''),
          onclick: r.onclick
        }, r.cells.map((c, idx) => h('td', { class: idx >= 4 ? 'n' : '' }, c)))))
      );

      // Paging wrapper for table rows
      const per = 12;
      const pages = Math.max(1, Math.ceil(rows.length / per));
      const pgIdx = Math.min(ui.pg.drv || 0, pages - 1);
      ui.pg.drv = pgIdx;
      const pageRows = rows.slice(pgIdx * per, pgIdx * per + per);
      tableEl.querySelector('tbody').innerHTML = '';
      pageRows.forEach(r => tableEl.querySelector('tbody').append(
        h('tr', { class: (r.me ? 'me ' : '') + 'pick' + (r.sel ? ' sel' : ''), onclick: r.onclick },
          r.cells.map((c, idx) => h('td', { class: idx >= 4 ? 'n' : '' }, c))
        )
      ));

      const leftPanel = ui.panel({ cls: 'grow' },
        h('div', { class: 'col grow', style: { justifyContent: 'space-between' } },
          h('div', { class: 'col' }, tableEl),
          pages > 1 ? h('div', { class: 'pager' },
            ui.btn('', () => { ui.pg.drv = Math.max(0, pgIdx - 1); ui.refresh(); }, 'sm icon ghost', pgIdx === 0, 'left'),
            `${pgIdx + 1} / ${pages}`,
            ui.btn('', () => { ui.pg.drv = Math.min(pages - 1, pgIdx + 1); ui.refresh(); }, 'sm icon ghost', pgIdx === pages - 1, 'right')
          ) : null
        )
      );

      const drvObj = picked && !picked.isPlayer ? S.world.driver(s, picked.id) : null;
      const age = drvObj ? (s.year - drvObj.birth) : (picked && picked.isPlayer ? (s.year - p.birth) : null);

      const comparePanel = picked
        ? ui.panel({ title: 'Comparativo de telemetria', cls: 'marks', right: ui.rate(picked.attrs.GER) },
            h('div', null,
              h('div', { style: { fontSize: '1.25rem', fontWeight: 650, letterSpacing: '-.02em' } }, picked.name),
              h('div', { class: 'row', style: { marginTop: '.25rem', flexWrap: 'wrap' } },
                ui.ccode(picked.country),
                age ? ui.badge(`${age} anos`) : null,
                (catId === 'f1' && picked.titles > 0) ? ui.badge(`${picked.titles}x campeão F1`, 'acc') : null
              ),
              h('div', { style: { marginTop: '.35rem' } }, ui.teamChip(tn(picked.teamId), picked.teamId, catId))
            ),
            h('div', { class: 'legend', style: { marginTop: '.2rem' } },
              h('span', null, h('i', { style: { background: 'var(--accent)' } }), 'você'),
              !picked.isPlayer ? h('span', null, h('i', { style: { border: '1px dashed var(--text-2)' } }), picked.name.split(' ').slice(-1)[0]) : null
            ),
            h('div', { class: 'grow' },
              ui.radar(AX, picked.isPlayer
                ? [{ values: [myNow.RIT, myNow.RAC, myNow.ATE, myNow.EXP] }]
                : [
                    { values: [picked.attrs.RIT, picked.attrs.RAC, picked.attrs.ATE, picked.attrs.EXP], color: 'var(--text-2)', dashed: true },
                    { values: [myNow.RIT, myNow.RAC, myNow.ATE, myNow.EXP] }
                  ], { min: 25 })
            ),
            h('div', { class: 'row between' }, ['RIT', 'RAC', 'ATE', 'EXP'].map(k => {
              const mineV = Math.round(myNow[k]);
              const rivalV = Math.round(picked.attrs[k]);
              const diff = mineV - rivalV;
              return h('div', { class: 'col gap-s center' },
                h('span', { class: 'tiny dim mono' }, k),
                h('b', { class: 'mono' }, rivalV),
                !picked.isPlayer
                  ? h('span', { class: 'tiny mono ' + (diff > 0 ? 'ok' : diff < 0 ? 'bad' : 'dim') }, diff > 0 ? `+${diff}` : `${diff}`)
                  : null
              );
            }))
          )
        : ui.panel({ title: 'Comparativo' }, h('div', { class: 'empty' }, 'Selecione um piloto na tabela.'));

      const sel = h('select', { onchange: e => { ui.drvCat = e.target.value; ui.pg.drv = 0; ui.drvSel = null; ui.refresh(); } }, D.ladder.map(id => h('option', { value: id, selected: id === catId ? 'selected' : null }, C[id].name)));
      return h('div', { class: 'screen' }, ui.head('Pilotos', `${C[catId].name} · ${entries.length} pilotos · clique para comparar`, sel), h('div', { class: 'cols-3-2' }, leftPanel, comparePanel));
    }
  };
})();
