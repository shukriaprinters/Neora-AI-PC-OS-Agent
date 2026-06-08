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
]);

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

export function buildNeoraActions(prompt: string): NeoraCommandAction[] {
  const normalized = prompt.toLowerCase();
  const actions: NeoraCommandAction[] = [];
  let browserActionAdded = false;
  let executableAdded = false;

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

  if (normalized.includes("open ") || normalized.includes("launch ") || normalized.includes("run ")) {
    if (!executableAdded) {
      const fallbackTarget = prompt
        .replace(/^(open|launch|run)\s+/i, "")
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

  if (normalized.includes("notepad") || normalized.includes("নোটপ্যাড") || normalized.includes("write note") || normalized.includes("note")) {
    actions.push({ action: "type_text", param: "Hello, boss! This note was automatically typed by Neora." });
    actions.push({ action: "press_key", param: "enter" });
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
  return (
    /https?:\/\/[^\s]+/.test(normalized) ||
    /(^|\s)(open|launch|run|start)\s+/.test(normalized) ||
    includesAny(normalized, [
      "notepad",
      "calc",
      "calculator",
      "paint",
      "browser",
      "chrome",
      "explorer",
      "cmd",
      "powershell",
      "vscode",
      "screenshot",
      "স্ক্রিনশট",
    ])
  );
}

export function classifyNeoraPrompt(prompt: string): NeoraCommandClassification {
  if (!prompt || !prompt.trim()) {
    return "rejected";
  }

  if (isLikelyOsCommand(prompt)) {
    return "os-command";
  }

  const normalized = prompt.toLowerCase();
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
