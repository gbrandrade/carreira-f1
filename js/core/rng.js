/* Aleatoriedade: todas as sortes do jogo passam por aqui (fácil de trocar por uma seed no futuro). */
(function () {
  Game.rng = {
    float: () => Math.random(),
    int: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
    chance: p => Math.random() < p,
    pick: arr => arr[Math.floor(Math.random() * arr.length)],
    normal(mu = 0, sd = 1) {
      let u = 0, v = 0;
      while (!u) u = Math.random();
      while (!v) v = Math.random();
      return mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    },
    shuffle(arr) {
      const r = arr.slice();
      for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
      return r;
    },
    weighted(items, fn) {
      const w = items.map(fn), t = w.reduce((x, y) => x + y, 0);
      let r = Math.random() * t;
      for (let i = 0; i < items.length; i++) { r -= w[i]; if (r <= 0) return items[i]; }
      return items[items.length - 1];
    },
    // gerador com seed (usado para calendários que devem ser iguais a cada carregamento)
    seeded(seed) {
      let a = seed >>> 0;
      return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    }
  };
})();
