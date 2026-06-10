# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security
- **CRITICAL: Directory traversal bypass fixed** in `server.ts`:
  - `/api/os/browser` previously used `path.resolve(process.cwd(), requestedPath)`, which allowed attackers to read files outside the workspace using `../` or absolute paths.
  - `/api/os/browser/content` had the same flaw for file reads.
  - Replaced with a strict suffix check using `path.sep` so that resolved paths must start with the workspace root followed by a path separator (or equal to it), closing the traversal vector.
- **Unauthenticated memory API removed**:
  - `GET /api/memory`, `POST /api/memory`, and `DELETE /api/memory/:id` previously had no authentication.
  - Added `requireAgentToken` guard to all three routes.
- **Unauthenticated recovery bundle endpoints removed**:
  - `GET /api/recovery/bundle` and `POST /api/recovery/bundle` previously accepted requests without verifying `NEORA_AGENT_TOKEN`.
  - Added `requireAgentToken` guard to both endpoints.

### Bug Fixes
- **TypeScript strict-mode error fixed** in `src/components/ChatView.tsx`:
  - `healthState` was typed as a generic `string` but the JSX used literal type checks against `'healthy'`, `'degraded'`, and `'offline'`.
  - TypeScript 5.4+ strict mode flagged this as a type mismatch (TS2367) because `'healthy'` and `'degraded'` have no overlap.
  - Fixed by removing the unreachable `'degraded'` branch and aligning the runtime value with the typed return.
- **Null dereference in `setStatusEndpoint`**:
  - Several catch blocks in `ChatView.tsx` passed either `NeoraApiError` (when `instanceof` matched) or a plain string to `setStatusEndpoint`.
  - The `NeoraApiError` path could result in `e.endpoint` being `undefined` if `en.