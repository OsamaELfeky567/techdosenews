const fs = require('fs');
const path = require('path');

const INDEX_PATH = path.join(__dirname, '..', 'data', 'articles', 'index.json');
const SITEMAP_PATH = path.join(__dirname, '..', 'sitemap.xml');
const BASE = 'https://td-arabi.com';

const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8')).filter(a => a.status === 'published');
const now = new Date().toISOString().slice(0, 10);

const staticPages = [
  { loc: `${BASE}/`, freq: 'hourly', priority: '1.0' },
  { loc: `${BASE}/about.html`, freq: 'monthly', priority: '0.3' },
  { loc: `${BASE}/contact.html`, freq: 'monthly', priority: '0.3' },
  { loc: `${BASE}/privacy.html`, freq: 'monthly', priority: '0.3' },
  { loc: `${BASE}/terms.html`, freq: 'monthly', priority: '0.3' },
  { loc: `${BASE}/disclaimer.html`, freq: 'monthly', priority: '0.3' },
  { loc: `${BASE}/editorial-policy.html`, freq: 'monthly', priority: '0.3' },
];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
`;

for (const page of staticPages) {
  xml += `  <url><loc>${page.loc}</loc><changefreq>${page.freq}</changefreq><priority>${page.priority}</priority></url>\n`;
}

for (const article of index) {
  const date = article.date || article.publishedAt || now;
  const lastmod = date.slice(0, 10);
  const pubDate = date;
  const title = (article.title_ar || article.title || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  xml += `  <url>
    <loc>${BASE}/article.html?id=${article.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <news:news>
      <news:publication>
        <news:name>TD بالعربي</news:name>
        <news:language>ar</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>
`;
}

xml += `</urlset>`;

fs.writeFileSync(SITEMAP_PATH, xml, 'utf8');
console.log(`Generated sitemap.xml with ${index.length} articles + 7 static pages`);
console.log(`Total size: ${(xml.length / 1024).toFixed(1)} KB`);
