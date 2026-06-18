/**
 * TDN GitHub Proxy Server
 *
 * Authenticates exclusively via GitHub App (no PAT fallback).
 *
 * Usage:
 *   export GITHUB_APP_ID=4083931
 *   export GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
 *   export GITHUB_INSTALLATION_ID=141059355
 *   node server/gh-proxy.mjs
 */

import { createServer } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';

const PORT = process.env.PORT || 3001;
const GH_OWNER = process.env.GH_OWNER || 'osamaelfeky567';
const GH_REPO = process.env.GH_REPO || 'techdosenews';

// GitHub App credentials
const GITHUB_APP_ID = process.env.GITHUB_APP_ID || '';
let GITHUB_APP_PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY || '';
const GITHUB_INSTALLATION_ID = process.env.GITHUB_INSTALLATION_ID || '';

// Support loading private key from file (avoids env var newline issues)
const PRIVATE_KEY_PATH = process.env.GITHUB_APP_PRIVATE_KEY_PATH || '';
if (!GITHUB_APP_PRIVATE_KEY && PRIVATE_KEY_PATH) {
  try { GITHUB_APP_PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH, 'utf-8'); } catch {}
}

// Auto-discover installation ID if not set
const AUTO_DISCOVER = process.env.GITHUB_APP_AUTO_DISCOVER || 'false';

// Cached installation token
let cachedToken = null;
let tokenExpiry = 0;

function generateJWT() {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60,
    exp: now + 600,
    iss: GITHUB_APP_ID
  };
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sign = createSign('RSA-SHA256');
  sign.update(header + '.' + body);
  const signature = sign.sign(GITHUB_APP_PRIVATE_KEY, 'base64url');
  return header + '.' + body + '.' + signature;
}

function getInstallationToken() {
  return new Promise((resolve, reject) => {
    const jwt = generateJWT();
    const postData = JSON.stringify({});
    const opts = {
      method: 'POST',
      hostname: 'api.github.com',
      path: `/app/installations/${GITHUB_INSTALLATION_ID}/access_tokens`,
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'tdn-gh-proxy',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const req = httpsRequest(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 201 && parsed.token) {
            resolve(parsed.token);
          } else {
            reject(new Error(`Token exchange failed: ${res.statusCode} ${parsed.message || ''}`));
          }
        } catch {
          reject(new Error(`Token exchange parse error: ${data.substring(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function getAuthToken() {
  // Try GitHub App first
  if (GITHUB_APP_ID && GITHUB_APP_PRIVATE_KEY && GITHUB_INSTALLATION_ID) {
    const now = Date.now();
    if (cachedToken && now < tokenExpiry) {
      return cachedToken;
    }
    const token = await getInstallationToken();
    cachedToken = token;
    tokenExpiry = now + 50 * 60 * 1000;
    return token;
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

function ghApiRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const opts = {
      method,
      hostname: 'api.github.com',
      path: `/repos/${GH_OWNER}/${GH_REPO}/contents/${path}`,
      headers: {
        'Authorization': `Bearer ${token}`,
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

async function ghFetchSha(path, token) {
  const result = await ghApiRequest('GET', path, null, token);
  if (result.status === 200 && result.body?.sha) {
    return result.body.sha;
  }
  return null;
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

      let token;
      try {
        token = await getAuthToken();
      } catch (e) {
        writeJson(500, { error: 'Auth failed: ' + e.message });
        return;
      }
      if (!token) {
        writeJson(401, { error: 'No authentication configured. Set GITHUB_APP_ID + GITHUB_APP_PRIVATE_KEY + GITHUB_INSTALLATION_ID.' });
        return;
      }

      let effectiveSha = sha;
      if ((action === 'put-content' || action === 'put-binary' || action === 'delete') && !effectiveSha) {
        effectiveSha = await ghFetchSha(path, token);
      }

      let result;
      switch (action) {
        case 'put-content':
          result = await ghApiRequest('PUT', path, {
            message: message || 'Update from admin panel',
            content,
            sha: effectiveSha || ''
          }, token);
          break;

        case 'put-binary':
          result = await ghApiRequest('PUT', path, {
            message: message || 'Upload from admin panel',
            content,
            sha: effectiveSha || ''
          }, token);
          break;

        case 'delete':
          if (!effectiveSha) {
            writeJson(400, { error: 'sha is required for delete' });
            return;
          }
          result = await ghApiRequest('DELETE', path, {
            message: message || 'Delete from admin panel',
            sha: effectiveSha
          }, token);
          break;

        case 'get':
          result = await ghApiRequest('GET', path, null, token);
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
  const authMethod = GITHUB_APP_ID ? 'GitHub App' : 'NO AUTH';
  console.log(`TDN GH Proxy running on http://localhost:${PORT}`);
  console.log(`Proxying: https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/*`);
  console.log(`Auth: ${authMethod}`);
});
