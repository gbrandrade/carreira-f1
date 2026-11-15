/* Cartas da roleta de criação. Formato das lendas: [nome, país, nível, EXP, RAC, ATE, RIT]. Notas históricas são ESTIMATIVAS. */
(function () {
  const W = Game.config.weights;
  const ger = (e, r, a, t) => Math.round(W.EXP * e + W.RAC * r + W.ATE * a + W.RIT * t);
  const tierOf = g => g < 77 ? 'ruim' : g < 85 ? 'mediano' : g < 91 ? 'bom' : 'lendario';
  const cards = [];
  // pilotos atuais de F1
  Game.data.realDrivers.filter(d => d[3] === 'f1').forEach(d => {
    const g = ger(d[5], d[6], d[7], d[8]);
    cards.push({ name: d[0], country: d[1], tier: tierOf(g), EXP: d[5], RAC: d[6], ATE: d[7], RIT: d[8], GER: g });
  });
  const extra = [
    ['Nikita Mazepin', 'RUS', 'ruim', 50, 58, 48, 64], ['Nicholas Latifi', 'CAN', 'ruim', 58, 62, 60, 66], ['Pastor Maldonado', 'VEN', 'ruim', 60, 64, 48, 72],
    ['Jolyon Palmer', 'GBR', 'ruim', 52, 60, 58, 64], ['Rio Haryanto', 'INA', 'ruim', 40, 50, 50, 58], ['Max Chilton', 'GBR', 'ruim', 48, 55, 60, 58],
    ['Logan Sargeant', 'USA', 'ruim', 48, 58, 56, 64], ['Marcus Ericsson', 'SWE', 'ruim', 62, 66, 64, 68],
    ['Kevin Magnussen', 'DEN', 'mediano', 78, 80, 72, 82], ['Romain Grosjean', 'FRA', 'mediano', 72, 78, 66, 84], ['Rubens Barrichello', 'BRA', 'mediano', 96, 82, 86, 82],
    ['Heikki Kovalainen', 'FIN', 'mediano', 70, 76, 72, 80], ['Jean-Éric Vergne', 'FRA', 'mediano', 66, 74, 70, 78], ['Daniil Kvyat', 'RUS', 'mediano', 66, 74, 64, 80],
    ['Felipe Massa', 'BRA', 'bom', 88, 84, 80, 88], ['Jenson Button', 'GBR', 'bom', 88, 86, 88, 86], ['Nico Rosberg', 'GER', 'bom', 84, 86, 84, 90],
    ['Mark Webber', 'AUS', 'bom', 86, 84, 86, 86], ['David Coulthard', 'GBR', 'bom', 92, 84, 82, 85], ['Juan Pablo Montoya', 'COL', 'bom', 74, 88, 70, 92],
    ['Kimi Räikkönen', 'FIN', 'bom', 94, 90, 84, 92], ['Damon Hill', 'GBR', 'bom', 86, 86, 84, 86], ['Nigel Mansell', 'GBR', 'bom', 88, 92, 80, 92],
    ['Sebastian Vettel', 'GER', 'lendario', 92, 92, 92, 94], ['Nelson Piquet', 'BRA', 'lendario', 88, 90, 86, 92], ['Emerson Fittipaldi', 'BRA', 'lendario', 88, 90, 88, 90],
    ['Alain Prost', 'FRA', 'lendario', 92, 94, 96, 90], ['Niki Lauda', 'AUT', 'lendario', 90, 90, 94, 92], ['Jim Clark', 'GBR', 'lendario', 82, 94, 86, 98],
    ['Juan Manuel Fangio', 'ARG', 'lendario', 84, 96, 86, 96], ['Mika Häkkinen', 'FIN', 'lendario', 86, 92, 88, 94],
    ['Ayrton Senna (prime)', 'BRA', 'prime', 90, 96, 92, 99], ['Michael Schumacher (prime)', 'GER', 'prime', 96, 98, 97, 98], ['Lewis Hamilton (prime)', 'GBR', 'prime', 92, 98, 95, 98],
    ['Max Verstappen (prime)', 'NED', 'prime', 90, 99, 93, 99], ['Fernando Alonso (prime)', 'ESP', 'prime', 94, 97, 95, 96], ['Sebastian Vettel (prime)', 'GER', 'prime', 88, 92, 98, 97]
  ];
  extra.forEach(d => cards.push({ name: d[0], country: d[1], tier: d[2], EXP: d[3], RAC: d[4], ATE: d[5], RIT: d[6], GER: ger(d[3], d[4], d[5], d[6]) }));
  Game.data.cards = cards;
  Game.data.tierLabels = { ruim: 'Ruim', mediano: 'Mediano', bom: 'Bom', lendario: 'Lendário', prime: 'Prime' };
})();
