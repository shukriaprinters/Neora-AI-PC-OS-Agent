# Neora X7: Local Ollama Offline Brain Setup Guide

This guide describes how to install, configure, and connect a local **Ollama** engine to serve as the local offline brain of Neora X7.

---

## 📥 Step 1: Download & Install Ollama
Ollama is a lightweight, easy-to-use engine to run large language models locally.

1. **Visit the official website:** Go to [https://ollama.com](https://ollama.com).
2. **Download for your OS:**
   - **Windows:** Download the installer executable and follow the setup wizard.
   - **macOS:** Download the `.zip` archive, extract, and drag the Ollama app to your `Applications` folder.
   - **Linux:** Run the standard curl installer command in your terminal:
     ```bash
     curl -fsSL https://ollama.com/install.sh | sh
     ```

---

## 🏃 Step 2: Download Your Preferred Local AI Model
Once Ollama is installed and running, open your system's Command Prompt (CMD), PowerShell, or Terminal, and download one of Neora's supported models:

```bash
# Recommended default general-purpose model
ollama run llama3

# Highly smart reasoning and logic model (DeepSeek R1)
ollama run deepseek-r1:8b

# Lightweight speedy model (Microsoft Phi3)
ollama run phi3
```

Neora will automatically discover these model weights when you open the Chat view!

---

## 🔗 Step 3: Enable Cros-Origin (CORS) requests for Web App Dev
Because Neora Runs in a secure web page environment, your browser may block requests to `localhost:11434` due to CORS restrictions. To resolve this, run Ollama with CORS permissions:

### 🪟 Windows Setup:
1. Quit Ollama from your Taskbar System Tray first.
2. Open PowerShell or Command Prompt.
3. Execute the following commands:
   ```cmd
   set OLLAMA_ORIGINS="*"
   ollama serve
   ```

### 🍎 macOS Setup:
1. Close Ollama app.
2. Launch Terminal.
3. Run:
   ```bash
   launchctl setenv OLLAMA_ORIGINS "*"
   # Restart Ollama application
   ```

---

## 🚀 Step 4: Verify Handshake in Neora X7
1. Navigate to the **Chat** tab inside Neora's Workspace.
2. Expand the **System settings** or scroll down to the **Local Ollama Offline AI Brain** panel.
3. Click the 🔄 icon to trigger a live handshake.
4. Once connected, your status will change to `CONNECTED` in a striking emerald color, displaying all your local downloaded model weights.
5. Toggle the **Enable Local Ollama** button to `ACTIVE`. You are now completely offline and safe!
