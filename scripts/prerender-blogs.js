#!/usr/bin/env node
// ===========================================
// STATIC BLOG PAGES
// Runs after `vite build` (postbuild). For /blogs and every article in
// BlogsData.js it writes dist/blogs/.../index.html with the article's own
// title, meta description, canonical, Open Graph tags, JSON-LD and the
// full article text already in the HTML. Search engines and AI crawlers
// that do not run JavaScript can then read the article. Vercel serves
// these files before the SPA rewrite; the Vue app mounts over them as
// usual.
// ===========================================

import fs from 'fs';
import path from 'path';
import BlogsData, { formatBlogDate } from '../src/components/OtherComponents/Blogs/BlogsData.js';
import {
  buildArticleSchemas,
  buildBlogListingSeo,
} from '../src/components/OtherComponents/Blogs/BlogSeo.js';
import { applyHead, esc, template, withBody, write } from './prerender-lib.js';

const POSTS_DIR = 'src/components/OtherComponents/Blogs/BlogPosts';

const sorted = [...BlogsData].sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));

// Listing page
{
  const seo = buildBlogListingSeo(BlogsData);
  const items = sorted
    .map(
      (blog) =>
        `<li><a href="/blogs/${blog.slug}">${esc(blog.title)}</a><p>${esc(blog.excerpt)}</p></li>`
    )
    .join('');
  const body = `<main><nav aria-label="Breadcrumb"><a href="/">Home</a> / Blogs</nav><h1>Blogs</h1><ul>${items}</ul></main>`;
  write('blogs', withBody(applyHead(template, seo), body));
}

// Article pages
sorted.forEach((blog) => {
  const articleHtml = fs.readFileSync(path.join(POSTS_DIR, `${blog.slug}.html`), 'utf8');
  const seo = {
    title: blog.seoTitle || `${blog.title} | GAIA`,
    description: blog.metaDescription,
    path: `/blogs/${blog.slug}`,
    image: blog.ogImage || blog.coverImage,
    type: 'article',
    jsonLd: buildArticleSchemas(blog),
  };

  const related = sorted
    .filter((item) => item.slug !== blog.slug)
    .sort(
      (a, b) =>
        Number(b.cluster === blog.cluster) - Number(a.cluster === blog.cluster) ||
        Number(b.category === blog.category) - Number(a.category === blog.category) ||
        b.publishedDate.localeCompare(a.publishedDate)
    )
    .slice(0, 3);

  const relatedProduct = blog.relatedProduct
    ? `<p><a href="${blog.relatedProduct.path}">${esc(blog.relatedProduct.name)}</a></p>`
    : '';
  const relatedList = related.length
    ? `<aside><h2>Related articles</h2><ul>${related
        .map((item) => `<li><a href="/blogs/${item.slug}">${esc(item.title)}</a></li>`)
        .join('')}</ul></aside>`
    : '';

  const body = [
    '<main>',
    `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blogs">Blogs</a> / ${esc(blog.title)}</nav>`,
    '<article>',
    `<h1>${esc(blog.title)}</h1>`,
    `<p>${esc(blog.excerpt)}</p>`,
    `<p>${esc(blog.author)} · ${esc(blog.location)} · <time datetime="${blog.publishedDate}">${formatBlogDate(blog.publishedDate)}</time>${blog.updatedDate ? ` · Updated <time datetime="${blog.updatedDate}">${formatBlogDate(blog.updatedDate)}</time>` : ''}</p>`,
    `<img src="${blog.coverImage}" alt="${esc(blog.coverImageAlt)}">`,
    articleHtml,
    '</article>',
    relatedProduct,
    relatedList,
    '</main>',
  ].join('\n');

  write(`blogs/${blog.slug}`, withBody(applyHead(template, seo), body));
});

console.log(`Static blog pages written: /blogs and ${sorted.length} article(s)`);
