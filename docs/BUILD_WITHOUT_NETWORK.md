# Zero-Network Build Playbook

This project builds in environments with outbound network restrictions (firewall/DNS block). To ensure deterministic, networkless builds:

## 1) Disable Telemetry and Notifiers
Set these env vars for all build steps:
- `NEXT_TELEMETRY_DISABLED=1`
- `NO_UPDATE_NOTIFIER=1`
- `ADBLOCK=1`
- `DISABLE_OPENCOLLECTIVE=1`
- `CI=1`

Optionally run:
```
npx next telemetry disable
```
Note: this writes to the user profile and may not persist in ephemeral CI. Env vars are authoritative.

## 2) Prevent Build-Time Data Fetching
For any page that might trigger SSG/ISR and reach external services:
- Add at top-level of the page file:
  ```ts
  export const dynamic = "force-dynamic";
  // or
  export const revalidate = 0;
  ```
- Avoid performing external `fetch()` during `next build`. Move calls to:
  - Server Actions/Route Handlers executed at runtime, or
  - Client-side effects (on user interaction), or
  - Ensure targets are internal-only services reachable within the build network.

## 3) CI Configuration (GitHub Actions)
Set env globally in the workflow:
```yaml
env:
  NEXT_TELEMETRY_DISABLED: "1"
  NO_UPDATE_NOTIFIER: "1"
  ADBLOCK: "1"
  DISABLE_OPENCOLLECTIVE: "1"
  CI: "true"
```
Call a single entry build script (see `scripts/ci-build.sh`).

## 4) Docker Builds
In your Dockerfile:
```dockerfile
ARG NEXT_TELEMETRY_DISABLED=1
ENV NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED \
    NO_UPDATE_NOTIFIER=1 \
    ADBLOCK=1 \
    DISABLE_OPENCOLLECTIVE=1 \
    CI=1

# then run install + build without network dependency
RUN npx next telemetry disable || true
```

## 5) Whitelist (Optional, Not Recommended)
If policy allows, add `telemetry.nextjs.org` to your firewall allowlist. Prefer zero-network builds for reproducibility.

## 6) Verify
- Ensure the build completes with no outbound connections.
- If the build still fails, scan pages for network calls executed during build and mark them as dynamic.
