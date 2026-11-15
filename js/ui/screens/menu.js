/* Tela inicial: título editorial, pista desenhada e ações. */
(function () {
  const ui = Game.ui, h = ui.h;
  ui.screens.menu = {
    render() {
      const has = Game.core.storage.has();
      const file = h('input', { type: 'file', accept: '.json', style: { display: 'none' }, onchange: e => {
        const f = e.target.files[0]; if (f) Game.core.storage.importFile(f).then(st => { Game.state = st; ui.go(st.phase === 'ended' ? 'ending' : 'hub'); }).catch(() => ui.toast('Arquivo inválido'));
      } });
      return h('div', { class: 'menu screen' },
        h('div', { class: 'hero' }, file, ui.badge('SIMULADOR DE CARREIRA', 'acc'),
          h('h1', null, 'Caminho', h('br'), 'até a ', h('em', null, 'F1')),
          h('p', { class: 'lead' }, 'Do kart regional do Brasil ao grid da Fórmula 1. Monte o piloto com atributos de lendas, negocie contratos, administre dinheiro, mídia e pressão.'),
          h('div', { class: 'acts' }, has ? ui.btn('Continuar carreira', () => { Game.state = Game.core.storage.load(); ui.go(Game.state.phase === 'ended' ? 'ending' : 'hub'); }, 'primary lg', false, 'play') : null,
            ui.btn('Novo jogo', () => { ui.cr = null; ui.go('creation'); }, has ? 'lg' : 'primary lg', false, has ? 'plus' : 'play'), ui.btn('Importar save', () => file.click(), 'ghost lg', false, 'download')),
          h('div', { class: 'row', style: { marginTop: '1rem' } }, h('span', { class: 'tiny dim mono' }, 'TEMA'), ui.tabs([['dark', 'Escuro'], ['light', 'Claro']], ui.prefs.theme, t => { ui.prefs.theme = t; ui.applyPrefs(); ui.refresh(); }),
            ui.tabs([['red', 'Vermelho'], ['papaya', 'Papaya'], ['teal', 'Petronas'], ['blue', 'Azul']], ui.prefs.accent, t => { ui.prefs.accent = t; ui.applyPrefs(); ui.refresh(); }))),
        h('div', { class: 'art' }, ui.track('menu-art')),
        h('div', { class: 'foot' }, h('span', null, 'PROJETO PESSOAL · DADOS REAIS PARA USO PRIVADO'), h('span', null, 'v0.2')));
    }
  };
})();
