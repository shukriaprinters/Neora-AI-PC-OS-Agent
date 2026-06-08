# Neora OS Control Agent - Complete Setup & Usage Guide

## Overview

Neora OS Control Agent is an advanced voice and text-driven automation system that listens to your commands and performs tasks on your local PC like a human user would. It opens software, clicks buttons, types text, and navigates applications automatically.

### Key Features

- **Voice Command Recognition**: Speak commands naturally (e.g., "open Chrome", "type my email")
- **Text Input Support**: Type commands directly if voice isn't available
- **Real-time Feedback**: Hears back what the agent understands and does
- **Optional Confirmation**: Ask for approval before executing risky commands
- **Background Service**: Runs always-on in the system tray
- **Auto-start on Boot**: Starts automatically when your PC boots
- **Global Hotkeys**: Control the agent from anywhere (Alt+N, Ctrl+Shift+N)
- **Safety System**: Prevents accidental deletions, shutdowns, and risky operations

---

## Installation & Setup

### System Requirements

- Windows 10/11, macOS 10.13+, or Linux (Ubuntu 18.04+)
- Node.js 16+ and npm
- 4GB RAM minimum
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Microphone for voice input

### Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/shukriaprinters/Neora-AI-PC-OS-Agent.git
cd Neora-AI-PC-OS-Agent

# Switch to the neural-os-agent branch
git checkout neural-os-agent

# Install dependencies
npm install
```

### Step 2: Build the Electron App

```bash
# Build the frontend
npm run build

# Build the Electron app (creates executable)
npm run electron:build
```

This creates a standalone executable in the `dist` folder.

### Step 3: Initial Configuration

1. Open the Neora application
2. Go to Settings (gear icon)
3. Enable "Run on startup" to auto-start with your PC
4. Configure voice settings (language, speed, volume)
5. Choose confirmation mode (Always, Only Risky, Never)

---

## Voice Commands - Full Reference

### Application Control

```
"Open Chrome"           → Launches Google Chrome
"Launch Notepad"        → Opens Notepad
"Close Spotify"         → Closes Spotify application
"Exit Firefox"          → Closes Firefox
"Start Visual Studio Code" → Launches VS Code
```

### Text Input

```
"Type Hello World"      → Types "Hello World"
"Write my email"        → Types "my email"
"Enter password123"     → Types "password123"
```

### Navigation

```
"Go to Google.com"      → Opens Google in browser
"Navigate to YouTube"   → Opens YouTube
"Visit Stack Overflow"  → Opens Stack Overflow
"Open github.com"       → Opens GitHub
```

### System Actions

```
"Take a screenshot"     → Captures the screen
"Click on button"       → Clicks on an element
"Click the submit link"  → Clicks a link
"Wait 5 seconds"        → Pauses for 5 seconds
"Pause for 2 minutes"   → Waits 2 minutes
```

### Advanced Commands

```
"Open calculator and add 5 plus 3"
"Launch Chrome and go to Gmail"
"Type a new message then send it"
"Open notepad, write a poem, save it"
```

---

## Hotkeys & Shortcuts

| Hotkey | Action |
|--------|--------|
| **Alt + N** | Toggle voice listening on/off (global) |
| **Ctrl + Shift + N** | Show/focus Neora window |
| **Escape** | Stop current command execution |
| **Enter** (in text field) | Submit text command |

---

## Confirmation System

### Understanding Confirmation

When you give a command that requires confirmation, Neora will:

1. **Announce** what it understood: "I understood: Delete file.txt. Confidence: 95%"
2. **Ask for approval**: "Do you want me to do this?"
3. **Wait for response**: You have 5-30 seconds to respond
4. **Show confirmation dialog** with Yes/No buttons
5. **Execute only** if you confirm

### High-Risk Commands (Always Require Confirmation)

- Deleting files
- System shutdown/restart
- Accessing system applications (CMD, PowerShell, Registry)
- Typing passwords or sensitive data
- Uninstalling applications

### Medium-Risk Commands (Confirmable)

- Installing software
- Downloading files
- Opening sensitive applications
- Network operations

### Low-Risk Commands (Auto-execute)

- Opening browsers/applications
- Typing regular text
- Navigation
- Screenshots

### Toggling Confirmation

In Settings:
- **Always Ask**: Every command requires confirmation
- **Smart Mode**: Only risky commands need confirmation
- **Never Ask**: No confirmation (use with caution!)

---

## Voice Response & Feedback

### What Neora Says Back

Neora provides voice feedback for every action:

```
Command: "Open Chrome"
Agent:   "I understood: Open Chrome. Confidence: 95%"
Agent:   "Executing command. This should take about 3 seconds."
Agent:   "Chrome is now opening..."
Agent:   "Command executed successfully"
```

### Feedback Types

- **Input Feedback**: Confirms what it heard
- **Execution Feedback**: Tells you what it's doing
- **Confirmation Request**: Asks for approval
- **Success Message**: Action completed
- **Error Messages**: Something went wrong

### Voice Settings

In Settings > Voice:
- **Enable/Disable**: Toggle voice feedback on/off
- **Voice Speed**: Slow (0.5x), Normal (1.0x), Fast (1.5x)
- **Voice Volume**: 0-100% (or match system volume)
- **Voice Language**: English, Spanish, French, German, etc.

---

## Confirmation Dialog

When a command requires confirmation:

```
┌─────────────────────────────────────┐
│  Do you want me to open Chrome?     │
│  Responding in 5 seconds...         │
├─────────────────────────────────────┤
│ [Yes, Proceed] [Cancel]             │
└─────────────────────────────────────┘
```

Click **Yes, Proceed** to execute, or **Cancel** to skip.

---

## Settings & Configuration

### Voice Settings
- Language detection
- Speech recognition language
- TTS voice selection
- Speed (0.5x - 2.0x)
- Volume (0-100%)

### Safety Settings
- Confirmation mode
- Risk level (Low, Medium, High)
- Command whitelist
- Blocked commands
- Auto-approval timeout

### System Settings
- Run on startup
- Start minimized
- Auto-hide to tray
- Hotkey assignments
- Logging level

### Advanced Settings
- Command history (enable/disable)
- Feedback history size
- API key management (for cloud features)
- Network access permissions
- Debug mode

---

## Troubleshooting

### Microphone Not Working

```
Problem: "Listening..." shows but no voice detected
Solution:
1. Check Windows/Mac/Linux mic settings
2. Allow Neora app microphone access
3. Test mic with system audio settings
4. Restart the app
```

### Voice Not Playing

```
Problem: No voice feedback heard
Solution:
1. Check volume settings (Settings > Voice)
2. Ensure speakers are connected
3. Check system volume is not muted
4. Test audio with another application
5. Reinstall audio drivers
```

### Command Not Recognized

```
Problem: Says "Could not parse command"
Solution:
1. Speak more clearly and slowly
2. Use exact command phrases from reference
3. Try typing the command instead
4. Check language setting matches your speech
5. Check microphone isn't picking up background noise
```

### Confirmation Timeout

```
Problem: "You have 5 seconds" countdown, then auto-cancels
Solution:
1. Speak or click response button faster
2. Increase timeout in Settings
3. Use text response instead of voice
```

### App Won't Auto-start

```
Problem: Neora doesn't start with Windows/Mac
Solution:
1. Go to Settings and enable "Run on startup"
2. Check Task Scheduler (Windows) or Login Items (Mac)
3. Verify file permissions
4. Try "Run as Administrator" (Windows)
```

---

## Advanced Usage

### Chaining Commands

```
"Open Chrome, go to Gmail, type a new email to john@example.com"
```

Neora executes multiple steps in sequence with automatic waits between actions.

### Conditional Execution

```
"If it's before 5 PM, open Slack, else open mail"
```

Simple conditional logic based on time or application state.

### Custom Commands

Create custom command macros in Settings:

```
Macro: "standup"
Action: 
  1. Open Teams
  2. Click on Standup channel
  3. Type "Good morning team"
  4. Wait 2 seconds
```

### Workflow Automation

Build multi-step workflows:

```
Workflow: "Daily Checklist"
1. Open project management tool
2. Create today's task list
3. Send status update to team
4. Schedule meetings
```

---

## Safety & Security

### What Neora Can Access

- ✅ Local applications
- ✅ File system (with confirmation)
- ✅ Web browsers
- ✅ System peripherals
- ❌ Network services
- ❌ Cloud accounts
- ❌ Private data

### Safety Rules

1. **Never stores passwords**: Confirmation system prevents typing passwords
2. **Local only**: No data sent to servers (optional)
3. **User approval**: High-risk actions require explicit confirmation
4. **Sandboxed execution**: Blocked from system core files
5. **Audit trail**: Complete history of all commands

### Blocking Commands

In Settings > Safety:
- Block specific applications
- Block file operations
- Block system commands
- Block network access
- Custom blacklist

---

## FAQ

### Q: Can Neora be used remotely?
A: No, Neora is designed for local PC control only. It cannot be accessed remotely for security reasons.

### Q: Will Neora accidentally execute commands?
A: No, the confirmation system prevents accidental actions. High-risk commands always require approval.

### Q: Can I disable voice feedback?
A: Yes, toggle "Voice Enabled" in Settings. Text feedback is always shown.

### Q: What languages does Neora support?
A: English, Spanish, French, German, Italian, Portuguese, Russian, Chinese (Mandarin).

### Q: Does Neora store my commands?
A: Locally only (configurable). No cloud backup unless you enable sync.

### Q: Can I use Neora without a microphone?
A: Yes, type commands directly in the text input field.

---

## Keyboard Shortcuts in Agent

| Key | Action |
|-----|--------|
| **Ctrl+L** | Clear feedback history |
| **Ctrl+S** | Save command as favorite |
| **Ctrl+H** | Show command history |
| **Ctrl+,** | Open settings |
| **Ctrl+?** | Show help |

---

## Performance & System Impact

- **Idle CPU**: <2% when not processing
- **Memory**: 80-150 MB
- **Disk**: 200 MB installation
- **Network**: 0 MB/hour (local only)
- **Battery (laptop)**: Minimal impact (5-10% per hour with active listening)

---

## Uninstallation

### Windows

```bash
# Uninstall via Control Panel or:
msiexec /x {ProductCode}

# Or delete installation folder manually
```

### macOS

```bash
# Drag app to Trash from Applications folder
# Or use:
rm -rf /Applications/Neora.app
```

### Linux

```bash
# Remove installed package
sudo apt-get remove neora-os-agent
# Or delete manually:
rm -rf ~/.local/share/neora
```

---

## Support & Resources

- **Issues**: GitHub Issues on repository
- **Documentation**: Full docs at /docs folder
- **Community**: GitHub Discussions
- **Email**: support@neora.local (local support only)

---

## License & Attribution

Neora OS Agent is open-source and community-driven. See LICENSE file for details.

**Created by**: Shukria Printers
**Latest Version**: 2.0.0
**Last Updated**: June 2024

---

## Version History

### v2.0.0 (Current)
- Full OS control with mouse/keyboard automation
- Advanced voice recognition
- Confirmation system with safety rules
- Electron desktop app with system tray
- Global hotkeys
- Text-to-speech feedback
- Workflow automation
- Setting profiles

### v1.0.0 (Legacy)
- Web-based interface
- Basic voice commands
- Limited OS integration

