// ===========================================
// ROUTE SEO (browser)
// Applies the title, description, canonical and structured data from
// siteSeo.js when a non-blog page enters, and removes them when it
// leaves. Called from PageTransition.vue so it runs after the previous
// page has fully left (blog pages manage their own tags).
// ===========================================

import { applyBlogSeo } from "../components/OtherComponents/Blogs/BlogSeo.js";
import { buildPageSeo } from "./siteSeo.js";

let restore = null;

export function clearRouteSeo() {
  if (restore) {
    restore();
    restore = null;
  }
}

export function applyRouteSeo(path) {
  clearRouteSeo();
  const seo = buildPageSeo(path.replace(/\/+$/, "") || "/");
  if (seo) restore = applyBlogSeo(seo);
}
