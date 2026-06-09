---
name: Neora AI persona and system prompt
description: Why the system prompt is written a certain way and how to safely edit server.ts Bengali text
---
The buildChatSystemInstruction function in server.ts uses template literals with multi-paragraph Bengali text. The edit tool fails to match it because the tool's internal diff uses byte comparison and multi-byte UTF-8 chars cause mismatches.

**Fix:** Always use Python (bash tool with python3 script) to replace Bengali-containing strings in server.ts. Line-based replacement (split by \n, replace specific lines, rejoin) is the most reliable approach.

**Why the prompt is long:** A short system prompt produces generic, corporate-sounding responses. The Jarvis persona requires explicit rules: answer first, no hollow openers, match register, use "I" naturally. Each rule maps to a specific bad behavior we observed.
