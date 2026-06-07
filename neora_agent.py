import time
import requests
import os
import subprocess
import webbrowser
import base64
import io
import json
import sys
from datetime import datetime

# Neora OS Remote Control Client Configuration
BROKER_URL = "https://ais-pre-qwrnlnkrfbvntjfvwzgvqw-605425403829.asia-east1.run.app"
AGENT_TOKEN = "NEORA-X7-AGENT"
POLL_INTERVAL = 4

print("==========================================================")
print("             NEORA COGNITIVE OS WORKSPACE AGENT           ")
print("==========================================================")

# --- RESILIENT AUTOMATIC SECURE SESSION MANAGEMENT (GOOGLE AUTH GATED BYPASS) ---
def retrieve_authenticated_headers():
    config_file = "neora_config.json"
    config = {}
    
    # Load config file if it exists
    if os.path.exists(config_file):
        try:
            with open(config_file, "r", encoding="utf-8") as f:
                config = json.load(f)
        except Exception:
            pass
            
    cookie = config.get("cookie", "")
    
    while True:
        if cookie:
            # Test authentication connection to see if it bypasses Google's login proxy
            headers = {"cookie": cookie}
            try:
                res = requests.get(f"{BROKER_URL}/api/os/status", headers=headers, timeout=5)
                responseText = res.text.strip()
                is_html = (
                    "text/html" in res.headers.get("Content-Type", "") or 
                    responseText.startswith("<!doctype") or 
                    responseText.startswith("<html")
                )
                if res.status_code == 200 and not is_html:
                    # Valid connection successful! Save and return.
                    config["cookie"] = cookie
                    try:
                        with open(config_file, "w", encoding="utf-8") as f:
                            json.dump(config, f, indent=4)
                    except Exception:
                        pass
                    return headers
            except Exception as e:
                print(f"[RETRY] Connection handshake error: {e}")
                
        # If expired or missing, show interactive Bengali & English guide
        print("\n" + "="*75)
        print("🔑   NEORA SECURE INTERACTIVE LOGIN OVERPASS (GOOGLE CLOUD GATED)")
        print("="*75)
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
        print("="*75)
        
        print("\n📋 Paste your copied Cookie OR Full Request Headers block (then press Enter key):")
        
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
            
        # Sophisticated parsing logic to extract the actual cookie value from raw headers paste
        extracted_cookie = ""
        lines = [l.strip() for l in raw_pasted.split("\n") if l.strip()]
        
        cookie_found = False
        for i, line in enumerate(lines):
            # Matches "cookie: <value>" standard header line
            if line.lower().startswith("cookie:"):
                extracted_cookie = line[7:].strip()
                cookie_found = True
                break
            # Matches "cookie" and adjacent value on next line (e.g., standard key-value copy)
            elif line.lower() == "cookie":
                if i + 1 < len(lines):
                    extracted_cookie = lines[i+1]
                    cookie_found = True
                    break
                    
        if not cookie_found:
            # Fallback to cleaning up double quotes or spaces around whatever single-line text was pasted
            extracted_cookie = raw_pasted.strip("'\" \t\r\n")
            
        if extracted_cookie.lower().startswith("cookie:"):
            extracted_cookie = extracted_cookie[7:].strip()
            
        cookie = extracted_cookie.strip()
        if not cookie:
            print("❌ Input parsing failed. Make sure you copied correctly.")
            cookie = ""
            continue
            
        print("🔄 Connecting and testing token session validity...")

# Initialize session headers
HEADERS = retrieve_authenticated_headers()
print("[INFO] Google Security session cookie loaded. Remote handshake completed successfully!")
print(f"Connecting to: {BROKER_URL}")
print(f"Agent Lock Token: {AGENT_TOKEN}")
print("Status: Initializing dependency verification...")

# Visual libraries validation check
PYAUTOGUI_AVAILABLE = False
PILLOW_AVAILABLE = False

try:
    import pyautogui
    PYAUTOGUI_AVAILABLE = True
    pyautogui.FAILSAFE = True
    print("[SUCCESS] PyAutoGUI module loaded.")
except ImportError:
    print("[WARNING] PyAutoGUI is not installed. Keyboard and mouse actions will be system logged but bypassed.")

try:
    from PIL import Image
    PILLOW_AVAILABLE = True
    print("[SUCCESS] Pillow Image module loaded.")
except ImportError:
    print("[WARNING] Pillow Library is not installed. Screen visual capture is limited.")

print("Status: Desktop Automation broker ready and active.")
print("Listening for incoming vocal or textual prompts from Control Dashboard...")

# Send periodic ping to update presence status
def send_ping():
    try:
        payload = {
            "token": AGENT_TOKEN,
            "client_time": datetime.now().isoformat()
        }
        requests.post(f"{BROKER_URL}/api/os/ping", json=payload, headers=HEADERS, timeout=5)
    except Exception as e:
        pass

# Captures standard Windows, macOS or Linux desktop screenshot
def capture_screenshot_base64():
    if not (PYAUTOGUI_AVAILABLE and PILLOW_AVAILABLE):
        return None
    try:
        # Take screenshot standard RGB pillow
        screenshot = pyautogui.screenshot()
        # Resize if high retina display to avoid heavy payload sizes
        if screenshot.width > 1920:
            screenshot.thumbnail((1600, 1000))
        
        buffered = io.BytesIO()
        screenshot.save(buffered, format="JPEG", quality=70) # Optimal Compression ratio
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return f"data:image/jpeg;base64,{img_str}"
    except Exception as e:
        print(f"Screenshot capture issue: {str(e)}")
        return None

# Process individual parsed action steps compiled by Neora's LLM
def execute_instruction(action, param):
    logs = []
    print(f"Executing: {action.upper()} | Argument: {param}")
    logs.append(f"Started Action: {action} with param: '{param}'")

    try:
        if action == "open_browser":
            webbrowser.open(param)
            logs.append(f"Successfully triggered browser navigation to URL: {param}")
            time.sleep(2)
            
        elif action == "write_file":
            # format example: "notes.txt:Content text here"
            parts = param.split(":", 1)
            filename = parts[0] if parts[0] else "output_note.txt"
            content = parts[1] if len(parts) > 1 else ""
            with open(filename, "w", encoding="utf-8") as f:
                f.write(content)
            logs.append(f"Saved local text file: '{filename}' successfully.")
            
        elif action == "execute_cmd":
            # For executing arbitrary executable shell files, calculators or programs
            subprocess.Popen(param, shell=True)
            logs.append(f"Launched executable process context for shell command: '{param}'")
            time.sleep(2.5)
            
        elif action == "type_text":
            if PYAUTOGUI_AVAILABLE:
                pyautogui.click() # Click to focus context first
                time.sleep(0.5)
                pyautogui.write(param, interval=0.01)
                logs.append(f"Simulated typed characters sequence: '{param}'")
            else:
                logs.append(f"[Fallback/Bypassed] Type Request simulated: '{param}'")
                
        elif action == "press_key":
            if PYAUTOGUI_AVAILABLE:
                pyautogui.click()
                time.sleep(0.3)
                keys = param.lower().replace(" ", "").split("+")
                if len(keys) > 1:
                    pyautogui.hotkey(*keys)
                else:
                    pyautogui.press(keys[0])
                logs.append(f"Pressed hotkey combinations: {param}")
            else:
                logs.append(f"[Fallback/Bypassed] Keystroke action: {param}")
                
        elif action == "take_screenshot":
            # Handled synchronously natively
            logs.append("Action executed: Screenshot queued.")
            
        elif action == "alert_msg":
            if PYAUTOGUI_AVAILABLE:
                pyautogui.alert(text=param, title="Neora Autonomous Agent Notification")
                logs.append(f"Displayed popup graphical window alerts: '{param}'")
            else:
                print(f"ALERT popup: {param}")
                logs.append(f"Alert output in terminal: '{param}'")
                
        else:
            logs.append(f"Unsupported custom action type: {action}")
            
    except Exception as err:
        print(f"Error while running action {action}: {err}")
        logs.append(f"ERROR: Execution failed for action '{action}'. Details: {str(err)}")
        
    return logs

# Main agent listener polling query loop
last_ping_time = time.time() - 30

while True:
    now = time.time()
    # Sending regular pings to indicate system status is online
    if now - last_ping_time >= 10:
        send_ping()
        last_ping_time = now

    try:
        # Long-polling queue endpoint
        res = requests.get(f"{BROKER_URL}/api/os/poll?token={AGENT_TOKEN}", headers=HEADERS, timeout=10)
        if res.status_code == 200:
            responseText = res.text.strip()
            # Dynamic authentication check (if receiving Google/AI Studio OAuth HTML gate instead of JSON)
            if "text/html" in res.headers.get("Content-Type", "") or responseText.startswith("<!doctype") or responseText.startswith("<html"):
                print('
[SESSION EXPIRED / RE-AUTHENTICATION REQUIRED]')
                print("Your active browser session has dropped. Let's re-authenticate...")
                if os.path.exists("neora_config.json"):
                    try:
                        os.remove("neora_config.json")
                    except Exception:
                        pass
                HEADERS = retrieve_authenticated_headers()
                continue

            data = res.json()
            if data.get("hasCommand"):
                cmd_id = data.get("commandId")
                prompt_text = data.get("prompt")
                actions_list = data.get("actions", [])
                
                print(f'
[INCOMING PROMPT] => "{prompt_text}"')
                print(f"Processing command actions queue ({len(actions_list)} layers)...")
                
                execution_logs = [f"Desktop execution started for command: '{prompt_text}'"]
                success_count = 0
                
                # Execute actions list sequentially
                for idx, act in enumerate(actions_list):
                    step_logs = execute_instruction(act.get("action"), act.get("param"))
                    execution_logs.extend(step_logs)
                    success_count += 1
                
                # Take live desktop screenshots
                screenshot_base64 = capture_screenshot_base64()
                
                # Prepare execution updates payload
                report_payload = {
                    "token": AGENT_TOKEN,
                    "commandId": cmd_id,
                    "status": "success",
                    "logs": execution_logs,
                    "screenshot": screenshot_base64,
                    "result": f"Completed {success_count}/{len(actions_list)} automation actions."
                }
                
                # Report back to the Neora cloud server
                requests.post(f"{BROKER_URL}/api/os/report", json=report_payload, headers=HEADERS, timeout=10)
                print("[REPORT SUCCESS] Sent logs and image visual metrics back to Neora.")
                
        elif res.status_code == 401:
            print('
[UNAUTHORIZED] The token NEORA-X7-AGENT does not match. Update the AGENT_TOKEN inside the script.')
            time.sleep(8)
        else:
            print(f"Server responded with code {res.status_code}")
            
    except Exception as poll_error:
        print(f"Connection issue or network failure: {str(poll_error)}")
        
    time.sleep(POLL_INTERVAL)
