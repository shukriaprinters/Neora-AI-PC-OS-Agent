# Neora AI PC OS Agent

This repository contains a web dashboard and a Python desktop agent that work together to execute local OS automation tasks.

- `server.ts` exposes the control API and dashboard backend.
- `neora_agent.py` polls the broker and executes local actions.
- The launcher scripts start, stop, and inspect both pieces locally.

## Run Locally

**Prerequisites:** Node.js and Python 3

1. Install dependencies:
   `npm install`
2. Set the required env vars in [.env.local](.env.local) or your shell:
   `GEMINI_API_KEY`, `NEORA_AGENT_TOKEN`, and optionally `NEORA_HEADLESS`
3. Run the dashboard/server:
   `npm run dev`

## Neora Agent Controls

**Prerequisites:** Python 3, Node.js, and `npm install` already completed.

- Start server and agent together:
  `powershell -ExecutionPolicy Bypass -File .\start-neora.ps1`
- Start menu wrapper:
  `neora-menu.bat`
- Start server only:
  `start-server.bat`
- Start headless agent only:
  `powershell -ExecutionPolicy Bypass -File .\start-agent.ps1`
- Check status:
  `powershell -ExecutionPolicy Bypass -File .\status-neora.ps1`
- Stop Neora processes:
  `powershell -ExecutionPolicy Bypass -File .\stop-neora.ps1`

### Environment

- `NEORA_AGENT_TOKEN` controls the shared agent/server token.
- `NEORA_HEADLESS=1` disables GUI automation for safer runs.
- `NEORA_BROKER_URL=http://127.0.0.1:3000` points the desktop agent at the local broker.
- `NEORA_COOKIE` is optional and only needed if authenticated polling is required.

## End-to-End Test Checklist

Use these commands to verify the full flow:

1. `npm run dev`
2. `powershell -ExecutionPolicy Bypass -File .\start-neora.ps1`
3. `powershell -ExecutionPolicy Bypass -File .\status-neora.ps1`
4. In `PC OS Agent`, test:
   - `open notepad`
   - `open calculator`
   - `open chrome and go to github`
   - `নোটপ্যাড খুলে মেমো লিখো`
5. In `Chat`, test:
   - `open https://example.com`
   - `take a screenshot`
   - a normal chat sentence
6. Check the history legend:
   - `os-command`
   - `chat`
   - `rejected`
