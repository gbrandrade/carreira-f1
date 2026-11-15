/* Categorias da escada. 'mean' = nota média dos pilotos gerados; 'carW' = peso do carro (o resto é do piloto).
   'sl' = pontos de superlicença por posição final (valores de F4/Regional/Kart a confirmar). */
(function () {
  const F1PTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
  const KART = [25, 22, 20, 18, 16, 14, 12, 10, 8, 6, 5, 4, 3, 2, 1];
  const C = {
    kartReg: { id: 'kartReg', name: 'Kart Regional (Brasil)', short: 'Kart Regional', level: 0, minAge: 12, maxAge: 17, rounds: 6, grid: 20, seats: 2, carW: .25, cost: 12000, mean: 58, dnf: .05, laps: 14, single: false,
      races: [{ id: 'final', name: 'Final', pts: KART, grid: 'quali' }], sl: [] },
    kartNac: { id: 'kartNac', name: 'Kart Brasileiro', short: 'Kart Brasileiro', level: 1, minAge: 12, maxAge: 18, rounds: 6, grid: 20, seats: 2, carW: .25, cost: 30000, mean: 64, dnf: .05, laps: 16, single: false,
      races: [{ id: 'final', name: 'Final', pts: KART, grid: 'quali' }], sl: [] },
    kartMun: { id: 'kartMun', name: 'Mundial de Kart (CIK-FIA)', short: 'Mundial de Kart', level: 2, minAge: 12, maxAge: 19, rounds: 5, grid: 24, seats: 2, carW: .25, cost: 90000, mean: 70, dnf: .06, laps: 18, single: false,
      races: [{ id: 'final', name: 'Final', pts: KART, grid: 'quali' }], sl: [12, 10, 8, 6, 5, 4, 3, 2, 1] },
    f4br: { id: 'f4br', name: 'Fórmula 4 Brasil', short: 'F4 Brasil', level: 3, minAge: 15, maxAge: 19, rounds: 6, grid: 18, seats: 3, carW: .3, cost: 180000, mean: 66, dnf: .06, laps: 18, single: true, discard: 2,
      races: [{ id: 'r1', name: 'Prova 1', pts: F1PTS, grid: 'quali', pole: 2, fl: 1 },
              { id: 'r2', name: 'Prova 2', pts: [15, 12, 10, 8, 6, 4, 2, 1], grid: { rev: 'prev', n: 8 }, fl: 1 },
              { id: 'r3', name: 'Prova 3', pts: F1PTS, grid: 'quali2', fl: 1 }], sl: [12, 10, 7, 5, 3, 2, 1] },
    f4eu: { id: 'f4eu', name: 'Fórmula 4 Europeia', short: 'F4 Europeia', level: 4, minAge: 15, maxAge: 19, rounds: 7, grid: 24, seats: 3, carW: .3, cost: 380000, mean: 72, dnf: .06, laps: 18, single: true,
      races: [{ id: 'r1', name: 'Corrida 1', pts: F1PTS, grid: 'quali', pole: 2, fl: 1 },
              { id: 'r2', name: 'Corrida 2', pts: F1PTS, grid: { rev: 'prev', n: 8 }, fl: 1 },
              { id: 'r3', name: 'Corrida 3', pts: F1PTS, grid: 'quali2', fl: 1 }], sl: [12, 10, 7, 5, 3, 2, 1] },
    frec: { id: 'frec', name: 'Fórmula Regional Europeia', short: 'Regional Europeia', level: 5, minAge: 16, maxAge: 21, rounds: 8, grid: 24, seats: 3, carW: .35, cost: 750000, mean: 76, dnf: .06, laps: 20, single: true,
      races: [{ id: 'r1', name: 'Corrida 1', pts: F1PTS, grid: 'quali', pole: 2, fl: 1 },
              { id: 'r2', name: 'Corrida 2 (grid invertido)', pts: F1PTS, grid: { rev: 'quali', n: 12 }, fl: 1 },
              { id: 'r3', name: 'Corrida 3', pts: F1PTS, grid: 'quali2', fl: 1 }], sl: [25, 20, 15, 10, 8, 6, 4, 3, 2, 1] },
    f3: { id: 'f3', name: 'FIA Fórmula 3', short: 'F3', level: 6, minAge: 17, maxAge: 22, rounds: 10, grid: 30, seats: 3, carW: .4, cost: 1500000, mean: 79, dnf: .06, laps: 20, single: true,
      races: [{ id: 'sprint', name: 'Sprint', pts: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1], grid: { rev: 'quali', n: 12 }, fl: 1 },
              { id: 'feature', name: 'Corrida Principal', pts: F1PTS, grid: 'quali', pole: 2, fl: 1 }], sl: [30, 25, 20, 15, 12, 9, 7, 5, 3, 2] },
    f2: { id: 'f2', name: 'FIA Fórmula 2', short: 'F2', level: 7, minAge: 18, maxAge: 25, rounds: 14, grid: 22, seats: 2, carW: .5, cost: 2600000, mean: 82, dnf: .055, laps: 24, single: true,
      races: [{ id: 'sprint', name: 'Sprint', pts: [10, 8, 6, 5, 4, 3, 2, 1], grid: { rev: 'quali', n: 10 }, fl: 1 },
              { id: 'feature', name: 'Corrida Principal', pts: F1PTS, grid: 'quali', pole: 2, fl: 1 }], sl: [40, 40, 40, 30, 20, 10, 8, 6, 4, 3] },
    f1: { id: 'f1', name: 'Fórmula 1', short: 'F1', level: 8, minAge: 18, maxAge: 99, rounds: 24, grid: 22, seats: 2, carW: .6, cost: 0, mean: 86, dnf: .045, laps: 55, single: true,
      races: [{ id: 'gp', name: 'Grande Prêmio', pts: F1PTS, grid: 'quali' }],
      sprint: { id: 'sprint', name: 'Sprint', pts: [8, 7, 6, 5, 4, 3, 2, 1], grid: 'quali' }, sl: [] }
  };
  Game.data.categories = C;
  Game.data.ladder = ['kartReg', 'kartNac', 'kartMun', 'f4br', 'f4eu', 'frec', 'f3', 'f2', 'f1'];
  // para onde o piloto pode ir depois de cada categoria
  Game.data.nextOptions = { kartReg: ['kartNac', 'kartMun'], kartNac: ['kartMun', 'f4br'], kartMun: ['f4br', 'f4eu', 'frec'], f4br: ['f4eu', 'frec', 'f3'], f4eu: ['frec', 'f3'], frec: ['f3', 'f2'], f3: ['f2'], f2: ['f1'], f1: [] };
  // de onde vêm os pilotos que sobem para cada categoria (usado na renovação dos grids)
  Game.data.feeders = { f1: ['f2'], f2: ['f3'], f3: ['frec', 'f4eu'], frec: ['f4eu', 'f4br'], f4eu: ['f4br', 'kartMun'], f4br: ['kartMun', 'kartNac'], kartMun: ['kartNac'], kartNac: ['kartReg'], kartReg: [] };
})();
