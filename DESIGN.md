# Design system: "Paddock"

Sistema visual do jogo. Tudo é controlado por tokens em `css/tokens.css`; mude lá antes de mexer em qualquer tela.
Referências: Geist (Vercel), Astryx (Meta), Bklit (gráficos), craftUI, oxyn (loaders) e design.how.

## Princípios
1. **Dados em primeiro lugar.** Interface de telemetria: números tabulares, rótulos em mono minúsculo, bordas de 1 px.
2. **Um destaque só.** Neutros + 1 cor de destaque (`--accent`). Cores semânticas (ok/warn/bad/info) só para estado.
3. **Sem scroll.** Telas cabem na janela. Listas usam `ui.paged`. `ui.autoFit()` reduz a escala se algo ultrapassar.
4. **Movimento com propósito.** Entrada de tela, carta da roleta, anéis e loader da corrida. Respeita `prefers-reduced-motion`.

## Tokens (css/tokens.css)
- Tema: `<html data-theme="dark|light">`. Destaque: `<html data-accent="red|papaya|teal|blue">`.
- Superfícies: `--bg`, `--surface`, `--surface-2`, `--surface-3`. Linhas: `--line`, `--line-strong`.
- Texto: `--text`, `--text-2`, `--text-3`. Estado: `--ok`, `--warn`, `--bad`, `--info`. Medalhas: `--gold`, `--silver`, `--bronze`.
- Tipografia: Geist (`--sans`) e Geist Mono (`--mono`, usada em rótulos, números e badges). Escala base `1rem ≈ 1,75vh`.
- Raios: `--r` (painéis), `--r-sm` (controles). Movimento: `--ease`.

## Componentes (js/ui/dom.js e charts.js)
| Função | Uso |
|---|---|
| `ui.panel({title,right,cls}, ...)` | Painel base. `cls:'marks'` adiciona os cantos de corte (destaque). |
| `ui.head(título, sub, direita)` | Cabeçalho de tela. |
| `ui.btn(label, fn, cls, dis, icon)` | Botão: `primary`, `ghost`, `sm`, `lg`, `icon`, `on`. |
| `ui.tabs(lista, ativo, fn)` | Controle segmentado. |
| `ui.badge(txt, 'ok|warn|bad|acc|info')` | Selo. |
| `ui.meter` / `ui.bar` | Medidor em quadradinhos com marcador de teto. |
| `ui.stat(rótulo, valor, sub, extra, lead)` | Métrica. |
| `ui.rate(n)` | Chip de nota (cor por faixa de GER). |
| `ui.table(cols, rows)` | Tabela (`rows[].me` destaca o jogador). |
| `ui.plate(ícone, cor, grande)` | Placa de ícone tingida. |
| `ui.radar`, `ui.ring`, `ui.area`, `ui.hbars`, `ui.track`, `ui.dots` | Gráficos e visuais SVG. |
| `ui.simulate(etapas, fn)` | Loader de pontos antes de um resultado (`ui.simDelay`, 0 desliga). |
| `ui.modal`, `ui.toast`, `ui.confirm` | Sobreposições. |

## Como criar uma tela nova
1. Crie `js/ui/screens/minha.js` com `ui.screens.minha = { render() { return h('div',{class:'screen'}, ...) } }`.
2. Adicione o script no `index.html` e uma entrada em `NAV`/`TITLES` em `js/ui/ui.js`.
3. Use só `ui.*`, tokens e as classes de `css/components.css`; não escreva cores nem tamanhos fixos.
