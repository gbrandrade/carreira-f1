/* Notícias (coluna lateral) e linha do tempo da carreira. */
(function () {
  Game.systems.news = {
    add(text, kind) { const s = Game.state; if (!s) return; s.news.unshift({ y: s.year, text, kind: kind || '' }); if (s.news.length > 40) s.news.length = 40; },
    log(text) { const s = Game.state; if (!s) return; s.timeline.push({ year: s.year, age: s.year - s.player.birth, text }); },
    both(text, kind) { this.add(text, kind); this.log(text); }
  };
})();
