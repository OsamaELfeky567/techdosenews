// Single source of truth for article URLs: /news/<english-slug>-<shortid>/
export const BASE = 'https://td-arabi.com';
export const slugify = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/g, '');
export const shortId = id => String(id).split('-').pop();
export const articlePath = a => `/news/${slugify(a.seo_slug) || 'article'}-${shortId(a.id)}/`;
export const articleUrl = a => BASE + articlePath(a);
