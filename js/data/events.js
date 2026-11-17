/* Eventos aleatórios. Cada escolha tem fx (efeitos) e, opcionalmente, risk:{p, fx, text}.
   fx: money, rep (reputação no paddock), pop (popularidade), family, mental, phys, train, injury, sponsor, flag. */
Game.data.events = [
  { id: 'acad_ad', title: 'Campanha publicitária da Academia', text: 'Sua academia de pilotos convocou você para gravar um comercial oficial ao lado dos titulares da F1.', minLv: 2, maxLv: 7, w: 3, cond: s => !!(s.player.academy && s.player.academy.active), choices: [
    { label: 'Participar da gravação e ações de mídia', fx: { pop: 6, money: 25000, acadRep: 7, mental: -1 } },
    { label: 'Focar apenas no simulador e recusar', fx: { acadRep: -12, train: .15 } }
  ] },
  { id: 'acad_tpc', title: 'Teste privado de F1 (TPC)', text: 'A academia liberou um carro de F1 de duas temporadas atrás para um dia de testes privados.', minLv: 3, maxLv: 7, w: 3, cond: s => !!(s.player.academy && s.player.academy.active), choices: [
    { label: 'Completar programa completo de voltas', fx: { train: .55, rep: 4, acadRep: 6, phys: -3 } }
  ] },
  { id: 'acad_sponsor', title: 'Evento com patrocinadores da marca', text: 'Os patrocinadores principais da sua academia pedem sua presença em um evento VIP.', minLv: 2, maxLv: 7, w: 2.5, cond: s => !!(s.player.academy && s.player.academy.active), choices: [
    { label: 'Representar a academia no evento', fx: { pop: 4, money: 20000, acadRep: 6 } },
    { label: 'Faltar ao compromisso', fx: { acadRep: -15, pop: -2 } }
  ] },
  { id: 'rival', title: 'Rival provoca na imprensa', text: 'Um adversário disse que você só está na frente por causa do carro.', minLv: 2, w: 3, choices: [
    { label: 'Rebater publicamente', fx: { pop: 4, rep: -2 } },
    { label: 'Ignorar e responder na pista', fx: { mental: 2, rep: 2 } },
    { label: 'Responder com humor', fx: { pop: 3 }, risk: { p: .3, fx: { pop: -3 }, text: 'A piada não caiu bem.' } }
  ] },
  { id: 'sponsor', title: 'Marca quer te patrocinar', text: 'Uma empresa acompanhou seus resultados e enviou uma proposta comercial.', minLv: 0, w: 3, choices: [
    { label: 'Ouvir a proposta', fx: { sponsor: 1 } },
    { label: 'Recusar', fx: {} }
  ] },
  { id: 'party', title: 'Festa de amigos', text: 'Seus amigos convidam você para uma festa na véspera do descanso.', minLv: 1, w: 3, party: true, choices: [
    { label: 'Ir à festa', fx: { mental: 6, pop: 2, phys: -2 }, risk: { p: .25, fx: { pop: -4, rep: -4, acadRep: -14 }, text: 'Fotos da festa vazaram e irritaram sua academia.' } },
    { label: 'Ficar em casa', fx: { mental: -1, phys: 2, rep: 1 } }
  ] },
  { id: 'gym', title: 'Pacote de treino intensivo', text: 'O preparador propõe um bloco de treino pesado (US$ 40 mil).', minLv: 2, w: 2, choices: [
    { label: 'Contratar o pacote', fx: { money: -40000, phys: 8, train: .35 } },
    { label: 'Não agora', fx: {} }
  ] },
  { id: 'viral', title: 'Vídeo seu viraliza', text: 'Uma ultrapassagem sua virou destaque nas redes.', minLv: 1, w: 2, choices: [
    { label: 'Aproveitar a onda', fx: { pop: 6, rep: 1 } }
  ] },
  { id: 'back', title: 'Dor nas costas', text: 'Você sentiu dor após o último treino.', minLv: 1, w: 2, choices: [
    { label: 'Descansar e tratar', fx: { phys: 6, money: -5000 } },
    { label: 'Ignorar e seguir', fx: {}, risk: { p: .3, fx: { injury: 1, phys: -8 }, text: 'A dor virou uma lesão leve.' } }
  ] },
  { id: 'family', title: 'Família pede tempo', text: 'Seus pais querem você em casa neste fim de semana.', minLv: 1, w: 2, choices: [
    { label: 'Passar o tempo em família', fx: { family: 10, mental: 4 } },
    { label: 'Ficar focado nas corridas', fx: { family: -8, train: .15, rep: 1 } }
  ] },
  { id: 'engineer', title: 'Teste de setup', text: 'O engenheiro propõe um programa de testes extra.', minLv: 3, w: 2, choices: [
    { label: 'Aceitar', fx: { train: .25, rep: 2, mental: -2 } },
    { label: 'Recusar', fx: { mental: 1 } }
  ] },
  { id: 'leak', title: 'Vazamento de negociação', text: 'A imprensa diz que você negocia com outra equipe.', minLv: 4, w: 2, choices: [
    { label: 'Negar', fx: { rep: 1, pop: -1 } },
    { label: 'Confirmar', fx: { pop: 3, rep: -3 } },
    { label: 'Não comentar', fx: {} }
  ] },
  { id: 'charity', title: 'Evento beneficente', text: 'Você foi convidado para um evento com crianças.', minLv: 2, w: 2, choices: [
    { label: 'Participar', fx: { pop: 5, rep: 1, money: -5000 } },
    { label: 'Declinar', fx: {} }
  ] },
  { id: 'sim', title: 'Mais horas de simulador', text: 'A engenharia sugere sessões extras no simulador.', minLv: 6, w: 2, choices: [
    { label: 'Aceitar', fx: { mental: -3, train: .35, rep: 2 } },
    { label: 'Pedir equilíbrio', fx: { mental: 1 } }
  ] },
  { id: 'scandal', title: 'Foto polêmica', text: 'Uma foto sua em uma situação ruim circula nas redes.', minLv: 3, w: 1.5, choices: [
    { label: 'Pedir desculpas', fx: { pop: -2, rep: -1 } },
    { label: 'Processar o site', fx: { money: -20000, pop: 1 } },
    { label: 'Ignorar', fx: { pop: -5, rep: -3, acadRep: -12 } }
  ] },
  { id: 'loan', title: 'Parente pede empréstimo', text: 'Um tio pede US$ 50 mil emprestados.', minLv: 2, w: 1.5, choices: [
    { label: 'Emprestar', fx: { money: -50000, family: 8 } },
    { label: 'Negar', fx: { family: -6 } }
  ] },
  { id: 'scout', title: 'Olheiro de academia', text: 'Um olheiro de uma academia de pilotos acompanhou sua corrida.', minLv: 2, maxLv: 6, w: 2, choices: [
    { label: 'Conversar com ele', fx: { flag: 'academy', rep: 3, pop: 2 } }
  ] },
  { id: 'orders', title: 'Ordem de pista', text: 'Surge uma disputa direta de posição com o companheiro na pista.', minLv: 6, w: 2, choices: [
    { label: 'Jogar para a equipe', fx: { rep: 3, pop: -2, acadRep: 5 } },
    { label: 'Disputar até o fim', fx: { pop: 4, rep: -2, acadRep: -10 } }
  ] },
  { id: 'prize', title: 'Prêmio revelação', text: 'Você foi eleito piloto revelação do campeonato.', minLv: 1, w: 1.5, choices: [
    { label: 'Receber o prêmio', fx: { money: 30000, pop: 4, rep: 3 } }
  ] },
  { id: 'invest', title: 'Amigo propõe um negócio', text: 'Um amigo quer sua participação em uma startup (US$ 50 mil).', minLv: 3, w: 1.5, choices: [
    { label: 'Investir', fx: { money: -50000 }, risk: { p: .5, fx: { money: 130000 }, text: 'O negócio deu certo e você recebeu o retorno.' } },
    { label: 'Recusar', fx: {} }
  ] },
  { id: 'burnout', title: 'Esgotamento', text: 'Você está exausto mentalmente.', minLv: 1, w: 0, cond: s => s.player.mental < 35, choices: [
    { label: 'Descansar duas semanas', fx: { mental: 15 } },
    { label: 'Continuar assim', fx: { mental: -5, phys: -3 } }
  ] },
  { id: 'fans', title: 'Encontro com fãs', text: 'Um grupo de fãs espera você no autódromo.', minLv: 2, w: 2, choices: [
    { label: 'Tirar fotos e autógrafos', fx: { pop: 4, mental: 1 } },
    { label: 'Pular o encontro', fx: { pop: -2 } }
  ] }
];

/* Entrevistas (3 tons). mediaVol amplifica efeitos do tom arrogante/polêmico. */
Game.data.interview = [
  { id: 'humilde', label: 'Humilde', fx: { pop: 2, rep: 2 }, text: 'Você elogiou o trabalho técnico e manteve o foco.' },
  { id: 'arrogante', label: 'Arrogante', fx: { pop: 5, rep: -2 }, risk: { p: .5, fx: { pop: -4, rep: -4, acadRep: -10 }, text: 'A fala soou arrogante e irritou o paddock e sua academia.' }, text: 'Você cravou que é o melhor da pista.' },
  { id: 'polemico', label: 'Polêmico', fx: { pop: 7, rep: -3 }, text: 'Você criticou a organização e rendeu manchetes.' }
];
