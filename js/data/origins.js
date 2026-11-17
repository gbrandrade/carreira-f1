/* Origem familiar e catálogo de Agentes especializados. */
Game.data.origins = [
  { id: 'humilde', name: 'Família humilde', money: 5000, support: 25000, family: 70, desc: 'Kart emprestado, muitas portas fechadas. Você depende de talento e patrocínio.' },
  { id: 'media', name: 'Classe média', money: 60000, support: 120000, family: 65, desc: 'A família banca o kart e as primeiras categorias com sacrifício.' },
  { id: 'rica', name: 'Família rica', money: 600000, support: 700000, family: 55, desc: 'Dinheiro abre portas, mas a cobrança por resultado é maior.' }
];

/* Agentes de pilotos: cada um cobra uma comissão diferente e traz bônus específicos de carreira. */
Game.data.agents = [
  {
    id: 'andrade',
    name: 'Lucas Andrade',
    role: 'Caça-talentos da Base',
    cut: 0.06,
    minLv: 0,
    perk: '+20% aceite em equipes da base/academias e -8% custo de assento',
    desc: 'Conhece todos os chefes de equipe do kart à F3. Cobra pouco e facilita vagas e academias.',
    mod: { juniorOffer: 0.14, seatDiscount: 0.08, academyBonus: 0.15 }
  },
  {
    id: 'vance',
    name: 'Elena Vance',
    role: 'Especialista Comercial & Mídia',
    cut: 0.10,
    minLv: 3,
    perk: '+30% valor dos patrocínios, +25% Popularidade e +15% aceite de marcas',
    desc: 'Transforma pilotos em marcas globais. Ideal para financiar campanhas caras com patrocinadores.',
    mod: { sponsorPay: 1.30, sponsorChance: 0.15, mediaGain: 1.25 }
  },
  {
    id: 'bellini',
    name: 'Marco Bellini',
    role: 'Negociador Implacável',
    cut: 0.14,
    minLv: 5,
    perk: '+25% margem de negociação salarial e +15% bônus/salários na F1',
    desc: 'Temido pelos diretores financeiros do paddock. Arranca contratos pesados, mas cobra 14%.',
    mod: { contractTol: 0.15, salaryBoost: 1.15 }
  },
  {
    id: 'moreau',
    name: 'Claire Moreau',
    role: 'Estrategista de Paddock',
    cut: 0.11,
    minLv: 5,
    perk: '+35% ganho de Reputação no Paddock e +25% evolução do carro',
    desc: ' trânsito livre nos bastidores das equipes de fábrica. Acelera sua reputação e suporte técnico.',
    mod: { repGain: 1.35, dev: 1.25, prestigeHelp: 6 }
  },
  {
    id: 'lindqvist',
    name: 'Viktor Lindqvist',
    role: 'Gestor de Alta Performance',
    cut: 0.12,
    minLv: 6,
    perk: '+30% evolução de treino e -25% desgaste físico e mental',
    desc: 'Ex-engenheiro de corrida que cuida da preparação integral do piloto para disputar títulos.',
    mod: { train: 1.30, drainMult: 0.75, contractTol: 0.06 }
  }
];
