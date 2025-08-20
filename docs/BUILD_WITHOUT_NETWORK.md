# Zero-Network Build Playbook

This project must build and lint without any outbound network access. Use the provided wrapper to guarantee that all Next.js commands run with telemetry and update notifiers disabled.

## Usage

Update your package.json scripts to use the wrapper:

```json
{
  "scripts": {
    "dev": "node scripts/next-ci.mjs dev",
    "build": "node scripts/next-ci.mjs build",
    "start": "node scripts/next-ci.mjs start",
    "lint": "node scripts/next-ci.mjs lint",
    "postinstall": "next telemetry disable || true"
  }
}
```

Now all Next CLI invocations (dev/build/lint/start) run with:
- `NEXT_TELEMETRY_DISABLED=1`
- `NO_UPDATE_NOTIFIER=1`
- `ADBLOCK=1`
- `DISABLE_OPENCOLLECTIVE=1`
- `CI=1`
- `npm_config_update_notifier=false`

These prevent any "phoning home" or DNS lookups (e.g., telemetry.nextjs.org).

## CI

In GitHub Actions, set env once and call the build script:
```yaml
env:
  NEXT_TELEMETRY_DISABLED: "1"
  NO_UPDATE_NOTIFIER: "1"
  ADBLOCK: "1"
  DISABLE_OPENCOLLECTIVE: "1"
  CI: "true"
  npm_config_update_notifier: "false"

steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: "20"
      cache: "npm"
  - run: bash scripts/ci-build.sh
```

## Prevent Build-Time Data Fetching

If any page could cause SSG/ISR to fetch external data during `next build`, mark it dynamic:
```ts
export const dynamic = "force-dynamic"; // or
export const revalidate = 0;
```

Keep external fetches at runtime (server actions/route handlers) instead of build time.

## Verify

- `node scripts/next-ci.mjs build` completes without firewall/DNS errors.
- `node scripts/next-ci.mjs lint` also completes without hitting the network.
