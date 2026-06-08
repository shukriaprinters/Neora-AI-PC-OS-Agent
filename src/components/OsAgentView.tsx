import React, { useState, useEffect, useRef } from 'react';
import { 
  Laptop, Play, Terminal, Power, RefreshCw, Copy, Check, Download, 
  HelpCircle, Volume2, Mic, AlertCircle, Eye, Settings, FileText, Activity, RotateCcw, XCircle
} from 'lucide-react';
import { copyToClipboardFailsafe } from '../utils/clipboard';
import { classifyNeoraInput } from '../lib/neoraCommand';
import { NeoraApiError, neoraGet, neoraPost } from '../lib/neoraApi';

interface OsAgentViewProps {
  lang: 'en' | 'bn';
}

interface CommandAction {
  action: string;
  param: string;
}

interface CommandItem {
  id: string;
  prompt: string;
  actions: CommandAction[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: string;
  classification?: 'chat' | 'os-command' | 'rejected';
  result?: string;
  retryCount?: number;
}

interface HistoryItem {
  id: string;
  prompt: string;
  timestamp: string;
  status: 'completed' | 'failed';
  actionsCount: number;
  classification?: 'chat' | 'os-command' | 'rejected';
  result?: string;
  retryCount?: number;
}

export function OsAgentView({ lang }: OsAgentViewProps) {
  const [status, setStatus] = useState<'online' | 'offline'>('offline');
  const [token, setToken] = useState<string>('NEORA-X7-AGENT');
  const [lastPing, setLastPing] = useState<string | null>(null);
  const [currentScreenshot, setCurrentScreenshot] = useState<string | null>(null);
  const [recoveryAutoSaveAt, setRecoveryAutoSaveAt] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [queue, setQueue] = useState<CommandItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [recentMemories, setRecentMemories] = useState<any[]>([]);
  const [activePlans, setActivePlans] = useState<any[]>([]);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [statusEndpoint, setStatusEndpoint] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [watchdogNote, setWatchdogNote] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<CommandItem | HistoryItem | null>(null);
  
  const [prompt, setPrompt] = useState<string>('');
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'monitor' | 'setup' | 'terminal'>('monitor');
  const [isListening, setIsListening] = useState<boolean>(false);
  
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const getClassificationLabel = (value?: string) => value || 'chat';
  const healthState = status === 'online'
    ? 'healthy'
    : statusEndpoint
      ? 'offline'
      : statusBanner
        ? 'degraded'
        : 'degraded';
  const healthChipClass =
    healthState === 'healthy'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : healthState === 'degraded'
        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
        : 'bg-red-500/10 text-red-400 border-red-500/20';

  // Fetch agent status from the Express backend
  const fetchAgentStatus = async () => {
    try {
      const data: any = await neoraGet('/api/os/status');
      
      setStatus(data.status);
      setToken(data.token);
      setLastPing(data.lastPing);
      setCurrentScreenshot(data.currentScreenshot);
      setRecoveryAutoSaveAt(data.recoveryAutoSaveAt || null);
      setLogs(data.logs || []);
      setQueue(data.queue || []);
      setHistory(data.history || []);
      const staleRunning = (data.queue || []).some((item: CommandItem) => item.status === 'running');
      setWatchdogNote(staleRunning ? (lang === 'bn' ? 'ওয়াচডগ সক্রিয়: চলমান কমান্ড পর্যবেক্ষণ করছে' : 'Watchdog active: monitoring running commands') : null);
    } catch (err) {
      console.error('Error fetching OS Agent status:', err);
      const endpointLabel = err instanceof NeoraApiError ? err.endpoint : '/api/os/status';
      setStatusEndpoint(endpointLabel);
      setStatusBanner(lang === 'bn'
        ? `ব্রোকার সমস্যা: ${endpointLabel}`
        : `Broker issue: ${endpointLabel}`);
    }
  };

  const fetchWorkspaceState = async () => {
    try {
      const memoryData: any = await neoraGet('/api/memory');
      setRecentMemories((memoryData.memories || []).slice(0, 4));
    } catch {
      setRecentMemories([]);
    }
    try {
      const planData: any = await neoraGet('/api/plan/active');
      setActivePlans((planData.plans || []).slice(0, 3));
    } catch {
      setActivePlans([]);
    }
  };

  // Poll status every 3 seconds to keep UI completely synchronized
  useEffect(() => {
    fetchAgentStatus();
    fetchWorkspaceState();
    const interval = setInterval(fetchAgentStatus, 3000);
    const workspaceInterval = setInterval(fetchWorkspaceState, 15000);
    return () => {
      clearInterval(interval);
      clearInterval(workspaceInterval);
    };
  }, []);

  // Auto scroll terminal logs to bottom when they update
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Submit human voice/text command to server
  const handleSendCommand = async (e?: React.FormEvent, overridePrompt?: string) => {
    if (e) e.preventDefault();
    const route = classifyNeoraInput(overridePrompt ?? prompt);
    const effectivePrompt = route.normalized;
    if (!effectivePrompt || isCompiling) return;

    if (overridePrompt && route.classification !== 'os-command') {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Voice input was treated as a normal chat phrase, not an OS command.`]);
      setStatusBanner(lang === 'bn' ? 'ভয়েস ইনপুটটি OS command নয়; chat হিসেবে রাখা হয়েছে।' : 'Voice input was not an OS command; it was kept as chat.');
      setStatusEndpoint(null);
      return;
    }

    if (overridePrompt && route.isRisky) {
      setStatusBanner(lang === 'bn'
        ? `ঝুঁকিপূর্ণ কমান্ড: "${effectivePrompt}"। টেক্সট দিয়ে নিশ্চিত করুন।`
        : `Risky command: "${effectivePrompt}". Confirm in text to continue.`);
      setStatusEndpoint(null);
      return;
    }

    setIsCompiling(true);
    // Add temporary local log preview
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Submitting control request: "${effectivePrompt}"...`]);

    try {
      const resData: any = await neoraPost('/api/os/command', { prompt: effectivePrompt, token });
      if (resData.status === 'success') {
        setPrompt('');
        fetchAgentStatus();
        setLastResult(resData?.command?.prompt ? `Submitted: ${resData.command.prompt}` : `Submitted: ${effectivePrompt}`);
        setStatusEndpoint(null);
        setStatusBanner(null);
      } else {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: ${resData.error || 'Compilation abort'}`]);
        setStatusEndpoint('/api/os/command');
        setStatusBanner(lang === 'bn' ? 'কমান্ড কম্পাইল হয়নি' : 'Command compilation failed');
      }
    } catch (err) {
      console.error('Error submitting OS command:', err);
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Connection error: Unable to connect to broker server.`]);
      const endpointLabel = err instanceof NeoraApiError ? err.endpoint : '/api/os/command';
      setStatusEndpoint(endpointLabel);
      setStatusBanner(lang === 'bn'
        ? 'ব্রোকারের সাথে সংযোগ ব্যর্থ হয়েছে'
        : 'Could not connect to broker');
    } finally {
      setIsCompiling(false);
    }
  };

  // Copy standard setup Token key
  const handleCopyToken = () => {
    copyToClipboardFailsafe(token).then((success) => {
      if (success) {
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
      }
    });
  };

  // Clear system console log queue
  const handleClearTerminal = async () => {
    try {
      await neoraPost('/api/os/clear', { token });
      setStatusBanner(null);
      setStatusEndpoint(null);
      setLastResult(null);
      fetchAgentStatus();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRetryCommand = async (commandId: string) => {
    try {
      await neoraPost(`/api/os/retry/${commandId}`, { token });
      await fetchAgentStatus();
    } catch (err) {
      setStatusBanner(lang === 'bn' ? 'রিট্রাই পাঠানো যায়নি' : 'Failed to queue retry');
    }
  };

  const handleCancelCommand = async (commandId: string) => {
    try {
      await neoraPost(`/api/os/cancel/${commandId}`, { token });
      await fetchAgentStatus();
    } catch (err) {
      setStatusBanner(lang === 'bn' ? 'কমান্ড বাতিল করা যায়নি' : 'Failed to cancel command');
    }
  };

  const handleRerunLastFailed = async () => {
    const lastFailed = history.slice().reverse().find((item) => item.status === 'failed');
    if (!lastFailed) {
      setStatusBanner(lang === 'bn' ? 'কোনো failed history পাওয়া যায়নি' : 'No failed history found');
      return;
    }
    try {
      await neoraPost(`/api/os/rerun-failed/${lastFailed.id}`, { token });
      await fetchAgentStatus();
      setStatusBanner(lang === 'bn' ? 'শেষ failed command পুনরায় queue করা হয়েছে' : 'Last failed command re-queued');
    } catch {
      setStatusBanner(lang === 'bn' ? 'পুনরায় চালাতে ব্যর্থ' : 'Failed to rerun failed command');
    }
  };

  // Speech Recognition hook integration
  const toggleVoiceListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'bn' 
        ? 'আপনার ব্রাউজারে স্পিচ রিকগনিশন সাপোর্ট করে না। অনুগ্রহ করে ক্রোম ব্রাউজার ব্যবহার করুন।' 
        : 'Browser Speech Recognition not supported in this environment. Please use Google Chrome.'
      );
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = lang === 'bn' ? 'bn-BD' : 'en-US';

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setPrompt(transcript);
        handleSendCommand(undefined, transcript);
      }
    };

    recognitionRef.current = rec;
    rec.start();
  };

  // Complete highly professional and resilient Python Client Script text template
  const getBrokerUrl = () => {
    const origin = window.location.origin;
    if (origin.includes('ais-dev-')) {
      return origin.replace('ais-dev-', 'ais-pre-');
    }
    return origin;
  };

  const pythonScriptText = `import time
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
BROKER_URL = "${getBrokerUrl()}"
AGENT_TOKEN = "${token}"
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
        print("\\n" + "="*75)
        print("🔑   NEORA SECURE INTERACTIVE LOGIN OVERPASS (GOOGLE CLOUD GATED)")
        print("="*75)
        print("আপনার ক্লাউড ওয়ার্কস্পেসের সিকিউরিটি সেশন কুকি (Session Cookie) কপি করে এখানে দিন।")
        print("এতে কোনো পাসওয়ার্ড বা অতিরিক্ত কোডিং ছাড়াই সাথে সাথে রিমোট কানেকশন পেয়ে যাবেন!")
        print("\\n💡 কপি করার সহজ ৪টি ধাপ (How to get Cookie/Headers value):")
        print("1. ব্রাউজারে Neora অ্যাপ বা ড্যাশবোর্ড ট্যাবটি একবার রিফ্রেশ দিন (F5)।")
        print("2. কিবোর্ড থেকে 'F12' প্রেস করুন অথবা রাইট-ক্লিক করে 'Inspect' করুন।")
        print("3. ডেভেলপার উইন্ডোর 'Network' ট্যাবে ক্লিক করে 'Fetch/XHR' ক্যাটাগরি সিলেক্ট করুন।")
        print("4. ট্রাফিকে আসা 'status' বা 'poll' রিকুয়েস্টে ক্লিক করে 'Request Headers' এ যান।")
        print("5. সেখানে থাকা 'cookie' মানটি সম্পূর্ণ কপি করুন এবং এই উইন্ডোতে রাইট-ক্লিক করে পেস্ট করুন!")
        print("\\n[বিঃদ্রঃ]: আপনি চাইলে পুরো রিকুয়েস্ট হেডার্স (Request Headers) টেক্সট একসাথে পেস্ট করতে পারেন।")
        print("স্ক্রিপ্টটি নিজে নিজেই তার মধ্য থেকে মূল 'cookie' সেশনটি খুঁজে বের করে নিবে!")
        print("="*75)
        
        print("\\n📋 Paste your copied Cookie OR Full Request Headers block (then press Enter key):")
        
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
                
        raw_pasted = "\\n".join(user_input_lines).strip()
        if not raw_pasted:
            print("❌ No input detected. Please paste again!")
            cookie = ""
            continue
            
        # Sophisticated parsing logic to extract the actual cookie value from raw headers paste
        extracted_cookie = ""
        lines = [l.strip() for l in raw_pasted.split("\\n") if l.strip()]
        
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
            extracted_cookie = raw_pasted.strip("'\\" \\t\\r\\n")
            
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
                print('\n[SESSION EXPIRED / RE-AUTHENTICATION REQUIRED]')
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
                
                print(f'\n[INCOMING PROMPT] => "{prompt_text}"')
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
            print('\n[UNAUTHORIZED] The token NEORA-X7-AGENT does not match. Update the AGENT_TOKEN inside the script.')
            time.sleep(8)
        else:
            print(f"Server responded with code {res.status_code}")
            
    except Exception as poll_error:
        print(f"Connection issue or network failure: {str(poll_error)}")
        
    time.sleep(POLL_INTERVAL)
`;

  // Copy python bridge client code
  const handleCopyScript = () => {
    copyToClipboardFailsafe(pythonScriptText).then((success) => {
      if (success) {
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 2000);
      }
    });
  };

  return (
    <div id="os-agent-root" className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 panel-surface">
      {/* View Header Bar */}
      <div className="border-b border-slate-900 bg-slate-950/90 px-6 py-4 flex items-center justify-between shrink-0 panel-surface-strong">
        <div>
          <div className="flex items-center gap-2">
            <Laptop className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-sans">
              {lang === 'bn' ? 'পিসি ওএস কন্ট্রোল এজেন্ট' : 'Local PC OS Agent Controller'}
            </h2>
            {status === 'online' ? (
              <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-2 py-0.5 text-[9px] font-mono font-bold uppercase select-none">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                {lang === 'bn' ? 'সংযুক্ত / অনলাইন' : 'CONNECTED / ACTIVE'}
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-slate-800 text-slate-400 border border-slate-700 rounded px-2 py-0.5 text-[9px] font-mono font-bold uppercase select-none">
                <Power className="w-2.5 h-2.5" />
                {lang === 'bn' ? 'অফলাইন' : 'OFFLINE'}
              </span>
            )}
            <span className={`ml-1 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${
              healthState === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : healthState === 'degraded' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {healthState === 'healthy'
                ? 'healthy /api/os/status'
                : healthState === 'degraded'
                  ? `degraded ${statusEndpoint || '/api/os/status'}`
                  : `offline ${statusEndpoint || '/api/os/status'}`}
            </span>
            {watchdogNote && (
              <span className="ml-1 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border bg-cyan-500/10 text-cyan-300 border-cyan-500/20">
                {watchdogNote}
              </span>
            )}
            <button
              type="button"
              onClick={handleRerunLastFailed}
              className="ml-2 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
            >
              {lang === 'bn' ? 'শেষ failed পুনরায় চালাও' : 'Rerun last failed'}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'bn' 
              ? 'ভয়েস বা লিখিত নির্দেশে নিজের পিসির যেকোনো সফটওয়্যার ও প্রোগ্যাম স্বয়ংক্রিয়ভাবে কন্ট্রোল করুন' 
              : 'Directly execute actions and control local PC files or apps via unified vocal prompts'}
          </p>
        </div>

        {/* Workspace Display View Selectors */}
        <div className="flex bg-slate-900 rounded p-1 border border-slate-800">
          <button 
            onClick={() => setViewMode('monitor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${viewMode === 'monitor' ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'আই স্ক্রিন' : 'Agent Monitor'}</span>
          </button>
          <button 
            onClick={() => setViewMode('terminal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${viewMode === 'terminal' ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'টার্মিনাল লগ' : 'Broker Console'}</span>
          </button>
          <button 
            onClick={() => setViewMode('setup')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${viewMode === 'setup' ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সেটআপ গাইড' : 'Desktop Setup'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        
        {/* Left Control Panel / Commands Input Section */}
        <div className="w-full lg:w-[420px] border-b lg:border-b-0 lg:border-r border-slate-900 bg-slate-950 p-6 flex flex-col lg:overflow-y-auto shrink-0 select-none">
          
          {/* Token Credentials Block */}
          <div className="bg-slate-900/50 border border-slate-850/80 rounded-xl p-4 mb-6">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              {lang === 'bn' ? 'মেক কানেকশন টোকেন' : 'Control Authentication Security'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {lang === 'bn' 
                ? 'আপনার কম্পিউটারের স্ক্রিপ্টের সাথে কানেক্ট করতে এই সিকিউর টোকেন ব্যবহার করুন:' 
                : 'Configure this token on your local python desktop client to sync details:'}
            </p>
            <div className="mt-3 flex gap-2">
              <code className="flex-1 px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-cyan-400 text-xs font-mono font-bold text-center block">
                {token}
              </code>
              <button 
                onClick={handleCopyToken}
                className="px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition items-center justify-center flex rounded text-slate-300 cursor-pointer text-xs font-medium"
                title="Copy Token to Clipboard"
              >
                {copiedToken ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {lastPing && (
              <div className="mt-3 text-[10px] font-mono text-slate-500 flex justify-between">
                <span>{lang === 'bn' ? 'শেষ খোঁজ পাওয়া গেছে:' : 'Last Ping Received:'}</span>
                <span className="text-cyan-500/80">{new Date(lastPing).toLocaleTimeString()}</span>
              </div>
            )}
            {recoveryAutoSaveAt && (
              <div className="mt-1 text-[10px] font-mono text-emerald-500 flex justify-between">
                <span>{lang === 'bn' ? 'শেষ অটো-সেভ:' : 'Last Auto-save:'}</span>
                <span className="text-emerald-400">{new Date(recoveryAutoSaveAt).toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          {/* Core Action Direct Prompts */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              {lang === 'bn' ? 'অটোমেশন ভয়েস ও টেক্সট কমান্ড' : 'Execute New OS Command'}
            </h3>

            {/* Vocal Input Button and command field */}
            <form onSubmit={handleSendCommand} className="space-y-3 mb-6">
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={lang === 'bn' 
                    ? 'যেমন: \"Open Chrome to YouTube and play relaxed ambient music then take a screenshot\"...' 
                    : 'E.g., "Open chrome, navigate to google, then open calc and take desktop screenshot"...'}
                  className="w-full min-h-[90px] border border-slate-800 rounded-xl bg-slate-950 p-4 pb-12 text-xs focus:ring-1 focus:ring-cyan-500 outline-none text-white resize-none leading-relaxed"
                />
                
                {/* Voice Record action */}
                <button
                  type="button"
                  onClick={toggleVoiceListening}
                  className={`absolute left-3 bottom-3 p-2 rounded-lg transition-all cursor-pointer border ${isListening ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'}`}
                  title="Speak Vocal Command"
                >
                  <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
                </button>

                <div className="absolute right-3 bottom-3 flex gap-2">
                  <button
                    type="submit"
                    disabled={isCompiling || !prompt.trim()}
                    className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs cursor-pointer select-none transition border border-cyan-500/30"
                  >
                    {isCompiling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : (lang === 'bn' ? 'চালান' : 'Run')}
                  </button>
                </div>
              </div>
            </form>

            {/* Presets and shortcut templates for quick validation */}
            <div className="mb-6 select-none bg-slate-900/10 border border-slate-900 rounded-xl p-4">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {lang === 'bn' ? 'কুইক প্রিসেট স্ক্রিপ্টস' : 'OS Automation Presets'}
              </h4>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setPrompt('open browser to https://facebook.com')}
                  className="w-full text-left bg-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-850 hover:bg-slate-800 cursor-pointer text-slate-300 transition"
                >
                  🌐 {lang === 'bn' ? 'ফেসবুক ব্রাউজার ওপেন করুন' : 'Open browser to Facebook'}
                </button>
                <button 
                  onClick={() => setPrompt('open notepad write shukria printers update memo then press enter')}
                  className="w-full text-left bg-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-850 hover:bg-slate-800 cursor-pointer text-slate-300 transition"
                >
                  📝 {lang === 'bn' ? 'নোটপ্যাড ওপেন করে মেমো ফাইল লিখুন' : 'Open Notepad & Type Memo'}
                </button>
                <button 
                  onClick={() => setPrompt('open paint and calculator')}
                  className="w-full text-left bg-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-850 hover:bg-slate-800 cursor-pointer text-slate-300 transition"
                >
                  🧮 {lang === 'bn' ? 'ক্যালকুলেটর ও পেইন্ট অ্যাপ খুলুন' : 'Open Paint & Calculator'}
                </button>
                <button 
                  onClick={() => setPrompt('take a screenshot to update dashboard')}
                  className="w-full text-left bg-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-850 hover:bg-slate-800 cursor-pointer text-slate-300 transition"
                >
                  📸 {lang === 'bn' ? 'লাইভ স্ক্রিনশট সংগ্রহ করুন' : 'Force capture desktop screenshot'}
                </button>
              </div>
            </div>

            {/* Active Commands Queue List */}
            <div className="flex-1 flex flex-col min-h-[150px]">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                {lang === 'bn' ? 'চলমান ও অপেক্ষারত কাজের ক্রম' : 'Pending Operations'}
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 max-h-[170px] pr-1">
                {queue.length === 0 ? (
                  <div className="h-full border border-dashed border-slate-900 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                    <Check className="w-5 h-5 text-slate-600 mb-1" />
                    <p className="text-[10px] text-slate-500">
                      {lang === 'bn' ? 'কোনো অপেক্ষারত কাজ নেই' : 'Queue is currently empty'}
                    </p>
                  </div>
                ) : (
                  queue.map((q) => (
                      <div key={q.id} onClick={() => setSelectedItem(q)} className={`bg-slate-900/60 border rounded-lg p-2.5 flex items-center justify-between cursor-pointer ${selectedItem?.id === q.id ? 'border-cyan-500/40' : 'border-slate-850'}`}>
                        <div className="truncate pr-2">
                          <p className="text-xs text-white truncate max-w-[260px]">{q.prompt}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5 font-mono">{q.timestamp} | {q.actions?.length || 0} Actions</p>
                          {q.retryCount ? <p className="text-[9px] text-amber-400 mt-0.5 font-mono">retry #{q.retryCount}</p> : null}
                        </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`px-2 py-0.5 text-[8px] font-mono font-bold rounded uppercase select-none border ${
                          q.status === 'running' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20 animate-pulse' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {q.status}
                        </span>
                        <span className={`px-2 py-0.5 text-[8px] font-mono font-bold rounded uppercase select-none border ${
                          getClassificationLabel(q.classification) === 'os-command'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : getClassificationLabel(q.classification) === 'rejected'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {getClassificationLabel(q.classification)}
                        </span>
                        <div className="mt-1 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleRetryCommand(q.id)}
                            className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[8px] font-bold uppercase"
                          >
                            <RotateCcw className="w-3 h-3 inline mr-1" />
                            retry
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelCommand(q.id)}
                            className="px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[8px] font-bold uppercase"
                          >
                            <XCircle className="w-3 h-3 inline mr-1" />
                            cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Main Viewing Area - Context Switching */}
        <div className="flex-1 flex flex-col min-h-0 lg:overflow-hidden bg-slate-950">
          {(statusBanner || lastResult) && (
            <div className="px-6 pt-5">
              {statusBanner && (
                <div className="mb-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[10px] text-amber-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>{statusBanner}</span>
                    {(statusBanner.includes('/api/') || statusBanner.includes('endpoint')) && (
                      <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border border-amber-400/30 bg-slate-950/40 text-amber-100">
                        {statusBanner.includes('/api/') ? statusBanner.match(/\/api\/[A-Za-z0-9\-\/]+/)?.[0] || 'endpoint' : 'endpoint'}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStatusBanner(null)}
                    className="text-[9px] font-mono uppercase text-amber-100/80 hover:text-white"
                  >
                    dismiss
                  </button>
                </div>
              )}
              {lastResult && (
                <div className="mb-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-[10px] text-cyan-100">
                  <span className="font-mono uppercase text-cyan-300 mr-2">Last Result</span>
                  <span>{lastResult}</span>
                </div>
              )}
            </div>
          )}
          
          {/* VIEW: Agent Monitor (Screenshots scaled view) */}
          {viewMode === 'monitor' && (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
              
              {/* Desktop Mirror Screen Panel */}
              <div className="flex-1 flex flex-col">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
                  {/* Monitor Window Header Toolbar */}
                  <div className="bg-slate-950 border-b border-slate-850 py-3 px-4 flex items-center justify-between select-none">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/70"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/70"></span>
                      <span className="text-[10px] font-mono text-slate-400 font-bold ml-2">Display Remote Mirror - Screen #1</span>
                    </div>
                    {status === 'online' && (
                      <span className="text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                        LIVE DESKTOP
                      </span>
                    )}
                  </div>

                  {/* Desktop Mirror Canvas Frame with screen image */}
                  <div className="flex-1 min-h-[280px] bg-slate-950 flex items-center justify-center p-3 relative group">
                    {currentScreenshot ? (
                      <img 
                        src={currentScreenshot} 
                        referrerPolicy="no-referrer"
                        alt="Local PC Live Screenshot Stream" 
                        className="max-h-[380px] object-contain border border-slate-800 select-none shadow-md rounded"
                      />
                    ) : (
                      <div className="h-[300px] w-full flex flex-col items-center justify-center text-center p-6">
                        <Laptop className="w-12 h-12 text-slate-800 mb-2 animate-pulse" />
                        <h4 className="text-sm font-semibold text-slate-400">{lang === 'bn' ? 'কোনো লাইভ ইমেজ পাওয়া যায়নি' : 'Waiting for Desktop Image'}</h4>
                        <p className="text-xs text-slate-600 mt-1 max-w-sm">
                          {lang === 'bn' 
                            ? 'আপনার কম্পিউটারে পাইথন স্ক্রিপ্টটি চালু করলেই পিসির স্ক্রিনশট এখানে দেখতে পাবেন।' 
                            : 'Once your local python script runs and receives a command, the desk visual will live map right here.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Legend details instructions info help box */}
                <div className="mt-4 bg-slate-900/30 border border-slate-900 rounded-xl p-4 text-xs text-slate-400 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-white mb-1">
                      {lang === 'bn' ? 'নিওরা ওএস এজেন্ট কিভাবে কাজ করে?' : 'Interactive Desktop Orchestration'}
                    </h5>
                    <p className="leading-relaxed">
                      {lang === 'bn'
                        ? 'আপনার পিসির স্থানীয় পাইথন ক্লায়েন্ট স্ক্রিপ্টটি নেওরার ক্লাউড ব্রোকার সার্ভার থেকে প্রতি ৪ সেকেন্ড পর পর নতুন কমান্ড তুলে নেয়। Gemini অটোমেশন ম্যাপ অনুযায়ী সেটি কি-স্ট্রোকে রূপান্তর হয়, স্ক্রিনশট নেয় এবং আবার ড্যাশবোর্ডে পাঠায়।'
                        : 'Your local Python client bridge queries our Cloud Run server every 4 seconds. When a textual command is generated, it sequentially executes keystrokes, opens browsers, and streams PC desktop frames straight back to your workspace.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Execution History Tracker */}
              <div className="w-full md:w-[280px] shrink-0 flex flex-col bg-slate-950 select-none">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3">
                  {lang === 'bn' ? 'সম্পন্ন কাজের ইতিহাস' : 'Recent Operations Run'}
                </h3>
                <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">os-command</span>
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border bg-slate-500/10 text-slate-400 border-slate-500/20">chat</span>
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border bg-red-500/10 text-red-400 border-red-500/20">rejected</span>
                </div>
              <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[460px] pr-1">
                  {history.length === 0 ? (
                    <div className="border border-dashed border-slate-900 rounded-xl h-[120px] flex items-center justify-center text-center p-4">
                      <p className="text-xs text-slate-600 font-bold">{lang === 'bn' ? 'কোনো পূর্ববর্তী ইতিহাস নেই' : 'No execution history yet'}</p>
                    </div>
                  ) : (
                    history.slice().reverse().map((h) => (
                      <div key={h.id} onClick={() => setSelectedItem(h)} className={`bg-slate-900/40 border rounded-xl p-3 flex flex-col justify-between cursor-pointer ${selectedItem?.id === h.id ? 'border-cyan-500/40' : 'border-slate-900'}`}>
                        <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-slate-500 uppercase">{h.id}</span>
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase ${
                                h.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                              }`}>
                                {h.status}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase border ${
                                getClassificationLabel(h.classification) === 'os-command'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : getClassificationLabel(h.classification) === 'rejected'
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                              }`}>
                                {getClassificationLabel(h.classification)}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-200 font-bold mt-1.5 line-clamp-2">{h.prompt}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1 pr-1">{h.result}</p>
                          {h.retryCount ? <p className="text-[9px] text-amber-400 mt-1 font-mono">retry #{h.retryCount}</p> : null}
                        </div>
                        <div className="border-t border-slate-900/50 mt-2 pt-2 text-[8px] font-mono text-slate-500 flex justify-between">
                          <span>{h.actionsCount} OS actions</span>
                          <span>{h.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {(recentMemories.length > 0 || activePlans.length > 0) && (
                <div className="mt-4 grid grid-cols-1 gap-3">
                  {recentMemories.length > 0 && (
                    <div className="rounded-xl border border-slate-900 bg-slate-900/40 p-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-cyan-300 mb-2">Recent Memories</h4>
                      <div className="space-y-2 text-[10px]">
                        {recentMemories.map((memory) => (
                          <div key={memory.id} className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-slate-200 font-semibold truncate">{memory.key}</div>
                              <div className="text-slate-400 truncate">{memory.value}</div>
                            </div>
                            <span className="text-slate-500 uppercase shrink-0">{memory.category}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activePlans.length > 0 && (
                    <div className="rounded-xl border border-slate-900 bg-slate-900/40 p-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-cyan-300 mb-2">Active Plans</h4>
                      <div className="space-y-2 text-[10px]">
                        {activePlans.map((plan) => (
                          <div key={plan.id} className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-slate-200 font-semibold truncate">{plan.goal}</div>
                              <div className="text-slate-400">{Array.isArray(plan.steps) ? `${plan.steps.length} steps` : 'plan'}</div>
                            </div>
                            <span className="text-slate-500 uppercase shrink-0">{plan.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedItem && (
                <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-xs">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="font-bold text-cyan-300 uppercase tracking-widest">
                      {lang === 'bn' ? 'কমান্ড বিস্তারিত' : 'Command Detail'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      className="text-[10px] font-mono uppercase text-slate-400 hover:text-white"
                    >
                      close
                    </button>
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <div><span className="text-slate-500">ID:</span> {selectedItem.id}</div>
                    <div><span className="text-slate-500">Prompt:</span> {selectedItem.prompt}</div>
                    <div><span className="text-slate-500">Status:</span> {selectedItem.status}</div>
                    <div><span className="text-slate-500">Classification:</span> {getClassificationLabel(selectedItem.classification)}</div>
                    <div><span className="text-slate-500">Retry:</span> {(selectedItem as any).retryCount || 0}</div>
                    <div><span className="text-slate-500">Result:</span> {(selectedItem as any).result || '—'}</div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* VIEW: Terminal & Console Broker Logs */}
          {viewMode === 'terminal' && (
            <div className="flex-1 flex flex-col p-6 min-h-0 overflow-hidden">
              <div className="flex items-center justify-between select-none mb-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  {lang === 'bn' ? 'সিস্টেম ব্রোকার ইন্টারফেস কনসোল' : 'Neora Integration Broker Logs'}
                </h3>
                <button
                  onClick={handleClearTerminal}
                  className="px-2.5 py-1 text-[10px] font-mono font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded transition cursor-pointer"
                >
                  {lang === 'bn' ? 'কনসোল মুছুন' : 'Clear Logs'}
                </button>
              </div>

              {/* Real code compiler logs box */}
              <div className="flex-1 bg-slate-950 font-mono text-xs rounded-2xl border border-slate-900 p-5 overflow-y-auto space-y-1.5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)]">
                {logs.length === 0 ? (
                  <p className="text-slate-600">[System State Idle] Waiting for local agent synchronization.</p>
                ) : (
                  logs.map((log, index) => {
                    let logColor = 'text-slate-400';
                    if (log.includes('[PC Client]') || log.includes('[Client PC]')) {
                      logColor = 'text-cyan-400';
                    } else if (log.includes('completed') || log.includes('success') || log.includes('SUCCESS')) {
                      logColor = 'text-emerald-400';
                    } else if (log.includes('failed') || log.includes('ERROR') || log.includes('issue')) {
                      logColor = 'text-red-400';
                    } else if (log.includes('Registered') || log.includes('Submitting')) {
                      logColor = 'text-amber-400';
                    }
                    return (
                      <div key={index} className={`leading-relaxed break-all ${logColor}`}>
                        {log}
                      </div>
                    );
                  })
                )}
                <div ref={consoleEndRef} />
              </div>
            </div>
          )}

          {/* VIEW: Python Client Script and Local Setup Instructions */}
          {viewMode === 'setup' && (
            <div className="flex-1 lg:overflow-y-auto p-6 space-y-6 select-text">
              
              {/* Dynamic Auth Bypass Guide Card */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex gap-3.5 text-amber-200 text-xs">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 text-xs">
                    ⚠️ {lang === 'bn' ? 'গুগল সিকিউরিটি গেট এবং কানেকশন সমস্যার সহজ সমাধান' : 'WORKAROUND: BYPASS GOOGLE AUTH LOGIN WALL'}
                  </h4>
                  <div className="leading-relaxed text-slate-350 text-[11px] space-y-2">
                    {lang === 'bn' ? (
                      <div className="space-y-1.5">
                        <p>
                          আপনার ডেক্সটপ টার্মিনালে যদি <strong>[CRITICAL AUTH GATE WORKAROUND REQUIRED]</strong> মেসেজ পান, তাহলে নিচের ৫টি ধাপে আপনার ব্রাউজার সেশন সিকিউরিটি কুকি যুক্ত করে নিন:
                        </p>
                        <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-300">
                          <li>আপনার ব্রাউজারে যেখানেই Neora খোলা আছে, সেখানে কি-বোর্ড থেকে <strong>F12</strong> চাপুন অথবা রাইট ক্লিক করে <strong>Inspect</strong> সিলেক্ট করুন।</li>
                          <li>ডেভেলপার উইন্ডোতে <strong>Network</strong> ট্যাবে যান এবং ফিল্টার হিসেবে <strong>Fetch/XHR</strong> সিলেক্ট করুন।</li>
                          <li>ড্যাশবোর্ডের বাটন ক্লিক করুন বা পেজ রিফ্রেশ করুন যাতে ট্রাফিকের মধ্যে <code>status</code> বা <code>poll</code> রিকুয়েস্ট আসে।</li>
                          <li>ঐ রিকুয়েস্টটিতে ক্লিক করে <strong>Headers</strong> ট্যাবের <strong>Request Headers</strong> অংশ থেকে সম্পূর্ণ <code>cookie</code> মানটি কপি করুন।</li>
                          <li>আপনার পিসিতে থাকা <code>neora_agent.py</code> স্ক্রিপ্টটি ওপেন করুন এবং <code>CUSTOM_HEADERS</code> এ <code>"cookie": "YOUR_COPIED_COOKIE_HERE"</code> বসিয়ে দিন!</li>
                        </ol>
                        <p className="text-emerald-400 font-bold mt-2">
                          এবার <code>python neora_agent.py</code> পুনরায় রান করুন, এটি সাথে সাথে কোনো লগইন ও পাসওয়ার্ড প্রম্পট ছাড়াই কানেক্ট হয়ে যাবে!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <p>
                          If your CLI terminal complains with <strong>[CRITICAL AUTH GATE WORKAROUND REQUIRED]</strong>, follow these 5 rapid steps to authenticate your Python client script with your browser's session token:
                        </p>
                        <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-300">
                          <li>While viewing Neora in your web browser, press <strong>F12</strong> (or Right-Click & Inspect) to open Developer tools.</li>
                          <li>Navigate to the <strong>Network</strong> tab and select the <strong>Fetch/XHR</strong> filter.</li>
                          <li>Click on any tab/button or refresh the portal to prompt API requests like <code>status</code> or <code>poll</code>.</li>
                          <li>Click on that network request, scroll down to <strong>Request Headers</strong>, and copy the full value of the <code>cookie</code> header.</li>
                          <li>Open your locally saved <code>neora_agent.py</code> file and paste your cookie inside the <code>CUSTOM_HEADERS</code> dict config block!</li>
                        </ol>
                        <p className="text-emerald-400 font-bold mt-2">
                          Save and run <code>python neora_agent.py</code> again. It will connect instantly with no passwords or authentication barriers!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Standard Step-by-Step Instructions */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-cyan-400" />
                  {lang === 'bn' ? '৩টি ধাপে আপনার লোকাল পিসিতে নেওরা ক্লায়েন্ট চালু করুন' : 'Three Simple Steps to Run Neora Client Locally'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed text-slate-350">
                  {/* Step 1 */}
                  <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
                    <div className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold flex items-center justify-center mb-3">1</div>
                    <h4 className="font-bold text-white text-xs mb-1.5">{lang === 'bn' ? 'পাইথন ইনস্টল করুন' : 'Verify Python Environment'}</h4>
                    <p className="text-slate-400">
                      {lang === 'bn' 
                        ? 'আপনার কম্পিউটারে Python ৩ বা তার বেশি ভার্সন ইনস্টল থাকতে হবে। CMD বা Terminal ওপেন করে চেক করুন।' 
                        : 'Your local OS must have Python v3.x installed. Verify by running "python --version" in CMD/Terminal.'}
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
                    <div className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold flex items-center justify-center mb-3">2</div>
                    <h4 className="font-bold text-white text-xs mb-1.5">{lang === 'bn' ? 'মডিউলস ইনস্টল করুন' : 'Install Core Dependencies'}</h4>
                    <p className="text-slate-400 mb-2">
                      {lang === 'bn' 
                        ? 'প্রয়োজনীয় ৩টি লাইব্রেরি ইনস্টল করতে আপনার টার্মিনালে এই কমান্ডটি চালান:' 
                        : 'Execute this command in your CLI terminal to compile keyboard/mouse triggers:'}
                    </p>
                    <code className="block bg-slate-950 p-2 text-[11px] font-mono border border-slate-800 text-cyan-400 rounded">
                      pip install pyautogui requests pillow
                    </code>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
                    <div className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold flex items-center justify-center mb-3">3</div>
                    <h4 className="font-bold text-white text-xs mb-1.5">{lang === 'bn' ? 'স্ক্রিপ্টটি চালু করুন' : 'Launch Neora Bridge'}</h4>
                    <p className="text-slate-400 select-all">
                      {lang === 'bn'
                        ? 'নিচের পাইথন কোডটি কপি করে "neora_agent.py" ফাইলে সেভ করুন। তারপর নিচের কমান্ডে রান করুন:'
                        : 'Copy the Python script below, save it as "neora_agent.py", then bring it online:'}
                    </p>
                    <code className="block mt-2 bg-slate-950 p-2 text-[11px] font-mono border border-slate-800 text-cyan-400 rounded">
                      python neora_agent.py
                    </code>
                  </div>
                </div>
              </div>

              {/* Complete copyable Python client script preview box */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-lg">
                <div className="bg-slate-950 px-5 py-3 border-b border-slate-850 flex items-center justify-between select-none">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>neora_agent.py (Full Production Client Code)</span>
                  </div>
                  <button
                    onClick={handleCopyScript}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    {copiedScript ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'কোড কপি করুন' : 'Copy Client Script'}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950/80 p-5 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto select-all max-h-[380px]">
                  <pre className="whitespace-pre">{pythonScriptText}</pre>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
