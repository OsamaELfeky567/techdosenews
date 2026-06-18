/**
 * TDN GitHub Proxy Server
 *
 * Replaces direct PAT usage in the Admin Panel with a backend proxy.
 * Supports both GitHub App and PAT authentication.
 *
 * Usage:
 *   export GH_TOKEN=ghp_xxx
 *   node server/gh-proxy.mjs
 *
 * Or for GitHub App:
 *   export GITHUB_APP_ID=123456
 *   export GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
 *   export GITHUB_INSTALLATION_ID=789012
 *   node server/gh-proxy.mjs
 */

import { createServer } from 'node:http';
import { request as httpsRequest } from 'node:https';

const PORT = process.env.PORT || 3001;
const GH_OWNER = process.env.GH_OWNER || 'osamaelfeky567';
const GH_REPO = process.env.GH_REPO || 'techdosenews';
const GH_TOKEN = process.env.GH_TOKEN || '';

function getAuthHeaders() {
  if (GH_TOKEN) {
    return { 'Authorization': `Bearer ${GH_TOKEN}` };
  }
  return {};
}

function ghApiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      method,
      hostname: 'api.github.com',
      path: `/repos/${GH_OWNER}/${GH_REPO}/contents/${path}`,
      headers: {
        ...getAuthHeaders(),
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'tdn-gh-proxy',
        'Content-Type': 'application/json'
      }
    };
    const bodyStr = body ? JSON.stringify(body) : null;
    if (bodyStr) {
      opts.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }
    const req = httpsRequest(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function ghFetchSha(path) {
  const result = await ghApiRequest('GET', path);
  if (result.status === 200 && result.body?.sha) {
    return result.body.sha;
  }
  return null;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
}

createServer(async (req, res) => {
  const writeJson = (status, data) => {
    res.writeHead(status, corsHeaders());
    res.end(JSON.stringify(data));
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    writeJson(405, { error: 'Method not allowed' });
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const { action, path, content, message, sha } = JSON.parse(body);

      if (!path) {
        writeJson(400, { error: 'path is required' });
        return;
      }

      // Auto-fetch SHA for existing files (so admin doesn't need to manage it)
      let effectiveSha = sha;
      if ((action === 'put-content' || action === 'put-binary' || action === 'delete') && !effectiveSha) {
        effectiveSha = await ghFetchSha(path);
      }

      let result;
      switch (action) {
        case 'put-content':
          result = await ghApiRequest('PUT', path, {
            message: message || 'Update from admin panel',
            content,
            sha: effectiveSha || ''
          });
          break;

        case 'put-binary':
          result = await ghApiRequest('PUT', path, {
            message: message || 'Upload from admin panel',
            content,
            sha: effectiveSha || ''
          });
          break;

        case 'delete':
          if (!effectiveSha) {
            writeJson(400, { error: 'sha is required for delete' });
            return;
          }
          result = await ghApiRequest('DELETE', path, {
            message: message || 'Delete from admin panel',
            sha: effectiveSha
          });
          break;

        case 'get':
          result = await ghApiRequest('GET', path);
          break;

        default:
          writeJson(400, { error: `Unknown action: ${action}` });
          return;
      }

      writeJson(result.status, {
        success: result.status >= 200 && result.status < 300,
        data: result.body,
        sha: result.body?.content?.sha || null
      });
    } catch (e) {
      writeJson(500, { error: e.message });
    }
  });
}).listen(PORT, () => {
  console.log(`TDN GH Proxy running on http://localhost:${PORT}`);
  console.log(`Proxying: https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/*`);
  console.log(`Auth: ${GH_TOKEN ? 'PAT configured' : 'NO AUTH (reads only)'}`);
});
