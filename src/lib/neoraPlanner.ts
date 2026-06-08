import { buildNeoraActions, classifyNeoraPrompt } from "./neoraCommand";
import type { Plan, PlanStep } from "../types";

function makeStep(kind: PlanStep["kind"], title: string, payload: string): PlanStep {
  return {
    id: `step-${Math.random().toString(36).slice(2, 9)}`,
    kind,
    title,
    payload,
    status: "pending"
  };
}

export function buildNeoraPlan(goal: string): Plan {
  const classification = classifyNeoraPrompt(goal);
  const actions = buildNeoraActions(goal);
  const steps: PlanStep[] = [];

  if (classification === "os-command") {
    for (const action of actions) {
      if (action.action === "open_browser") {
        steps.push(makeStep("tool_call", "Open browser target", action.param));
      } else if (action.action === "execute_cmd") {
        steps.push(makeStep("shell", "Launch allowlisted app", action.param));
      } else if (action.action === "type_text") {
        steps.push(makeStep("tool_call", "Type requested text", action.param));
      } else if (action.action === "press_key") {
        steps.push(makeStep("tool_call", "Press keyboard shortcut", action.param));
      } else if (action.action === "write_file") {
        steps.push(makeStep("file_write", "Write requested file", action.param));
      } else if (action.action === "take_screenshot") {
        steps.push(makeStep("verify", "Capture desktop verification", action.param));
      } else {
        steps.push(makeStep("note", "Review special action", `${action.action}:${action.param}`));
      }
    }
  } else {
    steps.push(makeStep("note", "Respond in chat", goal));
  }

  if (!steps.some((step) => step.kind === "verify")) {
    steps.push(makeStep("verify", "Verify outcome", "Confirm result and summarize"));
  }

  return {
    id: `plan-${Math.random().toString(36).slice(2, 9)}`,
    goal,
    steps,
    status: "pending"
  };
}
