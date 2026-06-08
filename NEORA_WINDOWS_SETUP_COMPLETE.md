# Neora Agent v2 - Complete Windows Setup & Deployment Guide

## Quick Start (5 Minutes)

### Step 1: Prerequisites
- Windows 10/11
- Node.js v18+ (https://nodejs.org)
- Git (https://git-scm.com)
- Microphone

### Step 2: Clone Repository
```bash
git clone https://github.com/shukriaprinters/NEORA-AI-FULL-PC-OS-AGENT.git
cd NEORA-AI-FULL-PC-OS-AGENT
```

### Step 3: Run Neora Agent v2
Double-click: `neora agent v2 run.bat`

---

## Batch Files Guide

### neora agent v2 run.bat
Starts the OS-control voice + text agent

```batch
neora agent v2 run.bat                    # Normal mode
neora agent v2 run.bat --no-confirmation  # No confirmation prompts
neora agent v2 run.bat --dev              # Development mode
neora agent v2 run.bat --port 8000        # Custom port
```

### git to pc.bat
Pulls latest code from GitHub

```batch
git to pc.bat
```

### pc to git.bat
Pushes local changes to GitHub

```batch
pc to git.bat
pc to git.bat "Fixed voice commands"
```

### setup_autostart.bat
Auto-start on Windows boot (requires Admin)

```batch
setup_autostart.bat
```

---

## Voice Commands

```
"Open Chrome"
"Type hello world"
"Go to google.com"
"Take a screenshot"
"Click on button"
"Wait 5 seconds"
```

---

## Configuration

The `.env` file is auto-created with defaults:

```ini
AGENT_PORT=3000
CONFIRMATION_ENABLED=true
DEV_MODE=false
AGENT_VERSION=2.0.0
AGENT_PLATFORM=windows
NODE_ENV=production
```

---

## Global Hotkeys

- `Alt+N` - Start listening
- `Ctrl+Shift+N` - Show/hide window
- `Escape` - Stop command

---

## Troubleshooting

### Node.js not found
1. Download from https://nodejs.org
2. Run installer with "Add to PATH" option
3. Restart system
4. Run batch file again

### Port 3000 in use
```batch
neora agent v2 run.bat --port 8000
```

### Microphone not working
1. Check Windows Privacy > Microphone (enable)
2. Check browser permissions
3. Test in Windows Sound Settings

### Git authentication error
1. Create Personal Access Token: https://github.com/settings/tokens
2. Use token as password when prompted

---

## Development Workflow

1. Pull latest: `git to pc.bat`
2. Make changes in src/ folder
3. Test: `neora agent v2 run.bat --dev`
4. Push: `pc to git.bat "Your message"`

---

## Auto-Start Setup

```batch
# Run as Administrator
setup_autostart.bat

# Verify in Task Manager (Ctrl+Shift+Esc)
# Should see "node.exe" in Processes
```

---

## Project Structure

```
├── neora agent v2 run.bat
├── git to pc.bat
├── pc to git.bat
├── setup_autostart.bat
├── src/
│   ├── server/services/
│   │   ├── voiceCommandParser.ts
│   │   ├── osControlEngine.ts
│   │   ├── confirmationSystem.ts
│   │   └── voiceFeedback.ts
│   ├── components/
│   │   └── OSAgentController.tsx
│   └── electron/
│       ├── main.ts
│       └── preload.ts
├── package.json
├── .env (auto-created)
└── README.md
```

---

## Features

✓ Voice command recognition
✓ Text input support
✓ Real-time feedback (voice + text)
✓ Optional confirmation system
✓ Background service (24/7)
✓ System tray integration
✓ Auto-start on boot
✓ Global hotkeys
✓ Cross-platform (Windows/Mac/Linux)

---

## Repository

- **GitHub:** https://github.com/shukriaprinters/NEORA-AI-FULL-PC-OS-AGENT
- **Branch:** main
- **License:** Open Source

---

For detailed documentation, see:
- `OS_CONTROL_AGENT_GUIDE.md` - Full command reference
- `OS_AGENT_DEPLOYMENT.md` - Advanced setup
- `OS_AGENT_FINAL_SUMMARY.md` - Technical overview
