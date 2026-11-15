/* Eventos aleatórios. Cada escolha tem fx (efeitos) e, opcionalmente, risk:{p, fx, text} (resultado ruim/bom com chance p).
   fx: money, team, media, fans, family, mental, phys, pop, train, injury, sponsor(tier), flag.
   minLv/maxLv = nível da categoria (0 kart ... 8 F1). w = peso de sorteio. */
Game.data.events = [
  { id: 'rival', title: 'Rival provoca na imprensa', text: 'Um adversário disse que você só está na frente por causa do carro.', minLv: 2, w: 3, choices: [
    { label: 'Rebater publicamente', fx: { media: 4, fans: 3, team: -2 } }, { label: 'Ignorar', fx: { mental: 2 } }, { label: 'Responder com humor', fx: { media: 2, fans: 2 }, risk: { p: .3, fx: { media: -3 }, text: 'A piada não caiu bem.' } }] },
  { id: 'sponsor', title: 'Marca quer te patrocinar', text: 'Uma empresa viu seus resultados e propôs uma parceria.', minLv: 0, w: 3, choices: [
    { label: 'Ouvir a proposta', fx: { sponsor: 1 } }, { label: 'Recusar', fx: {} }] },
  { id: 'party', title: 'Festa de amigos', text: 'Seus amigos convidam você para uma festa na véspera do descanso.', minLv: 1, w: 3, party: true, choices: [
    { label: 'Ir à festa', fx: { mental: 6, media: 1, phys: -2 }, risk: { p: .2, fx: { media: -6, fans: -3, team: -3 }, text: 'Fotos da festa vazaram.' } }, { label: 'Ficar em casa', fx: { mental: -2, team: 2 } }] },
  { id: 'gym', title: 'Pacote de treino intensivo', text: 'O preparador propõe um bloco de treino pesado (US$ 40 mil).', minLv: 2, w: 2, choices: [
    { label: 'Contratar o pacote', fx: { money: -40000, phys: 8, train: .3 } }, { label: 'Não agora', fx: {} }] },
  { id: 'viral', title: 'Vídeo seu viraliza', text: 'Uma ultrapassagem sua virou meme nas redes.', minLv: 1, w: 2, choices: [
    { label: 'Aproveitar a onda', fx: { fans: 8, pop: 4, media: 3 } }] },
  { id: 'back', title: 'Dor nas costas', text: 'Você sentiu dor após o último treino.', minLv: 1, w: 2, choices: [
    { label: 'Descansar e tratar', fx: { phys: 6, team: -1, money: -5000 } }, { label: 'Ignorar e seguir', fx: {}, risk: { p: .3, fx: { injury: 1, phys: -8 }, text: 'A dor virou uma lesão leve.' } }] },
  { id: 'family', title: 'Família pede tempo', text: 'Seus pais querem você em casa neste fim de semana.', minLv: 1, w: 2, choices: [
    { label: 'Passar o tempo em família', fx: { family: 10, mental: 4, team: -2 } }, { label: 'Ficar focado nas corridas', fx: { family: -8, team: 2 } }] },
  { id: 'engineer', title: 'Teste de setup', text: 'O engenheiro propõe um programa de testes extra.', minLv: 3, w: 2, choices: [
    { label: 'Aceitar', fx: { train: .2, team: 3, mental: -2 } }, { label: 'Recusar', fx: { team: -1 } }] },
  { id: 'leak', title: 'Vazamento de negociação', text: 'A imprensa diz que você negocia com outra equipe.', minLv: 4, w: 2, choices: [
    { label: 'Negar', fx: { team: 2, media: -2 } }, { label: 'Confirmar', fx: { team: -6, media: 3, pop: 1 } }, { label: 'Não comentar', fx: {} }] },
  { id: 'charity', title: 'Evento beneficente', text: 'Você foi convidado para um evento com crianças.', minLv: 2, w: 2, choices: [
    { label: 'Participar', fx: { fans: 5, media: 2, money: -5000 } }, { label: 'Declinar', fx: {} }] },
  { id: 'sim', title: 'Mais horas de simulador', text: 'A equipe pede mais horas no simulador.', minLv: 6, w: 2, choices: [
    { label: 'Aceitar', fx: { mental: -3, team: 4, train: .3 } }, { label: 'Pedir equilíbrio', fx: { team: -1, mental: 1 } }] },
  { id: 'scandal', title: 'Foto polêmica', text: 'Uma foto sua em uma situação ruim circula nas redes.', minLv: 3, w: 1.5, choices: [
    { label: 'Pedir desculpas', fx: { media: -2, fans: 1 } }, { label: 'Processar o site', fx: { money: -20000, media: 1 } }, { label: 'Ignorar', fx: { media: -5, fans: -3 } }] },
  { id: 'loan', title: 'Parente pede empréstimo', text: 'Um tio pede US$ 50 mil emprestados.', minLv: 2, w: 1.5, choices: [
    { label: 'Emprestar', fx: { money: -50000, family: 8 } }, { label: 'Negar', fx: { family: -6 } }] },
  { id: 'scout', title: 'Olheiro de academia', text: 'Um olheiro de uma academia de pilotos acompanhou sua corrida.', minLv: 2, maxLv: 6, w: 2, choices: [
    { label: 'Conversar com ele', fx: { flag: 'academy', pop: 2 } }] },
  { id: 'orders', title: 'Ordem de equipe', text: 'A equipe pede para você deixar o companheiro passar.', minLv: 6, w: 2, choices: [
    { label: 'Obedecer', fx: { team: 6, fans: -2 } }, { label: 'Desobedecer', fx: { team: -8, fans: 4, media: 2 } }] },
  { id: 'prize', title: 'Prêmio revelação', text: 'Você foi eleito piloto revelação do campeonato.', minLv: 1, w: 1.5, choices: [
    { label: 'Receber o prêmio', fx: { money: 30000, pop: 3, media: 3, fans: 3 } }] },
  { id: 'invest', title: 'Amigo propõe um negócio', text: 'Um amigo quer sua participação em uma startup (US$ 50 mil).', minLv: 3, w: 1.5, choices: [
    { label: 'Investir', fx: { money: -50000 }, risk: { p: .5, fx: { money: 130000 }, text: 'O negócio deu certo e você recebeu o retorno.' } }, { label: 'Recusar', fx: {} }] },
  { id: 'burnout', title: 'Esgotamento', text: 'Você está exausto mentalmente.', minLv: 1, w: 0, cond: s => s.player.mental < 35, choices: [
    { label: 'Descansar duas semanas', fx: { mental: 15, team: -4 } }, { label: 'Continuar assim', fx: { mental: -5, phys: -3 } }] },
  { id: 'fans', title: 'Encontro com fãs', text: 'Um grupo de fãs espera você no autódromo.', minLv: 2, w: 2, choices: [
    { label: 'Tirar fotos e autógrafos', fx: { fans: 5, mental: 1 } }, { label: 'Pular o encontro', fx: { fans: -2 } }] },
  { id: 'pressure', title: 'Cobrança da equipe', text: 'O chefe de equipe diz que espera mais de você.', minLv: 3, w: 2, cond: s => s.player.pressure.team < 45, choices: [
    { label: 'Prometer reação', fx: { team: 4, mental: -3 } }, { label: 'Pedir mais apoio técnico', fx: { team: -2, train: .1 } }] }
];
/* Entrevistas (3 tons). mediaVol amplifica efeitos do tom arrogante/polêmico. */
Game.data.interview = [
  { id: 'humilde', label: 'Humilde', fx: { media: 3, fans: 3, team: 2 }, text: 'Você elogiou a equipe e manteve o foco.' },
  { id: 'arrogante', label: 'Arrogante', fx: { media: 5, fans: 4 }, risk: { p: .5, fx: { team: -6, media: -8 }, text: 'A fala soou arrogante e irritou a equipe.' }, text: 'Você cravou que é o melhor da pista.' },
  { id: 'polemico', label: 'Polêmico', fx: { pop: 3, media: 8, team: -4 }, text: 'Você criticou a organização e rendeu manchetes.' }
];
