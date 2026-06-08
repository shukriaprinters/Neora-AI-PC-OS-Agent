# Neora OS Agent - Deployment & Testing Guide

## Quick Start (5 Minutes)

### 1. Development Mode

```bash
# Clone and setup
git clone https://github.com/shukriaprinters/Neora-AI-PC-OS-Agent.git
cd Neora-AI-PC-OS-Agent
git checkout neural-os-agent
npm install

# Start development server
npm run dev

# In another terminal, start Electron app
npm run electron:dev

# Access at http://localhost:3000
```

### 2. Build for Your OS

```bash
# Windows
npm run electron:build -- --win

# macOS
npm run electron:build -- --mac

# Linux
npm run electron:build -- --linux
```

The installer will be in `dist/` folder.

---

## Architecture Overview

```
Neora OS Agent
├── Frontend (React)
│   ├── OSAgentController.tsx (Voice/Text UI)
│   ├── Voice input (Web Speech API)
│   └── Real-time feedback display
├── Backend (Express + Node.js)
│   ├── voiceCommandParser.ts (Parse natural language)
│   ├── osControlEngine.ts (Mouse/Keyboard automation)
│   ├── confirmationSystem.ts (Safety & approval)
│   └── voiceFeedback.ts (Text-to-speech)
├── Desktop (Electron)
│   ├── main.ts (Window management, IPC)
│   ├── preload.ts (Secure communication)
│   └── System tray integration
└── Data Layer
    ├── SQLite database (command history)
    └── Configuration files
```

---

## Testing Checklist

### Unit Tests

```bash
# Test voice command parser
npm test -- voiceCommandParser.test.ts

# Expected outcomes:
✓ Parses "open chrome" command
✓ Handles application aliases (chrome → Google Chrome)
✓ Extracts parameters from complex commands
✓ Returns confidence scores
✓ Handles typos gracefully
```

### Integration Tests

```bash
# Test full pipeline
npm test -- integration/command-execution.test.ts

# Expected outcomes:
✓ Command parsed correctly
✓ Safety rules evaluated
✓ Confirmation triggered for risky commands
✓ Voice feedback played
✓ Command executed or cancelled
```

### Manual Testing

#### Test 1: Voice Recognition
1. Click "Start Listening"
2. Say: "Open Chrome"
3. Wait for feedback
4. Verify Chrome opens
5. Check console for no errors

**Expected Result**: Chrome launches, voice feedback confirms

#### Test 2: Text Input
1. Type: "Type Hello World"
2. Click "Send"
3. Click in a text field (Notepad)
4. Verify text appears

**Expected Result**: "Hello World" typed in text field

#### Test 3: Confirmation System
1. Say: "Delete my files"
2. Wait for confirmation dialog
3. Click "Cancel"
4. Verify no files deleted

**Expected Result**: Command cancelled, no files deleted

#### Test 4: Global Hotkeys
1. Press Alt+N (anywhere)
2. Verify listening starts
3. Minimize Neora
4. Press Ctrl+Shift+N
5. Verify window appears

**Expected Result**: Hotkeys work globally

#### Test 5: Settings
1. Go to Settings
2. Disable voice
3. Say a command
4. Verify no voice feedback
5. Re-enable and verify voice returns

**Expected Result**: Settings persist and apply correctly

---

## Build & Release Process

### 1. Pre-release Checklist

```
□ All tests passing
□ No console errors
□ No TypeScript errors (npm run lint)
□ Version updated in package.json
□ CHANGELOG.md updated
□ GitHub release notes prepared
```

### 2. Build Release

```bash
# Windows
npm run build
npm run electron:build -- --win --publish=never

# macOS (requires macOS or VM)
npm run build
npm run electron:build -- --mac --publish=never

# Linux
npm run build
npm run electron:build -- --linux --publish=never
```

### 3. Create GitHub Release

```bash
# Tag the release
git tag -a v2.1.0 -m "Release v2.1.0: OS Agent improvements"

# Push to GitHub
git push origin v2.1.0

# Create release on GitHub with artifacts from dist/
```

### 4. Distribution

- **Direct Download**: Host `.exe`, `.dmg`, `.AppImage` on GitHub Releases
- **Windows Store**: Submit to Microsoft Store (optional)
- **macOS App Store**: Submit to Apple App Store (optional)
- **Linux**: Upload to Flathub or Snap Store (optional)

---

## Windows Installation & Auto-start

### Manual Installation

1. Download `Neora-OS-Agent-2.0.0-Setup.exe`
2. Run the installer
3. Accept installation location
4. Check "Run on startup"
5. Click Finish

### Auto-start Configuration

**Registry Method (PowerShell as Admin)**:

```powershell
$app = "C:\Program Files\Neora OS Agent\Neora OS Agent.exe"
New-Item -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "NeoraaOSAgent" -Value $app -Force
```

**Task Scheduler Method**:

1. Open Task Scheduler
2. Create Basic Task
3. Name: "Neora OS Agent"
4. Trigger: "At startup"
5. Action: Start program → `C:\Program Files\Neora OS Agent\Neora OS Agent.exe`
6. Check "Run with highest privileges"

### Verify Auto-start

```bash
# Check registry
reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" | findstr Neora

# Should output:
# NeoraaOSAgent  REG_SZ  C:\Program Files\Neora OS Agent\Neora OS Agent.exe
```

---

## macOS Installation & Auto-start

### Manual Installation

1. Download `Neora-OS-Agent-2.0.0.dmg`
2. Open the DMG file
3. Drag "Neora OS Agent" to Applications
4. Open Applications folder
5. Right-click Neora → Open (bypass security)
6. Allow in System Preferences > Security & Privacy

### Auto-start Configuration

**Using app Settings**:

1. Open Neora
2. Settings → "Run on startup"
3. Allow in System Preferences when prompted

**Manual Method**:

1. Go to System Preferences > General > Login Items
2. Click "+" button
3. Select Applications > Neora OS Agent
4. Add

### Verify Auto-start

```bash
# Check if Neora is in login items
osascript -e 'tell application "System Events" to get the name of every login item'

# Should include: "Neora OS Agent"
```

---

## Linux Installation & Auto-start

### Install from AppImage

```bash
# Download
wget https://github.com/shukriaprinters/Neora-AI-PC-OS-Agent/releases/download/v2.0.0/Neora-OS-Agent-2.0.0-x64.AppImage

# Make executable
chmod +x Neora-OS-Agent-2.0.0-x64.AppImage

# Optional: Install to /opt/
sudo mv Neora-OS-Agent-2.0.0-x64.AppImage /opt/neora

# Create desktop shortcut
cat > ~/.local/share/applications/neora.desktop << EOF
[Desktop Entry]
Type=Application
Name=Neora OS Agent
Exec=/opt/neora
Icon=neora
Categories=Utility
EOF
```

### Install from DEB (Debian/Ubuntu)

```bash
# Download
wget https://github.com/shukriaprinters/Neora-AI-PC-OS-Agent/releases/download/v2.0.0/neora-os-agent_2.0.0_amd64.deb

# Install
sudo dpkg -i neora-os-agent_2.0.0_amd64.deb

# Or with apt
sudo apt install ./neora-os-agent_2.0.0_amd64.deb
```

### Auto-start Configuration

**Systemd Method**:

```bash
# Create systemd service
sudo cat > /etc/systemd/user/neora.service << EOF
[Unit]
Description=Neora OS Agent
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/neora
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
EOF

# Enable
systemctl --user enable neora
systemctl --user start neora
```

**XDG Autostart Method**:

```bash
# Create autostart entry
mkdir -p ~/.config/autostart
cat > ~/.config/autostart/neora.desktop << EOF
[Desktop Entry]
Type=Application
Name=Neora OS Agent
Exec=/usr/bin/neora
X-GNOME-Autostart-enabled=true
EOF
```

### Verify Installation

```bash
# Check if running
pgrep -l neora

# Check logs
journalctl --user -u neora -f
```

---

## Troubleshooting Deployment

### App Won't Start

**Windows**:
```powershell
# Check event viewer for errors
Get-EventLog Application -Newest 10 | grep Neora

# Run with admin
Start-Process "C:\Program Files\Neora OS Agent\Neora OS Agent.exe" -Verb RunAs
```

**macOS**:
```bash
# Check system logs
log stream --predicate 'eventMessage contains[c] "Neora"'

# Check permissions
ls -la /Applications/Neora\ OS\ Agent.app
```

**Linux**:
```bash
# Run directly to see errors
/opt/neora
# or
neora

# Check permissions
ls -la /usr/bin/neora
```

### Microphone Not Working

1. Check OS permissions:
   - **Windows**: Settings > Privacy > Microphone
   - **macOS**: System Preferences > Security > Microphone
   - **Linux**: Check ALSA/PulseAudio settings

2. Test microphone:
   ```bash
   # Windows (PowerShell)
   [System.Media.SystemSounds]::Exclamation.Play()
   
   # macOS
   afplay /System/Library/Sounds/Glass.aiff
   
   # Linux
   pactl set-source-mute @DEFAULT_SOURCE@ false
   ```

### Application Crashes

```bash
# Enable debug logging
export DEBUG=neora:*

# Windows PowerShell
$env:DEBUG = "neora:*"

# Then run:
npm run electron:dev

# Check logs for errors
cat ~/.config/Neora/logs/main.log  # macOS
cat ~/.config/Neora/logs/main.log  # Linux
```

---

## Performance Optimization

### Reduce Memory Usage

```javascript
// In main.ts
mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: preloadPath,
    // Reduce memory
    enableBlinkFeatures: 'NetworkService',
  }
});
```

### Improve Launch Time

1. Use V8 code caching
2. Pre-compile TypeScript
3. Lazy-load modules
4. Use native modules where possible

### Monitor Performance

```bash
# On Windows (Task Manager):
# Monitor Neora process
# CPU should be 1-5% idle
# Memory should be 80-150 MB

# On macOS (Activity Monitor):
# Same metrics apply

# On Linux:
top -p $(pgrep neora)
```

---

## Version Management

### Current Version

- **Version**: 2.0.0
- **Release Date**: June 2024
- **Node.js**: 16+
- **Electron**: 25+

### Update Strategy

1. Check for updates on startup
2. Download in background
3. Notify user of update available
4. Restart app to apply (with prompt)
5. Backup settings before update

---

## Support & Maintenance

### Logs Location

- **Windows**: `%APPDATA%\Neora\logs\`
- **macOS**: `~/Library/Application Support/Neora/logs/`
- **Linux**: `~/.config/Neora/logs/`

### Clean Installation

```bash
# Windows
rm -r "%APPDATA%\Neora"

# macOS
rm -r ~/Library/Application\ Support/Neora

# Linux
rm -r ~/.config/Neora
```

### Report Issues

1. Include OS version
2. Include Neora version
3. Attach relevant log files
4. Describe reproduction steps
5. Include system info (CPU, RAM, Microphone model)

