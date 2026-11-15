/* Equipes por categoria. car = nota base do carro (a regra de regulamento e o desenvolvimento mexem nisso). */
(function () {
  const t = (id, name, car, prestige) => ({ id, name, car, prestige });
  Game.data.teams = {
    f1: [t('rb', 'Oracle Red Bull Racing', 87, .9), t('fer', 'Scuderia Ferrari HP', 88, 1), t('mer', 'Mercedes-AMG Petronas F1 Team', 90, .95), t('mcl', 'McLaren Formula 1 Team', 88, .9),
         t('ast', 'Aston Martin Aramco F1 Team', 79, .6), t('alp', 'BWT Alpine F1 Team', 78, .5), t('wil', 'Atlassian Williams Racing', 80, .55), t('aud', 'Audi Revolut F1 Team', 76, .45),
         t('haa', 'TGR Haas F1 Team', 76, .35), t('rbs', 'Visa Cash App Racing Bulls', 77, .4), t('cad', 'Cadillac Formula 1 Team', 72, .25)],
    f2: [t('art2', 'ART Grand Prix', 80, .8), t('dam2', 'DAMS Lucas Oil', 78, .6), t('cam2', 'Campos Racing', 82, .7), t('inv2', 'Invicta Racing', 80, .6), t('mp2', 'MP Motorsport', 81, .7),
         t('pre2', 'Prema Racing', 82, .95), t('rod2', 'Rodin Motorsport', 81, .7), t('tri2', 'Trident', 79, .6), t('hit2', 'Hitech', 78, .55), t('var2', 'Van Amersfoort Racing', 77, .5), t('aix2', 'AIX Racing', 75, .3)],
    f3: [t('pre3', 'Prema Racing', 80, 1), t('tri3', 'Trident', 78, .7), t('mp3', 'MP Motorsport', 78, .7), t('hit3', 'Hitech', 77, .6), t('art3', 'ART Grand Prix', 78, .75),
         t('cam3', 'Campos Racing', 77, .6), t('rod3', 'Rodin Motorsport', 77, .6), t('var3', 'Van Amersfoort Racing', 76, .5), t('aix3', 'AIX Racing', 74, .35), t('dam3', 'DAMS Lucas Oil', 75, .4)],
    frec: [t('pre4', 'Prema Racing', 76, 1), t('rac4', 'R-ace GP', 75, .8), t('art4', 'ART Grand Prix', 75, .75), t('mp4', 'MP Motorsport', 74, .6), t('var4', 'Van Amersfoort Racing', 73, .5),
           t('tri4', 'Trident', 73, .55), t('hit4', 'Hitech', 72, .5), t('rod4', 'Rodin Motorsport', 73, .5)],
    f4eu: [t('pre5', 'Prema Racing', 72, 1), t('usr5', 'US Racing', 71, .7), t('var5', 'Van Amersfoort Racing', 70, .6), t('iro5', 'Iron Lynx', 70, .55),
           t('muc5', 'Mücke Motorsport', 69, .5), t('rac5', 'R-ace GP', 70, .6), t('rod5', 'Rodin Motorsport', 69, .45), t('cam5', 'Campos Racing', 69, .45)],
    f4br: [t('tmg', 'TMG Racing', 68, .9), t('cav', 'Cavaleiro Sports', 68, .85), t('b1', 'Equipe Interlagos Júnior', 65, .5), t('b2', 'Goiânia Racing', 65, .4), t('b3', 'Brasília Motorsport', 64, .35), t('b4', 'Cuiabá Competições', 63, .3)],
    kartMun: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map((l, i) => t('km' + l, 'Kart Team Internacional ' + l, 70, 1 - i * .07)),
    kartNac: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((l, i) => t('kn' + l, 'Equipe Kart Brasil ' + l, 66, 1 - i * .09)),
    kartReg: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((l, i) => t('kr' + l, 'Equipe Kart Regional ' + l, 62, 1 - i * .09))
  };
  // academias de pilotos das equipes de F1 (usadas nas ofertas de academia)
  Game.data.academies = ['Ferrari Driver Academy', 'Red Bull Junior Team', 'Mercedes Junior Team', 'McLaren Driver Development Programme', 'Alpine Academy', 'Williams Driver Academy'];
})();
