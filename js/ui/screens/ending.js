/* Fim de carreira: resumo e cartão do piloto (PNG para compartilhar). */
(function () {
  const ui = Game.ui, h = ui.h, S = Game.systems, A = S.attributes;

  function cardCanvas(s) {
    const p = s.player, e = s.ending || { title: 'Em carreira' }, cv = document.createElement('canvas'); cv.width = 1000; cv.height = 560;
    const g = cv.getContext('2d'); if (!g) return cv;
    const cs = getComputedStyle(document.documentElement), v = n => cs.getPropertyValue(n).trim() || '#888';
    const bg = v('--bg'), sf = v('--surface'), s3 = v('--surface-3'), tx = v('--text'), t2 = v('--text-2'), t3 = v('--text-3'), ac = v('--accent');
    g.fillStyle = bg; g.fillRect(0, 0, 1000, 560); g.fillStyle = sf; g.fillRect(24, 24, 952, 512);
    g.strokeStyle = ac; g.lineWidth = 3; g.beginPath(); g.moveTo(24, 60); g.lineTo(24, 24); g.lineTo(60, 24); g.stroke(); g.beginPath(); g.moveTo(976, 500); g.lineTo(976, 536); g.lineTo(940, 536); g.stroke();
    g.fillStyle = t3; g.font = '600 14px monospace'; g.fillText('CAMINHO ATÉ A F1 · CARTÃO DO PILOTO', 56, 66);
    g.fillStyle = tx; g.font = '700 54px sans-serif'; g.fillText(p.name, 56, 130);
    g.fillStyle = t2; g.font = '22px sans-serif'; g.fillText(`${p.country} · ${s.year - p.birth} anos · ${e.title}`, 56, 166);
    const pk = A.playerPeak(p);
    [['RIT', pk.RIT], ['RAC', pk.RAC], ['ATE', pk.ATE], ['EXP', Math.min(99, A.E(28) + pk.EXPb)]].forEach(([k, val], i) => {
      const y = 230 + i * 52; g.fillStyle = t3; g.font = '600 16px monospace'; g.fillText(k, 56, y);
      for (let q = 0; q < 20; q++) { g.fillStyle = q < Math.round(val / 99 * 20) ? ac : s3; g.fillRect(110 + q * 14, y - 14, 11, 16); }
      g.fillStyle = tx; g.font = '700 22px sans-serif'; g.fillText(String(Math.round(val)), 410, y + 2);
    });
    g.fillStyle = tx; g.font = '700 92px sans-serif'; g.fillText(String(A.playerCapGer(p)), 56, 500); g.fillStyle = t3; g.font = '600 14px monospace'; g.fillText('GER MÁXIMO', 190, 500);
    const f = p.f1, rows = [['Títulos de F1', f.titles], ['Vitórias na F1', f.wins], ['Pódios na F1', f.podiums], ['Poles na F1', f.poles], ['Corridas (total)', p.stats.races], ['Títulos (total)', p.stats.titles]];
    rows.forEach(([k, val], i) => { const y = 230 + i * 48; g.fillStyle = t2; g.font = '20px sans-serif'; g.fillText(k, 560, y); g.fillStyle = tx; g.font = '700 30px sans-serif'; g.textAlign = 'right'; g.fillText(String(val), 930, y + 2); g.textAlign = 'left'; g.fillStyle = s3; g.fillRect(560, y + 14, 370, 1); });
    return cv;
  }

  ui.screens.ending = {
    render() {
      const s = Game.state, p = s.player, e = s.ending || { title: 'Carreira', text: '' }, cv = cardCanvas(s);
      cv.style.cssText = 'max-width:100%;max-height:100%;border-radius:.8rem;border:1px solid var(--line-strong)';
      const items = [['Anos de carreira', s.year - Game.config.startYear], ['Títulos de F1', p.f1.titles], ['Vitórias na F1', p.f1.wins], ['Pódios na F1', p.f1.podiums], ['Total de corridas', p.stats.races], ['Total de títulos', p.stats.titles], ['Patrimônio final', Game.utils.fmtMoney(p.money)], ['Conquistas', Object.keys(p.ach).length + '/' + S.records.achievements.length]];
      return h('div', { class: 'creation' }, h('div', null, ui.badge('FIM DE CARREIRA', 'acc'), h('div', { class: 'endh', style: { marginTop: '.5rem' } }, e.title), h('div', { class: 'mut', style: { marginTop: '.4rem' } }, e.text)),
        h('div', { class: 'cols-2-3' }, ui.panel({ title: 'Resumo', cls: 'marks' }, items.map(([a, b]) => h('div', { class: 'row between', style: { borderBottom: '1px solid var(--line)', padding: '.3rem 0' } }, h('span', { class: 'mut' }, a), h('b', { class: 'mono' }, b)))), ui.panel({ cls: 'center' }, cv)),
        h('div', { class: 'row between' }, h('div', { class: 'row' }, ui.btn('Baixar cartão (PNG)', () => { const a = document.createElement('a'); a.href = cv.toDataURL('image/png'); a.download = `${p.name.replace(/\s+/g, '-')}-carreira.png`; a.click(); }, '', false, 'download'), ui.btn('Ver linha do tempo', () => ui.go('career'), 'ghost', false, 'clock')),
          ui.btn('Novo jogo', () => ui.go('menu'), 'primary lg', false, 'play')));
    }
  };
})();
