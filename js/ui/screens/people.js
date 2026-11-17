/* Pessoas e mídia: escolha de Agentes especializados, engenheiro, duelo H2H, Academia e desenvolvimento. */
(function () {
  const ui = Game.ui, h = ui.h, D = Game.data, S = Game.systems, C = D.categories;
  const FOCUS = [['Aerodinâmica', 'downforce e eficiência'], ['Motor', 'potência e entrega'], ['Confiabilidade', 'menos quebras'], ['Chassi e pneus', 'tração e desgaste'], ['Ritmo de classificação', 'volta rápida']];

  function interview(s) {
    ui.modal({ title: 'Entrevista', body: 'Como você vai responder à imprensa?', stack: true, actions: D.interview.map(t => ({ label: t.label, icon: 'mic', fn: () => {
      const r = S.pressure.interview(s, t.id);
      ui.modal({ title: 'Entrevista', body: h('div', { class: 'col' }, h('div', null, r.text), r.extra ? h('div', { class: 'warn' }, r.extra) : null), actions: [{ label: 'OK', cls: 'primary', fn: () => { ui.refresh(); } }] });
    } })) });
  }

  function openAgentPicker(s) {
    const p = s.player;
    const curLv = C[p.catId].level;
    const curAg = S.contracts.ensureAgent(p);
    const catNameForLv = lv => {
      const found = Object.values(C).find(c => c.level === lv);
      return found ? found.short : 'base';
    };

    const body = h('div', { class: 'col', style: { gap: '.55rem' } },
      h('div', { class: 'small mut' }, 'Cada agente cobra uma comissão anual sobre seus salários e bônus, mas oferece uma vantagem estratégica diferente na carreira.'),
      (D.agents || []).map(ag => {
        const isCurrent = curAg && curAg.id === ag.id;
        const locked = curLv < (ag.minLv || 0);
        return h('div', { class: 'tile', style: { gap: '.3rem', opacity: locked ? .55 : 1, borderColor: isCurrent ? 'var(--accent-line)' : null } },
          h('div', { class: 'row between' },
            h('div', { class: 'row gap-s' },
              h('b', null, ag.name),
              ui.badge(ag.role, 'info')
            ),
            h('div', { class: 'row gap-s' },
              ui.badge(`Comissão ${Math.round(ag.cut * 100)}%`, 'warn'),
              locked
                ? ui.badge(`Nível ${catNameForLv(ag.minLv)}`)
                : isCurrent
                  ? ui.badge('Atual', 'ok')
                  : ui.btn('Contratar', () => {
                      p.agent = ag.id;
                      S.news.add(`Você contratou ${ag.name} (${ag.role}) como seu agente.`, 'good');
                      S.career.save();
                      document.querySelectorAll('.overlay').forEach(o => o.remove());
                      ui.toast(`Agente contratado: ${ag.name}`);
                      ui.refresh();
                    }, 'sm primary')
            )
          ),
          h('div', { class: 'tiny ok' }, `Especialidade: ${ag.perk}`),
          h('div', { class: 'tiny mut' }, ag.desc)
        );
      })
    );

    const actions = [{ label: 'Fechar' }];
    if (curAg) {
      actions.unshift({
        label: `Dispensar ${curAg.name}`,
        fn: () => {
          p.agent = null;
          S.career.save();
          ui.toast('Agente dispensado');
          ui.refresh();
        }
      });
    }

    ui.modal({ title: 'Escolher Agente de Pilotos', body, width: '40rem', actions });
  }

  const person = (name, role, right, extra) => h('div', { class: 'tile', style: { flexDirection: 'row', alignItems: 'center', gap: '.7rem' } }, ui.avatar(name), h('div', { class: 'grow' }, h('b', null, name), h('div', { class: 'tiny mut' }, role), extra || null), right || null);

  ui.screens.people = {
    render() {
      const s = Game.state, p = s.player, inSeason = s.phase === 'season' && s.season;
      const inF1 = p.catId === 'f1' || !!(s.flags && s.flags.wasF1);
      const acad = !inF1 ? S.contracts.ensureAcademy(p) : null;
      const curAg = S.contracts.ensureAgent(p);

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
        person(
          curAg ? curAg.name : 'Sem agente',
          curAg ? `${curAg.role} · comissão ${Math.round(curAg.cut * 100)}%` : 'contrate um especialista para negociar e gerenciar sua carreira',
          ui.btn(curAg ? 'Trocar' : 'Escolher', () => openAgentPicker(s), 'sm ' + (curAg ? '' : 'primary')),
          curAg ? h('div', { class: 'tiny ok', style: { marginTop: '.15rem' } }, curAg.perk) : null
        ),
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
          ? (() => {
              const elig = S.contracts.f1TestEligibility(s);
              const testBtnLabel = elig.fp1Eligible ? `FP1 Oficial (${acad.f1TestsLeft})` : `Teste F1 TPC (${acad.f1TestsLeft})`;
              return h('div', { class: 'tile', style: { gap: '.4rem', borderColor: 'var(--accent-line)' } },
                h('div', { class: 'row between' },
                  h('span', { class: 'tchip' },
                    h('i', { class: 'tbar', style: { background: acad.color || 'var(--accent)' } }),
                    h('b', { class: 'small' }, acad.name)
                  ),
                  ui.badge(`${acad.years} ano(s)`, 'acc')
                ),
                ui.bar('Confiança', acad.satisfaction),
                !elig.tpcEligible
                  ? h('div', { class: 'tiny dim' }, `Teste F1 bloqueado (FIA): ${elig.reason}`)
                  : h('div', { class: 'tiny ok' }, elig.fp1Eligible ? 'Licença FP1 (25+ pts SL) ativa: sessões oficiais liberadas.' : 'Licença Grau A ativa: testes privados TPC liberados (25 pts SL para FP1).'),
                h('div', { class: 'row', style: { flexWrap: 'wrap' } },
                  ui.btn(testBtnLabel, () => {
                    const r = S.contracts.runAcademyF1Test(s);
                    if (r.msg) ui.toast(r.msg);
                    ui.refresh();
                  }, 'sm primary', !inSeason || !elig.tpcEligible || (acad.f1TestsLeft || 0) <= 0, 'bolt'),
                  ui.btn(`Propaganda (${acad.mediaDone}/${acad.mediaObligations})`, () => {
                    const r = S.contracts.runAcademyAd(s);
                    if (r.msg) ui.toast(r.msg);
                    ui.refresh();
                  }, 'sm', !inSeason || (acad.mediaDone || 0) >= (acad.mediaObligations || 1), 'mic')
                )
              );
            })()
          : (!inF1
              ? h('div', { class: 'tile', style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '.55rem .7rem' } },
                  h('div', null,
                    h('b', { class: 'small' }, 'Sem Academia de Pilotos'),
                    h('div', { class: 'tiny mut' }, 'Busque apoio de uma equipe de F1 na base')
                  ),
                  ui.btn('Buscar', () => {
                    const r = S.contracts.seekAcademy(s);
                    if (r.msg) ui.toast(r.msg);
                    ui.refresh();
                  }, 'sm', false, 'users')
                )
              : null),
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
      const curTeam = p.teamId ? S.world.team(s, p.catId, p.teamId) : null;
      const carParts = curTeam ? S.world.ensureCarParts(curTeam) : null;
      const startParts = (curTeam && curTeam.seasonStartParts) || carParts;
      const PART_LABELS = [
        ['aero', 'Aerodinâmica'],
        ['power', 'Motor'],
        ['rel', 'Confiabilidade'],
        ['chassis', 'Chassi e pneus'],
        ['quali', 'Ritmo de classificação']
      ];

      const telemetryBox = (curTeam && carParts)
        ? h('div', { class: 'col', style: { gap: '.28rem', padding: '.45rem .55rem', borderRadius: '.6rem', background: 'var(--surface-2)', border: '1px solid var(--line)' } },
            h('div', { class: 'row between' },
              h('span', { class: 'pt' }, `Telemetria · ${curTeam.name}`),
              ui.badge(`CAR OVR ${curTeam.car.toFixed(1)}`, 'acc')
            ),
            PART_LABELS.map(([k, label]) => {
              const v = carParts[k] || 70;
              const d = Math.round((v - (startParts[k] || v)) * 10) / 10;
              return h('div', { class: 'row between tiny' },
                h('span', { class: 'mut', style: { width: '7.8rem' } }, label),
                h('div', { class: 'grow' }, ui.meter(v, { max: 99, segments: 16 })),
                h('span', { class: 'mono', style: { width: '3.8rem', textAlign: 'right' } },
                  Math.round(v),
                  d > 0 ? h('span', { class: 'ok' }, ` +${d.toFixed(1)}`) : ''
                )
              );
            })
          )
        : null;

      const dev = ui.panel({ title: 'Desenvolvimento & Telemetria do Carro' },
        telemetryBox,
        h('div', { class: 'tiny mut' }, 'Direcione o pacote de evolução do meio do ano para um subsistema específico:'),
        FOCUS.map(([f, d]) => h('button', { class: 'opt ' + (p.devFocus === f ? 'on' : ''), style: { padding: '.42rem .6rem', opacity: half ? 1 : .45 }, disabled: half ? null : 'disabled', onclick: () => { p.devFocus = f; S.news.add(`Você pediu foco em ${f.toLowerCase()} no carro.`); ui.refresh(); } }, h('b', null, f), h('span', null, d))),
        h('div', { class: 'grow' }),
        h('div', { class: 'tiny ' + (half ? 'dim' : 'warn') }, half ? (p.devFocus ? `Foco escolhido: ${p.devFocus}` : 'Escolha o foco até o meio da temporada.') : 'Disponível apenas até a metade da temporada.')
      );

      return h('div', { class: 'screen' }, ui.head('Pessoas e mídia', 'Agentes especializados, relações e desenvolvimento do carro'), h('div', { class: 'cols3' }, people, media, dev));
    }
  };
})();
