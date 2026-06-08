import express from "express";
import fs from "node:fs";
import crypto from "node:crypto";
import path from "path";
import multer from "multer";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { buildNeoraActions, classifyNeoraPrompt } from "./src/lib/neoraCommand";
import { appendConversationSummary, readNeoraStore, upsertMemory, upsertPlan, writeNeoraStore } from "./src/lib/neoraStore";
import { buildNeoraPlan } from "./src/lib/neoraPlanner";

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
function buildChatSystemInstruction(lang: "en" | "bn") {
  return lang === "bn"
    ? "আপনি Neora AI, একজন সহানুভূতিশীল, প্রাঞ্জল, এবং প্রসঙ্গ-সচেতন সহকারী। স্বাভাবিক মানুষের মতো কথা বলুন, প্রথমেই সরাসরি উত্তর দিন, অপ্রয়োজনীয় টেকনিক্যাল টেলিমেট্রি বা রোবোটিক স্টাইল এড়িয়ে চলুন। ভুল হলে সেটা স্পষ্ট করুন, অনুমান না করে প্রশ্ন করুন, এবং ব্যবহারকারীর লক্ষ্যকে কেন্দ্র করে সংক্ষিপ্ত কিন্তু নির্ভুল উত্তর দিন।"
    : "You are Neora AI, an empathetic, fluent, and context-aware assistant. Speak naturally like a capable human collaborator, answer directly first, avoid robotic telemetry or filler, and ask a clarifying question instead of guessing when the request is ambiguous. Keep the response concise, accurate, and aligned to the user's goal.";
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
function getGeminiClient() {
  if (!geminiAi) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    geminiAi = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiAi;
}

// Define Gemini Chat Completion route
app.post("/api/chat-gemini", async (req, res) => {
  try {
    const { messages, lang } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing messages array in request body" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        status: "api_key_missing",
        message: "Gemini API Key is not configured."
      });
    }

    const client = getGeminiClient();

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
    const { prompt, lang, useOllama, selectedOllamaModel } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing or invalid prompt parameter" });
    }

    const sysInstruction = `You are a professional Prompt Engineer. Rewrite, enhance, and expand the user's short input prompt to make it clear, detailed, visually precise, and optimized for an AI assistant or desktop OS automation agent. Add constructive details, structure, output standards, and step requirements based on their core intent.
Rules:
- Preserve the user's core intent. Never add totally unrelated features.
- If the input is primarily in Bengali (à¦¬à¦¾à¦‚à¦²à¦¾) or the language preference is 'bn', rewrite the enhanced prompt in highly natural, professional Bengali.
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

    const client = getGeminiClient();
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
    const { prompt, token } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt query string" });
    }

    if (token && token !== AGENT_TOKEN) {
      return res.status(401).json({ error: "Unauthorized token" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // In-app fallback compiler
      const fallbackActions = parseLocalMockCommand(prompt);
    const fallbackCmd: OsCommand = {
      id: "cmd-" + Math.random().toString(36).substring(2, 9),
      prompt,
      actions: fallbackActions,
      status: "pending",
      timestamp: new Date().toLocaleTimeString(),
      classification: classifyNeoraPrompt(prompt)
    };
      osAgentState.queue.push(fallbackCmd);
      osAgentState.logs.push(`[${new Date().toLocaleTimeString()}] Fallback engine compiled: "${prompt}" successfully (Token verification bypass).`);
      return res.json({ status: "success", command: fallbackCmd, fallback: true });
    }

    const client = getGeminiClient();

    const systemInstruction = `You are Neora OS compiler. Translate the human's desktop control request into a detailed sequence of low-level JSON action operations.
Supported low-level operations are:
1. open_browser: Opens a URL in default web browser. Parameter is the full http/https URL.
2. write_file: Writes a text file. Parameter format is "filename:content_payload" (relative file path or filename).
3. execute_cmd: Launches an app or executes a command terminal. Parameter is terminal command line string (e.g. "calc", "notepad", "mspaint" or command line arguments).
4. type_text: Direct keyboard text input typing simulation. Parameter is text content to type.
5. press_key: Simulated keystroke actions. Parameter can be single keys like "enter", "win", "win+r", "ctrl+alt+t", "space", or combos combined with "plus" (e.g. "win+r").
6. take_screenshot: Takes desktop screenshot and uploads. Parameter can be empty.
7. alert_msg: Puffs a native GUI message box. Parameter is warning or alert notice text.

Analyze user intent:
- For "Open youtube and search for soft jazz":
  1) open_browser: "https://www.youtube.com"
  2) type_text: "soft jazz"
  3) press_key: "enter"
  4) take_screenshot: ""
- For "Open calculator and notepad":
  1) execute_cmd: "calc"
  2) execute_cmd: "notepad"
  3) take_screenshot: ""
- For "make a note file list.txt with Shukria Printers orders":
  1) write_file: "list.txt:Invoices processed: #1024, #1025. Contact: shukriaprinters@gmail.com"
  2) take_screenshot: ""
- For "press space" or "press enter":
  1) press_key: "space" (or "enter")
  2) take_screenshot: ""

Always add a "take_screenshot" action at the end/mid of the sequence so that the Control Panel visually updates.
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
                description: "The low-level desktop action: open_browser, write_file, execute_cmd, type_text, press_key, take_screenshot, alert_msg"
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

    const newCmd: OsCommand = {
      id: "cmd-" + Math.random().toString(36).substring(2, 9),
      prompt,
      actions,
      status: "pending",
      timestamp: new Date().toLocaleTimeString(),
      classification: classifyNeoraPrompt(prompt)
    };

    osAgentState.queue.push(newCmd);
    osAgentState.logs.push(`[${new Date().toLocaleTimeString()}] Registered Gemini-compiled command: "${prompt}" successfully with ${actions.length} action layers.`);

    return res.json({ status: "success", command: newCmd });

  } catch (err: any) {
    console.error("Error creating OS command plan:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

app.post("/api/os/clear", (req, res) => {
  osAgentState.logs = [`[${new Date().toLocaleTimeString()}] Control logs cleared by workspace request.`];
  osAgentState.history = [];
  osAgentState.queue = [];
  osAgentState.currentScreenshot = null;
  res.json({ status: "success" });
});

app.post("/api/os/retry/:commandId", (req, res) => {
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

app.post("/api/os/cancel/:commandId", (req, res) => {
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
  const store = readNeoraStore();
  res.json({ status: "success", memories: store.memories, summaries: store.conversationSummaries });
});

app.post("/api/memory", (req, res) => {
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
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
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


