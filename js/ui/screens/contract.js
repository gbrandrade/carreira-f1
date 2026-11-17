/* Contratos: situação atual, superlicença, ofertas e negociação. */
(function () {
  const ui = Game.ui, h = ui.h, U = Game.utils, C = Game.data.categories, S = Game.systems, M = U.fmtMoney;
  const salLabel = t => t.salary >= 0 ? 'Salário/ano' : 'Você paga/ano';

  function negotiate(o) {
    const s = Game.state, nt = Object.assign({}, o.terms), stepS = Math.max(5000, Math.round(Math.abs(o.base.salary) * .05 / 5000) * 5000);
    const body = h('div', { class: 'col' });

    const stp = (label, key, step, min, max, fmt) => h('div', { class: 'row between' }, h('span', { class: 'mut small' }, label), h('div', { class: 'stepper' },
      ui.btn('', () => { nt[key] = Math.max(min, nt[key] - step); draw(); }, 'sm icon', false, 'minus'),
      h('b', null, fmt ? fmt(nt[key]) : nt[key]),
      ui.btn('', () => { nt[key] = Math.min(max, nt[key] + step); draw(); }, 'sm icon', false, 'plus')
    ));

    // Stepper dedicado para salário/pagamento:
    // Quando nt.salary >= 0 ("Salário/ano"): '-' diminui o salário, '+' aumenta o salário.
    // Quando nt.salary < 0 ("Você paga/ano"): '-' diminui o quanto você paga (aproxima de 0), '+' aumenta o quanto você paga (mais negativo).
    const salaryStp = () => {
      const paying = nt.salary < 0;
      const onMinus = () => {
        if (paying) nt.salary = Math.min(0, nt.salary + stepS);
        else nt.salary = Math.max(-1e9, nt.salary - stepS);
        draw();
      };
      const onPlus = () => {
        if (paying) nt.salary = Math.max(-1e9, nt.salary - stepS);
        else nt.salary = Math.min(1e9, nt.salary + stepS);
        draw();
      };
      return h('div', { class: 'row between' },
        h('span', { class: 'mut small' }, paying ? 'Você paga/ano' : 'Salário/ano'),
        h('div', { class: 'stepper' },
          ui.btn('', onMinus, 'sm icon', false, 'minus'),
          h('b', { style: { color: paying ? 'var(--warn)' : '' } }, M(Math.abs(nt.salary))),
          ui.btn('', onPlus, 'sm icon', false, 'plus')
        )
      );
    };

    const tog = (label, key) => h('div', { class: 'row between' }, h('span', { class: 'mut small' }, label), ui.btn(nt[key] ? 'Sim' : 'Não', () => { nt[key] = !nt[key]; draw(); }, 'sm ' + (nt[key] ? 'on' : '')));
    const bs = Math.max(5000, Math.round(Math.abs(o.base.bTitle) / 8 / 5000) * 5000) || 5000;

    function draw() {
      body.innerHTML = ''; const pr = S.contracts.chance(s, o, nt);
      body.append(
        stp('Duração (anos)', 'years', 1, 1, 4),
        salaryStp(),
        stp('Bônus por título', 'bTitle', bs, 0, 1e9, M),
        stp('Bônus por vitória', 'bWin', Math.max(1000, bs / 5), 0, 1e9, M),
        stp('Bônus por pódio', 'bPodium', Math.max(1000, bs / 8), 0, 1e9, M),
        stp('Bônus por ponto', 'bPoint', 1000, 0, 1e9, M),
        tog('Cláusula de saída para equipe maior', 'exit'),
        tog('Opção de renovação', 'option'),
        stp('Direitos de imagem para a equipe', 'img', 10, 0, 30, v => v + '%'),
        h('div', { class: 'row between', style: { borderTop: '1px solid var(--line)', paddingTop: '.5rem' } }, h('span', { class: 'mut' }, 'Chance de aceitarem'), ui.badge(pr >= .8 ? 'Alta' : pr >= .5 ? 'Média' : 'Baixa', pr >= .8 ? 'ok' : pr >= .5 ? 'warn' : 'bad'))
      );
    }
    draw();
    ui.modal({ title: `Negociar com ${o.teamName}`, body, width: '36rem', actions: [{ label: 'Cancelar' }, { label: 'Propor', cls: 'primary', fn: () => { const r = S.contracts.negotiate(s, o, nt); ui.toast(r.msg); ui.refresh(); } }] });
  }

  function offerCard(o, s) {
    const t = o.terms, afford = S.contracts.canAfford(s, o), cat = C[o.catId];
    return h('div', { class: 'offer ' + (afford ? '' : 'dis') },
      h('div', { class: 'row between' }, h('b', null, o.teamName), h('span', { class: 'row' }, o.academy ? ui.badge(o.academy, 'acc') : null, o.note ? ui.badge(o.note) : null, ui.badge(cat.short, 'info'))),
      ui.bar('Carro', o.car, { auto: false, text: o.car }),
      h('div', { class: 'kv3' }, [['Duração', t.years + ' ano(s)'], [salLabel(t), M(Math.abs(t.salary))], ['Bônus título', M(t.bTitle)]].map(([k, v]) => h('div', null, h('div', { class: 'k' }, k), h('div', { class: 'v', style: { color: k !== 'Duração' && t.salary < 0 && k !== 'Bônus título' ? 'var(--warn)' : '' } }, v)))),
      h('div', { class: 'row' }, ui.btn('Aceitar', () => { const r = S.contracts.accept(s, o); ui.toast(r.msg); ui.refresh(); }, 'primary sm', !afford, 'check'), ui.btn(o.tried ? 'Já negociada' : 'Negociar', () => negotiate(o), 'sm', o.tried || !afford, 'swap'), !afford ? h('span', { class: 'tiny bad' }, 'sem fundos') : null, t.exit ? ui.badge('cláusula de saída') : null)
    );
  }

  ui.screens.contract = {
    render() {
      const s = Game.state, p = s.player, c = p.contract, sl = S.superlicense.status(p, s.year);
      if (s.phase === 'offseason') S.contracts.ensureFallback(s);
      const cur = ui.panel({ title: 'Contrato atual', cls: 'marks' }, c ? [
        h('div', { class: 'row' }, ui.plate('doc', null, true), h('div', null, h('div', { style: { fontSize: '1.15rem', fontWeight: 650, letterSpacing: '-.02em' } }, c.teamName), h('div', { class: 'small mut' }, C[c.catId].name))),
        h('div', { class: 'kv3' }, [['Restam', c.years + ' ano(s)'], [salLabel(c), M(Math.abs(c.salary))], ['Imagem', (c.img || 0) + '%']].map(([k, v]) => h('div', null, h('div', { class: 'k' }, k), h('div', { class: 'v' }, v)))),
        h('div', { class: 'kv3' }, [['Título', M(c.bTitle)], ['Vitória', M(c.bWin)], ['Pódio', M(c.bPodium)]].map(([k, v]) => h('div', null, h('div', { class: 'k' }, k), h('div', { class: 'v' }, v)))),
        h('div', { class: 'row' }, c.exit ? ui.badge('cláusula de saída', 'ok') : null, c.option ? ui.badge('opção de renovação', 'ok') : null),
        ui.btn('Rescindir contrato', () => ui.confirm('Rescindir?', c.exit ? 'Sem multa (cláusula de saída).' : `Multa de ${M(Math.round(Math.abs(c.salary) * .5))}.`, () => { const r = S.contracts.terminate(s); ui.toast(r.msg || ''); ui.refresh(); }), 'sm', s.phase === 'season')
      ] : h('div', { class: 'row' }, ui.plate('alert', 'var(--warn)', true), h('div', null, h('b', null, 'Você está sem contrato'), h('div', { class: 'small mut' }, 'Escolha uma das ofertas ao lado.'))),
        h('div', { class: 'grow' }),
        h('div', { class: 'row', style: { borderTop: '1px solid var(--line)', paddingTop: '.6rem' } }, ui.ring(sl.total, sl.need, { size: 64, text: sl.total, sub: '/ 40', fs: 24, color: sl.eligible ? 'var(--ok)' : 'var(--warn)' }),
          h('div', { class: 'col gap-s' }, h('b', null, 'Superlicença da FIA'), sl.eligible ? ui.badge('apto para a F1', 'ok') : h('div', { class: 'tiny mut' }, `40 pontos em 3 anos · 18 anos (você: ${sl.age}) · 2 temporadas de monoposto (${p.singleSeaterSeasons}).`)))
      );

      let right;
      if (s.phase === 'season') right = ui.panel({ title: 'Ofertas', cls: 'grow' }, h('div', { class: 'empty' }, ui.plate('clock', null, true), h('div', null, 'Novas ofertas só aparecem na entressafra.')));
      else if (!s.offers.length) right = ui.panel({ title: 'Ofertas', cls: 'grow' }, h('div', { class: 'empty' }, ui.plate('lock', null, true), h('div', null, c ? 'Seu contrato continua válido. Sem cláusula de saída, não há ofertas de outras equipes.' : 'Nenhuma oferta disponível.')));
      else right = ui.panel({ title: `Ofertas para ${s.year}`, right: p.forcedUp ? ui.badge('você precisa subir de categoria', 'warn') : null }, ui.paged('offers', s.offers, 3, items => items.map(o => offerCard(o, s))));

      const cta = s.phase === 'offseason' && c ? ui.panel({ cls: 'cta' }, h('div', { class: 'msg' }, 'Contrato assinado com ', h('b', null, c.teamName), '.'), ui.btn(`Iniciar temporada ${s.year}`, () => { S.career.startSeason(); ui.go('hub'); }, 'primary lg', false, 'play')) : null;
      return h('div', { class: 'screen' }, ui.head('Contrato', s.phase === 'offseason' ? `Entressafra ${s.year}` : 'Temporada em andamento'), h('div', { class: 'cols-2-3' }, cur, right), cta);
    }
  };
})();
