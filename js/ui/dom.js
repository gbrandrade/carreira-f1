/* Helpers de DOM e componentes base do design system (painel, botão, badge, medidor, tabela, paginação, ícones). */
(function () {
  const ui = Game.ui;
  const h = ui.h = function (tag, props, ...kids) {
    const el = document.createElement(tag);
    if (props) for (const k in props) {
      const v = props[k];
      if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') for (const s in v) s.startsWith('--') ? el.style.setProperty(s, v[s]) : (el.style[s] = v[s]);
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else if (v !== false && v != null) el.setAttribute(k, v);
    }
    kids.flat(Infinity).forEach(c => { if (c == null || c === false) return; el.append(c.nodeType ? c : document.createTextNode(String(c))); });
    return el;
  };

  // ícones (traço 24x24, estilo linha)
  const ICONS = {
    home: 'M3 11l9-8 9 8M5 10v10h14V10', calendar: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4', flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
    doc: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6', wallet: 'M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l2-3h12v3M16 14h3',
    users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 3-5 6-5s6 2 6 5M17 6a3 3 0 0 1 0 5M18 15c2 .5 3 2 3 5', table: 'M4 5h16v14H4zM4 10h16M4 15h16M10 5v14',
    trophy: 'M8 4h8v6a4 4 0 0 1-8 0zM8 6H5v2a3 3 0 0 0 3 3M16 6h3v2a3 3 0 0 1-3 3M12 14v4M8 20h8', clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
    menu: 'M4 6h16M4 12h16M4 18h16', sun: 'M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z', save: 'M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6', play: 'M7 4l13 8-13 8z',
    left: 'M15 5l-7 7 7 7', right: 'M9 5l7 7-7 7', plus: 'M12 5v14M5 12h14', minus: 'M5 12h14', check: 'M5 12l5 5 9-10', shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
    briefcase: 'M4 8h16v11H4zM9 8V5h6v3M4 13h16', star: 'M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 17l-5.6 3 1.3-6.2L3 9.5l6.3-.7z', bolt: 'M13 3L5 14h6l-1 7 8-11h-6z',
    car: 'M4 15l2-6h12l2 6v3h-3v-2H7v2H4zM7 12h10', boat: 'M3 16h18l-3 4H6zM12 4v10M12 4l6 8h-6', house: 'M4 20V10l8-6 8 6v10zM10 20v-6h4v6', sim: 'M4 6h16v10H4zM9 20h6M12 16v4',
    lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3', chart: 'M4 20V10M10 20V4M16 20v-8M22 20H2', heart: 'M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z',
    mic: 'M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v4', swap: 'M7 7h13M16 3l4 4-4 4M17 17H4M8 13l-4 4 4 4', download: 'M12 4v11M7 11l5 5 5-5M5 20h14',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6', alert: 'M12 4l9 16H3zM12 10v4M12 17v.5', trend: 'M3 17l6-6 4 4 8-8M15 7h6v6'
  };
  ui.icon = (n, s) => h('span', { class: 'ic', html: `<svg viewBox="0 0 24 24" width="${s || 16}" height="${s || 16}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[n] || ''}"/></svg>` });
  ui.plate = (icon, color, big) => h('span', { class: 'plate' + (big ? ' lg' : ''), style: color ? { '--c': color } : null }, ui.icon(icon, big ? 22 : 17));

  ui.btn = (label, fn, cls, dis, icon) => h('button', { class: 'btn ' + (cls || ''), onclick: fn, disabled: dis ? 'disabled' : null }, icon ? ui.icon(icon, 14) : null, label);
  ui.panel = (o, ...kids) => { if (typeof o === 'string') o = { title: o }; return h('section', { class: 'panel ' + (o.cls || '') }, (o.title || o.right) ? h('div', { class: 'ph' }, h('span', { class: 'pt' }, o.title || ''), o.right || null) : null, ...kids); };
  ui.card = (t, ...k) => ui.panel({ title: t }, ...k);
  ui.badge = (t, cls) => h('span', { class: 'badge ' + (cls || '') }, t);
  ui.chip = ui.badge;
  ui.head = (title, sub, right) => h('div', { class: 'sh' }, h('div', null, h('h2', null, title), sub ? h('div', { class: 'sub' }, sub) : null), right || null);
  ui.rate = g => h('span', { class: 'rate ' + (g >= 90 ? 'r90' : g >= 85 ? 'r85' : g >= 78 ? 'r78' : '') }, Math.round(g));
  ui.flag = c => c || '---';
  ui.ccode = c => h('span', { class: 'ccode' }, c || '---');
  ui.posCell = p => h('span', { class: 'pos' + (p <= 3 ? ' p' + p : '') }, p);
  ui.avatar = name => h('span', { class: 'avatar' }, String(name).split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase());

  // medidor em quadradinhos; cap = marcador do teto
  ui.meter = function (value, o) {
    o = o || {}; const max = o.max || 100, n = o.segments || 20, pct = Math.max(0, Math.min(1, value / max));
    const color = o.color || (o.auto === false ? 'var(--accent)' : pct >= .6 ? 'var(--ok)' : pct >= .35 ? 'var(--warn)' : 'var(--bad)');
    const on = Math.round(pct * n), capI = o.cap != null ? Math.max(0, Math.min(n - 1, Math.round(o.cap / max * n) - 1)) : -1;
    return h('div', { class: 'meter', style: { '--c': color } }, Array.from({ length: n }, (_, i) => h('i', { class: (i < on ? 'on' : '') + (i === capI ? ' cap' : '') })));
  };
  ui.bar = (label, value, o) => { o = o || {}; return h('div', { class: 'bar' }, h('span', { class: 'bl' }, label), ui.meter(value, o), h('span', { class: 'bv' }, o.text != null ? o.text : Math.round(value))); };
  ui.stat = (label, value, sub, extra, lead) => h('div', { class: 'stat' }, lead || null, h('div', { class: 'col gap-s' }, h('div', { class: 'k' }, label), h('div', { class: 'v' }, value), sub ? h('div', { class: 's' }, sub) : null), extra || null);

  ui.table = function (cols, rows) {
    return h('table', null, h('thead', null, h('tr', null, cols.map(c => h('th', { class: c.cls || '', style: c.w ? { width: c.w } : null }, c.h)))),
      h('tbody', null, rows.map(r => h('tr', { class: r.me ? 'me' : '' }, r.cells.map((c, i) => h('td', { class: cols[i].cls || '' }, c))))));
  };

  ui.pg = {};
  ui.paged = function (key, items, per, render) {
    const pages = Math.max(1, Math.ceil(items.length / per));
    const i = Math.min(ui.pg[key] || 0, pages - 1); ui.pg[key] = i;
    const go = d => { ui.pg[key] = Math.max(0, Math.min(pages - 1, i + d)); ui.refresh(); };
    return h('div', { class: 'col grow', style: { justifyContent: 'space-between' } }, h('div', { class: 'col' }, render(items.slice(i * per, i * per + per))),
      pages > 1 ? h('div', { class: 'pager' }, ui.btn('', () => go(-1), 'sm icon ghost', i === 0, 'left'), `${i + 1} / ${pages}`, ui.btn('', () => go(1), 'sm icon ghost', i === pages - 1, 'right')) : null);
  };
  ui.tabs = (list, active, onPick) => h('div', { class: 'seg' }, list.map(([id, label]) => h('button', { class: id === active ? 'on' : '', onclick: () => onPick(id) }, label)));
  ui.seg = ui.tabs;

  ui.teamColor = function (teamId, catId) {
    const s = Game.state;
    const cat = catId || (s && s.player && s.player.catId) || 'f1';
    const list = (s && s.world && s.world.teams && s.world.teams[cat]) || Game.data.teams[cat] || [];
    const found = list.find(t => t.id === teamId);
    if (found && found.color) return found.color;
    let hs = 0;
    for (const ch of String(teamId || 't')) hs = (hs * 31 + ch.charCodeAt(0)) >>> 0;
    const palette = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];
    return palette[hs % palette.length];
  };
  ui.teamChip = (name, teamId, catId) => h('span', { class: 'tchip' },
    h('i', { class: 'tbar', style: { background: ui.teamColor(teamId, catId) } }),
    h('span', { class: 'tname' }, name)
  );
  ui.tyreRing = (color, code) => h('span', { class: 'tyre-ring', style: { '--tc': color } }, code);

  ui.F = n => Math.round(n);
})();
