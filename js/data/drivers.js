/* Pilotos reais. Formato: [nome, país, nascimento, categoria em 2026, equipe em 2026, EXP, RAC, ATE, RIT]. */
Game.data.realDrivers = [
  // F1 2026
  ['Max Verstappen', 'NED', 1997, 'f1', 'rb', 89, 96, 84, 97], ['Isack Hadjar', 'FRA', 2004, 'f1', 'rb', 72, 81, 82, 87],
  ['Charles Leclerc', 'MON', 1997, 'f1', 'fer', 84, 92, 91, 93], ['Lewis Hamilton', 'GBR', 1985, 'f1', 'fer', 98, 93, 91, 90],
  ['George Russell', 'GBR', 1998, 'f1', 'mer', 84, 94, 93, 92], ['Kimi Antonelli', 'ITA', 2006, 'f1', 'mer', 71, 83, 77, 93],
  ['Lando Norris', 'GBR', 1999, 'f1', 'mcl', 84, 93, 86, 94], ['Oscar Piastri', 'AUS', 2001, 'f1', 'mcl', 79, 95, 85, 91],
  ['Fernando Alonso', 'ESP', 1981, 'f1', 'ast', 99, 87, 85, 90], ['Lance Stroll', 'CAN', 1998, 'f1', 'ast', 84, 77, 73, 76],
  ['Pierre Gasly', 'FRA', 1996, 'f1', 'alp', 83, 84, 78, 86], ['Franco Colapinto', 'ARG', 2003, 'f1', 'alp', 70, 73, 74, 76],
  ['Alexander Albon', 'THA', 1996, 'f1', 'wil', 84, 86, 76, 83], ['Carlos Sainz', 'ESP', 1994, 'f1', 'wil', 88, 87, 81, 85],
  ['Nico Hülkenberg', 'GER', 1987, 'f1', 'aud', 88, 83, 85, 85], ['Gabriel Bortoleto', 'BRA', 2004, 'f1', 'aud', 70, 82, 77, 83],
  ['Esteban Ocon', 'FRA', 1996, 'f1', 'haa', 83, 83, 84, 84], ['Oliver Bearman', 'GBR', 2005, 'f1', 'haa', 73, 88, 71, 84],
  ['Liam Lawson', 'NZL', 2002, 'f1', 'rbs', 74, 81, 74, 81], ['Arvid Lindblad', 'GBR', 2007, 'f1', 'rbs', 54, 74, 68, 80],
  ['Sergio Pérez', 'MEX', 1990, 'f1', 'cad', 92, 83, 81, 85], ['Valtteri Bottas', 'FIN', 1989, 'f1', 'cad', 89, 76, 93, 83],

  // Pilotos reais da F1 (2018–2025)
  ['Sebastian Vettel', 'GER', 1987, 'f1', null, 94, 91, 90, 91], ['Kimi Räikkönen', 'FIN', 1979, 'f1', null, 96, 88, 86, 87],
  ['Daniel Ricciardo', 'AUS', 1989, 'f1', null, 90, 88, 82, 85], ['Romain Grosjean', 'FRA', 1986, 'f1', null, 85, 79, 68, 82],
  ['Kevin Magnussen', 'DEN', 1992, 'f1', null, 84, 83, 74, 81], ['Daniil Kvyat', 'RUS', 1994, 'f1', null, 78, 78, 70, 80],
  ['Antonio Giovinazzi', 'ITA', 1993, 'f1', null, 75, 74, 76, 77], ['Robert Kubica', 'POL', 1984, 'f1', null, 86, 76, 80, 74],
  ['Sergey Sirotkin', 'RUS', 1995, 'f1', null, 66, 70, 72, 73], ['Stoffel Vandoorne', 'BEL', 1992, 'f1', null, 74, 75, 78, 77],
  ['Brendon Hartley', 'NZL', 1989, 'f1', null, 74, 72, 75, 74], ['Marcus Ericsson', 'SWE', 1990, 'f1', null, 75, 72, 74, 74],
  ['Nicholas Latifi', 'CAN', 1995, 'f1', null, 68, 66, 65, 69], ['Nikita Mazepin', 'RUS', 1999, 'f1', null, 60, 62, 54, 65],
  ['Mick Schumacher', 'GER', 1999, 'f1', null, 70, 74, 68, 75], ['Zhou Guanyu', 'CHN', 1999, 'f1', null, 74, 74, 79, 76],
  ['Logan Sargeant', 'USA', 2000, 'f1', null, 64, 67, 63, 70], ['Nyck de Vries', 'NED', 1995, 'f1', null, 73, 73, 74, 75],
  ['Yuki Tsunoda', 'JPN', 2000, 'f1', 'rbs', 79, 82, 74, 83], ['Jack Doohan', 'AUS', 2003, 'f1', 'alp', 66, 74, 72, 76],

  // F2 (2024–2026)
  ['Rafael Câmara', 'BRA', 2005, 'f2', 'inv2', 62, 81, 74, 85], ['Nikola Tsolov', 'BUL', 2007, 'f2', 'cam2', 58, 80, 70, 84],
  ['Alex Dunne', 'IRL', 2006, 'f2', 'rod2', 60, 79, 72, 83], ['Gabriele Minì', 'ITA', 2005, 'f2', 'pre2', 64, 80, 76, 82],
  ['Martinius Stenshorne', 'NOR', 2006, 'f2', 'rod2', 58, 77, 72, 80], ['Dino Beganovic', 'SWE', 2004, 'f2', 'hit2', 66, 79, 76, 81],
  ['Victor Martins', 'FRA', 2001, 'f2', 'art2', 70, 81, 74, 84], ['Théo Pourchaire', 'FRA', 2003, 'f2', 'art2', 70, 82, 78, 83],
  ['Felipe Drugovich', 'BRA', 2000, 'f2', 'mp2', 72, 82, 82, 83], ['Frederik Vesti', 'DEN', 2002, 'f2', 'pre2', 68, 79, 80, 81],
  ['Ayumu Iwasa', 'JPN', 2001, 'f2', 'dam2', 68, 81, 76, 81], ['Dennis Hauger', 'NOR', 2003, 'f2', 'mp2', 68, 78, 75, 79],
  ['Zane Maloney', 'BAR', 2003, 'f2', 'rod2', 66, 80, 74, 81], ['Jak Crawford', 'USA', 2005, 'f2', 'dam2', 66, 79, 75, 80],
  ['Paul Aron', 'EST', 2004, 'f2', 'hit2', 66, 80, 78, 82], ['Kush Maini', 'IND', 2000, 'f2', 'inv2', 67, 77, 74, 79],
  ['Richard Verschoor', 'NED', 2000, 'f2', 'mp2', 72, 79, 78, 79], ['Enzo Fittipaldi', 'BRA', 2001, 'f2', 'var2', 68, 79, 75, 79],
  ['Juan Manuel Correa', 'USA', 1999, 'f2', 'dam2', 68, 74, 75, 75], ['Roman Staněk', 'CZE', 2004, 'f2', 'tri2', 64, 75, 74, 77],
  ['Joshua Dürksen', 'PAR', 2003, 'f2', 'aix2', 63, 78, 74, 79], ['Taylor Barnard', 'GBR', 2004, 'f2', 'aix2', 62, 78, 75, 80],
  ['Luke Browning', 'GBR', 2002, 'f2', 'hit2', 65, 80, 76, 81], ['Leonardo Fornaroli', 'ITA', 2004, 'f2', 'inv2', 64, 79, 81, 81],
  ['Pepe Martí', 'ESP', 2005, 'f2', 'cam2', 63, 79, 72, 80], ['Ritomo Miyata', 'JPN', 1999, 'f2', 'art2', 70, 77, 78, 78],
  ['Sebastián Montoya', 'COL', 2005, 'f2', 'pre2', 61, 77, 71, 78], ['Amaury Cordeel', 'BEL', 2002, 'f2', 'hit2', 64, 72, 68, 74],

  // F3
  ['Ugo Ugochukwu', 'USA', 2007, 'f3', 'pre3', 54, 77, 71, 81], ['Freddie Slater', 'GBR', 2006, 'f3', 'tri3', 56, 79, 74, 82],
  ['Brando Badoer', 'ITA', 2006, 'f3', 'pre3', 54, 75, 71, 78], ['Noah Strømsted', 'DEN', 2006, 'f3', 'tri3', 52, 75, 72, 78],
  ['Théophile Naël', 'FRA', 2006, 'f3', 'var3', 52, 74, 70, 77], ['Tuukka Taponen', 'FIN', 2006, 'f3', 'art3', 55, 78, 75, 80],
  ['James Wharton', 'AUS', 2006, 'f3', 'art3', 54, 75, 72, 78], ['Tim Tramnitz', 'GER', 2004, 'f3', 'mp3', 58, 77, 75, 79],
  ['Oliver Goethe', 'GER', 2004, 'f3', 'cam3', 58, 76, 74, 78], ['Mari Boya', 'ESP', 2004, 'f3', 'cam3', 58, 76, 72, 78],
  ['Christian Mansell', 'AUS', 2005, 'f3', 'art3', 58, 77, 74, 78], ['Noel León', 'MEX', 2004, 'f3', 'pre3', 57, 76, 74, 78],
  ['Callum Voisin', 'GBR', 2006, 'f3', 'rod3', 55, 75, 73, 77], ['Charlie Wurz', 'AUT', 2005, 'f3', 'tri3', 54, 73, 71, 76],
  ['Laurens van Hoepen', 'NED', 2005, 'f3', 'art3', 55, 75, 73, 77], ['Santiago Ramos', 'MEX', 2004, 'f3', 'tri3', 55, 74, 71, 76],
  ['Matías Zagazeta', 'PER', 2003, 'f3', 'dam3', 55, 73, 71, 75], ['Nikita Bedrin', 'ITA', 2006, 'f3', 'aix3', 54, 74, 71, 76],
  ['Tasanapol Inthraphuvasak', 'THA', 2005, 'f3', 'cam3', 53, 72, 70, 75], ['Kacper Sztuka', 'POL', 2006, 'f3', 'mp3', 53, 74, 71, 76],

  // FRECA & F4 Europeia
  ['Matteo De Palo', 'ITA', 2007, 'frec', 'pre4', 48, 73, 70, 76], ['Enzo Deligny', 'FRA', 2008, 'frec', 'rac4', 47, 74, 69, 77],
  ['Pedro Clerot', 'BRA', 2007, 'frec', 'var4', 50, 74, 72, 76], ['Evan Giltaire', 'FRA', 2006, 'frec', 'art4', 50, 74, 71, 76],
  ['Zachary David', 'MLT', 2007, 'frec', 'rac4', 48, 72, 70, 75], ['Valerio Rinicella', 'ITA', 2007, 'frec', 'mp4', 48, 72, 70, 75],
  ['Alessandro Giusti', 'FRA', 2006, 'frec', 'art4', 51, 75, 73, 77], ['Kean Nakamura-Berta', 'JPN', 2007, 'f4eu', 'pre5', 45, 73, 70, 76],
  ['Rashid Al Dhaheri', 'UAE', 2008, 'f4eu', 'pre5', 44, 72, 69, 75], ['Alex Powell', 'JAM', 2007, 'f4eu', 'pre5', 45, 72, 68, 75],
  ['Dion Gowda', 'IND', 2007, 'f4eu', 'pre5', 45, 71, 69, 74], ['Akshay Bohra', 'USA', 2007, 'f4eu', 'usr5', 45, 72, 70, 75],
  ['Jack Beeton', 'AUS', 2007, 'f4eu', 'usr5', 45, 72, 70, 74], ['Gianmarco Pradel', 'AUS', 2006, 'f4eu', 'usr5', 46, 71, 70, 74],
  ['Hiyu Yamakoshi', 'JPN', 2006, 'f4eu', 'var5', 46, 73, 70, 75], ['Emanuele Olivieri', 'ITA', 2008, 'f4eu', 'rac5', 44, 71, 69, 74],

  // F4 Brasil & Karting
  ['Heitor Dall\'Agnol', 'BRA', 2009, 'f4br', 'tmg', 40, 68, 65, 72], ['Fausto Arnaudo', 'ARG', 2009, 'f4br', 'cav', 40, 67, 64, 71],
  ['Álvaro Cho', 'BRA', 2007, 'f4br', 'tmg', 44, 70, 68, 73], ['Matheus Comparatto', 'BRA', 2007, 'f4br', 'cav', 44, 71, 69, 74],
  ['Ethan Nobels', 'BRA', 2008, 'f4br', 'cav', 42, 69, 67, 72], ['Rafaela Ferreira', 'BRA', 2005, 'f4br', 'tmg', 46, 68, 69, 71],
  ['Aurelia Nobels', 'BRA', 2007, 'f4br', 'b1', 44, 67, 67, 70], ['Gino Trappa', 'ARG', 2008, 'f4br', 'b2', 41, 67, 65, 71],
  ['Filippo Fiorentino', 'BRA', 2009, 'f4br', 'b3', 40, 66, 64, 70], ['Ciro Sobral', 'BRA', 2009, 'f4br', 'b4', 40, 66, 64, 70],
  ['Miguel Costa', 'BRA', 2009, 'kartMun', 'kmA', 38, 69, 66, 73], ['Gabriel Gomez', 'BRA', 2006, 'kartMun', 'kmB', 46, 73, 70, 76],
  ['Dries Van Langendonck', 'BEL', 2010, 'kartMun', 'kmA', 36, 68, 65, 73], ['Christian Costoya', 'ESP', 2010, 'kartMun', 'kmC', 36, 67, 65, 72]
];
