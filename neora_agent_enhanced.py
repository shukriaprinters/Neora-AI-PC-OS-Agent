"""
Neora OS Agent - Enhanced Standalone Edition
- 24/7 background voice-operated agent
- Photoshop & Illustrator design automation
- Independent voice control (no server required for basic ops)
"""
import base64, io, json, os, re, signal, subprocess, sys, threading, time, webbrowser, socket, platform, sqlite3
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
DB_PATH = WORKSPACE_DIR / "data" / "neora_local.db"
STOP_REQUESTED = False

try:
    DEFAULT_DEVICE_ID = socket.gethostname()
except Exception:
    DEFAULT_DEVICE_ID = "Local-PC"
DEVICE_ID = os.environ.get("NEORA_DEVICE_ID", DEFAULT_DEVICE_ID).strip()

try:
    SYSTEM_INFO = f"{platform.system()} {platform.release()} ({platform.machine()})"
except Exception:
    SYSTEM_INFO = "Windows Local Machine"

LAST_SYNCED_CLIPBOARD = ""

def init_sqlite():
    try:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(DB_PATH))
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS local_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                message TEXT
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS local_history (
                id TEXT PRIMARY KEY,
                prompt TEXT,
                status TEXT,
                timestamp TEXT,
                result TEXT
            )
        """)
        conn.commit()
        conn.close()
    except Exception as e:
        pass

def save_sqlite_log(msg):
    try:
        conn = sqlite3.connect(str(DB_PATH))
        c = conn.cursor()
        c.execute("INSERT INTO local_logs (timestamp, message) VALUES (?, ?)", 
                  (datetime.now().isoformat(), msg))
        conn.commit()
        conn.close()
    except Exception:
        pass

def save_sqlite_command(cmd_id, prompt, status, result):
    try:
        conn = sqlite3.connect(str(DB_PATH))
        c = conn.cursor()
        c.execute("INSERT OR REPLACE INTO local_history (id, prompt, status, timestamp, result) VALUES (?, ?, ?, ?, ?)",
                  (cmd_id, prompt, status, datetime.now().isoformat(), result))
        conn.commit()
        conn.close()
    except Exception:
        pass

# Run database initializer
init_sqlite()

ALLOWED_EXECUTABLES = {
    "notepad", "calc", "mspaint", "explorer", "cmd", "powershell",
    "control", "taskmgr", "chrome", "msedge", "firefox", "brave",
    "winword", "word", "excel", "powerpoint", "powerpnt",
    "photoshop", "illustrator", "aftereffects", "premiere",
    "indesign", "coreldraw", "vscode", "code", "git",
    "git.exe", "docker", "docker.exe", "npm", "npm.cmd", "yarn", "yarn.cmd",
    "python", "python.exe", "node", "node.exe", "figma", "figma.exe", "blender", "blender.exe",
    "slack", "slack.exe", "discord", "discord.exe", "zoom", "zoom.exe", "obs", "obs.exe",
    "putty", "putty.exe", "winscp", "winscp.exe", "postman", "postman.exe",
    "vlc", "vlc.exe", "spotify", "spotify.exe", "teams", "teams.exe", "skype", "skype.exe",
    "opera", "opera.exe", "steam", "steam.exe", "regedit", "cleanmgr", "bash", "wsl"
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
    try:
        save_sqlite_log(msg)
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
CURRENT_SCREENSHOT_DATA = None

def capture_screenshot_base64():
    if not PYAUTOGUI:
        return None
    try:
        import pyautogui
        img = pyautogui.screenshot()
        if img.width > 1920:
            img.thumbnail((1600, 1000))
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=75)
        return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")
    except Exception as e:
        log(f"Failed to capture screen: {e}")
        return None

def set_clipboard(text):
    if PYPERCLIP:
        try:
            pyperclip.copy(text)
            return True
        except Exception:
            pass
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
                        import ctypes.wintypes
                        ctypes.memmove(ptr, data, len(data))
                        ctypes.windll.kernel32.GlobalUnlock(h)
                        ctypes.windll.user32.SetClipboardData(13, h)
                return True
            finally:
                ctypes.windll.user32.CloseClipboard()
    return False

def get_clipboard():
    if PYPERCLIP:
        try:
            return pyperclip.paste()
        except Exception:
            pass
    if sys.platform == "win32":
        import ctypes
        if ctypes.windll.user32.OpenClipboard(None):
            try:
                h = ctypes.windll.user32.GetClipboardData(13) # CF_UNICODETEXT
                if h:
                    ptr = ctypes.windll.kernel32.GlobalLock(h)
                    if ptr:
                        try:
                            val = ctypes.wstring_at(ptr)
                            return val
                        finally:
                            ctypes.windll.kernel32.GlobalUnlock(h)
            finally:
                ctypes.windll.user32.CloseClipboard()
    return ""

def find_via_windows_shortcuts(name):
    if sys.platform != "win32":
        return None
    try:
        import subprocess
        paths = [
            os.path.expandvars(r"%ProgramData%\Microsoft\Windows\Start Menu\Programs"),
            os.path.expandvars(r"%AppData%\Microsoft\Windows\Start Menu\Programs")
        ]
        name_lower = name.lower()
        lnk_files = []
        for p in paths:
            if os.path.exists(p):
                for root, dirs, files in os.walk(p):
                    for f in files:
                        if f.lower().endswith(".lnk") and name_lower in f.lower():
                            lnk_files.append(os.path.join(root, f))
        if lnk_files:
            lnk_files.sort(key=lambda s: len(os.path.basename(s)))
            best_lnk = lnk_files[0]
            escaped_lnk = best_lnk.replace('"', '`"')
            ps_cmd = f'$sh = New-Object -ComObject WScript.Shell; Write-Output $sh.CreateShortcut("{escaped_lnk}").TargetPath'
            res = subprocess.run(["powershell", "-NoProfile", "-Command", ps_cmd], capture_output=True, text=True, timeout=3)
            target_path = ""
            if res.stdout:
                lines = [l.strip() for l in res.stdout.splitlines() if l.strip()]
                if lines:
                    target_path = lines[-1]
            if target_path and os.path.exists(target_path):
                return target_path
            if os.path.exists(best_lnk):
                return best_lnk
    except Exception:
        pass
    return None

def find_exe(name):
    clean = name.replace('"', '').replace("'", "").strip()
    if os.path.isabs(clean) and os.path.exists(clean):
        return clean
    base = os.path.basename(clean).lower().replace(".exe", "")
    
    # Try start-menu shortcut matching first for high-accuracy and custom installs
    shortcut_match = find_via_windows_shortcuts(base)
    if shortcut_match:
        return shortcut_match

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
        # Adobe high-speed multi-drive wildcard globbing
        if target.lower() == "photoshop.exe":
            for drive in ["C:", "D:", "E:", "F:", "G:"]:
                for folder in ["Program Files", "Program Files (x86)", "Adobe", "Programs", ""]:
                    base_path = os.path.join(f"{drive}\\", folder) if folder else f"{drive}\\"
                    patterns = [
                        os.path.join(base_path, "Adobe", "Adobe Photoshop *", "Photoshop.exe"),
                        os.path.join(base_path, "Adobe", "*Photoshop*", "Photoshop.exe"),
                        os.path.join(base_path, "*Photoshop*", "Photoshop.exe"),
                    ]
                    for pattern in patterns:
                        try:
                            matches = glob.glob(pattern)
                            if matches:
                                return matches[0]
                        except Exception:
                            pass

        if target.lower() == "illustrator.exe":
            for drive in ["C:", "D:", "E:", "F:", "G:"]:
                for folder in ["Program Files", "Program Files (x86)", "Adobe", "Programs", ""]:
                    base_path = os.path.join(f"{drive}\\", folder) if folder else f"{drive}\\"
                    patterns = [
                        os.path.join(base_path, "Adobe", "Adobe Illustrator *", "Support Files", "Contents", "Windows", "Illustrator.exe"),
                        os.path.join(base_path, "Adobe", "*Illustrator*", "Support Files", "Contents", "Windows", "Illustrator.exe"),
                        os.path.join(base_path, "Adobe", "*Illustrator*", "*Illustrator.exe"),
                        os.path.join(base_path, "*Illustrator*", "Illustrator.exe"),
                    ]
                    for pattern in patterns:
                        try:
                            matches = glob.glob(pattern)
                            if matches:
                                return matches[0]
                        except Exception:
                            pass
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

    # Try detached background process with native cwd first on Windows
    if sys.platform == "win32" and os.path.exists(clean):
        try:
            # Critical bugfix: Always launch heavyweight graphic design tools (such as Photoshop, Illustrator)
            # with cwd set to their installation directory, and DETACHED_PROCESS flag (0x00000008) so they never block the queue!
            app_dir = os.path.dirname(clean)
            subprocess.Popen([clean], shell=False, cwd=app_dir, creationflags=0x00000008)
            logs.append(f"✓ Launched Windows app detached with native cwd: '{clean}'")
            return True
        except Exception as e:
            logs.append(f"Direct detached launch failed: {e}. Trying fallbacks...")

    for strategy in [
        lambda: (sys.platform == "win32" and os.path.exists(clean)) and subprocess.Popen([clean], shell=False, cwd=os.path.dirname(clean), creationflags=0x00000008),
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
        if action == "create_dir":
            target_path = WORKSPACE_DIR / param
            target_path.mkdir(parents=True, exist_ok=True)
            return [f"Created directory: {param}"]
        if action == "delete_file":
            target_path = WORKSPACE_DIR / param
            if target_path.exists() and target_path.is_file():
                target_path.unlink()
                return [f"Deleted file: {param}"]
            return [f"File not found or skip: {param}"]
        if action == "list_files":
            target_path = WORKSPACE_DIR / (param or ".")
            if target_path.exists() and target_path.is_dir():
                items = [f.name + ("/" if f.is_dir() else "") for f in target_path.iterdir()]
                return [f"LS: {', '.join(items[:30])}"]
            return ["Directory not found"]
        if action == "run_script":
            script_path = WORKSPACE_DIR / param
            if script_path.exists() and script_path.suffix in (".py", ".bat", ".sh", ".ps1"):
                executor = [sys.executable, str(script_path)] if script_path.suffix == ".py" else [str(script_path)]
                res = subprocess.run(executor, cwd=str(WORKSPACE_DIR), capture_output=True, text=True, timeout=10)
                return [f"Script Return: {res.returncode}", f"Stdout: {res.stdout[:200]}"]
            return ["Script binary not found"]
        if action == "mouse_move":
            if PYAUTOGUI:
                parts = [p.strip() for p in param.split(",") if p.strip()]
                if len(parts) >= 2:
                    pyautogui.moveTo(int(parts[0]), int(parts[1]), duration=0.5)
                    return [f"MouseMove: {param}"]
            return ["GUI unavailable"]
        if action == "take_screenshot":
            global CURRENT_SCREENSHOT_DATA
            CURRENT_SCREENSHOT_DATA = capture_screenshot_base64()
            if CURRENT_SCREENSHOT_DATA:
                return ["Screenshot captured and queued for report"]
            return ["Screenshot captured failed (or headless mode)"]
        if action == "vision_click":
            if PYAUTOGUI:
                screenshot = capture_screenshot_base64()
                if not screenshot:
                    return ["Vision Click failed: unable to take screenshot"]
                try:
                    r = session.post(f"{BROKER_URL}/api/os/vision", json={
                        "token": AGENT_TOKEN,
                        "screenshot": screenshot,
                        "query": param,
                    }, timeout=25)
                    if r.status_code == 200:
                        res_data = r.json()
                        coords = res_data.get("coordinates", {})
                        if coords.get("found"):
                            x, y = int(coords["x"]), int(coords["y"])
                            pyautogui.click(x, y)
                            return [f"✓ Vision Clicked '{param}' at ({x}, {y}) [Confidence: {coords.get('confidence')}]"]
                        else:
                            return [f"Vision click failed: {coords.get('reason')}"]
                    else:
                        return [f"Vision API server error: {r.status_code}"]
                except Exception as ex:
                    return [f"Vision API network error: {ex}"]
            return ["GUI unavailable for vision_click"]
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
    global LAST_SYNCED_CLIPBOARD
    try:
        local_clip = get_clipboard()
        payload = {
            "token": AGENT_TOKEN,
            "client_time": datetime.now().isoformat(),
            "deviceId": DEVICE_ID,
            "systemInfo": SYSTEM_INFO
        }
        if local_clip and local_clip != LAST_SYNCED_CLIPBOARD:
            payload["clipboardText"] = local_clip
            LAST_SYNCED_CLIPBOARD = local_clip

        r = session.post(f"{BROKER_URL}/api/os/ping", json=payload, timeout=8)
        if r.status_code == 200:
            res_data = r.json()
            srv_clip = res_data.get("clipboardText")
            if srv_clip and srv_clip != local_clip:
                set_clipboard(srv_clip)
                LAST_SYNCED_CLIPBOARD = srv_clip
                log(f"📋 Sync: Clipboard updated from cloud: {srv_clip[:40]}...")
    except Exception:
        pass

def poll():
    global LAST_SYNCED_CLIPBOARD
    try:
        params = {"token": AGENT_TOKEN, "deviceId": DEVICE_ID}
        r = session.get(f"{BROKER_URL}/api/os/poll", params=params, timeout=8)
        if r.status_code == 200:
            res_data = r.json()
            srv_clip = res_data.get("clipboardText")
            local_clip = get_clipboard()
            if srv_clip and srv_clip != local_clip:
                set_clipboard(srv_clip)
                LAST_SYNCED_CLIPBOARD = srv_clip
                log(f"📋 Sync: Clipboard updated during poll: {srv_clip[:40]}...")
            return res_data
    except Exception:
        pass
    return None

def report(cmd_id, status, logs, result, screenshot=None):
    try:
        payload = {
            "token": AGENT_TOKEN,
            "commandId": cmd_id,
            "status": status,
            "logs": logs,
            "result": result
        }
        if screenshot:
            payload["screenshot"] = screenshot
        session.post(f"{BROKER_URL}/api/os/report", json=payload, timeout=8)
    except Exception:
        pass
    try:
        save_sqlite_command(cmd_id, f"Executed command: {cmd_id}", status, result)
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
            global CURRENT_SCREENSHOT_DATA
            CURRENT_SCREENSHOT_DATA = None
            actions = data.get("actions", [])
            logs = run_actions(actions)
            screenshot_payload = CURRENT_SCREENSHOT_DATA
            if not screenshot_payload and any(a.get("action") == "take_screenshot" for a in actions):
                screenshot_payload = capture_screenshot_base64()
            report(data.get("commandId", ""), "success", logs, f"{len(actions)} steps", screenshot_payload)
        time.sleep(POLL_INTERVAL)
    log("Agent stopped.")

if __name__ == "__main__":
    main()
