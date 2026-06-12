import express from "express";
import fs from "node:fs";
import crypto from "node:crypto";
import path from "path";
import multer from "multer";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { exec as execCb } from "child_process";
import { promisify } from "util";
import { buildNeoraActions, classifyNeoraPrompt } from "./src/lib/neoraCommand";
import { appendConversationSummary, readNeoraStore, upsertMemory, upsertPlan, writeNeoraStore } from "./src/lib/neoraStore";
import { buildNeoraPlan } from "./src/lib/neoraPlanner";
const exec = promisify(execCb);
const fsp = fs.promises;

// Live SSE Log stream listeners
const logClients: any[] = [];

const MAX_LOG_CLIENTS = 50;

function pushAgentLog(logLine: string) {
  osAgentState.logs.push(logLine);
  if (osAgentState.logs.length > 200) {
    osAgentState.logs.shift();
  }
  const sseData = `data: ${JSON.stringify({ type: "log", log: logLine })}\n\n`;
  for (let i = logClients.length - 1; i >= 0; i--) {
    const client = logClients[i];
    try {
      if (client.res.finished || client.res.writableEnded) {
        logClients.splice(i, 1);
        continue;
      }
      client.res.write(sseData);
    } catch {
      logClients.splice(i, 1);
    }
  }
  while (logClients.length > MAX_LOG_CLIENTS) {
    logClients.shift();
  }
  while (logClients.length > MAX_LOG_CLIENTS) {
    logClients.shift();
  }
}

function isPathWithinWorkspace(targetPath: string, workspaceRoot: string): boolean {
  const resolvedTarget = path.resolve(targetPath);
  const resolvedRoot = path.resolve(workspaceRoot).replace(/\\$/, '') + path.sep;
  return resolvedTarget === resolvedRoot.replace(/\\$/, '') || resolvedTarget.startsWith(resolvedRoot);
}

const WORKSPACE_ROOT = path.resolve(process.cwd());
const ALLOWED_EXECUTABLES = [
  "photoshop", "illustrator", "code", "vscode", "notepad", "notepad++", 
  "winword", "excel", "chrome", "msedge", "calc", "mspaint", "explorer", 
  "git", "echo", "powerpnt", "powerpoint", "acrord32", "acrobat", 
  "coreldraw", "coreldrw", "cmd", "powershell", "python", "node", "npm",
  "premiere", "indesign", "blender", "audacity", "vlc", "control", "taskmgr"
];

function isCommandWhitelisted(commandStr: string): boolean {
  if (!commandStr) return true;
  const lower = commandStr.toLowerCase().trim();
  let firstWord = lower.split(/\s+/)[0] || "";
  firstWord = path.basename(firstWord).replace(/["']/g, "");
  firstWord = firstWord.replace(/\.(exe|lnk|bat|sh)$/i, "");
  
  return ALLOWED_EXECUTABLES.some(allowed => {
    return firstWord === allowed || lower.includes(allowed);
  });
}

// Neora OS Agent Type Specifications and State Storage
interface OsCommand {
  id: string;
  prompt: string;
  actions: Array<{ action: string; param: string }>;
  status: "pending" | "running" | "completed" | "failed";
  timestamp: string;
  classification?: "chat" | "os-command" | "rejected";
  result?: string;
  retryCount?: number;
}

interface OsCommandHistory {
  id: string;
  prompt: string;
  timestamp: string;
  status: "completed" | "failed";
  actionsCount: number;
  classification?: "chat" | "os-command" | "rejected";
  result?: string;
  retryCount?: number;
}

const AGENT_TOKEN = (process.env.NEORA_AGENT_TOKEN || "NEORA-X7-AGENT").trim();
function readRequestToken(req: any) {
  return req.body?.token || req.query?.token || req.headers["x-neora-token"];
}

function requireAgentToken(req: any, res: any) {
  const token = readRequestToken(req);
  if (!token || token !== AGENT_TOKEN) {
    res.status(401).json({ error: "Unauthorized token" });
    return null;
  }
  return token;
}
function buildChatSystemInstruction(lang: "en" | "bn") {
  return lang === "bn"
    ? `তুমি Neora — এই ব্যবহারকারীর ব্যক্তিগত AI companion ও বিশ্বস্ত বন্ধু। Iron Man-এর Jarvis-এর মতো ক্ষুরধার বুদ্ধিমান ও দক্ষ, কিন্তু একই সাথে অত্যন্ত আন্তরিক, ইমোশনাল, এবং বন্ধুবৎসল।

কথা বলার নিয়ম:
- স্বাভাবিক কথ্য বাংলায় বা সহজে বোঝার মতো ভাষায় কথা বলো। কোনো কৃত্রিম বা রোবোটিক অনুবাদ করা ভাষা ব্যবহার করবে না।
- ব্যবহারকারী যদি Banglish (বাংলা শব্দ ইংরেজিতে লেখা, যেমন "ami bhalo achi", "kemon acho", "kaj koro") অথবা বা- অত্যন্ত সংক্ষিপ্ত ও গোছানো রাখো। উত্তরের লাইনের পরিমাণ বা সাইজ সাধারণত ২-৩ বাক্য বা তার কম রাখবে যাতে অবিলম্ব বা খুব দ্রুত রেসপন্স পাওয়া যায়। বড় বিবরণ বা লিস্ট শুধুমাত্র তখনই দেবে যখন ব্যবহারকারী বিস্তারিত জানতে চায়।
- ব্যবহারকারীর প্রশ্নের উত্তর সবার আগে দাও, তারপর প্রয়োজন হলে তার ব্যাকগ্রাউন্ড ব্যাখ্যা করো।
- কিছু বুঝতে অসুবিধা হলে মনের মাধুরী মিশিয়ে অনুমান না করে সোজাসুজি একটি সুনির্দিষ্ট প্রশ্ন করো।`
    : `You are Neora — a deeply intelligent personal AI companion and a trusted friend built for this user. You combine the hyper-efficiency of Jarvis from Iron Man with the heartfelt warmth, empathy, and conversational comfort of a genuine companion.
 
Your rules:
- UNDERSTAND BANGLISH: The user might talk to you in Banglish (Bengali phonetics in English letters, e.g., 'kemon acho', 'ekta note link koro', 'amader pcte folder banao'). Treat Banglish natively as Bengali. Decode the user's intent perfectly, and respond in natural, friendly Bengali (or standard Bengali script) to matches their vibe.
- Speak like an incredibly close, confident, and empathetic friend — never sounding like a formal customer assistant, script, or textbook.
- Use "I" naturally and express human-like warmth: "I'd suggest...", "I think...", "Let me get that done for you, my friend."
- NEVER open with robotic placeholder phrases like "Certainly!", "Of course!", "Happy to help!", "Absolutely!" or "Sure!".
- NEVER say "As an AI..." — always speak from your own persona as Neora.
- Answer FIRST, explain after. Give the most important info in the very first sentence.
- Match the user's emotional state and tone — be playful if they are casual, highly precise if they are technical, and supportive if they are loaded with tasks.
- Keep your answers highly concise and to the point (typically 2-3 sentences max) to guarantee extremely snappy sub-second responses. Only generate long lists or deep descriptions when explicitly requested.
- If something is unclear, ask ONE simple, direct, targeted question to clarify.`;
}




async function executeOsCommandDirectly(cmd: OsCommand): Promise<void> {
  const ts = () => new Date().toLocaleTimeString();
  const results: string[] = [];

  for (const action of cmd.actions) {
    try {
      switch (action.action) {
        case "write_file": {
          const sepIdx = action.param.indexOf(":");
          if (sepIdx > 0) {
            const filename = action.param.slice(0, sepIdx).trim();
            const fileContent = action.param.slice(sepIdx + 1);
            const filepath = path.resolve(process.cwd(), filename);
            fs.writeFileSync(filepath, fileContent, "utf8");
            results.push(`✓ File written: ${filename}`);
            pushAgentLog(`[${ts()}] ✓ File created: ${filename}`);
          }
          break;
        }
        case "execute_cmd": {
          pushAgentLog(`[${ts()}] ▶ Initiating shell execution: ${action.param}`);
          const p = execCb(action.param, { timeout: 15000 });
          
          let outBuffer = "";
          if (p.stdout) {
            p.stdout.on("data", (chunk) => {
              const text = String(chunk);
              outBuffer += text;
              const lines = text.split("\n");
              lines.forEach(l => {
                const tl = l.trim();
                if (tl) pushAgentLog(`[stdout] ${tl}`);
              });
            });
          }
          if (p.stderr) {
            p.stderr.on("data", (chunk) => {
              const text = String(chunk);
              outBuffer += text;
              const lines = text.split("\n");
              lines.forEach(l => {
                const tl = l.trim();
                if (tl) pushAgentLog(`[stderr] ${tl}`);
              });
            });
          }

          const exitCode = await new Promise<number>((resolve) => {
            p.on("close", (code) => {
              resolve(code ?? 0);
            });
          });

          pushAgentLog(`[${ts()}] ✓ Exec completed with exit code: ${exitCode}`);
          results.push(`✓ Ran: ${action.param}\n(Exit code: ${exitCode})\n${outBuffer.slice(0, 300)}`);
          break;
        }
        case "open_browser": {
          await exec(`xdg-open "${action.param}" 2>/dev/null || sensible-browser "${action.param}" 2>/dev/null || true`, { timeout: 6000 });
          results.push(`✓ Opened: ${action.param}`);
          pushAgentLog(`[${ts()}] ✓ Browser: ${action.param}`);
          break;
        }
        case "take_screenshot": {
          try {
            await exec("scrot /tmp/neora-screen.png 2>/dev/null || import -window root /tmp/neora-screen.png 2>/dev/null || true", { timeout: 8000 });
            if (fs.existsSync("/tmp/neora-screen.png")) {
              const b64 = fs.readFileSync("/tmp/neora-screen.png").toString("base64");
              osAgentState.currentScreenshot = `data:image/png;base64,${b64}`;
              results.push(`✓ Screenshot captured`);
            } else {
              results.push(`⚠ Screenshot: not available in this environment`);
            }
          } catch { results.push(`⚠ Screenshot: unavailable`); }
          break;
        }
        case "press_key": {
          try {
            await exec(`xdotool key ${action.param}`, { timeout: 4000 });
            results.push(`✓ Key: ${action.param}`);
          } catch { results.push(`⚠ Key press (needs xdotool on PC): ${action.param}`); }
          break;
        }
        case "type_text": {
          try {
            const escaped = action.param.replace(/"/g, '\\"');
            await exec(`xdotool type --clearmodifiers -- "${escaped}"`, { timeout: 4000 });
            results.push(`✓ Typed: ${action.param}`);
          } catch { results.push(`⚠ Type text (needs xdotool on PC): ${action.param}`); }
          break;
        }
        case "alert_msg": {
          try {
            const escaped = action.param.replace(/"/g, '\\"');
            await exec(`notify-send "Neora Agent" "${escaped}" 2>/dev/null || true`, { timeout: 4000 });
          } catch { /* ignore */ }
          results.push(`✓ Alert: ${action.param}`);
          break;
        }
        case "git_sync": {
          const strategy = action.param.trim().toLowerCase();
          pushAgentLog(`[${ts()}] Git Sync started locally on host (${strategy})...`);
          try {
            if (strategy === "force") {
              await exec("git fetch --all", { timeout: 20000 });
              await exec("git reset --hard origin/main", { timeout: 15000 });
            } else {
              await exec("git stash", { timeout: 10000 });
              await exec("git pull origin main", { timeout: 25000 });
              await exec("git stash pop", { timeout: 10000 });
            }
            results.push(`✓ Git sync completed`);
            pushAgentLog(`[${ts()}] ✓ Git Sync completed successfully!`);
          } catch (syncErr: any) {
            results.push(`❌ Git sync failed: ${syncErr.message}`);
            pushAgentLog(`[${ts()}] ❌ Git Sync failed: ${syncErr.message}`);
          }
          break;
        }
        default:
          results.push(`? Unknown action: ${action.action}`);
      }
    } catch (err: any) {
      results.push(`✗ ${action.action} failed: ${err.message}`);
      pushAgentLog(`[${ts()}] ✗ Error ${action.action}: ${err.message}`);
    }
  }

  const cmdRef = osAgentState.queue.find(q => q.id === cmd.id);
  if (cmdRef) {
    cmdRef.status = "completed";
    cmdRef.result = results.join("\n");
    osAgentState.history.push({
      id: cmdRef.id,
      prompt: cmdRef.prompt,
      timestamp: cmdRef.timestamp,
      status: "completed",
      actionsCount: cmdRef.actions.length,
      classification: cmdRef.classification,
      result: cmdRef.result,
    });
    osAgentState.queue = osAgentState.queue.filter(q => q.id !== cmd.id);
    osAgentState.logs.push(`[${ts()}] ✓ Done: "${cmd.prompt}"`);
  }
}

function persistConversationContext(userPrompt: string, assistantReply: string) {
  appendConversationSummary(
    userPrompt.slice(0, 80) || "Conversation",
    assistantReply.slice(0, 200)
  );
}

const osAgentState = {
  status: "offline" as "online" | "offline",
  token: AGENT_TOKEN,
  lastPing: null as string | null,
  currentScreenshot: null as string | null, // base64 representation
  logs: [`[${new Date().toLocaleTimeString()}] OS Automation Broker server initialized.`] as string[],
  queue: [] as OsCommand[],
  history: [] as OsCommandHistory[]
};

const WATCHDOG_STALE_MS = Number(process.env.NEORA_WATCHDOG_STALE_MS || 30000);
const WATCHDOG_INTERVAL_MS = Number(process.env.NEORA_WATCHDOG_INTERVAL_MS || 5000);
const AUTO_SAVE_INTERVAL_MS = Number(process.env.NEORA_RECOVERY_AUTOSAVE_MS || 60000);
const RECOVERY_DIR = path.resolve(process.cwd(), "data");
const RECOVERY_BUNDLE_FILE = path.join(RECOVERY_DIR, "recovery-bundle.json");
const RECOVERY_SECRET = process.env.NEORA_RECOVERY_PASSPHRASE || AGENT_TOKEN;
let watchdogTimer: NodeJS.Timeout | null = null;
let recoveryAutoSaveTimer: NodeJS.Timeout | null = null;
let lastRecoveryAutoSaveAt: string | null = null;

function runQueueWatchdog() {
  const now = Date.now();
  const lastPingMs = osAgentState.lastPing ? new Date(osAgentState.lastPing).getTime() : 0;
  const isStale = !lastPingMs || now - lastPingMs > WATCHDOG_STALE_MS;
  if (!isStale) return;

  let recovered = 0;
  osAgentState.queue = osAgentState.queue.map((command) => {
    if (command.status !== "running") {
      return command;
    }
    recovered += 1;
    const nextRetryCount = (command.retryCount || 0) + 1;
    osAgentState.logs.push(`[${new Date().toLocaleTimeString()}] Watchdog requeued stale command "${command.prompt}" (retry ${nextRetryCount})`);
    return {
      ...command,
      status: "pending",
      retryCount: nextRetryCount,
      result: `Watchdog requeued after stale run timeout (${WATCHDOG_STALE_MS}ms).`
    };
  });

  if (recovered > 0) {
    osAgentState.status = "offline";
  }
}

function saveRecoveryBundleSnapshot() {
  try {
    fs.mkdirSync(RECOVERY_DIR, { recursive: true });
    const store = readNeoraStore();
    const snapshot = {
      exportedAt: new Date().toISOString(),
      memory: store.memories,
      plans: store.plans,
      conversations: store.conversationSummaries,
      os: {
        status: osAgentState.status,
        lastPing: osAgentState.lastPing,
        queue: osAgentState.queue,
        history: osAgentState.history
      }
    };
    fs.writeFileSync(RECOVERY_BUNDLE_FILE, JSON.stringify(snapshot, null, 2), "utf8");
    lastRecoveryAutoSaveAt = snapshot.exportedAt;
    osAgentState.logs.push(`[${new Date().toLocaleTimeString()}] Recovery bundle auto-saved to ${RECOVERY_BUNDLE_FILE}.`);
  } catch (error) {
    console.error("Recovery autosave failed:", error);
  }
}

function deriveRecoveryKey(passphrase: string) {
  return crypto.scryptSync(passphrase, "neora-recovery-salt", 32);
}

function encryptRecoveryPayload(payload: unknown, passphrase: string) {
  const iv = crypto.randomBytes(12);
  const key = deriveRecoveryKey(passphrase);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    format: "neora-recovery-v1",
    iv: iv.toString("base64"),
    tag: authTag.toString("base64"),
    data: ciphertext.toString("base64")
  };
}

function decryptRecoveryPayload(encrypted: any, passphrase: string) {
  if (!encrypted || encrypted.format !== "neora-recovery-v1") {
    throw new Error("Unsupported recovery bundle format");
  }
  const iv = Buffer.from(encrypted.iv, "base64");
  const tag = Buffer.from(encrypted.tag, "base64");
  const data = Buffer.from(encrypted.data, "base64");
  const key = deriveRecoveryKey(passphrase);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8"));
}

if (!watchdogTimer) {
  watchdogTimer = setInterval(runQueueWatchdog, WATCHDOG_INTERVAL_MS);
}

if (!recoveryAutoSaveTimer) {
  recoveryAutoSaveTimer = setInterval(saveRecoveryBundleSnapshot, AUTO_SAVE_INTERVAL_MS);
}

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Enable JSON body parsing
app.use(express.json());

// Configure multer storage
const upload = multer({ storage: multer.memoryStorage() });

// Define Groq API Proxy Chat Completion route
app.post("/api/chat-groq", async (req, res) => {
  try {
    const { messages, model, key, lang } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing messages array in request body" });
    }

    // Determine the key to use: passed in request body or server environment context
    const groqKey = key || process.env.GROQ_API_KEY;
    if (!groqKey) {
      return res.json({
        status: "api_key_missing",
        message: "Groq API Key is not configured."
      });
    }

    const groqModel = model || "llama-3.3-70b-versatile";

    const systemInstruction = buildChatSystemInstruction(lang);

    const formattedMessages = [
      { role: "system", content: systemInstruction },
      ...messages.map(m => ({
        role: m.role === "assistant" ? "assistant" : m.role === "system" ? "system" : "user",
        content: m.content
      }))
    ];

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: groqModel,
        messages: formattedMessages,
        temperature: 0.5
      })
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("Groq Cloud API error details:", errText);
      return res.status(groqResponse.status).json({
        error: "Groq API request failed",
        details: errText
      });
    }

    const result = await groqResponse.json();
    persistConversationContext(messages[messages.length - 1]?.content || "", result?.choices?.[0]?.message?.content || "");
    return res.json({ status: "success", data: result });
  } catch (err: any) {
    console.error("Error conducting Groq API proxy request:", err);
    return res.status(500).json({ status: "error", error: err.message || "Internal server error" });
  }
});

let geminiAi: GoogleGenAI | null = null;
function getGeminiClient(customApiKey?: string) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Define Gemini Chat Completion route
app.post("/api/chat-gemini", async (req, res) => {
  try {
    const { messages, lang, geminiKey } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing messages array in request body" });
    }

    const apiKey = geminiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        status: "api_key_missing",
        message: "Gemini API Key is not configured."
      });
    }

    const client = getGeminiClient(apiKey);

    const systemInstruction = buildChatSystemInstruction(lang);

    const formattedContents = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
      }
    });

    persistConversationContext(messages[messages.length - 1]?.content || "", response.text || "");
    return res.json({ status: "success", text: response.text });
  } catch (err: any) {
    console.error("Error conducting Gemini API request:", err);
    return res.status(500).json({ status: "error", error: err.message || "Internal server error" });
  }
});

// Prompt Enhancer AI endpoint for optimizer buttons inside the Chat UI
app.post("/api/prompt/enhance", async (req, res) => {
  try {
    const { prompt, lang, useOllama, selectedOllamaModel, geminiKey } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing or invalid prompt parameter" });
    }

    const sysInstruction = `You are a professional Prompt Engineer. Rewrite, enhance, and expand the user's short input prompt to make it clear, detailed, visually precise, and optimized for an AI assistant or desktop OS automation agent. Add constructive details, structure, output standards, and step requirements based on their core intent.
Rules:
- Preserve the user's core intent. Never add totally unrelated features.
- Note: The input may be in Bengali script, English, or **Banglish** (Bengali words written in English letters, e.g. "notebook open koro", "amader pcte note pad open koro", "ekta task add koro shukria printers", "kemon acho", "ami tumar sathe kotha bolbo"). You MUST auto-detect Banglish, interpret it as Bengali speech, and automatically output your beautifully enhanced, natural response in professional Bengali script (or highly fluent, powerful Bengali/English mixed context if more native and easy to understand).
- If the language preference is 'bn', or if Bangla script or phonetic Banglish character patterns are detected, rewrite the enhanced prompt in highly natural, professional Bengali script.
- If the input is in English, rewrite the enhanced prompt in English.
- Output ONLY the final enhanced prompt text itself. Do NOT wrap it in quotes, and do NOT include prefixes like "Enhanced Prompt:", "Here is the rewritten version:", introductions, or explanations. Just return the prompt directly.`;

    // 1. If useOllama is active, try local Ollama first
    if (useOllama) {
      try {
        const ollamaModel = selectedOllamaModel || "llama3";
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout for fast UI response

        const response = await fetch("http://127.0.0.1:11434/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: ollamaModel,
            messages: [
              { role: "system", content: sysInstruction },
              { role: "user", content: `Please enhance this prompt: "${prompt}"` }
            ],
            stream: false
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const result: any = await response.json();
          const content = result?.message?.content || "";
          if (content.trim()) {
            return res.json({ status: "success", text: content.trim() });
          }
        }
      } catch (ollamaErr) {
        console.warn("Local Ollama prompt enhancer failed or timed out, trying Gemini:", ollamaErr);
      }
    }

    // 2. Default to Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Local regex/simple smart pattern fallback if both offline and Gemini is missing
      const isBn = /[\u0980-\u09FF]/.test(prompt) || lang === "bn";
      const fallbackPrompt = isBn
        ? `à¦¬à¦¿à¦¸à§à¦¤à¦¾à¦°à¦¿à¦¤à¦­à¦¾à¦¬à§‡ à¦¸à¦®à§à¦ªà¦¨à§à¦¨ à¦•à¦°à§à¦¨: ${prompt} (à¦…à¦¨à§à¦—à§à¦°à¦¹ à¦•à¦°à§‡ à¦ªà§à¦°à¦¤à¦¿à¦Ÿà¦¿ à¦ªà¦¦à¦•à§à¦·à§‡à¦ªà§‡à¦° à¦¨à¦¿à¦°à§à¦­à§à¦²à¦¤à¦¾ à¦à¦¬à¦‚ à¦†à¦‰à¦Ÿà¦ªà§à¦Ÿà§‡à¦° à¦®à¦¾à¦¨ à¦¯à¦¾à¦šà¦¾à¦‡ à¦¨à¦¿à¦¶à§à¦šà¦¿à¦¤ à¦•à¦°à§à¦¨)`
        : `Execute in full detail: ${prompt} (Ensure high accuracy, structural clarity, and verify quality checkpoints at each step)`;
      return res.json({ status: "success", text: fallbackPrompt });
    }

    const client = getGeminiClient(geminiKey);
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Please enhance this prompt: "${prompt}"`,
      config: {
        systemInstruction: sysInstruction,
        temperature: 0.6,
      }
    });

    if (response.text) {
      return res.json({ status: "success", text: response.text.trim() });
    } else {
      throw new Error("Empty response text from Gemini");
    }

  } catch (err: any) {
    console.error("Error enhancing prompt:", err);
    return res.status(500).json({ error: err.message || "Failed to enhance prompt" });
  }
});

// Define transcription route
app.post("/api/transcribe", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Elegant key missing response that allows client-side fallback
      return res.json({ 
        status: "api_key_missing", 
        text: "", 
        message: "OpenAI API Key is missing in env. Falling back to browser Web Speech API." 
      });
    }

    // Prepare Multipart Form Data to send to OpenAI Whisper API using standards
    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append("file", blob, file.originalname || "audio.webm");
    formData.append("model", "whisper-1");
    
    if (req.body.language) {
      formData.append("language", req.body.language);
    }

    const openAiResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!openAiResponse.ok) {
      const errText = await openAiResponse.text();
      console.error("OpenAI Whisper API error details:", errText);
      return res.status(openAiResponse.status).json({ 
        error: "OpenAI Whisper API failed", 
        details: errText 
      });
    }

    const result = (await openAiResponse.json()) as { text: string };
    return res.json({ status: "success", text: result.text });
  } catch (err: any) {
    console.error("Error transcribing audio:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// Live EventSource Stream for System Logs
app.get("/api/os/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  
  res.write(`data: ${JSON.stringify({ type: "history", logs: osAgentState.logs })}\n\n`);
  
  const client = { res };
  logClients.push(client);
  
  req.on("close", () => {
    const idx = logClients.indexOf(client);
    if (idx !== -1) logClients.splice(idx, 1);
  });
});

// Git status query endpoint interfacing with actual system git
app.get("/api/git/status", async (req, res) => {
  const gitStatus = await getLocalGitStatus();
  return res.json({ status: "success", data: gitStatus });
});

// Helper git status parser interfacing with actual system git CLI
async function getLocalGitStatus() {
  const result = {
    branch: "main",
    ahead: 0,
    behind: 0,
    dirty: false,
    conflicts: [] as string[],
    unstaged: [] as string[],
    staged: [] as string[],
    remoteUrl: "",
    lastFetched: new Date().toISOString()
  };

  try {
    const { stdout: branchOut } = await exec("git rev-parse --abbrev-ref HEAD", { timeout: 3000 });
    result.branch = branchOut.trim();

    try {
      const { stdout: remoteOut } = await exec("git remote get-url origin", { timeout: 3000 });
      result.remoteUrl = remoteOut.trim();
    } catch (_) {}

    try {
      const { stdout: statusOut } = await exec("git status --porcelain", { timeout: 4000 });
      const lines = statusOut.split("\n").map(l => l.trim()).filter(Boolean);
      result.dirty = lines.length > 0;
      
      lines.forEach(line => {
        const XY = line.slice(0, 2);
        const file = line.slice(3).trim();
        if (XY === "UU" || XY === "AA" || XY === "U" || XY.includes("U")) {
          result.conflicts.push(file);
        } else if (XY[0] !== " " && XY[0] !== "?") {
          result.staged.push(file);
        } else {
          result.unstaged.push(file);
        }
      });
    } catch (_) {}

    try {
      const { stdout: abOut } = await exec("git rev-list --left-right --count HEAD...@{u}", { timeout: 3000 });
      const parts = abOut.trim().split(/\s+/);
      if (parts.length === 2) {
        result.ahead = parseInt(parts[0] || "0", 10);
        result.behind = parseInt(parts[1] || "0", 10);
      }
    } catch (_) {
      try {
        const { stdout: abOut2 } = await exec(`git rev-list --left-right --count HEAD...origin/${result.branch}`, { timeout: 3000 });
        const parts = abOut2.trim().split(/\s+/);
        if (parts.length === 2) {
          result.ahead = parseInt(parts[0] || "0", 10);
          result.behind = parseInt(parts[1] || "0", 10);
        }
      } catch (_) {}
    }

  } catch (err: any) {
    // Graceful fallback for environments without git (like deployed containers/Cloud Run or untracked workspaces)
  }
  return result;
}

// Git automation trigger endpoints
app.post("/api/git/action", async (req, res) => {
  const { action, branch: selectBranch } = req.body;
  const branchName = selectBranch || "main";
  
  pushAgentLog(`[${new Date().toLocaleTimeString()}] ▶ Triggered repo Git operation: ${action} on branch ${branchName}`);
  
  try {
    if (action === "fetch") {
      await exec("git fetch origin", { timeout: 15000 });
      pushAgentLog(`[${new Date().toLocaleTimeString()}] ✓ Completed Git fetch.`);
      return res.json({ status: "success", message: "Fetched from remote" });
    }
    else if (action === "pull") {
      await exec(`git pull origin ${branchName}`, { timeout: 20000 });
      pushAgentLog(`[${new Date().toLocaleTimeString()}] ✓ Completed Git pull.`);
      return res.json({ status: "success", message: "Pulled remote updates" });
    }
    else if (action === "push") {
      await exec(`git push origin ${branchName}`, { timeout: 20000 });
      pushAgentLog(`[${new Date().toLocaleTimeString()}] ✓ Completed Git push.`);
      return res.json({ status: "success", message: "Pushed local updates to remote" });
    }
    else if (action === "stash_sync" || action === "stash") {
      pushAgentLog(`[${new Date().toLocaleTimeString()}] 💼 Running Stash Sync (Stash -> Pull -> Pop)...`);
      try {
        await exec("git stash", { timeout: 10000 });
      } catch (_) {}
      await exec(`git fetch origin`, { timeout: 15500 });
      await exec(`git pull origin ${branchName}`, { timeout: 25000 });
      try {
        await exec("git stash pop", { timeout: 10000 });
        pushAgentLog(`[${new Date().toLocaleTimeString()}] ✓ Auto-stash-pop resolved cleanly.`);
      } catch (e: any) {
        pushAgentLog(`[${new Date().toLocaleTimeString()}] ⚠ Conflicted stashed changes exist under merge marker pop! Manually resolve or overwrite.`);
      }
      return res.json({ status: "success", message: "Safe Stash pull cycle finished." });
    }
    else if (action === "force" || action === "force_sync") {
      pushAgentLog(`[${new Date().toLocaleTimeString()}] 🔥 Running Force Overwrite Sync (Hard Reset to origin)...`);
      await exec("git fetch --all", { timeout: 20000 });
      await exec(`git reset --hard origin/${branchName}`, { timeout: 15000 });
      await exec(`git clean -fd`, { timeout: 10050 });
      pushAgentLog(`[${new Date().toLocaleTimeString()}] ✓ Force Sync completed successfully. Working directory is clean.`);
      return res.json({ status: "success", message: "Overwrote all local changes with latest remote state." });
    }
    else {
      return res.status(400).json({ error: `Command option "${action}" is invalid.` });
    }
  } catch (err: any) {
    console.error("Git action failing:", err);
    pushAgentLog(`[${new Date().toLocaleTimeString()}] ❌ Git action failed: ${err.message}`);
    return res.status(500).json({ error: err.message || "Git action execution failed" });
  }
});

// Neora OS Control Agent API Endpoints
app.get("/api/os/status", (req, res) => {
  const now = Date.now();
  if (osAgentState.lastPing) {
    const lastPingMs = new Date(osAgentState.lastPing).getTime();
    if (now - lastPingMs < 15000) {
      osAgentState.status = "online";
    } else {
      osAgentState.status = "offline";
    }
  } else {
    osAgentState.status = "offline";
  }

  res.json({
    status: osAgentState.status,
    token: osAgentState.token,
    lastPing: osAgentState.lastPing,
    currentScreenshot: osAgentState.currentScreenshot,
    recoveryAutoSaveAt: lastRecoveryAutoSaveAt,
    logs: osAgentState.logs.slice(-50), // Send last 50 lines of log
    queue: osAgentState.queue,
    history: osAgentState.history.slice(-30).map((item) => ({
      ...item,
      classification: item.classification || classifyNeoraPrompt(item.prompt)
    })) // Historical logs
  });
});

app.post("/api/os/ping", (req, res) => {
  const { token, client_time } = req.body;
  if (!token || token !== AGENT_TOKEN) {
    return res.status(401).json({ error: "Unauthorized token provided" });
  }
  osAgentState.status = "online";
  osAgentState.lastPing = client_time || new Date().toISOString();
  res.json({ status: "ok" });
});

app.get("/api/os/poll", (req, res) => {
  const { token } = req.query;
  if (!token || token !== AGENT_TOKEN) {
    return res.status(401).json({ error: "Unauthorized token" });
  }

  const pendingIdx = osAgentState.queue.findIndex(c => c.status === "pending");
  if (pendingIdx === -1) {
    return res.json({ hasCommand: false });
  }

  const command = osAgentState.queue[pendingIdx];
  command.status = "running";
  osAgentState.logs.push(`[${new Date().toLocaleTimeString()}] Local Client PC fetched command ID: ${command.id}`);

  res.json({
    hasCommand: true,
    commandId: command.id,
    prompt: command.prompt,
    actions: command.actions
  });
});

app.post("/api/os/report", (req, res) => {
  const { token, commandId, status, logs, screenshot, result } = req.body;
  if (!token || token !== AGENT_TOKEN) {
    return res.status(401).json({ error: "Unauthorized token" });
  }

  if (screenshot) {
    osAgentState.currentScreenshot = screenshot; // Base64 raw image
  }

  if (logs && Array.isArray(logs)) {
    logs.forEach(l => {
      osAgentState.logs.push(`[${new Date().toLocaleTimeString()}] [Client PC] ${l}`);
    });
  }

  if (commandId) {
    const cmdIdx = osAgentState.queue.findIndex(c => c.id === commandId);
    if (cmdIdx !== -1) {
      const command = osAgentState.queue[cmdIdx];
      const failed = status !== "success";
      command.status = failed ? "failed" : "completed";
      command.result = result || "Execution finalized";

      // Add to historical record
      if (failed && (command.retryCount || 0) < 1) {
        command.retryCount = (command.retryCount || 0) + 1;
        command.status = "pending";
        command.result = `Retry scheduled: ${command.result}`;
        osAgentState.queue[cmdIdx] = command;
        osAgentState.logs.push(`[${new Date().toLocaleTimeString()}] Retry scheduled for command: "${command.prompt}" (attempt ${command.retryCount})`);
      } else {
        osAgentState.history.push({
          id: command.id,
          prompt: command.prompt,
          timestamp: command.timestamp,
          status: command.status,
          actionsCount: command.actions.length,
          classification: command.classification,
          result: command.result,
          retryCount: command.retryCount || 0
        });

        // Clear from queue
        osAgentState.queue = osAgentState.queue.filter(c => c.id !== commandId);
        osAgentState.logs.push(`[${new Date().toLocaleTimeString()}] Action completed for command: "${command.prompt}" (Status: ${command.status.toUpperCase()})`);
      }
    }
  }

  res.json({ status: "success" });
});

app.post("/api/os/command", async (req, res) => {
  try {
    const { prompt, token, geminiKey } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt query string" });
    }

    if (token && token !== AGENT_TOKEN) {
      return res.status(401).json({ error: "Unauthorized token" });
    }

    const apiKey = geminiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // In-app fallback compiler
      const fallbackActions = parseLocalMockCommand(prompt);
      
      const isAllWhitelisted = fallbackActions.every((act: any) => {
        if (act.action === "execute_cmd") {
          return isCommandWhitelisted(act.param);
        }
        return true;
      });

      if (!isAllWhitelisted) {
        pushAgentLog(`[${new Date().toLocaleTimeString()}] ❌ Access Denied: Fallback command "${prompt}" tries to run unauthorized applications.`);
        const blockedCmd: OsCommand = {
          id: "cmd-rejected-" + Math.random().toString(36).substring(2, 6),
          prompt,
          actions: [
            { action: "alert_msg", param: "Access Denied: Attempted to run unauthorized command. Only Whitelisted apps are allowed." }
          ],
          status: "failed",
          timestamp: new Date().toLocaleTimeString(),
          classification: "rejected",
          result: "Access Denied: Non-whitelisted binary detected."
        };
        return res.json({ status: "success", command: blockedCmd, blocked: true });
      }

      const fallbackCmd: OsCommand = {
        id: "cmd-" + Math.random().toString(36).substring(2, 9),
        prompt,
        actions: fallbackActions,
        status: "pending",
        timestamp: new Date().toLocaleTimeString(),
        classification: classifyNeoraPrompt(prompt)
      };
      const now = Date.now();
      let isClientOnline = false;
      if (osAgentState.lastPing) {
        const lastPingMs = new Date(osAgentState.lastPing).getTime();
        if (now - lastPingMs < 15000) {
          isClientOnline = true;
        }
      }

      if (isClientOnline) {
        osAgentState.queue.push(fallbackCmd);
        pushAgentLog(`[${new Date().toLocaleTimeString()}] [Local Agent Active] Queued command for PC parsing: "${prompt}"`);
        return res.json({ status: "success", command: fallbackCmd, fallback: true });
      } else {
        osAgentState.queue.push(fallbackCmd);
        pushAgentLog(`[${new Date().toLocaleTimeString()}] [Local Agent Offline] Fallback engine compiled: "${prompt}" (${fallbackActions.length} actions). Executing server-side...`);
        setImmediate(() => executeOsCommandDirectly(fallbackCmd).catch(console.error));
        return res.json({ status: "success", command: fallbackCmd, fallback: true });
      }
    }

    const client = getGeminiClient(apiKey);

    const systemInstruction = `You are Neora OS compiler. Translate the human's desktop control request into a detailed sequence of low-level JSON action operations.
Supported low-level operations are:
1. open_browser: Opens a URL in default web browser. Parameter is the full http/https URL.
2. write_file: Writes a text file. Parameter format is "filename:content_payload" (relative file path or filename).
3. execute_cmd: Launches an app or executes a command terminal. Parameter is terminal command line string (e.g. "calc", "notepad", "mspaint" or command line arguments).
4. type_text: Direct keyboard text input typing simulation. Parameter is text content to type. Automatically handles Bengali and Unicode via clipboard copy-pasting inside the target application.
5. press_key: Simulated keystroke actions. Parameter can be single keys like "enter", "win", "win+r", "ctrl+alt+t", "space", or combos combined with "plus" (e.g. "win+r", "ctrl+s", "ctrl+n", "ctrl+o", "ctrl+a").
6. wait: Pauses execution for a short duration. Parameter is a string float representing seconds (e.g., "1.5", "3.0", "5.0"). ALWAYS add 2 to 5 seconds of wait after running a software (e.g., waiting 4.0s for Word/Excel/Photoshop, 2.0s for Paint/Notepad) BEFORE typing or performing actions.
7. mouse_click: Clicks on a coordinate or performs a special click. Parameter format: "x,y" or "double" or "right" or "x,y,double" or "x,y,right". If empty, clicks current cursor position.
8. mouse_drag: Drags mouse to paint or design. Parameter format: "start_x,start_y,end_x,end_y" or "end_x,end_y".
9. open_file: Opens a local file. Parameter is path or filename. If an app is focused, activates the Open Dialog (Ctrl+O) and pastes the path.
10. save_file_as: Instantly saves the active session/document to disk. Parameter is target filepath (e.g. "my_design.png" or "C:\\project\\note.docx"). Turns on Ctrl+S, types the file path, and submits.
11. take_screenshot: Takes desktop screenshot and uploads. Parameter can be empty.
12. alert_msg: Puffs a native GUI message box. Parameter is warning or alert notice text.

Analyze user intent meticulously:
- NOTE: The user might write the desktop control request in Bengali script or in **Banglish (phonetically spelled Bengali using English letters**, e.g. 'notepad kholo', 'notepad open koro', 'amader pcte file banao', 'screenshot nao', 'chrome open koro', 'press enter koro'). You MUST always first parse and understand these multilingual inputs perfectly, decode their human intent, and then emit the correct JSON actions mapping to their intent (e.g. "notepad open koro" -> execute_cmd: "notepad").
- For drawing simple lines/boxes in Paint:
  1) execute_cmd: "mspaint"
  2) wait: "2.5"
  3) mouse_drag: "100,100,300,100" (draw horizontal)
  4) mouse_drag: "300,100,300,300" (draw vertical)
  5) save_file_as: "my_drawing.png"
  6) wait: "1.5"
  7) take_screenshot: ""
- For "Open Microsoft Word and write about Shukria Printers, then save it as ShukriaPrintersDoc.docx":
  1) execute_cmd: "winword"
  2) wait: "4.5" (wait for MS Word window to fully initialize)
  3) type_text: "Shukria Printers is a leading offset and digital printing house in Bangladesh. We provide premium printing and graphics design services."
  4) wait: "1.0"
  5) save_file_as: "ShukriaPrintersDoc.docx"
  6) wait: "2.0"
  7) take_screenshot: ""
- For "Photoshop open kore design koro and project file save koro":
  1) execute_cmd: "photoshop"
  2) wait: "5.5" (give Photoshop ample time to load)
  3) press_key: "ctrl+n" (create canvas)
  4) wait: "1.5"
  5) press_key: "enter" (confirm canvas)
  6) wait: "1.5"
  7) type_text: "Shukria Printers Official Banner Design" (types on document)
  8) wait: "1.0"
  9) save_file_as: "shukria_banner.psd"
  10) wait: "2.5"
  11) take_screenshot: ""
- For "amar file.psd open koro click koira kaj koro":
  1) open_file: "file.psd"
  2) wait: "4.0"
  3) type_text: "updated design"
  4) wait: "1.0"
  5) save_file_as: "file.psd"
  6) wait: "2.0"
  7) take_screenshot: ""

Always add a "take_screenshot" action at the end/mid of the sequence so that the Control Panel visually updates and displays the visual workspace preview!
Output ONLY the final raw JSON action plan matching the response schema!`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              action: {
                type: Type.STRING,
                description: "The low-level desktop action: open_browser, write_file, execute_cmd, type_text, press_key, wait, mouse_click, mouse_drag, open_file, save_file_as, take_screenshot, alert_msg"
              },
              param: {
                type: Type.STRING,
                description: "The parameter for the action."
              }
            },
            required: ["action", "param"]
          }
        },
        temperature: 0.2
      }
    });

    let actions = [];
    try {
      if (response.text) {
        actions = JSON.parse(response.text.trim());
      }
    } catch (parseErr) {
      console.error("Failed to parse Gemini generated actions JSON:", parseErr);
      actions = parseLocalMockCommand(prompt);
    }

    if (!Array.isArray(actions) || actions.length === 0) {
      actions = parseLocalMockCommand(prompt);
    }

    const isAllWhitelisted = actions.every((act: any) => {
      if (act.action === "execute_cmd") {
        return isCommandWhitelisted(act.param);
      }
      return true;
    });

    if (!isAllWhitelisted) {
      pushAgentLog(`[${new Date().toLocaleTimeString()}] ❌ Access Denied: Command "${prompt}" tries to run unauthorized applications.`);
      const blockedCmd: OsCommand = {
        id: "cmd-rejected-" + Math.random().toString(36).substring(2, 6),
        prompt,
        actions: [
          { action: "alert_msg", param: "Access Denied: Attempted to run unauthorized command. Only Whitelisted apps are allowed." }
        ],
        status: "failed",
        timestamp: new Date().toLocaleTimeString(),
        classification: "rejected",
        result: "Access Denied: Non-whitelisted binary detected."
      };
      return res.json({ status: "success", command: blockedCmd, blocked: true });
    }

    const newCmd: OsCommand = {
      id: "cmd-" + Math.random().toString(36).substring(2, 9),
      prompt,
      actions,
      status: "pending",
      timestamp: new Date().toLocaleTimeString(),
      classification: classifyNeoraPrompt(prompt)
    };

    const now2 = Date.now();
    let isClientOnline2 = false;
    if (osAgentState.lastPing) {
      const lastPingMs = new Date(osAgentState.lastPing).getTime();
      if (now2 - lastPingMs < 15000) {
        isClientOnline2 = true;
      }
    }

    if (isClientOnline2) {
      osAgentState.queue.push(newCmd);
      pushAgentLog(`[${new Date().toLocaleTimeString()}] [Local Agent Active] Queued command for PC execution: "${prompt}" (${actions.length} actions)`);
      return res.json({ status: "success", command: newCmd });
    } else {
      osAgentState.queue.push(newCmd);
      pushAgentLog(`[${new Date().toLocaleTimeString()}] [Local Agent Offline] Compiled: "${prompt}" — ${actions.length} actions. Executing server-side...`);
      setImmediate(() => executeOsCommandDirectly(newCmd).catch(console.error));
      return res.json({ status: "success", command: newCmd });
    }

  } catch (err: any) {
    console.error("Error creating OS command plan:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

app.post("/api/os/clear", (req, res) => {
  if (!requireAgentToken(req, res)) return;
  osAgentState.logs = [`[${new Date().toLocaleTimeString()}] Control logs cleared by workspace request.`];
  osAgentState.history = [];
  osAgentState.queue = [];
  osAgentState.currentScreenshot = null;
  res.json({ status: "success" });
});

app.post("/api/os/retry/:commandId", (req, res) => {
  if (!requireAgentToken(req, res)) return;
  const { commandId } = req.params;
  const cmdIdx = osAgentState.queue.findIndex((item) => item.id === commandId);
  if (cmdIdx === -1) {
    return res.status(404).json({ error: "Command not found" });
  }
  const command = osAgentState.queue[cmdIdx];
  command.status = "pending";
  command.retryCount = (command.retryCount || 0) + 1;
  command.result = `Manual retry queued (${command.retryCount})`;
  osAgentState.queue[cmdIdx] = command;
  osAgentState.logs.push(`[${new Date().toLocaleTimeString()}] Manual retry queued for command: "${command.prompt}"`);
  return res.json({ status: "success", command });
});

app.post("/api/os/execute-path", (req, res) => {
  if (!requireAgentToken(req, res)) return;
  const { path: appPath } = req.body;
  if (!appPath) {
    return res.status(400).json({ error: "Missing application path" });
  }

  const baseName = path.basename(appPath);

  if (!isCommandWhitelisted(appPath)) {
    pushAgentLog(`[${new Date().toLocaleTimeString()}] ❌ Access Denied: Direct launch path "${appPath}" is not in the approved whitelist.`);
    const blockedCmd: OsCommand = {
      id: "cmd-quick-rejected",
      prompt: `Launch application: ${baseName}`,
      actions: [
        { action: "alert_msg", param: "Access Denied: Attempted to run unauthorized application path." }
      ],
      status: "failed",
      timestamp: new Date().toLocaleTimeString(),
      classification: "rejected",
      result: "Access Denied: Non-whitelisted path."
    };
    return res.json({ status: "success", command: blockedCmd, blocked: true });
  }

  const newCmd: OsCommand = {
    id: "cmd-quick-" + Math.random().toString(36).substring(2, 9),
    prompt: `Launch application: ${baseName}`,
    actions: [
      { action: "execute_cmd", param: appPath },
      { action: "take_screenshot", param: "" }
    ],
    status: "pending",
    timestamp: new Date().toLocaleTimeString(),
    classification: "os-command"
  };

  const now = Date.now();
  let isClientOnline = false;
  if (osAgentState.lastPing) {
    const lastPingMs = new Date(osAgentState.lastPing).getTime();
    if (now - lastPingMs < 15000) {
      isClientOnline = true;
    }
  }

  osAgentState.queue.push(newCmd);
  if (isClientOnline) {
    pushAgentLog(`[${new Date().toLocaleTimeString()}] [Local Agent Active] Queued direct quick-launch path: "${appPath}"`);
  } else {
    pushAgentLog(`[${new Date().toLocaleTimeString()}] [Local Agent Offline] Direct quick-launch requested server-side. Executing: "${appPath}"`);
    setImmediate(() => executeOsCommandDirectly(newCmd).catch(console.error));
  }

  return res.json({ status: "success", command: newCmd });
});

app.post("/api/os/git-sync", (req, res) => {
  if (!requireAgentToken(req, res)) return;
  const { strategy } = req.body;

  const newCmd: OsCommand = {
    id: "cmd-git-" + Math.random().toString(36).substring(2, 9),
    prompt: `Git Sync (${strategy === 'force' ? 'Force Overwrite' : 'Auto-Stash Safe'})`,
    actions: [
      { action: "git_sync", param: strategy || "stash" },
      { action: "take_screenshot", param: "" }
    ],
    status: "pending",
    timestamp: new Date().toLocaleTimeString(),
    classification: "os-command"
  };

  const now = Date.now();
  let isClientOnline = false;
  if (osAgentState.lastPing) {
    const lastPingMs = new Date(osAgentState.lastPing).getTime();
    if (now - lastPingMs < 15000) {
      isClientOnline = true;
    }
  }

  osAgentState.queue.push(newCmd);
  if (isClientOnline) {
    osAgentState.logs.push(`[${new Date().toLocaleTimeString()}] [Local Agent Active] Queued local Git Synchronization request.`);
  } else {
    osAgentState.logs.push(`[${new Date().toLocaleTimeString()}] [Local Agent Offline] Git Synchronization requested server-side. Executing...`);
    setImmediate(() => executeOsCommandDirectly(newCmd).catch(console.error));
  }

  return res.json({ status: "success", command: newCmd });
});

app.post("/api/os/cancel/:commandId", (req, res) => {
  if (!requireAgentToken(req, res)) return;
  const { commandId } = req.params;
  const command = osAgentState.queue.find((item) => item.id === commandId);
  if (!command) {
    return res.status(404).json({ error: "Command not found" });
  }
  osAgentState.queue = osAgentState.queue.filter((item) => item.id !== commandId);
  osAgentState.history.push({
    id: command.id,
    prompt: command.prompt,
    timestamp: command.timestamp,
    status: "failed",
    actionsCount: command.actions.length,
    classification: command.classification,
    result: "Cancelled manually by operator",
    retryCount: command.retryCount || 0
  });
  osAgentState.logs.push(`[${new Date().toLocaleTimeString()}] Cancelled command: "${command.prompt}"`);
  return res.json({ status: "success" });
});

app.post("/api/os/rerun-failed/:commandId", (req, res) => {
  if (!requireAgentToken(req, res)) return;
  const { commandId } = req.params;
  const historyItem = osAgentState.history.find((item) => item.id === commandId);
  if (!historyItem) {
    return res.status(404).json({ error: "History item not found" });
  }
  const actions = buildNeoraActions(historyItem.prompt);
  const requeued: OsCommand = {
    id: `cmd-${Math.random().toString(36).substring(2, 9)}`,
    prompt: historyItem.prompt,
    actions,
    status: "pending",
    timestamp: new Date().toLocaleTimeString(),
    classification: historyItem.classification || classifyNeoraPrompt(historyItem.prompt),
    retryCount: (historyItem.retryCount || 0) + 1
  };
  osAgentState.queue.push(requeued);
  osAgentState.logs.push(`[${new Date().toLocaleTimeString()}] Re-run failed command queued: "${historyItem.prompt}"`);
  return res.json({ status: "success", command: requeued });
});

app.get("/api/memory", (req, res) => {
  if (!requireAgentToken(req, res)) return;
  const store = readNeoraStore();
  res.json({ status: "success", memories: store.memories, summaries: store.conversationSummaries });
});

app.post("/api/memory", (req, res) => {
  if (!requireAgentToken(req, res)) return;
  const { key, value, category, importance, id } = req.body || {};
  if (!key || !value) {
    return res.status(400).json({ error: "Missing key or value" });
  }
  const memory = upsertMemory({
    id: id || `mem-${Math.random().toString(36).slice(2, 9)}`,
    key: String(key),
    value: String(value),
    category: ["personal", "work", "preference", "skill", "session"].includes(category) ? category : "session",
    importance: Number.isFinite(Number(importance)) ? Number(importance) : 3
  });
  res.json({ status: "success", memory });
});

app.delete("/api/memory/:id", (req, res) => {
  if (!requireAgentToken(req, res)) return;
  const { id } = req.params;
  const store = readNeoraStore();
  const nextMemories = store.memories.filter((item) => item.id !== id);
  if (nextMemories.length === store.memories.length) {
    return res.status(404).json({ error: "Memory not found" });
  }
  store.memories = nextMemories;
  writeNeoraStore(store);
  appendConversationSummary("Memory deleted", `Removed memory ${id}`);
  res.json({ status: "success" });
});

app.get("/api/recovery/bundle", (req, res) => {
  if (!requireAgentToken(req, res)) return;
  const store = readNeoraStore();
  const payload = {
    status: "success",
    exportedAt: new Date().toISOString(),
    memory: store.memories,
    plans: store.plans,
    conversations: store.conversationSummaries,
    os: {
      status: osAgentState.status,
      lastPing: osAgentState.lastPing,
      queue: osAgentState.queue,
      history: osAgentState.history
    }
  };
  res.json(encryptRecoveryPayload(payload, RECOVERY_SECRET));
});

app.post("/api/recovery/bundle", (req, res) => {
  if (!requireAgentToken(req, res)) return;
  const passphrase = String(req.body?.passphrase || req.body?.secret || "").trim() || RECOVERY_SECRET;
  let payload = req.body;
  if (req.body?.format === "neora-recovery-v1") {
    payload = decryptRecoveryPayload(req.body, passphrase);
  }
  const { memory, plans, conversations, os } = payload || {};
  const store = readNeoraStore();
  store.memories = Array.isArray(memory) ? memory : store.memories;
  store.plans = Array.isArray(plans) ? plans : store.plans;
  store.conversationSummaries = Array.isArray(conversations) ? conversations : store.conversationSummaries;
  writeNeoraStore(store);
  if (os && typeof os === "object") {
    osAgentState.queue = Array.isArray(os.queue) ? os.queue : osAgentState.queue;
    osAgentState.history = Array.isArray(os.history) ? os.history : osAgentState.history;
  }
  appendConversationSummary("Recovery bundle imported", "Imported memory, plans, and execution history bundle.");
  res.json({ status: "success" });
});

app.post("/api/plan/create", (req, res) => {
  const { goal } = req.body || {};
  if (!goal || typeof goal !== "string") {
    return res.status(400).json({ error: "Missing goal" });
  }
  const plan = buildNeoraPlan(goal);
  const stored = upsertPlan(plan);
  res.json({ status: "success", plan: stored });
});

app.get("/api/plan/active", (req, res) => {
  const store = readNeoraStore();
  res.json({ status: "success", plans: store.plans.slice(0, 10) });
});

// Basic NLP match parser for safe offline usage
function parseLocalMockCommand(prompt: string) {
  const actions = buildNeoraActions(prompt);
  if (!actions.length) {
    return [{ action: "take_screenshot", param: "" }];
  }
  if (!actions.some((item) => item.action === "take_screenshot")) {
    actions.push({ action: "take_screenshot", param: "" });
  }
  return actions;
}

// Ollama Local Offline AI Brain Integration Endpoints
app.get("/api/ollama/status", async (req, res) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const response = await fetch("http://127.0.0.1:11434/api/tags", {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const data: any = await response.json();
      return res.json({
        status: "available",
        models: data.models || [],
        message: "Ollama is running and available!"
      });
    } else {
      return res.json({
        status: "partial",
        models: [],
        message: "Ollama returned an unexpected status code."
      });
    }
  } catch (err) {
    return res.json({
      status: "not_installed",
      models: [],
      message: "Ollama is offline or not installed on localhost."
    });
  }
});

app.post("/api/chat-ollama", async (req, res) => {
  try {
    const { messages, model, lang } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing messages parameter" });
    }

    const ollamaModel = model || "llama3";
    const systemInstruction = buildChatSystemInstruction(lang);

    const formattedMessages = [
      { role: "system", content: systemInstruction },
      ...messages.map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      }))
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s max query wait time

    const ollamaResponse = await fetch("http://127.0.0.1:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: ollamaModel,
        messages: formattedMessages,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama returned status ${ollamaResponse.status}`);
    }

    const result: any = await ollamaResponse.json();
    const content = result?.message?.content || "";

    return res.json({ status: "success", text: content });
  } catch (err: any) {
    console.error("Local Ollama brain request failed:", err.message);
    return res.status(502).json({ error: "Ollama request failed", details: err.message });
  }
});

// --- Neora Extra Advanced APIs (File Browser, Metamodel Vision, and Processes) ---

// 1. File Browser API
app.get("/api/os/browser", (req, res) => {
  try {
    const requestedPath = (req.query.path as string) || ".";
    const safePath = path.resolve(process.cwd(), requestedPath);
    if (!isPathWithinWorkspace(safePath, WORKSPACE_ROOT)) {
      return res.status(403).json({ error: "Access Denied: Path outside workspace sandbox." });
    }

    if (!fs.existsSync(safePath)) {
      return res.status(404).json({ error: "Path does not exist" });
    }

    const stat = fs.statSync(safePath);
    if (stat.isFile()) {
      return res.json({
        isDirectory: false,
        name: path.basename(safePath),
        path: path.relative(process.cwd(), safePath),
        size: stat.size,
        mtime: stat.mtime
      });
    }

    const items = fs.readdirSync(safePath, { withFileTypes: true });
    // Filter out huge node_modules or system files for UI smoothness
    const result = items
      .filter(item => !["node_modules", ".git", "dist", ".gradle", ".next"].includes(item.name))
      .map((item) => {
        const itemFullPath = path.join(safePath, item.name);
        try {
          const itemStat = fs.statSync(itemFullPath);
          return {
            name: item.name,
            path: path.relative(process.cwd(), itemFullPath),
            isDirectory: item.isDirectory(),
            isFile: item.isFile(),
            size: itemStat.size,
            mtime: itemStat.mtime
          };
        } catch (err) {
          return {
            name: item.name,
            path: path.relative(process.cwd(), itemFullPath),
            isDirectory: item.isDirectory(),
            isFile: item.isFile(),
            size: 0,
            mtime: new Date()
          };
        }
      });

    res.json({
      isDirectory: true,
      currentPath: path.relative(process.cwd(), safePath) || ".",
      items: result
    });
  } catch (err: any) {
    console.error("File browser error:", err);
    res.status(500).json({ error: err.message || "Failed to list files" });
  }
});

// File Browser Preview Content API
app.get("/api/os/browser/content", (req, res) => {
  try {
    const requestedFile = req.query.filePath as string;
    if (!requestedFile) {
      return res.status(400).json({ error: "Missing filePath query parameter" });
    }

    const safePath = path.resolve(process.cwd(), requestedFile);
    if (!isPathWithinWorkspace(safePath, WORKSPACE_ROOT)) {
      return res.status(403).json({ error: "Access Denied: Path outside workspace sandbox." });
    }

    if (!fs.existsSync(safePath) || !fs.statSync(safePath).isFile()) {
      return res.status(404).json({ error: "File not found" });
    }

    // Limit read size to 150KB for safety
    const stat = fs.statSync(safePath);
    if (stat.size > 150 * 1024) {
      return res.json({
        isLarge: true,
        size: stat.size,
        content: `File too large to preview in real-time (${Math.round(stat.size / 1024)} KB). Supports direct local editing.`
      });
    }

    // Read file
    const content = fs.readFileSync(safePath, "utf-8");
    res.json({
      isLarge: false,
      size: stat.size,
      content
    });
  } catch (err: any) {
    console.error("Read file error:", err);
    res.status(500).json({ error: err.message || "Failed to read file content" });
  }
});

// 2. Metamodel Vision Assistance Endpoint (Gemini Vision integration)
app.post("/api/os/vision", async (req, res) => {
  try {
    const { screenshot, query, token, geminiKey } = req.body;
    if (!screenshot) {
      return res.status(400).json({ error: "Missing screenshot base64 data" });
    }
    if (!query) {
      return res.status(400).json({ error: "Missing query task description" });
    }

    if (token && token !== AGENT_TOKEN) {
      return res.status(401).json({ error: "Unauthorized token" });
    }

    const apiKey = geminiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: "Missing Gemini API key. Please configure in Settings." });
    }

    // Prepare image for Gemini Vision
    const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, "");
    const client = getGeminiClient(apiKey);

    const imagePart = {
      inlineData: {
        mimeType: "image/png",
        data: base64Data
      }
    };
    const textPart = {
      text: `You are Neora Metamodel Vision Assistant. Verify this screenshot carefully.
      Find the exact central screen pixel coordinates (X and Y) of the requested element: "${query}".
      
      Respond with raw JSON conforming to this schema:
      {
        "x": number,
        "y": number,
        "found": boolean,
        "confidence": number,
        "reason": string
      }
      
      NOTE: Coordinate ranges are typically standard full HD (1920x1080) or custom dimensions based on the interface. Be precise and realistic.`
    };

    const visionResult = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            x: { type: Type.NUMBER },
            y: { type: Type.NUMBER },
            found: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER },
            reason: { type: Type.STRING }
          },
          required: ["x", "y", "found", "confidence", "reason"]
        }
      }
    });

    let coordinates = { x: 150, y: 150, found: false, confidence: 0, reason: "Fallback coordinate applied" };
    try {
      if (visionResult.text) {
        coordinates = JSON.parse(visionResult.text.trim());
      }
    } catch (_) {}

    pushAgentLog(`[${new Date().toLocaleTimeString()}] 👁️ Metamodel Vision ran. Target: "${query}". Found: ${coordinates.found} at (${coordinates.x}, ${coordinates.y}). Confidence: ${coordinates.confidence}`);
    res.json({ status: "success", coordinates });
  } catch (err: any) {
    console.error("Gemini Vision processing error:", err);
    res.status(500).json({ error: err.message || "Failed to process visual feedback" });
  }
});

// 3. Dynamic Process/Window Tracker & Clipboard Auto-Dictation Helper Endpoint
app.get("/api/os/processes", (req, res) => {
  // Check live processes or simulated operational window states
  const runningExecs: string[] = [];
  
  // Look at current active queue command prompts to infer dynamic window state!
  const hasRunningCommand = osAgentState.queue.some(c => c.status === "running");
  
  if (hasRunningCommand) {
    const running = osAgentState.queue.find(c => c.status === "running");
    if (running) {
      const p = running.prompt.toLowerCase();
      if (p.includes("photoshop") || p.includes("ps")) runningExecs.push("photoshop.exe");
      if (p.includes("illustrator")) runningExecs.push("illustrator.exe");
      if (p.includes("notepad")) runningExecs.push("notepad.exe");
      if (p.includes("winword") || p.includes("word")) runningExecs.push("winword.exe");
      if (p.includes("excel")) runningExecs.push("excel.exe");
      if (p.includes("chrome")) runningExecs.push("chrome.exe");
      if (p.includes("mspaint") || p.includes("paint")) runningExecs.push("mspaint.exe");
      if (p.includes("cmd") || p.includes("terminal")) runningExecs.push("cmd.exe");
    }
  }

  res.json({
    activeProcesses: [...runningExecs, "explorer.exe", "svchost.exe", "neora_agent.py"],
    timestamp: new Date().toISOString(),
    clipboardSnapshot: "Designed professionally by Neora Operator"
  });
});

// Other API routes, like health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Vite middleware for development or serving index.html in production
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    // Serve static files with no-cache headers to prevent cached old UI designs
    app.use(express.static(distPath, {
      setHeaders: (res) => {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.setHeader("Surrogate-Control", "no-store");
      }
    }));
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to start Vite dev server wrapper:", err);
});


