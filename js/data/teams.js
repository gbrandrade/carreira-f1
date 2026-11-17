/* Equipes por categoria e evolução histórica realista da F1 (2018 a 2026+). */
(function () {
  const t = (id, name, car, prestige, minYear) => ({ id, name, car, prestige, minYear: minYear || 2000 });
  Game.data.teams = {
    f1: [
      t('rb',  'Oracle Red Bull Racing', 87, .9),
      t('fer', 'Scuderia Ferrari HP', 88, 1),
      t('mer', 'Mercedes-AMG Petronas F1 Team', 90, .95),
      t('mcl', 'McLaren Formula 1 Team', 88, .9),
      t('ast', 'Aston Martin Aramco F1 Team', 79, .6),
      t('alp', 'BWT Alpine F1 Team', 78, .5),
      t('wil', 'Atlassian Williams Racing', 80, .55),
      t('aud', 'Audi Revolut F1 Team', 76, .45),
      t('haa', 'TGR Haas F1 Team', 76, .35),
      t('rbs', 'Visa Cash App Racing Bulls', 77, .4),
      t('cad', 'Cadillac Formula 1 Team', 72, .25, 2026)
    ],
    f2: [
      t('art2', 'ART Grand Prix', 80, .8), t('dam2', 'DAMS Lucas Oil', 78, .6), t('cam2', 'Campos Racing', 82, .7),
      t('inv2', 'Invicta Racing', 80, .6), t('mp2', 'MP Motorsport', 81, .7), t('pre2', 'Prema Racing', 82, .95),
      t('rod2', 'Rodin Motorsport', 81, .7), t('tri2', 'Trident', 79, .6), t('hit2', 'Hitech', 78, .55),
      t('var2', 'Van Amersfoort Racing', 77, .5), t('aix2', 'AIX Racing', 75, .3)
    ],
    f3: [
      t('pre3', 'Prema Racing', 80, 1), t('tri3', 'Trident', 78, .7), t('mp3', 'MP Motorsport', 78, .7),
      t('hit3', 'Hitech', 77, .6), t('art3', 'ART Grand Prix', 78, .75), t('cam3', 'Campos Racing', 77, .6),
      t('rod3', 'Rodin Motorsport', 77, .6), t('var3', 'Van Amersfoort Racing', 76, .5),
      t('aix3', 'AIX Racing', 74, .35), t('dam3', 'DAMS Lucas Oil', 75, .4)
    ],
    frec: [
      t('pre4', 'Prema Racing', 76, 1), t('rac4', 'R-ace GP', 75, .8), t('art4', 'ART Grand Prix', 75, .75),
      t('mp4', 'MP Motorsport', 74, .6), t('var4', 'Van Amersfoort Racing', 73, .5), t('tri4', 'Trident', 73, .55),
      t('hit4', 'Hitech', 72, .5), t('rod4', 'Rodin Motorsport', 73, .5)
    ],
    f4eu: [
      t('pre5', 'Prema Racing', 72, 1), t('usr5', 'US Racing', 71, .7), t('var5', 'Van Amersfoort Racing', 70, .6),
      t('iro5', 'Iron Lynx', 70, .55), t('muc5', 'Mücke Motorsport', 69, .5), t('rac5', 'R-ace GP', 70, .6),
      t('rod5', 'Rodin Motorsport', 69, .45), t('cam5', 'Campos Racing', 69, .45)
    ],
    f4br: [
      t('tmg', 'TMG Racing', 68, .9), t('cav', 'Cavaleiro Sports', 68, .85), t('b1', 'Equipe Interlagos Júnior', 65, .5),
      t('b2', 'Goiânia Racing', 65, .4), t('b3', 'Brasília Motorsport', 64, .35), t('b4', 'Cuiabá Competições', 63, .3)
    ],
    kartMun: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map((l, i) => t('km' + l, 'Kart Team Internacional ' + l, 70, 1 - i * .07)),
    kartNac: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((l, i) => t('kn' + l, 'Equipe Kart Brasil ' + l, 66, 1 - i * .09)),
    kartReg: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((l, i) => t('kr' + l, 'Equipe Kart Regional ' + l, 62, 1 - i * .09))
  };

  /* Nomes oficiais e desempenho realista das equipes de F1 por ano (2018-2026). */
  Game.data.f1History = {
    rb: [
      { from: 2018, to: 2020, name: 'Aston Martin Red Bull Racing', cars: { 2018: 86, 2019: 86, 2020: 87 }, prestige: .88 },
      { from: 2021, to: 2021, name: 'Red Bull Racing Honda', cars: { 2021: 91 }, prestige: .92 },
      { from: 2022, to: 9999, name: 'Oracle Red Bull Racing', cars: { 2022: 92, 2023: 95, 2024: 89, 2025: 87, 2026: 87 }, prestige: .94 }
    ],
    fer: [
      { from: 2018, to: 2023, name: 'Scuderia Ferrari', cars: { 2018: 90, 2019: 88, 2020: 78, 2021: 83, 2022: 89, 2023: 85 }, prestige: 1 },
      { from: 2024, to: 9999, name: 'Scuderia Ferrari HP', cars: { 2024: 89, 2025: 88, 2026: 88 }, prestige: 1 }
    ],
    mer: [
      { from: 2018, to: 2019, name: 'Mercedes-AMG Petronas Motorsport', cars: { 2018: 92, 2019: 93 }, prestige: .96 },
      { from: 2020, to: 9999, name: 'Mercedes-AMG Petronas F1 Team', cars: { 2020: 95, 2021: 92, 2022: 84, 2023: 84, 2024: 85, 2025: 86, 2026: 90 }, prestige: .95 }
    ],
    mcl: [
      { from: 2018, to: 2023, name: 'McLaren F1 Team', cars: { 2018: 75, 2019: 80, 2020: 82, 2021: 84, 2022: 80, 2023: 84 }, prestige: .82 },
      { from: 2024, to: 9999, name: 'McLaren Formula 1 Team', cars: { 2024: 92, 2025: 93, 2026: 88 }, prestige: .92 }
    ],
    ast: [
      { from: 2018, to: 2018, name: 'Sahara Force India F1 Team', cars: { 2018: 78 }, prestige: .45 },
      { from: 2019, to: 2020, name: 'BWT Racing Point F1 Team', cars: { 2019: 77, 2020: 83 }, prestige: .50 },
      { from: 2021, to: 2022, name: 'Aston Martin Cognizant F1 Team', cars: { 2021: 78, 2022: 77 }, prestige: .58 },
      { from: 2023, to: 9999, name: 'Aston Martin Aramco F1 Team', cars: { 2023: 83, 2024: 79, 2025: 78, 2026: 79 }, prestige: .62 }
    ],
    alp: [
      { from: 2018, to: 2019, name: 'Renault Sport Formula One Team', cars: { 2018: 80, 2019: 79 }, prestige: .55 },
      { from: 2020, to: 2020, name: 'Renault DP World F1 Team', cars: { 2020: 81 }, prestige: .56 },
      { from: 2021, to: 2021, name: 'Alpine F1 Team', cars: { 2021: 80 }, prestige: .55 },
      { from: 2022, to: 9999, name: 'BWT Alpine F1 Team', cars: { 2022: 81, 2023: 79, 2024: 75, 2025: 76, 2026: 78 }, prestige: .52 }
    ],
    wil: [
      { from: 2018, to: 2018, name: 'Williams Martini Racing', cars: { 2018: 70 }, prestige: .48 },
      { from: 2019, to: 2019, name: 'ROKiT Williams Racing', cars: { 2019: 66 }, prestige: .45 },
      { from: 2020, to: 2024, name: 'Williams Racing', cars: { 2020: 69, 2021: 73, 2022: 71, 2023: 74, 2024: 74 }, prestige: .48 },
      { from: 2025, to: 9999, name: 'Atlassian Williams Racing', cars: { 2025: 78, 2026: 80 }, prestige: .56 }
    ],
    aud: [
      { from: 2018, to: 2018, name: 'Alfa Romeo Sauber F1 Team', cars: { 2018: 76 }, prestige: .38 },
      { from: 2019, to: 2022, name: 'Alfa Romeo Racing ORLEN', cars: { 2019: 76, 2020: 73, 2021: 74, 2022: 77 }, prestige: .40 },
      { from: 2023, to: 2023, name: 'Alfa Romeo F1 Team Stake', cars: { 2023: 73 }, prestige: .38 },
      { from: 2024, to: 2025, name: 'Stake F1 Team Kick Sauber', cars: { 2024: 70, 2025: 73 }, prestige: .38 },
      { from: 2026, to: 9999, name: 'Audi Revolut F1 Team', cars: { 2026: 76 }, prestige: .50 }
    ],
    haa: [
      { from: 2018, to: 2022, name: 'Haas F1 Team', cars: { 2018: 79, 2019: 74, 2020: 70, 2021: 66, 2022: 75 }, prestige: .35 },
      { from: 2023, to: 2025, name: 'MoneyGram Haas F1 Team', cars: { 2023: 73, 2024: 77, 2025: 77 }, prestige: .38 },
      { from: 2026, to: 9999, name: 'TGR Haas F1 Team', cars: { 2026: 76 }, prestige: .40 }
    ],
    rbs: [
      { from: 2018, to: 2019, name: 'Red Bull Toro Rosso Honda', cars: { 2018: 75, 2019: 78 }, prestige: .40 },
      { from: 2020, to: 2023, name: 'Scuderia AlphaTauri', cars: { 2020: 79, 2021: 80, 2022: 75, 2023: 75 }, prestige: .42 },
      { from: 2024, to: 2024, name: 'Visa Cash App RB F1 Team', cars: { 2024: 76 }, prestige: .42 },
      { from: 2025, to: 9999, name: 'Visa Cash App Racing Bulls', cars: { 2025: 77, 2026: 77 }, prestige: .42 }
    ],
    cad: [
      { from: 2026, to: 9999, name: 'Cadillac Formula 1 Team', cars: { 2026: 72 }, prestige: .30 }
    ]
  };

  Game.data.academies = [
    'Ferrari Driver Academy',
    'Red Bull Junior Team',
    'Mercedes Junior Team',
    'McLaren Driver Development Programme',
    'Alpine Academy',
    'Williams Driver Academy',
    'Sauber / Audi Academy'
  ];
})();
