import base64
import io
import json
import os
import signal
import subprocess
import sys
import time
import webbrowser
from datetime import datetime
from pathlib import Path

import requests


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
PING_INTERVAL = max(5, int(os.environ.get("NEORA_PING_INTERVAL", "10")))
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
    "photoshop.exe",
    "illustrator.exe",
    "notepad.exe",
    "calc.exe",
    "mspaint.exe",
    "chrome.exe",
    "msedge.exe",
    "winword.exe",
    "excel.exe",
    "powerpnt.exe",
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


def parse_cookie_text(raw_text: str) -> str:
    raw_text = raw_text.strip()
    if not raw_text:
        return ""

    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    for index, line in enumerate(lines):
        lower_line = line.lower()
        if lower_line.startswith("cookie:"):
            return line[7:].strip().strip("'\"")
        if lower_line == "cookie" and index + 1 < len(lines):
            return lines[index + 1].strip().strip("'\"")

    return raw_text.strip("'\"")


def retrieve_authenticated_headers():
    config = load_json_file(CONFIG_FILE)
    cookie = os.environ.get("NEORA_COOKIE", "").strip() or str(config.get("cookie", "")).strip()

    if not cookie:
        log("No session cookie configured. Continuing without authenticated headers.")
        return {}

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
        log(f"Cookie validation failed with HTTP {response.status_code}; proceeding without cookie.")
    except Exception as exc:
        log(f"Authentication handshake failed: {exc}; proceeding without cookie.")

    return {}


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
                # Clean app_path to resolve base name and check security whitelist
                clean_cmd = command_text.replace('"', '').replace("'", "").strip()
                base_name = os.path.basename(clean_cmd).lower()
                
                is_whitelisted = False
                if clean_cmd.lower() in ALLOWED_EXECUTABLES:
                    is_whitelisted = True
                elif base_name in ALLOWED_EXECUTABLES:
                    is_whitelisted = True
                elif base_name.replace(".exe", "") in ALLOWED_EXECUTABLES:
                    is_whitelisted = True
                    
                # Support common quick app nicknames in path lookup
                nickname_match = any(nick in base_name for nick in ["photoshop", "illustrator", "notepad", "calc", "word", "excel", "powerpnt", "chrome", "edge", "mspaint"])
                if nickname_match:
                    is_whitelisted = True

                if is_whitelisted:
                    launched = False
                    errors = []
                    
                    # Strategy A: Direct execution
                    try:
                        subprocess.Popen([command_text], shell=False, cwd=str(WORKSPACE_DIR))
                        launched = True
                        logs.append(f"✓ Launched process directly: '{command_text}'")
                    except Exception as e:
                        errors.append(f"Direct failed: {e}")
                    
                    # Strategy B: Shell execution for PATH lookups
                    if not launched:
                        try:
                            # If it is a full path, put double quotes around it for shell-safety
                            exec_str = f'"{command_text}"' if "\\" in command_text or "/" in command_text else command_text
                            subprocess.Popen(exec_str, shell=True, cwd=str(WORKSPACE_DIR))
                            launched = True
                            logs.append(f"✓ Launched process via shell: '{command_text}'")
                        except Exception as e:
                            errors.append(f"Shell failed: {e}")
                            
                    # Strategy C: Windows "start" command (resolves registry application paths like Photoshop, Illustrator, Word, Excel)
                    if not launched and sys.platform == "win32":
                        try:
                            app_name = command_text[:-4] if command_text.lower().endswith(".exe") else command_text
                            subprocess.Popen(f'cmd.exe /c start "" "{app_name}"', shell=True)
                            launched = True
                            logs.append(f"✓ Launched Windows app registry start: '{app_name}'")
                        except Exception as e:
                            errors.append(f"Windows start failed: {e}")
                            
                    # Strategy D: macOS "open -a" command
                    if not launched and sys.platform == "darwin":
                        try:
                            app_name = command_text[:-4] if command_text.lower().endswith(".exe") else command_text
                            subprocess.Popen(["open", "-a", app_name])
                            launched = True
                            logs.append(f"✓ Launched macOS app: '{app_name}'")
                        except Exception as e:
                            errors.append(f"Mac open failed: {e}")

                    if not launched:
                        raise RuntimeError(f"Failed to launch command via all strategies. Errors: {'; '.join(errors)}")
                elif command_text.lower().endswith((".txt", ".pdf", ".docx", ".xlsx", ".png", ".jpg")):
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
                pyautogui.click()
                time.sleep(0.25)
                pyautogui.write(param, interval=0.01)
                logs.append(f"Typed text: '{param}'")
            else:
                logs.append(f"GUI automation unavailable: typed text skipped '{param}'")

        elif action == "press_key":
            if HEADLESS_MODE:
                logs.append(f"Headless mode: skipped key press '{param}'")
            elif PYAUTOGUI_AVAILABLE:
                pyautogui.click()
                time.sleep(0.2)
                keys = [key for key in param.lower().replace(" ", "").split("+") if key]
                if not keys:
                    raise ValueError("press_key requires at least one key")
                if len(keys) > 1:
                    pyautogui.hotkey(*keys)
                else:
                    pyautogui.press(keys[0])
                logs.append(f"Pressed keys: {param}")
            else:
                logs.append(f"GUI automation unavailable: key press skipped '{param}'")

        elif action == "take_screenshot":
            if HEADLESS_MODE:
                logs.append("Screenshot skipped in headless mode")
            else:
                logs.append("Screenshot queued")

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
    try:
        payload = {"token": AGENT_TOKEN, "client_time": datetime.now().isoformat()}
        response = SESSION.post(f"{BROKER_URL}/api/os/ping", json=payload, timeout=REQUEST_TIMEOUT)
        if response.status_code == 401:
            refresh_session_headers()
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
    response = SESSION.post(f"{BROKER_URL}/api/os/report", json=payload, timeout=REQUEST_TIMEOUT)
    if response.status_code == 401:
        refresh_session_headers()
    return response


def poll_once():
    response = SESSION.get(f"{BROKER_URL}/api/os/poll", params={"token": AGENT_TOKEN}, timeout=REQUEST_TIMEOUT)
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

    return response.json(), None


def main():
    banner()
    log("Agent initialized. Waiting for commands.")

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
