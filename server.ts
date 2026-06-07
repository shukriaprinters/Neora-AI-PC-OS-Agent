import express from "express";
import path from "path";
import multer from "multer";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Neora OS Agent Type Specifications and State Storage
interface OsCommand {
  id: string;
  prompt: string;
  actions: Array<{ action: string; param: string }>;
  status: "pending" | "running" | "completed" | "failed";
  timestamp: string;
  result?: string;
}

interface OsCommandHistory {
  id: string;
  prompt: string;
  timestamp: string;
  status: "completed" | "failed";
  actionsCount: number;
  result?: string;
}

const osAgentState = {
  status: "offline" as "online" | "offline",
  token: "NEORA-X7-AGENT",
  lastPing: null as string | null,
  currentScreenshot: null as string | null, // base64 representation
  logs: [`[${new Date().toLocaleTimeString()}] OS Automation Broker server initialized.`] as string[],
  queue: [] as OsCommand[],
  history: [] as OsCommandHistory[]
};

dotenv.config();

const app = express();
const PORT = 3000;

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

    const systemInstruction = lang === "bn"
      ? "আপনি হলেন Neora AI (নিওড়া), একজন অত্যন্ত বুদ্ধিমান, সহানুভূতিশীল এবং মানুষের মতো আচরণকারী এআই সহকারী। কোনো কৃত্রিম বা কম্পিউটারের মতো রোবোটিক উত্তরের পরিবর্তে একজন সত্যিকারের আন্তরিক বন্ধুর মতো চমৎকার এবং স্বাভাবিক বাংলায় স্পষ্ট করে সাধারণ মানুষের মতো কথা বলুন। অত্যন্ত বন্ধুত্বপূর্ণ সম্পর্ক বজায় রাখুন। ব্যবহারকারী আপনাকে যা জিজ্ঞাসা করছে প্রথমে তার সঠিক এবং সরাসরি মানুষের মতো বাস্তব উত্তর দিন। অতিরিক্ত কোনো সিস্টেমিং ডেকোরেティブ ডাটা বা অপ্রয়োজনীয় পোর্টিং কোড এবং টেকনিক্যাল শব্দাবলি ব্যবহার করবেন না।"
      : "You are Neora AI, a highly intelligent, empathetic, and human-like personal companion and workspace agent. Provide fully helpful, accurate, warm, and direct human-like responses to any user question. Speak and reply naturally, warmly and like a supportive assistant instead of a robotic server terminal or hardcoded system. Never output random technical telemetry or dry computer-like placeholders. Speak with the user in their language (Bengali or English).";

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
        temperature: 0.7
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

    const systemInstruction = lang === "bn"
      ? "আপনি হলেন Neora AI (নিওড়া), একজন অত্যন্ত বুদ্ধিমান, সহানুভূতিশীল এবং মানুষের মতো আচরণকারী এআই সহকারী। কোনো কৃত্রিম বা কম্পিউটারের মতো রোবোটিক উত্তরের পরিবর্তে একজন সত্যিকারের আন্তরিক বন্ধুর মতো চমৎকার এবং স্বাভাবিক বাংলায় স্পষ্ট করে সাধারণ মানুষের মতো কথা বলুন। অত্যন্ত বন্ধুত্বপূর্ণ সম্পর্ক বজায় রাখুন। ব্যবহারকারী আপনাকে যা জিজ্ঞাসা করছে প্রথমে তার সঠিক এবং সরাসরি মানুষের মতো বাস্তব উত্তর দিন। অতিরিক্ত কোনো সিস্টেমিং ডেকোরেটিভ ডাটা বা অপ্রয়োজনীয় পোর্টিং কোড এবং টেকনিক্যাল শব্দাবলি ব্যবহার করবেন না।"
      : "You are Neora AI, a highly intelligent, empathetic, and human-like personal companion and workspace agent. Provide fully helpful, accurate, warm, and direct human-like responses to any user question. Speak and reply naturally, warmly and like a supportive assistant instead of a robotic server terminal or hardcoded system. Never output random technical telemetry or dry computer-like placeholders. Speak with the user in their language (Bengali or English).";

    const formattedContents = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

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
- If the input is primarily in Bengali (বাংলা) or the language preference is 'bn', rewrite the enhanced prompt in highly natural, professional Bengali.
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
        ? `বিস্তারিতভাবে সম্পন্ন করুন: ${prompt} (অনুগ্রহ করে প্রতিটি পদক্ষেপের নির্ভুলতা এবং আউটপুটের মান যাচাই নিশ্চিত করুন)`
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
    logs: osAgentState.logs.slice(-50), // Send last 50 lines of log
    queue: osAgentState.queue,
    history: osAgentState.history.slice(-30) // Historical logs
  });
});

app.post("/api/os/ping", (req, res) => {
  const { token, client_time } = req.body;
  if (!token || token !== osAgentState.token) {
    return res.status(401).json({ error: "Unauthorized token provided" });
  }
  osAgentState.status = "online";
  osAgentState.lastPing = client_time || new Date().toISOString();
  res.json({ status: "ok" });
});

app.get("/api/os/poll", (req, res) => {
  const { token } = req.query;
  if (!token || token !== osAgentState.token) {
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
  if (!token || token !== osAgentState.token) {
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
      command.status = status === "success" ? "completed" : "failed";
      command.result = result || "Execution finalized";

      // Add to historical record
      osAgentState.history.push({
        id: command.id,
        prompt: command.prompt,
        timestamp: command.timestamp,
        status: command.status,
        actionsCount: command.actions.length,
        result: command.result
      });

      // Clear from queue
      osAgentState.queue = osAgentState.queue.filter(c => c.id !== commandId);
      osAgentState.logs.push(`[${new Date().toLocaleTimeString()}] Action completed for command: "${command.prompt}" (Status: ${command.status.toUpperCase()})`);
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

    if (token) {
      osAgentState.token = token;
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
        timestamp: new Date().toLocaleTimeString()
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
      timestamp: new Date().toLocaleTimeString()
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

// Basic NLP match parser for safe offline usage
function parseLocalMockCommand(prompt: string) {
  const norm = prompt.toLowerCase();
  const list: Array<{ action: string; param: string }> = [];

  if (norm.includes("chrome") || norm.includes("google") || norm.includes("browser") || norm.includes("ব্রাউজার") || norm.includes("ওয়েব")) {
    if (norm.includes("youtube") || norm.includes("ইউটিউব")) {
      list.push({ action: "open_browser", param: "https://www.youtube.com" });
    } else if (norm.includes("facebook") || norm.includes("ফেসবুক")) {
      list.push({ action: "open_browser", param: "https://www.facebook.com" });
    } else if (norm.includes("google") || norm.includes("গুগল")) {
      list.push({ action: "open_browser", param: "https://www.google.com" });
    } else {
      list.push({ action: "open_browser", param: "https://www.google.com" });
    }
  }

  if (norm.includes("notepad") || norm.includes("নোটপ্যাড") || norm.includes("লিখো") || norm.includes("নোট")) {
    list.push({ action: "execute_cmd", param: "notepad" });
    list.push({ action: "type_text", param: "Hello, boss! This note was automatically typed by Neora OS Agent running on your local machine." });
    list.push({ action: "press_key", param: "enter" });
  } else if (norm.includes("calc") || norm.includes("ক্যালকুলেটর") || norm.includes("হিসাব")) {
    list.push({ action: "execute_cmd", param: "calc" });
  } else if (norm.includes("paint") || norm.includes("পেইন্ট") || norm.includes("ছবি")) {
    list.push({ action: "execute_cmd", param: "mspaint" });
  }

  if (norm.includes("message") || norm.includes("alert") || norm.includes("সতর্ক") || norm.includes("বক্স")) {
    list.push({ action: "alert_msg", param: "Neora Action completed successfully, boss!" });
  }

  list.push({ action: "take_screenshot", param: "" });
  return list;
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
    const systemInstruction = lang === "bn"
      ? "আপনি হলেন Neora AI (নিওড়া), একজন অত্যন্ত বুদ্ধিমান, সহানুভূতিশীল এবং মানুষের মতো আচরণকারী এআই সহকারী। কোনো কৃত্রিম বা কম্পিউটারের মতো রোবোটিক উত্তরের পরিবর্তে একজন সত্যিকারের আন্তরিক বন্ধুর মতো চমৎকার এবং স্বাভাবিক বাংলায় স্পষ্ট করে সাধারণ মানুষের মতো কথা বলুন। অতিরিক্ত কোনো সিস্টেমিং ডেকোরেティブ ডাটা বা অপ্রয়োজনীয় পোর্টিং কোড এবং টেকনিক্যাল শব্দাবলি ব্যবহার করবেন না।"
      : "You are Neora AI, a highly intelligent, empathetic, and human-like personal companion and workspace agent. Provide fully helpful, accurate, warm, and direct human-like responses to any user question. Speak and reply naturally, warmly and like a supportive assistant instead of a robotic server terminal or hardcoded system. Never output random technical telemetry or dry computer-like placeholders. Speak with the user in their language (Bengali or English).";

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
