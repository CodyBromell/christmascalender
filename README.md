# The 12 Days of Christmas — advent calendar giveaway

Twelve doors that open one at a time between 1 and 24 December 2026: each door is open for two days (door 1 on 1–2 Dec, door 2 on 3–4 Dec … door 12 on 23–24 Dec), then locks and the next opens. Anyone can open the current door to reveal the gift; customers who spend £280+ in a single order on the eshop while that door is open get the gift.

## Status

Follows the real UK date (locked with a countdown before 1 Dec, closed from 25 Dec). There's no order checking on the page — qualifying orders are handled on the eshop side.

Opened doors are remembered in the browser (`localStorage`). For testing, add the preview key `?preview=xmas26`, then:

- `&day=9`: pretend it's 9 December (0 = 30 Nov, 25 = after Christmas)
- `&reset`: forget opened doors and start over

Putting it on the eshop: see [cms/GO-LIVE.md](cms/GO-LIVE.md).

## Structure

Static site, no build step — deploys to Vercel as-is.

| Path | What it is |
|------|------------|
| `index.html` | The page: markup template inside `<x-dc>` plus the component logic (prizes, hints, door dates, house drawings) in the `data-dc-script` block |
| `vendor/dc-runtime.js` | Runtime that renders the `<x-dc>` template with React (exported from Claude Design — generated, don't edit) |
| `vendor/react*.js` | React 18.3.1, served locally instead of unpkg |
| `fonts/` | Archivo (latin, latin-ext, vietnamese subsets) |
| `images/wurth-logo.png` | Würth logo (transparent, trimmed) |
| `images/prizes/day-NN.jpg` | Product photos shown when a door opens (600 px) |

The houses, background, fairy lights, snowdrift, snow and falling tools are all drawn in code (CSS + inline SVG) — no image files.

## Run locally

Any static server, e.g.

```bash
npx serve .
```
