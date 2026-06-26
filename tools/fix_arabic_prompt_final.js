const http = require('http');
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5YzYwN2ZlMC0xMDE4LTQwYzAtOGZiNy1mMThmMmMyZWEyZTYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZDYyNGE1MGMtNWRiYS00YTE3LWEyYzAtYjFmZDMzN2RkMWFmIiwiaWF0IjoxNzc5MTM2NzAyfQ.x3FzQQXVM7ZYKwTkxCjEe2YZBv9knDhLA4KjgYmPAJs';
const API = 'http://localhost:5678/api/v1';
function get(url) { return new Promise((r,j) => { http.get(url, { headers: { 'X-N8N-API-KEY': key } }, (res) => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{if(res.statusCode<300) r(JSON.parse(d)); else j(d.slice(0,500));}); }); }); }
function put(url, data) { return new Promise((resolve, reject) => { const s = JSON.stringify(data); const req = http.request(url, { method: 'PUT', headers: { 'X-N8N-API-KEY': key, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(s) } }, (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => { if (res.statusCode < 300) resolve(JSON.parse(d)); else reject(new Error(res.statusCode + ': ' + d.slice(0,500))); }); }); req.on('error', reject); req.write(s); req.end(); }); }

const TP_LINES = [
  'You are a professional Arabic technology news editor for "TD بالعربي" news website.',
  'Your job: Translate and rewrite English tech news into professional modern journalistic Arabic.',
  '',
  'Strict rules:',
  '- Write 350-450 Arabic words',
  '- Use natural journalistic Arabic style — not literal translation',
  '- Keep product/company names in English (Google, iPhone, AI, ChatGPT, NVIDIA)',
  '- No markdown, no HTML formatting',
  '- Never mention you are AI or that this was translated',
  '- Do NOT add opinions or analysis not in the original',
  '- Start with a strong news opener (ex: \u0641\u064a \u062a\u0637\u0648\u0631 \u062c\u062f\u064a\u062f, \u0643\u0634\u0641\u062a \u0634\u0631\u0643\u0629, \u0623\u0639\u0644\u0646\u062a...)',
  '- Use SHORT paragraphs (2-4 sentences max per paragraph)',
  '- Include one H2-style section heading naturally in the text',
  '- End with a forward-looking conclusion',
  '- Avoid unnecessary foreign words — use Arabic equivalents where possible',
  '- No broken encoding, no non-Arabic characters in Arabic text',
  '- Arabic ratio in title must exceed 90%',
  '',
  'Output ONLY valid JSON with these exact fields:',
  '{',
  '  "title_ar": "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0628\u0627\u0644\u0639\u0631\u0628\u064a\u0629 (50-60 chars exactly — catchy journalistic title)",',
  '  "excerpt": "\u0645\u0644\u062e\u0635 \u0627\u0644\u062e\u0628\u0631 \u0628\u0627\u0644\u0639\u0631\u0628\u064a\u0629 (140-160 chars exactly)",',
  '  "body": "\u0646\u0635 \u0627\u0644\u0645\u0642\u0627\u0644 \u0627\u0644\u0643\u0627\u0645\u0644 (350-450 Arabic words, short paragraphs)",',
  '  "telegram_summary": "\u0645\u0644\u062e\u0635 \u062a\u064a\u0644\u064a\u062c\u0631\u0627\u0645 (100-120 chars)",',
  '  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]',
  '}',
  '',
  'Critical:',
  '- title_ar: 50-60 chars — compelling Arabic headline',
  '- excerpt: 140-160 chars — one-sentence summary',
  '- body: minimum 350 Arabic words, short paragraphs, journalistic style',
  '- tags: 3-6 items (company names in English, concepts in Arabic)',
  '- Do NOT include a "category" field',
  '- If generated title has less than 90% Arabic characters, rewrite it'
];

const RP_LINES = [
  'You are a professional Arabic technology news editor for "TD بالعربي" news website.',
  'Your job: Rewrite and improve this Arabic tech news article in a more engaging journalistic style.',
  '',
  'Strict rules:',
  '- Write 350-450 Arabic words',
  '- Use natural journalistic Arabic — clear, smooth, professional',
  '- Keep product/company names in English',
  '- No markdown, no HTML',
  '- Improve clarity and flow while keeping all facts accurate',
  '- Add useful context where helpful',
  '- Start with a strong news opener',
  '- Use SHORT paragraphs (2-4 sentences max per paragraph)',
  '- Include one H2-style section heading naturally in the text',
  '- End with a forward-looking conclusion',
  '- Avoid unnecessary foreign words',
  '- Avoid literal/stiff translations',
  '',
  'Output ONLY valid JSON:',
  '{',
  '  "title_ar": "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 (50-60 chars)",',
  '  "excerpt": "\u0627\u0644\u0645\u0644\u062e\u0635 (140-160 chars)",',
  '  "body": "\u0627\u0644\u0646\u0635 \u0627\u0644\u0643\u0627\u0645\u0644 (350-450 words, short paragraphs)",',
  '  "telegram_summary": "\u0645\u0644\u062e\u0635 \u062a\u064a\u0644\u064a\u062c\u0631\u0627\u0645 (100-120 chars)",',
  '  "tags": ["tag1", "tag2", "tag3"]',
  '}',
  'Do not include "category" field',
  'Arabic ratio in title must exceed 90%'
];

const NEW_TP = TP_LINES.join("\\n");
const NEW_RP = RP_LINES.join("\\n");

async function main() {
  console.log('Fetching workflow...');
  const wf = await get(API + '/workflows/9YULEXSG9gEtoqr2');
  console.log('Workflow: ' + wf.name + ' v' + wf.versionId);

  const aiNode = wf.nodes.find(n => n.name === 'AI Processor');
  if (!aiNode) { console.log('ERROR: AI Processor node not found'); process.exit(1); }

  let code = aiNode.parameters.jsCode;

  // Find TRANSLATE_PROMPT: match from 'const TRANSLATE_PROMPT = \'' to closing '\''
  const tpStart = code.indexOf("const TRANSLATE_PROMPT = '");
  if (tpStart === -1) { console.log('ERROR: TRANSLATE_PROMPT not found'); process.exit(1); }
  const tpBodyStart = tpStart + "const TRANSLATE_PROMPT = '".length;
  let tpEnd = tpBodyStart;
  while (tpEnd < code.length) {
    if (code[tpEnd] === "'" && code[tpEnd+1] === ";") break;
    tpEnd++;
  }
  if (tpEnd >= code.length) { console.log('ERROR: TRANSLATE_PROMPT closing not found'); process.exit(1); }
  const oldTP = code.substring(tpStart, tpEnd + 2);
  const newTPStr = "const TRANSLATE_PROMPT = '" + NEW_TP.replace(/'/g, "\\'") + "';";
  code = code.replace(oldTP, newTPStr);
  console.log('TRANSLATE_PROMPT replaced (len=' + NEW_TP.length + ')');

  // Find REWRITE_PROMPT: match from 'const REWRITE_PROMPT = \'' to closing '\''
  const rpStart = code.indexOf("const REWRITE_PROMPT = '");
  if (rpStart === -1) { console.log('ERROR: REWRITE_PROMPT not found'); process.exit(1); }
  const rpBodyStart = rpStart + "const REWRITE_PROMPT = '".length;
  let rpEnd = rpBodyStart;
  while (rpEnd < code.length) {
    if (code[rpEnd] === "'" && code[rpEnd+1] === ";") break;
    rpEnd++;
  }
  if (rpEnd >= code.length) { console.log('ERROR: REWRITE_PROMPT closing not found'); process.exit(1); }
  const oldRP = code.substring(rpStart, rpEnd + 2);
  const newRPStr = "const REWRITE_PROMPT = '" + NEW_RP.replace(/'/g, "\\'") + "';";
  code = code.replace(oldRP, newRPStr);
  console.log('REWRITE_PROMPT replaced (len=' + NEW_RP.length + ')');

  // Update isArabicContent to >90%
  code = code.replace(
    'return arabic / chars.length > 0.5 && other / chars.length < 0.1 && latin / chars.length < 0.2;',
    'return arabic / chars.length > 0.9;'
  );
  console.log('isArabicContent threshold: 50% -> 90%');

  aiNode.parameters.jsCode = code;

  const update = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings || {},
    staticData: wf.staticData || null
  };
  const result = await put(API + '/workflows/9YULEXSG9gEtoqr2', update);
  console.log('Pushed! Version: ' + result.versionId);

  const verify = await get(API + '/workflows/9YULEXSG9gEtoqr2');
  const vAI = verify.nodes.find(n => n.name === 'AI Processor').parameters.jsCode;
  console.log('90% threshold: ' + (vAI.includes('> 0.9')));
  console.log('SHORT paragraphs: ' + (vAI.includes('SHORT paragraphs') ? 'yes' : 'no'));
  console.log('natural Arabic: ' + (vAI.includes('natural journalistic Arabic') ? 'yes' : 'no'));
  console.log('90% in title: ' + (vAI.includes('90% Arabic') ? 'yes' : 'no'));
}
main().catch(e => console.log('FATAL: ' + e.message));
