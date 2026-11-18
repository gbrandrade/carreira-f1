/* Núcleo da interface: temas, roteador, chrome (menu lateral, barra superior, feed), modais, toasts, auto-ajuste e fluxos compartilhados. */
(function () {
  const ui = Game.ui, h = ui.h, U = Game.utils, C = Game.data.categories, S = Game.systems;
  ui.current = 'menu';
  ui.fullScreens = ['menu', 'creation', 'ending'];
  const NAV = [['Jogo', [['hub', 'Central', 'home'], ['season', 'Temporada', 'calendar'], ['race', 'Corrida', 'flag']]],
    ['Carreira', [['contract', 'Contrato', 'doc'], ['team', 'Escuderia', 'shield'], ['assets', 'Patrimônio', 'wallet'], ['people', 'Pessoas e mídia', 'users']]],
    ['Mundo', [['drivers', 'Pilotos', 'table'], ['records', 'Recordes', 'trophy'], ['career', 'Carreira', 'clock']]]];
  const TITLES = { hub: 'Central do piloto', season: 'Temporada', race: 'Corrida', contract: 'Contrato', team: 'Minha Escuderia', assets: 'Patrimônio', people: 'Pessoas e mídia', drivers: 'Pilotos', records: 'Recordes', career: 'Carreira' };

  // ---- temas (guardados à parte do save)
  ui.prefs = { theme: 'dark', accent: 'red', sound: true };
  try { Object.assign(ui.prefs, JSON.parse(localStorage.getItem('caminho-f1-ui') || '{}')); } catch (e) {}
  ui.applyPrefs = function () {
    document.documentElement.setAttribute('data-theme', ui.prefs.theme); document.documentElement.setAttribute('data-accent', ui.prefs.accent);
    try { localStorage.setItem('caminho-f1-ui', JSON.stringify(ui.prefs)); } catch (e) {}
  };
  ui.applyPrefs();

  ui.go = function (name) { ui.current = name; ui.refresh(); };
  ui.refresh = function () {
    const full = ui.fullScreens.includes(ui.current);
    document.body.classList.toggle('full', full);
    const root = document.getElementById('screen'); root.innerHTML = '';
    root.append(ui.screens[ui.current].render());
    if (!full) ui.renderChrome();
  };

  function feedTag(txt) {
    const t = String(txt || '');
    if (/^BREAKING|^BOMBA|^OFICIAL|^DANÇA|^FIM DE UMA ERA/.test(t)) return 'BREAKING';
    if (/^F1\b|F1:|CONVOCAÇÃO F1|Estreia na F1|era técnica/.test(t)) return 'F1';
    if (/Contrato|oferta|academia|Reserva|ACADEMIA|DEMITIDO/.test(t)) return 'CONTRATO';
    if (/Patrocínio|FALÊNCIA|US\$|Investimento/.test(t)) return 'FINANÇAS';
    if (/Conquista|CAMPEÃO|superlicença/.test(t)) return 'MARCO';
    if (/Desenvolvimento/.test(t)) return 'TÉCNICO';
    return 'PADDOCK';
  }


  function navHasAlert(s, id) {
    const p = s.player;
    if (!p) return false;
    if (id === 'people') {
      const inSeason = s.phase === 'season' && s.season;
      const half = inSeason && s.season.round <= Math.floor(s.season.cal.length / 2);
      const needsDev = half && !p.devFocus && !p.noSeat;
      const acad = S.contracts.ensureAcademy(p);
      const hasTest = inSeason && acad && (acad.f1TestsLeft || 0) > 0 && S.contracts.f1TestEligibility(s).tpcEligible;
      return needsDev || hasTest;
    }
    if (id === 'contract') {
      const hasMidOffers = s.phase === 'season' && s.midSeasonOffers && s.midSeasonOffers.length > 0;
      const hasAcadOffers = s.academyOffers && s.academyOffers.length > 0;
      const needsContract = s.phase === 'offseason' && !p.contract && !(S.owner && S.owner.isBossOnly(p));
      return hasMidOffers || hasAcadOffers || needsContract;
    }
    if (id === 'team') {
      return !(S.owner && S.owner.hasTeam(p)) && p.money >= (S.owner ? S.owner.FOUND_COST : 5e8);
    }
    return false;
  }

  ui.renderChrome = function () {
    const s = Game.state; if (!s || !s.player) return;
    const p = s.player, ger = S.contracts.ger(s), cat = C[p.catId];
    const rail = document.getElementById('rail'); rail.innerHTML = '';
    rail.append(h('div', { class: 'brand' }, h('span', { class: 'logo' }, 'F1'), h('span', null, 'Caminho')));
    NAV.forEach(([g, items]) => { rail.append(h('div', { class: 'navh' }, g)); items.forEach(([id, label, ic]) => rail.append(h('button', { class: 'nav ' + (ui.current === id ? 'active' : ''), onclick: () => ui.go(id) }, ui.icon(ic, 16), label, navHasAlert(s, id) ? h('span', { class: 'nav-dot', title: 'Ação disponível' }) : null))); });
    rail.append(h('div', { class: 'rail-foot' }, h('button', { class: 'nav', onclick: () => { ui.prefs.theme = ui.prefs.theme === 'dark' ? 'light' : 'dark'; ui.applyPrefs(); ui.refresh(); } }, ui.icon(ui.prefs.theme === 'dark' ? 'sun' : 'moon', 16), ui.prefs.theme === 'dark' ? 'Tema claro' : 'Tema escuro'),
      h('button', { class: 'nav', onclick: () => { S.career.save(); ui.toast('Jogo salvo'); } }, ui.icon('save', 16), 'Salvar'), h('button', { class: 'nav', onclick: () => ui.settings() }, ui.icon('menu', 16), 'Menu')));
    const top = document.getElementById('topbar'); top.innerHTML = '';
    top.append(h('span', { class: 'crumb' }, 'Caminho ', h('span', { class: 'dim' }, '/'), ' ', h('b', null, TITLES[ui.current] || '')), h('span', { class: 'sp' }),
      h('span', { class: 'pill' }, ui.icon('user', 13), h('b', null, p.name), `(${p.country})`), h('span', { class: 'pill' }, 'Idade ', h('b', null, s.year - p.birth)), h('span', { class: 'pill' }, h('b', null, s.year)),
      h('span', { class: 'pill' }, h('b', null, cat.short), p.contract ? ' · ' + p.contract.teamName : ''), h('span', { class: 'pill' }, 'GER ', ui.rate(ger)),
      h('span', { class: 'pill' }, ui.icon('wallet', 13), h('b', { class: p.money < 0 ? 'bad' : '' }, U.fmtMoney(p.money))));
    const feed = document.getElementById('feed'); feed.innerHTML = '';
    feed.append(ui.panel({ title: 'Atividade', cls: 'grow' }, s.news.slice(0, 8).map(n => h('div', { class: 'feed-item ' + n.kind }, h('span', { class: 'dot' }), h('div', null, h('div', { class: 'y' }, h('span', { class: 'feed-tag' }, feedTag(n.text)), n.y), h('div', { class: 't' }, n.text))))));
  };

  // modal: actions=[{label, cls, fn, icon}] · stack=true empilha como lista de opções
  ui.modal = function (o) {
    const root = document.getElementById('modal-root'), ov = h('div', { class: 'overlay' }), box = h('div', { class: 'modal', style: o.width ? { width: o.width } : null });
    const close = () => ov.remove();
    box.append(o.title ? h('h2', null, o.title) : null, typeof o.body === 'string' ? h('div', { class: 'mut' }, o.body) : o.body,
      h('div', { class: 'actions' + (o.stack ? ' stack' : '') }, (o.actions || [{ label: 'OK', cls: 'primary' }]).map(a => ui.btn(a.label, () => { if (a.fn && a.fn(close) === false) return; close(); }, a.cls, a.dis, a.icon))));
    ov.append(box); root.append(ov);
    return { close, box };
  };
  ui.toast = function (t, kind) { const ic = kind === 'bad' ? 'alert' : kind === 'warn' ? 'bolt' : 'check'; const el = h('div', { class: 'toast ' + (kind || '') }, ui.icon(ic, 14), t); document.getElementById('toast').append(el); setTimeout(() => el.remove(), 3700); };
  ui.confirm = (title, text, yes) => ui.modal({ title, body: text, actions: [{ label: 'Cancelar' }, { label: 'Confirmar', cls: 'primary', fn: () => { yes(); } }] });

  // eventos aleatórios em sequência com feedback direto por toast colorido (sem segundo modal redundante)
  ui.runEvents = function (list, done) {
    const s = Game.state, next = i => {
      if (i >= list.length) return done();
      const ev = list[i];
      ui.modal({ title: ev.title, body: h('div', { class: 'row', style: { alignItems: 'flex-start' } }, ui.plate('bolt', null, true), h('div', { class: 'mut' }, ev.text)), stack: true, actions: ev.choices.map((c, idx) => ({ label: c.label, icon: 'right', fn: () => {
        const r = S.pressure.resolve(s, ev, idx);
        const summary = [r.text, r.extra].filter(Boolean).join(' · ') || 'Decisão registrada.';
        const kind = r.extra ? 'bad' : (summary.includes('-') && !summary.includes('+') ? 'warn' : 'good');
        ui.toast(summary, kind);
        ui.renderChrome();
        next(i + 1);
      } })) });
    };
    next(0);
  };

  // fim de temporada: resumo e navegação
  ui.finishSeason = function () {
    const s = Game.state, sm = S.career.endSeason();
    ui.refresh();
    const body = h('div', { class: 'col', style: { gap: '.6rem' } },
      h('div', { class: 'row between' }, h('div', null, h('div', { class: 'pt' }, sm.catName), h('div', { style: { fontSize: '2.2rem', fontWeight: 700, letterSpacing: '-.04em' } }, sm.played ? `${sm.pos}º lugar` : 'Sem corridas')), h('div', { class: 'col', style: { alignItems: 'flex-end' } }, sm.champ ? ui.badge('CAMPEÃO', 'ok') : null, sm.slPts ? ui.badge(`+${sm.slPts} pts superlicença`, 'acc') : null, h('span', { class: 'mono small mut' }, `${sm.pts} pontos`))),
      h('div', { class: 'pt' }, 'Contas do ano'),
      sm.acct.lines.slice(0, 7).map(l => h('div', { class: 'row between small' }, h('span', { class: 'mut' }, l.label), h('span', { class: 'mono ' + (l.amount < 0 ? 'bad' : 'ok') }, U.fmtMoney(l.amount)))),
      h('div', { class: 'row between', style: { borderTop: '1px solid var(--line)', paddingTop: '.4rem' } }, h('b', null, 'Resultado'), h('b', { class: 'mono ' + (sm.acct.net < 0 ? 'bad' : 'ok') }, U.fmtMoney(sm.acct.net))));
    ui.modal({ title: `Fim da temporada ${sm.year}`, body, actions: [{ label: 'Continuar', cls: 'primary', icon: 'right', fn: () => { ui.go(s.phase === 'ended' ? 'ending' : 'contract'); } }] });
  };

  ui.settings = function () {
    const s = Game.state;
    const file = h('input', { type: 'file', accept: '.json', style: { display: 'none' }, onchange: e => { const f = e.target.files[0]; if (f) Game.core.storage.importFile(f).then(st => { Game.state = st; ui.toast('Save importado'); document.querySelectorAll('.overlay').forEach(o => o.remove()); ui.go(st.phase === 'ended' ? 'ending' : 'hub'); }).catch(() => ui.toast('Arquivo inválido')); } });
    const accents = [['red', 'Vermelho'], ['papaya', 'Papaya'], ['teal', 'Petronas'], ['blue', 'Azul']];
    const body = h('div', { class: 'col', style: { gap: '.7rem' } }, file,
      h('div', { class: 'row between' }, h('span', { class: 'mut' }, 'Tema'), ui.tabs([['dark', 'Escuro'], ['light', 'Claro']], ui.prefs.theme, t => { ui.prefs.theme = t; ui.applyPrefs(); document.querySelectorAll('.overlay').forEach(o => o.remove()); ui.refresh(); ui.settings(); })),
      h('div', { class: 'row between' }, h('span', { class: 'mut' }, 'Efeitos sonoros'), ui.tabs([[true, 'Ligado'], [false, 'Mudo']], ui.prefs.sound !== false, v => { ui.prefs.sound = v; ui.applyPrefs(); document.querySelectorAll('.overlay').forEach(o => o.remove()); ui.refresh(); ui.settings(); })),
      h('div', { class: 'row between' }, h('span', { class: 'mut' }, 'Cor de destaque'), ui.tabs(accents, ui.prefs.accent, t => { ui.prefs.accent = t; ui.applyPrefs(); document.querySelectorAll('.overlay').forEach(o => o.remove()); ui.refresh(); ui.settings(); })),
      h('div', { class: 'row' }, ui.btn('Salvar agora', () => { S.career.save(); ui.toast('Jogo salvo'); }, '', false, 'save'), ui.btn('Exportar', () => Game.core.storage.exportFile(s), '', false, 'download'), ui.btn('Importar', () => file.click(), '', false, 'swap')));
    ui.modal({ title: 'Menu', body, actions: [{ label: 'Voltar ao menu principal', fn: () => { S.career.save(); ui.go('menu'); } }, { label: 'Fechar', cls: 'primary' }] });
  };
})();
