/* Pessoas e mídia: agente, engenheiro, duelo com companheiro (H2H), Academia de Pilotos e desenvolvimento. */
(function () {
  const ui = Game.ui, h = ui.h, D = Game.data, S = Game.systems;
  const FOCUS = [['Aerodinâmica', 'downforce e eficiência'], ['Motor', 'potência e entrega'], ['Confiabilidade', 'menos quebras'], ['Chassi e pneus', 'tração e desgaste'], ['Ritmo de classificação', 'volta rápida']];

  function interview(s) {
    ui.modal({ title: 'Entrevista', body: 'Como você vai responder à imprensa?', stack: true, actions: D.interview.map(t => ({ label: t.label, icon: 'mic', fn: () => {
      const r = S.pressure.interview(s, t.id);
      ui.modal({ title: 'Entrevista', body: h('div', { class: 'col' }, h('div', null, r.text), r.extra ? h('div', { class: 'warn' }, r.extra) : null), actions: [{ label: 'OK', cls: 'primary', fn: () => { ui.refresh(); } }] });
    } })) });
  }

  const person = (name, role, right, extra) => h('div', { class: 'tile', style: { flexDirection: 'row', alignItems: 'center', gap: '.7rem' } }, ui.avatar(name), h('div', { class: 'grow' }, h('b', null, name), h('div', { class: 'tiny mut' }, role), extra || null), right || null);

  ui.screens.people = {
    render() {
      const s = Game.state, p = s.player, inSeason = s.phase === 'season' && s.season;
      const acad = S.contracts.ensureAcademy(p);
      let mate = null;
      if (inSeason) {
        const m = S.world.entries(s, p.catId, false).find(e => e.teamId === p.teamId);
        if (m) {
          const r = S.race.ranked(s.season), x = r.find(q => q.id === m.id);
          mate = { name: m.name, ger: m.attrs.GER, pos: x ? x.pos : '-', pts: x ? x.pts : 0 };
        }
      }
      const mine = inSeason ? S.race.ranked(s.season).find(q => q.id === 'player') : null;
      const h2h = p.h2h || { qualiW: 0, qualiL: 0, raceW: 0, raceL: 0 };

      const people = ui.panel({ title: 'Pessoas e equipe', cls: 'marks', right: inSeason && p.teamRole ? ui.badge(p.teamRole, p.teamRole === '1º Piloto' ? 'ok' : p.teamRole === 'Piloto Reserva' ? 'info' : '') : null },
        person(p.agent ? 'Seu agente' : 'Sem agente', p.agent ? 'comissão de 10% · melhora as negociações' : 'contrate para negociar melhor', ui.btn(p.agent ? 'Dispensar' : 'Contratar', () => { p.agent = !p.agent; ui.refresh(); }, 'sm ' + (p.agent ? 'ghost' : 'primary'))),
        person('Engenheiro de pista', 'relação com o piloto', null, ui.bar('Relação', p.engineerRel, { auto: false })),
        mate
          ? person(mate.name, 'companheiro de equipe', ui.rate(mate.ger),
              h('div', { class: 'col gap-s' },
                h('div', { class: 'tiny mut' }, `${mate.pos}º (${mate.pts} pts)${mine && !S.career.isReserve(p) ? ' · você ' + mine.pos + 'º (' + mine.pts + ' pts)' : ''}`),
                !S.career.isReserve(p) ? h('div', { class: 'tiny mono acc' }, `Duelo direto · Quali ${h2h.qualiW}x${h2h.qualiL} · Corrida ${h2h.raceW}x${h2h.raceL}`) : null
              )
            )
          : person('Companheiro de equipe', 'disponível durante a temporada'),
        acad
          ? h('div', { class: 'tile', style: { gap: '.4rem', borderColor: 'var(--accent-line)' } },
              h('div', { class: 'row between' },
                h('span', { class: 'tchip' },
                  h('i', { class: 'tbar', style: { background: acad.color || 'var(--accent)' } }),
                  h('b', { class: 'small' }, acad.name)
                ),
                ui.badge(`${acad.years} ano(s)`, 'acc')
              ),
              ui.bar('Confiança', acad.satisfaction),
              h('div', { class: 'row', style: { flexWrap: 'wrap' } },
                ui.btn(`Teste F1 (${acad.f1TestsLeft})`, () => {
                  const r = S.contracts.runAcademyF1Test(s);
                  if (r.msg) ui.toast(r.msg);
                  ui.refresh();
                }, 'sm primary', !inSeason || (acad.f1TestsLeft || 0) <= 0, 'bolt'),
                ui.btn(`Propaganda (${acad.mediaDone}/${acad.mediaObligations})`, () => {
                  const r = S.contracts.runAcademyAd(s);
                  if (r.msg) ui.toast(r.msg);
                  ui.refresh();
                }, 'sm', !inSeason || (acad.mediaDone || 0) >= (acad.mediaObligations || 1), 'mic')
              )
            )
          : null,
        h('div', { class: 'grow' }),
        h('div', { class: 'row', style: { flexWrap: 'wrap' } }, p.traits.map(id => ui.badge(D.traits.find(t => t.id === id).name, 'acc')))
      );

      const rep = p.reputation != null ? p.reputation : 45;
      const media = ui.panel({ title: 'Reputação e mídia' },
        ui.bar('Reputação', rep),
        ui.bar('Popular.', p.popularity),
        ui.bar('Família', p.pressure.family),
        ui.bar('Mente', p.mental),
        ui.bar('Físico', p.phys),
        h('div', { class: 'tiny dim' }, 'Reputação abre portas nas equipes de ponta; Popularidade aumenta o valor dos patrocínios.'),
        h('div', { class: 'grow' }),
        ui.btn(p.interviewDone ? 'Entrevista concedida nesta etapa' : 'Dar entrevista', () => interview(s), 'primary', !inSeason || p.interviewDone, 'mic')
      );

      const half = inSeason && s.season.round <= Math.floor(s.season.cal.length / 2);
      const dev = ui.panel({ title: 'Desenvolvimento do carro' },
        h('div', { class: 'small mut' }, 'Uma vez por temporada, dê o seu pitaco sobre onde a equipe deve evoluir. O efeito aparece no meio do ano e depende da relação com o engenheiro.'),
        FOCUS.map(([f, d]) => h('button', { class: 'opt ' + (p.devFocus === f ? 'on' : ''), disabled: half ? null : 'disabled', style: { opacity: half ? 1 : .45 }, onclick: () => { p.devFocus = f; S.news.add(`Você pediu foco em ${f.toLowerCase()} no carro.`); ui.refresh(); } }, h('b', null, f), h('span', null, d))),
        h('div', { class: 'grow' }),
        h('div', { class: 'tiny ' + (half ? 'dim' : 'warn') }, half ? (p.devFocus ? `Foco escolhido: ${p.devFocus}` : 'Escolha o foco até o meio da temporada.') : 'Disponível apenas até a metade da temporada.')
      );

      return h('div', { class: 'screen' }, ui.head('Pessoas e mídia', 'Relações, academia de pilotos e desenvolvimento do carro'), h('div', { class: 'cols3' }, people, media, dev));
    }
  };
})();
