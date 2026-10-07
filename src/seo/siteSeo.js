// ===========================================
// SITE SEO (non-blog pages)
// One place for each page's title, description, canonical address and
// share image, plus the business identity used in structured data.
// Read by the router (live pages, see src/router/index.js) and by
// scripts/prerender-pages.js (static HTML for crawlers that do not run
// JavaScript), so both always say the same thing.
// Keep in step with src/router/index.js and scripts/generate-sitemap.js.
// ===========================================

export const SITE_URL = "https://sansonfloorings.com";

export const BUSINESS = {
  name: "GAIA by Sanson Floorings",
  alternateName: ["GAIA", "Sanson Floorings"],
  logo: "/Images/GAIA_Logo.png",
  telephone: "+919910921119",
  email: "contact@sansonfloorings.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "B-5B, Plot No. 70, 1st Floor, Rama Road Industrial Area",
    addressLocality: "New Delhi",
    postalCode: "110015",
    addressCountry: "IN",
  },
  // Only profiles that are confirmed to belong to GAIA. Add Google
  // Business Profile, IndiaMART and others here once confirmed.
  sameAs: ["https://www.linkedin.com/company/gaia-by-sanson-floorings/"],
};

const page = (title, description, image, crumbs) => ({ title, description, image, crumbs });
const PRODUCTS = { name: "Our Products", path: "/categories" };
const GRASS = { name: "Artificial Grass & Multiturf", path: "/categories/artificial-multiturf" };

export const PAGE_SEO = {
  "/categories": page(
    "Flooring and Acoustic Products Made in India | GAIA",
    "Carpet tiles, broadloom carpets, acoustic PET panels and artificial grass, made in India by GAIA by Sanson Floorings, New Delhi.",
    "/Images/GaiaHomePageImage1.webp",
    []
  ),
  "/categories/carpet-tiles": page(
    "Carpet Tiles Made in India, GreenPro Certified | GAIA",
    "GreenPro-certified carpet tiles made in India by GAIA, in collections including Aangan, Miami, Naqsh and Signature, with custom backing, pile and yarn options.",
    "/Images/carpet_tiles.webp",
    [PRODUCTS]
  ),
  "/categories/broadloom-carpets": page(
    "Broadloom Carpets Made in India, Bespoke | GAIA",
    "Tufted broadloom carpets made in India in wide rolls for seamless wall-to-wall installation, customised in fibre, backing, texture, colour and pattern.",
    "/Images/BroadloomCarpetsbannerImage.webp",
    [PRODUCTS]
  ),
  "/categories/acoustic-tiles": page(
    "Acoustic PET Panels Made in India, GreenPro | GAIA",
    "GreenPro-certified acoustic PET panels made from recycled polyester: 9–24 mm thick, NRC 0.3 fixed directly and 0.85–0.90 with an air gap behind them.",
    "/Images/accoustic-full.webp",
    [PRODUCTS]
  ),
  "/categories/artificial-multiturf": page(
    "Artificial Grass and Multiturf Made in India | GAIA",
    "Artificial grass and multiturf made in India with UNE 14836 certified yarn from Bellinturf: landscape, sports, multisport and curly grass.",
    "/Images/ArtificialGrassImage.webp",
    [PRODUCTS]
  ),
  "/artificial-grass/landscape-grass": page(
    "Landscape Grass for Gardens, Terraces and Lawns | GAIA",
    "GAIA Landscape Grass for gardens, terraces, villas, rooftops, hotel lawns and public parks, with a choice of pile heights, stitch options and backing colours.",
    "/Images/GrassImages/landscapegrass2.jpg",
    [PRODUCTS, GRASS]
  ),
  "/artificial-grass/sports-grass": page(
    "Sports Grass for Football and Athletic Fields | GAIA",
    "GAIA Sports Grass for football, rugby, athletic training fields and school grounds, built for performance and resilience.",
    "/Images/sportsGrass.jpg",
    [PRODUCTS, GRASS]
  ),
  "/artificial-grass/multisports-grass": page(
    "MultiTurf for Tennis, Badminton and Gym Floors | GAIA",
    "GAIA MultiTurf for tennis, badminton, gym floors and skating zones: a compact multi-use surface balancing performance and value.",
    "/Images/GrassImages/multisportgras1.jpg",
    [PRODUCTS, GRASS]
  ),
  "/artificial-grass/curly-grass": page(
    "Curly Grass for Balconies, Walkways and Borders | GAIA",
    "GAIA Curly Grass has a textured, thatched look for balconies, walkways, retail display zones and garden borders.",
    "/Images/curly-grass.jpeg",
    [PRODUCTS, GRASS]
  ),
  "/about-us": page(
    "About GAIA by Sanson Floorings | Sanson Group since 1982",
    "GAIA is the flooring and acoustics label of Sanson Group, serving clients since 1982, with GreenPro-certified acoustic PET panels and carpet tiles.",
    "/Images/AboutUsBannerImage.webp",
    []
  ),
  "/tools": page(
    "TilesView Visualiser | See GAIA Flooring in Your Room",
    "Upload a photo of your room and preview GAIA carpet tiles, artificial grass, acoustic panels and broadloom carpets in your own space.",
    "/Images/GaiaHomePageImage1.webp",
    []
  ),
};

const pageName = (path) => {
  const title = PAGE_SEO[path].title;
  return title.replace(/\s*\|\s*GAIA.*$/, "");
};

// Structured data for one non-blog page: the page itself and its breadcrumb.
export function buildPageSeo(path) {
  const entry = PAGE_SEO[path];
  if (!entry) return null;
  const url = `${SITE_URL}${path}`;
  const crumbs = [{ name: "Home", path: "/" }, ...entry.crumbs, { name: pageName(path), path }];
  return {
    title: entry.title,
    description: entry.description,
    path,
    image: entry.image,
    type: "website",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: entry.title,
        description: entry.description,
        inLanguage: "en-IN",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        primaryImageOfPage: `${SITE_URL}${entry.image}`,
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: `${SITE_URL}${c.path}`,
        })),
      },
    ],
  };
}
