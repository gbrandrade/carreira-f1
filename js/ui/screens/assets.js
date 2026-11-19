/* Patrimônio: bens (com desbloqueio por progressão), investimentos, patrocínios (com negociação) e residência. */
(function () {
  const ui = Game.ui, h = ui.h, U = Game.utils, D = Game.data, S = Game.systems, E = S.economy, M = U.fmtMoney;
  ui.assetsTab = 'bens';
  const say = r => { if (r.msg) ui.toast(r.msg); ui.refresh(); };
  const TYPE = { Casa: ['house', 'var(--info)'], Carro: ['car', 'var(--warn)'], Iate: ['boat', 'var(--accent)'], Simulador: ['sim', 'var(--ok)'], Equipe: ['users', 'var(--gold)'] };

  const catNameForLv = lv => {
    const found = Object.values(D.categories).find(c => c.level === lv);
    return found ? found.short : 'categorias superiores';
  };

  function bens(s) {
    const curLv = D.categories[s.player.catId].level;
    return ui.paged('assets', D.assets, 6, items => [h('div', { class: 'tiles' }, items.map(d => {
      const o = E.owned(s, d.id), [ic, col] = TYPE[d.type];
      const locked = !o && (d.minLv || 0) > curLv;
      return h('div', { class: 'tile', style: locked ? { opacity: .55 } : null },
        h('div', { class: 'row between' },
          ui.plate(locked ? 'lock' : ic, locked ? null : col),
          locked
            ? ui.badge(`Nível ${catNameForLv(d.minLv)}`)
            : o && !d.staff
              ? h('span', { class: 'lvdots' }, [1, 2, 3].map(i => h('i', { class: i <= o.lv ? 'on' : '' })))
              : o ? ui.badge('ativo', 'ok') : null
        ),
        h('div', null, h('h4', null, d.name), h('div', { class: 'tiny mut' }, d.desc)),
        h('div', { class: 'tiny mono dim' }, d.staff ? `${M(d.upkeep)}/ano` : `${M(d.price)} · manut. ${M(d.upkeep)}/ano`),
        h('div', { class: 'row', style: { flexWrap: 'wrap' } },
          locked
            ? h('span', { class: 'tiny dim' }, `Disponível ao alcançar ${catNameForLv(d.minLv)}`)
            : !o
              ? ui.btn(d.staff ? 'Contratar' : 'Comprar', () => say(E.buy(s, d.id)), 'sm primary', s.player.money < d.price)
              : [
                  (!d.staff && o.lv < 3) ? ui.btn(`Melhorar ${M(E.upgradeCost(d, o.lv))}`, () => say(E.upgrade(s, d.id)), 'sm') : null,
                  ui.btn(d.staff ? 'Dispensar' : 'Vender', () => say(E.sell(s, d.id)), 'sm ghost')
                ]
        )
      );
    }))]);
  }

  function invest(s) {
    const total = U.sum(s.player.invest.map(i => i.amount));
    return h('div', { class: 'col', style: { gap: '.6rem' } }, D.investments.map(d => {
      const i = s.player.invest.find(x => x.id === d.id), amt = i ? i.amount : 0;
      return h('div', { class: 'tile', style: { flexDirection: 'row', alignItems: 'center', gap: '.8rem' } }, ui.plate('trend', 'var(--ok)', true), h('div', { class: 'grow' }, h('h4', null, d.name), h('div', { class: 'tiny mut' }, `${d.desc} · retorno médio ${Math.round(d.mean * 100)}% a.a.`), ui.bar('Alocado', total ? amt / total * 100 : 0, { auto: false, text: M(amt) })),
        h('div', { class: 'row' }, [50000, 250000, 1000000].map(v => ui.btn('+' + M(v), () => say(E.invest(s, d.id, v)), 'sm', s.player.money < v)), ui.btn('Resgatar', () => say(E.withdraw(s, d.id)), 'sm ghost', !amt)));
    }), h('div', { class: 'tiny dim' }, 'O retorno é calculado no fim de cada temporada.'));
  }

  function negotiateSponsor(off) {
    const s = Game.state, sp = D.sponsors.find(y => y.id === off.id);
    if (!sp) return;
    const nt = {
      pay: off.pay,
      years: off.years || 1,
      goal: Object.assign({}, off.goal || sp.goal),
      bonus: off.bonus != null ? off.bonus : Math.round(off.pay * .25)
    };
    const stepPay = Math.max(1000, Math.round(off.basePay * .08 / 1000) * 1000);
    const stepBonus = Math.max(1000, Math.round(off.basePay * .05 / 1000) * 1000);
    const goalTypes = [
      ['top10', 'Top 10', 1, 1, 20],
      ['pts', 'Pontos', 5, 5, 300],
      ['podio', 'Pódios', 1, 1, 15],
      ['vitoria', 'Vitórias', 1, 1, 10],
      ['pop', 'Popularidade', 5, 10, 95]
    ];

    const body = h('div', { class: 'col', style: { gap: '.65rem' } });

    const stp = (label, valText, onMinus, onPlus) => h('div', { class: 'row between' },
      h('span', { class: 'mut small' }, label),
      h('div', { class: 'stepper' },
        ui.btn('', onMinus, 'sm icon', false, 'minus'),
        h('b', null, valText),
        ui.btn('', onPlus, 'sm icon', false, 'plus')
      )
    );

    function draw() {
      body.innerHTML = '';
      const pr = E.sponsorChance(s, off, nt);
      const curType = goalTypes.find(g => g[0] === nt.goal.k) || goalTypes[0];
      const goalStr = D.goalText[nt.goal.k](nt.goal.n);

      body.append(
        stp('Valor anual', M(nt.pay),
          () => { nt.pay = Math.max(1000, nt.pay - stepPay); draw(); },
          () => { nt.pay = Math.min(5e7, nt.pay + stepPay); draw(); }
        ),
        stp('Duração (anos)', `${nt.years} ano(s)`,
          () => { nt.years = Math.max(1, nt.years - 1); draw(); },
          () => { nt.years = Math.min(3, nt.years + 1); draw(); }
        ),
        stp('Bônus por meta', M(nt.bonus),
          () => { nt.bonus = Math.max(0, nt.bonus - stepBonus); draw(); },
          () => { nt.bonus = Math.min(2e7, nt.bonus + stepBonus); draw(); }
        ),
        h('div', { class: 'row between' },
          h('span', { class: 'mut small' }, 'Tipo de meta'),
          ui.tabs(goalTypes.map(g => [g[0], g[1]]), nt.goal.k, k => {
            const info = goalTypes.find(g => g[0] === k);
            nt.goal = { k, n: info[3] * 2 };
            draw();
          })
        ),
        stp('Alvo da meta', goalStr,
          () => { nt.goal.n = Math.max(curType[3], nt.goal.n - curType[2]); draw(); },
          () => { nt.goal.n = Math.min(curType[4], nt.goal.n + curType[2]); draw(); }
        ),
        h('div', { class: 'row between', style: { borderTop: '1px solid var(--line)', paddingTop: '.5rem' } },
          h('span', { class: 'mut' }, 'Chance de aceitação'),
          ui.badge(pr >= .75 ? 'Alta' : pr >= .45 ? 'Média' : 'Baixa', pr >= .75 ? 'ok' : pr >= .45 ? 'warn' : 'bad')
        )
      );
    }
    draw();

    ui.modal({
      title: `Negociar patrocínio · ${sp.name}`,
      body,
      width: '36rem',
      actions: [
        { label: 'Cancelar' },
        {
          label: 'Propor contrato',
          cls: 'primary',
          fn: () => {
            const r = E.negotiateSponsor(s, off, nt);
            ui.toast(r.msg);
            ui.refresh();
          }
        }
      ]
    });
  }

  function spons(s) {
    const p = s.player;
    const offers = E.normalizeSponsorOffers(s);
    const goal = g => D.goalText[g.k](g.n);

    const activeRow = x => {
      const sp = D.sponsors.find(y => y.id === x.id);
      if (!sp) return null;
      const pay = x.pay != null ? x.pay : E.sponsorBasePay(s, sp);
      const g = x.goal || sp.goal;
      const yrs = x.years || 1;
      const bns = x.bonus || 0;
      return h('div', { class: 'tile', style: { flexDirection: 'row', alignItems: 'center', gap: '.7rem', padding: '.5rem .7rem' } },
        ui.avatar(sp.name),
        h('div', { class: 'grow' },
          h('div', { class: 'row gap-s' }, h('b', null, sp.name), ui.badge(`${yrs} ano(s)`)),
          h('div', { class: 'tiny mut' }, `${M(pay)}/ano${bns ? ' (+' + M(bns) + ' bônus)' : ''} · meta: ${goal(g)}`)
        ),
        ui.btn('Encerrar', () => { E.dropSponsor(s, sp.id); ui.refresh(); }, 'sm ghost')
      );
    };

    const offerRow = off => {
      const sp = D.sponsors.find(y => y.id === off.id);
      if (!sp) return null;
      const g = off.goal || sp.goal;
      return h('div', { class: 'tile', style: { flexDirection: 'row', alignItems: 'center', gap: '.7rem', padding: '.5rem .7rem' } },
        ui.avatar(sp.name),
        h('div', { class: 'grow' },
          h('div', { class: 'row gap-s' },
            h('b', null, sp.name),
            off.isEvent ? ui.badge('NOVA', 'acc') : null,
            (off.years || 1) > 1 ? ui.badge(`${off.years} anos`, 'info') : null
          ),
          h('div', { class: 'tiny mut' }, `${M(off.pay)}/ano${off.bonus ? ' (+' + M(off.bonus) + ' bônus)' : ''} · meta: ${goal(g)}`)
        ),
        h('div', { class: 'row gap-s' },
          ui.btn(off.tried ? 'Negociado' : 'Negociar', () => negotiateSponsor(off), 'sm', off.tried, 'swap'),
          ui.btn('Assinar', () => say(E.signSponsor(s, sp.id)), 'sm primary')
        )
      );
    };

    const tsInfo = E.teamSponsorInfo ? E.teamSponsorInfo(s) : { brands: [], estShare: 0 };
    const teamSpBox = p.teamId
      ? h('div', { class: 'tile', style: { padding: '.55rem .7rem', gap: '.25rem', borderColor: 'var(--accent-line)', marginBottom: '.35rem' } },
          h('div', { class: 'row between' },
            h('span', { class: 'pt' }, 'Patrocinadores Oficiais da Equipe'),
            ui.badge(`Cota est. ${M(tsInfo.estShare)}/ano`, 'info')
          ),
          h('div', { class: 'small' }, h('b', null, tsInfo.brands.join(' · '))),
          h('div', { class: 'tiny mut' }, 'Estampados no carro e macacão da escuderia; pagam bônus comercial conforme seus pontos na temporada.')
        )
      : null;

    return h('div', { class: 'cols2' },
      h('div', { class: 'col' },
        teamSpBox,
        h('div', { class: 'pt' }, `Patrocínios Pessoais do Piloto (${p.sponsors.length}/4)`),
        p.sponsors.length ? p.sponsors.map(activeRow) : h('div', { class: 'tiny dim' }, 'Nenhum patrocinador pessoal ativo.')
      ),
      h('div', { class: 'col' },
        h('div', { class: 'pt' }, `Propostas Pessoais Disponíveis (${offers.length})`),
        offers.length
          ? ui.paged('sponOffers', offers, 4, items => items.map(offerRow))
          : h('div', { class: 'tiny dim' }, 'Sem propostas agora.')
      )
    );
  }

  function resid(s) {
    const curLv = D.categories[s.player.catId].level;
    return h('div', { class: 'tiles' }, D.residences.map(r => {
      const locked = s.player.residence !== r.id && (r.minLv || 0) > curLv;
      return h('div', { class: 'tile', style: locked ? { opacity: .55 } : null },
        ui.plate(locked ? 'lock' : 'house', locked ? null : 'var(--info)'),
        h('h4', null, r.name),
        h('div', { class: 'row' }, ui.badge('imposto ' + Math.round(r.tax * 100) + '%'), ui.badge('popular. ' + (r.fans >= 0 ? '+' : '') + r.fans, r.fans < 0 ? 'warn' : '')),
        s.player.residence === r.id
          ? ui.badge('residência atual', 'ok')
          : locked
            ? ui.badge(`Desbloqueia em ${catNameForLv(r.minLv)}`)
            : ui.btn('Mudar (US$ 100 mil)', () => say(E.move(s, r.id)), 'sm')
      );
    }));
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
