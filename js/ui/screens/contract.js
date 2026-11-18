/* Contratos: equipe de corrida, Academia de Pilotos (negociação e prospecção a qualquer momento) e superlicença. */
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
    const bs = Math.max(1000, Math.round(Math.abs(o.base.bTitle) / 8 / 1000) * 1000) || 5000;

    function draw() {
      body.innerHTML = ''; const pr = S.contracts.chance(s, o, nt);
      body.append(
        stp('Duração (anos)', 'years', 1, 1, 4),
        salaryStp(),
        stp('Bônus por título', 'bTitle', bs, 0, 1e9, M),
        stp('Bônus por vitória', 'bWin', Math.max(1000, Math.round(bs / 5 / 1000) * 1000), 0, 1e9, M),
        stp('Bônus por pódio', 'bPodium', Math.max(1000, Math.round(bs / 8 / 1000) * 1000), 0, 1e9, M),
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

  function negotiateAcademyModal(off) {
    const s = Game.state;
    const nt = Object.assign({}, off.terms);
    const body = h('div', { class: 'col', style: { gap: '.6rem' } });

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
      const pr = S.contracts.academyChance(s, off, nt);
      body.append(
        stp('Duração do programa', `${nt.years} ano(s)`,
          () => { nt.years = Math.max(2, nt.years - 1); draw(); },
          () => { nt.years = Math.min(5, nt.years + 1); draw(); }
        ),
        stp('Cobertura dos custos da base', `${Math.round(nt.coverage * 100)}%`,
          () => { nt.coverage = Math.max(0.5, Math.round((nt.coverage - 0.05) * 100) / 100); draw(); },
          () => { nt.coverage = Math.min(1.0, Math.round((nt.coverage + 0.05) * 100) / 100); draw(); }
        ),
        stp('Bolsa / ajuda de custo anual', M(nt.stipend),
          () => { nt.stipend = Math.max(0, nt.stipend - 15000); draw(); },
          () => { nt.stipend = Math.min(180000, nt.stipend + 15000); draw(); }
        ),
        stp('Testes privados de F1 (TPC/ano)', `${nt.f1TestsPerYear} teste(s)`,
          () => { nt.f1TestsPerYear = Math.max(1, nt.f1TestsPerYear - 1); draw(); },
          () => { nt.f1TestsPerYear = Math.min(3, nt.f1TestsPerYear + 1); draw(); }
        ),
        stp('Propagandas e eventos/ano', `${nt.mediaObligations} ação(ões)`,
          () => { nt.mediaObligations = Math.max(1, nt.mediaObligations - 1); draw(); },
          () => { nt.mediaObligations = Math.min(4, nt.mediaObligations + 1); draw(); }
        ),
        h('div', { class: 'row between', style: { borderTop: '1px solid var(--line)', paddingTop: '.5rem' } },
          h('span', { class: 'mut' }, 'Chance de aceitarem'),
          ui.badge(pr >= .75 ? 'Alta' : pr >= .45 ? 'Média' : 'Baixa', pr >= .75 ? 'ok' : pr >= .45 ? 'warn' : 'bad')
        )
      );
    }
    draw();

    ui.modal({
      title: `Negociar programa · ${off.name}`,
      body,
      width: '36rem',
      actions: [
        { label: 'Cancelar' },
        {
          label: 'Propor termos',
          cls: 'primary',
          fn: () => {
            const r = S.contracts.negotiateAcademy(s, off, nt);
            ui.toast(r.msg);
            ui.refresh();
          }
        }
      ]
    });
  }

  function offerCard(o, s) {
    const t = o.terms, afford = S.contracts.canAfford(s, o), cat = C[o.catId];
    const effCost = S.contracts.effectiveCost(s, t.salary);
    const acad = S.contracts.ensureAcademy(s.player);
    const hasAcadDiscount = t.salary < 0 && acad && acad.coverage > 0 && effCost < Math.abs(t.salary);

    return h('div', { class: 'offer ' + (afford ? '' : 'dis') },
      h('div', { class: 'row between' },
        ui.teamChip(o.teamName, o.teamId, o.catId),
        h('span', { class: 'row' },
          o.note ? ui.badge(o.note, o.note.includes('Salto') || o.note.includes('acelerada') ? 'acc' : '') : null,
          ui.badge(cat.short, 'info')
        )
      ),
      ui.bar('Carro', o.car, { auto: false, text: o.car }),
      h('div', { class: 'kv3' }, [
        ['Duração', t.years + ' ano(s)'],
        [salLabel(t), hasAcadDiscount ? `${M(effCost)} (c/ bolsa)` : M(Math.abs(t.salary))],
        ['Bônus título', M(t.bTitle)]
      ].map(([k, v]) => h('div', null, h('div', { class: 'k' }, k), h('div', { class: 'v', style: { color: k !== 'Duração' && t.salary < 0 && k !== 'Bônus título' ? 'var(--warn)' : '' } }, v)))),
      h('div', { class: 'row' },
        ui.btn('Aceitar', () => { const r = S.contracts.accept(s, o); ui.toast(r.msg); ui.refresh(); }, 'primary sm', !afford, 'check'),
        ui.btn(o.tried ? 'Já negociada' : 'Negociar', () => negotiate(o), 'sm', o.tried || !afford, 'swap'),
        !afford ? h('span', { class: 'tiny bad' }, 'sem fundos') : null,
        t.exit ? ui.badge('cláusula de saída') : null
      )
    );
  }

  function academySection(s) {
    const p = s.player;
    const inF1 = p.catId === 'f1' || !!(s.flags && s.flags.wasF1);
    const acad = S.contracts.ensureAcademy(p);
    const aOffers = s.academyOffers || [];

    if (inF1) {
      return h('div', { class: 'col', style: { borderTop: '1px solid var(--line)', paddingTop: '.55rem', gap: '.25rem' } },
        h('div', { class: 'row between' },
          h('span', { class: 'pt' }, 'Academia de pilotos'),
          ui.badge('FÓRMULA 1', 'ok')
        ),
        h('div', { class: 'tiny dim' }, 'Você já é piloto de Fórmula 1 — os programas de formação júnior e testes TPC são exclusivos das categorias de base.')
      );
    }

    if (acad) {
      return h('div', { class: 'col', style: { borderTop: '1px solid var(--line)', paddingTop: '.55rem', gap: '.4rem' } },
        h('div', { class: 'row between' },
          h('span', { class: 'pt' }, 'Academia de pilotos'),
          ui.badge(`${acad.years} ano(s) rest.`, 'acc')
        ),
        h('div', { class: 'row between' },
          h('span', { class: 'tchip' },
            h('i', { class: 'tbar', style: { background: acad.color || 'var(--accent)' } }),
            h('b', { class: 'small' }, acad.name)
          ),
          h('span', { class: 'tiny mono mut' }, `Cobre ${Math.round(acad.coverage * 100)}% · ${M(acad.stipend)}/ano`)
        ),
        ui.bar('Confiança', acad.satisfaction),
        h('div', { class: 'tiny mut' }, `Testes F1 (TPC): ${acad.f1TestsLeft}/${acad.f1TestsPerYear} · Mídia: ${acad.mediaDone}/${acad.mediaObligations} · Punições e maus resultados causam demissão.`)
      );
    }

    const seekBtn = ui.btn('Buscar academia', () => {
      const r = S.contracts.seekAcademy(s);
      if (r.msg) ui.toast(r.msg);
      ui.refresh();
    }, 'sm', false, 'users');

    if (aOffers.length) {
      const off = aOffers[0];
      const t = off.terms;
      return h('div', { class: 'col', style: { borderTop: '1px solid var(--line)', paddingTop: '.55rem', gap: '.4rem' } },
        h('div', { class: 'row between' },
          h('span', { class: 'pt' }, `Convite de Academia (${aOffers.length})`),
          ui.badge('NOVA PROPOSTA', 'acc')
        ),
        h('div', { class: 'tchip' },
          h('i', { class: 'tbar', style: { background: off.color || 'var(--accent)' } }),
          h('b', { class: 'small' }, off.name)
        ),
        h('div', { class: 'tiny mut' }, `${t.years} anos · cobre ${Math.round(t.coverage * 100)}% da inscrição + ${M(t.stipend)}/ano + ${t.f1TestsPerYear} teste(s) F1/ano`),
        h('div', { class: 'row', style: { flexWrap: 'wrap' } },
          ui.btn('Assinar programa', () => { const r = S.contracts.acceptAcademy(s, off); ui.toast(r.msg); ui.refresh(); }, 'primary sm', false, 'check'),
          ui.btn(off.tried ? 'Negociado' : 'Negociar', () => negotiateAcademyModal(off), 'sm', off.tried, 'swap'),
          aOffers.length < 3 ? seekBtn : null
        )
      );
    }

    return h('div', { class: 'col', style: { borderTop: '1px solid var(--line)', paddingTop: '.55rem', gap: '.35rem' } },
      h('div', { class: 'row between' },
        h('span', { class: 'pt' }, 'Academia de pilotos'),
        seekBtn
      ),
      h('div', { class: 'tiny dim' }, 'Conquiste pódios, vitórias e títulos na base para atrair academias da F1 e melhorar os termos do contrato.')
    );
  }

  ui.screens.contract = {
    render() {
      const s = Game.state, p = s.player, c = p.contract, sl = S.superlicense.status(p, s.year);
      if (s.phase === 'offseason') S.contracts.ensureFallback(s);
      const cur = ui.panel({ title: 'Contrato atual', cls: 'marks' }, c ? [
        h('div', { class: 'row' }, ui.plate('doc', null, true), h('div', null, h('div', { style: { fontSize: '1.15rem', fontWeight: 650, letterSpacing: '-.02em' } }, ui.teamChip(c.teamName, c.teamId, c.catId)), h('div', { class: 'small mut' }, C[c.catId].name + (c.role === 'reserve' ? ' · Piloto Reserva' : '')))),
        h('div', { class: 'kv3' }, [['Restam', c.years + ' ano(s)'], [salLabel(c), M(Math.abs(c.salary))], ['Imagem', (c.img || 0) + '%']].map(([k, v]) => h('div', null, h('div', { class: 'k' }, k), h('div', { class: 'v' }, v)))),
        h('div', { class: 'kv3' }, [['Título', M(c.bTitle)], ['Vitória', M(c.bWin)], ['Pódio', M(c.bPodium)]].map(([k, v]) => h('div', null, h('div', { class: 'k' }, k), h('div', { class: 'v' }, v)))),
        h('div', { class: 'row' }, c.exit ? ui.badge('cláusula de saída', 'ok') : null, c.option ? ui.badge('opção de renovação', 'ok') : null),
        ui.btn('Rescindir contrato', () => ui.confirm('Rescindir?', c.exit ? 'Sem multa (cláusula de saída).' : `Multa de ${M(Math.round(Math.abs(c.salary) * .5))}.`, () => { const r = S.contracts.terminate(s); ui.toast(r.msg || ''); ui.refresh(); }), 'sm', s.phase === 'season')
      ] : h('div', { class: 'row' }, ui.plate('alert', 'var(--warn)', true), h('div', null, h('b', null, 'Você está sem contrato'), h('div', { class: 'small mut' }, 'Escolha uma das ofertas ao lado.'))),
        academySection(s),
        h('div', { class: 'grow' }),
        h('div', { class: 'row', style: { borderTop: '1px solid var(--line)', paddingTop: '.55rem' } }, ui.ring(sl.total, sl.need, { size: 60, text: sl.total, sub: '/ 40', fs: 22, color: sl.eligible ? 'var(--ok)' : 'var(--warn)' }),
          h('div', { class: 'col gap-s' }, h('b', null, 'Superlicença da FIA'), sl.eligible ? ui.badge('apto para a F1', 'ok') : h('div', { class: 'tiny mut' }, `40 pts em 3 anos · 18 anos (você: ${sl.age}) · 2 anos monoposto (${p.singleSeaterSeasons}).`)))
      );

      let right;
      const midOffers = s.midSeasonOffers || [];
      if (s.phase === 'season' && midOffers.length) {
        right = ui.panel({ title: `Mercado no Meio da Temporada (para ${s.year + 1})`, right: ui.badge('PROPOSTAS ANTECIPADAS', 'acc') },
          h('div', { class: 'small mut' }, 'Você recebeu propostas antecipadas para a próxima temporada. Assinar garante sua vaga antes da entressafra:'),
          midOffers.map(o => {
            const t = o.terms, afford = S.contracts.canAfford(s, o);
            return h('div', { class: 'offer' },
              h('div', { class: 'row between' },
                ui.teamChip(o.teamName, o.teamId, o.catId),
                ui.badge(o.note || 'Pré-contrato', 'acc')
              ),
              ui.bar('Carro', o.car, { auto: false, text: o.car }),
              h('div', { class: 'kv3' }, [
                ['Duração', t.years + ' ano(s)'],
                [salLabel(t), M(Math.abs(t.salary))],
                ['Bônus título', M(t.bTitle)]
              ].map(([k, v]) => h('div', null, h('div', { class: 'k' }, k), h('div', { class: 'v' }, v)))),
              h('div', { class: 'row' },
                ui.btn(`Assinar para ${s.year + 1}`, () => { const r = S.contracts.acceptMidSeasonOffer(s, o); ui.toast(r.msg, r.ok ? 'good' : 'bad'); ui.refresh(); }, 'primary sm', !afford, 'check'),
                ui.btn(o.tried ? 'Negociada' : 'Negociar', () => negotiate(o), 'sm', o.tried || !afford, 'swap')
              )
            );
          })
        );
      } else if (s.phase === 'season') right = ui.panel({ title: 'Ofertas', cls: 'grow' }, h('div', { class: 'empty' }, ui.plate('clock', null, true), h('div', null, p.nextContract ? `Pré-contrato já assinado com ${p.nextContract.teamName} para ${s.year + 1}.` : 'Novas ofertas de equipe aparecem no meio da temporada ou na entressafra.')));
      else if (!s.offers.length) right = ui.panel({ title: 'Ofertas', cls: 'grow' }, h('div', { class: 'empty' }, ui.plate('lock', null, true), h('div', null, c ? 'Seu contrato continua válido. Sem cláusula de saída, não há ofertas de outras equipes.' : 'Nenhuma oferta disponível.')));
      else right = ui.panel({ title: `Ofertas para ${s.year}`, right: p.forcedUp ? ui.badge('você precisa subir de categoria', 'warn') : null }, ui.paged('offers', s.offers, 3, items => items.map(o => offerCard(o, s))));

      const isBoss = S.owner && S.owner.isBossOnly(p);
      const cta = s.phase === 'offseason' && (c || isBoss) ? ui.panel({ cls: 'cta' }, h('div', { class: 'msg' }, isBoss ? 'Modo Chefe de Equipe ativo na ' : 'Contrato assinado com ', h('b', null, isBoss ? p.ownedTeam.name : c.teamName), '.'), ui.btn(`Iniciar temporada ${s.year}`, () => { S.career.startSeason(); ui.go('hub'); }, 'primary lg', false, 'play')) : null;
      return h('div', { class: 'screen' }, ui.head('Contrato', s.phase === 'offseason' ? `Entressafra ${s.year}` : 'Temporada em andamento'), h('div', { class: 'cols-2-3' }, cur, right), cta);
    }
  };
})();
