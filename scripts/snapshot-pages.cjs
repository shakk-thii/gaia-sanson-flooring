#!/usr/bin/env node
// ===========================================
// PAGE SNAPSHOTS (run by hand when product page content changes)
// Opens each product, category and about page in a headless browser,
// reads the visible main content (between the navigation bar and the
// footer) and saves it as simple HTML in scripts/page-snapshots.json.
// scripts/prerender-pages.js puts that HTML into the static page, so
// crawlers that do not run JavaScript see the same content as visitors.
//
// Usage (needs Playwright installed locally, not a site dependency):
//   npm run build && npx vite preview --port 4173 &
//   node scripts/snapshot-pages.cjs http://localhost:4173
// ===========================================

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = process.argv[2] || 'http://localhost:4173';
const ROUTES = [
  '/',
  '/categories',
  '/categories/carpet-tiles',
  '/categories/broadloom-carpets',
  '/categories/acoustic-tiles',
  '/categories/artificial-multiturf',
  '/artificial-grass/landscape-grass',
  '/artificial-grass/sports-grass',
  '/artificial-grass/multisports-grass',
  '/artificial-grass/curly-grass',
  '/about-us',
  '/tools',
];

function extract() {
  const SKIP = new Set(['Preview', '✓', '↗', 'View More', '🏠Explore Collection']);
  const root = document.querySelector('.page-transition');
  const taken = new Set();
  const out = [];
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const visible = (el) => {
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden';
  };
  const ownText = (el) =>
    [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
  for (const el of root.querySelectorAll('*')) {
    if (!visible(el) || el.closest('svg,script,style,button,form')) continue;
    let p = el.parentElement;
    let inside = false;
    while (p && p !== root) {
      if (taken.has(p)) { inside = true; break; }
      p = p.parentElement;
    }
    if (inside) continue;
    const tag = el.tagName;
    const isHeading = /^H[1-4]$/.test(tag);
    if (!isHeading && !ownText(el) && tag !== 'LI') continue;
    const text = (el.innerText || '').replace(/\s+/g, ' ').replace(/^[✓↗]\s*/, '').trim();
    if (!text || SKIP.has(text) || text.length < 2) continue;
    taken.add(el);
    const link = el.closest('a[href^="/"]');
    const inner = link ? `<a href="${link.getAttribute('href')}">${esc(text)}</a>` : esc(text);
    if (isHeading) out.push({ h: Number(tag[1]), html: inner });
    else if (tag === 'LI') out.push({ li: true, html: inner });
    else out.push({ html: inner });
  }
  // One h1 (the first heading), the rest as h2/h3; consecutive list
  // items grouped; exact repeats dropped.
  let seenH1 = false;
  const html = [];
  let inList = false;
  let last = '';
  for (const b of out) {
    if (b.html === last) continue;
    last = b.html;
    if (b.li && !inList) { html.push('<ul>'); inList = true; }
    if (!b.li && inList) { html.push('</ul>'); inList = false; }
    if (b.h) {
      const level = !seenH1 ? 1 : Math.min(Math.max(b.h, 2), 3);
      seenH1 = true;
      html.push(`<h${level}>${b.html}</h${level}>`);
    } else if (b.li) html.push(`<li>${b.html}</li>`);
    else html.push(`<p>${b.html}</p>`);
  }
  if (inList) html.push('</ul>');
  return html.join('\n');
}

(async () => {
  const browser = await chromium.launch();
  const result = {};
  for (const route of ROUTES) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(BASE + route, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
    });
    await page.waitForTimeout(800);
    result[route] = await page.evaluate(extract);
    await page.close();
    console.log(route, result[route].length, 'characters');
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'page-snapshots.json'), JSON.stringify(result, null, 1) + '\n');
})();
