// ===========================================
// PRERENDER HELPERS
// Shared by prerender-blogs.js and prerender-pages.js: write a page's own
// title, meta tags, canonical and JSON-LD into a copy of dist/index.html,
// put readable content inside #app, and save it as dist/<route>/index.html.
// ===========================================

import fs from 'fs';
import path from 'path';
import { SITE_URL } from '../src/components/OtherComponents/Blogs/BlogSeo.js';

export const DIST = 'dist';
export const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

export const esc = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const absoluteUrl = (p) => (p && p.startsWith('http') ? p : `${SITE_URL}${p || ''}`);

// Replace the content of an existing head tag, keeping the site default
// in data-default-content so the app can restore it on other pages.
function setAttrTag(html, pattern, attr, value) {
  const re = new RegExp(`<(meta|link)([^>]*?)${pattern}([^>]*?)>`, 'i');
  const match = html.match(re);
  if (!match) throw new Error(`Head tag not found: ${pattern}`);
  const tag = match[0];
  const current = (tag.match(new RegExp(`${attr}="([^"]*)"`, 'i')) || [])[1] || '';
  const updated = tag
    .replace(new RegExp(`${attr}="[^"]*"`, 'i'), `${attr}="${esc(value)}"`)
    .replace(/\s*\/?>$/, ` data-default-content="${current}">`);
  return html.replace(tag, updated);
}

export function applyHead(html, seo) {
  const url = absoluteUrl(seo.path);
  const image = absoluteUrl(seo.image);
  const defaultTitle = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || '';

  html = html.replace(/<html([^>]*)>/i, `<html$1 data-default-title="${esc(defaultTitle)}">`);
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${esc(seo.title)}</title>`);

  html = setAttrTag(html, 'name="title"', 'content', seo.title);
  html = setAttrTag(html, 'name="description"', 'content', seo.description);
  html = setAttrTag(html, 'property="og:type"', 'content', seo.type);
  html = setAttrTag(html, 'property="og:url"', 'content', url);
  html = setAttrTag(html, 'property="og:title"', 'content', seo.title);
  html = setAttrTag(html, 'property="og:description"', 'content', seo.description);
  html = setAttrTag(html, 'property="og:image"', 'content', image);
  html = setAttrTag(html, 'property="twitter:url"', 'content', url);
  html = setAttrTag(html, 'property="twitter:title"', 'content', seo.title);
  html = setAttrTag(html, 'property="twitter:description"', 'content', seo.description);
  html = setAttrTag(html, 'property="twitter:image"', 'content', image);
  html = setAttrTag(html, 'rel="canonical"', 'href', url);

  const jsonLd = seo.jsonLd
    .map(
      (schema) =>
        `<script type="application/ld+json" data-prerender-seo>${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`
    )
    .join('\n  ');
  return html.replace('</head>', `  ${jsonLd}\n</head>`);
}

export const withBody = (html, body) =>
  html.replace(/<div id="app"><\/div>/, `<div id="app">${body}</div>`);

export function write(route, html) {
  const dir = path.join(DIST, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
}


// Site navigation and business footer, the same on every static page, so
// crawlers see one consistent name, address, phone and email for GAIA.
const SITE_NAV = [
  ['/', 'Home'],
  ['/categories/carpet-tiles', 'Carpet Tiles'],
  ['/categories/broadloom-carpets', 'Broadloom Carpets'],
  ['/categories/acoustic-tiles', 'Acoustic PET Panels'],
  ['/categories/artificial-multiturf', 'Artificial Grass & Multiturf'],
  ['/about-us', 'About us'],
  ['/blogs', 'Blogs'],
];

export const siteNav = `<nav aria-label="Main"><ul>${SITE_NAV.map(
  ([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`
).join('')}</ul></nav>`;

export const siteFooter = [
  '<footer>',
  '<p><strong>GAIA by Sanson Floorings</strong>, part of Sanson Group. Carpet tiles, broadloom carpets, acoustic PET panels and artificial grass, made in India.</p>',
  '<address>B-5B, Plot No. 70, 1st Floor, Rama Road Industrial Area, New Delhi 110015, India. Phone: <a href="tel:+919910921119">+91 99109 21119</a>. Email: <a href="mailto:contact@sansonfloorings.com">contact@sansonfloorings.com</a></address>',
  '<p><a href="https://www.linkedin.com/company/gaia-by-sanson-floorings/">GAIA by Sanson Floorings on LinkedIn</a></p>',
  '</footer>',
].join('\n');
