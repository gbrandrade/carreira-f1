/* Patrimônio: bens, investimentos, patrocínios e residência. */
(function () {
  const ui = Game.ui, h = ui.h, U = Game.utils, D = Game.data, S = Game.systems, E = S.economy, M = U.fmtMoney;
  ui.assetsTab = 'bens';
  const say = r => { if (r.msg) ui.toast(r.msg); ui.refresh(); };
  const TYPE = { Casa: ['house', 'var(--info)'], Carro: ['car', 'var(--warn)'], Iate: ['boat', 'var(--accent)'], Simulador: ['sim', 'var(--ok)'], Equipe: ['users', 'var(--gold)'] };

  function bens(s) {
    return ui.paged('assets', D.assets, 6, items => [h('div', { class: 'tiles' }, items.map(d => {
      const o = E.owned(s, d.id), [ic, col] = TYPE[d.type];
      return h('div', { class: 'tile' }, h('div', { class: 'row between' }, ui.plate(ic, col), o && !d.staff ? h('span', { class: 'lvdots' }, [1, 2, 3].map(i => h('i', { class: i <= o.lv ? 'on' : '' }))) : o ? ui.badge('ativo', 'ok') : null),
        h('div', null, h('h4', null, d.name), h('div', { class: 'tiny mut' }, d.desc)), h('div', { class: 'tiny mono dim' }, d.staff ? `${M(d.upkeep)}/ano` : `${M(d.price)} · manut. ${M(d.upkeep)}/ano`),
        h('div', { class: 'row', style: { flexWrap: 'wrap' } }, !o ? ui.btn(d.staff ? 'Contratar' : 'Comprar', () => say(E.buy(s, d.id)), 'sm primary', s.player.money < d.price) : [
          (!d.staff && o.lv < 3) ? ui.btn(`Melhorar ${M(E.upgradeCost(d, o.lv))}`, () => say(E.upgrade(s, d.id)), 'sm') : null, ui.btn(d.staff ? 'Dispensar' : 'Vender', () => say(E.sell(s, d.id)), 'sm ghost')]));
    }))]);
  }
  function invest(s) {
    const total = U.sum(s.player.invest.map(i => i.amount));
    return h('div', { class: 'col', style: { gap: '.6rem' } }, D.investments.map(d => { const i = s.player.invest.find(x => x.id === d.id), amt = i ? i.amount : 0;
      return h('div', { class: 'tile', style: { flexDirection: 'row', alignItems: 'center', gap: '.8rem' } }, ui.plate('trend', 'var(--ok)', true), h('div', { class: 'grow' }, h('h4', null, d.name), h('div', { class: 'tiny mut' }, `${d.desc} · retorno médio ${Math.round(d.mean * 100)}% a.a.`), ui.bar('Alocado', total ? amt / total * 100 : 0, { auto: false, text: M(amt) })),
        h('div', { class: 'row' }, [50000, 250000, 1000000].map(v => ui.btn('+' + M(v), () => say(E.invest(s, d.id, v)), 'sm', s.player.money < v)), ui.btn('Resgatar', () => say(E.withdraw(s, d.id)), 'sm ghost', !amt)));
    }), h('div', { class: 'tiny dim' }, 'O retorno é calculado no fim de cada temporada.'));
  }
  function spons(s) {
    const p = s.player, mine = p.sponsors.map(x => D.sponsors.find(y => y.id === x.id)), offers = (s.sponsorOffers || []).map(id => D.sponsors.find(y => y.id === id));
    const goal = sp => D.goalText[sp.goal.k](sp.goal.n);
    const row = (sp, act) => h('div', { class: 'tile', style: { flexDirection: 'row', alignItems: 'center', gap: '.7rem', padding: '.5rem .7rem' } }, ui.avatar(sp.name), h('div', { class: 'grow' }, h('b', null, sp.name), h('div', { class: 'tiny mut' }, `${M(E.sponsorPay(s, sp))}/ano · meta: ${goal(sp)}`)), act);
    return h('div', { class: 'cols2' }, h('div', { class: 'col' }, h('div', { class: 'pt' }, `Ativos (${mine.length}/4)`), mine.length ? mine.map(sp => row(sp, ui.btn('Encerrar', () => { E.dropSponsor(s, sp.id); ui.refresh(); }, 'sm ghost'))) : h('div', { class: 'tiny dim' }, 'Nenhum patrocinador ativo.')),
      h('div', { class: 'col' }, h('div', { class: 'pt' }, 'Propostas'), offers.length ? offers.map(sp => row(sp, ui.btn('Assinar', () => say(E.signSponsor(s, sp.id)), 'sm primary'))) : h('div', { class: 'tiny dim' }, 'Sem propostas agora.')));
  }
  function resid(s) {
    return h('div', { class: 'tiles' }, D.residences.map(r => h('div', { class: 'tile' }, ui.plate('house', 'var(--info)'), h('h4', null, r.name), h('div', { class: 'row' }, ui.badge('imposto ' + Math.round(r.tax * 100) + '%'), ui.badge('fãs ' + (r.fans >= 0 ? '+' : '') + r.fans, r.fans < 0 ? 'warn' : '')),
      s.player.residence === r.id ? ui.badge('residência atual', 'ok') : ui.btn('Mudar (US$ 100 mil)', () => say(E.move(s, r.id)), 'sm'))));
  }

  ui.screens.assets = {
    render() {
      const s = Game.state, p = s.player, tab = ui.assetsTab;
      const body = tab === 'bens' ? bens(s) : tab === 'inv' ? invest(s) : tab === 'spo' ? spons(s) : resid(s);
      return h('div', { class: 'screen' }, ui.head('Patrimônio', `Caixa ${M(p.money)} · manutenção ${M(E.upkeep(s))}/ano`, ui.tabs([['bens', 'Bens'], ['inv', 'Investimentos'], ['spo', 'Patrocínios'], ['res', 'Residência']], tab, t => { ui.assetsTab = t; ui.refresh(); })),
        ui.panel({ cls: 'grow' }, body));
    }
  };
})();
