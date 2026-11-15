/* Traços de personalidade. Os multiplicadores são lidos em pressure.js e race.js. */
Game.data.traits = [
  { id: 'frio', name: 'Frio sob pressão', desc: 'Perde menos nas barras de pressão', mod: { pressureLoss: .65 } },
  { id: 'explosivo', name: 'Explosivo', desc: 'Entrevistas polêmicas rendem mais e custam mais', mod: { mediaVol: 1.5, pressureLoss: 1.15 } },
  { id: 'midia', name: 'Queridinho da mídia', desc: 'Ganha mais com a mídia e os fãs', mod: { mediaGain: 1.4 } },
  { id: 'azarado', name: 'Azarado', desc: 'Mais chance de abandonos', mod: { dnf: 1.25 } },
  { id: 'sortudo', name: 'Sortudo', desc: 'Menos chance de abandonos', mod: { dnf: .8 } },
  { id: 'workaholic', name: 'Workaholic', desc: 'Evolui mais com treino, mas cansa a mente', mod: { train: 1.3, mentalDrain: 1.2 } },
  { id: 'festeiro', name: 'Festeiro', desc: 'Mais eventos sociais; recupera a mente mais rápido', mod: { mentalGain: 1.3, partyW: 2 } },
  { id: 'cerebral', name: 'Cerebral', desc: 'Aproveita melhor o desenvolvimento do carro', mod: { dev: 1.4 } },
  { id: 'agressivo', name: 'Agressivo', desc: 'Mais ultrapassagens e mais incidentes', mod: { race: .4, dnf: 1.1 } },
  { id: 'carismatico', name: 'Carismático', desc: 'Patrocinadores pagam mais', mod: { sponsor: 1.2 } },
  { id: 'perfeccionista', name: 'Perfeccionista', desc: 'Menos erros, mais cobrança pessoal', mod: { dnf: .9, mentalDrain: 1.15 } },
  { id: 'introvertido', name: 'Introvertido', desc: 'Menos ganho na mídia, mais estabilidade', mod: { mediaGain: .8, pressureLoss: .85 } }
];
