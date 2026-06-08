import fs from "node:fs";
import path from "node:path";

export interface StoredMemory {
  id: string;
  key: string;
  value: string;
  category: "personal" | "work" | "preference" | "skill" | "session";
  importance: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredPlanStep {
  id: string;
  kind: "shell" | "file_write" | "code_edit" | "verify" | "note" | "tool_call";
  title: string;
  payload: string;
  status: "pending" | "running" | "completed" | "failed";
  feedback?: string;
}

export interface StoredPlan {
  id: string;
  goal: string;
  steps: StoredPlanStep[];
  status: "pending" | "running" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface NeoraStorePayload {
  memories: StoredMemory[];
  plans: StoredPlan[];
  conversationSummaries: Array<{ id: string; title: string; summary: string; updatedAt: string }>;
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "neora-store.json");

const defaultStore: NeoraStorePayload = {
  memories: [],
  plans: [],
  conversationSummaries: []
};

function ensureStoreDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readNeoraStore(): NeoraStorePayload {
  try {
    ensureStoreDir();
    if (!fs.existsSync(STORE_FILE)) {
      fs.writeFileSync(STORE_FILE, JSON.stringify(defaultStore, null, 2), "utf8");
      return structuredClone(defaultStore);
    }
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<NeoraStorePayload>;
    return {
      memories: Array.isArray(parsed.memories) ? parsed.memories : [],
      plans: Array.isArray(parsed.plans) ? parsed.plans : [],
      conversationSummaries: Array.isArray(parsed.conversationSummaries) ? parsed.conversationSummaries : []
    };
  } catch {
    return structuredClone(defaultStore);
  }
}

export function writeNeoraStore(store: NeoraStorePayload) {
  ensureStoreDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

export function upsertMemory(memory: Omit<StoredMemory, "createdAt" | "updatedAt">) {
  const store = readNeoraStore();
  const now = new Date().toISOString();
  const index = store.memories.findIndex((item) => item.id === memory.id);
  const next: StoredMemory = {
    ...memory,
    createdAt: index === -1 ? now : store.memories[index].createdAt,
    updatedAt: now
  };
  if (index === -1) {
    store.memories.unshift(next);
  } else {
    store.memories[index] = next;
  }
  writeNeoraStore(store);
  return next;
}

export function appendConversationSummary(title: string, summary: string) {
  const store = readNeoraStore();
  const payload = {
    id: `sum-${Math.random().toString(36).slice(2, 9)}`,
    title,
    summary,
    updatedAt: new Date().toISOString()
  };
  store.conversationSummaries.unshift(payload);
  store.conversationSummaries = store.conversationSummaries.slice(0, 50);
  writeNeoraStore(store);
  return payload;
}

export function upsertPlan(plan: Omit<StoredPlan, "createdAt" | "updatedAt">) {
  const store = readNeoraStore();
  const now = new Date().toISOString();
  const index = store.plans.findIndex((item) => item.id === plan.id);
  const next: StoredPlan = {
    ...plan,
    createdAt: index === -1 ? now : store.plans[index].createdAt,
    updatedAt: now
  };
  if (index === -1) {
    store.plans.unshift(next);
  } else {
    store.plans[index] = next;
  }
  writeNeoraStore(store);
  return next;
}
