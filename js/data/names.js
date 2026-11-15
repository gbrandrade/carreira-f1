/* Nomes para pilotos gerados e lista de países (código de 3 letras). */
(function () {
  const n = (f, l) => ({ f: f.split(' '), l: l.split(' ') });
  Game.data.names = {
    BRA: n('Gabriel Lucas Pedro Matheus Rafael João Enzo Miguel Davi Caio Bruno Felipe', 'Silva Souza Oliveira Santos Pereira Costa Almeida Ribeiro Carvalho Rocha Martins Barbosa'),
    ESP: n('Pablo Hugo Álvaro Daniel Mateo Adrián Iker Sergio', 'García Fernández López Martínez Sánchez Romero Navarro Torres'),
    ITA: n('Luca Marco Matteo Andrea Leonardo Federico Alessio Giacomo', 'Rossi Bianchi Romano Colombo Ricci Greco Conti Marino'),
    FRA: n('Louis Hugo Jules Théo Nathan Maxime Lucas Antoine', 'Martin Bernard Dubois Moreau Laurent Lefebvre Roux Fournier'),
    GBR: n('Oliver Harry Jack Charlie Freddie Alfie Thomas Archie', 'Smith Taylor Wilson Brown Evans Walker Hughes Clarke'),
    GER: n('Leon Finn Paul Jonas Noah Felix Ben Luca', 'Müller Schmidt Weber Fischer Wagner Becker Hoffmann Koch'),
    NED: n('Daan Sem Luuk Bram Milan Thijs Jesse Lars', 'de Vries Jansen van Dijk Bakker Visser Smit Meijer Mulder'),
    USA: n('Mason Ethan Logan Caleb Tyler Jackson Owen Wyatt', 'Johnson Miller Davis Anderson Thomas Moore Carter Hayes'),
    JPN: n('Haruto Ren Sora Yuto Kaito Riku Takumi Daiki', 'Sato Suzuki Takahashi Tanaka Watanabe Ito Yamamoto Nakamura'),
    AUS: n('Jack Lachlan Noah Cooper Hudson Riley Blake Mitchell', 'Wright Harris Campbell Stewart Ryan Murray Fraser Webb'),
    MEX: n('Santiago Mateo Diego Emiliano Leonardo Sebastián Ángel Iván', 'Hernández Ramírez Cruz Morales Ortega Castillo Vargas Ruiz')
  };
  Game.data.nameAlias = { ARG: 'ESP', URU: 'ESP', PAR: 'ESP', COL: 'ESP', CHI: 'ESP', POR: 'ESP', CAN: 'USA', NZL: 'AUS', FIN: 'GER', DEN: 'GER', SWE: 'GER', AUT: 'GER', BEL: 'FRA', MON: 'FRA', THA: 'JPN', SGP: 'JPN' };
  Game.data.countries = [['BRA', 'Brasil'], ['ARG', 'Argentina'], ['URU', 'Uruguai'], ['CHI', 'Chile'], ['COL', 'Colômbia'], ['MEX', 'México'], ['USA', 'Estados Unidos'], ['CAN', 'Canadá'], ['POR', 'Portugal'], ['ESP', 'Espanha'],
    ['ITA', 'Itália'], ['FRA', 'França'], ['GBR', 'Reino Unido'], ['GER', 'Alemanha'], ['NED', 'Países Baixos'], ['BEL', 'Bélgica'], ['SWE', 'Suécia'], ['FIN', 'Finlândia'], ['JPN', 'Japão'], ['AUS', 'Austrália']];
  // mistura de nacionalidades dos pilotos gerados: categorias de base brasileiras x internacionais
  Game.data.countryMix = {
    brazil: { BRA: 88, ARG: 4, URU: 3, PAR: 3, COL: 2 },
    world: { ITA: 13, ESP: 12, FRA: 12, GBR: 14, GER: 8, NED: 7, BRA: 10, USA: 7, JPN: 6, AUS: 5, MEX: 5, FIN: 3 }
  };
})();
