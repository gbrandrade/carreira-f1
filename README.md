# Caminho até a F1

Simulador de carreira de piloto para navegador. Do kart regional do Brasil até a Fórmula 1, sem animação de corrida:
tudo é decidido em menus, números e textos. Projeto pessoal (uso privado, com nomes reais de pilotos e equipes).

## Como rodar
Não precisa instalar nada. Abra `index.html` no navegador (duplo clique) ou publique a pasta em qualquer hospedagem estática.
O jogo salva automaticamente no navegador (localStorage) e permite exportar/importar o save em arquivo `.json`.

## Estrutura
```
index.html            Página única e ordem de carga dos scripts
css/                  tokens.css (tema/cores) · base.css (layout sem scroll) · components.css · screens.css
js/core/              namespace, rng (aleatoriedade), utils, storage (save)
js/data/              TODOS os dados editáveis: config, categorias, circuitos, equipes, pilotos, cartas, traços,
                      origens, patrimônio, patrocinadores, eventos, recordes
js/systems/           Regras do jogo (sem DOM): attributes, world, calendar, race, superlicense, economy,
                      contracts, pressure, records, career (orquestrador)
js/ui/                dom.js (componentes), charts.js (gráficos), ui.js (roteador/temas/modais) e screens/ (uma tela por arquivo)
```
Regra de ouro: `data/` guarda números e listas, `systems/` guarda regras, `ui/` só desenha. Para balancear, comece por `js/data/config.js`.

## Interface
O visual é o design system "Paddock" (tema escuro/claro e 4 cores de destaque, em Configurações ou na tela inicial). Veja `DESIGN.md`.
A fonte Geist vem do Google Fonts: sem internet, o jogo usa a fonte do sistema e continua funcionando.

## Sem scroll
A escala é FIXA e igual em todas as telas, sem opções e sem JavaScript: `html{font-size:clamp(10px,min(1.9vh,1.2vw),40px)}` em `css/tokens.css`
(1rem = 1,9% da altura da janela). Se quiser o jogo maior ou menor, mude só esse 1.9vh (valores acima de ~2.0vh começam a cortar conteúdo).
Listas longas usam paginação (`ui.paged`) em vez de scroll. Testado em 1280x720, 1366x657, 1920x950, 1920x1080 e 2560x1300.

## O que é estimado (revisar)
- Início em `startYear` (2018, aos 12 anos). Os pilotos reais têm notas de 2026 e são envelhecidos/rejuvenescidos pela idade
  (`systems/attributes.js`); os grids de anos anteriores NÃO são os reais, e sim um mundo paralelo com nomes reais.
- Notas de F2/F3/F4, nascimento dos juniores e notas das lendas históricas em `data/drivers.js` e `data/cards.js`.
- Pontos de superlicença de F4, Regional e kart (`data/categories.js`, campo `sl`).
- Custos das categorias, salários, patrocínios e probabilidades.

## Testes automáticos
`npm install` e depois `npm test` simula 30 carreiras inteiras sem interface; `npm run test:ui` clica pelas telas e acusa erros de JavaScript.
