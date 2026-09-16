#!/usr/bin/env bash
# One-time setup on Cloudflare: R2 bucket, D1 database, secret, first deploy.
# Requires: npm install done, `npx wrangler login` done, R2 enabled in the dashboard.
# Safe to re-run: existing resources are reused.
set -euo pipefail
cd "$(dirname "$0")/.."

NAME="$(sed -n 's/^name = "\(.*\)"/\1/p' wrangler.toml | head -1)"
PLACEHOLDER="00000000-0000-0000-0000-000000000000"

echo "## account"
npx wrangler whoami >/dev/null 2>&1 || { echo "Not logged in. Run: npx wrangler login"; exit 1; }

echo "## r2 bucket $NAME"
if ! npx wrangler r2 bucket list 2>/dev/null | grep -qx "name:\s*$NAME" && ! npx wrangler r2 bucket list 2>/dev/null | grep -q "^$NAME\$\|name: *$NAME\$"; then
  npx wrangler r2 bucket create "$NAME" || echo "  (bucket may already exist, continuing)"
else
  echo "  exists"
fi

echo "## d1 database $NAME"
if grep -q "$PLACEHOLDER" wrangler.toml; then
  set +e
  OUT="$(npx wrangler d1 create "$NAME" 2>&1)"
  RC=$?
  set -e
  if [ $RC -ne 0 ]; then
    echo "  create failed or exists, looking up id"
    OUT="$(npx wrangler d1 info "$NAME" 2>&1)"
  fi
  ID="$(printf '%s' "$OUT" | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)"
  [ -n "$ID" ] || { echo "$OUT"; echo "Could not determine database_id"; exit 1; }
  sed -i '' "s/$PLACEHOLDER/$ID/" wrangler.toml
  echo "  database_id = $ID"
else
  echo "  configured"
fi

echo "## migrations"
npx wrangler d1 migrations apply "$NAME" --remote

echo "## secret"
mkdir -p .secrets
if [ ! -s .secrets/app-key ]; then
  openssl rand -hex 24 > .secrets/app-key
  echo "  generated new key"
fi
KEY="$(cat .secrets/app-key)"
printf '%s' "$KEY" | npx wrangler secret put APP_KEY >/dev/null
echo "  APP_KEY set"

echo "## deploy"
DEPLOY_OUT="$(npx wrangler deploy 2>&1 | tee /dev/stderr)"
URL="$(printf '%s' "$DEPLOY_OUT" | grep -oE 'https://[a-z0-9.-]+\.workers\.dev' | head -1)"
if [ -n "$URL" ]; then
  printf '%s' "$URL" > .secrets/app-url
  echo
  echo "================================================================"
  echo "App URL:     $URL"
  echo "Secret link: $URL/#k=$KEY"
  echo "Open the secret link once on every phone/browser that should have access."
  echo "Upload:      node scripts/books.mjs add /path/to/book.mp3 --cover cover.jpg"
  echo "================================================================"
else
  echo "Deploy finished but no workers.dev URL found in output. Set it manually in .secrets/app-url."
fi
