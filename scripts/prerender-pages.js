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
import { applyHead, esc, siteFooter, siteNav, template, withBody, write } from './prerender-lib.js';

const snapshots = JSON.parse(
  fs.readFileSync(path.join('scripts', 'page-snapshots.json'), 'utf8')
);


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
    siteNav,
    '<main>',
    `<nav aria-label="Breadcrumb">${breadcrumb}</nav>`,
    content,
    '</main>',
    siteFooter,
  ].join('\n');
  write(route.slice(1), withBody(applyHead(template, seo), body));
  count += 1;
}

// Home page last: dist/index.html is also the template the other pages
// were built from. Its head already carries the home page SEO and the
// business JSON-LD, so only the visible content is added. Vue replaces
// #app when it mounts, as on every other static page.
if (snapshots['/']) {
  const home = [siteNav, '<main>', snapshots['/'], '</main>', siteFooter].join('\n');
  fs.writeFileSync(path.join('dist', 'index.html'), withBody(template, home), 'utf8');
  count += 1;
}

console.log(`Static pages written: ${count} home, product, category and about page(s)`);
