const https = require('https');
const fs = require('fs');
const path = require('path');

const INDEX_PATH = path.join(__dirname, '..', 'data', 'articles', 'index.json');
const BASE = 'https://td-arabi.com';
const HOST = 'td-arabi.com';
const KEY = '30b3490761e54946bcce8a978d5d218c';
const KEY_LOCATION = 'https://td-arabi.com/30b3490761e54946bcce8a978d5d218c.txt';
const INDEXNOW_URL = 'https://api.indexnow.org/indexnow';
const BATCH_SIZE = 100;

function submitBatch(urls) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls,
    });

    const urlObj = new URL(INDEXNOW_URL);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`  Submitted ${urls.length} URLs -> HTTP ${res.statusCode}`);
          resolve();
        } else {
          console.error(`  FAILED (${res.statusCode}): ${body.slice(0, 200)}`);
          reject(new Error(`IndexNow returned ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
  console.log(`IndexNow: ${index.length} articles loaded`);

  const urls = index.map((a) => `${BASE}/article.html?id=${a.id}`);
  console.log(`Submitting ${urls.length} URLs in batches of ${BATCH_SIZE}...`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    try {
      await submitBatch(batch);
      success += batch.length;
    } catch (e) {
      failed += batch.length;
      console.error(`  Batch ${i / BATCH_SIZE + 1} failed: ${e.message}`);
    }
  }

  if (failed === 0) {
    console.log(`IndexNow: All ${success} URLs submitted successfully`);
    process.exit(0);
  } else {
    console.error(`IndexNow: ${success} OK, ${failed} FAILED`);
    process.exit(1);
  }
})().catch((e) => {
  console.error('IndexNow fatal:', e.message);
  process.exit(1);
});
