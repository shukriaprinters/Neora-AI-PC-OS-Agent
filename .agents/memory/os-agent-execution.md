---
name: OS Agent command execution architecture
description: How OS commands are compiled and executed; what works server-side vs what needs PC agent
---
When a command is submitted to /api/os/command:
1. Gemini (or fallback parser) compiles the prompt into a JSON action plan
2. The plan is pushed to osAgentState.queue
3. setImmediate calls executeOsCommandDirectly() which runs each action server-side
4. Works server-side: write_file (fs.writeFileSync), execute_cmd (child_process.exec), open_browser (xdg-open), alert_msg (notify-send)
5. Needs local PC agent: press_key, type_text (both require xdotool), take_screenshot (requires scrot)
6. The /api/os/poll endpoint is still available for the Python PC agent to pick up pending commands

**Why:** Previously commands were only queued, never executed — status stayed "pending" forever. Now they execute immediately and move to history.
