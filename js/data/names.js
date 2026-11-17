/* Nomes para pilotos gerados e lista de países (código de 3 letras). */
(function () {
  const n = (f, l) => ({ f: f.split(' '), l: l.split(' ') });
  Game.data.names = {
    BRA: n('Gabriel Lucas Pedro Matheus Rafael João Enzo Miguel Davi Caio Bruno Felipe Eduardo Vinícius', 'Silva Souza Oliveira Santos Pereira Costa Almeida Ribeiro Carvalho Rocha Martins Barbosa Ferreira Gomes'),
    ESP: n('Pablo Hugo Álvaro Daniel Mateo Adrián Iker Sergio Carlos Javier', 'García Fernández López Martínez Sánchez Romero Navarro Torres Ruiz Díaz'),
    ITA: n('Luca Marco Matteo Andrea Leonardo Federico Alessio Giacomo Lorenzo Riccardo', 'Rossi Bianchi Romano Colombo Ricci Greco Conti Marino Esposito Ferrari'),
    FRA: n('Louis Hugo Jules Théo Nathan Maxime Lucas Antoine Pierre Romain', 'Martin Bernard Dubois Moreau Laurent Lefebvre Roux Fournier Mercier Girard'),
    GBR: n('Oliver Harry Jack Charlie Freddie Alfie Thomas Archie George Lando', 'Smith Taylor Wilson Brown Evans Walker Hughes Clarke Wright Robinson'),
    GER: n('Leon Finn Paul Jonas Noah Felix Ben Luca Nico Sebastian', 'Müller Schmidt Weber Fischer Wagner Becker Hoffmann Koch Richter Schäfer'),
    NED: n('Daan Sem Luuk Bram Milan Thijs Jesse Lars Max Nyck', 'de Vries Jansen van Dijk Bakker Visser Smit Meijer Mulder Bos Vos'),
    USA: n('Mason Ethan Logan Caleb Tyler Jackson Owen Wyatt Colton Hunter', 'Johnson Miller Davis Anderson Thomas Moore Carter Hayes Brooks Bennett'),
    JPN: n('Haruto Ren Sora Yuto Kaito Riku Takumi Daiki Yuki Ayumu', 'Sato Suzuki Takahashi Tanaka Watanabe Ito Yamamoto Nakamura Kobayashi Kato'),
    AUS: n('Jack Lachlan Noah Cooper Hudson Riley Blake Mitchell Oscar Liam', 'Wright Harris Campbell Stewart Ryan Murray Fraser Webb Kelly McDonald'),
    MEX: n('Santiago Mateo Diego Emiliano Leonardo Sebastián Ángel Iván Patricio Sergio', 'Hernández Ramírez Cruz Morales Ortega Castillo Vargas Ruiz Mendoza Chávez')
  };
  Game.data.nameAlias = {
    ARG: 'ESP', URU: 'ESP', PAR: 'ESP', COL: 'ESP', CHI: 'ESP', PER: 'ESP', VEN: 'ESP', POR: 'ESP',
    CAN: 'USA', JAM: 'USA', BAR: 'USA',
    NZL: 'AUS',
    FIN: 'GER', DEN: 'GER', SWE: 'GER', NOR: 'GER', AUT: 'GER', SUI: 'GER', POL: 'GER', CZE: 'GER', EST: 'GER',
    BEL: 'FRA', MON: 'FRA',
    THA: 'JPN', SGP: 'JPN', CHN: 'JPN', KOR: 'JPN', INA: 'JPN', MAS: 'JPN',
    IND: 'GBR', IRL: 'GBR', RSA: 'GBR',
    ITA: 'ITA', BUL: 'ITA', ISR: 'ITA', UAE: 'ESP'
  };
  Game.data.countries = [
    ['BRA', 'Brasil'], ['ARG', 'Argentina'], ['URU', 'Uruguai'], ['CHI', 'Chile'], ['COL', 'Colômbia'], ['MEX', 'México'],
    ['USA', 'Estados Unidos'], ['CAN', 'Canadá'], ['POR', 'Portugal'], ['ESP', 'Espanha'], ['ITA', 'Itália'], ['FRA', 'França'],
    ['GBR', 'Reino Unido'], ['GER', 'Alemanha'], ['NED', 'Países Baixos'], ['BEL', 'Bélgica'], ['SWE', 'Suécia'], ['FIN', 'Finlândia'],
    ['NOR', 'Noruega'], ['DEN', 'Dinamarca'], ['AUT', 'Áustria'], ['SUI', 'Suíça'], ['POL', 'Polônia'], ['IRL', 'Irlanda'],
    ['JPN', 'Japão'], ['CHN', 'China'], ['IND', 'Índia'], ['AUS', 'Austrália'], ['NZL', 'Nova Zelândia']
  ];
  Game.data.countryMix = {
    brazil: { BRA: 88, ARG: 4, URU: 3, PAR: 3, COL: 2 },
    world: { ITA: 13, ESP: 12, FRA: 12, GBR: 14, GER: 8, NED: 7, BRA: 10, USA: 7, JPN: 6, AUS: 5, MEX: 5, FIN: 3 }
  };
})();
