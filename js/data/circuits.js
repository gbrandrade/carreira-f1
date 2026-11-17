/* Circuitos. q = importância da posição de largada (0.6 a 2.2). prof: dw=carga aerodinâmica, pw=reta, bal=equilibrado. rain = chance de chuva (%). */
(function () {
  const c = (id, name, country, q, prof, rain) => ({ id, name, country, q, prof, rain });
  const F1 = {
    aus: c('aus', 'Albert Park (Melbourne)', 'AUS', 1.1, 'bal', 15),
    chn: c('chn', 'Xangai', 'CHN', 1.0, 'bal', 25),
    jpn: c('jpn', 'Suzuka', 'JPN', 1.3, 'dw', 25),
    bhr: c('bhr', 'Sakhir', 'BHR', .8, 'pw', 2),
    ksa: c('ksa', 'Jeddah', 'KSA', 1.0, 'pw', 1),
    mia: c('mia', 'Miami', 'USA', .9, 'bal', 20),
    can: c('can', 'Montreal', 'CAN', .9, 'pw', 25),
    mon: c('mon', 'Mônaco', 'MON', 2.2, 'dw', 15),
    esp: c('esp', 'Barcelona', 'ESP', 1.5, 'dw', 8),
    aut: c('aut', 'Red Bull Ring', 'AUT', .8, 'pw', 20),
    gbr: c('gbr', 'Silverstone', 'GBR', 1.0, 'dw', 30),
    bel: c('bel', 'Spa-Francorchamps', 'BEL', .8, 'pw', 40),
    hun: c('hun', 'Hungaroring', 'HUN', 1.6, 'dw', 15),
    ned: c('ned', 'Zandvoort', 'NED', 1.5, 'dw', 25),
    ita: c('ita', 'Monza', 'ITA', .8, 'pw', 10),
    mad: c('mad', 'Madrid', 'ESP', 1.2, 'bal', 5),
    aze: c('aze', 'Baku', 'AZE', .8, 'pw', 8),
    sgp: c('sgp', 'Singapura', 'SGP', 1.5, 'dw', 30),
    usa: c('usa', 'Austin (COTA)', 'USA', .9, 'bal', 10),
    mex: c('mex', 'Cidade do México', 'MEX', 1.0, 'bal', 10),
    bra: c('bra', 'Interlagos (São Paulo)', 'BRA', .8, 'bal', 40),
    lvs: c('lvs', 'Las Vegas', 'USA', .8, 'pw', 3),
    qat: c('qat', 'Lusail', 'QAT', 1.0, 'dw', 2),
    abu: c('abu', 'Yas Marina', 'UAE', 1.2, 'bal', 2),
    // reservas / rotação oficial (inclui Portimão e Istambul)
    imo: c('imo', 'Ímola', 'ITA', 1.7, 'dw', 20),
    por: c('por', 'Portimão', 'POR', 1.0, 'bal', 12),
    fra: c('fra', 'Paul Ricard', 'FRA', 1.1, 'bal', 8),
    ger: c('ger', 'Hockenheim', 'GER', .9, 'pw', 20),
    tur: c('tur', 'Istambul', 'TUR', 1.0, 'dw', 15),
    mug: c('mug', 'Mugello', 'ITA', 1.3, 'dw', 12),
    mal: c('mal', 'Sepang', 'MAS', .9, 'pw', 35),
    rsa: c('rsa', 'Kyalami', 'RSA', 1.0, 'bal', 15)
  };
  Game.data.circuits = F1;

  // Calendário F1 2026 (24 GPs)
  Game.data.f1Base = ['aus', 'chn', 'jpn', 'bhr', 'ksa', 'mia', 'can', 'mon', 'esp', 'aut', 'gbr', 'bel', 'hun', 'ned', 'ita', 'mad', 'aze', 'sgp', 'usa', 'mex', 'bra', 'lvs', 'qat', 'abu'];
  // Calendário F1 2027 (24 GPs com Portimão e Istambul)
  Game.data.f12027 = ['aus', 'chn', 'jpn', 'bhr', 'ksa', 'mia', 'can', 'mon', 'por', 'aut', 'gbr', 'bel', 'hun', 'tur', 'ita', 'mad', 'aze', 'sgp', 'usa', 'mex', 'bra', 'lvs', 'qat', 'abu'];

  Game.data.f1Reserve = ['imo', 'por', 'tur', 'fra', 'ger', 'mug', 'mal', 'rsa'];
  Game.data.f1Iconic = ['mon', 'ita', 'gbr', 'bel', 'bra', 'jpn', 'abu'];
  Game.data.sprintOrder = ['chn', 'mia', 'can', 'gbr', 'ned', 'sgp', 'aut', 'bra', 'qat', 'usa', 'por', 'tur'];

  // Pistas oficiais onde F2 (14 etapas) e F3 (10 etapas) coincidem com a F1
  Game.data.f2Tracks = ['aus', 'bhr', 'ksa', 'imo', 'mon', 'esp', 'por', 'aut', 'gbr', 'bel', 'hun', 'ita', 'mad', 'aze', 'qat', 'abu'];
  Game.data.f3Tracks = ['aus', 'bhr', 'imo', 'mon', 'esp', 'por', 'aut', 'gbr', 'bel', 'hun', 'ita', 'mad'];

  const k = (name, country, rain) => ({ id: name, name, country, q: 1.0, prof: 'bal', rain: rain || 10 });
  Game.data.circuitSets = {
    kartReg: [k('Kartódromo Granja Viana (SP)', 'BRA'), k('Kartódromo de Paulínia (SP)', 'BRA'), k('Kartódromo Beto Carrero (SC)', 'BRA', 25), k('Kartódromo de Curitiba (PR)', 'BRA', 25), k('Kartódromo de Brasília (DF)', 'BRA'), k('Kartódromo de Goiânia (GO)', 'BRA')],
    kartMun: [k('Lonato (ITA)', 'ITA'), k('Genk (BEL)', 'BEL', 30), k('Le Mans Karting (FRA)', 'FRA', 20), k('Zuera (ESP)', 'ESP', 5), k('Kristianstad (SWE)', 'SWE', 25)],
    f4br: ['bra', 'Goiânia', 'Cuiabá', 'Brasília', 'Curitiba', 'Velocitta'].map((n, i) => i === 0 ? Game.data.circuits.bra : { id: 'br' + i, name: n, country: 'BRA', q: 1.1, prof: 'bal', rain: 25 }),
    f4eu: ['ita', 'mug', 'imo', 'esp', 'fra'].map(i => Game.data.circuits[i]).concat([{ id: 'mis', name: 'Misano', country: 'ITA', q: 1.3, prof: 'dw', rain: 15 }, { id: 'val', name: 'Vallelunga', country: 'ITA', q: 1.3, prof: 'bal', rain: 15 }]),
    frec: ['aut', 'ned', 'bel', 'ita', 'imo', 'hun', 'esp', 'fra'].map(i => Game.data.circuits[i])
  };
  Game.data.circuitSets.kartNac = Game.data.circuitSets.kartReg;
})();
