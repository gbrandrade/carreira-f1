/* Central do piloto: métricas, radar de atributos, estado (Reputação, Popularidade, Saúde) e próxima etapa. */
(function () {
  const ui = Game.ui, h = ui.h, U = Game.utils, C = Game.data.categories, S = Game.systems, A = S.attributes, M = U.fmtMoney;
  const AX = [{ label: 'RIT' }, { label: 'RAC' }, { label: 'ATE' }, { label: 'EXP' }];

  ui.screens.hub = {
    render() {
      const s = Game.state, p = s.player, se = s.season, cat = C[p.catId], now = A.playerAttrs(p, s.year), pk = A.playerPeak(p);
      const capEXP = Math.min(99, A.E(28) + pk.EXPb), cap = { RIT: pk.RIT, RAC: pk.RAC, ATE: pk.ATE, EXP: capEXP }, capGer = A.playerCapGer(p);
      const sl = S.superlicense.status(p, s.year);
      const isRes = S.career.isReserve(p);
      const acad = S.contracts.ensureAcademy(p);
      let pos = null, pts = 0;
      if (se && s.phase === 'season') { const r = S.race.ranked(se).find(x => x.id === 'player'); if (r) { pos = r.pos; pts = r.pts; } }

      const stats = h('div', { class: 'statrow' },
        ui.panel({}, ui.stat('GER atual', now.GER, `teto ${capGer}`, null, ui.ring(now.GER, 100, { size: 58, cap: capGer, text: '', color: 'var(--accent)' }))),
        ui.panel({}, ui.stat('Classificação', isRes ? 'RES' : (pos ? pos + 'º' : '—'), s.phase === 'season' ? `${pts} pontos · ${cat.short}` : 'fora de temporada', null, ui.plate('trophy', 'var(--gold)', true))),
        ui.panel({}, ui.stat('Superlicença', `${sl.total}/${sl.need}`, sl.eligible ? 'apto para a F1' : `idade ${sl.age}/18 · monopostos ${p.singleSeaterSeasons}/2`, null, ui.ring(sl.total, sl.need, { size: 58, text: '', color: sl.eligible ? 'var(--ok)' : 'var(--warn)' }))),
        ui.panel({}, ui.stat('Caixa', M(p.money), `manutenção ${M(S.economy.upkeep(s))}/ano`, null, ui.plate('wallet', 'var(--ok)', true))));

      const radar = ui.panel({ title: 'Atributos', cls: 'marks', right: h('div', { class: 'legend' }, h('span', null, h('i', { style: { background: 'var(--accent)' } }), 'atual'), h('span', null, h('i', { style: { border: '1px dashed var(--text-2)' } }), 'teto')) },
        h('div', { class: 'grow' }, ui.radar(AX, [{ values: [cap.RIT, cap.RAC, cap.ATE, cap.EXP], color: 'var(--text-2)', dashed: true }, { values: [now.RIT, now.RAC, now.ATE, now.EXP] }], { min: 20 })),
        h('div', { class: 'row between' }, ['RIT', 'RAC', 'ATE', 'EXP'].map(k => h('div', { class: 'col gap-s center' }, h('span', { class: 'tiny dim mono' }, k), h('b', { class: 'mono' }, Math.round(now[k]), h('span', { class: 'dim', style: { fontWeight: 400 } }, '/' + Math.round(cap[k])))))));

      const rep = p.reputation != null ? p.reputation : 45;
      const estado = ui.panel({ title: 'Estado', right: s.phase === 'season' && p.teamRole ? ui.badge(p.teamRole, p.teamRole === '1º Piloto' ? 'ok' : p.teamRole === 'Piloto Reserva' ? 'info' : '') : null },
        h('div', { class: 'pt', style: { marginTop: '.1rem' } }, 'Imagem e entorno'),
        ui.bar('Reputação', rep),
        ui.bar('Popular.', p.popularity),
        ui.bar('Família', p.pressure.family),
        h('div', { class: 'pt', style: { marginTop: '.4rem' } }, 'Condição física e mental'),
        ui.bar('Físico', p.phys),
        ui.bar('Mente', p.mental),
        (s.phase === 'season' && p.rival)
          ? h('div', { style: { marginTop: '.2rem', paddingTop: '.35rem', borderTop: '1px solid var(--line)' } },
              h('div', { class: 'row between tiny' },
                h('span', { class: 'pt' }, 'Rival pelo título'),
                h('b', { class: 'small' }, p.rival.name)
              ),
              ui.bar('Tensão', p.rival.tension)
            )
          : null,
        h('div', { class: 'grow' }),
        p.injury > 0 ? ui.badge(`Lesionado · ${p.injury} etapa(s)`, 'bad') : h('div', { class: 'row', style: { flexWrap: 'wrap' } }, p.traits.map(id => ui.badge(Game.data.traits.find(t => t.id === id).name)))
      );

      return h('div', { class: 'screen' }, ui.head(`Olá, ${p.name.split(' ')[0]}`, `${cat.name} · ${s.year}${p.contract ? ' · ' + p.contract.teamName : ''}${acad ? ' · ' + acad.name : ''}`), stats, h('div', { class: 'hubmid' }, radar, estado, this.next(s)));
    },
    next(s) {
      const p = s.player, se = s.season;
      const isRes = S.career.isReserve(p);
      const acad = S.contracts.ensureAcademy(p);
      let title, sub, btn, art = null, info = null, rightTag = null;
      const isBoss = S.owner && S.owner.isBossOnly(p);
      if (s.phase === 'offseason' && !p.contract && !isBoss) { title = 'Fora de temporada'; sub = 'Você precisa de um contrato para disputar o próximo ano.'; btn = ui.btn('Negociar contrato', () => ui.go('contract'), 'primary lg', false, 'doc'); }
      else if (s.phase === 'offseason') { title = `Temporada ${s.year}`; sub = isBoss ? `Chefe de Equipe · ${p.ownedTeam.name}` : `Contrato assinado com ${p.contract.teamName}.`; btn = ui.btn('Iniciar temporada', () => { S.career.startSeason(); ui.go('hub'); }, 'primary lg', false, 'play'); }
      else if (se.finished) { title = 'Temporada encerrada'; sub = 'Todas as etapas foram disputadas.'; btn = ui.btn('Encerrar temporada', () => ui.finishSeason(), 'primary lg', false, 'check'); }
      else {
        const n = se.cal[se.round];
        const cat = C[se.catId];
        title = n.circuit.name;
        sub = `Etapa ${n.idx + 1} de ${se.cal.length} · ${U.monthOfWeek(n.week)}${n.sprint ? ' · sprint' : ''}`;
        art = ui.track(n.circuit.id);
        if (isRes) rightTag = se.reserveCallUp ? ui.badge('convocado!', 'ok') : ui.badge('reserva', 'info');
        else if (S.career.isKeyJuniorRound(s)) rightTag = ui.badge('momento-chave', 'acc');
        const rivRank = p.rival ? S.race.ranked(se).find(x => x.id === p.rival.id) : null;
        info = h('div', { class: 'row', style: { flexWrap: 'wrap' } },
          ui.ccode(n.circuit.country),
          ui.badge(`${cat.laps} voltas`),
          ui.badge(n.circuit.rain >= 35 ? `${n.circuit.rain}% chuva` : n.circuit.rain >= 15 ? 'Clima instável' : 'Tempo firme', n.circuit.rain >= 35 ? 'warn' : ''),
          rivRank ? ui.badge(`Rival ${ui.driverCode(rivRank.name)} (${rivRank.pos}º)`, 'acc') : null
        );
        btn = ui.btn(isRes && !se.reserveCallUp ? 'Ir para fim de semana' : 'Próxima etapa', () => ui.go('race'), 'primary lg', false, 'flag');
      }
      return ui.panel({ title: 'Próximo passo', cls: 'marks', right: rightTag },
        art ? h('div', { class: 'track-box' }, art) : h('div', { class: 'grow' }, h('div', { class: 'empty' }, ui.plate('flag', null, true))),
        h('div', null, h('div', { style: { fontSize: '1.15rem', fontWeight: 650, letterSpacing: '-.02em' } }, title), h('div', { class: 'small mut' }, sub)),
        info, btn
      );
    }
  };
})();
