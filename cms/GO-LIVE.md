# Putting the Christmas Calendar on the eshop (FirstSpirit)

The calendar stays hosted on Vercel and is shown inside an eshop page with an iframe. A small helper script (`embed.js`, also on Vercel) makes it full width, sizes the frame to the calendar's height (no inner scrollbar) and keeps the gift reveal on screen. This follows the same approach as the MS1 page.
Every update pushed to GitHub `main` goes live automatically, so you never need to touch the CMS again after the first setup.

## 1. Add it in FirstSpirit

1. Open **FirstSpirit ContentCreator** and go to the page where the calendar should appear. You can also create a new page, for example "Christmas Calendar", in the right menu area.
2. **Add a section** using the **"code" template in the System folder**, the same one the MS1 page uses, so the `<style>`, `<iframe>` and `<script>` tags aren't stripped.
   - If there's no such template, or iframes are stripped out, ask your FirstSpirit admin or agency to enable one. That's the only CMS-side requirement.
   - No full-width setting is needed: the embed breaks out of the content column itself, and hides the breadcrumb on this page only.
3. Paste the contents of [`firstspirit-embed.html`](firstspirit-embed.html) into it and **save**.
4. **Preview** the page on desktop and on a phone.
5. **Release** the page (and its menu entry, if it's a new page).
6. **Publish / deploy** it to the live site. Depending on the setup, that's a publish action or the scheduled deployment run by the admin.
7. Check the live page on a phone and a desktop.

## 2. What customers will see

The calendar follows the real UK date:

| When | What shows |
|---|---|
| Before 1 Dec | All 12 doors locked with their opening dates, a countdown to door 1, and a "Door 1 opens 1 December" button |
| 1–24 Dec | One door open at a time, each for two days (door 1 on 1–2 Dec … door 12 on 23–24 Dec) |
| From 25 Dec | All doors locked. "The calendar has closed — thank you, and merry Christmas!" |

The eshop buttons and the Würth logo open the eshop in the main window, not inside the frame.

## 3. Previewing future dates (team only)

Customers can't skip ahead. To preview a date, add the preview key to the address:

- `https://xmastestpage.vercel.app/?preview=xmas26&day=9` shows 9 December
- `&reset` closes all doors you've opened in that browser, for example `?preview=xmas26&day=9&reset`

## 4. Before 1 December

- [ ] Link the real **promotion terms** (the "promotion terms" links currently go nowhere)
- [ ] Add a photo for **day 6 (Christmas ornaments)**, which currently shows an emoji
- [ ] Confirm **Xbox Game Pass Ultimate vs Essential** (the Amazon listing now shows "Essential")
- [ ] Agree how qualifying £280+ orders get their gift added (orders placed during each door's two days)
- [ ] Optional: give the calendar its own domain in Vercel (e.g. a Würth subdomain) and change the `src` in the embed code

## Known limitation

Opened doors are remembered in the visitor's browser. In Safari (iPhone/Mac), storage inside embedded frames is restricted, so returning Safari visitors may see their doors closed again. The gift offer itself is unaffected.
