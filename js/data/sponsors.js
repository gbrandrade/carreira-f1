/* Patrocinadores. tier 1..4 (por nível de categoria). group = conflito (marcas concorrentes não coexistem).
   goal: tipo de meta da temporada (pts, podio, vitoria, top10, pop). Não cumprir reduz o pagamento. */
Game.data.sponsors = [
  // ---- Tier 1: Kart e categorias iniciais (12 marcas) ----
  { id: 'oficina',     name: 'Oficina do Zé',           group: 'mecanica',    tier: 1, pay: 8000,    goal: { k: 'top10', n: 2 } },
  { id: 'kartshop',    name: 'KartShop Brasil',         group: 'kart',        tier: 1, pay: 15000,   goal: { k: 'podio', n: 1 } },
  { id: 'pizza',       name: 'Pizzaria Bella Vita',     group: 'restaurante', tier: 1, pay: 12000,   goal: { k: 'pts',   n: 20 } },
  { id: 'autopecas',   name: 'Auto Peças Rápido',       group: 'autopecas',   tier: 1, pay: 14000,   goal: { k: 'top10', n: 3 } },
  { id: 'academia',    name: 'Academia Corpo & Forma',  group: 'fitness',     tier: 1, pay: 10000,   goal: { k: 'top10', n: 2 } },
  { id: 'cafeserra',   name: 'Café Serra Gaúcha',       group: 'cafe',        tier: 1, pay: 11000,   goal: { k: 'pts',   n: 18 } },
  { id: 'postoav',     name: 'Posto Avenida',           group: 'combustivel', tier: 1, pay: 16000,   goal: { k: 'podio', n: 1 } },
  { id: 'oticavisao',  name: 'Ótica Visão Clara',       group: 'otica',       tier: 1, pay: 13000,   goal: { k: 'pts',   n: 22 } },
  { id: 'horizonte',   name: 'Construtora Horizonte',   group: 'construcao',  tier: 1, pay: 22000,   goal: { k: 'podio', n: 2 } },
  { id: 'bompreco',    name: 'Supermercado Bom Preço',  group: 'varejo',      tier: 1, pay: 18000,   goal: { k: 'pts',   n: 25 } },
  { id: 'techcell',    name: 'TechCell Acessórios',     group: 'eletronicos', tier: 1, pay: 15000,   goal: { k: 'pop',   n: 14 } },
  { id: 'velozlog',    name: 'Transportadora Veloz',    group: 'logistica',   tier: 1, pay: 20000,   goal: { k: 'podio', n: 2 } },

  // ---- Tier 2: F4, Regional e entrada na F3 (12 marcas) ----
  { id: 'hankook',     name: 'Hankook',                 group: 'pneu',        tier: 2, pay: 120000,  goal: { k: 'podio', n: 2 } },
  { id: 'pirelli',     name: 'Pirelli Motorsport',      group: 'pneu',        tier: 2, pay: 160000,  goal: { k: 'podio', n: 3 } },
  { id: 'petrobras',   name: 'Petrobras',               group: 'petroleo',    tier: 2, pay: 250000,  goal: { k: 'pts',   n: 60 } },
  { id: 'shell',       name: 'Shell',                   group: 'petroleo',    tier: 2, pay: 280000,  goal: { k: 'podio', n: 3 } },
  { id: 'itau',        name: 'Itaú',                    group: 'banco',       tier: 2, pay: 220000,  goal: { k: 'top10', n: 6 } },
  { id: 'inter',       name: 'Banco Inter',             group: 'banco',       tier: 2, pay: 190000,  goal: { k: 'pts',   n: 50 } },
  { id: 'localiza',    name: 'Localiza',                group: 'mobilidade',  tier: 2, pay: 175000,  goal: { k: 'top10', n: 5 } },
  { id: 'sparco',      name: 'Sparco',                  group: 'equipamento', tier: 2, pay: 130000,  goal: { k: 'podio', n: 2 } },
  { id: 'omp',         name: 'OMP Racing',              group: 'equipamento', tier: 2, pay: 125000,  goal: { k: 'top10', n: 5 } },
  { id: 'gatorade',    name: 'Gatorade',                group: 'bebidas',     tier: 2, pay: 150000,  goal: { k: 'pop',   n: 28 } },
  { id: 'claro',       name: 'Claro',                   group: 'telecom',     tier: 2, pay: 210000,  goal: { k: 'pts',   n: 55 } },
  { id: 'azul',        name: 'Azul Linhas Aéreas',      group: 'aviacao',     tier: 2, pay: 240000,  goal: { k: 'podio', n: 2 } },

  // ---- Tier 3: F3, F2 e F1 intermediário (10 marcas) ----
  { id: 'monster',     name: 'Monster Energy',          group: 'energetico',  tier: 3, pay: 1500000, goal: { k: 'podio', n: 4 } },
  { id: 'santander',   name: 'Santander',               group: 'banco',       tier: 3, pay: 1800000, goal: { k: 'pts',   n: 80 } },
  { id: 'puma',        name: 'Puma',                    group: 'roupa',       tier: 3, pay: 1200000, goal: { k: 'pop',   n: 40 } },
  { id: 'nike',        name: 'Nike',                    group: 'roupa',       tier: 3, pay: 1400000, goal: { k: 'pop',   n: 45 } },
  { id: 'dhl',         name: 'DHL Express',             group: 'logistica',   tier: 3, pay: 1600000, goal: { k: 'pts',   n: 75 } },
  { id: 'heineken',    name: 'Heineken 0.0',            group: 'bebidas',     tier: 3, pay: 1900000, goal: { k: 'podio', n: 3 } },
  { id: 'lenovo',      name: 'Lenovo',                  group: 'tech',        tier: 3, pay: 1550000, goal: { k: 'top10', n: 10 } },
  { id: 'oakley',      name: 'Oakley',                  group: 'otica',       tier: 3, pay: 1100000, goal: { k: 'pop',   n: 38 } },
  { id: 'tagheuer',    name: 'TAG Heuer',               group: 'relogio',     tier: 3, pay: 2100000, goal: { k: 'podio', n: 4 } },
  { id: 'bwt',         name: 'BWT',                     group: 'agua',        tier: 3, pay: 1350000, goal: { k: 'pts',   n: 70 } },

  // ---- Tier 4: F1 Top (10 marcas) ----
  { id: 'redbull',     name: 'Red Bull',                group: 'energetico',  tier: 4, pay: 9000000, goal: { k: 'vitoria', n: 2 } },
  { id: 'rolex',       name: 'Rolex',                   group: 'relogio',     tier: 4, pay: 7000000, goal: { k: 'pop',     n: 60 } },
  { id: 'rmille',      name: 'Richard Mille',           group: 'relogio',     tier: 4, pay: 6000000, goal: { k: 'podio',   n: 5 } },
  { id: 'aramco',      name: 'Aramco',                  group: 'petroleo',    tier: 4, pay: 12000000, goal: { k: 'pts',    n: 150 } },
  { id: 'mastercard',  name: 'Mastercard',              group: 'cartao',      tier: 4, pay: 8000000, goal: { k: 'pts',     n: 120 } },
  { id: 'oracle',      name: 'Oracle',                  group: 'tech',        tier: 4, pay: 10500000, goal: { k: 'vitoria', n: 2 } },
  { id: 'petronas',    name: 'Petronas',                group: 'petroleo',    tier: 4, pay: 9500000, goal: { k: 'podio',   n: 6 } },
  { id: 'emirates',    name: 'Emirates',                group: 'aviacao',     tier: 4, pay: 8500000, goal: { k: 'pts',     n: 130 } },
  { id: 'hp',          name: 'HP Inc.',                 group: 'tech',        tier: 4, pay: 7800000, goal: { k: 'pts',     n: 110 } },
  { id: 'vodafone',    name: 'Vodafone',                group: 'telecom',     tier: 4, pay: 6800000, goal: { k: 'podio',   n: 4 } }
];

Game.data.goalText = {
  top10:   n => `${n} chegadas no top 10`,
  podio:   n => `${n} pódios`,
  pts:     n => `${n} pontos`,
  vitoria: n => `${n} vitórias`,
  pop:     n => `popularidade ${n}+`
};
