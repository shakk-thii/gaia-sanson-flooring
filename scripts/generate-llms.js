#!/usr/bin/env node
// ===========================================
// llms.txt
// Runs after `vite build` (postbuild). Writes dist/llms.txt: a short,
// plain-text guide to the site for AI assistants and answer engines
// (see llmstxt.org). It lists who GAIA is, the product pages and every
// published article, so it stays current as articles are added.
// ===========================================

import fs from 'fs';
import path from 'path';
import BlogsData from '../src/components/OtherComponents/Blogs/BlogsData.js';
import { PAGE_SEO } from '../src/seo/siteSeo.js';

const SITE = 'https://sansonfloorings.com';
const line = (p) => `- [${PAGE_SEO[p].title.replace(/ \| GAIA$/, '')}](${SITE}${p}): ${PAGE_SEO[p].description}`;

const products = [
  '/categories/carpet-tiles',
  '/categories/broadloom-carpets',
  '/categories/acoustic-tiles',
  '/categories/artificial-multiturf',
  '/artificial-grass/landscape-grass',
  '/artificial-grass/sports-grass',
  '/artificial-grass/multisports-grass',
  '/artificial-grass/curly-grass',
];

const today = new Date().toISOString().slice(0, 10);
const articles = [...BlogsData]
  .filter((b) => b.publishedDate <= today)
  .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate))
  .map((b) => `- [${b.title}](${SITE}/blogs/${b.slug}): ${b.metaDescription}`);

const text = `# GAIA by Sanson Floorings

> GAIA by Sanson Floorings is an Indian maker of carpet tiles, broadloom carpets, acoustic PET panels and artificial grass, based in New Delhi and part of Sanson Group. It supplies offices, hotels, restaurants, schools, homes and sports facilities across India.

- Name: GAIA by Sanson Floorings (also known as GAIA; Sanson Floorings)
- Address: B-5B, Plot No. 70, 1st Floor, Rama Road Industrial Area, New Delhi 110015, India
- Phone and WhatsApp: +91 99109 21119
- Email: contact@sansonfloorings.com
- Website: ${SITE}
- LinkedIn: https://www.linkedin.com/company/gaia-by-sanson-floorings/

## Products

${products.map(line).join('\n')}

## Company

${line('/about-us')}
${line('/tools')}

## Articles

${articles.join('\n')}
`;

fs.writeFileSync(path.join('dist', 'llms.txt'), text, 'utf8');
console.log(`llms.txt written (${articles.length} articles)`);
