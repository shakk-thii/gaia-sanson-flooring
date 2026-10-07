#!/usr/bin/env node
// ===========================================
// STATIC PRODUCT, CATEGORY AND ABOUT PAGES
// Runs after `vite build` (postbuild). For every page in src/seo/siteSeo.js
// it writes dist/<route>/index.html with the page's own title, meta
// description, canonical, Open Graph tags and JSON-LD, plus the page's
// visible content from scripts/page-snapshots.json. Crawlers that do not
// run JavaScript (including most AI crawlers) can then read the page.
// Vercel serves these files before the SPA rewrite; the Vue app mounts
// over them as usual.
// Refresh the content with scripts/snapshot-pages.cjs when a page changes.
// ===========================================

import fs from 'fs';
import path from 'path';
import { PAGE_SEO, buildPageSeo } from '../src/seo/siteSeo.js';
import { applyHead, esc, template, withBody, write } from './prerender-lib.js';

const snapshots = JSON.parse(
  fs.readFileSync(path.join('scripts', 'page-snapshots.json'), 'utf8')
);

// The same links visitors see in the navigation bar and footer.
const siteNav = [
  ['/categories/carpet-tiles', 'Carpet Tiles'],
  ['/categories/artificial-multiturf', 'Artificial Grass & Multiturf'],
  ['/categories/acoustic-tiles', 'Acoustic PET Panels'],
  ['/categories/broadloom-carpets', 'Broadloom Carpets'],
  ['/about-us', 'About us'],
  ['/blogs', 'Blogs'],
];
const navHtml = `<nav aria-label="Main"><ul>${siteNav
  .map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`)
  .join('')}</ul></nav>`;

let count = 0;
for (const route of Object.keys(PAGE_SEO)) {
  const content = snapshots[route];
  if (!content) {
    console.warn(`No snapshot for ${route}; skipped`);
    continue;
  }
  const seo = buildPageSeo(route);
  const crumbs = seo.jsonLd.find((s) => s['@type'] === 'BreadcrumbList').itemListElement;
  const breadcrumb = crumbs
    .map((c, i) =>
      i === crumbs.length - 1
        ? esc(c.name)
        : `<a href="${c.item.replace('https://sansonfloorings.com', '') || '/'}">${esc(c.name)}</a>`
    )
    .join(' / ');
  const body = [
    navHtml,
    '<main>',
    `<nav aria-label="Breadcrumb">${breadcrumb}</nav>`,
    content,
    '</main>',
    '<footer><p>GAIA by Sanson Floorings, B-5B, Plot No. 70, 1st Floor, Rama Road Industrial Area, New Delhi 110015. contact@sansonfloorings.com</p></footer>',
  ].join('\n');
  write(route.slice(1), withBody(applyHead(template, seo), body));
  count += 1;
}

console.log(`Static pages written: ${count} product, category and about page(s)`);
