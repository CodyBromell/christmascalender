# The 12 Days of Christmas — advent calendar giveaway

Twelve doors, 1–12 December 2026. Customers who spend £280+ in a single order enter their order number to open that day's door and claim the gift behind it.

## Status

Front-end prototype. Order validation, gift stock and unlock dates are simulated in the browser — test order numbers `NL-10412`, `NL-10488`, `NL-10501`.

## Structure

Static site, no build step — deploys to Vercel as-is.

| Path | What it is |
|------|------------|
| `index.html` | The page: markup template inside `<x-dc>` plus the component logic (prizes, orders, door rules) in the `data-dc-script` block |
| `vendor/dc-runtime.js` | Runtime that renders the `<x-dc>` template with React (exported from Claude Design — generated, don't edit) |
| `vendor/react*.js` | React 18.3.1, served locally instead of unpkg |
| `fonts/` | Archivo (latin, latin-ext, vietnamese subsets) |
| `images/pattern.png` | Tiled background pattern |

## Run locally

Any static server, e.g.

```bash
npx serve .
```
