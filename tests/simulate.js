// teste automático da lógica: joga carreiras inteiras sem interface
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..') + '/';
const dom = new JSDOM('<!DOCTYPE html><body></body>', { url: 'http://localhost/', runScripts: 'outside-only' });
const w = dom.window;
const html = fs.readFileSync(root + 'index.html', 'utf8');
const scripts = [...html.matchAll(/src="(js\/(?:core|data|systems)\/[^"]+)"/g)].map(m => m[1]);
scripts.forEach(f => { try { w.eval(fs.readFileSync(root + f, 'utf8')); } catch (e) { console.log('ERRO em', f, e.message); process.exit(1); } });
const G = w.Game; const S = G.systems;
function pickCards() {
  const r = G.rng, cards = G.data.cards, free = ['RIT','RAC','ATE','EXP'], picks = {}, src = {}; let ref = 3;
  while (free.length) {
    let c = r.pick(cards);
    const best = free.slice().sort((a, b) => c[b] - c[a])[0];
    while (ref > 0 && c[best] < 88) { ref--; c = r.pick(cards); }
    const k = free.slice().sort((a, b) => (c[b] * (b === 'RIT' ? 2 : 1)) - (c[a] * (a === 'RIT' ? 2 : 1)))[0];
    picks[k] = c[k]; src[k] = c.name; free.splice(free.indexOf(k), 1);
  }
  return { picks, src };
}
function pickCardsOld() { const r = G.rng; const cards = G.data.cards; const picks = {}, src = {}; ['RIT','RAC','ATE','EXP'].forEach(k => { const c = r.pick(cards); picks[k] = c[k]; src[k] = c.name; }); return { picks, src }; }
function play(seed) {
  const { picks, src } = pickCards();
  S.career.newGame({ name: 'Teste ' + seed, country: 'BRA', origin: ['humilde','media','rica'][seed % 3], picks, pickSrc: src, traits: ['frio', 'midia'] });
  let s = G.state, safety = 0;
  while (s.phase !== 'ended' && safety++ < 60) {
    if (s.phase === 'offseason') {
      if (!s.player.contract) {
        S.contracts.ensureFallback(s);
        const ok = s.offers.filter(o => S.contracts.canAfford(s, o));
        const o = ok.sort((a, b) => G.data.categories[b.catId].level - G.data.categories[a.catId].level)[0];
        if (!o) { console.log('SEM OFERTA', s.year, s.player.catId, 'forced', s.player.forcedUp, 'money', s.player.money, s.offers.map(o=>o.catId+':'+o.terms.salary)); S.career.endCareer({ reason: 'x', title: 'Sem oferta', text: '' }); break; }
        const r = S.contracts.accept(s, o); if (!r.ok) throw new Error('accept ' + r.msg);
      }
      S.career.startSeason();
      (s.sponsorOffers||[]).slice().forEach(id => S.economy.signSponsor(s, id));
    }
    const se = s.season;
    while (!se.finished) {
      const wk = S.career.playRound({ tyre: 1, setup: 'bal', risk: 1, raceInjured: false });
      const out = S.career.afterRound();
      out.events.forEach(ev => S.pressure.resolve(s, ev, 0));
      if (out.fired) { S.career.fire(); break; }
    }
    S.career.endSeason();
    // compra um simulador se der
    if (s.player.money > 500000) S.economy.buy(s, 'sim2');
  }
  const p = s.player;
  return { seed, phase: s.phase, ending: s.ending && s.ending.reason, year: s.year, age: s.year - p.birth, cat: p.catId, titles: p.stats.titles, wins: p.stats.wins, f1: p.f1.races, money: Math.round(p.money / 1000) + 'k', ger: S.contracts.ger(s) };
}
const n = +process.argv[2] || 9; const res=[];
for (let i = 0; i < n; i++) res.push(play(i));
res.forEach(r=>console.log(JSON.stringify(r)));
const by=k=>res.reduce((m,r)=>(m[r[k]]=(m[r[k]]||0)+1,m),{});
console.log('endings',by('ending'),'catFinal',by('cat'),'reachedF1',res.filter(r=>r.f1>0).length+'/'+n,'avgTitles',(res.reduce((a,r)=>a+r.titles,0)/n).toFixed(1));
