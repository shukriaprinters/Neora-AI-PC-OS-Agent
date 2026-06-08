import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { appendConversationSummary, readNeoraStore, upsertMemory, upsertPlan } from "./neoraStore";
import { buildNeoraPlan } from "./neoraPlanner";

const storeFile = path.resolve(process.cwd(), "data", "neora-store.json");
if (fs.existsSync(storeFile)) {
  fs.unlinkSync(storeFile);
}

const memory = upsertMemory({
  id: "mem-test",
  key: "preferred_browser",
  value: "chrome",
  category: "preference",
  importance: 5
});
assert.equal(memory.key, "preferred_browser");

const summary = appendConversationSummary("Test session", "Neora can now persist context.");
assert.ok(summary.id);

const plan = buildNeoraPlan("open notepad and write a memo");
const storedPlan = upsertPlan(plan);
assert.equal(storedPlan.goal, "open notepad and write a memo");
assert.ok(storedPlan.steps.length > 0);

const store = readNeoraStore();
assert.ok(store.memories.length >= 1);
assert.ok(store.plans.length >= 1);

assert.ok(Array.isArray(store.conversationSummaries));

console.log("neoraStore tests passed");
