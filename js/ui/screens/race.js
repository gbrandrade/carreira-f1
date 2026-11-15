/* Corrida: decisões > simulação (loader) > resultado com resumo, gráfico de posições e tabela. */
(function () {
  const ui = Game.ui, h = ui.h, U = Game.utils, C = Game.data.categories, S = Game.systems;
  ui.race = { choices: { tyre: 1, setup: 'bal', risk: 1 }, week: null, tab: 0, inj: false };
  const PROF = { dw: 'Carga aerodinâmica', pw: 'Retas longas', bal: 'Equilibrado' };
  const pips = (n, total) => h('span', { class: 'pips' }, Array.from({ length: total || 3 }, (_, i) => h('i', { class: i < n ? 'on' : '' })));

  function group(title, key, opts) {
    const c = ui.race.choices;
    return h('div', { class: 'col' }, h('div', { class: 'pt' }, title), h('div', { class: 'opts' }, opts.map(([v, name, sub, pace, risk]) => h('button', { class: 'opt ' + (c[key] === v ? 'on' : ''), onclick: () => { c[key] = v; ui.refresh(); } },
      h('b', null, name), h('span', null, sub), pace != null ? h('div', { class: 'row between' }, h('span', { class: 'pips' }, 'ritmo ', pips(pace)), h('span', { class: 'pips' }, 'risco ', pips(risk))) : null))));
  }

  ui.screens.race = {
    render() {
      const s = Game.state;
      if (s.phase !== 'season' || !s.season) return h('div', { class: 'screen' }, ui.head('Corrida'), ui.panel({ cls: 'grow' }, h('div', { class: 'empty' }, ui.plate('flag', null, true), h('h3', null, 'Nenhuma etapa em andamento'), h('div', null, 'Assine um contrato e inicie a temporada.'), ui.btn('Ir para Contrato', () => ui.go('contract'), 'primary', false, 'doc'))));
      return ui.race.week ? this.result(s) : this.pre(s);
    },
    pre(s) {
      const p = s.player, se = s.season, cal = se.cal[se.round], cat = C[se.catId], r = ui.race, inj = p.injury > 0, cc = cal.circuit;
      const info = ui.panel({ title: `Etapa ${cal.idx + 1} de ${se.cal.length}`, cls: 'marks' }, h('div', { class: 'grow' }, ui.track(cc.id)),
        h('div', { style: { fontSize: '1.5rem', fontWeight: 650, letterSpacing: '-.03em', lineHeight: 1.1 } }, cc.name),
        h('div', { class: 'row' }, ui.ccode(cc.country), ui.badge(`${U.monthOfWeek(cal.week)} ${s.year}`), cal.sprint ? ui.badge('fim de semana de sprint', 'acc') : null, ui.badge(cc.rain + '% de chuva', cc.rain >= 30 ? 'warn' : '')),
        h('div', { class: 'kv3' }, [['Perfil', PROF[cc.prof]], ['Grid importa', cc.q >= 1.5 ? 'Alta' : cc.q >= 1 ? 'Média' : 'Baixa'], ['Formato', cat.races.concat(cal.sprint ? [cat.sprint] : []).length + ' corrida(s)']].map(([k, v]) => h('div', null, h('div', { class: 'k' }, k), h('div', { class: 'v', style: { fontSize: '.78rem' } }, v)))),
        inj ? ui.badge(`Lesionado: ${p.injury} etapa(s)`, 'bad') : null);
      const dec = ui.panel({ title: 'Decisões pré-corrida' },
        group('Estratégia de pneus', 'tyre', [[0, 'Conservadora', 'constância', 1, 1], [1, 'Equilibrada', 'padrão', 2, 2], [2, 'Agressiva', 'rende, mas desgasta', 3, 3]]),
        group('Setup do carro', 'setup', [['dw', 'Carga aero', 'curvas lentas'], ['bal', 'Equilibrado', 'serve em tudo'], ['pw', 'Retas', 'velocidade final']]),
        group('Agressividade', 'risk', [[0, 'Cautelosa', 'poucos riscos', 1, 1], [1, 'Normal', 'equilibrada', 2, 2], [2, 'Agressiva', 'ataca sempre', 3, 3]]),
        inj ? h('div', { class: 'col' }, h('div', { class: 'pt' }, 'Lesão'), ui.tabs([[false, 'Descansar'], [true, 'Correr lesionado']], r.inj, v => { r.inj = v; ui.refresh(); })) : null,
        h('div', { class: 'grow' }), h('div', { class: 'tiny dim' }, 'Setup combinando com o perfil da pista rende ritmo extra. Estratégia e atitude agressivas aumentam o risco de abandono.'));
      const go = () => ui.simulate(['Classificação', 'Largada', 'Corrida', 'Apuração'], () => { r.week = S.career.playRound(Object.assign({}, r.choices, { raceInjured: r.inj })); r.tab = r.week.rest ? 'q' : r.week.results.length - 1; r.inj = false; ui.refresh(); });
      const rest = inj && !r.inj;
      return h('div', { class: 'screen' }, ui.head(cc.name, `${cat.name} · ${s.year}`), h('div', { class: 'cols2' }, info, dec),
        ui.panel({ cls: 'cta' }, h('div', { class: 'msg' }, rest ? 'Você vai perder esta etapa para se recuperar.' : h('span', null, 'Tudo pronto para a ', h('b', null, 'largada'), '.')), ui.btn(rest ? 'Descansar' : 'Largar', go, 'primary lg', false, rest ? 'heart' : 'play')));
    },
    result(s) {
      const r = ui.race, wk = r.week, se = s.season, tabs = [['q', 'Classificação']].concat(wk.results.map((x, i) => [i, x.name]));
      const cur = r.tab === 'q' ? null : wk.results[r.tab], pl = cur && cur.player;
      const nm = id => se.entries[id] || { name: id, country: '', teamName: '' };
      const order = cur ? cur.order : wk.quali.map((id, i) => ({ id, pos: i + 1, pts: null })), me = order.find(o => o.id === 'player');
      const cell = o => h('span', { class: 'row gap-s' }, ui.ccode(nm(o.id).country), nm(o.id).name);
      const rows = order.slice(0, 12).map(o => ({ me: o.id === 'player', cells: [ui.posCell(o.pos), cell(o), nm(o.id).teamName, cur ? (o.dnf ? h('span', { class: 'bad' }, 'DNF') : h('b', null, o.pts)) : ''] }));
      if (me && me.pos > 12) rows.push({ me: true, cells: [ui.posCell(me.pos), cell(me), nm('player').teamName, cur ? (me.dnf ? 'DNF' : h('b', null, me.pts)) : ''] });
      const total = wk.results.reduce((a, x) => a + (x.player ? x.player.pts : 0), 0), qpos = wk.quali.indexOf('player') + 1;
      const hero = h('div', { class: 'statrow' },
        ui.panel({}, ui.stat(cur ? 'Posição final' : 'Largada', pl ? (pl.dnf ? 'DNF' : 'P' + pl.pos) : (qpos ? 'P' + qpos : '—'), pl ? `largou em P${pl.grid}` : 'grid de largada')),
        ui.panel({}, ui.stat('Variação', pl && !pl.dnf ? (pl.grid - pl.pos > 0 ? '+' : '') + (pl.grid - pl.pos) : '—', 'posições ganhas/perdidas')),
        ui.panel({}, ui.stat('Pontos', pl ? '+' + pl.pts : '—', `${total} no fim de semana`)),
        ui.panel({}, h('div', { class: 'col' }, h('div', { class: 'k pt' }, 'Destaques'), h('div', { class: 'row', style: { flexWrap: 'wrap' } }, cur && cur.wet ? ui.badge('chuva', 'info') : null, cur && cur.sc ? ui.badge('safety car', 'warn') : null, pl && pl.pole ? ui.badge('pole', 'acc') : null, pl && pl.fl ? ui.badge('volta mais rápida', 'acc') : null, pl && pl.pen ? ui.badge('punição', 'bad') : null, (!cur || !(cur.wet || cur.sc || (pl && (pl.pole || pl.fl || pl.pen)))) ? h('span', { class: 'small dim' }, 'sem destaques') : null))));
      const left = ui.panel({ title: cur ? `${cur.name}${cur.wet ? ' · chuva' : ''}` : 'Classificação' }, cur ? (pl ? [h('div', { class: 'tl' }, pl.lines.slice(0, 6).map(l => h('div', { class: 'hl' }, l))), h('div', { class: 'grow' }, ui.area(pl.path, pl.n))] : h('div', { class: 'empty' }, 'Você não correu nesta etapa.')) : h('div', { class: 'empty' }, h('h3', null, `Pole: ${nm(wk.quali[0]).name}`), h('div', null, qpos ? `Você largou em ${qpos}º.` : 'Você ficou fora desta etapa.')));
      const next = () => {
        r.week = null; const out = S.career.afterRound();
        const done = () => { ui.renderChrome(); if (se.finished) ui.finishSeason(); else ui.go('hub'); };
        if (out.fired) { ui.modal({ title: 'Você foi dispensado', body: 'A pressão da equipe chegou ao limite e o contrato foi rompido. A temporada será encerrada sem você.', actions: [{ label: 'Continuar', cls: 'primary', fn: () => { S.career.fire(); ui.finishSeason(); } }] }); return; }
        ui.runEvents(out.events, done);
      };
      return h('div', { class: 'screen' }, ui.head(`Resultado · ${wk.circuit.name}`, wk.rest ? 'Você ficou fora desta etapa.' : `${total} pontos no fim de semana`, ui.tabs(tabs, r.tab, t => { r.tab = t; ui.refresh(); })), hero,
        h('div', { class: 'cols-3-2' }, left, ui.panel({ title: wk.circuit.name }, ui.table([{ h: '#', w: '2.4rem' }, { h: 'Piloto' }, { h: 'Equipe' }, { h: 'Pts', cls: 'n', w: '3rem' }], rows))),
        ui.panel({ cls: 'cta' }, h('div', { class: 'msg' }, 'Fim de semana concluído.'), ui.btn('Continuar', next, 'primary lg', false, 'right')));
    }
  };
})();
