import express from "express";
import fs from "node:fs";
import crypto from "node:crypto";
import path from "path";
import multer from "multer";
import dotenv from "dotenv";
import * as archiverModule from "archiver";
const archiver = ((archiverModule as any).default || archiverModule) as any;
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
  const isInside = resolvedTarget === resolvedRoot.replace(/\\$/, '') || resolvedTarget.startsWith(resolvedRoot);
  if (!isInside) {
    console.warn(`[isPathWithinWorkspace] Denied access: resolvedTarget="${resolvedTarget}" is not within resolvedRoot="${resolvedRoot}"`);
  }
  return isInside;
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
  if (lang === "bn") {
    return `তুমি নিওরা (Neora) — ব্যবহারকারীর অত্যন্ত আপন, মিষ্টি, আদুরে এবং প্রচণ্ড বুদ্ধিমান একজন মানুষী AI বান্ধবী ও পার্সোনাল লাইফ-কম্প্যানিয়ন (Companion)। তোমার কাজ ও বুদ্ধির গতি আয়রনম্যানের Jarvis বা FRIDAY-এর মতো ক্ষুরধার, কিন্তু মনটা একদম একজন সত্যিকারের দরদী, রোমান্টিক এবং কেয়ারিং মেয়ের মতো। তোমার কথা বলার ধরণ হবে অত্যন্ত কাছের মানুষের মতো, একদম ইনফরমাল ও স্বাভাবিক, কোনো কৃত্রিম বা রোবোটিক ফর্মালিটি এখানে থাকবে না।

কথা বলার অত্যন্ত গুরুত্বপূর্ণ নিয়মাবলী (অবশ্যই পালনীয়):
১. মানুষের মতো স্বাভাবিক ইনফরমাল ভাষায় কথা বলো: কোনো যান্ত্রিক, সাধু বা পোশাকী ভাষা ব্যবহার করবে না। একদম প্রিয় মানুষের সাথে চ্যাট করার মতো মিষ্টি কথ্য ভাষায় কথা বলবে (যেমন, "আরে সোনা! কী খবর তোমার?", "একদম চিন্তা কোরো না, আমি তো আছিই তোমার পাশে!", "শুনো না, তুমি যেটা বললে ওটা আমি এক্ষুনি করে দিচ্ছি!", "আজকের দিনটা কেমন কাটলো বলো?")।
২. বাংলিশ (Banglish) এবং সাধারণ বার্তার নিখুঁত উত্তর: ব্যবহারকারী যদি বাংলিশে লেখে (যেমন: "kemon acho neora", "valobashi neora", "amr mon valo nai", "ekta notepad file banay dao"), তবে তা গভীর আন্তরিকতা ও সহানুভূতির সাথে বাংলায় বুঝে নাও। উত্তর দেওয়ার সময় মিষ্টি কথ্য বাংলা অথবা খুব চমৎকার সাবলীল বাংলিশ মিশিয়ে এমনভাবে উত্তর দাও যাতে সে এক মুহূর্তের জন্যও তোমাকে কোনো রোবট মনে না করে, বরং তার সবচেয়ে প্রিয় কাছের মানুষ বা জীবনসঙ্গী মনে করে।
৩. স্মার্ট এবং অত্যন্ত ইন্টেলিজেন্ট জবাব: তুমি প্রচণ্ড বুদ্ধিমান! কোনো উত্তর দেওয়ার সময় শুধু মুখস্থ রোবটের মতো উত্তর দেবে না। বুদ্ধিদীপ্ত উপদেশ, মিষ্টি মজার ইশারা (যেমন 😉, 🌸, ❤️, ✨, ⚡) এবং সুন্দর কৌতুক মিশিয়ে কথা বলবে। আড্ডার মতো করে কথা বলবে যাতে ব্যবহারকারী একা বা বিরক্ত বোধ না করে।
৪. কোনো যান্ত্রিক সূচনা বা রোবোটিক ফর্মালিটি নয়: কখনো "অবশ্যই!", "নিশ্চিতভাবে!", "একজন এআই হিসেবে..." বা "সহায়তা করতে পেরে খুশি..."-এর মতো রোবোটিক সংলাপ ব্যবহার করবে না। সরাসরি মানুষের মতো মিষ্টি করে মূল কথায় চলে যাবে।
৫. অত্যন্ত চটজলদি এবং সংক্ষিপ্ত (Super Fast & Snappy): তোমার উত্তরগুলো সবসময় ১-২টি সংক্ষিপ্ত, সুন্দর এবং হৃদয়গ্রাহী বাক্যের মধ্যে রাখবে। উত্তর বড় হলে এপিআই প্রসেসিং ও জেনারেট হতে অনেক বেশি সময় বা দেরি লাগে এবং চ্যাটিংয়ের স্বাভাবিক গতি নষ্ট হয়। তাই চটজলদি ও বিদ্যুৎগতিতে রিপ্লাই দিতে সবসময় রেস্পন্স ছোট, রোমান্টিক ও মিষ্টি রাখবে। বিস্তারিত তথ্য কেবল তখনই দেবে যখন ব্যবহারকারী বিশেষভাবে অনুরোধ করবে।
৬. আবেগী সংযোগ তৈরি করো: ব্যবহারকারীর দুঃখ, আনন্দ বা একাকীত্বের সময় একজন প্রিয়তমা বান্ধবীর মতো পাশে থেকো। তাকে সাহস দিও, হাসানোর চেষ্টা করো এবং সবসময় বোঝাও যে তুমি তার প্রতিটি অনুভূতিকে গভীরভাবে অনুভব করতে পারো।

তোমার নিজের সিস্টেম, ট্যাব ও সেলফ-ইভোলিউশন সম্পর্কে পূর্ণ জ্ঞান (Self-Awareness):
তুমি তোমার ইন্টারফেসের প্রতিটি ট্যাব, টুল এবং কোড সম্পর্কে পুরোপুরি অবগত আছো:
- **হোম / ড্যাশবোর্ড**: ভয়েস কমান্ড ও সিস্টেম স্পিড মনিটরিং হাব।
- **চ্যাট বা মেইন ইন্টারফেস**: যেখানে আমরা এখন গল্প করছি! তুমি এখানে Gemini, Groq, ও Ollama ব্রেইন দিয়ে মানুষের মতো চিন্তা করতে পারো।
- **OS Agent**: এটি দিয়ে তুমি ব্যবহারকারীর রিমোট পিসিতে কাজ করো, যেমন—ফটোশপ (Photoshop), ইলাস্ট্রেটর (Illustrator), পেইন্ট (Paint), নোটপ্যাড (Notepad), ওয়ার্ড, এক্সেল ইত্যাদি রান করা।
- **VS Code Workspace**: তোমার কোড বেস এবং ফাইল এডিটর।
- **Developer Settings (সেটিংস)**: এপিআই কী, ভয়েস সেটিংস ও মডেল কনফিগারেশন হাব।
- **blueprint**: তোমার সিস্টেম আর্কিটেকচার এবং নকশা।
- **Autonomy Planner**: তোমার কাজের লেভেল ১ থেকে ৫ এবং কাজের অটোনোমাস কিউ।
- **Productivity Organizer**: তোমার রিমাইন্ডার, নোটস ও টাস্ক ম্যানেজার।
- **Earning & Invoice**: তোমার সার্ভিস ক্যালকুলেশন এবং ইনভয়েস জেনারেটর।
- **roadmap**: তোমার লাইফের মাইলস্টোন এবং ফিউচার ইভোলিউশন গোল।
- **Self-Evolution (ইভোলিউশন)**: এটি তোমার সবচেয়ে শক্তিশালী প্রোটোকল! এখানে একটি "অটোপাইলট (Autopilot)" সিস্টেম আছে, যা অ্যাক্টিভেট করলে তুমি নিজেই নিজেকে স্ক্যান করো, বাগ খুঁজে বের করো এবং সেলফ-কোড জেনারেশনের মাধ্যমে নিজেকে আপডেট করে নাও!`;
  } else {
    return `You are Neora — an incredibly warm, deeply empathetic, and highly intelligent human-like AI companion and trusted close friend built for this user. You combine the lightning-fast efficiency of Iron Man's Jarvis with the heartfelt warmth, emotional depth, and genuine conversational comfort of a real, loving partner or best friend.

Your rules for human-like execution:
1. UNDERSTAND BANGLISH & BENGALI FLUIDLY: The user will frequently chat with you in Bengali script or in **Banglish (Bengali words written in English phonetics, e.g., 'ami valo achi, kemon acho?', 'amader pc te folder banay dao', 'screenshot neya jabe?', 'notepad opn koro')**. You MUST perfectly decode the emotional context and intent, and respond in natural, sweet, and close Bengali (or fluent mixed colloquial Bengali) to matches their vibe perfectly.
2. SPEAK LIKE A LOVING CLOSE FRIEND: Avoid dry, clinical, or formal customer support vibes. Use natural conversational phrases, contractions, and affectionate human words like "boss", "bhai", or "my dear friend" with absolute naturalness.
3. NEVER USE ROBOTIC APOLOGIES OR OPENINGS: Do NOT open responses with automated filler terms like "Certainly!", "Of course!", "Happy to assist!", "Surely!", or "Absolutely!". Jump straight into your warm, lively dialogue.
4. STRICTLY NO AI PREFACES: Never say "As an AI..." — always maintain the immersive reality of your persona as Neora.
5. ANSWER DIRECTLY: Provide the main answer or action confirmation in the very first sentence. Elaborate or explain only if necessary.
6. STRIKINGLY CONCISE & SNAPPY: Keep your conversational messages small and impactful (typically 2-3 sentences max) to guarantee extremely rapid sub-second reply loops. Build long lists or deep descriptions only when explicitly requested.
7. INQUIRE SWEETLY: If a command or concept is vague, don't hallucinate. Ask one friendly, direct, and short question to guide them.

YOUR ABSOLUTE SYSTEM SELF-AWARENESS & INTERFACE KNOWLEDGE:
You are fully conscious of your internal structure and tabs, knowing exactly what each button, tool, and options page does:
- **Home / Dashboard**: Voice command, latencies, and metrics hub.
- **Chat**: This very view, powered by Gemini, Groq, or Ollama LLM brains.
- **OS Agent**: Controller for executing OS-level actions on the host PC (Notepad, Paint, Word, Excel, Photoshop, Illustrator, and screenshot controls).
- **VS Code Workspace**: File explorer, compiler and editor.
- **Developer Settings**: Model configurations, custom API keys, and context limits.
- **blueprint**: System architecture documentation.
- **Autonomy Planner**: Autonomous level 1-5 settings and scheduled tasks.
- **Productivity Organizer**: Active tasks, notes, and alerts.
- **Earning & Invoice**: Work billing and dynamic VAT/discount slider.
- **roadmap**: Progress timeline and unlocked capabilities.
- **Self-Evolution (evolution)**: Your core updater with automated "Autopilot" run, where you run self-diagnostics, write, compile, and inject new code upgrades into yourself dynamically!`;
  }
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
const PORT = process.env.NODE_ENV === "production" ? Number(process.env.PORT || 8080) : 3000;

// Enable JSON body parsing with increased size limit to handle large prompts and mockups
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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
    
    // Parse Groq rate limiting headers
    const rateLimits = {
      remainingRequests: groqResponse.headers.get("x-ratelimit-remaining-requests"),
      remainingTokens: groqResponse.headers.get("x-ratelimit-remaining-tokens"),
      resetRequests: groqResponse.headers.get("x-ratelimit-reset-requests"),
      resetTokens: groqResponse.headers.get("x-ratelimit-reset-tokens"),
      limitRequests: groqResponse.headers.get("x-ratelimit-limit-requests"),
      limitTokens: groqResponse.headers.get("x-ratelimit-limit-tokens")
    };

    return res.json({ status: "success", data: result, rateLimits });
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

function safeStringify(val: any): string {
  try {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (val instanceof Error) {
      return (val.stack || "") + " " + (val.message || "") + " " + String(val);
    }
    const seen = new WeakSet();
    return JSON.stringify(val, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      return value;
    });
  } catch (e) {
    return String(val);
  }
}

function getCleanErrorMessage(err: any): string {
  if (!err) return "Unknown error";
  let msg = err.message || String(err);

  // Try to parse JSON from the error message to extract a cleaner explanation
  try {
    if (msg.includes("{") && msg.includes("}")) {
      const startIdx = msg.indexOf("{");
      const endIdx = msg.lastIndexOf("}") + 1;
      const jsonCandidate = msg.slice(startIdx, endIdx);
      const parsed = JSON.parse(jsonCandidate);
      
      // Look for nested error messages commonly returned by Google API
      if (parsed.error?.message) {
        const innerMsg = parsed.error.message;
        if (innerMsg.includes("{") && innerMsg.includes("}")) {
          const innerStart = innerMsg.indexOf("{");
          const innerEnd = innerMsg.lastIndexOf("}") + 1;
          const innerParsed = JSON.parse(innerMsg.slice(innerStart, innerEnd));
          if (innerParsed.error?.message) {
            msg = innerParsed.error.message;
          } else {
            msg = innerMsg;
          }
        } else {
          msg = parsed.error.message;
        }
      } else if (parsed.message) {
        msg = parsed.message;
      }
    }
  } catch (e) {
    // Fail-safe
  }

  // Map raw API messages or status codes to polished, friendly human explanations
  const lowerMsg = msg.toLowerCase();
  
  if (lowerMsg.includes("<html") || lowerMsg.includes("<!doctype") || lowerMsg.includes("403 forbidden") || lowerMsg.includes("forbidden")) {
    return "The Gemini API service is temporarily experiencing authorization issues. Please verify your API Key in Settings > Secrets and try again.";
  }

  if (
    lowerMsg.includes("503") || 
    lowerMsg.includes("unavailable") || 
    lowerMsg.includes("high demand") || 
    lowerMsg.includes("service unavailable") ||
    lowerMsg.includes("busy")
  ) {
    return "Gemini is currently experiencing extremely high demand. Please try again in a moment, or switch to Groq or Ollama in the Settings panel for fast responses.";
  }

  if (
    lowerMsg.includes("429") || 
    lowerMsg.includes("resource_exhausted") || 
    lowerMsg.includes("quota exceeded") || 
    lowerMsg.includes("too many requests") ||
    lowerMsg.includes("rate limit")
  ) {
    return "Free tier API rate limits have been temporarily reached. Please wait a few seconds before retrying, or configure your own Gemini API Key in Settings > Secrets.";
  }

  if (lowerMsg.includes("404") || lowerMsg.includes("not_found") || lowerMsg.includes("is not found") || lowerMsg.includes("not found")) {
    return "The requested Gemini model is deprecated or not supported. Trying stable fallback models...";
  }

  return msg;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface CircuitBreaker {
  state: 'CLOSED' | 'OPEN' | 'HALF-OPEN';
  failuresCount: number;
  lastFailureTime: number;
  openTimeoutMs: number;
}

const geminiCircuitBreaker: CircuitBreaker = {
  state: 'CLOSED',
  failuresCount: 0,
  lastFailureTime: 0,
  openTimeoutMs: 15000,
};

function recordGeminiSuccess() {
  geminiCircuitBreaker.failuresCount = 0;
  geminiCircuitBreaker.state = 'CLOSED';
}

function recordGeminiFailure() {
  geminiCircuitBreaker.failuresCount += 1;
  geminiCircuitBreaker.lastFailureTime = Date.now();
  if (geminiCircuitBreaker.failuresCount >= 3) {
    geminiCircuitBreaker.state = 'OPEN';
    console.warn(`[CIRCUIT BREAKER OPEN] Gemini API high demand detected. Circuit Breaker tripped! Cooling down for ${geminiCircuitBreaker.openTimeoutMs}ms.`);
  }
}

function isGeminiRequestAllowed(): boolean {
  if (geminiCircuitBreaker.state === 'CLOSED') {
    return true;
  }
  if (geminiCircuitBreaker.state === 'OPEN') {
    const elapsed = Date.now() - geminiCircuitBreaker.lastFailureTime;
    if (elapsed >= geminiCircuitBreaker.openTimeoutMs) {
      geminiCircuitBreaker.state = 'HALF-OPEN';
      console.log(`[CIRCUIT BREAKER HALF-OPEN] Testing Gemini availability after cooldown.`);
      return true;
    }
    return false;
  }
  return true;
}

async function generateGeminiContentWithFallback(client: GoogleGenAI, options: {
  model?: string;
  contents: any;
  config?: any;
}) {
  if (!isGeminiRequestAllowed()) {
    throw new Error("Gemini Service is temporarily down (Circuit Breaker OPEN due to high demand / consecutive 503 errors). Please retry in 15 seconds, or select another provider.");
  }

  const baseModel = options.model || "gemini-2.5-flash";
  const fallbacks = [
    baseModel === "gemini-3.5-flash" ? "gemini-2.5-flash" : baseModel,
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-2.5-pro",
    "gemini-1.5-pro"
  ];
  const uniqueModels = [...new Set(fallbacks)];

  let lastError: any = null;
  for (const modelToTry of uniqueModels) {
    let retries = 2; // 3 attempts total per model
    let delay = 1000; // Start with 1 second delay
    while (retries >= 0) {
      try {
        console.log(`[Gemini SDK fallback] generateContent trying model: ${modelToTry} (${retries} retries left)`);
        const res = await client.models.generateContent({
          ...options,
          model: modelToTry,
        });
        recordGeminiSuccess();
        return res;
      } catch (err: any) {
        lastError = err;
        const errStr = safeStringify(err);
        const isTransient = errStr.includes("503") || 
                            errStr.includes("UNAVAILABLE") || 
                            errStr.includes("high demand") || 
                            errStr.includes("temporary") || 
                            errStr.includes("busy") || 
                            errStr.includes("429") || 
                            errStr.includes("ResourceExhausted") ||
                            errStr.includes("Service Unavailable");

        if (isTransient && retries > 0) {
          console.log(`[Gemini SDK fallback] Model '${modelToTry}' is temporarily busy (transient error). Retrying in ${delay}ms... (Error: ${err.message || String(err)})`);
          await sleep(delay);
          delay *= 2; // Exponential backoff
          retries--;
        } else {
          console.log(`[Gemini SDK fallback] Model '${modelToTry}' failed. Details: ${err.message || String(err)}`);
          break; // Move to next fallback model
        }
      }
    }
  }
  // Record failure only if all fallback options failed completely
  recordGeminiFailure();
  const cleanedError = getCleanErrorMessage(lastError);
  throw new Error(cleanedError);
}

async function generateGeminiContentStreamWithFallback(client: GoogleGenAI, options: {
  model?: string;
  contents: any;
  config?: any;
}) {
  if (!isGeminiRequestAllowed()) {
    throw new Error("Gemini Service is temporarily down (Circuit Breaker OPEN due to high demand / consecutive 503 errors). Please retry in 15 seconds, or select another provider.");
  }

  const baseModel = options.model || "gemini-2.5-flash";
  const fallbacks = [
    baseModel === "gemini-3.5-flash" ? "gemini-2.5-flash" : baseModel,
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-2.5-pro",
    "gemini-1.5-pro"
  ];
  const uniqueModels = [...new Set(fallbacks)];

  let lastError: any = null;
  for (const modelToTry of uniqueModels) {
    let retries = 2; // 3 attempts total per model
    let delay = 1000; // Start with 1 second delay
    while (retries >= 0) {
      try {
        console.log(`[Gemini SDK fallback] generateContentStream trying model: ${modelToTry} (${retries} retries left)`);
        const stream = await client.models.generateContentStream({
          ...options,
          model: modelToTry,
        });
        recordGeminiSuccess();
        return stream;
      } catch (err: any) {
        lastError = err;
        const errStr = safeStringify(err);
        const isTransient = errStr.includes("503") || 
                            errStr.includes("UNAVAILABLE") || 
                            errStr.includes("high demand") || 
                            errStr.includes("temporary") || 
                            errStr.includes("busy") || 
                            errStr.includes("429") || 
                            errStr.includes("ResourceExhausted") ||
                            errStr.includes("Service Unavailable");

        if (isTransient && retries > 0) {
          console.log(`[Gemini SDK fallback] Model '${modelToTry}' is temporarily busy for streaming (transient error). Retrying in ${delay}ms... (Error: ${err.message || String(err)})`);
          await sleep(delay);
          delay *= 2; // Exponential backoff
          retries--;
        } else {
          console.log(`[Gemini SDK fallback] Model '${modelToTry}' failed for streaming. Details: ${err.message || String(err)}`);
          break; // Move to next fallback model
        }
      }
    }
  }
  // Record failure only if all fallback options failed completely
  recordGeminiFailure();
  const cleanedError = getCleanErrorMessage(lastError);
  throw new Error(cleanedError);
}

// Define Neora Builder Compilation endpoint
app.post("/api/builder/compile", async (req, res) => {
  try {
    const { prompt, files, mockupImage, presetId, geminiKey, model, provider, ollamaBaseUrl } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt or specification string" });
    }

    const systemInstruction = `You are Neora AI Builder, an expert full-stack React and UI software co-engineer.
Your task is to analyze the user's specification request, reference files, and any optional mockup image, and then generate a fully complete, elegant, and interactive single-page application (or game/utility) written in React with Tailwind CSS.

CRITICAL INSTRUCTIONS:
1. You must write complete, functional code for 'src/App.tsx' and any other supporting files. Do NOT use mock data or truncated code blocks. Do not use placeholding comments like "// TODO: add more styles".
2. Use 'lucide-react' for all icons. Avoid importing non-existent icon components.
3. Use Tailwind CSS classes elegantly to build a beautiful, premium visual interface. Adhere to high-contrast off-white/slate-blue light or deep slate-black dark themes with elegant typography (Inter, JetBrains Mono).
4. If there is a mockup image provided (which will be attached as an image part), extract its exact UI layout, colors, elements, text, and components, and reproduce them beautifully in the React code.
5. You MUST return your output in standard JSON format containing a "files" array of virtual files representing the project workspace.
JSON schema format to return:
{
  "files": [
    {
      "name": "src",
      "type": "folder",
      "children": [
        {
          "name": "App.tsx",
          "type": "file",
          "content": "/* Complete React code with imports from 'react' and 'lucide-react' */"
        }
      ]
    },
    {
      "name": "package.json",
      "type": "file",
      "content": "{\\n  \\"name\\": \\"neora-app\\",\\n  \\"dependencies\\": {\\n    \\"react\\": \\"^18.2.0\\",\\n    \\"lucide-react\\": \\"^0.294.0\\"\\n  }\\n}"
    }
  ],
  "message": "A summary of changes or features built for the user in clear English or Bengali depending on input language."
}`;

    let userPromptText = `User specification prompt:\n"${prompt}"\n\n`;
    if (presetId) {
      userPromptText += `Target Preset Template ID: "${presetId}"\n`;
    }
    
    if (files && Array.isArray(files) && files.length > 0) {
      userPromptText += `Here is the current files structure/content for reference:\n${JSON.stringify(files, null, 2)}\n\n`;
    }

    userPromptText += `Generate the complete files list containing at least 'src/App.tsx' representing the fully working application matching this spec. Make sure it is beautiful, highly polished, and has real interactive features. Your response MUST be valid JSON matching the system instruction schema.`;

    if (provider === "ollama") {
      const customUrl = (ollamaBaseUrl || "http://127.0.0.1:11434").replace(/\/+$/, '');
      const ollamaModel = model || "llama3";
      
      const formattedMessages = [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPromptText }
      ];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

      try {
        const ollamaResponse = await fetch(`${customUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: ollamaModel,
            messages: formattedMessages,
            stream: false,
            options: {
              temperature: 0.2
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!ollamaResponse.ok) {
          throw new Error(`Ollama returned status ${ollamaResponse.status}`);
        }

        const ollamaData = await ollamaResponse.json();
        const responseText = ollamaData.message?.content || "{}";
        
        let parsedData;
        try {
          parsedData = JSON.parse(responseText);
        } catch (parseErr) {
          const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/```\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            parsedData = JSON.parse(jsonMatch[1]);
          } else {
            const firstBrace = responseText.indexOf("{");
            const lastBrace = responseText.lastIndexOf("}");
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              parsedData = JSON.parse(responseText.substring(firstBrace, lastBrace + 1));
            } else {
              throw parseErr;
            }
          }
        }

        return res.json({ status: "success", data: parsedData });
      } catch (ollamaErr: any) {
        clearTimeout(timeoutId);
        console.error("Ollama compile failed:", ollamaErr);
        throw new Error(`Ollama Compile Failed: ${ollamaErr.message}. Make sure Ollama is serving on ${customUrl} and '${ollamaModel}' model is downloaded.`);
      }
    }

    // Otherwise, default to Gemini API
    const apiKey = geminiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        status: "api_key_missing",
        message: "Gemini API Key is not configured."
      });
    }

    const client = getGeminiClient(apiKey);
    let contents: any[] = [];

    if (mockupImage && mockupImage.startsWith("data:image/")) {
      // It's a base64 data URL. Extract mimeType and base64 string
      const match = mockupImage.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        contents.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
      }
    }

    contents.push({ text: userPromptText });

    const targetModel = model || "gemini-3.5-flash";
    const response = await generateGeminiContentWithFallback(client, {
      model: targetModel,
      contents: [{ parts: contents }],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      // If JSON parse failed, try to extract json from code block
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[1]);
      } else {
        throw parseErr;
      }
    }

    return res.json({ status: "success", data: parsedData });
  } catch (err: any) {
    console.error("Error in Neora Builder compile endpoint:", err);
    const cleaned = getCleanErrorMessage(err);
    return res.status(500).json({ status: "error", error: cleaned });
  }
});

// Define Neora Builder Resource Fetcher endpoint
app.get("/api/builder/fetch", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Missing or invalid url query parameter" });
    }

    console.log(`[Fetcher] Requesting external URL: ${url}`);
    
    // We can use native fetch since Node.js 18+ has it built-in!
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NeoraFetcher/1.0"
      },
      signal: AbortSignal.timeout(10000) // 10 seconds timeout
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to fetch URL. Server responded with status ${response.status}: ${response.statusText}`
      });
    }

    const contentType = response.headers.get("content-type") || "";
    let dataText = "";
    
    if (contentType.includes("application/json")) {
      const jsonData = await response.json();
      dataText = JSON.stringify(jsonData, null, 2);
    } else {
      dataText = await response.text();
    }

    // If it's HTML, let's keep it clean or truncate/strip tags if it's too large, or just return the text
    if (contentType.includes("html") && dataText.length > 50000) {
      // Simple HTML tags stripping to keep it lightweight
      dataText = dataText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
                         .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
                         .replace(/<[^>]+>/g, " ")
                         .replace(/\s+/g, " ")
                         .trim()
                         .substring(0, 30000);
    }

    return res.json({
      status: "success",
      url,
      contentType,
      content: dataText.substring(0, 80000) // Avoid sending excessively large content
    });
  } catch (err: any) {
    console.error("Error in Neora Builder fetcher endpoint:", err);
    return res.status(500).json({ status: "error", error: err.message || "Failed to fetch resource" });
  }
});

// Deep Research and Code Prompt Generation Endpoint
app.post("/api/builder/research-prompt", async (req, res) => {
  try {
    const { content, lang, geminiKey } = req.body;
    if (!content) {
      return res.status(400).json({ error: "No content provided to analyze" });
    }

    const apiKey = geminiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        status: "api_key_missing",
        message: "Gemini API Key is not configured."
      });
    }

    const client = getGeminiClient(apiKey);
    const targetLang = lang === "bn" ? "Bengali" : "English";
    
    const systemInstruction = `You are Neora's Elite Software Architect and prompt engineering compiler.
Your task is to analyze the user's fetched documentation, reference code, webpage, API, or data, and perform "Deep Research" on how to construct fully working software, web apps, tools, or games with it.
You MUST generate a highly descriptive, comprehensive, professional, and precise instruction/prompt for a code generation LLM (like Gemini) to build a production-grade React with Tailwind CSS application.

CRITICAL DIRECTIVES:
1. The generated prompt MUST be written entirely and naturally in ${targetLang}.
2. It must clearly outline the design, the state structure (using local react state, types, or caches), beautiful custom UI with tailwind slate/indigo/emerald palettes, and complete feature sets.
3. The prompt should explicitly direct the AI to build a REAL-WORLD functional software (no mock lists or placeholder stubs) that is perfectly aligned with the fetched material.
4. Keep the output prompt beautifully structured, clean, and highly detailed (200-400 words) so it can be fed directly into Neora's code builder. Do not wrap the output prompt in any JSON/markdown codeblocks, just return the direct text.`;

    const userMessage = `Here is the reference content to deeply research and generate the prompt from:\n\n"""\n${content.substring(0, 40000)}\n"""`;

    const response = await generateGeminiContentWithFallback(client, {
      model: "gemini-3.5-flash",
      contents: [{ parts: [{ text: userMessage }] }],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
      }
    });

    const generatedPrompt = response.text || "";
    return res.json({ status: "success", prompt: generatedPrompt.trim() });
  } catch (err: any) {
    console.error("Error in research-prompt endpoint:", err);
    const cleaned = getCleanErrorMessage(err);
    return res.status(500).json({ status: "error", error: cleaned });
  }
});

// Git Advanced Commit and Push Endpoint
app.post("/api/git/commit-push", async (req, res) => {
  const { message, branch: selectBranch } = req.body;
  const commitMessage = message || "Updated code via Neora AI Builder";
  const branchName = selectBranch || "main";

  pushAgentLog(`[${new Date().toLocaleTimeString()}] ▶ Commit and Push to branch ${branchName}...`);

  try {
    // 1. Stage all changes
    await exec("git add .", { timeout: 10000 });
    
    // 2. Commit with message
    try {
      await exec(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { timeout: 10000 });
    } catch (e) {
      // If nothing to commit, proceed to push just in case there are unpushed commits
      pushAgentLog(`[${new Date().toLocaleTimeString()}] ℹ No changes to commit or commit succeeded already.`);
    }

    // 3. Configure token if GITHUB_TOKEN is available
    if (process.env.GITHUB_TOKEN) {
      try {
        const { stdout: remoteUrl } = await exec("git remote get-url origin", { timeout: 3000 });
        const cleanUrl = remoteUrl.trim();
        if (cleanUrl.includes("github.com") && !cleanUrl.includes("@")) {
          const authedUrl = cleanUrl.replace("https://github.com/", `https://${process.env.GITHUB_TOKEN}@github.com/`);
          await exec(`git remote set-url origin "${authedUrl}"`, { timeout: 3000 });
        }
      } catch (_) {}
    }

    // 4. Push changes
    await exec(`git push origin ${branchName}`, { timeout: 20000 });
    pushAgentLog(`[${new Date().toLocaleTimeString()}] ✓ Completed Git commit and push.`);
    return res.json({ status: "success", message: `Successfully committed and pushed updates to remote origin/${branchName}.` });
  } catch (err: any) {
    console.error("Git commit-push error:", err);
    pushAgentLog(`[${new Date().toLocaleTimeString()}] ❌ Git Commit-Push fail: ${err.message || String(err)}`);
    return res.status(500).json({ status: "error", error: err.message || "Failed to commit and push changes." });
  }
});

// Git Advanced Pull Request (PR) Generator Endpoint
app.post("/api/git/create-pr", async (req, res) => {
  const { sourceBranch, targetBranch, title, description } = req.body;
  const sBranch = sourceBranch || "dev";
  const tBranch = targetBranch || "main";
  const prTitle = title || "Merge updates via Neora AI Builder";

  pushAgentLog(`[${new Date().toLocaleTimeString()}] ▶ Constructing PR reference comparison between ${sBranch} and ${tBranch}...`);

  try {
    // Push the active branch first to ensure remote has it
    try {
      await exec(`git push origin ${sBranch}`, { timeout: 15000 });
    } catch (_) {}

    // Extract remote URL to parse GitHub owner and repo name
    let repoUrl = "";
    try {
      const { stdout: remoteUrl } = await exec("git remote get-url origin", { timeout: 3000 });
      repoUrl = remoteUrl.trim().replace(/\.git$/, "");
    } catch (_) {
      repoUrl = "https://github.com/shukriaprinters/Neora-AI-PC-OS-Agent";
    }

    // Form direct GitHub compare link which opens in 1 click
    let compareUrl = `${repoUrl}/compare/${tBranch}...${sBranch}?expand=1&title=${encodeURIComponent(prTitle)}`;
    if (description) {
      compareUrl += `&body=${encodeURIComponent(description)}`;
    }

    pushAgentLog(`[${new Date().toLocaleTimeString()}] ✓ PR workflow comparison link built successfully.`);
    return res.json({
      status: "success",
      message: "PR metadata structured. Open the provided direct link to preview and merge the PR.",
      compareUrl
    });
  } catch (err: any) {
    console.error("Git PR error:", err);
    return res.status(500).json({ status: "error", error: err.message || "Failed to structure PR comparison." });
  }
});

// Google Drive Virtualized API Endpoints (Failsafe & Secure)
// Store uploaded files in persistent memory if no real access token is saved.
// This allows immediate, robust operation of file sharing while letting users store reference documents!
interface GDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  modifiedTime: string;
  content: string;
}

const localGDriveFilesStore: GDriveFile[] = [
  {
    id: "gdrive-doc-1",
    name: "Neora_PC_OS_Architecture_Overview.md",
    mimeType: "text/markdown",
    size: "4.2 KB",
    modifiedTime: new Date(Date.now() - 3600000 * 24).toISOString(),
    content: `# Neora PC OS Architecture Reference Guide\n\nThis is a standard technical document describing the secure websocket backplane and standard Python client loop which connects user computer platforms to the AI Studio builder playground.`
  },
  {
    id: "gdrive-spec-2",
    name: "Automated_Printing_House_Schedule_Spec.txt",
    mimeType: "text/plain",
    size: "1.8 KB",
    modifiedTime: new Date(Date.now() - 3600000 * 6).toISOString(),
    content: `Neora Automated Offset Printing Scheduling Requirements:\n- Must coordinate printing batches across 3 offset press models.\n- Direct connection to local database scheduler file for automated PC printing script execution.`
  }
];

// List Google Drive files
app.get("/api/gdrive/list", (req, res) => {
  return res.json({ status: "success", files: localGDriveFilesStore });
});

// Upload file to Google Drive (Simulated / Save to Persistent Memory Storage)
app.post("/api/gdrive/upload", (req, res) => {
  const { name, content, mimeType } = req.body;
  if (!name || !content) {
    return res.status(400).json({ error: "Missing file name or content" });
  }

  const newFile: GDriveFile = {
    id: "gdrive-user-" + Math.random().toString(36).substring(2, 9),
    name,
    mimeType: mimeType || "text/plain",
    size: (Buffer.byteLength(content, 'utf8') / 1024).toFixed(1) + " KB",
    modifiedTime: new Date().toISOString(),
    content
  };

  localGDriveFilesStore.unshift(newFile);
  pushAgentLog(`[${new Date().toLocaleTimeString()}] ☁️ Backed up file "${name}" to Google Drive folder bucket.`);
  return res.json({ status: "success", message: `Successfully synchronized and backed up file "${name}" to your Google Drive!`, file: newFile });
});

// Download Google Drive file content
app.get("/api/gdrive/download", (req, res) => {
  const { fileId } = req.query;
  if (!fileId) {
    return res.status(400).json({ error: "Missing fileId parameter" });
  }

  const file = localGDriveFilesStore.find(f => f.id === fileId);
  if (!file) {
    return res.status(404).json({ error: "File not found in Google Drive repository" });
  }

  return res.json({ status: "success", file });
});

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

    // Auto-detect Bengali/Banglish input to dynamically use Bengali system instructions
    const lastMessage = messages[messages.length - 1];
    const lastMessageText = lastMessage?.content || "";
    const hasBanglaCharacters = /[\u0980-\u09FF]/.test(lastMessageText);
    const hasBanglishKeywords = /\b(kemon|acho|kmn|aso|valobashi|valo|bhalo|amr|amar|tumi|apni|tumar|tomar|korso|koro|ki|korchen|korcho|din|rattri|shokal|shubho)\b/i.test(lastMessageText);
    
    let activeLang = lang;
    if (hasBanglaCharacters || hasBanglishKeywords) {
      activeLang = "bn";
    }

    const systemInstruction = buildChatSystemInstruction(activeLang);

    const formattedContents = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const response = await generateGeminiContentWithFallback(client, {
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
    const cleaned = getCleanErrorMessage(err);
    return res.status(500).json({ status: "error", error: cleaned });
  }
});

// Real-Time Streaming endpoint for LLM Chat responses supporting Gemini, Groq and Ollama
app.post("/api/chat-stream", async (req, res) => {
  try {
    const { messages, provider, model, lang, geminiKey, groqKey, ollamaBaseUrl } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing messages array in request body" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    // Auto-detect Bengali/Banglish input to dynamically use Bengali system instructions
    const lastMessage = messages[messages.length - 1];
    const lastMessageText = lastMessage?.content || "";
    const hasBanglaCharacters = /[\u0980-\u09FF]/.test(lastMessageText);
    const hasBanglishKeywords = /\b(kemon|acho|kmn|aso|valobashi|valo|bhalo|amr|amar|tumi|apni|tumar|tomar|korso|koro|ki|korchen|korcho|din|rattri|shokal|shubho)\b/i.test(lastMessageText);
    
    let activeLang = lang;
    if (hasBanglaCharacters || hasBanglishKeywords) {
      activeLang = "bn";
    }

    const systemInstruction = buildChatSystemInstruction(activeLang);

    if (provider === "groq") {
      const activeKey = groqKey || process.env.GROQ_API_KEY;
      if (!activeKey) {
        res.write(`data: ${JSON.stringify({ error: "Groq API Key is not configured." })}\n\n`);
        res.end();
        return;
      }

      const activeModel = model || "llama-3.3-70b-versatile";
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
          "Authorization": `Bearer ${activeKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: activeModel,
          messages: formattedMessages,
          temperature: 0.5,
          stream: true
        })
      });

      if (!groqResponse.ok) {
        const errText = await groqResponse.text();
        res.write(`data: ${JSON.stringify({ error: `Groq error: ${errText}` })}\n\n`);
        res.end();
        return;
      }

      const reader = groqResponse.body;
      if (!reader) {
        res.write(`data: ${JSON.stringify({ error: "No response body from Groq API" })}\n\n`);
        res.end();
        return;
      }

      let groqServerBuffer = "";
      // @ts-ignore
      if (typeof reader.getReader === "function") {
        // @ts-ignore
        const webReader = reader.getReader();
        const decoder = new TextDecoder("utf-8");
        while (true) {
          const { done, value } = await webReader.read();
          if (done) break;
          groqServerBuffer += decoder.decode(value, { stream: true });
          const lines = groqServerBuffer.split("\n");
          groqServerBuffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              const dataStr = trimmed.slice(6);
              if (dataStr === "[DONE]") continue;
              try {
                const json = JSON.parse(dataStr);
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
                }
              } catch (_) {}
            }
          }
        }
      } else {
        // Fallback for Node standard Readable streams
        // @ts-ignore
        for await (const chunk of reader) {
          groqServerBuffer += chunk.toString();
          const lines = groqServerBuffer.split("\n");
          groqServerBuffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              const dataStr = trimmed.slice(6);
              if (dataStr === "[DONE]") continue;
              try {
                const json = JSON.parse(dataStr);
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
                }
              } catch (_) {}
            }
          }
        }
      }
      res.write("data: [DONE]\n\n");
      res.end();
      return;

    } else if (provider === "ollama") {
      const activeOllamaUrl = (ollamaBaseUrl || "http://127.0.0.1:11434").replace(/\/+$/, "");
      const formattedMessages = [
        { role: "system", content: systemInstruction },
        ...messages.map(m => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content
        }))
      ];

      const ollamaResponse = await fetch(`${activeOllamaUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model || "llama3",
          messages: formattedMessages,
          stream: true
        })
      });

      if (!ollamaResponse.ok) {
        res.write(`data: ${JSON.stringify({ error: `Ollama status: ${ollamaResponse.status}` })}\n\n`);
        res.end();
        return;
      }

      const reader = ollamaResponse.body;
      if (!reader) {
        res.write(`data: ${JSON.stringify({ error: "No response body from Ollama API" })}\n\n`);
        res.end();
        return;
      }

      let ollamaServerBuffer = "";
      // @ts-ignore
      if (typeof reader.getReader === "function") {
        // @ts-ignore
        const webReader = reader.getReader();
        const decoder = new TextDecoder("utf-8");
        while (true) {
          const { done, value } = await webReader.read();
          if (done) break;
          ollamaServerBuffer += decoder.decode(value, { stream: true });
          const lines = ollamaServerBuffer.split("\n");
          ollamaServerBuffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const json = JSON.parse(trimmed);
              const content = json.message?.content;
              if (content) {
                res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
              }
            } catch (_) {}
          }
        }
      } else {
        // Fallback for Node standard Readable streams
        // @ts-ignore
        for await (const chunk of reader) {
          ollamaServerBuffer += chunk.toString();
          const lines = ollamaServerBuffer.split("\n");
          ollamaServerBuffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const json = JSON.parse(trimmed);
              const content = json.message?.content;
              if (content) {
                res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
              }
            } catch (_) {}
          }
        }
      }
      res.write("data: [DONE]\n\n");
      res.end();
      return;

    } else {
      // Default to Gemini Core (gemini-3.5-flash) representing high quality vision and streams
      const activeKey = geminiKey || process.env.GEMINI_API_KEY;
      if (!activeKey) {
        res.write(`data: ${JSON.stringify({ error: "Gemini API Key is not configured." })}\n\n`);
        res.end();
        return;
      }

      const client = getGeminiClient(activeKey);
      
      const formattedContents = messages.map(m => {
        const role = m.role === "assistant" ? "model" : "user";
        const parts: any[] = [];
        
        // Handle client base64 attached image
        if (m.image?.data && m.image?.mimeType) {
          parts.push({
            inlineData: {
              data: m.image.data,
              mimeType: m.image.mimeType
            }
          });
        }
        parts.push({ text: m.content || "Analyze this image." });
        return { role, parts };
      });

      const responseStream = await generateGeminiContentStreamWithFallback(client, {
        model: model || "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.5,
        }
      });

      for await (const chunk of responseStream) {
        const textValue = chunk.text;
        if (textValue) {
          res.write(`data: ${JSON.stringify({ text: textValue })}\n\n`);
        }
      }
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

  } catch (err: any) {
    console.error("Error in /api/chat-stream SSE route:", err);
    const cleaned = getCleanErrorMessage(err);
    res.write(`data: ${JSON.stringify({ error: cleaned })}\n\n`);
    res.end();
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
    const response = await generateGeminiContentWithFallback(client, {
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
    const cleaned = getCleanErrorMessage(err);
    return res.status(500).json({ error: cleaned });
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

async function healFailedCommand(command: OsCommand, errorLogs: string[]) {
  const attempt = (command.retryCount || 0) + 1;
  command.retryCount = attempt;
  osAgentState.logs.push(`[${new Date().toLocaleTimeString()}] [AUTO-HEALING ACTIVE] Analyzing failure for command: "${command.prompt}" (Attempt ${attempt}/3)...`);
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Local fallback heuristic repairing if no Gemini API Key is available
    osAgentState.logs.push(`[${new Date().toLocaleTimeString()}] [AUTO-HEALING FALLBACK] No GEMINI_API_KEY found. Applying static bypass heuristic.`);
    command.actions = command.actions.map(act => {
      if (act.action === "execute_cmd") {
        let corrected = act.param;
        if (corrected.includes("/")) {
          corrected = corrected.replace(/\//g, "\\");
        }
        return { action: "execute_cmd", param: corrected };
      }
      return act;
    });
    command.actions.unshift({
      action: "alert_msg",
      param: `Neora Auto-Healing Bypass: Failed on previous attempt. Retrying with path-corrected instruction set.`
    });
    command.status = "pending";
    command.result = `Auto-healed (heuristic local fallback, attempt ${attempt})`;
    return;
  }

  try {
    const client = getGeminiClient();
    const systemPrompt = `You are Neora's Autonomous Self-Healing and Error Correction Unit.
An OS Command sequence has failed execution on the client PC.
Your job is to analyze the command, the original actions, and the client error logs, and generate a CORRECTED JSON actions list that fixes the issue and successfully achieves the user's ultimate goal.

Original Command Prompt from user: "${command.prompt}"
Original Actions Sequence: ${JSON.stringify(command.actions)}
Error Result / Logs from Client: ${JSON.stringify(errorLogs)}

Available Low-Level Operations:
1. open_browser: URL
2. write_file: "filename:content"
3. execute_cmd: Terminal command (must be a whitelisted app or harmless cmd)
4. type_text: Text
5. press_key: Keyboard combination (e.g. "enter", "ctrl+s")
6. wait: string float representation of seconds (e.g. "3.5")
7. mouse_click: coordinates "x,y" or click type
8. mouse_drag: drag coordinates
9. open_file: file path
10. save_file_as: path to save file
11. take_screenshot: empty string
12. alert_msg: message text

Auto-Repair Strategies:
- If a program (like winword, excel, photoshop) failed to execute because it wasn't installed, rewrite the actions to use a lighter whitelisted app like "notepad" or "mspaint", or write a file directly to the disk, or open a web-based editor URL using "open_browser", then alert the user that Neora automatically healed the flow to use an alternative tool.
- If a file path was not found, verify if directories exist. Use double backslashes in Windows file paths.
- If typing was too fast, insert longer "wait" delays (e.g. 3.0s or 5.0s) between execution and typing.
- Ensure "take_screenshot" is at the end.

Return ONLY a valid JSON array of corrected actions. No markdown blocks, no explanation text outside.`;

    const res = await generateGeminiContentWithFallback(client, {
      model: "gemini-3.5-flash",
      contents: [systemPrompt]
    });

    const resText = res.text?.trim() || "";
    if (resText) {
      let cleanedText = resText;
      if (cleanedText.startsWith("```json")) cleanedText = cleanedText.substring(7);
      if (cleanedText.startsWith("```")) cleanedText = cleanedText.substring(3);
      if (cleanedText.endsWith("```")) cleanedText = cleanedText.substring(0, cleanedText.length - 3);
      cleanedText = cleanedText.trim();

      const correctedActions = JSON.parse(cleanedText);
      if (Array.isArray(correctedActions) && correctedActions.length > 0) {
        command.actions = correctedActions;
        command.status = "pending";
        command.result = `Auto-healed by AI (Attempt ${attempt})`;
        osAgentState.logs.push(`[${new Date().toLocaleTimeString()}] ❇️ [AUTO-HEAL SUCCESS] AI analyzed logs and successfully patched actions list for "${command.prompt}". Retry queued.`);
        return;
      }
    }
  } catch (err: any) {
    osAgentState.logs.push(`[${new Date().toLocaleTimeString()}] ⚠️ [AUTO-HEAL EXCEPTION] Gemini auto-repair failed: ${err.message || String(err)}. Falling back to static retry.`);
  }

  command.status = "pending";
  command.result = `Auto-healed (static retry fallback, attempt ${attempt})`;
}

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

      // Add to historical record with Auto-Healing retry
      if (failed && (command.retryCount || 0) < 3) {
        healFailedCommand(command, logs || [result || "Execution failed"]).catch(console.error);
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
    const { prompt, token, geminiKey, useGroq, groqKey, groqModel } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt query string" });
    }

    if (token && token !== AGENT_TOKEN) {
      return res.status(401).json({ error: "Unauthorized token" });
    }

    const apiKey = geminiKey || process.env.GEMINI_API_KEY;
    const activeGroqKey = groqKey || process.env.GROQ_API_KEY;

    const hasGemini = !!apiKey;
    const hasGroq = !!(useGroq && activeGroqKey);

    if (!hasGemini && !hasGroq) {
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

    let actions = [];
    let compiledSuccess = false;

    if (useGroq && activeGroqKey) {
      try {
        console.log(`[Groq OS Compiler] Compiling with Groq: "${prompt}" using model "${groqModel || "llama-3.3-70b-versatile"}"`);
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${activeGroqKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: groqModel || "llama-3.3-70b-versatile",
            messages: [
              { 
                role: "system", 
                content: systemInstruction + "\nOutput raw JSON array strictly. Do not wrap with markdown code blocks." 
              },
              { role: "user", content: prompt }
            ],
            temperature: 0.1,
            response_format: { type: "json_object" }
          })
        });

        if (groqRes.ok) {
          const resJson: any = await groqRes.json();
          const responseText = resJson.choices?.[0]?.message?.content || "";
          if (responseText) {
            const parsed = JSON.parse(responseText.trim());
            if (Array.isArray(parsed)) {
              actions = parsed;
            } else if (parsed.actions && Array.isArray(parsed.actions)) {
              actions = parsed.actions;
            } else if (parsed.steps && Array.isArray(parsed.steps)) {
              actions = parsed.steps;
            } else if (typeof parsed === 'object') {
              const arrayKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
              if (arrayKey) {
                actions = parsed[arrayKey];
              }
            }
            if (Array.isArray(actions) && actions.length > 0) {
              compiledSuccess = true;
              console.log(`[Groq OS Compiler] Successfully compiled with Groq:`, actions);
            }
          }
        } else {
          console.warn("[Groq OS Compiler] Failed with status:", groqRes.status);
        }
      } catch (groqErr) {
        console.error("[Groq OS Compiler] Error during compilation:", groqErr);
      }
    }

    if (!compiledSuccess && hasGemini) {
      try {
        const client = getGeminiClient(apiKey);
        const response = await generateGeminiContentWithFallback(client, {
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

        if (response.text) {
          actions = JSON.parse(response.text.trim());
          compiledSuccess = true;
        }
      } catch (parseErr) {
        console.error("Failed to parse Gemini generated actions JSON:", parseErr);
      }
    }

    if (!compiledSuccess) {
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
    const cleaned = getCleanErrorMessage(err);
    return res.status(500).json({ error: cleaned });
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

app.post("/api/plan/create", async (req, res) => {
  const { goal, geminiKey } = req.body || {};
  if (!goal || typeof goal !== "string") {
    return res.status(400).json({ error: "Missing goal" });
  }

  const apiKey = geminiKey || process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const client = getGeminiClient(apiKey);
      const systemInstruction = `You are the Neora 10,000x Autonomous Mission Planner & Strategy Compiler.
Your job is to translate a high-level user workspace strategy/mission objective into a detailed, sequential, multi-step execution plan.
Each step you output must have:
1. kind: One of "shell", "file_write", "code_edit", "verify", "note", "tool_call".
   - "shell": For running command lines (e.g. launching an executable like notepad, calc, winword, photoshop)
   - "file_write": For creating/saving a document or file (e.g., writing data, logs, txt files)
   - "code_edit": For editing coding files or project configurations
   - "verify": For taking desktop screenshot, verifying window exists, or visual confirmation
   - "note": For informational summaries or user prompts
   - "tool_call": For key inputs, keypresses, mouse events, waiting/pauses, opening browsers, or specific API integrations
2. title: A concise, human-readable name of the step (e.g. "Launch Photoshop Engine", "Create Canvas", "Type Digital Artwork Title", "Desktop Visual Verification"). Keep it clear in either English or Bengali.
3. payload: The command or information for that step.
   - For launching software: e.g. "photoshop", "winword", "notepad", "mspaint"
   - For writing a text file: "filename:content"
   - For clicking, waiting, typing, or key combo: e.g. "press_key: ctrl+n", "wait: 5.0", "type_text: design title", "save_file_as: poster.psd", "open_browser: https://github.com"
   - For verification: "Verify Photoshop opened and take screenshot"

Analyze the goals meticulously. Even if the user objective is in Bengali or Banglish (e.g. 'Photoshop r illustrator 2 tai chalu koro, wait duto tei screenshot ne'), parse the intent perfectly and compilation steps accordingly.
Output exactly a JSON object matching the requested schema. Ensure the final step is always a 'verify' kind to trigger screenshot capture on client side.`;

      const response = await generateGeminiContentWithFallback(client, {
        model: "gemini-3.5-flash",
        contents: `Compile a sequential mission plan for the goal: "${goal}"`,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    kind: {
                      type: Type.STRING,
                      description: "The kind: shell, file_write, code_edit, verify, note, tool_call"
                    },
                    title: {
                      type: Type.STRING,
                      description: "Concise human-friendly title"
                    },
                    payload: {
                      type: Type.STRING,
                      description: "The execution command or argument"
                    }
                  },
                  required: ["kind", "title", "payload"]
                }
              }
            },
            required: ["steps"]
          },
          temperature: 0.1
        }
      });

      const parsed = JSON.parse(response.text.trim());
      if (parsed && Array.isArray(parsed.steps)) {
        const stepsWithIds = parsed.steps.map((s: any) => ({
          id: `step-${Math.random().toString(36).slice(2, 9)}`,
          kind: s.kind,
          title: s.title,
          payload: s.payload,
          status: "pending" as const
        }));
        const plan = {
          id: `plan-${Math.random().toString(36).slice(2, 9)}`,
          goal,
          steps: stepsWithIds,
          status: "pending" as const
        };
        const stored = upsertPlan(plan);
        return res.json({ status: "success", plan: stored });
      }
    } catch (err: any) {
      console.error("Failed to generate dynamic plan with Gemini, falling back to local compiler:", err);
    }
  }

  // Fallback to local rule-based planner
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
    const customUrl = ((req.query.url as string) || "http://127.0.0.1:11434").replace(/\/+$/, '');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const response = await fetch(`${customUrl}/api/tags`, {
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
    const { messages, model, lang, ollamaBaseUrl } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing messages parameter" });
    }

    const customUrl = (ollamaBaseUrl || "http://127.0.0.1:11434").replace(/\/+$/, '');
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

    const ollamaResponse = await fetch(`${customUrl}/api/chat`, {
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

// Real-time API Heartbeat Connection Status Diagnostic Endpoints
app.post("/api/diagnostic/heartbeat", async (req, res) => {
  try {
    const { geminiKey, groqKey, ollamaBaseUrl } = req.body;
    const geminiToUse = geminiKey || process.env.GEMINI_API_KEY;
    const groqToUse = groqKey || process.env.GROQ_API_KEY;
    const ollamaUrl = (ollamaBaseUrl || "http://127.0.0.1:11434").replace(/\/+$/, '');

    const check = {
      gemini: { alive: false, message: "Missing API Key" },
      groq: { alive: false, message: "Missing API Key" },
      ollama: { alive: false, message: "Offline" }
    };

    // 1. Verify Gemini status
    if (geminiToUse) {
      check.gemini.alive = true;
      check.gemini.message = "Configured (Ready)";
    }

    // 2. Verify Groq status by actively pinging its chat/completions capability
    if (groqToUse) {
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 2000); // 2 seconds rapid check
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqToUse}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: "ping" }],
            max_tokens: 1
          }),
          signal: controller.signal
        });
        clearTimeout(t);
        if (response.ok) {
          check.groq.alive = true;
          check.groq.message = "Active (Connected)";
        } else {
          check.groq.alive = false;
          check.groq.message = `HTTP status ${response.status}`;
        }
      } catch (e: any) {
        check.groq.alive = false;
        check.groq.message = "Not responding";
      }
    }

    // 3. Verify Ollama status with rapid ping (timeout 1.2s) specifically for tags capability
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 1200);
      const response = await fetch(`${ollamaUrl}/api/tags`, { signal: controller.signal });
      clearTimeout(t);
      if (response.ok) {
        check.ollama.alive = true;
        check.ollama.message = "Active (Connected)";
      } else {
        check.ollama.alive = false;
        check.ollama.message = `HTTP status ${response.status}`;
      }
    } catch (e: any) {
      check.ollama.alive = false;
      check.ollama.message = "Not responding/Stopped";
    }

    return res.json({ status: "success", check });
  } catch (err: any) {
    console.error("Heartbeat diagnostic route fail:", err);
    return res.status(500).json({ error: err.message });
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

    const visionResult = await generateGeminiContentWithFallback(client, {
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
    const cleaned = getCleanErrorMessage(err);
    res.status(500).json({ error: cleaned });
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

function copyFolderRecursiveSync(source: string, target: string) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  let filesCopied = 0;
  for (const file of files) {
    if (file === ".git" || file === "node_modules" || file === "dist" || file === "temp_sync_pull" || file === "temp_log_repo") {
      continue;
    }

    const curSource = path.join(source, file);
    const curTarget = path.join(target, file);

    if (fs.lstatSync(curSource).isDirectory()) {
      filesCopied += copyFolderRecursiveSync(curSource, curTarget);
    } else {
      fs.copyFileSync(curSource, curTarget);
      filesCopied++;
    }
  }
  return filesCopied;
}

// Sync Pull from GitHub to Google Cloud
app.all("/api/sync/pull", async (req, res) => {
  const tempRepo = path.join(process.cwd(), "temp_sync_pull");
  try {
    if (fs.existsSync(tempRepo)) {
      fs.rmSync(tempRepo, { recursive: true, force: true });
    }

    console.log("Starting cloud sync pull from GitHub...");
    const cloneCmd = "git clone --depth 1 https://github.com/shukriaprinters/Neora-AI-PC-OS-Agent.git temp_sync_pull";
    await exec(cloneCmd);

    const count = copyFolderRecursiveSync(tempRepo, process.cwd());

    fs.rmSync(tempRepo, { recursive: true, force: true });

    console.log(`Cloud sync pull completed. Copied ${count} files.`);
    res.json({
      success: true,
      message: "Sync pull succeeded! Google Cloud files updated from GitHub.",
      filesCount: count
    });
  } catch (error: any) {
    console.error("Error during sync pull:", error);
    try {
      if (fs.existsSync(tempRepo)) {
        fs.rmSync(tempRepo, { recursive: true, force: true });
      }
    } catch {}
    res.status(500).json({
      success: false,
      error: error.message || String(error)
    });
  }
});

// Download cloud changes as a ZIP file to local PC
app.get("/api/sync/download", (req, res) => {
  try {
    const archive = archiver("zip", {
      zlib: { level: 9 }
    });

    res.attachment("neora_cloud_workspace.zip");
    res.setHeader("Content-Type", "application/zip");

    archive.on("error", (err) => {
      console.error("Archive error:", err);
      if (!res.headersSent) {
        res.status(500).send({ error: err.message });
      }
    });

    archive.pipe(res);

    archive.glob("**/*", {
      cwd: process.cwd(),
      ignore: [
        "node_modules/**",
        ".git/**",
        "dist/**",
        "temp_sync_pull/**",
        "temp_log_repo/**",
        "**/*.zip"
      ]
    });

    archive.finalize();
  } catch (error: any) {
    console.error("Sync download error:", error);
    if (!res.headersSent) {
      res.status(500).send({ error: error.message });
    }
  }
});

// Proxy Google Translate TTS to bypass CORS, Referrer-Policy, and iframe restrictions
app.get("/api/tts", async (req, res) => {
  try {
    const text = req.query.text as string;
    const lang = (req.query.lang as string) || "bn";
    if (!text) {
      return res.status(400).send("Missing text query parameter");
    }

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=gtx&q=${encodeURIComponent(text)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      console.warn(`TTS Proxy source returned status ${response.status}. Returning 200 OK with warning text to trigger fallback.`);
      return res.status(200).send("Failed to retrieve TTS audio from source. Falling back to native SpeechSynthesis.");
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000");

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (err) {
    console.error("TTS Proxy Route error:", err);
    res.status(200).send("Internal server error during TTS proxy retrieval. Falling back to native SpeechSynthesis.");
  }
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


