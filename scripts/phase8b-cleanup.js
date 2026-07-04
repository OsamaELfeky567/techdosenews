const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();

// ========== 1. Load index.json ==========
const indexRaw = fs.readFileSync(path.join(ROOT, 'data', 'articles', 'index.json'), 'utf-8');
const articles = JSON.parse(indexRaw);

console.log('Loaded', articles.length, 'articles');

// ========== 2. Fix empty slugs ==========
let fixedSlugs = 0;
for (const a of articles) {
  if (!a.seo_slug || a.seo_slug.trim() === '') {
    const title = a.title_ar || a.title || '';
    const slug = title
      .replace(/[^\w\s\u0600-\u06FF-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .substring(0, 100);
    a.seo_slug = slug || 'article-' + a.id;
    fixedSlugs++;
  }
}
console.log('Fixed slugs:', fixedSlugs);

// ========== 3. Fix placeholder tags ==========
let fixedTags = 0;
for (const a of articles) {
  if (Array.isArray(a.tags)) {
    const hasPlaceholder = a.tags.some(t => t.includes('تاغ') || t === 'تاغ ذو صلة' || t === 'تاغ ثاني' || t === 'تاغ ثالث');
    if (hasPlaceholder) {
      // Generate tags from article data
      const tags = [];
      if (a.primary_company) tags.push(a.primary_company);
      if (a.secondary_company) tags.push(a.secondary_company);
      if (Array.isArray(a.products) && a.products.length) tags.push(...a.products.slice(0, 2));
      if (Array.isArray(a.technologies) && a.technologies.length) tags.push(...a.technologies.slice(0, 2));
      if (tags.length === 0) {
        // Fallback: use category
        const cat = (a.category || '').split('|').map(s => s.trim()).filter(Boolean);
        if (cat.length) tags.push(...cat.slice(0, 3));
      }
      if (tags.length === 0) tags.push('تكنولوجيا');
      a.tags = [...new Set(tags)].slice(0, 5);
      fixedTags++;
    }
  }
}
console.log('Fixed placeholder tags:', fixedTags);

// ========== 4. Write fixed index.json ==========
fs.writeFileSync(path.join(ROOT, 'data', 'articles', 'index.json'), JSON.stringify(articles, null, 2), 'utf-8');
console.log('Written fixed index.json');

// ========== 5. Regenerate sitemap.xml ==========
const BASE = 'https://td-arabi.com';
const staticPages = ['/', '/about.html', '/contact.html', '/privacy.html', '/terms.html', '/disclaimer.html', '/editorial-policy.html'];
const today = new Date().toISOString().split('T')[0];

function escXml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
sitemap += '  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n';

for (const page of staticPages) {
  sitemap += '  <url>\n    <loc>' + BASE + page + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n';
}

for (const a of articles) {
  if (a.status !== 'published') continue;
  const url = BASE + '/article.html?id=' + encodeURIComponent(a.id);
  const pubDate = a.published_at || a.date || a.created_at || today;
  const title = escXml(a.title_ar || a.title || '');
  sitemap += '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + pubDate.substring(0, 10) + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n';
  sitemap += '    <news:news>\n      <news:publication>\n        <news:name>TD بالعربي</news:name>\n        <news:language>ar</news:language>\n      </news:publication>\n';
  sitemap += '      <news:publication_date>' + pubDate.substring(0, 10) + '</news:publication_date>\n';
  sitemap += '      <news:title>' + title + '</news:title>\n    </news:news>\n  </url>\n';
}

sitemap += '</urlset>\n';
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf-8');
const sitemapCount = articles.filter(a => a.status === 'published').length;
console.log('Written sitemap.xml with', sitemapCount, 'articles +', staticPages.length, 'static pages');

// ========== 6. Regenerate rss.xml ==========
const sorted = [...articles].filter(a => a.status === 'published').sort((a, b) => {
  const da = new Date(a.published_at || a.date || a.created_at || 0);
  const db = new Date(b.published_at || b.date || b.created_at || 0);
  return db - da;
});

let rss = '<?xml version="1.0" encoding="UTF-8"?>\n';
rss += '<rss version="2.0"\n  xmlns:content="http://purl.org/rss/1.0/modules/content/"\n';
rss += '  xmlns:atom="http://www.w3.org/2005/Atom">\n';
rss += '<channel>\n';
rss += '  <title>TD بالعربي — أخبار التقنية والذكاء الاصطناعي</title>\n';
rss += '  <link>' + BASE + '/</link>\n';
rss += '  <description>جرعتك اليومية من أخبار التقنية والذكاء الاصطناعي، بمعايير صحفية احترافية</description>\n';
rss += '  <language>ar</language>\n';
rss += '  <lastBuildDate>' + new Date().toUTCString() + '</lastBuildDate>\n';
rss += '  <atom:link href="' + BASE + '/rss.xml" rel="self" type="application/rss+xml"/>\n';
rss += '  <image>\n    <url>' + BASE + '/img/og-image.png</url>\n    <title>TD بالعربي</title>\n    <link>' + BASE + '/</link>\n  </image>\n';

const rssCount = Math.min(sorted.length, 20);
for (let i = 0; i < rssCount; i++) {
  const a = sorted[i];
  const url = BASE + '/article.html?id=' + encodeURIComponent(a.id);
  const pubDate = new Date(a.published_at || a.date || a.created_at || Date.now()).toUTCString();
  const title = escXml(a.title_ar || a.title || '');
  const excerpt = escXml((a.excerpt || '').substring(0, 300));
  const img = escXml(a.image || a.image_url || '');
  const source = escXml(a.source_name || a.source || 'TD بالعربي');
  const tags = Array.isArray(a.tags) ? a.tags.map(t => escXml(t)).join(', ') : '';

  rss += '  <item>\n';
  rss += '    <title>' + title + '</title>\n';
  rss += '    <link>' + url + '</link>\n';
  rss += '    <guid isPermaLink="true">' + url + '</guid>\n';
  rss += '    <pubDate>' + pubDate + '</pubDate>\n';
  rss += '    <source url="' + url + '">' + source + '</source>\n';
  rss += '    <author>' + source + '</author>\n';
  if (tags) rss += '    <category>' + tags.split(', ').join('</category><category>') + '</category>\n';
  if (img) rss += '    <enclosure url="' + img + '" type="image/jpeg" length="0"/>\n';
  rss += '    <description>' + excerpt + '</description>\n';
  rss += '    <content:encoded><![CDATA[' + (a.body || a.excerpt || '') + ']]></content:encoded>\n';
  rss += '  </item>\n';
}

rss += '</channel>\n</rss>\n';
fs.writeFileSync(path.join(ROOT, 'rss.xml'), rss, 'utf-8');
console.log('Written rss.xml with', rssCount, 'articles');

// ========== 7. Clean up unused files ==========
const unusedDirs = [
  path.join(ROOT, 'data', 'articles_db'),
  path.join(ROOT, 'data', 'events'),
  path.join(ROOT, 'data', 'queues'),
  path.join(ROOT, 'data', 'testing-output')
];
for (const dir of unusedDirs) {
  try {
    const contents = fs.readdirSync(dir);
    if (contents.length === 0) {
      fs.rmdirSync(dir);
      console.log('Removed empty dir:', dir);
    } else {
      console.log('Skipping non-empty dir:', dir, '(' + contents.length + ' files)');
    }
  } catch(e) {
    // dir doesn't exist
  }
}

console.log('\n=== Phase 8B cleanup complete ===');
