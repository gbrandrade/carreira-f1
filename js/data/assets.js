/* Patrimônio. minLv = nível mínimo de categoria para desbloquear (0 kart .. 8 F1).
   fx por etapa: mental/phys = recuperação; por ano: pop (popularidade), train (evolução), rep (reputação). */
Game.data.assets = [
  { id: 'sim1', type: 'Simulador', name: 'Simulador básico', price: 30000, upkeep: 2000, minLv: 0, fx: { train: .4 }, desc: '+ evolução anual' },
  { id: 'apto', type: 'Casa', name: 'Apartamento em São Paulo', price: 200000, upkeep: 8000, minLv: 0, fx: { mental: 1.5 }, desc: '+ recuperação mental' },
  { id: 'esportivo', type: 'Carro', name: 'Carro esportivo', price: 150000, upkeep: 5000, minLv: 2, fx: { pop: 1.5 }, desc: '+ popularidade' },
  { id: 'prep', type: 'Equipe', name: 'Preparador físico', price: 0, upkeep: 80000, minLv: 2, fx: { phys: 3 }, desc: '+ recuperação física', staff: true },
  { id: 'psi', type: 'Equipe', name: 'Psicólogo esportivo', price: 0, upkeep: 60000, minLv: 3, fx: { mental: 3 }, desc: '+ recuperação mental', staff: true },
  { id: 'assessor', type: 'Equipe', name: 'Assessor de imprensa', price: 0, upkeep: 40000, minLv: 3, fx: { media: 1.3 }, desc: '+ ganhos de popularidade', staff: true },
  { id: 'sim2', type: 'Simulador', name: 'Simulador profissional', price: 300000, upkeep: 20000, minLv: 4, fx: { train: 1.0 }, desc: '++ evolução anual' },
  { id: 'super', type: 'Carro', name: 'Supercarro', price: 600000, upkeep: 15000, minLv: 5, fx: { pop: 3 }, desc: '++ popularidade' },
  { id: 'casa', type: 'Casa', name: 'Casa de alto padrão', price: 3000000, upkeep: 80000, minLv: 5, fx: { mental: 3, pop: 1.5 }, desc: '++ recuperação mental' },
  { id: 'lancha', type: 'Iate', name: 'Lancha', price: 500000, upkeep: 25000, minLv: 6, fx: { pop: 2.5, mental: 1 }, desc: 'prestígio e descanso' },
  { id: 'sim3', type: 'Simulador', name: 'Simulador de elite', price: 2000000, upkeep: 120000, minLv: 6, fx: { train: 1.8 }, desc: '+++ evolução anual' },
  { id: 'classico', type: 'Carro', name: 'Clássico de coleção', price: 2000000, upkeep: 30000, minLv: 7, fx: { pop: 4, rep: 1 }, desc: '+++ popularidade e imagem' },
  { id: 'mansao', type: 'Casa', name: 'Mansão em Mônaco', price: 12000000, upkeep: 250000, minLv: 7, fx: { mental: 4, pop: 4 }, desc: '+++ mente e prestígio' },
  { id: 'iate', type: 'Iate', name: 'Iate de luxo', price: 8000000, upkeep: 400000, minLv: 8, fx: { pop: 7, mental: 2 }, desc: 'muito prestígio' }
];

Game.data.investments = [
  { id: 'imoveis', name: 'Imóveis', mean: .06, sd: .04, desc: 'Retorno baixo e estável' },
  { id: 'acoes', name: 'Ações', mean: .09, sd: .18, desc: 'Retorno médio, risco médio' },
  { id: 'negocio', name: 'Negócio próprio', mean: .14, sd: .38, desc: 'Retorno alto, pode quebrar' }
];

Game.data.residences = [
  { id: 'BRA', name: 'Brasil', tax: .275, fans: 0, minLv: 0 },
  { id: 'GBR', name: 'Reino Unido', tax: .30, fans: -2, minLv: 4 },
  { id: 'SUI', name: 'Suíça', tax: .15, fans: -4, minLv: 6 },
  { id: 'MON', name: 'Mônaco', tax: 0, fans: -6, minLv: 7 }
];
