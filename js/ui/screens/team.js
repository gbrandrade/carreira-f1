/* Minha Escuderia (Modo Dono de Equipe / Boss): fundar equipe de F1, evoluir subsistemas do carro e contratar pilotos. */
(function () {
  const ui = Game.ui, h = ui.h, U = Game.utils, D = Game.data, S = Game.systems, W = S.world, Own = S.owner, M = U.fmtMoney;

  ui.teamSetup = { name: '', color: '#E80020', engineId: 'mer', driveSelf: true };

  function openHireModal(s, slotIdx, replaceDriver) {
    const p = s.player;
    const t = Own.syncCustomTeam(s);
    if (!t) return;

    const currentIds = new Set(Own.teamLineup(s).map(x => x.id));
    const candidates = (s.world.drivers || [])
      .filter(d => (d.cat === 'f1' || d.cat === 'f2') && !currentIds.has(d.id) && (s.year - d.birth) >= 18)
      .map(d => {
        const ger = W.rating(d, s.year);
        const buyout = Math.round(Math.max(2000000, (ger - 72) * 1200000) / 500000) * 500000;
        const curTeam = d.teamId ? (W.team(s, d.cat, d.teamId) || {}).name : 'Livre';
        return { d, ger, buyout, curTeam };
      })
      .sort((a, b) => b.ger - a.ger)
      .slice(0, 12);

    const body = h('div', { class: 'col', style: { gap: '.45rem' } },
      h('div', { class: 'small mut' }, replaceDriver
        ? `Substituindo ${replaceDriver.name} no Assento ${slotIdx + 1}.`
        : `Contratando piloto titular para o Assento ${slotIdx + 1}.`
      ),
      candidates.map(c => h('div', { class: 'tile', style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '.5rem .7rem' } },
        h('div', { class: 'row gap-s' },
          ui.rate(c.ger),
          h('div', null,
            h('b', { class: 'small' }, c.d.name),
            h('div', { class: 'tiny mut' }, `${c.d.country} · ${s.year - c.d.birth}a · ${c.curTeam}`)
          )
        ),
        ui.btn(`Contratar (${M(c.buyout)})`, () => {
          const r = Own.hireDriver(s, c.d.id, replaceDriver ? replaceDriver.id : null);
          if (r.msg) ui.toast(r.msg);
          document.querySelectorAll('.overlay').forEach(o => o.remove());
          ui.refresh();
        }, 'sm primary', p.money < c.buyout)
      ))
    );

    ui.modal({ title: `Mercado de Pilotos · ${t.name}`, body, width: '38rem', actions: [{ label: 'Cancelar' }] });
  }

  function renderFounding(s) {
    const p = s.player;
    const st = ui.teamSetup;
    if (!st.name) st.name = `${p.name.split(' ').slice(-1)[0]} F1 Team`;
    const canAfford = p.money >= Own.FOUND_COST;
    const eng = Own.ENGINES.find(e => e.id === st.engineId) || Own.ENGINES[0];

    const nameInput = h('input', {
      type: 'text',
      value: st.name,
      maxlength: 28,
      placeholder: 'Ex.: Apex Racing F1',
      oninput: e => { st.name = e.target.value; }
    });

    const left = ui.panel({ title: 'Identidade da Escuderia', cls: 'marks' },
      h('label', { class: 'col gap-s' },
        h('span', { class: 'small mut' }, 'Nome oficial da equipe'),
        nameInput
      ),
      h('div', { class: 'col gap-s' },
        h('span', { class: 'small mut' }, 'Cor principal da pintura'),
        h('div', { class: 'row', style: { flexWrap: 'wrap' } }, Own.COLORS.map(([label, hex]) =>
          h('button', {
            class: 'btn sm ' + (st.color === hex ? 'on' : ''),
            onclick: () => { st.color = hex; ui.refresh(); }
          }, h('i', { style: { display: 'inline-block', width: '.65rem', height: '.65rem', borderRadius: '50%', background: hex } }), label)
        ))
      ),
      h('div', { class: 'col gap-s' },
        h('span', { class: 'small mut' }, 'Seu papel na equipe'),
        ui.tabs([
          [true, 'Piloto-Proprietário'],
          [false, 'Apenas Chefe (Boss)']
        ], st.driveSelf, v => { st.driveSelf = v; ui.refresh(); })
      ),
      h('div', { class: 'grow' }),
      h('div', { class: 'tiny dim' }, st.driveSelf
        ? 'Você ocupa o Assento #1, pilota nas corridas e gerencia fábrica, peças e finanças.'
        : 'Você comanda do Pit Wall, contrata dois pilotos titulares e administra toda a operação.'
      )
    );

    const right = ui.panel({ title: 'Fornecedor de Motor & Investimento' },
      h('div', { class: 'col', style: { gap: '.4rem' } }, Own.ENGINES.map(e =>
        h('button', {
          class: 'opt ' + (st.engineId === e.id ? 'on' : ''),
          onclick: () => { st.engineId = e.id; ui.refresh(); }
        },
          h('div', { class: 'row between' },
            h('b', null, e.name),
            ui.badge(`${M(e.cost)}/ano`, 'warn')
          ),
          h('span', null, e.desc)
        )
      )),
      h('div', { class: 'grow' }),
      h('div', { class: 'row between', style: { borderTop: '1px solid var(--line)', paddingTop: '.5rem' } },
        h('span', { class: 'mut small' }, 'Taxa de entrada FIA + Fábrica'),
        h('b', { class: 'mono ' + (canAfford ? 'ok' : 'bad') }, M(Own.FOUND_COST))
      )
    );

    return h('div', { class: 'screen' },
      ui.head('Minha Escuderia', `Funde sua própria equipe de Fórmula 1 · Caixa atual: ${M(p.money)}`),
      h('div', { class: 'cols2' }, left, right),
      ui.panel({ cls: 'cta' },
        h('div', { class: 'msg' }, canAfford
          ? h('span', null, 'Capital suficiente para registrar ', h('b', null, st.name), ' no grid da F1.')
          : `Acumule ${M(Own.FOUND_COST)} para fundar sua própria escuderia de Fórmula 1.`
        ),
        ui.btn(`Fundar Escuderia (${M(Own.FOUND_COST)})`, () => {
          const r = Own.foundTeam(s, st);
          if (r.msg) ui.toast(r.msg);
          ui.refresh();
        }, 'primary lg', !canAfford, 'shield')
      )
    );
  }

  ui.screens.team = {
    render() {
      const s = Game.state, p = s.player;
      if (!Own.hasTeam(p)) return renderFounding(s);

      const t = Own.syncCustomTeam(s);
      const ot = p.ownedTeam;
      const pt = W.ensureCarParts(t);
      const startPt = t.seasonStartParts || pt;
      const eng = Own.ENGINES.find(e => e.id === ot.engineId) || Own.ENGINES[0];
      const lineup = Own.teamLineup(s);

      let cPos = '—', cPts = 0;
      if (s.season && s.season.catId === 'f1' && s.season.standings && s.season.standings.teams) {
        const teams = Object.keys(s.season.standings.teams)
          .map(id => ({ id, pts: s.season.standings.teams[id] }))
          .sort((a, b) => b.pts - a.pts);
        const idx = teams.findIndex(x => x.id === ot.id);
        if (idx >= 0) { cPos = (idx + 1) + 'º'; cPts = teams[idx].pts; }
      }

      const hero = h('div', { class: 'statrow' },
        ui.panel({}, ui.stat('OVR do Carro', t.car.toFixed(1), `Motor ${eng.name.split(' ')[0]}`, null, ui.ring(t.car, 100, { size: 58, text: Math.round(t.car), color: ot.color }))),
        ui.panel({}, ui.stat('Construtores', cPos, s.phase === 'season' ? `${cPts} pontos` : 'entressafra', null, ui.plate('trophy', 'var(--gold)', true))),
        ui.panel({}, ui.stat('Infraestrutura', `Fáb. Nv.${ot.factoryLv}`, `Túnel Vento Nv.${ot.windTunnelLv}`, null, ui.plate('sim', 'var(--info)', true))),
        ui.panel({}, ui.stat('Caixa Pessoal', M(p.money), `${ot.titleCount || 0} título(s) constr.`, null, ui.plate('wallet', 'var(--ok)', true)))
      );

      const partsPanel = ui.panel({ title: 'Telemetria & Evolução do Carro (Subsistemas)', cls: 'marks' },
        h('div', { class: 'col', style: { gap: '.5rem' } }, Own.PARTS_META.map(pm => {
          const val = pt[pm.key] || 75;
          const diff = Math.round((val - (startPt[pm.key] || val)) * 10) / 10;
          const cost = Own.partUpgradeCost(val, ot.factoryLv);
          return h('div', { class: 'tile', style: { padding: '.5rem .7rem', gap: '.3rem' } },
            h('div', { class: 'row between' },
              h('div', { class: 'row gap-s' },
                h('b', { class: 'small' }, pm.name),
                diff > 0 ? ui.badge(`+${diff.toFixed(1)} temp.`, 'ok') : null
              ),
              h('div', { class: 'row gap-s' },
                ui.rate(val),
                ui.btn(`Evoluir (${M(cost)})`, () => {
                  const r = Own.upgradeSubsystem(s, pm.key);
                  if (r.msg) ui.toast(r.msg);
                  ui.refresh();
                }, 'sm primary', val >= 99 || p.money < cost, 'plus')
              )
            ),
            ui.meter(val, { max: 99, auto: false, color: ot.color }),
            h('div', { class: 'tiny dim' }, pm.desc)
          );
        }))
      );

      const facCost = Own.facilityUpgradeCost(ot.factoryLv || 1);
      const windCost = Own.facilityUpgradeCost(ot.windTunnelLv || 1);

      const rightPanel = ui.panel({
        title: 'Pilotos & Fábrica',
        right: ui.btn(Own.isBossOnly(p) ? 'Assumir Cockpit' : 'Modo Só Chefe', () => {
          const r = Own.toggleBossOnly(s);
          if (r.msg) ui.toast(r.msg);
          ui.refresh();
        }, 'sm', s.phase === 'season', 'swap')
      },
        h('div', { class: 'pt' }, 'Dupla de Pilotos Titulares'),
        [0, 1].map(idx => {
          const drv = lineup[idx];
          if (!drv) {
            return h('div', { class: 'tile', style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '.55rem .7rem' } },
              h('span', { class: 'small mut' }, `Assento #${idx + 1} vago`),
              ui.btn('Contratar', () => openHireModal(s, idx, null), 'sm primary')
            );
          }
          return h('div', { class: 'tile', style: { flexDirection: 'row', alignItems: 'center', gap: '.65rem', padding: '.55rem .7rem' } },
            ui.avatar(drv.name),
            h('div', { class: 'grow' },
              h('div', { class: 'row gap-s' }, h('b', { class: 'small' }, drv.name), drv.isPlayer ? ui.badge('Você (Dono)', 'acc') : null),
              h('div', { class: 'tiny mut' }, drv.isPlayer ? 'Piloto-Proprietário' : `Salário: ${M(drv.salary)}/ano`)
            ),
            ui.rate(drv.ger),
            !drv.isPlayer ? ui.btn('Trocar', () => openHireModal(s, idx, drv), 'sm') : null
          );
        }),
        h('div', { class: 'pt', style: { marginTop: '.35rem' } }, 'Infraestrutura da Equipe'),
        h('div', { class: 'tile', style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '.5rem .7rem' } },
          h('div', null,
            h('b', { class: 'small' }, `Fábrica & Simulador (Nv. ${ot.factoryLv}/4)`),
            h('div', { class: 'tiny mut' }, 'Reduz custo de peças e aumenta ganho anual')
          ),
          ot.factoryLv < 4
            ? ui.btn(`Melhorar (${M(facCost)})`, () => { const r = Own.upgradeFacility(s, 'factory'); if (r.msg) ui.toast(r.msg); ui.refresh(); }, 'sm', p.money < facCost)
            : ui.badge('Máximo', 'ok')
        ),
        h('div', { class: 'tile', style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '.5rem .7rem' } },
          h('div', null,
            h('b', { class: 'small' }, `Túnel de Vento (Nv. ${ot.windTunnelLv}/4)`),
            h('div', { class: 'tiny mut' }, 'Aumenta potência de cada atualização aerodinâmica')
          ),
          ot.windTunnelLv < 4
            ? ui.btn(`Melhorar (${M(windCost)})`, () => { const r = Own.upgradeFacility(s, 'wind'); if (r.msg) ui.toast(r.msg); ui.refresh(); }, 'sm', p.money < windCost)
            : ui.badge('Máximo', 'ok')
        ),
        h('div', { class: 'grow' }),
        h('div', { class: 'tiny dim' }, `Motor: ${eng.name} (${M(eng.cost)}/ano). Premiação de Construtores e patrocinadores da equipe são pagos no fim do ano.`)
      );

      return h('div', { class: 'screen' },
        ui.head(ot.name, `Escuderia Oficial de Fórmula 1 · ${s.year}`),
        hero,
        h('div', { class: 'cols-3-2' }, partsPanel, rightPanel)
      );
    }
  };
})();
