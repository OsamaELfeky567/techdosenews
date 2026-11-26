#!/bin/bash
# Deploys td-tools-bots and (re)points each bot's webhook. Tokens come from /tmp/tok/<key> (never committed).
cd /tmp/r2/toolbots
export CLOUDFLARE_API_TOKEN=$(cat /home/sandbox/.vault/cloudflare-api-token-td-bot-e43d1e/password)
[ -f /tmp/tok/hook ] || head -c 24 /dev/urandom | base64 | tr -dc 'a-z0-9' | head -c 24 > /tmp/tok/hook
HOOK=$(cat /tmp/tok/hook)
python3 - <<PY
import json,os
d={k:open(f'/tmp/tok/{k}').read().strip() for k in ['removebg','ocr','compress','img2pdf','merge','split','qr'] if os.path.exists(f'/tmp/tok/{k}')}
open('/tmp/tok/tokens.json','w').write(json.dumps(d))
print(list(d))
PY
npx --yes wrangler@3 deploy 2>&1 | grep -iE "deployed|https|error" | head -5
npx --yes wrangler@3 secret put TOKENS < /tmp/tok/tokens.json 2>&1 | tail -1
npx --yes wrangler@3 secret put HOOK < /tmp/tok/hook 2>&1 | tail -1
cat /home/sandbox/.vault/telegram-bot-token-new-4e2dc3/password | npx --yes wrangler@3 secret put CHECK_TOKEN 2>&1 | tail -1
for k in $(python3 -c "import json;print(' '.join(json.load(open('/tmp/tok/tokens.json'))))"); do
  curl -s "https://api.telegram.org/bot$(cat /tmp/tok/$k)/setWebhook" --data-urlencode "url=https://td-tools-bots.td-arabi.workers.dev/h/$k/$HOOK" --data-urlencode 'allowed_updates=["message","callback_query"]' | jq -c "{k:\"$k\",ok}"
done
