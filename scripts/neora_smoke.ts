import assert from "node:assert/strict";
import { classifyNeoraPrompt } from "../src/lib/neoraCommand";

const baseUrl = (process.env.NEORA_BROKER_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const token = (process.env.NEORA_AGENT_TOKEN || "NEORA-X7-AGENT").trim();

async function requestJson(path: string, init?: RequestInit) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-neora-token": token,
      ...(init?.headers || {})
    }
  });
  const text = await response.text();
  let body: any = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  assert.ok(response.ok, `Request to ${path} failed: ${response.status} ${text}`);
  return body;
}

async function main() {
  const status = await requestJson("/api/os/status");
  assert.equal(status.token, token);
  const agentOnline = status.status === "online";
  if (!agentOnline) {
    console.warn(`Agent status is ${status.status}; validating queue path instead of completion.`);
  }

  const commandText = "open browser to https://example.com";
  const submitted = await requestJson("/api/os/command", {
    method: "POST",
    body: JSON.stringify({ prompt: commandText })
  });

  assert.equal(submitted.status, "success");
  assert.ok(submitted.command?.id, "Expected command id");
  const expectedClassification = classifyNeoraPrompt(commandText);

  let found = false;
  let historyClassification: string | undefined;
  let queueClassification: string | undefined;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const nextStatus = await requestJson("/api/os/status");
    const queue = Array.isArray(nextStatus.queue) ? nextStatus.queue : [];
    const history = Array.isArray(nextStatus.history) ? nextStatus.history : [];
    const queueMatch = queue.find((item: any) => item.id === submitted.command.id);
    if (queueMatch) {
      found = true;
      queueClassification = queueMatch.classification;
      if (!agentOnline) {
        break;
      }
    }
    const match = history.find((item: any) => item.id === submitted.command.id);
    if (match) {
      found = true;
      historyClassification = match.classification;
      break;
    }
    if (found) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  assert.ok(found, "Submitted command did not appear in OS history");
  if (agentOnline) {
    assert.equal(historyClassification, expectedClassification);
  } else {
    assert.equal(queueClassification, expectedClassification);
  }
  console.log("Neora smoke test passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
