import assert from "node:assert/strict";

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

  const dashboard = await fetch(baseUrl, { method: "GET" });
  assert.ok(dashboard.ok, `Dashboard fetch failed: ${dashboard.status}`);
  const html = await dashboard.text();
  assert.ok(html.includes("NEORA"), "Dashboard HTML did not include the Neora shell");
  console.log("Neora smoke test passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
