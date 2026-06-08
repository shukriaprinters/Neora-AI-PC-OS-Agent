# Neora X7 Local OS Security and Guardrails Model

Executing commands on a local personal computer requires highly stringent safety features to protect user files, configuration structures, and confidential personal data. 

This document describes the multi-tier safety architecture deployed in Neora X7.

---

## 🔒 Security Tiers

```
   [ Level 3: Fail-safe Limits & Visual Gating (PyAutoGUI Native Guardrail) ]
                                    ▲
                                    │
       [ Level 2: Strict Sandbox Verification (Restricted JSON Payload) ]
                                    ▲
                                    │
         [ Level 1: Authentication Lock Ring (Custom Shared Token Key) ]
```

---

## 🛑 Security Tier Details

### Level 1: Custom Verification Key Token
- The local Python script and the cloud backend utilize a shared secret token key (`NEORA-X7-AGENT` by default, customizable in the dashboard Settings).
- Any incoming command pipeline request, health ping, or status report lacking a matching header is immediately rejected at the server level.

### Level 2: Rigid JSON Schemas and Command Filtering
- The system only compiles instructions into a precise, finite list of harmless actions (`open_browser`, `write_file`, `execute_cmd`, `type_text`, `press_key`, `take_screenshot`, `alert_msg`).
- Unlike standard remote desktop utilities, **direct, dangerous raw command execution (like `rm -rf` or file deletions) is blocked** by filtering raw instructions outside the supported schema.

### Level 3: Client-Side Fail-Safe Actions (PyAutoGUI)
- The Python script configures PyAutoGUI's native fail-safe override mechanism on bootstrap:
  ```python
  pyautogui.FAILSAFE = True
  ```
- **Emergency Abort:** If the computer enters an unexpected state, the user can immediately interrupt any ongoing macro execution by simply dragging their physical mouse pointer to any of the four extreme screen corners.

---

## 🛡️ Windows Compatibility
- Command executes are triggered dynamically using Windows' background process context (`subprocess.Popen`).
- Programs run with local user permission constraints, preventing remote exploits from performing global system changes without explicit Windows UAC confirmation.
