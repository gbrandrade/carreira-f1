/* Corrida: decisões > simulação > rádio tático (F2/F1) > resultado com resumo, gráfico e tabela. */
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

  function showSimSummaryModal(sm, done) {
    const body = h('div', { class: 'col', style: { gap: '.6rem' } },
      h('div', { class: 'mut small' }, sm.callUp
        ? `Você acompanhou as etapas ${sm.fromRound}ª a ${sm.toRound}ª no simulador da equipe.`
        : `Etapas ${sm.fromRound}ª a ${sm.toRound}ª simuladas até o próximo momento-chave da temporada.`
      ),
      !sm.callUp ? h('div', { class: 'kv3' },
        [['Pontos somados', '+' + sm.pts], ['Vitórias', sm.wins], ['Pódios', sm.podiums]].map(([k, v]) =>
          h('div', null, h('div', { class: 'k' }, k), h('div', { class: 'v' }, v))
        )
      ) : null,
      sm.callUp
        ? h('div', { class: 'row', style: { marginTop: '.2rem' } },
            ui.badge('CONVOCAÇÃO F1', 'ok'),
            h('span', { class: 'small' }, 'Um piloto titular ficou indisponível e você assumirá o carro titular no próximo GP!')
          )
        : sm.isMid
          ? h('div', { class: 'row', style: { marginTop: '.2rem' } },
              ui.badge('MEIO DE TEMPORADA', 'info'),
              h('span', { class: 'small' }, `Você está em ${sm.pos}º no campeonato. Aproveite para definir o foco de desenvolvimento do carro em Pessoas e mídia!`)
            )
          : sm.decisive
            ? h('div', { class: 'row', style: { marginTop: '.2rem' } },
                ui.badge('DISPUTA DE TÍTULO', 'acc'),
                h('span', { class: 'small' }, `Você está em ${sm.pos}º no campeonato (${sm.gap === 0 ? 'líder' : `-${sm.gap} pts para o líder`}) antes da reta final!`)
              )
            : h('div', { class: 'small mut' }, `Temporada encerrada em ${sm.pos}º lugar.`)
    );
    ui.modal({
      title: sm.callUp ? 'Oportunidade na Fórmula 1!' : sm.isMid ? 'Parada de meio de temporada' : sm.decisive ? 'Reta final decisiva!' : 'Simulação concluída',
      body,
      actions: [{ label: 'Continuar', cls: 'primary', icon: 'right', fn: done }]
    });
  }

  ui.screens.race = {
    render() {
      const s = Game.state;
      if (s.phase !== 'season' || !s.season) return h('div', { class: 'screen' }, ui.head('Corrida'), ui.panel({ cls: 'grow' }, h('div', { class: 'empty' }, ui.plate('flag', null, true), h('h3', null, 'Nenhuma etapa em andamento'), h('div', null, 'Assine um contrato e inicie a temporada.'), ui.btn('Ir para Contrato', () => ui.go('contract'), 'primary', false, 'doc'))));
      return ui.race.week ? this.result(s) : this.pre(s);
    },
    pre(s) {
      const p = s.player, se = s.season, cal = se.cal[se.round], cat = C[se.catId], r = ui.race, inj = p.injury > 0, cc = cal.circuit;
      const isJunior = cat.level <= 6;
      const isRes = S.career.isReserve(p);
      const isCallUp = isRes && !!se.reserveCallUp;

      const stageTag = isCallUp
        ? ui.badge('convocado para correr', 'ok')
        : isRes
          ? ui.badge('piloto reserva', 'info')
          : isJunior && S.career.isKeyJuniorRound(s)
            ? ui.badge(se.round === 0 ? 'abertura' : se.round === Math.floor(se.cal.length / 2) ? 'meio de temporada' : 'decisão de título', 'acc')
            : null;

      const info = ui.panel({ title: `Etapa ${cal.idx + 1} de ${se.cal.length}`, cls: 'marks', right: stageTag },
        h('div', { class: 'track-box' }, ui.track(cc.id)),
        h('div', { style: { fontSize: '1.5rem', fontWeight: 650, letterSpacing: '-.03em', lineHeight: 1.1 } }, cc.name),
        h('div', { class: 'row', style: { flexWrap: 'wrap' } }, ui.ccode(cc.country), ui.badge(`${U.monthOfWeek(cal.week)} ${s.year}`), cal.sprint ? ui.badge('fim de semana de sprint', 'acc') : null, ui.badge(cc.rain + '% de chuva', cc.rain >= 30 ? 'warn' : '')),
        h('div', { class: 'kv3' }, [['Perfil', PROF[cc.prof]], ['Grid importa', cc.q >= 1.5 ? 'Alta' : cc.q >= 1 ? 'Média' : 'Baixa'], ['Formato', cat.races.concat(cal.sprint ? [cat.sprint] : []).length + ' corrida(s)']].map(([k, v]) => h('div', null, h('div', { class: 'k' }, k), h('div', { class: 'v', style: { fontSize: '.78rem' } }, v)))),
        inj ? ui.badge(`Lesionado: ${p.injury} etapa(s)`, 'bad') : null
      );

      const dec = isRes && !isCallUp
        ? ui.panel({ title: 'Função de Piloto Reserva' },
            h('div', { class: 'empty' },
              ui.plate('sim', 'var(--info)', true),
              h('h3', null, 'Trabalho nos boxes e simulador'),
              h('div', { class: 'small mut' }, 'Você não está escalado como titular neste GP, mas acompanha a equipe e evolui no simulador. Caso algum titular se lesione ou adoeça, você será convocado imediatamente.')
            )
          )
        : ui.panel({ title: 'Decisões pré-corrida' },
            group('Estratégia de pneus', 'tyre', [[0, 'Conservadora', 'brilha no fim e na chuva', 1, 1], [1, 'Equilibrada', 'ritmo constante', 2, 2], [2, 'Agressiva', 'muito ritmo + bônus com SC', 3, 3]]),
            group('Setup do carro', 'setup', [['dw', 'Carga aero', 'curvas e pista molhada'], ['bal', 'Equilibrado', 'seguro em qualquer pista'], ['pw', 'Retas', 'velocidade final máxima']]),
            group('Agressividade', 'risk', [[0, 'Cautelosa', 'evita batidas e chuva', 1, 1], [1, 'Normal', 'equilibrada', 2, 2], [2, 'Agressiva', 'ultrapassagens no limite', 3, 3]]),
            inj ? h('div', { class: 'col' }, h('div', { class: 'pt' }, 'Lesão'), ui.tabs([[false, 'Descansar'], [true, 'Correr lesionado']], r.inj, v => { r.inj = v; ui.refresh(); })) : null,
            h('div', { class: 'grow' }),
            h('div', { class: 'tiny dim' }, 'Acertar o setup do perfil da pista dá grande ganho de tempo. Pneus e agressividade definem o ritmo, desgaste e risco de abandono.')
          );

      const finishPreparedRound = wk => {
        S.career.commitRound(wk);
        r.week = wk;
        r.tab = wk.rest ? 'q' : wk.results.length - 1;
        r.inj = false;
        ui.refresh();
      };

      const go = () => ui.simulate(['Classificação', 'Largada', 'Corrida', 'Apuração'], () => {
        const wk = S.career.prepareRound(Object.assign({}, r.choices, { raceInjured: r.inj, interactive: true }));
        if (wk.midEvent) {
          const ev = wk.midEvent;
          ui.modal({
            title: ev.title,
            body: h('div', { class: 'col', style: { gap: '.6rem' } },
              h('div', { class: 'row', style: { alignItems: 'flex-start' } }, ui.plate('mic', 'var(--accent)', true), h('div', { class: 'mut' }, ev.text))
            ),
            stack: true,
            actions: ev.options.map(opt => ({
              label: `${opt.label} — ${opt.sub}`,
              icon: 'right',
              fn: () => {
                S.race.applyMidRaceChoice(s, wk, opt.id);
                finishPreparedRound(wk);
              }
            }))
          });
          return;
        }
        finishPreparedRound(wk);
      });

      const fastForward = () => {
        const sm = S.career.fastForwardToMilestone(s);
        ui.renderChrome();
        if (sm) {
          showSimSummaryModal(sm, () => {
            if (se.finished) ui.finishSeason();
            else ui.refresh();
          });
        } else {
          ui.refresh();
        }
      };

      const rest = (inj && !r.inj) || (isRes && !isCallUp);
      const canFastForward = (isJunior && !isRes && se.round < se.cal.length - 1) || (isRes && !isCallUp);

      return h('div', { class: 'screen' }, ui.head(cc.name, `${cat.name} · ${s.year}`), h('div', { class: 'cols2' }, info, dec),
        ui.panel({ cls: 'cta' },
          h('div', { class: 'msg' },
            isRes && !isCallUp
              ? 'Acompanhe o fim de semana no simulador ou avance até sua próxima convocação.'
              : rest
                ? 'Você vai perder esta etapa para se recuperar.'
                : h('span', null, 'Tudo pronto para a ', h('b', null, 'largada'), '.')
          ),
          h('div', { class: 'row' },
            canFastForward ? ui.btn(isRes ? 'Simular até convocação' : 'Simular até momento-chave', fastForward, '', false, 'right') : null,
            ui.btn(isRes && !isCallUp ? 'Acompanhar GP' : rest ? 'Descansar' : 'Largar', go, 'primary lg', false, rest ? 'heart' : 'play')
          )
        )
      );
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
        r.week = null;
        const out = S.career.afterRound();
        const afterEvents = () => {
          ui.renderChrome();
          if (se.finished) ui.finishSeason();
          else ui.go('hub');
        };
        ui.runEvents(out.events, afterEvents);
      };

      return h('div', { class: 'screen' }, ui.head(`Resultado · ${wk.circuit.name}`, wk.rest ? 'Você ficou fora desta etapa.' : `${total} pontos no fim de semana`, ui.tabs(tabs, r.tab, t => { r.tab = t; ui.refresh(); })), hero,
        h('div', { class: 'cols-3-2' }, left, ui.panel({ title: wk.circuit.name }, ui.table([{ h: '#', w: '2.4rem' }, { h: 'Piloto' }, { h: 'Equipe' }, { h: 'Pts', cls: 'n', w: '3rem' }], rows))),
        ui.panel({ cls: 'cta' }, h('div', { class: 'msg' }, 'Fim de semana concluído.'), ui.btn('Continuar', next, 'primary lg', false, 'right')));
    }
  };
})();
