#!/usr/bin/env node
// ===========================================
// INDEXNOW
// Run by .github/workflows/indexnow.yml after every push to main.
// Waits until Vercel serves the new sitemap, then tells IndexNow
// (Bing and other participating engines) which pages changed:
//   - blog articles published or updated in the last 14 days,
//   - the blog listing,
//   - every product, category and about page when their content,
//     titles or structured data changed in this push.
// The key file lives in public/<key>.txt.
// ===========================================

import fs from 'fs';
import { execSync } from 'child_process';
import BlogsData from '../src/components/OtherComponents/Blogs/BlogsData.js';
import { PAGE_SEO } from '../src/seo/siteSeo.js';

const HOST = 'sansonfloorings.com';
const SITE = `https://${HOST}`;
const KEY = '030baeaebe8e07ed7baefb11a6c84c76';
const BEFORE = process.env.BEFORE_SHA || 'HEAD~1';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const changedFiles = (() => {
  try {
    return execSync(`git diff --name-only ${BEFORE} HEAD`, { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
  } catch {
    return [];
  }
})();

const daysAgo = (d) => (Date.now() - new Date(d).getTime()) / 86400000;
const recentBlogs = BlogsData.filter(
  (b) => daysAgo(b.updatedDate || b.publishedDate) <= 14
).map((b) => `${SITE}/blogs/${b.slug}`);

const siteWide = changedFiles.some((f) =>
  /^(index\.html|src\/seo\/|scripts\/page-snapshots\.json|src\/components\/OtherComponents\/(Categories|About|Tools)\/)/.test(f)
);
const pageUrls = siteWide ? Object.keys(PAGE_SEO).map((p) => `${SITE}${p}`) : [];
if (siteWide) pageUrls.unshift(`${SITE}/`);

const urlList = [...new Set([...recentBlogs, ...(recentBlogs.length ? [`${SITE}/blogs`] : []), ...pageUrls])];
if (!urlList.length) {
  console.log('Nothing changed that needs IndexNow; done.');
  process.exit(0);
}

if (process.env.DRY_RUN) {
  console.log(`Would submit ${urlList.length} URL(s):\n${urlList.join('\n')}`);
  process.exit(0);
}

// Wait for the deployment: the live sitemap must list every recent article
// and the key file must be served.
const mustList = recentBlogs;
for (let attempt = 1; attempt <= 40; attempt += 1) {
  try {
    const [sitemap, key] = await Promise.all([
      fetch(`${SITE}/sitemap.xml`, { cache: 'no-store' }).then((r) => r.text()),
      fetch(`${SITE}/${KEY}.txt`, { cache: 'no-store' }).then((r) => (r.ok ? r.text() : '')),
    ]);
    if (key.trim() === KEY && mustList.every((u) => sitemap.includes(`<loc>${u}</loc>`))) break;
  } catch (e) {
    console.log(`Waiting for the site (${e.message})`);
  }
  if (attempt === 40) {
    console.error('The new deployment did not appear within 20 minutes; not submitting.');
    process.exit(1);
  }
  await sleep(30000);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow responded ${res.status} for ${urlList.length} URL(s):\n${urlList.join('\n')}`);
if (!res.ok && res.status !== 202) process.exit(1);
