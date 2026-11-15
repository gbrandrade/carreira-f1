/* Pilotos reais. Formato: [nome, país, nascimento, categoria em 2026, equipe em 2026, EXP, RAC, ATE, RIT].
   As notas de F1 vêm da tabela de 2026. Notas de F2/F3/F4 e anos de nascimento dos juniores são ESTIMATIVAS (revisar).
   Como o jogo começa em outro ano, o sistema 'world' envelhece/rejuvenesce esses pilotos pela idade (ver attributes.js). */
Game.data.realDrivers = [
  // F1 2026
  ['Max Verstappen', 'NED', 1997, 'f1', 'rb', 88, 96, 82, 97], ['Isack Hadjar', 'FRA', 2004, 'f1', 'rb', 72, 81, 82, 87],
  ['Charles Leclerc', 'MON', 1997, 'f1', 'fer', 83, 92, 91, 93], ['Lewis Hamilton', 'GBR', 1985, 'f1', 'fer', 98, 93, 91, 90],
  ['George Russell', 'GBR', 1998, 'f1', 'mer', 83, 94, 93, 92], ['Kimi Antonelli', 'ITA', 2006, 'f1', 'mer', 71, 83, 77, 93],
  ['Lando Norris', 'GBR', 1999, 'f1', 'mcl', 83, 93, 85, 94], ['Oscar Piastri', 'AUS', 2001, 'f1', 'mcl', 78, 95, 84, 91],
  ['Fernando Alonso', 'ESP', 1981, 'f1', 'ast', 99, 87, 85, 90], ['Lance Stroll', 'CAN', 1998, 'f1', 'ast', 84, 77, 73, 76],
  ['Pierre Gasly', 'FRA', 1996, 'f1', 'alp', 83, 84, 78, 86], ['Franco Colapinto', 'ARG', 2003, 'f1', 'alp', 70, 71, 74, 73],
  ['Alexander Albon', 'THA', 1996, 'f1', 'wil', 84, 86, 76, 83], ['Carlos Sainz', 'ESP', 1994, 'f1', 'wil', 88, 87, 80, 85],
  ['Nico Hülkenberg', 'GER', 1987, 'f1', 'aud', 88, 83, 85, 85], ['Gabriel Bortoleto', 'BRA', 2004, 'f1', 'aud', 70, 82, 77, 82],
  ['Esteban Ocon', 'FRA', 1996, 'f1', 'haa', 83, 83, 84, 84], ['Oliver Bearman', 'GBR', 2005, 'f1', 'haa', 73, 88, 70, 84],
  ['Liam Lawson', 'NZL', 2002, 'f1', 'rbs', 74, 81, 74, 81], ['Arvid Lindblad', 'GBR', 2007, 'f1', 'rbs', 50, 72, 66, 78],
  ['Sergio Pérez', 'MEX', 1990, 'f1', 'cad', 92, 83, 81, 85], ['Valtteri Bottas', 'FIN', 1989, 'f1', 'cad', 89, 76, 93, 83],
  // F2 2026 (estimativas)
  ['Rafael Câmara', 'BRA', 2005, 'f2', 'inv2', 62, 80, 72, 84], ['Nikola Tsolov', 'BUL', 2007, 'f2', 'cam2', 58, 80, 70, 84],
  ['Alex Dunne', 'IRL', 2006, 'f2', 'rod2', 60, 78, 72, 82], ['Gabriele Mini', 'ITA', 2005, 'f2', 'mp2', 62, 78, 74, 80],
  ['Martinius Stenshorne', 'NOR', 2006, 'f2', 'rod2', 58, 77, 72, 80], ['Dino Beganovic', 'SWE', 2004, 'f2', 'pre2', 66, 78, 76, 80],
  // F3 2026 (estimativas)
  ['Ugo Ugochukwu', 'USA', 2007, 'f3', 'pre3', 52, 76, 70, 80], ['Freddie Slater', 'GBR', 2006, 'f3', 'tri3', 56, 77, 72, 79],
  ['Brando Badoer', 'ITA', 2006, 'f3', 'pre3', 52, 74, 70, 77], ['Noah Strømsted', 'DEN', 2006, 'f3', 'cam3', 50, 73, 70, 76],
  ['Théophile Naël', 'FRA', 2006, 'f3', 'cam3', 50, 72, 69, 76],
  // F4 Brasil 2026 (estimativas)
  ['Heitor Dall\'Agnol', 'BRA', 2009, 'f4br', 'tmg', 40, 68, 64, 72], ['Fausto Arnaudo', 'ARG', 2009, 'f4br', 'cav', 40, 67, 64, 71]
];
