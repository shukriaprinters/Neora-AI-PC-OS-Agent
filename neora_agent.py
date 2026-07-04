import base64
import io
import json
import os
import signal
import subprocess
import sys
import threading
import time
import webbrowser
import socket
import platform
import sqlite3
from datetime import datetime
from pathlib import Path

import requests


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
DB_PATH = Path(os.environ.get("NEORA_WORKDIR", os.getcwd())).resolve() / "data" / "neora_local.db"

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
    except Exception:
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



def _safe_print(*args, **kwargs):
    text = kwargs.pop("sep", " ").join(str(arg) for arg in args)
    end = kwargs.pop("end", "\n")
    try:
        sys.stdout.write(text + end)
        sys.stdout.flush()
    except Exception:
        try:
            os.write(1, (text + end).encode("utf-8", errors="replace"))
        except Exception:
            pass


def _safe_write_line(text: str):
    try:
        LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        with LOG_FILE.open("a", encoding="utf-8") as handle:
            handle.write(text + "\n")
    except Exception:
        pass


def log(message: str):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {message}"
    _safe_print(line)
    _safe_write_line(line)
    try:
        save_sqlite_log(message)
    except Exception:
        pass


def sanitize_text(value):
    if value is None:
        return ""
    return str(value)


def safe_join(base_dir: Path, target: str) -> Path:
    candidate = Path(target).expanduser()
    if not candidate.is_absolute():
        candidate = (base_dir / candidate).resolve()
    else:
        candidate = candidate.resolve()
    base_dir = base_dir.resolve()
    if base_dir not in candidate.parents and candidate != base_dir:
        raise ValueError("Refusing to write outside the agent workspace")
    return candidate


def load_json_file(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_json_file(path: Path, payload: dict):
    try:
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    except Exception:
        pass


BROKER_URL = os.environ.get(
    "NEORA_BROKER_URL",
    "http://127.0.0.1:3000",
).rstrip("/")
AGENT_TOKEN = os.environ.get("NEORA_AGENT_TOKEN", "NEORA-X7-AGENT").strip()
POLL_INTERVAL = max(1, int(os.environ.get("NEORA_POLL_INTERVAL", "4")))
REQUEST_TIMEOUT = max(3, int(os.environ.get("NEORA_REQUEST_TIMEOUT", "10")))
PING_INTERVAL = max(5, int(os.environ.get("NEORA_PING_INTERVAL", "14")))
HEADLESS_MODE = os.environ.get("NEORA_HEADLESS", "0").strip().lower() in {"1", "true", "yes", "on"}
WORKSPACE_DIR = Path(os.environ.get("NEORA_WORKDIR", os.getcwd())).resolve()
CONFIG_FILE = WORKSPACE_DIR / "neora_config.json"
LOG_FILE = WORKSPACE_DIR / "logs" / "neora_agent.log"
STOP_REQUESTED = False

ALLOWED_EXECUTABLES = {
    "notepad",
    "calc",
    "mspaint",
    "explorer",
    "cmd",
    "powershell",
    "code",
    "chrome",
    "msedge",
    "photoshop",
    "illustrator",
    "winword",
    "excel",
    "powerpnt",
    "powerpoint",
    "word",
    "photoshop.exe",
    "illustrator.exe",
    "notepad.exe",
    "calc.exe",
    "mspaint.exe",
    "chrome.exe",
    "msedge.exe",
    "winword.exe",
    "word.exe",
    "excel.exe",
    "powerpnt.exe",
    "powerpoint.exe",
    # Modern developer, design, and productivity applications
    "git", "git.exe", "docker", "docker.exe", "npm", "npm.cmd", "yarn", "yarn.cmd",
    "python", "python.exe", "node", "node.exe", "figma", "figma.exe", "blender", "blender.exe",
    "slack", "slack.exe", "discord", "discord.exe", "zoom", "zoom.exe", "obs", "obs.exe",
    "putty", "putty.exe", "winscp", "winscp.exe", "postman", "postman.exe"
}

print = _safe_print  # noqa: A001

try:
    import pyautogui

    PYAUTOGUI_AVAILABLE = True
    if HEADLESS_MODE:
        PYAUTOGUI_AVAILABLE = False
    else:
        pyautogui.FAILSAFE = True
except Exception:
    pyautogui = None
    PYAUTOGUI_AVAILABLE = False

try:
    from PIL import Image  # noqa: F401

    PILLOW_AVAILABLE = True
except Exception:
    PILLOW_AVAILABLE = False


def handle_stop_signal(signum, frame):  # noqa: ARG001
    global STOP_REQUESTED
    STOP_REQUESTED = True
    log(f"Stop signal received ({signum}). Shutting down gracefully.")


signal.signal(signal.SIGINT, handle_stop_signal)
if hasattr(signal, "SIGTERM"):
    signal.signal(signal.SIGTERM, handle_stop_signal)


def banner():
    log("==========================================================")
    log("             NEORA COGNITIVE OS WORKSPACE AGENT           ")
    log("==========================================================")
    log(f"Broker: {BROKER_URL}")
    log(f"Workspace: {WORKSPACE_DIR}")
    log(f"Headless mode: {'enabled' if HEADLESS_MODE else 'disabled'}")


# Speak audio using local synthesizer aloud on PC speakers
def speak_local(text: str):
    def speech_worker():
        try:
            clean = text.replace('"', "").replace("'", "").replace("**", "").replace("*", "").replace("#", "").replace("_", "").strip()
            if sys.platform == "darwin":
                subprocess.Popen(["say", "-r", "175", clean], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            elif sys.platform == "win32":
                ps_cmd = f'Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.Speak("{clean}")'
                subprocess.Popen(["powershell", "-NoProfile", "-Command", ps_cmd], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                subprocess.Popen(["espeak", clean], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass
    threading.Thread(target=speech_worker, daemon=True).start()


# Hands-free hot microphone background voice listener that accepts Google Speech API for both English and Bengali
def start_handsfree_voice_listener():
    try:
        import speech_recognition as sr
        log("[SUCCESS] Speech recognition (speech_recognition) package detected!")
        log("[INFO] Hot mic listening active. Start speaking to trigger Neora commands hands-free...")

        recognizer = sr.Recognizer()

        def voice_worker():
            try:
                mic = sr.Microphone()
            except Exception as mic_err:
                log(f"[WARNING] Microphone initialization failed: {mic_err}")
                log("[WARNING] SpeechRecognition is installed, but no default microphone input was found. Skipping voice module.")
                return

            while not STOP_REQUESTED:
                try:
                    with mic as source:
                        recognizer.adjust_for_ambient_noise(source, duration=0.8)
                        log("[Voice Mic] Listening for prompt or trigger...")
                        audio = recognizer.listen(source, phrase_time_limit=8)

                    log("[Voice Mic] Processing vocal wave patterns...")
                    speech_text = recognizer.recognize_google(audio, language="en-US").strip()
                    if not speech_text:
                        continue

                    # Support Bengali pronunciation detections too
                    try:
                        bengali_speech = recognizer.recognize_google(audio, language="bn-BD").strip()
                        # If contains actual Bengali unicode characters, prefer the Bengali transcription
                        if len([c for c in bengali_speech if ord(c) > 127]) > len(speech_text) * 0.4:
                            speech_text = bengali_speech
                    except Exception:
                        pass

                    log(f"[🎙️ Voice Trigger] Caught => '{speech_text}'")
                    payload = {
                        "prompt": speech_text,
                        "token": AGENT_TOKEN,
                        "client_time": datetime.now().isoformat()
                    }
                    try:
                        SESSION.post(f"{BROKER_URL}/api/os/command", json=payload, timeout=8)
                        log("✓ Dispatched voiced command directly to Neora cloud panel.")
                    except Exception as post_err:
                        log(f"Failed to post voice command: {post_err}")
                except sr.WaitTimeoutError:
                    pass
                except sr.UnknownValueError:
                    pass
                except Exception as e:
                    log(f"[Voice Mic Error] Mic loop exception: {e}")
                    time.sleep(3)

        t = threading.Thread(target=voice_worker, daemon=True)
        t.start()
    except ImportError:
        log("\n" + "-" * 75)
        log("💡   🎙️ WANT NEORA TO HEAR YOUR VOICE LOCALLY AT YOUR COMPUTER? (HANDS-FREE)")
        log("-" * 75)
        log("পিসিতে বসেই সরাসরি কথা বলে Neora কে কন্ট্রোল করতে লাইব্রেরিটি ব্রাশ আপ করুন।")
        log("ভয়েস কম্যান্ড অ্যাক্টিভেট করতে আপনার টার্মিনাল/CMD-তে রান করুন:")
        log("   pip install SpeechRecognition pyaudio")
        log("-" * 75 + "\n")
    except Exception as e:
        log(f"[INFO] Handsfree module bypassed: {e}")


def retrieve_authenticated_headers():
    config = load_json_file(CONFIG_FILE)
    cookie = os.environ.get("NEORA_COOKIE", "").strip() or str(config.get("cookie", "")).strip()

    while True:
        if cookie:
            headers = {"cookie": cookie}
            try:
                response = requests.get(f"{BROKER_URL}/api/os/status", headers=headers, timeout=REQUEST_TIMEOUT)
                response_text = response.text.strip()
                is_html = (
                    "text/html" in response.headers.get("Content-Type", "")
                    or response_text.startswith("<!doctype")
                    or response_text.startswith("<html")
                )
                if response.status_code == 200 and not is_html:
                    config["cookie"] = cookie
                    save_json_file(CONFIG_FILE, config)
                    log("Authenticated session cookie loaded and cached.")
                    return headers
                log(f"Cookie validation failed with HTTP {response.status_code}; session may be expired.")
            except Exception as exc:
                log(f"Authentication handshake failed: {exc}")
                if config.get("cookie") == cookie:
                    log("Network connection issue (cookie is still valid, retrying in 5s...)...")
                    time.sleep(5)
                    continue

        # If expired or missing, show interactive Bengali & English guide
        print("\n" + "=" * 75)
        print("🔑   NEORA SECURE INTERACTIVE LOGIN OVERPASS (GOOGLE CLOUD GATED)")
        print("=" * 75)
        print("আপনার ক্লাউড ওয়ার্কস্পেসের সিকিউরিটি সেশন কুকি (Session Cookie) কপি করে এখানে দিন।")
        print("এতে কোনো পাসওয়ার্ড বা অতিরিক্ত কোডিং ছাড়াই সাথে সাথে রিমোট কানেকশন পেয়ে যাবেন!")
        print("\n💡 কপি করার সহজ ৪টি ধাপ (How to get Cookie/Headers value):")
        print("1. ব্রাউজারে Neora অ্যাপ বা ড্যাশবোর্ড ট্যাবটি একবার রিফ্রেশ দিন (F5)।")
        print("2. কিবোর্ড থেকে 'F12' প্রেস করুন অথবা রাইট-ক্লিক করে 'Inspect' করুন।")
        print("3. ডেভেলপার উইন্ডোর 'Network' ট্যাবে ক্লিক করে 'Fetch/XHR' ক্যাটাগরি সিলেক্ট করুন।")
        print("4. ট্রাফিকে আসা 'status' বা 'poll' রিকুয়েস্টে ক্লিক করে 'Request Headers' এ যান।")
        print("5. সেখানে থাকা 'cookie' মানটি সম্পূর্ণ কপি করুন এবং এই উইন্ডোতে রাইট-ক্লিক করে পেস্ট করুন!")
        print("\n[বিঃদ্রঃ]: আপনি চাইলে পুরো রিকুয়েস্ট হেডার্স (Request Headers) টেক্সট একসাথে পেস্ট করতে পারেন।")
        print("স্ক্রিপ্টটি নিজে নিজেই তার মধ্য থেকে মূল 'cookie' সেশনটি খুঁজে বের করে নিবে!")
        print("=" * 75)

        print("\n📋 Paste your copied Cookie OR Full Request Headers block (then press Enter twice):")

        user_input_lines = []
        while True:
            try:
                line_input = input()
                # Fast connection for single-line cookie dump
                if len(user_input_lines) == 0 and line_input.strip() and not any(kw in line_input.lower() for kw in ["cookie:", "referer:", "host:", "user-agent:"]):
                    user_input_lines.append(line_input)
                    break
                # End of multi-line paste block
                if not line_input.strip():
                    break
                user_input_lines.append(line_input)
            except EOFError:
                break

        raw_pasted = "\n".join(user_input_lines).strip()
        if not raw_pasted:
            print("❌ No input detected. Please paste again!")
            cookie = ""
            continue

        extracted_cookie = ""
        lines = [l.strip() for l in raw_pasted.split("\n") if l.strip()]

        cookie_found = False
        for i, line in enumerate(lines):
            if line.lower().startswith("cookie:"):
                extracted_cookie = line[7:].strip()
                cookie_found = True
                break
            elif line.lower() == "cookie":
                if i + 1 < len(lines):
                    extracted_cookie = lines[i + 1]
                    cookie_found = True
                    break

        if not cookie_found:
            extracted_cookie = raw_pasted.strip("'\" \t\r\n")

        if extracted_cookie.lower().startswith("cookie:"):
            extracted_cookie = extracted_cookie[7:].strip()

        cookie = extracted_cookie.strip()
        if not cookie:
            print("❌ Input parsing failed. Make sure you copied correctly.")
            cookie = ""
            continue


HEADERS = retrieve_authenticated_headers()


def build_session():
    session = requests.Session()
    session.headers.update({"User-Agent": "NeoraAgent/1.0"})
    if HEADERS:
        session.headers.update(HEADERS)
    return session


SESSION = build_session()


def refresh_session_headers():
    global HEADERS, SESSION
    HEADERS = retrieve_authenticated_headers()
    SESSION = build_session()


def capture_screenshot_base64():
    if HEADLESS_MODE or not (PYAUTOGUI_AVAILABLE and PILLOW_AVAILABLE):
        return None
    try:
        screenshot = pyautogui.screenshot()
        if screenshot.width > 1920:
            screenshot.thumbnail((1600, 1000))
        buffered = io.BytesIO()
        screenshot.save(buffered, format="JPEG", quality=70)
        encoded = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return f"data:image/jpeg;base64,{encoded}"
    except Exception as exc:
        log(f"Screenshot capture failed: {exc}")
        return None


def write_file_action(param: str):
    parts = param.split(":", 1)
    filename = parts[0].strip() if parts and parts[0].strip() else "output_note.txt"
    content = parts[1] if len(parts) > 1 else ""
    target_path = safe_join(WORKSPACE_DIR, filename)
    target_path.parent.mkdir(parents=True, exist_ok=True)
    target_path.write_text(content, encoding="utf-8")
    return target_path


def find_via_windows_shortcuts(name: str) -> str | None:
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


def find_executable(command_text: str) -> str:
    """
    Tries to resolve a command name / nickname or partial path to a fully qualified,
    launchable executable path.
    """
    clean = command_text.replace('"', '').replace("'", "").strip()
    if os.path.isabs(clean) and os.path.exists(clean):
        return clean

    name_lower = os.path.basename(clean).lower()
    name_no_ext = name_lower.replace(".exe", "")

    # Check Windows Start Menu shortcuts first
    shortcut_match = find_via_windows_shortcuts(name_no_ext)
    if shortcut_match:
        return shortcut_match

    # Mapping nicknames/names to standard binary executable names
    app_map = {
        "photoshop": "Photoshop.exe",
        "illustrator": "Illustrator.exe",
        "word": "winword.exe",
        "winword": "winword.exe",
        "excel": "excel.exe",
        "powerpoint": "powerpnt.exe",
        "powerpnt": "powerpnt.exe",
        "chrome": "chrome.exe",
        "edge": "msedge.exe",
        "msedge": "msedge.exe",
        "notepad": "notepad.exe",
        "calc": "calc.exe",
        "mspaint": "mspaint.exe",
        "vscode": "Code.exe",
        "code": "Code.exe"
    }

    target_exe = app_map.get(name_no_ext, name_lower)
    if not target_exe.endswith(".exe") and sys.platform == "win32":
        target_exe += ".exe"

    if sys.platform == "win32":
        import glob

        # 0. High-speed multi-drive wildcard globbing for Adobe Photoshop and Illustrator
        # This completely avoids slow or permission-blocked full-recursive os.walk traversals.
        if target_exe.lower() == "photoshop.exe":
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

        if target_exe.lower() == "illustrator.exe":
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

        # 1. Look in Windows Registry (App Paths)
        try:
            import winreg
            for hkey in (winreg.HKEY_CURRENT_USER, winreg.HKEY_LOCAL_MACHINE):
                try:
                    key_path = f"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\{target_exe}"
                    with winreg.OpenKey(hkey, key_path) as key:
                        val, _ = winreg.QueryValueEx(key, "")
                        if val and os.path.exists(str(val)):
                            return str(val)
                except Exception:
                    pass
        except Exception:
            pass

        # 2. Look in typical installation folders (including Adobe sub-folders)
        program_files = [
            os.environ.get("ProgramFiles", "C:\\Program Files"),
            os.environ.get("ProgramFiles(x86)", "C:\\Program Files (x86)"),
            os.environ.get("LocalAppData", "C:\\Users\\Default\\AppData\\Local"),
            "C:\\Program Files",
            "C:\\Program Files (x86)"
        ]

        # Specially search Adobe directories for Photoshop and Illustrator with try/except protection inside os.walk
        if "adobe" in target_exe.lower() or target_exe.lower() in ["photoshop.exe", "illustrator.exe"]:
            for pf in program_files:
                if not pf:
                    continue
                adobe_dir = os.path.join(pf, "Adobe")
                if os.path.exists(adobe_dir):
                    try:
                        for root, dirs, files in os.walk(adobe_dir, onerror=lambda e: None):
                            for f in files:
                                if f.lower() == target_exe.lower():
                                    return os.path.join(root, f)
                    except Exception:
                        pass

        # Look in other common folders
        for pf in program_files:
            if not pf:
                continue
            candidates = [
                os.path.join(pf, "Programs", "Microsoft VS Code", "Code.exe"),
                os.path.join(pf, "Microsoft VS Code", "Code.exe"),
                os.path.join(pf, "Google", "Chrome", "Application", "chrome.exe"),
                os.path.join(pf, "Microsoft", "Edge", "Application", "msedge.exe"),
            ]
            for cand in candidates:
                if os.path.exists(cand):
                    # check if name matches
                    if os.path.basename(cand).lower() == target_exe.lower():
                        return cand

    elif sys.platform == "darwin":
        # MacOS Search applications
        mac_apps = {
            "photoshop": ["/Applications/Adobe Photoshop 2024/Adobe Photoshop 2024.app", 
                          "/Applications/Adobe Photoshop 2023/Adobe Photoshop 2023.app",
                          "/Applications/Adobe Photoshop.app"],
            "illustrator": ["/Applications/Adobe Illustrator 2024/Adobe Illustrator 2024.app",
                            "/Applications/Adobe Illustrator 2023/Adobe Illustrator 2023.app",
                            "/Applications/Adobe Illustrator.app"],
            "chrome": ["/Applications/Google Chrome.app"],
            "vscode": ["/Applications/Visual Studio Code.app"],
            "code": ["/Applications/Visual Studio Code.app"],
            "word": ["/Applications/Microsoft Word.app"],
            "excel": ["/Applications/Microsoft Excel.app"],
            "powerpnt": ["/Applications/Microsoft PowerPoint.app"]
        }
        candidates = mac_apps.get(name_no_ext, [])
        for p in candidates:
            if os.path.exists(p):
                return p

    # Fallback to search path using shutil.which
    import shutil
    resolved = shutil.which(clean) or shutil.which(target_exe)
    if resolved:
        return resolved

    return command_text


def set_clipboard_text(text: str) -> bool:
    """
    Writes unicode text to the local system clipboard without human intervention.
    Supports Windows, macOS, and Linux out-of-the-box with fallback.
    """
    try:
        import pyperclip
        pyperclip.copy(text)
        return True
    except Exception:
        pass

    try:
        if sys.platform == "win32":
            import ctypes
            if ctypes.windll.user32.OpenClipboard(None):
                try:
                    ctypes.windll.user32.EmptyClipboard()
                    encoded = text.encode('utf-16-le') + b'\x00\x00'
                    h_global_mem = ctypes.windll.kernel32.GlobalAlloc(0x0042, len(encoded))
                    if h_global_mem:
                        lp_str = ctypes.windll.kernel32.GlobalLock(h_global_mem)
                        if lp_str:
                            ctypes.memmove(lp_str, encoded, len(encoded))
                            ctypes.windll.kernel32.GlobalUnlock(h_global_mem)
                            # 13 is CF_UNICODETEXT
                            ctypes.windll.user32.SetClipboardData(13, h_global_mem)
                finally:
                    ctypes.windll.user32.CloseClipboard()
            return True
        elif sys.platform == "darwin":
            p = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE, text=True)
            p.communicate(text)
            return True
        else:
            # Linux
            p = subprocess.Popen(['xclip', '-selection', 'clipboard'], stdin=subprocess.PIPE, text=True)
            p.communicate(text)
            return True
    except Exception:
        return False


def get_clipboard_text() -> str:
    """
    Reads unicode text from the local system clipboard without human intervention.
    Supports Windows, macOS, and Linux out-of-the-box with fallback.
    """
    try:
        import pyperclip
        return pyperclip.paste()
    except Exception:
        pass

    try:
        if sys.platform == "win32":
            import ctypes
            if ctypes.windll.user32.OpenClipboard(None):
                try:
                    # 13 is CF_UNICODETEXT
                    h = ctypes.windll.user32.GetClipboardData(13)
                    if h:
                        ptr = ctypes.windll.kernel32.GlobalLock(h)
                        if ptr:
                            try:
                                return ctypes.wstring_at(ptr)
                            finally:
                                ctypes.windll.kernel32.GlobalUnlock(h)
                finally:
                    ctypes.windll.user32.CloseClipboard()
        elif sys.platform == "darwin":
            p = subprocess.Popen(['pbpaste'], stdout=subprocess.PIPE, text=True)
            out, _ = p.communicate()
            return out
        else:
            # Linux
            p = subprocess.Popen(['xclip', '-selection', 'clipboard', '-o'], stdout=subprocess.PIPE, text=True)
            out, _ = p.communicate()
            return out
    except Exception:
        pass
    return ""


def execute_instruction(action, param):
    action = sanitize_text(action).strip().lower()
    param = sanitize_text(param)
    logs = []
    logs.append(f"Started action: {action} with param: '{param}'")

    try:
        if action == "open_browser":
            if not param:
                raise ValueError("open_browser requires a URL")
            webbrowser.open(param)
            logs.append(f"Opened browser URL: {param}")
            time.sleep(1.5)

        elif action == "write_file":
            output_path = write_file_action(param)
            logs.append(f"Saved file: '{output_path.name}'")

        elif action == "execute_cmd":
            if not param:
                raise ValueError("execute_cmd requires a command")
            command_text = param.strip()
            if command_text.startswith("http://") or command_text.startswith("https://"):
                webbrowser.open(command_text)
                logs.append(f"Opened URL via browser: '{command_text}'")
            else:
                resolved_cmd = find_executable(command_text)
                clean_cmd = resolved_cmd.replace('"', '').replace("'", "").strip()
                base_name = os.path.basename(clean_cmd).lower()

                # Either resolved path or original name whitelisted?
                is_whitelisted = False
                orig_clean = command_text.replace('"', '').replace("'", "").strip()
                orig_base = os.path.basename(orig_clean).lower()

                if orig_clean.lower() in ALLOWED_EXECUTABLES:
                    is_whitelisted = True
                elif orig_base in ALLOWED_EXECUTABLES:
                    is_whitelisted = True
                elif orig_base.replace(".exe", "") in ALLOWED_EXECUTABLES:
                    is_whitelisted = True
                elif clean_cmd.lower() in ALLOWED_EXECUTABLES:
                    is_whitelisted = True
                elif base_name in ALLOWED_EXECUTABLES:
                    is_whitelisted = True
                elif base_name.replace(".exe", "") in ALLOWED_EXECUTABLES:
                    is_whitelisted = True

                nickname_match = any(nick in base_name for nick in ["photoshop", "illustrator", "notepad", "calc", "word", "excel", "powerpnt", "chrome", "edge", "mspaint"])
                nickname_match_orig = any(nick in orig_base for nick in ["photoshop", "illustrator", "notepad", "calc", "word", "excel", "powerpnt", "chrome", "edge", "mspaint"])
                if nickname_match or nickname_match_orig:
                    is_whitelisted = True

                if is_whitelisted:
                    launched = False
                    errors = []

                    # 1. Try direct execute (using lists for space compatibility)
                    try:
                        if sys.platform == "win32" and os.path.exists(clean_cmd):
                            # Critical bugfix: Always set cwd to application directory and use DETACHED_PROCESS creation flag on Windows
                            app_dir = os.path.dirname(clean_cmd)
                            subprocess.Popen([clean_cmd], shell=False, cwd=app_dir, creationflags=0x00000008)
                            launched = True
                            logs.append(f"✓ Launched Windows app from resolved path: '{clean_cmd}' with detached context")
                        elif sys.platform == "darwin" and clean_cmd.endswith(".app"):
                            subprocess.Popen(["open", clean_cmd])
                            launched = True
                            logs.append(f"✓ Opened macOS App Bundle: '{clean_cmd}'")
                        else:
                            cwd_dir = os.path.dirname(clean_cmd) if os.path.isabs(clean_cmd) else str(WORKSPACE_DIR)
                            subprocess.Popen([clean_cmd], shell=False, cwd=cwd_dir)
                            launched = True
                            logs.append(f"✓ Launched process directly: '{clean_cmd}'")
                    except Exception as e:
                        errors.append(f"Direct failed: {e}")

                    # 2. Try via shell
                    if not launched:
                        try:
                            exec_str = f'"{clean_cmd}"' if "\\" in clean_cmd or "/" in clean_cmd else clean_cmd
                            subprocess.Popen(exec_str, shell=True, cwd=str(WORKSPACE_DIR))
                            launched = True
                            logs.append(f"✓ Launched process via shell: '{clean_cmd}'")
                        except Exception as e:
                            errors.append(f"Shell failed: {e}")

                    # 3. Try Windows registry start
                    if not launched and sys.platform == "win32":
                        try:
                            app_name = orig_base[:-4] if orig_base.endswith(".exe") else orig_base
                            subprocess.Popen(f'cmd.exe /c start "" "{app_name}"', shell=True)
                            launched = True
                            logs.append(f"✓ Launched Windows app registry start: '{app_name}'")
                        except Exception as e:
                            errors.append(f"Windows start failed: {e}")

                    # 4. Try darwin shell open
                    if not launched and sys.platform == "darwin":
                        try:
                            app_name = orig_base[:-4] if orig_base.endswith(".exe") else orig_base
                            subprocess.Popen(["open", "-a", app_name])
                            launched = True
                            logs.append(f"✓ Launched macOS app: '{app_name}'")
                        except Exception as e:
                            errors.append(f"Mac open failed: {e}")

                    if not launched:
                        raise RuntimeError(f"Failed to launch command via all strategies. Errors: {'; '.join(errors)}")
                elif command_text.lower().endswith((".txt", ".pdf", ".docx", ".xlsx", ".png", ".jpg", ".psd", ".ai")):
                    target_path = safe_join(WORKSPACE_DIR, command_text)
                    if target_path.exists():
                        if sys.platform == "win32":
                            os.startfile(str(target_path))
                        elif sys.platform == "darwin":
                            subprocess.Popen(["open", str(target_path)])
                        else:
                            subprocess.Popen(["xdg-open", str(target_path)])
                        logs.append(f"Opened file: '{target_path.name}'")
                    else:
                        raise ValueError(f"File not found: {command_text}")
                else:
                    raise ValueError(f"Command not allowed: {command_text}")
            logs.append(f"Launched command: '{param}'")
            time.sleep(2.0)

        elif action == "git_sync":
            strategy = param.strip().lower()
            logs.append(f"Initializing local Git Synchronizer [{strategy.upper()} strategy]...")
            try:
                if strategy == "force":
                    logs.append("Fetching updates & executing local absolute hard overwrite...")
                    subprocess.run(["git", "fetch", "--all"], cwd=str(WORKSPACE_DIR), check=False)
                    res = subprocess.run(["git", "reset", "--hard", "origin/main"], cwd=str(WORKSPACE_DIR), capture_output=True, text=True, check=False)
                    logs.append(f"Overwrite done. Output: {res.stdout[:250].strip()}")
                else:
                    logs.append("Executing safe auto-stash routine...")
                    subprocess.run(["git", "stash"], cwd=str(WORKSPACE_DIR), check=False)
                    res_pull = subprocess.run(["git", "pull", "origin", "main"], cwd=str(WORKSPACE_DIR), capture_output=True, text=True, check=False)
                    logs.append(f"Pull result stdout: {res_pull.stdout[:200].strip()}")
                    if "conflict" in res_pull.stderr.lower() or "error" in res_pull.stderr.lower():
                        logs.append(f"Pull warning/stderr: {res_pull.stderr[:200].strip()}")
                    subprocess.run(["git", "stash", "pop"], cwd=str(WORKSPACE_DIR), check=False)
                logs.append("✓ Git synchronization completed successfully!")
            except Exception as e:
                logs.append(f"❌ Git Synchronization failed: {e}")

        elif action == "type_text":
            if HEADLESS_MODE:
                logs.append(f"Headless mode: skipped typing '{param}'")
            elif PYAUTOGUI_AVAILABLE:
                # Use our clipboard copy-paste tool. It supports Bengali Unicode characters beautifully!
                if set_clipboard_text(param):
                    paste_combo = "command+v" if sys.platform == "darwin" else "ctrl+v"
                    pyautogui.hotkey(*(paste_combo.split("+")))
                    logs.append(f"Pasted text via clipboard (Unicode supported): '{param}'")
                else:
                    pyautogui.write(param, interval=0.01)
                    logs.append(f"Typed text (ASCII only fallback): '{param}'")
            else:
                logs.append(f"GUI automation unavailable: typed text skipped '{param}'")

        elif action == "press_key":
            if HEADLESS_MODE:
                logs.append(f"Headless mode: skipped key press '{param}'")
            elif PYAUTOGUI_AVAILABLE:
                keys = [key for key in param.lower().replace(" ", "").split("+") if key]
                if not keys:
                    raise ValueError("press_key requires at least one key")
                if len(keys) > 1:
                    pyautogui.hotkey(*keys)
                else:
                    pyautogui.press(keys[0])
                logs.append(f"Pressed keys combo: {param}")
            else:
                logs.append(f"GUI automation unavailable: key press skipped '{param}'")

        elif action == "mouse_click":
            if HEADLESS_MODE or not PYAUTOGUI_AVAILABLE:
                logs.append("Skipped mouse click in headless/no-gui mode")
            else:
                parts = [p.strip() for p in param.split(",") if p.strip()]
                click_type = "left"
                clicks = 1
                coords = None
                
                if len(parts) >= 2:
                    try:
                        x, y = int(parts[0]), int(parts[1])
                        coords = (x, y)
                        if len(parts) >= 3:
                            click_type = parts[2].lower()
                    except ValueError:
                        click_type = parts[0].lower()
                elif len(parts) == 1:
                    click_type = parts[0].lower()
                    
                if click_type == "double":
                    clicks = 2
                    click_type = "left"
                elif click_type == "right":
                    clicks = 1
                    
                if coords:
                    pyautogui.click(x=coords[0], y=coords[1], clicks=clicks, button=click_type)
                    logs.append(f"Clicked {click_type} mouse at {coords} (clicks: {clicks})")
                else:
                    pyautogui.click(clicks=clicks, button=click_type)
                    logs.append(f"Clicked {click_type} mouse at current position (clicks: {clicks})")

        elif action == "mouse_drag":
            if HEADLESS_MODE or not PYAUTOGUI_AVAILABLE:
                logs.append("Skipped mouse drag in headless")
            else:
                parts = [p.strip() for p in param.split(",") if p.strip()]
                try:
                    if len(parts) >= 4:
                        start_x, start_y = int(parts[0]), int(parts[1])
                        end_x, end_y = int(parts[2]), int(parts[3])
                        pyautogui.moveTo(start_x, start_y)
                        time.sleep(0.15)
                        pyautogui.dragTo(end_x, end_y, duration=0.8, button="left")
                        logs.append(f"Dragged mouse from {start_x},{start_y} to {end_x},{end_y}")
                    elif len(parts) >= 2:
                        end_x, end_y = int(parts[0]), int(parts[1])
                        pyautogui.dragTo(end_x, end_y, duration=0.8, button="left")
                        logs.append(f"Dragged mouse to end coordinates: {end_x},{end_y}")
                except ValueError:
                    logs.append("Invalid mouse drag parameters")

        elif action == "wait":
            duration = 1.0
            try:
                duration = float(param) if param else 1.0
            except ValueError:
                pass
            time.sleep(duration)
            logs.append(f"Waited for {duration} seconds")

        elif action == "open_file":
            clean_path = param.replace('"', '').replace("'", "").strip()
            # If absolute or exists
            if os.path.exists(clean_path) or os.path.isabs(clean_path):
                try:
                    if sys.platform == "win32":
                        os.startfile(clean_path)
                    elif sys.platform == "darwin":
                        subprocess.Popen(["open", clean_path])
                    else:
                        subprocess.Popen(["xdg-open", clean_path])
                    logs.append(f"Opened file directly via OS: '{clean_path}'")
                except Exception as e:
                    logs.append(f"OS open failed: {e}")
            else:
                # Try opening dialog inside the currently active application (Ctrl+O)
                if not HEADLESS_MODE and PYAUTOGUI_AVAILABLE:
                    open_combo = "command+o" if sys.platform == "darwin" else "ctrl+o"
                    pyautogui.hotkey(*(open_combo.split("+")))
                    time.sleep(1.2)
                    if set_clipboard_text(clean_path):
                        paste_combo = "command+v" if sys.platform == "darwin" else "ctrl+v"
                        pyautogui.hotkey(*(paste_combo.split("+")))
                    else:
                        pyautogui.write(clean_path, interval=0.01)
                    time.sleep(0.5)
                    pyautogui.press("enter")
                    time.sleep(1.5)
                    logs.append(f"Executed Open File dialog paste for: '{clean_path}'")
                else:
                    logs.append(f"Could not open file: path does not exist and GUI mode is inactive ({clean_path})")

        elif action == "save_file_as":
            clean_path = param.replace('"', '').replace("'", "").strip()
            if not HEADLESS_MODE and PYAUTOGUI_AVAILABLE:
                save_combo = "command+s" if sys.platform == "darwin" else "ctrl+s"
                pyautogui.hotkey(*(save_combo.split("+")))
                time.sleep(1.2)
                if set_clipboard_text(clean_path):
                    paste_combo = "command+v" if sys.platform == "darwin" else "ctrl+v"
                    pyautogui.hotkey(*(paste_combo.split("+")))
                else:
                    pyautogui.write(clean_path, interval=0.01)
                time.sleep(0.5)
                pyautogui.press("enter")
                time.sleep(1.5)
                logs.append(f"Executed Save File As dialog paste for: '{clean_path}'")
            else:
                logs.append(f"Save File As skipped: GUI mode is inactive for path ({clean_path})")

        elif action == "create_dir":
            clean_path = param.replace('"', '').replace("'", "").strip()
            target_path = safe_join(WORKSPACE_DIR, clean_path)
            target_path.mkdir(parents=True, exist_ok=True)
            logs.append(f"✓ Created directory structures at path: '{target_path.name}'")

        elif action == "delete_file":
            clean_path = param.replace('"', '').replace("'", "").strip()
            target_path = safe_join(WORKSPACE_DIR, clean_path)
            if target_path.exists():
                if target_path.is_file():
                    target_path.unlink()
                    logs.append(f"✓ Deleted workspace file: '{clean_path}'")
                else:
                    raise IsADirectoryError("Refusing to delete a directory to prevent telemetry loss.")
            else:
                logs.append(f"File already clean (does not exist): '{clean_path}'")

        elif action == "list_files":
            clean_path = param.replace('"', '').replace("'", "").strip() or "."
            target_path = safe_join(WORKSPACE_DIR, clean_path)
            if target_path.exists() and target_path.is_dir():
                items = [f.name + ("/" if f.is_dir() else "") for f in target_path.iterdir()]
                logs.append(f"✓ Directory items listed: {', '.join(items[:50])}")
            else:
                raise FileNotFoundError(f"Requested directory path not found: {clean_path}")

        elif action == "run_script":
            clean_path = param.replace('"', '').replace("'", "").strip()
            script_path = safe_join(WORKSPACE_DIR, clean_path)
            if script_path.exists() and script_path.suffix in (".py", ".bat", ".sh", ".ps1"):
                logs.append(f"Launching script executor: {script_path.name}...")
                executor = []
                if script_path.suffix == ".py":
                    executor = [sys.executable, str(script_path)]
                elif sys.platform == "win32":
                    if script_path.suffix == ".ps1":
                        executor = ["powershell", "-NoProfile", "-File", str(script_path)]
                    else:
                        executor = [str(script_path)]
                else:
                    executor = ["bash", str(script_path)]
                
                res = subprocess.run(executor, cwd=str(WORKSPACE_DIR), capture_output=True, text=True, timeout=12)
                logs.append(f"Stdout: {res.stdout.strip()[:600]}")
                if res.stderr:
                    logs.append(f"Stderr: {res.stderr.strip()[:300]}")
                logs.append(f"✓ Script run finished with code: {res.returncode}")
            else:
                raise FileNotFoundError(f"Valid executable script file not found: {clean_path}")

        elif action == "mouse_move":
            if HEADLESS_MODE or not PYAUTOGUI_AVAILABLE:
                logs.append("Skipped mouse move in headless/no-gui mode")
            else:
                parts = [p.strip() for p in param.split(",") if p.strip()]
                if len(parts) >= 2:
                    try:
                        x, y = int(parts[0]), int(parts[1])
                        pyautogui.moveTo(x, y, duration=0.6)
                        logs.append(f"✓ Moved cursor smoothly to coordinates: ({x}, {y})")
                    except ValueError:
                        logs.append("Invalid mouse move coordinate inputs")

        elif action == "get_active_window":
            if sys.platform == "win32":
                try:
                    import ctypes
                    hwnd = ctypes.windll.user32.GetForegroundWindow()
                    length = ctypes.windll.user32.GetWindowTextLengthW(hwnd)
                    buff = ctypes.create_unicode_buffer(length + 1)
                    ctypes.windll.user32.GetWindowTextW(hwnd, buff, length + 1)
                    title = buff.value
                    logs.append(f"✓ Active window detected: '{title}'")
                except Exception as e:
                    logs.append(f"Could not read active window title: {e}")
            else:
                logs.append("Active window detection is supported on Windows environments")

        elif action == "take_screenshot":
            if HEADLESS_MODE:
                logs.append("Screenshot skipped in headless mode")
            else:
                logs.append("Screenshot queued")

        elif action == "vision_click":
            if HEADLESS_MODE or not PYAUTOGUI_AVAILABLE:
                logs.append("Skipped vision click in headless/no-gui mode")
            else:
                screenshot = capture_screenshot_base64()
                if not screenshot:
                    logs.append("Vision Click failed: unable to take screenshot")
                else:
                    try:
                        # Make API request to the Vision helper on the Broker server
                        r = SESSION.post(f"{BROKER_URL}/api/os/vision", json={
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
                                logs.append(f"✓ Vision Clicked '{param}' at ({x}, {y}) [Confidence: {coords.get('confidence')}]")
                            else:
                                logs.append(f"Vision click failed: {coords.get('reason')}")
                        else:
                            logs.append(f"Vision API server error: {r.status_code}")
                    except Exception as ex:
                        logs.append(f"Vision API network error: {ex}")

        elif action == "alert_msg":
            if HEADLESS_MODE:
                logs.append(f"Headless mode: skipped alert '{param}'")
            elif PYAUTOGUI_AVAILABLE:
                pyautogui.alert(text=param, title="Neora Agent")
                logs.append(f"Displayed alert: '{param}'")
            else:
                logs.append(f"Alert fallback: '{param}'")

        else:
            logs.append(f"Unsupported action ignored: {action}")

    except Exception as exc:
        logs.append(f"ERROR: {exc}")

    return logs


def send_ping():
    global LAST_SYNCED_CLIPBOARD
    try:
        local_clip = get_clipboard_text()
        payload = {
            "token": AGENT_TOKEN,
            "client_time": datetime.now().isoformat(),
            "deviceId": DEVICE_ID,
            "systemInfo": SYSTEM_INFO
        }
        if local_clip and local_clip != LAST_SYNCED_CLIPBOARD:
            payload["clipboardText"] = local_clip
            LAST_SYNCED_CLIPBOARD = local_clip

        response = SESSION.post(f"{BROKER_URL}/api/os/ping", json=payload, timeout=REQUEST_TIMEOUT)
        if response.status_code == 401:
            refresh_session_headers()
        elif response.status_code == 200:
            res_data = response.json()
            srv_clip = res_data.get("clipboardText")
            if srv_clip and srv_clip != local_clip:
                set_clipboard_text(srv_clip)
                LAST_SYNCED_CLIPBOARD = srv_clip
                log(f"📋 Sync: Clipboard updated from cloud: {srv_clip[:40]}...")
    except Exception as exc:
        log(f"Ping failed: {exc}")


def report_command_result(command_id, status, logs, screenshot, result):
    payload = {
        "token": AGENT_TOKEN,
        "commandId": command_id,
        "status": status,
        "logs": logs,
        "screenshot": screenshot,
        "result": result,
    }
    try:
        # Save to local SQLite database for persistent local history
        log_summary = "\n".join(logs) if isinstance(logs, list) else str(logs)
        save_sqlite_command(command_id, log_summary[:200], status, result)
    except Exception:
        pass
    response = SESSION.post(f"{BROKER_URL}/api/os/report", json=payload, timeout=REQUEST_TIMEOUT)
    if response.status_code == 401:
        refresh_session_headers()
    return response


def poll_once():
    global LAST_SYNCED_CLIPBOARD
    try:
        params = {"token": AGENT_TOKEN, "deviceId": DEVICE_ID}
        response = SESSION.get(f"{BROKER_URL}/api/os/poll", params=params, timeout=REQUEST_TIMEOUT)
        if response.status_code == 401:
            refresh_session_headers()
            return None, "unauthorized"
        if response.status_code != 200:
            return None, f"http_{response.status_code}"

        response_text = response.text.strip()
        if (
            "text/html" in response.headers.get("Content-Type", "")
            or response_text.startswith("<!doctype")
            or response_text.startswith("<html")
        ):
            refresh_session_headers()
            return None, "session_expired"

        res_data = response.json()
        srv_clip = res_data.get("clipboardText")
        local_clip = get_clipboard_text()
        if srv_clip and srv_clip != local_clip:
            set_clipboard_text(srv_clip)
            LAST_SYNCED_CLIPBOARD = srv_clip
            log(f"📋 Sync: Clipboard updated during poll: {srv_clip[:40]}...")

        return res_data, None
    except Exception as e:
        return None, str(e)


def main():
    banner()
    log("Agent initialized. Waiting for commands.")

    # Start the continuous hot hands-free microphone vocal listener sequence in background
    start_handsfree_voice_listener()

    # Dynamic delay vocal greeting on desktop startup representing Neora Active state
    def announce_startup():
        time.sleep(1.2)
        # Speak Bengali greeting
        speak_local("হ্যালো বস! নিওরা লোকাল পিসি রানিং রয়েছে এবং কন্ট্রোল রুমের সাথে কানেক্ট হয়েছে। আমি সম্পূর্ণ সচল।")
        time.sleep(6.2)
        # Speak English greeting
        speak_local("Hello Boss! Neora local PC operating agent is now running and connected to server. Fully active and ready for your voice commands!")
    
    threading.Thread(target=announce_startup, daemon=True).start()

    last_ping_time = 0.0
    backoff_seconds = POLL_INTERVAL

    while not STOP_REQUESTED:
        now = time.time()
        if now - last_ping_time >= PING_INTERVAL:
            send_ping()
            last_ping_time = now

        try:
            data, error = poll_once()
            if error:
                log(f"Poll warning: {error}")
                time.sleep(backoff_seconds)
                continue

            if not data or not data.get("hasCommand"):
                time.sleep(POLL_INTERVAL)
                continue

            command_id = data.get("commandId")
            prompt_text = data.get("prompt", "")
            actions_list = data.get("actions", [])
            log(f"Incoming prompt: {prompt_text}")
            log(f"Action layers: {len(actions_list)}")

            # Speak incoming command to notify user
            speak_local(f"Acknowledged direct command: {prompt_text}")

            execution_logs = [f"Desktop execution started for command: '{prompt_text}'"]
            success_count = 0
            failed = False

            for action_item in actions_list:
                step_logs = execute_instruction(action_item.get("action"), action_item.get("param"))
                execution_logs.extend(step_logs)
                success_count += 1
                if any(step.startswith("ERROR:") for step in step_logs):
                    failed = True
                    break

            screenshot_base64 = capture_screenshot_base64()
            status = "failed" if failed else "success"
            result = f"Completed {success_count}/{len(actions_list)} automation actions."
            if failed:
                result = f"Execution stopped after {success_count} step(s) due to error."

            try:
                report_command_result(command_id, status, execution_logs, screenshot_base64, result)
                log(f"Reported command result for {command_id}: {status}")
                if failed:
                    speak_local("Automation task offline due to critical error.")
                else:
                    speak_local("Neora automation task executed successfully, Boss!")
            except Exception as exc:
                log(f"Report failed: {exc}")

            backoff_seconds = POLL_INTERVAL

        except requests.RequestException as exc:
            log(f"Network error: {exc}")
            backoff_seconds = min(backoff_seconds * 2, 30)
            time.sleep(backoff_seconds)
        except Exception as exc:
            log(f"Unhandled runtime error: {exc}")
            backoff_seconds = min(backoff_seconds * 2, 30)
            time.sleep(backoff_seconds)

    log("Agent stopped.")


if __name__ == "__main__":
    main()
