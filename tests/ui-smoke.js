// teste de interface: percorre telas clicando nos botões (jsdom)
const { JSDOM, VirtualConsole } = require('jsdom');
const errors = [];
const vc = new VirtualConsole(); vc.on('jsdomError', e => errors.push(e.message + ' ' + (e.detail && e.detail.stack || ''))); vc.on('error', e => errors.push(String(e)));
JSDOM.fromFile(require('path').join(__dirname, '..', 'index.html'), { runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc }).then(dom => {
  const w = dom.window, d = w.document;
  w.addEventListener('error', e => errors.push('ERR ' + e.message));
  setTimeout(async () => {
    try {
      const G = w.Game;
      const btns = () => [...d.querySelectorAll('button')];
      const click = t => { const b = btns().find(x => x.textContent.includes(t) && !x.disabled); if (!b) throw new Error('botão não encontrado: ' + t); b.click(); };
      const has = t => btns().some(x => x.textContent.includes(t) && !x.disabled);
      const modalLoop = () => { let n = 0; while (d.querySelector('.overlay') && n++ < 40) { const ov = d.querySelector('.overlay'); const bs = [...ov.querySelectorAll('button:not(:disabled)')]; (bs.find(b => /Continuar|OK|Vamos|Fechar/.test(b.textContent)) || bs[0]).click(); } };
      click('Novo jogo'); G.ui.cr.name = 'Piloto Teste'; click('Ir para a roleta');
      for (let i = 0; i < 4; i++) { const box = [...d.querySelectorAll('.attr-box:not(.used)')][0]; box.click(); }
      click('Começar carreira'); modalLoop();
      const visited = new Set();
      const tour = () => ['hub','season','race','contract','assets','people','drivers','records','career'].forEach(n => { G.ui.go(n); visited.add(n); ['bens','inv','spo','res'].forEach(t => { if (n === 'assets') { G.ui.assetsTab = t; G.ui.refresh(); } }); ['pilotos','equipes','cal'].forEach(t => { if (n === 'season') { G.ui.seasonTab = t; G.ui.refresh(); } }); });
      let seasons = 0, steps = 0;
      while (G.state.phase !== 'ended' && steps++ < 400) {
        const s = G.state;
        if (s.phase === 'offseason') {
          G.ui.go('contract');
          if (!s.player.contract) { let b = btns().find(x => x.textContent === 'Aceitar' && !x.disabled); for (let k = 0; !b && k < 4; k++) { const pg = [...d.querySelectorAll('.pager button')]; const nx = pg[1] && !pg[1].disabled ? pg[1] : null; if (!nx) break; nx.click(); b = btns().find(x => x.textContent === 'Aceitar' && !x.disabled); } if (!b) { console.log('sem oferta aceitável', G.state.offers.length, G.ui.current, d.getElementById('screen').textContent.slice(0,300)); break; } b.click(); }
          click('Iniciar temporada'); modalLoop(); if (!visited.size && G.state.year > 2018) { tour(); G.ui.go('hub'); } continue;
        }
        if (s.season.finished) { G.ui.go('hub'); click('Encerrar temporada'); modalLoop(); seasons++; continue; }
        G.ui.go('race'); G.ui.simDelay = 0; click('Largar'); if (!has('Continuar')) { console.log('sem resultado'); break; }
        // alterna abas do resultado
        [...d.querySelectorAll('.tabs button')].forEach(b => b.click());
        click('Continuar'); modalLoop();
        if (G.state.phase === 'season' && ui_events_pending(G)) { }
      }
      function ui_events_pending() { return false; }
      console.log('fase final:', G.state.phase, 'temporadas jogadas:', seasons, 'passos:', steps, 'visitou:', [...visited].join(','));
      G.ui.go('ending'); console.log('ending ok');
    } catch (e) { errors.push('TESTE: ' + e.stack); }
    console.log('ERROS:', errors.length); errors.slice(0, 5).forEach(e => console.log(e.slice(0, 400)));
    process.exit(0);
  }, 800);
});
