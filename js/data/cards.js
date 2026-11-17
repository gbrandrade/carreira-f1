/*
 * Cartas da roleta de criação.
 * Formato das lendas:
 * [nome, país, nível, EXP, RAC, ATE, RIT]
 *
 * Notas históricas são ESTIMATIVAS.
 */

(function () {
    const W = Game.config.weights;

    // Calcula a nota geral
    const ger = (e, r, a, t) =>
        Math.round(
            W.EXP * e +
            W.RAC * r +
            W.ATE * a +
            W.RIT * t
        );

    // Define a categoria pela nota geral
    const tierOf = g => {
        if (g < 77) return 'ruim';
        if (g < 85) return 'mediano';
        if (g < 91) return 'bom';
        return 'lendario';
    };

    const cards = [];

    // ==========================================
    // PILOTOS ATUAIS DE F1
    // ==========================================

    Game.data.realDrivers
        .filter(d => d[3] === 'f1')
        .forEach(d => {
            const g = ger(d[5], d[6], d[7], d[8]);

            cards.push({
                name: d[0],
                country: d[1],
                tier: tierOf(g),
                EXP: d[5],
                RAC: d[6],
                ATE: d[7],
                RIT: d[8],
                GER: g
            });
        });

    // ==========================================
    // PILOTOS EXTRAS
    // ==========================================

    const extra = [

    // ==========================================
    // RUIM
    // ==========================================

    ['Nikita Mazepin', 'RUS', 'ruim', 50, 58, 48, 64],
    ['Nicholas Latifi', 'CAN', 'ruim', 58, 62, 60, 66],
    ['Pastor Maldonado', 'VEN', 'ruim', 60, 64, 48, 72],
    ['Jolyon Palmer', 'GBR', 'ruim', 52, 60, 58, 64],
    ['Rio Haryanto', 'INA', 'ruim', 40, 50, 50, 58],
    ['Max Chilton', 'GBR', 'ruim', 48, 55, 60, 58],
    ['Logan Sargeant', 'USA', 'ruim', 48, 58, 56, 64],
    ['Marcus Ericsson', 'SWE', 'ruim', 62, 66, 64, 68],

    // ==========================================
    // MEDIANO
    // ==========================================

    ['Kevin Magnussen', 'DEN', 'mediano', 78, 80, 72, 82],
    ['Romain Grosjean', 'FRA', 'mediano', 72, 78, 66, 84],
    ['Rubens Barrichello', 'BRA', 'mediano', 96, 82, 86, 82],
    ['Heikki Kovalainen', 'FIN', 'mediano', 70, 76, 72, 80],
    ['Jean-Éric Vergne', 'FRA', 'mediano', 66, 74, 70, 78],
    ['Daniil Kvyat', 'RUS', 'mediano', 66, 74, 64, 80],
    ['Esteban Gutiérrez', 'MEX', 'mediano', 64, 68, 68, 72],
    ['Adrian Sutil', 'GER', 'mediano', 70, 74, 70, 76],
    ['Vitantonio Liuzzi', 'ITA', 'mediano', 68, 72, 68, 74],
    ['Sébastien Buemi', 'SUI', 'mediano', 72, 74, 72, 78],
    ['Paul di Resta', 'GBR', 'mediano', 72, 76, 74, 78],
    ['Bruno Senna', 'BRA', 'mediano', 68, 74, 70, 76],
    ['Nelson Piquet Jr.', 'BRA', 'mediano', 64, 70, 66, 72],
    ['Alexander Rossi', 'USA', 'mediano', 68, 72, 70, 74],
    ['Pascal Wehrlein', 'GER', 'mediano', 76, 78, 76, 82],
    ['Stoffel Vandoorne', 'BEL', 'mediano', 74, 76, 74, 78],
    ['Antonio Giovinazzi', 'ITA', 'mediano', 70, 74, 72, 76],
    ['Sergey Sirotkin', 'RUS', 'mediano', 66, 70, 68, 74],

    // ==========================================
    // BOM
    // ==========================================

    ['Felipe Massa', 'BRA', 'bom', 88, 84, 80, 88],
    ['Jenson Button', 'GBR', 'bom', 88, 86, 88, 86],
    ['Nico Rosberg', 'GER', 'bom', 84, 86, 84, 90],
    ['Mark Webber', 'AUS', 'bom', 86, 84, 86, 86],
    ['David Coulthard', 'GBR', 'bom', 92, 84, 82, 85],
    ['Juan Pablo Montoya', 'COL', 'bom', 74, 88, 70, 92],
    ['Kimi Räikkönen', 'FIN', 'bom', 94, 90, 84, 92],
    ['Damon Hill', 'GBR', 'bom', 86, 86, 84, 86],
    ['Nigel Mansell', 'GBR', 'bom', 88, 92, 80, 92],

    // ==========================================
    // LENDÁRIO
    // ==========================================

    ['Sebastian Vettel', 'GER', 'lendario', 92, 92, 92, 94],
    ['Nelson Piquet', 'BRA', 'lendario', 88, 90, 86, 92],
    ['Emerson Fittipaldi', 'BRA', 'lendario', 88, 90, 88, 90],
    ['Alain Prost', 'FRA', 'lendario', 92, 94, 96, 90],
    ['Niki Lauda', 'AUT', 'lendario', 90, 90, 94, 92],
    ['Jim Clark', 'GBR', 'lendario', 82, 94, 86, 98],
    ['Juan Manuel Fangio', 'ARG', 'lendario', 84, 96, 86, 96],
    ['Mika Häkkinen', 'FIN', 'lendario', 86, 92, 88, 94],
    ['Jackie Stewart', 'GBR', 'lendario', 92, 94, 92, 94],
    ['Gilles Villeneuve', 'CAN', 'lendario', 86, 96, 84, 98],
    ['Stirling Moss', 'GBR', 'lendario', 90, 96, 90, 96],
    ['Jack Brabham', 'AUS', 'lendario', 88, 92, 90, 90],
    ['Graham Hill', 'GBR', 'lendario', 90, 88, 92, 90],
    ['Jacky Ickx', 'BEL', 'lendario', 88, 94, 90, 94],
    ['Carlos Reutemann', 'ARG', 'lendario', 88, 92, 90, 92],
    ['Ronnie Peterson', 'SWE', 'lendario', 82, 96, 84, 98],
    ['Jody Scheckter', 'RSA', 'lendario', 88, 90, 88, 90],
    ['Mario Andretti', 'USA', 'lendario', 92, 94, 90, 94],
    ['John Surtees', 'GBR', 'lendario', 88, 92, 92, 90],
    ['James Hunt', 'GBR', 'lendario', 86, 94, 86, 94],
    ['Gerhard Berger', 'AUT', 'lendario', 86, 90, 88, 92],
    ['Riccardo Patrese', 'ITA', 'lendario', 86, 88, 90, 90],

    // ==========================================
    // PRIME
    // ==========================================

    ['Ayrton Senna (prime)', 'BRA', 'prime', 90, 96, 92, 99],
    ['Michael Schumacher (prime)', 'GER', 'prime', 96, 98, 97, 98],
    ['Lewis Hamilton (prime)', 'GBR', 'prime', 92, 98, 95, 98],
    ['Max Verstappen (prime)', 'NED', 'prime', 99, 99, 99, 99],
    ['Fernando Alonso (prime)', 'ESP', 'prime', 94, 97, 95, 96],
    ['Sebastian Vettel (prime)', 'GER', 'prime', 88, 92, 98, 97],
    ['Alain Prost (prime)', 'FRA', 'prime', 96, 97, 98, 94],
    ['Niki Lauda (prime)', 'AUT', 'prime', 94, 95, 98, 95],
    ['Jim Clark (prime)', 'GBR', 'prime', 92, 98, 94, 99],
    ['Jackie Stewart (prime)', 'GBR', 'prime', 96, 97, 96, 96],
    ['Gilles Villeneuve (prime)', 'CAN', 'prime', 88, 99, 88, 100],
    ['Kimi Räikkönen (prime)', 'FIN', 'prime', 94, 97, 90, 98],
    ['Nigel Mansell (prime)', 'GBR', 'prime', 92, 98, 88, 97],
    ['Mika Häkkinen (prime)', 'FIN', 'prime', 92, 97, 94, 98],
    ['Jenson Button (prime)', 'GBR', 'prime', 94, 94, 98, 95],
    ['Nico Rosberg (prime)', 'GER', 'prime', 92, 96, 94, 97],
    ['Juan Pablo Montoya (prime)', 'COL', 'prime', 84, 98, 86, 99]
];

    // ==========================================
    // ADICIONA OS PILOTOS EXTRAS ÀS CARTAS
    // ==========================================

    extra.forEach(d => {
        cards.push({
            name: d[0],
            country: d[1],
            tier: d[2],
            EXP: d[3],
            RAC: d[4],
            ATE: d[5],
            RIT: d[6],
            GER: ger(d[3], d[4], d[5], d[6])
        });
    });

    // ==========================================
    // SALVA OS DADOS NO JOGO
    // ==========================================

    Game.data.cards = cards;

    Game.data.tierLabels = {
        ruim: 'Ruim',
        mediano: 'Mediano',
        bom: 'Bom',
        lendario: 'Lendário',
        prime: 'Prime'
    };

})();
