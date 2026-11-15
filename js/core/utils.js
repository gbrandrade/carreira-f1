/* Funções utilitárias sem dependência de regras do jogo. */
(function () {
  const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  Game.utils = {
    MONTHS,
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    sum: arr => arr.reduce((x, y) => x + y, 0),
    avg: arr => arr.length ? arr.reduce((x, y) => x + y, 0) / arr.length : 0,
    uid: (() => { let n = 0; return p => (p || 'id') + (++n) + Math.floor(Math.random() * 1e4).toString(36); })(),
    clone: o => JSON.parse(JSON.stringify(o)),
    monthOfWeek: w => MONTHS[Math.min(11, Math.floor((w - 1) / 4.35))],
    fmtMoney(n) {
      const a = Math.abs(n), s = n < 0 ? '-' : '';
      if (a >= 1e6) return s + 'US$ ' + (a / 1e6).toFixed(a >= 1e7 ? 1 : 2).replace('.', ',') + ' mi';
      if (a >= 1e3) return s + 'US$ ' + Math.round(a / 1e3) + ' mil';
      return s + 'US$ ' + Math.round(a);
    },
    roundTo: (n, step) => Math.round(n / step) * step
  };
})();
