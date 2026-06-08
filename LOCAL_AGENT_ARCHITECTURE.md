# Neora X7 Local Agent Client Architecture

This technical design document describes the bidirectional orchestration flow between Neora's Cloud Broker Node and the Python Local PC Desktop Client.

---

## 🛰️ Architecture Diagram
```
  [ Human Text Prompt / Browser Voice Input ] 
              │
              ▼
    [ Neora Cloud Panel (React UI + optional browser speech input) ]
              │ (POST /api/os/command)
              ▼
     [ Gemini LLM Compiler ]
              │ (Resolves human prompt into sequential logical steps JSON)
              ▼
    [ Server Memory Queue / Broker State ] <─── Polling Loop (GET /api/os/poll) ─── [ Local Python Client ]
              │                                                                    │
              │                                                                    ▼
   Updates Visual Screenshots <───── Return Execution Logs & Screen ─── [ Executes OS Operations via PyAutoGUI ]
                                     (POST /api/os/report)
```

---

## ⚡ Primitives and Protocol Spec

The local Python bridge uses polling logic on port `3000` against the local broker server. The current code does not claim to bypass firewall, NAT, or ISP restrictions.

### 🛡️ 1. Authentication Handshake
Every API request from the local agent features an authorization payload containing a unique security token:
```json
{
  "token": "NEORA-X7-AGENT",
  "client_time": "2026-06-07T10:35:00.000Z"
}
```
If the token is invalid, the broker returns `401 Unauthorized`.

---

## 🛠️ Actions Compilation Pipeline

When a prompt like `"Open notepad, write Shukria Printers invoices, then take a screenshot"` is received:

1. **AI Parse Block:** The text prompt is sent to Gemini when configured; otherwise the broker uses a local mock parser fallback. Voice input, when used, is handled in the browser UI before this step.
2. **Translation into low-level JSON steps schema:**
   ```json
   [
     {
       "action": "execute_cmd",
       "param": "notepad"
     },
     {
       "action": "type_text",
       "param": "Invoices processed: #1024, #1025. Email: shukriaprinters@gmail.com"
     },
     {
       "action": "press_key",
       "param": "enter"
     },
     {
       "action": "take_screenshot",
       "param": ""
     }
   ]
   ```
3. **Queueing:** This array is pushed to the server's `queue` state.
4. **Local Poll Fetch:** The local client fetches and locks the task.
5. **Sequential Execution:** The Python script simulates keystrokes or UI system calls step-by-step.
6. **Live Callback Reporting:** The client collects the results, screenshots the desktop, encodes it in Base64 (JPEG-compressed at 70% quality), and uploads it back to the cloud.
7. **UI Render:** The user can inspect the resulting logs and screenshot in the dashboard when the agent reports successfully.
