"""
Neora OS Agent - Enhanced Standalone Edition
- 24/7 background voice-operated agent
- Photoshop & Illustrator design automation
- Independent voice control (no server required for basic ops)
"""
import base64, io, json, os, re, signal, subprocess, sys, threading, time, webbrowser
from datetime import datetime
from pathlib import Path
import requests

BROKER_URL = os.environ.get("NEORA_BROKER_URL", "http://127.0.0.1:3000").rstrip("/")
AGENT_TOKEN = os.environ.get("NEORA_AGENT_TOKEN", "NEORA-X7-AGENT").strip()
POLL_INTERVAL = max(1, int(os.environ.get("NEORA_POLL_INTERVAL", "4")))
PING_INTERVAL = max(5, int(os.environ.get("NEORA_PING_INTERVAL", "14")))
HEADLESS_MODE = os.environ.get("NEORA_HEADLESS", "0").strip().lower() in {"1", "true", "yes", "on"}
WORKSPACE_DIR = Path(os.environ.get("NEORA_WORKDIR", os.getcwd())).resolve()
LOG_FILE = WORKSPACE_DIR / "logs" / "neora_agent.log"
STOP_REQUESTED = False

ALLOWED_EXECUTABLES = {
    "notepad", "calc", "mspaint", "explorer", "cmd", "powershell",
    "control", "taskmgr", "chrome", "msedge", "firefox", "brave",
    "winword", "word", "excel", "powerpoint", "powerpnt",
    "photoshop", "illustrator", "aftereffects", "premiere",
    "indesign", "coreldraw", "vscode", "code", "git",
}

# ── safe print ──
def log(msg):
    ts = datetime.now().strftime("%H:%M:%S")
    line = f"[{ts}] {msg}"
    try:
        print(line)
    except Exception:
        pass
    try:
        LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        with LOG_FILE.open("a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass

print = lambda *a, **k: __builtins__.print(*a, **k)  # noqa: A001

signal.signal(signal.SIGINT, lambda s, f: (globals().update(STOP_REQUESTED=True), log("Shutting down…"))[1])
if hasattr(signal, "SIGTERM"):
    signal.signal(signal.SIGTERM, lambda s, f: (globals().update(STOP_REQUESTED=True), log("Shutting down…"))[1])

# ── optional imports ──
try:
    import pyautogui
    pyautogui.FAILSAFE = True
    PYAUTOGUI = True
except Exception:
    PYAUTOGUI = False

try:
    from PIL import Image
    PILLOW = True
except Exception:
    PILLOW = False

try:
    import speech_recognition as sr
    SPEECH = True
except Exception:
    SPEECH = False

try:
    import pyperclip
    PYPERCLIP = True
except Exception:
    PYPERCLIP = False

# ── helpers ──
def set_clipboard(text):
    if PYPERCLIP:
        pyperclip.copy(text)
        return True
    if sys.platform == "win32":
        import ctypes
        if ctypes.windll.user32.OpenClipboard(None):
            try:
                ctypes.windll.user32.EmptyClipboard()
                data = text.encode("utf-16-le") + b"\x00\x00"
                h = ctypes.windll.kernel32.GlobalAlloc(0x0042, len(data))
                if h:
                    ptr = ctypes.windll.kernel32.GlobalLock(h)
                    if ptr:
                        ctypes.windll.kernel32.GlobalUnlock(h)
                        ctypes.windll.user32.SetClipboardData(13, h)
                return True
            finally:
                ctypes.windll.user32.CloseClipboard()
    return False

def find_exe(name):
    clean = name.replace('"', '').replace("'", "").strip()
    if os.path.isabs(clean) and os.path.exists(clean):
        return clean
    base = os.path.basename(clean).lower().replace(".exe", "")
    mapping = {
        "photoshop": "Photoshop.exe", "illustrator": "Illustrator.exe",
        "word": "winword.exe", "winword": "winword.exe", "excel": "excel.exe",
        "powerpoint": "powerpnt.exe", "powerpnt": "powerpnt.exe",
        "chrome": "chrome.exe", "edge": "msedge.exe", "msedge": "msedge.exe",
        "notepad": "notepad.exe", "calc": "calc.exe", "mspaint": "mspaint.exe",
        "vscode": "Code.exe", "code": "Code.exe", "cmd": "cmd.exe",
        "powershell": "powershell.exe", "terminal": "wt.exe",
        "explorer": "explorer.exe", "files": "explorer.exe",
    }
    target = mapping.get(base, base)
    if not target.endswith(".exe") and sys.platform == "win32":
        target += ".exe"
    if sys.platform == "win32":
        import glob
        # Adobe fast-path
        if target.lower() == "photoshop.exe":
            for pat in [r"C:\Program Files\Adobe\*\Photoshop.exe", r"C:\Program Files (x86)\Adobe\*\Photoshop.exe"]:
                m = glob.glob(pat)
                if m:
                    return m[0]
        if target.lower() == "illustrator.exe":
            for pat in [r"C:\Program Files\Adobe\Adobe Illustrator *\Support Files\Contents\Windows\Illustrator.exe"]:
                m = glob.glob(pat)
                if m:
                    return m[0]
        # Registry
        try:
            import winreg
            for h in (winreg.HKEY_CURRENT_USER, winreg.HKEY_LOCAL_MACHINE):
                try:
                    with winreg.OpenKey(h, rf"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\{target}") as k:
                        v, _ = winreg.QueryValueEx(k, "")
                        if v and os.path.exists(v):
                            return v
                except Exception:
                    pass
        except Exception:
            pass
        import shutil
        r = shutil.which(clean) or shutil.which(target)
        if r:
            return r
    return clean

def launch(cmd, logs):
    clean = cmd.replace('"', '').replace("'", "").strip()
    base = os.path.basename(clean).lower()
    ok = (base in ALLOWED_EXECUTABLES or base.replace(".exe", "") in ALLOWED_EXECUTABLES
          or clean.lower() in ALLOWED_EXECUTABLES
          or any(n in base for n in ["photoshop", "illustrator", "notepad", "calc", "word", "excel", "powerpnt", "chrome", "edge", "mspaint"]))
    if not ok:
        logs.append(f"BLOCKED: {clean}")
        return False
    for strategy in [
        lambda: (sys.platform == "win32" and os.path.exists(clean)) and subprocess.Popen([clean], shell=False),
        lambda: subprocess.Popen(clean, shell=False, cwd=str(WORKSPACE_DIR)),
        lambda: subprocess.Popen(f'cmd.exe /c start "" "{clean}"', shell=True),
    ]:
        try:
            strategy()
            logs.append(f"Launched: {clean}")
            return True
        except Exception:
            pass
    logs.append(f"FAILED: {clean}")
    return False

def speak(text):
    def _():
        try:
            t = text.replace('"', "").replace("'", "").replace("**", "").replace("*", "")
            if sys.platform == "win32":
                ps = f'Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.Speak("{t}")'
                subprocess.Popen(["powershell", "-NoProfile", "-Command", ps], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass
    threading.Thread(target=_, daemon=True).start()

# ── voice listener (independent) ──
_voice_stop = threading.Event()

def start_voice(on_command):
    if not SPEECH:
        log("[VOICE] Install: pip install SpeechRecognition pyaudio")
        return
    def worker():
        r = sr.Recognizer()
        r.energy_threshold = 3000
        r.dynamic_energy_threshold = True
        while not _voice_stop.is_set() and not STOP_REQUESTED:
            try:
                with sr.Microphone() as src:
                    r.adjust_for_ambient_noise(src, duration=0.5)
                    try:
                        audio = r.listen(src, timeout=6, phrase_time_limit=10)
                    except sr.WaitTimeoutError:
                        continue
                en = ""
                bn = ""
                try:
                    en = r.recognize_google(audio, language="en-US").strip()
                except Exception:
                    pass
                try:
                    bn = r.recognize_google(audio, language="bn-BD").strip()
                except Exception:
                    pass
                if bn and len([c for c in bn if ord(c) > 127]) > len(en) * 0.3:
                    transcript = bn
                else:
                    transcript = en or bn
                if transcript:
                    log(f"[VOICE] Heard: {transcript}")
                    speak(f"Got it: {transcript[:60]}")
                    on_command(transcript)
            except Exception as e:
                log(f"[VOICE] {e}")
                time.sleep(1)
    t = threading.Thread(target=worker, daemon=True)
    t.start()
    log("[VOICE] Listener active")

# ── local NLP parser ──
def parse_command(text):
    low = text.lower()
    actions = []

    # DESIGN (Photoshop / Illustrator)
    design_kw = ["design", "banner", "poster", "graphic", "draw", "logo", " brochure", "flyer", "ডিজাইন", "পোস্টার", "ব্যানার"]
    app = "illustrator" if "illustrator" in low else "photoshop"
    is_design = any(k in low for k in design_kw) or app in low
    if is_design:
        actions += [
            {"action": "execute_cmd", "param": app},
            {"action": "wait", "param": "5.0"},
            {"action": "press_key", "param": "ctrl+n"},
            {"action": "wait", "param": "1.5"},
            {"action": "press_key", "param": "enter"},
            {"action": "wait", "param": "2.0"},
        ]
        desc = text
        for sep in [" with ", " about ", " নিয়ে "]:
            if sep in low:
                desc = text[low.index(sep) + len(sep):].strip()
                break
        actions.append({"action": "type_text", "param": desc or "New design by Neora"})
        actions.append({"action": "wait", "param": "2.0"})
        save = re.search(r"(?:save|সেভ)\s+([a-zA-Z0-9_\-\.]+)", low)
        fname = (save.group(1) if save else ("neora_design.ai" if app == "illustrator" else "neora_design.psd"))
        actions.append({"action": "save_file_as", "param": fname})
        actions.append({"action": "wait", "param": "2.0"})
        actions.append({"action": "take_screenshot", "param": ""})
        return actions

    # OPEN APP
    for kw in ["open", "launch", "run", "start", "kholo", "chalu", "calo"]:
        if kw in low:
            rest = re.split(rf"\b{re.escape(kw)}\b", text, maxsplit=1)
            if len(rest) > 1:
                app_name = rest[1].strip().strip(".,!").lower()
                if app_name:
                    return [
                        {"action": "execute_cmd", "param": app_name},
                        {"action": "wait", "param": "3.0"},
                        {"action": "take_screenshot", "param": ""},
                    ]

    # URL
    url = re.search(r"(https?://\S+)", text)
    if url:
        return [{"action": "open_browser", "param": url.group(1)}, {"action": "wait", "param": "3.0"}]

    for site, u in {"youtube": "https://www.youtube.com", "facebook": "https://www.facebook.com",
                    "google": "https://www.google.com", "github": "https://github.com"}.items():
        if site in low:
            return [{"action": "open_browser", "param": u}, {"action": "wait", "param": "3.0"}]

    # TYPE
    for kw in ["type", "write", "লিখো", "টাইপ"]:
        if kw in low:
            rest = re.split(rf"\b{re.escape(kw)}\b", text, maxsplit=1)
            if len(rest) > 1:
                return [{"action": "type_text", "param": rest[1].strip()}, {"action": "press_key", "param": "enter"}]

    # SCREENSHOT
    if any(k in low for k in ["screenshot", "স্ক্রিনশট"]):
        return [{"action": "take_screenshot", "param": ""}]

    return [{"action": "take_screenshot", "param": ""}]

# ── executor ──
def execute(action, param):
    param = (param or "").strip()
    try:
        if action == "execute_cmd":
            return launch(param, []) or [f"Launched: {param}"]
        if action == "open_browser":
            webbrowser.open(param)
            time.sleep(1.5)
            return [f"Browser: {param}"]
        if action == "type_text":
            if PYAUTOGUI:
                if set_clipboard(param):
                    pyautogui.hotkey("ctrl", "v")
                    return [f"Pasted: {param[:50]}"]
                pyautogui.write(param, interval=0.01)
                return [f"Typed: {param[:50]}"]
            return ["GUI unavailable"]
        if action == "press_key":
            if PYAUTOGUI:
                keys = [k for k in param.lower().replace(" ", "").split("+") if k]
                if len(keys) > 1:
                    pyautogui.hotkey(*keys)
                elif keys:
                    pyautogui.press(keys[0])
                return [f"Key: {param}"]
            return ["GUI unavailable"]
        if action == "mouse_click":
            if PYAUTOGUI:
                parts = [p.strip() for p in param.split(",") if p.strip()]
                if len(parts) >= 2:
                    pyautogui.click(int(parts[0]), int(parts[1]))
                else:
                    pyautogui.click()
                return [f"Click: {param}"]
            return ["GUI unavailable"]
        if action == "mouse_drag":
            if PYAUTOGUI:
                parts = [p.strip() for p in param.split(",") if p.strip()]
                if len(parts) >= 4:
                    pyautogui.moveTo(int(parts[0]), int(parts[1]))
                    time.sleep(0.15)
                    pyautogui.dragTo(int(parts[2]), int(parts[3]), duration=0.8)
                return [f"Drag: {param}"]
            return ["GUI unavailable"]
        if action == "wait":
            time.sleep(float(param) if param else 1.0)
            return [f"Waited {param}s"]
        if action == "save_file_as":
            if PYAUTOGUI:
                pyautogui.hotkey("ctrl", "s")
                time.sleep(1.2)
                if set_clipboard(param):
                    pyautogui.hotkey("ctrl", "v")
                else:
                    pyautogui.write(param, interval=0.01)
                time.sleep(0.5)
                pyautogui.press("enter")
                time.sleep(1.5)
                return [f"Saved as: {param}"]
            return ["Headless"]
        if action == "take_screenshot":
            return ["Screenshot queued"]
        if action == "alert_msg":
            if PYAUTOGUI:
                pyautogui.alert(text=param or "Neora", title="Neora Agent")
            return [f"Alert: {param}"]
        return [f"Unknown: {action}"]
    except Exception as e:
        return [f"ERROR: {e}"]

def run_actions(actions):
    logs = []
    for a in actions:
        logs.extend(execute(a.get("action", ""), a.get("param", "")))
    return logs

# ── broker polling (when server is online) ──
session = requests.Session()
session.headers.update({"User-Agent": "NeoraAgent/2.0"})

def ping():
    try:
        session.post(f"{BROKER_URL}/api/os/ping",
                     json={"token": AGENT_TOKEN, "client_time": datetime.now().isoformat()}, timeout=8)
    except Exception:
        pass

def poll():
    try:
        r = session.get(f"{BROKER_URL}/api/os/poll", params={"token": AGENT_TOKEN}, timeout=8)
        if r.status_code == 200:
            return r.json()
    except Exception:
        pass
    return None

def report(cmd_id, status, logs, result):
    try:
        session.post(f"{BROKER_URL}/api/os/report",
                     json={"token": AGENT_TOKEN, "commandId": cmd_id,
                           "status": status, "logs": logs, "result": result}, timeout=8)
    except Exception:
        pass

# ── main ──
def main():
    global STOP_REQUESTED
    log("=" * 50)
    log("   NEORA AGENT v2.0 — VOICE + DESIGN MODE")
    log(f"   Broker : {BROKER_URL}")
    log(f"   Voice  : {'ON' if SPEECH else 'OFF (pip install SpeechRecognition pyaudio)'}")
    log(f"   GUI    : {'ON' if PYAUTOGUI else 'OFF'}")
    log("=" * 50)

    # Voice callback — runs immediately on voice command
    def on_voice(text):
        actions = parse_command(text)
        log(f"[VOICE] Executing: {text}")
        logs = run_actions(actions)
        for l in logs:
            log(l)
        speak("Done, boss!" if not any("ERROR" in l or "BLOCKED" in l for l in logs) else "Something went wrong")

    start_voice(on_voice)
    speak("Hello Boss! Neora agent is online. Give me a voice command anytime.")

    last_ping = 0
    while not STOP_REQUESTED:
        now = time.time()
        if now - last_ping >= PING_INTERVAL:
            ping()
            last_ping = now
        data = poll()
        if data and data.get("hasCommand"):
            actions = data.get("actions", [])
            logs = run_actions(actions)
            report(data.get("commandId", ""), "success", logs, f"{len(actions)} steps")
        time.sleep(POLL_INTERVAL)
    log("Agent stopped.")

if __name__ == "__main__":
    main()
