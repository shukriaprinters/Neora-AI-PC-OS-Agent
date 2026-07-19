import type { Task, Reminder, Note, Memory } from "../types";

export const DEFAULT_TASKS: Task[] = [
  {
    id: "1",
    title: "Deliver brochure proof to Shukria Printers",
    notes: "",
    priority: "high",
    dueAt: "2026-06-07",
    completed: false,
  },
  {
    id: "2",
    title: "Submit quarterly tax calculations sheet",
    notes: "",
    priority: "critical",
    dueAt: "2026-06-08",
    completed: true,
  },
  {
    id: "3",
    title: "Stage local updates & run typechecking validation",
    notes: "",
    priority: "medium",
    dueAt: "2026-06-09",
    completed: false,
  },
];

export const DEFAULT_REMINDERS: Reminder[] = [
  {
    id: "1",
    title: "Call client to verify poster colors",
    remindAt: "2026-06-07T11:00",
    repeat: "none",
    completed: false,
  },
  {
    id: "2",
    title: "Auto-backup repository checkpoints",
    remindAt: "2026-06-08T23:59",
    repeat: "daily",
    completed: false,
  },
];

export const DEFAULT_NOTES: Note[] = [
  {
    id: "1",
    title: "Office address memo",
    content: "Contact point: Silicon Tower, Floor 14, Gulshan-2, Dhaka.",
    createdAt: new Date().toLocaleDateString(),
  },
  {
    id: "2",
    title: "Printers pricing framework",
    content:
      "Standard glossy banner setup: $120/piece. Volume discount at 10% for orders > 5 pieces.",
    createdAt: new Date().toLocaleDateString(),
  },
];

export const DEFAULT_MEMORIES: Memory[] = [
  {
    id: "1",
    key: "Default Printer Contact",
    value: "shukriaprinters@gmail.com",
    category: "work",
    importance: 5,
  },
  {
    id: "2",
    key: "Autonomous safety rule",
    category: "preference",
    value:
      "Never write onto /etc/ or system roots system-wide without password prompt",
    importance: 4,
  },
  {
    id: "syntax-home",
    key: "Syntax: home tab",
    category: "preference",
    value: "open [tab] (Navigate), add task [name] (Schedule task), diagnose (Run health check)",
    importance: 3,
  },
  {
    id: "syntax-chat",
    key: "Syntax: chat tab",
    category: "preference",
    value: "/clear (Reset active chat), /analyze (Audit workspace logs), /heal (Auto-patch errors)",
    importance: 3,
  },
  {
    id: "syntax-osAgent",
    key: "Syntax: osAgent tab",
    category: "preference",
    value: "run [app] (Launch dynamic app), write [file] (Write custom script), status (Hardware probe)",
    importance: 3,
  },
  {
    id: "syntax-autonomy",
    key: "Syntax: autonomy tab",
    category: "preference",
    value: "schedule [job] (Setup scheduler), prioritize [task] (Increase item latency weight)",
    importance: 3,
  },
];
