/* Parâmetros gerais. Mexa aqui para balancear o jogo sem tocar nas regras. */
Game.config = {
  title: 'Caminho até a F1',
  saveKey: 'caminho-f1-save-v1',
  startYear: 2018,          // ano de início (idade inicial 12). Use 2026 para a grade real de 2026
  startAge: 12,
  dataYear: 2026,           // ano em que as notas dos pilotos reais foram medidas
  weights: { EXP: 0.05, RAC: 0.27, ATE: 0.11, RIT: 0.57 },   // fórmula do GER
  refreshes: 3,             // trocas de carta na roleta
  rarity: { ruim: 25, mediano: 35, bom: 25, lendario: 13, prime: 2 },
  f1MinAge: 18,
  frustratedAge: 28,        // sem superlicença até essa idade = carreira frustrada
  neverF1QuitAge: 32,
  retireOptionalAge: 35,
  retireForcedAge: 45,
  regulationCycle: 4,       // virada grande de regulamento a cada N anos
  regulationBaseYear: 2026,
  eventsPerRound: [1, 2],   // eventos por etapa (mínimo e máximo)
  sprintsByYear: { default: 6, 2027: 10 },
  superlicense: { points: 40, windowYears: 3, kartMax: 12, kartValidYears: 5, minSeasons: 2 },
  luckRange: [-4, 1],       // sorte aplicada ao teto de cada atributo na criação
  trainCap: 6,
  assetSellRate: 0.7
};
