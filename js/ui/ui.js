/* Núcleo da interface: temas, roteador, chrome (menu lateral, barra superior, feed), modais, toasts, auto-ajuste e fluxos compartilhados. */
(function () {
  const ui = Game.ui, h = ui.h, U = Game.utils, C = Game.data.categories, S = Game.systems;
  ui.current = 'menu';
  ui.fullScreens = ['menu', 'creation', 'ending'];
  const NAV = [['Jogo', [['hub', 'Central', 'home'], ['season', 'Temporada', 'calendar'], ['race', 'Corrida', 'flag']]],
    ['Carreira', [['contract', 'Contrato', 'doc'], ['assets', 'Patrimônio', 'wallet'], ['people', 'Pessoas e mídia', 'users']]],
    ['Mundo', [['drivers', 'Pilotos', 'table'], ['records', 'Recordes', 'trophy'], ['career', 'Carreira', 'clock']]]];
  const TITLES = { hub: 'Central do piloto', season: 'Temporada', race: 'Corrida', contract: 'Contrato', assets: 'Patrimônio', people: 'Pessoas e mídia', drivers: 'Pilotos', records: 'Recordes', career: 'Carreira' };

  // ---- temas (guardados à parte do save)
  ui.prefs = { theme: 'dark', accent: 'red', size: 'm' };
  const ZOOMS = { p: .88, m: 1, g: 1.2, x: 1.45 }, SIZE_LABEL = { p: 'Compacto', m: 'Padrão', g: 'Grande', x: 'Extra grande' }, SIZE_ORDER = ['p', 'm', 'g', 'x'];
  try { Object.assign(ui.prefs, JSON.parse(localStorage.getItem('caminho-f1-ui') || '{}')); } catch (e) {}
  ui.applyPrefs = function () {
    document.documentElement.setAttribute('data-theme', ui.prefs.theme); document.documentElement.setAttribute('data-accent', ui.prefs.accent);
    document.documentElement.setAttribute('data-size', ui.prefs.size); document.documentElement.style.setProperty('--zoom', ZOOMS[ui.prefs.size] || 1);
    try { localStorage.setItem('caminho-f1-ui', JSON.stringify(ui.prefs)); } catch (e) {}
  };
  ui.applyPrefs();

  // ---- ajuste automático: UMA escala para todas as telas (a menor necessária para tudo caber sem scroll).
  // Nos tamanhos Grande/Extra o ajuste é desligado e cada painel rola por dentro quando faltar espaço.
  ui.fitMin = 1;
  const bigSize = () => ui.prefs.size === 'g' || ui.prefs.size === 'x';
  const overflowing = () => [...document.querySelectorAll('#screen, #screen .panel, .modal, .creation, .menu')].some(e => e.scrollHeight > e.clientHeight + 2 || e.scrollWidth > e.clientWidth + 2);
  ui.autoFit = function () {
    const root = document.documentElement;
    if (bigSize()) { root.style.setProperty('--fit', 1); return; }
    let f = ui.fitMin; root.style.setProperty('--fit', f);
    for (let i = 0; i < 9 && overflowing(); i++) { f -= .04; root.style.setProperty('--fit', f.toFixed(2)); }
    ui.fitMin = Math.min(ui.fitMin, f);
  };
  // mede todas as telas uma vez (invisível) para que a escala não mude ao trocar de aba
  ui.calibrate = function () {
    const s = Game.state; if (!s || !s.player || bigSize()) return;
    const cur = ui.current, app = document.getElementById('app'), root = document.getElementById('screen'), keep = [ui.assetsTab, ui.seasonTab];
    app.style.visibility = 'hidden';
    try {
      const variants = [['hub'], ['season', 'seasonTab', ['pilotos', 'equipes', 'cal']], ['race'], ['contract'], ['assets', 'assetsTab', ['bens', 'inv', 'spo', 'res']], ['people'], ['drivers'], ['records'], ['career']];
      variants.forEach(([n, key, opts]) => (opts || [null]).forEach(o => { if (key) ui[key] = o; ui.current = n; root.innerHTML = ''; root.append(ui.screens[n].render()); ui.autoFit(); }));
    } catch (e) { /* medição é opcional */ }
    ui.assetsTab = keep[0]; ui.seasonTab = keep[1]; ui.current = cur; app.style.visibility = '';
  };
  ui.setSize = function (k) {
    ui.prefs.size = k; ui.applyPrefs(); ui.fitMin = 1; ui._calibrated = false; ui.refresh(); ui.toast('Tamanho: ' + SIZE_LABEL[k]);
  };
  ui.bump = d => { const i = Math.max(0, Math.min(SIZE_ORDER.length - 1, SIZE_ORDER.indexOf(ui.prefs.size) + d)); if (SIZE_ORDER[i] !== ui.prefs.size) ui.setSize(SIZE_ORDER[i]); };
  ui.SIZES = SIZE_ORDER.map(k => [k, SIZE_LABEL[k]]);
  window.addEventListener('resize', () => { clearTimeout(ui._rt); ui._rt = setTimeout(() => { ui.fitMin = 1; ui._calibrated = false; ui.refresh(); }, 150); });
  window.addEventListener('keydown', e => { if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName) || e.ctrlKey || e.metaKey) return; if (e.key === '+' || e.key === '=') ui.bump(1); else if (e.key === '-') ui.bump(-1); });

  ui.go = function (name) { ui.current = name; ui.refresh(); };
  ui.refresh = function () {
    const full = ui.fullScreens.includes(ui.current);
    document.body.classList.toggle('full', full);
    const root = document.getElementById('screen'); root.innerHTML = '';
    root.append(ui.screens[ui.current].render());
    if (!full) ui.renderChrome();
    if (!full && !ui._calibrated) { ui._calibrated = true; ui.calibrate(); ui.refresh(); return; }
    requestAnimationFrame(ui.autoFit);
  };

  ui.renderChrome = function () {
    const s = Game.state; if (!s || !s.player) return;
    const p = s.player, ger = S.contracts.ger(s), cat = C[p.catId];
    const rail = document.getElementById('rail'); rail.innerHTML = '';
    rail.append(h('div', { class: 'brand' }, h('span', { class: 'logo' }, 'F1'), h('span', null, 'Caminho')));
    NAV.forEach(([g, items]) => { rail.append(h('div', { class: 'navh' }, g)); items.forEach(([id, label, ic]) => rail.append(h('button', { class: 'nav ' + (ui.current === id ? 'active' : ''), onclick: () => ui.go(id) }, ui.icon(ic, 16), label))); });
    rail.append(h('div', { class: 'rail-foot' }, h('button', { class: 'nav', onclick: () => { ui.prefs.theme = ui.prefs.theme === 'dark' ? 'light' : 'dark'; ui.applyPrefs(); ui.refresh(); } }, ui.icon(ui.prefs.theme === 'dark' ? 'sun' : 'moon', 16), ui.prefs.theme === 'dark' ? 'Tema claro' : 'Tema escuro'),
      h('button', { class: 'nav', onclick: () => { S.career.save(); ui.toast('Jogo salvo'); } }, ui.icon('save', 16), 'Salvar'), h('button', { class: 'nav', onclick: () => ui.settings() }, ui.icon('menu', 16), 'Menu')));
    const top = document.getElementById('topbar'); top.innerHTML = '';
    top.append(h('span', { class: 'crumb' }, 'Caminho ', h('span', { class: 'dim' }, '/'), ' ', h('b', null, TITLES[ui.current] || '')), h('span', { class: 'sp' }),
      h('span', { class: 'pill' }, ui.icon('user', 13), h('b', null, p.name), `(${p.country})`), h('span', { class: 'pill' }, 'Idade ', h('b', null, s.year - p.birth)), h('span', { class: 'pill' }, h('b', null, s.year)),
      h('span', { class: 'pill' }, h('b', null, cat.short), p.contract ? ' · ' + p.contract.teamName : ''), h('span', { class: 'pill' }, 'GER ', ui.rate(ger)),
      h('span', { class: 'pill' }, ui.icon('wallet', 13), h('b', { class: p.money < 0 ? 'bad' : '' }, U.fmtMoney(p.money))),
      h('span', { class: 'seg' }, h('button', { title: 'Diminuir (tecla -)', onclick: () => ui.bump(-1) }, 'A−'), h('button', { title: 'Aumentar (tecla +)', onclick: () => ui.bump(1) }, 'A+')));
    const feed = document.getElementById('feed'); feed.innerHTML = '';
    feed.append(ui.panel({ title: 'Atividade', cls: 'grow' }, s.news.slice(0, 8).map(n => h('div', { class: 'feed-item ' + n.kind }, h('span', { class: 'dot' }), h('div', null, h('div', { class: 'y' }, n.y), h('div', { class: 't' }, n.text))))));
  };

  // modal: actions=[{label, cls, fn, icon}] · stack=true empilha como lista de opções
  ui.modal = function (o) {
    const root = document.getElementById('modal-root'), ov = h('div', { class: 'overlay' }), box = h('div', { class: 'modal', style: o.width ? { width: o.width } : null });
    const close = () => ov.remove();
    box.append(o.title ? h('h2', null, o.title) : null, typeof o.body === 'string' ? h('div', { class: 'mut' }, o.body) : o.body,
      h('div', { class: 'actions' + (o.stack ? ' stack' : '') }, (o.actions || [{ label: 'OK', cls: 'primary' }]).map(a => ui.btn(a.label, () => { if (a.fn && a.fn(close) === false) return; close(); }, a.cls, a.dis, a.icon))));
    ov.append(box); root.append(ov); requestAnimationFrame(ui.autoFit);
    return { close, box };
  };
  ui.toast = function (t) { const el = h('div', { class: 'toast' }, ui.icon('check', 14), t); document.getElementById('toast').append(el); setTimeout(() => el.remove(), 3300); };
  ui.confirm = (title, text, yes) => ui.modal({ title, body: text, actions: [{ label: 'Cancelar' }, { label: 'Confirmar', cls: 'primary', fn: () => { yes(); } }] });

  // eventos aleatórios em sequência
  ui.runEvents = function (list, done) {
    const s = Game.state, next = i => {
      if (i >= list.length) return done();
      const ev = list[i];
      ui.modal({ title: ev.title, body: h('div', { class: 'row', style: { alignItems: 'flex-start' } }, ui.plate('bolt', null, true), h('div', { class: 'mut' }, ev.text)), stack: true, actions: ev.choices.map((c, idx) => ({ label: c.label, icon: 'right', fn: () => {
        const r = S.pressure.resolve(s, ev, idx);
        ui.modal({ title: ev.title, body: h('div', { class: 'col' }, h('div', null, r.text || 'Sem efeitos.'), r.extra ? h('div', { class: 'warn' }, r.extra) : null), actions: [{ label: 'Continuar', cls: 'primary', fn: () => { ui.renderChrome(); next(i + 1); } }] });
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
      h('div', { class: 'col gap-s' }, h('div', { class: 'row between' }, h('span', { class: 'mut' }, 'Tamanho da interface'), ui.tabs(ui.SIZES, ui.prefs.size, k => { document.querySelectorAll('.overlay').forEach(o => o.remove()); ui.setSize(k); ui.settings(); })), h('div', { class: 'tiny dim' }, 'Atalhos: tecla + e tecla −. Em Grande e Extra grande, alguns painéis podem rolar por dentro.')),
      h('div', { class: 'row between' }, h('span', { class: 'mut' }, 'Tema'), ui.tabs([['dark', 'Escuro'], ['light', 'Claro']], ui.prefs.theme, t => { ui.prefs.theme = t; ui.applyPrefs(); document.querySelectorAll('.overlay').forEach(o => o.remove()); ui.refresh(); ui.settings(); })),
      h('div', { class: 'row between' }, h('span', { class: 'mut' }, 'Cor de destaque'), ui.tabs(accents, ui.prefs.accent, t => { ui.prefs.accent = t; ui.applyPrefs(); document.querySelectorAll('.overlay').forEach(o => o.remove()); ui.refresh(); ui.settings(); })),
      h('div', { class: 'row' }, ui.btn('Salvar agora', () => { S.career.save(); ui.toast('Jogo salvo'); }, '', false, 'save'), ui.btn('Exportar', () => Game.core.storage.exportFile(s), '', false, 'download'), ui.btn('Importar', () => file.click(), '', false, 'swap')));
    ui.modal({ title: 'Menu', body, actions: [{ label: 'Voltar ao menu principal', fn: () => { S.career.save(); ui.go('menu'); } }, { label: 'Fechar', cls: 'primary' }] });
  };
})();
