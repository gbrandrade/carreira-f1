/* Equipes por categoria, cores oficiais e evolução histórica realista da F1 (2018 a 2026+). */
(function () {
  const t = (id, name, car, prestige, minYear, color) => ({
    id, name, car, prestige, minYear: minYear || 2000, color: color || null
  });
  Game.data.teams = {
    f1: [
      t('rb',  'Oracle Red Bull Racing',        87, .90, 2000, '#3671C6'),
      t('fer', 'Scuderia Ferrari HP',           88, 1.0, 2000, '#E80020'),
      t('mer', 'Mercedes-AMG Petronas F1 Team', 90, .95, 2000, '#27F4D2'),
      t('mcl', 'McLaren Formula 1 Team',        88, .90, 2000, '#FF8000'),
      t('ast', 'Aston Martin Aramco F1 Team',   79, .60, 2000, '#229971'),
      t('alp', 'BWT Alpine F1 Team',            78, .50, 2000, '#FF87BC'),
      t('wil', 'Atlassian Williams Racing',     80, .55, 2000, '#64C4FF'),
      t('aud', 'Audi Revolut F1 Team',          76, .45, 2000, '#F50537'),
      t('haa', 'TGR Haas F1 Team',              76, .35, 2000, '#B6BABD'),
      t('rbs', 'Visa Cash App Racing Bulls',    77, .40, 2000, '#6692FF'),
      t('cad', 'Cadillac Formula 1 Team',       72, .25, 2026, '#C5A059')
    ],
    f2: [
      t('art2', 'ART Grand Prix',         80, .80, 2000, '#B41E3A'),
      t('dam2', 'DAMS Lucas Oil',         78, .60, 2000, '#00A3E0'),
      t('cam2', 'Campos Racing',          82, .70, 2000, '#FF6B00'),
      t('inv2', 'Invicta Racing',         80, .60, 2000, '#F5C400'),
      t('mp2',  'MP Motorsport',          81, .70, 2000, '#FF5500'),
      t('pre2', 'Prema Racing',           82, .95, 2000, '#E2001A'),
      t('rod2', 'Rodin Motorsport',       81, .70, 2000, '#10B981'),
      t('tri2', 'Trident',                79, .60, 2000, '#1D4ED8'),
      t('hit2', 'Hitech',                 78, .55, 2000, '#9CA3AF'),
      t('var2', 'Van Amersfoort Racing',  77, .50, 2000, '#F97316'),
      t('aix2', 'AIX Racing',             75, .30, 2000, '#38BDF8')
    ],
    f3: [
      t('pre3', 'Prema Racing',           80, 1.0, 2000, '#E2001A'),
      t('tri3', 'Trident',                78, .70, 2000, '#1D4ED8'),
      t('mp3',  'MP Motorsport',          78, .70, 2000, '#FF5500'),
      t('hit3', 'Hitech',                 77, .60, 2000, '#9CA3AF'),
      t('art3', 'ART Grand Prix',         78, .75, 2000, '#B41E3A'),
      t('cam3', 'Campos Racing',          77, .60, 2000, '#FF6B00'),
      t('rod3', 'Rodin Motorsport',       77, .60, 2000, '#10B981'),
      t('var3', 'Van Amersfoort Racing',  76, .50, 2000, '#F97316'),
      t('aix3', 'AIX Racing',             74, .35, 2000, '#38BDF8'),
      t('dam3', 'DAMS Lucas Oil',         75, .40, 2000, '#00A3E0')
    ],
    frec: [
      t('pre4', 'Prema Racing',           76, 1.0, 2000, '#E2001A'),
      t('rac4', 'R-ace GP',               75, .80, 2000, '#F59E0B'),
      t('art4', 'ART Grand Prix',         75, .75, 2000, '#B41E3A'),
      t('mp4',  'MP Motorsport',          74, .60, 2000, '#FF5500'),
      t('var4', 'Van Amersfoort Racing',  73, .50, 2000, '#F97316'),
      t('tri4', 'Trident',                73, .55, 2000, '#1D4ED8'),
      t('hit4', 'Hitech',                 72, .50, 2000, '#9CA3AF'),
      t('rod4', 'Rodin Motorsport',       73, .50, 2000, '#10B981')
    ],
    f4eu: [
      t('pre5', 'Prema Racing',           72, 1.0, 2000, '#E2001A'),
      t('usr5', 'US Racing',              71, .70, 2000, '#3B82F6'),
      t('var5', 'Van Amersfoort Racing',  70, .60, 2000, '#F97316'),
      t('iro5', 'Iron Lynx',              70, .55, 2000, '#EAB308'),
      t('muc5', 'Mücke Motorsport',       69, .50, 2000, '#EC4899'),
      t('rac5', 'R-ace GP',               70, .60, 2000, '#F59E0B'),
      t('rod5', 'Rodin Motorsport',       69, .45, 2000, '#10B981'),
      t('cam5', 'Campos Racing',          69, .45, 2000, '#FF6B00')
    ],
    f4br: [
      t('tmg', 'TMG Racing',               68, .90, 2000, '#22C55E'),
      t('cav', 'Cavaleiro Sports',         68, .85, 2000, '#EAB308'),
      t('b1',  'Equipe Interlagos Júnior', 65, .50, 2000, '#3B82F6'),
      t('b2',  'Goiânia Racing',           65, .40, 2000, '#F97316'),
      t('b3',  'Brasília Motorsport',      64, .35, 2000, '#A855F7'),
      t('b4',  'Cuiabá Competições',       63, .30, 2000, '#14B8A6')
    ],
    kartMun: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map((l, i) => t('km' + l, 'Kart Team Internacional ' + l, 70, 1 - i * .07)),
    kartNac: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((l, i) => t('kn' + l, 'Equipe Kart Brasil ' + l, 66, 1 - i * .09)),
    kartReg: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((l, i) => t('kr' + l, 'Equipe Kart Regional ' + l, 62, 1 - i * .09))
  };

  /* Nomes oficiais, cores históricas e desempenho realista das equipes de F1 por ano (2018-2026). */
  Game.data.f1History = {
    rb: [
      { from: 2018, to: 2020, name: 'Aston Martin Red Bull Racing', cars: { 2018: 86, 2019: 86, 2020: 87 }, prestige: .88, color: '#1E41FF' },
      { from: 2021, to: 2021, name: 'Red Bull Racing Honda', cars: { 2021: 91 }, prestige: .92, color: '#3671C6' },
      { from: 2022, to: 9999, name: 'Oracle Red Bull Racing', cars: { 2022: 92, 2023: 95, 2024: 89, 2025: 87, 2026: 87 }, prestige: .94, color: '#3671C6' }
    ],
    fer: [
      { from: 2018, to: 2023, name: 'Scuderia Ferrari', cars: { 2018: 90, 2019: 88, 2020: 78, 2021: 83, 2022: 89, 2023: 85 }, prestige: 1, color: '#DC0000' },
      { from: 2024, to: 9999, name: 'Scuderia Ferrari HP', cars: { 2024: 89, 2025: 88, 2026: 88 }, prestige: 1, color: '#E80020' }
    ],
    mer: [
      { from: 2018, to: 2019, name: 'Mercedes-AMG Petronas Motorsport', cars: { 2018: 92, 2019: 93 }, prestige: .96, color: '#00D2BE' },
      { from: 2020, to: 9999, name: 'Mercedes-AMG Petronas F1 Team', cars: { 2020: 95, 2021: 92, 2022: 84, 2023: 84, 2024: 85, 2025: 86, 2026: 90 }, prestige: .95, color: '#27F4D2' }
    ],
    mcl: [
      { from: 2018, to: 2023, name: 'McLaren F1 Team', cars: { 2018: 75, 2019: 80, 2020: 82, 2021: 84, 2022: 80, 2023: 84 }, prestige: .82, color: '#FF8700' },
      { from: 2024, to: 9999, name: 'McLaren Formula 1 Team', cars: { 2024: 92, 2025: 93, 2026: 88 }, prestige: .92, color: '#FF8000' }
    ],
    ast: [
      { from: 2018, to: 2018, name: 'Sahara Force India F1 Team', cars: { 2018: 78 }, prestige: .45, color: '#F596C8' },
      { from: 2019, to: 2020, name: 'BWT Racing Point F1 Team', cars: { 2019: 77, 2020: 83 }, prestige: .50, color: '#F596C8' },
      { from: 2021, to: 2022, name: 'Aston Martin Cognizant F1 Team', cars: { 2021: 78, 2022: 77 }, prestige: .58, color: '#006F62' },
      { from: 2023, to: 9999, name: 'Aston Martin Aramco F1 Team', cars: { 2023: 83, 2024: 79, 2025: 78, 2026: 79 }, prestige: .62, color: '#229971' }
    ],
    alp: [
      { from: 2018, to: 2019, name: 'Renault Sport Formula One Team', cars: { 2018: 80, 2019: 79 }, prestige: .55, color: '#FFF500' },
      { from: 2020, to: 2020, name: 'Renault DP World F1 Team', cars: { 2020: 81 }, prestige: .56, color: '#FFF500' },
      { from: 2021, to: 2021, name: 'Alpine F1 Team', cars: { 2021: 80 }, prestige: .55, color: '#0090FF' },
      { from: 2022, to: 9999, name: 'BWT Alpine F1 Team', cars: { 2022: 81, 2023: 79, 2024: 75, 2025: 76, 2026: 78 }, prestige: .52, color: '#FF87BC' }
    ],
    wil: [
      { from: 2018, to: 2018, name: 'Williams Martini Racing', cars: { 2018: 70 }, prestige: .48, color: '#FFFFFF' },
      { from: 2019, to: 2019, name: 'ROKiT Williams Racing', cars: { 2019: 66 }, prestige: .45, color: '#0082FA' },
      { from: 2020, to: 2024, name: 'Williams Racing', cars: { 2020: 69, 2021: 73, 2022: 71, 2023: 74, 2024: 74 }, prestige: .48, color: '#005AFF' },
      { from: 2025, to: 9999, name: 'Atlassian Williams Racing', cars: { 2025: 78, 2026: 80 }, prestige: .56, color: '#64C4FF' }
    ],
    aud: [
      { from: 2018, to: 2018, name: 'Alfa Romeo Sauber F1 Team', cars: { 2018: 76 }, prestige: .38, color: '#9B0000' },
      { from: 2019, to: 2022, name: 'Alfa Romeo Racing ORLEN', cars: { 2019: 76, 2020: 73, 2021: 74, 2022: 77 }, prestige: .40, color: '#900000' },
      { from: 2023, to: 2023, name: 'Alfa Romeo F1 Team Stake', cars: { 2023: 73 }, prestige: .38, color: '#C92D4B' },
      { from: 2024, to: 2025, name: 'Stake F1 Team Kick Sauber', cars: { 2024: 70, 2025: 73 }, prestige: .38, color: '#52E252' },
      { from: 2026, to: 9999, name: 'Audi Revolut F1 Team', cars: { 2026: 76 }, prestige: .50, color: '#F50537' }
    ],
    haa: [
      { from: 2018, to: 2022, name: 'Haas F1 Team', cars: { 2018: 79, 2019: 74, 2020: 70, 2021: 66, 2022: 75 }, prestige: .35, color: '#B6BABD' },
      { from: 2023, to: 2025, name: 'MoneyGram Haas F1 Team', cars: { 2023: 73, 2024: 77, 2025: 77 }, prestige: .38, color: '#B6BABD' },
      { from: 2026, to: 9999, name: 'TGR Haas F1 Team', cars: { 2026: 76 }, prestige: .40, color: '#E6002D' }
    ],
    rbs: [
      { from: 2018, to: 2019, name: 'Red Bull Toro Rosso Honda', cars: { 2018: 75, 2019: 78 }, prestige: .40, color: '#469BFF' },
      { from: 2020, to: 2023, name: 'Scuderia AlphaTauri', cars: { 2020: 79, 2021: 80, 2022: 75, 2023: 75 }, prestige: .42, color: '#5E8FAA' },
      { from: 2024, to: 2024, name: 'Visa Cash App RB F1 Team', cars: { 2024: 76 }, prestige: .42, color: '#6692FF' },
      { from: 2025, to: 9999, name: 'Visa Cash App Racing Bulls', cars: { 2025: 77, 2026: 77 }, prestige: .42, color: '#6692FF' }
    ],
    cad: [
      { from: 2026, to: 9999, name: 'Cadillac Formula 1 Team', cars: { 2026: 72 }, prestige: .30, color: '#C5A059' }
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
