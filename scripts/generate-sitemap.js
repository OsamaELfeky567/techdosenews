// Kept for auto-publish.yml compatibility: sitemaps now come from build-site.mjs.
const { spawnSync } = require('child_process');
const r = spawnSync('node', [require('path').join(__dirname, 'build-site.mjs'), '--sitemaps-only'], { stdio: 'inherit' });
process.exit(r.status || 0);
