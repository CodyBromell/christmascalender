// POST /api/open  { door, preview?, day? }  →  { prize, code }
//
// The server decides which gift is behind a door, so nobody can tell in advance (not even
// from the page code) and the discount codes never ship in the page.
// The draw is weighted by remaining stock: each gift starts at START_STOCK in the
// xmas_prizes table and goes down by one every time it's drawn. Edit `remaining` in
// Supabase to top up or withdraw a gift.
//
// Vercel environment variables (Settings → Environment Variables):
//   DATABASE_URL  Postgres connection string (Supabase transaction pooler). Without it the
//                 draw still works with equal odds, but stock isn't tracked.
//   PRIZE_CODES   The 12 discount codes, comma-separated, in prize order (see DAYS in
//                 index.html): de-icer, screenwash, beanie, gloves, allen keys, ornaments,
//                 spirit level, Xbox, hand warmers, screwdriver, blanket, socket set.
//   PREVIEW_KEY   Optional; defaults to the page's preview key.
const crypto = require("crypto");
const postgres = require("postgres");

const PRIZES = 12;
const START_STOCK = 100;          // per gift, from the Final List quantities
const DEFAULT_PREVIEW_KEY = "xmas26";

let sql = null;
function db() {
  if (!process.env.DATABASE_URL) return null;
  if (!sql) {
    sql = postgres(process.env.DATABASE_URL, {
      ssl: process.env.DATABASE_SSL === "disable" ? false : "require",
      max: 1, prepare: false, idle_timeout: 20
    });
  }
  return sql;
}

let ready = null;
function setup(s) {
  if (!ready) {
    ready = (async () => {
      await s`create table if not exists xmas_prizes (
        id int primary key, remaining int not null check (remaining >= 0), total int not null)`;
      await s`create table if not exists xmas_draws (
        id bigserial primary key, door int not null, prize int not null, drawn_at timestamptz not null default now())`;
      const rows = [];
      for (let i = 0; i < PRIZES; i++) rows.push({ id: i, remaining: START_STOCK, total: START_STOCK });
      await s`insert into xmas_prizes ${s(rows)} on conflict (id) do nothing`;
    })().catch(err => { ready = null; throw err; });
  }
  return ready;
}

// Today's date in the UK as a December 2026 day number (1–24 during the calendar).
function ukCalDay(nowMs) {
  const p = {};
  new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "numeric", day: "numeric" })
    .formatToParts(new Date(nowMs)).forEach(x => { p[x.type] = +x.value; });
  return Math.round((Date.UTC(p.year, p.month - 1, p.day) - Date.UTC(2026, 11, 1)) / 86400000) + 1;
}

// Index chosen with probability proportional to its weight; -1 if everything is at zero.
function pickWeighted(weights) {
  const total = weights.reduce((a, w) => a + Math.max(0, w), 0);
  if (total <= 0) return -1;
  let r = crypto.randomInt(total);
  for (let i = 0; i < weights.length; i++) {
    r -= Math.max(0, weights[i]);
    if (r < 0) return i;
  }
  return weights.length - 1;
}

function codeFor(prize) {
  const list = (process.env.PRIZE_CODES || "").split(",").map(c => c.trim());
  return list[prize] || null;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "method" }); }

  let body = req.body || {};
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const door = parseInt(body.door, 10);
  if (!(door >= 1 && door <= PRIZES)) return res.status(400).json({ error: "door" });

  // Door n is open on 2n−1 and 2n December. The team can preview other dates with the key.
  let day = ukCalDay(Date.now());
  const previewKey = process.env.PREVIEW_KEY || DEFAULT_PREVIEW_KEY;
  if (body.preview === previewKey && Number.isFinite(Number(body.day))) day = Number(body.day);
  if (day < 2 * door - 1 || day > 2 * door) return res.status(403).json({ error: "closed" });

  const s = db();
  let prize;
  try {
    if (!s) {
      prize = crypto.randomInt(PRIZES);            // no database: equal odds, no stock tracking
    } else {
      await setup(s);
      prize = await s.begin(async t => {
        const rows = await t`select id, remaining from xmas_prizes where id < ${PRIZES} order by id for update`;
        const weights = new Array(PRIZES).fill(0);
        rows.forEach(r => { weights[r.id] = r.remaining; });
        const p = pickWeighted(weights);
        if (p < 0) return -1;
        await t`update xmas_prizes set remaining = remaining - 1 where id = ${p}`;
        await t`insert into xmas_draws (door, prize) values (${door}, ${p})`;
        return p;
      });
      if (prize < 0) return res.status(410).json({ error: "soldout" });
    }
  } catch (err) {
    console.error("draw failed", err);
    return res.status(500).json({ error: "server" });
  }
  return res.status(200).json({ prize, code: codeFor(prize) });
};

module.exports.pickWeighted = pickWeighted;   // exposed for tests
