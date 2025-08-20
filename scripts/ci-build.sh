#!/usr/bin/env bash
set -euo pipefail

# 1) Hard-disable all telemetry / notifiers during build
export NEXT_TELEMETRY_DISABLED=1
export NO_UPDATE_NOTIFIER=1
export ADBLOCK=1
export DISABLE_OPENCOLLECTIVE=1
export CI=1

# Optional: disable Next telemetry in this environment (best-effort)
npx --yes next telemetry disable || true

# 2) Install deps (ensure offline cache already present in CI)
# Replace with your package manager if needed
if [ -f pnpm-lock.yaml ]; then
  corepack enable || true
  pnpm install --frozen-lockfile
elif [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

# 3) Build frontend (Next.js) - assumes root is the frontend
# If your frontend is in a subdir, cd into it first.
NEXT_TELEMETRY_DISABLED=1 npm run build