/* Patrocinadores. tier 1..4 (por nível de categoria). group = conflito (marcas concorrentes não coexistem).
   goal: tipo de meta da temporada (pts, podio, vitoria, top10, pop). Não cumprir reduz o pagamento. */
Game.data.sponsors = [
  { id: 'oficina', name: 'Oficina do Zé', group: 'local', tier: 1, pay: 8000, goal: { k: 'top10', n: 2 } },
  { id: 'kartshop', name: 'KartShop Brasil', group: 'local2', tier: 1, pay: 15000, goal: { k: 'podio', n: 1 } },
  { id: 'pizza', name: 'Pizzaria Bella Vita', group: 'local3', tier: 1, pay: 12000, goal: { k: 'pts', n: 20 } },
  { id: 'hankook', name: 'Hankook', group: 'pneu', tier: 2, pay: 120000, goal: { k: 'podio', n: 2 } },
  { id: 'petrobras', name: 'Petrobras', group: 'petroleo', tier: 2, pay: 250000, goal: { k: 'pts', n: 60 } },
  { id: 'shell', name: 'Shell', group: 'petroleo', tier: 2, pay: 280000, goal: { k: 'podio', n: 3 } },
  { id: 'itau', name: 'Itaú', group: 'banco', tier: 2, pay: 220000, goal: { k: 'top10', n: 6 } },
  { id: 'monster', name: 'Monster Energy', group: 'energetico', tier: 3, pay: 1500000, goal: { k: 'podio', n: 4 } },
  { id: 'santander', name: 'Santander', group: 'banco', tier: 3, pay: 1800000, goal: { k: 'pts', n: 80 } },
  { id: 'puma', name: 'Puma', group: 'roupa', tier: 3, pay: 1200000, goal: { k: 'pop', n: 40 } },
  { id: 'nike', name: 'Nike', group: 'roupa', tier: 3, pay: 1400000, goal: { k: 'pop', n: 45 } },
  { id: 'redbull', name: 'Red Bull', group: 'energetico', tier: 4, pay: 9000000, goal: { k: 'vitoria', n: 2 } },
  { id: 'rolex', name: 'Rolex', group: 'relogio', tier: 4, pay: 7000000, goal: { k: 'pop', n: 60 } },
  { id: 'rmille', name: 'Richard Mille', group: 'relogio', tier: 4, pay: 6000000, goal: { k: 'podio', n: 5 } },
  { id: 'aramco', name: 'Aramco', group: 'petroleo', tier: 4, pay: 12000000, goal: { k: 'pts', n: 150 } },
  { id: 'mastercard', name: 'Mastercard', group: 'cartao', tier: 4, pay: 8000000, goal: { k: 'pts', n: 120 } }
];
Game.data.goalText = { top10: n => `${n} chegadas no top 10`, podio: n => `${n} pódios`, pts: n => `${n} pontos`, vitoria: n => `${n} vitórias`, pop: n => `popularidade ${n}+` };
