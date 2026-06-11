export type NeoraCommandAction = { action: string; param: string };
export type NeoraCommandClassification = "chat" | "os-command" | "rejected";
export type NeoraInputRoute = {
  classification: NeoraCommandClassification;
  normalized: string;
  isRisky: boolean;
};

const browserUrls: Array<{ terms: string[]; url: string }> = [
  { terms: ["youtube", "ইউটিউব"], url: "https://www.youtube.com" },
  { terms: ["facebook", "ফেসবুক"], url: "https://www.facebook.com" },
  { terms: ["google", "গুগল"], url: "https://www.google.com" },
  { terms: ["github", "গিটহাব"], url: "https://github.com" },
  { terms: ["gmail", "জিমেইল"], url: "https://mail.google.com" },
  // Live TV & Sports Streaming
  { terms: ["tv", "live tv", "watch tv", "টিভি", "লিভ টিভি", "চ্যানেল"], url: "https://www.tv8bihar.com" },
  { terms: ["football", "soccer", "fifa", "ফুটবল", "ফিফা", "ফুটবল ম্যাচ"], url: "https://www.sonyliv.com" },
  { terms: ["cricket", "ক্রিকেট"], url: "https://www.hotstar.com" },
  { terms: ["sports", "স্পোর্টস", "খেলা"], url: "https://www.espn.in" },
  { terms: ["news", "নিউস", "সংবাদ"], url: "https://www.bdnews24.com" },
];

const appLaunchers: Array<{ terms: string[]; command: string }> = [
  { terms: ["notepad", "নোটপ্যাড"], command: "notepad" },
  { terms: ["calculator", "calc", "ক্যালকুলেটর"], command: "calc" },
  { terms: ["paint", "mspaint", "পেইন্ট"], command: "mspaint" },
  { terms: ["explorer", "file explorer", "ফাইল এক্সপ্লোরার"], command: "explorer" },
  { terms: ["command prompt", "cmd", "terminal", "কমান্ড প্রম্পট"], command: "cmd" },
  { terms: ["powershell", "পাওয়ারশেল"], command: "powershell" },
  { terms: ["vscode", "vs code", "visual studio code"], command: "code" },
  { terms: ["chrome", "browser", "ব্রাউজার"], command: "chrome" },
  { terms: ["edge", "মাইক্রোসফট এজ", "microsoft edge"], command: "msedge" },
  { terms: ["photoshop", "ফটোশপ", "adobe photoshop"], command: "photoshop" },
  { terms: ["illustrator", "ইলাস্ট্রেটর", "adobe illustrator"], command: "illustrator" },
  { terms: ["word", "ওয়ার্ড", "ms word", "microsoft word", "winword"], command: "winword" },
  { terms: ["excel", "এক্সেল", "ms excel", "microsoft excel"], command: "excel" },
  { terms: ["powerpoint", "পাওয়ার পয়েন্ট", "powerpnt", "ms powerpoint"], command: "powerpnt" },
];

const allowedExecutables = new Set([
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
]);

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

export function buildNeoraActions(prompt: string): NeoraCommandAction[] {
  const normalized = prompt.toLowerCase();
  const actions: NeoraCommandAction[] = [];
  let browserActionAdded = false;
  let executableAdded = false;

  // 1. MS Paint Operator Flow
  if (includesAny(normalized, ["paint", "mspaint", "পেইন্ট"]) && includesAny(normalized, ["draw", "design", "আঁকো", "টানো", "ড্র্যাগ", "drag"])) {
    actions.push({ action: "execute_cmd", param: "mspaint" });
    actions.push({ action: "wait", param: "3.0" });
    actions.push({ action: "mouse_drag", param: "150,150,450,150" });
    actions.push({ action: "mouse_drag", param: "450,150,450,450" });
    actions.push({ action: "mouse_drag", param: "450,450,150,450" });
    actions.push({ action: "mouse_drag", param: "150,450,150,150" });
    actions.push({ action: "type_text", param: "Designed professionally by Neora Operator" });
    actions.push({ action: "wait", param: "1.0" });
    const fileMatch = prompt.match(/(?:save as|save file as|save file|সেভ করো|সেভ)\s+([a-zA-Z0-9_\-\.\/\\:]+)/i);
    const targetFile = fileMatch ? fileMatch[1] : "creative_drawing.png";
    actions.push({ action: "save_file_as", param: targetFile });
    actions.push({ action: "wait", param: "1.5" });
    actions.push({ action: "take_screenshot", param: "" });
    return actions;
  }

  // 2. Photoshop Operator Flow
  if (includesAny(normalized, ["photoshop", "ph", "ফটোশপ"]) && includesAny(normalized, ["design", "create", "banner", "poster", "সেভ", "save", "নতুন"])) {
    actions.push({ action: "execute_cmd", param: "photoshop" });
    actions.push({ action: "wait", param: "5.5" });
    actions.push({ action: "press_key", param: "ctrl+n" });
    actions.push({ action: "wait", param: "1.5" });
    actions.push({ action: "press_key", param: "enter" });
    actions.push({ action: "wait", param: "1.5" });
    actions.push({ action: "type_text", param: "Shukria Premium Digital Banner" });
    actions.push({ action: "wait", param: "1.5" });
    const fileMatch = prompt.match(/(?:save as|save file as|save file|সেভ করো|সেভ)\s+([a-zA-Z0-9_\-\.\/\\:]+)/i);
    const targetFile = fileMatch ? fileMatch[1] : "shukria_banner.psd";
    actions.push({ action: "save_file_as", param: targetFile });
    actions.push({ action: "wait", param: "2.5" });
    actions.push({ action: "take_screenshot", param: "" });
    return actions;
  }

  // 3. MS Word / Winword Operator Flow
  if (includesAny(normalized, ["word", "winword", "microsoft word", "ওয়ার্ড"]) && includesAny(normalized, ["write", "type", "doc", "report", "memo", "cv", "চিঠি", "সেভ", "save"])) {
    actions.push({ action: "execute_cmd", param: "winword" });
    actions.push({ action: "wait", param: "4.5" });
    actions.push({ action: "type_text", param: "Official Business Report - Shukria Printers. Prepared by Neora Virtual AI Operator on June 2026. Premium offset and digital printing services are fully automated." });
    actions.push({ action: "wait", param: "1.5" });
    const fileMatch = prompt.match(/(?:save as|save file as|save file|সেভ করো|সেভ)\s+([a-zA-Z0-9_\-\.\/\\:]+)/i);
    const targetFile = fileMatch ? fileMatch[1] : "ShukriaReport.docx";
    actions.push({ action: "save_file_as", param: targetFile });
    actions.push({ action: "wait", param: "2.0" });
    actions.push({ action: "take_screenshot", param: "" });
    return actions;
  }

  // 4. File-Open & Edit Operator Flow from PC drive
  if (includesAny(normalized, ["open file", "file open", "ফাইল খোলো", "খুলুন", "ড্রাইভ", "drive", "disk"]) && includesAny(normalized, ["write", "type", "edit", "update", "যোগ", "লেখ"])) {
    const fileMatch = prompt.match(/(?:open file|open|ফাইল খোলো|খুলুন|open_file)\s+([a-zA-Z0-9_\-\.\/\\:]+)/i);
    const targetFile = fileMatch ? fileMatch[1] : "sample.txt";
    actions.push({ action: "open_file", param: targetFile });
    actions.push({ action: "wait", param: "3.0" });
    actions.push({ action: "type_text", param: " - Successfully edited by Neora Desktop Agent." });
    actions.push({ action: "wait", param: "1.0" });
    actions.push({ action: "save_file_as", param: targetFile });
    actions.push({ action: "wait", param: "2.0" });
    actions.push({ action: "take_screenshot", param: "" });
    return actions;
  }

  const browserUrlMatch = normalized.match(/https?:\/\/[^\s]+/);
  if (browserUrlMatch) {
    actions.push({ action: "open_browser", param: browserUrlMatch[0] });
    browserActionAdded = true;
  } else {
    for (const browser of browserUrls) {
      if (includesAny(normalized, browser.terms)) {
        actions.push({ action: "open_browser", param: browser.url });
        browserActionAdded = true;
        break;
      }
    }
  }

  for (const launcher of appLaunchers) {
    if (includesAny(normalized, launcher.terms)) {
      actions.push({ action: "execute_cmd", param: launcher.command });
      executableAdded = true;
    }
  }

  if (normalized.includes("open ") || normalized.includes("launch ") || normalized.includes("run ") || normalized.includes("খোলো") || normalized.includes("খুলুন")) {
    if (!executableAdded) {
      const fallbackTarget = prompt
        .replace(/^(open|launch|run)\s+/i, "")
        .replace(/(খুলুন|খোলো|অন করুন|চালু করো)$/i, "")
        .trim();
      if (fallbackTarget) {
        const cleanedTarget = fallbackTarget.toLowerCase();
        if (allowedExecutables.has(cleanedTarget)) {
          actions.push({ action: "execute_cmd", param: cleanedTarget });
        } else if (/^https?:\/\//i.test(fallbackTarget)) {
          actions.push({ action: "open_browser", param: fallbackTarget });
        }
      }
    }
  }

  // Smart offline parser fallbacks for state-of-the-art Operator mode keywords
  if (includesAny(normalized, ["wait", "sleep", "অপেক্ষা", "দেরি", "সেকেন্ড"])) {
    const sMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:seconds|sec|সেকেব্ড)/i) || normalized.match(/(\d+(?:\.\d+)?)/);
    const sValue = sMatch ? sMatch[1] : "3.0";
    actions.push({ action: "wait", param: sValue });
  }

  if (normalized.includes("notepad") || normalized.includes("নোটপ্যাড") || normalized.includes("write note") || normalized.includes("note")) {
    actions.push({ action: "type_text", param: "Hello, boss! This note was automatically typed by Neora." });
    actions.push({ action: "press_key", param: "enter" });
  } else if (includesAny(normalized, ["type", "write", "লিখুন", "লেখো", "টাইপ"])) {
    const textMatch = prompt.match(/(?:type|write|টাইপ করো|লেখো)\s+["']?([^"']+)["']?/i);
    if (textMatch) {
      actions.push({ action: "type_text", param: textMatch[1] });
    }
  }

  if (normalized.includes("save as") || normalized.includes("save file") || normalized.includes("সেভ") || normalized.includes("সংরক্ষণ")) {
    const fileMatch = prompt.match(/(?:save as|save file as|save file|সেভ করো|সেভ)\s+([a-zA-Z0-9_\-\.\/\\:]+)/i);
    const targetFile = fileMatch ? fileMatch[1] : "saved_document.docx";
    actions.push({ action: "save_file_as", param: targetFile });
  }

  if (normalized.includes("open file") || normalized.includes("file open koro") || normalized.includes("ফাইল খোলো")) {
    const fileMatch = prompt.match(/(?:open file|open|ফাইল খোলো|খুলুন)\s+([a-zA-Z0-9_\-\.\/\\:]+)/i);
    const targetFile = fileMatch ? fileMatch[1] : "";
    if (targetFile) {
      actions.push({ action: "open_file", param: targetFile });
    }
  }

  if (includesAny(normalized, ["drag", "draw", "আঁকো", "টানো", "ড্র্যাগ"])) {
    const dragMatch = normalized.match(/(\d+)\s*,\s*(\d+)\s+(?:to|থেকে)\s+(\d+)\s*,\s*(\d+)/) || normalized.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (dragMatch) {
      actions.push({ action: "mouse_drag", param: `${dragMatch[1]},${dragMatch[2]},${dragMatch[3]},${dragMatch[4]}` });
    } else {
      actions.push({ action: "mouse_drag", param: "150,150,450,450" });
    }
  }

  if (includesAny(normalized, ["click", "ক্লিক", "চাপো"])) {
    const clickMatch = normalized.match(/(\d+)\s*,\s*(\d+)/);
    if (clickMatch) {
      actions.push({ action: "mouse_click", param: `${clickMatch[1]},${clickMatch[2]}` });
    } else {
      actions.push({ action: "mouse_click", param: "current" });
    }
  }

  if (normalized.includes("screenshot") || normalized.includes("screen shot") || normalized.includes("স্ক্রিনশট")) {
    actions.push({ action: "take_screenshot", param: "" });
  }

  if (normalized.includes("message") || normalized.includes("alert") || normalized.includes("সতর্ক") || normalized.includes("বক্স")) {
    actions.push({ action: "alert_msg", param: "Neora Action completed successfully, boss!" });
  }

  if (!browserActionAdded && actions.length === 0) {
    actions.push({ action: "take_screenshot", param: "" });
  }

  return actions;
}

export function isLikelyOsCommand(prompt: string): boolean {
  const normalized = prompt.toLowerCase();
  
  // Broad list of system operator signals
  const osVerbs = [
    "open", "launch", "run", "start", "execute", "type", "press", "click", "drag", 
    "draw", "save", "screenshot", "sleep", "wait", "write", "edit", "update",
    "খোলো", "খুলুন", "অন করো", "চালু", "রান", "টাইপ", "সেভ", "ক্লিক", "টানো", 
    "ড্র্যাগ", "আঁকো", "লেখো", "লিখুন", "স্ক্রিনশট", "অপেক্ষা", "অ্যাকশন", "ড্রাইভ"
  ];

  const appSignals = [
    "notepad", "calc", "calculator", "paint", "browser", "chrome", "explorer", 
    "cmd", "powershell", "vscode", "photoshop", "illustrator", "winword", 
    "excel", "powerpnt", "msword", "word", "ফটোশপ", "ইলাস্ট্রেটর", "ওয়ার্ড", 
    "এক্সেল", "ক্যালকুলেটর", "নোটপ্যাড"
  ];

  const hasVerb = osVerbs.some(verb => normalized.includes(verb));
  const hasApp = appSignals.some(app => normalized.includes(app));

  return (
    /https?:\/\/[^\s]+/.test(normalized) ||
    (hasVerb && hasApp) ||
    (/(^|\s)(open|launch|run|start|চালু|রান|খুলুন|খোলো|চালু করো|খুলো করো)\s+/.test(normalized)) ||
    (normalized.includes("screenshot") || normalized.includes("স্ক্রিনশট")) ||
    (normalized.includes("save file") || normalized.includes("save as") || normalized.includes("সেভ"))
  );
}

export function classifyNeoraPrompt(prompt: string): NeoraCommandClassification {
  if (!prompt || !prompt.trim()) {
    return "rejected";
  }

  // Check for OS commands first (before falling back to chat)
  if (isLikelyOsCommand(prompt)) {
    return "os-command";
  }

  return "chat";
}

export function normalizeNeoraInput(prompt: string): string {
  return prompt.trim().replace(/\s+/g, " ");
}

export function isRiskyNeoraCommand(prompt: string): boolean {
  const normalized = prompt.toLowerCase();
  return /(\b(delete|remove|format|shutdown|restart|close|kill|erase|stop|wipe)\b|বন্ধ করো|মুছে দাও|রিস্টার্ট|শাটডাউন|বন্ধ করে দাও)/i.test(normalized);
}

export function classifyNeoraInput(prompt: string): NeoraInputRoute {
  const normalized = normalizeNeoraInput(prompt);
  const classification = classifyNeoraPrompt(normalized);
  return {
    classification,
    normalized,
    isRisky: classification === "os-command" && isRiskyNeoraCommand(normalized),
  };
}
