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
  { terms: ["vlc", "ভিএলসি"], command: "vlc" },
  { terms: ["spotify", "স্পটিফাই"], command: "spotify" },
  { terms: ["discord", "ডিসকর্ড"], command: "discord" },
  { terms: ["slack", "স্ল্যাক"], command: "slack" },
  { terms: ["zoom", "জুম"], command: "zoom" },
  { terms: ["obs", "ওবিএস"], command: "obs" },
  { terms: ["task manager", "taskmgr", "টাস্ক ম্যানেজার"], command: "taskmgr" },
  { terms: ["teams", "টিমস"], command: "teams" },
  { terms: ["firefox", "ফায়ারফক্স"], command: "firefox" },
  { terms: ["brave", "ব্রেভ"], command: "brave" },
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
  "vlc",
  "spotify",
  "discord",
  "slack",
  "zoom",
  "obs",
  "taskmgr",
  "teams",
  "firefox",
  "brave",
  "git",
  "docker",
  "npm",
  "python",
  "node",
  "gimp",
  "audacity",
  "premiere",
  "aftereffects",
  "control",
  "regedit",
  "cleanmgr",
  "bash",
  "wsl",
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

  if (normalized.includes("sound up") || normalized.includes("volume up") || includesAny(normalized, ["sound barao", "volume barao", "সাউন্ড বাড়াও", "আওয়াজ বাড়াও"])) {
    actions.push({ action: "press_key", param: "volumeup" });
    actions.push({ action: "press_key", param: "volumeup" });
    actions.push({ action: "press_key", param: "volumeup" });
  } else if (normalized.includes("sound down") || normalized.includes("volume down") || includesAny(normalized, ["sound kamao", "volume kamao", "সাউন্ড কমাও", "আওয়াজ কমাও"])) {
    actions.push({ action: "press_key", param: "volumedown" });
    actions.push({ action: "press_key", param: "volumedown" });
    actions.push({ action: "press_key", param: "volumedown" });
  } else if (includesAny(normalized, ["mute", "unmute", "silent", "মিউট", "সাইলেন্ট"])) {
    actions.push({ action: "press_key", param: "volumemute" });
  }

  if (includesAny(normalized, ["close active window", "close app", "close window", "shut window", "উইন্ডো বন্ধ", "অ্যাপ বন্ধ", "বন্ধ করো"])) {
    actions.push({ action: "press_key", param: "alt+f4" });
  } else if (includesAny(normalized, ["show desktop", "desktop show", "desktop koro", "ডেস্কটপ"])) {
    actions.push({ action: "press_key", param: "win+d" });
  } else if (includesAny(normalized, ["minimize all", "minimize window", "মিনিমাইজ করো", "সব মিনিমাইজ"])) {
    actions.push({ action: "press_key", param: "win+m" });
  }

  if (includesAny(normalized, ["lock pc", "lock computer", "pc lock", "লক করো", "পিসি লক"])) {
    actions.push({ action: "press_key", param: "win+l" });
  }

  if (includesAny(normalized, ["task manager", "open taskmgr", "টাস্ক ম্যানেজার"])) {
    actions.push({ action: "press_key", param: "ctrl+shift+esc" });
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
    (/(^|\s)(open|launch|run|start|চালু|রান|খুলুন|খোলো)\s+/.test(normalized)) ||
    (normalized.includes("screenshot") || normalized.includes("স্ক্রিনশট")) ||
    (normalized.includes("save file") || normalized.includes("save as") || normalized.includes("সেভ"))
  );
}

export function classifyNeoraPrompt(prompt: string): NeoraCommandClassification {
  if (!prompt || !prompt.trim()) {
    return "rejected";
  }

  const normalized = prompt.toLowerCase();

  // Explicitly check for Navigation commands first so they are classified as 'chat' instead of 'os-command'
  if (
    normalized.includes('os agent') ||
    normalized.includes('os-agent') ||
    normalized.includes('ওএস এজেন্ট') ||
    normalized.includes('ওএস-এজেন্ট') ||
    (normalized.includes('os') && normalized.includes('agent')) ||
    (normalized.includes('ওএস') && normalized.includes('এজেন্ট')) ||
    normalized.includes('chat') ||
    normalized.includes('চ্যাট') ||
    normalized.includes('dev studio') ||
    normalized.includes('ডেভ স্টুডিও') ||
    normalized.includes('roadmap') ||
    normalized.includes('রোডম্যাপ') ||
    normalized.includes('vscode') ||
    normalized.includes('ভিএসকোড') ||
    normalized.includes('settings') ||
    normalized.includes('setting') ||
    normalized.includes('seeting') ||
    normalized.includes('seetings') ||
    normalized.includes('সেটিংস') ||
    normalized.includes('সেটিং') ||
    normalized.includes('evolution') ||
    normalized.includes('self-evolution') ||
    normalized.includes('self evolution') ||
    normalized.includes('autopilot') ||
    normalized.includes('উন্নয়ন') ||
    normalized.includes('অপ্টিমাইজ') ||
    normalized.includes('অটোপাইলট') ||
    normalized.includes('pc control') ||
    normalized.includes('pc-control') ||
    normalized.includes('pc controller') ||
    normalized.includes('পিসি কন্ট্রোল') ||
    normalized.includes('automation') ||
    normalized.includes('অটোমেশন') ||
    normalized.includes('অটমেশন') ||
    normalized.includes('memory') ||
    normalized.includes('মেমরি') ||
    normalized.includes('মেমোরি') ||
    normalized.includes('memories graph') ||
    normalized.includes('মেমোরিজ গ্রাফ') ||
    normalized.includes('invoice') ||
    normalized.includes('ইনভয়েস') ||
    normalized.includes('earning') ||
    normalized.includes('আর্নিং') ||
    normalized.includes('neora pc') ||
    normalized.includes('নিওরা পিসি') ||
    normalized.includes('webos') ||
    normalized.includes('ওয়েব ওএস') ||
    normalized.includes('filter lab') ||
    normalized.includes('ফিল্টার ল্যাব') ||
    normalized.includes('builder') ||
    normalized.includes('বিল্ডার') ||
    normalized.includes('neora tv') ||
    normalized.includes('নিওরা টিভি')
  ) {
    const hasRemoteApp = [
      "notepad", "calc", "calculator", "paint", "mspaint", "chrome", "photoshop", "illustrator", "winword", "excel", "powerpnt"
    ].some(app => normalized.includes(app));
    if (!hasRemoteApp) {
      return "chat";
    }
  }

  if (isLikelyOsCommand(prompt)) {
    return "os-command";
  }

  if (
    normalized.includes("task") ||
    normalized.includes("remind") ||
    normalized.includes("note") ||
    /[\u0980-\u09FF]/.test(prompt)
  ) {
    return "chat";
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
