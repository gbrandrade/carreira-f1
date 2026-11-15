/* Criação do piloto: identidade e origem > roleta (4 rodadas, 3 trocas) > resumo. */
(function () {
  const ui = Game.ui, h = ui.h, D = Game.data, R = Game.rng, A = Game.systems.attributes, cfg = Game.config, M = Game.utils.fmtMoney;
  const KEYS = ['RIT', 'RAC', 'ATE', 'EXP'], NAMES = { EXP: 'Experiência', RAC: 'Racecraft', ATE: 'Atenção', RIT: 'Ritmo' };
  const AX = [{ label: 'RIT' }, { label: 'RAC' }, { label: 'ATE' }, { label: 'EXP' }];
  const OICON = { humilde: ['house', 'var(--info)'], media: ['briefcase', 'var(--warn)'], rica: ['star', 'var(--gold)'] };

  function fresh() { return { step: 'form', name: '', country: 'BRA', origin: 'media', picks: {}, src: {}, refresh: cfg.refreshes, used: [], card: null, traits: [] }; }
  function draw(cr) {
    const tier = R.weighted(Object.keys(cfg.rarity), k => cfg.rarity[k]);
    let pool = D.cards.filter(c => c.tier === tier && !cr.used.includes(c.name));
    if (!pool.length) pool = D.cards.filter(c => !cr.used.includes(c.name));
    cr.card = R.pick(pool); cr.used.push(cr.card.name);
  }
  const vals = cr => KEYS.map(k => cr.picks[k] != null ? cr.picks[k] : 0);
  const steps = on => h('div', { class: 'steps' }, [['1', 'Identidade'], ['2', 'Roleta'], ['3', 'Resumo']].map(([n, t], i) => [i ? h('span', { class: 'step-line' }) : null, h('span', { class: 'step ' + (i + 1 === on ? 'on' : i + 1 < on ? 'done' : '') }, h('b', null, i + 1 < on ? '✓' : n), t)]));
  const restart = cr => { cr.step = 'roulette'; cr.refresh = cfg.refreshes; cr.picks = {}; cr.src = {}; cr.used = []; draw(cr); ui.refresh(); };

  ui.screens.creation = {
    render() { const cr = ui.cr || (ui.cr = fresh()); return cr.step === 'form' ? this.form(cr) : cr.step === 'roulette' ? this.roulette(cr) : this.summary(cr); },
    form(cr) {
      const input = h('input', { type: 'text', value: cr.name, placeholder: 'Ex.: Gabriel Souza', maxlength: 28, oninput: e => { cr.name = e.target.value; } });
      const sel = h('select', { onchange: e => { cr.country = e.target.value; } }, D.countries.map(c => h('option', { value: c[0], selected: c[0] === cr.country ? 'selected' : null }, `${c[0]} · ${c[1]}`)));
      return h('div', { class: 'creation' }, steps(1),
        ui.head('Novo piloto', 'Quem é você e de onde você vem?'),
        h('div', { class: 'cols2' },
          ui.panel({ title: 'Identidade', cls: 'marks' }, h('label', { class: 'col gap-s' }, h('span', { class: 'small mut' }, 'Nome do piloto'), input), h('label', { class: 'col gap-s' }, h('span', { class: 'small mut' }, 'País'), sel),
            h('div', { class: 'grow' }), h('div', { class: 'tiny dim' }, `Início da carreira em ${cfg.startYear}, aos ${cfg.startAge} anos, no kart regional.`)),
          ui.panel({ title: 'Ficha do piloto' }, h('div', { class: 'grow' }, ui.radar(AX, [{ values: [60, 60, 60, 60], color: 'var(--text-3)', dashed: true }])), h('div', { class: 'tiny dim center' }, 'Os quatro atributos serão definidos na roleta.'))),
        h('div', { class: 'origins' }, D.origins.map(o => { const [ic, col] = OICON[o.id]; return h('button', { class: 'origin ' + (cr.origin === o.id ? 'sel' : ''), onclick: () => { cr.origin = o.id; ui.refresh(); } }, ui.plate(ic, col, true),
          h('div', { class: 'col gap-s' }, h('h4', null, o.name), h('p', null, o.desc), h('div', { class: 'row' }, ui.badge('Caixa ' + M(o.money)), ui.badge('Apoio ' + M(o.support) + '/ano')))); })),
        h('div', { class: 'row between' }, ui.btn('Menu', () => ui.go('menu'), 'ghost', false, 'left'), ui.btn('Ir para a roleta', () => {
          if (!cr.name.trim()) { ui.toast('Digite um nome'); return; } cr.name = cr.name.trim(); restart(cr);
        }, 'primary lg', false, 'right')));
    },
    roulette(cr) {
      const n = Object.keys(cr.picks).length, c = cr.card, proj = n ? A.projected(Object.assign({ EXP: 0, RAC: 0, ATE: 0, RIT: 0 }, cr.picks)) : 0;
      const left = ui.panel({ title: 'Sua ficha', cls: 'marks' }, h('div', { class: 'grow' }, ui.radar(AX, [{ values: vals(cr) }], { min: 0 })),
        h('div', { class: 'row' }, ui.ring(proj, 100, { size: 76, text: n ? proj : '—', sub: 'GER MÁX.' }), h('div', { class: 'col grow', style: { gap: '.3rem' } }, KEYS.map(k => h('div', { class: 'slot ' + (cr.picks[k] != null ? 'filled' : '') }, h('span', null, k), cr.picks[k] != null ? h('b', { class: 'mono' }, cr.picks[k]) : '—')))));
      const card = h('div', { class: 'pcard', 'data-tier': c.tier },
        h('div', { class: 'row between' }, h('span', { class: 'tier ' + c.tier }, D.tierLabels[c.tier]), h('span', { class: 'row' }, ui.ccode(c.country), ui.badge('GER ' + c.GER))),
        h('div', null, h('div', { class: 'nm' }, c.name), h('div', { class: 'mut small', style: { marginTop: '.3rem' } }, 'Escolha 1 atributo para roubar. Atributos já escolhidos ficam bloqueados.')),
        h('div', { class: 'attrs4' }, KEYS.map(k => {
          const used = cr.picks[k] != null;
          return h('button', { class: 'attr-box ' + (used ? 'used' : ''), onclick: () => { if (used) return; cr.picks[k] = c[k]; cr.src[k] = c.name; if (Object.keys(cr.picks).length === 4) { cr.step = 'summary'; cr.traits = R.shuffle(D.traits).slice(0, 2).map(t => t.id); } else draw(cr); ui.refresh(); } },
            h('span', { class: 'l' }, NAMES[k]), h('span', { class: 'v' }, c[k]), ui.meter(c[k], { auto: false, segments: 14 }), h('span', { class: 'tiny dim' }, used ? 'já escolhido' : 'roubar atributo'));
        })),
        h('div', { class: 'row between' }, h('div', { class: 'row' }, h('span', { class: 'tiny dim mono' }, 'TROCAS'), h('span', { class: 'dotsr' }, Array.from({ length: cfg.refreshes }, (_, i) => h('i', { class: i < cr.refresh ? '' : 'off' })))),
          ui.btn('Trocar carta', () => { cr.refresh--; draw(cr); ui.refresh(); }, '', cr.refresh <= 0, 'swap')));
      return h('div', { class: 'creation' }, steps(2), ui.head(`Rodada ${n + 1} de 4`, 'Cada piloto que aparece cede apenas um atributo.'), h('div', { class: 'cols-2-3' }, left, card),
        h('div', { class: 'row between' }, ui.btn('Voltar', () => { cr.step = 'form'; ui.refresh(); }, 'ghost', false, 'left'), h('span', { class: 'tiny dim' }, 'O GER projetado usa a fórmula 5% EXP · 27% RAC · 11% ATE · 57% RIT')));
    },
    summary(cr) {
      const ger = A.projected(cr.picks);
      return h('div', { class: 'creation' }, steps(3), ui.head(cr.name, `${cr.country} · ${D.origins.find(o => o.id === cr.origin).name}`),
        h('div', { class: 'cols2' },
          ui.panel({ title: 'Atributos', cls: 'marks' }, h('div', { class: 'grow' }, ui.radar(AX, [{ values: vals(cr) }], { min: 0 })), KEYS.map(k => h('div', { class: 'row between small' }, h('span', null, `${NAMES[k]}`), h('span', { class: 'mut' }, `de ${cr.src[k]}`), h('b', { class: 'mono' }, cr.picks[k])))),
          h('div', { class: 'col', style: { gap: '.7rem' } },
            ui.panel({ title: 'GER máximo projetado' }, h('div', { class: 'row' }, ui.ring(ger, 100, { size: 110, fs: 30, sub: 'GER' }), h('div', { class: 'mut small' }, 'É o teto do seu potencial. Você cresce em direção a ele com treino, resultados e sorte.'))),
            ui.panel({ title: 'Traços de personalidade', cls: 'grow' }, cr.traits.map(id => { const t = D.traits.find(x => x.id === id); return h('div', { class: 'row' }, ui.plate('bolt', 'var(--accent)'), h('div', null, h('b', null, t.name), h('div', { class: 'small mut' }, t.desc))); })))),
        h('div', { class: 'row between' }, ui.btn('Refazer roleta', () => restart(cr), 'ghost', false, 'swap'),
          ui.btn('Começar carreira', () => {
            Game.systems.career.newGame({ name: cr.name, country: cr.country, origin: cr.origin, picks: cr.picks, pickSrc: cr.src, traits: cr.traits });
            ui.cr = null; ui.go('contract'); ui.modal({ title: 'Sua carreira começa', body: `${cr.name} tem ${cfg.startAge} anos e sonha com a F1. Escolha uma equipe de kart na tela de Contrato.`, actions: [{ label: 'Vamos lá', cls: 'primary' }] });
          }, 'primary lg', false, 'play')));
    }
  };
})();
