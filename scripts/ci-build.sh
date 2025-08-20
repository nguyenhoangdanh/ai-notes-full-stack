#!/usr/bin/env bash
set -euo pipefail

# 1) Hard-disable telemetry / notifiers
export NEXT_TELEMETRY_DISABLED=1
export NO_UPDATE_NOTIFIER=1
export ADBLOCK=1
export DISABLE_OPENCOLLECTIVE=1
export CI=1
export npm_config_update_notifier=false

# Optional: best-effort disable for this environment
npx --yes next telemetry disable || true

# 2) Install deps (use your PM)
if [ -f pnpm-lock.yaml ]; then
  corepack enable || true
  pnpm install --frozen-lockfile
elif [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

# 3) Build and Lint via wrapper (zero-network)
node scripts/next-ci.mjs build
node scripts/next-ci.mjs lint || true